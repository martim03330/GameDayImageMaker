import type { ReactNode } from "react";
import { shade } from "@/lib/color";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, heroPlayer, HERO_GROUND, matchWord, spacedName } from "./heroghost";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · gradient (matchday) — goalherogradient carried to matchday: on the off-white ground the NEYOD logo
 * small at the top, the name wide-spaced in the club colour, then the kicker ("MATCHDAY") enormous across the
 * canvas, filled top-to-bottom from the deep club colour at the cap line to a light tint at the baseline (crisp
 * edges, no blur); the cutout big under it, fading out under heromatch's quiet fixture foot.
 */
const FACE = FACES.anton;

export type HeroMatchBase = ReturnType<typeof heroMatchBase>;

/** The matchday hero geometry: logo, name, the full-width word, the player under it and the fixture foot. */
export function heroMatchBase(data: RenderData) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;

  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 106);
  const word = matchWord(data);
  const em = Math.max(0.5, wordEm(FACE, word));
  const size = Math.min((CANVAS_W - 2 * M) / em, (story ? 460 : 380) / FACE.cap) * ts;
  const wordLeft = (CANVAS_W - em * size) / 2;
  const capTop = nameTop + nameSize + (story ? 44 : 32) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  const foot = heroFoot(data, club);
  const p = heroPlayer(data, baseline + (story ? 26 : 18), foot.top, foot.bottom);
  const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const head = { cx: p.box.left + p.box.width * (f[0] + f[2] / 2), cy: p.box.top + p.box.height * (f[1] + f[3] / 2), h: p.box.faceH };
  return { H, story, club, logoTop, name, nameSize, nameTop, word, size, wordLeft, capTop, baseline, foot, p, head };
}

export function heroMatchWordStyle(b: HeroMatchBase) {
  return { fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: b.size } as const;
}

/** Ground, word, player, foot and the top (logo + name). */
export function HeroMatchFrame({ data, b, word, behindPlayer }: { data: RenderData; b: HeroMatchBase; word: ReactNode; behindPlayer?: ReactNode }) {
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: b.H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      {word}
      {behindPlayer}
      {b.p.img}
      {b.foot.node}
      {spacedName(b.name, b.nameTop, b.nameSize, b.club)}
      {heroLogo(data, b.logoTop)}
    </div>
  );
}

export function Herogradient({ data }: { data: RenderData }) {
  const b = heroMatchBase(data);
  const deep = shade(b.club, -0.3);
  const light = shade(b.club, 0.55);
  const id = "hg-fill";
  return (
    <HeroMatchFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={b.capTop} x2={0} y2={b.baseline}>
              <stop offset="0" stopColor={deep} />
              <stop offset="0.35" stopColor={b.club} />
              <stop offset="1" stopColor={light} />
            </linearGradient>
          </defs>
          <text x={b.wordLeft} y={b.baseline} style={{ ...heroMatchWordStyle(b), fill: `url(#${id})` }}>
            {b.word}
          </text>
        </svg>
      }
    />
  );
}
