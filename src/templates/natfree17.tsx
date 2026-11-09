/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { isoFromShortDate } from "@/lib/timezone";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const DMSERIF = "var(--font-dmserif), Georgia, serif";
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/**
 * A row of split-flap tiles, like a station departure board: one dark tile per character, a hairline across the
 * middle where the flap folds, white condensed figures. A colon or a space gets a narrow tile.
 */
function Flaps({ text, h }: { text: string; h: number }) {
  const w = h * 0.7;
  return (
    <div style={{ display: "flex", gap: h * 0.08, filter: "drop-shadow(0 6px 16px rgba(0,0,0,.45))" }}>
      {[...text].map((ch, i) => {
        const narrow = ch === ":" || ch === " ";
        return (
          <div
            key={i}
            style={{
              position: "relative",
              width: narrow ? w * 0.42 : w,
              height: h,
              borderRadius: h * 0.08,
              background: narrow ? "transparent" : "linear-gradient(#1d2127 0 49.4%, #121519 50.6% 100%)",
              border: narrow ? "none" : "1px solid rgba(255,255,255,.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: DISPLAY,
              fontSize: h * 0.78,
              lineHeight: 1,
              color: "#fff",
            }}
          >
            {ch}
            {!narrow && <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: Math.max(2, h * 0.018), background: "rgba(0,0,0,.65)" }} />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Natural · painel de partidas (matchday): the local kick-off set in split-flap tiles above his head, like a
 * departure board, MATCHDAY 14 in small caps over it; the fixture (exact names), then date · second clock ·
 * ground. No kick-off time on record: the date goes on the tiles instead.
 */
export function Natsplitflap({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tiles = (/^\d{1,2}:\d{2}$/.test(fx.time) ? fx.time : fx.date).toUpperCase();
  const under = [fx.date && tiles !== fx.date.toUpperCase() ? fx.date : "", fx.ptTime, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const lPx = fit(title, 28 * k * ts, W, 0.24);
  const fh = Math.min(118 * k * ts, W / Math.max(1, [...tiles].length * 0.8));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const uPx = fit(under, 21 * k * ts, W * 0.92, 0.16);
  const blockH = lPx + 22 * k + fh + (fixture ? 26 * k + fPx : 0) + (under ? 14 * k + uPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ ...caps(lPx, 0.24), fontWeight: 800 }}>{title}</div>
        <div style={{ marginTop: 22 * k }}>
          <Flaps text={tiles} h={fh} />
        </div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
        {under && <div style={{ ...caps(uPx, 0.16), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{under}</div>}
      </Shade>
    </Top>
  );
}

/** Golo natural · painel de partidas (goal): GOAL on the split-flap tiles above his celebration, his name and exact club under it. */
export function Goalnatsplitflap({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const fh = Math.min(130 * k * ts, W / Math.max(1, [...word].length * 0.8));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = fh + 28 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Flaps text={word} h={fh} />
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 28 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/** His last game before this one, when it was a win: "W 2–0 V SEPTEMVRI SOFIA". A draw or a defeat is never shown. */
function lastWin(data: RenderData): string | null {
  const iso = isoFromShortDate(data.content.date) ?? new Date().toISOString().slice(0, 10);
  const last = data.matches.filter((m) => m.date < iso).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!last || last.goalsFor <= last.goalsAgainst || !last.opponent) return null;
  return `W ${last.goalsFor}–${last.goalsAgainst}  ·  V ${last.opponent.toUpperCase()}`;
}

/**
 * Natural · última vitória (matchday): MATCHDAY 14, the fixture and date · kick-off · ground above his head, then
 * "LAST TIME OUT" over his previous game — only when it was a win ("W 2–0 · V SEPTEMVRI SOFIA"); otherwise the
 * line is left out and the look is the fixture alone.
 */
export function Natprevious({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const win = lastWin(data);
  const tPx = Math.min(80 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const lPx = 20 * k * ts;
  const wPx = win ? fit(win, 26 * k * ts, W * 0.9, 0.12) : 0;
  const blockH = tPx + (fixture ? 22 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0) + (win ? 30 * k + lPx + 12 * k + wPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={300}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 22 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
        ))}
        {win && (
          <>
            <div style={{ ...caps(lPx, 0.3), fontWeight: 700, marginTop: 30 * k, opacity: 0.85 }}>LAST TIME OUT</div>
            <div style={{ ...caps(wPx, 0.12), fontWeight: 800, marginTop: 12 * k }}>{win}</div>
          </>
        )}
      </Shade>
    </Top>
  );
}

const ONES = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
const MINS: Record<number, string> = { 5: "oh five", 10: "ten", 15: "fifteen", 20: "twenty", 25: "twenty-five", 30: "thirty", 35: "thirty-five", 40: "forty", 45: "forty-five", 50: "fifty", 55: "fifty-five" };

/** "17:00" → "Five p.m.", "19:30" → "Seven thirty p.m.", "12:00" → "Midday"; times off the five-minute grid → null. */
function inWords(t: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (min && !MINS[min]) return null;
  if (h === 12 && !min) return "Midday";
  const s = `${ONES[h % 12]}${min ? ` ${MINS[min]}` : ""} ${h < 12 ? "a.m." : "p.m."}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Natural · hora por extenso (matchday): the local kick-off spelled out in DM Serif above his head ("Five p.m."),
 * KICK-OFF small over it; the fixture, then the figures with the second clock, the date and the ground in caps.
 * No time on record (or an odd minute): MATCHDAY 14 takes the serif line.
 */
export function Natkickoffword({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const words = inWords(fx.time);
  const big = words ?? roundTitle(data);
  const label = words ? `KICK-OFF  ·  ${roundTitle(data)}` : "";
  const fixture = fixtureOf(data);
  const facts = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const lPx = label ? fit(label, 22 * k * ts, W, 0.24) : 0;
  const bPx = Math.min(104 * k * ts, W / Math.max(1, big.length * 0.46));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const uPx = fit(facts, 21 * k * ts, W * 0.94, 0.16);
  const blockH = (label ? lPx + 18 * k : 0) + bPx + (fixture ? 24 * k + fPx : 0) + (facts ? 14 * k + uPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        {label && <div style={{ ...caps(lPx, 0.24), fontWeight: 700, opacity: 0.9 }}>{label}</div>}
        <div style={{ fontFamily: DMSERIF, fontSize: bPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: label ? 18 * k : 0 }}>{big}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 24 * k }}>{fixture}</div>}
        {facts && <div style={{ ...caps(uPx, 0.16), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{facts}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Golo natural · legenda de museu (goal): a small white gallery label above his celebration, as if the photo hung on
 * a wall — "Goal" in italic DM Serif, his name, his exact club and the year, in dark ink. Its own panel: it reads
 * over any sky and never sits on his face.
 */
export function Goalnatplacard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const raw = data.content.kicker || "Goal";
  const word = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const club = ourClub(data);
  const iso = isoFromShortDate(data.content.date);
  const when = iso ? `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : "";
  const cw = 620 * k;
  const inner = cw - 2 * 40 * k;
  const gPx = Math.min(74 * k * ts, inner / Math.max(1, word.length * 0.5));
  const nPx = Math.min(34 * k * ts, inner / Math.max(1, name.length * 0.56));
  const cPx = Math.min(26 * k * ts, inner / Math.max(1, club.length * 0.56));
  const yPx = 22 * k * ts;
  const pad = 36 * k;
  const blockH = pad * 2 + gPx + 39 * k + nPx + (club ? 12 * k + cPx : 0) + (when ? 18 * k + yPx : 0);
  const ink = "#16181c";
  return (
    <Top data={data} blockH={blockH} drop={300}>
      <div style={{ width: cw, padding: `${pad}px ${40 * k}px`, boxSizing: "border-box", background: "#f7f6f2", borderRadius: 6 * k, boxShadow: "0 10px 34px rgba(0,0,0,.35)", color: ink, textAlign: "left" }}>
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ width: 54 * k, height: 3 * k, background: ink, marginTop: 18 * k }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: nPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 18 * k }}>{name}</div>
        {club && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 12 * k }}>{club}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: yPx, lineHeight: 1, letterSpacing: "0.12em", marginTop: 18 * k, opacity: 0.7 }}>{when}</div>}
      </div>
    </Top>
  );
}
