import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { HERO_GROUND, heroFoot, heroLogo, heroPlayer, matchWord, spacedName } from "./heroghost";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · outline (matchday) — goalherooutline carried to matchday: the kicker ("MATCHDAY") enormous across the
 * canvas as a hairline club-colour outline (SVG stroke, no fill) at the exact width, the player's top just under
 * it, fading into the off-white ground, and the quiet fixture foot (crests, HOME v AWAY, date · kick-off · ground).
 */
const FACE = FACES.anton;

export function Herooutline({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;
  const stroke = story ? 3 : 2.5;

  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 106);
  const word = matchWord(data);
  const size = Math.min((CANVAS_W - 2 * M - stroke) / Math.max(0.5, wordEm(FACE, word)), (story ? 460 : 380) / FACE.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 44 : 32) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  const foot = heroFoot(data, club);
  const p = heroPlayer(data, baseline + (story ? 26 : 18), foot.top, foot.bottom);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      {p.img}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={baseline}
          textAnchor="middle"
          style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: "none", stroke: club, strokeWidth: stroke, strokeLinejoin: "round" }}
        >
          {word}
        </text>
      </svg>
      {foot.node}
      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
