/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure, MARKER, type Box } from "./fx";
import { Paper } from "./kit";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * "Duelo" (Ajax × Chelsea poster): the canvas split in two halves, home on top, each in its team colour with
 * the club name in huge letterpress cream capitals. Our player stands in our half with marker motion lines,
 * the opponent's crest fills the other half; date / time (or the score) sits on the split.
 */

const CREAM = "#f1e7d2";
const INK = "#2a2521";
const FRAME = 20;
const FOOT = 58;
/** y of the split between the two halves. */
const SPLIT = Math.round((FRAME + CANVAS_H - FOOT) / 2);
const PAD = 62;

/** Anton advance widths (em) of upper-case glyphs, measured in the renderer. */
const ANTON: Record<string, number> = {
  A: 0.49, B: 0.48, C: 0.47, D: 0.49, E: 0.41, F: 0.4, G: 0.49, H: 0.5, I: 0.23, J: 0.47, K: 0.47, L: 0.4, M: 0.75,
  N: 0.5, O: 0.49, P: 0.47, Q: 0.49, R: 0.48, S: 0.46, T: 0.4, U: 0.47, V: 0.47, W: 0.71, X: 0.48, Y: 0.45, Z: 0.41,
  " ": 0.19, ".": 0.23, "-": 0.31, "'": 0.21, "&": 0.55,
};
const emWidth = (s: string) =>
  [...s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")].reduce((a, ch) => a + (ANTON[ch] ?? (/[0-9]/.test(ch) ? 0.49 : 0.5)), 0) * 1.02;
/** Anton cap height and the baseline inside a line box as tall as the font size (em). */
const CAP = 0.86;
const BASE = 0.925;
const GAP = 0.1;

type Rect = { x0: number; y0: number; x1: number; y1: number };
const hits = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** Drops "FC", "SC"… so the name itself gets the space. */
function cleanName(name: string): string {
  const words = name.toUpperCase().split(/\s+/).filter(Boolean);
  const kept = words.filter(Boolean);
  return (kept.length ? kept : words).join(" ");
}

/** Every way to break the words into 1–3 lines. */
function splits(words: string[]): string[][] {
  const out: string[][] = [[words.join(" ")]];
  for (let i = 1; i < words.length; i++) {
    out.push([words.slice(0, i).join(" "), words.slice(i).join(" ")]);
    for (let j = i + 1; j < words.length; j++) out.push([words.slice(0, i).join(" "), words.slice(i, j).join(" "), words.slice(j).join(" ")]);
  }
  return out;
}

type Fit = { lines: string[]; size: number; capTop: number; stretch: number };

const MAX_STRETCH = 1.5;

/**
 * Biggest name that fits between `y0` and `y1`, flush to one side, without touching any obstacle
 * (player silhouette, crest, info). Among equal sizes, the block closest to `prefer` wins; the letters are
 * then stretched vertically (poster-style condensed caps) to use the free height.
 */
function fitName(name: string, side: "left" | "right", y0: number, y1: number, max: number, obstacles: Rect[], prefer: "top" | "bottom"): Fit {
  const text = cleanName(name) || "—";
  const place = (lines: string[], size: number, st: number) => {
    const n = lines.length;
    const blockH = (n * CAP + (n - 1) * GAP) * size * st;
    if (blockH > y1 - y0) return undefined;
    const tops: number[] = [];
    for (let t = y0; t <= y1 - blockH; t += 6) tops.push(t);
    tops.push(y1 - blockH);
    if (prefer === "bottom") tops.reverse();
    return tops.find((top) =>
      lines.every((l, i) => {
        const w = emWidth(l) * size;
        const ly = top + i * size * st * (CAP + GAP);
        const r: Rect = side === "left" ? { x0: PAD, x1: PAD + w, y0: ly, y1: ly + size * st * CAP } : { x0: CANVAS_W - PAD - w, x1: CANVAS_W - PAD, y0: ly, y1: ly + size * st * CAP };
        return r.x1 - r.x0 <= CANVAS_W - 2 * PAD + 1 && !obstacles.some((o) => hits(r, o));
      }),
    );
  };
  // Score = size, minus a little for every px left empty between the block and its preferred edge.
  let best: Fit = { lines: [text], size: 0, capTop: y0, stretch: 1 };
  let bestScore = -Infinity;
  for (const lines of splits(text.split(" "))) {
    const n = lines.length;
    for (let size = max; size >= 56 && size > bestScore; size -= 3) {
      const found = place(lines, size, 1);
      if (found === undefined) continue;
      const blockH = (n * CAP + (n - 1) * GAP) * size;
      const gap = prefer === "top" ? found - y0 : y1 - (found + blockH);
      const sc = size - gap * 0.2 - (n - 1) * 5;
      if (sc > bestScore) {
        bestScore = sc;
        best = { lines, size, capTop: found, stretch: 1 };
      }
    }
  }
  if (best.size === 0) return { ...best, size: 56 };
  for (let st = MAX_STRETCH; st > 1; st -= 0.04) {
    const found = place(best.lines, best.size, st);
    if (found !== undefined) return { ...best, capTop: found, stretch: st };
  }
  return best;
}

function hue(c: string): [number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h = max === r ? ((g - b) / (max - min)) * 60 : max === g ? ((b - r) / (max - min) + 2) * 60 : ((r - g) / (max - min) + 4) * 60;
  if (h < 0) h += 360;
  return [h, max - min];
}

/** Colour of the opponent's half: always a deliberate contrast to ours. */
function opponentColour(ours: string): string {
  const [h, chroma] = hue(ours);
  if (chroma < 0.12) return "#a3292a"; // black / grey / white clubs → brick red
  if (h >= 185 && h < 265) return "#a3292a"; // blues → brick red
  if (h >= 265 && h < 330) return "#24262a"; // purples → charcoal
  return "#1d2a44"; // reds, oranges, yellows, greens → deep navy
}

/** Darkens (a touch desaturated, printed look) until cream text reads well on it. */
function printable(c: string): string {
  let out = c;
  for (let i = 0; i < 10 && luminance(out) > 0.15; i++) out = shade(out, -0.08);
  return out;
}

export function Duel({ data }: { data: RenderData }) {
  const { params, content: c, postType } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const ourColour = printable(base);
  const oppColour = opponentColour(ourColour);
  const clubName = (data.club?.name ?? "").toLowerCase();
  const weAreHome = c.home ?? ((c.awayTeam ?? "").toLowerCase() === clubName ? false : true);
  const ours = { name: (weAreHome ? c.homeTeam : c.awayTeam) || data.club?.name || "", crest: (weAreHome ? c.homeCrest : c.awayCrest) ?? data.club?.crestUrl };
  const opp = { name: (weAreHome ? c.awayTeam : c.homeTeam) || "OPPONENT", crest: weAreHome ? c.awayCrest : c.homeCrest };
  const isResult = postType === "result" && !!c.homeGoals && !!c.awayGoals;
  const ts = params.textScale ?? 1;

  // Halves: home on top.
  const topHalf = { y0: FRAME, y1: SPLIT };
  const botHalf = { y0: SPLIT, y1: CANVAS_H - FOOT };
  const ourHalf = weAreHome ? topHalf : botHalf;
  const oppHalf = weAreHome ? botHalf : topHalf;

  // Player side: the zig-zag of the reference (top player right, bottom player left), unless the photo
  // is cut on one side — then that side goes flush under the frame so the cut never shows.
  const cut = data.cut ?? {};
  const cutL = cut.left ?? 0;
  const cutR = cut.right ?? 0;
  const pSide: "left" | "right" = cutL > 0 || cutR > 0 ? (cutR > cutL ? "right" : "left") : weAreHome ? "right" : "left";
  const nSide: "left" | "right" = pSide === "left" ? "right" : "left";

  // Player box.
  const face = data.face;
  const aspect = data.photoAspect ?? 0.5;
  const bust = !!face && face[3] > 0.2;
  let box: Box;
  if (bust) {
    const h = Math.min(640, 215 / face![3]) * (params.playerScale ?? 1);
    const w = h * aspect;
    const fcx = (face![0] + face![2] / 2) * w;
    const cx = pSide === "left" ? 290 : CANVAS_W - 290;
    let left = cx - fcx;
    left = Math.min(Math.max(left, pSide === "left" ? FRAME - w * 0.25 : CANVAS_W - FRAME - w), pSide === "left" ? FRAME : CANVAS_W - FRAME - w * 0.75);
    const bottom = weAreHome ? SPLIT : CANVAS_H - FOOT + 4;
    box = { left: left + (params.playerX ?? 0), top: bottom - h + (params.playerY ?? 0), width: w, height: h };
  } else {
    const H = weAreHome ? 700 : 770;
    const bottom = weAreHome ? CANVAS_H - SPLIT - 105 : FOOT - (cut.bottom ? 30 : 8);
    box = figureBox(data, pSide === "left" ? 300 : CANVAS_W - 300, bottom, H);
    // Side cut: tuck that edge under the frame.
    if (cutL > 0 && pSide === "left") box = { ...box, left: FRAME - 6 + (params.playerX ?? 0) };
    if (cutR > 0 && pSide === "right") box = { ...box, left: CANVAS_W - FRAME + 6 - box.width + (params.playerX ?? 0) };
  }

  // Rough silhouette, used to keep text off the player (and always off the face).
  const [fx, fy, fw, fh] = face ?? [0.35, 0.05, 0.3, 0.12];
  const faceR: Rect = {
    x0: box.left + (fx - fw * 0.55) * box.width,
    x1: box.left + (fx + fw * 1.55) * box.width,
    y0: box.top + (fy - fh * 0.75) * box.height,
    y1: box.top + (fy + fh * 1.5) * box.height,
  };
  const body: Rect = bust
    ? { x0: box.left, x1: box.left + box.width, y0: faceR.y1 - 10, y1: box.top + box.height }
    : { x0: box.left + box.width * 0.06, x1: box.left + box.width * 0.94, y0: box.top + (fy + fh) * box.height, y1: box.top + box.height };
  const grow = (r: Rect, m: number): Rect => ({ x0: r.x0 - m, x1: r.x1 + m, y0: r.y0 - m, y1: r.y1 + m });
  const playerObs = [grow(faceR, 40), grow(body, bust ? 30 : 46)];

  // Opponent crest: tried in each free corner of the opponent half; the one leaving the biggest name wins.
  const crestSize = 250;
  // Info (matchday) or score (result) on the split, name side.
  const info = [c.date, c.venue, c.time].filter(Boolean).join("  ·  ").toUpperCase() || (c.subline ?? "").toUpperCase();
  const infoSize = Math.min(32, Math.floor(460 / Math.max(1, info.length) / 0.42));
  const who = `${c.firstName} ${c.lastName}${data.player.number ? ` #${data.player.number}` : ""}`;
  const ourNearSplit = weAreHome ? ourHalf.y1 : ourHalf.y0; // y of the split seen from our half
  const infoH = 94;
  const infoR: Rect = weAreHome
    ? { x0: nSide === "left" ? PAD : CANVAS_W - PAD - 520, x1: nSide === "left" ? PAD + 520 : CANVAS_W - PAD, y0: ourNearSplit - 24 - infoH, y1: ourNearSplit }
    : { x0: nSide === "left" ? PAD : CANVAS_W - PAD - 520, x1: nSide === "left" ? PAD + 520 : CANVAS_W - PAD, y0: ourNearSplit, y1: ourNearSplit + 24 + infoH };
  // Result: a cream stamp straddling the split, the score in the two halves' colours.
  const scoreW = 330;
  const scoreH = 196;
  const scoreLeft = nSide === "left" ? PAD - 4 : CANVAS_W - PAD + 4 - scoreW;
  // (plus the marker signature under / over it, on our side)
  const scoreR: Rect = {
    x0: scoreLeft - 16,
    x1: scoreLeft + scoreW + 16,
    y0: SPLIT - scoreH / 2 - 26 - (weAreHome ? 56 : 0),
    y1: SPLIT + scoreH / 2 + 26 + (weAreHome ? 0 : 56),
  };

  const fixed = [...playerObs, ...(isResult ? [scoreR] : [infoR])];
  const ourFit = fitName(ours.name, nSide, ourHalf.y0 + 46, ourHalf.y1 - 46, 300 * ts, fixed, weAreHome ? "top" : "bottom");
  const crestOptions = (["far", "near"] as const).flatMap((v) =>
    (["left", "right"] as const).map((hSide) => {
      const far = v === "far";
      const top = weAreHome === far ? oppHalf.y1 - 48 - crestSize : oppHalf.y0 + 50;
      const left = hSide === "left" ? PAD - 6 : CANVAS_W - PAD - crestSize + 6;
      return { x0: left, x1: left + crestSize, y0: top, y1: top + crestSize, pref: (hSide === nSide ? 2 : 0) + (far ? 1 : 0) };
    }),
  );
  const oppFor = (crest: Rect | null) => fitName(opp.name, pSide, oppHalf.y0 + 50, oppHalf.y1 - 46, 300 * ts, crest ? [...fixed, crest] : fixed, weAreHome ? "bottom" : "top");
  const options = opp.crest
    ? crestOptions.filter((r) => !fixed.some((o) => hits(r, o))).map((r) => ({ r, fit: oppFor(r) }))
    : [];
  // Score: bigger name, then the name hugging the outer edge of its half (no hole left there).
  const blockEnd = (f: Fit) => {
    const hgt = (f.lines.length * CAP + (f.lines.length - 1) * GAP) * f.size * f.stretch;
    return weAreHome ? oppHalf.y1 - (f.capTop + hgt) : f.capTop - oppHalf.y0;
  };
  const score = (o: { r: Rect & { pref: number }; fit: Fit }) => o.fit.size * Math.sqrt(o.fit.stretch) + o.r.pref * 4 - blockEnd(o.fit) * 0.2;
  const pick = options.sort((x, y) => score(y) - score(x))[0];
  const crestR: Rect = pick?.r ?? { x0: 0, x1: 0, y0: 0, y1: 0 };
  const oppFit = pick?.fit ?? oppFor(null);
  const crestLeft = crestR.x0;
  const crestTop = crestR.y0;

  // Marker strokes around the player.
  const fcx = box.left + (fx + fw / 2) * box.width;
  const fcy = box.top + (fy + fh / 2) * box.height;
  const fr = (fh * box.height) / 2;
  const by = (t: number) => box.top + t * box.height;
  const outer = pSide === "left" ? box.left : box.left + box.width;
  const inner = pSide === "left" ? box.left + box.width : box.left;
  const o = pSide === "left" ? -1 : 1; // direction away from the canvas centre
  const strokes: string[] = [];
  if (!bust) {
    if (!(pSide === "left" ? cutL : cutR)) {
      strokes.push(`M ${outer + o * 8} ${by(0.3)} C ${outer + o * 38} ${by(0.42)}, ${outer + o * 34} ${by(0.6)}, ${outer + o * 10} ${by(0.74)}`);
      strokes.push(`M ${outer + o * -8} ${by(0.62)} C ${outer + o * 18} ${by(0.72)}, ${outer + o * 14} ${by(0.84)}, ${outer + o * -16} ${by(0.93)}`);
    }
    if (!(pSide === "left" ? cutR : cutL)) {
      strokes.push(`M ${inner - o * 10} ${by(0.34)} C ${inner - o * 40} ${by(0.46)}, ${inner - o * 36} ${by(0.62)}, ${inner - o * 12} ${by(0.72)}`);
    }
  } else {
    strokes.push(`M ${faceR.x1 + 4} ${by(0.62)} C ${faceR.x1 + 36} ${by(0.7)}, ${faceR.x1 + 30} ${by(0.8)}, ${faceR.x1 + 8} ${by(0.88)}`);
  }
  const burst = [-160, -125, -90, -55, -20].map((a) => {
    const rad = (a * Math.PI) / 180;
    const r0 = fr * 1.7 + 6;
    const r1 = r0 + Math.min(40, fr * 0.6);
    return `M ${fcx + Math.cos(rad) * r0} ${fcy + Math.sin(rad) * r0} L ${fcx + Math.cos(rad) * r1} ${fcy + Math.sin(rad) * r1}`;
  });

  const crestC = { x: crestLeft + crestSize / 2, y: crestTop + crestSize / 2, r: crestSize * 0.6 };

  const nameLines = (fit: Fit, side: "left" | "right") =>
    fit.lines.map((l, i) => {
      const capTop = fit.capTop + i * fit.size * fit.stretch * (CAP + GAP);
      return (
        <div
          key={`${side}${i}`}
          style={{
            position: "absolute",
            [side]: PAD - fit.size * 0.012,
            top: capTop - (BASE - CAP) * fit.size * fit.stretch,
            transform: `scaleY(${fit.stretch})`,
            transformOrigin: "0 0",
            fontFamily: DISPLAY,
            fontSize: fit.size,
            lineHeight: `${fit.size}px`,
            color: CREAM,
            whiteSpace: "nowrap",
            filter: "url(#duel-press)",
          }}
        >
          {l}
        </div>
      );
    });

  const infoAnchor: CSSProperties = { position: "absolute", [nSide]: PAD, ...(weAreHome ? { bottom: CANVAS_H - ourNearSplit + 24 } : { top: ourNearSplit + 24 }) };
  const infoAlign = nSide;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: CREAM }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          {/* Letterpress: slightly uneven edges + a few ink-starved specks. */}
          <filter id="duel-press" x="-2%" y="-5%" width="104%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={2} seed={7} result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale={3} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={2} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -18 0 0 0 12.4" result="holes" />
            <feComposite in="d" in2="holes" operator="in" />
          </filter>
          <filter id="duel-wobble">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={4} />
            <feDisplacementMap in="SourceGraphic" scale={6} />
          </filter>
        </defs>
      </svg>

      {/* The two halves. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SPLIT, background: weAreHome ? ourColour : oppColour }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: SPLIT, bottom: 0, background: weAreHome ? oppColour : ourColour }} />
      <Paper color="transparent" strength={2.4} />

      {/* Opponent crest with a hand-drawn ring. */}
      {opp.crest && pick && (
        <img
          src={opp.crest}
          alt=""
          style={{ position: "absolute", left: crestLeft, top: crestTop, width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }}
        />
      )}

      {nameLines(oppFit, pSide)}
      {nameLines(ourFit, nSide)}

      {/* Score on the split (result). */}
      {isResult && (
        <div
          style={{
            position: "absolute",
            left: scoreLeft,
            top: SPLIT - scoreH / 2,
            width: scoreW,
            height: scoreH,
            background: CREAM,
            transform: `rotate(${nSide === "left" ? -3 : 3}deg)`,
            boxShadow: "0 14px 30px rgba(0,0,0,.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: INK,
          }}
        >
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 19, letterSpacing: "0.3em", lineHeight: 1, marginRight: "-0.3em" }}>RESULTADO FINAL</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: DISPLAY, fontSize: 120, lineHeight: 1, margin: "6px 0 2px" }}>
            <span style={{ color: weAreHome ? ourColour : oppColour, filter: "url(#duel-press)" }}>{c.homeGoals}</span>
            <span style={{ width: 30, height: 9, background: INK, borderRadius: 2 }} />
            <span style={{ color: weAreHome ? oppColour : ourColour, filter: "url(#duel-press)" }}>{c.awayGoals}</span>
          </div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 17, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.75, marginRight: "-0.24em" }}>
            {[c.date, c.subline].filter(Boolean)[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Info on the split. */}
      <div style={{ ...infoAnchor, ...(isResult ? (weAreHome ? { bottom: CANVAS_H - SPLIT + scoreH / 2 + 30 } : { top: SPLIT + scoreH / 2 + 30 }) : {}), textAlign: infoAlign, color: CREAM, display: "flex", flexDirection: weAreHome ? "column-reverse" : "column", alignItems: infoAlign === "left" ? "flex-start" : "flex-end", gap: 8 }}>
        {!isResult && <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: infoSize, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{info}</div>}
        <div style={{ fontFamily: MARKER, fontSize: 28, lineHeight: 1.1, opacity: 0.92, transform: `rotate(-2deg)`, whiteSpace: "nowrap" }}>{who}</div>
      </div>

      <GradedFigure data={data} box={box} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <g filter="url(#duel-wobble)" stroke={CREAM} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth={5}>
          {strokes.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {burst.map((d, i) => (
            <path key={`b${i}`} d={d} strokeWidth={4.5} />
          ))}
          {opp.crest && pick && (
            <path
              d={`M ${crestC.x + crestC.r * 0.25} ${crestC.y - crestC.r * 0.98} A ${crestC.r} ${crestC.r * 0.95} 0 1 1 ${crestC.x - crestC.r * 0.4} ${crestC.y - crestC.r * 0.9}`}
              strokeWidth={3.5}
              opacity={0.7}
            />
          )}
        </g>
      </svg>

      {/* Cream frame on top, so any cut edge of the photo tucks under it. */}
      <div style={{ position: "absolute", inset: 0, borderStyle: "solid", borderColor: CREAM, borderWidth: `${FRAME}px ${FRAME}px ${FOOT}px`, boxShadow: `inset 0 0 0 1px rgba(0,0,0,.08)` }} />
      <div
        style={{
          position: "absolute",
          left: FRAME + 10,
          right: FRAME + 10,
          bottom: 0,
          height: FOOT,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          color: INK,
          fontFamily: CONDENSED,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 20 }}>{c.kicker}</span>
        <AgencyLogo data={data} onLight height={26} />
        <span style={{ fontSize: Math.min(20, Math.floor(420 / Math.max(1, (c.subline ?? "").length) / 0.62)), justifySelf: "end" }}>{c.subline}</span>
      </div>
      <Film strength={1.1} />
    </div>
  );
}
