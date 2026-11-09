import type { CSSProperties } from "react";
import { Film } from "./fx";
import { EchoLine, echoTones, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { sentenceCase, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { niceDate, titleCase } from "./wall";

/** Inter 500: advance widths per 100px (measured in the browser, as in goalswiss). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3, "!": 28 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);

/* The grid: 12 columns, 60px margins, 20px gutters. */
const MARGIN = 60;
const GUTTER = 20;
const COL = (CANVAS_W - MARGIN * 2 - GUTTER * 11) / 12;
const colX = (i: number) => MARGIN + i * (COL + GUTTER);
const span = (n: number) => n * COL + (n - 1) * GUTTER;

/** Greedy lines that fit `width` at `size`. */
function wrap(text: string, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last && interEm(`${last} ${w}`, -0.01) * size <= width) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines.length ? lines : [""];
}

/** Words into at most two lines, the break as even as possible. */
function twoLines(t: string): string[] {
  const w = t.split(/\s+/).filter(Boolean);
  if (w.length < 2) return [t];
  let best = [t];
  let bestW = Infinity;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(" ");
    const b = w.slice(i).join(" ");
    const m = Math.max(interEm(a), interEm(b));
    if (m < bestW) [best, bestW] = [[a, b], m];
  }
  return best;
}

/**
 * Goal echo swiss: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — set on goalswiss's quiet 12-column grid: a hairline
 * under a tiny top row (club / date), "Goal" in sentence-case Inter flush-left on the free columns, and down
 * that column a small hairline-ruled table — Scorer / Fixture (home first, names as stored, no score) /
 * Competition. NEYOD on the column's margin at the foot.
 */
export function Goalechoswiss({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.32 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const { deep, lift, echo, clubLine } = echoTones(data);
  // He stands on params.side; the text column is on the other side.
  const right = params.side !== "left";
  const f = matchFacts(data);

  /* ---- the text column: cols 1–5 (he stands right) or cols 8–12 (he stands left) ---- */
  const cols = 5;
  const tx = colX(right ? 0 : 12 - cols);
  const tw = span(cols);
  const alignEdge: CSSProperties = right ? { left: tx } : { left: tx };

  /* ---- top row and its hairline ---- */
  const ours = data.club?.name ?? "";
  const date = niceDate(content.date);
  const rowTop = (story ? STORY_TOP : 62) + ty;
  const rowSize = 16 * S;
  const crestSize = 34 * S;
  const lc = (v?: string) => (v ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const TOP_RULE = rowTop + rowSize * 1.2 + 18 * S;

  /* ---- title: one short word, sentence case ---- */
  const title = sentenceCase(content.kicker || "Goal");
  const tracking = -0.045;
  // Room to the far margin (the column may only run on into the player's side when it is the left one).
  const titleW = right ? span(cols + 1) : CANVAS_W - MARGIN - tx;
  let size = Math.min((story ? 210 : 158) * ts, titleW / Math.max(1, interEm(title, tracking)));
  const titleLines = size < 90 * S && title.includes(" ") ? twoLines(title) : [title];
  if (titleLines.length > 1) size = Math.min((story ? 170 : 128) * ts, titleW / Math.max(1, ...titleLines.map((l) => interEm(l, tracking))));
  const lead = size * 0.98;
  const titleTop = TOP_RULE + 34 * S;
  const titleBottom = titleTop + lead * titleLines.length;

  /* ---- the table, bottom up: its last line ends ~64px above the logo (story) / above the post's logo ---- */
  const scorer = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const teams = teamsOf(data);
  const comp = titleCase(f.comp || "") || titleCase(f.round || "");
  const valueSize = 27 * S * ts;
  const fixture = teams.length === 2 ? `${teams[0]} v ${teams[1]}` : teams.join("");
  const rows = [
    { label: "Scorer", lines: wrap(scorer, valueSize, tw) },
    { label: "Fixture", lines: interEm(fixture, -0.01) * valueSize <= tw ? [fixture] : teams.length === 2 ? [`${teams[0]} v`, teams[1]] : teams },
    { label: "Competition", lines: wrap(comp, valueSize, tw) },
  ].filter((r) => r.lines.join("").trim());
  const labelSize = 14 * S * ts;
  const rowGap = 22 * S;
  const rowH = (r: { lines: string[] }) => 1.5 + 16 * S + labelSize * 1.2 + 6 * S + valueSize * 1.2 * r.lines.length;
  const tableH = rows.reduce((a, r) => a + rowH(r), 0) + rowGap * (rows.length - 1);
  // Logo: story ~88px tall ending at STORY_BOTTOM (top 1592); post ~52px with its bottom 52px up (top ~1246).
  const tableBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 52 - 52 - 52) - ty;
  const tableTop = tableBottom - tableH;

  /* ---- the player, centred in the free columns ---- */
  const free = right ? [colX(cols) - GUTTER, CANVAS_W] : [0, colX(12 - cols)];
  const cx = (free[0] + free[1]) / 2 + (right ? 1 : -1) * (story ? 60 : 20);
  const box = goalBox(data, { faceX: cx, faceTop: story ? Math.max(520, titleBottom + 110) : 270, cx, maxW: (free[1] - free[0]) * 1.2, story, minHead: TOP_RULE + 24 });
  const dx = (right ? -1 : 1) * 28 * S;
  const dy = -24 * S;

  const hair = "rgba(255,255,255,.34)";
  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: labelSize, letterSpacing: "0.01em", color: "rgba(255,255,255,.56)", lineHeight: 1.2, whiteSpace: "nowrap" };
  const value: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: valueSize, letterSpacing: "-0.01em", color: WHITE, lineHeight: 1.2, whiteSpace: "nowrap" };
  const row: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: rowSize, color: WHITE, lineHeight: 1.2, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 48% at ${right ? 66 : 34}% ${story ? 38 : 42}%, ${lift}, ${deep} 82%)` }} />

      {/* The column's inner hairline, from the top rule down to the table. */}
      <div style={{ position: "absolute", left: right ? tx + tw + GUTTER / 2 : tx - GUTTER / 2, top: TOP_RULE, width: 1, height: tableTop - TOP_RULE - 30 * S, background: `linear-gradient(to bottom, ${hair}, transparent)` }} />

      <EchoLine id="goalechoswiss" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={TOP_RULE + 2} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* Top row: club name as stored, date on the far margin; the hairline under it. */}
      <div style={{ position: "absolute", left: MARGIN, top: rowTop, ...row }}>{ours}</div>
      {date && <div style={{ position: "absolute", left: colX(4), top: rowTop, ...row, color: "rgba(255,255,255,.56)" }}>{date}</div>}
      <div style={{ position: "absolute", right: MARGIN, top: rowTop + rowSize * 0.6 - crestSize / 2, height: crestSize, display: "flex", gap: 12 * S }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: TOP_RULE, height: 1.5, background: "rgba(255,255,255,.55)" }} />

      {/* Title, flush-left on its column. */}
      <div style={{ position: "absolute", ...alignEdge, top: titleTop, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: `${lead}px`, letterSpacing: `${tracking}em`, color: WHITE, whiteSpace: "nowrap" }}>
        {titleLines.map((l, i) => (
          <div key={i} style={{ marginLeft: -size * 0.05 }}>
            {l}
          </div>
        ))}
      </div>
      {/* The one accent: a club-colour square under the title. */}
      <div style={{ position: "absolute", ...alignEdge, top: titleBottom + 22 * S, width: 14 * S, height: 14 * S, background: clubLine }} />

      {/* The table: a hairline over each row, label, value. */}
      <div style={{ position: "absolute", ...alignEdge, top: tableTop, width: tw, display: "flex", flexDirection: "column", gap: rowGap }}>
        {rows.map((r, i) => (
          <div key={i}>
            <div style={{ height: 1.5, background: hair, marginBottom: 16 * S }} />
            <div style={label}>{r.label}</div>
            <div style={{ ...value, marginTop: 6 * S }}>
              {r.lines.map((l, j) => (
                <div key={j}>{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 18}
        style={{ position: "absolute", left: tx, bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
