/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/** Werder's Bruckmeyer Neue Bold Italic, approximated with Inter: heavy, slanted, tight. */
const italic = (px: number): CSSProperties => ({ fontFamily: SANS, fontWeight: 900, fontStyle: "italic", fontSize: px, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", textShadow: SHADOW });

/** Fixture and date · kick-off · ground rows, sized for a phone. */
function factsOf(data: RenderData, k: number, ts: number) {
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const h = (fixture ? fPx + 16 * k : 0) + (when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0);
  const node = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800 }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
      ))}
    </div>
  );
  return { h, node };
}

/** Name and exact club, for goal posts. */
function scorerOf(data: RenderData, k: number, ts: number) {
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const node = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800 }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
    </div>
  );
  return { h: nPx + (club ? 14 * k + cPx : 0), node };
}

/** Three heavy white chevrons pointing forward, as in Werder's system of chevrons. */
function Chevrons({ h, k }: { h: number; k: number }) {
  const w = h * 0.62;
  const stroke = 11 * k;
  return (
    <svg width={w * 3 + 12 * k * 2} height={h} viewBox={`0 0 ${w * 3 + 24 * k} ${h}`} style={{ overflow: "visible", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.4))" }}>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${i * (w + 12 * k) + stroke / 2} ${stroke / 2} L ${i * (w + 12 * k) + w - stroke / 2} ${h / 2} L ${i * (w + 12 * k) + stroke / 2} ${h - stroke / 2}`} fill="none" stroke="#fff" strokeWidth={stroke} strokeLinejoin="miter" strokeLinecap="square" />
      ))}
    </svg>
  );
}

/**
 * Chevrons (matchday), after Societas' Werder Bremen identity — chevrons, checkerboards and a bespoke Bold Italic
 * around the diamond: three heavy chevrons over MATCHDAY 14 in a heavy italic, the fixture and its facts under it.
 */
export function Chevronitalic({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const ch = 54 * k;
  const tPx = Math.min(80 * k * ts, W / Math.max(1, title.length * 0.6));
  const facts = factsOf(data, k, ts);
  const blockH = ch + 24 * k + tPx + 28 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Chevrons h={ch} k={k} />
      <div style={{ ...italic(tPx), marginTop: 24 * k }}>{title}</div>
      <div style={{ marginTop: 28 * k }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · chevrons (goal): the same three chevrons over GOAL in the heavy italic, his name and exact club under it. */
export function Goalchevronitalic({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const ch = 58 * k;
  const gPx = Math.min(140 * k * ts, W / Math.max(1, word.length * 0.62));
  const s = scorerOf(data, k, ts);
  const blockH = ch + 24 * k + gPx + 28 * k + s.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Chevrons h={ch} k={k} />
      <div style={{ ...italic(gPx), marginTop: 24 * k }}>{word}</div>
      <div style={{ marginTop: 28 * k }}>{s.node}</div>
    </Top>
  );
}

/** His club's crest inside a thick white diamond (Werder's layouts follow the diamond's proportions). */
function Diamond({ size, k, crest }: { size: number; k: number; crest: string | null | undefined }) {
  const side = size / Math.SQRT2;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <div style={{ position: "absolute", left: (size - side) / 2, top: (size - side) / 2, width: side, height: side, transform: "rotate(45deg)", border: `${7 * k}px solid #fff`, boxSizing: "border-box", background: "rgba(10,12,16,.28)", boxShadow: "0 4px 22px rgba(0,0,0,.35)" }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: size * 0.27, top: size * 0.27, width: size * 0.46, height: size * 0.46, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
    </div>
  );
}

/**
 * Losango (matchday), after Societas' Werder Bremen identity: his club's crest inside a thick white diamond, MATCHDAY
 * 14 in the heavy italic under it, then the fixture and its facts — above his head. No crest: an empty diamond.
 */
export function Diamondcrest({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const d = 92 * k;
  const tPx = Math.min(60 * k * ts, W / Math.max(1, title.length * 0.6));
  const facts = factsOf(data, k, ts);
  const blockH = d + 16 * k + tPx + 22 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Diamond size={d} k={k} crest={data.club?.crestUrl} />
      <div style={{ ...italic(tPx), marginTop: 16 * k }}>{title}</div>
      <div style={{ marginTop: 22 * k }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · losango (goal): the crest in the white diamond over GOAL in the heavy italic, his name and exact club. */
export function Goaldiamondcrest({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const d = 124 * k;
  const gPx = Math.min(120 * k * ts, W / Math.max(1, word.length * 0.62));
  const s = scorerOf(data, k, ts);
  const blockH = d + 22 * k + gPx + 26 * k + s.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Diamond size={d} k={k} crest={data.club?.crestUrl} />
      <div style={{ ...italic(gPx), marginTop: 22 * k }}>{word}</div>
      <div style={{ marginTop: 26 * k }}>{s.node}</div>
    </Top>
  );
}

/**
 * Xadrez (matchday), after Societas' Werder Bremen checkerboards: MATCHDAY 14 in the heavy italic, then one row of
 * large squares alternating white and his club's colour (white-edged, so it reads on any sky), then the fixture
 * and its facts.
 */
export function Checkerrow({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const sq = 34 * k;
  const n = 12;
  const ink = clubInk(data);
  const tPx = Math.min(76 * k * ts, W / Math.max(1, title.length * 0.6));
  const facts = factsOf(data, k, ts);
  const blockH = tPx + 26 * k + sq + 28 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={italic(tPx)}>{title}</div>
      <div style={{ display: "flex", marginTop: 26 * k, border: `${3 * k}px solid #fff`, boxShadow: "0 4px 18px rgba(0,0,0,.35)" }}>
        {Array.from({ length: n }, (_, i) => (
          <div key={i} style={{ width: sq, height: sq, background: i % 2 ? ink : "#fff" }} />
        ))}
      </div>
      <div style={{ marginTop: 28 * k }}>{facts.node}</div>
    </Top>
  );
}
