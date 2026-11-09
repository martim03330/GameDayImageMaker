/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** The elegant high-contrast display serif (DM Serif Display, a Didone): "Matchday." / "Goal.". */
export const NAT_SERIF = "var(--font-dmserif), 'Didot', 'Bodoni 72', Georgia, serif";
/** DM Serif Display: cap height and descender (em). */
const CAP = 0.7;
const DESC = 0.24;

/** Rough advance of a word in DM Serif Display at 1px (for fitting it to the width). */
export function serifEm(text: string): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    if (/[MW]/.test(ch)) em += 0.88;
    else if (/[A-Z]/.test(ch)) em += 0.7;
    else if (/[mw]/.test(ch)) em += 0.8;
    else if (/[iljtfr]/.test(ch)) em += 0.33;
    else if (/[a-z0-9]/.test(ch)) em += 0.53;
    else if (ch === " ") em += 0.25;
    else em += 0.26;
  }
  return em;
}

/** "MATCHDAY" / "GOAL" (or the kicker as typed) as a sentence-case word with a full stop: "Matchday.". */
export function sentenceWord(kicker: string | undefined, fallback: string): string {
  const raw = (kicker || fallback).replace(/’/g, "'").trim().replace(/[.!]+$/, "");
  const low = raw === raw.toUpperCase() ? raw.toLowerCase() : raw;
  return `${low.charAt(0).toUpperCase()}${low.slice(1)}.`;
}

/** The serif word over the photo: pure white with the natural looks' double shadow (tight outline + wide soft). */
function SerifWord({ word, size, x, baseline, id }: { word: string; size: number; x: number; baseline: number; id: string }) {
  return (
    <svg width={CANVAS_W} height={size * 1.4} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={id} x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
        </filter>
      </defs>
      <text x={x} y={size} filter={`url(#${id})`} style={{ fontFamily: NAT_SERIF, fontWeight: 400, fontSize: size, letterSpacing: "-0.01em", fill: "#ffffff" }}>
        {word}
      </text>
    </svg>
  );
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

/**
 * The shared frame of the natural serif looks: his photo full-bleed (real grass, stands, light), the serif
 * word large in the clear upper area, left-aligned on the margin, a small sans block under it, his face
 * placed below the type (his hair never under it), and the NEYOD logo alone at the foot. When the photo has
 * no headroom above him (his head would rise into the type), the type moves to the lower-left over the
 * grass and the logo to the top corner away from his head.
 */
export function NatSerifFrame({ data, word, lines }: { data: RenderData; word: string; lines: { text: string; size: number; weight: number; tracking: number; opacity?: number }[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the word: as big as the width allows, never taller than the band ---- */
  const size = Math.min((story ? 290 : 236) * ts, (maxW + 8) / Math.max(1, serifEm(word)));
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 22 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  /** Word top (cap) to the last line's bottom. */
  const blockH = size * (CAP + DESC) + (sized.length ? under + linesH : 0);

  /* ---- the upper layout: type at the top, his face below it (hair ~0.75 face-heights above its centre) ---- */
  const topCap = (story ? STORY_TOP + 8 : 84) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, topCap + blockH + 56 + fs * 0.75), fs });
  // The photo has no headroom (the frame had to zoom / slide and his head rose into the type): the type
  // goes to the lower-left instead, over the grass, and the logo to the top corner away from his head.
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const capTop = upper ? topCap : footBottom - blockH;
  const baseline = capTop + size * CAP;
  let y = baseline + size * DESC + under;
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
      style={{ position: "absolute", left: M + 4 * k, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, textShadow: SMALL_SHADOW }}
    >
      {l.text}
    </div>
  );
  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A soft local shade under the type (top) and under the logo (foot) — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <SerifWord word={word} size={size} x={M} baseline={baseline} id={story ? "ns-soft-s" : "ns-soft"} />
      {placed.map(small)}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · serif (matchday): his own match photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: "Matchday." in a large elegant Didone serif (sentence case, full stop),
 * set over the photo in the clear upper area, left-aligned. Under it, small sans: HOME v AWAY (exact names,
 * home first), then date · kick-off. The NEYOD logo alone at the foot.
 */
export function Natserif({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = sentenceWord(data.content.kicker, "Matchday");
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <NatSerifFrame
      data={data}
      word={word}
      lines={[
        { text: match, size: 23, weight: 700, tracking: 0.12 },
        { text: when, size: 19, weight: 700, tracking: 0.24, opacity: 0.9 },
      ]}
    />
  );
}
