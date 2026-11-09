/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroWord } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · surname — the goal-hero layout with the roles swapped: on the off-white ground the NEYOD logo
 * small at the top, the kicker ("GOAL") small in wide-spaced club-colour caps, then his SURNAME set enormous
 * across the canvas in the club colour (accents kept, room left above/below for them), and the celebrating
 * player big under it, fading into the ground. No score, no underline. Long surnames shrink to fit.
 */
const FACE = FACES.anton;
/** Capitals carrying a mark above (Ã, É, Ô …) and below (Ç). */
const MARK_ABOVE = /[ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝÑ]/;
const MARK_BELOW = /[ÇŞŢĄĘ]/;

export function Goalheroname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const M = 80;

  /* ---- the top: logo, kicker, surname ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const kicker = heroWord(data);
  const kickSize = Math.min((story ? 42 : 32) * ts, 760 / Math.max(1, kicker.length * 1.2));
  const kickTop = logoTop + (story ? 150 : 106);
  const surname = (content.lastName || content.firstName || "").toUpperCase().replace(/’/g, "'").trim();
  const em = Math.max(0.5, wordEm(FACE, surname));
  const size = Math.min((CANVAS_W - 2 * M) / em, (story ? 460 : 380) / FACE.cap) * ts;
  const wordLeft = (CANVAS_W - em * size) / 2;
  const above = MARK_ABOVE.test(surname) ? size * 0.22 : 0; // tilde/acute rise over the cap line
  const below = MARK_BELOW.test(surname) ? size * 0.3 : 0; // the cedilla's tail under the baseline
  const capTop = kickTop + kickSize + (story ? 44 : 32) + above + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;
  const foot = baseline + below;

  /* ---- the player: his top just under the surname, big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = foot + 200;
  // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
  for (let i = 0; i < 3; i++) faceTop += foot + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The surname, pinned to the canvas width. */}
      {surname && (
        <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={wordLeft} y={baseline} style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: club }}>
            {surname}
          </text>
        </svg>
      )}

      {/* The player, in front of the surname's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The kicker, small and wide-spaced, where goalhero puts the name. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: kickTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>
        {kicker}
      </div>

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
