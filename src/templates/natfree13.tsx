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

/** Date · kick-off · ground rows, sized for a phone. */
function whenOf(data: RenderData, k: number, ts: number) {
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const px = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const h = when.length ? when.length * px + (when.length - 1) * 10 * k : 0;
  const node = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 0, opacity: 0.94 }}>{l}</div>
      ))}
    </div>
  );
  return { h, node };
}

/** His games this season up to the edit's own date (`before`: the game itself left out, for matchday posts). */
function seasonOf(data: RenderData, before: boolean) {
  const iso = isoFromShortDate(data.content.date) ?? new Date().toISOString().slice(0, 10);
  const y = Number(iso.slice(0, 4));
  const start = `${Number(iso.slice(5, 7)) >= 7 ? y : y - 1}-07-01`;
  const games = data.matches.filter((m) => m.date >= start && (before ? m.date < iso : m.date <= iso));
  return { games: games.length, goals: games.reduce((a, m) => a + (m.goals || 0), 0), assists: games.reduce((a, m) => a + (m.assists || 0), 0) };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Natural · época (matchday): MATCHDAY 14, the fixture and its facts above his head, then his season so far on one
 * line under a small label — "12 GAMES · 2 GOALS · 1 ASSIST", from the games on record before this one (goals and
 * assists only when he has some). No game on record this season: the line is left out.
 */
export function Natseasonline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const s = seasonOf(data, true);
  const stats = s.games ? [plural(s.games, "GAME", "GAMES"), s.goals ? plural(s.goals, "GOAL", "GOALS") : "", s.assists ? plural(s.assists, "ASSIST", "ASSISTS") : ""].filter(Boolean).join("  ·  ") : "";
  const tPx = Math.min(72 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const lPx = 20 * k * ts;
  const sPx = fit(stats, 28 * k * ts, W, 0.14);
  const when = whenOf(data, k, ts);
  const blockH = tPx + 26 * k + (fixture ? fPx + 16 * k : 0) + when.h + (stats ? 34 * k + lPx + 12 * k + sPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
      <div style={{ marginTop: fixture ? 16 * k : 26 * k }}>{when.node}</div>
      {stats && (
        <>
          <div style={{ ...caps(lPx, 0.34), fontWeight: 600, marginTop: 34 * k, opacity: 0.8 }}>THIS SEASON</div>
          <div style={{ ...caps(sPx, 0.14), fontWeight: 800, marginTop: 12 * k }}>{stats}</div>
        </>
      )}
    </Top>
  );
}

/**
 * Natural · pílula da hora (matchday): MATCHDAY 14 and the fixture above his head, then the kick-off alone in a solid
 * white pill with dark type — "KICK-OFF 17:00 (15:00 PT)" — and the date · ground under it. No time: no pill.
 */
export function Natkickoffpill({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const pill = fx.kickoff ? `KICK-OFF  ${fx.kickoff}`.toUpperCase() : "";
  const under = [fx.date, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = Math.min(72 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const pPx = fit(pill, 28 * k * ts, W - 80 * k, 0.12);
  const pH = pPx + 32 * k;
  const uPx = fit(under, 21 * k * ts, W, 0.16);
  const blockH = tPx + 26 * k + (fixture ? fPx : 0) + (pill ? 28 * k + pH : 0) + (under ? 22 * k + uPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
      {pill && (
        <div style={{ marginTop: 28 * k, height: pH, padding: `0 ${36 * k}px`, borderRadius: pH / 2, background: "#fff", display: "flex", alignItems: "center", boxShadow: "0 6px 24px rgba(0,0,0,.35)" }}>
          <div style={{ ...caps(pPx, 0.12), fontWeight: 800, color: "#12161c", textShadow: "none" }}>{pill}</div>
        </div>
      )}
      {under && <div style={{ ...caps(uPx, 0.16), fontWeight: 600, marginTop: 22 * k, opacity: 0.94 }}>{under}</div>}
    </Top>
  );
}

/**
 * Natural · cantos (matchday): one row across the top above his head — the date in the left corner, the local
 * kick-off in the right one, MATCHDAY 14 in Anton between them — then the fixture, the player's second clock and
 * the ground centred under it. Without a date or a time, that corner stays empty.
 */
export function Natcornerfacts({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const under = [fx.ptTime, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const side = 210 * k;
  const tPx = Math.min(60 * k * ts, (W - 2 * side) / Math.max(1, title.length * 0.5));
  const cPx = 30 * k * ts;
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const uPx = fit(under, 21 * k * ts, W, 0.16);
  const rowH = Math.max(tPx, cPx);
  const blockH = rowH + (fixture ? 28 * k + fPx : 0) + (under ? 16 * k + uPx : 0);
  const corner = (t: string, align: "left" | "right") => (
    <div style={{ width: side, textAlign: align, ...caps(cPx, 0.08), paddingLeft: 0, fontWeight: 800 }}>{t.toUpperCase()}</div>
  );
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ width: W, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {corner(fx.date, "left")}
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {corner(fx.time, "right")}
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
      {under && <div style={{ ...caps(uPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.94 }}>{under}</div>}
    </Top>
  );
}

/**
 * Golo natural · época (goal): GOAL in Anton above his head, his name and exact club, then his season up to this
 * game on one line — "6 GOALS IN 11 GAMES THIS SEASON". No game on record: the line is left out.
 */
export function Goalnatseasonline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const s = seasonOf(data, false);
  const stats = s.games && s.goals ? `${plural(s.goals, "GOAL", "GOALS")} IN ${plural(s.games, "GAME", "GAMES")} THIS SEASON` : "";
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const sPx = fit(stats, 26 * k * ts, W, 0.12);
  const blockH = gPx + 24 * k + nPx + (club ? 12 * k + cPx : 0) + (stats ? 30 * k + sPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      {stats && <div style={{ ...caps(sPx, 0.12), fontWeight: 700, marginTop: 30 * k, padding: `${10 * k}px ${22 * k}px`, borderTop: "2px solid rgba(255,255,255,.75)", borderBottom: "2px solid rgba(255,255,255,.75)" }}>{stats}</div>}
    </Top>
  );
}

/**
 * Golo natural · cantos (goal): one row across the top above his head — GOAL in the left corner, his shirt number
 * in the right one, his surname in Anton between them — then his full name and exact club under it. No number on
 * record: that corner stays empty.
 */
export function Goalnatcornerfacts({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const last = (data.content.lastName || data.content.firstName || "").toUpperCase();
  const no = (data.player?.number ?? "").trim();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const side = 190 * k;
  const lPx = Math.min(64 * k * ts, (W - 2 * side) / Math.max(1, last.length * 0.5));
  const cPx = 30 * k * ts;
  const nPx = fit(name, 28 * k * ts, W, 0.12);
  const kPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = Math.max(lPx, cPx) + 28 * k + nPx + (club ? 12 * k + kPx : 0);
  const corner = (t: string, align: "left" | "right") => (
    <div style={{ width: side, textAlign: align, ...caps(cPx, 0.08), paddingLeft: 0, fontWeight: 800 }}>{t}</div>
  );
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ width: W, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {corner(word, "left")}
        <div style={{ fontFamily: DISPLAY, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{last}</div>
        {corner(no ? `Nº ${no}` : "", "right")}
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 28 * k }}>{name}</div>
      {club && <div style={{ ...caps(kPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}
