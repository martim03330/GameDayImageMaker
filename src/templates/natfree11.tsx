/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { isoFromShortDate } from "@/lib/timezone";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800 }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
      ))}
    </div>
  );
  return { h, node };
}

/** His exact club under a goal word. */
function clubLine(data: RenderData, k: number, ts: number) {
  const club = ourClub(data).toUpperCase();
  const px = fit(club, 21 * k * ts, W, 0.22);
  return { h: club ? px : 0, node: club ? <div style={{ ...caps(px, 0.22), fontWeight: 600, opacity: 0.94 }}>{club}</div> : null };
}

/**
 * How far the game is from today, as a fan would say it: TONIGHT / TODAY, TOMORROW, IN 3 DAYS. Read when the
 * edit is drawn, so a story exported on the morning of the game says TODAY; past games and games more than a
 * week away give nothing.
 */
function countdown(data: RenderData): string {
  const iso = isoFromShortDate(data.content.date);
  if (!iso) return "";
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((Date.parse(`${iso}T00:00:00Z`) - today) / 86400_000);
  if (days < 0 || days > 7) return "";
  if (days === 0) return Number(natFixture(data).time.split(":")[0]) >= 18 ? "TONIGHT" : "TODAY";
  return days === 1 ? "TOMORROW" : `IN ${days} DAYS`;
}

/**
 * Natural · contagem (matchday): how far the game is — TONIGHT, TOMORROW, IN 3 DAYS — in light wide caps above
 * his head, MATCHDAY 14 small over it, then the fixture and its facts. Past or far games: MATCHDAY 14 in its place.
 */
export function Natcountdown({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const when = countdown(data);
  const title = roundTitle(data);
  const hero = when || title;
  const hPx = fit(hero, 92 * k * ts, W, 0.12);
  const lPx = 22 * k * ts;
  const facts = factsOf(data, k, ts);
  const blockH = (when ? lPx + 22 * k : 0) + hPx + 32 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      {when && <div style={{ ...caps(lPx, 0.3), opacity: 0.92, marginBottom: 22 * k }}>{title}</div>}
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: hPx, letterSpacing: "0.12em", paddingLeft: "0.12em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{hero}</div>
      <div style={{ marginTop: 32 * k }}>{facts.node}</div>
    </Top>
  );
}

/**
 * Natural · nome nas costas (matchday): his surname and shirt number on one line, set like the back of a kit
 * (Anton, the number larger), above his head; MATCHDAY 14 and the fixture with its facts under it. No number on
 * record: the name alone.
 */
export function Natbackname({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const surname = (data.content.lastName || data.content.firstName || "").toUpperCase();
  const number = (data.player.number ?? "").trim();
  const title = roundTitle(data);
  const nPx = number ? 112 * k * ts : 0;
  const sPx = fit(surname, 70 * k * ts, W - (number ? nPx * 0.6 * number.length + 30 * k : 0), 0.06);
  const tPx = fit(title, 22 * k * ts, W, 0.3);
  const facts = factsOf(data, k, ts);
  const blockH = Math.max(sPx, nPx) + 28 * k + tPx + 18 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 30 * k, fontFamily: DISPLAY, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>
        <span style={{ fontSize: sPx, letterSpacing: "0.06em" }}>{surname}</span>
        {number && <span style={{ fontSize: nPx }}>{number}</span>}
      </div>
      <div style={{ ...caps(tPx, 0.3), marginTop: 28 * k, opacity: 0.92 }}>{title}</div>
      <div style={{ marginTop: 18 * k }}>{facts.node}</div>
    </Top>
  );
}

/**
 * Natural · cidade (matchday): at a home game, his club's city in light wide caps above his head ("VARNA"),
 * MATCHDAY 14 over it and the fixture with its facts under it. Away, or no city on record: MATCHDAY 14 in its place.
 */
export function Natcityline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const city = data.content.home !== false ? (data.club?.city ?? "").trim().toUpperCase() : "";
  const title = roundTitle(data);
  const hero = city || title;
  const hPx = fit(hero, 104 * k * ts, W, 0.16);
  const lPx = 22 * k * ts;
  const facts = factsOf(data, k, ts);
  const blockH = (city ? lPx + 22 * k : 0) + hPx + 32 * k + facts.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      {city && <div style={{ ...caps(lPx, 0.3), opacity: 0.92, marginBottom: 22 * k }}>{title}</div>}
      <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: hPx, letterSpacing: "0.16em", paddingLeft: "0.16em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{hero}</div>
      <div style={{ marginTop: 32 * k }}>{facts.node}</div>
    </Top>
  );
}

/**
 * Golo natural · casa/fora (goal): HOME GOAL or AWAY GOAL — whether he scored at his own ground or away — in
 * light wide caps above his head, his name in bold caps and his exact club under it. Ground unknown: GOAL alone.
 */
export function Goalnathomeaway({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const goal = (data.content.kicker || "Goal").toUpperCase();
  const where = data.content.home === true ? "HOME" : data.content.home === false ? "AWAY" : "";
  const lPx = 24 * k * ts;
  const wPx = fit(goal, 112 * k * ts, W, 0.18);
  const name = fullName(data);
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const club = clubLine(data, k, ts);
  const blockH = (where ? lPx + 20 * k : 0) + wPx + 30 * k + nPx + 12 * k + club.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      {where && <div style={{ ...caps(lPx, 0.34), fontWeight: 800, marginBottom: 20 * k }}>{where}</div>}
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: wPx, letterSpacing: "0.18em", paddingLeft: "0.18em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{goal}</div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k }}>{name}</div>
      <div style={{ marginTop: 12 * k }}>{club.node}</div>
    </Top>
  );
}

/**
 * Golo natural · número no anel (goal): GOAL in light wide caps above his head, then his shirt number in a white ring
 * beside his name, and his exact club under them. No number on record: the name alone.
 */
export function Goalnatkitring({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const number = (data.player.number ?? "").trim();
  const name = fullName(data);
  const ring = 66 * k;
  const wPx = fit(word, 96 * k * ts, W, 0.2);
  const nPx = fit(name, 32 * k * ts, W - (number ? ring + 24 * k : 0), 0.12);
  const club = clubLine(data, k, ts);
  const rowH = Math.max(number ? ring : 0, nPx);
  const blockH = wPx + 34 * k + rowH + 16 * k + club.h;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: wPx, letterSpacing: "0.2em", paddingLeft: "0.2em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 * k, marginTop: 34 * k, height: rowH }}>
        {number && (
          <div style={{ width: ring, height: ring, borderRadius: "50%", border: `${4 * k}px solid #fff`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 34 * k, lineHeight: 1, boxShadow: "0 2px 14px rgba(0,0,0,.35)", textShadow: SHADOW, boxSizing: "border-box" }}>
            {number}
          </div>
        )}
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800 }}>{name}</div>
      </div>
      <div style={{ marginTop: 16 * k }}>{club.node}</div>
    </Top>
  );
}
