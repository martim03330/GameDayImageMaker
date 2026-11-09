/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter metrics (em): cap height, baseline below the top of a line-height:1 box. */
const CAP = 0.727;
const BASE = 0.863;
/** The bar: its top below the baseline (clear of descenders) and its thickness, in word sizes. */
const BAR_GAP = 0.25;
const BAR_T = 0.12;

/** Rough advance of a run of heavy Inter (weight 800, mixed case) at 1px, tracking -0.02em. */
function wordEm(text: string): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    if (/[MW]/.test(ch)) em += 0.94;
    else if (/[mw]/.test(ch)) em += 0.92;
    else if (/[Iil]/.test(ch)) em += 0.3;
    else if (/[ftjr]/.test(ch)) em += 0.42;
    else if (/[A-Z0-9]/.test(ch)) em += 0.76;
    else if (/[a-z]/.test(ch)) em += 0.62;
    else if (ch === " ") em += 0.26;
    else em += 0.4;
  }
  return em - [...text].length * 0.02;
}

/** Relative luminance of a #rgb / #rrggbb colour (null when it isn't one). */
function lum(hex: string | undefined): number | null {
  const m = (hex ?? "").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** The bar colour: the club colour (accent or primary) that reads best on the shaded photo, else white. */
function barInk(accent: string | undefined, primary: string | undefined): string {
  const opts = [accent, primary]
    .map((c) => ({ c, L: lum(c) }))
    .filter((o): o is { c: string; L: number } => o.L != null && o.L >= 0.15 && o.L <= 0.85)
    .sort((a, b) => b.L - a.L);
  if (!opts.length) return "#ffffff";
  const c = opts[0].c.trim();
  return c.startsWith("#") ? c : `#${c}`;
}

/** "MATCHDAY" → "Matchday" (the kicker as typed, one word, title case). */
export function underWord(kicker: string | undefined, fallback: string): string {
  const w = (kicker || fallback).normalize("NFC").replace(/[#!.]+/g, "").trim();
  if (!w) return fallback;
  return w === w.toUpperCase() ? w.charAt(0) + w.slice(1).toLowerCase() : w;
}

const WORD_SHADOW = "0 2px 6px rgba(0,0,0,.36), 0 4px 18px rgba(0,0,0,.34), 0 8px 48px rgba(0,0,0,.4)";
const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

export type UnderLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural underline looks: his photo full-bleed (real grass, stands, light), the word big in
 * bold sans in the clear upper area, left on the margin, ONE thick bar under it in the club colour (slightly shorter
 * than the word), a small sans block under the bar, his face below the type, and the NEYOD logo alone at the foot.
 * With no headroom above him the type moves to the lower-left over the grass and the logo to the top corner.
 */
export function UnderlineFrame({ data, word, lines }: { data: RenderData; word: string; lines: UnderLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  const size = Math.min((story ? 270 : 210) * ts, (maxW - 8) / Math.max(1, wordEm(word)));
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 30 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  /** Cap top to the bar's bottom, then to the last line's bottom. */
  const barBottom = size * (CAP + BAR_GAP + BAR_T);
  const blockH = barBottom + (sized.length ? under + linesH : 0);

  const topCap = (story ? STORY_TOP + 8 : 84) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 700 : 510, topCap + blockH + 56 + fs * 0.75), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const capTop = upper ? topCap : footBottom - blockH;
  const baseline = capTop + size * CAP;
  let y = capTop + barBottom + under;
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
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.52), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  const ink = barInk(params.accent, params.primary);
  const estW = size * wordEm(word);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* A soft local shade right behind the word (it may fall on light kit or a bright board). */}
      <div style={{ position: "absolute", left: M - 60 * k, top: capTop - 50 * k, width: Math.min(CANVAS_W, estW + 120 * k), height: blockH + 100 * k, borderRadius: "50%", background: upper ? "radial-gradient(closest-side, rgba(0,0,0,.3), rgba(0,0,0,.16) 60%, rgba(0,0,0,0))" : "radial-gradient(closest-side, rgba(0,0,0,.54), rgba(0,0,0,.34) 62%, rgba(0,0,0,0))" }} />

      {/* The word, and the one thick bar under it (its width follows the real word: slightly shorter). */}
      <div style={{ position: "absolute", left: M - size * 0.03, top: baseline - size * BASE, display: "inline-block", whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.02em", color: "#ffffff", textShadow: WORD_SHADOW }}>{word}</div>
        <div
          style={{
            position: "absolute",
            left: size * 0.05,
            width: `calc(100% - ${size * 0.2}px)`,
            top: size * (BASE + BAR_GAP),
            height: Math.max(6, size * BAR_T),
            background: ink,
            boxShadow: "0 2px 6px rgba(0,0,0,.3), 0 6px 24px rgba(0,0,0,.3)",
          }}
        />
      </div>
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
 * Natural · underline (matchday): his own match photo full-bleed — real grass, stands and light — and one idea:
 * "Matchday" big in bold sans over the clear upper area with one thick bar under it in the club colour, then
 * HOME v AWAY (exact names, home first) and date · kick-off small under the bar. The NEYOD logo alone at the foot.
 */
export function Natunderline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <UnderlineFrame
      data={data}
      word={underWord(data.content.kicker, "Matchday")}
      lines={[
        { text: match, size: 25, weight: 700, tracking: 0.1 },
        { text: when, size: 20, weight: 700, tracking: 0.22, opacity: 0.9 },
      ]}
    />
  );
}
