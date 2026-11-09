import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { caps, column, fit, fixtureOf, fullName, placed, pool, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const HAIR = "rgba(255,255,255,.92)";

/**
 * The type block above his head on a soft shade. When his head stays high in the photo the block drops to the
 * foot (see placed) and lands over his body or other players, so there it sits on a dark panel of its own.
 */
export function Top({ data, blockH, drop, align = "center", children }: { data: RenderData; blockH: number; drop: number; align?: "center" | "stretch"; children: ReactNode }) {
  const { H, k } = frameOf(data);
  const { place, y, foot } = placed(data, blockH, drop);
  return (
    <PoolFrame data={data} place={place} H={H} pool={foot ? null : pool(y, blockH)}>
      {foot && (
        <div
          style={{ position: "absolute", left: 36, right: 36, top: y - 34 * k, height: blockH + 68 * k, borderRadius: 26 * k, background: "rgba(12,14,18,.66)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.14)" }}
        />
      )}
      <div style={align === "center" ? column(y) : { position: "absolute", left: 60, right: 60, top: y }}>{children}</div>
    </PoolFrame>
  );
}

/** "17:00" → hours as a fraction of the day (17.0), or null. */
const hoursOf = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  return m ? Number(m[1]) + Number(m[2]) / 60 : null;
};

/**
 * Natural · régua do dia (matchday): MATCHDAY 14 and the fixture above his head, then the day drawn as a fine
 * ruler from 00 to 24 (a tick per hour, longer every six) with a marker at the local kick-off and "KICK-OFF 17:00"
 * over it; the player's second clock and the ground under the ruler. No time on record: the ruler is left out.
 */
export function Natdayline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const hours = hoursOf(fx.time);
  const under = [fx.date, fx.ptTime, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = Math.min(68 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const mPx = 24 * k * ts;
  const uPx = fit(under, 21 * k * ts, W, 0.16);
  const rulerH = 26 * k;
  const blockH = tPx + 30 * k + fPx + (hours != null ? 40 * k + mPx + 14 * k + rulerH : 0) + 20 * k + uPx;
  const ink = clubInk(data);
  const RW = W - 40;
  const at = hours != null ? (hours / 24) * RW : 0;
  return (
    <Top data={data} blockH={blockH} drop={290}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 30 * k }}>{fixture}</div>}
        {hours != null && (
          <div style={{ position: "relative", width: RW, marginTop: 40 * k, height: mPx + 14 * k + rulerH }}>
            <div style={{ ...caps(mPx, 0.14), fontWeight: 800, position: "absolute", top: 0, left: Math.min(Math.max(at, 120 * k), RW - 120 * k), transform: "translateX(-50%)" }}>{`KICK-OFF ${fx.time}`}</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: HAIR }} />
            {Array.from({ length: 25 }, (_, h) => (
              <div key={h} style={{ position: "absolute", left: (h / 24) * RW, bottom: 0, width: 1.5, height: h % 6 ? rulerH * 0.35 : rulerH * 0.7, background: HAIR }} />
            ))}
            <div style={{ position: "absolute", left: at - 7 * k, bottom: -7 * k, width: 14 * k, height: 14 * k, borderRadius: "50%", background: ink, border: "2px solid #fff" }} />
          </div>
        )}
        {under && <div style={{ ...caps(uPx, 0.16), fontWeight: 600, marginTop: 20 * k, opacity: 0.94 }}>{under}</div>}
    </Top>
  );
}

/** A title with hairlines running from it to both edges of the frame. */
function Flanked({ text, px, font, k }: { text: string; px: number; font: "display" | "light"; k: number }) {
  const line = <div style={{ flex: 1, height: 2, background: HAIR, boxShadow: "0 1px 6px rgba(0,0,0,.35)" }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 * k, width: CANVAS_W - 2 * 30, marginLeft: -30, marginRight: -30 }}>
      {line}
      <div style={font === "display" ? { fontFamily: DISPLAY, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW } : { fontFamily: SANS, fontWeight: 300, fontSize: px, letterSpacing: "0.18em", paddingLeft: "0.18em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>
        {text}
      </div>
      {line}
    </div>
  );
}

/**
 * Natural · linhas laterais (matchday): "MATCHDAY 14" with hairlines running out to both edges, like a
 * broadcast slate, above his head; the fixture (exact names) and date · kick-off · ground under it.
 */
export function Natflankrules({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const tPx = Math.min(64 * k * ts, (W - 200) / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const whenH = when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0;
  const blockH = tPx + 32 * k + fPx + 16 * k + whenH;
  return (
    <Top data={data} blockH={blockH} drop={290}>
        <Flanked text={title} px={tPx} font="display" k={k} />
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 32 * k }}>{fixture}</div>}
        {when.map((l, i) => (
          <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
        ))}
    </Top>
  );
}

/**
 * Golo natural · linhas laterais (goal): GOAL in light wide caps between hairlines that run to both edges,
 * his name in bold caps and his exact club under it, above his head.
 */
export function Goalnathairlines({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const tPx = Math.min(78 * k * ts, (W - 220) / Math.max(1, word.length * 0.82));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = tPx + 32 * k + nPx + 14 * k + cPx;
  return (
    <Top data={data} blockH={blockH} drop={310}>
        <Flanked text={word} px={tPx} font="light" k={k} />
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 32 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}

/**
 * Natural · jornadas (matchday): the round as a small pager above his head — the rounds either side faded,
 * this one large in Anton between them ("‹ 13  14  15 ›"), MATCHDAY over it; the fixture and its facts under.
 * No round number on record: the title alone.
 */
export function Natpager({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const n = Number(f.roundNo);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const lPx = 22 * k * ts;
  const bPx = 96 * k * ts;
  const sidePx = 40 * k * ts;
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const whenH = when.length ? when.length * sPx + (when.length - 1) * 10 * k : 0;
  const hasRound = n > 0;
  const blockH = (hasRound ? lPx + 18 * k + bPx : Math.min(68 * k * ts, W / Math.max(1, word.length * 0.5))) + 30 * k + fPx + 16 * k + whenH;
  const side = (t: string) => <div style={{ fontFamily: DISPLAY, fontSize: sidePx, lineHeight: 1, opacity: 0.45, textShadow: SHADOW }}>{t}</div>;
  const chev = (c: string) => <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: sidePx, lineHeight: 1, opacity: 0.6, textShadow: SHADOW }}>{c}</div>;
  return (
    <Top data={data} blockH={blockH} drop={290}>
        {hasRound ? (
          <>
            <div style={{ ...caps(lPx, 0.34), opacity: 0.92 }}>{word}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 34 * k, marginTop: 18 * k }}>
              {chev("‹")}
              {n > 1 && side(String(n - 1))}
              <div style={{ fontFamily: DISPLAY, fontSize: bPx, lineHeight: 1, textShadow: SHADOW }}>{n}</div>
              {side(String(n + 1))}
              {chev("›")}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: DISPLAY, fontSize: Math.min(68 * k * ts, W / Math.max(1, word.length * 0.5)), lineHeight: 1, textShadow: SHADOW }}>{roundTitle(data)}</div>
        )}
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 30 * k }}>{fixture}</div>}
        {when.map((l, i) => (
          <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
        ))}
    </Top>
  );
}

/**
 * Golo natural · linha dividida (goal): one line above his head — GOAL in Anton at its left end, his name in
 * bold caps at its right end, a hairline joining them — and his exact club under the name.
 */
export function Goalnatsplitrule({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const tPx = 76 * k * ts;
  const nPx = fit(name, 30 * k * ts, W * 0.55, 0.1);
  const cPx = fit(club, 21 * k * ts, W * 0.6, 0.2);
  const blockH = tPx + 16 * k + cPx;
  return (
    <Top data={data} blockH={blockH} drop={310} align="stretch">
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k }}>
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
          <div style={{ flex: 1, height: 2, background: HAIR, boxShadow: "0 1px 6px rgba(0,0,0,.35)" }} />
          <div style={{ ...caps(nPx, 0.1), fontWeight: 800 }}>{name}</div>
        </div>
        {club && <div style={{ ...caps(cPx, 0.2), fontWeight: 600, marginTop: 16 * k, opacity: 0.94, textAlign: "right" }}>{club}</div>}
    </Top>
  );
}
