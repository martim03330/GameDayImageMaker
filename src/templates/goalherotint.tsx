/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Mixes `b` into `a` by t (0..1). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/**
 * Goal hero, tinted — goalhero on a ground that is a very pale wash of the club colour instead of the
 * off-white: the NEYOD logo small at the top, the spaced name, the kicker enormous in the deep club colour,
 * and the celebrating player big underneath, fading into that same tint. No score, no underline.
 */
export function Goalherotint({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const face = FACES.barlow;

  const raw = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  let club = raw;
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  // The word is the deep club colour: dark enough to read on the tint whatever the club colour is.
  let deep = club;
  for (let i = 0; i < 6 && luminance(deep) > 0.1; i++) deep = shade(deep, -0.14);

  // The ground: ~9% of the club hue in the off-white; light hues (yellow) need more to show at all.
  const paper = "#f5f4f0";
  const hueSrc = luminance(raw) > 0.02 ? raw : club;
  const ground = mix(paper, hueSrc, luminance(hueSrc) > 0.4 ? 0.16 : luminance(hueSrc) > 0.2 ? 0.11 : 0.09);
  const glow = mix(ground, "#ffffff", 0.45);
  const M = 80;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const wordW = CANVAS_W - 2 * M - (face.italic ? 40 : 0); // italics overhang their advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 34 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  /* ---- the player: head just under the word, big, fading into the tint ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% 55%, ${glow}, transparent 75%)` }} />

      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + size * face.cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: face.italic ? "italic" : "normal", fontSize: size, fill: deep, letterSpacing: `${face.tracking ?? 0}em` }}
        >
          {word}
        </text>
      </svg>

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* The foot sinks into the tint. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: H - (story ? 340 : 230), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}cc 70%, ${ground})` }} />

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, letterSpacing: "0.55em", paddingLeft: "0.55em", color: deep, whiteSpace: "nowrap" }}>{name}</div>
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
