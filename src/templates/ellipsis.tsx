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
/** The three dots, in title ems: diameters growing and gaps widening as they step towards him. */
const DOTS = [0.16, 0.22, 0.29];
const GAPS = [0.2, 0.28, 0.36];
const DOTS_EM = DOTS.reduce((a, d) => a + d, 0) + GAPS.reduce((a, g) => a + g, 0);

/**
 * Ellipsis: one typographic idea, anticipation. "Matchday" in heavy ink across the top, and after it an
 * ellipsis whose three dots are big club-colour circles, each a little bigger and further apart than the
 * last, stepping out over the ground towards the player (when he stands on the left the dots lead into the
 * word from his side). Under it, small on the free side, only the fixture (home first, names as stored),
 * date · kick-off and the ground. The player big on a pale ground. Flips with params.side.
 */
export function Ellipsis({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.34 : 1;
  const right = params.side !== "left"; // the player's side
  const club = clubTone(data);
  const M = story ? 68 : 64;

  /* ---- the title line: word + three dots across the top ---- */
  const word = sentenceCase(content.kicker || "Matchday").replace(/[.!…]+$/, "");
  const wordEm = titleW(word, 1) * HEAVY * 0.965;
  const size = Math.min((story ? 150 : 132) * ts, (CANVAS_W - 2 * M) / (wordEm + DOTS_EM));
  const capTop = (story ? STORY_TOP : 70) + (params.textY ?? 0);
  const lineTop = capTop - 0.137 * size; // Inter: cap top sits ~0.137em under a line-height-1 box
  const baseline = lineTop + 0.864 * size;

  /* ---- the player, big, on his side, his head under the last dot ---- */
  const faceX = right ? (story ? 800 : 770) : story ? 280 : 310;
  const sizes = story ? { chest: 320, waist: 262, knees: 204, full: 158 } : { chest: 236, waist: 192, knees: 150, full: 116 };
  // His hair rises ~0.6 face-heights over the face box: keep the whole head well under the dots.
  const probe = placeByFace(data, faceX, 400, sizes);
  const box = placeByFace(data, faceX, baseline + (story ? 96 : 76) + probe.faceH * 0.62, sizes);
  const fadeFrom = H - (story ? 520 : 300);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${H - (story ? 260 : 90) - box.top}px)`;

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
  const comp = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const compSize = Math.max(story ? 12 : 10, Math.min(13 * q, (story ? 430 : 420) / Math.max(1, comp.length * 0.98))) * ts;
  const gap = story ? 66 : 58;
  // Bottom-up: ground, date · time, the two teams, the competition.
  const venueTop = logoTop - gap - venueSize * 1.25;
  const whenTop = venue ? venueTop - 4 * q - whenSize * 1.25 : logoTop - gap - whenSize * 1.25;
  const teamsH = teams.length * teamSize * 1.18 + (teams.length > 1 ? teamSize * 0.9 : 0);
  const teamsTop = whenTop - 18 * q - teamsH;
  const compTop = teamsTop - 22 * q - compSize;
  const infoTop = comp ? compTop : teamsTop;

  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const type: CSSProperties = { fontFamily: SANS, whiteSpace: "nowrap" };

  // Dots sit on the baseline; in the mirrored layout they come first, biggest at his side.
  const order = right ? [0, 1, 2] : [2, 1, 0];
  const dots = order.map((i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        width: DOTS[i] * size,
        height: DOTS[i] * size,
        borderRadius: "50%",
        background: club,
        flexShrink: 0,
        alignSelf: "flex-end",
        marginBottom: size * (1 - 0.864),
        ...(right ? { marginLeft: GAPS[i] * size } : { marginRight: GAPS[i] * size }),
      }}
    />
  ));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 70 : 30}% 45%, #faf9f6, ${GROUND} 60%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* A breath of the ground behind the foot type, so a boot or a hand never runs through it. */}
      <div style={{ position: "absolute", [right ? "left" : "right"]: 0, top: infoTop - 160 * q, width: infoW + M + 200 * q, height: H - infoTop + 160 * q, background: `radial-gradient(farthest-side at ${right ? "0%" : "100%"} 62%, ${GROUND} 58%, transparent 100%)` }} />

      {/* The one idea: the word, then the three dots stepping towards him. */}
      <div style={{ position: "absolute", top: lineTop, height: size, [right ? "left" : "right"]: M, display: "flex", alignItems: "flex-start" }}>
        {!right && dots}
        <div style={{ ...type, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.035em", color: INK, marginLeft: right ? -size * 0.05 : 0 }}>{word}</div>
        {right && dots}
      </div>

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
