/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { shade, vivid } from "@/lib/color";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { ObjectRow } from "./natfree23";
import { dropped } from "./natfree26";
import { SANS } from "./shared";
import { clubInk } from "./trend2";
import { GoalStack, goalOf } from "./trend24";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const DARK = "#1b1f26";
const SHADOW = "drop-shadow(0 8px 18px rgba(0,0,0,.45))";
const GOLD = "#e7c66b";

const ourCrest = (data: RenderData) => {
  const fx = natFixture(data);
  return (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
};

/* ---------------- Passport (Puma's 2026 Switzerland home kit, the Swiss passport) ---------------- */

/**
 * A passport, the away-day document: a cover in a deep shade of his club's colour, the crest and PASSPORT in gold,
 * the biometric-chip mark at the foot — after Puma's 2026 Switzerland home shirt, patterned after the Swiss passport.
 */
function Passport({ data, w }: { data: RenderData; w: number }) {
  const cover = shade(clubInk(data), -0.45);
  const s = w / 100;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 136 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={136 * s} viewBox="0 0 100 136" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={10} y={4} width={88} height={128} rx={8} fill="#f1ede2" stroke={DARK} strokeWidth={2} />
        <rect x={2} y={2} width={90} height={132} rx={8} fill={cover} stroke="#fff" strokeWidth={3.4} />
        <rect x={34} y={108} width={26} height={16} rx={3} fill="none" stroke={GOLD} strokeWidth={3} />
        <circle cx={47} cy={116} r={4} fill="none" stroke={GOLD} strokeWidth={2.6} />
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 27 * s, top: 34 * s, width: 40 * s, height: 44 * s, objectFit: "contain", filter: "drop-shadow(0 0 1.5px rgba(255,255,255,.8))" }} />}
      <div style={{ position: "absolute", left: 2 * s, width: 90 * s, top: 14 * s, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 11 * s, letterSpacing: "0.14em", paddingLeft: "0.14em", color: GOLD }}>PASSPORT</div>
    </div>
  );
}

/** Passaporte (matchday): a passport in a deep shade of his club's colour with the crest in gold beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Passportcover({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 140 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * 1.36} gap={36 * k}>
      <Passport data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Umbrella (Manchester City's 2025/26 "rain or shine" third kit) ---------------- */

/** An open umbrella, panels alternating his club's colour and white, a dark J handle — rain or shine, matchday. */
function Umbrella({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 160;
  const edge = [8, 46, 80, 114, 152];
  const panels = [0, 1, 2, 3].map((i) => {
    const x0 = edge[i];
    const x1 = edge[i + 1];
    return `M 80 10 L ${x0} 64 Q ${(x0 + x1) / 2} 52 ${x1} 64 Z`;
  });
  return (
    <svg width={w} height={140 * s} viewBox="0 0 160 140" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 80 60 L 80 120 Q 80 134 66 134 Q 54 134 54 122" fill="none" stroke={DARK} strokeWidth={8} strokeLinecap="round" />
      <path d="M 80 60 L 80 120 Q 80 134 66 134 Q 54 134 54 122" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.5} />
      {panels.map((p, i) => (
        <path key={i} d={p} fill={i % 2 ? "#fff" : ink} />
      ))}
      <path d={`M 80 10 Q 14 16 8 64 ${[0, 1, 2, 3].map((i) => `Q ${(edge[i] + edge[i + 1]) / 2} 52 ${edge[i + 1]} 64`).join(" ")} Q 146 16 80 10 Z`} fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      <circle cx={80} cy={8} r={5} fill={DARK} stroke="#fff" strokeWidth={2.4} />
    </svg>
  );
}

/** Guarda-chuva (matchday): an open umbrella in his club's colour and white — rain or shine — beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Umbrellaopen({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (140 / 160)} gap={30 * k}>
      <Umbrella data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Stained glass (adidas' 2026 Belgium home kit, the Gothic windows) ---------------- */

/**
 * A Gothic lancet window in stained glass: a pointed arch with thick dark leading, panes in his club's two colours,
 * pale blue and gold — after adidas' 2026 Belgium home shirt, drawn from the country's Gothic stained-glass windows.
 */
function Lancet({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const acc = vivid(data.params.accent);
  const s = w / 100;
  const lead = { stroke: DARK, strokeWidth: 5, strokeLinejoin: "round" as const };
  return (
    <svg width={w} height={150 * s} viewBox="0 0 100 150" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 6 146 L 6 56 Q 6 18 50 4 Q 94 18 94 56 L 94 146 Z" fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
      <path d="M 10 142 L 10 58 Q 10 24 50 9 Q 90 24 90 58 L 90 142 Z" fill="#bfe0f5" {...lead} />
      <path d="M 50 9 Q 30 22 26 52 L 74 52 Q 70 22 50 9 Z" fill={GOLD} {...lead} />
      <circle cx={50} cy={36} r={9} fill={ink} {...lead} strokeWidth={4} />
      <rect x={10} y={52} width={40} height={45} fill={ink} {...lead} />
      <rect x={50} y={52} width={40} height={45} fill={acc === ink ? "#fff" : acc} {...lead} />
      <rect x={10} y={97} width={40} height={45} fill={acc === ink ? "#fff" : acc} {...lead} />
      <rect x={50} y={97} width={40} height={45} fill={ink} {...lead} />
    </svg>
  );
}

/** Vitral (matchday): a Gothic stained-glass window in his club's colours beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Stainedglass({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 120 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * 1.5} gap={40 * k}>
      <Lancet data={d} w={w} />
    </ObjectRow>
  );
}

/** Golo · vitral (goal): the stained-glass window in his club's colours beside GOAL, his full name and exact club. */
export function Goalstainedglass({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 124 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * 1.5} gap={40 * k} goal>
      <Lancet data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Star field (Nike's 2026 USA away kit, stars woven into the fabric) ---------------- */

/**
 * A dark panel in a deep shade of his club's colour with small stars woven in tone-on-tone — after Nike's 2026 USA
 * away shirt, small stars woven into dark grey — and GOAL, his name and club in white over it.
 */
function StarField({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const base = shade(clubInk(data), -0.55);
  const step = 54 * k;
  const r = 10 * k;
  const star = (cx: number, cy: number) =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const rr = i % 2 ? r * 0.42 : r;
      return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  const stars: string[] = [];
  for (let y = step / 2, row = 0; y < h; y += step, row++) for (let x = (row % 2 ? step : step / 2); x < w; x += step) stars.push(star(x, y));
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 20 * k, background: base, overflow: "hidden", boxShadow: "0 16px 38px rgba(0,0,0,.5)", border: `${3 * k}px solid rgba(255,255,255,.85)`, boxSizing: "border-box" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {stars.map((p, i) => (
          <polygon key={i} points={p} fill="#fff" opacity={0.3} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${base} 25%, rgba(0,0,0,0) 70%)`, opacity: 0.8 }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>{children}</div>
    </div>
  );
}

/** Golo · estrelas (goal): GOAL, his full name and exact club in white on a dark panel with stars woven in tone-on-tone. */
export function Goalstarfield({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const g = goalOf(d, k, ts, W - 120 * k);
  const h = g.h + 2 * 42 * k;
  return (
    <Top data={d} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <StarField data={d} k={k} w={W} h={h}>
          <GoalStack g={g} k={k} color="#fff" shadow="0 2px 8px rgba(0,0,0,.4)" />
        </StarField>
      </Shade>
    </Top>
  );
}

