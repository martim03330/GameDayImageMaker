/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { keepHead } from "./doubleline";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, SilhouetteFx } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;
const PAPER = "#efece6";

type Box = { left: number; top: number; width: number; height: number };

const hex = (h: string) => {
  const m = h.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  return m ? [1, 2, 3].map((i) => parseInt(m[i], 16)) : [0, 0, 0];
};
/** `a` mixed towards `b` by `t`. */
export function mix(a: string, b: string, t: number): string {
  const A = hex(a);
  const B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

/** The paper (off-white, a faint club tint), its lighter centre, the ink and the echo (deep club colour or ink, by seed). */
export function paperTones(data: RenderData) {
  const club = clubTone(data);
  const paper = mix(PAPER, club, 0.03);
  const light = mix(paper, "#fbfaf6", 0.6);
  const edge = mix(paper, "#d8d1c4", 0.4);
  const ink = mix("#17171a", club, 0.12);
  const inkEcho = rng((data.params.seed ?? 5) + 1)() < 0.35;
  // The deep club colour, dark enough to read as a hairline on paper.
  const deepClub = luminance(club) > 0.1 ? shade(club, -0.35) : club;
  return { club, paper, light, edge, ink, echo: inkEcho ? ink : deepClub };
}

/** Fine paper tooth (no vignette — Film's dark corners would grey the paper). */
export function PaperTooth({ strength = 1 }: { strength?: number }) {
  const noise = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .43  0 0 0 0 .4  0 0 0 .8 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;
  return <div style={{ position: "absolute", inset: 0, backgroundImage: noise, opacity: 0.09 * strength, mixBlendMode: "multiply", pointerEvents: "none" }} />;
}

/**
 * One solid hairline echo of his edge (echoline's edge: his alpha softened, thresholded, dilated, minus
 * itself), offset by (dx, dy) and drawn in `color`, through SilhouetteFx so the photo frame's cuts fade out
 * instead of drawing a line. Optional fade to nothing above `fadeEnd`.
 */
export function PaperEdge({ id, url, box, H, dx, dy, color, clipTop, cut, fadeEnd, width = 1.6 }: { id: string; url: string; box: Box; H: number; dx: number; dy: number; color: string; clipTop: number; cut?: RenderData["cut"]; fadeEnd?: number; width?: number }) {
  const b = { ...box, left: box.left + dx, top: box.top + dy };
  const pad = 12;
  const rx = Math.max(-pad, b.left - pad);
  const ry = Math.max(clipTop - pad, b.top - pad);
  const rw = Math.min(CANVAS_W + pad, b.left + b.width + pad) - rx;
  const rh = Math.min(H + pad, b.top + b.height + pad) - ry;
  let fade: ReactNode;
  if (fadeEnd)
    fade = (
      <>
        <defs>
          <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={fadeEnd - 240} x2={0} y2={fadeEnd}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={rx} y={ry} width={rw} height={rh} fill={`url(#${id}-fade)`} />
      </>
    );
  return (
    <SilhouetteFx id={id} url={url} box={b} H={H} clipTop={clipTop} cut={cut} pad={pad} mask={fade}>
      <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
      <feComponentTransfer in="s" result="a">
        <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
      </feComponentTransfer>
      <feMorphology in="a" operator="dilate" radius={width} result="d" />
      <feComposite in="d" in2="a" operator="out" result="ring" />
      <feGaussianBlur in="ring" stdDeviation={0.35} result="q" />
      <feFlood floodColor={color} />
      <feComposite in2="q" operator="in" />
    </SilhouetteFx>
  );
}

/**
 * A soft shade where he meets the paper: one wide blurred ellipse under/behind the lower part of the visible
 * figure (no drop-shadow on the cutout — it draws a pale rectangle in Chrome).
 */
export function ContactShade({ box, H, bottom, ink, toLeft }: { box: Box; H: number; bottom: number; ink: string; toLeft: boolean }) {
  const cx = box.left + box.width / 2 + (toLeft ? 18 : -18);
  const w = Math.min(box.width * 0.6, 640);
  const visibleBottom = Math.min(box.top + box.height, bottom);
  const top = Math.max(box.top + box.height * 0.25, visibleBottom - Math.min(H * 0.42, box.height * 0.6));
  const h = visibleBottom - top;
  const [r, g, b] = hex(ink);
  return <div style={{ position: "absolute", left: cx - w / 2, top, width: w, height: h, borderRadius: "50%", background: `rgba(${r},${g},${b},.13)`, filter: "blur(60px)" }} />;
}

/**
 * Paper echo: echoline on a light ground — warm off-white paper with a faint club tint, the player in natural
 * colour with a soft shade where he meets it, and one hairline echo of his own edge offset behind him towards
 * the free side and up, in the deep club colour (or ink, by seed). The title small and tracked in ink at the
 * top; crests, the fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Paperecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng((params.seed ?? 11) + 7);
  const toLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { paper, light, edge, ink, echo } = paperTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34 * k;

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

  /* ---- the player and his echo ---- */
  const dx = (toLeft ? -40 : 40) * k;
  const dy = -32 * k;
  const box = keepHead(data, story ? placeByFace(data, 540, 330, { chest: 420, waist: 330, knees: 240, full: 180 }) : placeByFace(data, 540, 250, { chest: 290, waist: 228, knees: 170, full: 128 }), clipTop + 14 * k - dy);
  // He melts into the paper above the foot.
  const fadeEnd = crestTop - 24 * k;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - (story ? 380 : 300) - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 56% at 50% 40%, ${light}, ${paper} 62%, ${edge})` }} />

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={toLeft} />

      {data.photoUrl && <PaperEdge id="paperecho" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd} width={story ? 2.2 : 1.8} />}

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
