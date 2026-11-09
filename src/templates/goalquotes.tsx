/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Bodoni Moda 500: advance widths per 100px (measured in the browser). */
const BOD: Record<string, number> = { a: 53.9, b: 61.7, c: 51.5, d: 61.7, e: 52.6, f: 40.2, g: 60.8, h: 60.5, i: 31, j: 31.3, k: 61.6, l: 34.2, m: 87, n: 60.5, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 60.7, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, A: 78, B: 67.1, C: 71.8, D: 73.8, E: 62.6, F: 60.4, G: 74.8, H: 77.4, I: 39.9, J: 47.7, K: 72.6, L: 61.1, M: 88.4, N: 77.6, O: 75.7, P: 65.2, Q: 75.7, R: 73.1, S: 58.4, T: 68.1, U: 73, V: 78.2, W: 103.7, X: 77.8, Y: 73.8, Z: 59.1, " ": 25, ".": 21.6, "-": 36, "'": 21.6, "!": 33.5 };
const bodEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BOD[c] ?? 60) / 100, 0);
/*
 * Bodoni Moda metrics (per 1em, line-height 1): the baseline sits 0.865em under the box top; the quote
 * marks' ink runs from 0.089em to 0.366em under the top and from 0.04em to 0.40em across; capitals are 0.76em.
 */
const BASE = 0.865;
const Q_INK_TOP = 0.089;
const Q_INK_BOTTOM = 0.366;
const Q_INK_LEFT = 0.04;
const Q_ADV = 0.442;
const CAP = 0.76;

/**
 * Goal quotes: the goal told as a quotation. A deep club-tone ground; one giant Bodoni opening quote mark,
 * pale club tint, standing behind the celebrating player's raised arm; at the foot the single word —
 * “Goal.” / “Brace.” / “Hat-trick.” — set big in Bodoni and closed by its own quote mark, and under it the
 * attribution in small Inter: "— Moisés Conceição, SC Vianense SAD v Leixões". No invented words, no score.
 */
export function Goalquotes({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const M = story ? 84 : 72;

  const club = clubTone(data);
  const ground = shade(club, -0.62);
  const groundLift = shade(club, -0.38);
  const tint = shade(club, 0.55);

  /* ---- the foot, from the logo up: logo, attribution, the word ---- */
  const logoAsk = story ? 26 : 20;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsk * 2) * 1.7)) : Math.max(52, logoAsk * 2);
  const logoBottomY = story ? STORY_BOTTOM : H - 52;
  const logoTop = logoBottomY - logoH;

  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const teams = teamsOf(data);
  const match = teams.join(" v ");
  const attribution = `— ${[name, match].filter(Boolean).join(", ")}`;
  const aMax = (story ? 30 : 22) * ts;
  const aW = CANVAS_W - 2 * M;
  let aSize = Math.min(aMax, aW / Math.max(1, bodyW(attribution, 1)));
  // Too long for one line at a readable size: the name on one line, the match on the next.
  const twoLines = aSize < (story ? 22 : 17) && !!name && !!match;
  const aLines = twoLines ? [`— ${name},`, match] : [attribution];
  if (twoLines) aSize = Math.min(aMax, ...aLines.map((l) => aW / Math.max(1, bodyW(l, 1))));
  const aLead = aSize * 1.4;
  const aGap = story ? 64 : 40;
  const aBottom = logoTop - aGap + (params.textY ?? 0);
  const aTop = aBottom - aLines.length * aLead + (aLead - aSize) / 2;

  const kick = sentenceCase(content.kicker || "Goal");
  const word = /[.!?]$/.test(kick) ? kick : `${kick}.`;
  // The word, then its closing mark tucked in after it.
  const closeGap = 0.04;
  const wEm = bodEm(word) + closeGap + Q_ADV;
  const wSize = Math.min((story ? 320 : 256) * ts, (CANVAS_W - 2 * M) / wEm);
  const wBase = aTop - (story ? 44 : 34) * Math.min(1, ts);
  const wBoxTop = wBase - BASE * wSize;
  const capTop = wBase - CAP * wSize;

  /* ---- the player: big, face high, slightly off-centre ---- */
  const sizes = story ? { chest: 340, waist: 272, knees: 214, full: 168 } : { chest: 240, waist: 192, knees: 150, full: 118 };
  const side = params.side === "left" ? -1 : params.side === "right" ? 1 : 0;
  const faceX = 540 + side * 70;
  let box = placeByFace(data, faceX, story ? STORY_TOP + 170 : 150, sizes);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  // A photo that cuts his body at a side: run that side off the canvas instead of showing the cut edge.
  const [fx0, , fx1] = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const cl = data.cut?.left ?? 0;
  const cr = data.cut?.right ?? 0;
  if (cr > 0 && cr >= cl && box.left + box.width < CANVAS_W) box = { ...box, left: Math.max(box.left, Math.min(CANVAS_W - box.width, 820 - (fx0 + fx1 / 2) * box.width)) };
  else if (cl > 0 && box.left > 0) box = { ...box, left: Math.min(box.left, Math.max(0, 260 - (fx0 + fx1 / 2) * box.width)) };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceTop = box.top + face[1] * box.height;
  // He melts into the ground just above the word.
  const fadeTo = capTop + wSize * 0.25 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 380 : 300)}px, transparent ${fadeTo}px)`;

  /* ---- the opening mark: giant, behind him, on the side away from his face ---- */
  const qSize = (story ? 1180 : 900) * Math.min(1.1, ts);
  const markLeftSide = faceCx >= 540;
  const qInkW = (0.404 - Q_INK_LEFT) * qSize;
  const qInkTop = story ? STORY_TOP + 10 : 70;
  const qInkLeft = markLeftSide ? M - 30 : CANVAS_W - M + 30 - qInkW;
  const qTop = qInkTop - Q_INK_TOP * qSize;
  const qLeft = qInkLeft - Q_INK_LEFT * qSize;

  const words = (extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", fontFamily: BODONI, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* Deep club ground, lifted softly behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${faceCx}px ${faceTop + box.faceH * 2.5}px, ${groundLift} 0%, ${ground} 100%)` }} />

      {/* The giant opening quote, behind the figure. */}
      <div data-bleed style={words({ left: qLeft, top: qTop, fontSize: qSize, color: tint, opacity: 0.62 })}>“</div>

      {/* The player, sharp, natural colour; a soft shade under him rather than a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: faceTop + box.faceH * 1.6, width: box.width * 0.6, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - capTop + 200, background: `linear-gradient(to bottom, transparent, ${ground} 70%)`, opacity: 0.7 }} />

      {/* The word, closed by its own mark. */}
      <div style={words({ left: M, top: wBoxTop, fontSize: wSize, color: WHITE, letterSpacing: "-0.01em" })}>
        {word}
        <span style={{ color: tint, opacity: 0.8, marginLeft: `${closeGap}em` }}>”</span>
      </div>

      {/* The attribution. */}
      {aLines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: M, top: aTop + i * aLead, fontFamily: SANS, fontWeight: 400, fontSize: aSize, lineHeight: 1, letterSpacing: "0.01em", color: "rgba(255,255,255,.82)", whiteSpace: "nowrap" }}>
          {l}
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={logoAsk}
        style={{ position: "absolute", left: M, bottom: H - logoBottomY - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
