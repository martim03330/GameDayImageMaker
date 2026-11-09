import type { ReactNode } from "react";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, heroPlayer, HERO_GROUND, matchWord, spacedName } from "./heroghost";
import { dockedPlayer } from "./herotint";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · boxed (matchday) — goalheroboxed carried to matchday: on the off-white ground the NEYOD logo small at
 * the top, the name wide-spaced in the club colour, then the kicker ("MATCHDAY") enormous in the club colour
 * inside a thin club-colour hairline rectangle that hugs it with equal padding on every side, like a label;
 * the player big under the box, fading out over heromatch's quiet fixture foot (crests either side of
 * "HOME v AWAY" with exact names, then date · kick-off · ground).
 */
const FACE = FACES.anton;

export type DecoBase = ReturnType<typeof decoMatchBase>;

/**
 * The matchday hero geometry for a decorated word. `reserve` is the extra width the decoration takes from the
 * word (so word + decoration is exactly the canvas width minus margins), `lift` how far above the word's cap
 * line the decoration reaches (the word moves down by it), `drop` how far below the baseline it reaches (the
 * player's top goes under that).
 */
export function decoMatchBase(data: RenderData, opt: { reserve?: number; lift?: number; drop?: number; maxCap?: number } = {}) {
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
  const size = Math.min((CANVAS_W - 2 * M - (opt.reserve ?? 0)) / em, (opt.maxCap ?? (story ? 460 : 380)) / FACE.cap) * ts;
  const wordW = em * size;
  const capTop = nameTop + nameSize + (story ? 44 : 32) + (opt.lift ?? 0) + (params.textY ?? 0);
  const capH = size * FACE.cap;
  const baseline = capTop + capH;

  const foot = heroFoot(data, club);
  const p = heroPlayer(data, baseline + (opt.drop ?? 0) + (story ? 26 : 18), foot.top, foot.bottom);
  return { H, story, club, logoTop, name, nameSize, nameTop, word, size, wordW, capTop, capH, baseline, foot, p };
}

export function decoWordStyle(b: DecoBase) {
  return { fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: b.size } as const;
}

/** Ground, the decorated word, the player, the fixture foot and the top (logo + name). */
export function DecoMatchFrame({ data, b, word }: { data: RenderData; b: DecoBase; word: ReactNode }) {
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: b.H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      {word}
      {dockedPlayer(data, b.p, b.foot.top, b.foot.bottom)}
      {b.foot.node}
      {spacedName(b.name, b.nameTop, b.nameSize, b.club)}
      {heroLogo(data, b.logoTop)}
    </div>
  );
}

export function Heroboxed({ data }: { data: RenderData }) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const pad = story ? 40 : 32;
  const stroke = story ? 3 : 2.5;
  const b = decoMatchBase(data, { reserve: 2 * pad, lift: pad, drop: pad + stroke });
  // Anton's advances carry a little side bearing (≈0.028em before the first letter, ≈0.005em after the last):
  // hug the ink, not the advance, so the padding reads equal on all four sides.
  const lsb = 0.028 * b.size;
  const boxW = b.wordW - lsb - 0.005 * b.size + 2 * pad;
  const x = (CANVAS_W - boxW) / 2;
  return (
    <DecoMatchFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <rect x={x + stroke / 2} y={b.capTop - pad + stroke / 2} width={boxW - stroke} height={b.capH + 2 * pad - stroke} fill="none" stroke={b.club} strokeWidth={stroke} />
          <text x={x + pad - lsb} y={b.baseline} style={{ ...decoWordStyle(b), fill: b.club }}>
            {b.word}
          </text>
        </svg>
      }
    />
  );
}
