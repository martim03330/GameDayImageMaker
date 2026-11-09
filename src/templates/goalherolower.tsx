/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/** Archivo Black lowercase: advance widths per 100px (measured in the browser). */
const AL_W: Record<string, number> = { a: 66.7, b: 66.7, c: 66.7, d: 66.7, e: 66.7, f: 38.9, g: 66.7, h: 66.7, i: 33.3, j: 33.3, k: 66.7, l: 33.3, m: 100, n: 66.7, o: 66.7, p: 66.7, q: 66.7, r: 44.4, s: 61.1, t: 44.4, u: 66.7, v: 61.1, w: 94.4, x: 66.7, y: 61.1, z: 55.6, "-": 33.3, "!": 33.3, "'": 27.8, ".": 33.3, " ": 33.3 };
const TRACK = -0.04;
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Advance of the letters plus the tracking between them (the full stop included). */
const alEm = (t: string) => plain(t).reduce((a, c) => a + (AL_W[c] ?? 66.7) / 100, 0) + (plain(t).length - 1) * TRACK;
/** Ink heights (per em): ascenders, the t, the x-height; the descent of g j p q y. */
const ASC = 0.725;
const XH = 0.528;
const DESC = 0.21;
const inkTop = (t: string) => plain(t).reduce((a, c) => Math.max(a, /[bdfhklij!'0-9]/.test(c) ? ASC : c === "t" ? 0.66 : XH), 0);
/** Stems start ~0.06em inside their advance, bowls ~0; the full stop ends 0.06em before its advance. */
const lsb = (t: string) => (/^[bhiklmnpru]/.test(plain(t)[0] ?? "") ? 0.06 : 0.005);
const DOT_RSB = 0.06;

/**
 * Goal hero lower — the goal hero (`goalhero.tsx`) said quietly: the off-white ground, the NEYOD logo small
 * at the top, the name in wide-spaced caps in the club colour, then the word in heavy lowercase ("goal",
 * "hat-trick") in near-black ink, closed by a full stop in the club colour, set huge across the canvas, and
 * the celebrating player big under it, fading into the ground. No underline, no score.
 */
export function Goalherolower({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const ink = "#16181d";
  const M = 70;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? 130 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 28) * ts, 800 / Math.max(1, name.length * 1.1));
  const nameTop = logoTop + (story ? 150 : 106);

  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim().toLowerCase().replace(/[.!]+$/, "");
  const full = word + ".";
  // Sized on the ink: the advance minus the first letter's side bearing and the full stop's.
  const inkEm = Math.max(0.5, alEm(full) - lsb(full) - DOT_RSB);
  const size = Math.min((CANVAS_W - 2 * M) / inkEm, story ? 600 : 500) * ts;
  const inkTopY = nameTop + nameSize + (story ? 44 : 32) + (params.textY ?? 0);
  const baseline = inkTopY + inkTop(word) * size;
  const x = (CANVAS_W - inkEm * size) / 2 - lsb(full) * size;
  const descends = /[gjpqy]/.test(word);

  /* ---- the player: head just under the word, big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  // His top sits just under the baseline; a descender (the g's tail) runs down behind him.
  const gap = (story ? 22 : 16) + (descends ? DESC * size * 0.15 : 0);
  let faceTop = baseline + 200;
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.3} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }}>
        <text x={x} y={size} style={{ fontFamily: ARCHIVO_BLACK, fontWeight: 400, fontSize: size, fill: ink, letterSpacing: `${TRACK}em` }}>
          {word}
          <tspan fill={club}>.</tspan>
        </text>
      </svg>

      {/* The player, in front of the word's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Name, wide-spaced caps in the club colour. */}
      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: STORY_BOTTOM, bottom: 0, background: `linear-gradient(to bottom, transparent, ${ground})` }} />}
    </div>
  );
}
