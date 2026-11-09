/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
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

export type Box = { left: number; top: number; width: number; height: number };

/** The deep ground, its soft lift, and the giant's flat tone — the club colour a few steps up from the ground. */
export function giantTones(data: RenderData) {
  const club = clubTone(data);
  const deep = shade(club, -0.82);
  const lift = shade(club, -0.7);
  // Lighter than the ground, but never loud: a dark club colour needs a bigger step to show.
  const giant = luminance(club) < 0.08 ? shade(club, -0.38) : shade(club, -0.55);
  return { club, deep, lift, giant };
}

/**
 * His silhouette as ONE flat, crisp shape in `color`: the cutout's alpha, softened, thresholded and closed
 * (small holes between fingers and arms filled), no blur on the result. Drawn in canvas coordinates; whatever
 * leaves the canvas is simply cropped.
 */
export function GiantShape({ id, url, box, H, color, close = 9, fade }: { id: string; url: string; box: Box; H: number; color: string; close?: number; fade?: [number, number] }) {
  // Optionally the shape melts away towards the foot, between the two canvas heights in `fade`.
  const m = fade ? `linear-gradient(to bottom, #000 ${(fade[0] / H) * 100}%, transparent ${(fade[1] / H) * 100}%)` : undefined;
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, WebkitMaskImage: m, maskImage: m }} aria-hidden>
      <defs>
        <filter id={`${id}-flat`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={H} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.4} result="s" />
          <feComponentTransfer in="s" result="a0">
            <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
          </feComponentTransfer>
          <feMorphology in="a0" operator="dilate" radius={close} result="c1" />
          <feMorphology in="c1" operator="erode" radius={close} result="c2" />
          <feGaussianBlur in="c2" stdDeviation={1.6} result="c3" />
          <feComponentTransfer in="c3" result="a">
            <feFuncA type="linear" slope={3} intercept={-1} />
          </feComponentTransfer>
          <feFlood floodColor={color} />
          <feComposite in2="a" operator="in" />
        </filter>
      </defs>
      <image href={url} x={box.left} y={box.top} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-flat)`} />
    </svg>
  );
}

/**
 * Like placeByFace, but in a tall story he only has to reach `minBottom` (under the foot's fade), not the
 * canvas bottom — so he stays the smaller figure in front of the giant.
 */
export function frontBox(data: RenderData, cx: number, faceTop: number, sizes: Record<string, number>, minBottom?: number): Box {
  if (minBottom == null) return placeByFace(data, cx, faceTop, sizes);
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  let faceH = (sizes[p.framing ?? "waist"] ?? sizes.waist ?? 170) * (p.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  const h = Math.max(faceH / face[3], (minBottom - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * (data.photoAspect ?? 0.6);
  return { left: cx - w * (face[0] + face[2] / 2) + (p.playerX ?? 0), top: faceTop - h * face[1] + (p.playerY ?? 0), width: w, height: h };
}

/** How much to blow him up so the giant's face is about `faceH` tall (never under 1.8×, never over 3.2×). */
export function giantScale(data: RenderData, box: Box, faceH: number): number {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  return Math.max(1.8, Math.min(3.2, faceH / Math.max(1, box.height * face[3])));
}

/**
 * The giant: the player's box scaled by `scale`, its face centred on `cx`, and either its hair (`hairTop`) or
 * its face top (`faceTop`) at the given line.
 */
export function giantBox(data: RenderData, box: Box, o: { scale: number; cx: number; hairTop?: number; faceTop?: number; wholeTop?: number }): Box {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const w = box.width * o.scale;
  const h = box.height * o.scale;
  const fx = face[0] + face[2] / 2;
  const top = o.wholeTop != null ? o.wholeTop : o.faceTop != null ? o.faceTop - face[1] * h : (o.hairTop ?? 0) - Math.max(0, face[1] - face[3] * 0.55) * h;
  return { left: o.cx - fx * w, top, width: w, height: h };
}

/**
 * Giant silhouette: a deep, clean club-tone ground; behind the player, his own silhouette blown up about
 * twice as a single flat shape a few steps lighter than the ground — no glow, no texture, no fill image —
 * so big the canvas crops it and only the giant's head and shoulders read, like a shadow on a stadium wall.
 * The player in natural colour, smaller, in front on the other side. "Matchday" small at the top; the
 * fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Giantsilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side !== "right";
  const dir = onLeft ? 1 : -1;
  const { deep, lift, giant } = giantTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player (front, smaller) and the giant (behind, ~2×) ---- */
  const faceTop = story ? 760 : 470;
  const box = frontBox(data, 540 - dir * (story ? 150 : 140), faceTop, story ? { chest: 300, waist: 230, knees: 176, full: 140 } : { chest: 230, waist: 176, knees: 136, full: 108 }, story ? H - 280 : undefined);
  // Big enough that only his head and shoulders fit: the giant's face ~420px (post) / ~540px (story).
  const scale = giantScale(data, box, story ? 540 : 420);
  const gx = 540 + dir * (story ? 150 : 130);
  // The giant's whole top (his hair) sits clear below the title; the canvas crops the rest.
  const big = giantBox(data, box, { scale, cx: gx, wholeTop: titleTop + tSize + (story ? 90 : 70) });

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
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 55% at ${50 + dir * 12}% 32%, ${lift}, ${deep} 82%)` }} />

      {data.photoUrl && <GiantShape id="giantsilhouette" url={data.photoUrl} box={big} H={H} color={giant} />}

      {/* A breath of shadow where he stands against the giant, so the two planes separate. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.1, top: box.top + box.height * 0.08, width: box.width * 0.8, height: box.height * 0.6, borderRadius: "50%", background: deep, opacity: 0.35, filter: `blur(${60 * k}px)` }} />

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 880 : 470, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 34%, ${deep} 56%)` : `linear-gradient(to bottom, transparent, ${deep}d9 52%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
