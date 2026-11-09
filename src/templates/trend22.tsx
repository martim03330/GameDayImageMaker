/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { matchFacts } from "./strokes";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { SideText, sideTextH } from "./natfree20";
import { caps, fit, fixtureOf, fullName, roundTitle, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const SERIF = "var(--font-fraunces), Georgia, serif";

/* ---------------- Marquee sign (VfB Stuttgart / the Concordia hotel sign) ---------------- */

const BULB = "#fff3cf";

/**
 * An old hotel sign: a dark board ringed with warm lit bulbs, the lettering glowing white — after the Concordia hotel
 * sign VfB Stuttgart's custom typeface (by Societas) was drawn from, the hotel where the club's 1893 roots meet.
 */
function Marquee({ k, w, h, children }: { k: number; w: number; h: number; children: ReactNode }) {
  const m = 20 * k;
  const step = 38 * k;
  const nx = Math.max(2, Math.round((w - 2 * m) / step));
  const ny = Math.max(1, Math.round((h - 2 * m) / step));
  const bulbs: { x: number; y: number }[] = [];
  for (let i = 0; i <= nx; i++) {
    const x = m + ((w - 2 * m) * i) / nx;
    bulbs.push({ x, y: m }, { x, y: h - m });
  }
  for (let j = 1; j < ny; j++) {
    const y = m + ((h - 2 * m) * j) / ny;
    bulbs.push({ x: m, y }, { x: w - m, y });
  }
  const r = 7 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 18 * k, background: "linear-gradient(to bottom, #1d1813, #0d0b09)", border: `${3 * k}px solid #3c3227`, boxSizing: "border-box", boxShadow: "0 16px 36px rgba(0,0,0,.55)" }}>
      {bulbs.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x - r - 3 * k, top: b.y - r - 3 * k, width: 2 * r, height: 2 * r, borderRadius: "50%", background: BULB, boxShadow: `0 0 ${10 * k}px ${3 * k}px rgba(255,228,160,.75)` }} />
      ))}
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fffaf0" }}>{children}</div>
    </div>
  );
}

const lit = "0 0 10px rgba(255,236,190,.65), 0 0 2px rgba(255,236,190,.9)";

/** Letreiro (matchday): MATCHDAY 14 and the fixture lit on a bulb-ringed hotel sign; date · kick-off · ground on a pill under it. */
export function Marqueesign({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data).toUpperCase();
  const fixture = fixtureOf(data);
  const iw = W - 110 * k;
  const tPx = Math.min(54 * k * ts, iw / Math.max(1, title.length * 0.72));
  const fPx = fit(fixture, 24 * k * ts, iw, 0.12);
  const rows = whenRows(data, 20 * k * ts, iw, 0.14);
  const wPx = Math.min(20 * k * ts, ...rows.map((l) => fit(l, 20 * k * ts, iw, 0.14)));
  const sh = 38 * k + tPx + (fixture ? 14 * k + fPx : 0) + rows.length * (wPx + 10 * k) + 38 * k;
  return (
    <Top data={data} blockH={sh} drop={290}>
      <Shade k={k} h={sh}>
        <Marquee k={k} w={W} h={sh}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: tPx, letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap", textShadow: lit }}>{title}</div>
          {fixture && <div style={{ ...caps(fPx, 0.12), fontWeight: 800, marginTop: 14 * k, textShadow: lit }}>{fixture}</div>}
          {rows.map((l, i) => (
            <div key={i} style={{ ...caps(wPx, 0.14), fontWeight: 600, marginTop: 10 * k, opacity: 0.92, textShadow: lit }}>{l}</div>
          ))}
        </Marquee>
      </Shade>
    </Top>
  );
}

/** Golo · letreiro (goal): GOAL lit on the same bulb-ringed sign, his name and exact club under it. */
export function Goalmarqueesign({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const iw = W - 120 * k;
  const gPx = Math.min(104 * k * ts, iw / Math.max(1, word.length * 0.78));
  const nPx = fit(name, 30 * k * ts, iw, 0.1);
  const cPx = fit(club, 22 * k * ts, iw, 0.2);
  const sh = 44 * k + gPx + 22 * k + nPx + (club ? 14 * k + cPx : 0) + 44 * k;
  return (
    <Top data={data} blockH={sh} drop={310}>
      <Shade k={k} h={sh}>
        <Marquee k={k} w={W} h={sh}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: gPx, letterSpacing: "0.1em", paddingLeft: "0.1em", lineHeight: 1, whiteSpace: "nowrap", textShadow: lit }}>{word}</div>
          <div style={{ ...caps(nPx, 0.1), fontWeight: 800, marginTop: 22 * k, textShadow: lit }}>{name}</div>
          {club && <div style={{ ...caps(cPx, 0.2), fontWeight: 700, marginTop: 14 * k, textShadow: lit }}>{club}</div>}
        </Marquee>
      </Shade>
    </Top>
  );
}

/* ---------------- Carnival lantern (FC Basel / Fasnacht) ---------------- */

const PAINT = "#2b1d10";

/**
 * A Basel carnival lantern: a glowing parchment box between dark wooden caps, a band painted in his club's colour and
 * the lettering painted by hand in dark ink — after the hand-painted Fasnacht lanterns FC Basel's 2025 carnival kit
 * paid homage to.
 */
function Lantern({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const ink = clubInk(data);
  const cap = 22 * k;
  return (
    <div style={{ position: "relative", width: w, height: h + 2 * cap, filter: "drop-shadow(0 14px 30px rgba(0,0,0,.5))" }}>
      <div style={{ position: "absolute", left: -18 * k, right: -18 * k, top: 0, height: cap, borderRadius: 6 * k, background: "linear-gradient(to bottom, #4a3522, #2c1f13)" }} />
      <div style={{ position: "absolute", left: -18 * k, right: -18 * k, bottom: 0, height: cap, borderRadius: 6 * k, background: "linear-gradient(to bottom, #4a3522, #2c1f13)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cap, height: h, background: "radial-gradient(ellipse at 50% 45%, #fff8e4, #fbe7b5 55%, #efc77c)", boxShadow: `0 0 ${44 * k}px ${10 * k}px rgba(255,214,140,.45)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 12 * k, height: 12 * k, background: ink, opacity: 0.92 }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 12 * k, height: 12 * k, background: ink, opacity: 0.92 }} />
        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: PAINT }}>{children}</div>
      </div>
    </div>
  );
}

/** Lanterna (matchday): MATCHDAY 14 and the fixture painted on a glowing carnival lantern; date · kick-off · ground on a pill under it. */
export function Lanternsign({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data).toUpperCase();
  const fixture = fixtureOf(data);
  const iw = W - 100 * k;
  const tPx = Math.min(64 * k * ts, iw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 24 * k * ts, iw, 0.1);
  const rows = whenRows(data, 20 * k * ts, iw, 0.14);
  const wPx = Math.min(20 * k * ts, ...rows.map((l) => fit(l, 20 * k * ts, iw, 0.14)));
  const lh = 44 * k + tPx + (fixture ? 14 * k + fPx : 0) + rows.length * (wPx + 10 * k) + 44 * k;
  const blockH = lh + 44 * k;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <Lantern data={data} k={k} w={W - 40 * k} h={lh}>
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap" }}>{title}</div>
          {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 14 * k, textShadow: "none" }}>{fixture}</div>}
          {rows.map((l, i) => (
            <div key={i} style={{ ...caps(wPx, 0.14), fontWeight: 700, marginTop: 10 * k, textShadow: "none" }}>{l}</div>
          ))}
        </Lantern>
      </Shade>
    </Top>
  );
}

/** Golo · lanterna (goal): GOAL, his name and exact club painted on the glowing lantern. */
export function Goallanternsign({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const iw = W - 100 * k;
  const gPx = Math.min(120 * k * ts, iw / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, iw, 0.1);
  const cPx = fit(club, 22 * k * ts, iw, 0.2);
  const lh = 46 * k + gPx + 22 * k + nPx + (club ? 14 * k + cPx : 0) + 46 * k;
  return (
    <Top data={data} blockH={lh + 44 * k} drop={310}>
      <Shade k={k} h={lh + 44 * k}>
        <Lantern data={data} k={k} w={W - 40 * k} h={lh}>
          <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
          <div style={{ ...caps(nPx, 0.1), fontWeight: 800, marginTop: 22 * k, textShadow: "none" }}>{name}</div>
          {club && <div style={{ ...caps(cPx, 0.2), fontWeight: 700, marginTop: 14 * k, textShadow: "none" }}>{club}</div>}
        </Lantern>
      </Shade>
    </Top>
  );
}

/* ---------------- Hotel key tag (VfB Stuttgart / the Concordia hotel) ---------------- */

/**
 * An old hotel room key: a brass key on a ring and a big oval fob in his club's colour, edged in white, with the
 * round number on it in white (no round on record: the club crest instead) — the Concordia hotel again, where VfB's
 * story starts.
 */
function KeyTag({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const round = matchFacts(data).roundNo;
  const crest = data.club?.crestUrl;
  const s = w / 100;
  const h = 150 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, flexShrink: 0, filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <svg width={w} height={h} viewBox="0 0 100 150" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 50 4 L 50 22 M 50 10 L 56 10 M 50 16 L 58 16" stroke="#d9b45a" strokeWidth={4} strokeLinecap="round" />
        <circle cx={50} cy={30} r={9} fill="none" stroke="#d9b45a" strokeWidth={4} />
        <path d="M 50 39 C 14 39, 8 62, 8 92 C 8 126, 30 146, 50 146 C 70 146, 92 126, 92 92 C 92 62, 86 39, 50 39 Z" fill={ink} stroke="#fff" strokeWidth={3.2} />
        <circle cx={50} cy={50} r={4} fill="#fff" />
      </svg>
      {round ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 70 * s, textAlign: "center", fontFamily: DISPLAY, fontSize: 52 * s, lineHeight: 1, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.35)" }}>{round}</div>
      ) : (
        crest && <img src={crest} alt="" style={{ position: "absolute", left: 22 * s, top: 66 * s, width: 56 * s, height: 56 * s, objectFit: "contain" }} />
      )}
    </div>
  );
}

/** Chave (matchday): a hotel key with the round number on its fob beside MATCHDAY 14, the fixture and date · kick-off · ground. */
export function Keytag({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const kw = 150 * k;
  const gap = 34 * k;
  const tw = W - kw - gap;
  const blockH = Math.max(kw * 1.5, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <KeyTag data={data} w={kw} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}
