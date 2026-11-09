/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { keepHead } from "./doubleline";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, SilhouetteFx } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

type Box = { left: number; top: number; width: number; height: number };

/** Stripes `dash` px wide every `period` px, turned to `angle`°, as an SVG data URL `w`×`h` (alpha only). */
function stripes(w: number, h: number, angle: number, period: number, dash: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><defs><pattern id='p' width='${period}' height='${period}' patternUnits='userSpaceOnUse' patternTransform='rotate(${angle})'><rect width='${period}' height='${dash}' fill='#000'/></pattern></defs><rect width='${w}' height='${h}' fill='url(#p)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * One hairline echo of his edge, offset by (dx, dy), drawn as an evenly DASHED line. The edge is echoline's
 * (his alpha softened, thresholded, dilated, minus itself). The dashes come from four stripe screens (0°, 45°,
 * 90°, 135°): each stretch of the edge takes the screen whose stripes cross it squarely, chosen by the
 * direction of his edge there (read with four pairs of grazing distant lights on his softened alpha), so the
 * dashes keep the same length all the way round (within ~8%). Stubs where two screens meet are blurred and
 * thresholded away. Drawn through SilhouetteFx, so the photo frame's cuts fade out instead of drawing a line.
 */
export function DashEdge({ id, url, box, H, dx, dy, color, clipTop, cut, fadeEnd, width = 2.8, period = 15, dash = 8.5 }: { id: string; url: string; box: Box; H: number; dx: number; dy: number; color: string; clipTop: number; cut?: RenderData["cut"]; fadeEnd?: number; width?: number; period?: number; dash?: number }) {
  const b = { ...box, left: box.left + dx, top: box.top + dy };
  const pad = 14;
  // SilhouetteFx's filter region (the stripe screens must cover exactly it).
  const rx = Math.max(-pad, b.left - pad);
  const ry = Math.max(clipTop - pad, b.top - pad);
  const rw = Math.ceil(Math.min(CANVAS_W + pad, b.left + b.width + pad) - rx);
  const rh = Math.ceil(Math.min(H + pad, b.top + b.height + pad) - ry);
  if (rw <= 0 || rh <= 0) return null;
  const angles = [0, 45, 90, 135];
  // N·L ≥ cos 22.5° → the edge's normal lies within ±22.5° of the light: 13 steps, the last one on.
  const sector = "0 0 0 0 0 0 0 0 0 0 0 0 1";
  const toAlpha = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0";
  const fade = fadeEnd ? (
    <>
      <defs>
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={fadeEnd - 240} x2={0} y2={fadeEnd}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={rx} y={ry} width={rw} height={rh} fill={`url(#${id}-fade)`} />
    </>
  ) : undefined;
  return (
    <SilhouetteFx id={id} url={url} box={b} H={H} clipTop={clipTop} cut={cut} pad={pad} mask={fade}>
      <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
      <feComponentTransfer in="s" result="a">
        <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
      </feComponentTransfer>
      <feMorphology in="a" operator="dilate" radius={width} result="d" />
      <feComposite in="d" in2="a" operator="out" result="ring" />
      {/* The direction of his edge: his alpha softened into a slope, lit flat from each side. */}
      <feGaussianBlur in="a" stdDeviation={4} result="slope" />
      {angles.flatMap((a) =>
        [a, a + 180].flatMap((az) => [
          <feDiffuseLighting key={`l${az}`} in="slope" surfaceScale={80} diffuseConstant={1} lightingColor="#ffffff" result={`l${az}`}>
            <feDistantLight azimuth={az} elevation={0} />
          </feDiffuseLighting>,
          <feColorMatrix key={`c${az}`} in={`l${az}`} type="matrix" values={toAlpha} result={`c${az}`} />,
          <feComponentTransfer key={`t${az}`} in={`c${az}`} result={`t${az}`}>
            <feFuncA type="discrete" tableValues={sector} />
          </feComponentTransfer>,
        ]),
      )}
      {angles.flatMap((a) => [
        <feImage key={`i${a}`} href={stripes(rw, rh, a, period, dash)} x={rx} y={ry} width={rw} height={rh} preserveAspectRatio="none" result={`i${a}`} />,
        <feMerge key={`m${a}`} result={`m${a}`}>
          <feMergeNode in={`t${a}`} />
          <feMergeNode in={`t${a + 180}`} />
        </feMerge>,
        <feComposite key={`p${a}`} in={`i${a}`} in2={`m${a}`} operator="in" result={`p${a}`} />,
      ])}
      <feMerge result="screen">
        {angles.map((a) => (
          <feMergeNode key={a} in={`p${a}`} />
        ))}
      </feMerge>
      <feComposite in="ring" in2="screen" operator="in" result="dashes" />
      {/* Stubs where two screens meet are too small to survive a soft blur and a half threshold. */}
      <feGaussianBlur in="dashes" stdDeviation={0.8} result="e" />
      <feComponentTransfer in="e" result="o">
        <feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
      </feComponentTransfer>
      <feGaussianBlur in="o" stdDeviation={0.35} result="q" />
      <feFlood floodColor={color} />
      <feComposite in2="q" operator="in" />
    </SilhouetteFx>
  );
}

/** Ground and the dashed echo's colour: white, or the club colour lifted to read on its own deep tone (by seed). */
export function dashTones(data: RenderData) {
  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  const whiteEcho = rng(data.params.seed ?? 11)() < 0.5;
  const echo = whiteEcho ? "rgba(255,255,255,.9)" : luminance(club) < 0.12 ? shade(club, 0.45) : shade(club, 0.18);
  return { club, deep, lift, echo };
}

/**
 * Dash echo: echoline with its single echo drawn as a clean dashed line — the player in natural colour on a
 * deep club ground, and one hairline of his own edge, offset behind him towards the free side and up, in
 * short even dashes (white or the club colour). The title small and tracked at the top; crests, the fixture
 * (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Dashecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng((params.seed ?? 11) + 3);
  const toLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { deep, lift, echo } = dashTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34 * k;

  /* ---- the player and his dashed echo ---- */
  const dx = (toLeft ? -42 : 42) * k;
  const dy = -34 * k;
  // His head, and the echo's raised head too, stay under the title.
  const box = keepHead(data, story ? placeByFace(data, 540, 330, { chest: 420, waist: 330, knees: 240, full: 180 }) : placeByFace(data, 540, 250, { chest: 290, waist: 228, knees: 170, full: 128 }), clipTop + 14 * k - dy);

  /* ---- foot ---- */
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo (~88px) ends at STORY_BOTTOM (top 1592); the date line ends 64px above it.
  const whenTop = (story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize) - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 42 * k;
  const crestTop = fixTop - CR - 28 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && <DashEdge id="dashecho" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={clipTop} cut={data.cut} width={story ? 3.5 : 2.8} period={story ? 20 : 15} dash={story ? 11 : 8.5} />}

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 880 : 520, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 30%, ${deep} 52%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
