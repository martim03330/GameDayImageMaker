/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_W, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
const roundTitle = (data: RenderData) => {
  const f = matchFacts(data);
  const k = (data.content.kicker || "Matchday").toUpperCase();
  return f.roundNo ? `${k} ${f.roundNo}` : k;
};

/** A club colour that reads on the dark shade: too dark ones are lifted, never left navy-on-black. */
function inkOnDark(c: string) {
  const v = vivid(c);
  return luminance(v) < 0.3 ? shade(v, 0.45) : v;
}

/** The two club colours, deep enough for white type on them. */
function duo(data: RenderData): [string, string] {
  const deep = (c: string) => {
    const v = vivid(c);
    return luminance(v) > 0.4 ? shade(v, -0.45) : v;
  };
  const a = deep(data.params.primary === "#10131c" ? data.params.accent : data.params.primary);
  let b = deep(data.params.accent);
  if (b.toLowerCase() === a.toLowerCase()) b = shade(a, -0.4);
  return [a, b];
}

/**
 * Aston Villa's US social pack (the two club colours as one moving gradient, bold type, sleek layouts):
 * the top of his photo washed in a sideways gradient of both club colours, fading into the real ground well
 * above his head; the type white and bold in it.
 */
function WashFrame({ data, blockH, children }: { data: RenderData; blockH: number; children: ReactNode }) {
  const { H, story, top, fx: faceX } = frameOf(data);
  const [a, b] = duo(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  const washH = top + blockH + (story ? 150 : 110);
  const fade = "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)";
  return (
    <PoolFrame data={data} place={place} H={H} pool={null}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: washH, background: `linear-gradient(100deg, ${a}, ${b})`, opacity: 0.88, WebkitMaskImage: fade, maskImage: fade }} />
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </PoolFrame>
  );
}

/** Gradiente do clube (matchday): MATCHDAY 14 heavy and condensed, both crests with the fixture, then date · kick-off · ground. */
export function Gradwash({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const title = roundTitle(data);
  const tPx = Math.min(104 * k * ts, W / Math.max(1, title.length * 0.42));
  const crest = 56 * k;
  const fixture = `${fx.homeName} v ${fx.awayName}`.toUpperCase();
  const nPx = Math.min(24 * k * ts, (W - 2 * crest - 40 * k) / Math.max(1, capsEm(fixture, 0.08)));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = tPx + 30 * k + crest + 22 * k + sPx;
  return (
    <WashFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {fx.homeName && fx.awayName && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 30 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          <div style={{ ...caps(nPx, 0.08), fontWeight: 800, paddingLeft: 0 }}>{fixture}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
        </div>
      )}
      {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 22 * k, opacity: 0.95 }}>{when}</div>}
    </WashFrame>
  );
}

/** Golo · gradiente do clube (goal): the same two-colour wash, GOAL heavy and condensed, his name and his club. */
export function Goalgradwash({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data).toUpperCase();
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.42));
  const nPx = fit(name, 30 * k * ts, W, 0.1);
  const cPx = fit(club, 20 * k * ts, W, 0.22);
  const blockH = gPx + 24 * k + nPx + 14 * k + cPx;
  return (
    <WashFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ ...caps(nPx, 0.1), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.95 }}>{club}</div>}
    </WashFrame>
  );
}

/**
 * Swiss poster type (CapCut's matchday guide: Swiss style, balanced hierarchy, a lot of negative space): one
 * flush-left block above his head, ragged right, a small square in the club colour as its only ornament.
 */
function SwissFrame({ data, blockH, children }: { data: RenderData; blockH: number; children: ReactNode }) {
  const { H, story, top, fx: faceX } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: -80, y: top - 140, w: CANVAS_W + 60, h: blockH + 260 }}>
      <div style={{ position: "absolute", left: 72, right: 72, top, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>{children}</div>
    </PoolFrame>
  );
}

const left = (px: number, tracking: number): CSSProperties => ({ ...caps(px, tracking), paddingLeft: 0 });

/** Suíço (matchday): the square, MATCHDAY 14 heavy, the fixture, then date · kick-off and the ground on lines of their own. */
export function Swissleft({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 144;
  const title = roundTitle(data);
  const tPx = fit(title, 70 * k * ts, W, 0.02);
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const fPx = fit(fixture, 26 * k * ts, W, 0.06);
  const when = [fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(when, 22 * k * ts, W, 0.12);
  const vPx = fit(fx.venue.toUpperCase(), 20 * k * ts, W, 0.12);
  const sq = 22 * k;
  const blockH = sq + 26 * k + tPx + 30 * k + fPx + 18 * k + sPx + (fx.venue ? 12 * k + vPx : 0);
  return (
    <SwissFrame data={data} blockH={blockH}>
      <div style={{ width: sq, height: sq, background: inkOnDark(data.params.primary === "#10131c" ? data.params.accent : data.params.primary), boxShadow: "0 2px 8px rgba(0,0,0,.35)" }} />
      <div style={{ ...left(tPx, 0.02), fontWeight: 900, marginTop: 26 * k }}>{title}</div>
      {fixture && <div style={{ ...left(fPx, 0.06), fontWeight: 700, marginTop: 30 * k }}>{fixture}</div>}
      {when && <div style={{ ...left(sPx, 0.12), fontWeight: 600, marginTop: 18 * k, opacity: 0.92 }}>{when}</div>}
      {fx.venue && <div style={{ ...left(vPx, 0.12), fontWeight: 500, marginTop: 12 * k, opacity: 0.85 }}>{fx.venue.toUpperCase()}</div>}
    </SwissFrame>
  );
}

/** Golo · suíço (goal): the square, GOAL heavy, his name and his club flush left. */
export function Goalswissleft({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 144;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data).toUpperCase();
  const club = ourClub(data).toUpperCase();
  const gPx = fit(word, 110 * k * ts, W, 0.02);
  const nPx = fit(name, 32 * k * ts, W, 0.06);
  const cPx = fit(club, 22 * k * ts, W, 0.16);
  const sq = 22 * k;
  const blockH = sq + 26 * k + gPx + 28 * k + nPx + 14 * k + cPx;
  return (
    <SwissFrame data={data} blockH={blockH}>
      <div style={{ width: sq, height: sq, background: inkOnDark(data.params.primary === "#10131c" ? data.params.accent : data.params.primary), boxShadow: "0 2px 8px rgba(0,0,0,.35)" }} />
      <div style={{ ...left(gPx, 0.02), fontWeight: 900, marginTop: 26 * k }}>{word}</div>
      <div style={{ ...left(nPx, 0.06), fontWeight: 800, marginTop: 28 * k }}>{name}</div>
      {club && <div style={{ ...left(cPx, 0.16), fontWeight: 600, marginTop: 14 * k, opacity: 0.92 }}>{club}</div>}
    </SwissFrame>
  );
}

/**
 * Índice (matchday) — the same Swiss guide: the game as a numbered index, flush left — 01 the fixture, 02 the
 * date, 03 the kick-off, 04 the ground — the numbers in the club colour (lifted when too dark to read).
 */
export function Swissindex({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 144;
  const ink = inkOnDark(data.params.primary === "#10131c" ? data.params.accent : data.params.primary);
  const rows = [fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}` : "", fx.date, fx.kickoff, fx.venue].filter(Boolean).map((t) => t.toUpperCase());
  const numW = 64 * k;
  const rPx = Math.min(...rows.map((t) => fit(t, 28 * k * ts, W - numW, 0.08)));
  const title = roundTitle(data);
  const hPx = fit(title, 24 * k * ts, W, 0.34);
  const step = rPx + 22 * k;
  const blockH = hPx + 30 * k + rows.length * step;
  return (
    <SwissFrame data={data} blockH={blockH}>
      <div style={{ ...left(hPx, 0.34), fontWeight: 700, opacity: 0.92 }}>{title}</div>
      <div style={{ width: W, height: 2, background: "rgba(255,255,255,.75)", marginTop: 18 * k, marginBottom: 12 * k }} />
      {rows.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", marginTop: i ? 22 * k : 0 }}>
          <div style={{ ...left(rPx, 0.04), width: numW, fontWeight: 800, color: ink }}>{String(i + 1).padStart(2, "0")}</div>
          <div style={{ ...left(rPx, 0.08), fontWeight: i === 0 ? 800 : 600 }}>{t}</div>
        </div>
      ))}
    </SwissFrame>
  );
}
