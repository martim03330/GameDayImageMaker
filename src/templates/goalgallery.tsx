/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, type Box } from "./fx";
import { standing } from "./mist";
import { seasonOf } from "./gradient";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const INK = "#24221f";
const SOFT = "#6f6b65";
/** The backdrop, top to floor. */
const PAPER_TOP = "#ebe8e3";
const PAPER_MID = "#e4e0da";
const PAPER_FLOOR = "#d3cec6";

/** DM Serif Display italic: advance widths per 100px (measured in the browser). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
/** Inter 500 caps, roughly (with the letter-spacing added per glyph). */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.4 : c === "M" || c === "W" ? 0.95 : 0.7) + tracking, 0);

const MARGIN = 60;

/** mist.tsx's standing(), with the bottom edge of a cropped figure as a parameter (the story runs taller). */
function standingTo(data: RenderData, o: { cx: number; headTop: number; floor: number; maxFace?: number }, bottomEdge: number): Box & { feet: boolean; faceCx: number; faceTop: number; faceH: number } {
  const p = data.params;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  const framing = p.framing ?? "full";
  const depth: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  let h: number;
  let top: number;
  let feet = false;
  if (!cutBottom && framing === "full") {
    h = (o.floor - o.headTop) / (1 - hair);
    top = o.headTop - hair * h;
    feet = true;
  } else {
    const crop = Math.min(1, depth[framing] ? face[1] + face[3] * depth[framing] : 1);
    const bottom = crop >= 1 && cutBottom ? bottomEdge + 22 : bottomEdge;
    h = (bottom - o.headTop) / Math.max(0.2, crop - hair);
    top = o.headTop - hair * h;
  }
  const cap = Math.min(o.maxFace ?? 400, data.facePx > 0 ? data.facePx * 2.1 : 400);
  const edge = (y: number) => (feet ? y + h : bottomEdge);
  const resize = (nh: number) => {
    const b = edge(top);
    const frac = (b - top) / h;
    top = b - frac * nh;
    h = nh;
  };
  if (h * face[3] > cap) resize(cap / face[3]);
  if ((p.playerScale ?? 1) !== 1) resize(h * (p.playerScale ?? 1));
  const w = h * aspect;
  const fx = data.face ? face[0] + face[2] / 2 : 0.5;
  const left = o.cx - fx * w + (p.playerX ?? 0);
  top += p.playerY ?? 0;
  return { left, top, width: w, height: h, feet, faceCx: left + (face[0] + face[2] / 2) * w, faceTop: top + face[1] * h, faceH: face[3] * h };
}

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase();
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/**
 * Goal gallery: the goal post of `gallery`. A seamless warm-grey studio backdrop, the celebrating player centred
 * in natural colour with a soft contact shadow, one italic serif line ("Goal") above his head, small crests at
 * the top centre, and the rest reduced to tiny spaced caps in the four corners: his name, the competition, the
 * fixture (home first, "v") and the season.
 */
export function Goalgallery({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.35 : 1;
  const TOPY = story ? STORY_TOP : MARGIN - 6;
  const BOTY = story ? H - STORY_BOTTOM : MARGIN - 6;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.6) club = vivid(params.accent);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  const f = matchFacts(data);

  /* ---- the title: one italic line above his head ---- */
  const title = sentence(content.kicker || "Goal");
  const tSize = Math.min(86 * S, 820 / Math.max(1, dmiEm(title))) * ts;
  const titleTop = (story ? STORY_TOP + 120 : 132) + (params.textY ?? 0);

  /* ---- the player, centred: a celebration is often cropped, so it dissolves into the floor ---- */
  const box = story
    ? standingTo(data, { cx: 540, headTop: titleTop + tSize * 1.2 + 60, floor: 1420, maxFace: 330 }, H)
    : standing(data, { cx: 540, headTop: titleTop + tSize * 1.2 + 40, floor: 1185, maxFace: 230 });
  const floorY = box.top + box.height;

  /* ---- corners ---- */
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? f.opp;
  const [home, away] = (weHost ? [ours, opp] : [opp, ours]).map((s) => (s ?? "").toUpperCase());
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ").toUpperCase();
  const tl = [name];
  const tr = [f.comp || f.round, f.comp ? f.round : ""];
  const bl = [home, away ? `V ${away}` : ""];
  const br = [`SEASON ${seasonOf()}`];
  const TRACK = 0.2;
  const corner = (t: string, max = 400): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: 500,
    fontSize: Math.max(11, Math.min(15 * S, max / Math.max(1, capsEm(t, TRACK)))) * ts,
    letterSpacing: `${TRACK}em`,
    color: INK,
    lineHeight: 1.7,
    whiteSpace: "nowrap",
  });

  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  const Corner = ({ lines, pos }: { lines: string[]; pos: CSSProperties }) => (
    <div style={{ position: "absolute", ...pos, display: "flex", flexDirection: "column", alignItems: pos.right != null ? "flex-end" : "flex-start" }}>
      {lines.filter(Boolean).map((l, i) => (
        <div key={i} style={{ ...corner(l, story && pos.top != null ? 330 : 400), color: i === 0 ? INK : SOFT }}>
          {l}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER_MID, color: INK }}>
      {/* The sweep: lighter behind him, a little darker towards the floor, soft vignette, a breath of club colour. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${PAPER_TOP} 0%, ${PAPER_MID} 62%, ${PAPER_FLOOR} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 45% at 50% 46%, rgba(255,255,255,.55), transparent 75%)" }} />
      <div style={{ position: "absolute", inset: 0, background: club, opacity: 0.05, mixBlendMode: "color" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 95% at 50% 45%, transparent 55%, rgba(60,50,40,.16) 100%)" }} />

      {/* Contact shadow (or a soft shade behind a cropped figure), then the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 260 * S, top: floorY - 30 * S, width: 520 * S, height: 60 * S, borderRadius: "50%", background: "rgba(40,32,24,.32)", filter: "blur(24px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 150 * S, top: floorY - 12 * S, width: 300 * S, height: 22 * S, borderRadius: "50%", background: "rgba(30,24,18,.45)", filter: "blur(8px)" }} />
        </>
      )}
      {data.photoUrl && !box.feet && (
        <div style={{ position: "absolute", left: box.faceCx - 300 * S, top: box.faceTop + box.faceH * 1.4, width: 600 * S, height: H, borderRadius: "50%", background: "rgba(40,32,24,.14)", filter: "blur(70px)" }} />
      )}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }} />
      )}
      {/* Cropped figures dissolve into the floor, so the foot corners stay clean. */}
      {data.photoUrl && !box.feet && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? H - 1300 : 250, background: story ? `linear-gradient(to bottom, ${PAPER_FLOOR}00, ${PAPER_FLOOR}e6 40%, ${PAPER_FLOOR} 55%)` : `linear-gradient(to bottom, ${PAPER_FLOOR}00, ${PAPER_FLOOR}e6 70%, ${PAPER_FLOOR})` }} />
      )}

      {/* Crests, small and centred. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: story ? STORY_TOP - 6 : 50, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * S }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 50 * S, height: 50 * S, objectFit: "contain" }} />
        ))}
      </div>

      {/* The one line of display type. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: tSize, lineHeight: 1.1, color: INK, whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>
        {title}
      </div>

      <Corner lines={tl} pos={{ left: MARGIN, top: TOPY }} />
      <Corner lines={tr} pos={{ right: MARGIN, top: TOPY }} />
      <Corner lines={bl} pos={{ left: MARGIN, bottom: BOTY + (story ? 150 : 0) }} />
      <Corner lines={br} pos={{ right: MARGIN, bottom: BOTY + (story ? 150 : 0) }} />

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: (story ? BOTY : MARGIN) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
    </div>
  );
}
