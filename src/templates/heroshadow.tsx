/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, heroPlayer, matchWord, spacedName, HERO_GROUND } from "./heroghost";
import { dockedPlayer } from "./herotint";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · shadow (matchday) — goalheroshadow carried to matchday: on the off-white ground the kicker
 * ("MATCHDAY") enormous in the club colour with a second copy set behind it, offset right and down in a pale
 * tint of the club colour (a clean flat shadow, no blur); the player big under it fading out over the quiet
 * fixture foot: crests either side of "HOME v AWAY" (exact names), then date · kick-off · ground.
 */
const FACE = FACES.anton;

export function Heroshadow({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const tint = shade(club, 0.72);
  const off = story ? 20 : 16;
  const M = 80;

  /* ---- the top: logo, name, word + its shadow (together exactly the canvas width minus margins) ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 106);
  const word = matchWord(data);
  const em = Math.max(0.5, wordEm(FACE, word));
  const size = Math.min((CANVAS_W - 2 * M - off) / em, (story ? 460 : 380) / FACE.cap) * ts;
  const x = (CANVAS_W - em * size - off) / 2;
  const capTop = nameTop + nameSize + (story ? 40 : 30) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  const foot = heroFoot(data, club);
  const p = heroPlayer(data, baseline + off + (story ? 24 : 16), foot.top, foot.bottom);
  const style = { fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size } as const;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <text x={x + off} y={baseline + off} style={{ ...style, fill: tint }}>
          {word}
        </text>
        <text x={x} y={baseline} style={{ ...style, fill: club }}>
          {word}
        </text>
      </svg>
      {dockedPlayer(data, p, foot.top, foot.bottom)}
      {foot.node}
      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
