/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* A small 5×7 dot-matrix font (stadium LED board). Each glyph: 7 rows, "X" = lit dot.               */
/* ------------------------------------------------------------------------------------------------ */
const G: Record<string, string[]> = {
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  B: ["XXXX.", "X...X", "X...X", "XXXX.", "X...X", "X...X", "XXXX."],
  C: [".XXX.", "X...X", "X....", "X....", "X....", "X...X", ".XXX."],
  D: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."],
  E: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"],
  F: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "X...."],
  G: [".XXX.", "X...X", "X....", "X.XXX", "X...X", "X...X", ".XXXX"],
  H: ["X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  I: ["XXX", ".X.", ".X.", ".X.", ".X.", ".X.", "XXX"],
  J: ["..XXX", "...X.", "...X.", "...X.", "X..X.", "X..X.", ".XX.."],
  K: ["X...X", "X..X.", "X.X..", "XX...", "X.X..", "X..X.", "X...X"],
  L: ["X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"],
  M: ["X...X", "XX.XX", "X.X.X", "X.X.X", "X...X", "X...X", "X...X"],
  N: ["X...X", "X...X", "XX..X", "X.X.X", "X..XX", "X...X", "X...X"],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  Q: [".XXX.", "X...X", "X...X", "X...X", "X.X.X", "X..X.", ".XX.X"],
  R: ["XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"],
  S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  U: ["X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  V: ["X...X", "X...X", "X...X", "X...X", "X...X", ".X.X.", "..X.."],
  W: ["X...X", "X...X", "X...X", "X.X.X", "X.X.X", "X.X.X", ".X.X."],
  X: ["X...X", "X...X", ".X.X.", "..X..", ".X.X.", "X...X", "X...X"],
  Y: ["X...X", "X...X", ".X.X.", "..X..", "..X..", "..X..", "..X.."],
  Z: ["XXXXX", "....X", "...X.", "..X..", ".X...", "X....", "XXXXX"],
  "0": [".XXX.", "X...X", "X..XX", "X.X.X", "XX..X", "X...X", ".XXX."],
  "1": ["..X..", ".XX..", "..X..", "..X..", "..X..", "..X..", ".XXX."],
  "2": [".XXX.", "X...X", "....X", "...X.", "..X..", ".X...", "XXXXX"],
  "3": ["XXXXX", "...X.", "..X..", "...X.", "....X", "X...X", ".XXX."],
  "4": ["...X.", "..XX.", ".X.X.", "X..X.", "XXXXX", "...X.", "...X."],
  "5": ["XXXXX", "X....", "XXXX.", "....X", "....X", "X...X", ".XXX."],
  "6": ["..XX.", ".X...", "X....", "XXXX.", "X...X", "X...X", ".XXX."],
  "7": ["XXXXX", "....X", "...X.", "..X..", ".X...", ".X...", ".X..."],
  "8": [".XXX.", "X...X", "X...X", ".XXX.", "X...X", "X...X", ".XXX."],
  "9": [".XXX.", "X...X", "X...X", ".XXXX", "....X", "...X.", ".XX.."],
  ":": [".", "X", ".", ".", ".", "X", "."],
  ".": [".", ".", ".", ".", ".", ".", "X"],
  ",": [".", ".", ".", ".", ".", "X", "X"],
  "'": ["X", "X", ".", ".", ".", ".", "."],
  "!": ["X", "X", "X", "X", "X", ".", "X"],
  "·": [".", ".", ".", "X", ".", ".", "."],
  "-": ["...", "...", "...", "XXX", "...", "...", "..."],
  "/": ["....X", "...X.", "...X.", "..X..", ".X...", ".X...", "X...."],
  "&": [".XX..", "X..X.", "X.X..", ".X...", "X.X.X", "X..X.", ".XX.X"],
  " ": ["...", "...", "...", "...", "...", "...", "..."],
};
/** Accents as 2 dot rows above the letter (cedilla: 2 rows under it), 5 wide. */
const TOP_MARK: Record<string, string[]> = {
  "́": ["...X.", "..X.."],
  "̀": [".X...", "..X.."],
  "̂": ["..X..", ".X.X."],
  "̃": [".XX.X", "X..X."],
  "̈": [".....", ".X.X."],
  "̊": ["..X..", ".X.X."],
};
const CEDILLA = ["..X..", ".XX.."];

type Cell = { lit: [number, number][]; w: number };

/**
 * A line of text as lit dots on a grid (columns, rows). Diacritics are kept (exact names): marks sit two
 * rows above the letter (one row gap), a cedilla two rows under it.
 */
export function dotLine(text: string): { dots: [number, number][]; cols: number; rows: number; base: number } {
  const chars = [...text.toUpperCase().normalize("NFD")];
  const cells: { g: string[]; top?: string[]; bot?: string[] }[] = [];
  for (const ch of chars) {
    if (/\p{M}/u.test(ch)) {
      const last = cells[cells.length - 1];
      if (!last) continue;
      if (ch === "̧") last.bot = CEDILLA;
      else if (TOP_MARK[ch]) last.top = TOP_MARK[ch];
      continue;
    }
    cells.push({ g: G[ch] ?? G[" "] });
  }
  const hasTop = cells.some((c) => c.top);
  const hasBot = cells.some((c) => c.bot);
  const base = hasTop ? 3 : 0;
  const rows = base + 7 + (hasBot ? 2 : 0);
  const dots: [number, number][] = [];
  let x = 0;
  cells.forEach((c, i) => {
    const w = c.g[0].length;
    const put = (pat: string[], r0: number) =>
      pat.forEach((row, r) => {
        // A 5-wide mark over a narrower glyph: keep its middle columns.
        const off = Math.floor((row.length - w) / 2);
        for (let cx = 0; cx < w; cx++) if (row[cx + Math.max(0, off)] === "X") dots.push([x + cx, r0 + r]);
      });
    c.g.forEach((row, r) => {
      for (let cx = 0; cx < w; cx++) if (row[cx] === "X") dots.push([x + cx, base + r]);
    });
    if (c.top) put(c.top, 0);
    if (c.bot) put(c.bot, base + 7);
    x += w + (i < cells.length - 1 ? 1 : 0);
  });
  return { dots, cols: x, rows, base };
}

const AMBER = "#ffb84a";
const WARM_WHITE = "#fff4de";

export type LedRow = { text: string; pitch: number; color: string };

/** One row of the board: a full-width grid of dim "off" LEDs, the text lit and centred, with a faint glow. */
function LedBoardRow({ row, width, pitch, id }: { row: LedRow; width: number; pitch: number; id: string }) {
  const d = dotLine(row.text);
  const gridCols = Math.max(d.cols, Math.floor(width / pitch));
  const x0 = Math.floor((gridCols - d.cols) / 2);
  const left = (width - gridCols * pitch) / 2;
  const r = pitch * 0.38;
  const off: ReactNode[] = [];
  for (let gy = 0; gy < d.rows; gy++) for (let gx = 0; gx < gridCols; gx++) off.push(<circle key={`${gx}-${gy}`} cx={left + (gx + 0.5) * pitch} cy={(gy + 0.5) * pitch} r={r} />);
  return (
    <svg width={width} height={d.rows * pitch} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={id} x="-5%" y="-30%" width="110%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={pitch * 0.55} result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="#ffffff" opacity={0.075}>{off}</g>
      <g fill={row.color} filter={`url(#${id})`}>
        {d.dots.map(([gx, gy]) => (
          <circle key={`${gx}-${gy}`} cx={left + (x0 + gx + 0.5) * pitch} cy={(gy + 0.5) * pitch} r={r} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The shared frame of the natural LED looks: his photo full-bleed (real grass, stands, light; light grade
 * only) and one idea — a thin dark stadium LED strip with the word in amber dot-matrix, any further dot rows
 * under it, and one clean sans line at its foot. The strip sits across the top with his face placed below
 * it; with no headroom in the photo it moves to the foot. The NEYOD logo alone, clear of the strip and his
 * head.
 */
export function NatLedFrame({ data, rows, line }: { data: RenderData; rows: LedRow[]; line: { text: string; node: ReactNode } }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 60 : 48;
  const panelW = CANVAS_W - 2 * M;
  const padX = Math.round(24 * k);
  const padY = Math.round(20 * k);
  const inner = panelW - 2 * padX;
  const gapRow = Math.round(12 * k);

  const sized = rows
    .filter((r) => r.text.trim())
    .map((r) => {
      const d = dotLine(r.text);
      const pitch = Math.min(r.pitch * k * ts, inner / Math.max(1, d.cols));
      return { row: r, pitch, h: d.rows * pitch };
    });
  const { text: lineText, node: lineNode } = line;
  const lineSize = lineText ? Math.min(23 * k * ts, inner / Math.max(1, capsEm(lineText, 0.12))) : 0;
  const lineBlock = lineText ? Math.round(14 * k) + 1 + Math.round(14 * k) + lineSize : 0;
  const panelH = padY * 2 + sized.reduce((h, r, i) => h + r.h + (i ? gapRow : 0), 0) + lineBlock;

  /* ---- the strip at the top, his face below it; no headroom → the strip at the foot ---- */
  const top0 = (story ? STORY_TOP + 20 : 48) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 720 : 520, top0 + panelH + 70 + fs * 1.0), fs });
  const hairTop = place.fy - place.fs * 0.9;
  const upper = hairTop >= top0 + panelH + 24;
  const footBottom = (story ? STORY_BOTTOM - 10 : CANVAS_H - 48) - (params.textY ?? 0);
  const panelTop = upper ? top0 : footBottom - panelH;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) : story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  const tag = story ? "s" : "p";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The LED strip: a thin dark board, dim off-LEDs, the lit dots with a faint glow. */}
      <div
        style={{
          position: "absolute",
          left: M,
          top: panelTop,
          width: panelW,
          height: panelH,
          boxSizing: "border-box",
          padding: `${padY}px ${padX}px`,
          borderRadius: Math.round(10 * k),
          background: "linear-gradient(to bottom, rgba(14,15,14,.86), rgba(6,7,7,.9))",
          border: "1px solid rgba(255,255,255,.09)",
          boxShadow: "0 10px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)",
          display: "flex",
          flexDirection: "column",
          gap: gapRow,
        }}
      >
        {sized.map((r, i) => (
          <LedBoardRow key={i} row={r.row} width={inner} pitch={r.pitch} id={`led-${tag}-${i}`} />
        ))}
        {lineText && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: Math.round(14 * k) - gapRow }}>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,.12)", marginBottom: Math.round(14 * k) }} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.12em", whiteSpace: "nowrap", color: WARM_WHITE }}>{lineNode}</div>
          </div>
        )}
      </div>

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

export const LED_AMBER = AMBER;
export const LED_WHITE = WARM_WHITE;

/**
 * Natural · LED board (matchday): his own match photo full-bleed, and a thin stadium LED strip — "MATCHDAY"
 * in amber 5×7 dot-matrix with a faint glow, "25 OCT  15:00" in smaller warm-white dots under it, and the
 * fixture in a clean sans line (HOME v AWAY, exact names, home first). No score. NEYOD logo alone.
 */
export function Natled({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").replace(/’/g, "'").trim();
  const when = [fx.date, fx.kickoff].filter(Boolean).join("  ");
  const home = fx.homeName.toUpperCase();
  const away = fx.awayName.toUpperCase();
  const text = home && away ? `${home}  v  ${away}` : home || away;
  return (
    <NatLedFrame
      data={data}
      rows={[
        { text: word, pitch: 14, color: AMBER },
        { text: when, pitch: 7.5, color: WARM_WHITE },
      ]}
      line={{
        text,
        node:
          home && away ? (
            <>
              {home}
              <span style={{ color: AMBER, margin: "0 0.5em" }}>v</span>
              {away}
            </>
          ) : (
            text
          ),
      }}
    />
  );
}
