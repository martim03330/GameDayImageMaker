/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { interEm } from "./marker";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { longDate } from "./superscript";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1eee8";

/* Inter, measured in the browser (per 1px of font size). */
const INTER_ASC = 0.97;
const INTER_CONTENT = 1.21;
const INTER_CAP = 0.728;
/** Inter 700 runs this much wider than the 500 table. */
const BOLD = 1.045;
const NB = " ";

type Mode = "matchday" | "goal";
/** One unbreakable run of the texture: a word, with the "·" after it glued on. `hot` = the highlighted word. */
type Tok = { text: string; hot: boolean };

/**
 * Sets an endless repeat of `phrase` into `rows` lines of exactly `side` px. The breaks are chosen together
 * (dynamic programming over the whole block) so the spacing stays even: each line's slack is taken up partly
 * by a hair of tracking (looser or tighter) and the rest by the gaps between words (flex space-between), so
 * every edge of the block is straight — the last line too, since the stream never ends.
 */
function setSquare(phrase: Tok[], size: number, track: number, side: number, rows: number, start = 0) {
  const n = phrase.length;
  const w = (t: Tok) => interEm(t.text, track) * size * (t.hot ? BOLD : 1) * 1.012;
  const gap = interEm(" ", track) * size;
  const tok = (i: number) => phrase[i % n];
  // Setting tokens [i, j) on one line: extra tracking per glyph and the cost of the result.
  const fit = (i: number, j: number) => {
    let natural = -gap;
    let glyphs = 0;
    for (let k = i; k < j; k++) {
      natural += w(tok(k)) + gap;
      glyphs += [...tok(k).text].length;
    }
    const slack = side - natural;
    const gaps = j - i - 1;
    const extra = Math.max(-size * 0.02, Math.min(size * 0.08, (slack * (gaps ? 0.65 : 1)) / Math.max(1, glyphs)));
    const perGap = gaps ? (slack - extra * glyphs) / gaps : slack - extra * glyphs;
    if (perGap < -gap * 0.25 || (!gaps && Math.abs(perGap) > size)) return { extra, cost: Infinity };
    const r = perGap / gap;
    return { extra, cost: 100 * r * r + 40 * (extra / (size * 0.03)) ** 2 };
  };
  const memo = new Map<string, { cost: number; ends: number[] }>();
  const go = (i: number, r: number): { cost: number; ends: number[] } => {
    if (r === rows) return { cost: 0, ends: [] };
    const key = `${i}:${r}`;
    const hit = memo.get(key);
    if (hit) return hit;
    let best = { cost: Infinity, ends: [] as number[] };
    for (let j = i + 1; j <= i + 40; j++) {
      const c = fit(i, j);
      if (c.cost === Infinity) {
        if (j - i > 1 && c.extra <= -size * 0.02 + 1e-6) break; // over-full: longer lines only get worse
        continue;
      }
      const rest = go(j, r + 1);
      if (c.cost + rest.cost < best.cost) best = { cost: c.cost + rest.cost, ends: [j, ...rest.ends] };
    }
    memo.set(key, best);
    return best;
  };
  const { ends, cost } = go(start, 0);
  const lines: { toks: Tok[]; extra: number }[] = [];
  let i = start;
  for (const j of ends) {
    lines.push({ toks: Array.from({ length: j - i }, (_, k) => tok(i + k)), extra: fit(i, j).extra });
    i = j;
  }
  return { lines, cost, track };
}

/** The most even setting over a small range of base trackings and opening words. */
function bestSquare(phrase: Tok[], size: number, side: number, rows: number) {
  // Opening on the title word is preferred; another word of the sentence may open it when that sets far better.
  let best = { ...setSquare(phrase, size, 0.2, side, rows), cost: Infinity };
  for (let st = 0; st < phrase.length; st++) {
    if (st && phrase[st - 1].text.endsWith("·") === false) continue; // only at the start of a part
    for (let t = 0.14; t <= 0.261; t += 0.02) {
      const s = setSquare(phrase, size, t, side, rows, st);
      const cost = s.cost + (st ? 420 : 0);
      if (cost < best.cost) best = { ...s, cost };
    }
  }
  return best;
}

/**
 * The shared page of `textsquare` / `goaltextsquare`: one typographic idea — a perfect square of small tracked
 * capitals, every line exactly the same width (the last one too), made by repeating the post's one sentence
 * ("MATCHDAY · SC VIANENSE SAD V LEIXÕES · 17 OCTOBER · 15:00 · ESTÁDIO … ·") until it reads as a quiet grey
 * texture, where only the title word lights up in the club colour. The square on the free side, the player
 * big on the other, the NEYOD mark under the square.
 */
export function TextsquarePage({ data, mode }: { data: RenderData; mode: Mode }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const goal = mode === "goal";
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- colours ---- */
  const ground = goal ? shade(club, -0.62) : PAPER;
  const quiet = goal ? "rgba(255,255,255,.4)" : "rgba(22,23,26,.36)";
  const hotColor = goal ? "#ffffff" : club;

  /* ---- the sentence ---- */
  const kicker = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).replace(/’/g, "'").trim().toUpperCase();
  const [home = "", away = ""] = teamsOf(data);
  const fixture = home && away ? `${home} V ${away}` : home || away;
  let parts: string[];
  if (goal) {
    const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
    parts = [name, fixture];
  } else {
    const venue = (content.venue ?? "").trim() || f.venue;
    parts = [fixture, longDate(content.date), f.time, venue];
  }
  const phrase: Tok[] = [];
  for (const part of [kicker, ...parts.map((p) => p.trim()).filter(Boolean)]) {
    const words = part.toUpperCase().split(/\s+/).filter(Boolean);
    words.forEach((wd, k) => phrase.push({ text: k === words.length - 1 ? `${wd}${NB}·` : wd, hot: part === kicker }));
  }
  // The title word alone in colour; its "·" stays quiet.
  const hotWords = new Set(phrase.filter((t) => t.hot).map((t) => t.text));

  /* ---- the square ---- */
  const M = story ? 84 : 72;
  const side = Math.round((story ? (goal ? 430 : 520) : goal ? 420 : 410) * Math.min(1.15, Math.max(0.85, ts)));
  const size = story ? 18 : 14;
  const capH = INTER_CAP * size;
  const rows = Math.max(6, Math.round((side - capH) / (size * 1.72)) + 1);
  const L = (side - capH) / (rows - 1);
  const capTop = (L - INTER_CONTENT * size) / 2 + INTER_ASC * size - capH; // cap top under a line's top
  const { lines, track } = bestSquare(phrase, size, side, rows);

  /* ---- the foot: logo under the square, on its edge ---- */
  const logoAsked = 22;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsked * 2) * 1.7)) : Math.max(52, logoAsked * 2);
  const logoTop = H - logoBottom - logoH;
  const sqLeft = right ? M : CANVAS_W - M - side;
  // Post: the square floats a little above the middle; story: its foot 64px over the logo.
  const sqTop =
    (goal ? logoTop - (story ? 64 : 72) - side : story ? STORY_TOP : Math.round((CANVAS_H - side) / 2) - 36) + (params.textY ?? 0);

  /* ---- the player, big, on his side ---- */
  const faceX = right ? (story ? 760 : 805) : story ? 320 : 275;
  // Matchday story: the square opens the page and his head comes in beside its lower edge, shoulders under it.
  const faceTop = story ? (goal ? STORY_TOP + 190 : sqTop + side - 150) : goal ? 150 : 200;
  const sizes = goal
    ? story
      ? { chest: 270, waist: 216, knees: 172, full: 138 }
      : { chest: 220, waist: 176, knees: 140, full: 112 }
    : story
      ? { chest: 300, waist: 240, knees: 190, full: 150 }
      : { chest: 262, waist: 214, knees: 168, full: 132 };
  let box = placeByFace(data, faceX, faceTop, sizes);
  // The square stays clear of him: slide him away from it (cropping at the far edge) rather than letting an
  // elbow run into the type; a goal's flung fist may come back towards the middle only as far as the gap.
  const sqRight = sqLeft + side;
  const clear = 28;
  let shift = right ? Math.max(0, sqRight + clear - box.left) : Math.min(0, sqLeft - clear - (box.left + box.width));
  if (!shift) shift = right ? Math.min(0, Math.max(sqRight + clear - box.left, CANVAS_W + 10 - (box.left + box.width))) : Math.max(0, Math.min(sqLeft - clear - (box.left + box.width), -10 - box.left));
  // …but never so far that his head (with ~0.6 face-heights round it) leaves the canvas.
  const headR = box.faceH * 1.05;
  shift = Math.max(Math.max(-160, 40 + headR - faceX), Math.min(Math.min(160, CANVAS_W - 40 - headR - faceX), shift));
  box = { ...box, left: box.left + shift };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: goal
            ? `radial-gradient(70% 55% at ${right ? 68 : 32}% 46%, ${shade(club, -0.38)}, ${ground} 64%, ${shade(ground, -0.25)} 100%)`
            : `radial-gradient(70% 55% at ${right ? 70 : 30}% 50%, ${shade(PAPER, 0.4)}, ${PAPER} 62%, ${shade(PAPER, -0.05)} 100%)`,
        }}
      />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}

      {/* The square: every line the same width, the title word lit in the club colour. */}
      <div style={{ position: "absolute", left: sqLeft, top: sqTop - capTop, width: side }}>
        {lines.map((ln, r) => (
          <div
            key={r}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: side + (track * size + ln.extra),
              marginRight: -(track * size + ln.extra),
              height: L,
              lineHeight: `${L}px`,
              fontFamily: SANS,
              fontSize: size,
              fontWeight: 500,
              letterSpacing: track * size + ln.extra,
              color: quiet,
              whiteSpace: "nowrap",
            }}
          >
            {ln.toks.map((t, k) => {
              if (!t.hot || !hotWords.has(t.text)) return <span key={k}>{t.text}</span>;
              const dot = t.text.endsWith(`${NB}·`);
              const core = dot ? t.text.slice(0, -2) : t.text;
              return (
                <span key={k}>
                  <span style={{ color: hotColor, fontWeight: 700 }}>{core}</span>
                  {dot ? `${NB}·` : ""}
                </span>
              );
            })}
          </div>
        ))}
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
 * Text square: a perfect square of small tracked caps on pale paper, justified on all four sides, made by
 * repeating "MATCHDAY · SC VIANENSE SAD V LEIXÕES · 17 OCTOBER · 15:00 · ESTÁDIO DR. JOSÉ DE MATOS ·" (names
 * exactly as stored, home first) as a grey texture where every "MATCHDAY" is set bold in the club colour.
 * The player big on the other side.
 */
export function Textsquare({ data }: { data: RenderData }) {
  return <TextsquarePage data={data} mode="matchday" />;
}
