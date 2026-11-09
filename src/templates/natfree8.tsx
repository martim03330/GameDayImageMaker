/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const roundLabel = (data: RenderData) => {
  const f = matchFacts(data);
  return f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
};
const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
const column = (top: number): CSSProperties => ({ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" });
const pool = (top: number, blockH: number) => ({ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 });
const fixtureOf = (data: RenderData) => {
  const fx = natFixture(data);
  return fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
};

/** His position in English caps: render data already carries it in English ("Right winger"); a Portuguese one is translated. */
export function positionWords(pos: string): string {
  const p = pos.toLowerCase();
  if (/head coach/.test(p)) return "";
  if (/keeper|back|midfielder|winger|striker/.test(p)) return pos.toUpperCase();
  if (/guarda/.test(p)) return "GOALKEEPER";
  if (/defesa esquerdo|lateral esquerdo/.test(p)) return "LEFT BACK";
  if (/defesa direito|lateral direito/.test(p)) return "RIGHT BACK";
  if (/defesa|central/.test(p)) return "CENTRE BACK";
  if (/médio defensivo|trinco/.test(p)) return "DEFENSIVE MIDFIELDER";
  if (/médio ofensivo/.test(p)) return "ATTACKING MIDFIELDER";
  if (/médio/.test(p)) return "CENTRAL MIDFIELDER";
  if (/extremo esquerdo/.test(p)) return "LEFT WINGER";
  if (/extremo direito/.test(p)) return "RIGHT WINGER";
  if (/ponta|avançado/.test(p)) return "STRIKER";
  return "";
}

/**
 * Natural · caminho (matchday): the season so far as a row of small dots above his head, one per matchday,
 * the current one ringed in the club's colour; MATCHDAY 14 over it, the fixture and date · kick-off · ground under.
 */
export function Natseasondots({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const n = Math.min(46, Number(matchFacts(data).roundNo) || 0);
  const step = n ? Math.min(40 * k, W / n) : 0;
  const dot = step * 0.42;
  const fixture = fixtureOf(data);
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const rPx = 26 * k * ts;
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const sPx = fit(when, 21 * k * ts, W, 0.16);
  const rowH = n ? dot * 2.2 : 0;
  const blockH = rPx + (n ? 30 * k + rowH : 0) + 30 * k + fPx + 16 * k + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  const ink = clubInk(data);
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ ...caps(rPx, 0.3), fontWeight: 800 }}>{roundLabel(data)}</div>
        {n > 0 && (
          <div style={{ display: "flex", alignItems: "center", height: rowH, marginTop: 30 * k }}>
            {Array.from({ length: n }, (_, i) => {
              const now = i === n - 1;
              const s = now ? dot * 2 : dot;
              return (
                <div key={i} style={{ width: step, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: s, height: s, borderRadius: "50%", background: now ? ink : "rgba(255,255,255,.78)", border: now ? `${Math.max(2, 3 * k)}px solid #fff` : "none", boxShadow: "0 1px 6px rgba(0,0,0,.4)" }} />
                </div>
              );
            })}
          </div>
        )}
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 30 * k }}>{fixture}</div>}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.94 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · forma (matchday): his last five games as five small discs above his head (W in the club's colour,
 * D outlined, L faint), newest on the right, "LAST FIVE" right above them; MATCHDAY 14, the fixture and the facts.
 */
export function Natform({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const last = data.matches.slice(0, 5).reverse();
  const res = last.map((m) => (m.goalsFor > m.goalsAgainst ? "W" : m.goalsFor < m.goalsAgainst ? "L" : "D"));
  const disc = 62 * k;
  const fixture = fixtureOf(data);
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = Math.min(64 * k * ts, W / Math.max(1, roundLabel(data).length * 0.5));
  const lPx = 20 * k * ts;
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const sPx = fit(when, 21 * k * ts, W, 0.16);
  const blockH = tPx + (res.length ? 34 * k + lPx + 14 * k + disc : 0) + 32 * k + fPx + 16 * k + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  const ink = clubInk(data);
  const look = (r: string): CSSProperties =>
    r === "W" ? { background: ink, border: "2px solid rgba(255,255,255,.9)" } : r === "D" ? { background: "rgba(0,0,0,.25)", border: "2px solid rgba(255,255,255,.9)" } : { background: "rgba(0,0,0,.45)", border: "2px solid rgba(255,255,255,.35)", opacity: 0.85 };
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{roundLabel(data)}</div>
        {res.length > 0 && (
          <>
            <div style={{ ...caps(lPx, 0.3), marginTop: 34 * k, opacity: 0.9 }}>LAST {["", "ONE", "TWO", "THREE", "FOUR", "FIVE"][res.length]}</div>
            <div style={{ display: "flex", gap: 16 * k, marginTop: 14 * k }}>
              {res.map((r, i) => (
                <div key={i} style={{ width: disc, height: disc, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 26 * k, boxShadow: "0 2px 10px rgba(0,0,0,.35)", ...look(r) }}>
                  {r}
                </div>
              ))}
            </div>
          </>
        )}
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 32 * k }}>{fixture}</div>}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.94 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/** A thin map pin (line drawing). */
function Pin({ size }: { size: number }) {
  return (
    <svg width={size * 0.72} height={size} viewBox="0 0 36 50" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }}>
      <path d="M18 48 C 9 34, 3 26, 3 17 A 15 15 0 0 1 33 17 C 33 26, 27 34, 18 48 Z" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinejoin="round" />
      <circle cx={18} cy={17} r={5.5} fill="none" stroke="#fff" strokeWidth={2.6} />
    </svg>
  );
}

/**
 * Natural · local (matchday): where the game is played as the headline — a thin map pin, the ground's name
 * in DM Serif, then the fixture and MATCHDAY 14 · date · kick-off. No ground known: the fixture takes its place.
 */
export function Natvenuepin({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const venue = (data.content.venue || "").trim();
  const fixture = fixtureOf(data);
  const head = venue || [fx.homeName, fx.awayName].filter(Boolean).join(" v ");
  const vPx = Math.min(70 * k * ts, W / Math.max(1, head.length * 0.5));
  const under = [roundLabel(data), fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const sPx = fit(under, 21 * k * ts, W, 0.16);
  const pin = 64 * k;
  const blockH = pin + 24 * k + vPx + 28 * k + (venue && fixture ? fPx + 16 * k : 0) + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <Pin size={pin} />
        <div style={{ fontFamily: SERIF, fontSize: vPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 24 * k, textShadow: SHADOW }}>{head}</div>
        {venue && fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
        {under && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: venue && fixture ? 16 * k : 28 * k, opacity: 0.94 }}>{under}</div>}
      </div>
    </PoolFrame>
  );
}

/** His league goals since the season started (1 July), from the games on record. */
function seasonGoals(data: RenderData): number {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1, 6, 1)).toISOString().slice(0, 10);
  return data.matches.filter((m) => m.date >= start).reduce((a, m) => a + (m.goals || 0), 0);
}
const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;

/**
 * Golo natural · conta da época (goal): which of his goals this season it is, as a short serif line
 * ("5th goal of the season"), GOAL small right above it; his name and exact club under. No tally on record: "Goal".
 */
export function Goalnatseason({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const W = CANVAS_W - 120;
  const n = seasonGoals(data);
  const line = n > 0 ? `${ordinal(n)} goal of the season` : "Goal";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const lPx = Math.min(72 * k * ts, W / Math.max(1, line.length * 0.46));
  const gPx = 22 * k * ts;
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = (n > 0 ? gPx + 18 * k : 0) + lPx + 30 * k + nPx + 14 * k + cPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        {n > 0 && <div style={{ ...caps(gPx, 0.34), fontWeight: 800 }}>{(data.content.kicker || "Goal").toUpperCase()}</div>}
        <div style={{ fontFamily: SERIF, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: n > 0 ? 18 * k : 0, textShadow: SHADOW }}>{line}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Golo natural · perfil (goal): GOAL in Anton, his name, then his card in one line — shirt number and position
 * ("Nº 7 · RIGHT WINGER") — and his exact club, all above his head.
 */
export function Goalnatprofile({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const card = [data.player.number && `Nº ${data.player.number}`, positionWords(data.player.position)].filter(Boolean).join("  ·  ");
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(120 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 34 * k * ts, W, 0.1);
  const pPx = fit(card, 22 * k * ts, W, 0.24);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = gPx + 26 * k + nPx + (card ? 22 * k + pPx : 0) + 14 * k + cPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        <div style={{ ...caps(nPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
        {card && <div style={{ ...caps(pPx, 0.24), fontWeight: 600, marginTop: 22 * k, opacity: 0.94 }}>{card}</div>}
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}
