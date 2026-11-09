/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#ebe6dd";
const INK = "#1c1b19";

/** DM Serif Display (upright): advance widths per 100px (measured in the browser). */
const DM_W: Record<string, number> = { a: 51.8, b: 58.1, c: 49.4, d: 57.4, e: 50.7, f: 34.3, g: 53.1, h: 58, i: 28, j: 28.1, k: 58.2, l: 28.6, m: 87.1, n: 57.8, o: 54.5, p: 57.8, q: 56.5, r: 44.1, s: 43.6, t: 36.1, u: 56.7, v: 53, w: 78.1, x: 56.8, y: 53.6, z: 46.5, A: 65, B: 59.8, C: 60.3, D: 64.8, E: 55.5, F: 53.8, G: 65.6, H: 69.1, I: 30.1, J: 42.7, K: 65.4, L: 54, M: 79.1, N: 65.3, O: 67, P: 56.5, Q: 67, R: 62.8, S: 52.1, T: 62.7, U: 64.9, V: 63.2, W: 92.1, X: 61.4, Y: 59, Z: 56, " ": 21.8, "-": 33.2, "'": 22.3, "!": 33.3 };
const dmEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (DM_W[c] ?? 55) / 100, 0);

/** Linear mix of two hex colours (t = share of `b`). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/**
 * Emboss: one big word — "Matchday" — blind-embossed into thick card. The letters are the colour of the
 * ground and exist only as soft light on their upper-left edges and shade on their lower-right, like
 * letterpress without ink. The player, natural colour, stands in front of the lower half of the word; at
 * the foot, small and crisp, the fixture (home first, names as stored) and date · kick-off · ground.
 */
export function Emboss({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const club = clubTone(data);

  // The card: warm paper, or paper with a breath of the club colour (by seed).
  const tinted = rng((params.seed ?? 0) * 7919 + 5)() < 0.45;
  const ground = tinted ? mix(PAPER, club, 0.1) : PAPER;

  /* ---- the word ---- */
  const word = sentenceCase(content.kicker || "Matchday");
  const size = Math.min(story ? 270 : 250, (story ? 1000 : 990) / Math.max(1, dmEm(word) * 0.99)) * ts;
  // The cap tops sit ~0.19em under the line box: in the story they start right at STORY_TOP.
  const wordTop = (story ? STORY_TOP - size * 0.17 : 92) + (params.textY ?? 0);
  // DM Serif: the baseline sits ~0.83em under the top of a line-height-1 box, cap height ~0.7em.
  const baseline = wordTop + size * 0.83;
  const e = size / 240;
  const emboss = [
    `${-1.6 * e}px ${-1.6 * e}px ${1.2 * e}px rgba(255,255,255,.95)`,
    `${-4 * e}px ${-4 * e}px ${9 * e}px rgba(255,255,255,.45)`,
    `${1.6 * e}px ${1.8 * e}px ${1.6 * e}px rgba(40,30,20,.16)`,
    `${5 * e}px ${6 * e}px ${12 * e}px rgba(40,30,20,.13)`,
  ].join(", ");

  /* ---- the foot ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("  v  ");
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const fixSize = Math.max(16, Math.min(story ? 32 : 22, (story ? 920 : 860) / Math.max(1, fixture.length * 0.56))) * ts;
  const whenSize = Math.max(13, Math.min(story ? 24 : 17, (story ? 940 : 880) / Math.max(1, when.length * 0.52))) * ts;
  const whenTop = logoTop - (story ? 66 : 42) - whenSize * 1.2;
  const fixTop = whenTop - (story ? 20 : 14) - fixSize * 1.2;

  /* ---- the player: his head over the lower half of the word ---- */
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const sizes = story ? { chest: 300, waist: 238, knees: 186, full: 150 } : { chest: 214, waist: 168, knees: 130, full: 104 };
  const box = placeByFace(data, faceX, baseline - size * (story ? 0.2 : 0.38), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = fixTop - (story ? 56 : 36);
  const fadeLen = story ? 380 : 260;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const line = (s: number, weight: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: s, lineHeight: 1.2, whiteSpace: "nowrap", textAlign: "center", color });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      {/* The word, blind-embossed: no ink, only its edges catching the light. */}
      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DMSERIF, fontSize: size, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: ground, textShadow: emboss }}>
        {word}
      </div>

      {/* Over the word too, so its face takes the same light as the card: light raking across the card from the top left. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,.3), transparent 60%), linear-gradient(to bottom, transparent 55%, rgba(60,45,30,.07))" }} />

      {/* A soft shade behind his torso (never a drop shadow on the cutout). */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin + box.faceH * 0.4, width: box.width * 0.6, height: Math.max(80, fadeEnd - chin - box.faceH), borderRadius: "50%", background: "rgba(60,45,30,.16)", filter: `blur(${story ? 70 : 54}px)` }} />

      {/* The player, natural colour, dissolving into the card above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Foot: the fixture, then date · kick-off · ground. */}
      {fixture && <div style={{ position: "absolute", left: 56, right: 56, top: fixTop, ...line(fixSize, 500, INK), letterSpacing: "0.01em" }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: 56, right: 56, top: whenTop, ...line(whenSize, 400, "rgba(28,27,25,.62)"), letterSpacing: "0.03em" }}>{when}</div>}

      <AgencyLogo data={data} onLight height={20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
