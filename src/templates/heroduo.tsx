/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, matchWord, spacedName, HERO_GROUND } from "./heroghost";
import { placeByFace } from "./outline";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero duo (matchday) — goalheroduo carried to matchday: the off-white ground, the NEYOD logo small at the top,
 * the spaced name, the kicker ("MATCHDAY") enormous in the club colour at the exact canvas width, and under it
 * TWO cutouts of him: the main photo big in front, and a second photo of him smaller, greyed and lighter,
 * beside it (never a back shot, never over his face). Both fade out over the quiet fixture foot: crests either
 * side of "HOME v AWAY" (exact names), then date · kick-off · ground. With no usable second photo it is the
 * single-photo hero.
 */
const FACE = FACES.barlow;

type Cut = RenderData["cutouts"][number];

/** The second photo: the chosen photo2 when we know where its face is, else the next facing cutout. */
function secondOf(data: RenderData): Cut | null {
  const ok = (c: Cut) => !!c.url && c.url !== data.photoUrl && !!c.face && !(c.cut?.top ?? 0) && c.pose !== "back";
  const others = data.cutouts.filter(ok);
  const facing = (c: Cut) => c.pose === "standing" || c.pose === "bust" || c.pose === "celebrate" || c.pose === "open";
  return others.find((c) => c.url === data.photo2Url && facing(c)) ?? others.find(facing) ?? others.find((c) => c.url === data.photo2Url) ?? others[0] ?? null;
}

export function Heroduo({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const face = FACE;
  const club = heroClub(data);
  const M = 80;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const word = matchWord(data);
  const wordW = CANVAS_W - 2 * M - (face.italic ? 40 : 0); // italics overhang their advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 34 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  const foot = heroFoot(data, club);

  /* ---- the main figure: top just under the word, shrunk until his head is clear of the foot ---- */
  const two = data.photoUrl ? secondOf(data) : null;
  const mf = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The second stands on the side where the main cutout reaches out least from his face.
  const s = mf[0] + mf[2] / 2 > 0.5 ? 1 : -1;
  const base = story ? { chest: 420, waist: 360, knees: 260, full: 196 } : { chest: 300, waist: 260, knees: 190, full: 146 };
  const faceX = two ? 540 - s * (story ? 120 : 130) : 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  let box = placeByFace(data, faceX, faceTop, base);
  for (let shrink = 1; shrink > 0.5; shrink -= 0.08) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    faceTop = baseline + 200;
    // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
    for (let i = 0; i < 3; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    if (faceTop + (params.playerY ?? 0) + box.faceH * 1.6 < foot.top - 24) break;
  }
  const lean = two ? 0 : Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const headBottom = faceTop + (params.playerY ?? 0) + box.faceH * 1.6;
  const mainFaceH = box.faceH;
  const mainFaceW = mf[2] * box.width;
  const mainCx = box.left + (mf[0] + mf[2] / 2) * box.width;

  /* ---- the second figure: ~0.62 of his face size, a little lower, on the free side ---- */
  let b2: { left: number; top: number; width: number; height: number } | null = null;
  if (two?.face) {
    const f = two.face;
    const aspect = two.aspect ?? 0.6;
    const top0 = baseline + gap + (story ? 90 : 70) + (params.playerY ?? 0);
    const h = Math.max((mainFaceH * 0.62) / f[3], (foot.top + 60 - top0) / Math.max(0.2, 1 - f[1]));
    const w = h * aspect;
    const fw = f[2] * w;
    const want = s * Math.max(s * (mainCx + s * (mainFaceW / 2 + fw / 2 + Math.max(90, mainFaceH * 0.75))), s * (540 + s * (story ? 260 : 250)));
    const cx = s > 0 ? Math.min(want, CANVAS_W - fw / 2 - 80) : Math.max(want, fw / 2 + 80);
    const head2Bottom = top0 + h * f[1] + f[3] * h * 1.6;
    // Never on his face, never down on the fixture.
    if (Math.abs(cx - mainCx) >= mainFaceW / 2 + fw / 2 + 24 && head2Bottom < foot.top - 24) {
      b2 = { left: cx - w * (f[0] + f[2] / 2) + (params.playerX ?? 0), top: top0, width: w, height: h };
    }
  }
  if (two && !b2) return <Heroduo data={{ ...data, cutouts: [], photo2Url: null }} />;

  const fadeFrom = Math.max(headBottom, foot.top - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${foot.bottom - 20}px, transparent ${Math.min(H, foot.bottom + 60)}px)`;
  const fade2From = Math.max(baseline + 200, foot.top - (story ? 380 : 300));
  const fade2 = `linear-gradient(to bottom, #000 0, #000 ${fade2From}px, transparent ${foot.top - 10}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + size * face.cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: face.italic ? "italic" : "normal", fontSize: size, fill: club, letterSpacing: `${face.tracking ?? 0}em` }}
        >
          {word}
        </text>
      </svg>

      {/* The second photo, behind, greyed and lighter. */}
      {two && b2 && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade2, maskImage: fade2 }}>
          <img
            src={two.url}
            alt=""
            style={{ position: "absolute", left: b2.left, top: b2.top, width: b2.width, height: b2.height, maxWidth: "none", filter: "grayscale(0.75) brightness(1.1) contrast(0.9)", opacity: 0.9, ...cutMask(two.cut) }}
          />
        </div>
      )}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {foot.node}
      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
