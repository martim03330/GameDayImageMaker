/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, aboveHead, capsEm, natFixture, natPlace, pickTextSpot } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/**
 * Natural · parapeito (matchday): his real photo full-bleed, untouched, and one hairline across the width like a
 * window sill. Above it "MATCHDAY 14" on the left and date · kick-off on the right; below it both crests and
 * HOME v AWAY (exact names). The sill sits above his head when the photo has room there, else at the foot —
 * whichever covers the least of him and the other players (pickTextSpot); at the foot over someone it gets a
 * dark panel of its own. The NEYOD logo centred at the bottom.
 */
export function Natsill({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 60;
  const fx = natFixture(data);
  const f = matchFacts(data);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 430 : 650, fy: story ? 640 : 430, fs: story ? 220 : 150 });

  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  const left = f.roundNo ? `${kicker} ${f.roundNo}` : kicker;
  const right = [fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const teams = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : "";
  const crest = 50 * k;
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M - 40) / 2 / Math.max(1, capsEm(right, 0.14)));
  const tPx = Math.min(22 * k * ts, (CANVAS_W - 2 * M - 2 * crest - 60) / Math.max(1, capsEm(teams, 0.08)));

  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoTop = bottom - logoH - (params.logoY ?? 0);
  // The block, top-down: labels, hairline, crests and teams.
  const blockH = lPx + 16 * k + 24 * k + crest;
  const foot = { x0: M, y0: bottom - logoH - 44 * k - blockH, x1: CANVAS_W - M, y1: bottom - logoH - 44 * k };
  const over = aboveHead(place, (story ? STORY_TOP : 44) + 20 * k, blockH, M, CANVAS_W - M);
  const spot = pickTextSpot(place, over ? [over, foot] : [foot]);
  const atFoot = spot.rect === foot;
  const labelTop = spot.rect.y0;
  const hair = labelTop + lPx + 16 * k;
  const rowTop = hair + 24 * k;
  const small = { position: "absolute" as const, top: labelTop, fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#24301f", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {atFoot ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: labelTop - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.42) 45%, rgba(0,0,0,.5))" }} />
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: rowTop + crest + 140 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.3) 60%, rgba(0,0,0,0))" }} />
      )}
      {atFoot && spot.crowded && <div style={{ position: "absolute", left: M - 28, right: M - 28, top: labelTop - 26 * k, height: blockH + 52 * k, borderRadius: 14 * k, background: "rgba(10,14,12,.58)" }} />}
      {story && atFoot && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: STORY_TOP + 60, background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,0))" }} />}

      <div style={{ ...small, left: M }}>{left}</div>
      <div style={{ ...small, right: M }}>{right}</div>
      <div style={{ position: "absolute", left: M, right: M, top: hair, height: 1.5, background: OFF_WHITE, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: M, right: M, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
        {teams && <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: tPx, letterSpacing: "0.08em", whiteSpace: "nowrap", textShadow: SHADOW }}>{teams}</div>}
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
