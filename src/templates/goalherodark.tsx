/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const INK = "#f3f1ec";

/** The club colour for a dark ground: vivid, never white/yellow (accent instead), never black. */
function clubTones(primary: string, accent: string): { ground: string; glow: string } {
  let club = vivid(primary === "#10131c" ? accent : primary);
  if (luminance(club) > 0.45) club = vivid(accent);
  if (luminance(club) > 0.45) return { ground: "#15171c", glow: "#2a2c33" };
  if (luminance(club) < 0.02) return { ground: "#141519", glow: "#2b2d33" };
  return { ground: shade(club, -0.66), glow: shade(club, -0.28) };
}

/**
 * Goal hero, dark: goalhero on a deep club-colour ground. The NEYOD logo small and white at the top, the name
 * in wide-spaced off-white caps, the kicker ("GOAL") enormous in off-white Barlow 900 italic at the exact
 * canvas width, and the celebrating player big underneath, fading into the ground. No underline, no score.
 */
export function Goalherodark({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const face = FACES.barlow;
  const { ground, glow } = clubTones(params.primary, params.accent);
  const M = 80;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const wordW = CANVAS_W - 2 * M - 40; // the italic overhangs its advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 36 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  /* ---- the player: his top just under the word, big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const cut = data.cut ?? {};
  if ((cut.right ?? 0) > 0 && (cut.right ?? 0) >= (cut.left ?? 0)) box = { ...box, left: box.left + Math.max(0, Math.min(50, CANVAS_W + 6 - (box.left + box.width))) };
  else if ((cut.left ?? 0) > 0) box = { ...box, left: box.left - Math.max(0, Math.min(50, box.left + 6)) };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 460 : 320)}px, transparent ${H - (story ? 90 : 20)}px)`;
  const glowY = Math.round(((box.top + box.faceH * 3) / H) * 100);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% ${story ? 38 : 46}% at 50% ${glowY}%, ${glow}, transparent 78%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 520, background: `linear-gradient(to bottom, transparent, ${shade(ground, -0.25)})` }} />

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + size * face.cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: "italic", fontSize: size, fill: INK, letterSpacing: `${face.tracking}em` }}
        >
          {word}
        </text>
      </svg>

      {/* The player, in front of the word's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut, 2) }} />
        </div>
      )}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: INK, whiteSpace: "nowrap" }}>{name}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
