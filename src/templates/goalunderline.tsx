/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM } from "./types";

const PAPER = "#f3f2ef";
const INK = "#121212";

/** Inter 500 advance widths per 100px (approximate): capitals and lower case. */
const GW: Record<string, number> = {
  A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65,
  a: 56, b: 60, c: 54, d: 60, e: 57, f: 36, g: 60, h: 59, i: 25, j: 25, k: 54, l: 25, m: 88, n: 59, o: 59, p: 60, q: 60, r: 38, s: 52, t: 35, u: 59, v: 54, w: 79, x: 53, y: 54, z: 52,
  " ": 27, "'": 24, "-": 47, "–": 55, ".": 28, "!": 30,
};
const em = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (GW[c] ?? 60) / 100 + tracking, 0);
const capsEm = (t: string, tracking: number) => em(t.toUpperCase(), tracking);

/** "HAT-TRICK" → "Hat-trick": sentence case for the clean title. */
const sentence = (t: string) => {
  const s = t.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Goal underline: "Goal" in a clean medium sans, set large, with one thick club-colour bar under it that runs
 * off the edge of the canvas; his name and the fixture small beneath. The celebrating player stands on the
 * other side, natural colour on a pale ground. params.side puts him left or right (the text takes the other side).
 */
export function Goalunderline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const playerLeft = params.side === "left";
  const M = 64;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.22);

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = (ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join("  v  ") : f.comp || "").toUpperCase();

  /* ---- type ---- */
  const title = sentence((content.kicker || "GOAL").replace(/’/g, "'"));
  const T_TRACK = -0.035;
  const colW = story ? 600 : 520;
  const tSize = Math.min(story ? 236 : 176, colW / Math.max(1, em(title, T_TRACK))) * ts;
  const titleW = em(title, T_TRACK) * tSize;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.16;
  const nSize = Math.max(14, Math.min(24 * k, colW / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const F_TRACK = 0.22;
  const fSize = Math.max(10, Math.min(13 * k, colW / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;

  /* ---- the column, measured up from the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const ty = params.textY ?? 0;
  const fixBottom = (story ? STORY_BOTTOM - logoH - 60 : CANVAS_H - 52 - logoH - 44) + ty;
  const fixTop = fixBottom - fSize;
  const nameTop = fixTop - (story ? 20 : 14) - nSize;
  const barH = Math.round((story ? 26 : 20) * ts);
  const barTop = (name ? nameTop : fixTop) - (story ? 44 : 34) - barH;
  // Inter's cap height sits ~0.73em under a 1.0 line box top; the bar hangs a fixed gap under the baseline.
  const titleTop = barTop - (story ? 30 : 24) - tSize * 0.93;
  const barLen = M + titleW + (story ? 40 : 30);

  /* ---- the player on the other side, bleeding off the bottom ---- */
  const faceX = playerLeft ? (story ? 310 : 330) : story ? 770 : 750;
  const sizes = story ? { chest: 270, waist: 215, knees: 172, full: 138 } : { chest: 220, waist: 172, knees: 136, full: 108 };
  const faceTop = story ? 440 : 230;
  let box = placeByFace(data, faceX, faceTop, sizes);
  const wide = Math.min(1, (story ? 1000 : 900) / box.width);
  if (wide < 1) box = placeByFace(data, faceX, faceTop, Object.fromEntries(Object.entries(sizes).map(([key, v]) => [key, v * wide])));
  // Never let his face slide under the column: if the head sits low enough to meet the title, nudge him out.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceL = box.left + face[0] * box.width;
  const faceR = faceL + face[2] * box.width;
  const faceB = box.top + (face[1] + face[3]) * box.height;
  if (faceB > titleTop - 30) {
    const colEdge = playerLeft ? CANVAS_W - M - Math.max(titleW, 300) : M + Math.max(titleW, 300);
    const push = playerLeft ? Math.min(0, colEdge - 30 - faceR) : Math.max(0, colEdge + 30 - faceL);
    box = { ...box, left: box.left + push };
  }

  const caps = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK, ...extra });
  const align: CSSProperties = playerLeft ? { right: M, textAlign: "right" } : { left: M, textAlign: "left" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${playerLeft ? 30 : 70}% 35%, rgba(255,255,255,.55), transparent 70%)` }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.03)", ...cutMask(data.cut) }} />
      )}

      {/* The word and its bar, running off the near edge. */}
      <div style={{ position: "absolute", top: titleTop, ...align, fontFamily: SANS, fontWeight: 500, fontSize: tSize, letterSpacing: `${T_TRACK}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK }}>{title}</div>
      <div data-bleed style={{ position: "absolute", top: barTop, height: barH, width: barLen, [playerLeft ? "right" : "left"]: 0, background: club }} />

      {/* His name and the fixture, small under the bar. */}
      {name && <div style={{ position: "absolute", top: nameTop, ...align, ...caps(nSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", top: fixTop, ...align, ...caps(fSize, F_TRACK, 500, { opacity: 0.6 }) }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 18}
        style={{ position: "absolute", bottom: logoBottom, [playerLeft ? "right" : "left"]: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }}
      />
    </div>
  );
}
