import { storeRemoteImage } from "./crest";
import { fetchImage, fetchJson, fetchText } from "./sources/http";
import { fileUrl } from "./storage";
import type { PressArticle } from "./types";

/**
 * Press post ("Na imprensa"): reads a news article's page — headline, standfirst, outlet, date and lead
 * image (stored locally) — from its Open Graph / Twitter / JSON-LD tags. Headlines are kept exactly as
 * published (only the site's own suffix is cut): the looks print them as quotes.
 */

/** Outlets whose pages don't name themselves well (or not at all): host → name as the outlet writes it. */
const OUTLETS: Record<string, string> = {
  "abola.pt": "A Bola",
  "cnnportugal.iol.pt": "CNN Portugal",
  "maisfutebol.iol.pt": "Maisfutebol",
  "ojogo.pt": "O Jogo",
  "record.pt": "Record",
  "altominho.com.pt": "Alto Minho",
  "radiogeice.com": "Rádio Geice",
  "nmmatosinhos.com": "NM Matosinhos",
  "zerozero.pt": "zerozero",
  "publico.pt": "Público",
  "jn.pt": "Jornal de Notícias",
  "dn.pt": "Diário de Notícias",
  "expresso.pt": "Expresso",
  "observador.pt": "Observador",
  "sapo.pt": "SAPO",
  "desporto.sapo.pt": "SAPO Desporto",
  "rtp.pt": "RTP",
  "sicnoticias.pt": "SIC Notícias",
  "tsf.pt": "TSF",
  "noticiasaominuto.com": "Notícias ao Minuto",
  "maisfutebol.pt": "Maisfutebol",
  "timesofmalta.com": "Times of Malta",
  "maltatoday.com.mt": "MaltaToday",
  "independent.com.mt": "The Malta Independent",
};

/** Long-form site names shortened to how the outlet is known ("Semanário Alto Minho" → "Alto Minho"). */
const SITE_ALIASES: Record<string, string> = {
  "semanário alto minho": "Alto Minho",
  "jornal record": "Record",
  "abola.pt": "A Bola",
  abola: "A Bola",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", laquo: "«", raquo: "»", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" };

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/** All <meta> tags of the page as { property-or-name (lower case) → content } (first one wins). */
function metaTags(html: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attr = (n: string) => tag.match(new RegExp(`\\b${n}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    const key = attr("property") ?? attr("name") ?? attr("itemprop");
    const content = attr("content");
    if (!key || !content) continue;
    const k = (key[1] ?? key[2]).toLowerCase();
    if (!out.has(k)) out.set(k, decodeEntities(content[1] ?? content[2] ?? ""));
  }
  return out;
}

/** The first JSON-LD NewsArticle-ish object's headline / datePublished / image. */
function jsonLd(html: string): { headline?: string; date?: string; image?: string } {
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const root = JSON.parse(m[1]);
      const nodes: Record<string, unknown>[] = [];
      const walk = (n: unknown) => {
        if (Array.isArray(n)) n.forEach(walk);
        else if (n && typeof n === "object") {
          nodes.push(n as Record<string, unknown>);
          walk((n as Record<string, unknown>)["@graph"]);
        }
      };
      walk(root);
      const art = nodes.find((n) => /Article|BlogPosting|Report/i.test(String(n["@type"] ?? "")));
      if (!art) continue;
      const img = art.image as unknown;
      const image = typeof img === "string" ? img : Array.isArray(img) ? (typeof img[0] === "string" ? img[0] : (img[0] as { url?: string })?.url) : (img as { url?: string } | undefined)?.url;
      return { headline: typeof art.headline === "string" ? decodeEntities(art.headline) : undefined, date: typeof art.datePublished === "string" ? art.datePublished : undefined, image };
    } catch {
      /* malformed JSON-LD: next */
    }
  }
  return {};
}

const bareHost = (u: string) => new URL(u).hostname.toLowerCase().replace(/^www\./, "");

/** The outlet's name for a host: the known list, else the domain's first label, capitalised ("ojogo.pt" → "Ojogo"). */
export function outletFromHost(url: string): string {
  const host = bareHost(url);
  if (OUTLETS[host]) return OUTLETS[host];
  const parent = Object.keys(OUTLETS).find((h) => host.endsWith(`.${h}`));
  if (parent) return OUTLETS[parent];
  const label = host.split(".").filter((p) => !["com", "pt", "org", "net", "co", "uk", "mt", "iol", "sapo"].includes(p))[0] ?? host;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Cuts the site's own name off a title: "Headline - A Bola", "Headline | CNN Portugal", "Headline – Semanário Alto Minho". */
export function stripSiteSuffix(title: string, names: string[]): string {
  let t = title.trim();
  const wanted = names.filter(Boolean).map(fold);
  for (let i = 0; i < 2; i++) {
    const m = t.match(/^(.*\S)\s+[-–—|·]\s+([^-–—|·]{2,40})$/);
    if (!m) break;
    const tail = fold(m[2]);
    if (wanted.some((n) => n && (tail === n || tail.includes(n) || n.includes(tail)))) t = m[1].trim();
    else break;
  }
  // A generic page title ("Post | NM Matosinhos") is no headline.
  return /^(post|home|notícia|noticia|artigo)$/i.test(t) ? "" : t;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "2026-10-17T17:07:00Z" → "17 OCT" (the date in Portugal). */
export function pressDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", day: "numeric", month: "numeric" }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value ?? String(d.getUTCDate());
  const month = Number(parts.find((p) => p.type === "month")?.value ?? d.getUTCMonth() + 1);
  return `${Number(day)} ${MONTHS[month - 1]}`;
}

/** WordPress sites without a date tag: the REST API knows the post's date by its slug. */
async function wordpressDate(url: string): Promise<string | undefined> {
  const u = new URL(url);
  const slug = u.pathname.split("/").filter(Boolean).pop();
  if (!slug) return undefined;
  try {
    const posts = await fetchJson<{ date?: string }[]>(`${u.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=date`);
    return posts[0]?.date;
  } catch {
    return undefined;
  }
}

/** Reads an article's page and returns it ready for a press post (lead image downloaded into data/files/press). */
export async function fetchArticle(rawUrl: string): Promise<PressArticle> {
  const url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("Link inválido");
  const { text: html, finalUrl } = await fetchText(url);
  const meta = metaTags(html);
  const ld = jsonLd(html);
  const titleTag = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");

  const siteRaw = meta.get("og:site_name") ?? "";
  const hostName = outletFromHost(finalUrl);
  const source = (siteRaw && (SITE_ALIASES[siteRaw.toLowerCase()] ?? (siteRaw.length <= 28 ? siteRaw : ""))) || hostName;
  const names = [siteRaw, source, hostName, meta.get("apple-mobile-web-app-title") ?? ""];

  const candidates = [meta.get("og:title"), meta.get("twitter:title"), ld.headline, titleTag].map((t) => stripSiteSuffix(t ?? "", names)).filter(Boolean);
  const title = candidates[0] ?? "";
  if (!title) throw new Error("Não encontrei o título da notícia");

  const subtitle = (meta.get("og:description") ?? meta.get("description") ?? meta.get("twitter:description") ?? "").replace(/\s*\[?…\]?\s*$/, "…").replace(/\s*Continue a ler\.?$/i, "");
  let published = meta.get("article:published_time") ?? meta.get("publish-date") ?? meta.get("date") ?? meta.get("pubdate") ?? ld.date;
  if (!published && /\/\d{4}\/\d{2}\//.test(new URL(finalUrl).pathname)) published = await wordpressDate(finalUrl);

  let image: string | null = null;
  const imgUrl = meta.get("og:image") ?? meta.get("og:image:secure_url") ?? meta.get("twitter:image") ?? ld.image;
  if (imgUrl) {
    try {
      const buf = await fetchImage(new URL(imgUrl, finalUrl).toString());
      image = fileUrl(await storeRemoteImage(buf, "press", "jpeg"));
    } catch {
      image = null;
    }
  }
  return { source, title, subtitle: subtitle || undefined, date: pressDate(published) || undefined, url: finalUrl, image };
}
