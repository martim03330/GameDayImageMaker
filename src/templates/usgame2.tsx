/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { MARKER } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { dropped } from "./natfree26";
import { fullName, roundTitle, whenRows } from "./natfree9";
import { scoreOf } from "./outline";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { CREST_HALO, fitCaps, linesOf, ourCrest, versusLines } from "./usgame1";

/*
 * US gameday looks, part 2: the facts on one loud object above his head (placed by Top / pickTextSpot, a dark panel
 * when his head is too high), each object one device from the research (scratchpad us-gameday-research.md).
 */

const W = CANVAS_W - 120;
const INK = "#15171b";
const caps = (px: number, tracking: number, weight = 800, font = SANS): CSSProperties => ({ fontFamily: font, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap" });

/** Sizes of the centred matchday stack with names wrapped, never cut. */
function usStack(data: RenderData, k: number, ts: number, iw: number, tMax = 70) {
  const fx = natFixture(data);
  const title = roundTitle(data);
  const cH = fx.homeCrest || fx.awayCrest ? 58 * k : 0;
  const tPx = Math.min(tMax * k * ts, (iw - 2 * (cH + 24 * k)) / Math.max(1, title.length * 0.5));
  const vs = versusLines(data, 27 * k * ts, iw, 0.06, 22 * k);
  const rows = whenRows(data, 20 * k * ts, iw, 0.1);
  const wPx = Math.min(20 * k * ts, ...rows.map((l) => fitCaps(l, 20 * k * ts, iw, 0.1)));
  const h = Math.max(tPx, cH) + (vs.lines.length ? 16 * k + vs.lines.length * (vs.px + 8 * k) - 8 * k : 0) + rows.length * (wPx + 10 * k);
  return { fx, title, cH, tPx, vs, rows, wPx, h };
}

function UsStack({ s, k, color, font = SANS, titleFont = DISPLAY, shadow = "none", titleStyle }: { s: ReturnType<typeof usStack>; k: number; color: string; font?: string; titleFont?: string; shadow?: string; titleStyle?: CSSProperties }) {
  const crest = (c: string | null) => (c && s.cH ? <img src={c} alt="" style={{ height: s.cH, width: s.cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 24 * k }}>
        {crest(s.fx.homeCrest)}
        <div style={{ fontFamily: titleFont, fontSize: s.tPx, lineHeight: 1, whiteSpace: "nowrap", color, textShadow: shadow, ...titleStyle }}>{s.title}</div>
        {crest(s.fx.awayCrest)}
      </div>
      {s.vs.lines.map((l, i) => (
        <div key={i} style={{ ...caps(s.vs.px, 0.06, 800, font), color, textShadow: shadow, marginTop: i ? 8 * k : 16 * k }}>{l}</div>
      ))}
      {s.rows.map((l, i) => (
        <div key={i} style={{ ...caps(s.wPx, 0.1, 700, font), color, textShadow: shadow, opacity: 0.9, marginTop: 10 * k }}>{l}</div>
      ))}
    </>
  );
}

/** GOAL, his full name and exact club (both wrapped, never cut). */
function usGoal(data: RenderData, k: number, ts: number, iw: number, gMax = 120) {
  const word = (data.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(gMax * k * ts, iw / Math.max(1, word.length * 0.5));
  const name = linesOf(fullName(data), 32 * k * ts, iw, 0.08, 24 * k);
  const club = linesOf(ourClub(data).toUpperCase(), 22 * k * ts, iw, 0.16, 17 * k);
  const h = gPx + 18 * k + name.lines.length * (name.px + 8 * k) + 4 * k + club.lines.length * (club.px + 8 * k);
  return { word, gPx, name, club, h };
}

function UsGoalLines({ g, k, color, shadow = "none" }: { g: ReturnType<typeof usGoal>; k: number; color: string; shadow?: string }) {
  return (
    <>
      {g.name.lines.map((l, i) => (
        <div key={i} style={{ ...caps(g.name.px, 0.08), color, textShadow: shadow, marginTop: i ? 8 * k : 18 * k }}>{l}</div>
      ))}
      {g.club.lines.map((l, i) => (
        <div key={"c" + i} style={{ ...caps(g.club.px, 0.16, 700), color, textShadow: shadow, opacity: 0.92, marginTop: i ? 8 * k : 12 * k }}>{l}</div>
      ))}
    </>
  );
}

/* ---------------- Diamond plate (Oregon's game-day content, Daktronics) ---------------- */

/**
 * A plate of polished diamond-plate steel — the reflective plates Oregon's game-day content took from the Ducks' Nike
 * cleats: a chrome gradient, rows of raised lozenges (each with a lit and a shaded side), bolts in the corners.
 * Clean metal, no wear.
 */
function DiamondPlate({ k, w, h, children }: { k: number; w: number; h: number; children: ReactNode }) {
  const step = 34 * k;
  const id = "us-plate";
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 14 * k, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,.5), inset 0 0 0 2px rgba(255,255,255,.5)" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #f4f6f8 0%, #b9c0c7 28%, #eef1f3 46%, #8e979f 70%, #dde2e6 100%)" }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id={id} width={step} height={step} patternUnits="userSpaceOnUse">
            <g transform={`translate(${step * 0.25} ${step * 0.25}) rotate(45)`}>
              <rect x={-2 * k} y={-9 * k} width={4 * k} height={18 * k} rx={2 * k} fill="#fff" opacity={0.55} />
              <rect x={0.5 * k} y={-9 * k} width={2.6 * k} height={18 * k} rx={1.3 * k} fill="#5c656d" opacity={0.4} />
            </g>
            <g transform={`translate(${step * 0.75} ${step * 0.75}) rotate(-45)`}>
              <rect x={-2 * k} y={-9 * k} width={4 * k} height={18 * k} rx={2 * k} fill="#fff" opacity={0.55} />
              <rect x={0.5 * k} y={-9 * k} width={2.6 * k} height={18 * k} rx={1.3 * k} fill="#5c656d" opacity={0.4} />
            </g>
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${id})`} />
        {[
          [22 * k, 22 * k],
          [w - 22 * k, 22 * k],
          [22 * k, h - 22 * k],
          [w - 22 * k, h - 22 * k],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={8 * k} fill="#cfd5da" stroke="#6c757d" strokeWidth={2 * k} />
            <path d={`M ${x - 4 * k} ${y} L ${x + 4 * k} ${y}`} stroke="#6c757d" strokeWidth={2 * k} />
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "radial-gradient(ellipse at center, rgba(244,246,248,.75), rgba(244,246,248,0) 72%)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: INK }}>{children}</div>
    </div>
  );
}

const STAMPED = "0 2px 0 rgba(255,255,255,.7), 0 -1px 0 rgba(0,0,0,.25)";

/** Chapa de diamante (matchday): MATCHDAY 14 between both crests, HOME X AWAY and the kick-off stamped dark into a polished diamond-plate panel. */
export function Usdiamondplate({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const s = usStack(d, k, ts, W - 110 * k);
  const h = s.h + 2 * 40 * k;
  return (
    <Top data={d} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <DiamondPlate k={k} w={W} h={h}>
          <UsStack s={s} k={k} color={INK} shadow={STAMPED} />
        </DiamondPlate>
      </Shade>
    </Top>
  );
}

/* ---------------- 3D extruded GAMEDAY (the template studios' 3D text) ---------------- */

/** A deep 3D extrusion in a dark shade of the club colour under white letters, the classic HS gameday lockup. */
function extrude(color: string, depth: number, k: number): string {
  const layers = Array.from({ length: Math.round(depth) }, (_, i) => `${(i + 1) * 0.55 * k}px ${(i + 1) * k}px 0 ${color}`);
  return [...layers, `${depth * 0.6 * k}px ${depth * k + 6 * k}px ${16 * k}px rgba(0,0,0,.45)`].join(", ");
}

/** Gameday 3D (matchday): MATCHDAY 14 small, then both crests either side of GAMEDAY in white with a deep 3D extrusion in his club's colour, HOME X AWAY and the kick-off under it. */
export function Us3dgameday({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const cH = 78 * k;
  const gPx = Math.min(140 * k * ts, (W - 2 * (cH + 26 * k)) / (7 * 0.5));
  const depth = 12;
  const vs = versusLines(d, 27 * k * ts, W - 40 * k, 0.06, 22 * k);
  const rows = whenRows(d, 20 * k * ts, W - 40 * k, 0.1);
  const wPx = Math.min(20 * k * ts, ...rows.map((l) => fitCaps(l, 20 * k * ts, W - 40 * k, 0.1)));
  const round = matchFacts(d).roundNo;
  const rPx = 30 * k * ts;
  const h = (round ? rPx + 12 * k : 0) + gPx * 0.9 + depth * k + 16 * k + vs.lines.length * (vs.px + 8 * k) + rows.length * (wPx + 10 * k);
  const sh = "0 2px 10px rgba(0,0,0,.55)";
  const crest = (c: string | null) => (c ? <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  return (
    <Top data={d} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        {round && <div style={{ ...caps(rPx, 0.3, 800), color: "#fff", textShadow: sh, marginBottom: 12 * k }}>{`${(d.content.kicker || "Matchday").toUpperCase()} ${round}`}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
          {crest(fx.homeCrest)}
          <div style={{ height: gPx * 0.9 + depth * k, fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.9, whiteSpace: "nowrap", color: "#fff", textShadow: extrude(shade(ink, -0.25), depth, k) }}>GAMEDAY</div>
          {crest(fx.awayCrest)}
        </div>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.06), color: "#fff", textShadow: sh, marginTop: i ? 8 * k : 16 * k }}>{l}</div>
        ))}
        {rows.map((l, i) => (
          <div key={i} style={{ ...caps(wPx, 0.1, 700), color: "#fff", textShadow: sh, opacity: 0.92, marginTop: 10 * k }}>{l}</div>
        ))}
      </Shade>
    </Top>
  );
}

/** Golo · 3D (goal): his club's crest above GOAL in white with a deep 3D extrusion in the club colour, his full name and exact club under it. */
export function Goalus3d({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const ink = clubInk(d);
  const g = usGoal(d, k, ts, W - 40 * k, 150);
  const depth = 14;
  const cH = 64 * k;
  const crest = ourCrest(d);
  const h = (crest ? cH + 14 * k : 0) + g.h + depth * k;
  const sh = "0 2px 10px rgba(0,0,0,.55)";
  return (
    <Top data={d} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        {crest && <img src={crest} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO, marginBottom: 14 * k }} />}
        <div style={{ height: g.gPx * 0.9 + depth * k, fontFamily: DISPLAY, fontSize: g.gPx, lineHeight: 0.9, whiteSpace: "nowrap", color: "#fff", textShadow: extrude(shade(ink, -0.25), depth, k) }}>{g.word}</div>
        <UsGoalLines g={g} k={k} color="#fff" shadow={sh} />
      </Shade>
    </Top>
  );
}

/* ---------------- Fan sign (ESPN College GameDay's hand-made signs) ---------------- */

/** Cartaz de adepto (matchday): a white foam board held up in the crowd, MATCHDAY 14 between both crests and HOME X AWAY lettered in marker in his club's colour, the kick-off in black marker. */
export function Usfansign({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const iw = W - 120 * k;
  const title = roundTitle(d);
  const cH = 54 * k;
  const tPx = Math.min(70 * k * ts, (iw - 2 * (cH + 22 * k)) / Math.max(1, title.length * 0.62));
  const vs = versusLines(d, 30 * k * ts, iw * 0.9, 0.02, 22 * k);
  const rows = whenRows(d, 24 * k * ts, iw * 0.86, 0.04);
  const wPx = Math.min(24 * k * ts, ...rows.map((l) => fitCaps(l, 24 * k * ts, iw * 0.86, 0.04)));
  const bh = 30 * k + Math.max(cH, tPx * 1.1) + vs.lines.length * (vs.px * 1.1 + 6 * k) + 12 * k + rows.length * (wPx * 1.1 + 6 * k) + 30 * k;
  const marker = (px: number, color: string): CSSProperties => ({ fontFamily: MARKER, fontSize: px, lineHeight: 1.1, whiteSpace: "nowrap", color });
  return (
    <Top data={d} blockH={bh + 20 * k} drop={290}>
      <div style={{ width: W, height: bh, transform: "rotate(-3deg)", background: "#fbfaf6", borderRadius: 6 * k, boxShadow: "0 18px 40px rgba(0,0,0,.45), inset 0 0 0 1px rgba(0,0,0,.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 10 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: cH, width: cH, objectFit: "contain" }} />}
          <div style={marker(tPx, ink)}>{title}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: cH, width: cH, objectFit: "contain" }} />}
        </div>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...marker(vs.px, ink), marginTop: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 12 * k }} />
        {rows.map((l, i) => (
          <div key={i} style={{ ...marker(wPx, "#1b1b1b"), marginTop: 6 * k }}>{l}</div>
        ))}
      </div>
    </Top>
  );
}

/* ---------------- FINAL score card (HS quick-score templates) ---------------- */

/** Resultado · FINAL (result): a dark card — a FINAL badge in his club's colour, both crests flanking the score in huge Anton, each club's exact name under its crest, the competition at the foot. */
export function Resultusfinal({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const score = scoreOf(d, "–");
  const [hg, ag] = score ? score.split("–") : ["", ""];
  const colW = (W - 80 * k) / 3;
  const cH = 120 * k;
  const nameOf = (n: string) => linesOf(n.toUpperCase(), 22 * k * ts, colW, 0.06, 16 * k);
  const hn = nameOf(fx.homeName);
  const an = nameOf(fx.awayName);
  const nPx = Math.min(hn.px, an.px);
  const nLines = Math.max(hn.lines.length, an.lines.length);
  const sPx = Math.min(150 * k * ts, colW / 1.3);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const cPx = comp ? fitCaps(comp, 18 * k * ts, W - 80 * k, 0.16) : 0;
  const badgeH = 58 * k;
  const h = 34 * k + badgeH + 26 * k + Math.max(cH + 14 * k + nLines * (nPx + 6 * k), sPx) + (comp ? 22 * k + cPx : 0) + 34 * k;
  const crest = (c: string | null) => (c ? <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ height: cH }} />);
  const side = (c: string | null, n: ReturnType<typeof nameOf>) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {crest(c)}
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.06), color: "#fff", marginTop: i ? 6 * k : 14 * k }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Top data={d} blockH={h} drop={290}>
      <div style={{ width: W, height: h, borderRadius: 26 * k, background: "linear-gradient(160deg, #18202c, #0c1017)", boxShadow: "0 18px 44px rgba(0,0,0,.55)", border: `${3 * k}px solid ${ink}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 34 * k }}>
        <div style={{ height: badgeH, padding: `0 ${34 * k}px`, borderRadius: badgeH / 2, background: ink, display: "flex", alignItems: "center", fontFamily: DISPLAY, fontSize: 40 * k, letterSpacing: "0.12em", paddingLeft: `${34 * k + 0.12 * 40 * k}px`, color: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,.35)" }}>FINAL</div>
        <div style={{ display: "flex", alignItems: "flex-start", marginTop: 26 * k, width: W - 80 * k }}>
          {side(fx.homeCrest, hn)}
          <div style={{ width: colW, height: cH + 20 * k, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: sPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{score ? `${hg}–${ag}` : "FT"}</div>
          {side(fx.awayCrest, an)}
        </div>
        {comp && <div style={{ ...caps(cPx, 0.16, 700), color: "#fff", opacity: 0.8, marginTop: 22 * k }}>{comp}</div>}
      </div>
    </Top>
  );
}
