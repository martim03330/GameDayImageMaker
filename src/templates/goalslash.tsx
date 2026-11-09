/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const PAPER = "#f1efea";
const INK = "#141519";
const GREY = "rgba(20,21,25,.58)";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3, ".": 27, "!": 30 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);
const fit = (t: string, width: number, max: number, tracking = 0, min = 10) => Math.max(min, Math.min(max, width / Math.max(0.5, interEm(t, tracking))));
/** Caps width: Inter caps + tracking. */
const capsFit = (t: string, width: number, max: number, tracking: number, min = 9) => fit(t.toUpperCase(), width, max, tracking, min);

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Home team first, names exactly as stored (only the case may change). */
function teamsOf(data: RenderData): string[] {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? c.homeTeam : c.awayTeam) || ours).trim();
  const oppName = ((weHost ? c.awayTeam : c.homeTeam) || f.opp || "").trim();
  return (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean);
}

/**
 * Goal slash: a warm paper ground cut corner to corner by ONE hairline in the club colour, rising behind the
 * celebrating player's chest. Above the line, in the top corner, "Goal" in large Inter medium (the figure's
 * raised arms may pass in front of it); below the line, in the opposite foot corner, his name in Inter over
 * the fixture in tiny spaced caps (home first, never the score). The NEYOD mark in the remaining corner.
 * params.side mirrors it.
 */
export function Goalslash({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const flip = params.side === "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  const teams = teamsOf(data);
  const M = story ? 64 : 60;

  /* ---- the line: low on the title's side, high on the name's side ---- */
  const yLow = H * (story ? 0.66 : 0.72);
  const yHigh = H * (story ? 0.3 : 0.26);
  const [y0, y1] = flip ? [yHigh, yLow] : [yLow, yHigh];
  const len = Math.hypot(CANVAS_W + 400, y1 - y0 + ((y1 - y0) / CANVAS_W) * 400);
  const ang = (Math.atan2(y1 - y0, CANVAS_W) * 180) / Math.PI;
  const lineY = (x: number) => y0 + ((y1 - y0) * x) / CANVAS_W;

  /* ---- title, top corner above the line ---- */
  const title = sentence(content.kicker || "Goal");
  const tMax = (story ? 236 : 166) * (params.textScale ?? 1);
  const tSize = fit(title, story ? 760 : 640, tMax, -0.045, 60);
  const tTop = (story ? STORY_TOP - tSize * 0.17 : 52) + ty;

  /* ---- foot ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = story ? 88 : 52;
  const logoW = logoH * 3.06 * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 52;
  const footW = CANVAS_W - 2 * M - logoW - 56;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const nSize = fit(name, footW, 58 * k, -0.02, 22);
  const fixture = teams.map((t) => t.toUpperCase()).join("  v  ");
  const fixSize = capsFit(fixture, footW, 13 * k, 0.2, 9);
  const fixTop = footBottom - fixSize;
  const nameTop = fixTop - 20 * k - nSize * 1.0;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player: big, a touch towards the name's side ---- */
  const sizes = story ? { chest: 320, waist: 262, knees: 206, full: 164 } : { chest: 236, waist: 194, knees: 152, full: 118 };
  const shift = flip ? -40 : 40;
  let box = placeByFace(data, 540 + shift, story ? 540 : 330, sizes);
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeEnd = footTop - (story ? 70 : 46) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 280)}px, transparent ${fadeEnd}px)`;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chestY = box.top + face[1] * box.height + box.faceH * 2.2;

  const ink = (size: number, weight: number, track: number, color = INK): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* Paper, lit softly behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 40% at ${(faceCx / CANVAS_W) * 100}% ${(chestY / H) * 100}%, rgba(255,255,255,.85), transparent 72%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(60,50,40,.08))" }} />

      {/* The title, behind the figure. */}
      <div style={{ position: "absolute", top: tTop, ...(flip ? { right: M - tSize * 0.02 } : { left: M - tSize * 0.05 }), ...ink(tSize, 500, -0.045) }}>{title}</div>

      {/* The hairline, corner to corner. */}
      <div
        style={{
          position: "absolute",
          left: -200,
          top: lineY(-200) - (story ? 1.5 : 1),
          width: len,
          height: story ? 3 : 2,
          background: club,
          transform: `rotate(${ang}deg)`,
          transformOrigin: "0 50%",
        }}
      />

      {/* The player, sharp, natural colour, melting into the paper above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Foot, opposite corner: name over the fixture. */}
      <div style={{ position: "absolute", top: footTop, ...(flip ? { left: M } : { right: M }), display: "flex", flexDirection: "column", alignItems: flip ? "flex-start" : "flex-end" }}>
        {name && <div style={{ ...ink(nSize, 500, -0.02), height: nSize }}>{name}</div>}
        {fixture && <div style={{ ...ink(fixSize, 500, 0.2, GREY), marginTop: 20 * k, marginRight: flip ? 0 : "-0.2em" }}>{fixture}</div>}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", ...(flip ? { right: M } : { left: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: flip ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
