/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const HEAVY = "var(--font-archivo-black), 'Arial Black', sans-serif";
const SHADOW = "0 2px 4px rgba(0,0,0,.45), 0 4px 30px rgba(0,0,0,.45)";

/**
 * The shared frame of the "starring" natural looks (reference: "FRIDAY NIGHT LIGHTS — STARRING …"): his real
 * photo, the surroundings muted and sunk (low saturation, NatSpot) so he alone keeps full colour and light,
 * standing smaller in the lower half. Above him the title stacked in heavy caps, centred, and one line of
 * wide-tracked condensed caps under it ("STARRING FIRST LAST"). A tiny fixture line and the NEYOD logo at the foot.
 */
export function NatStarringFrame({ data, title, starring, foot }: { data: RenderData; title: string[]; starring: string; foot: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 76 : 70;
  const maxW = CANVAS_W - 2 * M;

  const top = (story ? STORY_TOP + 10 : 96) - (params.textY ?? 0);
  // Archivo Black capitals are ~0.8em wide; every stacked line gets the same size (the widest one decides).
  const longest = Math.max(...title.map((t) => t.length), 1);
  const tPx = Math.min(134 * k * ts, (maxW * 0.86) / (longest * 0.8));
  const sPx = Math.min(27 * k * ts, maxW / Math.max(1, capsEm(starring, 0.32) * 0.82));
  const titleH = title.length * tPx * 0.92;
  const sTop = top + titleH + 26 * k;
  const blockBottom = sTop + sPx;

  // He stands under the title, smaller than in other looks: the poster is about the stage around him.
  const fs = story ? 150 : 112;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: blockBottom + 60 * k + fs * 0.85, fs });

  const footY = (story ? STORY_BOTTOM : H - 52) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const fPx = Math.min(16 * k * ts, maxW / Math.max(1, capsEm(foot, 0.22)));
  const centred = { position: "absolute" as const, left: 0, width: CANVAS_W, textAlign: "center" as const, lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#111", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "saturate(.45) brightness(.82) contrast(1.08)" }} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.35} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: blockBottom + 260 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.3) 60%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 360 : 260, background: "linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />

      {title.map((t, i) => (
        <div key={t + i} style={{ ...centred, top: top + i * tPx * 0.92, fontFamily: HEAVY, fontSize: tPx, letterSpacing: "-0.01em" }}>
          {t}
        </div>
      ))}
      <div style={{ ...centred, top: sTop, paddingLeft: "0.32em", boxSizing: "border-box", fontFamily: CONDENSED, fontWeight: 600, fontSize: sPx, letterSpacing: "0.32em" }}>{starring}</div>

      {foot && <div style={{ ...centred, top: footY - logoH - 26 * k - fPx, paddingLeft: "0.22em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 600, fontSize: fPx, letterSpacing: "0.22em", opacity: 0.85 }}>{foot}</div>}
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/** "MATCHDAY" → ["MATCH", "DAY"]: the reference's stacked heavy title. Other titles stay whole. */
function stack(word: string): string[] {
  const w = word.toUpperCase();
  return /^MATCHDAY$/.test(w) ? ["MATCH", "DAY"] : /^GAME ?DAY$/.test(w) ? ["GAME", "DAY"] : [w];
}

/**
 * Natural · starring (matchday): his real photo with muted, sunk surroundings so he alone is in full colour;
 * above him "MATCH / DAY" stacked in heavy caps and "STARRING FIRST LAST" in wide condensed caps; at the foot
 * HOME V AWAY · date · kick-off (exact names, home first), tiny. NEYOD logo alone.
 */
export function Natstarring({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} V ${fx.awayName.toUpperCase()}` : "";
  return <NatStarringFrame data={data} title={stack(data.content.kicker || "Matchday")} starring={`STARRING ${name}`} foot={[match, fx.date, fx.kickoff].filter(Boolean).join("  ·  ")} />;
}

/**
 * Natural goal · starring: his real celebration photo, muted sunk surroundings; above him "GOAL" in heavy
 * caps and "SCORED BY FIRST LAST" in wide condensed caps; his club's exact name tiny at the foot. No score.
 */
export function Goalnatstarring({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatStarringFrame data={data} title={stack(data.content.kicker || "Goal")} starring={`SCORED BY ${name}`} foot={ourClub(data).toUpperCase()} />;
}
