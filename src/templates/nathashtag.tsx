/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter caps: cap height (em). */
const CAP = 0.727;

/** Rough advance of a run of heavy Inter caps (weight 800) at 1px, tracking -0.02em. */
function heavyEm(text: string): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    if (/[MW]/.test(ch)) em += 0.92;
    else if (ch === "I") em += 0.32;
    else if (/[A-Z0-9]/.test(ch)) em += 0.74;
    else if (ch === "#") em += 0.72;
    else if (ch === " ") em += 0.26;
    else em += 0.4;
  }
  return em - [...text].length * 0.02;
}

/** Relative luminance of a #rgb / #rrggbb colour (null when it isn't one). */
function lum(hex: string): number | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** The hash mark's style: the accent when it is light enough to read on the shaded photo, else white in a lighter weight. */
function hashInk(accent: string | undefined): { fill: string; weight: number; opacity: number } {
  const L = accent ? lum(accent) : null;
  if (L != null && L >= 0.16) return { fill: accent!.startsWith("#") ? accent! : `#${accent}`, weight: 800, opacity: 1 };
  return { fill: "#ffffff", weight: 300, opacity: 0.82 };
}

/** The hashtag word over the photo: the "#" in the accent (or light white), the word in heavy white caps, double shadow. */
function HashWord({ word, size, x, baseline, id, accent }: { word: string; size: number; x: number; baseline: number; id: string; accent?: string }) {
  const ink = hashInk(accent);
  return (
    <svg width={CANVAS_W} height={size * 1.3} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={id} x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.36" result="tight" />
          <feDropShadow dx="0" dy="4" stdDeviation="9" floodColor="#000" floodOpacity="0.34" />
          <feDropShadow dx="0" dy="8" stdDeviation="24" floodColor="#000" floodOpacity="0.42" />
        </filter>
      </defs>
      <text x={x} y={size} filter={`url(#${id})`} style={{ fontFamily: SANS, fontSize: size, letterSpacing: "-0.02em" }}>
        <tspan style={{ fontWeight: ink.weight, fill: ink.fill, fillOpacity: ink.opacity }}>#</tspan>
        <tspan style={{ fontWeight: 800, fill: "#ffffff" }}>{word}</tspan>
      </text>
    </svg>
  );
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

export type HashLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural hashtag looks: his photo full-bleed (real grass, stands, light), "#WORD" big
 * and bold in the clear upper area, left-aligned on the margin (the # in the accent colour, or a lighter white),
 * a small sans block under it, his face placed below the type, and the NEYOD logo alone at the foot. With no
 * headroom above him the type moves to the lower-left over the grass and the logo to the top corner away from him.
 */
export function HashtagFrame({ data, word, lines }: { data: RenderData; word: string; lines: HashLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  const size = Math.min((story ? 250 : 200) * ts, maxW / Math.max(1, heavyEm(`#${word}`)));
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 30 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  /** Cap top to the last line's bottom. */
  const blockH = size * CAP + (sized.length ? under + linesH : 0);

  const topCap = (story ? STORY_TOP + 8 : 84) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, topCap + blockH + 56 + fs * 0.75), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
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
      style={{ position: "absolute", left: M + 6 * k, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, textShadow: SMALL_SHADOW }}
    >
      {l.text}
    </div>
  );
  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.52), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* A soft local shade right behind the word (it may fall on light kit or a bright board). */}
      <div style={{ position: "absolute", left: M - 60 * k, top: capTop - 50 * k, width: Math.min(CANVAS_W, size * heavyEm(`#${word}`) + 120 * k), height: blockH + 100 * k, borderRadius: "50%", background: upper ? "radial-gradient(closest-side, rgba(0,0,0,.3), rgba(0,0,0,.16) 60%, rgba(0,0,0,0))" : "radial-gradient(closest-side, rgba(0,0,0,.46), rgba(0,0,0,.3) 62%, rgba(0,0,0,0))" }} />
      <HashWord word={word} size={size} x={M - size * 0.02} baseline={baseline} id={story ? "nh-soft-s" : "nh-soft"} accent={params.accent} />
      {placed.map(small)}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/** "MATCHDAY" / "GOAL" (or the kicker as typed) as one caps word with no spaces or punctuation, for the hashtag. */
export function hashWord(kicker: string | undefined, fallback: string): string {
  const w = (kicker || fallback).normalize("NFC").replace(/[#\s.!'’]+/g, "").toUpperCase();
  return w || fallback;
}

/**
 * Natural · hashtag (matchday): his own match photo full-bleed — real grass, stands and light — and one idea:
 * "#MATCHDAY" big in bold caps over the clear upper area (the # in the accent colour), with HOME v AWAY (exact
 * names, home first) and date · kick-off small under it. The NEYOD logo alone at the foot.
 */
export function Nathashtag({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <HashtagFrame
      data={data}
      word={hashWord(data.content.kicker, "MATCHDAY")}
      lines={[
        { text: match, size: 25, weight: 700, tracking: 0.1 },
        { text: when, size: 20, weight: 700, tracking: 0.22, opacity: 0.9 },
      ]}
    />
  );
}
