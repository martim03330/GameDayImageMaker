/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName, heroWord } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · ghost — tone on tone: the goal word fills the canvas width in a very pale tint of the club colour
 * (a soft watermark), set larger and lower than goal hero so it sits BEHIND his head and shoulders. A small solid
 * club-colour kicker above the name keeps the word legible at a glance. Logo small at the top, no score.
 */
const FACE = FACES.anton;

/** `amount` of colour `a` mixed into `b` (hex). */
function mix(a: string, b: string, amount: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.replace("#", "").padEnd(6, "0").slice(i - 1, i + 1), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v * amount + y[i] * (1 - amount)).toString(16).padStart(2, "0")).join("")}`;
}

export function Goalheroghost({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const tint = mix(club, ground, 0.14);
  const M = 40;

  /* ---- top: logo, kicker, name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const word = heroWord(data);
  const kickSize = (story ? 50 : 40) * ts;
  const kickTop = logoTop + (story ? 150 : 106);
  const name = heroName(data);
  const nameSize = Math.min((story ? 30 : 24) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = kickTop + kickSize + (story ? 22 : 16);
  const nameBottom = nameTop + nameSize;

  /* ---- the player: his top just under the name ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 40 : 0);
  const aim = nameBottom + (story ? 56 : 40);
  let faceTop = aim + 200;
  for (let i = 0; i < 3; i++) faceTop += aim - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 480 : 340)}px, transparent ${H - (story ? 80 : 10)}px)`;

  /* ---- the ghost word: full width, centred on his chin/neck, behind him ---- */
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(FACE, word)), (story ? 640 : 520) / FACE.cap) * ts;
  const cap = size * FACE.cap;
  const centre = faceTop + box.faceH * 0.62;
  const capTop = Math.max(nameBottom + (story ? 44 : 32), centre - cap / 2) + (params.textY ?? 0);
  const baseline = capTop + cap;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: tint }}>
          {word}
        </text>
      </svg>

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The kicker, small and solid, so the word reads at a glance. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: kickTop, textAlign: "center", fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: club, whiteSpace: "nowrap" }}>{word}</div>

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
