/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const HEAVY = "var(--font-archivo-black), 'Arial Black', sans-serif";
const SHADOW = "0 2px 4px rgba(0,0,0,.35), 0 4px 24px rgba(0,0,0,.35)";

export type DuoFact = { big: string; small: string };

/**
 * The shared frame of the "duotone" natural looks (reference: the Chiefs "PLAYER OF THE WEEK" poster — the
 * whole scene tinted red, white heavy type stacked on the left, a name pill, stats stacked bottom right):
 * his real photo with the SURROUNDINGS in a duotone of his club's colour (black-and-white × colour) while he
 * keeps his own colours on the sharp figure layer. All the type on the side away from him: a tiny tracked
 * label, the title stacked in heavy white caps, an outlined pill; low on the same side two or three facts
 * stacked (big value, tiny label) above the NEYOD logo.
 */
export function NatDuoFrame({ data, label, lines, pill, facts }: { data: RenderData; label: string; lines: string[]; pill: string; facts: DuoFact[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 60;
  const colour = panelColour(params.primary, params.accent);
  const heLeft = params.side === "left";
  const fs = story ? 220 : 165;
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 380 : 700, fy: story ? 600 : 420, fs });
  const room = Math.max(360, heLeft ? CANVAS_W - M - (place.fx + 1.7 * place.faceW) : place.fx - 1.7 * place.faceW - M);
  const x0 = heLeft ? CANVAS_W - M - room : M;
  const align = heLeft ? "right" : "left";
  // Archivo Black caps ~0.8em a letter; all lines one size.
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const lPx = Math.min(96 * k * ts, room / (longest * 0.8));
  const top = (story ? STORY_TOP + 30 : 150) - (params.textY ?? 0);
  const labelPx = Math.min(16 * k, room / Math.max(1, capsEm(label, 0.32)));
  const titleTop = top + labelPx + 22 * k;
  const pillTop = titleTop + lines.length * lPx * 0.95 + 26 * k;
  const pillPx = Math.min(18 * k * ts, (room - 40) / Math.max(1, capsEm(pill, 0.06)));
  const footY = (story ? STORY_BOTTOM : H - 50) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const factGap = 18 * k;
  const factH = 66 * k;
  // The facts stand on the free side too (never over his legs), stacked above the logo.
  const factsTop = footY - logoH - 34 * k - facts.length * factH - (facts.length - 1) * factGap;
  const factSide = heLeft ? { right: M } : { left: M };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: colour, color: OFF_WHITE }}>
      {/* Duotone ground: black-and-white photo multiplied by the club colour, with the colour's own light lifted. */}
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "grayscale(1) contrast(1.15) brightness(1.05)" }} />
      <div style={{ position: "absolute", inset: 0, background: colour, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: colour, mixBlendMode: "screen", opacity: 0.18 }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${heLeft ? "left" : "right"}, rgba(0,0,0,.3), rgba(0,0,0,0) 55%)` }} />

      <div style={{ position: "absolute", left: x0, width: room, top, textAlign: align, fontFamily: SANS, fontWeight: 700, fontSize: labelPx, letterSpacing: "0.32em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, ...(align === "right" ? { marginRight: "-0.32em" } : {}) }}>{label}</div>
      {lines.map((l, i) => (
        <div key={l + i} style={{ position: "absolute", left: x0, width: room, top: titleTop + i * lPx * 0.95, textAlign: align, fontFamily: HEAVY, fontSize: lPx, lineHeight: 1, letterSpacing: "-0.015em", whiteSpace: "nowrap", textShadow: SHADOW }}>
          {l}
        </div>
      ))}
      {pill && (
        <div style={{ position: "absolute", left: x0, width: room, top: pillTop, textAlign: align }}>
          <span style={{ display: "inline-block", border: `2px solid ${OFF_WHITE}`, borderRadius: 999, padding: `${7 * k}px ${18 * k}px`, fontFamily: SANS, fontWeight: 700, fontSize: pillPx, letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{pill}</span>
        </div>
      )}
      {facts.map((f, i) => (
        <div key={f.small} style={{ position: "absolute", ...factSide, top: factsTop + i * (factH + factGap), textAlign: align, lineHeight: 1, textShadow: SHADOW }}>
          <div style={{ fontFamily: HEAVY, fontSize: 40 * k * ts, letterSpacing: "-0.01em" }}>{f.big}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12 * k, letterSpacing: "0.22em", marginTop: 8 * k, opacity: 0.9 }}>{f.small}</div>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: heLeft ? CANVAS_W - M - logoW : M, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: heLeft ? "right top" : "left top" }} />
    </div>
  );
}

/**
 * Natural · duotone (matchday): his real photo, the surroundings in a duotone of his club's colour, he in his
 * own colours. On the free side: the competition tiny, "MATCH / DAY" stacked in heavy white caps, a pill with
 * "V AWAY" (exact name); low on the same side, stacked: the date, the kick-off and the matchday number.
 */
export function Natduo({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  const w = (data.content.kicker || "Matchday").toUpperCase();
  const lines = w === "MATCHDAY" ? ["MATCH", "DAY"] : [w];
  const away = data.content.home === false ? fx.homeName : fx.awayName;
  const facts: DuoFact[] = [
    fx.date && { big: fx.date, small: "DATE" },
    fx.time && { big: fx.kickoff, small: "KICK-OFF" },
    f.roundNo && { big: f.roundNo, small: "MATCHDAY" },
  ].filter(Boolean) as DuoFact[];
  return <NatDuoFrame data={data} label={f.comp} lines={lines} pill={away ? `V ${away.toUpperCase()}` : ""} facts={facts} />;
}

/**
 * Natural goal · duotone: his real celebration photo, surroundings in his club's colour duotone, he in his
 * own colours; "GOAL" in heavy white caps with his club's exact name above and a pill with his full name.
 */
export function Goalnatduo({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatDuoFrame data={data} label={ourClub(data).toUpperCase()} lines={[(data.content.kicker || "Goal").toUpperCase()]} pill={name} facts={[]} />;
}
