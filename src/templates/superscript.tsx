/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1eee8";
const INK = "#141414";
const GREY = "rgba(20,20,20,.58)";

/** DM Serif Display: advance per 1px of font size (measured in the browser for the usual words). */
const DM_KNOWN: Record<string, number> = { Matchday: 4.302, Gameday: 4.146, Goal: 1.999, Brace: 2.531, "Hat-trick": 4.002 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
export const dmEm = (t: string) =>
  DM_KNOWN[t] ??
  plain(t).reduce((a, c) => a + (c === " " ? 0.24 : c === "-" ? 0.34 : /[il]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.8 : /[MW]/.test(c) ? 0.85 : /[A-Z]/.test(c) ? 0.68 : /\d/.test(c) ? 0.504 : 0.51), 0);

const MONTHS: Record<string, string> = {
  JAN: "January", FEB: "February", FEV: "February", MAR: "March", APR: "April", ABR: "April", MAY: "May", MAI: "May", JUN: "June", JUL: "July",
  AUG: "August", AGO: "August", SEP: "September", SET: "September", OCT: "October", OUT: "October", NOV: "November", DEC: "December", DEZ: "December",
};
/** "17 OCT" / "19 SET" / "SAT 17 OCT" → "17 October" (English, never the weekday). */
export function longDate(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${Number(m[1])} ${MONTHS[m[2]] ?? titleCase(m[2])}` : titleCase((d ?? "").trim());
}

/** The round number in the competition line: "MATCHDAY 6", "Jornada 6", "3RD QUALIFYING ROUND" → "3"; "" when there is none. */
export function roundNumber(subline: string): string {
  const s = subline.toUpperCase();
  const a = /\b(?:MATCHDAY|MATCH DAY|GAMEWEEK|JORNADA|RONDA|ROUND|MD|J)\s*(\d{1,2})\b/.exec(s);
  if (a) return String(Number(a[1]));
  const b = /\b(\d{1,2})\s*(?:ST|ND|RD|TH|ª|º|\.ª|\.º)?\s+(?:[A-ZÀ-Ú]+\s+){0,2}(?:ROUND|ELIMINATÓRIA|ELIMINATORIA|JORNADA|RONDA)\b/.exec(s);
  return b ? String(Number(b[1])) : "";
}

/**
 * Superscript: one typographic idea. "Matchday" set big in DM Serif on a pale paper ground, the round
 * number raised after it as a footnote mark in the club colour ("Matchday⁶"). At the foot, on the free
 * side, the footnote itself: a short hairline, then the same small number hung in the margin before the
 * fixture (home first, names as stored), the date, kick-off and ground, and the competition. The player
 * big on the other side, natural colour.
 */
export function Superscript({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the title: the word, its mark raised after it ---- */
  const M = story ? 72 : 64;
  const word = sentenceCase(content.kicker || "Matchday").replace(/[.!]+$/, "");
  const mark = roundNumber(content.subline || f.round || "");
  const SUP = 0.4;
  const supEm = mark ? 0.05 + SUP * 0.504 * mark.length : 0;
  const tSize = Math.min((story ? 236 : 206) * ts, (CANVAS_W - 2 * M) / (dmEm(word) + supEm + 0.02));
  const titleTop = (story ? STORY_TOP - tSize * 0.12 : 70) + (params.textY ?? 0);
  // DM Serif's capitals rise to ~0.16em under the top of a 1.0 line box; the mark's own top sits there.
  const capTop = tSize * 0.17;
  const titleBottom = titleTop + tSize * 0.98;

  /* ---- the player, big, on his side ---- */
  const faceX = right ? (story ? 720 : 716) : story ? 360 : 364;
  const faceTop = story ? Math.max(titleBottom + 120, 560) : Math.max(titleBottom + 96, 360);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 360, waist: 300, knees: 236, full: 178 } : { chest: 262, waist: 214, knees: 168, full: 128 });

  /* ---- the footnote ---- */
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const when = [longDate(content.date), f.time].filter(Boolean).join(" · ");
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const gloss = [comp, round && round.toLowerCase() !== comp.toLowerCase() ? round : ""].filter(Boolean).join(", ");
  // The footnote runs along the foot of the page, the logo at the other end of the same line.
  const noteW = story ? 600 : 700;
  // One size for the whole footnote, small enough that its longest line stays on one line.
  const longest = Math.max(fixture.length * 0.56, (when.length + (venue ? venue.length + 3 : 0)) * 0.52, gloss.length * 0.52, 1);
  const noteSize = Math.max(13, Math.min(19 * q * ts, (noteW - 30 * q) / longest));
  const logoAsked = 22;
  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const noteBottom = logoBottom;
  const noteLines = (fixture ? 1 : 0) + (when || venue ? 1 : 0) + (gloss ? 1 : 0);
  const noteTop = H - noteBottom - noteLines * noteSize * 1.42 - (22 + 2) * q;
  const fadeEnd = noteTop - 40 * q;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 300 : 230) - box.top}px, transparent ${fadeEnd - box.top}px)`;
  const hang = noteSize * 0.95;

  const side: CSSProperties = right ? { left: M } : { right: M };
  const note: CSSProperties = { fontFamily: SANS, fontSize: noteSize, lineHeight: 1.42, color: INK, letterSpacing: "-0.005em", whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* The paper: flat, the faintest light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 70 : 30}% 52%, ${shade(PAPER, 0.4)}, ${PAPER} 62%, ${shade(PAPER, -0.05)} 100%)` }} />

      {/* The title and its mark. */}
      <div style={{ position: "absolute", top: titleTop, ...side, display: "flex", flexDirection: right ? "row" : "row-reverse", alignItems: "flex-start", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <span style={{ fontFamily: DMSERIF, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.012em", color: INK }}>{word}</span>
          {mark && (
            <span style={{ fontFamily: DMSERIF, fontSize: tSize * SUP, lineHeight: 1, color: club, marginLeft: tSize * 0.05, marginTop: capTop - tSize * SUP * 0.16 }}>{mark}</span>
          )}
        </div>
      </div>

      {/* The player, natural colour. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: box.top + box.height * 0.42, width: box.width * 0.64, height: box.height * 0.6, borderRadius: "50%", background: "rgba(60,50,40,.10)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The footnote: hairline, then the mark hung in the margin. */}
      <div style={{ position: "absolute", bottom: noteBottom, ...side, maxWidth: noteW, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ width: 96 * q, height: story ? 2 : 1.5, background: INK, opacity: 0.8, marginBottom: 22 * q }} />
        <div style={{ position: "relative", paddingLeft: mark ? hang : 0, textAlign: "left" }}>
          {mark && <span style={{ position: "absolute", left: 0, top: -noteSize * 0.08, fontFamily: SANS, fontWeight: 600, fontSize: noteSize * 0.68, lineHeight: 1, color: club }}>{mark}</span>}
          {fixture && <div style={{ ...note, fontWeight: 500 }}>{fixture}</div>}
          {(when || venue) && (
            <div style={{ ...note, fontWeight: 400, color: GREY }}>
              {when}
              {when && venue ? " · " : ""}
              {venue && <span style={{ whiteSpace: "nowrap" }}>{venue}</span>}
            </div>
          )}
          {gloss && <div style={{ ...note, fontWeight: 400, color: GREY, fontStyle: "normal" }}>{gloss}</div>}
        </div>
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={logoAsked}
        style={{ position: "absolute", ...(right ? { right: M } : { left: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
