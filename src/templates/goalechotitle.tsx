/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { keepHead } from "./doubleline";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, SilhouetteFx, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export const WHITE = "#ffffff";
export const M = 64;

/* ======================================================================================================
 * Shared by the four "goal echo" hybrids (goalechotitle / goalechoname / goalechocrest / goalechobar):
 * Echoline's idea — the player in natural colour on a deep club ground and ONE hairline echo of his own
 * edge, offset behind him — for a celebration photo, plus one quiet typographic element per look.
 * ==================================================================================================== */

/** Inter ExtraLight (200) capitals: advance widths per 1px of font size (approximate). */
const LIGHT_W: Record<string, number> = { A: 0.68, B: 0.64, C: 0.72, D: 0.72, E: 0.58, F: 0.56, G: 0.75, H: 0.73, I: 0.25, J: 0.53, K: 0.65, L: 0.53, M: 0.88, N: 0.74, O: 0.77, P: 0.62, Q: 0.77, R: 0.64, S: 0.62, T: 0.62, U: 0.72, V: 0.68, W: 0.98, X: 0.66, Y: 0.64, Z: 0.62, " ": 0.26, "'": 0.2, "-": 0.4, "!": 0.3 };
export const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
/** Untracked width (em) of light Inter caps. */
export const lightEm = (t: string) => plain(t).reduce((a, c) => a + (LIGHT_W[c] ?? 0.66), 0);
/** Cap height of Inter relative to its size. */
export const CAP = 0.727;

/** Ground and echo tones: deep club ground; the echo in the club colour lifted, or (by seed) white. */
export function echoTones(data: RenderData) {
  const club = clubTone(data);
  const r = rng(data.params.seed ?? 11);
  const whiteEcho = r() < 0.4;
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.58);
  const clubLine = luminance(club) < 0.12 ? shade(club, 0.45) : shade(club, 0.16);
  const echo = whiteEcho ? "rgba(255,255,255,.72)" : clubLine;
  return { club, deep, lift, echo, clubLine, whiteEcho };
}

/** The celebrating player: face at (faceX, faceTop); wide poses scaled to `maxW`; the figure centred on `cx`. */
export function goalBox(data: RenderData, o: { faceX: number; faceTop: number; cx: number; maxW: number; story: boolean; minHead: number; sizes?: Record<string, number> }) {
  const sizes = o.sizes ?? (o.story ? { chest: 320, waist: 260, knees: 206, full: 162 } : { chest: 228, waist: 184, knees: 146, full: 118 });
  let box = placeByFace(data, o.faceX, o.faceTop, sizes);
  const wide = Math.min(1, o.maxW / box.width);
  if (wide < 1) box = placeByFace(data, o.faceX, o.faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  // Centre the figure (not the face): his raised arms balance around cx.
  const lean = Math.max(-110, Math.min(110, o.cx - (box.left + box.width / 2)));
  return keepHead(data, { ...box, left: box.left + lean }, o.minHead, true);
}

/** One hairline echo of his edge, drawn from the cutout offset by (dx, dy), clipped above `clipTop`. */
export function EchoLine({ id, data, box, H, dx, dy, clipTop, color, width = 2 }: { id: string; data: RenderData; box: Box; H: number; dx: number; dy: number; clipTop: number; color: string; width?: number }) {
  if (!data.photoUrl) return null;
  return (
    <SilhouetteFx id={id} url={data.photoUrl} box={{ ...box, left: box.left + dx, top: box.top + dy }} H={H} clipTop={clipTop} cut={data.cut} pad={16}>
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

/** The player himself, natural colour. */
export function Player({ data, box }: { data: RenderData; box: Box }) {
  if (!data.photoUrl) return null;
  return <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />;
}

export const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center", ...extra });

/** Name / fixture (home first, names as stored, no score) / competition: the texts and their sizes. */
export function footTexts(data: RenderData, k: number, width = 860) {
  const ts = data.params.textScale ?? 1;
  const { content } = data;
  const f = matchFacts(data);
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : "";
  const comp = (f.comp || "").trim().toUpperCase();
  const N_TRACK = 0.24;
  const F_TRACK = 0.3;
  const nameSize = Math.max(16, Math.min(28 * k, width / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const fixSize = Math.max(11, Math.min(15 * k, width / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const compSize = Math.max(10, Math.min(12 * k, width / Math.max(1, capsEm(comp, F_TRACK)))) * ts;
  return { name, fixture, comp, nameSize, fixSize, compSize, N_TRACK, F_TRACK };
}

/**
 * The centred foot (name, fixture, competition), its last line ending 64px above the logo in the story
 * (logo ~88px ending at STORY_BOTTOM) and at 1200 in the post (logo top ~1254).
 */
export function centredFoot(data: RenderData, story: boolean, k: number, opts: { name?: boolean } = {}) {
  const t = footTexts(data, k);
  const showName = opts.name !== false && !!t.name;
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (data.params.textY ?? 0);
  const compTop = lastBottom - t.compSize;
  const fixTop = (t.comp ? compTop - 18 * k : lastBottom) - t.fixSize;
  const nameTop = showName ? fixTop - 22 * k - t.nameSize : fixTop;
  const node: ReactNode = (
    <>
      {showName && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(t.nameSize, t.N_TRACK, 600) }}>{t.name}</div>}
      {t.fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(t.fixSize, t.F_TRACK, 500, { opacity: 0.86 }) }}>{t.fixture}</div>}
      {t.comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...caps(t.compSize, t.F_TRACK, 500, { opacity: 0.58 }) }}>{t.comp}</div>}
    </>
  );
  return { node, top: t.fixture || showName ? nameTop : compTop };
}

/** NEYOD, centred at the foot (honours logoScale / logoY). */
export function CentreLogo({ data, story, H }: { data: RenderData; story: boolean; H: number }) {
  const p = data.params;
  return <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (p.logoY ?? 0), transform: `translateX(-50%) scale(${p.logoScale ?? 1})`, transformOrigin: "center bottom" }} />;
}

/** Fade of the lower body into the ground, under the foot type. */
export function FootFade({ deep, story }: { deep: string; story: boolean }) {
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 560, background: story ? `linear-gradient(to bottom, transparent, ${deep}e6 42%, ${deep} 62%)` : `linear-gradient(to bottom, transparent, ${deep}e6 50%, ${deep} 74%)` }} />;
}

/**
 * Goal echo title: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge slipped up and away behind him (Contorno eco) — and the kicker ("GOAL") set vertically up
 * the free edge, tall, in light, very wide-tracked capitals, standing behind his raised arms. His name, the
 * fixture (home first, names exactly as stored, no score) and the competition small at the foot.
 */
export function Goalechotitle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo } = echoTones(data);
  // He stands on params.side; the title runs up the other edge.
  const right = params.side !== "left";

  /* ---- foot ---- */
  const foot = centredFoot(data, story, k);

  /* ---- the vertical title: as tall as the band, never thicker than a slim column ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").normalize("NFC");
  const vTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const vBottom = foot.top - (story ? 84 : 64);
  const L = vBottom - vTop;
  const chars = plain(kicker).length;
  const base = lightEm(kicker);
  let size = Math.min((story ? 190 : 150) * ts, L / Math.max(1, base + (chars - 1) * 0.3));
  // Spread the letters over the whole height (tracking 0.3–1.4em).
  const track = chars > 1 ? Math.max(0.3, Math.min(1.4, (L / size - base) / (chars - 1))) : 0;
  const len = (base + (chars - 1) * track) * size;
  if (len > L) size *= L / len;
  const capH = size * CAP;
  // Rotated -90°: glyph tops face left. Left edge: baseline = column's inner edge; right edge: baseline on the margin.
  const textX = right ? M + capH : CANVAS_W - M;
  const inner = right ? M + capH : CANVAS_W - M - capH;
  const textBottom = vTop + Math.min(L, (base + (chars - 1) * track) * size) + (L - Math.min(L, (base + (chars - 1) * track) * size)) / 2;

  /* ---- the player, centred in the space beside the title ---- */
  const free = right ? [inner + 30, CANVAS_W] : [0, inner - 30];
  const cx = (free[0] + free[1]) / 2;
  const box = goalBox(data, { faceX: cx, faceTop: story ? 440 : 300, cx, maxW: (free[1] - free[0]) * (story ? 1.05 : 1.08), story, minHead: vTop + 10 });
  const dx = (right ? -1 : 1) * 30 * k;
  const dy = -26 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 48% at ${right ? 60 : 40}% ${story ? 38 : 40}%, ${lift}, ${deep} 82%)` }} />

      <EchoLine id="goalechotitle" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={vTop - 20} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* The title, vertical, bottom to top, up the free edge. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <text transform={`translate(${textX} ${textBottom}) rotate(-90)`} fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={200} fontSize={size} letterSpacing={`${track}em`} fill="rgba(255,255,255,.9)">
          {kicker}
        </text>
      </svg>

      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
