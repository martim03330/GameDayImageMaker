/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** Inter 800 is a touch wider than the 600 the width table was measured with. */
const HEAVY = 1.045;
const CAP = 0.727;

/**
 * Goalhalffill: the goal post of `halffill`, cut the other way. On a deep club-tone ground the celebrating
 * player, and across his waist "Goal" huge in Inter ExtraBold, split vertically along his own axis: the
 * left half of the word solid white, the right half only a thin white inner outline. Below it only his
 * name and the fixture (home first, names as stored, never a score).
 */
export function Goalhalffill({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.36 : 1;
  const id = `goalhalffill-${params.seed ?? 0}`;
  const tone = clubTone(data);
  const ground = shade(tone, -0.62);
  const lift = shade(tone, -0.32);

  /* ---- the foot, measured up from the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const teams = teamsOf(data);
  const fixture = teams.length === 2 ? `${teams[0]}  v  ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const colW = CANVAS_W - 2 * (story ? 90 : 110);
  const nameSize = Math.max(22 * q, Math.min(34 * q, colW / Math.max(1, titleW(name, 1)))) * ts;
  const fixSize = Math.max(15 * q, Math.min(20 * q, colW / Math.max(1, bodyW(fixture, 1)))) * ts;
  const gap = story ? 64 : 58;
  const fixTop = logoTop - gap - fixSize * 1.25;
  const nameTop = fixTop - 10 * q - nameSize * 1.2;

  /* ---- the word ---- */
  const word = sentenceCase(content.kicker || "Goal").replace(/[.!]+$/, "");
  const M = story ? 52 : 64;
  const maxW = CANVAS_W - 2 * M;
  const size = Math.min(story ? 460 : 430, maxW / Math.max(1, titleW(word, 1) * HEAVY * 0.97)) * ts;
  const wordW = Math.min(maxW, titleW(word, size) * HEAVY * 0.97);
  const baseline = nameTop - (story ? 64 : 46) + (params.textY ?? 0);
  const capTop = baseline - size * CAP;
  const descends = /[gjpqy]/.test(word);
  const wordBottom = baseline + (descends ? size * 0.2 : 0);

  const f = matchFacts(data);
  const comp = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const compSize = Math.max(10, Math.min(13 * q, maxW / Math.max(1, comp.length * 0.98))) * ts;

  /* ---- the player: his waist behind the word ---- */
  const sizes = story ? { chest: 270, waist: 230, knees: 180, full: 140 } : { chest: 200, waist: 168, knees: 132, full: 102 };
  // His face on the poster's (and the word's) centre line, so the cut runs straight down his axis.
  const axis = CANVAS_W / 2;
  let box = placeByFace(data, axis, story ? 420 : 200, sizes);
  // Hair clear of the competition line at the top.
  const minTop = (story ? STORY_TOP : 60) + compSize + 44 + box.faceH * 0.7;
  box = placeByFace(data, axis, Math.max(minTop, capTop - box.faceH * (story ? 3.4 : 3.7)), sizes);
  const wordLeft = (CANVAS_W - wordW) / 2;
  const cut = axis;
  const ink = Math.max(2.5, size * 0.011);

  const fadeFrom = baseline - size * 0.15;
  const fadeTo = Math.min(nameTop - 16, wordBottom + 30);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  const small: CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: SANS, color: WHITE, whiteSpace: "nowrap", lineHeight: 1.2 };
  const text = { x: wordLeft, y: baseline, textLength: wordW, lengthAdjust: "spacingAndGlyphs" as const, fontFamily: SANS, fontWeight: 800, fontSize: size };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${axis / 10.8}% ${((box.top + box.faceH * 3) / H) * 100}%, ${lift}, ${ground} 72%, ${shade(ground, -0.25)} 100%)` }} />

      {comp && (
        <div style={{ ...small, top: story ? STORY_TOP : 60, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>{comp}</div>
      )}

      {/* The player, natural colour; a soft shade under him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: box.top + box.height * 0.3, width: box.width * 0.6, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.25)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word across his waist: solid left of his axis, outline right of it. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <clipPath id={`${id}-l`}>
            <rect x={0} y={0} width={cut} height={H} />
          </clipPath>
          <clipPath id={`${id}-r`}>
            <rect x={cut} y={0} width={CANVAS_W - cut} height={H} />
          </clipPath>
          <filter id={`${id}-line`} x="-5%" y="-20%" width="110%" height="140%">
            <feMorphology in="SourceAlpha" operator="erode" radius={ink} result="in" />
            <feComposite in="SourceAlpha" in2="in" operator="out" result="ring" />
            <feFlood floodColor={WHITE} />
            <feComposite in2="ring" operator="in" />
          </filter>
        </defs>
        <g clipPath={`url(#${id}-l)`}>
          <text {...text} fill={WHITE}>
            {word}
          </text>
        </g>
        <g clipPath={`url(#${id}-r)`}>
          <text {...text} fill="#000" filter={`url(#${id}-line)`}>
            {word}
          </text>
        </g>
      </svg>

      {name && <div style={{ ...small, top: nameTop, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em" }}>{name}</div>}
      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 400, fontSize: fixSize, color: "rgba(255,255,255,.7)" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={story ? 22 : 18}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
