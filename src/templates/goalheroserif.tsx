/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/** DM Serif Display italic: advance widths per 100px (measured in the browser). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, "!": 29.9, ".": 30.8, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
/** Ink heights (per em) of DM Serif Display italic: cap line, ascenders and the x-height. */
const CAP = 0.66;
const ASC = 0.70;
const XH = 0.5;
const inkTop = (t: string) => plain(t).reduce((a, c) => Math.max(a, /[A-Z0-9]/.test(c) ? CAP : /[bdfhklt!'ij]/.test(c) ? ASC : XH), 0);
/** The round capitals start a little inside their advance; every italic leans out on the right. */
const leftIn = (t: string) => (/^[GCOQ]/.test(plain(t)[0] ?? "") ? 0.048 : 0.005);
const RIGHT_OUT = 0.022;

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Goal hero serif — the goal hero (`goalhero.tsx`) with its word in elegant italic serif: the off-white
 * ground, the NEYOD logo small at the top, the name in small wide-spaced sans caps, then "Goal" in sentence
 * case set huge across the canvas in DM Serif Display italic in the club colour, and the celebrating player
 * big under it, fading into the ground. No underline, no score.
 */
export function Goalheroserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const M = 70;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? 130 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 32 : 26) * ts, 820 / Math.max(1, name.length * 1.12));
  const nameTop = logoTop + (story ? 150 : 106);

  const word = sentence(content.kicker || "GOAL");
  const em = Math.max(0.5, dmiEm(word));
  // Sized on the ink: the advance minus the first letter's inset plus the italic's lean on the right.
  const inkEm = em - leftIn(word) + RIGHT_OUT;
  const size = Math.min((CANVAS_W - 2 * M) / inkEm, (story ? 620 : 500)) * ts;
  const top = inkTop(word) * size;
  const inkTopY = nameTop + nameSize + (story ? 46 : 34) + (params.textY ?? 0);
  const baseline = inkTopY + top;
  const x = (CANVAS_W - inkEm * size) / 2 - leftIn(word) * size;

  /* ---- the player: head just under the word, big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  // The italic has hardly any descent: the cutout's top tucks a little into the word's foot.
  const gap = story ? 6 : 2;
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
        <text x={x} y={size} style={{ fontFamily: DMSERIF, fontWeight: 400, fontStyle: "italic", fontSize: size, fill: club }}>
          {word}
        </text>
      </svg>

      {/* The player, in front of the word's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Name, small wide-spaced sans caps in the club colour: the plain counterpoint to the serif. */}
      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.6em", paddingLeft: "0.6em", color: club, whiteSpace: "nowrap" }}>{name}</div>
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
