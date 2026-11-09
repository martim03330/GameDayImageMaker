/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Inter 800: advance widths per 100px (measured in the browser). */
const I8_W: Record<string, number> = { a: 58.8, b: 63.8, c: 59.5, d: 63.8, e: 60.1, f: 41, g: 63.9, h: 63.6, i: 28.3, j: 28.3, k: 59.3, l: 28.3, m: 92.7, n: 63.5, o: 61.9, p: 63.8, q: 63.8, r: 42, s: 57.4, t: 38.2, u: 63.6, v: 61.5, w: 86.3, x: 59.4, y: 61.8, z: 58.1, A: 77, B: 66.5, C: 74.4, D: 72.3, E: 61, F: 58.6, G: 75.3, H: 74.8, I: 28.6, J: 59, K: 73.8, L: 56.5, M: 94.3, N: 76.6, O: 77.3, P: 65.2, Q: 78.2, R: 66.2, S: 66, T: 67.7, U: 72.7, V: 77, W: 105.9, X: 76.1, Y: 75.2, Z: 67.9, " ": 21.9, "-": 47.1, "'": 35.5, "!": 35.9 };
const i8Em = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (I8_W[c] ?? 62) / 100, 0);
/** Inter capitals with tracking, roughly. */
const capsEm = (t: string, track: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[IJ1]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.95 : 0.7) + track, 0);

/**
 * Goal emboss: the goal sibling of `emboss`. On a deep club-tone card, the word "Goal" runs up one side,
 * huge and set on end, blind-embossed — the same colour as the ground, read only through a lighter upper
 * edge and a darker lower one. The celebrating player stands in front of it, off-centre; at the foot his
 * name and the fixture (home first, names as stored, never the score), then the NEYOD logo.
 */
export function Goalemboss({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const k = story ? 1.36 : 1;
  const club = clubTone(data);
  const ground = shade(club, -0.6);

  /* ---- the foot ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const fixture = teamsOf(data).join("  v  ").toUpperCase();
  const F_TRACK = 0.22;
  const fSize = Math.max(11, Math.min(15 * k, (story ? 900 : 860) / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.18;
  const nSize = Math.max(16, Math.min(28 * k, (story ? 900 : 860) / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const fixTop = logoTop - (story ? 66 : 42) - fSize + (params.textY ?? 0);
  const nameTop = fixTop - (story ? 22 : 16) - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the word, on end, up one side ---- */
  const word = sentenceCase(content.kicker || "Goal");
  const wordRight = params.side === "left";
  const top = story ? STORY_TOP : 56;
  const len = footTop - (story ? 70 : 50) - top;
  const size = Math.min(story ? 600 : 500, len / Math.max(1, i8Em(word) * 0.97));
  const m = story ? 56 : 48;
  // Rotated -90° about its top-left corner: local y (0..size) → global x. Inter's caps run from ~0.17em to ~0.9em.
  const wLeft = wordRight ? CANVAS_W - m - 0.9 * size : m - 0.17 * size;
  const wordInner = wordRight ? CANVAS_W - m - 0.73 * size : m + 0.73 * size;
  const e = size / 480;
  // Light from the top left of the canvas. In the rotated box local (x, y) shows as global (y, −x).
  const emboss = [
    `${2 * e}px ${-2 * e}px ${1.4 * e}px rgba(255,255,255,.36)`,
    `${5 * e}px ${-5 * e}px ${12 * e}px rgba(255,255,255,.12)`,
    `${-2.4 * e}px ${2.6 * e}px ${2.2 * e}px rgba(0,0,0,.5)`,
    `${-6 * e}px ${6 * e}px ${12 * e}px rgba(0,0,0,.18)`,
  ].join(", ");

  /* ---- the player, off-centre, in front of the word's inner edge ---- */
  const faceX = wordRight ? Math.max(360, Math.min(460, wordInner - (story ? 190 : 120))) : Math.min(720, Math.max(620, wordInner + (story ? 190 : 120)));
  const sizes = story ? { chest: 300, waist: 236, knees: 186, full: 148 } : { chest: 214, waist: 170, knees: 134, full: 106 };
  const box = placeByFace(data, faceX, story ? STORY_TOP + 170 : 150, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = footTop - (story ? 56 : 36);
  const fadeLen = story ? 380 : 270;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (s: number, track: number, weight: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: s, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", textAlign: "center", color });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The word, blind-embossed and set on end. */}
      <div
        data-bleed
        style={{ position: "absolute", left: wLeft, top: top + len, width: len, height: size, transform: "rotate(-90deg)", transformOrigin: "0 0", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.03em", whiteSpace: "nowrap", color: ground, textShadow: emboss }}
      >
        {word}
      </div>

      {/* Over the word too, so its face takes the same light as the card: light raking across the card from the top left, darker toward the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(110% 75% at 20% 12%, rgba(255,255,255,.1), transparent 70%), linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.28))` }} />

      {/* A soft shade behind his torso (never a drop shadow on the cutout). */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin + box.faceH * 0.3, width: box.width * 0.6, height: Math.max(80, fadeEnd - chin - box.faceH), borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: `blur(${story ? 80 : 60}px)` }} />

      {/* The player, natural colour, dissolving into the card above his name. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: 48, right: 48, top: nameTop, ...caps(nSize, N_TRACK, 600, WHITE) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: 48, right: 48, top: fixTop, ...caps(fSize, F_TRACK, 400, "rgba(255,255,255,.64)") }}>{fixture}</div>}

      <AgencyLogo data={data} height={20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
