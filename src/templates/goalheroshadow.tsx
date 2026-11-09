/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { shade } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName, heroWord } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero · shadow — the goal-hero layout with a second copy of the enormous club-colour word set behind it,
 * offset right and down in a pale tint of the club colour: a clean, flat offset shadow (no blur). Celebrating
 * player under the word fading into the off-white ground; logo small at the top, name wide-spaced, no score.
 */
export const HERO_FACE: { family: string; weight: number; cap: number; widths: string; tracking?: number } = FACES.anton;

export type HeroBase = ReturnType<typeof heroBase>;

/**
 * The shared goal-hero geometry. `reserve` is the extra width the word's decoration needs (taken from the
 * word's width so the whole thing stays exactly the canvas width minus margins); `drop` is how far below the
 * word's baseline its lowest ink reaches (the player's top goes under that).
 */
export function heroBase(data: RenderData, opt: { reserve?: number; drop?: (size: number) => number; maxCap?: number } = {}) {
  const { params } = data;
  const face = HERO_FACE;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const ground = "#f3f3f1";
  const M = 80;

  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 106);
  const word = heroWord(data);
  const em = Math.max(0.5, wordEm(face, word));
  const size = Math.min((CANVAS_W - 2 * M - (opt.reserve ?? 0)) / em, (opt.maxCap ?? (story ? 460 : 380)) / face.cap) * ts;
  const wordW = em * size;
  const wordLeft = (CANVAS_W - wordW - (opt.reserve ?? 0)) / 2;
  const capTop = nameTop + nameSize + (story ? 44 : 32) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;
  const foot = baseline + (opt.drop ? opt.drop(size) : 0);

  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let faceTop = foot + 200;
  for (let i = 0; i < 3; i++) faceTop += foot + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;
  const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const head = { cx: box.left + box.width * (f[0] + f[2] / 2), cy: box.top + box.height * (f[1] + f[3] / 2), h: box.faceH };

  return { face, H, story, club, ground, logoTop, name, nameSize, nameTop, word, size, wordW, wordLeft, capTop, baseline, foot, box, fade, head };
}

/** Ground, player and the top (logo + name) around a custom word drawing. */
export function HeroFrame({ data, b, word, behindPlayer }: { data: RenderData; b: HeroBase; word: ReactNode; behindPlayer?: ReactNode }) {
  const { params } = data;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: b.H, overflow: "hidden", background: b.ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      {word}
      {behindPlayer}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: b.fade, maskImage: b.fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: b.box.left, top: b.box.top, width: b.box.width, height: b.box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}
      {b.name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: b.nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: b.nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: b.club, whiteSpace: "nowrap" }}>{b.name}</div>
      )}
      <AgencyLogo
        data={data}
        height={b.story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: b.logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

export function wordStyle(b: HeroBase) {
  return { fontFamily: b.face.family, fontWeight: b.face.weight, fontSize: b.size, letterSpacing: `${b.face.tracking ?? 0}em` } as const;
}

export function Goalheroshadow({ data }: { data: RenderData }) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const off = story ? 18 : 14;
  const b = heroBase(data, { reserve: off, drop: () => off });
  const tint = shade(b.club, 0.72);
  const x = b.wordLeft;
  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={x + off} y={b.baseline + off} style={{ ...wordStyle(b), fill: tint }}>
            {b.word}
          </text>
          <text x={x} y={b.baseline} style={{ ...wordStyle(b), fill: b.club }}>
            {b.word}
          </text>
        </svg>
      }
    />
  );
}
