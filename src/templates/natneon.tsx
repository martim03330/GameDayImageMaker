/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter caps: cap height (em). */
const CAP = 0.727;
const SOFT_WHITE = "#eaf2ff";

function rgb(hex: string | undefined): [number, number, number] | null {
  const m = (hex ?? "").trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
const mix = (c: number[], t: number) => c.map((v) => v + (255 - v) * t);

/**
 * The neon tube colour: the club accent (then primary) when it is a real, saturated colour bright enough to
 * glow, lifted a little toward white; otherwise a soft white neon.
 */
export function neonColour(data: RenderData): string {
  for (const hex of [data.params.accent, data.params.primary]) {
    const c = rgb(hex);
    if (!c) continue;
    const max = Math.max(...c);
    const min = Math.min(...c);
    const sat = max ? (max - min) / max : 0;
    if (sat < 0.35 || max < 90) continue;
    // Bring the brightest channel up to ~255 (neon is light), then a touch of white.
    const lifted = c.map((v) => (v * 255) / max);
    return toHex(mix(lifted, 0.18));
  }
  return SOFT_WHITE;
}

/**
 * The word as a neon sign: thin monoline caps (Inter Light with rounded joins — no script), a white-hot core
 * with a faint tint, and layered glows in the tube colour (tight halo + wide bloom).
 */
function NeonWord({ word, size, x, baseline, colour, id }: { word: string; size: number; x: number; baseline: number; colour: string; id: string }) {
  const core = toHex(mix(rgb(colour) ?? [255, 255, 255], 0.82));
  const text = (fill: string, stroke: string, width: number, extra: Record<string, unknown> = {}) => (
    <text
      x={x}
      y={size * 1.2}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ fontFamily: SANS, fontWeight: 300, fontSize: size, letterSpacing: "0.08em" }}
      {...extra}
    >
      {word}
    </text>
  );
  return (
    <svg width={CANVAS_W} height={size * 1.6} style={{ position: "absolute", left: 0, top: baseline - size * 1.2, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={`${id}-wide`} x="-30%" y="-90%" width="160%" height="280%">
          <feGaussianBlur stdDeviation={size * 0.26} />
        </filter>
        <filter id={`${id}-bloom`} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation={size * 0.1} />
        </filter>
        <filter id={`${id}-halo`} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation={size * 0.025} />
        </filter>
        <filter id={`${id}-tube`} x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation={Math.max(0.6, size * 0.004)} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* A soft dark under-glow so the sign reads on lighter stands too. */}
      {text("#000", "#000", size * 0.05, { opacity: 0.35, filter: `url(#${id}-halo)`, transform: `translate(0 ${size * 0.02})` })}
      {text(colour, colour, size * 0.1, { opacity: 0.55, filter: `url(#${id}-wide)` })}
      {text(colour, colour, size * 0.08, { opacity: 1, filter: `url(#${id}-bloom)` })}
      {text(colour, colour, size * 0.055, { opacity: 1, filter: `url(#${id}-halo)` })}
      {text(colour, colour, size * 0.032, { opacity: 1 })}
      {text(core, core, size * 0.012, { filter: `url(#${id}-tube)` })}
    </svg>
  );
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

export type NeonLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural neon looks: his photo full-bleed (real grass, stands, light; light grade
 * only), the word as a neon sign centred over the darker upper part of the photo (stands / sky) with a soft
 * local shade behind it, small plain sans info centred under it, his face placed below the type, and the
 * NEYOD logo alone at the foot. No headroom in the photo → the sign moves to the foot, the logo to the top
 * corner away from his head.
 */
export function NatNeonFrame({ data, word, lines }: { data: RenderData; word: string; lines: NeonLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;
  const colour = neonColour(data);

  const size = Math.min((story ? 250 : 200) * ts, (maxW - 20) / Math.max(1, capsEm(word, 0.08) * 0.97));
  const wordW = size * capsEm(word, 0.08) * 0.97;
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 40 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = size * CAP + (sized.length ? under + linesH : 0);

  const topCap = (story ? STORY_TOP + 30 : 96) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 700 : 510, topCap + blockH + 60 + fs * 0.8), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  const capTop = upper ? topCap : footBottom - blockH;
  const baseline = capTop + size * CAP;
  let y = baseline + under;
  const placed = sized.map((l) => {
    const top = y;
    y += l.px + gap;
    return { ...l, top };
  });
  const typeBottom = capTop + blockH;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const small = (l: (typeof placed)[number]): ReactNode => (
    <div
      key={l.text}
      style={{ position: "absolute", left: 0, width: CANVAS_W, textAlign: "center", top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, textShadow: SMALL_SHADOW }}
    >
      {l.text}
    </div>
  );
  // Neon needs a darker ground: a deeper (still soft) local shade behind the sign only.
  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.62), rgba(0,0,0,.42) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 280 : 220), background: "linear-gradient(to top, rgba(0,0,0,.66), rgba(0,0,0,.42) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <NeonWord word={word} size={size} x={(CANVAS_W - wordW) / 2} baseline={baseline} colour={colour} id={story ? "neon-s" : "neon-p"} />
      {placed.map(small)}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/** "MATCHDAY" / "GOAL" (or the kicker as typed) in caps. */
export function neonWord(kicker: string | undefined, fallback: string): string {
  return (kicker || fallback).replace(/’/g, "'").trim().replace(/[.!]+$/, "").toUpperCase();
}

/**
 * Natural · neon (matchday): his own match photo full-bleed, and one idea — "MATCHDAY" as a neon sign (thin
 * rounded tube caps, white-hot core, club-accent glow) over the darker stands above him; under it, plain
 * sans: HOME v AWAY (exact names, home first) and date · kick-off. NEYOD logo alone at the foot.
 */
export function Natneon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <NatNeonFrame
      data={data}
      word={neonWord(data.content.kicker, "Matchday")}
      lines={[
        { text: match, size: 24, weight: 700, tracking: 0.12 },
        { text: when, size: 20, weight: 700, tracking: 0.24, opacity: 0.9 },
      ]}
    />
  );
}
