/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero duo — goalhero's light ground, small logo, spaced name and the enormous word, and under it TWO
 * cutouts of him: the celebrating photo big in front, and a second photo of him smaller, behind and to one
 * side, a little greyed and lighter so the main one leads. Both fade into the ground at the foot. With no
 * second photo it is exactly the single-photo goalhero.
 */
const FACE = FACES.barlow;

type Cut = RenderData["cutouts"][number];

/** The second photo: the chosen photo2 when we know where its face is, else the next cutout with a face. */
function secondOf(data: RenderData): Cut | null {
  const ok = (c: Cut) => !!c.url && c.url !== data.photoUrl && !!c.face && !(c.cut?.top ?? 0);
  // Never a back shot; a photo facing the camera (standing, bust, celebrating) reads best small and greyed.
  const others = data.cutouts.filter((c) => ok(c) && c.pose !== "back");
  const facing = (c: Cut) => c.pose === "standing" || c.pose === "bust" || c.pose === "celebrate" || c.pose === "open";
  return others.find((c) => c.url === data.photo2Url && facing(c)) ?? others.find(facing) ?? others.find((c) => c.url === data.photo2Url) ?? others[0] ?? null;
}

export function Goalheroduo({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const face = FACE;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const M = 80;

  /* ---- the top: logo, name, word (as goalhero) ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const wordW = CANVAS_W - 2 * M - (face.italic ? 40 : 0);
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 34 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  /* ---- the two figures ---- */
  const two = data.photoUrl ? secondOf(data) : null;
  const mf = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The second stands on the side where his main cutout reaches out least from the face (raised arms and
  // fists sit on the other side), so its head stays clear; the main one moves over to make room.
  const s = mf[0] + mf[2] / 2 > 0.5 ? 1 : -1;
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = two ? 540 - s * (story ? 120 : 130) : 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = two ? 0 : Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const mainFaceH = box.faceH;
  const mainFaceW = mf[2] * box.width;
  const mainCx = box.left + (mf[0] + mf[2] / 2) * box.width;

  // Second figure: ~0.62 of his face size, its head a little lower (further back), on the free side.
  let b2: { left: number; top: number; width: number; height: number } | null = null;
  if (two?.face) {
    const f = two.face;
    const aspect = two.aspect ?? 0.6;
    const top0 = baseline + gap + (story ? 90 : 70);
    const h = Math.max((mainFaceH * 0.62) / f[3], (H + 30 - top0) / Math.max(0.2, 1 - f[1]));
    const w = h * aspect;
    const fw = f[2] * w;
    // Face centre: a clear step out from his face, never closer than ~80px to the canvas edge.
    const want = s * Math.max(s * (mainCx + s * (mainFaceW / 2 + fw / 2 + Math.max(90, mainFaceH * 0.75))), s * (540 + s * (story ? 260 : 250)));
    const cx = s > 0 ? Math.min(want, CANVAS_W - fw / 2 - 80) : Math.max(want, fw / 2 + 80);
    // Never on his face: if the canvas is too narrow for both heads side by side, drop the second photo.
    if (Math.abs(cx - mainCx) >= mainFaceW / 2 + fw / 2 + 24) {
      b2 = { left: cx - w * (f[0] + f[2] / 2) + (params.playerX ?? 0), top: top0 + (params.playerY ?? 0), width: w, height: h };
    }
  }
  if (two && !b2) {
    // Fall back to exactly the single-photo goalhero placement.
    return <Goalheroduo data={{ ...data, cutouts: [], photo2Url: null }} />;
  }

  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;
  const fade2 = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 560 : 420)}px, transparent ${H - (story ? 140 : 60)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
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
            style={{ position: "absolute", left: b2.left, top: b2.top, width: b2.width, height: b2.height, maxWidth: "none", filter: "saturate(0.6) brightness(1.08) contrast(0.92)", opacity: 0.92, ...cutMask(two.cut) }}
          />
        </div>
      )}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
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
