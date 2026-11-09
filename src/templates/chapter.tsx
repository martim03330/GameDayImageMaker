/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#efebe4";
const INK = "#1c1a17";
const GREY = "#86817a";

/** Bodoni Moda 500: advance widths per 100px (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.4, d: 61.7, e: 52.6, f: 35.4, g: 60.3, h: 60.4, i: 31, j: 31.3, k: 61.6, l: 35.7, m: 86.9, n: 60.4, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 59.3, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, A: 78.4, B: 67.1, C: 71.8, D: 73.8, E: 62.6, F: 60.4, G: 74.7, H: 77.4, I: 39.9, J: 47.7, K: 72.6, L: 61.1, M: 88.4, N: 77.6, O: 75.7, P: 65.2, Q: 75.7, R: 73.1, S: 57.5, T: 68.1, U: 73, V: 78.2, W: 103.7, X: 77.8, Y: 74.6, Z: 59.5, " ": 25, ".": 21.6, ",": 23.2, "-": 35.9, "'": 21.6, "/": 40 };
const bodEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BOD_W[c] ?? (/\d/.test(c) ? 56 : 60)) / 100, 0);
/** Inter 400 (approximate average for mixed case). */
const interEm = (t: string) => t.length * 0.56;

/** The matchday / round number from the competition line ("MATCHDAY 8", "3RD QUALIFYING ROUND"), else the day of the month. */
function chapterNo(data: RenderData): string {
  const sub = data.content.subline ?? "";
  const m = /\b(?:MATCHDAY|MATCH DAY|ROUND|JORNADA|GAMEWEEK|WEEK|MD)\s*(\d{1,3})\b/i.exec(sub) ?? /\b(\d{1,3})(?:ST|ND|RD|TH)\b/i.exec(sub);
  if (m) return String(Number(m[1]));
  const day = matchFacts(data).day;
  return day ? String(Number(day)) : "1";
}

/**
 * Chapter: a book's chapter opener. A pale paper page; in the text column, low down as in a book, a small
 * spaced CHAPTER over a big Bodoni numeral (the matchday or round number), a short hairline, the fixture
 * as the chapter title in Bodoni, and the date, kick-off and ground in small grey type; the competition
 * as the running head. The player stands on the other side in natural colour, melting into the paper
 * where he meets the column. The NEYOD mark at the foot of the column.
 */
export function Chapter({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const S = (story ? 1.32 : 1) * ts;
  const ty = params.textY ?? 0;
  const f = matchFacts(data);

  /* ---- the column: opposite the player ---- */
  const playerLeft = params.side === "left";
  const M = story ? 84 : 80;
  const colW = story ? 540 : 470;
  const colX = playerLeft ? CANVAS_W - M - colW : M;
  const align = playerLeft ? "right" : "left";

  /* ---- the foot: logo, then the block standing ~64px above it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const blockBottom = H - logoBottom - logoH - (story ? 68 : 62) + ty;

  const date = niceDate(content.date);
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const facts = [[date, f.time].filter(Boolean).join("  ·  "), venue].filter(Boolean);
  const factMax = 21 * S;
  const factSize = Math.max(13, Math.min(factMax, ...facts.map((t) => colW / Math.max(1, interEm(t)))));
  const factLead = factSize * 1.5;

  const teams = teamsOf(data);
  const titleLines = teams.length === 2 ? [teams[0], `v ${teams[1]}`] : [teams[0] || titleCase(f.comp) || "Matchday"];
  const titleSize = Math.max(30, Math.min(64 * S, ...titleLines.map((t) => colW / Math.max(1, bodEm(t)))));
  const titleLead = titleSize * 1.1;

  const no = chapterNo(data);
  const noSize = Math.min(300 * S, (colW * 0.9) / Math.max(0.5, bodEm(no)));
  const capH = noSize * 0.72; // digit height in Bodoni Moda
  const labelSize = 16 * S;

  // Stack from the bottom up.
  const factsTop = blockBottom - factLead * facts.length + (factLead - factSize) / 2;
  const titleTop = factsTop - 40 * S - titleLead * titleLines.length;
  const ruleY = titleTop - 44 * S;
  const noBase = ruleY - 48 * S; // baseline of the numeral
  const labelTop = noBase - capH - 34 * S - labelSize;

  /* ---- running head: the competition ---- */
  const head = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join("  ·  ").toUpperCase();
  const headTop = (story ? STORY_TOP : 64) + ty;
  const headSize = Math.max(10, Math.min(13 * S, (CANVAS_W - 2 * M) / Math.max(1, head.length * 0.62 * 1.3)));

  /* ---- the player, on the other side ---- */
  const faceX = playerLeft ? (story ? 330 : 320) : story ? 750 : 760;
  const sizes = story ? { chest: 300, waist: 236, knees: 186, full: 146 } : { chest: 220, waist: 174, knees: 136, full: 108 };
  const probe = placeByFace(data, faceX, 400, sizes);
  let box = placeByFace(data, faceX, Math.max(story ? 470 : 260, headTop + headSize + (story ? 60 : 44) + probe.faceH * 0.8), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const soft = story ? 140 : 120;
  {
    // A big face: slide him away from the column so the melt finishes before the type (face ≥ 40px inside).
    const fl = box.left + face[0] * box.width;
    const fr = fl + face[2] * box.width;
    const need = playerLeft ? fr + soft + 24 - (colX - 20) : colX + colW + 20 - (fl - soft - 24);
    const room = playerLeft ? fl - 40 : CANVAS_W - 40 - fr;
    if (need > 0) box = { ...box, left: box.left + (playerLeft ? -1 : 1) * Math.min(need, Math.max(0, room)) };
  }
  const chin = box.top + face[1] * box.height + box.faceH;
  // He melts into the paper where he meets the column (never across his face).
  const faceL = box.left + face[0] * box.width;
  const faceR = faceL + face[2] * box.width;
  const edge = playerLeft ? Math.max(colX - 20, faceR + soft + 24) : Math.min(colX + colW + 20, faceL - soft - 24);
  const sideFade = playerLeft
    ? `linear-gradient(to right, #000 0, #000 ${edge - soft - box.left}px, transparent ${edge - box.left}px)`
    : `linear-gradient(to right, transparent ${edge - box.left}px, #000 ${edge + soft - box.left}px, #000 100%)`;
  const footFade = `linear-gradient(to bottom, #000 0, #000 ${H - 260 - box.top}px, transparent ${H - box.top}px)`;

  const caps = { fontFamily: SANS, whiteSpace: "nowrap" as const, lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* The faintest light on the page behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 40% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.7), transparent 75%)` }} />
      <div style={{ position: "absolute", left: faceX - box.faceH * 2, top: chin + box.faceH * 0.4, width: box.faceH * 4, height: box.faceH * 4.6, borderRadius: "50%", background: "rgba(50,40,30,.09)", filter: `blur(${story ? 70 : 54}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: sideFade, maskImage: sideFade }}>
          <div style={{ width: "100%", height: "100%", WebkitMaskImage: footFade, maskImage: footFade }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.02) saturate(.96)", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}

      {/* Running head. */}
      {head && (
        <div style={{ position: "absolute", left: M, right: M, top: headTop, textAlign: align, ...caps, fontWeight: 500, fontSize: headSize, letterSpacing: "0.3em", color: GREY }}>{head}</div>
      )}

      {/* The chapter opener. */}
      <div style={{ position: "absolute", left: colX, width: colW, top: labelTop, textAlign: align, ...caps, fontWeight: 500, fontSize: labelSize, letterSpacing: "0.46em", marginRight: "-0.46em", color: INK }}>CHAPTER</div>
      <div style={{ position: "absolute", left: colX, width: colW, top: noBase - noSize * 0.9, height: noSize, textAlign: align, fontFamily: BODONI, fontWeight: 500, fontSize: noSize, lineHeight: `${noSize}px`, whiteSpace: "nowrap", fontVariantNumeric: "lining-nums" }}>{no}</div>
      <div style={{ position: "absolute", left: playerLeft ? colX + colW - 72 * S : colX, top: ruleY, width: 72 * S, height: story ? 2 : 1.5, background: INK }} />
      {titleLines.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: colX, width: colW, top: titleTop + i * titleLead, textAlign: align, fontFamily: BODONI, fontWeight: 500, fontSize: titleSize, lineHeight: `${titleLead}px`, whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>
          {t.startsWith("v ") ? (
            <>
              <span style={{ color: GREY }}>v</span>
              {t.slice(1)}
            </>
          ) : (
            t
          )}
        </div>
      ))}
      {facts.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: colX, width: colW, top: factsTop + i * factLead, textAlign: align, ...caps, fontWeight: 400, fontSize: factSize, letterSpacing: "0.02em", color: GREY }}>{t}</div>
      ))}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", ...(playerLeft ? { right: M } : { left: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
