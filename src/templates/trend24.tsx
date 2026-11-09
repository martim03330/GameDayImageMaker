/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { HALO } from "./natfree19";
import { versusOf } from "./natfree23";
import { caps, fit, fullName, roundTitle, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const INK = "#15171b";
const flat = (px: number, tracking: number, weight = 800): CSSProperties => ({ ...caps(px, tracking), fontWeight: weight, textShadow: "none" });
/** A light rim on crests so a black crest still reads on a dark ground. */
const CREST_HALO = "drop-shadow(0 0 1.5px rgba(255,255,255,.75)) drop-shadow(0 2px 6px rgba(0,0,0,.35))";

/** Heights and sizes of the centred matchday stack (title, crests, HOME X AWAY, date · kick-off · ground) in a width. */
export function stackOf(data: RenderData, k: number, ts: number, iw: number, tMax = 70) {
  const title = roundTitle(data);
  const versus = versusOf(data);
  const fx = natFixture(data);
  const cH = fx.homeCrest || fx.awayCrest ? 54 * k : 0;
  const tPx = Math.min(tMax * k * ts, (iw - 2 * (cH + 24 * k)) / Math.max(1, title.length * 0.5));
  const fPx = fit(versus, 26 * k * ts, iw, 0.08);
  const rows = whenRows(data, 20 * k * ts, iw, 0.1);
  const wPx = Math.min(20 * k * ts, ...rows.map((l) => fit(l, 20 * k * ts, iw, 0.1)));
  const h = Math.max(tPx, cH) + (versus ? 16 * k + fPx : 0) + rows.length * (wPx + 10 * k);
  return { title, versus, fx, cH, tPx, fPx, rows, wPx, h };
}

/** The matchday stack: home crest · MATCHDAY 14 · away crest on one line, HOME X AWAY, date · kick-off · ground. */
export function Stack({ s, k, color, shadow }: { s: ReturnType<typeof stackOf>; k: number; color: string; shadow?: string }) {
  const crest = (c: string | null) => (c && s.cH ? <img src={c} alt="" style={{ height: s.cH, width: s.cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 24 * k, color }}>
        {crest(s.fx.homeCrest)}
        <div style={{ fontFamily: DISPLAY, fontSize: s.tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: shadow ?? "none" }}>{s.title}</div>
        {crest(s.fx.awayCrest)}
      </div>
      {s.versus && <div style={{ ...flat(s.fPx, 0.08), color, marginTop: 16 * k, textShadow: shadow ?? "none" }}>{s.versus}</div>}
      {s.rows.map((l, i) => (
        <div key={i} style={{ ...flat(s.wPx, 0.1, 700), color, marginTop: 10 * k, textShadow: shadow ?? "none" }}>{l}</div>
      ))}
    </>
  );
}

/** GOAL, his full name and exact club, centred; sizes first. */
export function goalOf(data: RenderData, k: number, ts: number, iw: number, gMax = 116) {
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(gMax * k * ts, iw / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, iw, 0.1);
  const cPx = fit(club, 22 * k * ts, iw, 0.18);
  return { word, name, club, gPx, nPx, cPx, h: gPx + 18 * k + nPx + (club ? 12 * k + cPx : 0) };
}

export function GoalStack({ g, k, color, shadow }: { g: ReturnType<typeof goalOf>; k: number; color: string; shadow?: string }) {
  return (
    <>
      <div style={{ fontFamily: DISPLAY, fontSize: g.gPx, letterSpacing: "0.04em", paddingLeft: "0.04em", lineHeight: 1, whiteSpace: "nowrap", color, textShadow: shadow ?? "none" }}>{g.word}</div>
      <div style={{ ...flat(g.nPx, 0.1), color, marginTop: 18 * k, textShadow: shadow ?? "none" }}>{g.name}</div>
      {g.club && <div style={{ ...flat(g.cPx, 0.18, 700), color, marginTop: 12 * k, textShadow: shadow ?? "none" }}>{g.club}</div>}
    </>
  );
}

/* ---------------- Shipping container (Everton 2025/26 away kit, the Bramley-Moore Dock heritage) ---------------- */

/**
 * The side of a shipping container in his club's colour: corrugated (even vertical ribs, flat, no wear), heavy top and
 * bottom rails and corner castings — after Everton's 2025/26 away kit, drawn from the dockland heritage of Bramley-Moore
 * Dock, where the club's new ground stands. The lettering is stencilled straight on the steel in white.
 */
function Container({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const ink = clubInk(data);
  const dark = shade(ink, -0.35);
  const lite = luminance(ink) > 0.3 ? shade(ink, -0.12) : shade(ink, 0.1);
  const rail = 16 * k;
  const rib = 26 * k;
  const corner = 26 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, boxShadow: "0 18px 40px rgba(0,0,0,.5)", borderRadius: 4 * k, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(to right, ${ink} 0, ${ink} ${rib * 0.55}px, ${lite} ${rib * 0.55}px, ${lite} ${rib}px)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: rail, background: dark }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: rail, background: dark }} />
      {[
        { left: 0, top: 0 },
        { right: 0, top: 0 },
        { left: 0, bottom: 0 },
        { right: 0, bottom: 0 },
      ].map((p, i) => (
        <div key={i} style={{ position: "absolute", ...p, width: corner, height: corner, background: shade(ink, -0.5), boxShadow: "inset 0 0 0 3px rgba(255,255,255,.18)" }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: rail, bottom: rail, background: "radial-gradient(ellipse at center, rgba(0,0,0,.25), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>{children}</div>
    </div>
  );
}

const STEEL_SH = "0 2px 6px rgba(0,0,0,.45)";

/** Contentor (matchday): MATCHDAY 14 between both crests, HOME X AWAY and the kick-off stencilled in white on a shipping container in his club's colour. */
export function Shipcontainer({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const s = stackOf(data, k, ts, W - 110 * k);
  const h = s.h + 2 * 16 * k + 2 * 34 * k;
  return (
    <Top data={data} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <Container data={data} k={k} w={W} h={h}>
          <Stack s={s} k={k} color="#fff" shadow={STEEL_SH} />
        </Container>
      </Shade>
    </Top>
  );
}

/** Golo · contentor (goal): GOAL, his full name and exact club stencilled in white on the container in his club's colour. */
export function Goalshipcontainer({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const g = goalOf(data, k, ts, W - 120 * k);
  const h = g.h + 2 * 16 * k + 2 * 36 * k;
  return (
    <Top data={data} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <Container data={data} k={k} w={W} h={h}>
          <GoalStack g={g} k={k} color="#fff" shadow={STEEL_SH} />
        </Container>
      </Shade>
    </Top>
  );
}

/* ---------------- Steel lamellas (Real Madrid 2025/26 home kit, the new Bernabéu skin) ---------------- */

/**
 * A panel of horizontal brushed-steel ribbons with fine dark gaps — the metal skin of the rebuilt Santiago Bernabéu,
 * which Real Madrid's 2025/26 home kit took as its inspiration — with a thin bar in his club's colour on the left edge.
 * Light steel, dark lettering: it reads on any photo.
 */
function Lamellas({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const slat = 30 * k;
  const gap = 3 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 6 * k, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,.5)" }}>
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(to bottom, #eef0f2 0, #d6dadf ${slat - gap}px, #8e959d ${slat - gap}px, #8e959d ${slat}px)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%, rgba(255,255,255,.18) 70%, rgba(0,0,0,.06))" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 16 * k, background: clubInk(data) }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: INK }}>{children}</div>
    </div>
  );
}

/** Lamelas (matchday): MATCHDAY 14 between both crests, HOME X AWAY and the kick-off in dark type on the Bernabéu's steel ribbons. */
export function Steellamellas({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const s = stackOf(data, k, ts, W - 110 * k);
  const h = s.h + 2 * 38 * k;
  return (
    <Top data={data} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <Lamellas data={data} k={k} w={W} h={h}>
          <Stack s={s} k={k} color={INK} />
        </Lamellas>
      </Shade>
    </Top>
  );
}

/** Golo · lamelas (goal): GOAL, his full name and exact club in dark type on the steel ribbons. */
export function Goalsteellamellas({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const g = goalOf(data, k, ts, W - 120 * k);
  const h = g.h + 2 * 40 * k;
  return (
    <Top data={data} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <Lamellas data={data} k={k} w={W} h={h}>
          <GoalStack g={g} k={k} color={INK} />
        </Lamellas>
      </Shade>
    </Top>
  );
}

/* ---------------- Stand roof truss (Wolves 2025/26 away kit, Molineux's angular framework) ---------------- */

/**
 * A stand's roof girder drawn bold: thick white top and bottom chords with a zigzag of webs in his club's colour —
 * after Wolves' 2025/26 away kit, whose pattern came from the angular framework of Molineux. The matchday facts hang
 * under it like the stand under its roof.
 */
function Truss({ data, k, w }: { data: RenderData; k: number; w: number }) {
  const ink = clubInk(data);
  const h = 64 * k;
  const n = 10;
  const step = w / n;
  const c = 9 * k;
  const pts = Array.from({ length: n + 1 }, (_, i) => `${i * step},${i % 2 ? h - c / 2 : c / 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.45))" }}>
      <polyline points={pts} fill="none" stroke="#fff" strokeWidth={13 * k} strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke={ink} strokeWidth={7 * k} strokeLinejoin="round" />
      <line x1={0} y1={c / 2} x2={w} y2={c / 2} stroke="#fff" strokeWidth={c} strokeLinecap="round" />
      <line x1={0} y1={h - c / 2} x2={w} y2={h - c / 2} stroke="#fff" strokeWidth={c} strokeLinecap="round" />
    </svg>
  );
}

/** Treliça (matchday): a bold roof girder across the sky with MATCHDAY 14 between both crests, HOME X AWAY and the kick-off hanging under it. */
export function Stadiumtruss({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const s = stackOf(data, k, ts, W - 40 * k);
  const h = 64 * k + 30 * k + s.h;
  return (
    <Top data={data} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <Truss data={data} k={k} w={W} />
        <div style={{ marginTop: 30 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Stack s={s} k={k} color="#fff" shadow={HALO} />
        </div>
      </Shade>
    </Top>
  );
}

