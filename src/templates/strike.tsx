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
const STRUCK = "#bdb9b2";
/** Inter 800 is a touch wider than the 600 the width table was measured with. */
const HEAVY = 1.045;

/**
 * Strike: a small typographic joke. "Rest day" in light grey, crossed out by one clean line in the club
 * colour, and under it the correction, "Matchday", in heavy ink. Then only the fixture (home first, names as
 * stored), date · kick-off and the ground, small. The player big on the other side of a pale ground.
 */
export function Strike({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.34 : 1;
  const right = params.side !== "left"; // the player's side
  const club = clubTone(data);
  const M = story ? 68 : 64;

  /* ---- the player, big, on his side ---- */
  const faceX = right ? (story ? 820 : 780) : story ? 260 : 300;
  const sizes = story ? { chest: 320, waist: 262, knees: 204, full: 158 } : { chest: 240, waist: 196, knees: 152, full: 118 };
  const box = placeByFace(data, faceX, story ? STORY_TOP + 250 : 235, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = box.top + face[1] * box.height;
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceW = face[2] * box.width;
  const fadeFrom = H - (story ? 520 : 300);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${H - (story ? 260 : 90) - box.top}px)`;

  /* ---- the pair, beside his head ---- */
  const word = sentenceCase(content.kicker || "Matchday").replace(/[.!]+$/, "");
  const wrong = "Rest day";
  const room = right ? fCx - faceW * 0.95 - 44 - M : CANVAS_W - M - (fCx + faceW * 0.95 + 44);
  const colW = Math.max(story ? 440 : 380, Math.min(story ? 640 : 580, room));
  const size = Math.min(story ? 156 : 128, colW / Math.max(1, titleW(word, 1) * HEAVY * 0.97), colW / Math.max(1, titleW(wrong, 1) * HEAVY * 0.97)) * ts;
  const lineH = 1.02;
  const pairTop = Math.max((story ? STORY_TOP : 64) + 70 * q, faceTop - box.faceH * 0.4) + (params.textY ?? 0);
  const pairBottom = pairTop + size * lineH * 2;

  /* ---- the foot ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const venue = (content.venue ?? "").trim();
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const infoW = story ? 560 : 470;
  const fit = (t: string, max: number, w: (s: string, n: number) => number) => Math.max(max * 0.66, Math.min(max, infoW / Math.max(1, w(t, 1)))) * q * ts;
  const teamSize = Math.min(...teams.map((t) => fit(t, 30, (s, n) => titleW(s, n) * 1.01)));
  const whenSize = fit(when, 20, bodyW);
  const venueSize = fit(venue, 20, bodyW);
  const gap = story ? 64 : 58;
  // Bottom-up: ground, date · time, then the two teams.
  const venueTop = logoTop - gap - venueSize * 1.25;
  const whenTop = venue ? venueTop - 4 * q - whenSize * 1.25 : logoTop - gap - whenSize * 1.25;
  const teamsH = teams.length * teamSize * 1.18 + (teams.length > 1 ? teamSize * 0.9 : 0);
  const teamsTop = whenTop - 18 * q - teamsH;
  const infoTop = Math.max(teamsTop, pairBottom + 60);
  const comp = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const compSize = Math.max(10, Math.min(13 * q, (story ? 640 : 520) / Math.max(1, comp.length * 0.98))) * ts;

  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const type: CSSProperties = { fontFamily: SANS, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 70 : 30}% 40%, #faf9f6, ${GROUND} 60%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* A breath of the ground behind the foot type, so a boot or a hand never runs through it. */}
      <div style={{ position: "absolute", [right ? "left" : "right"]: 0, top: infoTop - 160 * q, width: infoW + M + 200 * q, height: H - infoTop + 160 * q, background: `radial-gradient(farthest-side at ${right ? "0%" : "100%"} 62%, ${GROUND} 58%, transparent 100%)` }} />

      {comp && (
        <div style={{ position: "absolute", top: story ? STORY_TOP : 64, ...side, ...type, fontWeight: 500, fontSize: compSize, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(22,23,26,.5)" }}>{comp}</div>
      )}

      {/* The joke: the wrong word struck out, the right one under it. */}
      <div style={{ position: "absolute", top: pairTop, ...side, display: "flex", flexDirection: "column" }}>
        <div style={{ ...type, position: "relative", fontWeight: 700, fontSize: size, lineHeight: lineH, letterSpacing: "-0.035em", color: STRUCK }}>
          {wrong}
          <div style={{ position: "absolute", left: "-0.05em", right: "-0.03em", top: "0.555em", height: "0.07em", background: club }} />
        </div>
        <div style={{ ...type, fontWeight: 800, fontSize: size, lineHeight: lineH, letterSpacing: "-0.035em", color: INK }}>{word}</div>
      </div>

      {/* The fixture, date · time, ground. */}
      <div style={{ position: "absolute", top: infoTop, ...side, display: "flex", flexDirection: "column" }}>
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
