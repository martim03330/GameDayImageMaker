/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { placeFree, w800 } from "./fadeword";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/** Tracking of the big word (em). */
const TRACK = -0.05;

/**
 * Goalfade: the goal sibling of `fadeword`. A deep club-tone ground, and one huge word ("Goal", "Brace") in
 * Inter Extra Bold low behind the celebrating player — solid white at its foot, fading to nothing towards its
 * top, as if it were rising with him. He melts away into the word's solid base. At the foot only his name and
 * the fixture (home first, names as stored, never a score), then the logo.
 */
export function Goalfade({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const ts = params.textScale ?? 1;
  const M = 56;
  const club = clubTone(data);
  const ground = shade(club, -0.66);
  const lift = shade(club, -0.36);

  /* ---- the foot, from the logo up ---- */
  const span = CANVAS_W - 2 * M;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const nameSize = Math.max(22 * k, Math.min(32 * k, (span * 0.9) / Math.max(1, [...name].length * 0.6))) * ts;
  const fixSize = Math.max(14 * k, Math.min(19 * k, (span * 0.95) / Math.max(1, [...fixture].length * 0.53))) * ts;
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 44;
  const logoTop = H - logoBottom - logoH;
  const fixTop = logoTop - (story ? 66 : 50) - fixSize * 1.25;
  const nameTop = fixTop - (story ? 10 : 6) - nameSize * 1.2;

  /* ---- the word, low, rising out of the foot ---- */
  const word = sentenceCase(content.kicker || "Goal");
  const n = [...word].length;
  const wEm = Math.max(1, w800(word) + TRACK * (n - 1));
  const size = Math.min(story ? 440 : 400, span / wEm) * ts;
  const wordW = wEm * size;
  const capH = size * 0.727;
  const baseline = nameTop - (story ? 64 : 46) + (params.textY ?? 0);
  const lineTop = baseline - size * 0.964; // line-height 1.2: the baseline sits ~0.964em under the line box top
  const capTop = baseline - capH;

  /* ---- the celebrating player, centred, melting into the word's base ---- */
  const FRAME = story ? { chest: 310, waist: 250, knees: 200, full: 158 } : { chest: 220, waist: 170, knees: 136, full: 110 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  let box = placeFree(data, faceX, story ? 300 : 200, faceH0, baseline + 40);
  // Arms flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeEnd = capTop + capH * 0.4;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 270) - box.top}px, transparent ${fadeEnd - box.top}px)`;

  const small: CSSProperties = { position: "absolute", left: M, right: M, textAlign: "center", fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap", lineHeight: 1.2 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#ffffff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% 45% at 50% ${((box.top + box.faceH * 3) / H) * 100}%, ${lift}, ${ground} 72%)` }} />

      {/* The word: solid white at its foot, gone at its top. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          left: (CANVAS_W - wordW) / 2,
          top: lineTop,
          width: wordW + size * 0.1,
          height: size * 1.2,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.2,
          letterSpacing: `${TRACK}em`,
          whiteSpace: "nowrap",
          color: "transparent",
          backgroundImage: `linear-gradient(to top, #fff 0, #fff ${size * 1.2 - (baseline - lineTop) + capH * 0.12}px, rgba(255,255,255,0) ${size * 1.2 - (baseline - lineTop) + capH * 1.02}px)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
      >
        {word}
      </div>

      {/* The player, sharp, natural colour; a soft shade behind him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.22, top: box.top + box.faceH * 1.6, width: box.width * 0.56, height: box.faceH * 4, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {name && <div style={{ ...small, top: nameTop, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em" }}>{name}</div>}
      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 400, fontSize: fixSize, color: "rgba(255,255,255,.66)" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: logoBottom - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
