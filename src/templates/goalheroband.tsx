/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · band — goalhero's light ground, small NEYOD logo and spaced club-colour name, then a full-width
 * band in the club colour carrying the word ("GOAL") in off-white, edge to edge. The celebrating player is
 * cut by the band: his head and raised arms rise above it on the light ground (the face always fully clear
 * of the band), the band crosses his chest, and his body carries on below it, fading into the ground.
 */
const FACE = FACES.archivo;

export function Goalheroband({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const ink = "#f6f4ee";

  /* ---- top: logo and name ---- */
  const logoTop = (story ? 130 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const headroom = nameTop + nameSize + (story ? 54 : 40); // the cutout's top may not rise past this

  /* ---- the word and its band ---- */
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const M = 64;
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(FACE, word)), (story ? 300 : 240) / FACE.cap) * ts;
  const cap = size * FACE.cap;
  const pad = Math.max(30, cap * 0.16);
  const bandH = cap + 2 * pad;

  /* ---- the player: chin just above the band, cutout top just under the name ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const chinGap = story ? 34 : 26;
  const bandMin = story ? 660 : 470;
  const bandMax = H - bandH - (story ? 380 : 250);
  // Head span (cutout top → chin) in face heights.
  const span = 1 + face[1] / face[3];
  let faceH = (Math.min(bandMax, Math.max(bandMin, story ? 860 : 640)) - chinGap - headroom) / span;
  faceH = Math.min(story ? 300 : 270, Math.max(story ? 150 : 120, faceH)) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  let bandTop = Math.min(bandMax, Math.max(bandMin, headroom + faceH * span + chinGap));
  // A small figure (low-res face) would stop short of the foot: lower the whole group by a quarter of that gap.
  const short = H + 20 - (bandTop - chinGap - faceH * span + faceH / face[3]);
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
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 460 : 300)}px, transparent ${H - (story ? 90 : 20)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
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

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
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
