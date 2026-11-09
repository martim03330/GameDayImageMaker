/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
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

/** The 34º of Signal Iduna Park's stands, as a slant from the vertical (tan 34º ≈ 0.67). */
const SLANT = 0.67;

/** A word on a solid strip in the club's colour whose two ends are cut at the stands' angle. */
function Cut({ text, px, ink, k }: { text: string; px: number; ink: string; k: number }) {
  const h = px + 34 * k;
  const off = h * SLANT;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: px,
        lineHeight: 1,
        whiteSpace: "nowrap",
        padding: `${17 * k}px ${off + 28 * k}px`,
        background: ink,
        clipPath: `polygon(${off}px 0, 100% 0, calc(100% - ${off}px) 100%, 0 100%)`,
        filter: "drop-shadow(0 6px 18px rgba(0,0,0,.35))",
      }}
    >
      {text}
    </div>
  );
}

/**
 * Ângulo 34º (matchday), after DesignStudio's identity for Borussia Dortmund, built on the 34º angle of the
 * stadium's stands: MATCHDAY 14 in Anton on a solid strip in the club's colour, both ends cut at that angle,
 * above his head; the fixture and its facts under it.
 */
export function Angle34({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const tPx = Math.min(70 * k * ts, (W - 200 * k) / Math.max(1, title.length * 0.5));
  const facts = factsOf(data, k, ts);
  const blockH = tPx + 34 * k + 32 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Cut text={title} px={tPx} ink={clubInk(data)} k={k} />
      <div style={{ marginTop: 32 * k }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · ângulo 34º (goal): GOAL on the same cut strip, his name and exact club under it. */
export function Goalangle34({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const tPx = Math.min(104 * k * ts, (W - 220 * k) / Math.max(1, word.length * 0.5));
  const who = scorerOf(data, k, ts);
  const blockH = tPx + 34 * k + 30 * k + who.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Cut text={word} px={tPx} ink={clubInk(data)} k={k} />
      <div style={{ marginTop: 30 * k }}>{who.node}</div>
    </Top>
  );
}

/** The stand seen from the side: three steps rising at the stands' angle, in a thick white line. */
function Stand({ w, k }: { w: number; k: number }) {
  const step = w / 3;
  const rise = step * 0.3;
  const pts = [0, 3 * rise, step, 3 * rise, step, 2 * rise, 2 * step, 2 * rise, 2 * step, rise, 3 * step, rise, 3 * step, 0];
  const pad = 4 * k;
  return (
    <svg width={w + 2 * pad} height={3 * rise + 2 * pad} viewBox={`${-pad} ${-pad} ${w + 2 * pad} ${3 * rise + 2 * pad}`} style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }}>
      <polyline points={pts.join(" ")} fill="none" stroke="#fff" strokeWidth={8 * k} strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

/**
 * Bancada (matchday), after the same Borussia Dortmund identity (the stands' geometry as its grid): a small
 * stand in profile — three steps in a thick white line — above MATCHDAY 14 in Anton, then the fixture and its facts.
 */
export function Terraces({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const sw = 150 * k;
  const sh = sw * 0.3 + 8 * k;
  const tPx = Math.min(64 * k * ts, W / Math.max(1, title.length * 0.5));
  const facts = factsOf(data, k, ts);
  const blockH = sh + 22 * k + tPx + 32 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Stand w={sw} k={k} />
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 22 * k, textShadow: SHADOW }}>{title}</div>
      <div style={{ marginTop: 32 * k }}>{facts.node}</div>
    </Top>
  );
}

/** A line of Anton with the club crest set in it like a letter, as tall as the capitals. */
function WithCrest({ before, after, crest, px, k }: { before: string; after: string; crest: string | null; px: number; k: number }) {
  const cap = px * 0.86;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: crest ? 4 * k : 0, fontFamily: DISPLAY, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>
      <span>{before}</span>
      {crest ? <img src={crest} alt="" style={{ height: cap * 1.08, width: cap * 1.08, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} /> : before && after ? <span>&nbsp;</span> : null}
      <span>{after}</span>
    </div>
  );
}

/**
 * Emblema na palavra (matchday), after DixonBaxi's identity for Everton, where one club symbol anchors the whole
 * system next to the condensed type: the club crest set inside the title like a letter — MATCH [crest] DAY 14 —
 * above his head; the fixture and its facts under it.
 */
export function Crestinline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const crest = data.club?.crestUrl ?? null;
  const m = /^(MATCH)(DAY.*)$/.exec(title);
  const [before, after] = m ? [m[1], m[2]] : ["", title];
  const tPx = Math.min(84 * k * ts, (W - 110 * k) / Math.max(1, title.length * 0.5));
  const facts = factsOf(data, k, ts);
  const blockH = tPx + 34 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      {m ? <WithCrest before={before} after={after} crest={crest} px={tPx} k={k} /> : <WithCrest before="" after={after} crest={crest} px={tPx} k={k} />}
      <div style={{ marginTop: 34 * k }}>{facts.node}</div>
    </Top>
  );
}

/** Golo · emblema na palavra (goal): GOAL with the club crest in place of its O, his name and exact club under it. */
export function Goalcrestinline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const crest = data.club?.crestUrl ?? null;
  const at = word.indexOf("O");
  const tPx = Math.min(136 * k * ts, (W - 60 * k) / Math.max(1, word.length * 0.55));
  const who = scorerOf(data, k, ts);
  const blockH = tPx + 30 * k + who.h;
  const line =
    crest && at > 0 ? (
      <WithCrest before={word.slice(0, at)} after={word.slice(at + 1)} crest={crest} px={tPx} k={k} />
    ) : (
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
    );
  return (
    <Top data={data} blockH={blockH} drop={310}>
      {line}
      <div style={{ marginTop: 30 * k }}>{who.node}</div>
    </Top>
  );
}
