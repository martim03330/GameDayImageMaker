/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { isoFromShortDate } from "@/lib/timezone";
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const DMSERIF = "var(--font-dmserif), Georgia, serif";
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Date · kick-off · ground rows (one or two lines, never under ~26px on a phone), and their height. */
function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/**
 * A soft dark pool right behind a type block, on top of the frame's own shade: small caps stay readable over busy
 * backgrounds (trees, crowds) without greying the whole sky.
 */
export function Shade({ k, h, align = "center", children }: { k: number; h: number; align?: "center" | "flex-start"; children: ReactNode }) {
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: align }}>
      <div style={{ position: "absolute", left: -70 * k, right: -70 * k, top: -46 * k, height: h + 92 * k, background: "radial-gradient(closest-side, rgba(0,0,0,.36), rgba(0,0,0,.16) 70%, rgba(0,0,0,0))", pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: align }}>{children}</div>
    </div>
  );
}

/**
 * A thick upright bar in his club's colour, edged in white so it holds on any sky (a blue club over a blue sky
 * still reads), as tall as the block it stands beside.
 */
function ColorBar({ data, h, k }: { data: RenderData; h: number; k: number }) {
  return <div style={{ width: 22 * k, height: h, flexShrink: 0, background: clubInk(data), border: `${3 * k}px solid #fff`, borderRadius: 3 * k, boxShadow: "0 4px 16px rgba(0,0,0,.35)" }} />;
}

/**
 * Natural · barra da cor (matchday): above his head, a block set flush left beside a thick upright bar in his club's
 * colour — MATCHDAY 14 in Anton, the fixture (exact names) and date · kick-off · ground in caps.
 */
export function Natcolorbar({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const inner = W - 52 * k;
  const tPx = Math.min(92 * k * ts, inner / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, inner, 0.1);
  const when = whenOf(data, k, ts, inner);
  const blockH = tPx + (fixture ? 22 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290} align="stretch">
      <div style={{ display: "flex", gap: 30 * k, alignItems: "stretch" }}>
        <ColorBar data={data} h={blockH} k={k} />
        <Shade k={k} h={blockH} align="flex-start">
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
          {fixture && <div style={{ ...caps(fPx, 0.1), paddingLeft: 0, fontWeight: 800, marginTop: 22 * k }}>{fixture}</div>}
          {when.rows.map((l, i) => (
            <div key={i} style={{ ...caps(when.px, 0.16), paddingLeft: 0, fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
          ))}
        </Shade>
      </div>
    </Top>
  );
}

/** Golo natural · barra da cor (goal): the same club-colour bar beside GOAL in Anton, his name and his exact club, flush left above his head. */
export function Goalnatcolorbar({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const inner = W - 52 * k;
  const gPx = Math.min(130 * k * ts, inner / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, inner, 0.12);
  const cPx = fit(club, 22 * k * ts, inner, 0.22);
  const blockH = gPx + 20 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310} align="stretch">
      <div style={{ display: "flex", gap: 30 * k, alignItems: "stretch" }}>
        <ColorBar data={data} h={blockH} k={k} />
        <Shade k={k} h={blockH} align="flex-start">
          <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
          <div style={{ ...caps(nPx, 0.12), paddingLeft: 0, fontWeight: 800, marginTop: 20 * k }}>{name}</div>
          {club && <div style={{ ...caps(cPx, 0.22), paddingLeft: 0, fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
        </Shade>
      </div>
    </Top>
  );
}

/** The player's next games after this one (real fixtures only), as "8 NOV · V CSKA SOFIA · HOME". */
function nextGames(data: RenderData, max: number): string[] {
  const after = isoFromShortDate(data.content.date) ?? new Date().toISOString().slice(0, 10);
  return data.fixtures
    .filter((f) => f.date > after && f.opponent)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, max)
    .map((f) => {
      const [, m, d] = f.date.split("-").map(Number);
      return `NEXT  ·  ${d} ${MON[m - 1]}  ·  V ${f.opponent.toUpperCase()}  ·  ${f.home ? "HOME" : "AWAY"}`;
    });
}

/**
 * Natural · a seguir (matchday): MATCHDAY 14, the fixture and date · kick-off · ground above his head, then — set
 * apart by a short white rule — his following two games ("NEXT · 7 NOV · V SLAVIA · AWAY") from his real fixtures.
 * No games on record after this one: the list is left out.
 */
export function Natnextgames({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const next = nextGames(data, 2);
  const tPx = Math.min(74 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const nPx = next.length ? Math.min(20 * k * ts, ...next.map((l) => fit(l, 20 * k * ts, W * 0.92, 0.12))) : 0;
  const listH = next.length ? 22 * k + 4 * k + 18 * k + next.length * nPx + (next.length - 1) * 12 * k : 0;
  const blockH = tPx + (fixture ? 22 * k + fPx : 0) + (when.h ? 12 * k + when.h : 0) + listH;
  return (
    <Top data={data} blockH={blockH} drop={300}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 22 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 12 * k, opacity: 0.94 }}>{l}</div>
        ))}
        {next.length > 0 && (
          <>
            <div style={{ width: 80 * k, height: 4 * k, background: "#fff", marginTop: 22 * k, boxShadow: "0 1px 6px rgba(0,0,0,.4)" }} />
            {next.map((l, i) => (
              <div key={i} style={{ ...caps(nPx, 0.12), fontWeight: 700, marginTop: i ? 12 * k : 18 * k }}>{l}</div>
            ))}
          </>
        )}
      </Shade>
    </Top>
  );
}

/** Three solid diamonds in a row, the printer's dinkus that parts two passages, drawn large enough to read on a phone. */
function Dinkus({ k }: { k: number }) {
  const s = 13 * k;
  return (
    <div style={{ display: "flex", gap: 22 * k, filter: "drop-shadow(0 1px 4px rgba(0,0,0,.45))" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: s, height: s, background: "#fff", transform: "rotate(45deg)" }} />
      ))}
    </div>
  );
}

/**
 * Natural · ornamento (matchday): "Matchday 14" in DM Serif above his head, a dinkus of three white diamonds under
 * it, then the fixture (exact names) and date · kick-off · ground in caps — a book's section break.
 */
export function Natornament({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = data.content.kicker || "Matchday";
  const title = roundTitle(data);
  const serif = title.replace(word.toUpperCase(), word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  const fixture = fixtureOf(data);
  const tPx = Math.min(90 * k * ts, W / Math.max(1, serif.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = tPx + 30 * k + 13 * k * 1.42 + (fixture ? 30 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
      <div style={{ fontFamily: DMSERIF, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{serif}</div>
      <div style={{ marginTop: 30 * k + 3 * k }}>
        <Dinkus k={k} />
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 30 * k + 3 * k }}>{fixture}</div>}
      {when.rows.map((l, i) => (
        <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
      ))}
      </Shade>
    </Top>
  );
}

/** Golo natural · ornamento (goal): "Goal" in DM Serif, the dinkus, his name and his exact club, above his celebration. */
export function Goalnatornament({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const raw = data.content.kicker || "Goal";
  const word = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 30 * k + 13 * k * 1.42 + 30 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
      <div style={{ fontFamily: DMSERIF, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ marginTop: 30 * k + 3 * k }}>
        <Dinkus k={k} />
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k + 3 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}
