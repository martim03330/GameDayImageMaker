/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 800: advance widths per 100px (measured in the browser). */
export const I800: Record<string, number> = { a: 58.8, b: 63.8, c: 59.5, d: 63.8, e: 60.1, f: 41, g: 63.9, h: 63.6, i: 28.3, j: 28.3, k: 59.3, l: 28.3, m: 92.7, n: 63.5, o: 61.9, p: 63.8, q: 63.8, r: 42, s: 57.4, t: 38.2, u: 63.6, v: 61.5, w: 86.3, x: 59.4, y: 61.8, z: 58.1, A: 77, B: 66.5, C: 74.4, D: 72.3, E: 61, F: 58.6, G: 75.3, H: 74.8, I: 28.6, J: 59, K: 73.8, L: 56.5, M: 94.3, N: 76.6, O: 77.3, P: 65.2, Q: 78.2, R: 66.2, S: 66, T: 67.7, U: 72.7, V: 77, W: 105.9, X: 76.1, Y: 75.2, Z: 67.9, " ": 21.9, "-": 47.1, "'": 35.5, "!": 35.9 };
/** Width of `t` in Inter 800 per 1px of font size (accents ignored), without tracking. */
export const w800 = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (I800[c] ?? (/\d/.test(c) ? 66 : 64)) / 100, 0);
/**
 * Where the cutout goes so his face (height `faceH`, scaled by playerScale, capped by the photo's real face
 * pixels) sits at (`faceX`, `faceTop`), and the photo reaches at least `minBottom` (so its cut edge stays
 * hidden under a fade). Unlike placeByFace it does not force the figure down to the canvas floor.
 */
export function placeFree(data: RenderData, faceX: number, faceTop: number, faceH: number, minBottom: number) {
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let fh = faceH * (p.playerScale ?? 1);
  if (data.facePx > 0) fh = Math.min(fh, Math.max(96, data.facePx * 1.2));
  const h = Math.max(fh / face[3], (minBottom - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return { left: faceX - w * (face[0] + face[2] / 2) + (p.playerX ?? 0), top: faceTop - h * face[1] + (p.playerY ?? 0), width: w, height: h, faceH: face[3] * h };
}

/** Inter regular/medium, mixed case: rough advance per 1px. */
const smallEm = (t: string, ratio = 0.56) => [...t].length * ratio;

const INK = "#15171c";
const GROUND = "#f1eee9";
/** Tracking of the big word (em). */
const TRACK = -0.045;

/**
 * Fadeword: one word, huge, in Inter Extra Bold right across the pale ground at his chest, behind him — its
 * fill a solid club colour on the free side that fades to nothing towards him, so "Match" is loud and "day"
 * dissolves behind his shoulder (flips with params.side). The player sharp on his side, melting away above the
 * foot; at the foot only the fixture (home first, names as stored), date · kick-off · ground, and the logo. The
 * competition in tiny spaced caps at the top.
 */
export function Fadeword({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const ts = params.textScale ?? 1;
  const M = 56;
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the competition, tiny, at the top ---- */
  const comp = titleCase(f.comp || f.round || "").trim();
  const compSize = Math.max(11, Math.min(13 * k, 760 / Math.max(1, [...comp].length * 0.98)));
  const top0 = story ? STORY_TOP : 64;

  /* ---- the player on his side, the word's fading end behind him ---- */
  const right = params.side !== "left";
  const FRAME = story ? { chest: 300, waist: 240, knees: 190, full: 150 } : { chest: 220, waist: 172, knees: 136, full: 108 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const box = placeFree(data, right ? 700 : 380, story ? 420 : 250, faceH0, H - (story ? 380 : 200));
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;

  /* ---- the word, across the width at his chest ---- */
  const word = sentenceCase(content.kicker || "Matchday");
  const n = [...word].length;
  const span = CANVAS_W - 2 * M;
  const size = Math.min(story ? 300 : 260, span / Math.max(1, w800(word) + TRACK * (n - 1))) * ts;
  const wordW = (w800(word) + TRACK * (n - 1)) * size;
  const capH = size * 0.727;
  const centre = Math.max(story ? 760 : 520, Math.min(story ? 1150 : 820, chin + box.faceH * 1.05)) + (params.textY ?? 0);
  const wordTop = centre - capH / 2 - size * 0.235; // line box top (Inter ascent sits ~0.235em above the caps)

  /* ---- the foot ---- */
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const fixSize = Math.max(18 * k, Math.min(28 * k, (span * 0.92) / Math.max(1, smallEm(fixture, 0.6)))) * ts;
  const factSize = Math.max(14 * k, Math.min(19 * k, (span * 0.95) / Math.max(1, smallEm(facts, 0.52)))) * ts;
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 44;
  const logoTop = H - logoBottom - logoH;
  const gap = story ? 66 : 50;
  const factTop = logoTop - gap - factSize * 1.25;
  const fixTop = factTop - (story ? 14 : 10) - fixSize * 1.25;
  const fadeEnd = fixTop - 30;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 240) - box.top}px, transparent ${fadeEnd - box.top}px)`;

  const small: CSSProperties = { position: "absolute", left: M, right: M, textAlign: "center", fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${right ? 62 : 38}% ${(centre / H) * 100}%, #fbfaf7, ${GROUND} 70%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The word: solid club colour on the left, fading to nothing on the right. */}
      <div
        style={{
          position: "absolute",
          left: (CANVAS_W - wordW) / 2,
          top: wordTop,
          width: wordW + size * 0.1,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.2,
          letterSpacing: `${TRACK}em`,
          whiteSpace: "nowrap",
          color: "transparent",
          backgroundImage: `linear-gradient(${right ? 90 : 270}deg, ${club} 0%, ${club} 22%, ${club}00 98%)`,
          backgroundSize: `${wordW}px 100%`,
          backgroundRepeat: "no-repeat",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
      >
        {word}
      </div>

      {/* The player, sharp, natural colour, melting away above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {comp && <div style={{ ...small, top: top0, fontWeight: 500, fontSize: compSize, letterSpacing: "0.32em", paddingLeft: "0.32em", textTransform: "uppercase", color: "rgba(21,23,28,.55)" }}>{comp}</div>}

      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 600, fontSize: fixSize, letterSpacing: "-0.01em" }}>{fixture}</div>}
      {facts && <div style={{ ...small, top: factTop, fontWeight: 400, fontSize: factSize, color: "rgba(21,23,28,.62)" }}>{facts}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: logoBottom - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
