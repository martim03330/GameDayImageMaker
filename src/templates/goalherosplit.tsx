/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · split — the goal-hero family (off-white ground, small NEYOD logo, the name wide-spaced in the club
 * colour, one enormous club-colour word, the celebrating cutout big), with the word broken in two halves either
 * side of his head at eye level: "GO" pinned to the left margin, "AL" to the right, each ending ~40px clear of
 * his head. The halves sit in front of his body (so a raised fist never hides a letter) and never reach the head.
 */

/** The goal-hero club colour: deep, never white/yellow/black. */
export function heroClub(data: RenderData): string {
  const { params } = data;
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  return club;
}

export function heroWord(data: RenderData): string {
  return (data.content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
}

export function heroName(data: RenderData): string {
  return [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
}

/** Split a word in two halves of near-equal width ("GOAL" → GO|AL, "HAT-TRICK" → HAT-|TRICK). */
function halves(face: (typeof FACES)[keyof typeof FACES], word: string): [string, string] {
  const parts = word.split(/\s+/).filter(Boolean);
  if (parts.length === 2) return [parts[0], parts[1]];
  const hy = word.indexOf("-");
  if (hy > 0 && hy < word.length - 1) return [word.slice(0, hy + 1), word.slice(hy + 1)];
  if (word.length < 2) return [word, ""];
  let best = 1;
  let bestW = Infinity;
  for (let i = 1; i < word.length; i++) {
    const w = Math.max(wordEm(face, word.slice(0, i)), wordEm(face, word.slice(i)));
    if (w < bestW - 1e-6) {
      bestW = w;
      best = i;
    }
  }
  return [word.slice(0, best), word.slice(best)];
}

const FACE = FACES.anton;

export function Goalherosplit({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const M = story ? 64 : 60;

  /* ---- top: logo, name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);
  const nameBottom = nameTop + nameSize;

  /* ---- the player: big, centred, his top just under the name ---- */
  const sizes = story ? { chest: 380, waist: 320, knees: 240, full: 180 } : { chest: 320, waist: 270, knees: 200, full: 150 };
  const faceX = 540 + (params.side === "left" ? -30 : params.side === "right" ? 30 : 0);
  const gap = story ? 70 : 50;
  let faceTop = nameBottom + 300;
  for (let i = 0; i < 3; i++) faceTop += nameBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  // Keep the eyes no higher than ~a third of the canvas, so the halves have room above for the name.
  const box = placeByFace(data, faceX, faceTop, sizes);
  const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fx0 = box.left + f[0] * box.width;
  const fw = f[2] * box.width;
  const fy0 = box.top + f[1] * box.height;
  const fh = f[3] * box.height;
  // The head: the face box plus ears/hair.
  const headL = fx0 - fw * 0.3;
  const headR = fx0 + fw * 1.3;
  const eye = fy0 + fh * 0.42;

  /* ---- the two halves, at eye level, pinned to the margins ---- */
  const word = heroWord(data);
  const [a, b] = halves(FACE, word);
  const clear = 40;
  const tr = 0; // Anton is set solid (no tracking in FACES)
  const availL = headL - clear - M;
  const availR = CANVAS_W - M - (headR + clear);
  const maxCap = (story ? 360 : 280) * ts;
  let size = Math.min(availL / Math.max(0.3, wordEm(FACE, a)), b ? availR / Math.max(0.3, wordEm(FACE, b)) : Infinity, maxCap / FACE.cap);
  size = Math.max(40, size);
  const cap = size * FACE.cap;
  // Centre the cap band on the eyes; never into the name.
  const capTop = Math.max(nameBottom + (story ? 60 : 44), eye - cap / 2) + (params.textY ?? 0);
  const baseline = capTop + cap;
  const txt = { fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: club, letterSpacing: `${tr}em` } as const;

  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 520 : 380)}px, transparent ${H - (story ? 90 : 20)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 50%, #ffffff, transparent 75%)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The two halves, in front of his arms (never near the head). */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={M} y={baseline} textAnchor="start" style={txt}>
          {a}
        </text>
        {b && (
          <text x={CANVAS_W - M} y={baseline} textAnchor="end" style={txt}>
            {b}
          </text>
        )}
      </svg>

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
