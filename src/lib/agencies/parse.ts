import * as cheerio from "cheerio";

/**
 * Readers for Transfermarkt's agency pages: the directory of agencies (filtered by country) and one
 * agency's page (its Instagram / website and the players it represents). Pure functions over HTML,
 * tested against saved pages (__fixtures__).
 */

export const TM = "https://www.transfermarkt.pt";

export type DirAgency = { name: string; tmUrl: string; tmId: string; country: string; players: number };

export type RosterPlayer = { name: string; tmUrl: string; position: string; age: string; club: string; clubTmUrl: string };

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const abs = (href: string) => (href.startsWith("http") ? href : TM + href);

/** Highest page number linked by the pager (1 when there is none). */
function lastPage($: cheerio.CheerioAPI, pattern: RegExp): number {
  let n = 1;
  $("a[href]").each((_, a) => {
    const m = pattern.exec($(a).attr("href") ?? "");
    if (m) n = Math.max(n, Number(m[1]));
  });
  return n;
}

/**
 * One page of the agency directory. Each row: the agency link + its country in the first cell, then
 * numeric cells (players, players in top leagues, internationals…); a "licenciado" cell may come first.
 */
export function parseDirectory(html: string): { agencies: DirAgency[]; lastPage: number } {
  const $ = cheerio.load(html);
  const agencies: DirAgency[] = [];
  $("table.items").first().find("> tbody > tr").each((_, tr) => {
    const cells = $(tr).children("td");
    const link = cells.first().find("a[href*='/beraterfirma/berater/']").first();
    const href = link.attr("href");
    if (!href) return;
    const name = clean(link.text());
    const country = clean(cells.first().text()).replace(name, "").trim();
    const numeric = cells
      .toArray()
      .slice(1)
      .map((td) => clean($(td).text()))
      .find((t) => /^\d+$/.test(t));
    agencies.push({ name, tmUrl: abs(href), tmId: /\/(\d+)$/.exec(href)?.[1] ?? "", country, players: Number(numeric ?? 0) });
  });
  return { agencies, lastPage: lastPage($, /[?&]page=(\d+)/) };
}

/** One page of an agency: its own Instagram / website links and the players listed (25 per page). */
export function parseAgencyPage(html: string): { instagram: string | null; website: string | null; players: RosterPlayer[]; lastPage: number } {
  const $ = cheerio.load(html);
  let instagram: string | null = null;
  let website: string | null = null;
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    const ig = /instagram\.com\/([A-Za-z0-9._]+)/.exec(href);
    if (ig && !instagram && !/transfermarkt/i.test(ig[1])) instagram = ig[1];
  });
  // The agency's website: the first external link in the agency's own info box that is not a social network.
  $(".dataContent a[href^='http'], .data-header a[href^='http'], .content-box a[href^='http']").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    if (!website && !/transfermarkt|instagram|facebook|twitter|x\.com|youtube|tiktok|linkedin/i.test(href)) website = href;
  });

  const players: RosterPlayer[] = [];
  $("table.items").first().find("> tbody > tr").each((_, tr) => {
    const cells = $(tr).children("td");
    const a = cells.first().find("td.hauptlink a[href*='/profil/spieler/']").first();
    const href = a.attr("href");
    if (!href) return;
    const club = cells.find("a[href*='/startseite/verein/']").first();
    players.push({
      name: clean(a.attr("title") || a.text()),
      tmUrl: abs(href.replace(/\?.*$/, "")),
      position: clean(cells.first().find("table.inline-table tr").last().text()),
      age: clean(cells.eq(2).text()),
      club: clean(club.attr("title")),
      clubTmUrl: club.attr("href") ? abs(club.attr("href")!) : "",
    });
  });
  return { instagram, website, players, lastPage: lastPage($, /\/page\/(\d+)/) };
}

/** Contact emails published on a page (mailto links and plain text), lower-cased, in order, no duplicates. */
export function findEmails(html: string): string[] {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  const found: string[] = [];
  const add = (e: string) => {
    const m = e.trim().toLowerCase();
    if (/\.(png|jpe?g|gif|svg|webp)$/.test(m) || /sentry|wixpress|example\.|@2x/.test(m)) return;
    if (!found.includes(m)) found.push(m);
  };
  $("a[href^='mailto:']").each((_, a) => add(($(a).attr("href") ?? "").slice(7).split("?")[0]));
  for (const m of $("body").text().matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) add(m[0]);
  return found;
}
