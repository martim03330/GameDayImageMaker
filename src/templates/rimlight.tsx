/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, SilhouetteFx, withAlpha, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;
const WARM = "#fff3e2";

/** The rim colour: a warm white, or the club colour lifted until it reads as light. */
export function rimTones(data: RenderData, warm: boolean) {
  const club = clubTone(data);
  const ground = shade(club, -0.9);
  const air = shade(club, -0.76);
  const rim = warm ? WARM : luminance(club) < 0.12 ? shade(club, 0.62) : shade(club, 0.45);
  return { club, ground, air, rim };
}

/**
 * Filter primitives for a rim of light: his alpha (thresholded, small holes closed), a crisp ~3px band
 * straddling the edge (the light catching his outline), and two soft glows of it kept OUTSIDE his
 * silhouette only (the light spilling past him), all in `color`.
 */
export function rimPrimitives(color: string, width = 1.5, glow = 1): ReactNode {
  // The edge itself burns almost white; the spill keeps the colour.
  const core = shade(color, 0.55);
  return [
    <feGaussianBlur key="s" in="SourceAlpha" stdDeviation={1.4} result="s" />,
    <feComponentTransfer key="a0" in="s" result="a0">
      <feFuncA type="discrete" tableValues="0 0 1 1" />
    </feComponentTransfer>,
    <feMorphology key="c1" in="a0" operator="dilate" radius={3} result="c1" />,
    <feMorphology key="a" in="c1" operator="erode" radius={3} result="a" />,
    <feMorphology key="o" in="a" operator="dilate" radius={width * 0.6} result="o" />,
    <feMorphology key="i" in="a" operator="erode" radius={width} result="i" />,
    <feComposite key="band" in="o" in2="i" operator="out" result="band0" />,
    <feGaussianBlur key="bandS" in="band0" stdDeviation={0.55} result="band" />,
    <feGaussianBlur key="g1" in="band" stdDeviation={2.6 * glow} result="g1b" />,
    <feComponentTransfer key="g1t" in="g1b" result="g1c">
      <feFuncA type="linear" slope={1.5} />
    </feComponentTransfer>,
    <feComposite key="g1o" in="g1c" in2="a" operator="out" result="g1" />,
    <feGaussianBlur key="g2" in="band" stdDeviation={10 * glow} result="g2b" />,
    <feComponentTransfer key="g2t" in="g2b" result="g2c">
      <feFuncA type="linear" slope={0.95} />
    </feComponentTransfer>,
    <feComposite key="g2o" in="g2c" in2="a" operator="out" result="g2" />,
    <feMerge key="gm" result="spill">
      <feMergeNode in="g2" />
      <feMergeNode in="g1" />
    </feMerge>,
    <feFlood key="f" floodColor={color} result="f" />,
    <feComposite key="c" in="f" in2="spill" operator="in" result="glow" />,
    <feFlood key="f2" floodColor={core} result="f2" />,
    <feComposite key="c2" in="f2" in2="band" operator="in" result="edge" />,
    <feMerge key="m">
      <feMergeNode in="glow" />
      <feMergeNode in="edge" />
    </feMerge>,
  ];
}

/**
 * The player, backlit: his photo a touch darker (and darker still down the body, so the face keeps its
 * light), with the rim of light drawn over his edge. `light` is the mask (white = full rim) over the region.
 */
export function BacklitPlayer({ id, data, box, H, clipTop, rim, light, width, glow }: { id: string; data: RenderData; box: Box; H: number; clipTop: number; rim: string; light: ReactNode; width?: number; glow?: number }) {
  if (!data.photoUrl) return null;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const neck = (face[1] + face[3] * 1.15) * 100;
  const body = `linear-gradient(to bottom, transparent 0, transparent ${neck}%, #000 ${neck + 30}%)`;
  const img: CSSProperties = { width: "100%", height: "100%", display: "block", maxWidth: "none", ...cutMask(data.cut) };
  return (
    <>
      <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height }}>
        <img src={data.photoUrl} alt="" style={{ ...img, filter: "brightness(.8) contrast(1.08) saturate(.92)" }} />
      </div>
      {/* The body falls into shadow; the face keeps its light. */}
      <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: body, maskImage: body, opacity: 0.42 }}>
        <img src={data.photoUrl} alt="" style={{ ...img, filter: "brightness(0)" }} />
      </div>
      <SilhouetteFx id={id} url={data.photoUrl} box={box} H={H} clipTop={clipTop} cut={data.cut} pad={60} mask={light}>
        {rimPrimitives(rim, width, glow)}
      </SilhouetteFx>
    </>
  );
}

/**
 * Rim light: a very dark ground and the player strongly backlit — a thin bright rim of light hugging his
 * silhouette exactly (on the edge, no offset), glowing softly outward only, in a warm white or the club colour
 * lifted; he himself a little darker so the rim reads, his face still lit. Brightest across the head and
 * shoulders, dying away down the body. The title small at the top, the fixture between two small crests and
 * date · kick-off · ground small at the foot.
 */
export function Rimlight({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  const warm = r() < 0.5;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const { ground, air, rim } = rimTones(data, warm);

  const f = matchFacts(data);

  /* ---- title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min(20 * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player ---- */
  const box = story ? placeByFace(data, 540, 440, { chest: 390, waist: 310, knees: 230, full: 172 }) : placeByFace(data, 540, 300, { chest: 276, waist: 216, knees: 162, full: 122 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const headTop = box.top + box.height * face[1] - box.faceH * 0.5;

  /* ---- foot ---- */
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const CR = 34 * k;
  const F_TRACK = 0.3;
  const fixRoom = 952 - (crests.length === 2 ? 2 * (CR + 26 * k) : 0);
  const fixSize = Math.max(11, Math.min(17 * k, fixRoom / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(18 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  // Story: logo (~88px) top at 1592; the date line ends 64px above it.
  const whenTop = story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize;
  const fixMid = whenTop - 30 * k - CR / 2;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE });

  // The light comes from behind and above: full across head and shoulders, fading down the body.
  const lightTop = headTop;
  const lightEnd = story ? 1460 : CANVAS_H - 200;
  const light = (
    <>
      <defs>
        <linearGradient id="rimlight-l" gradientUnits="userSpaceOnUse" x1={0} y1={lightTop + box.faceH * 1.2} x2={0} y2={lightEnd}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.28} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={CANVAS_W + 400} height={H + 400} fill="url(#rimlight-l)" />
    </>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The air behind him barely lit by the source he hides. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(52% 34% at 50% ${((headTop + box.faceH * 1.6) / H) * 100}%, ${air}, ${ground} 85%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(30% 20% at 50% ${((headTop + box.faceH * 1.4) / H) * 100}%, ${withAlpha(rim, 0.07)}, transparent 80%)` }} />

      <BacklitPlayer id="rimlight" data={data} box={box} H={H} clipTop={titleTop + tSize + 16 * k} rim={rim} light={light} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 820 : 480, background: story ? `linear-gradient(to bottom, transparent, ${ground}e6 36%, ${ground} 58%)` : `linear-gradient(to bottom, transparent, ${ground}e0 55%, ${ground})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {fixture && (
        <div style={{ position: "absolute", left: M - 20, right: M - 20, top: fixMid - CR / 2, height: CR, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 * k }}>
          {crests.length === 2 && <img src={crests[0]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
          <div style={caps(fixSize, F_TRACK)}>{fixture}</div>
          {crests.length === 2 && <img src={crests[1]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
        </div>
      )}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.74)" }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
