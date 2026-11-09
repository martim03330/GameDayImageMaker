import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { HERO_GROUND, heroFoot, heroLogo, heroPlayer, matchWord, spacedName } from "./heroghost";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · two-tone (matchday) — goalherotwotone carried to matchday: the kicker set enormous as one word at the
 * exact canvas width, "MATCH" in the club colour and "DAY" in near-black ink, the player under it fading into the
 * off-white ground, and the quiet fixture foot (crests, HOME v AWAY, date · kick-off · ground).
 */
const FACE = FACES.barlow;
const INK = "#16181d";

/** MATCH|DAY, MATCH|WEEK; two words → the words; else the middle letter. */
function halves(word: string): [string, string] {
  const parts = word.split(/\s+/).filter(Boolean);
  if (parts.length === 2) return [`${parts[0]} `, parts[1]];
  const m = word.match(/^(.+?)(DAY|WEEK)$/);
  if (m) return [m[1], m[2]];
  const hy = word.indexOf("-");
  if (hy > 0 && hy < word.length - 1) return [word.slice(0, hy + 1), word.slice(hy + 1)];
  const letters = [...word];
  const cut = Math.floor(letters.length / 2) || 1;
  return [letters.slice(0, cut).join(""), letters.slice(cut).join("")];
}

export function Herotwotone({ data }: { data: RenderData }) {
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
  const [a, b] = halves(word);
  const wordW = CANVAS_W - 2 * M - 40; // the italic overhangs its advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(FACE, word)), (story ? 460 : 380) / FACE.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 40 : 28) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  const foot = heroFoot(data, club);
  const p = heroPlayer(data, baseline + (story ? 26 : 18), foot.top, foot.bottom);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={baseline}
          textAnchor="middle"
          style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontStyle: "italic", fontSize: size, letterSpacing: `${FACE.tracking}em`, whiteSpace: "pre" }}
        >
          <tspan fill={club}>{a}</tspan>
          <tspan fill={INK}>{b}</tspan>
        </text>
      </svg>
      {p.img}
      {foot.node}
      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
