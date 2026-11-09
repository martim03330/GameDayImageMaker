/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SERIF } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/** Fixture and date · kick-off · ground rows, sized for a phone. */
function factsOf(data: RenderData, k: number, ts: number, w = W) {
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, w, 0.16);
  const fPx = fit(fixture, 27 * k * ts, w, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, w, 0.16)));
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

/**
 * The two strokes of Interbrand's Juventus mark, reduced to two upright bars: a white one and a shorter one in the
 * club's colour (white-edged, so it reads on any ground), both ending in a rounded foot.
 */
function Stripes({ h, k, ink }: { h: number; k: number; ink: string }) {
  const w = 20 * k;
  const bar = (top: number, bg: string, edge: boolean) => (
    <div style={{ width: w, height: h - top, marginTop: top, background: bg, borderRadius: `0 0 ${w / 2}px ${w / 2}px`, boxShadow: "0 4px 16px rgba(0,0,0,.35)", outline: edge ? `${3 * k}px solid #fff` : undefined, outlineOffset: -3 * k }} />
  );
  return (
    <div style={{ display: "flex", gap: 16 * k, height: h }}>
      {bar(h * 0.28, "#fff", false)}
      {bar(0, ink, true)}
    </div>
  );
}

/**
 * Riscas (matchday), after Interbrand's Juventus identity — the crest stripped to two J-like strokes over a
 * distinctly lettered name: the two bars above MATCHDAY 14 in Anton, then the fixture and its facts, above his head.
 */
export function Jstripes({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const sh = 72 * k;
  const tPx = Math.min(64 * k * ts, W / Math.max(1, title.length * 0.5));
  const facts = factsOf(data, k, ts);
  const blockH = sh + 18 * k + tPx + 26 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Stripes h={sh} k={k} ink={clubInk(data)} />
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 18 * k, textShadow: SHADOW }}>{title}</div>
      <div style={{ marginTop: 26 * k }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · riscas (goal): the same two bars over GOAL in Anton, his name and exact club under it. */
export function Goaljstripes({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const sh = 120 * k;
  const tPx = Math.min(124 * k * ts, W / Math.max(1, word.length * 0.55));
  const who = scorerOf(data, k, ts);
  const blockH = sh + 24 * k + tPx + 30 * k + who.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Stripes h={sh} k={k} ink={clubInk(data)} />
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 24 * k, textShadow: SHADOW }}>{word}</div>
      <div style={{ marginTop: 30 * k }}>{who.node}</div>
    </Top>
  );
}

/** An entrance sign: a solid plate in the club's colour with a white rule set inside its edge. */
function Plate({ k, children }: { k: number; children: ReactNode }) {
  return (
    <div style={{ background: "#fff", padding: 7 * k, borderRadius: 6 * k, boxShadow: "0 8px 28px rgba(0,0,0,.4)" }}>{children}</div>
  );
}

/**
 * Placa (matchday), after See Saw's Rangers identity, whose display serif is drawn from the lettering on Ibrox's gates
 * and entrance: MATCHDAY 14 in a high-contrast serif on a solid sign in the club's colour edged in white, like the
 * ground's entrance plate, above his head; the fixture and its facts under it.
 */
export function Gateplate({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const ink = clubInk(data);
  const tPx = Math.min(66 * k * ts, (W - 120 * k) / Math.max(1, title.length * 0.62));
  const facts = factsOf(data, k, ts);
  const plateH = tPx + 2 * 30 * k + 2 * 7 * k;
  const blockH = plateH + 34 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Plate k={k}>
        <div style={{ background: ink, padding: `${30 * k}px ${48 * k}px`, fontFamily: SERIF, fontWeight: 600, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.04em", color: "#fff" }}>{title}</div>
      </Plate>
      <div style={{ marginTop: 34 * k }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · placa (goal): GOAL in the same serif on the same club-colour sign, his name and exact club under it. */
export function Goalgateplate({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const ink = clubInk(data);
  const tPx = Math.min(104 * k * ts, (W - 120 * k) / Math.max(1, word.length * 0.66));
  const who = scorerOf(data, k, ts);
  const plateH = tPx + 2 * 30 * k + 2 * 7 * k;
  const blockH = plateH + 32 * k + who.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Plate k={k}>
        <div style={{ background: ink, padding: `${30 * k}px ${60 * k}px`, fontFamily: SERIF, fontWeight: 600, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.06em", color: "#fff" }}>{word}</div>
      </Plate>
      <div style={{ marginTop: 32 * k }}>{who.node}</div>
    </Top>
  );
}

/** A gate post: a thick white upright crowned by a ball finial. */
function Post({ h, k }: { h: number; k: number }) {
  const w = 20 * k;
  const ball = 40 * k;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: ball, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.4))" }}>
      <div style={{ width: ball, height: ball, borderRadius: "50%", background: "#fff" }} />
      <div style={{ width: w + 10 * k, height: 8 * k, background: "#fff", marginTop: 4 * k }} />
      <div style={{ width: w, height: h - ball - 12 * k, background: "#fff" }} />
    </div>
  );
}

/**
 * Portão (matchday), after the same Rangers identity built from Ibrox's gates: two white gate posts with ball
 * finials stand either side of MATCHDAY 14 in the display serif, the fixture and its facts between them, above his head.
 */
export function Gateposts({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const inner = W - 2 * (40 * k + 34 * k);
  const tPx = Math.min(62 * k * ts, inner / Math.max(1, title.length * 0.62));
  const facts = factsOf(data, k, ts, inner);
  const blockH = 40 * k + tPx + 30 * k + facts.h + 10 * k;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 34 * k }}>
        <Post h={blockH} k={k} />
        <div style={{ width: inner, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 10 * k }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.04em", textShadow: SHADOW }}>{title}</div>
          <div style={{ marginTop: 30 * k }}>{facts.node}</div>
        </div>
        <Post h={blockH} k={k} />
      </div>
    </Top>
  );
}
