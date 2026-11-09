/**
 * Server-side data sources (zerozero.pt + transfermarkt.pt).
 * Do not import from client components: uses cheerio + outbound fetch.
 */
import type { ExternalFixture, ExternalMatch, ExternalProfile, SearchResult, SourceId } from "./types";
import {
  fetchZerozeroMatches,
  fetchZerozeroProfile,
  fetchZerozeroUpcoming,
  searchZerozero,
} from "./zerozero";
import {
  fetchTransfermarktMatches,
  fetchTransfermarktProfile,
  fetchTransfermarktUpcoming,
  searchTransfermarkt,
} from "./transfermarkt";

export type { ExternalFixture, ExternalMatch, ExternalProfile, SearchResult, SourceId, Participation } from "./types";
export { fetchImage, clearSourceCache, SourceFetchError } from "./http";
export { fetchTransfermarktClubColors } from "./transfermarkt";
export { fetchZerozeroClubInfo, fetchZerozeroLive, fetchZerozeroVenue, zzGameId } from "./zerozero";
export { fetchCity, fetchCityPhotos, fetchStadiumPhotoCandidates } from "./wikipedia";

export function detectSource(url: string): SourceId | null {
  let host: string;
  try {
    host = new URL(url.trim()).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "zerozero.pt" || host.endsWith(".zerozero.pt")) return "zerozero";
  if (/(^|\.)transfermarkt\.[a-z.]+$/.test(host)) return "transfermarkt";
  return null;
}

function requireSource(url: string): SourceId {
  const s = detectSource(url);
  if (!s) throw new Error(`Unsupported URL (expected zerozero.pt or transfermarkt): ${url}`);
  return s;
}

/** Transfermarkt URLs from other domains (.com, .de...) are normalised to transfermarkt.pt. */
function normaliseTm(url: string): string {
  const u = new URL(url.trim());
  u.hostname = "www.transfermarkt.pt";
  return u.toString();
}

export async function searchPlayers(name: string): Promise<SearchResult[]> {
  const q = name.trim();
  if (!q) return [];
  const [zz, tm] = await Promise.allSettled([searchZerozero(q), searchTransfermarkt(q)]);
  const zzList = zz.status === "fulfilled" ? zz.value : [];
  const tmList = tm.status === "fulfilled" ? tm.value : [];
  if (zz.status === "rejected" && tm.status === "rejected") {
    throw new Error(`Search failed on both sources: zerozero: ${zz.reason?.message}; transfermarkt: ${tm.reason?.message}`);
  }
  // Interleave so both sources are visible at the top of the list.
  const out: SearchResult[] = [];
  for (let i = 0; i < Math.max(zzList.length, tmList.length); i++) {
    if (zzList[i]) out.push(zzList[i]);
    if (tmList[i]) out.push(tmList[i]);
  }
  return out;
}

export async function fetchProfile(url: string): Promise<ExternalProfile> {
  if (requireSource(url) === "zerozero") return fetchZerozeroProfile(url);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { clubId, ...profile } = await fetchTransfermarktProfile(normaliseTm(url));
  return profile;
}

/** Current season, all official competitions, newest first. */
export async function fetchMatches(url: string): Promise<ExternalMatch[]> {
  if (requireSource(url) === "zerozero") return fetchZerozeroMatches(url);
  return fetchTransfermarktMatches(normaliseTm(url));
}

/** Upcoming fixtures of the player's current club, soonest first. */
export async function fetchUpcoming(url: string): Promise<ExternalFixture[]> {
  if (requireSource(url) === "zerozero") return fetchZerozeroUpcoming(url);
  return fetchTransfermarktUpcoming(normaliseTm(url));
}
