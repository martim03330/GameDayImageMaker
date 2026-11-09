/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { cutMask } from "./fx";
import { heroBase, wordStyle, type HeroBase } from "./goalheroshadow";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · black & white — the goal-hero layout (off-white ground, small NEYOD logo, the name wide-spaced in
 * the club colour, one enormous word at exact width, the celebrating cutout under it fading into the ground)
 * with the player in clean black and white: grayscale and a touch of contrast, nothing else. The word is the
 * only colour on the page. The face stays sharp (a colour treatment only, never a blur).
 */

/**
 * The goal-hero frame with hooks for a treated player: `ground` (any CSS background), `under` (drawn over the
 * ground, behind the word), `imgStyle` (merged into the cutout's style — a CSS filter), `defs` (SVG filters),
 * `nameColor`.
 */
export function HeroFxFrame({
  data,
  b,
  word,
  ground,
  under,
  imgStyle,
  defs,
  nameColor,
  glow = true,
}: {
  data: RenderData;
  b: HeroBase;
  word: ReactNode;
  ground?: string;
  under?: ReactNode;
  imgStyle?: CSSProperties;
  defs?: ReactNode;
  nameColor?: string;
  glow?: boolean;
}) {
  const { params } = data;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: b.H, overflow: "hidden", background: ground ?? b.ground }}>
      {defs}
      {glow && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />}
      {under}
      {word}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: b.fade, maskImage: b.fade }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: b.box.left, top: b.box.top, width: b.box.width, height: b.box.height, maxWidth: "none", ...cutMask(data.cut), ...imgStyle }}
          />
        </div>
      )}
      {b.name && (
        <div
          style={{ position: "absolute", left: 0, right: 0, top: b.nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: b.nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: nameColor ?? b.club, whiteSpace: "nowrap" }}
        >
          {b.name}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={b.story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: b.logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

/** The enormous word, at exact width, in one colour. */
export function HeroWordSvg({ b, fill }: { b: HeroBase; fill: string }) {
  return (
    <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
      <text x={b.wordLeft} y={b.baseline} style={{ ...wordStyle(b), fill }}>
        {b.word}
      </text>
    </svg>
  );
}

export function Goalherobw({ data }: { data: RenderData }) {
  const b = heroBase(data);
  return <HeroFxFrame data={data} b={b} word={<HeroWordSvg b={b} fill={b.club} />} imgStyle={{ filter: "grayscale(1) contrast(1.12) brightness(1.03)" }} />;
}
