import { luminance, shade, vivid } from "@/lib/color";
import type { PressArticle, TemplateParams } from "@/lib/types";
import type { RenderData } from "./types";

/**
 * Shared bits of the PRESS looks (pressstack / pressclip / presshero / presswall): the articles to show
 * (headlines exactly as published — they are quotes), small type-fitting helpers and the club tone.
 */

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MON_PT: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };

/** "17 OCT" → a sortable number (month * 40 + day); unknown dates sort as the oldest. */
function dateKey(d: string | undefined): number {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s*([A-Z]{3})/);
  if (!m) return -1;
  const mon = MON.indexOf(MON_PT[m[2]] ?? m[2]);
  return mon < 0 ? -1 : mon * 40 + Number(m[1]);
}

/** The date as printed: "17 OCT" (Portuguese month abbreviations in English). */
export function pressDateLabel(d: string | undefined): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s*([A-Z]{3})/);
  return m ? `${Number(m[1])} ${MON_PT[m[2]] ?? m[2]}` : (d ?? "").toUpperCase().trim();
}

/**
 * The articles the look shows, in the user's order (the first is the lead). Beyond `max`, the oldest are
 * dropped (the user's order kept for the rest). Empty headlines are skipped.
 */
export function pressArticles(data: RenderData, max: number): PressArticle[] {
  const all = (data.content.articles ?? []).filter((a) => a.title?.trim());
  if (all.length <= max) return all;
  const keep = new Set(
    all
      .map((a, i) => ({ i, k: dateKey(a.date) }))
      // Newest first; on equal dates the user's order decides (earlier in the list = kept).
      .sort((a, b) => b.k - a.k || a.i - b.i)
      .slice(0, max)
      .map((x) => x.i),
  );
  return all.filter((_, i) => keep.has(i));
}

/** "A Bola" → "A BOLA" (the source line is set in caps). */
export const sourceLabel = (a: PressArticle) => (a.source || "").trim().toUpperCase();

/** Rough width of a headline in ems for a text face (average advance). */
export function textEm(s: string, avg = 0.5): number {
  let em = 0;
  for (const ch of s.normalize("NFD").replace(/\p{M}/gu, "")) em += ch === " " ? 0.26 : /[iljtf.,:;'’!|]/.test(ch) ? 0.3 : /[mwMW]/.test(ch) ? 0.82 : /[A-Z]/.test(ch) ? 0.66 : avg;
  return em;
}

/** Lines a headline takes at `size` px in a `width` px column (estimate, greedy word wrap). */
export function linesAt(s: string, size: number, width: number, avg = 0.5): number {
  let lines = 1;
  let cur = 0;
  for (const w of s.split(/\s+/).filter(Boolean)) {
    const ww = textEm(w, avg) * size;
    const sp = 0.26 * size;
    if (cur > 0 && cur + sp + ww > width) {
      lines++;
      cur = ww;
    } else cur += (cur > 0 ? sp : 0) + ww;
  }
  return lines;
}

/** The club colour readable on a dark ground (light enough) — dark-tone and white/yellow clubs guarded. */
export function clubOnDark(params: TemplateParams): string {
  let c = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(c) < 0.12) c = vivid(params.accent);
  if (luminance(c) < 0.12) c = shade(c, 0.45);
  if (luminance(c) > 0.85) c = "#e9e4d8";
  return c;
}

/** The club colour readable on a light ground (dark enough). */
export function clubOnLight(params: TemplateParams): string {
  let c = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(c) > 0.45) c = vivid(params.accent);
  if (luminance(c) > 0.35) c = shade(c, -0.4);
  if (luminance(c) < 0.02) c = shade(c, 0.12);
  return c;
}

/** White type over a photo: a tight dark outline-shadow plus a wide soft one (stands out on light grounds too). */
export const PHOTO_TEXT_SHADOW = "0 2px 3px rgba(0,0,0,.38), 0 8px 22px rgba(0,0,0,.42)";

/** Fine paper grain (newsprint) as a tiling background. */
export const PAPER_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;
