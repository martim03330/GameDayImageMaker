import { coachRole } from "./coachhero";
import { FACES, wordEm } from "./goalhero";
import { heroClub } from "./goalherosplit";
import { heroFoot, heroLogo, heroPlayer, HERO_GROUND, matchWord } from "./heroghost";
import { SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Coach · surname (matchday) — heroname carried to a head coach: on the off-white ground the NEYOD logo small at
 * the top, "HEAD COACH · MATCHDAY" small in wide-spaced club-colour caps, then his SURNAME enormous across the
 * canvas in the club colour at its exact width (accents kept, room left above for Ã/É and below for Ç), his
 * studio bust big under it, fading out under the quiet fixture foot (crests either side of "HOME v AWAY",
 * then date · kick-off · ground).
 */
const FACE = FACES.anton;
/** Capitals carrying a mark above (Ã, É, Ô …) and below (Ç). */
const MARK_ABOVE = /[ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝÑ]/;
const MARK_BELOW = /[ÇŞŢĄĘ]/;

export function Coachname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 80;

  /* ---- the top: logo, role · kicker, surname ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const kicker = [coachRole(data).toUpperCase(), matchWord(data)].filter(Boolean).join("  ·  ");
  const kickSize = Math.min((story ? 30 : 22) * ts, 860 / Math.max(1, kicker.length * 1.25));
  const kickTop = logoTop + (story ? 150 : 106);
  const surname = (content.lastName || content.firstName || "").toUpperCase().replace(/’/g, "'").trim();
  const em = Math.max(0.5, wordEm(FACE, surname));
  const size = Math.min((CANVAS_W - 2 * M) / em, (story ? 440 : 340) / FACE.cap) * ts;
  const wordLeft = (CANVAS_W - em * size) / 2;
  const above = MARK_ABOVE.test(surname) ? size * 0.2 : 0; // tilde/acute rise over the cap line
  const below = MARK_BELOW.test(surname) ? size * 0.26 : 0; // the cedilla's tail under the baseline
  const capTop = kickTop + kickSize + (story ? 44 : 30) + above + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;
  const wordFoot = baseline + below;

  /* ---- the fixture foot and his bust under the surname ---- */
  const foot = heroFoot(data, club);
  const p = heroPlayer(data, wordFoot + (story ? 32 : 22), foot.top, foot.bottom);

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

      <div style={{ position: "absolute", left: 0, right: 0, top: kickTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.5em", paddingLeft: "0.5em", color: club, whiteSpace: "nowrap" }}>
        {kicker}
      </div>
      {heroLogo(data, logoTop)}
    </div>
  );
}
