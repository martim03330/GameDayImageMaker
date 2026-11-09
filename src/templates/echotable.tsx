/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { teamsOf } from "./notify";
import { capsEm } from "./rippleecho";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { EchoFigure, EchoLogo, echoSetup } from "./echotitle";

const M = 64;

/** Inter 500: advance widths per 100px (measured in the browser). */
const W500: Record<string, number> = { "0": 64.5, "1": 41.5, "2": 61.6, "3": 62.7, "4": 65.6, "5": 60.3, "6": 63, "7": 58.9, "8": 62.9, "9": 63, a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, ".": 30.3, ":": 30.3, "-": 46.3, "–": 50, "'": 31.3, "·": 30.3, "/": 37 };
const em = (t: string, track = -0.01) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (W500[c] ?? 60) / 100 + track, -track);

/** "TAÇA DE PORTUGAL 3RD QUALIFYING ROUND" → "Taça de Portugal"; "MALTA PREMIER LEAGUE OPENING" → "Premier League". */
function shortComp(c: string): string {
  let s = c.toUpperCase().replace(/\s+\b(OPENING|CLOSING|\d+(ST|ND|RD|TH)|QUALIFYING|ROUND|MATCHDAY|PHASE|STAGE)\b.*$/, "").trim();
  let w = s.split(/\s+/);
  if (s.length > 16 && w.length > 2 && /^(MALTA|MALTESE|PORTUGAL|PORTUGUESE|ENGLISH|SPANISH|ITALIAN|GERMAN|FRENCH|SWISS|CYPRUS|CYPRIOT|GREEK|POLISH|ROMANIAN|BELGIAN|DUTCH)$/.test(w[0])) w = w.slice(1);
  s = w.join(" ");
  return titleCase(s);
}

/**
 * Echo table: echoline's player and hairline echo on the deep club ground, with timetable's idea on the free
 * side — the info as one neat little table: the fixture as its heading (the title as a tiny caption over it),
 * then KICK-OFF / DATE / GROUND / COMPETITION rows, tiny spaced labels left, values right in Inter medium with
 * tabular figures, hairlines between the rows. Crests small at the top of the free side.
 */
export function Echotable({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 17);
  const f = matchFacts(data);
  const K = s.story ? 1.32 : 1;
  const hair = "rgba(255,255,255,.18)";
  const dim = "rgba(255,255,255,.5)";

  /* ---- the free column (narrowed to its content below) ---- */
  const maxW = (s.story ? 480 : 452) * Math.min(1.08, s.ts);
  const side: CSSProperties = s.right ? { left: M } : { right: M };

  /* ---- rows ---- */
  const rows = [
    { label: "Kick-off", value: f.time },
    { label: "Date", value: niceDate(content.date) },
    { label: "Ground", value: titleCase(f.venue) },
    { label: "Competition", value: shortComp(f.comp || f.round || "") },
  ].filter((r) => r.value);
  const LT = 0.24;
  const labSize = 13 * K * s.ts;
  const labW = Math.max(...rows.map((r) => capsEm(r.label, LT) * labSize)) + 28 * K;
  const valBase = 25 * K * s.ts;
  const room = maxW - labW - 8;
  // One size for every value, like a printed table: the short values set it; a long ground wraps onto a
  // second line rather than shrinking the whole table.
  const common = Math.max(15 * K, Math.min(valBase, ...rows.filter((r) => r.label !== "Ground").map((r) => room / Math.max(0.5, em(r.value)))));
  const wrapVal = (v: string): string[] => {
    if (em(v) * common <= room) return [v];
    // Two balanced lines ("Estádio Dr." / "José de Matos"), never an orphan word.
    const w = v.split(/\s+/);
    let best: string[] = [v];
    let bestW = Infinity;
    for (let i = 1; i < w.length; i++) {
      const pair = [w.slice(0, i).join(" "), w.slice(i).join(" ")];
      const m = Math.max(em(pair[0]), em(pair[1]));
      if (m < bestW) [best, bestW] = [pair, m];
    }
    return best;
  };
  const table = rows.map((r) => ({ ...r, lines: wrapVal(r.value) }));
  const valSize = (lines: string[]) => Math.min(common, room / Math.max(0.5, ...lines.map((l) => em(l))));
  // The table is only as wide as its longest value (values sit left on their column, clear of him).
  const valW = Math.max(...table.map((r) => Math.max(...r.lines.map((l) => em(l))) * valSize(r.lines)), 0);
  const tw = Math.min(maxW, Math.max(labW + valW + 24 * K, maxW * 0.8));
  const tx = s.right ? M : CANVAS_W - M - tw;
  const pitch = 60 * K * s.ts;
  const rowH = (lines: string[]) => pitch + (lines.length - 1) * common * 1.2;
  const tableH = table.reduce((a, r) => a + rowH(r.lines), 0);

  /* ---- heading: the title as a caption, then the fixture ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const capSize = Math.max(11, Math.min(14 * K, (tw * 0.8) / Math.max(1, capsEm(title, 0.42)))) * s.ts;
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const hBase = 36 * K * s.ts;
  const fixLines = teams.length === 2 && em(fixture, -0.02) * hBase > tw ? [teams[0], `v ${teams[1]}`] : [fixture];
  const hSize = Math.max(20, Math.min(hBase, tw / Math.max(...fixLines.map((l) => em(l, -0.02) * 1.02))));
  const hLead = hSize * 1.14;

  /* ---- vertical: the table's last rule ~66px above the logo ---- */
  const logoTop = s.story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const tableBottom = logoTop - 66 + (params.textY ?? 0);
  const tableTop = tableBottom - tableH;
  const headRule = tableTop;
  const hTop = headRule - 26 * K - fixLines.length * hLead;
  const capTop = hTop - 22 * K - capSize;

  /* ---- the player, towards his side ---- */
  const fx = s.story ? (s.right ? 790 : 290) : s.right ? 730 : 350;
  const box = s.story
    ? placeByFace(data, fx, 400, { chest: 330, waist: 266, knees: 200, full: 156 })
    : placeByFace(data, fx, 250, { chest: 270, waist: 214, knees: 160, full: 122 });

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const CR = 42 * K;
  const tiny: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: labSize, letterSpacing: `${LT}em`, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, color: dim };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure data={data} s={s} box={box} id="echotable" light={[s.right ? 62 : 38, 40]} />

      {/* A soft veil of the ground behind the table, so it reads over his faded arm. */}
      <div style={{ position: "absolute", left: tx - 120, top: capTop - 90, width: tw + 240, height: tableBottom - capTop + 180, background: `radial-gradient(closest-side, ${s.deep}b3, ${s.deep}66 55%, transparent)` }} />

      {/* Crests, small, top of the free side. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: s.story ? STORY_TOP : M, ...side, display: "flex", gap: 18 * K, alignItems: "center", flexDirection: "row" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* Heading: caption + fixture. */}
      <div style={{ position: "absolute", left: tx, top: capTop, ...tiny, fontSize: capSize, letterSpacing: "0.42em", color: s.white ? "rgba(255,255,255,.72)" : s.tint }}>{title}</div>
      <div style={{ position: "absolute", left: tx, top: hTop, width: tw, fontFamily: SANS, fontWeight: 500, fontSize: hSize, lineHeight: `${hLead}px`, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: "#fff" }}>
        {fixLines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: tx, top: headRule, width: tw, height: 1.5, background: "rgba(255,255,255,.55)" }} />

      {/* The rows. */}
      {table.map((r, i) => {
        const top = tableTop + table.slice(0, i).reduce((acc, x) => acc + rowH(x.lines), 0);
        const mid = top + pitch / 2;
        const vs = valSize(r.lines);
        return (
          <div key={i}>
            {i > 0 && <div style={{ position: "absolute", left: tx, top, width: tw, height: 1, background: hair }} />}
            <div style={{ position: "absolute", left: tx, top: mid - labSize * 0.5, ...tiny }}>{r.label}</div>
            <div
              style={{
                position: "absolute",
                left: tx + labW,
                top: mid - vs * 0.5,
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: vs,
                lineHeight: `${common * 1.2}px`,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
                color: "#fff",
              }}
            >
              {r.lines.map((l, j) => (
                <div key={j} style={{ height: j === 0 ? vs : undefined, lineHeight: j === 0 ? 1 : undefined, marginTop: j === 0 ? 0 : common * 0.2 }}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: tx, top: tableBottom, width: tw, height: 1, background: hair }} />

      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
