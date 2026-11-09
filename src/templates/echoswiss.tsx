/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { sentenceCase, teamsOf } from "./notify";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { EchoFigure, EchoLogo, echoSetup } from "./echotitle";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3, ".": 28, ",": 28, ":": 28 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);

/* swiss's grid: 12 columns, 60px margins, 20px gutters. */
const MARGIN = 60;
const GUTTER = 20;
const COL = (CANVAS_W - MARGIN * 2 - GUTTER * 11) / 12;
const colX = (i: number) => MARGIN + i * (COL + GUTTER);
const span = (n: number) => n * COL + (n - 1) * GUTTER;

/** Greedy lines that fit `width` at `size`. */
function wrap(text: string, size: number, width: number, tracking: number): string[] {
  const lines: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last && interEm(`${last} ${w}`, tracking) * size <= width) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines.length ? lines : [""];
}

/** A value that runs past its cell, broken into two balanced lines (never an orphan word). */
function balanced(v: string, size: number, width: number): string[] {
  if (interEm(v) * size <= width) return [v];
  const w = v.split(/\s+/);
  let best = [v];
  let bestW = Infinity;
  for (let i = 1; i < w.length; i++) {
    const pair = [w.slice(0, i).join(" "), w.slice(i).join(" ")];
    const m = Math.max(interEm(pair[0]), interEm(pair[1]));
    if (m < bestW) [best, bestW] = [pair, m];
  }
  return best;
}

/**
 * Echo swiss: echoline's player and hairline echo on the deep club ground, with swiss's quiet grid on the free
 * side — a hairline across the top under a small row (club · competition · crests), "Matchday" in clean
 * sentence-case Inter flush-left on the column, and low on the column the fixture over a hairline and a small
 * two-column table of grey labels over white values (date, kick-off, ground, round).
 */
export function Echoswiss({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 23);
  const f = matchFacts(data);
  const S = s.story ? 1.3 : 1;
  const RULE = "rgba(255,255,255,.3)";
  const GREY = "rgba(255,255,255,.5)";

  /* ---- the free column: cols 1–6 when he stands right, 7–12 when he stands left ---- */
  const tx = s.right ? colX(0) : colX(6);
  const tw = span(6);

  /* ---- top row and its rule ---- */
  const rowTop = s.story ? STORY_TOP : 66;
  const TOP_RULE = rowTop + 62 * S;
  const ours = data.club?.name ?? "";
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const topText = (t: string, w: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: Math.max(13, Math.min(18 * S, w / Math.max(1, interEm(t)))), color, lineHeight: 1.2, whiteSpace: "nowrap" });

  /* ---- title ---- */
  const title = sentenceCase(content.kicker || "Matchday");
  const tracking = -0.045;
  let size = (s.story ? 150 : 116) * s.ts;
  let lines = wrap(title, size, tw, tracking);
  while ((lines.length > 2 || lines.some((l) => interEm(l, tracking) * size > tw)) && size > 60) {
    size -= 3;
    lines = wrap(title, size, tw, tracking);
  }
  const lead = size * 0.98;
  const titleTop = TOP_RULE + 40 * S + (params.textY ?? 0);

  /* ---- the foot of the column: fixture, rule, the table; its last line ~64px over the logo ---- */
  const logoTop = s.story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  let fixSize = 30 * S * s.ts;
  // A fixture that would run into him breaks after the "v" instead of shrinking.
  const fw = s.story ? span(5) : tw;
  const fixLines = teams.length === 2 && interEm(fixture) * fixSize > fw ? [teams[0], `v ${teams[1]}`] : [fixture];
  fixSize = Math.max(18, Math.min(fixSize, fw / Math.max(...fixLines.map((l) => interEm(l) * 1.03))));

  const cells = [
    { label: "Date", value: niceDate(content.date) },
    { label: "Kick-off", value: f.time },
    { label: "Ground", value: titleCase(f.venue) },
    { label: "Round", value: round && comp ? round : comp },
  ].filter((c) => c.value);
  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));
  const cw = span(3);
  const lab = 15 * S;
  const valMax = 24 * S;
  const valSize = (v: string) => Math.max(17, Math.min(valMax, (cw * 2) / Math.max(1, interEm(v)) / 1.02));
  const linesOf = (v: string) => (interEm(v) * valSize(v) > cw ? 2 : 1);
  const rowH = (r: typeof cells) => lab * 1.2 + 8 * S + Math.max(...r.map((c) => linesOf(c.value) * valSize(c.value) * 1.18));
  const rowGap = 22 * S;
  const tableH = rows.reduce((a, r) => a + rowH(r), 0) + Math.max(0, rows.length - 1) * (rowGap * 2 + 1);
  const tableBottom = logoTop - 66;
  const FOOT_RULE = tableBottom - tableH - 26 * S;
  const fixBottom = FOOT_RULE - 40 * S;

  /* ---- the player, on the other side ---- */
  const fx = s.story ? (s.right ? 760 : 320) : s.right ? 730 : 350;
  const box = s.story
    ? placeByFace(data, fx, Math.max(500, titleTop + lead * lines.length + 40), { chest: 340, waist: 272, knees: 204, full: 158 })
    : placeByFace(data, fx, 300, { chest: 270, waist: 214, knees: 160, full: 122 });

  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: lab, letterSpacing: "0.01em", color: GREY, lineHeight: 1.2, whiteSpace: "nowrap" };
  const value = (v: string): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: valSize(v), letterSpacing: "-0.01em", color: "#fff", lineHeight: 1.18, marginTop: 8 * S, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" });
  let y = tableBottom - tableH;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure data={data} s={s} box={box} id="echoswiss" clipTop={TOP_RULE + 8} outward light={[s.right ? 64 : 36, 42]} />

      {/* Top row: club, competition, crests; a hairline across under it. */}
      <div style={{ position: "absolute", left: colX(0), top: rowTop + 14 * S, width: span(4), ...topText(ours, span(4), "rgba(255,255,255,.92)") }}>{ours}</div>
      <div style={{ position: "absolute", left: colX(4), top: rowTop + 14 * S, width: span(5), ...topText(comp || round, span(5), GREY) }}>{comp || round}</div>
      <div style={{ position: "absolute", right: MARGIN, top: rowTop, height: 46 * S, display: "flex", gap: 14 * S, alignItems: "center" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 40 * S, height: 40 * S, objectFit: "contain" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: TOP_RULE, height: 1, background: RULE }} />

      {/* Title, flush-left on the free column. */}
      <div style={{ position: "absolute", left: tx, top: titleTop, width: tw, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: `${lead}px`, letterSpacing: `${tracking}em`, color: "#fff", whiteSpace: "nowrap" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginLeft: -size * 0.05 }}>
            {l}
          </div>
        ))}
      </div>

      {/* Fixture over the foot rule, with the one accent: a small square in the echo's colour. */}
      <div style={{ position: "absolute", left: tx, bottom: s.H - fixBottom, width: tw }}>
        <div style={{ marginBottom: 16 * S, display: "flex", alignItems: "center", gap: 12 * S, fontFamily: SANS, fontWeight: 500, fontSize: 16 * S, color: GREY, whiteSpace: "nowrap" }}>
          <span style={{ width: 12 * S, height: 12 * S, background: s.white ? "#fff" : s.tint, display: "inline-block" }} />
          Fixture
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: fixSize, letterSpacing: "-0.015em", color: "#fff", whiteSpace: "nowrap", lineHeight: 1.2 }}>
          {fixLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>

      {/* Foot rule and the two-column table on the free column. */}
      <div style={{ position: "absolute", left: tx, width: tw, top: FOOT_RULE, height: 1, background: RULE }} />
      {rows.map((r, i) => {
        const top = y;
        y += rowH(r) + rowGap * 2 + 1;
        return (
          <div key={i}>
            {i > 0 && <div style={{ position: "absolute", left: tx, width: tw, top: top - rowGap - 1, height: 1, background: "rgba(255,255,255,.14)" }} />}
            {r.map((c, j) => (
              <div key={j} style={{ position: "absolute", left: tx + j * (cw + GUTTER), top, width: cw }}>
                <div style={label}>{c.label}</div>
                <div style={value(c.value)}>
                  {balanced(c.value, valSize(c.value), cw).map((l, n) => (
                    <div key={n}>{l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
