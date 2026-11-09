/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

export type Box = { left: number; top: number; width: number; height: number };

/** Inter caps, roughly, with the tracking added per glyph (accents ignored). */
export const capsEm = (t: string, tracking: number) =>
  [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/**
 * An SVG layer that draws the cutout through `filter` (children = the filter primitives), with the effect
 * faded out along any side where the photo frame cut him (there the edge is the frame, not his outline),
 * and clipped above `clipTop` so nothing runs into the title.
 */
export function SilhouetteFx({ id, url, box, H, clipTop, cut, pad, mask, children }: { id: string; url: string; box: Box; H: number; clipTop: number; cut?: RenderData["cut"]; pad: number; mask?: ReactNode; children: ReactNode }) {
  const sides = (["left", "right", "top", "bottom"] as const).filter((s) => (cut?.[s] ?? 0) > 0);
  const { left: L, top: T, width: W, height: Hh } = box;
  const grad = { left: [L, 0, L + W * 0.24, 0], right: [L + W, 0, L + W * 0.76, 0], top: [0, T, 0, T + Hh * 0.1], bottom: [0, T + Hh, 0, T + Hh * 0.8] } as const;
  // The filter only runs where it can be seen (the box often runs far below the canvas).
  const rx = Math.max(-pad, L - pad);
  const ry = Math.max(clipTop - pad, T - pad);
  const region = { x: rx, y: ry, width: Math.min(CANVAS_W + pad, L + W + pad) - rx, height: Math.min(H + pad, T + Hh + pad) - ry };
  let inner: ReactNode = <image href={url} x={L} y={T} width={W} height={Hh} preserveAspectRatio="none" filter={`url(#${id}-fx)`} />;
  for (const sd of sides) inner = <g mask={`url(#${id}-m-${sd})`}>{inner}</g>;
  if (mask) inner = <g mask={`url(#${id}-dir)`}>{inner}</g>;
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <filter id={`${id}-fx`} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
          {children}
        </filter>
        {sides.map((sd) => (
          <linearGradient key={sd} id={`${id}-g-${sd}`} gradientUnits="userSpaceOnUse" x1={grad[sd][0]} y1={grad[sd][1]} x2={grad[sd][2]} y2={grad[sd][3]}>
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
        ))}
        {sides.map((sd) => (
          <mask key={sd} id={`${id}-m-${sd}`} maskUnits="userSpaceOnUse" {...region}>
            <rect {...region} fill={`url(#${id}-g-${sd})`} />
          </mask>
        ))}
        {mask && (
          <mask id={`${id}-dir`} maskUnits="userSpaceOnUse" {...region}>
            {mask}
          </mask>
        )}
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={clipTop} width={CANVAS_W} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>{inner}</g>
    </svg>
  );
}

/** feFuncA table: alpha below `t` → 0, from `t` on → 1 (`t` a multiple of 1/n). */
const step = (t: number) => {
  const n = Math.round(1 / Math.min(t, 1 - t));
  const cut = Math.round(t * n);
  return Array.from({ length: n }, (_, i) => (i < cut ? "0" : "1")).join(" ");
};

/**
 * Grow (`by` > 0) or shrink (`by` < 0) a hard alpha by |by| px, cheaply: blur by |by|/2 and threshold two σ
 * out (or in). Edges come out a little rough; they are re-smoothed downstream.
 */
function grow(key: string, inp: string, by: number, result: string): ReactNode[] {
  return [
    <feGaussianBlur key={`${key}b`} in={inp} stdDeviation={Math.abs(by) / 2} result={`${key}x`} />,
    <feComponentTransfer key={`${key}t`} in={`${key}x`} result={result}>
      <feFuncA type="discrete" tableValues={step(by > 0 ? 0.023 : 0.977)} />
    </feComponentTransfer>,
  ];
}

/**
 * Filter primitives for ripple rings. His alpha is closed once (gaps under the arms and small holes fill in),
 * then for each ring grown by most of its distance and blurred wide before being thresholded at a quarter:
 * the threshold carries the shape the rest of the way out and rounds it, so each ring is smoother than the one
 * inside it, like a ripple losing his shape. A ring = that shape minus itself eroded → a hairline at that
 * distance. `rings` inner → outer, `r` = distance from his edge in px. Blur-and-threshold only (no large
 * feMorphology radii — those cost seconds per render).
 */
export function rippleRings(rings: { r: number; color: string; w?: number }[], close = 40): ReactNode {
  const out: ReactNode[] = [
    <feGaussianBlur key="s0b" in="SourceAlpha" stdDeviation={2.2} result="s0b" />,
    <feComponentTransfer key="s0t" in="s0b" result="s0a">
      <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
    </feComponentTransfer>,
    ...grow("c1", "s0a", close, "s0c"),
    ...grow("c2", "s0c", -close, "g0"),
  ];
  rings.forEach((g, i) => {
    // Threshold 0.25 of a blurred edge sits 0.67σ outside it.
    const sigma = Math.max(3, g.r * 0.3);
    const by = Math.max(0, g.r - 0.67 * sigma);
    out.push(
      ...(by > 1 ? grow(`d${i}`, "g0", by, `d${i}`) : []),
      <feGaussianBlur key={`b${i}`} in={by > 1 ? `d${i}` : "g0"} stdDeviation={sigma} result={`b${i}`} />,
      <feComponentTransfer key={`t${i}`} in={`b${i}`} result={`s${i}`}>
        <feFuncA type="discrete" tableValues="0 1 1 1" />
      </feComponentTransfer>,
      <feMorphology key={`e${i}`} in={`s${i}`} operator="erode" radius={g.w ?? 1} result={`e${i}`} />,
      <feComposite key={`r${i}`} in={`s${i}`} in2={`e${i}`} operator="out" result={`r${i}`} />,
      <feGaussianBlur key={`a${i}`} in={`r${i}`} stdDeviation={0.4} result={`q${i}`} />,
      <feFlood key={`f${i}`} floodColor={g.color} result={`f${i}`} />,
      <feComposite key={`c${i}`} in={`f${i}`} in2={`q${i}`} operator="in" result={`c${i}`} />,
    );
  });
  out.push(
    <feMerge key="m">
      {rings.map((_, i) => (
        <feMergeNode key={i} in={`c${rings.length - 1 - i}`} />
      ))}
    </feMerge>,
  );
  return out;
}

/**
 * Ripple echo: the player in natural colour, centred on a clean deep ground, and around him three hairline
 * echoes of his own silhouette expanding outward — concentric, like ripples from a stone dropped where he
 * stands — each further out, rounder and fainter. The title small at the top; crests, the fixture (home first,
 * names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Rippleecho({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 7);
  const whiteRings = r() < 0.5;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;

  const club = clubTone(data);
  const deep = shade(club, -0.82);
  const lift = shade(club, -0.62);
  const ringBase = luminance(club) < 0.12 ? shade(club, 0.5) : shade(club, 0.25);
  const ring = (a: number) => (whiteRings ? `rgba(255,255,255,${a})` : withAlpha(ringBase, a));

  const f = matchFacts(data);

  /* ---- title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min(20 * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player, centred, with room for the rings ---- */
  const box = story ? placeByFace(data, 540, 470, { chest: 360, waist: 290, knees: 214, full: 160 }) : placeByFace(data, 540, 300, { chest: 262, waist: 206, knees: 154, full: 116 });
  const RS = story ? [24, 56, 96] : [18, 42, 72];

  /* ---- foot ---- */
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(18 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo is ~88px tall and ends at STORY_BOTTOM (top 1592); the date line ends 64px above it.
  const whenTop = story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize;
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 40 * k;
  const crestTop = fixTop - CR - 28 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 46% at 50% ${story ? 44 : 46}%, ${lift}, ${deep} 82%)` }} />

      {/* The ripples: his edge, three times, expanding outward around him. */}
      {data.photoUrl && (
        <SilhouetteFx id="rippleecho" url={data.photoUrl} box={box} H={H} clipTop={titleTop + tSize + 40 * k} cut={data.cut} pad={RS[2] + 40}>
          {rippleRings([
            { r: RS[0], color: ring(0.82), w: 1.5 },
            { r: RS[1], color: ring(0.5), w: 1.2 },
            { r: RS[2], color: ring(0.28), w: 1.2 },
          ])}
        </SilhouetteFx>
      )}

      {/* The player, natural colour. */}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 520, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 34%, ${deep} 56%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

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
      <Film strength={0.16} />
    </div>
  );
}

/** "#rrggbb" + alpha → rgba(). */
export function withAlpha(hex: string, a: number): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}
