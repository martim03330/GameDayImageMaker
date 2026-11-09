/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Shade } from "./natfree16";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const SLAB = "var(--font-slab), Georgia, serif";

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/**
 * A thick bar ending in two slab serifs, like the foot of a stout slab letter blown up into a rule (Studio Dumbar/DEPT
 * built Feyenoord's secondary graphics from the skeleton and serifs of its stout Skrappa type). His club's colour,
 * edged in white.
 */
function SerifRule({ w, k, ink }: { w: number; k: number; ink: string }) {
  const bar = 16 * k;
  const foot = 46 * k;
  const fw = 26 * k;
  const sw = 4 * k;
  const h = foot + sw;
  const y0 = (h - bar) / 2;
  const d = `M ${sw / 2} ${sw / 2} H ${sw / 2 + fw} V ${y0} H ${w - sw / 2 - fw} V ${sw / 2} H ${w - sw / 2} V ${h - sw / 2} H ${w - sw / 2 - fw} V ${y0 + bar} H ${sw / 2 + fw} V ${h - sw / 2} H ${sw / 2} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", filter: "drop-shadow(0 4px 14px rgba(0,0,0,.4))" }}>
      <path d={d} fill={ink} stroke="#fff" strokeWidth={sw} strokeLinejoin="miter" />
    </svg>
  );
}

/**
 * Regra serifada (matchday), after Studio Dumbar/DEPT and Jacob Wise's Feyenoord identity (a stout slab-serif hero
 * type whose serifs come from the badge, and graphics built from its serifs): MATCHDAY 14 in a heavy slab serif over
 * a club-colour rule ending in two slab serifs; the fixture and date · kick-off · ground under it.
 */
export function Serifrule({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tPx = Math.min(80 * k * ts, W / Math.max(1, title.length * 0.66));
  const rw = Math.min(W, title.length * 0.66 * tPx);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const rh = 50 * k;
  const blockH = tPx + 24 * k + rh + (fixture ? 26 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
      <div style={{ fontFamily: SLAB, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      <div style={{ marginTop: 24 * k }}>
        <SerifRule w={rw} k={k} ink={clubInk(data)} />
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
      {when.rows.map((l, i) => (
        <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
      ))}
      </Shade>
    </Top>
  );
}

/** Golo · regra serifada (goal): GOAL in the heavy slab serif over the same serifed club-colour rule, his name and exact club under it. */
export function Goalserifrule({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(120 * k * ts, W / Math.max(1, word.length * 0.7));
  const rw = Math.min(W, Math.max(word.length * 0.7 * gPx, 420 * k));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const rh = 50 * k;
  const blockH = gPx + 24 * k + rh + 24 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
      <div style={{ fontFamily: SLAB, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ marginTop: 24 * k }}>
        <SerifRule w={rw} k={k} ink={clubInk(data)} />
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/** A dark card with faint diagonal stripes (a quiet texture, high contrast for the type on it). */
const STRIPES = "repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 14px, rgba(255,255,255,0) 14px 30px)";
function StripeCard({ k, children }: { k: number; children: ReactNode }) {
  return (
    <div style={{ width: W, padding: `${26 * k}px ${30 * k}px`, boxSizing: "border-box", borderRadius: 22 * k, background: `${STRIPES}, rgba(12,14,18,.74)`, border: "1px solid rgba(255,255,255,.16)", boxShadow: "0 12px 40px rgba(0,0,0,.35)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {children}
    </div>
  );
}
const CARD_PAD = 52;

/**
 * Cartão riscado (matchday), after the scoreboard-style announcement guidance on Pippit (clean figures, a subtle
 * grid or stripe background, strong contrast): a dark card with faint diagonal stripes above his head — MATCHDAY 14,
 * the local kick-off in clean figures, the player's second clock beside it, then the fixture and the date · ground.
 * No time on record: the card leads with the title alone.
 */
export function Stripecard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const inner = W - 60 * k;
  const time = fx.time;
  const second = fx.ptTime.toUpperCase();
  const tPx = fit(title, 24 * k * ts, inner, 0.24);
  const hPx = time ? Math.min(80 * k * ts, inner / Math.max(1, time.length * 0.62)) : 0;
  const sPx = second ? 22 * k * ts : 0;
  const fPx = fit(fixture, 26 * k * ts, inner, 0.1);
  const rest = [fx.date, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const rPx = rest ? fit(rest, 20 * k * ts, inner, 0.16) : 0;
  const body = tPx + (hPx ? 14 * k + hPx : 0) + (fixture ? 18 * k + fPx : 0) + (rPx ? 10 * k + rPx : 0);
  const blockH = body + CARD_PAD * k;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <StripeCard k={k}>
        <div style={{ ...caps(tPx, 0.24), fontWeight: 800, textShadow: "none" }}>{title}</div>
        {hPx > 0 && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 * k, marginTop: 14 * k }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: hPx, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{time}</div>
            {sPx > 0 && <div style={{ ...caps(sPx, 0.12), paddingLeft: 0, fontWeight: 600, textShadow: "none", opacity: 0.82 }}>{second}</div>}
          </div>
        )}
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, textShadow: "none", marginTop: 18 * k }}>{fixture}</div>}
        {rPx > 0 && <div style={{ ...caps(rPx, 0.16), fontWeight: 600, textShadow: "none", marginTop: 10 * k, opacity: 0.88 }}>{rest}</div>}
      </StripeCard>
    </Top>
  );
}

/** Golo · cartão riscado (goal): the same striped dark card above his celebration, GOAL in Anton, his name and his exact club. */
export function Goalstripecard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const inner = W - 60 * k;
  const gPx = Math.min(116 * k * ts, inner / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, inner, 0.12);
  const cPx = fit(club, 21 * k * ts, inner, 0.22);
  const blockH = gPx + 20 * k + nPx + (club ? 12 * k + cPx : 0) + CARD_PAD * k;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <StripeCard k={k}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, textShadow: "none", marginTop: 20 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, textShadow: "none", marginTop: 12 * k, opacity: 0.88 }}>{club}</div>}
      </StripeCard>
    </Top>
  );
}

/**
 * Golo · cartões (goal), after Hertha BSC's in-house typeface drawn from the lettering of its fans' choreographies:
 * GOAL spelled on white cards held up one letter each, as a stand does in a choreography (each card tipped a little),
 * the letters in his club's colour; his name and exact club under them.
 */
export function Goaltifocards({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase().replace(/\s+/g, "");
  const letters = [...word].slice(0, 8);
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gap = 16 * k;
  const card = Math.min(150 * k * ts, (W - gap * (letters.length - 1)) / Math.max(1, letters.length));
  const ink = clubInk(data);
  const tilt = [-4, 3, -2, 4, -3, 2, -4, 3];
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const cardH = card * 1.18;
  const blockH = cardH + 12 * k + 26 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
      <div style={{ display: "flex", gap, paddingTop: 6 * k, paddingBottom: 6 * k }}>
        {letters.map((ch, i) => (
          <div
            key={i}
            style={{ width: card, height: cardH, background: "#fff", borderRadius: 8 * k, transform: `rotate(${tilt[i % tilt.length]}deg)`, boxShadow: "0 8px 22px rgba(0,0,0,.38)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: card * 0.86, lineHeight: 1, color: ink }}
          >
            {ch}
          </div>
        ))}
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}
