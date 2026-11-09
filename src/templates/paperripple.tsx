/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { keepHead } from "./doubleline";
import { cutMask } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, PaperTooth, paperTones } from "./paperecho";
import { capsEm, rippleRings, SilhouetteFx, withAlpha } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/** The deep club colour for hairlines on paper: darkened until it reads as a fine line on off-white. */
export function paperDeep(data: RenderData): string {
  let c = paperTones(data).club;
  for (let i = 0; i < 6 && luminance(c) > 0.075; i++) c = shade(c, -0.25);
  return c;
}

/**
 * Mask content (for SilhouetteFx `mask`): the effect fades in over `top`…`top`+80 (no hard cut under the
 * title) and fades out to nothing between fadeEnd−span and fadeEnd (above the foot).
 */
export function fadeMask(id: string, top: number, fadeEnd: number, span: number, H: number): ReactNode {
  const len = Math.max(1, fadeEnd - top);
  const a = Math.min(0.45, 80 / len);
  const b = Math.max(a, (fadeEnd - span - top) / len);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={fadeEnd}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset={a} stopColor="#fff" />
          <stop offset={b} stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={CANVAS_W + 400} height={H + 400} fill={`url(#${id}-fade)`} />
    </>
  );
}

/**
 * rippleRings, but fed his alpha "opened" first (eroded then dilated by `open` px): loose specks of the cutout
 * (hidden by his fade, yet ringed in ink on paper) drop out before the rings are drawn.
 */
export function cleanRipples(rings: Parameters<typeof rippleRings>[0], close?: number, open = 5): ReactNode[] {
  const prims = rippleRings(rings, close) as ReactNode[];
  return [
    <feMorphology key="o1" in="SourceAlpha" operator="erode" radius={open} result="o1" />,
    <feMorphology key="o2" in="o1" operator="dilate" radius={open} result="clean" />,
    ...prims.map((el) => (isValidElement<{ in?: string }>(el) && el.props.in === "SourceAlpha" ? cloneElement(el, { in: "clean" }) : el)),
  ];
}

/**
 * Paper ripple: rippleecho on light warm paper — the player centred in natural colour with a soft shade where
 * he meets the paper, and three hairline echoes of his own silhouette expanding outward around him in the deep
 * club colour, each further out, rounder and fainter. The title small and tracked in ink at the top; crests,
 * the fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Paperripple({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const { paper, light, edge, ink } = paperTones(data);
  const deep = paperDeep(data);

  /* ---- title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 40 * k;

  /* ---- foot ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo (~88px) ends at STORY_BOTTOM (top 1592); the date line ends 64px above it.
  const whenTop = (story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize) - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 40 * k;
  const crestTop = fixTop - CR - 28 * k;

  /* ---- the player, centred, with room for the rings ---- */
  const RS = story ? [24, 56, 96] : [18, 42, 72];
  const box = keepHead(data, story ? placeByFace(data, 540, 440, { chest: 380, waist: 300, knees: 222, full: 166 }) : placeByFace(data, 540, 300, { chest: 262, waist: 206, knees: 154, full: 116 }), clipTop + RS[1]);
  // He and his ripples melt into the paper above the foot.
  const fadeEnd = crestTop - 26 * k;
  const span = story ? 400 : 300;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - span - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 54% at 50% ${story ? 42 : 44}%, ${light}, ${paper} 62%, ${edge})` }} />

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={false} />

      {/* The ripples: his edge, three times, expanding outward around him in the deep club colour. */}
      {data.photoUrl && (
        <SilhouetteFx id="paperripple" url={data.photoUrl} box={box} H={H} clipTop={clipTop} cut={data.cut} pad={RS[2] + 40} mask={fadeMask("paperripple", clipTop, fadeEnd, span, H)}>
          {cleanRipples([
            { r: RS[0], color: withAlpha(deep, 0.95), w: story ? 1.8 : 1.5 },
            { r: RS[1], color: withAlpha(deep, 0.64), w: story ? 1.5 : 1.25 },
            { r: RS[2], color: withAlpha(deep, 0.38), w: story ? 1.5 : 1.25 },
          ], story ? 72 : 54)}
        </SilhouetteFx>
      )}

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: ink, opacity: 0.72 }}>{when}</div>}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <PaperTooth />
    </div>
  );
}
