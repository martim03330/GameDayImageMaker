/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const PAPER = "#f2f1ee";
const INK = "#111111";
const GREY = "#8a8985";
const RULE = "rgba(17,17,17,.85)";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? (/\d/.test(c) ? 62 : 62)) / 100 + tracking, 0);

/* The grid: 12 columns, 60px margins, 20px gutters. */
const MARGIN = 60;
const GUTTER = 20;
const COL = (CANVAS_W - MARGIN * 2 - GUTTER * 11) / 12;
/** Left edge of column i (0-based). */
const colX = (i: number) => MARGIN + i * (COL + GUTTER);
/** Width spanned by n columns. */
const span = (n: number) => n * COL + (n - 1) * GUTTER;

/** "MATCHDAY" → "Matchday", "MAN OF THE MATCH" → "Man of the match". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase().replace(/^full ?time$/, "full time");
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/** Greedy lines that fit `width` at `size`. */
function wrap(text: string, size: number, width: number, tracking: number): string[] {
  const lines: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last && interEm(`${last} ${w}`, tracking) * size <= width) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines.length ? lines : [""];
}

/**
 * International Typographic Style: an off-white sheet on a 12-column grid, a hairline under a small top row
 * (club, competition, crests), the title in sentence-case Inter flush-left on a column, the player large
 * on the other side and cropped square by the foot rule, and under it a quiet three-column table — tiny
 * grey labels over black values — with one club-colour square as the only accent.
 */
export function Swiss({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 23;
  const r = rng(seed);
  const right = params.side !== "left";
  const ts = params.textScale ?? 1;
  // Native story (1080×1920): the same sheet, the top row from STORY_TOP and the table + mark ending at
  // STORY_BOTTOM; the player fills the taller field between the rules; type a size up.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const Y0 = story ? STORY_TOP - 52 : 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the text column: cols 1–6 when he stands right, cols 7–12 when he stands left ---- */
  const textCol = right ? 0 : 6;
  const tx = colX(textCol);
  const tw = span(6);
  const titleW = story ? span(7) : tw;

  /* ---- title ---- */
  const title = sentence(content.kicker);
  const tracking = -0.045;
  let size = (story ? 184 : 140) * ts;
  let lines = wrap(title, size, titleW, tracking);
  while ((lines.length > 2 || lines.some((l) => interEm(l, tracking) * size > titleW)) && size > 70) {
    size -= 4;
    lines = wrap(title, size, titleW, tracking);
  }
  const lead = size * 0.98;
  const TOP_RULE = 128 + Y0 + (story ? 14 : 0);
  const titleTop = TOP_RULE + 40 * S + (params.textY ?? 0);
  const titleBottom = titleTop + lead * lines.length;

  /* ---- teams line under the title ---- */
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const teams = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = teams.filter(Boolean).join(" v ");
  /* ---- the player, on the other side, cropped by the foot rule ---- */
  // Story: the table sits a row higher so the (story-sized, ~88px) agency logo has its own line under it.
  const FOOT_RULE = story ? STORY_BOTTOM - 156 - 130 : 1128;
  const faceX = (right ? colX(8) + COL * (0.4 + r() * 0.5) : colX(3) + COL * (0.1 + r() * 0.5)) + (story ? (right ? 30 : -30) : 0);
  const faceTop = story ? Math.max(560, titleBottom + 110) : Math.max(300, titleBottom * 0.5 + 170);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 390, waist: 320, knees: 250, full: 190 } : { chest: 290, waist: 240, knees: 185, full: 140 });

  /* ---- fixture lines, kept clear of his body ---- */
  // The body's edge at the foot (≈1.7 face widths from the face centre on busts and waist shots): the
  // fixture never runs past it. Long names break after the "v", then between words, before they shrink.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceW = face[2] * box.width;
  const faceCx = box.left + box.width * (face[0] + face[2] / 2);
  const bodyEdge = right ? Math.max(box.left, faceCx - faceW * 1.7) : Math.min(box.left + box.width, faceCx + faceW * 1.7);
  const fixX = right ? tx : Math.min(colX(9), Math.max(tx, bodyEdge + 24));
  const fixW = Math.max(span(3), Math.min(tx + tw, right ? bodyEdge - 24 : CANVAS_W - MARGIN) - fixX);
  const fixBase = 30 * S;
  const fixFit = (ls: string[]) => Math.min(fixBase, fixW / Math.max(1, ...ls.map((l) => interEm(l) * 1.04)));
  const fixCands: string[][] = [[fixture]];
  if (teams.every(Boolean)) fixCands.push([`${teams[0]} v`, teams[1]]);
  fixCands.push(wrap(fixture, fixBase, fixW / 1.04, 0));
  // A name kept whole on its line is worth a slightly smaller size than a name split over two lines.
  const fixMin = [0.8, 0.68, 0.8];
  const fixLines = fixCands.find((ls, i) => fixFit(ls) >= fixBase * fixMin[i === fixCands.length - 1 ? 2 : i]) ?? fixCands.reduce((a, b) => (fixFit(b) > fixFit(a) ? b : a));
  const fixSize = Math.max(18, fixFit(fixLines)) * ts;

  /* ---- the foot table ---- */
  const venue = titleCase(f.venue);
  const date = niceDate(content.date);
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const roundText = hasScore ? "Full time" : round && comp ? round : "";
  const roundSize = Math.max(13, Math.min(17 * S, (fixW - 26 * S) / Math.max(1, interEm(roundText))));
  const cells: { label: string; value: string }[] = (
    hasScore
      ? [
          { label: "Score", value: score },
          { label: "Date", value: date },
          { label: "Ground", value: venue },
          { label: "Round", value: round },
        ]
      : [
          { label: "Date", value: date },
          { label: "Kick-off", value: f.time },
          { label: "Ground", value: venue },
          { label: "Competition", value: comp },
        ]
  )
    .filter((c) => c.value)
    .slice(0, 3);
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 15 * S, letterSpacing: "0.01em", color: GREY, lineHeight: 1.2 };
  const value: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 24 * S, letterSpacing: "-0.01em", color: INK, lineHeight: 1.18 };
  const topText = (t: string, w: number): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: Math.max(13, Math.min(18 * S, w / Math.max(1, interEm(t)))), color: INK, lineHeight: 1.2, whiteSpace: "nowrap" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* The faintest light from the player's side, so the sheet is not dead flat. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 72 : 28}% 48%, rgba(255,255,255,.55), transparent 70%)` }} />

      {/* The player, cropped square by the foot rule. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: FOOT_RULE, overflow: "hidden" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02) drop-shadow(0 14px 28px rgba(0,0,0,.12))", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Top row: club, competition, crests; hairline under it. */}
      <div style={{ position: "absolute", left: colX(0), top: 66 + Y0, width: span(4) }}>
        <div style={topText(ours, span(4))}>{ours}</div>
      </div>
      <div style={{ position: "absolute", left: colX(4), top: 66 + Y0, width: span(4) }}>
        <div style={{ ...topText(comp || round, span(4)), color: GREY }}>{comp || round}</div>
      </div>
      <div style={{ position: "absolute", right: MARGIN, top: 52 + Y0, height: 52 * S, display: "flex", gap: 14 * S, alignItems: "center" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 46 * S, height: 46 * S, objectFit: "contain" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: TOP_RULE, height: 1.5, background: RULE }} />

      {/* Title, flush-left on its column. */}
      <div style={{ position: "absolute", left: tx, top: titleTop, width: tw, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: `${lead}px`, letterSpacing: `${tracking}em`, color: INK, whiteSpace: "nowrap" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginLeft: -size * 0.05 }}>
            {l}
          </div>
        ))}
      </div>

      {/* Fixture and round, with the one accent: a club-colour square. */}
      <div style={{ position: "absolute", left: fixX, bottom: H - FOOT_RULE + 44, width: fixW }}>
        <div style={{ marginBottom: 18 * S, display: "flex", alignItems: "center", gap: 12 * S, fontFamily: SANS, fontWeight: 500, fontSize: roundSize, color: INK, whiteSpace: "nowrap" }}>
          <span style={{ width: 14 * S, height: 14 * S, background: club, display: "inline-block" }} />
          {roundText}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: fixSize, letterSpacing: "-0.015em", color: INK, whiteSpace: "nowrap", lineHeight: 1.2 }}>
          {fixLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>

      {/* Foot rule and the three-column table. */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: FOOT_RULE, height: 1.5, background: RULE }} />
      <div style={{ position: "absolute", left: colX(0), top: FOOT_RULE + 26 * S, width: span(9), display: "grid", gridTemplateColumns: `repeat(3, ${span(3)}px)`, columnGap: GUTTER }}>
        {cells.map((c, i) => (
          <div key={i}>
            <div style={label}>{c.label}</div>
            <div style={{ ...value, marginTop: 8 * S, fontSize: Math.max(18, Math.min(24 * S, (span(3) * 2) / Math.max(1, interEm(c.value)) / 1.02)), overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", right: MARGIN, bottom: (story ? H - STORY_BOTTOM : 60) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
    </div>
  );
}
