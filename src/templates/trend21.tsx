/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { SideText, sideTextH } from "./natfree20";
import { caps, fit, fixtureOf, fullName, roundTitle, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/** Date · kick-off · ground under a panel, on a dark pill so it holds on any sky. */
function WhenPill({ data, k, ts }: { data: RenderData; k: number; ts: number }) {
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  if (!rows.length) return null;
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  return (
    <div style={{ marginTop: 20 * k, padding: `${8 * k}px ${20 * k}px`, borderRadius: 999, background: "rgba(10,12,16,.55)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
      {rows.map((l, i) => (
        <div key={i} style={{ ...caps(px, 0.16), fontWeight: 600, textShadow: "none" }}>{l}</div>
      ))}
    </div>
  );
}

function whenPillH(data: RenderData, k: number, ts: number) {
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  if (!rows.length) return 0;
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  return 20 * k + rows.length * px + (rows.length - 1) * 8 * k + 16 * k;
}

/* ---------------- Stone plaque (Pacaembu) ---------------- */

const STONE_INK = "#5f584c";
/** Letters cut into stone: lit lower edge, shadowed upper edge. */
const CUT = "0 1.5px 0 rgba(255,255,255,.75), 0 -1.5px 0 rgba(0,0,0,.32)";

/**
 * A pale stone tablet with Art Deco stepped corners and a cut border line, the type inscribed into it — after the
 * stone lettering of São Paulo's 1940 Pacaembu stadium that Naipe Foundry drew into its Pacaembu typeface.
 */
function Stone({ k, w, h, children }: { k: number; w: number; h: number; children: ReactNode }) {
  const st = 22 * k;
  const step = (x: number, y: number) => `${x}px ${y}px`;
  const clip = `polygon(${[
    step(st * 2, 0), step(w - st * 2, 0), step(w - st * 2, st), step(w - st, st), step(w - st, st * 2), step(w, st * 2),
    step(w, h - st * 2), step(w - st, h - st * 2), step(w - st, h - st), step(w - st * 2, h - st), step(w - st * 2, h),
    step(st * 2, h), step(st * 2, h - st), step(st, h - st), step(st, h - st * 2), step(0, h - st * 2),
    step(0, st * 2), step(st, st * 2), step(st, st), step(st * 2, st),
  ].join(", ")})`;
  return (
    <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 12px 30px rgba(0,0,0,.45))" }}>
      <div style={{ position: "absolute", inset: 0, clipPath: clip, background: "linear-gradient(170deg, #e9e4d8, #d6cfbf 55%, #c9c1af)" }}>
        <div style={{ position: "absolute", inset: 18 * k, border: `${2 * k}px solid rgba(0,0,0,.18)`, boxShadow: "0 1.5px 0 rgba(255,255,255,.6)" }} />
      </div>
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: STONE_INK }}>{children}</div>
    </div>
  );
}

const inscribed = (px: number, tracking: number, weight = 800) => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: CUT });

/**
 * Pedra gravada (matchday), after the inscribed Art Deco lettering of the Pacaembu stadium: MATCHDAY 14 and the fixture
 * cut into a stone tablet with stepped corners, date · kick-off · ground on a pill under it.
 */
export function Stoneplaque({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data).toUpperCase();
  const fixture = fixtureOf(data);
  const iw = W - 120 * k;
  const tPx = Math.min(56 * k * ts, iw / Math.max(1, title.length * 0.78));
  const fPx = fit(fixture, 26 * k * ts, iw, 0.14);
  const sh = 40 * k + tPx + (fixture ? 16 * k + fPx : 0) + 40 * k;
  const blockH = sh + whenPillH(data, k, ts);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <Stone k={k} w={W} h={sh}>
          <div style={inscribed(tPx, 0.14, 900)}>{title}</div>
          {fixture && <div style={{ ...inscribed(fPx, 0.14), marginTop: 16 * k }}>{fixture}</div>}
        </Stone>
        <WhenPill data={data} k={k} ts={ts} />
      </Shade>
    </Top>
  );
}

/** Golo · pedra gravada (goal): GOAL, his name and exact club inscribed in the same stone tablet. */
export function Goalstoneplaque({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const iw = W - 120 * k;
  const gPx = Math.min(96 * k * ts, iw / Math.max(1, word.length * 0.9));
  const nPx = fit(name, 30 * k * ts, iw, 0.12);
  const cPx = fit(club, 22 * k * ts, iw, 0.2);
  const sh = 56 * k + gPx + 22 * k + nPx + (club ? 14 * k + cPx : 0) + 56 * k;
  return (
    <Top data={data} blockH={sh} drop={310}>
      <Shade k={k} h={sh}>
        <Stone k={k} w={W} h={sh}>
          <div style={inscribed(gPx, 0.2, 900)}>{word}</div>
          <div style={{ ...inscribed(nPx, 0.12), marginTop: 22 * k }}>{name}</div>
          {club && <div style={{ ...inscribed(cPx, 0.2, 700), marginTop: 14 * k }}>{club}</div>}
        </Stone>
      </Shade>
    </Top>
  );
}

/* ---------------- Pitch-side field board (Toronto FC / ICON) ---------------- */

/** The club colour bright enough to glow on a black LED board (a dark navy lifts towards its light tint). */
function glowInk(data: RenderData) {
  let c = clubInk(data);
  for (let i = 0; i < 4 && luminance(c) < 0.32; i++) c = shade(c, 0.3);
  return c;
}

/**
 * A pitch-side perimeter board: a long black panel with a thin glowing edge, the club crest at its left end and the
 * message lit in the club's colour and white — after the matchday field boards ICON made for Toronto FC.
 */
function Board({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const crest = data.club?.crestUrl;
  const glow = glowInk(data);
  const cs = h - 36 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 10 * k, background: "linear-gradient(to bottom, #15181d, #07080a)", border: `${4 * k}px solid #2b2f36`, boxSizing: "border-box", boxShadow: `0 14px 34px rgba(0,0,0,.5), 0 0 ${24 * k}px ${glow}55`, display: "flex", alignItems: "center", gap: 26 * k, padding: `0 ${30 * k}px` }}>
      <div style={{ position: "absolute", left: 14 * k, right: 14 * k, top: 6 * k, height: 3 * k, borderRadius: 3 * k, background: glow, opacity: 0.85 }} />
      {crest && <img src={crest} alt="" style={{ width: cs, height: cs, objectFit: "contain", flexShrink: 0 }} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>{children}</div>
    </div>
  );
}

/**
 * Placard de campo (matchday): MATCHDAY 14 glowing in the club's colour and the fixture in white on a pitch-side board
 * with the crest at its end; date · kick-off · ground on a pill under it.
 */
export function Fieldboard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const glow = glowInk(data);
  const title = roundTitle(data).toUpperCase();
  const fixture = fixtureOf(data);
  const bh = 170 * k;
  const iw = W - 60 * k - (data.club?.crestUrl ? bh - 36 * k + 26 * k : 0);
  const tPx = Math.min(70 * k * ts, iw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 26 * k * ts, iw, 0.08);
  const blockH = bh + whenPillH(data, k, ts);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <Board data={data} k={k} w={W} h={bh}>
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", color: glow, textShadow: `0 0 ${14 * k}px ${glow}88` }}>{title}</div>
          {fixture && <div style={{ ...caps(fPx, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: 12 * k, textShadow: "none" }}>{fixture}</div>}
        </Board>
        <WhenPill data={data} k={k} ts={ts} />
      </Shade>
    </Top>
  );
}

/** Golo · placard de campo (goal): GOAL glowing in the club's colour and his name in white on the board, his exact club under it. */
export function Goalfieldboard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const glow = glowInk(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const bh = 180 * k;
  const iw = W - 60 * k - (data.club?.crestUrl ? bh - 36 * k + 26 * k : 0);
  const gPx = Math.min(84 * k * ts, iw / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 28 * k * ts, iw, 0.08);
  const cPx = fit(club, 22 * k * ts, W * 0.9, 0.18);
  const blockH = bh + (club ? 22 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Board data={data} k={k} w={W} h={bh}>
          <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", color: glow, textShadow: `0 0 ${14 * k}px ${glow}88` }}>{word}</div>
          <div style={{ ...caps(nPx, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: 12 * k, textShadow: "none" }}>{name}</div>
        </Board>
        {club && <div style={{ ...caps(cPx, 0.18), fontWeight: 700, marginTop: 22 * k }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/* ---------------- Stadium seat (Johan Cruijff ArenA / VBAT) ---------------- */

/**
 * A fold-down stadium seat seen from the front, in neutral white plastic: his shirt number large on the backrest
 * the way stadium wayfinding sets seat and block numbers (VBAT's numerals for the Johan Cruijff ArenA). Without a
 * shirt number on his profile, his club's crest sits on the backrest instead.
 */
function Seat({ data, w, k }: { data: RenderData; w: number; k: number }) {
  const num = (data.player.number || "").replace(/\D/g, "");
  const crest = data.club?.crestUrl;
  const bh = w * 1.0;
  return (
    <div style={{ position: "relative", width: w, height: bh + w * 0.42, flexShrink: 0, filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      {[0.16, 0.76].map((x) => (
        <div key={x} style={{ position: "absolute", left: w * x, top: bh * 0.6, width: w * 0.08, height: bh * 0.4 + w * 0.42, borderRadius: w * 0.02, background: "#2a2e35", border: `${2 * k}px solid #fff`, boxSizing: "border-box" }} />
      ))}
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: bh, borderRadius: `${w * 0.22}px ${w * 0.22}px ${w * 0.1}px ${w * 0.1}px`, background: "linear-gradient(to bottom, #fbfbf9, #dcdcd8)", border: `${4 * k}px solid #fff`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {num ? (
          <div style={{ fontFamily: DISPLAY, fontSize: w * (num.length > 1 ? 0.56 : 0.64), lineHeight: 1, color: "#16181d" }}>{num}</div>
        ) : (
          crest && <img src={crest} alt="" style={{ width: w * 0.62, height: w * 0.62, objectFit: "contain" }} />
        )}
      </div>
      <div style={{ position: "absolute", left: -w * 0.04, top: bh + w * 0.04, width: w * 1.08, height: w * 0.18, borderRadius: w * 0.06, background: "linear-gradient(to bottom, #d2d2ce, #a9a9a4)", border: `${3 * k}px solid #fff`, boxSizing: "border-box" }} />
    </div>
  );
}

/** Lugar (matchday): a stadium seat with his shirt number on the backrest beside MATCHDAY 14, the fixture and date · kick-off · ground. */
export function Seatnumber({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const sw = 160 * k;
  const gap = 40 * k;
  const tw = W - sw - gap;
  const blockH = Math.max(sw * 1.42, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Seat data={data} w={sw} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}
