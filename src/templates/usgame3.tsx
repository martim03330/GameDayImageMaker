/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { SLAB } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { ObjectRow } from "./natfree23";
import { dropped } from "./natfree26";
import { fullName, roundTitle, whenRows } from "./natfree9";
import { scoreOf } from "./outline";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { CREST_HALO, fitCaps, linesOf, ourCrest, versusLines } from "./usgame1";

/*
 * US gameday looks, part 3 (bold: true; research in scratchpad us-gameday-research.md). Every block sits above his
 * head through Top / pickTextSpot (a dark panel when his head is too high): no type behind him to get hidden on a
 * tight crop.
 */

const W = CANVAS_W - 120;
const caps = (px: number, tracking: number, weight = 800, font = SANS): CSSProperties => ({ fontFamily: font, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap" });

/* ---------------- Sliding bars (Box Out's slide-motion / sliding-bars gameday) ---------------- */

/**
 * Gameday · barras deslizantes (matchday): three staggered bars sliding in from alternate sides — MATCHDAY 14 on his
 * club's colour, both crests and HOME X AWAY on white, date · kick-off · ground on black — each with a speed trail
 * blurred along x only.
 */
export function Usslidingbars({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const title = roundTitle(d);
  const p = 26 * k;
  const w1 = W * 0.78;
  const t1 = Math.min(78 * k * ts, (w1 - 2 * p) / Math.max(1, title.length * 0.5));
  const cH = 54 * k;
  const w2 = W * 0.92;
  const vs = versusLines(d, 27 * k * ts, w2 - 2 * p - 2 * (cH + 18 * k), 0.05, 21 * k);
  const w3 = W * 0.86;
  const rows = whenRows(d, 21 * k * ts, w3 - 2 * p, 0.1);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fitCaps(l, 21 * k * ts, w3 - 2 * p, 0.1)));
  const h1 = t1 + 2 * 20 * k;
  const h2 = Math.max(cH, vs.lines.length * (vs.px + 8 * k) - 8 * k) + 2 * 18 * k;
  const h3 = rows.length * (wPx + 10 * k) - 10 * k + 2 * 16 * k;
  const g = 12 * k;
  const blockH = h1 + g + h2 + (rows.length ? g + h3 : 0);
  const bar = (left: boolean, w: number, h: number, bg: string, body: ReactNode) => (
    <div style={{ position: "relative", height: h, width: W }}>
      {/* The trail: the same bar again behind it, blurred along x only, on the side it slid in from. */}
      <div style={{ position: "absolute", top: 0, height: h, width: w * 0.6, [left ? "left" : "right"]: -60 * k, background: bg, opacity: 0.55, filter: "url(#us-slide-x)" }} />
      <div style={{ position: "absolute", top: 0, height: h, width: w, [left ? "left" : "right"]: 0, background: bg, transform: "skewX(-12deg)", boxShadow: "0 10px 26px rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", top: 0, height: h, width: w, [left ? "left" : "right"]: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: `0 ${p}px`, boxSizing: "border-box" }}>{body}</div>
    </div>
  );
  const crest = (c: string | null) => (c ? <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain", flexShrink: 0, filter: CREST_HALO }} /> : null);
  return (
    <Top data={d} blockH={blockH} drop={290} align="stretch">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="us-slide-x" x="-50%" y="0" width="200%" height="100%">
          <feGaussianBlur stdDeviation={`${30 * k} 0`} />
        </filter>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: g, width: W }}>
        {bar(true, w1, h1, ink, <div style={{ fontFamily: DISPLAY, fontSize: t1, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{title}</div>)}
        {bar(
          false,
          w2,
          h2,
          "#f7f7f4",
          <div style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
            {crest(fx.homeCrest)}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {vs.lines.map((l, i) => (
                <div key={i} style={{ ...caps(vs.px, 0.05), color: "#15171b", marginTop: i ? 8 * k : 0 }}>{l}</div>
              ))}
            </div>
            {crest(fx.awayCrest)}
          </div>,
        )}
        {rows.length > 0 &&
          bar(
            true,
            w3,
            h3,
            "#111318",
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {rows.map((l, i) => (
                <div key={i} style={{ ...caps(wPx, 0.1, 700), color: "#fff", marginTop: i ? 10 * k : 0 }}>{l}</div>
              ))}
            </div>,
          )}
      </div>
    </Top>
  );
}

/* ---------------- Varsity letter patch (the letterman jacket) ---------------- */

const PREFIX = /^(SC|FC|CF|CD|SL|AC|AS|SD|UD|CS|SK|FK|NK|SV|VFB|VFL|TSV|AFC|CA|AL|EL|LA|LE|DE|THE|UNIVERSITY)$/i;

/** The letter of the club on the letterman patch: the first letter of its first real word ("SC Vianense SAD" → V). */
function clubLetter(data: RenderData): string {
  const words = ourClub(data).split(/\s+/).filter(Boolean);
  const w = words.find((x) => x.length > 2 && !PREFIX.test(x)) ?? words[0] ?? "";
  return (w.normalize("NFD").replace(/\p{M}/gu, "").match(/[A-Za-z0-9]/)?.[0] ?? "").toUpperCase();
}

/**
 * The chenille letter of a letterman jacket, as the college feeds use for their gameday "school letter": the club's
 * letter in a collegiate slab, in his club's colour on a white felt border inside a dark outer edge, with a small
 * embroidered bar under it.
 */
function LetterPatch({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const dark = shade(ink, -0.55);
  const letter = clubLetter(data) || "★";
  const px = w * 1.02;
  const t = (stroke: string, sw: number, fill: string) => (
    <text x={w / 2} y={w * 0.9} textAnchor="middle" style={{ fontFamily: SLAB, fontSize: px }} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke">
      {letter}
    </text>
  );
  return (
    <svg width={w} height={w * 1.1} style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      {t(dark, px * 0.16, dark)}
      {t("#fff", px * 0.1, ink)}
      <rect x={w * 0.22} y={w * 0.98} width={w * 0.56} height={w * 0.08} rx={w * 0.04} fill="#fff" stroke={dark} strokeWidth={w * 0.02} />
    </svg>
  );
}

/** Letra varsity (matchday): his club's letter as a letterman-jacket chenille patch beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Usletterpatch({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 170 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * 1.1} gap={34 * k}>
      <LetterPatch data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Stat card (UI-inspired game card, Duke WBB package) ---------------- */

/**
 * Golo · cartão de stats (goal): a dark interface card — a bar in his club's colour down the left, his crest and GOAL
 * at the top, his full name, then rows of label / value with hairline dividers: SCORE, OPPONENT, COMPETITION (only what
 * is on record), his club at the foot.
 */
export function Goalusstatcard({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const ink = clubInk(d);
  const f = matchFacts(d);
  const crest = ourCrest(d);
  const p = 36 * k;
  const iw = W - 2 * p - 14 * k;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const cH = 72 * k;
  const gPx = Math.min(96 * k * ts, (iw - cH - 20 * k) / Math.max(1, word.length * 0.5));
  const name = linesOf(fullName(d), 30 * k * ts, iw, 0.06, 22 * k);
  const score = scoreOf(d, "–");
  const rowsRaw = [score && ["SCORE", score], f.opp && ["OPPONENT", f.opp.toUpperCase()], f.comp && ["COMPETITION", f.comp.toUpperCase()]].filter(Boolean) as string[][];
  const lW = 220 * k;
  const vW = iw - lW;
  const rows = rowsRaw.map(([l, v]) => ({ l, v: linesOf(v, 26 * k * ts, vW, 0.04, 18 * k) }));
  const rowH = (r: (typeof rows)[number]) => Math.max(22 * k, r.v.lines.length * (r.v.px + 6 * k) - 6 * k) + 2 * 16 * k;
  const club = linesOf(ourClub(d).toUpperCase(), 20 * k * ts, iw, 0.16, 16 * k);
  const h = 2 * p + Math.max(cH, gPx) + 14 * k + name.lines.length * (name.px + 6 * k) + 10 * k + rows.reduce((a, r) => a + rowH(r), 0) + 14 * k + club.lines.length * (club.px + 6 * k);
  return (
    <Top data={d} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <div style={{ position: "relative", width: W, height: h, borderRadius: 26 * k, background: "linear-gradient(160deg, rgba(24,28,36,.96), rgba(10,12,16,.96))", boxShadow: "0 18px 44px rgba(0,0,0,.5)", overflow: "hidden", color: "#fff" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14 * k, background: ink }} />
          <div style={{ position: "absolute", left: p + 14 * k, right: p, top: p, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 * k }}>
              {crest && <img src={crest} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO }} />}
              <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
            </div>
            {name.lines.map((l, i) => (
              <div key={i} style={{ ...caps(name.px, 0.06), paddingLeft: 0, marginTop: i ? 6 * k : 14 * k }}>{l}</div>
            ))}
            <div style={{ height: 10 * k }} />
            {rows.map((r) => (
              <div key={r.l} style={{ display: "flex", alignItems: "center", minHeight: rowH(r), borderTop: "1px solid rgba(255,255,255,.18)" }}>
                <div style={{ ...caps(18 * k * ts, 0.18, 700), paddingLeft: 0, width: lW, color: "rgba(255,255,255,.6)" }}>{r.l}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
                  {r.v.lines.map((l, i) => (
                    <div key={i} style={{ ...caps(r.v.px, 0.04), paddingLeft: 0, marginTop: i ? 6 * k : 0 }}>{l}</div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: 14 * k }}>
              {club.lines.map((l, i) => (
                <div key={i} style={{ ...caps(club.px, 0.16, 700), paddingLeft: 0, color: ink === "#ffffff" ? "#fff" : shade(ink, 0.45), marginTop: i ? 6 * k : 0 }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </Shade>
    </Top>
  );
}
