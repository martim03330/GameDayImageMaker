/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
const pool = (top: number, blockH: number) => ({ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 });

/**
 * Box Out Sports' "Curves" gameday series, kept to one line: a thin arc in the club's colour spans the frame
 * above his head, the type hanging under its crown. He stands lower, the arc never crosses him.
 */
function ArcFrame({ data, blockH, children }: { data: RenderData; blockH: number; children: ReactNode }) {
  const { H, story, k, fx: faceX, top } = frameOf(data);
  const crown = top;
  const sag = 110 * k;
  // The type starts below where the arc runs at the title's edges.
  const textTop = crown + 70 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: textTop + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(textTop, blockH)}>
      <svg width={CANVAS_W} height={crown + sag + 10} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.4))" }}>
        <path d={`M -20 ${crown + sag} Q ${CANVAS_W / 2} ${crown - sag} ${CANVAS_W + 20} ${crown + sag}`} fill="none" stroke={clubInk(data)} strokeWidth={4 * k} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: textTop, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </PoolFrame>
  );
}

/**
 * Arco fino (matchday) — Box Out Sports "Curves" series: under the club-colour arc, MATCHDAY 14 in condensed
 * caps, both crests with the fixture (exact names), then the date · kick-off · ground.
 */
export function Thinarc({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = CANVAS_W - 120;
  const title = f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : (data.content.kicker || "Matchday").toUpperCase();
  const tPx = Math.min(84 * k * ts, W / Math.max(1, title.length * 0.42));
  const crest = 50 * k;
  const fixture = `${fx.homeName} v ${fx.awayName}`.toUpperCase();
  const nPx = Math.min(22 * k * ts, (W - 2 * crest - 40 * k) / Math.max(1, capsEm(fixture, 0.08)));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = tPx + 26 * k + crest + 20 * k + sPx;
  return (
    <ArcFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {fx.homeName && fx.awayName && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 26 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          <div style={{ ...caps(nPx, 0.08), fontWeight: 800, paddingLeft: 0 }}>{fixture}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
        </div>
      )}
      {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 20 * k, opacity: 0.9 }}>{when}</div>}
    </ArcFrame>
  );
}

/** Golo · arco fino (goal): the same club-colour arc, GOAL in condensed caps under it, his name and his club. */
export function Goalthinarc({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data).toUpperCase();
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(110 * k * ts, W / Math.max(1, word.length * 0.42));
  const nPx = fit(name, 28 * k * ts, W, 0.08);
  const cPx = fit(club, 20 * k * ts, W, 0.22);
  const blockH = gPx + 24 * k + nPx + 14 * k + cPx;
  return (
    <ArcFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ ...caps(nPx, 0.08), fontWeight: 900, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.9 }}>{club}</div>}
    </ArcFrame>
  );
}

/** Type above his head on a soft local shade; he stands lower. */
function TopFrame({ data, blockH, children }: { data: RenderData; blockH: number; children: ReactNode }) {
  const { H, story, fx: faceX, top } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </PoolFrame>
  );
}

/**
 * Título bicolor (matchday) — Anıl Aktan's Brentford concept (type and the club's colour doing all the work):
 * one heavy line, MATCHDAY in white and the round number in the club's colour, the fixture and the kick-off
 * under it in small caps.
 */
export function Bicolortitle({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const no = f.roundNo ?? "";
  const tPx = fit(`${word} ${no}`, 96 * k * ts, W, 0.01);
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const fPx = fit(fixture, 26 * k * ts, W, 0.08);
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = tPx + 28 * k + fPx + 16 * k + sPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: tPx, letterSpacing: "0.01em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>
        {word}
        {no && <span style={{ color: clubInk(data), textShadow: "0 2px 14px rgba(0,0,0,.35)" }}> {no}</span>}
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.08), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
      {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.9 }}>{when}</div>}
    </TopFrame>
  );
}

/**
 * Golo · bicolor (goal) — the same Brentford-style type: GOAL in heavy white caps, his surname right under it
 * in the club's colour at the same weight, his first name and his club's exact name in small caps.
 */
export function Goalbicolor({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const last = (data.content.lastName || data.content.firstName || "").toUpperCase();
  const first = data.content.lastName ? (data.content.firstName ?? "").toUpperCase() : "";
  const club = ourClub(data).toUpperCase();
  const px = Math.min(fit(word, 120 * k * ts, W, 0.01), fit(last, 120 * k * ts, W, 0.01));
  const small = [first, club].filter(Boolean).join("  ·  ");
  const sPx = fit(small, 22 * k * ts, W, 0.18);
  const blockH = px * 2 + 4 * k + 26 * k + sPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: px, letterSpacing: "0.01em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: px, letterSpacing: "0.01em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 4 * k, color: clubInk(data), textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>{last}</div>
      {small && <div style={{ ...caps(sPx, 0.18), fontWeight: 700, marginTop: 26 * k, opacity: 0.92 }}>{small}</div>}
    </TopFrame>
  );
}

/**
 * Próximo jogo (matchday) — the recurring "next up" structure of Hibernian FC's matchday graphics: "Next up"
 * in DM Serif with a short club-colour rule, the opponent's crest and exact name large, then the round, date,
 * kick-off and ground in small caps.
 */
export function Nextup({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = CANVAS_W - 120;
  const away = data.content.home === false;
  const opp = (away ? fx.homeName : fx.awayName) || f.opp || "";
  const oppCrest = away ? fx.homeCrest : fx.awayCrest;
  const label = away ? "Next up, away" : "Next up";
  const oPx = fit(`V ${opp.toUpperCase()}`, 52 * k * ts, W - 80 * k, 0.04);
  const crest = 60 * k;
  const facts = [f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : "", fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(facts, 20 * k * ts, W, 0.14);
  const blockH = 48 * k + 18 * k + 2 + 28 * k + Math.max(crest, oPx) + 26 * k + sPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: SERIF, fontSize: 48 * k * ts, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{label}</div>
      <div style={{ width: 90 * k, height: 3, background: clubInk(data), marginTop: 18 * k }} />
      {opp && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 28 * k }}>
          {oppCrest && <img src={oppCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          <div style={{ ...caps(oPx, 0.04), fontWeight: 900, paddingLeft: 0 }}>{`V ${opp.toUpperCase()}`}</div>
        </div>
      )}
      {facts && <div style={{ ...caps(sPx, 0.14), fontWeight: 600, marginTop: 26 * k, opacity: 0.9 }}>{facts}</div>}
    </TopFrame>
  );
}
