/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { placeFree } from "./fadeword";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 900 capitals, figures and marks: advance widths per 100px (measured in the browser). */
export const I900: Record<string, number> = { A: 79.5, B: 66.8, C: 74.8, D: 72.3, E: 61.3, F: 58.4, G: 75.5, H: 75, I: 29.1, J: 59.6, K: 75.9, L: 56.5, M: 95.6, N: 77, O: 77.5, P: 65.6, Q: 78.7, R: 66.8, S: 66.6, T: 68.7, U: 72.2, V: 79.5, W: 108.2, X: 78.6, Y: 77.5, Z: 69.4, "0": 71.1, "1": 45.2, "2": 64.7, "3": 66.9, "4": 70.2, "5": 64.7, "6": 67.5, "7": 59.5, "8": 67.9, "9": 67.5, " ": 19.9, "-": 47.5, "—": 100, "·": 37.3, ".": 37.3, ":": 37.3, "'": 37.2, "!": 38.1, "&": 69.5 };
/** Inter 500 capitals, figures and marks: advance widths per 100px (measured in the browser). */
export const I500: Record<string, number> = { A: 70.9, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.5, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 70.9, W: 100.3, X: 70.1, Y: 69.6, Z: 64.1, "0": 64.5, "1": 41.5, "2": 61.7, "3": 62.7, "4": 65.6, "5": 60.3, "6": 63, "7": 57.1, "8": 63, "9": 63, " ": 26.7, "-": 46.3, "—": 100, "·": 30.3, ".": 30.3, ":": 30.3, "'": 31.3, "!": 30.5, "&": 65.3 };
/** Width of a run of capitals per 1px of font size (accents ignored), `track` em added between glyphs. */
export const capsW = (t: string, table: Record<string, number>, track = 0) => {
  const g = [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
  return g.reduce((a, c) => a + (table[c] ?? 70) / 100, 0) + track * Math.max(0, g.length - 1);
};

const INK = "#15171c";
const GROUND = "#f1eee9";
/** Tracking of the big word (em). */
const TRACK = -0.035;
/** How much of the capitals' height shows under the edge. */
const SHOWN = 0.58;

/**
 * Bleedword: one word, MATCHDAY in Inter Black, set so huge across the width that it runs off the TOP edge
 * of the canvas — only the lower half of the letters shows, as if the word were sliding in. In club colour
 * (or ink, by seed) on a pale ground. Under it the player, sharp and centred, melting away above a quiet
 * foot: the fixture (home first, names as stored), date · kick-off · ground, and the logo. In the story the
 * edge is a band of the word's colour under Instagram's profile bar, the letters hanging from it.
 */
export function Bleedword({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const ts = params.textScale ?? 1;
  const M = 56;
  const r = rng(params.seed ?? 7);
  const club = clubTone(data);
  const tone = r() < 0.3 ? INK : club;
  const f = matchFacts(data);

  /* ---- the word, across the width, hanging off the top edge ---- */
  const word = (content.kicker || "MATCHDAY").replace(/’/g, "'").trim().toUpperCase();
  const span = CANVAS_W - 2 * 32;
  const size = Math.min(story ? 330 : 300, span / Math.max(1, capsW(word, I900, TRACK))) * ts;
  const wordW = capsW(word, I900, TRACK) * size;
  const capH = size * 0.727;
  const edge = story ? STORY_TOP : 0;
  const baseline = edge + capH * SHOWN + (params.textY ?? 0);

  /* ---- the foot ---- */
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const narrow = (t: string, r0: number) => [...t].length * r0;
  const fixSize = Math.max(18 * k, Math.min(28 * k, ((CANVAS_W - 2 * M) * 0.92) / Math.max(1, narrow(fixture, 0.6)))) * ts;
  const factSize = Math.max(14 * k, Math.min(19 * k, ((CANVAS_W - 2 * M) * 0.95) / Math.max(1, narrow(facts, 0.52)))) * ts;
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 44;
  const logoTop = H - logoBottom - logoH;
  const factTop = logoTop - (story ? 66 : 48) - factSize * 1.25;
  const fixTop = factTop - (story ? 14 : 10) - fixSize * 1.25;

  /* ---- the player, centred under the word, his hair clear of it ---- */
  const FRAME = story ? { chest: 320, waist: 260, knees: 206, full: 160 } : { chest: 236, waist: 188, knees: 148, full: 116 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const faceTop = baseline + (story ? 96 : 70) + faceH0 * 0.45;
  const box = placeFree(data, faceX, faceTop, faceH0, fixTop + 40);
  const fadeEnd = fixTop - 24;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 250) - box.top}px, transparent ${fadeEnd - box.top}px)`;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const eyeY = box.top + (face[1] + face[3] * 0.4) * box.height;

  const small: CSSProperties = { position: "absolute", left: M, right: M, textAlign: "center", fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% 45% at ${faceX / 10.8}% ${(eyeY / H) * 100 + 8}%, #fbfaf7, ${GROUND} 70%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The story's edge: a band of the word's colour under the profile bar. */}
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: edge, background: tone }} />}

      {/* The word, its top half beyond the edge. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <clipPath id="bleedword-clip">
            <rect x={0} y={edge} width={CANVAS_W} height={H - edge} />
          </clipPath>
        </defs>
        <text
          clipPath="url(#bleedword-clip)"
          x={(CANVAS_W - wordW) / 2}
          y={baseline}
          textLength={wordW}
          lengthAdjust="spacing"
          fontFamily={SANS}
          fontWeight={900}
          fontSize={size}
          fill={tone}
        >
          {word}
        </text>
      </svg>

      {/* The player, sharp, natural colour, melting away above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

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
