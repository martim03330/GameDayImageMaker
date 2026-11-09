/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Inter capitals with tracking, roughly. */
const capsEm = (t: string, track: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[IJ1]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.95 : 0.7) + track, 0);

/**
 * Goal pulse: one thin heartbeat line across a dark ground, at his chest height. Flat, then a single sharp
 * beat — a small dip, a tall spike, a deep drop — then flat again, glowing faintly in the club colour (or
 * white). "GOAL" sits small and wide-tracked over the spike. The celebrating player stands big and to one
 * side, the line running behind him; at the foot his name and the fixture (home first, never the score).
 */
export function Goalpulse({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const k = story ? 1.36 : 1;
  const club = clubTone(data);
  const ground = shade(club, -0.84);
  // The line: white or the club colour lifted to a bright tone (by seed); the glow always club-tinted.
  const white = rng((params.seed ?? 0) * 7919 + 3)() < 0.5;
  let bright = shade(club, 0.25);
  if (luminance(bright) < 0.18) bright = shade(club, 0.45);
  const stroke = white ? WHITE : bright;
  const glow = shade(club, 0.15);

  /* ---- the foot ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const fixture = teamsOf(data).join("  v  ").toUpperCase();
  const F_TRACK = 0.22;
  const fSize = Math.max(11, Math.min(15 * k, (story ? 900 : 860) / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.18;
  const nSize = Math.max(16, Math.min(28 * k, (story ? 900 : 860) / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const fixTop = logoTop - (story ? 66 : 42) - fSize;
  const nameTop = fixTop - (story ? 22 : 16) - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player: big, to one side ---- */
  const spikeLeft = params.side !== "left";
  const faceX = 540 + (spikeLeft ? 130 : -130);
  const sizes = story ? { chest: 280, waist: 226, knees: 178, full: 142 } : { chest: 226, waist: 182, knees: 142, full: 112 };
  let box = placeByFace(data, faceX, story ? STORY_TOP + 220 : 230, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The beat sits near the free edge; the figure (a raised arm included) is pushed toward its side to clear
  // it, at most 120px and never his face closer than 130px to the edge.
  const clear = story ? 300 : 280;
  if (spikeLeft) {
    const room = CANVAS_W - 130 - (box.left + (face[0] + face[2]) * box.width);
    box = { ...box, left: box.left + Math.max(0, Math.min(room, 120, clear - box.left)) };
  } else {
    const room = box.left + face[0] * box.width - 130;
    box = { ...box, left: box.left - Math.max(0, Math.min(room, 120, box.left + box.width - (CANVAS_W - clear))) };
  }
  const faceTop = box.top + face[1] * box.height;
  const chin = faceTop + box.faceH;
  const fadeEnd = footTop - (story ? 60 : 40);
  const fadeLen = story ? 400 : 280;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  /* ---- the beat ---- */
  const y0 = Math.round(Math.min(fadeEnd - 120, chin + box.faceH * 1.2)) + (params.textY ?? 0);
  const faceL = box.left + face[0] * box.width;
  const faceR = faceL + face[2] * box.width;
  const edge = story ? 170 : 150;
  const sx = spikeLeft ? Math.max(edge, Math.min(300, Math.min(faceL * 0.5, box.left - 90))) : Math.min(CANVAS_W - edge, Math.max(CANVAS_W - 300, Math.max(faceR + (CANVAS_W - faceR) * 0.5, box.left + box.width + 90)));
  const up = Math.min(story ? 440 : 330, y0 - (story ? STORY_TOP + 70 : 120));
  const u = story ? 1.3 : 1;
  const path = [
    `M -20 ${y0}`,
    `L ${sx - 30 * u} ${y0}`,
    `L ${sx - 16 * u} ${y0 + 22 * u}`,
    `L ${sx} ${y0 - up}`,
    `L ${sx + 20 * u} ${y0 + 92 * u}`,
    `L ${sx + 36 * u} ${y0}`,
    `L ${CANVAS_W + 20} ${y0}`,
  ].join(" ");
  const sw = story ? 3.6 : 2.8;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const W_TRACK = 0.6;
  const wSize = Math.max(12, Math.min(19 * k, 300 / Math.max(1, capsEm(word, W_TRACK)))) * ts;
  const wordTop = y0 - up - (story ? 46 : 34) - wSize;

  const caps = (s: number, track: number, weight: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: s, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", textAlign: "center", color });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* A faint lift of club colour behind him, nothing else on the ground. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${(faceX / CANVAS_W) * 100}% ${((y0 - 60) / H) * 100}%, ${shade(club, -0.6)}, transparent 75%)` }} />

      {/* The heartbeat: drawn under him, fading in from the edges, glowing softly. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id="goalpulse-fade" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={CANVAS_W} y2={0}>
            <stop offset="0" stopColor={stroke} stopOpacity={spikeLeft ? 0.05 : 0.35} />
            <stop offset={spikeLeft ? 0.16 : 0.5} stopColor={stroke} stopOpacity={0.95} />
            <stop offset={spikeLeft ? 0.5 : 0.84} stopColor={stroke} stopOpacity={0.95} />
            <stop offset="1" stopColor={stroke} stopOpacity={spikeLeft ? 0.35 : 0.05} />
          </linearGradient>
          <filter id="goalpulse-glow" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation={story ? 9 : 7} />
          </filter>
        </defs>
        <path d={path} fill="none" stroke={glow} strokeOpacity={0.75} strokeWidth={sw * 3} strokeLinejoin="round" filter="url(#goalpulse-glow)" />
        <path d={path} fill="none" stroke="url(#goalpulse-fade)" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      {/* The player, natural colour, dissolving into the ground above his name. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The title over the spike. */}
      <div style={{ position: "absolute", left: sx - 200, width: 400, top: wordTop, ...caps(wSize, W_TRACK, 500, WHITE), textShadow: `0 0 18px ${glow}` }}>{word}</div>

      {/* Foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: 48, right: 48, top: nameTop, ...caps(nSize, N_TRACK, 600, WHITE) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: 48, right: 48, top: fixTop, ...caps(fSize, F_TRACK, 400, "rgba(255,255,255,.62)") }}>{fixture}</div>}

      <AgencyLogo data={data} height={20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
