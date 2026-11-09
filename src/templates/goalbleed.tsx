/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { capsW, I900 } from "./bleedword";
import { placeFree } from "./fadeword";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** Tracking of the big word (em). */
const TRACK = -0.035;
/** How much of the capitals' height shows above the edge. */
const SHOWN = 0.8; // enough of the L's foot that "GOAL" never reads "GOAI"

/**
 * Goal bleed: the goal post of `bleedword`. GOAL in Inter Black, white, as wide as the canvas and sunk
 * through the BOTTOM edge — only the top half of the letters rises out of a deep club tone — with the
 * celebrating player standing on it, melting into the letters. At the top only his name and the fixture
 * (home first, names as stored, no score), small, and the logo opposite. In the story the edge is a white
 * floor under Instagram's reply bar, the letters growing out of it.
 */
export function Goalbleed({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const ts = params.textScale ?? 1;
  const M = 56;
  const club = clubTone(data);
  const ground = shade(club, -0.6);
  const lift = shade(club, -0.28);

  /* ---- the word, across the width, sunk through the bottom edge ---- */
  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim().toUpperCase();
  const span = CANVAS_W - 2 * 32;
  const size = Math.min(story ? 420 : 400, span / Math.max(1, capsW(word, I900, TRACK))) * ts;
  const wordW = capsW(word, I900, TRACK) * size;
  const capH = size * 0.727;
  const edge = story ? STORY_BOTTOM : H;
  const baseline = edge + capH * (1 - SHOWN) - (params.textY ?? 0);
  const wordTop = baseline - capH;
  // Cut through the middle, an L is only its stem: centre what shows, not the advance.
  const optical = /L$/.test(word) ? size * 0.11 : 0;

  /* ---- the top: name and fixture left, the logo right ---- */
  const top0 = story ? STORY_TOP : 60;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const fixture = teamsOf(data).join(" v ");
  const colW = story ? 600 : 560;
  const nameSize = Math.max(18 * k, Math.min(30 * k, colW / Math.max(1, [...name].length * 0.74))) * ts;
  const fixSize = Math.max(15 * k, Math.min(21 * k, colW / Math.max(1, [...fixture].length * 0.55))) * ts;
  const infoBottom = top0 + nameSize * 1.1 + 10 * k + fixSize * 1.3;

  /* ---- the player, centred, standing on the word ---- */
  const FRAME = story ? { chest: 300, waist: 250, knees: 200, full: 160 } : { chest: 240, waist: 200, knees: 158, full: 122 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const faceTop = Math.max(infoBottom + (story ? 150 : 110), story ? 440 : 260);
  let box = placeFree(data, faceX, faceTop, faceH0, wordTop + capH * 0.35);
  // A fist raised to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  // He melts into the letters: solid down to just above them, gone a little inside them.
  const fade = `linear-gradient(to bottom, #000 0, #000 ${wordTop - (story ? 200 : 150) - box.top}px, transparent ${wordTop + capH * 0.3 - box.top}px)`;

  const small: CSSProperties = { fontFamily: SANS, color: WHITE, whiteSpace: "nowrap", lineHeight: 1.1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 45% at ${(fCx / CANVAS_W) * 100}% ${((chin + box.faceH) / H) * 100}%, ${lift}, ${ground} 78%)` }} />

      {/* The player, sharp, natural colour; a soft shade where he meets the word. */}
      <div style={{ position: "absolute", left: 140, right: 140, top: wordTop - 60, height: 160, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(50px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The story's edge: a white floor under the reply bar. */}
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: edge, bottom: 0, background: WHITE }} />}

      {/* The word, its lower half beyond the edge. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <clipPath id="goalbleed-clip">
            <rect x={0} y={0} width={CANVAS_W} height={edge} />
          </clipPath>
        </defs>
        <text clipPath="url(#goalbleed-clip)" x={(CANVAS_W - wordW) / 2 + optical} y={baseline} textLength={wordW} lengthAdjust="spacing" fontFamily={SANS} fontWeight={900} fontSize={size} fill={WHITE}>
          {word}
        </text>
      </svg>

      {/* Top: his name and the fixture, small. */}
      <div style={{ position: "absolute", left: M, top: top0, display: "flex", flexDirection: "column", gap: 10 * k, maxWidth: colW, textShadow: "0 2px 12px rgba(0,0,0,.35)" }}>
        {name && <div style={{ ...small, fontWeight: 700, fontSize: nameSize, letterSpacing: "0.04em" }}>{name}</div>}
        {fixture && <div style={{ ...small, fontWeight: 400, fontSize: fixSize, lineHeight: 1.3, color: "rgba(255,255,255,.74)" }}>{fixture}</div>}
      </div>
      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", right: M, top: top0 + (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
