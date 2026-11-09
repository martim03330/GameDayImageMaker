/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WORD_SHADOW = "0 0 2px rgba(0,0,0,.4), 0 2px 5px rgba(0,0,0,.42), 0 6px 26px rgba(0,0,0,.45)";
const BOX_SHADOW = "drop-shadow(0 1px 1.5px rgba(0,0,0,.45)) drop-shadow(0 3px 12px rgba(0,0,0,.4))";
const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";
/** At the foot (over his kit) the small lines get a denser halo. */
const FOOT_SHADOW = "0 0 3px rgba(0,0,0,.75), 0 1px 4px rgba(0,0,0,.7), 0 2px 18px rgba(0,0,0,.65)";
/** Inter cap height (em). */
const CAP = 0.73;

export type BoxedLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural "boxed" looks: his photo full-bleed (real grass, stands, light; light grade
 * only) and one idea — the word in medium-weight, wide-tracked caps inside a thin white rectangle outline
 * (no fill, generous padding), centred in the clear area above his head; the info small and centred under
 * the box. When the photo has no headroom the box and its lines sit across the foot over a soft shade, and
 * the NEYOD logo moves to the top corner away from his head.
 */
export function NatBoxedFrame({ data, word, lines }: { data: RenderData; word: string; lines: BoxedLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 60;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the box: word caps + generous padding, never wider than the margins ---- */
  const track = 0.32;
  const stroke = story ? 3.5 : 3;
  const padX = 58 * k;
  const padY = 34 * k;
  const size = Math.min((story ? 92 : 72) * ts, (maxW - 2 * padX) / Math.max(1, capsEm(word, track)));
  const capH = size * CAP;
  const boxW = Math.min(maxW, capsEm(word, track) * size + 2 * padX);
  const boxH = capH + 2 * padY;

  const smalls = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 30 * k;
  const smallH = smalls.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = boxH + (smalls.length ? under + smallH : 0);

  /* ---- his face below the type (hair ~0.8 face-heights above its centre) ---- */
  const topY = (story ? STORY_TOP + 10 : 84) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: Math.max(story ? 690 : 500, topY + blockH + 60 + fs * 0.75),
    fs,
  });
  const upper = place.fy - place.fs * 0.8 >= topY + blockH + 24;
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 54) - (params.textY ?? 0);
  const top = upper ? topY : footBottom - blockH;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (upper ? (story ? STORY_BOTTOM : CANVAS_H - 50) - logoH : story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: top + blockH + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.46), rgba(0,0,0,.27) 55%, rgba(0,0,0,0))" }
    : (() => {
        // At the foot the box often crosses his kit (white shorts): the shade stays dense over the whole
        // type block and only fades above it.
        const h = H - top + (story ? 260 : 200);
        const solid = Math.round(((H - top + 10) / h) * 100);
        return { bottom: 0, height: h, background: `linear-gradient(to top, rgba(0,0,0,.66), rgba(0,0,0,.54) ${solid}%, rgba(0,0,0,0))` };
      })();
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  let y = top + boxH + under;
  const placed = smalls.map((l) => {
    const t = y;
    y += l.px + gap;
    return { ...l, top: t };
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A soft local shade under the type and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The one idea: a thin white rectangle outline, no fill, around the wide-tracked word. */}
      <div style={{ position: "absolute", left: (CANVAS_W - boxW) / 2, top, width: boxW, height: boxH, boxSizing: "border-box", border: `${stroke}px solid #ffffff`, filter: BOX_SHADOW }} />
      <div
        style={{ position: "absolute", left: 0, right: 0, top: top + padY - size * (0.97 - CAP), height: size * 1.2, textAlign: "center" }}
      >
        <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: 1.2, letterSpacing: `${track}em`, paddingLeft: `${track}em`, whiteSpace: "nowrap", color: "#ffffff", textShadow: WORD_SHADOW }}>{word}</span>
      </div>

      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: 0, right: 0, top: l.top, textAlign: "center", fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, paddingLeft: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, textShadow: upper ? SMALL_SHADOW : FOOT_SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · boxed (matchday): his own match photo full-bleed — real grass, stands and light, only the light
 * grade — and one idea: "MATCHDAY" in medium-weight, wide-tracked caps inside a thin white rectangle outline,
 * centred above his head. Under the box, small: HOME v AWAY (exact names, home first), then date · kick-off.
 * No score. The NEYOD logo alone at the foot.
 */
export function Natboxed({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase().replace(/[’.!]/g, "").trim();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <NatBoxedFrame
      data={data}
      word={word}
      lines={[
        { text: match, size: 23, weight: 700, tracking: 0.12 },
        { text: when, size: 20, weight: 700, tracking: 0.24, opacity: 0.9 },
      ]}
    />
  );
}
