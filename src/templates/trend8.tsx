/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { positionWords } from "./natfree8";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
const roundTitle = (data: RenderData) => {
  const f = matchFacts(data);
  const k = (data.content.kicker || "Matchday").toUpperCase();
  return f.roundNo ? `${k} ${f.roundNo}` : k;
};
const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();

/** The type block above his head, on its own soft shade; he stands below it. */
function TopFrame({ data, blockH, children }: { data: RenderData; blockH: number; children: ReactNode }) {
  const { H, story, top, fx: faceX } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </PoolFrame>
  );
}

/** Where his position sits in a 4-3-3 drawn left to right (attacking right): x, y as shares of the pitch. */
const SLOTS: Record<string, [number, number]> = {
  GK: [0.07, 0.5],
  LB: [0.25, 0.16],
  LCB: [0.22, 0.38],
  RCB: [0.22, 0.62],
  RB: [0.25, 0.84],
  LCM: [0.46, 0.28],
  CM: [0.42, 0.5],
  RCM: [0.46, 0.72],
  LW: [0.7, 0.18],
  ST: [0.76, 0.5],
  RW: [0.7, 0.82],
};
function slotOf(pos: string): string | null {
  const w = positionWords(pos);
  return ({ GOALKEEPER: "GK", "LEFT BACK": "LB", "CENTRE BACK": "LCB", "RIGHT BACK": "RB", "DEFENSIVE MIDFIELDER": "CM", "CENTRAL MIDFIELDER": "CM", "ATTACKING MIDFIELDER": "CM", "LEFT WINGER": "LW", "RIGHT WINGER": "RW", WINGER: "RW", STRIKER: "ST" } as Record<string, string>)[w] ?? null;
}

/**
 * The team sheet as a minimal diagram (fan-made World Cup "matchday team sheet": abstract eleven, editable
 * name areas): a pitch in hairlines, eleven small rings in a 4-3-3, his own place filled in the club's
 * colour with his shirt number, his position written right under the pitch.
 */
function LineupPitch({ data, w, k, pulse = false }: { data: RenderData; w: number; k: number; pulse?: boolean }) {
  const h = w * (68 / 105);
  const mine = slotOf(data.player.position);
  const ring = w * 0.05;
  const me = w * 0.16;
  const ink = clubInk(data);
  const line = "rgba(255,255,255,.8)";
  return (
    <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.35))" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke={line} strokeWidth={2}>
          <rect x={1} y={1} width={w - 2} height={h - 2} />
          <line x1={w / 2} y1={1} x2={w / 2} y2={h - 1} />
          <circle cx={w / 2} cy={h / 2} r={h * 0.13} />
          <rect x={1} y={h * 0.22} width={w * 0.15} height={h * 0.56} />
          <rect x={w - 1 - w * 0.15} y={h * 0.22} width={w * 0.15} height={h * 0.56} />
        </g>
      </svg>
      {Object.entries(SLOTS).map(([id, [x, y]]) => {
        const his = id === mine;
        const s = his ? me : ring;
        return (
          <div key={id} style={{ position: "absolute", left: x * w - s / 2, top: y * h - s / 2, width: s, height: s, borderRadius: "50%", boxSizing: "border-box", border: his ? `${3 * k}px solid #fff` : `${2.5 * k}px solid rgba(255,255,255,.85)`, background: his ? ink : "rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: me * 0.46, color: "#fff", boxShadow: his && pulse ? `0 0 0 ${10 * k}px rgba(255,255,255,.18), 0 0 0 ${20 * k}px rgba(255,255,255,.08)` : undefined }}>
            {his ? data.player.number : ""}
          </div>
        );
      })}
    </div>
  );
}

/** Ficha de equipa (matchday): MATCHDAY 14, the pitch with his place, his position, then the fixture and date · kick-off · ground. */
export function Lineupdots({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const pw = 250 * k;
  const ph = pw * (68 / 105);
  const role = positionWords(data.player.position);
  const head = [roundTitle(data), role].filter(Boolean).join("  ·  ");
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = fit(head, 26 * k * ts, W, 0.24);
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const sPx = fit(when, 21 * k * ts, W, 0.16);
  const blockH = tPx + 24 * k + ph + 30 * k + fPx + 16 * k + sPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={{ ...caps(tPx, 0.24), fontWeight: 800 }}>{head}</div>
      <div style={{ marginTop: 24 * k }}>
        <LineupPitch data={data} w={pw} k={k} />
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 30 * k }}>{fixture}</div>}
      {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.94 }}>{when}</div>}
    </TopFrame>
  );
}

/** Golo · ficha de equipa (goal): GOAL in Anton, the pitch with his place ringed like a ripple, his name and exact club. */
export function Goallineupdots({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const pw = 240 * k;
  const ph = pw * (68 / 105);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(64 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 28 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = gPx + 22 * k + ph + 26 * k + nPx + 12 * k + cPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ marginTop: 22 * k }}>
        <LineupPitch data={data} w={pw} k={k} pulse />
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
    </TopFrame>
  );
}

/** Line icon for the part of the day the game kicks off in: sun, low sun on the horizon, or moon. */
function SkyIcon({ phase, size }: { phase: "day" | "dusk" | "night"; size: number }) {
  const st = { fill: "none", stroke: "#fff", strokeWidth: 2.6, strokeLinecap: "round" as const };
  const rays = (cx: number, cy: number, r0: number, r1: number, from: number, to: number) =>
    Array.from({ length: 9 }, (_, i) => from + ((to - from) * i) / 8).map((a, i) => {
      const t = (a * Math.PI) / 180;
      return <line key={i} x1={cx + Math.cos(t) * r0} y1={cy + Math.sin(t) * r0} x2={cx + Math.cos(t) * r1} y2={cy + Math.sin(t) * r1} {...st} />;
    });
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))", overflow: "visible" }}>
      {phase === "day" && (
        <>
          <circle cx={30} cy={30} r={11} {...st} />
          {rays(30, 30, 17, 24, 0, 320)}
        </>
      )}
      {phase === "dusk" && (
        <>
          <path d="M 17 40 A 13 13 0 0 1 43 40" {...st} />
          {rays(30, 40, 18, 25, 180, 360)}
          <line x1={6} y1={40} x2={54} y2={40} {...st} />
          <line x1={14} y1={48} x2={46} y2={48} {...st} opacity={0.6} />
        </>
      )}
      {phase === "night" && (
        <>
          <path d="M 36 10 A 20 20 0 1 0 50 38 A 16 16 0 1 1 36 10 Z" {...st} />
          <circle cx={47} cy={14} r={1.6} fill="#fff" />
          <circle cx={54} cy={24} r={1.2} fill="#fff" />
        </>
      )}
    </svg>
  );
}

/**
 * Hora do jogo (matchday) — after CD Leganés' match posters, each built on a concept from the game itself (a
 * sleeping bat for a noon kick-off): the kick-off's part of the day as a single line icon above his head —
 * sun, low sun or moon — with "EVENING KICK-OFF" and the time (Portugal's next to it), then the fixture.
 */
export function Daynight({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const hour = Number(/^(\d{1,2}):/.exec(fx.time)?.[1] ?? NaN);
  const phase = Number.isNaN(hour) ? null : hour < 16 ? "day" : hour < 18 ? "dusk" : "night";
  const word = phase === "day" ? "AFTERNOON KICK-OFF" : phase === "dusk" ? "EVENING KICK-OFF" : phase === "night" ? "NIGHT KICK-OFF" : roundTitle(data);
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const under = [roundTitle(data), fx.date, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const icon = 130 * k;
  const wPx = fit(word, 26 * k * ts, W, 0.3);
  const tPx = Math.min(56 * k * ts, W / Math.max(1, fx.kickoff.length * 0.5));
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const sPx = fit(under, 21 * k * ts, W, 0.16);
  const blockH = (phase ? icon + 26 * k : 0) + wPx + (fx.kickoff ? 18 * k + tPx : 0) + 30 * k + fPx + 16 * k + sPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      {phase && <SkyIcon phase={phase} size={icon} />}
      <div style={{ ...caps(wPx, 0.3), fontWeight: 800, marginTop: phase ? 26 * k : 0 }}>{word}</div>
      {fx.kickoff && <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 18 * k, textShadow: SHADOW }}>{fx.kickoff}</div>}
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 30 * k }}>{fixture}</div>}
      {under && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.94 }}>{under}</div>}
    </TopFrame>
  );
}

/** A bright, saturated version of the club colour for the glow (never near-black or washed out). */
function neonOf(data: RenderData): string {
  let c = vivid(data.params.primary === "#10131c" ? data.params.accent : data.params.primary);
  if (luminance(c) < 0.25) c = shade(c, 0.5);
  if (luminance(c) > 0.85) c = vivid(data.params.accent);
  return c;
}

/** Brushed chrome: light steel with a dark band across the middle, as on a polished badge. */
const CHROME = "linear-gradient(180deg, #ffffff 0%, #e4e9ee 30%, #8d97a2 50%, #f4f7fa 64%, #b9c2cb 100%)";
const chromeType = (px: number, glow: string): CSSProperties => ({
  fontFamily: DISPLAY,
  fontSize: px,
  lineHeight: 1.05,
  whiteSpace: "nowrap",
  backgroundImage: CHROME,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: `drop-shadow(0 0 ${px * 0.12}px ${glow}) drop-shadow(0 3px 10px rgba(0,0,0,.5))`,
});

/**
 * Cromado (matchday) — after Nomad's identity for Manchester City Women (vibrant colour, neon tones and chrome
 * accents): MATCHDAY 14 in polished chrome with a soft neon halo in the club's colour, the crests and the
 * fixture, then date · kick-off · ground in plain white.
 */
export function Chromeaccent({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const title = roundTitle(data);
  const tPx = Math.min(112 * k * ts, W / Math.max(1, title.length * 0.44));
  const crest = 60 * k;
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const nPx = Math.min(26 * k * ts, (W - 2 * crest - 40 * k) / Math.max(1, capsEm(fixture, 0.08)));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(when, 21 * k * ts, W, 0.16);
  const blockH = tPx * 1.05 + 30 * k + crest + 22 * k + sPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={chromeType(tPx, neonOf(data))}>{title}</div>
      {fixture && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 30 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
          <div style={{ ...caps(nPx, 0.08), fontWeight: 800, paddingLeft: 0 }}>{fixture}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
        </div>
      )}
      {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 22 * k, opacity: 0.94 }}>{when}</div>}
    </TopFrame>
  );
}

/** Golo · cromado (goal): GOAL in polished chrome with the club-colour halo, his name and exact club under it. */
export function Goalchromeaccent({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(170 * k * ts, W / Math.max(1, word.length * 0.46));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = gPx * 1.05 + 26 * k + nPx + 14 * k + cPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={chromeType(gPx, neonOf(data))}>{word}</div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
    </TopFrame>
  );
}
