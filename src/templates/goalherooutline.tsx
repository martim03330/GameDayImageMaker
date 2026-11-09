/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName, heroWord } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · outline — the goal-hero layout with the enormous word drawn as a hairline outline in the club
 * colour (no fill), exactly the canvas width; the celebrating player underneath, his top just under the word,
 * fading into the off-white ground. Logo small at the top, name wide-spaced, no score, no underline.
 */
const FACE = FACES.anton;

export function Goalherooutline({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const M = 80;
  const stroke = story ? 3 : 2.5;

  /* ---- top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 106);
  const word = heroWord(data);
  const size = Math.min((CANVAS_W - 2 * M - stroke) / Math.max(0.5, wordEm(FACE, word)), (story ? 460 : 380) / FACE.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 44 : 32) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  /* ---- the player: his top just under the word's foot ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  for (let i = 0; i < 3; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word, a hairline outline pinned to the canvas width, in front of the ground. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={baseline}
          textAnchor="middle"
          style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: "none", stroke: club, strokeWidth: stroke, strokeLinejoin: "round" }}
        >
          {word}
        </text>
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
