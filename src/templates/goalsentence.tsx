/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
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
type Run = { text: string; key?: boolean; keep?: boolean; dim?: boolean };
/** One unbreakable unit of a line (a word, or a whole club name / date). */
type Unit = { text: string; key?: boolean; dim?: boolean };

/** Runs → units: plain text breaks at spaces; key runs and dates never break. */
function unitsOf(runs: Run[]): Unit[] {
  const out: Unit[] = [];
  for (const r of runs) {
    if (r.key || r.keep) out.push({ text: r.text.replace(/ +/g, NB), key: r.key, dim: r.dim });
    else if (r.text.trim() === "") continue;
    else for (const w of r.text.split(/ +/).filter(Boolean)) out.push({ text: w, dim: r.dim });
  }
  // Short abbreviations ("Dr.", "St.") travel with the next word.
  for (let i = out.length - 2; i >= 0; i--) if (/^\p{Lu}\p{Ll}?\.$/u.test(out[i].text) && !out[i].key) out.splice(i, 2, { ...out[i + 1], text: out[i].text + NB + out[i + 1].text });
  // Glue punctuation-only units to the previous one.
  return out.reduce<Unit[]>((a, u) => {
    if (/^[.,]$/.test(u.text) && a.length) a[a.length - 1] = { ...a[a.length - 1], text: a[a.length - 1].text + u.text };
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
 * Goal sentence: the goal told as one plain English sentence — "Moisés Conceição scores for SC Vianense SAD
 * against Leixões." — set large in Inter 500 at the top of a deep, club-toned dark ground, the connecting
 * words dimmed so the names carry it, our club in the club colour. Below, the celebrating player rises big
 * from the foot in natural colour, a soft club glow behind him. A small "Goal" kicker over the sentence,
 * the NEYOD mark centred at the foot. Never a score.
 */
export function Goalsentence({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const M = story ? 72 : 64;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) < 0.03) club = vivid(params.accent);
  // On the dark ground the club word must read: lift dark club colours, keep bright ones.
  const keyCol = luminance(club) < 0.12 ? shade(club, 0.45) : luminance(club) > 0.75 ? shade(club, -0.15) : club;
  const ground = shade(luminance(club) > 0.45 ? vivid(params.accent) : club, -0.84);

  /* ---- the sentence ---- */
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? content.homeTeam : content.awayTeam) || ours).trim();
  const oppName = ((weHost ? content.awayTeam : content.homeTeam) || titleCase(f.opp)).trim();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim() || "He";
  const kick = (content.kicker || "Goal").toUpperCase().replace(/[^A-Z]/g, "");
  const verb = kick === "BRACE" ? "scores twice for" : kick === "HATTRICK" ? "scores a hat-trick for" : "scores for";
  const runs: Run[] = [{ text: name, keep: true }, { text: verb, dim: true }];
  if (oursName) runs.push({ text: oursName, key: true });
  if (oppName && lc(oppName) !== lc(oursName)) runs.push({ text: "against", dim: true }, { text: oppName, keep: true });
  runs.push({ text: "." });
  const units = unitsOf(runs);

  const tracking = -0.03;
  const measure = CANVAS_W - 2 * M;
  const { size, lines } = setSentence(units, (story ? 100 : 74) * ts, measure, story ? 4 : 3, tracking);
  const lead = size * 1.07;

  /* ---- the top: kicker, then the sentence ---- */
  const kicker = sentenceCase(content.kicker || "Goal");
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(", ");
  const topY = (story ? STORY_TOP : 60) + ty;
  const kSize = (story ? 32 : 24) * ts;
  const compSize = Math.max(13, Math.min(kSize, (measure - interEm(kicker) * kSize - kSize) / Math.max(1, interEm(comp))));
  const sentTop = topY + kSize + (story ? 44 : 34);
  const sentBottom = sentTop + lead * lines.length;

  /* ---- the player: big, rising from the foot, head clear of the sentence ---- */
  const sideX = params.side === "left" ? -1 : params.side === "right" ? 1 : 0;
  const faceX = 540 + sideX * 50;
  const sizes = story ? { chest: 330, waist: 262, knees: 210, full: 168 } : { chest: 236, waist: 186, knees: 150, full: 122 };
  const first = placeByFace(data, faceX, sentBottom + 120, sizes);
  let box = placeByFace(data, faceX, sentBottom + (story ? 60 : 40) + first.faceH * 0.8, sizes);
  // Arms flung out to one side: centre the figure a little rather than the face.
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceCy = box.top + (face[1] + face[3] / 2) * box.height;

  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* One soft club glow behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${box.faceH * 5}px ${box.faceH * 5.5}px at ${faceCx}px ${faceCy + box.faceH * 1.6}px, ${shade(club, -0.4)}99, transparent 72%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${ground} 0, ${ground}00 ${((sentBottom + 40) / H) * 100}%)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }}
        />
      )}
      {/* The foot settles into the ground so the mark sits calmly. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 620 : 380, background: `linear-gradient(to bottom, ${ground}00, ${ground}e6)` }} />

      {/* Kicker + competition. */}
      <div style={{ position: "absolute", left: M, top: topY, display: "flex", alignItems: "baseline", gap: kSize * 0.7, whiteSpace: "nowrap", fontFamily: SANS, lineHeight: 1 }}>
        <span style={{ fontWeight: 600, fontSize: kSize, letterSpacing: "-0.01em", color: keyCol }}>{kicker}</span>
        {comp && <span style={{ fontWeight: 500, fontSize: compSize, color: "rgba(255,255,255,.5)" }}>{comp}</span>}
      </div>

      {/* The sentence. */}
      <div style={{ position: "absolute", left: M, top: sentTop, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: `${lead}px`, letterSpacing: `${tracking}em`, color: WHITE, textShadow: "0 2px 24px rgba(0,0,0,.25)" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            {l.map((u, j) => (
              <span key={j}>
                {j > 0 ? " " : ""}
                <span style={u.key ? { color: keyCol } : u.dim ? { color: "rgba(255,255,255,.52)" } : {}}>{u.text}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
