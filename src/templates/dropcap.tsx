/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { longDate } from "./superscript";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1eee8";
const INK = "#16171a";

/* Measured in the browser (per 1px of font size). */
const INTER_ASC = 0.97;
const INTER_CONTENT = 1.21;
const INTER_CAP = 0.728;
const DM_ASC = 1.04;
const DM_CONTENT = 1.38;
const DM_CAP = 0.66;
/** DM Serif capitals: ink width per 1px and the left side bearing. */
const DM_CAP_W: Record<string, number> = { M: 0.749, G: 0.621, B: 0.6, H: 0.68, A: 0.66, R: 0.63, T: 0.6, D: 0.64, C: 0.58, S: 0.48, W: 0.86, F: 0.52, P: 0.54, K: 0.62, N: 0.62, E: 0.54, V: 0.6, O: 0.65 };
const DM_LSB = 0.02;

/** Lines the cap spans. */
const SPAN = 4;

type Mode = "matchday" | "goal";

/**
 * Breaks the words into a justified column whose first SPAN lines run beside the initial (`indent` narrower).
 * Tries column widths from `maxW` down to `minW` and keeps the most even setting: small gaps between words,
 * the paragraph at least SPAN lines deep (the initial never hangs below it), no lone word on the last line.
 */
function setColumn(widths: number[], space: number, indent: number, maxW: number, minW: number) {
  const n = widths.length;
  let best = { cost: Infinity, colW: maxW, lines: [widths.map((_, i) => i)] };
  for (let colW = Math.round(maxW); colW >= minW; colW -= 6) {
    const lineW = (i: number) => (i < SPAN ? colW - indent : colW);
    // dp over (start word, line index): cheapest way to set words[start..] from line `li` on.
    const memo = new Map<string, { cost: number; breaks: number[] }>();
    const go = (start: number, li: number): { cost: number; breaks: number[] } => {
      if (start >= n) return { cost: li < SPAN ? 3000 * (SPAN - li) : 0, breaks: [] };
      if (li > SPAN + 3) return { cost: Infinity, breaks: [] };
      const key = `${start}:${li}`;
      const hit = memo.get(key);
      if (hit) return hit;
      let res = { cost: Infinity, breaks: [] as number[] };
      let natural = -space;
      for (let end = start; end < n; end++) {
        natural += widths[end] + space;
        const W = lineW(li);
        if (natural > W) break;
        const gaps = end - start;
        const isLast = end === n - 1;
        let c: number;
        if (isLast) {
          // The last line ragged; a lone word or a stub beside the initial reads badly.
          c = (gaps === 0 && n > 2 ? 600 : 0) + (li < SPAN && natural < W * 0.5 ? 80 : 0);
        } else if (gaps === 0) {
          c = 2500; // a lone word stretched over a whole line
        } else {
          const r = (W - natural) / gaps / space; // extra per gap, in spaces
          c = 100 * r * r;
        }
        const rest = go(end + 1, li + 1);
        if (c + rest.cost < res.cost) res = { cost: c + rest.cost, breaks: [end + 1, ...rest.breaks] };
      }
      memo.set(key, res);
      return res;
    };
    const r = go(0, 0);
    const cost = r.cost + (maxW - colW) * 0.08;
    if (cost < best.cost) {
      const lines: number[][] = [];
      let s0 = 0;
      for (const e of r.breaks) {
        lines.push(Array.from({ length: e - s0 }, (_, k) => s0 + k));
        s0 = e;
      }
      best = { cost, colW, lines };
    }
  }
  return best;
}

/**
 * The shared page of `dropcap` / `goaldropcap`: one editorial idea — the post opens like an article, a huge
 * DM Serif initial dropped four lines deep, the rest of the first word in spaced small capitals, then one short
 * justified sentence in Inter set as a neat narrow column on the free side. The competition in tiny caps under
 * it, the player big on the other side, the NEYOD logo at the foot of the column.
 */
export function DropcapPage({ data, mode }: { data: RenderData; mode: Mode }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const club = clubTone(data);
  const goal = mode === "goal";
  const f = matchFacts(data);

  /* ---- colours ---- */
  const ground = goal ? shade(club, -0.62) : PAPER;
  const capColor = goal ? shade(club, 0.72) : club;
  const text = goal ? "rgba(255,255,255,.94)" : INK;
  const quiet = goal ? "rgba(255,255,255,.6)" : "rgba(22,23,26,.56)";

  /* ---- the words ---- */
  const word = sentenceCase(content.kicker || (goal ? "Goal" : "Matchday")).replace(/[.!]+$/, "");
  const initial = word.charAt(0).toUpperCase();
  const lead = `${word.slice(1).toUpperCase()}.`;
  const [home = "", away = ""] = teamsOf(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const usName = weHost ? home : away;
  const themName = weHost ? away : home;
  const compName = titleCase(f.comp || "").trim();
  let sentence: string;
  if (goal) {
    const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
    sentence = [name ? `${name} scores` : "A goal", usName ? `for ${usName}` : "", themName ? `against ${themName}` : "", compName ? `in the ${compName}` : ""].filter(Boolean).join(" ") + ".";
  } else {
    const date = longDate(content.date);
    const venue = (content.venue ?? "").trim() || titleCase(f.venue);
    const fixture = home && away ? `${home} host ${away}` : home || away ? `${home || away} play` : "";
    sentence = [fixture, date ? `on ${date}` : "", f.time ? `at ${f.time}` : "", venue ? `at ${venue}` : ""].filter(Boolean).join(" ").trim();
    sentence = sentence ? `${sentence}.` : "";
  }
  const compRaw = [titleCase(f.comp || ""), titleCase(f.round || "")].filter(Boolean);
  const comp = (compRaw[1] && compRaw[1].toLowerCase() === compRaw[0]?.toLowerCase() ? [compRaw[0]] : compRaw).join(" · ").toUpperCase();

  /* ---- the column: set line by line, the breaks chosen for even spacing ---- */
  const M = story ? 84 : 72;
  const b = (story ? 40 : goal ? 29 : 28) * ts;
  const L = b * 1.42;
  const base0 = (L - INTER_CONTENT * b) / 2 + INTER_ASC * b; // baseline of a line under its top
  const capH = (SPAN - 1) * L + INTER_CAP * b;
  const C = capH / DM_CAP;
  const capInk = (DM_CAP_W[initial] ?? 0.66) * C;
  const indent = capInk + b * 0.6;
  const capBoxTop = (SPAN - 1) * L + base0 - ((C - DM_CONTENT * C) / 2 + DM_ASC * C);
  const leadSize = b * 0.78;
  const leadTrack = 0.1;
  const words = [lead, ...sentence.split(/\s+/).filter(Boolean)];
  // Natural widths (a hair generous, so a justified line never runs over).
  const widths = words.map((w, i) => (i === 0 ? titleW(w, leadSize) + leadTrack * leadSize * [...w].length : bodyW(w, b)) * 1.025);
  const space = 0.281 * b;
  const maxW = story ? CANVAS_W - 2 * M : goal ? 500 : 566;
  const set = setColumn(widths, space, indent, maxW, Math.min(maxW, indent + 7 * b));
  const colW = set.colW;
  const lines = set.lines.length;
  const colLeft = right ? M : CANVAS_W - M - colW;
  const compSize = Math.max(12, Math.min((story ? 17 : 14) * ts, colW / Math.max(1, comp.length * 0.8)));
  const compGap = b * 1.1;
  const showComp = !goal && !!comp;
  // Last baseline of the block under the column's top: the comp line's (caps sit on it), else the paragraph's.
  const paraH = Math.max(lines, SPAN) * L;
  const blockH = showComp ? paraH + compGap + compSize * 1.12 : (Math.max(lines, SPAN) - 1) * L + base0;

  /* ---- the foot ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  // AgencyLogo's real height: max(52, 1.5×asked) in the post, max(88, 1.7×that) in the story.
  const logoAsked = story ? 24 : 22;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsked * 1.5) * 1.7)) : Math.max(52, logoAsked * 1.5);
  const logoTop = H - logoBottom - logoH;

  // Matchday opens at the top like an article; the goal post sits at the foot, clear of raised arms.
  const colTop =
    (goal && !story ? logoTop - 66 - blockH : (story ? STORY_TOP : 104) - (base0 - INTER_CAP * b)) + (params.textY ?? 0);
  const colBottom = colTop + blockH;

  /* ---- the player, big, on his side ---- */
  const faceX = goal ? (right ? (story ? 720 : 790) : story ? 360 : 290) : right ? (story ? 740 : 770) : story ? 340 : 310;
  // In the story the column opens the page for both; a goal leaves room above his head for a raised fist.
  const faceTop = story ? Math.max(colBottom + (goal ? 210 : 190), goal ? 640 : 600) : goal ? 150 : 250;
  const sizes = goal
    ? story
      ? { chest: 290, waist: 232, knees: 186, full: 150 }
      : { chest: 220, waist: 176, knees: 140, full: 112 }
    : story
      ? { chest: 360, waist: 290, knees: 228, full: 178 }
      : { chest: 262, waist: 214, knees: 168, full: 132 };
  let box = placeByFace(data, faceX, faceTop, sizes);
  if (goal) {
    // A fist thrown out to one side: keep the whole figure on the canvas, the face on its own side.
    const lean = Math.max(-80, Math.min(80, right ? Math.min(0, CANVAS_W + 10 - (box.left + box.width)) : Math.max(0, -10 - box.left)));
    box = { ...box, left: box.left + lean };
  }

  const para: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    height: L,
    fontFamily: SANS,
    fontWeight: 400,
    fontSize: b,
    lineHeight: `${L}px`,
    color: text,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: text }}>
      {/* The ground: flat, the faintest light behind him. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: goal
            ? `radial-gradient(70% 55% at ${right ? 68 : 32}% 48%, ${shade(club, -0.38)}, ${ground} 64%, ${shade(ground, -0.25)} 100%)`
            : `radial-gradient(70% 55% at ${right ? 70 : 30}% 52%, ${shade(PAPER, 0.4)}, ${PAPER} 62%, ${shade(PAPER, -0.05)} 100%)`,
        }}
      />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}

      {/* The column: the dropped initial, then the sentence wrapping round it. */}
      <div style={{ position: "absolute", left: colLeft, top: colTop, width: colW }}>
        <span
          aria-hidden
          style={{ position: "absolute", left: -DM_LSB * C, top: capBoxTop, fontFamily: DMSERIF, fontSize: C, lineHeight: `${C}px`, color: capColor, whiteSpace: "nowrap" }}
        >
          {initial}
        </span>
        {set.lines.map((ln, i) => {
          const w = i < SPAN ? colW - indent : colW;
          const last = i === lines - 1;
          return (
            <div key={i} style={{ ...para, marginLeft: i < SPAN ? indent : 0, width: w, justifyContent: last ? "flex-start" : "space-between", gap: last ? space : 0 }}>
              {ln.map((k) =>
                k === 0 ? (
                  <span key={k} style={{ fontWeight: 600, fontSize: leadSize, letterSpacing: `${leadTrack}em` }}>
                    {words[0]}
                  </span>
                ) : (
                  <span key={k}>{words[k]}</span>
                ),
              )}
            </div>
          );
        })}
        {showComp && (
          <div style={{ position: "absolute", left: 0, top: paraH + compGap - compSize * 0.25, width: colW, fontFamily: SANS, fontWeight: 500, fontSize: compSize, lineHeight: 1.3, letterSpacing: "0.16em", color: quiet, whiteSpace: "nowrap" }}>{comp}</div>
        )}
      </div>

      <AgencyLogo
        data={data}
        onLight={!goal}
        height={logoAsked}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={goal ? 0.16 : 0.1} />
    </div>
  );
}

/**
 * Dropcap: the matchday post set like the opening of a magazine article. A huge DM Serif "M" in the club
 * colour dropped four lines deep, "ATCHDAY." in spaced small caps, then one justified sentence — "SC Vianense
 * SAD host Leixões on 17 October at 15:00 at Estádio Dr. José de Matos." (home first, names as stored). Pale
 * paper, the player big on the other side.
 */
export function Dropcap({ data }: { data: RenderData }) {
  return <DropcapPage data={data} mode="matchday" />;
}
