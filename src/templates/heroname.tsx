import { FACES, wordEm } from "./goalhero";
import { heroClub } from "./goalherosplit";
import { heroFoot, heroLogo, heroPlayer, HERO_GROUND, matchWord } from "./heroghost";
import { SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · surname (matchday) — goalheroname carried to matchday: on the off-white ground the NEYOD logo small at
 * the top, the kicker ("MATCHDAY") small in wide-spaced club-colour caps, then his SURNAME enormous across the
 * canvas in the club colour (accents kept, room left for them), the cutout big under it, fading out under
 * heromatch's quiet fixture foot (crests either side of "HOME v AWAY", then date · kick-off · ground).
 */
const FACE = FACES.anton;
/** Capitals carrying a mark above (Ã, É, Ô …) and below (Ç). */
const MARK_ABOVE = /[ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝÑ]/;
const MARK_BELOW = /[ÇŞŢĄĘ]/;

export function Heroname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;

  /* ---- the top: logo, kicker, surname ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const kicker = matchWord(data);
  const kickSize = Math.min((story ? 40 : 30) * ts, 760 / Math.max(1, kicker.length * 1.2));
  const kickTop = logoTop + (story ? 150 : 106);
  const surname = (content.lastName || content.firstName || "").toUpperCase().replace(/’/g, "'").trim();
  const em = Math.max(0.5, wordEm(FACE, surname));
  const size = Math.min((CANVAS_W - 2 * M) / em, (story ? 440 : 340) / FACE.cap) * ts;
  const wordLeft = (CANVAS_W - em * size) / 2;
  const above = MARK_ABOVE.test(surname) ? size * 0.22 : 0; // tilde/acute rise over the cap line
  const below = MARK_BELOW.test(surname) ? size * 0.3 : 0; // the cedilla's tail under the baseline
  const capTop = kickTop + kickSize + (story ? 44 : 30) + above + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;
  const wordFoot = baseline + below;

  /* ---- the fixture foot and the player under the surname ---- */
  const foot = heroFoot(data, club);
  const p = heroPlayer(data, wordFoot + (story ? 26 : 16), foot.top, foot.bottom);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {surname && (
        <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={wordLeft} y={baseline} style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: club }}>
            {surname}
          </text>
        </svg>
      )}

      {p.img}
      {foot.node}

      <div style={{ position: "absolute", left: 0, right: 0, top: kickTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>
        {kicker}
      </div>
      {heroLogo(data, logoTop)}
    </div>
  );
}
