/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName, heroWord } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · foot — the goal-hero family turned upside down: logo and wide-spaced name at the top, the
 * celebrating player big in the upper/middle part, and the enormous club-colour word set across the FOOT of the
 * canvas, in front of his lower body as it fades into the ground, ending on the bottom margin.
 */
const FACE = FACES.anton;

export function Goalherofoot({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const M = 64;

  /* ---- top: logo, name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);
  const nameBottom = nameTop + nameSize;

  /* ---- the player: his top just under the name, big ---- */
  const sizes = story ? { chest: 400, waist: 340, knees: 250, full: 186 } : { chest: 300, waist: 250, knees: 190, full: 146 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 40 : 0);
  const gap = story ? 60 : 40;
  let faceTop = nameBottom + 300;
  for (let i = 0; i < 3; i++) faceTop += nameBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (f[1] + f[3]) * box.height;

  /* ---- the word across the foot, ending on the bottom margin, never reaching his chin ---- */
  const word = heroWord(data);
  const tr = 0; // Anton is set solid (no tracking in FACES)
  const baseline = (story ? STORY_BOTTOM : H - 64) + (params.textY ?? 0);
  const roomCap = baseline - (chin + box.faceH * 0.5);
  const size = Math.max(60, Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(FACE, word)), (story ? 440 : 360) / FACE.cap, roomCap / FACE.cap) * ts);
  const cap = size * FACE.cap;
  const capTop = baseline - cap;

  // His lower body fades into the ground behind the word.
  const fadeFrom = Math.max(chin + 40, capTop - (story ? 320 : 240));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.45) ${capTop}px, transparent ${capTop + cap * 0.55}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 42%, #ffffff, transparent 75%)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word, in front of his faded legs. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: club, letterSpacing: `${tr}em` }}>
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
