import type { ReactNode } from "react";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { ObjectRow } from "./natfree23";
import { dropped } from "./natfree26";
import { clubInk } from "./trend2";
import { GoalStack, Stack, goalOf, stackOf } from "./trend24";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const DARK = "#1b1f26";
const TEXT_SH = "0 2px 6px rgba(0,0,0,.35)";

/* ---------------- Arcade (Fluminense 2025/26 third kit, the Lapa Arches) ---------------- */

/**
 * The white double arcade of the Arcos da Lapa — drawn into Fluminense's 2025/26 Umbro third shirt, a love letter to
 * Rio — standing under a panel in his club's colour: a tier of small arches over a tier of tall ones, the photo seen
 * through every opening.
 */
function Arcade({ k, w }: { k: number; w: number }) {
  const h1 = 20 * k;
  const h2 = 42 * k;
  const pier = 8 * k;
  const holes = (n: number, y0: number, h: number) => {
    const bay = w / n;
    const ow = bay - pier;
    const r = ow / 2;
    return Array.from({ length: n }, (_, i) => {
      const x = i * bay + pier / 2;
      return `M ${x} ${y0 + h} L ${x} ${y0 + Math.min(r, h * 0.6)} A ${r} ${Math.min(r, h * 0.6)} 0 0 1 ${x + ow} ${y0 + Math.min(r, h * 0.6)} L ${x + ow} ${y0 + h} Z`;
    }).join(" ");
  };
  const band = 6 * k;
  const d = `M 0 0 L ${w} 0 L ${w} ${h1 + band + h2} L 0 ${h1 + band + h2} Z ${holes(16, 3 * k, h1 - 3 * k)} ${holes(8, h1 + band, h2)}`;
  return (
    <svg width={w} height={h1 + band + h2} style={{ display: "block", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.4))" }}>
      <path d={d} fill="#f6f4ee" fillRule="evenodd" />
    </svg>
  );
}

const arcadeH = (k: number) => 20 * k + 6 * k + 42 * k;

function ArcadePanel({ data, k, h, children }: { data: RenderData; k: number; h: number; children: ReactNode }) {
  return (
    <div style={{ width: W, display: "flex", flexDirection: "column" }}>
      <div style={{ height: h, borderRadius: `${22 * k}px ${22 * k}px 0 0`, background: clubInk(data), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{children}</div>
      <Arcade k={k} w={W} />
    </div>
  );
}

/** Arcada (matchday): MATCHDAY 14 between both crests, HOME X AWAY and the kick-off in white on a panel in his club's colour standing on the white Lapa arches. */
export function Arcadepanel({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const s = stackOf(d, k, ts, W - 110 * k);
  const ph = s.h + 2 * 24 * k;
  const h = ph + arcadeH(k);
  return (
    <Top data={d} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <ArcadePanel data={d} k={k} h={ph}>
          <Stack s={s} k={k} color="#fff" shadow={TEXT_SH} />
        </ArcadePanel>
      </Shade>
    </Top>
  );
}

/** Golo · arcada (goal): GOAL, his full name and exact club in white on the club-colour panel over the Lapa arches. */
export function Goalarcade({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const g = goalOf(d, k, ts, W - 120 * k, 104);
  const ph = g.h + 2 * 26 * k;
  const h = ph + arcadeH(k);
  return (
    <Top data={d} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <ArcadePanel data={d} k={k} h={ph}>
          <GoalStack g={g} k={k} color="#fff" shadow={TEXT_SH} />
        </ArcadePanel>
      </Shade>
    </Top>
  );
}

/* ---------------- Denim (Sampdoria 2025/26 third kit, the port's workwear) ---------------- */

const INDIGO = "#253a5e";
const THREAD = "#e2a447";

/**
 * A panel of indigo denim — Sampdoria's 2025/26 Macron third shirt took a denim look from Genoa's port, its sailors
 * and workwear: a fine diagonal twill, double rows of ochre topstitching, copper rivets and a small tab in his club's
 * colour stitched into the left seam. Type in white.
 */
function Denim({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const st = (inset: number) => (
    <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} rx={18 * k - inset / 2} fill="none" stroke={THREAD} strokeWidth={3 * k} strokeDasharray={`${10 * k} ${6 * k}`} strokeLinecap="round" />
  );
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 18 * k, background: INDIGO, boxShadow: "0 16px 38px rgba(0,0,0,.5)" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 18 * k, background: `repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0, rgba(255,255,255,.05) ${2 * k}px, rgba(0,0,0,0) ${2 * k}px, rgba(0,0,0,0) ${6 * k}px)` }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {st(14 * k)}
        {st(24 * k)}
        {[
          [40 * k, 40 * k],
          [w - 40 * k, 40 * k],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7 * k} fill="#c98a4a" stroke="#7a4a1e" strokeWidth={2 * k} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: -6 * k, top: h / 2 - 28 * k, width: 26 * k, height: 56 * k, borderRadius: 4 * k, background: clubInk(data), border: `${2 * k}px solid #fff`, boxSizing: "border-box" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>{children}</div>
    </div>
  );
}

/** Ganga (matchday): MATCHDAY 14 between both crests, HOME X AWAY and the kick-off in white on an indigo denim panel with ochre topstitching. */
export function Denimpanel({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const s = stackOf(d, k, ts, W - 130 * k);
  const h = s.h + 2 * 46 * k;
  return (
    <Top data={d} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <Denim data={d} k={k} w={W} h={h}>
          <Stack s={s} k={k} color="#fff" shadow={TEXT_SH} />
        </Denim>
      </Shade>
    </Top>
  );
}

/** Golo · ganga (goal): GOAL, his full name and exact club in white on the denim panel. */
export function Goaldenimpanel({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const g = goalOf(d, k, ts, W - 140 * k);
  const h = g.h + 2 * 48 * k;
  return (
    <Top data={d} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <Denim data={d} k={k} w={W} h={h}>
          <GoalStack g={g} k={k} color="#fff" shadow={TEXT_SH} />
        </Denim>
      </Shade>
    </Top>
  );
}

/* ---------------- Espresso (Napoli 2025/26 third kit, the city's coffee) ---------------- */

/** A Neapolitan espresso: white cup and saucer edged dark, a band in his club's colour, three bold curls of steam. */
function Espresso({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 140;
  return (
    <svg width={w} height={120 * s} viewBox="0 0 140 120" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      {[44, 62, 80].map((x) => (
        <path key={x} d={`M ${x} 40 C ${x - 10} 30, ${x + 10} 22, ${x} 10`} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      ))}
      <ellipse cx={64} cy={106} rx={58} ry={11} fill="#f4f5f7" stroke={DARK} strokeWidth={3.4} />
      <path d="M 104 62 Q 126 62 124 78 Q 122 92 100 90" fill="none" stroke="#f4f5f7" strokeWidth={9} strokeLinecap="round" />
      <path d="M 104 62 Q 126 62 124 78 Q 122 92 100 90" fill="none" stroke={DARK} strokeWidth={3} strokeLinecap="round" strokeOpacity={0.6} />
      <path d="M 22 48 L 106 48 L 100 88 Q 96 102 80 102 L 48 102 Q 32 102 28 88 Z" fill="#f4f5f7" stroke={DARK} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 24.5 62 L 103.5 62 L 101.3 76 L 26.7 76 Z" fill={ink} />
      <ellipse cx={64} cy={48} rx={42} ry={6} fill="#5a3a22" stroke={DARK} strokeWidth={3} />
    </svg>
  );
}

/** Café (matchday): a Neapolitan espresso with a band in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Espressocup({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (120 / 140)} gap={30 * k}>
      <Espresso data={d} w={w} />
    </ObjectRow>
  );
}
