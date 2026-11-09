/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { versusOf } from "./natfree23";
import { caps, fit, fullName, roundTitle, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const flat = (px: number, tracking: number, weight = 800): CSSProperties => ({ ...caps(px, tracking), fontWeight: weight, textShadow: "none" });

/** The round number alone ("14"), or null — then the look shows the competition or the kicker instead. */
const roundNo = (data: RenderData) => matchFacts(data).roundNo || null;
const kickerOf = (data: RenderData) => (data.content.kicker || "Matchday").toUpperCase();

/* ---------------- Concrete slab (CF Montréal's 2025 brutalist identity) ---------------- */

const CONCRETE = "linear-gradient(160deg, #b9b6af, #a29e96)";
const INK = "#16171a";

/**
 * A flat slab in raw-concrete grey with hard square corners and a thick bar in his club's colour along its foot —
 * after CF Montréal's 2025 identity (Samba Digital), drawn from the city's brutalist architecture: strong grids,
 * modular blocks, concrete and steel. No texture: the flat grey is the idea.
 */
function Slab({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  return (
    <div style={{ position: "relative", width: w, height: h, background: CONCRETE, boxShadow: "0 18px 40px rgba(0,0,0,.5)", color: INK }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 18 * k, background: clubInk(data) }} />
      {children}
    </div>
  );
}

/** Betão (matchday): a concrete slab with the round number huge on the left, a steel rule, and both crests with MATCHDAY, HOME X AWAY and the kick-off stacked on the right. */
export function Concreteslab({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const no = roundNo(data);
  const big = no ?? kickerOf(data).slice(0, 1);
  const pad = 26 * k;
  const bar = 16 * k;
  const numW = (no ? Math.max(1, no.length) : 1) * 96 * k;
  const ruleX = pad + numW + 24 * k;
  const rw = W - ruleX - 24 * k - pad;
  const label = no ? kickerOf(data) : roundTitle(data);
  const versus = versusOf(data);
  const cH = 46 * k;
  const lPx = fit(label, 30 * k * ts, rw - 2 * (cH + 12 * k), 0.12);
  const fPx = fit(versus, 25 * k * ts, rw, 0.06);
  const rows = whenRows(data, 21 * k * ts, rw, 0.08);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, rw, 0.08)));
  const colH = cH + 16 * k + fPx + rows.length * (wPx + 10 * k);
  const sh = colH + 2 * pad + bar;
  const nPx = Math.min((sh - bar - 2 * pad) * 1.12, numW / Math.max(1, big.length * 0.46));
  return (
    <Top data={data} blockH={sh} drop={290}>
      <Shade k={k} h={sh}>
        <Slab data={data} k={k} w={W} h={sh}>
          <div style={{ position: "absolute", left: pad, width: numW, top: 0, bottom: bar, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, whiteSpace: "nowrap" }}>{big}</div>
          <div style={{ position: "absolute", left: ruleX, top: pad, bottom: bar + pad, width: 8 * k, background: INK }} />
          <div style={{ position: "absolute", left: ruleX + 24 * k, top: 0, bottom: bar, width: rw, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 * k, height: cH }}>
              {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((c, i) => (
                <img key={i} src={c!} alt="" style={{ height: cH, width: cH, objectFit: "contain" }} />
              ))}
              <div style={{ ...flat(lPx, 0.12), paddingLeft: 6 * k }}>{label}</div>
            </div>
            {versus && <div style={{ ...flat(fPx, 0.06), paddingLeft: 0, marginTop: 16 * k }}>{versus}</div>}
            {rows.map((l, i) => (
              <div key={i} style={{ ...flat(wPx, 0.08, 700), paddingLeft: 0, marginTop: 10 * k }}>{l}</div>
            ))}
          </div>
        </Slab>
      </Shade>
    </Top>
  );
}

/** Golo · betão (goal): GOAL cut huge into the concrete slab, a steel rule, his full name and exact club under it. */
export function Goalconcreteslab({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const pad = 30 * k;
  const bar = 16 * k;
  const iw = W - 2 * pad;
  const gPx = Math.min(116 * k * ts, iw / Math.max(1, word.length * 0.47));
  const nPx = fit(name, 30 * k * ts, iw, 0.08);
  const cPx = fit(club, 21 * k * ts, iw, 0.16);
  const sh = pad + gPx * 0.9 + 18 * k + 8 * k + 18 * k + nPx + (club ? 10 * k + cPx : 0) + pad + bar;
  return (
    <Top data={data} blockH={sh} drop={310}>
      <Shade k={k} h={sh}>
        <Slab data={data} k={k} w={W} h={sh}>
          <div style={{ position: "absolute", left: pad, right: pad, top: pad, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.9, whiteSpace: "nowrap", height: gPx * 0.9 }}>{word}</div>
            <div style={{ width: "100%", height: 8 * k, background: INK, marginTop: 18 * k }} />
            <div style={{ ...flat(nPx, 0.08), paddingLeft: 0, marginTop: 18 * k }}>{name}</div>
            {club && <div style={{ ...flat(cPx, 0.16, 700), paddingLeft: 0, marginTop: 10 * k }}>{club}</div>}
          </div>
        </Slab>
      </Shade>
    </Top>
  );
}

/* ---------------- Bento tiles (modular matchday cards, Box Out Sports' modular series) ---------------- */

const TILE: CSSProperties = { borderRadius: 26, background: "rgba(14,17,21,.74)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.14)", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", color: "#fff" };

/**
 * Bento (matchday): the facts in a grid of rounded tiles, the "bento" layout of modular gameday cards — a wide tile
 * with MATCHDAY 14, a tile in his club's colour with both crests, then a tile with HOME X AWAY and the ground beside
 * a tile with the date and the kick-off.
 */
export function Bentotiles({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const g = 12 * k;
  const p = 22 * k;
  const aW = (W - g) * 0.6;
  const bW = W - g - aW;
  const r1 = 112 * k;
  const title = roundTitle(data);
  const tPx = Math.min(72 * k * ts, (aW - 2 * p) / Math.max(1, title.length * 0.5));
  const cH = Math.min(78 * k, (bW - 3 * p) / 2);
  const versus = versusOf(data);
  const tW = (W - g) * 0.36;
  const vW = W - g - tW;
  const vPx = fit(versus, 27 * k * ts, vW - 2 * p, 0.05);
  const venue = fx.venue.toUpperCase();
  const vnPx = venue ? fit(venue, 18 * k * ts, vW - 2 * p, 0.12) : 0;
  const date = fx.date.toUpperCase();
  const kPx = fx.kickoff ? fit(fx.kickoff, 30 * k * ts, tW - 2 * p, 0.02) : 0;
  const dPx = date ? Math.min(18 * k * ts, kPx || 18 * k) : 0;
  const r2 = 2 * p + Math.max(vPx + (venue ? 12 * k + vnPx : 0), dPx + (date && kPx ? 12 * k : 0) + kPx);
  const blockH = r1 + g + r2;
  const tile = (style: CSSProperties) => ({ ...TILE, borderRadius: 24 * k, padding: `0 ${p}px`, ...style });
  return (
    <Top data={data} blockH={blockH} drop={290} align="stretch">
      <div style={{ display: "flex", flexDirection: "column", gap: g, width: W }}>
        <div style={{ display: "flex", gap: g, height: r1 }}>
          <div style={tile({ width: aW, alignItems: "flex-start" })}>
            <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap" }}>{title}</div>
          </div>
          <div style={tile({ width: bW, background: clubInk(data), border: "1px solid rgba(255,255,255,.35)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: p })}>
            {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((c, i) => (
              <img key={i} src={c!} alt="" style={{ width: cH, height: cH, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.35))" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: g, height: r2 }}>
          <div style={tile({ width: vW, alignItems: "flex-start" })}>
            {versus && <div style={{ ...flat(vPx, 0.05), paddingLeft: 0, color: "#fff" }}>{versus}</div>}
            {venue && <div style={{ ...flat(vnPx, 0.12, 600), paddingLeft: 0, color: "#fff", opacity: 0.8, marginTop: 12 * k }}>{venue}</div>}
          </div>
          {(date || fx.kickoff) && (
            <div style={tile({ width: tW, alignItems: "flex-start" })}>
              {date && <div style={{ ...flat(dPx, 0.12, 700), paddingLeft: 0, color: "#fff", opacity: 0.8 }}>{date}</div>}
              {fx.kickoff && <div style={{ ...flat(kPx, 0.02), paddingLeft: 0, color: "#fff", marginTop: date ? 12 * k : 0 }}>{fx.kickoff}</div>}
            </div>
          )}
        </div>
      </div>
    </Top>
  );
}

/* ---------------- Embroidered patch (anniversary kit badges: FC Bayern 125, Barça 125) ---------------- */

const TWILL = "#f4eedf";

/**
 * An embroidered badge, like the anniversary patches stitched on the 2025 kits: cream twill, a thick satin-stitched
 * border in his club's colour with a running white stitch inside it, the lettering embroidered in the club colour.
 */
function Patch({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const ink = clubInk(data);
  const b = 16 * k;
  const r = 34 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 12px 26px rgba(0,0,0,.5))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: r, background: ink }} />
      <div style={{ position: "absolute", inset: b, borderRadius: r - b * 0.6, background: TWILL, boxShadow: "inset 0 2px 6px rgba(0,0,0,.22)" }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={b / 2} y={b / 2} width={w - b} height={h - b} rx={r - b / 2} fill="none" stroke="#fff" strokeWidth={3 * k} strokeDasharray={`${9 * k} ${7 * k}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ink }}>{children}</div>
    </div>
  );
}

/** Emblema bordado (matchday): MATCHDAY 14 between both crests, HOME X AWAY and the kick-off embroidered on a stitched badge. */
export function Patchbadge({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const versus = versusOf(data);
  const iw = W - 110 * k;
  const cH = fx.homeCrest || fx.awayCrest ? 62 * k : 0;
  const tPx = Math.min(70 * k * ts, (iw - 2 * (cH + 26 * k)) / Math.max(1, title.length * 0.5));
  const fPx = fit(versus, 26 * k * ts, iw, 0.08);
  const rows = whenRows(data, 20 * k * ts, iw, 0.1);
  const wPx = Math.min(20 * k * ts, ...rows.map((l) => fit(l, 20 * k * ts, iw, 0.1)));
  const ph = 40 * k + Math.max(tPx, cH) + (versus ? 18 * k + fPx : 0) + rows.length * (wPx + 10 * k) + 40 * k;
  const crest = (c: string | null) => (c ? <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain" }} /> : null);
  return (
    <Top data={data} blockH={ph} drop={290}>
      <Shade k={k} h={ph}>
        <Patch data={data} k={k} w={W} h={ph}>
          <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
            {crest(fx.homeCrest)}
            <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap" }}>{title}</div>
            {crest(fx.awayCrest)}
          </div>
          {versus && <div style={{ ...flat(fPx, 0.08), marginTop: 18 * k }}>{versus}</div>}
          {rows.map((l, i) => (
            <div key={i} style={{ ...flat(wPx, 0.1, 700), marginTop: 10 * k }}>{l}</div>
          ))}
        </Patch>
      </Shade>
    </Top>
  );
}

/** Golo · emblema bordado (goal): his club's crest beside GOAL, his full name and exact club embroidered on the stitched badge. */
export function Goalpatchbadge({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const iw = W - 120 * k;
  const cH = crest ? 96 * k : 0;
  const gPx = Math.min(112 * k * ts, (iw - (cH ? cH + 28 * k : 0)) / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, iw, 0.1);
  const cPx = fit(club, 22 * k * ts, iw, 0.18);
  const ph = 40 * k + Math.max(gPx, cH) + 18 * k + nPx + (club ? 12 * k + cPx : 0) + 40 * k;
  return (
    <Top data={data} blockH={ph} drop={310}>
      <Shade k={k} h={ph}>
        <Patch data={data} k={k} w={W} h={ph}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 * k }}>
            {crest && <img src={crest} alt="" style={{ height: cH, width: cH, objectFit: "contain" }} />}
            <div style={{ fontFamily: DISPLAY, fontSize: gPx, letterSpacing: "0.04em", paddingLeft: "0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
          </div>
          <div style={{ ...flat(nPx, 0.1), marginTop: 18 * k }}>{name}</div>
          {club && <div style={{ ...flat(cPx, 0.18, 700), marginTop: 12 * k }}>{club}</div>}
        </Patch>
      </Shade>
    </Top>
  );
}
