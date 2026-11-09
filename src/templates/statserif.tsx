/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { clubInk, PRINT_GRAIN } from "./column";
import { DMSERIF } from "./fx";
import { opponentOf, rng } from "./kit";
import { scoreOf } from "./outline";
import { cleanCompetition } from "./sepia";
import { AgencyLogo, factRows, SERIF } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#eceded";
const INK = "#16181b";
const M = 64;

/**
 * Gradient map with four stops, so the kit can stay vivid while the skin above it is knocked back to a
 * cool grey (the three-stop map in fx.tsx has to choose one or the other).
 */
function DuoDefs({ id, stops }: { id: string; stops: string[] }) {
  const rgb = stops.map((h) => [1, 3, 5].map((i) => parseInt(h.replace("#", "#").slice(i, i + 2), 16) / 255));
  const table = (i: number) => rgb.map((c) => c[i].toFixed(3)).join(" ");
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table(0)} />
          <feFuncG type="table" tableValues={table(1)} />
          <feFuncB type="table" tableValues={table(2)} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

/** The player as a grey ghost blurred along x only: one streak of a motion trail. */
function SmearDefs({ id, sd }: { id: string; sd: string }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB" x="-100%" y="-10%" width="300%" height="120%">
        <feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.216 0.420 0.678" />
          <feFuncG type="table" tableValues="0.224 0.431 0.686" />
          <feFuncB type="table" tableValues="0.239 0.451 0.702" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation={sd} />
      </filter>
    </svg>
  );
}

/** Blend two hex colours (0 = a, 1 = b). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** DM Serif Display: average advance of its capitals, relative to the font size. */
const CAPS_ADV = 0.63;
/** …and of a mixed-case word ("Levski Sofia") or a run of figures. */
const advOf = (t: string) => (/[a-zà-ÿ]/.test(t) ? 0.47 : /^[\d\s:.–-]+$/.test(t) ? 0.54 : CAPS_ADV);
/** Fraunces: average advance of mixed-case text, relative to the font size. */
const TEXT_ADV = 0.52;

/** Hair sits ~0.62 face heights above the detected face box. */
const HAIR = 0.62;
/** How far below the top of the face each framing cuts the player, in face heights. */
const DEPTH: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
/** Where the player's lowest visible point lands, per framing (the type block starts at ~1120). */
const FLOOR: Record<string, number> = { full: 1016, knees: 1048, waist: 1066, chest: 1080 };

/** "ACADÉMICA" → "Académica"; a name that already has lower case is left alone. */
const nice = (s: string) =>
  !s || /[a-zà-ÿ]/.test(s) ? s : s.toLowerCase().replace(/(^|[\s'’\-./])([a-zà-ÿ])/g, (_, p, c: string) => p + c.toUpperCase());

type Row = { label: string; value: string };

/** The four lines of the table: the fixture for a matchday, the numbers for everything else. */
function rowsOf(data: RenderData): Row[] {
  const c = data.content;
  const f = matchFacts(data);
  const opp = nice(opponentOf(data) || f.opp);
  const stats: Row[] = c.stats
    .filter((s) => s.label && String(s.value ?? "").trim() !== "")
    .map((s) => ({ label: s.label, value: String(s.value).trim() }));
  const clean = (r: (Row | null)[]) => r.filter((x): x is Row => !!x && !!x.value && !!x.label).slice(0, 4);

  switch (data.postType) {
    case "matchday": {
      const round = f.roundNo
        ? { label: "Matchday", value: f.roundNo }
        : f.round
          ? { label: "Round", value: nice(f.round) }
          : f.comp
            ? { label: "Competition", value: nice(f.comp) }
            : null;
      return clean([
        { label: "Opponent", value: opp },
        { label: "Kick-off", value: (c.time ?? "").trim() },
        { label: "Venue", value: nice((c.venue ?? "").trim()) },
        round,
      ]);
    }
    case "result":
      return clean([
        { label: "Full time", value: scoreOf(data, "-") },
        { label: "Opponent", value: opp },
        ...stats.slice(0, 2),
      ]);
    case "goal":
      return clean(stats.length >= 2 ? stats : [...stats, { label: "Opponent", value: opp }, { label: "Score", value: scoreOf(data, "-") }]);
    default:
      return clean(stats.length ? stats : factRows(data).map((s) => ({ label: s.label, value: nice(String(s.value)) })));
  }
}

/** Longest word of a string, in characters. */
const longestWord = (s: string) => Math.max(1, ...s.split(/\s+/).map((w) => w.length));

/** How many lines a value really takes inside `w` at `size` (greedy word wrap, as the browser does it). */
function wrapLines(v: string, size: number, w: number): number {
  const adv = advOf(v) * size;
  let lines = 1;
  let x = 0;
  for (const word of v.split(/\s+/).filter(Boolean)) {
    const ww = word.length * adv;
    if (x === 0) x = ww;
    else if (x + adv + ww <= w) x += adv + ww;
    else {
      lines++;
      x = ww;
    }
  }
  return lines;
}

/** The biggest size at which a value still fits `w` on at most two lines. */
function valueSize(v: string, w: number, max: number): { size: number; lines: number } {
  const adv = advOf(v);
  const one = w / Math.max(1, v.length * adv);
  if (one >= max) return { size: max, lines: 1 };
  if (!/\s/.test(v)) return { size: Math.max(22, one), lines: 1 };
  for (let size = max; size > 22; size -= 1) {
    if (wrapLines(v, size, w) <= 2 && longestWord(v) * adv * size <= w) return { size, lines: wrapLines(v, size, w) };
  }
  return { size: 22, lines: wrapLines(v, 22, w) };
}

/**
 * Editorial stat sheet (Estêvão / Chelsea): the player duotoned in the club colours on a very light studio
 * grey, dragged sideways by a motion smear, a solid club-colour panel behind his hips, and — down at the
 * foot — his name in a big high-contrast serif against a quiet right-aligned table of labels and numbers
 * (the fixture on a matchday). Nothing shouts; the numbers do the talking.
 */
export function Statserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 41);
  // One hue for the duotone, the panel and the bar: clubInk on its own can fall back to the accent and
  // leave a green kit sitting under a blue panel.
  const raw = params.primary === "#10131c" ? params.accent : params.primary;
  let ink = vivid(raw);
  if (luminance(ink) > 0.55) ink = shade(ink, -0.36);
  if (luminance(ink) > 0.55) ink = clubInk(data);
  // A black club would map the whole kit to one flat silhouette: lift it to charcoal so the duotone still
  // has mid-tones to work with.
  if (luminance(ink) < 0.075) ink = shade(ink, 0.34);
  const deep = shade(ink, -0.5);
  const dir = params.side === "left" ? -1 : 1;
  const uid = `ss${(params.seed ?? 41) % 997}`;

  /* ---------- the player, standing, placed by his face ---------- */
  const face = data.face ?? [0.4, 0.07, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * HAIR);
  const framing = params.framing ?? "full";
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  const crop = framing === "full" ? 1 : Math.min(1, face[1] + face[3] * DEPTH[framing]);
  const floor = FLOOR[framing] ?? FLOOR.full;
  const headTop = 198;
  // A photo cut above the feet can't stand on the floor line: give it a set face size and let its lower
  // edge dissolve instead of blowing the player up to fill the whole column.
  let h = framing === "full" && cutBottom ? 176 / face[3] : (floor - headTop) / Math.max(0.15, crop - hair);
  // Never blow the face past the photo's own pixels (the export is 2×).
  // A whole-body photo lands on the floor line with a small head, as in the reference; a photo cut at the
  // hips would blow the face up instead, so the face is capped and its lower edge dissolves.
  const capFor = framing === "full" ? 190 : 250;
  const cap = Math.min(capFor, data.facePx > 0 ? data.facePx * 1.9 : capFor);
  if (h * face[3] > cap) h = cap / face[3];
  h *= params.playerScale ?? 1;
  const top = headTop - hair * h + (params.playerY ?? 0);
  const w = h * aspect;
  const cx = 540 + Math.round((r() - 0.5) * 26);
  const left = cx - (face[0] + face[2] / 2) * w + (params.playerX ?? 0);
  const box: CSSProperties = { position: "absolute", left, top, width: w, height: h, maxWidth: "none" };

  // The photo runs past the floor line (a tighter framing, or a photo cut at the shins): dissolve it there
  // so it never reaches the name, and soften the cut edge.
  const bottomAt = Math.min(floor, top + h);
  const stop = (bottomAt - top) / h;
  const fade = cutBottom ? 0.13 : 0.075;
  const maskImage =
    top + h > floor + 6 || cutBottom
      ? `linear-gradient(to bottom, #000 ${((stop - fade) * 100).toFixed(1)}%, transparent ${(stop * 100).toFixed(1)}%)`
      : undefined;
  const mask: CSSProperties = maskImage ? { WebkitMaskImage: maskImage, maskImage } : {};

  /* ---------- the club-colour panel behind his hips and shins ---------- */
  const panelW = 338 + Math.round(r() * 34);
  const panelX = cx - panelW / 2 + Math.round((r() - 0.5) * 40);
  const span = floor - headTop;
  const panelTop = headTop + span * 0.46;
  const panelBottom = headTop + span * 0.85;

  /* ---------- the horizontal motion smear ---------- */
  // Copies of the player dragged sideways and blurred only along x (feGaussianBlur "60 3"), so the trail
  // reads as one long streak of speed instead of a stack of ghosts.
  const smear: { dx: number; f: number; op: number; sx: number }[] = [
    { dx: -0.15, f: 1, op: 0.26, sx: 1.25 },
    { dx: 0.92, f: 2, op: 0.18, sx: 3.1 },
    { dx: 0.62, f: 2, op: 0.28, sx: 2.2 },
    { dx: 0.4, f: 1, op: 0.42, sx: 1.7 },
    { dx: 0.22, f: 1, op: 0.62, sx: 1.35 },
    { dx: 0.1, f: 0, op: 0.8, sx: 1.14 },
  ].map((s) => ({ ...s, dx: dir * s.dx * w }));
  const figureImg = (style: CSSProperties, filter: string) =>
    data.photoUrl ? <img src={data.photoUrl} alt="" style={{ ...box, left: 0, top: 0, filter, ...mask, ...style }} /> : null;

  /* ---------- type ---------- */
  const rows = rowsOf(data);

  // Table: labels in a fixed column, values right-aligned against the margin, packed tight as in print.
  // The value column only takes the room its longest value really needs, so the name keeps the rest.
  const longestValue = Math.max(1, ...rows.map((x) => x.value.length * (advOf(x.value) / CAPS_ADV)));
  const labelW = 158;
  const valueW = longestValue <= 5 ? 162 : longestValue <= 11 ? 226 : 250;
  const tableW = labelW + 22 + valueW;
  let labelSize = Math.min(27, labelW / (Math.max(...rows.map((x) => longestWord(x.label)), 1) * TEXT_ADV));
  const measured = rows.map((x) => valueSize(x.value, valueW, 62));
  // Two tiers only: the short values (times, scores, counts) big, every wordy one at one shared smaller
  // size — four different sizes in four rows would read as an accident.
  const wordy = rows.map((x, i) => (x.value.length > 5 ? measured[i].size : Infinity));
  const shared = Math.min(...wordy);
  let vSize = measured.map((m, i) => (wordy[i] === Infinity ? m.size : shared));
  const vLines = (i: number) => wrapLines(rows[i].value, vSize[i], valueW);
  // Numbers are set tight, as in print; a value that runs onto a second line needs its own leading back.
  const vLead = (i: number) => (vLines(i) > 1 ? 0.92 : 0.74);
  const rowH = (i: number) =>
    Math.max(vSize[i] * (vLines(i) > 1 ? vLead(i) * vLines(i) + 0.1 : 0.78), labelSize * 1.08 * (rows[i].label.length > 13 ? 2 : 1));
  let total = rows.reduce((s, _, i) => s + rowH(i), 0) + Math.max(0, rows.length - 1) * 12;
  if (total > 244) {
    const k = 244 / total;
    vSize = vSize.map((s) => s * k);
    labelSize *= k;
    total = 244;
  }

  const name = [content.firstName, content.lastName].filter(Boolean).map((s) => s.toUpperCase());
  const nameMax = Math.max(1, ...name.map((l) => l.length));
  const nameSize = Math.min(118, (CANVAS_W - M * 2 - tableW - 44) / (nameMax * CAPS_ADV)) * (params.textScale ?? 1);

  const crests = data.postType === "matchday" || data.postType === "result"
    ? ([content.homeCrest ?? data.club?.crestUrl, content.awayCrest].filter(Boolean) as string[])
    : ([data.club?.crestUrl].filter(Boolean) as string[]);
  const kicker = (content.kicker || "").toUpperCase();
  const sub = cleanCompetition(matchFacts(data).comp || content.subline.split("·")[0]?.trim() || "").toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* Duotone: the kit in the club colour, the skin knocked back to a cool grey, highlights pure white. */}
      <DuoDefs id={`${uid}duo`} stops={[shade(deep, -0.2), ink, mix(ink, "#c3c8ce", 0.72), "#ffffff"]} />
      {[
        [16, 1.4],
        [46, 2.6],
        [92, 4.2],
      ].map(([x, y], i) => (
        <SmearDefs key={i} id={`${uid}smear${i}`} sd={`${x} ${y}`} />
      ))}
      {/* Studio sweep: a touch brighter behind the player than at the corners. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(78% 58% at 50% 34%, #f4f4f5 0%, #eceded 55%, #e3e4e6 100%)" }} />

      {/* Motion smear: grey copies dragged sideways, each blurred along x only. */}
      {smear.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: box.left, top: box.top, width: w, height: h, opacity: s.op, transform: `translateX(${s.dx}px) scaleX(${s.sx})`, transformOrigin: "50% 50%" }}>
          {figureImg({ position: "absolute" }, `url(#${uid}smear${s.f})`)}
        </div>
      ))}

      {/* The club-colour panel behind his hips. */}
      <div
        style={{
          position: "absolute",
          left: panelX,
          top: panelTop,
          width: panelW,
          height: panelBottom - panelTop,
          background: `linear-gradient(170deg, ${shade(ink, 0.06)}, ${shade(ink, -0.12)})`,
        }}
      />
      {/* One smear copy crosses the panel, as in the reference. */}
      <div style={{ position: "absolute", left: box.left, top: box.top, width: w, height: h, opacity: 0.2, transform: `translateX(${dir * w * 0.13}px) scaleX(1.18)`, transformOrigin: "50% 50%", mixBlendMode: "screen" }}>
        {figureImg({ position: "absolute" }, `url(#${uid}smear1)`)}
      </div>

      {/* The player, duotoned in the club colours; the shadow sits on the wrapper, never on the masked image. */}
      <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 16px 34px rgba(22,28,38,.17))" }}>
        {figureImg({ ...box }, `url(#${uid}duo) contrast(1.04)`)}
      </div>

      {/* Top left: the two-tone progress bar, then the post in small spaced caps. */}
      <div style={{ position: "absolute", left: M, top: 76, display: "flex", height: 8 }}>
        <div style={{ width: 74, background: deep }} />
        <div style={{ width: 52, background: shade(ink, 0.5) }} />
        <div style={{ width: 44, background: shade(ink, 0.84) }} />
      </div>
      {kicker && (
        <div style={{ position: "absolute", left: M, top: 106, fontFamily: SERIF, fontWeight: 600, fontSize: Math.min(19, 330 / (kicker.length * 0.72)), letterSpacing: "0.3em", color: INK, whiteSpace: "nowrap" }}>
          {kicker}
        </div>
      )}
      {sub && (
        <div style={{ position: "absolute", left: M, top: 138, fontFamily: SERIF, fontWeight: 500, fontSize: Math.min(17, 330 / (sub.length * 0.62)), letterSpacing: "0.2em", color: "#83858a", whiteSpace: "nowrap" }}>
          {sub}
        </div>
      )}

      {/* Top right: the crest(s) as a mono mark, the agency logo underneath. */}
      <div style={{ position: "absolute", right: M, top: 68, display: "flex", alignItems: "center", gap: 18 }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 74, height: 74, objectFit: "contain", filter: "grayscale(1) contrast(1.08) brightness(.92)" }} />
        ))}
      </div>
      <AgencyLogo data={data} height={26} onLight style={{ position: "absolute", right: M, top: 158 }} />

      {/* Bottom left: the name, two lines of high-contrast serif. */}
      <div style={{ position: "absolute", left: M, bottom: 76, fontFamily: DMSERIF, fontSize: nameSize, lineHeight: 0.98, letterSpacing: "-0.005em", whiteSpace: "nowrap" }}>
        {name.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* Bottom right: the table. */}
      <div style={{ position: "absolute", right: M, bottom: 78, width: labelW + valueW + 22, display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", gap: 22, height: rowH(i) }}>
            <div style={{ width: labelW, textAlign: "right", fontFamily: SERIF, fontWeight: 500, fontSize: labelSize, lineHeight: 1.02, letterSpacing: "0.05em", paddingBottom: vSize[i] * (vLines(i) > 1 ? 0.06 : 0.1) }}>{row.label}</div>
            <div style={{ width: valueW, textAlign: "right", fontFamily: DMSERIF, fontSize: vSize[i], lineHeight: vLead(i), letterSpacing: "-0.01em" }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* Print grain, very light. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, backgroundSize: "240px 240px", opacity: 0.16, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
