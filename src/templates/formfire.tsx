/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { NatFigure, NatGround, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData, type RenderMatch } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* Form numbers (shared by the form carousel looks)                                                  */
/* ------------------------------------------------------------------------------------------------ */

export type FormGame = { opponent: string; home: boolean; gf: number; ga: number; goals: number; assists: number; minutes: number; result: "W" | "D" | "L" };

export type FormStats = {
  games: number;
  goals: number;
  assists: number;
  ga: number;
  /** G/A per match, 1 decimal ("1.8"). */
  perMatch: string;
  minutes: number;
  /** Minutes per goal contribution (0 when none). */
  minPerGa: number;
  wins: number;
  draws: number;
  losses: number;
  /** Games without a loss, counted from the newest. */
  unbeaten: number;
  /** Games won in a row, counted from the newest. */
  winRun: number;
  /** Oldest → newest (reads left to right like a run). */
  list: FormGame[];
};

export function formStats(data: RenderData): FormStats {
  const n = Math.max(1, Math.round(data.params.formGames ?? 6));
  const recent: RenderMatch[] = (data.matches ?? []).slice(0, n);
  const list: FormGame[] = recent.map((m) => ({
    opponent: (m.opponent || "").trim(),
    home: m.home,
    gf: m.goalsFor,
    ga: m.goalsAgainst,
    goals: m.goals || 0,
    assists: m.assists || 0,
    minutes: m.minutes || 0,
    result: m.goalsFor > m.goalsAgainst ? "W" : m.goalsFor < m.goalsAgainst ? "L" : "D",
  }));
  const games = list.length;
  const goals = list.reduce((s, g) => s + g.goals, 0);
  const assists = list.reduce((s, g) => s + g.assists, 0);
  const minutes = list.reduce((s, g) => s + g.minutes, 0);
  const ga = goals + assists;
  let unbeaten = 0;
  for (const g of list) {
    if (g.result === "L") break;
    unbeaten++;
  }
  let winRun = 0;
  for (const g of list) {
    if (g.result !== "W") break;
    winRun++;
  }
  return {
    games,
    goals,
    assists,
    ga,
    perMatch: games ? (ga / games).toFixed(1) : "0.0",
    minutes,
    minPerGa: ga ? Math.round(minutes / ga) : 0,
    wins: list.filter((g) => g.result === "W").length,
    draws: list.filter((g) => g.result === "D").length,
    losses: list.filter((g) => g.result === "L").length,
    unbeaten,
    winRun,
    list: [...list].reverse(),
  };
}

/** The record slide's headline: the current unbeaten / winning run, else the wins, else the contributions. */
export function formRecord(s: FormStats): { big: string; top: string; bottom: string; topic: string } {
  if (s.games && s.winRun === s.games) return { big: String(s.games), top: s.games === 1 ? "WIN" : "WINS", bottom: "IN A ROW", topic: "PERFECT RECORD" };
  if (s.unbeaten >= 2) return { big: String(s.unbeaten), top: "GAMES", bottom: "UNBEATEN", topic: "UNBEATEN RUN" };
  if (s.wins) return { big: String(s.wins), top: s.wins === 1 ? "WIN" : "WINS", bottom: `IN ${s.games} GAMES`, topic: "THE RECORD" };
  return { big: String(s.ga), top: "GOAL", bottom: "CONTRIBUTIONS", topic: "THE RECORD" };
}

/** "#12406b" → [r, g, b] (0..255). */
export function hexRgb(hex: string): [number, number, number] {
  const h = (hex || "#000").replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0) as [number, number, number];
}

/** Relative luminance (0..1). */
export function luminance(hex: string): number {
  const [r, g, b] = hexRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The colour mixed toward white until it reads on a dark ground. */
export function brightOnDark(hex: string, min = 0.2): string {
  const [r, g, b] = hexRgb(hex);
  for (let t = 0; t <= 1.001; t += 0.05) {
    const c = [r, g, b].map((v) => Math.round(v + (255 - v) * t));
    const out = `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    if (luminance(out) >= min) return out;
  }
  return "#ffffff";
}

/* ------------------------------------------------------------------------------------------------ */
/* Formfire                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

const HEAVY = "var(--font-archivo-black), 'Arial Black', Impact, sans-serif";
/** Archivo Black: cap height (em). */
const CAPH = 0.72;
const WHITE = "#f5f3ee";

/** Rough advance of Archivo Black caps / digits at 1px. */
function heavyEm(text: string): number {
  const W: Record<string, number> = { I: 0.36, J: 0.6, M: 0.98, W: 1.08, F: 0.66, L: 0.62, E: 0.68, T: 0.7, P: 0.74, S: 0.72, Z: 0.7, ".": 0.32, " ": 0.26, "/": 0.42, "-": 0.44, "1": 0.56 };
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) em += W[ch] ?? (/[0-9]/.test(ch) ? 0.72 : 0.8);
  return em;
}

const SHADOW = "0 0 2px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.55)";

function Caps({ text, x, top, size, color, tracking = 0.2, align = "left", weight = 700, style }: { text: string; x: number; top: number; size: number; color: string; tracking?: number; align?: "left" | "right" | "center"; weight?: number; style?: CSSProperties }) {
  const pos: CSSProperties = align === "left" ? { left: x } : align === "right" ? { right: CANVAS_W - x } : { left: x, transform: "translateX(-50%)" };
  return (
    <div style={{ position: "absolute", top, ...pos, fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: `${tracking}em`, whiteSpace: "nowrap", color, textShadow: SHADOW, ...style }}>
      {text}
    </div>
  );
}

function Heavy({ text, x, capTop, size, color, align = "left", glow }: { text: string; x: number; capTop: number; size: number; color: string; align?: "left" | "right"; glow?: string }) {
  const pos: CSSProperties = align === "left" ? { left: x } : { right: CANVAS_W - x };
  return (
    <div
      style={{
        position: "absolute",
        // The line box is 1em; Archivo Black's cap top sits ~0.17em below the box top.
        top: capTop - size * 0.17,
        ...pos,
        fontFamily: HEAVY,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        color,
        textShadow: `0 4px 30px ${glow ?? "rgba(0,0,0,.45)"}`,
      }}
    >
      {text}
    </div>
  );
}

/**
 * Form carousel · fire: a dark cinematic edit of his match photo (the ground graded down, a soft vignette, he
 * stays sharp and a touch brighter), a header row of three small caps items, and on each slide one bold idea
 * in a heavy grotesque: 1 "IN / FORM" (second line in the club accent) + the key line, 2 the run as a big
 * number + six W/D/L marks, 3 the numbers grid. The NEYOD logo alone at the foot.
 */
export function Formfire({ data, gold }: { data: RenderData; gold?: boolean }) {
  const { params, content } = data;
  const slide = params.slide ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const M = story ? 72 : 64;
  const maxW = CANVAS_W - 2 * M;
  // `gold`: the welcome post's discreet sand gold instead of the club colour (Formfiregold).
  const accent = gold ? "#cdb98f" : brightOnDark(params.accent || params.primary || "#2c88dd", 0.2);
  const s = formStats(data);
  const rec = formRecord(s);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const lastN = `LAST ${s.games} GAMES`;
  const club = (data.club?.name ?? "").toUpperCase();

  /* ---- frame: his face high, the type in the lower part ---- */
  const top = (story ? STORY_TOP : 58) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (story ? STORY_BOTTOM : CANVAS_H - 52) - logoH - (params.logoY ?? 0);
  const fs = story ? 210 : 160;
  const fx0 = params.side === "left" ? 400 : params.side === "right" ? 680 : 540;
  const fy0 = slide === 2 ? (story ? 520 : 330) : story ? 560 : 370;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: fy0, fs: slide === 2 ? fs * (story ? 0.95 : 0.8) : fs });

  /* ---- header: three small caps items ---- */
  const topic = slide === 1 ? "IN FORM" : slide === 2 ? rec.topic : "GOAL CONTRIBUTIONS";
  const hSize = Math.min(19 * k * ts, ...[name, topic, lastN].map((t) => (maxW / 3 - 26) / Math.max(1, capsEm(t, 0.2))));
  const header: ReactNode = (
    <>
      <Caps text={name} x={M} top={top} size={hSize} color={WHITE} />
      <Caps text={topic} x={CANVAS_W / 2} top={top} size={hSize} color={accent} align="center" />
      <Caps text={lastN} x={CANVAS_W - M} top={top} size={hSize} color={WHITE} align="right" />
    </>
  );

  /* ---- the slide's block, stacked up from just above the logo (gap ≥ 64) ---- */
  const blockBottom = logoTop - (story ? 72 : 64);
  let block: ReactNode = null;

  if (slide === 1) {
    const l1 = "IN";
    const l2 = "FORM";
    const size = Math.min((story ? 360 : 300) * ts, (maxW + 6) / heavyEm(l2));
    const lead = size * 0.9;
    const key = `${s.goals} ${s.goals === 1 ? "GOAL" : "GOALS"}  ·  ${s.assists} ${s.assists === 1 ? "ASSIST" : "ASSISTS"}`;
    const keySize = Math.min(30 * k * ts, maxW / Math.max(1, capsEm(key, 0.16)));
    const keyTop = blockBottom - keySize;
    const cap2 = keyTop - 40 * k - size * CAPH;
    const cap1 = cap2 - lead;
    block = (
      <>
        {club && <Caps text={club} x={M + 6} top={cap1 - 50 * k} size={Math.min(20 * k * ts, maxW / Math.max(1, capsEm(club, 0.2)))} color={accent} tracking={0.2} weight={800} />}
        {/* Optically on the same left edge as the club line and the key line (Archivo Black's I / F carry
            ~0.08em of side bearing; user, 22/10). */}
        <Heavy text={l1} x={M + 8 - size * 0.083} capTop={cap1} size={size} color={WHITE} />
        <Heavy text={l2} x={M + 8 - size * 0.077} capTop={cap2} size={size} color={accent} glow="rgba(0,0,0,.5)" />
        <Caps text={key} x={M + 6} top={keyTop} size={keySize} color={WHITE} tracking={0.16} weight={800} />
      </>
    );
  } else if (slide === 2) {
    const big = Math.min((story ? 470 : 390) * ts, (maxW * 0.5) / heavyEm(rec.big));
    const bigW = heavyEm(rec.big) * big;
    const wordX = M + bigW + 34 * k;
    const word = Math.min(78 * k * ts, (CANVAS_W - M - wordX) / Math.max(heavyEm(rec.top), heavyEm(rec.bottom)));
    // Simpler (user, 22/10): no kicker above the number, no summary line — the marks say it. Marks a bit smaller.
    const mark = Math.min(92 * k, (maxW - 5 * 26 * k) / 6);
    const markGap = Math.min(30 * k, (maxW - mark * 6) / 5);
    const marksTop = blockBottom - mark;
    const bigCap = marksTop - 56 * k - big * CAPH;
    const wordCap1 = bigCap + big * CAPH - word * CAPH * 2 - word * 0.26;
    block = (
      <>
        <Heavy text={rec.big} x={M - big * 0.03} capTop={bigCap} size={big} color={WHITE} />
        <Heavy text={rec.top} x={wordX} capTop={wordCap1} size={word} color={WHITE} />
        <Heavy text={rec.bottom} x={wordX} capTop={wordCap1 + word * CAPH + word * 0.26} size={word} color={accent} />
        {s.list.map((g, i) => {
          const win = g.result === "W";
          const loss = g.result === "L";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: M + i * (mark + markGap),
                top: marksTop,
                width: mark,
                height: mark,
                boxSizing: "border-box",
                borderRadius: 6 * k,
                background: win ? accent : loss ? "rgba(0,0,0,.55)" : "rgba(255,255,255,.06)",
                border: win ? "none" : `${3 * k}px solid ${loss ? "rgba(245,243,238,.45)" : WHITE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: HEAVY,
                fontSize: mark * 0.46,
                color: win ? "#0b0d10" : WHITE,
                boxShadow: "0 6px 24px rgba(0,0,0,.35)",
              }}
            >
              {g.result}
            </div>
          );
        })}
      </>
    );
  } else {
    const cells = [
      { v: String(s.goals), l: s.goals === 1 ? "GOAL" : "GOALS", c: accent },
      { v: String(s.assists), l: s.assists === 1 ? "ASSIST" : "ASSISTS", c: WHITE },
      { v: String(s.ga), l: "GOAL CONTRIBUTIONS", c: WHITE },
      { v: s.perMatch, l: "G/A PER MATCH", c: accent },
    ];
    const colW = maxW / 2;
    const num = Math.min((story ? 250 : 200) * ts, ...cells.map((c) => (colW - 30) / heavyEm(c.v)));
    const lab = 21 * k * ts;
    const rowH = num * CAPH + 22 * k + lab;
    const rowGap = 70 * k;
    const foot = s.minPerGa ? `${s.minutes} MINUTES  ·  A GOAL CONTRIBUTION EVERY ${s.minPerGa}'` : `${s.minutes} MINUTES`;
    const footSize = Math.min(19 * k * ts, maxW / Math.max(1, capsEm(foot, 0.18)));
    const footTop = blockBottom - footSize;
    const rule = footTop - 30 * k;
    const row2 = rule - 40 * k - rowH;
    const row1 = row2 - rowGap - rowH;
    block = (
      <>
        {cells.map((c, i) => {
          const right = i % 2 === 1;
          const capTop = i < 2 ? row1 : row2;
          const x = right ? CANVAS_W - M : M;
          return (
            <div key={c.l}>
              <Heavy text={c.v} x={right ? x + num * 0.02 : x - num * 0.03} capTop={capTop} size={num} color={c.c} align={right ? "right" : "left"} />
              <Caps text={c.l} x={right ? x : x + 4} top={capTop + num * CAPH + 22 * k} size={lab} color={WHITE} tracking={0.2} align={right ? "right" : "left"} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: M, width: maxW, top: row2 - rowGap / 2, height: 2, background: "rgba(245,243,238,.22)" }} />
        <div style={{ position: "absolute", left: M, width: maxW, top: rule, height: 2, background: "rgba(245,243,238,.22)" }} />
        <Caps text={foot} x={M} top={footTop} size={footSize} color="rgba(245,243,238,.85)" tracking={0.18} />
      </>
    );
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0b0c0e", color: WHITE }}>
      {/* The photo graded down (cinematic), he a touch brighter on top so he stays the subject. */}
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "brightness(.74) contrast(1.06) saturate(.9)" }} />
      {/* The photo as it is, one even grade (user, 22/10: no subject highlight — it looked off and lost quality). */}
      {!place.frame.fig && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      {/* Soft vignette + shade under the header and the type. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 70% at 50% 38%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 220, background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.62, background: "linear-gradient(to top, rgba(6,7,9,.94), rgba(6,7,9,.78) 38%, rgba(6,7,9,.3) 72%, rgba(6,7,9,0))" }} />

      {header}
      {block}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/** The same carousel in the welcome post's discreet sand gold (more exclusive). */
export const Formfiregold = ({ data }: { data: RenderData }) => <Formfire data={data} gold />;
