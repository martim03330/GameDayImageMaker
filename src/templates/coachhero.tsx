import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { HERO_GROUND, heroFoot, heroLogo, heroPlayer, matchWord } from "./heroghost";
import { SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const FACE = FACES.barlow;
const INK = "#1b1d22";

/** The coach's label ("Head Coach", from his profile), never a shirt number. */
export function coachRole(data: RenderData): string {
  return (data.player.position || "Head Coach").trim();
}

/**
 * Coach · hero — the matchday hero carried to a head coach: the off-white ground, the NEYOD logo small at the
 * top, "HEAD COACH" small and wide-spaced in the club colour, his name in a medium spaced line, then the
 * kicker ("MATCHDAY") enormous across the canvas at its exact width, his studio bust big under it fading into
 * the ground, and the quiet fixture foot: crests either side of "HOME v AWAY", then date · kick-off · ground.
 */
export function Coachhero({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;

  /* ---- the top: logo, role, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
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

  /* ---- his bust right under the word, the fixture foot over his faded body ---- */
  const foot = heroFoot(data, club);
  const p = heroPlayer(data, baseline + (story ? 26 : 18), foot.top, foot.bottom);

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

      {/* The word, pinned to the canvas width. */}
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

      {p.img}
      {foot.node}

      <div style={line(roleSize, 0.7, { top: roleTop, fontWeight: 800, color: club })}>{role}</div>
      {name && <div style={line(nameSize, 0.32, { top: nameTop, fontWeight: 600, color: INK })}>{name}</div>}
      {heroLogo(data, logoTop)}
    </div>
  );
}
