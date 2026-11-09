/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { I900, capsW } from "./bleedword";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GROUND = "#efece6";
const INK = "#17181b";
/** Inter 900: cap height per 1px of font size (round letters overshoot a little). */
export const CAP900 = 0.727;
/** Tracking between the heavy capitals, in em. */
export const FILL_TRACK = 0.02;

/** Width of the word per 1px of font size. */
export const fillWordW = (t: string) => capsW(t, I900, FILL_TRACK);

/**
 * One word in Inter Black capitals whose letters fill up one by one: the first only a hairline inner
 * outline, the last solid, each one between filled a little higher, flat like a level rising in a glass.
 */
export function FillWord({ id, text, x, baseline, size, color, hair }: { id: string; text: string; x: number; baseline: number; size: number; color: string; hair: number }) {
  const glyphs = [...text.toUpperCase()];
  const letters = glyphs.filter((c) => c.trim()).length;
  let cx = x;
  let n = 0;
  const cap = CAP900 * size;
  const items = glyphs.map((c, i) => {
    const w = ((I900[c.normalize("NFD").replace(/\p{M}/gu, "")] ?? 70) / 100) * size;
    const at = cx;
    cx += w + FILL_TRACK * size;
    if (!c.trim()) return null;
    const t = letters > 1 ? n / (letters - 1) : 1;
    n++;
    // The level: from nothing to over the top (overshoot and accents included).
    const top = t >= 1 ? baseline - size * 1.2 : baseline - cap * t;
    return { c, at, w, t, top, key: i };
  });
  return (
    <svg data-bleed width={CANVAS_W} height={Math.ceil(baseline + size)} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
      <defs>
        {/* An inner hairline: the glyph minus itself shrunk, so overlapping contours never show. */}
        <filter id={`${id}-line`} x="-10%" y="-20%" width="120%" height="140%">
          <feMorphology in="SourceAlpha" operator="erode" radius={hair} result="in" />
          <feComposite in="SourceAlpha" in2="in" operator="out" result="ring" />
          <feFlood floodColor={color} />
          <feComposite in2="ring" operator="in" />
        </filter>
        {items.map((it) =>
          it && it.t > 0 ? (
            <clipPath key={it.key} id={`${id}-l${it.key}`}>
              <rect x={it.at - size * 0.1} y={it.top} width={it.w + size * 0.2} height={baseline + size * 0.3 - it.top} />
            </clipPath>
          ) : null,
        )}
      </defs>
      {items.map((it) =>
        it ? (
          <g key={it.key}>
            {it.t > 0 && (
              <text x={it.at} y={baseline} clipPath={`url(#${id}-l${it.key})`} fontFamily={SANS} fontWeight={900} fontSize={size} fill={color}>
                {it.c}
              </text>
            )}
            <text x={it.at} y={baseline} fontFamily={SANS} fontWeight={900} fontSize={size} fill="#000" filter={`url(#${id}-line)`}>
              {it.c}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  );
}

/**
 * Fillprogress: the build-up to kick-off in one word. "MATCHDAY" in black capitals across the top of a
 * clean warm ground, its letters filling one by one — the M a bare hairline outline, each letter after it
 * filled a little higher, the Y solid. The player in natural colour in front, his head under the word; the
 * fixture (home first, names as stored) and date · kick-off · ground small at the foot.
 */
export function Fillprogress({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.36 : 1;
  const id = `fillprogress-${params.seed ?? 0}`;
  const club = shade(clubTone(data), -0.18);

  /* ---- the word ---- */
  const word = (content.kicker || "Matchday").toUpperCase().replace(/’/g, "'").replace(/[.!]+$/, "");
  const M = story ? 56 : 60;
  const maxW = CANVAS_W - 2 * M;
  const size = Math.min(story ? 260 : 200, maxW / Math.max(1, fillWordW(word))) * ts;
  const wordW = fillWordW(word) * size;
  const top = (story ? STORY_TOP + 10 : 92) + (params.textY ?? 0);
  const baseline = top + CAP900 * size;
  const hair = Math.max(1.4, size * 0.011);

  /* ---- the player, in front, his head under the word ---- */
  const sizes = story ? { chest: 330, waist: 276, knees: 214, full: 166 } : { chest: 250, waist: 208, knees: 160, full: 124 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  let box = placeByFace(data, faceX, baseline + (story ? 150 : 110), sizes);
  // Hair above the face box: keep it clear of the letters.
  box = placeByFace(data, faceX, baseline + Math.max(story ? 150 : 110, box.faceH * 0.85 + 30), sizes);

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
  const colW = CANVAS_W - 2 * (story ? 80 : 110);
  const fixSize = Math.max(18 * q, Math.min(28 * q, colW / Math.max(1, bodyW(fixture, 1) * 1.05))) * ts;
  const whenSize = Math.max(14 * q, Math.min(19 * q, colW / Math.max(1, bodyW(when, 1)))) * ts;
  const gap = story ? 66 : 62;
  const whenTop = logoTop - gap - whenSize * 1.25;
  const fixTop = whenTop - 10 * q - fixSize * 1.25;
  const comp = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const compSize = Math.max(10, Math.min(12.5 * q, colW / Math.max(1, comp.length * 0.98))) * ts;
  const compTop = fixTop - 22 * q - compSize * 1.25;

  // He melts into the ground above the foot.
  const fadeTo = (comp ? compTop : fixTop) - 30 * q;
  const fadeFrom = fadeTo - (story ? 260 : 200);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  const small: CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${faceX / 10.8}% ${((baseline + 400) / H) * 100}%, #f8f6f2, ${GROUND} 62%, ${shade(GROUND, -0.05)} 100%)` }} />

      <FillWord id={id} text={word} x={(CANVAS_W - wordW) / 2} baseline={baseline} size={size} color={club} hair={hair} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {comp && <div style={{ ...small, top: compTop, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(23,24,27,.55)" }}>{comp}</div>}
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
