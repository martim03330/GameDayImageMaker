/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** JetBrains Mono: every glyph advances 0.6em; cap height ~0.73em; the underscore sits ~0.2em under the baseline. */
const ADV = 0.6;
const CAP = 0.73;
const DESC = 0.2;

/** Width of a mono run at 1px with the given tracking (em). */
export function monoEm(text: string, tracking = 0): number {
  const n = [...text.normalize("NFC")].length;
  return n * (ADV + tracking);
}

/** "MATCHDAY" / "GOAL" (or the kicker as typed) in caps with the typewriter cursor: "MATCHDAY_". */
export function monoWord(kicker: string | undefined, fallback: string): string {
  const raw = (kicker || fallback).replace(/[_.!]+$/, "").trim().toUpperCase();
  return `${raw}_`;
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

export type MonoLine = { text: string; size: number; weight: number; opacity?: number };

/**
 * The shared frame of the natural mono looks: his photo full-bleed (real grass, stands, light), the word in
 * a typewriter mono ("MATCHDAY_") large and white with the double shadow in the clear upper area, left on the
 * margin, small mono lines under it ("> HOME v AWAY"), his face placed below the type (hair never under it),
 * the NEYOD logo alone at the foot. No headroom in the photo: the type goes to the lower-left over the grass
 * and the logo to the top corner away from his head.
 */
export function NatMonoFrame({ data, word, lines }: { data: RenderData; word: string; lines: MonoLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the word: exact mono width, as big as the width allows ---- */
  const size = Math.min((story ? 250 : 200) * ts, maxW / Math.max(1, monoEm(word, -0.02)));
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, monoEm(l.text, 0.02))) }));
  const gap = 14 * k;
  const under = 26 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = size * (CAP + DESC) + (sized.length ? under + linesH : 0);

  /* ---- upper layout: type at the top, his face below it ---- */
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
  let y = baseline + size * DESC + under;
  const placed = sized.map((l) => {
    const top = y;
    y += l.px + gap;
    return { ...l, top };
  });
  const typeBottom = capTop + blockH;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  const fid = story ? "nm-soft-s" : "nm-soft";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <svg width={CANVAS_W} height={size * 1.5} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={fid} x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text x={M - size * 0.04} y={size} filter={`url(#${fid})`} style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", fill: "#ffffff" }}>
          {word}
        </text>
      </svg>

      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: M, top: l.top, fontFamily: MONO, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "pre", opacity: l.opacity ?? 1, color: "#ffffff", textShadow: SMALL_SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · mono (matchday): his own match photo full-bleed, light grade only, and one techy idea: the word
 * "MATCHDAY_" in a typewriter mono (JetBrains Mono), big and white with the double shadow over the clear upper
 * area, a terminal cursor at its end; under it, small mono lines "> HOME v AWAY" (exact names, home first) and
 * "> 25 OCT · 15:00". The NEYOD logo alone at the foot.
 */
export function Natmono({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join(" · ");
  return (
    <NatMonoFrame
      data={data}
      word={monoWord(data.content.kicker, "Matchday")}
      lines={[
        { text: match ? `> ${match}` : "", size: 25, weight: 700 },
        { text: when ? `> ${when}` : "", size: 22, weight: 500, opacity: 0.92 },
      ]}
    />
  );
}
