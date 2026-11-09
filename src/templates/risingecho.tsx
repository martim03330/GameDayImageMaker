/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, withAlpha, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

export type Echo = { color: string; opacity: number };

/**
 * Place him centred with his face top at `faceTop`, then make sure the top of the cutout (a raised fist, the
 * hair) leaves `need` px of room under `ceiling` for the echoes: first by moving him down (up to `maxDrop`),
 * then by making him smaller.
 */
export function placeRising(data: RenderData, faceTop: number, sizes: Record<string, number>, ceiling: number, need: number, maxDrop: number, maxW = 1240, maxLean = 0, maxRise = 0): Box & { faceH: number; faceTop: number } {
  let ft = faceTop;
  let sz = sizes;
  const scaled = (s: number) => Object.fromEntries(Object.entries(sz).map(([key, v]) => [key, v * s]));
  let box = placeByFace(data, 540, ft, sz);
  // A wide pose (an arm flung out) is made smaller so the whole gesture fits.
  if (box.width > maxW) {
    sz = scaled(Math.max(0.7, maxW / box.width));
    box = placeByFace(data, 540, ft, sz);
  }
  const short = ceiling + need - box.top;
  // A small head leaves an empty band under the title: lift him (up to `maxRise`) so the stack starts near it.
  if (short < -40 && maxRise > 0) {
    ft -= Math.min(maxRise, -short - 40);
    box = placeByFace(data, 540, ft, sz);
  }
  if (short > 0) {
    const drop = Math.min(maxDrop, short);
    ft += drop;
    box = placeByFace(data, 540, ft, sz);
    const rest = ceiling + need - box.top;
    if (rest > 0) {
      // Smaller: the box shrinks around his face top, so its top comes down by the same fraction.
      const above = ft - box.top;
      sz = scaled(Math.max(0.62, (above - rest) / Math.max(1, above)));
      box = placeByFace(data, 540, ft, sz);
    }
  }
  // Optionally lean the figure back towards the centre when the face sits far off the middle of the cutout.
  const lean = Math.max(-maxLean, Math.min(maxLean, (CANVAS_W - (2 * box.left + box.width)) / 2));
  return { ...box, left: box.left + lean, faceTop: ft };
}

/**
 * The rising echoes: hairline copies of his own silhouette edge, each lifted `step` px above the last and a
 * little smaller (shrunk towards his face), so they stack straight up out of him. `echoes` nearest → highest.
 * Each copy is faded out from `fade` (face heights below his face top) (they read only above and beside him) and clipped under `clipTop`.
 */
export function RisingEchoes({ id, data, box, H, clipTop, step, echoes, width, fade = [-0.1, 1] }: { id: string; data: RenderData; box: Box & { faceH: number; faceTop: number }; H: number; clipTop: number; step: number; echoes: Echo[]; width: number; fade?: [number, number] }) {
  const url = data.photoUrl;
  if (!url) return null;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fx = box.left + box.width * (face[0] + face[2] / 2);
  const fy = box.faceTop + box.faceH / 2;
  const cut = data.cut;
  const copies = echoes.map((e, idx) => {
    const i = idx + 1;
    const s = 1 - 0.055 * i;
    const w = box.width * s;
    const h = box.height * s;
    const left = fx - (fx - box.left) * s;
    const top = fy - i * step - (fy - box.top) * s;
    // The filter runs only on what can be seen, and 5px inside any side where the photo frame cut him.
    const inL = (cut?.left ?? 0) > 0 ? 6 : -8;
    const inR = (cut?.right ?? 0) > 0 ? 6 : -8;
    const inT = (cut?.top ?? 0) > 0 ? 6 : -8;
    const x0 = Math.max(0, left + inL);
    const x1 = Math.min(CANVAS_W, left + w - inR);
    const y0 = Math.max(clipTop, top + inT);
    const y1 = Math.min(H, top + h - 6);
    return { ...e, i, left, top, w, h, region: { x: x0, y: y0, width: Math.max(1, x1 - x0), height: Math.max(1, y1 - y0) } };
  });
  // Below his shoulders the copies fade away, so the stack reads as rising from him. Each copy is smoothed a
  // little more than the one below it (the contour rounds off as it rises), yet stays a crisp line.
  const fadeFrom = box.faceTop + box.faceH * fade[0];
  const fadeTo = box.faceTop + box.faceH * fade[1];
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        {copies.map((c) => (
          <filter key={c.i} id={`${id}-e${c.i}`} filterUnits="userSpaceOnUse" {...c.region} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation={2.6 + c.i * 1.1} result="s" />
            <feComponentTransfer in="s" result="a">
              <feFuncA type="linear" slope={5} intercept={-2} />
            </feComponentTransfer>
            <feMorphology in="a" operator="dilate" radius={width} result="d" />
            <feComposite in="d" in2="a" operator="out" result="ring" />
            <feGaussianBlur in="ring" stdDeviation={0.35} result="q" />
            <feFlood floodColor={c.color} />
            <feComposite in2="q" operator="in" />
          </filter>
        ))}
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={fadeFrom} x2={0} y2={fadeTo}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={H}>
          <rect x={0} y={0} width={CANVAS_W} height={H} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        {[...copies].reverse().map((c) => (
          <image key={c.i} href={url} x={c.left} y={c.top} width={c.w} height={c.h} preserveAspectRatio="none" filter={`url(#${id}-e${c.i})`} opacity={c.opacity} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Rising echo: the player in natural colour, centred on a clean deep ground, and above him three or four
 * crisp hairline copies of his own silhouette edge stacked straight upward — each lifted, a little smaller
 * and fainter — as if he were lifting off. The title small at the top, clear of the echoes; crests, the
 * fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Risingecho({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  const whiteEchoes = r() < 0.55;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;

  const club = clubTone(data);
  const deep = shade(club, -0.82);
  const lift = shade(club, -0.6);
  const tint = luminance(club) < 0.12 ? shade(club, 0.55) : shade(club, 0.42);
  const col = (a: number) => (whiteEchoes ? `rgba(255,255,255,${a})` : withAlpha(tint, a));

  const f = matchFacts(data);

  /* ---- title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min(20 * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34 * k;

  /* ---- the player, centred, with the echoes stacked above him ---- */
  const n = story ? 4 : 3;
  const step = story ? 68 : 58;
  const box = story
    ? placeRising(data, 640, { chest: 330, waist: 270, knees: 204, full: 150 }, clipTop, n * step * 0.8 + 20, 140, 1240, 0, 90)
    : placeRising(data, 420, { chest: 236, waist: 190, knees: 144, full: 106 }, clipTop, n * step * 0.8 + 10, 110);
  const echoes: Echo[] = (story ? [0.95, 0.62, 0.36, 0.18] : [0.95, 0.58, 0.28]).map((a) => ({ color: col(1), opacity: a }));

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
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 50% at 50% ${story ? 34 : 36}%, ${lift}, ${deep} 82%)` }} />

      <RisingEchoes id="risingecho" data={data} box={box} H={H} clipTop={clipTop} step={step} echoes={echoes} width={story ? 1.6 : 1.25} />

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
