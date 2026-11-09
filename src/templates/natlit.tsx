/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.5), 0 2px 16px rgba(0,0,0,.45)";

export type LitLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural "spotlight" looks: his real photo at a light grade, his surroundings sunk
 * through NatSpot (a soft inverted silhouette — he keeps the photo's own pixels, no edge, no halo) plus a soft
 * radial vignette around him, so the light seems to fall on him alone. One minimal type idea in the darkened
 * area: a wide-tracked medium caps word, a short hairline, and one or two small lines — centred over the
 * clear area above his head, or across the foot when the photo has no headroom. The NEYOD logo alone.
 */
export function NatLitFrame({ data, word, lines }: { data: RenderData; word: string; lines: LitLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the type block ---- */
  const wTrack = 0.52;
  const wSize = Math.min(36 * k * ts, maxW / Math.max(1, capsEm(word, wTrack)));
  const sized = lines.filter((l) => l.text).map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const ruleGap = 26 * k;
  const gap = 14 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = wSize + ruleGap * 2 + 2 + linesH;

  /* ---- his face below the type (hair ~0.8 face-heights above its centre) ---- */
  const topY = (story ? STORY_TOP + 10 : 92) - (params.textY ?? 0);
  const fs = story ? 232 : 156;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const want = { fx: fx0, fy: Math.max(story ? 760 : 540, topY + blockH + 70 + fs * 0.8), fs };
  const first: NatPlace = natPlace(data, CANVAS_W, H, want);
  const hairTop = first.fy - first.fs * 0.85;
  const upper = hairTop >= topY + blockH + 30;
  // No headroom: the type goes to the foot on the side away from him, so slide him a little further
  // toward his own side to clear room for it beside his legs (the frame may not move if the photo ends).
  const place: NatPlace = upper ? first : natPlace(data, CANVAS_W, H, { ...want, fx: fx0 + (first.fx >= CANVAS_W / 2 ? 1 : -1) * (story ? 150 : 110) });

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  // Type at the foot (no headroom): the logo goes to the top corner on the same side as the type.
  const blockTop = upper ? topY : footBottom - blockH;
  const logoTop = upper ? (story ? STORY_BOTTOM : CANVAS_H - 50) - logoH - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);

  const ruleTop = blockTop + wSize + ruleGap;
  let y = ruleTop + 2 + ruleGap;
  // At the foot beside him: the lines stop short of his legs (≈ 2.4 face-widths from his face's centre).
  const sideW = upper ? maxW : Math.max(360 * k, Math.min(maxW, Math.abs(place.fx - (place.fx >= CANVAS_W / 2 ? M : CANVAS_W - M)) - 2.4 * place.faceW));
  const placed = sized.map((l) => {
    const top = y;
    l = { ...l, px: Math.min(l.px, sideW / Math.max(1, capsEm(l.text, l.tracking))) };
    y += l.px + gap;
    return { ...l, top };
  });

  // At the foot the block moves to the side away from him (never over his kit), flush to the margin.
  const align: "center" | "left" | "right" = upper ? "center" : place.fx >= CANVAS_W / 2 ? "left" : "right";
  const centred = (text: string, top: number, px: number, weight: number, tracking: number, opacity = 1) => (
    <div
      key={text + top}
      style={{
        position: "absolute",
        left: align === "center" ? 0 : M,
        width: align === "center" ? CANVAS_W : maxW,
        top,
        textAlign: align,
        // Tracking adds space after the last letter: balance it so the line sits truly centred / flush right.
        ...(align === "center" ? { paddingLeft: `${tracking}em` } : align === "right" ? { marginRight: `-${tracking}em` } : {}),
        boxSizing: "border-box",
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: px,
        lineHeight: 1,
        letterSpacing: `${tracking}em`,
        whiteSpace: "nowrap",
        opacity,
        textShadow: SHADOW,
      }}
    >
      {text}
    </div>
  );

  // The light falls on him: the vignette's clear centre sits on his body (face + ~1.6 face-heights).
  const cy = place.fy + place.fs * 1.6;
  const vignette = `radial-gradient(ellipse ${story ? 760 : 700}px ${story ? 1180 : 940}px at ${place.fx}px ${cy}px, rgba(0,0,0,0) 30%, rgba(0,0,0,.28) 62%, rgba(0,0,0,.62) 100%)`;
  const typeShade = upper
    ? { top: 0, height: blockTop + blockH + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,.16) 60%, rgba(0,0,0,0))" }
    : {
        bottom: 0,
        height: H - blockTop + (story ? 260 : 200),
        // A soft local shade on the type's side too: it never reads off bare (white) kit.
        background: `radial-gradient(ellipse ${maxW * 0.62}px ${blockH * 1.5}px at ${align === "left" ? M + maxW * 0.22 : CANVAS_W - M - maxW * 0.22}px ${(story ? 260 : 200) + blockH * 0.5}px, rgba(0,0,0,.32), rgba(0,0,0,0)), linear-gradient(to top, rgba(0,0,0,.52), rgba(0,0,0,.28) 55%, rgba(0,0,0,0))`,
      };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {/* He keeps the photo's own pixels; only his surroundings sink (no second copy of him, no rim). */}
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.45} />
      {!place.frame.fig && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", inset: 0, background: vignette }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />

      {centred(word, blockTop, wSize, 500, wTrack)}
      <div style={{ position: "absolute", left: align === "center" ? (CANVAS_W - 64 * k) / 2 : align === "left" ? M + 2 : CANVAS_W - M - 64 * k, width: 64 * k, top: ruleTop, height: 2, background: "rgba(244,241,234,.7)", boxShadow: "0 1px 6px rgba(0,0,0,.4)" }} />
      {placed.map((l) => centred(l.text, l.top, l.px, l.weight, l.tracking, l.opacity))}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: upper ? (CANVAS_W - logoW) / 2 : align === "left" ? M : CANVAS_W - M - logoW, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · spotlight (matchday): his real match photo with the surroundings sunk around him (NatSpot) and a
 * soft vignette, so he stands naturally lit. In the darkened area above him: "MATCHDAY" in wide-tracked medium
 * caps, a hairline, then HOME v AWAY (exact names, home first) and date · kick-off, small. NEYOD logo alone.
 */
export function Natlit({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <NatLitFrame
      data={data}
      word={word}
      lines={[
        { text: match, size: 23, weight: 700, tracking: 0.12 },
        { text: when, size: 19, weight: 600, tracking: 0.24, opacity: 0.9 },
      ]}
    />
  );
}
