/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#141414";
const FOG = "#efefec";

/**
 * The shared frame of the "fog" natural looks (reference: the "Nocturna" studio poster, a figure before a
 * pale haze, thin grid lines): his real photo with a soft white haze falling from the top BEHIND him (laid
 * on the photo, under the sharp figure layer — he stays exactly himself in front of it), a few dark
 * hairlines like a layout grid. Top left one word in black Inter semibold with a small superscript; top
 * right three tiny tracked lines. The NEYOD logo at the foot.
 */
export function NatFogFrame({ data, word, sup, lines }: { data: RenderData; word: string; sup: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 72 : 60;
  const top = (story ? STORY_TOP : 70) - (params.textY ?? 0);
  // Inter semibold lowercase/caps mix runs ~0.56em a letter.
  const wPx = Math.min(78 * k * ts, (CANVAS_W * 0.55) / Math.max(1, word.length * 0.56));
  const lPx = (t: string) => Math.min(15 * k * ts, (CANVAS_W * 0.36) / Math.max(1, capsEm(t, 0.14)));
  const fs = story ? 210 : 158;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 720 : 520, top + wPx + 120 * k + fs * 0.85), fs });
  const fogEnd = Math.min(H * 0.72, place.fy + place.fs * 2.6);

  const footY = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const hair = { position: "absolute" as const, background: INK, opacity: 0.22 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: FOG }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "saturate(.75) contrast(1.06)" }} />
      {/* The haze: dense at the top, gone by his waist — behind him, he is redrawn untouched on top. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: fogEnd, background: `linear-gradient(to bottom, ${FOG} 0%, ${FOG}f0 30%, ${FOG}99 62%, ${FOG}00 100%)` }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      {/* Layout hairlines, as in the reference: never through his face (kept in the haze above it). */}
      <div style={{ ...hair, left: M, top: 0, width: 1, height: place.fy - place.fs * 1.2 }} />
      <div style={{ ...hair, right: M, top: 0, width: 1, height: place.fy - place.fs * 1.2 }} />
      <div style={{ ...hair, left: 0, right: 0, top: top + wPx + 34 * k, height: 1 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 360 : 260, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />

      <div style={{ position: "absolute", left: M + 18 * k, top, fontFamily: SANS, fontWeight: 600, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.035em", color: INK, whiteSpace: "nowrap" }}>
        {word}
        {sup && <sup style={{ fontSize: "0.3em", fontWeight: 600, letterSpacing: 0, marginLeft: "0.12em", verticalAlign: "0.95em" }}>{sup}</sup>}
      </div>
      <div style={{ position: "absolute", right: M + 18 * k, top: top + 4 * k, textAlign: "left", fontFamily: SANS, fontWeight: 600, letterSpacing: "0.14em", lineHeight: 1.55, color: INK }}>
        {lines.filter(Boolean).map((t) => (
          <div key={t} style={{ fontSize: lPx(t), whiteSpace: "nowrap" }}>
            {t}
          </div>
        ))}
      </div>
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Natural · névoa (matchday): his real photo with a pale haze falling from the top behind him, thin grid
 * hairlines. Top left "Matchday" in black Inter with the matchday number as a superscript; top right, tiny:
 * HOME, V AWAY (exact names, home first), date · kick-off. NEYOD logo at the foot.
 */
export function Natfog({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  return (
    <NatFogFrame
      data={data}
      word={sentence(data.content.kicker || "Matchday")}
      sup={f.roundNo}
      lines={[fx.homeName.toUpperCase(), fx.awayName ? `V ${fx.awayName.toUpperCase()}` : "", [fx.date, fx.kickoff].filter(Boolean).join(" · ")]}
    />
  );
}

/**
 * Natural goal · névoa: his real celebration photo with a pale haze behind him and thin grid hairlines. Top
 * left "Goal" in black Inter; top right, tiny: his first name, last name and his club's exact name.
 */
export function Goalnatfog({ data }: { data: RenderData }) {
  const { content } = data;
  return <NatFogFrame data={data} word={sentence(content.kicker || "Goal")} sup="" lines={[(content.firstName || "").toUpperCase(), (content.lastName || "").toUpperCase(), ourClub(data).toUpperCase()]} />;
}
