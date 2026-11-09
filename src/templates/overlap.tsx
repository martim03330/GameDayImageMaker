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

const GROUND = "#eeebe5";
const INK = "#17181b";
/** Inter 800 is a touch wider than the 600 the width table was measured with; the tracking is pulled in. */
const HEAVY = 1.045;
const TRACK = -0.035;
/** Inter: cap height and x-height per 1px of font size. */
const CAP = 0.727;
const XH = 0.546;
/** The second line's baseline sits this far (in em) under the first: ~30% of its x-height runs into the first word. */
const LEAD = 0.4;

/** Split the kicker into two stacked words: "Matchday" → Match / day, "Game day" → Game / day. */
export function halves(kicker: string): [string, string] {
  const s = sentenceCase(kicker || "Matchday").replace(/[.!]+$/, "");
  const sp = s.split(/\s+/).filter(Boolean);
  if (sp.length >= 2) {
    const i = Math.ceil(sp.length / 2);
    return [sp.slice(0, i).join(" "), sp.slice(i).join(" ").toLowerCase()];
  }
  const m = /^(.+?)(day|time|night)$/i.exec(s);
  if (m && m[1].length >= 2) return [m[1], m[2].toLowerCase()];
  const cut = Math.ceil(s.length / 2);
  return [s.slice(0, cut), s.slice(cut)];
}

/** Width of a heavy word per 1px of font size, tracking included. */
export const heavyW = (t: string) => titleW(t, 1) * HEAVY + TRACK * Math.max(0, [...t].length - 1);

/**
 * Overlap: one idea — an overprint. "Match" and "day" set huge on two lines with negative leading, so the
 * lower word's x-height runs ~30% into the upper one: the top word in the club colour, the bottom in ink,
 * both slightly transparent and multiplied, so where they cross the ink deepens like two passes of a press.
 * The player in natural colour on the other side of a pale ground; fixture (home first, names as stored),
 * date · kick-off and the ground small at the foot.
 */
export function Overlap({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.34 : 1;
  const right = params.side !== "left"; // the player's side
  const club = shade(clubTone(data), -0.08);

  /* ---- the overprint ---- */
  const [w1, w2] = halves(content.kicker || "Matchday");
  const M = story ? 64 : 64;
  const colW = story ? 760 : 640;
  const size = Math.min(story ? 300 : 236, colW / Math.max(1, heavyW(w1), heavyW(w2))) * ts;
  const top = (story ? STORY_TOP : 84) + (params.textY ?? 0);
  const base1 = top + CAP * size;
  const base2 = base1 + LEAD * size;
  const titleBottom = base2 + 0.22 * size;
  const anchor = right ? "start" : "end";
  const tx = right ? M - size * 0.04 : CANVAS_W - M + size * 0.02;

  /* ---- the player, on the other side ---- */
  // In the story his body comes down beside the foot: keep him further over so the info column stays clear.
  const faceX = story ? (right ? 800 : 280) : right ? 728 : 352;
  const faceTop = story ? Math.max(base2 + 10, 560) : Math.max(base2 - 0.1 * size, 300);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 340, waist: 290, knees: 226, full: 176 } : { chest: 250, waist: 214, knees: 168, full: 130 });

  /* ---- the foot ---- */
  const logoAsked = story ? 22 : 18;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const teams = teamsOf(data);
  // The fixture: one line in the post; home / "v away" stacked in the story's narrower column.
  const fixLines = teams.length === 2 ? (story ? [teams[0], `v  ${teams[1]}`] : [`${teams[0]}  v  ${teams[1]}`]) : teams[0] ? [`v ${teams[0]}`] : [];
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const venue = (content.venue ?? "").trim();
  const infoW = story ? 420 : 470;
  const longest = Math.max(1, ...fixLines.map((l) => bodyW(l, 1) * 1.05));
  const fixSize = Math.max(17 * q, Math.min(27 * q, infoW / longest)) * ts;
  const lineSize = Math.max(14 * q, Math.min(19 * q, infoW / Math.max(1, bodyW(venue, 1)))) * ts;
  const gap = story ? 66 : 62;
  const lines = [when, venue].filter(Boolean);
  const infoH = fixLines.length * fixSize * 1.22 + lines.length * (lineSize * 1.3) + (lines.length ? 10 * q : 0);
  const infoTop = logoTop - gap - infoH;
  const compLines = (story ? [f.comp, f.round] : [[f.comp, f.round].filter(Boolean).join("  ·  ")]).map((l) => (l ?? "").trim()).filter(Boolean);
  const compSize = Math.max(10, Math.min(12.5 * q, ...compLines.map((l) => infoW / Math.max(1, l.length * 0.98)))) * ts;
  const compH = compLines.length ? compLines.length * compSize * 1.5 + 14 * q : 0;

  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const small: CSSProperties = { fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };
  const word = (t: string, y: number, fill: string) => (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply" }} aria-hidden>
      <text x={tx} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize={size} letterSpacing={size * TRACK} fill={fill} fillOpacity={0.86}>
        {t}
      </text>
    </svg>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${faceX / 10.8}% ${((faceTop + 200) / H) * 100}%, #f7f5f1, ${GROUND} 60%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The overprint: two passes, multiplied. */}
      {word(w1, base1, club)}
      {word(w2, base2, INK)}

      {/* The player, natural colour, in front; a soft shade at his back instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: box.top + box.height * 0.25, width: box.width * 0.6, height: box.height * 0.7, borderRadius: "50%", background: "rgba(40,36,30,.10)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
      )}

      {/* Foot, on the free side: competition, fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", top: infoTop - compH, ...side, display: "flex", flexDirection: "column" }}>
        {compLines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 500, fontSize: compSize, lineHeight: 1.5, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: i === compLines.length - 1 ? 14 * q : 0, color: "rgba(23,24,27,.55)" }}>
            {l}
          </div>
        ))}
        {fixLines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 600, fontSize: fixSize, lineHeight: 1.22, letterSpacing: "-0.01em" }}>
            {l}
          </div>
        ))}
        {lines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 400, fontSize: lineSize, lineHeight: 1.3, marginTop: i === 0 ? 10 * q : 0, color: "rgba(23,24,27,.64)" }}>
            {l}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={logoAsked}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
