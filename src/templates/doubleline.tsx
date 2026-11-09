/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

type Box = { left: number; top: number; width: number; height: number };

/** Ground, light and the two hairline colours: the club colour lifted to read on its own deep tone, and white. */
export function doubleTones(data: RenderData) {
  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  const left = luminance(club) < 0.12 ? shade(club, 0.45) : shade(club, 0.16);
  return { club, deep, lift, left, right: "rgba(255,255,255,.8)" };
}

/**
 * Two hairline echoes of his edge (echoline's edge filter: his alpha softened, thresholded, dilated, minus
 * itself), one shifted `dx` to the left in `left`, one shifted `dx` to the right in `right` — like a print
 * whose two plates slipped out of register. The filter regions stop a few px inside each box, so the
 * photo frame's straight cuts never draw a line. Clipped above `clipTop`.
 */
export function DoubleEdge({ id, url, box, H, dx, dy = 0, left, right, clipTop, fadeEnd, width = 2 }: { id: string; url: string; box: Box; H: number; dx: number; dy?: number; left: string; right: string; clipTop: number; fadeEnd?: number; width?: number }) {
  const echoes = [
    { k: "l", x: box.left - dx, color: left },
    { k: "r", x: box.left + dx, color: right },
  ];
  const y = box.top + dy;
  // The lines dissolve well above the foot's text.
  const fade = fadeEnd ? `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - 260)}px, transparent ${Math.round(fadeEnd)}px)` : undefined;
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }} aria-hidden>
      <defs>
        {echoes.map((e) => (
          <filter key={e.k} id={`${id}-${e.k}`} filterUnits="userSpaceOnUse" x={Math.max(-8, e.x + 5)} y={Math.max(clipTop - 8, y + 5)} width={Math.min(CANVAS_W + 8, e.x + box.width - 5) - Math.max(-8, e.x + 5)} height={Math.min(H + 8, y + box.height - 5) - Math.max(clipTop - 8, y + 5)} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
            <feComponentTransfer in="s" result="a">
              <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
            </feComponentTransfer>
            <feMorphology in="a" operator="dilate" radius={width} result="d" />
            <feComposite in="d" in2="a" operator="out" result="ring" />
            <feGaussianBlur in="ring" stdDeviation={0.35} result="q" />
            <feFlood floodColor={e.color} />
            <feComposite in2="q" operator="in" />
          </filter>
        ))}
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={clipTop} width={CANVAS_W} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {echoes.map((e) => (
          <image key={e.k} href={url} x={e.x} y={y} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-${e.k})`} />
        ))}
      </g>
    </svg>
  );
}

/** The top of his hair (the face box less its own height) stays under `minHead`: he moves down if not. */
export function keepHead<B extends Box>(data: RenderData, box: B, minHead: number, wholeTop = false): B {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const head = wholeTop ? box.top : box.top + Math.max(0, face[1] - face[3]) * box.height;
  return head < minHead ? { ...box, top: box.top + minHead - head } : box;
}

/**
 * Double line: the player in natural colour, centred on a clean deep ground, and two hairline echoes of his
 * own edge — one slipped to the left in the club colour, one slipped to the right in white, the same distance
 * each side — a slight double-exposure registration around him. The title small at the top; crests, the
 * fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Doubleline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { deep, lift, left, right } = doubleTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player, centred, and the two slips ---- */
  const box = keepHead(data, story ? placeByFace(data, 540, 360, { chest: 400, waist: 316, knees: 230, full: 172 }) : placeByFace(data, 540, 250, { chest: 286, waist: 224, knees: 168, full: 126 }), titleTop + tSize + (story ? 64 : 44));
  const dx = story ? 32 : 24;

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
  const CR = 40 * k;
  const crestTop = fixTop - CR - 28 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && <DoubleEdge id="doubleline" url={data.photoUrl} box={box} H={H} dx={dx} left={left} right={right} clipTop={titleTop + tSize + 34 * k} fadeEnd={crestTop - 30 * k} />}

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
