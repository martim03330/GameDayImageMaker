import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { capsEm } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;


/** Fixture and date · kick-off · ground rows, sized for a phone. */
function factsOf(data: RenderData, k: number, ts: number) {
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const h = (fixture ? fPx + 16 * k : 0) + (when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0);
  const node = (
    <>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800 }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
      ))}
    </>
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
    <>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800 }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
    </>
  );
  return { h: nPx + (club ? 14 * k + cPx : 0), node };
}

/** A word whose letters step from hairline to black weight, left to right (Inter is a variable font). */
function Ramp({ text, px }: { text: string; px: number }) {
  const letters = [...text];
  const n = Math.max(1, letters.filter((c) => c !== " ").length - 1);
  let i = 0;
  return (
    <div style={{ fontFamily: SANS, fontSize: px, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap", textShadow: SHADOW }}>
      {letters.map((c, j) => {
        if (c === " ") return <span key={j}> </span>;
        const w = Math.round(100 + (800 * i++) / n);
        return (
          <span key={j} style={{ fontWeight: w }}>
            {c}
          </span>
        );
      })}
    </div>
  );
}

/** Ramp size: as large as the line allows (wide letters at the heavy end). */
const rampPx = (text: string, max: number) => Math.min(max, W / Math.max(1, capsEm(text, 0.01) * 1.08));

/**
 * Pesos em escada (matchday), after Smörgåsbord's identity for AFC Ajax (a custom family of 15 weights): MATCHDAY 14
 * with every letter one weight heavier than the last, from hairline to black, above his head; the fixture and
 * its facts under it.
 */
export function Weightramp({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const tPx = rampPx(title, 104 * k * ts);
  const facts = factsOf(data, k, ts);
  const blockH = tPx + 34 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Ramp text={title} px={tPx} />
      <div style={{ marginTop: 34 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · pesos em escada (goal): GOAL stepping from hairline to black, his name and exact club under it. */
export function Goalweightramp({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const tPx = rampPx(word, 150 * k * ts);
  const who = scorerOf(data, k, ts);
  const blockH = tPx + 30 * k + who.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Ramp text={word} px={tPx} />
      <div style={{ marginTop: 30 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>{who.node}</div>
    </Top>
  );
}

/** A condensed headline with three fading copies trailing to its left, as if caught mid-move. */
function Trail({ text, px, k }: { text: string; px: number; k: number }) {
  const copy = (dx: number, o: number) => (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${dx}px)`, opacity: o, fontFamily: DISPLAY, fontSize: px, lineHeight: 1, whiteSpace: "nowrap" }}>{text}</div>
  );
  return (
    <div style={{ position: "relative" }}>
      {copy(-54 * k, 0.1)}
      {copy(-36 * k, 0.18)}
      {copy(-18 * k, 0.32)}
      <div style={{ position: "relative", fontFamily: DISPLAY, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{text}</div>
    </div>
  );
}

/**
 * Rasto (matchday), after Studio Dumbar's motion-first identity for Club Brugge (a condensed sans, plain
 * words, the player photo centre stage): MATCHDAY 14 in condensed caps with a short motion trail of fading
 * copies, above his head; the fixture and its facts under it.
 */
export function Motiontrail({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const tPx = Math.min(84 * k * ts, (W - 80 * k) / Math.max(1, title.length * 0.5));
  const facts = factsOf(data, k, ts);
  const blockH = tPx + 34 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Trail text={title} px={tPx} k={k} />
      <div style={{ marginTop: 34 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · rasto (goal): GOAL in condensed caps with the same motion trail, his name and exact club under it. */
export function Goalmotiontrail({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const tPx = Math.min(130 * k * ts, (W - 80 * k) / Math.max(1, word.length * 0.5));
  const who = scorerOf(data, k, ts);
  const blockH = tPx + 30 * k + who.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Trail text={word} px={tPx} k={k} />
      <div style={{ marginTop: 30 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>{who.node}</div>
    </Top>
  );
}

/** A football in clean line art: the outline, the centre panel and its seams, with a soft ground shadow. */
function LineBall({ size }: { size: number }) {
  const r = 46;
  const pent = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [50 + 15 * Math.cos(a), 50 + 15 * Math.sin(a), 50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });
  return (
    <div style={{ position: "relative", width: size, height: size * 1.16 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#fff" strokeWidth={2.4} />
        <polygon points={pent.map((p) => `${p[0]},${p[1]}`).join(" ")} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" />
        {pent.map((p, i) => (
          <line key={i} x1={p[0]} y1={p[1]} x2={50 + (p[2] - 50) * 0.97} y2={50 + (p[3] - 50) * 0.97} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
        ))}
      </svg>
      <div style={{ position: "absolute", left: size * 0.18, right: size * 0.18, bottom: 0, height: size * 0.07, borderRadius: "50%", background: "rgba(0,0,0,.45)", filter: "blur(4px)" }} />
    </div>
  );
}

/**
 * Bola em traço (matchday), after the clean line-art football with a ground shadow of Gelato's World Cup 2026
 * merch ideas: that ball small and alone above his head, MATCHDAY 14 in light wide caps under it, then the
 * fixture and its facts.
 */
export function Lineball({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const ball = 84 * k;
  const tPx = fit(title, 48 * k * ts, W, 0.24);
  const facts = factsOf(data, k, ts);
  const blockH = ball * 1.16 + 26 * k + tPx + 30 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <LineBall size={ball} />
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: tPx, letterSpacing: "0.24em", paddingLeft: "0.24em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 26 * k }}>{title}</div>
      <div style={{ marginTop: 30 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>{facts.node}</div>
    </Top>
  );
}
