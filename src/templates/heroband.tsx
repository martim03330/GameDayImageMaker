/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, HERO_GROUND, matchWord, spacedName } from "./heroghost";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · band (matchday) — goalheroband carried to matchday: the light ground, small NEYOD logo and spaced
 * club-colour name, then a full-width club-colour band carrying the kicker ("MATCHDAY") in off-white, edge to
 * edge, across his chest: his head rises above it on the light ground (the face always fully clear of the band),
 * his body carries on below it and fades out over heromatch's quiet fixture foot (crests either side of
 * "HOME v AWAY" with exact names, then date · kick-off · ground).
 */
const FACE = FACES.archivo;

export function Heroband({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ink = "#f6f4ee";

  /* ---- top: logo and name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 106);
  const headroom = nameTop + nameSize + (story ? 54 : 40); // the cutout's top may not rise past this

  /* ---- the word and its band ---- */
  const word = matchWord(data);
  const M = story ? 56 : 64;
  const em = Math.max(0.5, wordEm(FACE, word));
  const size = Math.min((CANVAS_W - 2 * M) / em, (story ? 300 : 240) / FACE.cap) * ts;
  const cap = size * FACE.cap;
  const pad = Math.max(story ? 40 : 32, cap * 0.2);
  const bandH = cap + 2 * pad;

  /* ---- the foot ---- */
  const foot = heroFoot(data, club);

  /* ---- the player: chin just above the band, cutout top just under the name ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const chinGap = story ? 34 : 26;
  const bandMin = story ? 700 : 470;
  // Leave a real stretch of his body between the band and the fixture foot.
  const bandMax = foot.top - bandH - (story ? 300 : 200);
  // Head span (cutout top → chin) in face heights.
  const span = 1 + face[1] / face[3];
  let faceH = (Math.min(bandMax, Math.max(bandMin, story ? 900 : 640)) - chinGap - headroom) / span;
  faceH = Math.min(story ? 300 : 260, Math.max(story ? 150 : 120, faceH)) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  let bandTop = Math.min(bandMax, Math.max(bandMin, headroom + faceH * span + chinGap));
  // A small figure (low-res face) would stop short of the foot: lower the whole group by a quarter of that gap.
  const short = foot.bottom - (bandTop - chinGap - faceH * span + faceH / face[3]);
  if (short > 0) bandTop = Math.min(bandMax, bandTop + short / 4);
  bandTop += params.textY ?? 0;
  const chin = bandTop - chinGap;
  const faceTop = chin - faceH;
  const h = faceH / face[3];
  const w = h * aspect;
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  let left = faceX - w * (face[0] + face[2] / 2);
  // Lean the figure towards the centre when the face sits off his body's middle.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * left + w)) / 2));
  left += lean + (params.playerX ?? 0);
  const top = faceTop - h * face[1] + (params.playerY ?? 0);
  const fadeFrom = Math.max(bandTop + bandH + 40, foot.top - (story ? 240 : 180));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${foot.bottom - 20}px, transparent ${Math.min(H, foot.bottom + 60)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 45%, #ffffff, transparent 75%)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left, top, width: w, height: h, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The band across his chest, the word in it edge to edge. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, height: bandH, background: club, boxShadow: "0 18px 40px -22px rgba(0,0,0,0.45)" }} />
      <svg width={CANVAS_W} height={bandH} style={{ position: "absolute", left: 0, top: bandTop, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2 + ((FACE.tracking ?? 0) * size) / 2}
          y={pad + cap}
          textAnchor="middle"
          style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: ink, letterSpacing: `${FACE.tracking ?? 0}em` }}
        >
          {word}
        </text>
      </svg>

      {foot.node}
      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
