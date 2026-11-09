/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { isoFromShortDate } from "@/lib/timezone";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace, pickTextSpot } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
export const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
export const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
export const column = (top: number): CSSProperties => ({ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" });
export const pool = (top: number, blockH: number) => ({ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 });
export const roundTitle = (data: RenderData) => {
  const f = matchFacts(data);
  const k = (data.content.kicker || "Matchday").toUpperCase();
  return f.roundNo ? `${k} ${f.roundNo}` : f.comp.toUpperCase() || k;
};
export const fixtureOf = (data: RenderData) => {
  const fx = natFixture(data);
  return fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
};
/** Date · kick-off · ground on one line, or on two (date · kick-off / ground) when one would shrink under ~26px. */
export const whenRows = (data: RenderData, max: number, w: number, tracking: number): string[] => {
  const fx = natFixture(data);
  const one = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  if (!one || fit(one, max, w, tracking) >= Math.min(max, 26)) return one ? [one] : [];
  return [[fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase(), fx.venue.toUpperCase()].filter(Boolean);
};
export const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
/** Games on record up to the edit's own date, newest first (an old edit never counts later games). */
const gamesUpTo = (data: RenderData) => {
  const iso = isoFromShortDate(data.content.date) ?? new Date().toISOString().slice(0, 10);
  return data.matches.filter((m) => m.date <= iso).sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Where the type block goes: above his head when the photo lets him stand below it. When his head stays high
 * (little room above it in the photo), the block moves down — to the height that covers the least of him and
 * of the other players in the shot (pickTextSpot over a few heights down to just above the logo; never his
 * face). `foot` = it left the top (looks give it a panel of its own there); `crowded` = even that spot sits
 * over someone.
 */
export function placed(data: RenderData, blockH: number, drop: number) {
  const { H, story, k, fx: faceX, top } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? drop : drop - 90), fs: story ? 205 : 145 });
  const head = place.fy - place.fs * 0.8;
  if (head >= top + blockH - 6 * k) return { place, y: top, foot: false, crowded: false };
  const lowest = Math.max(top, logoTopOf(data, H) - 90 * k - blockH);
  // The foot first (the old behaviour wins a tie), then heights stepping up towards the top.
  const ys = [lowest, ...Array.from({ length: 5 }, (_, i) => lowest - ((lowest - top) * (i + 1)) / 6)];
  const spot = pickTextSpot(place, ys.map((y) => ({ x0: 60, y0: y, x1: CANVAS_W - 60, y1: y + blockH })));
  return { place, y: spot.rect.y0, foot: true, crowded: spot.crowded };
}

/** The faint club crest behind the type, centred in the sky above his head. */
function CrestMark({ src, top, size }: { src: string; top: number; size: number }) {
  return <img src={src} alt="" style={{ position: "absolute", left: (CANVAS_W - size) / 2, top, width: size, height: size, objectFit: "contain", opacity: 0.26, filter: "grayscale(1) brightness(1.9)", pointerEvents: "none" }} />;
}

/**
 * Natural · marca d'água (matchday): his club's crest large and faint in the sky, like a watermark, with
 * MATCHDAY 14 in Anton, the fixture (exact names) and date · kick-off · ground over it; he stands below.
 */
export function Natcrestmark({ data }: { data: RenderData }) {
  const { H, k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const tPx = Math.min(84 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const whenH = when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0;
  const blockH = tPx + 34 * k + fPx + 16 * k + whenH;
  const { place, y } = placed(data, blockH, 300);
  const crest = data.club?.crestUrl;
  const size = (blockH + 120 * k) * 1.05;
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(y, blockH)}>
      {crest && <CrestMark src={crest} top={y + blockH / 2 - size / 2} size={size} />}
      <div style={column(y)}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 34 * k }}>{fixture}</div>}
        {when.map((l, i) => (
          <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
        ))}
      </div>
    </PoolFrame>
  );
}

/** Golo natural · marca d'água (goal): the same faint crest in the sky, GOAL in Anton, his name and exact club over it. */
export function Goalnatcrestmark({ data }: { data: RenderData }) {
  const { H, k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const tPx = Math.min(120 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = tPx + 30 * k + nPx + 14 * k + cPx;
  const { place, y } = placed(data, blockH, 310);
  const crest = data.club?.crestUrl;
  const size = (blockH + 120 * k) * 1.05;
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(y, blockH)}>
      {crest && <CrestMark src={crest} top={y + blockH / 2 - size / 2} size={size} />}
      <div style={column(y)}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}

/** His last game against this opponent before the fixture, from the games on record (null when there is none). */
function lastMeeting(data: RenderData): string | null {
  const fx = natFixture(data);
  const opp = (data.content.home === false ? fx.homeName : fx.awayName).trim().toLowerCase();
  if (!opp) return null;
  const m = gamesUpTo(data).find((g) => g.opponent.trim().toLowerCase() === opp);
  if (!m) return null;
  const r = m.goalsFor > m.goalsAgainst ? "W" : m.goalsFor < m.goalsAgainst ? "L" : "D";
  const [y, mo, d] = m.date.split("-").map(Number);
  return `${r} ${m.goalsFor}–${m.goalsAgainst}  ·  ${d} ${MON[mo - 1]} ${y}`;
}

/**
 * Natural · último confronto (matchday): MATCHDAY 14, the fixture and its facts, then his last game against
 * the same opponent on record ("LAST MEETING" over "W 2–0 · 12 APR 2026"). Never met on record: that line is left out.
 */
export function Natlastmeet({ data }: { data: RenderData }) {
  const { H, k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const last = lastMeeting(data);
  const tPx = Math.min(68 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const whenH = when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0;
  const lPx = 20 * k * ts;
  const mPx = fit(last ?? "", 26 * k * ts, W, 0.12);
  const blockH = tPx + 32 * k + fPx + 16 * k + whenH + (last ? 34 * k + lPx + 12 * k + mPx : 0);
  const { place, y } = placed(data, blockH, 290);
  const ink = clubInk(data);
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(y, blockH)}>
      <div style={column(y)}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 32 * k }}>{fixture}</div>}
        {when.map((l, i) => (
          <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
        ))}
        {last && (
          <div style={{ marginTop: 34 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
              <div style={{ width: 34 * k, height: 3, background: ink, boxShadow: "0 0 0 1px rgba(255,255,255,.5)" }} />
              <div style={{ ...caps(lPx, 0.3), opacity: 0.9 }}>LAST MEETING</div>
              <div style={{ width: 34 * k, height: 3, background: ink, boxShadow: "0 0 0 1px rgba(255,255,255,.5)" }} />
            </div>
            <div style={{ ...caps(mPx, 0.12), fontWeight: 800 }}>{last}</div>
          </div>
        )}
      </div>
    </PoolFrame>
  );
}

/** How many games in a row he has scored in, up to the edit's date (from the games on record). */
function scoringRun(data: RenderData): number {
  let n = 0;
  for (const g of gamesUpTo(data)) {
    if (!(g.goals > 0)) break;
    n++;
  }
  return n;
}

/**
 * Golo natural · série (goal): GOAL in Anton and, when he has scored in two or more games in a row on record,
 * that run in a thin outlined pill under it ("IN 3 STRAIGHT GAMES"); his name and exact club below.
 */
export function Goalnatstreak({ data }: { data: RenderData }) {
  const { H, k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const run = scoringRun(data);
  const pill = run >= 2 ? `IN ${run} STRAIGHT GAMES` : "";
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const tPx = Math.min(116 * k * ts, W / Math.max(1, word.length * 0.5));
  const pPx = 22 * k * ts;
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const pillH = pPx + 26 * k;
  const blockH = tPx + (pill ? 24 * k + pillH : 0) + 30 * k + nPx + 14 * k + cPx;
  const { place, y } = placed(data, blockH, 310);
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(y, blockH)}>
      <div style={column(y)}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        {pill && (
          <div style={{ marginTop: 24 * k, height: pillH, padding: `0 ${26 * k}px`, borderRadius: pillH / 2, border: "2px solid rgba(255,255,255,.92)", background: "rgba(0,0,0,.22)", display: "flex", alignItems: "center" }}>
            <div style={{ ...caps(pPx, 0.22), fontWeight: 800 }}>{pill}</div>
          </div>
        )}
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · monograma (matchday): his initials in DM Serif inside a thin ring, like a personal mark, above
 * MATCHDAY 14, the fixture and date · kick-off · ground; he stands below.
 */
export function Natmonogram({ data }: { data: RenderData }) {
  const { H, k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const initials = [data.content.firstName, data.content.lastName].map((w) => (w ?? "").trim().charAt(0).toUpperCase()).join("");
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const ring = initials ? 96 * k : 0;
  const tPx = 30 * k * ts;
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const whenH = when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0;
  const blockH = (ring ? ring + 24 * k : 0) + tPx + 26 * k + fPx + 16 * k + whenH;
  const { place, y } = placed(data, blockH, 290);
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(y, blockH)}>
      <div style={column(y)}>
        {initials && (
          <div style={{ width: ring, height: ring, borderRadius: "50%", border: "2px solid rgba(255,255,255,.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 14px rgba(0,0,0,.35)", marginBottom: 24 * k }}>
            <div style={{ fontFamily: SERIF, fontSize: ring * 0.42, lineHeight: 1, letterSpacing: "0.04em", textShadow: SHADOW }}>{initials}</div>
          </div>
        )}
        <div style={{ ...caps(tPx, 0.34), fontWeight: 800 }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
        {when.map((l, i) => (
          <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
        ))}
      </div>
    </PoolFrame>
  );
}
