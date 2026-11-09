/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

type Box = { left: number; top: number; width: number; height: number };

/** Echoline's palette: deep club ground, a lifted centre, and the echo (white, or the club colour lifted to read on its ground). */
export function echoTones(data: RenderData, white: boolean) {
  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  const echo = white ? "rgba(255,255,255,.75)" : luminance(club) < 0.12 ? shade(club, 0.4) : shade(club, 0.12);
  return { club, deep, lift, echo };
}

/**
 * Echoline's echo: the cutout's own edge as a hairline (alpha softened, thresholded, dilated, minus itself),
 * drawn at `box` shifted by (dx, dy), clipped above `clipTop`. The filter region stops a few px inside the box,
 * so the photo frame's straight cuts never draw a line.
 */
export function EchoEdge({ id, url, box, H, dx, dy, color, clipTop, width = 2, fade }: { id: string; url: string; box: Box; H: number; dx: number; dy: number; color: string; clipTop: number; width?: number; fade?: string }) {
  const ex = box.left + dx;
  const ey = box.top + dy;
  const x0 = Math.max(-8, ex + 5);
  const y0 = Math.max(clipTop - 8, ey + 5);
  const x1 = Math.min(CANVAS_W + 8, ex + box.width - 5);
  const y1 = Math.min(H + 8, ey + box.height - 5);
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }} aria-hidden>
      <defs>
        <filter id={`${id}-edge`} filterUnits="userSpaceOnUse" x={x0} y={y0} width={Math.max(1, x1 - x0)} height={Math.max(1, y1 - y0)} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
          <feComponentTransfer in="s" result="a">
            <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
          </feComponentTransfer>
          <feMorphology in="a" operator="dilate" radius={width} result="d" />
          <feComposite in="d" in2="a" operator="out" result="ring" />
          <feGaussianBlur in="ring" stdDeviation={0.3} result="q" />
          <feFlood floodColor={color} />
          <feComposite in2="q" operator="in" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={clipTop} width={CANVAS_W} height={H} />
        </clipPath>
      </defs>
      <image clipPath={`url(#${id}-clip)`} href={url} x={ex} y={ey} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-edge)`} />
    </svg>
  );
}

/** His hair (the face box less ~0.6 of its height) stays under `minHead`: he moves down if not. */
export function headClear<B extends Box & { faceH: number }>(data: RenderData, box: B, minHead: number): B {
  const head = box.top + (data.face?.[1] ?? 0.08) * box.height - box.faceH * 0.6;
  return head < minHead ? { ...box, top: box.top + minHead - head } : box;
}

/** Barlow Condensed 600 caps: advance widths per 100px (measured in the browser). */
const COND_W: Record<string, number> = { A: 45.6, B: 46.2, C: 45.7, D: 47.2, E: 43.5, F: 41.5, G: 46.2, H: 47.7, I: 22.4, J: 44.3, K: 47.7, L: 41.5, M: 53.8, N: 50.7, O: 46.7, P: 45.7, Q: 45.5, R: 46.1, S: 43.4, T: 45.2, U: 47.8, V: 47.1, W: 66.5, X: 46, Y: 45.6, Z: 40.6, " ": 20, "-": 32.5, "'": 15.2, ".": 21.1 };
const condEm = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/’/g, "'")].reduce((a, c) => a + (COND_W[c] ?? 46) / 100, 0);

/**
 * Echo name: echoline (the player in natural colour on a deep club ground, one hairline echo of his edge
 * offset behind him) with his surname set very large behind him as a hairline outline — the same stroke and
 * colour as the echo, so word and echo read as one drawing — partly hidden by his figure. The title small at
 * the top; crests, the fixture (home first, names exactly as stored) and date · kick-off · ground at the foot.
 */
export function Echoname({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const toLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const whiteEcho = r() < 0.4;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { deep, lift, echo } = echoTones(data, whiteEcho);
  const f = matchFacts(data);

  /* ---- the title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34;

  /* ---- the player and his echo ---- */
  const box = headClear(data, story ? placeByFace(data, 540, 470, { chest: 350, waist: 280, knees: 210, full: 160 }) : placeByFace(data, 540, 300, { chest: 270, waist: 214, knees: 160, full: 120 }), clipTop + 30 * k);
  const dx = (toLeft ? -42 : 42) * k;
  const dy = -34 * k;

  /* ---- the surname, an outline behind him ---- */
  const surname = ((content.lastName || content.firstName || "").trim()).toUpperCase();
  const wordW = CANVAS_W - 2 * (story ? 48 : 52);
  const wordSize = surname ? Math.min((story ? 400 : 330) * ts, wordW / Math.max(1, condEm(surname))) : 0;
  const natural = condEm(surname) * wordSize;
  // Cap height ~0.7em; its middle a little under his face's middle, so the letters flank his head and neck.
  const capH = wordSize * 0.7;
  const faceMid = box.top + (data.face?.[1] ?? 0.08) * box.height + box.faceH * 0.5;
  const capTop = Math.max(clipTop + 24 * k, faceMid + box.faceH * (story ? 0 : 0.35) - capH / 2);
  const baseline = capTop + capH;

  /* ---- the foot ---- */
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo (~88px) ends at STORY_BOTTOM, top 1592; the date line ends 64px above it.
  const whenTop = story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize;
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 42 * k;
  const crestTop = fixTop - CR - 28 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {/* His surname, a hairline outline in the echo's colour and weight. */}
      {surname && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text
            x={540}
            y={baseline}
            textAnchor="middle"
            textLength={natural}
            lengthAdjust="spacingAndGlyphs"
            fill="none"
            stroke={echo}
            strokeWidth={2 * (story ? 1.1 : 1)}
            strokeLinejoin="round"
            style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: wordSize, letterSpacing: 0 }}
          >
            {surname}
          </text>
        </svg>
      )}

      {data.photoUrl && <EchoEdge id="echoname" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={clipTop} />}

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
