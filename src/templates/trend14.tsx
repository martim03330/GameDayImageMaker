/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const SLAB = "var(--font-slab), Rockwell, serif";

/** Plain left-aligned sign type (no shadow: it sits on its own black plate). */
const sign = (px: number, weight = 800, tracking = 0.02): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, lineHeight: 1, letterSpacing: `${tracking}em`, whiteSpace: "nowrap", color: "#fff" });

/** The round route bullet: his club's colour edged in white, a number (or the crest) inside. */
function Bullet({ size, k, ink, text, crest }: { size: number; k: number; ink: string; text: string; crest?: string | null }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: text ? ink : "#fff", border: `${4 * k}px solid #fff`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {text ? <div style={sign(size * (text.length > 2 ? 0.34 : 0.46), 800, 0)}>{text}</div> : crest ? <img src={crest} alt="" style={{ width: size * 0.66, height: size * 0.66, objectFit: "contain" }} /> : null}
    </div>
  );
}

/**
 * The black station sign of the New York subway (Gretel's NYCFC identity draws on its pre-war IND signage): a thin
 * white rule along the top, a round route bullet on the left and the words set flush left beside it.
 */
function SignPlate({ k, bullet, lines }: { k: number; bullet: ReactNode; lines: ReactNode }) {
  return (
    <div style={{ width: W, background: "#111316", borderRadius: 8 * k, padding: `${14 * k}px ${30 * k}px ${30 * k}px`, boxShadow: "0 10px 34px rgba(0,0,0,.45)", boxSizing: "border-box" }}>
      <div style={{ height: 4 * k, background: "#fff", marginBottom: 24 * k }} />
      <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
        {bullet}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>{lines}</div>
      </div>
    </div>
  );
}

/**
 * Sinalética (matchday), after Gretel's New York City FC identity (lettering from the 1930s IND subway signs): the
 * game as a black station sign above his head — the round number in a route bullet of his club's colour, MATCHDAY,
 * the fixture and date · kick-off · ground flush left. No round number: his crest in a white bullet.
 */
export function Subwaysign({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const fx = natFixture(data);
  const ink = clubInk(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const fixture = fixtureOf(data);
  const b = 112 * k;
  const inner = W - 60 * k - b - 26 * k;
  const when = [fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = Math.min(64 * k * ts, inner / Math.max(1, word.length * 0.66));
  const fPx = fit(fixture, 26 * k * ts, inner, 0.04);
  const wPx = fit(when, 26 * k * ts, inner, 0.06);
  const vPx = fit(fx.venue.toUpperCase(), 26 * k * ts, inner, 0.06);
  const linesH = tPx + (fixture ? 14 * k + fPx : 0) + (when ? 12 * k + wPx : 0) + (fx.venue ? 8 * k + vPx : 0);
  const blockH = 14 * k + 4 * k + 24 * k + Math.max(b, linesH) + 30 * k;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <SignPlate
        k={k}
        bullet={<Bullet size={b} k={k} ink={ink} text={f.roundNo} crest={data.club?.crestUrl} />}
        lines={
          <>
            <div style={sign(tPx, 800, 0.01)}>{word}</div>
            {fixture && <div style={{ ...sign(fPx, 700, 0.04), marginTop: 14 * k }}>{fixture}</div>}
            {when && <div style={{ ...sign(wPx, 600, 0.06), marginTop: 12 * k, opacity: 0.86 }}>{when}</div>}
            {fx.venue && <div style={{ ...sign(vPx, 600, 0.06), marginTop: 8 * k, opacity: 0.86 }}>{fx.venue.toUpperCase()}</div>}
          </>
        }
      />
    </Top>
  );
}

/** Golo · sinalética (goal): the same station sign — his shirt number in the route bullet (else his crest), GOAL, his name and exact club. */
export function Goalsubwaysign({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const no = (data.player?.number ?? "").trim();
  const b = 124 * k;
  const inner = W - 60 * k - b - 26 * k;
  const gPx = Math.min(96 * k * ts, inner / Math.max(1, word.length * 0.66));
  const nPx = fit(name, 30 * k * ts, inner, 0.04);
  const cPx = fit(club, 26 * k * ts, inner, 0.06);
  const linesH = gPx + 16 * k + nPx + (club ? 10 * k + cPx : 0);
  const blockH = 14 * k + 4 * k + 24 * k + Math.max(b, linesH) + 30 * k;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <SignPlate
        k={k}
        bullet={<Bullet size={b} k={k} ink={ink} text={no} crest={data.club?.crestUrl} />}
        lines={
          <>
            <div style={sign(gPx, 800, 0.01)}>{word}</div>
            <div style={{ ...sign(nPx, 700, 0.04), marginTop: 16 * k }}>{name}</div>
            {club && <div style={{ ...sign(cPx, 600, 0.06), marginTop: 10 * k, opacity: 0.86 }}>{club}</div>}
          </>
        }
      />
    </Top>
  );
}

/**
 * Linha (matchday), after Gretel's NYCFC identity (colours and lettering taken from the subway lines): the game drawn
 * as a route — a thick line in his club's colour edged in white, home and away as the two stations with their
 * crests over them and exact names under — with MATCHDAY 14 above and date · kick-off · ground below.
 */
export function Routeline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const ink = clubInk(data);
  const title = roundTitle(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const wPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const tPx = Math.min(56 * k * ts, W / Math.max(1, title.length * 0.6));
  const cr = 40 * k;
  const stop = 30 * k;
  const half = W / 2 - 20 * k;
  const nPx = Math.min(26 * k * ts, fit(fx.homeName.toUpperCase(), 26 * k * ts, half - cr - 12 * k, 0.08), fit(fx.awayName.toUpperCase(), 26 * k * ts, half - cr - 12 * k, 0.08));
  const hasTeams = !!(fx.homeName && fx.awayName);
  const routeH = hasTeams ? stop + 16 * k + Math.max(cr, nPx) : 0;
  const whenH = when.length ? when.length * wPx + (when.length - 1) * 10 * k : 0;
  const blockH = tPx + (hasTeams ? 28 * k + routeH : 0) + (whenH ? 24 * k + whenH : 0);
  // Under each stop: its crest and exact name, home reading from the left, away from the right.
  const station = (crest: string | null, name: string, right: boolean) => (
    <div style={{ display: "flex", flexDirection: right ? "row-reverse" : "row", alignItems: "center", gap: 12 * k, width: half, marginTop: stop + 16 * k }}>
      {crest && <img src={crest} alt="" style={{ width: cr, height: cr, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
      <div style={{ ...caps(nPx, 0.08), paddingLeft: 0, fontWeight: 800 }}>{name.toUpperCase()}</div>
    </div>
  );
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ ...caps(tPx, 0.04), fontFamily: SANS, fontWeight: 900 }}>{title}</div>
      {hasTeams && (
        <div style={{ position: "relative", width: W, height: routeH, marginTop: 28 * k }}>
          {/* The line between the two stops, then the stops (white discs ringed in the line's colour). */}
          <div style={{ position: "absolute", left: stop / 2, right: stop / 2, top: stop / 2 - 7 * k, height: 14 * k, background: ink, border: `${3 * k}px solid #fff`, borderRadius: 7 * k, boxSizing: "border-box", boxShadow: "0 3px 14px rgba(0,0,0,.35)" }} />
          {[0, W - stop].map((x, i) => (
            <div key={i} style={{ position: "absolute", left: x, top: 0, width: stop, height: stop, borderRadius: "50%", background: "#fff", border: `${7 * k}px solid ${ink}`, boxSizing: "border-box", boxShadow: "0 0 0 3px #fff" }} />
          ))}
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between" }}>
            {station(fx.homeCrest, fx.homeName, false)}
            {station(fx.awayCrest, fx.awayName, true)}
          </div>
        </div>
      )}
      {when.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24 * k }}>
          {when.map((l, i) => (
            <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 0, opacity: 0.94 }}>{l}</div>
          ))}
        </div>
      )}
    </Top>
  );
}

/**
 * A number as printed on an old shirt — the lettering Solstices Studio and Blaze Type drew from the French team's
 * historic jerseys: heavy slab figures in white, with a second copy in his club's colour (white-edged) offset behind.
 */
function KitFigures({ text, px, k, ink }: { text: string; px: number; k: number; ink: string }) {
  const base: CSSProperties = { fontFamily: SLAB, fontSize: px, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap" };
  const off = Math.max(6, px * 0.05);
  return (
    <div style={{ position: "relative", height: px * 1.02 + off, paddingRight: off }}>
      <div style={{ ...base, position: "absolute", left: off, top: off, color: ink, WebkitTextStroke: `${3 * k}px #fff` }}>{text}</div>
      <div style={{ ...base, position: "relative", color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>{text}</div>
    </div>
  );
}

/**
 * Número de camisola (matchday), after Solstices Studio and Blaze Type's French team identity (lettering taken from
 * historic jerseys): MATCHDAY spaced small, the round number in old shirt figures, then the fixture and date ·
 * kick-off · ground. No round number: the competition or MATCHDAY in the same slab letters, smaller.
 */
export function Kitnumeral({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const ink = clubInk(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const fixture = fixtureOf(data);
  const figure = f.roundNo || roundTitle(data);
  const big = !!f.roundNo;
  const nPx = big ? 100 * k * ts : Math.min(64 * k * ts, W / Math.max(1, figure.length * 0.7));
  const lPx = 24 * k * ts;
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const wPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const whenH = when.length ? when.length * wPx + (when.length - 1) * 10 * k : 0;
  const figH = nPx * 1.02 + Math.max(6, nPx * 0.05);
  const blockH = (big ? lPx + 14 * k : 0) + figH + (fixture ? 20 * k + fPx : 0) + (whenH ? 14 * k + whenH : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      {big && <div style={{ ...caps(lPx, 0.34), fontWeight: 700, marginBottom: 14 * k }}>{word}</div>}
      <KitFigures text={figure} px={nPx} k={k} ink={ink} />
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 20 * k }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 14) * k, opacity: 0.94 }}>{l}</div>
      ))}
    </Top>
  );
}

/**
 * Golo · número de camisola (goal): GOAL spaced small over his shirt number in the old jersey figures, his name and
 * exact club under it. No number on record: GOAL itself in the slab figures.
 */
export function Goalkitnumeral({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const no = (data.player?.number ?? "").trim();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const figure = no || word;
  const nPx = no ? 170 * k * ts : Math.min(130 * k * ts, W / Math.max(1, word.length * 0.75));
  const lPx = 28 * k * ts;
  const mPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const figH = nPx * 1.02 + Math.max(6, nPx * 0.05);
  const blockH = (no ? lPx + 18 * k : 0) + figH + 24 * k + mPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      {no && <div style={{ ...caps(lPx, 0.4), fontWeight: 800, marginBottom: 18 * k, textShadow: SHADOW }}>{word}</div>}
      <KitFigures text={figure} px={nPx} k={k} ink={ink} />
      <div style={{ ...caps(mPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}
