/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Barlow Condensed 800 (upright): cap height and the advance of each glyph (em). */
const CAP = 0.7;
const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-' ";
const ADV = "51 47 45 47 42 41 46 47 22 44 49 42 56 51 47 47 47 48 44 45 47 50 70 49 48 41 46 33 44 44 45 44 45 41 45 45 19 19 30 18 20".split(" ").map((n) => Number(n) / 100);
/** Tracking of the stack lines (em). */
const TRACK = 0.005;
/** Line step of the stack (em): tight, like a poster index. */
const STEP = 0.84;

/** Width of a stack line at 1px. */
export function stackEm(text: string): number {
  const letters = [...text.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()];
  return letters.reduce((a, c) => a + (ADV[ORDER.indexOf(c)] ?? 0.5), 0) + (letters.length - 1) * TRACK;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** "25 OCT" → "25.10". */
export function dotDate(date: string): string {
  const m = date.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  const i = MONTHS.indexOf(m[2]);
  return i < 0 ? "" : `${m[1].padStart(2, "0")}.${String(i + 1).padStart(2, "0")}`;
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

export type StackSmall = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural stack looks: his photo full-bleed (real grass, stands, light) and one
 * typographic idea — a left-aligned stack of short bold condensed caps lines, like a poster index, white
 * with the natural looks' double shadow, a couple of small sans lines under it. Three layouts, picked from
 * where his face really lands (natPlace): the stack in the upper corner beside his head (he stands on the
 * other side); the stack above his head across the width; or, with no room up there, the stack at the
 * lower-left over the grass. The NEYOD logo alone, clear of the type.
 */
export function NatStackFrame({ data, lines, small }: { data: RenderData; lines: string[]; small: StackSmall[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = W - 2 * M;
  const big = lines.filter(Boolean);
  const em = Math.max(1, ...big.map(stackEm));
  const smallGap = 12 * k;
  const under = 30 * k;
  const sizeSmall = (w: number) =>
    small.filter((l) => l.text).map((l) => ({ ...l, px: Math.min(l.size * k * ts, w / Math.max(1, capsEm(l.text, l.tracking))) }));
  const blockH = (size: number, w: number) => {
    const s = sizeSmall(w);
    return size * CAP + (big.length - 1) * size * STEP + (s.length ? under + s.reduce((h, l, i) => h + l.px + (i ? smallGap : 0), 0) : 0);
  };

  const topCap = (story ? STORY_TOP + 8 : 84) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const size0 = (story ? 200 : 150) * ts;
  const fs = story ? 236 : 150;
  const flip = params.side === "left"; // he stands on the left: the stack goes to the right column

  /* ---- the size the stack can take in a box `avail` tall and `w` wide ---- */
  const lineSpan = CAP + (big.length - 1) * STEP;
  const fitIn = (avail: number, w: number) => {
    const s = sizeSmall(w);
    const extra = s.length ? under + s.reduce((h, l, i) => h + l.px + (i ? smallGap : 0), 0) : 0;
    return Math.min(size0, w / em, (avail - extra) / lineSpan);
  };

  /* ---- 1. beside: the stack in the upper corner, his head on the other side ---- */
  const fxB = story ? 760 : 740;
  const placeB = natPlace(data, W, H, { fx: flip ? W - fxB : fxB, fy: story ? 640 : 430, fs });
  const headEdge = flip ? W - (placeB.fx + 0.62 * placeB.fs) : placeB.fx - 0.62 * placeB.fs;
  const colB = Math.min(maxW, headEdge - 40 - M);
  // A column narrower than his shoulders may run down past his chin; otherwise it ends by his chin.
  const clearOfShoulders = M + colB < (flip ? W - (placeB.fx + 1.5 * placeB.fs) : placeB.fx - 1.5 * placeB.fs);
  const sB = colB > 0 ? fitIn((clearOfShoulders ? H * 0.58 : placeB.fy + 0.5 * placeB.fs) - topCap, colB) : 0;

  /* ---- 2. above: across the width over his head (his hair never under it) ---- */
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const placeA = natPlace(data, W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, topCap + fitIn(9999, maxW) * lineSpan + 140 + fs * 0.75), fs });
  const sA = fitIn(placeA.fy - 0.8 * placeA.fs - 30 - topCap, maxW);

  /* ---- 3. foot: at the lower-left over the grass, under his face ---- */
  const sF = fitIn(footBottom - (placeA.fy + 0.8 * placeA.fs) - 30, maxW);

  const ok = size0 * 0.62;
  let mode: "beside" | "above" | "foot";
  let size: number;
  let colWidth: number;
  let place: NatPlace;
  if (sB >= ok && sB * 1.12 >= sA) [mode, size, colWidth, place] = ["beside", sB, colB, placeB];
  else if (sA >= ok) [mode, size, colWidth, place] = ["above", sA, maxW, placeA];
  else [mode, size, colWidth, place] = ["foot", Math.max(sF, Math.min(size0 * 0.7, maxW / em)), maxW, placeA];
  const smalls = sizeSmall(colWidth);
  const bh = blockH(size, colWidth);
  const capTop = mode === "foot" ? footBottom - bh : topCap;
  const stackW = em * size;
  // Right column (he stands on the left): the stack keeps its left alignment, flush to the right margin.
  const rightCol = (mode === "beside" && flip) || (mode === "foot" && place.fx < W / 2 - 60);
  const left = rightCol ? W - M - Math.max(stackW, ...smalls.map((l) => capsEm(l.text, l.tracking) * l.px)) : M;
  const baselines = big.map((_, i) => capTop + size * CAP + i * size * STEP);
  let y = baselines[baselines.length - 1] + under;
  const placed = smalls.map((l) => {
    const top = y;
    y += l.px + smallGap;
    return { ...l, top };
  });
  const typeBottom = capTop + bh;

  const logoTop = mode !== "foot" ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  // Beside: the logo at the foot of the stack's own column; above: centred at the foot; foot: the top corner away from his head.
  const logoLeft = mode === "beside" ? (flip ? W - M - logoW : M) : mode === "above" ? (W - logoW) / 2 : place.fx > W / 2 ? M : W - M - logoW;

  const typeShade =
    mode === "foot"
      ? { top: capTop - (story ? 300 : 230), bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.3) 45%, rgba(0,0,0,.5))" }
      : { top: 0, height: typeBottom + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.26) 55%, rgba(0,0,0,0))" };
  // Beside / foot: a soft shade along the stack's own side too (the stack may cross a white kit).
  const sideShade =
    mode === "beside"
      ? { top: 0, height: typeBottom + (story ? 260 : 200), background: `linear-gradient(to ${flip ? "left" : "right"}, rgba(0,0,0,.26), rgba(0,0,0,0) 55%)` }
      : mode === "foot"
        ? { top: capTop - (story ? 240 : 180), bottom: 0, background: `linear-gradient(to ${rightCol ? "left" : "right"}, rgba(0,0,0,.34), rgba(0,0,0,.12) 50%, rgba(0,0,0,0) 75%)` }
        : null;
  const logoShade =
    mode !== "foot"
      ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
      : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  const fid = story ? "nst-soft-s" : "nst-soft";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}

      {/* A soft local shade where the type sits and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      {sideShade && <div style={{ position: "absolute", left: 0, right: 0, ...sideShade }} />}
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The stack: short bold condensed caps lines, tight, left-aligned. */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={fid} x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <g filter={`url(#${fid})`} style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: size, letterSpacing: `${TRACK}em`, fill: "#ffffff" }}>
          {big.map((t, i) => (
            <text key={i} x={left - size * 0.03} y={baselines[i]}>
              {t}
            </text>
          ))}
        </g>
      </svg>
      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: left + 2 * k, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, textShadow: SMALL_SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/** "MATCHDAY" → ["MATCH", "DAY"]; other kickers split on their spaces. */
export function kickerLines(kicker: string | undefined, fallback: string): string[] {
  const raw = (kicker || fallback).replace(/’/g, "'").trim().toUpperCase();
  if (raw === "MATCHDAY" || raw === "MATCH DAY") return ["MATCH", "DAY"];
  return raw.split(/\s+/).filter(Boolean);
}

/**
 * Natural · stack (matchday): his own match photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: a left-aligned stack of short bold condensed caps, like a poster index:
 * MATCH / DAY / 25.10 / 15:00. Under it, small: the home club, then "v" the away club (exact names, home
 * first). The NEYOD logo alone at the foot.
 */
export function Natstack({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const date = dotDate(fx.date);
  const home = fx.homeName.toUpperCase();
  const away = fx.awayName.toUpperCase();
  return (
    <NatStackFrame
      data={data}
      lines={[...kickerLines(data.content.kicker, "MATCHDAY"), date, fx.kickoff]}
      small={[
        { text: home, size: 26, weight: 700, tracking: 0.1 },
        { text: away ? `v  ${away}` : "", size: 26, weight: 700, tracking: 0.1 },
      ]}
    />
  );
}
