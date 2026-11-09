/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, bodyW, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GROUND = "#efece6";
const INK = "#17181b";
/** Inter: x-height per 1px of font size. The split runs through the middle of the lower-case letters. */
const X_HEIGHT = 0.546;
/** Inter 800 is a touch wider than the 600 the width table was measured with. */
const HEAVY = 1.045;

/**
 * Halffill: one word, cut in two. "Matchday" big in Inter ExtraBold across the poster, the upper half of
 * every letter only a thin inner outline, the lower half solid — the cut exactly through the middle of the
 * lower-case letters, and that line laid across the player's chest (he stands behind the word). A clean warm
 * ground; at the foot only the fixture (home first, names as stored) and date · kick-off · ground.
 */
export function Halffill({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.36 : 1;
  const id = `halffill-${params.seed ?? 0}`;
  const club = shade(clubTone(data), -0.22);

  /* ---- the word ---- */
  const word = sentenceCase(content.kicker || "Matchday").replace(/[.!]+$/, "");
  const M = story ? 52 : 60;
  const maxW = CANVAS_W - 2 * M;
  const size = Math.min(story ? 300 : 250, maxW / Math.max(1, (titleW(word, 1) * HEAVY) * 0.97)) * ts;
  const wordW = Math.min(maxW, titleW(word, size) * HEAVY * 0.97);
  const ink = size > 0 ? Math.max(2, size * 0.014) : 2;

  /* ---- the player: his chest on the cut ---- */
  const sizes = story ? { chest: 330, waist: 280, knees: 216, full: 166 } : { chest: 245, waist: 205, knees: 158, full: 122 };
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const chestK = 1.95; // face top → chest, in face heights
  // His face as high as the competition line allows; the cut on his chest, kept within a calm band.
  const top0 = story ? STORY_TOP + 200 : 240;
  let box = placeByFace(data, faceX, top0, sizes);
  const want = Math.max(story ? 820 : 640, Math.min(story ? 1000 : 700, top0 + box.faceH * chestK)) + (params.textY ?? 0);
  box = placeByFace(data, faceX, Math.max(top0 - 40, want - box.faceH * chestK), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = box.top + face[1] * box.height;
  const chin = faceTop + box.faceH;
  // The cut: on his chest, but never into his chin.
  const split = Math.max(want, chin + box.faceH * 0.55 + size * (0.727 - X_HEIGHT / 2));
  const baseline = split + size * (X_HEIGHT / 2);
  const wordLeft = (CANVAS_W - wordW) / 2;

  /* ---- the foot ---- */
  const logoAsked = story ? 22 : 18;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const fixture = teams.length === 2 ? `${teams[0]}  v  ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const venue = (content.venue ?? "").trim();
  const when = [niceDate(content.date), f.time, venue].filter(Boolean).join("  ·  ");
  const colW = CANVAS_W - 2 * (story ? 90 : 110);
  const fixSize = Math.max(18 * q, Math.min(30 * q, colW / Math.max(1, bodyW(fixture, 1) * 1.04))) * ts;
  const whenSize = Math.max(14 * q, Math.min(19 * q, colW / Math.max(1, bodyW(when, 1)))) * ts;
  const gap = story ? 64 : 58;
  const whenTop = logoTop - gap - whenSize * 1.25;
  const fixTop = whenTop - 12 * q - fixSize * 1.25;
  const comp = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const compSize = Math.max(10, Math.min(13 * q, (CANVAS_W - 2 * M) / Math.max(1, comp.length * 0.98))) * ts;

  // The player melts into the ground well above the fixture.
  const fadeTo = fixTop - 40 * q;
  const fadeFrom = Math.max(baseline + size * 0.3, fadeTo - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  const small: CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 52% at ${faceX / 10.8}% ${(split / H) * 100}%, #f8f6f2, ${GROUND} 62%, ${shade(GROUND, -0.05)} 100%)` }} />

      {comp && (
        <div style={{ ...small, top: story ? STORY_TOP : 64, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(23,24,27,.55)" }}>{comp}</div>
      )}

      {/* The player, natural colour, behind the word. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word: outline above the cut, solid below it. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <clipPath id={`${id}-top`}>
            <rect x={0} y={0} width={CANVAS_W} height={split} />
          </clipPath>
          <clipPath id={`${id}-bot`}>
            <rect x={0} y={split} width={CANVAS_W} height={H - split} />
          </clipPath>
          {/* An inner outline: the glyph minus itself shrunk, so overlapping contours never show. */}
          <filter id={`${id}-line`} x="-5%" y="-20%" width="110%" height="140%">
            <feMorphology in="SourceAlpha" operator="erode" radius={ink} result="in" />
            <feComposite in="SourceAlpha" in2="in" operator="out" result="ring" />
            <feFlood floodColor={club} />
            <feComposite in2="ring" operator="in" />
          </filter>
        </defs>
        <g clipPath={`url(#${id}-top)`}>
          <text x={wordLeft} y={baseline} textLength={wordW} lengthAdjust="spacingAndGlyphs" fontFamily={SANS} fontWeight={800} fontSize={size} letterSpacing={-size * 0.03} fill="#000" filter={`url(#${id}-line)`}>
            {word}
          </text>
        </g>
        <g clipPath={`url(#${id}-bot)`}>
          <text x={wordLeft} y={baseline} textLength={wordW} lengthAdjust="spacingAndGlyphs" fontFamily={SANS} fontWeight={800} fontSize={size} letterSpacing={-size * 0.03} fill={club}>
            {word}
          </text>
        </g>
      </svg>

      {/* The foot. */}
      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 600, fontSize: fixSize, letterSpacing: "-0.01em" }}>{fixture}</div>}
      {when && <div style={{ ...small, top: whenTop, fontWeight: 400, fontSize: whenSize, color: "rgba(23,24,27,.62)" }}>{when}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={logoAsked}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
