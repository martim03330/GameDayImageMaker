/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const roundLabel = (data: RenderData) => {
  const f = matchFacts(data);
  return f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
};
const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
/** The type's column: centred, 60px in from each side. */
const column = (top: number): CSSProperties => ({ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" });
const pool = (top: number, blockH: number) => ({ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 });

/**
 * Natural · casa/fora (matchday): above his head, HOME GAME or AWAY DAY in wide light caps (from which side
 * his club plays on), MATCHDAY 14 small over it, the fixture (exact names) and the kick-off with the ground.
 */
export function Nathomeaway({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const word = data.content.home === false ? "AWAY DAY" : "HOME GAME";
  const wPx = fit(word, 84 * k * ts, W, 0.22);
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const fPx = fit(fixture, 24 * k * ts, W, 0.08);
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = 20 * k + 26 * k + wPx + 30 * k + fPx + 16 * k + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ ...caps(fit(roundLabel(data), 20 * k * ts, W, 0.34), 0.34), opacity: 0.9 }}>{roundLabel(data)}</div>
        <div style={{ ...caps(wPx, 0.22), fontWeight: 200, marginTop: 26 * k }}>{word}</div>
        {fixture && <div style={{ ...caps(fPx, 0.08), fontWeight: 800, marginTop: 30 * k }}>{fixture}</div>}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.9 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · competição (matchday): the competition's own name leads, in DM Serif above his head, with the
 * round in small caps over it; both crests and the fixture under it, then the kick-off and the ground.
 */
export function Natcompetition({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = CANVAS_W - 120;
  const comp = f.comp || (data.content.kicker || "Matchday");
  const cPx = Math.min(64 * k * ts, W / Math.max(1, comp.length * 0.5));
  const round = f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : "";
  const crest = 52 * k;
  const fixture = `${fx.homeName} v ${fx.awayName}`.toUpperCase();
  const nPx = Math.min(22 * k * ts, (W - 2 * crest - 40 * k) / Math.max(1, capsEm(fixture, 0.08)));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = (round ? 20 * k + 22 * k : 0) + cPx + 30 * k + crest + 20 * k + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        {round && <div style={{ ...caps(20 * k * ts, 0.34), opacity: 0.9, marginBottom: 22 * k }}>{round}</div>}
        <div style={{ fontFamily: SERIF, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{comp}</div>
        {fx.homeName && fx.awayName && (
          <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 30 * k }}>
            {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
            <div style={{ ...caps(nPx, 0.08), fontWeight: 800, paddingLeft: 0 }}>{fixture}</div>
            {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          </div>
        )}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 20 * k, opacity: 0.9 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · seta (matchday): MATCHDAY 14, the fixture and the kick-off above his head, then a thin arrow
 * pointing down at him: the player the post is about.
 */
export function Natarrowdown({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const rPx = fit(roundLabel(data), 46 * k * ts, W, 0.12);
  const fPx = fit(fixture, 24 * k * ts, W, 0.08);
  const sPx = fit(when, 22 * k * ts, W, 0.16);
  const arrow = 96 * k;
  const blockH = rPx + 24 * k + fPx + 16 * k + sPx + 28 * k + arrow;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 210 : 150), fs: story ? 205 : 145 });
  // The arrow stands right over his head.
  const ax = Math.max(80, Math.min(CANVAS_W - 80, place.fx));
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ ...caps(rPx, 0.12), fontWeight: 900 }}>{roundLabel(data)}</div>
        {fixture && <div style={{ ...caps(fPx, 0.08), fontWeight: 700, marginTop: 24 * k }}>{fixture}</div>}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.9 }}>{when}</div>}
      </div>
      <svg width={24 * k} height={arrow} viewBox={`0 0 24 ${arrow / k}`} style={{ position: "absolute", left: ax - 12 * k, top: top + blockH - arrow, overflow: "visible", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
        <path d={`M12 0 V${arrow / k - 2} M3 ${arrow / k - 11} L12 ${arrow / k - 2} L21 ${arrow / k - 11}`} fill="none" stroke={OFF_WHITE} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </PoolFrame>
  );
}

/**
 * Golo natural · sublinhado (goal): GOAL in light wide caps above his head, underlined by a thick bar in his
 * club's colour, his name in heavy caps and his club's exact name under it.
 */
export function Goalnatclubbar({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data).toUpperCase();
  const club = ourClub(data).toUpperCase();
  const gPx = fit(word, 96 * k * ts, W, 0.3);
  const nPx = fit(name, 30 * k * ts, W, 0.08);
  const cPx = fit(club, 20 * k * ts, W, 0.22);
  const blockH = gPx + 18 * k + 10 * k + 32 * k + nPx + 14 * k + cPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ ...caps(gPx, 0.3), fontWeight: 200 }}>{word}</div>
        <div style={{ width: Math.min(W, capsEm(word, 0.3) * gPx), height: 10 * k, marginTop: 18 * k, background: clubInk(data), borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,.3)" }} />
        <div style={{ ...caps(nPx, 0.08), fontWeight: 900, marginTop: 32 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.9 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Golo natural · contexto (goal): GOAL and his name above his head, then the game it came in — his club v the
 * opponent (exact names, home first) and the date — so the post says where the goal was scored.
 */
export function Goalnatcontext({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const game = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : club;
  const line = [game, fx.date].filter(Boolean).join("  ·  ");
  const nPx = Math.min(70 * k * ts, W / Math.max(1, name.length * 0.5));
  const lPx = fit(line, 22 * k * ts, W, 0.14);
  const blockH = 22 * k + 22 * k + nPx + 24 * k + 2 + 24 * k + lPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ ...caps(22 * k * ts, 0.4), fontWeight: 800 }}>{word}</div>
        <div style={{ fontFamily: SERIF, fontSize: nPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 22 * k, textShadow: SHADOW }}>{name}</div>
        <div style={{ width: 120 * k, height: 2, background: clubInk(data), marginTop: 24 * k }} />
        {line && <div style={{ ...caps(lPx, 0.14), fontWeight: 700, marginTop: 24 * k, opacity: 0.92 }}>{line}</div>}
      </div>
    </PoolFrame>
  );
}
