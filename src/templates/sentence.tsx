/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#eeece7";
const INK = "#141518";
const GREY = "#8b8a86";
const NB = " ";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = {
  a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8,
  n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9,
  A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3,
  N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1,
  " ": 26.7, [NB]: 26.7, "'": 31.3, "-": 46.3, ".": 27, ",": 27, ":": 27, "–": 50, "·": 27, "&": 70,
};
const interEm = (t: string, tracking = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? (/\d/.test(c) ? 63 : 62)) / 100 + tracking, 0);

/** A run of the sentence; `key` runs are drawn in the club colour. */
type Run = { text: string; key?: boolean; keep?: boolean };
/** One unbreakable unit of a line (a word, or a whole club name / date). */
type Unit = { text: string; key?: boolean };

/** Runs → units: plain text breaks at spaces; key runs and dates never break. */
function unitsOf(runs: Run[]): Unit[] {
  const out: Unit[] = [];
  for (const r of runs) {
    if (r.key || r.keep) out.push({ text: r.text.replace(/ +/g, NB), key: r.key });
    else if (r.text.trim() === "") continue;
    else for (const w of r.text.split(/ +/).filter(Boolean)) out.push({ text: w });
  }
  // Short abbreviations ("Dr.", "St.") travel with the next word.
  for (let i = out.length - 2; i >= 0; i--) if (/^\p{Lu}\p{Ll}?\.$/u.test(out[i].text) && !out[i].key) out.splice(i, 2, { ...out[i + 1], text: out[i].text + NB + out[i + 1].text });
  // Glue punctuation-only units to the previous one.
  return out.reduce<Unit[]>((a, u) => {
    if (/^[.,]$/.test(u.text) && a.length) a[a.length - 1] = { ...a[a.length - 1], text: a[a.length - 1].text + u.text, key: a[a.length - 1].key };
    else a.push(u);
    return a;
  }, []);
}

const lineText = (l: Unit[]) => l.map((u) => u.text).join(" ");

/** Greedy lines at `size` within `width`. */
function wrap(units: Unit[], size: number, width: number, tracking: number): Unit[][] {
  const lines: Unit[][] = [];
  for (const u of units) {
    const last = lines[lines.length - 1];
    if (last && interEm(lineText([...last, u]), tracking) * size <= width) last.push(u);
    else lines.push([u]);
  }
  return lines;
}

/** The biggest size (≤ max) whose lines fit `width` in ≤ maxLines, then re-wrapped to a balanced rag. */
function setSentence(units: Unit[], max: number, width: number, maxLines: number, tracking: number) {
  let size = max;
  let lines = wrap(units, size, width, tracking);
  const over = (ls: Unit[][], s: number) => ls.length > maxLines || ls.some((l) => interEm(lineText(l), tracking) * s > width);
  while (over(lines, size) && size > 34) {
    size -= 2;
    lines = wrap(units, size, width, tracking);
  }
  // Balance: the narrowest measure that keeps the same number of lines.
  const n = lines.length;
  let lo = width * 0.5;
  let hi = width;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const t = wrap(units, size, mid, tracking);
    if (t.length <= n && !t.some((l) => interEm(lineText(l), tracking) * size > mid)) hi = mid;
    else lo = mid;
  }
  lines = wrap(units, size, Math.min(width, hi + 1), tracking);
  return { size, lines };
}

/** "MATCHDAY" → "Matchday". */
const sentenceCase = (k: string) => {
  const s = k.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Sentence: the whole fixture written as one plain English sentence — "SC Vianense SAD host Leixões on
 * 17 October at 15:00, Estádio Dr. José de Matos." — set large in Inter 500, sentence case, tight leading,
 * flush left at the foot of a warm paper sheet, our club's name in the club colour. Above it the player,
 * big, in natural colour, melting into the paper before the type. A small "Matchday" kicker with the
 * competition at the top, the two crests opposite, the NEYOD mark under the sentence.
 */
export function Sentence({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const M = story ? 72 : 64;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.42) club = vivid(params.accent);
  if (luminance(club) > 0.42) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  /* ---- the fixture, home team first, names exactly as stored ---- */
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const oursName = (weHost ? content.homeTeam : content.awayTeam) || ours;
  const oppName = (weHost ? content.awayTeam : content.homeTeam) || titleCase(f.opp);
  const home = weHost ? oursName : oppName;
  const away = weHost ? oppName : oursName;
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  const date = niceDate(content.date);
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const runs: Run[] = [];
  if (home && away) runs.push({ text: home, key: home === oursName }, { text: "host" }, { text: away, key: away === oursName });
  else runs.push({ text: oursName || "Matchday", key: true }, { text: "play" });
  if (date) runs.push({ text: "on" }, { text: date, keep: true });
  if (f.time) runs.push({ text: "at" }, { text: f.time });
  if (venue) runs.push({ text: "," }, { text: venue });
  runs.push({ text: "." });
  const units = unitsOf(runs);

  const tracking = -0.03;
  const measure = CANVAS_W - 2 * M;
  const { size, lines } = setSentence(units, (story ? 96 : 70) * ts, measure, story ? 5 : 4, tracking);
  const lead = size * 1.07;

  /* ---- the foot: logo at the bottom, the sentence standing ~64px above it ---- */
  const logoH = story ? Math.max(88, Math.round(52 * 1.7)) : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const sentBottom = H - logoBottom - logoH * (params.logoScale ?? 1) - (story ? 78 : 60) + ty;
  const sentTop = sentBottom - lead * lines.length + size * 0.07;

  /* ---- the top row ---- */
  const kicker = sentenceCase(content.kicker || "Matchday");
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(", ");
  const topY = (story ? STORY_TOP : 60) + ty;
  const kSize = (story ? 32 : 24) * ts;
  const crestSize = story ? 64 : 46;
  const compRoom = measure - (crests.length ? crests.length * (crestSize + 16) + 24 : 0) - interEm(kicker) * kSize - kSize;
  const compSize = Math.max(13, Math.min(kSize, compRoom / Math.max(1, interEm(comp))));

  /* ---- the player: big, a little right of centre, melting away before the sentence ---- */
  const sideX = params.side === "left" ? -1 : 1;
  const faceX = 540 + sideX * (story ? 70 : 90);
  const faceTop = story ? topY + 210 : topY + 120;
  const sizes = story ? { chest: 340, waist: 270, knees: 220, full: 176 } : { chest: 230, waist: 180, knees: 146, full: 122 };
  // The whole head (hair included, ~0.75 face-height above the face box) clears the top row.
  const rowBottom = topY + Math.max(kSize, crests.length ? crestSize * 0.75 : 0);
  const first = placeByFace(data, faceX, faceTop, sizes);
  const box = placeByFace(data, faceX, Math.max(faceTop, rowBottom + (story ? 56 : 40) + first.faceH * 0.78), sizes);
  const fadeTo = sentTop - 36 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 300 : 230)}px, transparent ${fadeTo}px)`;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;

  const keyColor = (u: Unit): CSSProperties => (u.key ? { color: club } : {});

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* The faintest light behind him, so the paper is not dead flat. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 40% at ${faceX / 10.8}% ${(chin / H) * 100}%, rgba(255,255,255,.75), transparent 72%)` }} />

      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.2, top: chin, width: box.faceH * 4.4, height: box.faceH * 4, borderRadius: "50%", background: "rgba(40,34,28,.10)", filter: `blur(${story ? 70 : 54}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top row: kicker + competition, crests opposite. */}
      <div style={{ position: "absolute", left: M, top: topY, display: "flex", alignItems: "baseline", gap: kSize * 0.7, whiteSpace: "nowrap", fontFamily: SANS, lineHeight: 1 }}>
        <span style={{ fontWeight: 600, fontSize: kSize, letterSpacing: "-0.01em" }}>{kicker}</span>
        {comp && <span style={{ fontWeight: 500, fontSize: compSize, color: GREY, letterSpacing: "-0.005em" }}>{comp}</span>}
      </div>
      {crests.length > 0 && (
        <div style={{ position: "absolute", right: M, top: topY + kSize * 0.5 - crestSize / 2, display: "flex", gap: 16 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* The sentence. */}
      <div
        style={{
          position: "absolute",
          left: M,
          top: sentTop,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: size,
          lineHeight: `${lead}px`,
          letterSpacing: `${tracking}em`,
          color: INK,
        }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            {l.map((u, j) => (
              <span key={j}>
                {j > 0 ? " " : ""}
                <span style={keyColor(u)}>{u.text}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", left: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
