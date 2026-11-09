/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter advance per 1px of font size for the usual words (measured in the browser), else a rough guess. */
const I700: Record<string, number> = { Goal: 2.225, Brace: 2.82, "Hat-trick": 4.362 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const guess = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[il!'.]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.88 : /[MW]/.test(c) ? 0.95 : /[A-Z]/.test(c) ? 0.72 : c === "-" ? 0.46 : 0.6), 0);

/**
 * Goal arrow: one gesture. On a deep club-tone ground, "Goal" big and white low on the free side, and
 * from just above it one white hairline arrow sweeping up in a gentle curve to point at the celebrating
 * player's head (it passes behind him, so a raised arm simply hides a stretch of it). Under the word,
 * small, his name and the fixture (home first, names as stored, never a score), then the agency logo.
 * Flips with params.side.
 */
export function Goalarrow({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  const club = clubTone(data);
  const deep = shade(club, -0.62);
  const GROUND = shade(club, -0.72);

  /* ---- the foot: logo, then (≥ 56px above it) the name and fixture ---- */
  const M = story ? 72 : 64;
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const infoW = story ? 700 : 620;
  const nameSize = Math.max(16, Math.min(26 * q, infoW / Math.max(1, name.length * 0.6))) * ts;
  const fixSize = Math.max(14, Math.min(21 * q, infoW / Math.max(1, fixture.length * 0.54))) * ts;
  const infoBottom = logoBottom + logoH + (story ? 66 : 56) - (params.textY ?? 0);
  const infoH = (name ? nameSize * 1.25 : 0) + (fixture ? fixSize * 1.3 + 4 * q : 0);

  /* ---- the word ---- */
  const word = sentenceCase(content.kicker || "GOAL").replace(/[.!…]+$/, "") || "Goal";
  const wordEm = (I700[word] ?? guess(word) * 1.04) - 0.04 * ([...word].length - 1);
  const colW = CANVAS_W - 2 * M - (story ? 40 : 60);
  const sG = Math.min((story ? 290 : 236) * ts, colW / wordEm);
  const wordW = wordEm * sG;
  const goalTop = H - infoBottom - infoH - 40 * q - sG;
  const wordX = right ? M - sG * 0.05 : CANVAS_W - M - wordW;

  /* ---- the player, big, on the other side ---- */
  const faceX = right ? (story ? 700 : 730) : story ? 380 : 350;
  const faceTop = story ? STORY_TOP + 130 : 170;
  let box = placeByFace(data, faceX, faceTop, story ? { chest: 300, waist: 250, knees: 200, full: 156 } : { chest: 240, waist: 200, knees: 160, full: 122 });
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (right ? Math.max(0, lean) : Math.min(80, Math.max(0, lean))) };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceW = face[2] * box.width;
  const darkFrom = Math.max(fTop + box.faceH * 2, goalTop - 300 * q);
  const darkAt = Math.max(200, goalTop + sG * 0.15 - darkFrom);

  /* ---- the arrow: from above the word, sweeping up to his head ---- */
  const dir = right ? 1 : -1;
  const x0 = wordX + (right ? wordW * 0.2 : wordW * 0.8);
  const y0 = goalTop + sG * 0.08 - (story ? 44 : 34);
  const x1 = fCx - dir * (faceW * 0.5 + box.faceH * 0.32 + (story ? 30 : 24));
  const y1 = fTop + box.faceH * 0.42;
  // A gentle curve: rising first, then leaning in towards him.
  const cx = x0 + (x1 - x0) * 0.08;
  const cy = y1 + (y0 - y1) * 0.12;
  const ang = Math.atan2(y1 - cy, x1 - cx);
  const head = story ? 26 : 20;
  const wing = (s: number) => `${x1 - head * Math.cos(ang + s * 0.5)},${y1 - head * Math.sin(ang + s * 0.5)}`;
  const stroke = story ? 2.6 : 2;

  const side: CSSProperties = right ? { left: M, alignItems: "flex-start", textAlign: "left" } : { right: M, alignItems: "flex-end", textAlign: "right" };
  const small: CSSProperties = { fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "-0.005em" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: "#ffffff" }}>
      {/* The ground: deep club tone, a soft lift behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${(faceX / CANVAS_W) * 100}% ${((fTop + box.faceH * 2) / H) * 100}%, ${shade(club, -0.38)}, ${deep} 55%, ${GROUND} 100%)` }} />

      {/* The arrow, behind him. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g fill="none" stroke="rgba(255,255,255,.92)" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`} />
          <polyline points={`${wing(1)} ${x1},${y1} ${wing(-1)}`} />
        </g>
      </svg>

      {/* The player. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: darkFrom, bottom: 0, background: `linear-gradient(to bottom, transparent, ${GROUND}e6 ${darkAt}px, ${GROUND} ${darkAt + 240 * q}px)` }} />

      {/* The word. */}
      <div style={{ position: "absolute", top: goalTop, left: wordX, fontFamily: SANS, fontWeight: 700, fontSize: sG, lineHeight: 1, letterSpacing: "-0.04em", color: "#ffffff", whiteSpace: "nowrap" }}>{word}</div>

      {/* Name and fixture, small. */}
      <div style={{ position: "absolute", bottom: infoBottom, ...side, display: "flex", flexDirection: "column", gap: 4 * q }}>
        {name && <div style={{ ...small, fontWeight: 500, fontSize: nameSize, lineHeight: 1.25 }}>{name}</div>}
        {fixture && <div style={{ ...small, fontWeight: 400, fontSize: fixSize, lineHeight: 1.3, color: "rgba(255,255,255,.62)" }}>{fixture}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
