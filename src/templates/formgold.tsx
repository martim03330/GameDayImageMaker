/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { formRecord, formStats, type FormGame } from "./formfire";
import { NatFigure, NatGround, natPlace } from "./natkit";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* Palette + type                                                                                    */
/* ------------------------------------------------------------------------------------------------ */

/** Warm champagne gold: a pale highlight at the top of the letters, the body, a deeper bronze foot. */
const GOLD_HI = "#F4E3B8";
const GOLD = "#D9B977";
const GOLD_LO = "#B48B4A";
/** Flat gold for small type (the gradient's upper body, so it reads small). */
const GOLD_TXT = "#E2C68A";
/** Warm off-white for the secondary text. */
const IVORY = "#F3EEE4";
const IVORY_DIM = "rgba(243,238,228,.62)";

/** Unbounded: a wide, rounded premium display face (loaded in layout.tsx). */
const WIDE = "var(--font-unbounded), sans-serif";
/** Unbounded cap height (em). */
const CAP = 0.75;

/** Advance widths of Unbounded caps / figures (em), measured in the browser (600 and 800). */
const W600: Record<string, number> = { "0": 0.917, "1": 0.507, "2": 0.823, "3": 0.83, "4": 0.846, "5": 0.799, "6": 0.849, "7": 0.74, "8": 0.883, "9": 0.849, A: 0.943, B: 0.874, C: 0.929, D: 0.919, E: 0.787, F: 0.763, G: 0.96, H: 0.931, I: 0.335, J: 0.799, K: 0.86, L: 0.757, M: 1.221, N: 0.963, O: 0.961, P: 0.805, Q: 0.961, R: 0.84, S: 0.833, T: 0.809, U: 0.874, V: 0.922, W: 1.349, X: 0.851, Y: 0.91, Z: 0.8, " ": 0.252, ".": 0.29, "’": 0.287, "'": 0.264, "/": 0.45, "·": 0.3, "–": 0.656, "+": 0.7 };
const W800: Record<string, number> = { "0": 0.935, "1": 0.536, "2": 0.85, "3": 0.85, "4": 0.88, "5": 0.817, "6": 0.867, "7": 0.769, "8": 0.905, "9": 0.867, A: 0.977, B: 0.895, C: 0.942, D: 0.936, E: 0.803, F: 0.781, G: 0.97, H: 0.947, I: 0.362, J: 0.815, K: 0.882, L: 0.772, M: 1.255, N: 0.983, O: 0.97, P: 0.825, Q: 0.971, R: 0.863, S: 0.857, T: 0.829, U: 0.884, V: 0.951, W: 1.375, X: 0.896, Y: 0.94, Z: 0.819, " ": 0.242, ".": 0.314, "’": 0.31, "'": 0.291, "/": 0.472, "·": 0.32, "–": 0.665, "+": 0.72 };
/** Width of a run of Unbounded caps at 1px, with the given tracking (em). */
const wideEm = (t: string, tracking = 0, heavy = false) => {
  const tb = heavy ? W800 : W600;
  const chars = [...t.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()];
  return chars.reduce((a, c) => a + (tb[c] ?? 0.85), 0) + chars.length * tracking;
};

const SHADOW = "0 1px 2px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/** Small tracked caps (Unbounded 500 by default). `right` puts the box's right edge at x. */
function Label({ text, x, top, size, color = IVORY, tracking = 0.28, weight = 500, font = WIDE, right, style }: { text: ReactNode; x: number; top: number; size: number; color?: string; tracking?: number; weight?: number; font?: string; right?: boolean; style?: CSSProperties }) {
  const pos: CSSProperties = right ? { right: CANVAS_W - x, marginRight: `-${tracking}em` } : { left: x };
  return (
    <div style={{ position: "absolute", top, ...pos, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: `${tracking}em`, whiteSpace: "pre", color, textShadow: SHADOW, fontVariantNumeric: "tabular-nums" }}>
      {text}
    </div>
  );
}

/**
 * Big Unbounded word / number, baseline-placed, in lit champagne gold (vertical gradient over the cap height,
 * a fine grain inside the letters, a soft warm glow around them) or in ivory (same grain, a fainter glow).
 */
function Lux({ text, x, baseline, size, id, tone = "gold", anchor = "start", weight = 800 }: { text: string; x: number; baseline: number; size: number; id: string; tone?: "gold" | "ivory"; anchor?: "start" | "end"; weight?: number }) {
  const y = size * 1.2;
  const gold = tone === "gold";
  return (
    <svg width={CANVAS_W} height={size * 1.6} style={{ position: "absolute", left: 0, top: baseline - y, overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1={y - size * CAP} x2="0" y2={y} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD_HI} />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_LO} />
        </linearGradient>
        <filter id={`${id}-f`} x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB">
          {/* grain, clipped to the letters, soft-lit into the fill */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="ng" />
          <feBlend in="ng" in2="SourceGraphic" mode="soft-light" result="b" />
          <feComposite in="b" in2="SourceAlpha" operator="in" result="bi" />
          <feComposite in="bi" in2="SourceGraphic" operator="arithmetic" k1="0" k2={gold ? 0.75 : 0.5} k3={gold ? 0.25 : 0.5} k4="0" result="tex" />
          {/* the warm glow: the letters themselves, blurred wide and faint */}
          <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.09} result="gb" />
          <feComponentTransfer in="gb" result="glow">
            <feFuncA type="linear" slope={gold ? 0.5 : 0.16} />
          </feComponentTransfer>
          {/* a soft dark lift under them */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={size * 0.035} result="sb" />
          <feOffset in="sb" dy={size * 0.02} result="so" />
          <feFlood floodColor="#000" floodOpacity="0.42" />
          <feComposite in2="so" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="glow" />
            <feMergeNode in="tex" />
          </feMerge>
        </filter>
      </defs>
      <text x={x} y={y} textAnchor={anchor} filter={`url(#${id}-f)`} style={{ fontFamily: WIDE, fontWeight: weight, fontSize: size, letterSpacing: "-0.02em", fill: gold ? `url(#${id}-g)` : IVORY, fontVariantNumeric: "tabular-nums" }}>
        {text}
      </text>
    </svg>
  );
}

/** A hairline (ivory at low opacity by default). */
function Hair({ x, y, w, color = "rgba(243,238,228,.18)", h = 1 }: { x: number; y: number; w: number; color?: string; h?: number }) {
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: color }} />;
}

/** Fine film grain over the photo (fixed seed, so every render is identical). */
function Grain({ W, H, id }: { W: number; H: number; id: string }) {
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none" }} aria-hidden>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter={`url(#${id})`} />
    </svg>
  );
}

const unit = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * Form carousel · gold: his real match photo barely touched (a little darker and warmer, soft vignette, fine
 * grain, he and his face sharp), a deep soft shade only where the type sits, and a quiet editorial layout in
 * Unbounded — big words and numbers in lit champagne gold (gradient + grain inside the letters + warm glow)
 * paired with ivory, small labels widely tracked. NEYOD logo top-left, "01 / 03" top-right.
 * 1 "IN / FORM" + name + "5 GOALS · 6 ASSISTS" · 2 big "6" GAMES UNBEATEN + the six games as a list · 3 a 2×2
 * grid of numbers + minutes per contribution.
 */
export function Formgold({ data }: { data: RenderData }) {
  const { params, content } = data;
  const slide = Math.min(3, Math.max(1, params.slide ?? 1));
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const M = 80;
  const IW = CANVAS_W - 2 * M;
  const s = formStats(data);
  const rec = formRecord(s);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const uid = `fg${slide}${story ? "s" : "p"}`;

  /* ---- frame ---- */
  const top = (story ? STORY_TOP : 72) - (params.textY ?? 0);
  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 84) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoTop = top - (params.logoY ?? 0);

  const F: Record<number, { fs: number; fy: number }> = story
    ? { 1: { fs: 220, fy: 560 }, 2: { fs: 150, fy: 450 }, 3: { fs: 200, fy: 520 } }
    : { 1: { fs: 160, fy: 360 }, 2: { fs: 96, fy: 228 }, 3: { fs: 140, fy: 330 } };
  const fx0 = params.side === "left" ? 420 : 640;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: F[slide].fy, fs: F[slide].fs });

  /* ---- the "01 / 03" marker, top-right, centred on the logo's height ---- */
  const mk = 20 * k;
  const marker = (
    <div style={{ position: "absolute", top: logoTop + (logoH - mk) / 2, right: M, marginRight: "-0.3em", fontFamily: WIDE, fontSize: mk, fontWeight: 500, lineHeight: 1, letterSpacing: "0.3em", color: IVORY_DIM, textShadow: SHADOW, whiteSpace: "pre" }}>
      <span style={{ color: GOLD_TXT, fontWeight: 600 }}>{String(slide).padStart(2, "0")}</span>
      {" / 03"}
    </div>
  );

  /* ---- slide block, stacked up from `bottom` ---- */
  let block: ReactNode = null;
  let blockTop = bottom;
  const kickSize = Math.min(22 * k * ts, IW / wideEm(name, 0.3));

  if (slide === 1) {
    const w1 = "IN";
    const w2 = "FORM";
    // One line, edge to edge: "IN" in ivory, "FORM" in gold.
    const size = Math.min(230 * ts, IW / wideEm(`${w1} ${w2}`, -0.02, true));
    const x2 = M + wideEm(`${w1} `, -0.02, true) * size;
    const statTxt = `${s.goals} ${unit(s.goals, "GOAL", "GOALS")}   ·   ${s.assists} ${unit(s.assists, "ASSIST", "ASSISTS")}`;
    const lastTxt = `LAST ${s.games} ${unit(s.games, "GAME", "GAMES")}`;
    let statSize = 28 * k * ts;
    let lastSize = 20 * k * ts;
    const need = wideEm(statTxt, 0.14) * statSize + wideEm(lastTxt, 0.3) * lastSize + 48 * k;
    if (need > IW) {
      statSize *= IW / need;
      lastSize *= IW / need;
    }
    const statTop = bottom - statSize * 0.88;
    const base = statTop - 58 * k;
    const kickTop = base - size * CAP - 52 * k - kickSize;
    blockTop = kickTop;
    const dot = <span style={{ color: GOLD_TXT }}>{"   ·   "}</span>;
    block = (
      <>
        <Label text={name} x={M} top={kickTop} size={kickSize} tracking={0.3} />
        <Lux text={w1} x={M - size * 0.04} baseline={base} size={size} id={`${uid}-a`} tone="ivory" />
        <Lux text={w2} x={x2 - size * 0.04} baseline={base} size={size} id={`${uid}-b`} />
        <Label
          text={
            <>
              <span style={{ color: GOLD_TXT, fontWeight: 700 }}>{s.goals}</span> {unit(s.goals, "GOAL", "GOALS")}
              {dot}
              <span style={{ color: GOLD_TXT, fontWeight: 700 }}>{s.assists}</span> {unit(s.assists, "ASSIST", "ASSISTS")}
            </>
          }
          x={M}
          top={statTop}
          size={statSize}
          tracking={0.14}
          weight={500}
        />
        <Label text={lastTxt} x={M + IW} right top={statTop + (statSize - lastSize) * 0.75} size={lastSize} color={GOLD_TXT} tracking={0.3} weight={600} />
      </>
    );
  } else if (slide === 2) {
    const games: FormGame[] = [...s.list].reverse(); // newest at the top
    const rowH = 58 * k;
    const foot = `${s.minutes} MINUTES  ·  ${s.wins}W ${s.draws}D ${s.losses}L`;
    const footSize = 20 * k * ts;
    // His name sits in the foot row, opposite the minutes (the cover's stats row rhythm) — or on its own line
    // under them when the row is too long for both at full size (stories).
    const nameFit = (IW - wideEm(foot, 0.28) * footSize - 48 * k) / wideEm(name, 0.28);
    const nameRow = nameFit < footSize * 0.85;
    const nameFoot = nameRow ? Math.min(footSize, IW / wideEm(name, 0.28)) : Math.min(footSize, nameFit);
    const footTop = bottom - footSize - (nameRow ? nameFoot + 20 * k : 0);
    const listBottom = footTop - 30 * k;
    const listTop = listBottom - rowH * games.length;
    const big = Math.min((story ? 280 : 212) * ts, (IW * 0.42) / wideEm(rec.big, -0.02, true));
    const bigBase = listTop - 50 * k;
    const bigW = wideEm(rec.big, -0.02, true) * big;
    const wordSize = Math.min(38 * k * ts, (IW - bigW - 40 * k) / Math.max(wideEm(rec.top, 0.02, true), wideEm(rec.bottom, 0.02, true)));
    blockTop = bigBase - big * CAP;
    const wx = M + bigW + 30 * k;
    const res = 24 * k * ts;
    const opp = 21 * k * ts;
    const score = 24 * k * ts;
    const small = 20 * k * ts;
    const R = M + IW; // right edge
    const scoreR = R - 120 * k;
    block = (
      <>
        <Lux text={rec.big} x={M - big * 0.03} baseline={bigBase} size={big} id={`${uid}-n`} />
        <Label text={rec.top} x={wx} top={bigBase - wordSize * CAP * 2 - 18 * k - wordSize * 0.13} size={wordSize} tracking={0.02} weight={700} />
        <Label text={rec.bottom} x={wx} top={bigBase - wordSize * CAP - wordSize * 0.13} size={wordSize} tracking={0.02} weight={700} color={GOLD_TXT} />
        <Hair x={M} y={listTop} w={IW} color="rgba(226,198,138,.5)" />
        {games.map((g, i) => {
          const y = listTop + i * rowH;
          const ga = [g.goals ? `${g.goals}G` : "", g.assists ? `${g.assists}A` : ""].filter(Boolean).join(" ") || "–";
          const o = g.opponent.toUpperCase();
          const oMax = scoreR - 150 * k - (M + 64 * k) - 20 * k;
          const os = Math.min(opp, oMax / wideEm(o, 0.08));
          const mid = (sz: number) => y + (rowH - sz) / 2 + sz * 0.02;
          return (
            <div key={i}>
              <Label text={g.result} x={M} top={mid(res)} size={res} tracking={0} weight={700} color={g.result === "L" ? IVORY_DIM : GOLD_TXT} />
              <Label text={o} x={M + 64 * k} top={mid(os)} size={os} tracking={0.08} weight={400} />
              <Label text={g.home ? "H" : "A"} x={scoreR - 150 * k} top={mid(small * 0.9)} size={small * 0.9} tracking={0.1} weight={500} color={IVORY_DIM} />
              <Label text={`${g.gf}–${g.ga}`} x={scoreR} right top={mid(score)} size={score} tracking={0.02} weight={600} />
              <Label text={ga} x={R} right top={mid(small)} size={small} tracking={0.08} weight={600} color={g.goals || g.assists ? GOLD_TXT : IVORY_DIM} />
              {i < games.length - 1 && <Hair x={M} y={y + rowH} w={IW} />}
            </div>
          );
        })}
        <Hair x={M} y={listBottom} w={IW} color="rgba(226,198,138,.5)" />
        <Label text={foot} x={M} top={footTop} size={footSize} tracking={0.28} color={IVORY_DIM} />
        {nameRow ? (
          <Label text={name} x={M} top={bottom - nameFoot} size={nameFoot} tracking={0.28} color={IVORY} />
        ) : (
          <Label text={name} x={M + IW} right top={footTop + (footSize - nameFoot) * 0.75} size={nameFoot} tracking={0.28} color={IVORY} />
        )}
      </>
    );
  } else {
    const cells = [
      { v: String(s.goals), l: unit(s.goals, "GOAL", "GOALS"), tone: "gold" as const },
      { v: String(s.assists), l: unit(s.assists, "ASSIST", "ASSISTS"), tone: "ivory" as const },
      { v: String(s.ga), l: "GOALS + ASSISTS", tone: "ivory" as const },
      { v: s.perMatch, l: "G/A PER MATCH", tone: "gold" as const },
    ];
    const colW = IW / 2;
    const lab = 20 * k * ts;
    const num = Math.min((story ? 190 : 150) * ts, ...cells.map((c) => (colW - 30 * k) / wideEm(c.v, -0.02, true)));
    const cellH = num * CAP + 26 * k + lab;
    const gapY = 64 * k;
    const footNum = 56 * k * ts;
    const hasFoot = s.minPerGa > 0;
    const footTop = bottom - footNum * CAP;
    const gridBottom = hasFoot ? footTop - 48 * k : bottom;
    const gridTop = gridBottom - (cellH * 2 + gapY);
    const kickTop = gridTop - 56 * k - kickSize;
    blockTop = kickTop;
    block = (
      <>
        <Label text={name} x={M} top={kickTop} size={kickSize} tracking={0.3} />
        {cells.map((c, i) => {
          const cx = M + (i % 2) * colW;
          const cy = gridTop + Math.floor(i / 2) * (cellH + gapY);
          const base = cy + num * CAP;
          return (
            <div key={c.l}>
              <Lux text={c.v} x={cx - num * 0.03} baseline={base} size={num} id={`${uid}-c${i}`} tone={c.tone} />
              <Label text={c.l} x={cx} top={base + 26 * k} size={lab} tracking={0.28} weight={500} color={IVORY} />
            </div>
          );
        })}
        {hasFoot && (
          <>
            <Hair x={M} y={footTop - 24 * k - 0} w={IW} color="rgba(226,198,138,.45)" />
            <Lux text={`${s.minPerGa}’`} x={M - footNum * 0.03} baseline={bottom} size={footNum} id={`${uid}-m`} weight={700} />
            <Label text="MINUTES PER CONTRIBUTION" x={M + wideEm(`${s.minPerGa}’`, -0.02) * footNum + 26 * k} top={bottom - lab * CAP - lab * 0.13} size={lab} tracking={0.28} color={IVORY} />
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0b0907", color: IVORY }}>
      {/* The photo, barely touched: a little darker and warmer. He on top a touch brighter, sharp. */}
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "brightness(.8) contrast(1.05) saturate(.92) sepia(.1)" }} />
      {/* The photo as it is, one even grade. */}
      {!place.frame.fig && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      {/* Soft vignette. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 75% at 55% 38%, rgba(0,0,0,0) 45%, rgba(8,6,3,.62) 100%)" }} />
      {/* A deep soft shade only under the type: the foot block, and a thin one under the header. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - blockTop + 280 * k, background: "linear-gradient(to top, rgba(9,7,4,.9), rgba(9,7,4,.84) 45%, rgba(9,7,4,.56) 75%, rgba(9,7,4,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + logoH + 120 * k, background: "linear-gradient(to bottom, rgba(9,7,4,.5), rgba(9,7,4,0))" }} />
      <Grain W={CANVAS_W} H={H} id={`${uid}-grain`} />

      {marker}
      {block}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: M, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}
