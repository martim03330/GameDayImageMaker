/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 200 advances per 100px for A–Z then - ! ' and space, digits after (measured in the browser). */
const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' 0123456789";
const LIGHT = "66 64 73 72 59 59 74 74 26 56 62 56 90 77 75 62 75 62 62 63 73 66 95 64 65 61 45 28 28 28 60 38 62 59 61 57 58 55 60 58".split(" ").map(Number);
const LIGHT_CAP = 0.728;

/** Letters without accents (the advances of É are those of E). */
const plain = (s: string) => [...s.normalize("NFD").replace(/\p{M}/gu, "")];
const adv = (c: string) => (LIGHT[ORDER.indexOf(c)] ?? 60) / 100;

/**
 * Goal hero, caps — goalhero in a whisper: the kicker set enormous but in Inter's thinnest cut with wide
 * tracking, each letter placed by hand so the word spans the canvas exactly; the player's name above it in
 * small heavy spaced caps for contrast; the celebrating player big underneath, fading into the off-white ground.
 */
export function Goalherocaps({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const M = 76;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 32 : 26) * ts, 700 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 112);

  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const letters = plain(word);
  const shown = [...word.normalize("NFC")];
  const glyphs = letters.reduce((a, c) => a + adv(c), 0);
  const n = letters.length;
  // Wide tracking for short words, tighter for long ones, so a long word does not shrink to nothing.
  const track = n > 1 ? Math.max(0.1, Math.min(0.3, 1.9 / (n - 1))) : 0;
  const span = CANVAS_W - 2 * M;
  // The last letter has no tracking after it: the ink spans exactly the measure.
  let size = span / Math.max(0.5, glyphs + (n - 1) * track);
  size = Math.min(size, (story ? 330 : 280) / LIGHT_CAP) * ts;
  const wordW = size * (glyphs + (n - 1) * track);
  const capTop = nameTop + nameSize + (story ? 46 : 36) + (params.textY ?? 0);
  const baseline = capTop + size * LIGHT_CAP;
  let x = (CANVAS_W - wordW) / 2;
  const xs = letters.map((c) => {
    const at = x;
    x += (adv(c) + track) * size;
    return at;
  });

  /* ---- the player: his top just under the word, big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 34 : 24;
  let faceTop = baseline + 200;
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The word, one letter at a time, spanning the measure exactly. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: capTop - size * 0.1, overflow: "visible" }}>
        {shown.map((c, i) => (
          <text key={i} x={xs[i]} y={size * 0.1 + size * LIGHT_CAP} style={{ fontFamily: SANS, fontWeight: 200, fontSize: size, fill: club }}>
            {c}
          </text>
        ))}
      </svg>

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.5em", paddingLeft: "0.5em", color: club, whiteSpace: "nowrap" }}>
          {name}
        </div>
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
