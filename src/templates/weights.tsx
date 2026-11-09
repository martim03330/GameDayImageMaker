/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { mix } from "./circletext";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#151515";
const M = 64;

/** Inter 900 / 400: advance widths per 100px (measured in the browser). The ladder is fitted on its heaviest rung. */
const I900: Record<string, number> = { a: 59.7, b: 64.6, c: 60.3, d: 64.6, e: 60.6, f: 42.2, g: 64.7, h: 64.9, i: 29.6, j: 29.6, k: 60.6, l: 29.6, m: 94.3, n: 64.9, o: 62.5, p: 64.6, q: 64.6, r: 43.4, s: 58.8, t: 39.9, u: 64.9, v: 63.2, w: 87.7, x: 60.9, y: 63.6, z: 59, A: 79.5, B: 66.8, C: 74.8, D: 72.3, E: 61.3, F: 58.4, G: 75.4, H: 75, I: 29.1, J: 59.6, K: 75.9, L: 56.5, M: 95.6, N: 77, O: 77.5, P: 65.6, Q: 78.7, R: 66.8, S: 66.6, T: 68.7, U: 72.2, V: 79.5, W: 108.2, X: 78.6, Y: 77.5, Z: 69.4, " ": 19.9, "-": 47.5, "'": 37.2, "!": 38.1 };
const I500: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 37, g: 61.9, h: 60.1, i: 25.2, j: 25.2, k: 56, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.8, t: 33.7, u: 60.1, v: 57.4, w: 82.8, x: 55.7, y: 57.5, z: 55.9, A: 72, B: 65.6, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.5, I: 27.3, J: 57.5, K: 68.7, L: 56.5, M: 91.2, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72, W: 102.4, X: 70, Y: 69.6, Z: 64, " ": 26.6, ".": 30, "-": 46, "'": 31, "·": 30 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const em = (t: string, table: Record<string, number>, track = 0) => plain(t).reduce((a, c) => a + (table[c] ?? (/\d/.test(c) ? 62 : 62)) / 100 + track, 0);

/** The rungs of the ladder: Thin → Regular → Bold → Black. */
const RUNGS = [100, 400, 700, 900] as const;
const TRACK = -0.035;

/**
 * Weights: a type-weight ladder. The title ("Matchday") set four times, stacked flush-left at one size, each
 * rung a heavier Inter — Thin, Regular, Bold, Black — the last in the club colour. Under it, small: the
 * fixture (home first, names exactly as stored), date · kick-off, the ground. The player big on the other
 * side of a pale, flat ground. (Unlike `repeat`, no 3D offsets or shards: only the weights change.)
 */
export function Weights({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.32 : 1;
  const right = params.side !== "left";

  let club = clubTone(data);
  if (luminance(club) > 0.32) club = shade(club, -0.3);
  const ground = mix("#f2efea", club, 0.035);

  /* ---- the words ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const score = scoreOf(data, "–");
  const isResult = postType === "result" && !!score;
  const word = isResult ? "Full Time" : sentenceCase(content.kicker || "Matchday");
  const fixture = teams.length === 2 ? `${teams[0]} ${isResult ? score : "v"} ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const when = [niceDate(content.date), isResult ? "" : f.time].filter(Boolean).join("  ·  ");
  const ground2 = titleCase(f.venue) || titleCase(f.comp || "");

  /* ---- the foot: the logo, the ladder ~60px above it (from the "y" descender), the small info above that ---- */
  const logoH = story ? 88 : 52;
  const logoBottomY = story ? STORY_BOTTOM : CANVAS_H - 56;
  const logoTop = logoBottomY - logoH;
  const colMax = story ? 640 : 520;
  const size = Math.min((story ? 146 : 112) * ts, colMax / Math.max(1, em(word, I900, TRACK)));
  const lineH = 0.96;
  const ladderW = em(word, I900, TRACK) * size;
  // Post: the ladder stands on the logo. Story: it hangs from the top line, the info under it, the player below.
  const ladderBottom = story ? STORY_TOP - size * 0.117 + size * lineH * RUNGS.length + (params.textY ?? 0) : logoTop - 56 - size * 0.08 + (params.textY ?? 0);
  const top = ladderBottom - size * lineH * RUNGS.length;
  const colW = Math.max(ladderW, story ? 520 : 440);
  // Flush-left either way; on the right it hangs from the right margin.
  const colLeft = right ? M : CANVAS_W - M - ladderW;
  // In the story the foot (info + logo) stands apart from the ladder: with the player on the left it hugs the right margin.
  const footRight = story && !right;

  const fixSize = Math.min(25 * q, (colW * 0.98) / Math.max(1, em(fixture, I500))) * ts;
  const lineSize = Math.min(19 * q, (colW * 0.98) / Math.max(1, em(ground2, I500))) * ts;
  const infoH = fixSize * 1.25 + (19 * q * ts + lineSize) * 1.25 + 16 * q;
  // Above the logo in the story (~64px clear), above the ladder in the post.
  const infoTop = story ? logoTop - 64 - infoH : top - 40 - infoH;

  /* ---- the player, big on the other side, his head high ---- */
  const sizes = story ? { chest: 330, waist: 285, knees: 235, full: 190 } : { chest: 245, waist: 210, knees: 170, full: 135 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceX = right ? (story ? 790 : 780) : story ? 300 : 300;
  const b0 = placeByFace(data, faceX, 400, sizes);
  const hair = Math.min(400 - b0.top, b0.faceH * 0.9);
  const box = placeByFace(data, faceX, (story ? ladderBottom + size * 0.1 + 36 : 70) + hair, sizes);
  const fTop = box.top + face[1] * box.height;

  const small: CSSProperties = { fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      {/* The ground: flat, a soft light behind him. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(60% 46% at ${right ? 66 : 34}% ${((fTop + box.faceH * 2) / H) * 100}%, rgba(255,255,255,.7), transparent 75%), linear-gradient(to bottom, transparent 70%, ${mix(ground, "#000000", 0.035)})`,
        }}
      />

      {/* The player, natural colour; a soft shade under his body instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.22, top: fTop + box.faceH * 2, width: box.width * 0.56, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.08)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
      )}

      {/* The ladder: one word, four weights, the last in the club colour. */}
      <div style={{ position: "absolute", left: colLeft, top, display: "flex", flexDirection: "column" }}>
        {RUNGS.map((w, i) => (
          <div key={w} style={{ fontFamily: SANS, fontWeight: w, fontSize: size, lineHeight: lineH, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", color: i === RUNGS.length - 1 ? club : INK }}>
            {word}
          </div>
        ))}
      </div>

      {/* The fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", ...(footRight ? { right: M, alignItems: "flex-end", textAlign: "right" } : { left: colLeft + size * 0.06 }), top: infoTop, display: "flex", flexDirection: "column", gap: 6 * q }}>
        {fixture && <div style={{ ...small, fontWeight: 500, fontSize: fixSize, letterSpacing: "-0.01em" }}>{fixture}</div>}
        {when && <div style={{ ...small, fontWeight: 400, fontSize: 19 * q * ts, opacity: 0.72, marginTop: 4 * q }}>{when}</div>}
        {ground2 && <div style={{ ...small, fontWeight: 400, fontSize: lineSize, opacity: 0.72 }}>{ground2}</div>}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 20}
        style={{ position: "absolute", ...(footRight ? { right: M } : { left: colLeft + size * 0.04 }), bottom: H - logoBottomY - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: footRight ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
