/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const PAPER = "#f2f1ee";
const INK = "#111111";
const GREY = "#8a8985";
const RULE = "rgba(17,17,17,.85)";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3, "!": 28 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);

/* The grid: 12 columns, 60px margins, 20px gutters. */
const MARGIN = 60;
const GUTTER = 20;
const COL = (CANVAS_W - MARGIN * 2 - GUTTER * 11) / 12;
const colX = (i: number) => MARGIN + i * (COL + GUTTER);
const span = (n: number) => n * COL + (n - 1) * GUTTER;

/** "GOAL" → "Goal", "HAT-TRICK" → "Hat-trick". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase();
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

/** Words into at most two lines, the break as even as possible. */
function twoLines(t: string): string[] {
  const w = t.split(/\s+/).filter(Boolean);
  if (w.length < 2) return [t];
  let best = [t];
  let bestW = Infinity;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(" ");
    const b = w.slice(i).join(" ");
    const m = Math.max(interEm(a), interEm(b));
    if (m < bestW) {
      bestW = m;
      best = [a, b];
    }
  }
  return best;
}

/**
 * Goal swiss: the goal post of `swiss`. The same off-white sheet on a 12-column grid with a hairline under a
 * small top row, "Goal" in sentence-case Inter on its column, the celebrating player large on the other side
 * cropped by the foot rule, and a quiet three-column table — Scorer / Fixture / Competition — with one
 * club-colour square as the only accent. Never a score.
 */
export function Goalswiss({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 23);
  const right = params.side !== "left";
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const Y0 = story ? STORY_TOP - 52 : 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);

  const f = matchFacts(data);

  /* ---- teams, home first ---- */
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const teams = (weHost ? [ours, opp] : [opp, ours]).filter(Boolean);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  /* ---- the text column: cols 1–6 when he stands right, cols 7–12 when he stands left ---- */
  const tx = colX(right ? 0 : 6);
  const tw = span(6);
  const titleW = story ? span(7) : tw;

  /* ---- title: one short word, so a size bigger than swiss ---- */
  const title = sentence(content.kicker || "Goal");
  const tracking = -0.045;
  let size = (story ? 220 : 170) * ts;
  let lines = wrap(title, size, titleW, tracking);
  while ((lines.length > 2 || lines.some((l) => interEm(l, tracking) * size > titleW)) && size > 70) {
    size -= 4;
    lines = wrap(title, size, titleW, tracking);
  }
  const lead = size * 0.98;
  const TOP_RULE = 128 + Y0 + (story ? 14 : 0);
  const titleTop = TOP_RULE + 40 * S + (params.textY ?? 0);
  const titleBottom = titleTop + lead * lines.length;

  /* ---- the player, on the other side, cropped by the foot rule ---- */
  const FOOT_RULE = story ? STORY_BOTTOM - 156 - 130 : 1128;
  const faceX = (right ? colX(8) + COL * (0.3 + r() * 0.5) : colX(3) + COL * (0.2 + r() * 0.5)) + (story ? (right ? 20 : -20) : 0);
  const faceTop = story ? Math.max(560, titleBottom + 100) : Math.max(270, titleBottom * 0.4 + 170);
  let box = placeByFace(data, faceX, faceTop, story ? { chest: 330, waist: 280, knees: 226, full: 176 } : { chest: 250, waist: 210, knees: 170, full: 132 });
  // A fist thrown wide towards the title: nudge the figure back to his side (never past the face column).
  const centre = box.left + box.width / 2;
  const want = right ? colX(8) + COL : colX(3) + COL;
  const nudge = Math.max(-90, Math.min(90, want - centre));
  box = { ...box, left: box.left + (right ? Math.max(0, nudge) : Math.min(0, nudge)) };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;

  /* ---- the small line over the foot rule: square + round / date ---- */
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const date = niceDate(content.date);
  const note = [comp ? round : "", date].filter(Boolean).join("  ·  ");

  /* ---- the foot table ---- */
  const scorer = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const cellW = span(3);
  const valueSize = (ls: string[]) => Math.max(17, Math.min(24 * S, cellW / Math.max(1, ...ls.map((l) => interEm(l) * 1.03)))) * ts;
  const fixtureLines = teams.length === 2 ? [`${teams[0]} v`, teams[1]] : teams;
  const cells: { label: string; lines: string[] }[] = [
    { label: "Scorer", lines: twoLines(scorer) },
    { label: "Fixture", lines: fixtureLines },
    { label: "Competition", lines: twoLines(comp || round) },
  ].filter((c) => c.lines.join("").trim());

  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 15 * S, letterSpacing: "0.01em", color: GREY, lineHeight: 1.2 };
  const value: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "-0.01em", color: INK, lineHeight: 1.18, whiteSpace: "nowrap" };
  const topText = (t: string, w: number): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: Math.max(13, Math.min(18 * S, w / Math.max(1, interEm(t)))), color: INK, lineHeight: 1.2, whiteSpace: "nowrap" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 72 : 28}% 48%, rgba(255,255,255,.55), transparent 70%)` }} />

      {/* The celebrating player, natural colour, cropped by the foot rule; a soft shade behind him instead of a drop shadow. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: FOOT_RULE, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: box.left + box.width * 0.22, top: chin + box.faceH * 0.8, width: box.width * 0.56, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.07)", filter: "blur(50px)" }} />
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
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

      {/* The one accent under the title: a club-colour square, with the round and date. */}
      <div style={{ position: "absolute", left: tx, top: titleBottom + 26 * S, display: "flex", alignItems: "center", gap: 12 * S, fontFamily: SANS, fontWeight: 500, fontSize: 17 * S, color: INK, whiteSpace: "nowrap" }}>
        <span style={{ width: 14 * S, height: 14 * S, background: club, display: "inline-block" }} />
        {note}
      </div>

      {/* Foot rule and the three-column table. */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: FOOT_RULE, height: 1.5, background: RULE }} />
      <div style={{ position: "absolute", left: colX(0), top: FOOT_RULE + 26 * S, width: span(9), display: "grid", gridTemplateColumns: `repeat(3, ${cellW}px)`, columnGap: GUTTER }}>
        {cells.map((c, i) => (
          <div key={i}>
            <div style={label}>{c.label}</div>
            <div style={{ ...value, marginTop: 8 * S, fontSize: valueSize(c.lines) }}>
              {c.lines.map((l, j) => (
                <div key={j}>{l}</div>
              ))}
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
