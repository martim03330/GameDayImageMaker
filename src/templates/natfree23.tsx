/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { HALO } from "./natfree19";
import { GoalText } from "./natfree20";
import { caps, fit, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const DARK = "#1b1f26";

/** HOME X AWAY with the clubs' exact names (only the case changes), home first. */
export function versusOf(data: RenderData) {
  const fx = natFixture(data);
  return fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} X ${fx.awayName.toUpperCase()}` : "";
}

/** A name on one line, or on two balanced lines when one would shrink under `min` — never cut. */
export function linesOf(text: string, max: number, w: number, tracking: number, min: number): { lines: string[]; px: number } {
  const one = fit(text, max, w, tracking);
  const words = text.split(/\s+/);
  if (one >= min || words.length < 2) return { lines: [text], px: one };
  let best = { lines: [text], px: one, long: text.length };
  for (let i = 1; i < words.length; i++) {
    const l = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const px = Math.min(...l.map((x) => fit(x, max, w, tracking)));
    const long = Math.max(...l.map((x) => x.length));
    // Bigger type first; on a tie (both at the size cap) the more balanced split.
    if (px > best.px + 0.5 || (Math.abs(px - best.px) <= 0.5 && long < best.long)) best = { lines: l, px, long };
  }
  return { lines: best.lines, px: best.px };
}

/** Like linesOf, but up to three lines (very long names: "California State University at Bakersfield"). */
export function lines3(text: string, max: number, w: number, tracking: number, min: number): { lines: string[]; px: number } {
  const two = linesOf(text, max, w, tracking, min);
  const words = text.split(/\s+/);
  if (two.px >= min || words.length < 3) return two;
  let best = two;
  for (let i = 1; i < words.length - 1; i++)
    for (let j = i + 1; j < words.length; j++) {
      const l = [words.slice(0, i).join(" "), words.slice(i, j).join(" "), words.slice(j).join(" ")];
      const px = Math.min(...l.map((x) => fit(x, max, w, tracking)));
      if (px > best.px + 0.5) best = { lines: l, px };
    }
  return best;
}

/** HOME X AWAY with the exact names: one line, or "HOME X" / "AWAY" (each wrapped again if still long). */
export function versusLines(data: RenderData, max: number, w: number, tracking: number, min: number): { lines: string[]; px: number } {
  const fx = natFixture(data);
  if (!fx.homeName || !fx.awayName) return { lines: [], px: 0 };
  const home = fx.homeName.toUpperCase();
  const away = fx.awayName.toUpperCase();
  const one = `${home} X ${away}`;
  const px1 = fit(one, max, w, tracking);
  if (px1 >= min) return { lines: [one], px: px1 };
  const a = linesOf(`${home} X`, max, w, tracking, min);
  const b = linesOf(away, max, w, tracking, min);
  return { lines: [...a.lines, ...b.lines], px: Math.min(a.px, b.px) };
}

/** Sizes of the matchday block: round title, both crests, HOME X AWAY, date · kick-off · ground. */
function matchSizes(data: RenderData, k: number, ts: number, w: number, title: string, tMax = 64) {
  const fx = natFixture(data);
  const vs = versusLines(data, 27 * k * ts, w, 0.08, 22 * k);
  const tPx = Math.min(tMax * k * ts, w / Math.max(1, title.length * 0.5));
  const cH = fx.homeCrest || fx.awayCrest ? 58 * k : 0;
  const rows = whenRows(data, 21 * k * ts, w, 0.12);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.12)));
  const h = tPx + (cH ? 16 * k + cH : 0) + (vs.lines.length ? 16 * k + vs.lines.length * (vs.px + 8 * k) - 8 * k : 0) + rows.length * (wPx + 10 * k);
  return { fx, vs, tPx, cH, rows, wPx, h };
}

export const matchTextH = (data: RenderData, k: number, ts: number, w: number, title: string) => matchSizes(data, k, ts, w, title).h;

/** MATCHDAY 14 in Anton, both crests, HOME X AWAY and date · kick-off · ground, flush left beside an object. */
export function MatchText({ data, k, ts, w, title }: { data: RenderData; k: number; ts: number; w: number; title: string }) {
  const s = matchSizes(data, k, ts, w, title);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: s.tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {s.cH > 0 && (
        <div style={{ display: "flex", gap: 16 * k, marginTop: 16 * k, height: s.cH }}>
          {[s.fx.homeCrest, s.fx.awayCrest].filter(Boolean).map((c, i) => (
            <img key={i} src={c!} alt="" style={{ height: s.cH, width: s.cH, objectFit: "contain", filter: "drop-shadow(0 0 1.5px rgba(255,255,255,.7)) drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
          ))}
        </div>
      )}
      {s.vs.lines.map((l, i) => (
        <div key={i} style={{ ...caps(s.vs.px, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: i ? 8 * k : 16 * k, textShadow: HALO }}>{l}</div>
      ))}
      {s.rows.map((l, i) => (
        <div key={i} style={{ ...caps(s.wPx, 0.12), paddingLeft: 0, fontWeight: 600, marginTop: 10 * k, opacity: 0.94, textShadow: HALO }}>{l}</div>
      ))}
    </div>
  );
}

/** An object beside a flush-left block, above his head (Top places it with pickTextSpot when his head is high). */
export function ObjectRow({ data, ow, oh, gap, goal, children }: { data: RenderData; ow: number; oh: number; gap: number; goal?: boolean; children: ReactNode }) {
  const { k, ts } = frameOf(data);
  const tw = W - ow - gap;
  const title = roundTitle(data);
  const textH = goal ? Math.min(120 * k * ts, tw / 2.5) + 18 * k + 30 * k * ts + 10 * k + 22 * k * ts : matchTextH(data, k, ts, tw, title);
  const blockH = Math.max(oh, textH);
  return (
    <Top data={data} blockH={blockH} drop={goal ? 310 : 290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          {children}
          {goal ? <GoalText data={data} k={k} ts={ts} w={tw} /> : <MatchText data={data} k={k} ts={ts} w={tw} title={title} />}
        </div>
      </Shade>
    </Top>
  );
}

/* ---------------- Shin pad ---------------- */

/**
 * A personalised shin pad, the thing players have made with their own number: a tall guard in his club's colour,
 * edged in white, a raised inner panel and his shirt number big in white (no number on record: the club crest).
 */
function ShinPad({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  const num = (data.player.number || "").replace(/\D/g, "").slice(0, 2);
  const crest = data.club?.crestUrl;
  return (
    <div style={{ position: "relative", width: w, height: 150 * s, flexShrink: 0, filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <svg width={w} height={150 * s} viewBox="0 0 100 150" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 10 22 Q 10 4 50 4 Q 90 4 90 22 L 84 112 Q 80 146 50 146 Q 20 146 16 112 Z" fill={ink} stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M 20 26 Q 20 14 50 14 Q 80 14 80 26 L 75 108 Q 72 134 50 134 Q 28 134 25 108 Z" fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={2.2} />
      </svg>
      {num ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 46 * s, textAlign: "center", fontFamily: DISPLAY, fontSize: 52 * s, lineHeight: 1, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.3)" }}>{num}</div>
      ) : (
        crest && <img src={crest} alt="" style={{ position: "absolute", left: 24 * s, top: 46 * s, width: 52 * s, height: 52 * s, objectFit: "contain" }} />
      )}
    </div>
  );
}

/** Natural · caneleira (matchday): his own shin pad with his number beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground. */
export function Natshinpad({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 140 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * 1.5} gap={36 * k}>
      <ShinPad data={data} w={w} />
    </ObjectRow>
  );
}

/** Golo natural · caneleira (goal): the shin pad with his number beside GOAL, his full name and exact club. */
export function Goalnatshinpad({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 150 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * 1.5} gap={36 * k} goal>
      <ShinPad data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Referee's whistle ---------------- */

/** The referee's whistle, chunky and white with a dark outline, on a lanyard in his club's colour — the kick-off. */
function Whistle({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 150;
  return (
    <svg width={w} height={110 * s} viewBox="0 0 150 110" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <path d="M 20 40 C 8 60, 6 86, 4 108" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
      <path d="M 20 40 C 8 60, 6 86, 4 108" fill="none" stroke={ink} strokeWidth={9} strokeLinecap="round" />
      <circle cx={25} cy={35} r={9} fill="none" stroke="#e9ecef" strokeWidth={5} />
      <path d="M 58 30 L 136 30 Q 144 30 144 38 L 144 52 Q 144 60 136 60 L 93.4 60 A 36 36 0 1 1 58 30 Z" fill="#f4f5f7" stroke={DARK} strokeWidth={3.6} strokeLinejoin="round" />
      <rect x={76} y={25} width={22} height={9} rx={2.5} fill={DARK} />
      <circle cx={58} cy={66} r={15} fill="none" stroke={DARK} strokeOpacity={0.25} strokeWidth={4} />
      <path d="M 36 52 Q 44 40 58 38" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/** Natural · apito (matchday): the referee's whistle on a lanyard in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Natwhistle({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 200 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (110 / 150)} gap={30 * k}>
      <Whistle data={data} w={w} />
    </ObjectRow>
  );
}

/** Golo natural · apito (goal): the whistle — goal given — beside GOAL, his full name and exact club. */
export function Goalnatwhistle({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 210 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (110 / 150)} gap={30 * k} goal>
      <Whistle data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Ball in the net ---------------- */

/** A goal frame seen from the front: thick white posts and bar, the net behind, the ball tucked in the bottom corner. */
function GoalFrame({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 160;
  const cols = [30, 50, 70, 90, 110, 130];
  const rows = [26, 42, 58, 74];
  return (
    <svg width={w} height={100 * s} viewBox="0 0 160 100" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <rect x={10} y={10} width={140} height={84} fill="rgba(0,0,0,.18)" />
      {cols.map((x) => (
        <line key={x} x1={x} y1={10} x2={x} y2={94} stroke="#fff" strokeOpacity={0.62} strokeWidth={1.8} />
      ))}
      {rows.map((y) => (
        <line key={y} x1={10} y1={y} x2={150} y2={y} stroke="#fff" strokeOpacity={0.62} strokeWidth={1.8} />
      ))}
      <path d="M 8 96 L 8 8 L 152 8 L 152 96" fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={0} y1={96} x2={160} y2={96} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <circle cx={128} cy={76} r={15} fill="#fff" stroke={DARK} strokeWidth={3} />
      <polygon points="128,68 135.6,73.5 132.7,82.5 123.3,82.5 120.4,73.5" fill={DARK} />
    </svg>
  );
}

/** Golo natural · bola na rede (goal): a goal frame with the ball in the bottom corner of the net beside GOAL, his full name and exact club. */
export function Goalnatgoalframe({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 230 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (100 / 160)} gap={34 * k} goal>
      <GoalFrame data={data} w={w} />
    </ObjectRow>
  );
}
