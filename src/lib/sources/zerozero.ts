import * as cheerio from "cheerio";
import { fetchText } from "./http";
import type { ExternalFixture, ExternalMatch, ExternalProfile, SearchResult } from "./types";

const BASE = "https://www.zerozero.pt";
const CDN = "https://cdn-img.staticzz.com";

// ---------- helpers ----------

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

function abs(href: string | undefined | null): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href.trim(), BASE).toString();
  } catch {
    return undefined;
  }
}

/** Turn any zerozero image reference (thumb/icon/relative) into the full-size CDN URL. */
export function zzFullImage(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  const s = src.trim();
  const m = /\/(logos|jogadores|planteis)\/.+$/.exec(s);
  if (m) return `${CDN}/img${m[0]}`;
  return abs(s);
}

function teamIdFromHref(href: string | undefined): string | undefined {
  return /\/equipa\/[^/]+\/(\d+)/.exec(href ?? "")?.[1];
}

export function parseZerozeroPlayerUrl(url: string): { id: string; slug: string; base: string } {
  const u = new URL(url, BASE);
  let m = /\/jogador\/([^/]+)\/(\d+)/.exec(u.pathname);
  if (m) return { slug: m[1], id: m[2], base: `${BASE}/jogador/${m[1]}/${m[2]}` };
  m = /\/player\.php/.exec(u.pathname);
  const id = m ? u.searchParams.get("id") : null;
  if (id && /^\d+$/.test(id)) return { slug: "-", id, base: `${BASE}/jogador/-/${id}` };
  throw new Error(`Not a zerozero player URL: ${url} (expected https://www.zerozero.pt/jogador/<slug>/<id>)`);
}

function teamBaseFromHref(href: string): string {
  const m = /\/equipa\/([^/?#]+)\/(\d+)/.exec(href);
  if (!m) throw new Error(`Not a zerozero team URL: ${href}`);
  return `${BASE}/equipa/${m[1]}/${m[2]}`;
}

const seasonSuffix = /\s+\d{2,4}\/\d{2,4}\s*$/;

/** Parse "1-2" style score -> [home, away]. */
function parseScore(s: string): [number, number] | null {
  const m = /(\d+)\s*-\s*(\d+)/.exec(s);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Icon cell (goals / assists): "-" = 0, icon = 1, icon + "x2" = 2. */
function iconCount($: cheerio.CheerioAPI, td: ReturnType<cheerio.CheerioAPI>): number {
  const text = clean(td.text());
  if (text === "-" ) return 0;
  const mult = /x\s*(\d+)/i.exec(text);
  if (mult) return Number(mult[1]);
  return td.find("span").length > 0 ? 1 : 0;
}

// ---------- search ----------

export async function searchZerozero(name: string): Promise<SearchResult[]> {
  const url = `${BASE}/pesquisa?search_txt=${encodeURIComponent(name)}`;
  const { text, finalUrl } = await fetchText(url);
  // A unique hit may redirect straight to the player page.
  if (/\/jogador\/[^/]+\/\d+/.test(new URL(finalUrl).pathname)) {
    const p = await fetchZerozeroProfile(finalUrl.split("?")[0]);
    return [{ source: "zerozero", name: p.knownAs ?? name, club: p.clubName, url: p.url, photoUrl: p.photoUrl, fullName: p.fullName, birthDate: p.birthDate, position: p.position }];
  }
  const $ = cheerio.load(text);
  const out: SearchResult[] = [];
  $(".zz-search-item").each((_, el) => {
    const item = $(el);
    if (item.attr("data-type") !== "4") return; // 4 = player
    const a = item.find("a.title").first();
    const href = a.attr("href");
    if (!href || !/\/jogador\//.test(href)) return;
    const nameText = clean(a.contents().filter((_, n) => n.type === "text").text()) || clean(a.text());
    const locals = item.find(".details .local");
    const birth = /(\d{4}-\d{2}-\d{2})/.exec(locals.first().text())?.[1];
    const club = clean(locals.last().find("a[href*='/equipa/']").text()) || undefined;
    const ageText = clean(item.find(".stamps .stamp[title='Idade']").text());
    out.push({
      source: "zerozero",
      name: nameText,
      club,
      url: abs(href.split("?")[0])!,
      photoUrl: zzFullImage(item.find(".img img").attr("src")),
      fullName: clean(item.find(".subtitle").text()) || undefined,
      birthDate: birth,
      position: item.find(".stamps .stamp.position").attr("title") || undefined,
      age: ageText ? Number(ageText) : undefined,
    });
  });
  return out;
}

// ---------- profile ----------

export async function fetchZerozeroProfile(url: string): Promise<ExternalProfile> {
  const { id, base } = parseZerozeroPlayerUrl(url);
  const { text } = await fetchText(base);
  const $ = cheerio.load(text);
  if (!$(".zz-entity-header").length) throw new Error(`zerozero: unexpected page layout for ${base} (player header not found)`);

  const rows = new Map<string, ReturnType<typeof $>>();
  $(".card-data__row").each((_, el) => {
    const label = clean($(el).find(".card-data__label").first().text());
    if (label && !rows.has(label)) rows.set(label, $(el));
  });
  const val = (label: string) => {
    const r = rows.get(label);
    if (!r) return undefined;
    const vals = r.find(".card-data__value").map((_, v) => clean($(v).text())).get().filter(Boolean);
    return vals.length ? vals : undefined;
  };

  const nameEl = $(".zz-enthdr-data h1 .name").first();
  const shirt = clean(nameEl.find(".number").text()).replace(/\.$/, "");
  const knownAs = clean(nameEl.clone().children(".number").remove().end().text());

  const birthDate = /(\d{4}-\d{2}-\d{2})/.exec(val("Data de Nascimento")?.[0] ?? "")?.[1];
  const height = /(\d{3})\s*cm/.exec(val("Altura / Peso")?.[0] ?? "")?.[1];
  const positions = val("Posição");

  const clubA = $("a.zz-enthdr-club").first();
  const clubHref = clubA.attr("href");
  const photo =
    $(".zz-enthdr-media .profile_picture img").attr("src") || $('meta[property="og:image"]').attr("content");

  const mv = clean($('.rectangle[title="Valor de Mercado"] .value').text());
  const agentVals = val("Empresário") ?? val("Agente");
  const contract = val("Contrato") ?? val("Fim de Contrato");

  const photoUrl = zzFullImage(photo);
  return {
    source: "zerozero",
    url: base,
    externalId: id,
    fullName: val("Nome")?.[0],
    knownAs: knownAs || undefined,
    birthDate,
    nationality: val("Nacionalidade")?.join(" / "),
    position: positions?.[0],
    foot: val("Pé preferencial")?.[0],
    heightCm: height ? Number(height) : undefined,
    shirtNumber: shirt || undefined,
    clubName: clean(clubA.find("span").text()) || val("Clube atual")?.[0],
    clubUrl: clubHref ? teamBaseFromHref(clubHref) : undefined,
    clubCrestUrl: zzFullImage(clubA.find("img").attr("src")),
    photoUrl: photoUrl && !/default|nophoto|sem_foto/i.test(photoUrl) ? photoUrl : undefined,
    marketValue: mv ? mv.replace(/\s*€/, " €") : undefined,
    contractUntil: contract?.[0],
    agent: agentVals?.join(" / "),
  };
}

// ---------- team games (fixtures + crest map) ----------

type TeamGame = {
  id: string;
  date: string;
  time?: string;
  home: boolean;
  opponent: string;
  opponentId?: string;
  opponentCrestUrl?: string;
  competition: string;
  matchday?: string;
  played: boolean;
  matchUrl?: string;
};

async function fetchTeamGames(teamUrl: string): Promise<{ teamName: string; teamCrestUrl?: string; games: TeamGame[] }> {
  const base = teamBaseFromHref(teamUrl);
  const { text } = await fetchText(`${base}/jogos`);
  const $ = cheerio.load(text);
  const teamName =
    clean($(".zz-enthdr-data h1 .name").first().text()) || clean($("h1").first().text());
  const teamCrestUrl = zzFullImage(
    $(".zz-enthdr-media img").first().attr("src") ?? $('meta[property="og:image"]').attr("content"),
  );
  const games: TeamGame[] = [];
  $("tr.parent").each((_, el) => {
    const tds = $(el).children("td");
    if (tds.length < 9) return;
    const date = clean(tds.eq(1).text());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const venue = clean(tds.eq(3).text());
    if (venue !== "(C)" && venue !== "(F)") return;
    const resultA = tds.eq(6).find("a").first();
    const resultText = clean(tds.eq(6).text());
    const oppA = tds.eq(5).find("a").first();
    const time = clean(tds.eq(2).text());
    games.push({
      id: $(el).attr("id") ?? /\/(\d+)(?:\/|$)/.exec(resultA.attr("href") ?? "")?.[1] ?? "",
      date,
      time: /^\d{1,2}:\d{2}$/.test(time) ? time : undefined,
      home: venue === "(C)",
      opponent: clean(oppA.text()),
      opponentId: teamIdFromHref(oppA.attr("href")),
      opponentCrestUrl: zzFullImage(tds.eq(4).find("img").attr("src")),
      competition: clean(tds.eq(7).text()).replace(seasonSuffix, ""),
      matchday: clean(tds.eq(8).text()) || undefined,
      played: parseScore(resultText) !== null,
      matchUrl: abs(resultA.attr("href")),
    });
  });
  return { teamName, teamCrestUrl, games };
}

export async function fetchZerozeroUpcoming(url: string, clubOverride?: { url: string; name: string }): Promise<ExternalFixture[]> {
  // A club set by hand (zerozero still lists the player elsewhere): that club's games, not the profile's.
  const profile = clubOverride ? { clubUrl: clubOverride.url, clubName: clubOverride.name, clubCrestUrl: undefined, url } : await fetchZerozeroProfile(url);
  if (!profile.clubUrl) throw new Error(`zerozero: player ${profile.url} has no current club`);
  const { teamName, games } = await fetchTeamGames(profile.clubUrl);
  const today = new Date().toISOString().slice(0, 10);
  return games
    .filter((g) => !g.played && g.date >= today)
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
    .map((g) => ({
      source: "zerozero" as const,
      externalId: g.id,
      date: g.date,
      time: g.time,
      competition: g.competition,
      matchday: g.matchday,
      team: profile.clubName ?? teamName,
      opponent: g.opponent,
      home: g.home,
      matchUrl: g.matchUrl,
      opponentCrestUrl: g.opponentCrestUrl,
      teamCrestUrl: profile.clubCrestUrl,
    }));
}

// ---------- matches ----------

export async function fetchZerozeroMatches(url: string): Promise<ExternalMatch[]> {
  const { base } = parseZerozeroPlayerUrl(url);
  const { text } = await fetchText(`${base}/jogos`);
  const $ = cheerio.load(text);

  // edition id -> full competition name (from the competition filter)
  const editions = new Map<string, string>();
  $('select[name="edicao_id"] option').each((_, o) => {
    const v = $(o).attr("value");
    if (v && v !== "0") editions.set(v, clean($(o).text()).replace(seasonSuffix, ""));
  });

  type Row = ExternalMatch & { teamId?: string; opponentId?: string };
  const rows: Row[] = [];
  $("tr").each((_, el) => {
    const tds = $(el).children("td");
    if (tds.length < 15) return;
    const rawDate = clean(tds.eq(1).text());
    const dm = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(rawDate);
    if (!dm) return;
    const venue = clean(tds.eq(5).text());
    const home = venue === "(C)";
    const resA = tds.eq(7).find("a").first();
    const score = parseScore(clean(tds.eq(7).text()));
    // zerozero prints the score as HOME-AWAY regardless of the player's side.
    const [hg, ag] = score ?? [0, 0];
    const goalsFor = home ? hg : ag;
    const goalsAgainst = home ? ag : hg;
    const sign = clean(tds.eq(0).text());
    const result = sign === "V" ? "W" : sign === "E" ? "D" : sign === "D" ? "L" : undefined;
    if (result && score) {
      const computed = goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D";
      // draws decided on penalties show as D/V/D with level score; only warn on real contradictions
      if (computed !== result && computed !== "D") {
        console.warn(`[zerozero] result orientation mismatch on ${rawDate}: sign=${sign} score=${hg}-${ag} home=${home}`);
      }
    }
    const compA = tds.eq(2).find(".text a, a[href*='edicao'], a[href*='edition']").first();
    const edId = /id_edicao=(\d+)/.exec(compA.attr("href") ?? "")?.[1] ?? /\/(\d+)$/.exec(compA.attr("href") ?? "")?.[1];
    const compShort = clean(compA.text());
    const minutesTxt = clean(tds.eq(8).text());
    const minutes = /^\d+$/.test(minutesTxt) ? Number(minutesTxt) : 0;
    const subTd = tds.eq(9);
    const subIn = subTd.find(".icn_zerozero.green").length > 0;
    const subOut = subTd.find(".icn_zerozero.red").length > 0;
    const subMinutes = [...clean(subTd.text()).matchAll(/(\d+)'/g)].map((m) => Number(m[1]));
    const yellow = tds.eq(10).find(".icn_zerozero.yellow").length;
    const red = tds.eq(11).find(".icn_zerozero.red").length;
    const ratingTxt = clean(tds.eq(14).text()).replace(",", ".");
    const teamA = tds.eq(4).find("a").first();
    const oppA = tds.eq(6).find("a").first();
    const photosHref = tds.last().find("a[href*='/fotografias']").attr("href");
    const matchId = /id=(\d+)/.exec(resA.attr("href") ?? "")?.[1] ?? "";
    let subbedIn: number | undefined;
    let subbedOut: number | undefined;
    if (subIn) subbedIn = subMinutes.shift();
    if (subOut) subbedOut = subMinutes.shift();
    rows.push({
      source: "zerozero",
      externalId: matchId,
      date: `${dm[1]}-${dm[2]}-${dm[3]}`,
      competition: (edId && editions.get(edId)) || compShort,
      competitionShort: compShort || undefined,
      matchday: clean(tds.eq(3).text()),
      team: clean(teamA.text()),
      opponent: clean(oppA.text()),
      home,
      goalsFor,
      goalsAgainst,
      result,
      minutes,
      goals: iconCount($, tds.eq(12)),
      assists: iconCount($, tds.eq(13)),
      yellow,
      red,
      started: minutes > 0 ? !subIn : false,
      participation: minutes > 0 ? "played" : "unused_sub",
      subbedIn,
      subbedOut,
      rating: /^\d+(\.\d+)?$/.test(ratingTxt) ? Number(ratingTxt) : undefined,
      matchUrl: matchId ? `${BASE}/jogo.php?id=${matchId}` : abs(resA.attr("href")),
      photosUrl: abs(photosHref?.trim()),
      teamId: teamIdFromHref(teamA.attr("href")),
      opponentId: teamIdFromHref(oppA.attr("href")),
    });
  });

  if (!rows.length) {
    if (!$("#team_games").length) throw new Error(`zerozero: could not find the games table on ${base}/jogos`);
    return [];
  }

  // Enrich with opponent crests + kick-off time from the team's season games page(s).
  const teamHrefs = new Map<string, string>();
  $("tr").each((_, el) => {
    const a = $(el).children("td").eq(4).find("a[href*='/equipa/']").first();
    const id = teamIdFromHref(a.attr("href"));
    if (id && !teamHrefs.has(id)) teamHrefs.set(id, a.attr("href")!);
  });
  const byGameId = new Map<string, TeamGame>();
  const crestByTeam = new Map<string, string>();
  const teamCrest = new Map<string, string>();
  for (const [teamId, href] of [...teamHrefs].slice(0, 3)) {
    try {
      const tg = await fetchTeamGames(href);
      if (tg.teamCrestUrl) teamCrest.set(teamId, tg.teamCrestUrl);
      for (const g of tg.games) {
        byGameId.set(g.id, g);
        if (g.opponentId && g.opponentCrestUrl) crestByTeam.set(g.opponentId, g.opponentCrestUrl);
      }
    } catch (e) {
      console.warn(`[zerozero] could not load team games for crests (${href}): ${(e as Error).message}`);
    }
  }

  return rows
    .map(({ teamId, opponentId, ...m }) => {
      const g = byGameId.get(m.externalId);
      return {
        ...m,
        time: g?.time,
        opponentCrestUrl: g?.opponentCrestUrl ?? (opponentId ? crestByTeam.get(opponentId) : undefined),
        teamCrestUrl: teamId ? teamCrest.get(teamId) : undefined,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type ClubInfo = { city?: string; founded?: string; stadium?: string; country?: string };

/** City, founding date and stadium from a zerozero team page. */
export async function fetchZerozeroClubInfo(teamUrl: string): Promise<ClubInfo> {
  const { text } = await fetchText(teamUrl);
  const flat = cheerio
    .load(text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/</g, " <"))("body")
    .text()
    .replace(/\s+/g, " ");
  const after = (label: string, stop: string[]) => {
    const i = flat.indexOf(`${label} `);
    if (i < 0) return undefined;
    let rest = flat.slice(i + label.length + 1, i + label.length + 120);
    for (const s of stop) {
      const j = rest.indexOf(` ${s}`);
      if (j >= 0) rest = rest.slice(0, j);
    }
    return rest.trim() || undefined;
  };
  const founded = after("Fundação", ["Cidade"])?.match(/\d{4}/)?.[0];
  return {
    founded,
    city: after("Cidade", ["País", "Associação"]),
    country: after("País", ["Associação", "Patrocínio"]),
    stadium: after("Estádio Estádio", ["Lotação"]) ? `Estádio ${after("Estádio Estádio", ["Lotação"])}` : after("Estádio", ["Lotação"]),
  };
}

export type LiveState = {
  /** Score as shown in the header, home first. */
  homeGoals: number;
  awayGoals: number;
  /** Minutes of the player's goals / assists so far ("23'", "90+5'"). */
  goals: string[];
  assists: string[];
};

/** Current score and the player's goals from a zerozero match page (updated live during games). */
export async function fetchZerozeroLive(matchUrl: string, playerId: string): Promise<LiveState | null> {
  const { text } = await fetchText(matchUrl);
  const $ = cheerio.load(text);
  const score = $(".match-header-vs").first().text().trim().match(/(\d+)\s*-\s*(\d+)/);
  if (!score) return null;
  const goals: string[] = [];
  $(".match-header-scorers a").each((_, a) => {
    if (($(a).attr("href") ?? "").includes(`/${playerId}`)) {
      const t = $(a).next(".time").text().trim();
      goals.push(...(t ? t.split(/,\s*/) : ["?"]));
    }
  });
  const assists: string[] = [];
  $(`.player a[href*="/${playerId}"]`)
    .closest(".player")
    .find(".events [title='Assistência']")
    .each((_, el) => {
      const t = $(el).next("div").text().trim();
      assists.push(...(t ? t.split(/\s+/) : ["?"]));
    });
  return { homeGoals: Number(score[1]), awayGoals: Number(score[2]), goals, assists };
}

/** zerozero's game id from any of its match URL shapes ("jogo.php?id=123", "/jogo/2026-…/123"). */
export function zzGameId(matchUrl: string | null | undefined): string | null {
  if (!matchUrl?.includes("zerozero")) return null;
  return matchUrl.match(/[?&]id=(\d+)/)?.[1] ?? matchUrl.match(/\/jogo\/[^/?#]+\/(\d+)/)?.[1] ?? null;
}

/** The ground a game is (or was) played at: it isn't always the home club's own stadium. */
export async function fetchZerozeroVenue(matchUrl: string): Promise<{ id: string; name: string } | null> {
  const { text } = await fetchText(matchUrl);
  const $ = cheerio.load(text);
  const a = $("#stadium .name a[href*='estadio.php?id=']").first();
  const id = a.attr("href")?.match(/id=(\d+)/)?.[1];
  const name = clean(a.text());
  return id && name ? { id, name } : null;
}

export type CareerClub = { name: string; teamUrl: string; crestUrl?: string };

/**
 * The clubs he played for, newest first, from the "Histórico" table of his zerozero page: one entry per
 * club (youth / B teams and repeated seasons fold into the club's name; a loan counts as its own club).
 * The crest is the first team logo on that club's page.
 */
export async function fetchZerozeroCareer(url: string, max = 3): Promise<CareerClub[]> {
  const { base } = parseZerozeroPlayerUrl(url);
  const { text } = await fetchText(base);
  const $ = cheerio.load(text);
  const out: CareerClub[] = [];
  $("table.career tbody tr").each((_, tr) => {
    const a = $(tr).find(".micrologo_and_text .text a").first();
    const name = clean(a.text());
    const teamUrl = abs(a.attr("href")?.replace(/\?.*$/, ""));
    if (!name || !teamUrl) return;
    if (out.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    out.push({ name, teamUrl });
  });
  const picked = out.slice(0, max);
  for (const c of picked) {
    try {
      const { text: team } = await fetchText(c.teamUrl);
      const logo = /logos\/equipas\/[^"'\s)]+\.(?:png|jpg|webp)/i.exec(team)?.[0];
      c.crestUrl = logo ? zzFullImage(`/img/${logo}`) : undefined;
    } catch {
      /* no crest: the name still counts */
    }
  }
  return picked;
}
