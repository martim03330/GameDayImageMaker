import { db } from "@/lib/db";
import { newId } from "@/lib/repo";
import { fetchText } from "@/lib/sources/http";
import { parseAgencyPage, parseDirectory, TM } from "./parse";

/**
 * Agências: the Portuguese player agencies of Transfermarkt's directory, with the user's triage
 * (designer, status, note) and the client data (logo). The scan reads the directory (landId 136 =
 * Portugal), then each agency's page once for its Instagram / website. One scan at a time; its progress
 * lives on globalThis so a page reload still sees it.
 */

export const AGENCY_STATUSES = ["novo", "contactado", "respondeu", "teste", "cliente", "sem interesse"] as const;
export const DESIGNER = ["por ver", "sem designer", "tem designer"] as const;
const PORTUGAL = 136;

export type Agency = {
  id: string;
  tm_id: string;
  tm_url: string;
  name: string;
  country: string;
  players: number;
  instagram: string;
  website: string;
  designer: (typeof DESIGNER)[number];
  status: (typeof AGENCY_STATUSES)[number];
  note: string;
  contacted_at: string | null;
  followed_up_at: string | null;
  logo: string | null;
  logo_white: string | null;
  page_checked_at: string | null;
  updated_at: string;
  /** 1 = the user checked: the agency has no Instagram (offer: create and manage it, by email). */
  no_instagram: number;
  email: string;
  /** Where the email was found (a URL), or "manual". */
  email_source: string;
};

export function listAgencies(): Agency[] {
  return db().prepare("SELECT * FROM agencies ORDER BY players DESC, name").all() as Agency[];
}

export function getAgency(id: string): Agency | null {
  return (db().prepare("SELECT * FROM agencies WHERE id = ?").get(id) as Agency | undefined) ?? null;
}

export function updateAgency(id: string, patch: Partial<Pick<Agency, "instagram" | "designer" | "status" | "note" | "no_instagram" | "email">>) {
  const a = getAgency(id);
  if (!a) return;
  const next = { ...a, ...patch, instagram: (patch.instagram ?? a.instagram).trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "") };
  const contacted = patch.status === "contactado" && a.status !== "contactado" ? new Date().toISOString() : a.contacted_at;
  db()
    .prepare("UPDATE agencies SET instagram = ?, designer = ?, status = ?, note = ?, contacted_at = ?, no_instagram = ?, email = ?, email_source = ?, updated_at = datetime('now') WHERE id = ?")
    .run(
      next.instagram,
      next.designer,
      next.status,
      next.note,
      contacted,
      next.no_instagram ? 1 : 0,
      next.email.trim().toLowerCase(),
      patch.email !== undefined && patch.email.trim().toLowerCase() !== a.email ? (patch.email.trim() ? "manual" : "") : a.email_source,
      id,
    );
}

export function markAgencyFollowedUp(id: string) {
  db().prepare("UPDATE agencies SET followed_up_at = ?, updated_at = datetime('now') WHERE id = ?").run(new Date().toISOString(), id);
}

type ScanState = { running: boolean; done: number; total: number; error: string | null; finished: string | null };
const g = globalThis as unknown as { __agencyScan?: ScanState };
const setting = (key: string) => db().prepare("SELECT value FROM settings WHERE key = ?").pluck().get(key) as string | undefined;

export function agencyScanState(): ScanState {
  return g.__agencyScan ?? { running: false, done: 0, total: 0, error: null, finished: setting("agency_scan_finished") ?? null };
}

const directoryUrl = (page: number) => `${TM}/berater/beraterfirmenuebersicht/berater?landId=${PORTUGAL}${page > 1 ? `&page=${page}` : ""}`;

export function startAgencyScan(): void {
  if (g.__agencyScan?.running) return;
  const state: ScanState = { running: true, done: 0, total: 0, error: null, finished: setting("agency_scan_finished") ?? null };
  g.__agencyScan = state;
  (async () => {
    // 1) The directory: new agencies inserted, known ones refreshed (the user's own fields are kept).
    const upsert = db().prepare(
      `INSERT INTO agencies (id, tm_id, tm_url, name, country, players) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(tm_id) DO UPDATE SET tm_url = excluded.tm_url, name = excluded.name, country = excluded.country, players = excluded.players, updated_at = datetime('now')`,
    );
    const first = parseDirectory((await fetchText(directoryUrl(1))).text);
    if (!first.agencies.length) throw new Error("Não encontrei agências no Transfermarkt");
    state.total = first.lastPage;
    for (let page = 1; page <= first.lastPage; page++) {
      const d = page === 1 ? first : parseDirectory((await fetchText(directoryUrl(page))).text);
      for (const a of d.agencies) upsert.run(newId(), a.tmId, a.tmUrl, a.name, a.country, a.players);
      state.done = page;
    }
    // 2) Each agency's page, once: its Instagram (unless typed by hand) and website.
    const todo = db().prepare("SELECT id, tm_url FROM agencies WHERE page_checked_at IS NULL").all() as { id: string; tm_url: string }[];
    state.done = 0;
    state.total = todo.length;
    const save = db().prepare(
      "UPDATE agencies SET instagram = CASE WHEN instagram = '' THEN ? ELSE instagram END, website = ?, page_checked_at = datetime('now') WHERE id = ?",
    );
    // A page that fails (Transfermarkt answers 502 now and then) is left for the next scan; many failures
    // in a row mean we are being refused, so the scan stops instead of hammering the site.
    let failures = 0;
    for (const a of todo) {
      try {
        const p = parseAgencyPage((await fetchText(a.tm_url)).text);
        save.run(p.instagram ?? "", p.website ?? "", a.id);
        failures = 0;
      } catch (e) {
        console.error("[agências] página", a.tm_url, (e as Error).message);
        if (++failures >= 8) throw new Error("O Transfermarkt está a recusar pedidos; tenta mais tarde");
      }
      state.done++;
    }
    state.finished = new Date().toISOString();
    db().prepare("INSERT INTO settings (key, value) VALUES ('agency_scan_finished', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(state.finished);
  })()
    .catch((e) => {
      console.error("[agências] scan", e);
      state.error = `Erro: ${(e as Error).message}`.slice(0, 200);
    })
    .finally(() => {
      state.running = false;
    });
}

/**
 * The client agency's logo: the upload as is (for light grounds) and a white silhouette of it (alpha kept,
 * colour set to white) for dark grounds. New file names every time: /api/files is served as immutable.
 */
export async function saveAgencyLogo(id: string, file: File): Promise<void> {
  const { saveUpload, absPath } = await import("@/lib/storage");
  const sharp = (await import("sharp")).default;
  const rel = await saveUpload(file, "agencies");
  // A logo without transparency (a JPG on a white box) would turn into a white rectangle: keep it as is.
  // SVG logos are drawn at 300 dpi so the white version stays sharp at logo size.
  const open = () => sharp(absPath(rel), rel.toLowerCase().endsWith(".svg") ? { density: 300 } : {});
  if (!(await open().metadata()).hasAlpha) {
    db().prepare("UPDATE agencies SET logo = ?, logo_white = ?, updated_at = datetime('now') WHERE id = ?").run(rel, rel, id);
    return;
  }
  // Always RGBA (a grey + alpha PNG would otherwise come as 2 channels).
  const { data, info } = await open().toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) data[i] = data[i + 1] = data[i + 2] = 255;
  const white = rel.replace(/\.[a-z0-9]+$/i, "") + `_white_${Date.now()}.png`;
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels as 4 } }).png().toFile(absPath(white));
  db().prepare("UPDATE agencies SET logo = ?, logo_white = ?, updated_at = datetime('now') WHERE id = ?").run(rel, white, id);
}

/** The message templates per language: the user's edited ones, else the defaults. */
export async function agencyTemplates(): Promise<Record<"pt" | "en", import("./messages").AgencyTemplates>> {
  const { AGENCY_DEFAULTS } = await import("./messages");
  const read = (lang: "pt" | "en") => {
    const raw = setting(`agency_templates_${lang}`);
    return raw ? { ...AGENCY_DEFAULTS[lang], ...(JSON.parse(raw) as object) } : AGENCY_DEFAULTS[lang];
  };
  return { pt: read("pt"), en: read("en") };
}

export function saveAgencyTemplates(lang: "pt" | "en", t: import("./messages").AgencyTemplates) {
  db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(`agency_templates_${lang}`, JSON.stringify(t));
}

/** The email templates per language: the user's edited ones, else the defaults. */
export async function agencyEmailTemplates(): Promise<Record<"pt" | "en", import("./messages").AgencyEmailTemplates>> {
  const { EMAIL_DEFAULTS } = await import("./messages");
  const read = (lang: "pt" | "en") => {
    const raw = setting(`agency_email_templates_${lang}`);
    return raw ? { ...EMAIL_DEFAULTS[lang], ...(JSON.parse(raw) as object) } : EMAIL_DEFAULTS[lang];
  };
  return { pt: read("pt"), en: read("en") };
}

export function saveAgencyEmailTemplates(lang: "pt" | "en", t: import("./messages").AgencyEmailTemplates) {
  db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(`agency_email_templates_${lang}`, JSON.stringify(t));
}

type EmailState = { running: boolean; done: number; total: number; found: number; error: string | null };
const ge = globalThis as unknown as { __agencyEmails?: EmailState };

export function emailSearchState(): EmailState {
  return ge.__agencyEmails ?? { running: false, done: 0, total: 0, found: 0, error: null };
}

/**
 * Emails for the agencies marked "sem Instagram" that have none yet: their website's home page and usual
 * contact pages, and their Transfermarkt page. Only addresses actually published there are kept.
 */
export function startEmailSearch(): void {
  if (ge.__agencyEmails?.running) return;
  const state: EmailState = { running: true, done: 0, total: 0, found: 0, error: null };
  ge.__agencyEmails = state;
  (async () => {
    const { findEmails } = await import("./parse");
    const todo = db().prepare("SELECT id, tm_url, website FROM agencies WHERE no_instagram = 1 AND email = ''").all() as { id: string; tm_url: string; website: string }[];
    state.total = todo.length;
    const save = db().prepare("UPDATE agencies SET email = ?, email_source = ?, updated_at = datetime('now') WHERE id = ? AND email = ''");
    for (const a of todo) {
      const site = a.website.replace(/\/+$/, "");
      const pages = [a.tm_url, ...(site ? [site, `${site}/contactos`, `${site}/contacto`, `${site}/contact`, `${site}/contacts`] : [])];
      for (const url of pages) {
        const text = await fetchText(url).then((r) => r.text).catch(() => "");
        const email = findEmails(text).find((e) => !/transfermarkt/.test(e));
        if (email) {
          save.run(email, url, a.id);
          state.found++;
          break;
        }
      }
      state.done++;
    }
  })()
    .catch((e) => {
      console.error("[agências] emails", e);
      state.error = `Erro: ${(e as Error).message}`.slice(0, 200);
    })
    .finally(() => {
      state.running = false;
    });
}
