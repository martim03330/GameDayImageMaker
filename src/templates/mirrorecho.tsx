/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
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

/** Inter caps, roughly, with the tracking added per glyph (accents ignored). */
export const capsEm = (t: string, tracking: number) =>
  [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

type Box = { left: number; top: number; width: number; height: number };

/** The pair: the player on his side of the centre line, and the mirrored box of his twin on the other. */
export function mirrorPair(data: RenderData, o: { onLeft: boolean; faceTop: number; sizes: Record<string, number>; minHead: number; minBottom?: number; wholeTop?: boolean; maxHalf?: number }): { box: Box; twin: Box } {
  const dir = o.onLeft ? 1 : -1;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  let box: Box = placeByFace(data, 540, o.faceTop, o.sizes);
  if (o.minBottom != null) {
    // Like placeByFace, but he only has to reach `minBottom` (under the foot's fade), not the canvas bottom,
    // so two figures fit side by side in a tall story.
    const p = data.params;
    let faceH = (o.sizes[p.framing ?? "waist"] ?? o.sizes.waist ?? 170) * (p.playerScale ?? 1);
    if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
    const h = Math.max(faceH / face[3], (o.minBottom - o.faceTop) / Math.max(0.2, 1 - face[1]));
    const w = h * (data.photoAspect ?? 0.6);
    box = { left: 540 - w * (face[0] + face[2] / 2) + (p.playerX ?? 0), top: o.faceTop - h * face[1] + (p.playerY ?? 0), width: w, height: h };
  }
  // The pair is symmetric about the centre: keep its outer edges (a raised fist included) within `maxHalf`
  // of it, shrinking him around his face when he is too wide.
  if (o.maxHalf) {
    const fx = face[0] + face[2] / 2;
    for (let i = 0; i < 4; i++) {
      const off = Math.max(140, Math.min(250, box.width * 0.3));
      const half = Math.max(fx, 1 - fx) * box.width + off;
      if (half <= o.maxHalf + 1) break;
      const sc = Math.max(0.5, (o.maxHalf - off) / (half - off));
      const cx = box.left + fx * box.width;
      const fy = box.top + face[1] * box.height;
      box = { left: cx - fx * box.width * sc, top: fy - face[1] * box.height * sc, width: box.width * sc, height: box.height * sc };
    }
  }
  // The top of his hair (the face box less its own height) stays clear of the title.
  // (With `wholeTop`, the top of the whole cutout: a raised fist counts too.)
  const head = o.wholeTop ? box.top : box.top + Math.max(0, face[1] - face[3]) * box.height;
  if (head < o.minHead) box = { ...box, top: box.top + o.minHead - head };
  // Far enough apart that the twin reads as a second figure, close enough that they face each other.
  const off = Math.max(140, Math.min(250, box.width * 0.3));
  box = { ...box, left: box.left - dir * off };
  const twin = { left: CANVAS_W - box.left - box.width, top: box.top, width: box.width, height: box.height };
  return { box, twin };
}

/**
 * His silhouette mirrored left↔right and drawn ONLY as a hairline — the cutout's own edge (same edge filter
 * as echoline: a slightly smoothed alpha, thresholded, dilated, minus itself), in `color`, clipped below `clipTop`.
 */
export function MirrorOutline({ id, url, twin, H, color, clipTop, cut, width = 2 }: { id: string; url: string; twin: Box; H: number; color: string; clipTop: number; cut?: RenderData["cut"]; width?: number }) {
  // Where the photo frame cut him, the edge is the frame, not his outline: fade the hairline out along it.
  const sides = (["left", "right", "top", "bottom"] as const).filter((s) => (cut?.[s] ?? 0) > 0);
  const W = twin.width;
  const T = twin.top;
  const Hh = twin.height;
  const grad = { left: [0, 0, W * 0.24, 0], right: [W, 0, W * 0.76, 0], top: [0, T, 0, T + Hh * 0.1], bottom: [0, T + Hh, 0, T + Hh * 0.8] } as const;
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <filter id={`${id}-edge`} filterUnits="userSpaceOnUse" x={-12} y={twin.top - 12} width={twin.width + 24} height={twin.height + 24} colorInterpolationFilters="sRGB">
          {/* His alpha, softened and thresholded; then closed (dilate, erode) so small holes inside the silhouette
              vanish, and re-softened so the closing leaves no square corners. Only the outer edge is drawn. */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
          <feComponentTransfer in="s" result="a0">
            <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
          </feComponentTransfer>
          <feMorphology in="a0" operator="dilate" radius={7} result="c1" />
          <feMorphology in="c1" operator="erode" radius={7} result="c2" />
          <feGaussianBlur in="c2" stdDeviation={2.6} result="c3" />
          <feComponentTransfer in="c3" result="a">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feMorphology in="a" operator="dilate" radius={width} result="d" />
          <feComposite in="d" in2="a" operator="out" result="ring" />
          <feFlood floodColor={color} />
          <feComposite in2="ring" operator="in" />
        </filter>
        {sides.map((sd) => (
          <linearGradient key={sd} id={`${id}-g-${sd}`} gradientUnits="userSpaceOnUse" x1={grad[sd][0]} y1={grad[sd][1]} x2={grad[sd][2]} y2={grad[sd][3]}>
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
        ))}
        {sides.map((sd) => (
          <mask key={sd} id={`${id}-m-${sd}`} maskUnits="userSpaceOnUse" x={-20} y={T - 20} width={W + 40} height={Hh + 40}>
            <rect x={-20} y={T - 20} width={W + 40} height={Hh + 40} fill={`url(#${id}-g-${sd})`} />
          </mask>
        ))}
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={clipTop} width={CANVAS_W} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <g transform={`translate(${twin.left + twin.width} 0) scale(-1 1)`}>
          {sides.reduce(
            (inner, sd) => (
              <g mask={`url(#${id}-m-${sd})`}>{inner}</g>
            ),
            <image href={url} x={0} y={twin.top} width={twin.width} height={twin.height} preserveAspectRatio="none" filter={`url(#${id}-edge)`} />,
          )}
        </g>
      </g>
    </svg>
  );
}

/** Ground, light and the hairline colour (white, or the club colour lifted to read on its own deep tone). */
export function mirrorTones(data: RenderData, white: boolean) {
  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  const line = white ? "rgba(255,255,255,.78)" : luminance(club) < 0.12 ? shade(club, 0.45) : shade(club, 0.18);
  return { club, deep, lift, line };
}

/**
 * Mirror echo: the player in natural colour on a clean deep ground, and facing him a second copy of his own
 * silhouette — mirrored, drawn only as a thin hairline in the club colour or white — like his reflection or
 * the rival across the line. The title small at the top, the fixture (home first, names exactly as stored)
 * and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Mirrorecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 17);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side !== "right";
  const { deep, lift, line } = mirrorTones(data, r() < 0.4);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the pair ---- */
  const { box, twin } = mirrorPair(data, {
    onLeft,
    faceTop: story ? 400 : 262,
    sizes: story ? { chest: 300, waist: 236, knees: 180, full: 140 } : { chest: 250, waist: 200, knees: 150, full: 116 },
    minHead: titleTop + tSize + (story ? 70 : 50),
    minBottom: story ? H - 290 : undefined,
    maxHalf: 580,
  });

  /* ---- foot: fixture, date · kick-off · ground ---- */
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 42%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && <MirrorOutline id="mirrorecho" url={data.photoUrl} cut={data.cut} twin={twin} H={H} color={line} clipTop={titleTop + tSize + (story ? 44 : 30)} />}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 32%, ${deep} 55%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
