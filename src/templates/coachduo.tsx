/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { coachRole } from "./coachhero";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, matchWord, HERO_GROUND } from "./heroghost";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Coach · duo (matchday) — heroduo carried to a head coach: the off-white ground, the NEYOD logo small at the
 * top, "HEAD COACH" small and wide-spaced in the club colour, his name in a spaced line, "MATCHDAY" enormous in
 * the club colour at the exact canvas width, and under it TWO photos of him: the chosen one big in front, a
 * different one smaller, greyed and lighter beside him (never over his face). Both fade out over the quiet
 * fixture foot: crests either side of "HOME v AWAY" (exact names), then date · kick-off · ground. With no
 * second photo it is the single-bust hero.
 */
const FACE = FACES.barlow;
const INK = "#1b1d22";

type Cut = RenderData["cutouts"][number];

/** The second photo: a different cutout of him (photo2 first), facing us, with a known face. */
function secondOf(data: RenderData): Cut | null {
  const ok = (c: Cut) => !!c.url && c.url !== data.photoUrl && !!c.face && !(c.cut?.top ?? 0) && c.pose !== "back";
  const others = data.cutouts.filter(ok);
  return others.find((c) => c.url === data.photo2Url) ?? others.find((c) => c.pose === "bust") ?? others.find((c) => c.pose === "standing") ?? others[0] ?? null;
}

export function Coachduo({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;

  /* ---- the top: logo, role, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const role = coachRole(data).toUpperCase();
  const roleSize = Math.min((story ? 25 : 18) * ts, 700 / Math.max(1, role.length * 1.3));
  const roleTop = logoTop + (story ? 88 + 58 : 52 + 44);
  const name = heroName(data);
  const nameSize = Math.min((story ? 40 : 30) * ts, 900 / Math.max(1, name.length * 0.95));
  const nameTop = roleTop + roleSize + (story ? 20 : 14);
  const word = matchWord(data);
  const size = Math.min((CANVAS_W - 2 * M - 40) / Math.max(0.5, wordEm(FACE, word)), (story ? 440 : 360) / FACE.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 40 : 28) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  const foot = heroFoot(data, club);

  /* ---- the main bust: top just under the word, shrunk until his head is clear of the foot ---- */
  const two = data.photoUrl ? secondOf(data) : null;
  const mf = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The second stands on the side his face looks away from the centre of the main cutout.
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

  /* ---- the second bust: ~0.6 of his face size (less when his whole bust must fit), on the free side ---- */
  let b2: { left: number; top: number; width: number; height: number } | null = null;
  if (two?.face) {
    const f = two.face;
    const aspect = two.aspect ?? 0.6;
    const top0 = baseline + gap + (story ? 110 : 80) + (params.playerY ?? 0);
    for (let k = 0.6; k > 0.4 && !b2; k -= 0.04) {
      const h = (mainFaceH * k) / Math.max(0.05, f[3]);
      const w = h * aspect;
      const fw = f[2] * w;
      const fc = (f[0] + f[2] / 2) * w; // face centre from the box's left edge
      const want = s * Math.max(s * (mainCx + s * (mainFaceW / 2 + fw / 2 + Math.max(90, mainFaceH * 0.75))), s * (540 + s * (story ? 250 : 240)));
      // His whole bust stays on the canvas (crossed arms are not cut by the edge).
      const cx = s > 0 ? Math.min(want, CANVAS_W - 16 - (w - fc)) : Math.max(want, 16 + fc);
      const head2Bottom = top0 + h * f[1] + f[3] * h * 1.6;
      // Never on his face, never down on the fixture.
      if (Math.abs(cx - mainCx) >= mainFaceW / 2 + fw / 2 + 24 && head2Bottom < foot.top - 24) {
        b2 = { left: cx - fc + (params.playerX ?? 0), top: top0, width: w, height: h };
      }
    }
  }
  if (two && !b2) return <Coachduo data={{ ...data, cutouts: [], photo2Url: null }} />;

  const fadeFrom = Math.max(headBottom, foot.top - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${foot.bottom - 20}px, transparent ${Math.min(H, foot.bottom + 60)}px)`;
  // The second bust is cut at his waist: gone well before that edge and before the fixture.
  const fade2End = b2 ? Math.min(foot.top - 10, b2.top + b2.height * 0.94) : 0;
  const fade2From = b2 ? Math.max(b2.top + b2.height * 0.42, fade2End - (story ? 360 : 280)) : 0;
  const fade2 = `linear-gradient(to bottom, #000 0, #000 ${fade2From}px, transparent ${fade2End}px)`;

  const line = (fs: number, sp: number, extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: SANS,
    fontSize: fs,
    lineHeight: 1,
    letterSpacing: `${sp}em`,
    paddingLeft: `${sp}em`,
    whiteSpace: "nowrap",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - FACE.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - FACE.cap) * 0.9 + size * FACE.cap}
          textAnchor="middle"
          style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontStyle: "italic", fontSize: size, fill: club, letterSpacing: `${FACE.tracking ?? 0}em` }}
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
            style={{ position: "absolute", left: b2.left, top: b2.top, width: b2.width, height: b2.height, maxWidth: "none", filter: "grayscale(0.9) brightness(1.2) contrast(0.82)", opacity: 0.72, ...cutMask(two.cut) }}
          />
        </div>
      )}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {foot.node}
      <div style={line(roleSize, 0.7, { top: roleTop, fontWeight: 800, color: club })}>{role}</div>
      {name && <div style={line(nameSize, 0.32, { top: nameTop, fontWeight: 600, color: INK })}>{name}</div>}
      {heroLogo(data, logoTop)}
    </div>
  );
}
