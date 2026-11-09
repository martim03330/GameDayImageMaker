/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { interEm } from "./marker";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GROUND = "#e9eae8";
const INK = "#141518";
const GREY = "rgba(20,21,24,.56)";

/**
 * Goal colon: one sentence — "Goal: Moisés Conceição". At the foot of a calm, pale ground the word "Goal"
 * set big in Inter, then its colon blown up into two perfect circles in the club colour, stacked from the
 * baseline to the cap height (far bigger than any dot in the type), and after it, as if the sentence goes
 * on, his name in two short lines — first name level with the upper dot, surname with the lower. Under it,
 * small, the fixture (home first, names as stored, never the score). The celebrating player stands above
 * the sentence in natural colour and melts into the ground just over it. Not `goalpunct` (one full stop
 * after a word across the top, the player under it).
 */
export function Goalcolon({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const playerLeft = params.side === "left";
  const club = clubTone(data);
  const M = story ? 68 : 64;

  /* ---- the sentence ---- */
  const word = sentenceCase(content.kicker || "Goal").replace(/[.!:]+$/, "");
  const lines = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean);
  const T = -0.04; // the word's tracking (em)
  const CAP = 0.727; // Inter's cap height (em)
  const DOT = 0.27; // each circle's diameter, in ems of the word (Inter's own colon dot is ~0.12)
  const two = lines.length > 1;
  // The name: two lines pitched like the dots (centre to centre CAP - DOT), or one line centred on the colon.
  const nameK = two ? 0.38 : 0.5;
  const nameEm = (t: string) => interEm(t, -0.015) * 1.035; // Inter 600 runs ~3.5% wider than 500
  const nameW = Math.max(0, ...lines.map(nameEm));
  const GAP1 = 0.07; // word → colon
  const GAP2 = 0.13; // colon → name
  const fullW = CANVAS_W - 2 * M;
  const em = (k: number) => interEm(word, T) + GAP1 + DOT + (lines.length ? GAP2 + nameW * k : 0);
  // The name gives a little first (down to 0.32 of the word), then everything shrinks together.
  let k = nameK;
  let S = Math.min(240 * ts, fullW / em(k));
  if (S < 200 * ts && two) {
    k = Math.max(0.32, Math.min(nameK, (fullW / (200 * ts) - (em(0) - 0)) / Math.max(1, nameW)));
    S = Math.min(240 * ts, fullW / em(k));
  }
  const D = S * DOT;
  const N = S * k;

  /* ---- the foot: the logo at its corner, the sentence a clear gap above it, the fixture under the word ---- */
  const fixture = teamsOf(data).join(" v ");
  const fixSize = Math.max(14, Math.min(22 * q * ts, (fullW * 0.62) / Math.max(1, fixture.length * 0.55)));
  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoH = Math.max(story ? 88 : 52, Math.round((story ? 88 : 52) * logoScale));
  const logoTop = H - logoBottom - logoH;
  const descent = N * 0.22; // ç and the like hang under the lower line
  const nameDrop = two ? -D / 2 + N * CAP * 0.5 : -(CAP * S) / 2 + N * CAP * 0.5;
  // The baseline: the name's lowest point ~64px over the logo. The fixture shares the logo's row, centred on it.
  const baseline = logoTop - (story ? 66 : 60) - nameDrop - descent + ty;
  const fixTop = Math.max(baseline + S * 0.2, logoTop + logoH / 2 - fixSize * 0.65);
  const capTop = baseline - CAP * S;
  const wordW = interEm(word, T) * S;
  const dotX = M + wordW + GAP1 * S;
  const nameX = dotX + D + GAP2 * S;
  const c1 = capTop + D / 2;
  const c2 = baseline - D / 2;
  const lineBase = two ? [c1 + N * CAP * 0.5, c2 + N * CAP * 0.5] : [(c1 + c2) / 2 + N * CAP * 0.5];

  /* ---- the player, above the sentence ---- */
  const faceX = playerLeft ? (story ? 420 : 440) : story ? 680 : 670;
  const faceTop = story ? STORY_TOP + 130 : 150;
  const sizes = story ? { chest: 330, waist: 272, knees: 214, full: 168 } : { chest: 250, waist: 206, knees: 162, full: 126 };
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;
  const fadeEnd = capTop - (story ? 46 : 36) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 290)}px, transparent ${fadeEnd}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 46% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(GROUND, 0.5)}, ${GROUND} 66%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* A soft shade behind his shoulders, then the player in natural colour. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin, width: box.width * 0.6, height: Math.max(80, Math.min(box.faceH * 4, box.top + fadeEnd - chin - 120)), borderRadius: "50%", background: "rgba(30,34,40,.09)", filter: `blur(${story ? 70 : 56}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* "Goal" — its baseline is the sentence's. */}
      <div style={{ position: "absolute", left: M, top: baseline - S * 0.863, fontFamily: SANS, fontWeight: 500, fontSize: S, letterSpacing: `${T}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK }}>{word}</div>

      {/* The colon: two perfect circles, baseline to cap height. */}
      <div style={{ position: "absolute", left: dotX, top: capTop, width: D, height: D, borderRadius: "50%", background: club }} />
      <div style={{ position: "absolute", left: dotX, top: baseline - D, width: D, height: D, borderRadius: "50%", background: club }} />

      {/* The sentence goes on: his name, a line per dot. */}
      {lines.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: nameX, top: lineBase[i] - N * 0.863, fontFamily: SANS, fontWeight: 600, fontSize: N, letterSpacing: "-0.015em", lineHeight: 1, whiteSpace: "nowrap", color: INK }}>
          {t}
        </div>
      ))}

      {fixture && (
        <div style={{ position: "absolute", left: M + S * 0.04, top: fixTop, fontFamily: SANS, fontWeight: 500, fontSize: fixSize, lineHeight: 1.3, letterSpacing: "-0.005em", whiteSpace: "nowrap", color: GREY }}>{fixture}</div>
      )}

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", right: M, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
