/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName, heroWord } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · behind — the goal-hero family as a magazine cover: the enormous club-colour word sits BEHIND the
 * celebrating player at head/shoulder height, so his head and raised arms break into it; the face is always in
 * front (the cutout is the top layer), never covered by a letter. Logo small at the top, the name wide-spaced above.
 */
const FACE = FACES.anton;

export function Goalherobehind({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const M = story ? 64 : 64;

  /* ---- top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);
  const nameBottom = nameTop + nameSize;
  const word = heroWord(data);
  const tr = 0; // Anton is set solid (no tracking in FACES)
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(FACE, word)), (story ? 440 : 360) / FACE.cap) * ts;
  const cap = size * FACE.cap;
  const capTop = nameBottom + (story ? 56 : 40) + (params.textY ?? 0);
  const baseline = capTop + cap;

  /* ---- the player: his face in the lower half of the word, in front of it ---- */
  const sizes = story ? { chest: 420, waist: 360, knees: 260, full: 190 } : { chest: 330, waist: 280, knees: 210, full: 156 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 40 : 0);
  // His hair breaks into the word from about half its cap height down, so the top half of every letter still
  // reads (the face box starts ~0.4 face-heights under the hair).
  const hairAim = capTop + cap * 0.46;
  let faceTop = hairAim + 100;
  for (let i = 0; i < 3; i++) {
    const b = placeByFace(data, faceX, faceTop, sizes);
    faceTop += hairAim - (faceTop - b.faceH * 0.4);
  }
  // … but his top (hair, a raised fist) never reaches the name.
  const clearTop = nameBottom + (story ? 40 : 28);
  for (let i = 0; i < 3; i++) {
    const top = placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0);
    if (top < clearTop) faceTop += clearTop - top;
  }
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };

  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 520 : 380)}px, transparent ${H - (story ? 90 : 20)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 50%, #ffffff, transparent 75%)" }} />

      {/* The word, full width, behind him. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: club, letterSpacing: `${tr}em` }}>
          {word}
        </text>
      </svg>

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

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
