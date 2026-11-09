/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName, heroWord } from "./goalherosplit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · block — the goal-hero family with a masthead: the top ~40% of the canvas is a solid club-colour
 * block holding the small white NEYOD logo, the name wide-spaced in off-white and the kicker ("GOAL") enormous
 * in off-white at the exact canvas width; under it the light #f3f3f1 ground. The celebrating player stands on the
 * light part, in front of the block's edge: his head and raised arms break up into the colour, the edge running
 * across his shoulders (never his face), and he fades into the ground at the foot. No score.
 */
const FACE = FACES.archivo; // wide and heavy: a short word fills the width without a towering cap
const GROUND = "#f3f3f1";
const OFF = "#f6f5f1";

export function Goalherotop({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;

  /* ---- inside the block: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 44) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 32 : 24) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 92);
  const word = heroWord(data);
  const em = Math.max(0.5, wordEm(FACE, word));
  const size = Math.min((CANVAS_W - 2 * M) / em, (story ? 250 : 215) / FACE.cap) * ts;
  const wordLeft = (CANVAS_W - em * size) / 2;
  const capTop = nameTop + nameSize + (story ? 40 : 30) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  /* ---- the player: face just under the word, the block's edge across his shoulders ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const sizes: Record<string, number> = story ? { chest: 190, waist: 165, knees: 145, full: 125 } : { chest: 150, waist: 132, knees: 116, full: 100 };
  let F = (sizes[params.framing ?? "waist"] ?? sizes.waist) * (params.playerScale ?? 1);
  if (data.facePx > 0) F = Math.min(F, Math.max(96, data.facePx * 1.2));
  const edgeAim = H * (story ? 0.4 : 0.39);
  const edgeMax = H * (story ? 0.47 : 0.46);
  // Face top no higher than the word's foot (his hair may just touch the letters); shoulders on the edge.
  let faceTop = Math.max(edgeAim - F * 1.45, baseline - F * 0.05);
  // A bust shot (no legs to fill the ground) grows to reach the foot of the canvas, within the edge limit.
  const minH = (H + 30 - faceTop) / Math.max(0.2, 1 - face[1]);
  // (a cropped bust may push the edge down to ~52–58% rather than float above an empty ground)
  F = Math.max(F, Math.min(minH * face[3], (H * (story ? 0.52 : 0.58) - faceTop) / 1.45));
  const h = F / face[3];
  const w = h * aspect;
  faceTop += params.playerY ?? 0;
  const faceX = 560 + (params.side === "left" ? -60 : params.side === "right" ? 40 : 0);
  let left = faceX - w * (face[0] + face[2] / 2) + (params.playerX ?? 0);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * left + w)) / 2));
  left += lean;
  // The face stays well inside the canvas whatever the lean.
  const faceL = left + face[0] * w;
  if (faceL < 110) left += 110 - faceL;
  if (faceL + face[2] * w > CANVAS_W - 110) left -= faceL + face[2] * w - (CANVAS_W - 110);
  const top = faceTop - h * face[1];
  const chin = faceTop + F;
  // The edge runs across his shoulders/chest, never higher than just under the chin.
  const edge = Math.round(Math.max(chin + F * 0.42, Math.min(edgeMax, edgeAim, chin + F * 0.9)));

  const bottom = Math.min(H, top + h);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(edge + 200, bottom - (story ? 420 : 300))}px, transparent ${bottom - (story ? 60 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: edge, bottom: 0, background: "radial-gradient(70% 55% at 50% 30%, #ffffff, transparent 75%)" }} />

      {/* The block, and the word inside it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: edge, background: club }} />
      <svg width={CANVAS_W} height={edge} style={{ position: "absolute", left: 0, top: 0 }}>
        <text x={wordLeft} y={baseline} style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, letterSpacing: `${FACE.tracking ?? 0}em`, fill: OFF }}>
          {word}
        </text>
      </svg>

      {/* The player, in front of the block's edge, fading into the ground. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left, top, width: w, height: h, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: OFF, opacity: 0.92, whiteSpace: "nowrap" }}>
          {name}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
