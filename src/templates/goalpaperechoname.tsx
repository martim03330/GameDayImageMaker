/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { footTexts, goalBox, M, plain } from "./goalechotitle";
import { ContactShade, PaperEdge, PaperTooth, paperTones } from "./paperecho";
import { capsEm, type Box } from "./rippleecho";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ======================================================================================================
 * Shared by the paper goal echo hybrids (goalpaperechoname / goalpaperechovert / goalpaperechobar):
 * the dark goal echo hybrids' compositions on paperecho's warm paper — ink type, a deep-club (or ink)
 * hairline echo, a soft contact shade, the player melting into the paper above the foot, NEYOD dark.
 * ==================================================================================================== */

/** Paper, ink, echo — plus the deep club colour itself (for a rule or an accent word), always dark enough on paper. */
export function goalPaperTones(data: RenderData) {
  const t = paperTones(data);
  const deepClub = luminance(t.club) > 0.1 ? shade(t.club, -0.35) : t.club;
  return { ...t, deepClub };
}

/** Ink capitals, centred. */
export const inkCaps = (ink: string, size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center", ...extra });

/** The centred foot in ink (name, fixture, competition): last line 64px above the story logo / at 1200 in the post. */
export function paperFoot(data: RenderData, story: boolean, k: number, ink: string, opts: { name?: boolean } = {}) {
  const t = footTexts(data, k);
  const showName = opts.name !== false && !!t.name;
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (data.params.textY ?? 0);
  const compTop = lastBottom - t.compSize;
  const fixTop = (t.comp ? compTop - 18 * k : lastBottom) - t.fixSize;
  const nameTop = showName ? fixTop - 22 * k - t.nameSize : fixTop;
  const node: ReactNode = (
    <>
      {showName && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...inkCaps(ink, t.nameSize, t.N_TRACK, 600) }}>{t.name}</div>}
      {t.fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...inkCaps(ink, t.fixSize, t.F_TRACK, 500, { opacity: 0.82 }) }}>{t.fixture}</div>}
      {t.comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...inkCaps(ink, t.compSize, t.F_TRACK, 500, { opacity: 0.56 }) }}>{t.comp}</div>}
    </>
  );
  return { node, top: t.fixture || showName ? nameTop : compTop };
}

/** The player in natural colour, melting into the paper over the 300–380px above `fadeEnd`. */
export function PaperPlayer({ data, box, fadeEnd, story }: { data: RenderData; box: Box; fadeEnd: number; story: boolean }) {
  if (!data.photoUrl) return null;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - (story ? 380 : 300) - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;
  return (
    <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
      <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.03)", ...cutMask(data.cut) }} />
    </div>
  );
}

/** The paper ground: lighter centre at (x%, y%), warm edges. */
export function PaperGround({ data, x, y }: { data: RenderData; x: number; y: number }) {
  const { paper, light, edge } = paperTones(data);
  return <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 54% at ${x}% ${y}%, ${light}, ${paper} 62%, ${edge})` }} />;
}

/** NEYOD (dark), centred at the foot. */
export function PaperCentreLogo({ data, story, H }: { data: RenderData; story: boolean; H: number }) {
  const p = data.params;
  return <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (p.logoY ?? 0), transform: `translateX(-50%) scale(${p.logoScale ?? 1})`, transformOrigin: "center bottom" }} />;
}

export { ContactShade, PaperEdge, PaperTooth };

/** Barlow Condensed SemiBold capitals: advance widths per 1px of font size (approximate). */
const BC: Record<string, number> = { A: 0.5, B: 0.5, C: 0.47, D: 0.51, E: 0.43, F: 0.42, G: 0.5, H: 0.53, I: 0.23, J: 0.38, K: 0.5, L: 0.41, M: 0.66, N: 0.53, O: 0.51, P: 0.49, Q: 0.51, R: 0.5, S: 0.46, T: 0.43, U: 0.52, V: 0.5, W: 0.72, X: 0.5, Y: 0.48, Z: 0.43, " ": 0.2, "'": 0.18, "-": 0.32 };
const condEm = (t: string, track: number) => plain(t).reduce((a, c) => a + (BC[c] ?? 0.5) + track, -track);
const BC_CAP = 0.7;

/**
 * Goal paper echo name: the celebrating player in natural colour on warm off-white paper, a soft shade where he
 * meets it and one hairline echo of his own edge offset behind him in the deep club colour (or ink) — and his
 * surname set very large across the canvas behind him as an outline only, in the same hairline and colour, so
 * the word and his echo read as one drawing. "GOAL" small and wide-tracked in ink at the top; his name, the
 * fixture (home first, names exactly as stored, no score) and the competition small at the foot.
 */
export function Goalpaperechoname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { ink, echo, paper } = goalPaperTones(data);
  const toRight = params.side !== "left";

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(15 * k, Math.min(26 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + 34 * k;

  /* ---- foot ---- */
  const foot = paperFoot(data, story, k, ink);
  const fadeEnd = foot.top - 26 * k;

  /* ---- the player, a touch off centre towards his side ---- */
  const dx = (toRight ? -1 : 1) * 30 * k;
  const dy = -26 * k;
  const cx = 540 + (toRight ? 40 : -40);
  const box = goalBox(data, { faceX: cx, cx, faceTop: story ? 450 : 300, maxW: story ? 800 : 860, story, sizes: story ? { chest: 270, waist: 222, knees: 182, full: 148 } : undefined, minHead: clipTop + (story ? 28 : 20) - dy });
  const faceH = box.faceH;
  const faceBottom = box.top + ((data.face?.[1] ?? 0.08) + (data.face?.[3] ?? 0.12)) * box.height;

  /* ---- the surname, outline only, as wide as the canvas allows ---- */
  const surname = (content.lastName || content.firstName || "").toUpperCase().normalize("NFC");
  const TRACK = 0.04;
  const maxW = CANVAS_W - 2 * (story ? 56 : 48);
  const size = Math.min((story ? 420 : 340) * ts, maxW / Math.max(1, condEm(surname, TRACK)));
  const capH = size * BC_CAP;
  // Behind his chest: the cap line a little under his chin, never into the foot.
  const baseline = Math.min(foot.top - (story ? 110 : 70), faceBottom + faceH * 0.45 + capH);
  const stroke = story ? 2.2 : 1.8;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <PaperGround data={data} x={50} y={story ? 40 : 42} />

      {surname && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" fontFamily={CONDENSED} fontWeight={600} fontSize={size} letterSpacing={`${TRACK}em`} fill="none" stroke={echo} strokeWidth={stroke} strokeLinejoin="round">
            {surname}
          </text>
        </svg>
      )}

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={!toRight} />
      {data.photoUrl && <PaperEdge id="goalpaperechoname" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd} width={story ? 2.2 : 1.8} />}
      <PaperPlayer data={data} box={box} fadeEnd={fadeEnd} story={story} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...inkCaps(ink, kSize, K_TRACK, 400) }}>{kicker}</div>
      {foot.node}

      <PaperCentreLogo data={data} story={story} H={H} />
      <PaperTooth />
    </div>
  );
}
