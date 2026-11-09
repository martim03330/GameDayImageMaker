/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GROUND = "#f1efeb";
const INK = "#16171a";
/** Inter 800 is a touch wider than the 600 the width table was measured with. */
const HEAVY = 1.045;

/**
 * Arrow: one typographic gesture. "Matchday" in heavy ink at the top, over the player's side, and from
 * under it one long hairline arrow (no sign, no panel — just a thin shaft and a small open head in the club
 * colour's ink) dropping straight through the empty ground to point at the top of his head: this is the
 * man. On the free side at the foot, small, the competition, the fixture (home first, names as stored),
 * date · kick-off and the ground. Pale ground, natural colour. Flips with params.side.
 */
export function Arrow({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.34 : 1;
  const right = params.side !== "left"; // the player's side
  const club = clubTone(data);
  const M = story ? 68 : 64;

  /* ---- the word, top of the free side ---- */
  const word = sentenceCase(content.kicker || "Matchday").replace(/[.!…]+$/, "");
  const wordEm = titleW(word, 1) * HEAVY * 0.965;
  const size = Math.min((story ? 128 : 112) * ts, (CANVAS_W * 0.58) / wordEm);
  const wordW = wordEm * size;
  const capTop = (story ? STORY_TOP : 76) + (params.textY ?? 0);
  const wordTop = capTop - 0.137 * size;
  const baseline = wordTop + 0.864 * size;
  const wordX = right ? M : CANVAS_W - M - wordW;

  /* ---- the facts, small, right under the word ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const venue = (content.venue ?? "").trim();
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const comp = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const infoW = Math.min(wordW, story ? 560 : 440);
  const fit = (t: string, max: number, w: (s: string, n: number) => number) => Math.max(max * 0.62, Math.min(max * q, infoW / Math.max(1, w(t, 1)))) * ts;
  const teamSize = Math.min(...teams.map((t) => fit(t, 28, (s, n) => titleW(s, n) * 1.01)));
  const whenSize = fit(when, 19, bodyW);
  const venueSize = fit(venue, 19, bodyW);
  const compSize = Math.max(10, Math.min(12.5 * q, infoW / Math.max(1, comp.length * 0.98))) * ts;
  let y = baseline + size * 0.3 + (story ? 54 : 40);
  const compTop = y;
  if (comp) y += compSize + 20 * q;
  const teamsTop = y;
  y += teams.length * teamSize * 1.18 + (teams.length > 1 ? teamSize * 0.9 : 0) + 14 * q;
  const whenTop = y;
  if (when) y += whenSize * 1.25 + 3 * q;
  const venueTop = y;

  /* ---- the player, big, lower on his side; the arrow runs from the word's end to his head ---- */
  const faceX = right ? (story ? 825 : 800) : story ? 255 : 280;
  const sizes = story ? { chest: 330, waist: 280, knees: 216, full: 166 } : { chest: 220, waist: 182, knees: 142, full: 110 };
  const box = placeByFace(data, faceX, story ? STORY_TOP + 700 : 500, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fTop = box.top + face[1] * box.height;
  const fadeFrom = H - (story ? 520 : 300);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${H - (story ? 260 : 90) - box.top}px)`;
  // From just past the word's end, at x-height, to a point just short of his head.
  const x0 = right ? wordX + wordW + size * 0.2 : wordX - size * 0.2;
  const y0 = baseline - size * 0.27;
  const hx = fCx;
  const hy = fTop + box.faceH * 0.2;
  const len0 = Math.hypot(hx - x0, hy - y0);
  const stopShort = box.faceH * 0.92 + (story ? 40 : 30);
  const x1 = x0 + ((hx - x0) * (len0 - stopShort)) / len0;
  const y1 = y0 + ((hy - y0) * (len0 - stopShort)) / len0;
  const stroke = story ? 2.6 : 2;
  const head = story ? 26 : 20;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const wing = (s: number) => `${x1 - head * Math.cos(ang + s * 0.5)},${y1 - head * Math.sin(ang + s * 0.5)}`;
  const arrowCol = shade(club, -0.15);

  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);

  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const type: CSSProperties = { fontFamily: SANS, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 68 : 32}% 50%, #faf9f6, ${GROUND} 60%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word. */}
      <div style={{ position: "absolute", top: wordTop, left: wordX, ...type, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.035em", color: INK }}>{word}</div>

      {/* The arrow: a hairline shaft and a small open head, pointing at him. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g fill="none" stroke={arrowCol} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <line x1={x0} y1={y0} x2={x1} y2={y1} />
          <polyline points={`${wing(1)} ${x1},${y1} ${wing(-1)}`} />
        </g>
      </svg>

      {/* The competition, the fixture, date · time, ground. */}
      {comp && <div style={{ position: "absolute", top: compTop, ...side, ...type, fontWeight: 500, fontSize: compSize, lineHeight: 1, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(22,23,26,.5)" }}>{comp}</div>}
      <div style={{ position: "absolute", top: teamsTop, ...side, display: "flex", flexDirection: "column" }}>
        {teams.map((t, i) => (
          <div key={t + i} style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
            {i > 0 && <div style={{ ...type, fontWeight: 400, fontSize: teamSize * 0.62, lineHeight: 1.45, color: "rgba(22,23,26,.45)" }}>v</div>}
            <div style={{ ...type, fontWeight: 600, fontSize: teamSize, lineHeight: 1.18, letterSpacing: "-0.015em" }}>{t}</div>
          </div>
        ))}
      </div>
      {when && <div style={{ position: "absolute", top: whenTop, ...side, ...type, fontWeight: 400, fontSize: whenSize, lineHeight: 1.25, color: "rgba(22,23,26,.7)" }}>{when}</div>}
      {venue && <div style={{ position: "absolute", top: venueTop, ...side, ...type, fontWeight: 400, fontSize: venueSize, lineHeight: 1.25, color: "rgba(22,23,26,.5)" }}>{venue}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 22 : 18}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
