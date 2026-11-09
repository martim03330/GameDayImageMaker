/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { PRINT_GRAIN } from "./column";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { actionBox, bebasEm, bigName, dateParts, orderedCrests } from "./roughname";
import { AgencyLogo, BEBAS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const BLACK = "#0c0c0d";
const BG = "#e3e4e7";
/** Bebas Neue cap height relative to the size. */
const CAP = 0.7;
/** Letters are never squeezed below this share of their natural width, nor stretched past it. */
const MIN_SQUEEZE = 0.42;

type Slot = { w: number; node: (x: number, top: number, h: number) => ReactNode };
type Row = { text: string; before?: Slot; after?: Slot; afterFirst?: Slot };

/** Kicker as giant rows ("MATCHDAY" → MATCH / DAY), the longer part first. */
function rowsOf(kicker: string): string[] {
  let k = kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").trim();
  k = k.replace(/\b(MATCH|GAME)\s*DAY\b/, "$1 DAY").replace(/\bFULLTIME\b/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(bebasEm(words.slice(0, i).join(" ")) - bebasEm(words.slice(i).join(" ")));
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Text set vertically (reading top to bottom), as the small labels slotted between the giant letters. */
function VText({ text, x, y, len, size, color = BLACK, tracking = 0.18, weight }: { text: string; x: number; y: number; len: number; size: number; color?: string; tracking?: number; weight?: number }) {
  const natural = bebasEm(text, tracking) * size;
  const s = natural > len ? (size * len) / natural : size;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, transform: "rotate(90deg)", transformOrigin: "0 0", fontFamily: BEBAS, fontSize: s, lineHeight: 1, letterSpacing: `${tracking}em`, color, whiteSpace: "nowrap", fontWeight: weight }}>
        <div style={{ transform: `translateY(-50%)`, marginTop: 0 }}>{text}</div>
      </div>
    </div>
  );
}

/**
 * Santos "MATCH DAY" (Soteldo): a light grey poster in black and white; the kicker set in gigantic,
 * ultra-condensed black capitals filling the canvas in two rows, with small texts slotted into the gaps
 * between the letters: the ground running down beside the first letter, the date stacked at the end of
 * the first row, both crests in black and white at the head of the second and the kick-off stacked
 * vertically at its end. The whole-body player stands small at the foot, in black and white, on a soft
 * grey floor shadow.
 */
export function Condensed({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 61;
  const r = rng(seed);
  const facts = matchFacts(data);
  const score = scoreOf(data);
  const d = dateParts(data);
  const left = params.side === "left";

  const M = 70; // side margin
  const TOP = 46;
  const BOTTOM = 1296;
  const ROWGAP = 34;
  const GAP = 16; // between letters
  const W = CANVAS_W - M * 2;

  // ---- slot contents ----
  const vSlot = (text: string, size = 30): Slot | undefined =>
    text ? { w: size * 1.05 + 10, node: (x, top, h) => <VText key={`v-${text}`} text={text} x={x + (size * 1.05 + 10) / 2} y={top} len={h} size={size} /> } : undefined;

  const stack = (parts: { t: string; big: boolean }[], big: number, small: number, w: number): Slot => ({
    w,
    node: (x, top, h) => (
      <div key={`s-${parts.map((p) => p.t).join("")}`} style={{ position: "absolute", left: x, top, width: w, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 6 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ fontFamily: BEBAS, fontSize: p.big ? big : small, lineHeight: 0.92, color: BLACK, letterSpacing: p.big ? "0.01em" : "0.14em", whiteSpace: "nowrap", ...(p.big ? {} : { border: `2px solid ${BLACK}`, padding: "3px 4px 1px 6px" }) }}>
            {p.t}
          </div>
        ))}
      </div>
    ),
  });

  const crests = orderedCrests(data);
  const crestSlot: Slot | undefined = crests.length
    ? {
        w: 104,
        node: (x, top, h) => (
          <div key="crests" style={{ position: "absolute", left: x, top: top + h * 0.1, width: 104, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 96, height: 96, objectFit: "contain", filter: "grayscale(1) contrast(1.15)" }} />
            ))}
            {crests.length === 1 && facts.opp && postType === "matchday" && <div style={{ position: "relative", width: 40, height: 300 }}><VText text={`VS ${facts.opp}`} x={20} y={0} len={300} size={28} /></div>}
          </div>
        ),
      }
    : undefined;

  const dateSlot = d ? stack([{ t: d.dd, big: true }, { t: d.dow, big: false }, { t: d.mm, big: true }], 50, 20, 70) : undefined;
  const timeParts = (content.time ?? "").match(/^(\d{1,2})[:hH.](\d{2})/);
  const pair = (a: string, b: string, sep = "·"): Slot => stack([{ t: a, big: true }, { t: sep, big: true }, { t: b, big: true }], 96, 20, 104);
  const timeSlot = timeParts ? pair(timeParts[1].padStart(2, "0"), timeParts[2]) : undefined;
  const scoreSlot = score ? pair(score.split("-")[0], score.split("-")[1], "–") : undefined;

  // ---- rows by post type ----
  let rows: Row[];
  if (postType === "result") {
    rows = [
      { text: "FULL", afterFirst: vSlot(content.kicker.toUpperCase()), after: dateSlot },
      { text: "TIME", before: crestSlot, after: scoreSlot },
    ];
  } else if (postType === "goal") {
    const name = bigName(content.firstName, content.lastName);
    const k = rowsOf(content.kicker);
    const texts = k.length === 1 && name ? [k[0], name] : k.length ? k : ["GOAL"];
    rows = [
      { text: texts[0], afterFirst: vSlot(facts.opp ? `VS ${facts.opp}` : facts.comp), after: dateSlot },
      ...(texts[1] ? [{ text: texts[1], before: crestSlot, after: scoreSlot }] : []),
    ];
  } else {
    const k = rowsOf(content.kicker || "MATCHDAY");
    rows = [
      { text: k[0], afterFirst: vSlot(facts.venue || facts.comp), after: dateSlot },
      ...(k[1] ? [{ text: k[1], before: crestSlot, after: timeSlot }] : []),
    ];
    if (!k[1]) rows[0] = { ...rows[0], before: crestSlot };
  }

  // ---- row heights: equal squeeze across rows, the bottom row taller ----
  const letters = (t: string) => [...t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")].filter((c) => c !== " ");
  const slotW = (row: Row) => (row.before ? row.before.w + GAP * 1.5 : 0) + (row.after ? row.after.w + GAP * 1.5 : 0) + (row.afterFirst ? row.afterFirst.w + GAP : 0);
  const avail = (row: Row) => W - slotW(row) - GAP * (letters(row.text).length - 1) - (row.text.includes(" ") ? 40 : 0);
  const emOf = (row: Row) => letters(row.text).reduce((a, c) => a + bebasEm(c), 0);
  const totalH = BOTTOM - TOP - ROWGAP * (rows.length - 1);
  // Height at which a row's letters sit at a common squeeze: h ∝ avail / em.
  const k = rows.map((row) => avail(row) / Math.max(0.3, emOf(row)));
  let hs = k.map((v) => (totalH * v) / k.reduce((a, b) => a + b, 0));
  if (rows.length === 2) {
    // Keep the reference's rhythm: a shorter top row, a much taller bottom row.
    hs[0] = Math.min(Math.max(hs[0], totalH * 0.26), totalH * 0.4);
    hs[1] = totalH - hs[0];
  } else hs = [Math.min(totalH, 760)];
  // A long row can't be squeezed past MIN_SQUEEZE: it gets lower, and the other row takes the height back.
  const hMax = rows.map((row) => (avail(row) * CAP) / (Math.max(0.3, emOf(row)) * MIN_SQUEEZE));
  for (let pass = 0; pass < 2; pass++) {
    rows.forEach((_, i) => {
      if (hs[i] > hMax[i]) {
        const spare = hs[i] - hMax[i];
        hs[i] = hMax[i];
        const j = 1 - i;
        if (rows.length === 2) hs[j] = Math.min(hMax[j], hs[j] + spare, j === 0 ? totalH * 0.48 : totalH);
      }
    });
  }
  const blockH = hs.reduce((a, b) => a + b, 0) + ROWGAP * (rows.length - 1);

  // ---- lay out the letters ----
  type Glyph = { c: string; x: number; w: number; top: number; h: number };
  const glyphs: Glyph[] = [];
  const slotNodes: ReactNode[] = [];
  let y = TOP + Math.max(0, (BOTTOM - TOP - blockH) * (rows.length === 1 ? 0.5 : 0.35));
  rows.forEach((row, ri) => {
    const h = hs[ri];
    const size = h / CAP;
    const ls = letters(row.text);
    // Natural widths at this size, squeezed to fill the row (never wider than natural, never below MIN_SQUEEZE).
    const nat = ls.map((c) => bebasEm(c) * size);
    const sum = nat.reduce((a, b) => a + b, 0);
    const squeeze = Math.max(MIN_SQUEEZE, Math.min(1, avail(row) / sum));
    const ws = nat.map((n) => n * squeeze);
    const used = ws.reduce((a, b) => a + b, 0) + slotW(row) + GAP * (ls.length - 1) + (row.text.includes(" ") ? 40 : 0);
    let x = M + Math.max(0, (W - used) / 2);
    if (row.before) {
      slotNodes.push(row.before.node(x, y, h));
      x += row.before.w + GAP * 1.5;
    }
    let li = 0;
    for (const ch of [...row.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")]) {
      if (ch === " ") {
        x += 40 - GAP;
        continue;
      }
      glyphs.push({ c: ch, x, w: ws[li], top: y, h });
      x += ws[li] + GAP;
      if (li === 0 && row.afterFirst) {
        slotNodes.push(row.afterFirst.node(x - GAP / 2, y, h));
        x += row.afterFirst.w + GAP;
      }
      li++;
    }
    if (row.after) slotNodes.push(row.after.node(x - GAP + GAP * 1.5, y, h));
    y += h + ROWGAP;
  });

  // ---- the player: whole body, small, at the foot ----
  const fig = actionBox(data, { cx: (left ? 470 : 610) + (r() - 0.5) * 50, headTop: 640 + r() * 40, floor: 1286, maxW: 600, maxFace: 110 });
  const shadowW = Math.min(620, fig.width * 1.1);
  const fcx = fig.left + fig.width / 2;

  const agencyStyle: CSSProperties = { position: "absolute", right: M, bottom: 30, display: "flex", alignItems: "center", gap: 10 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: BG }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 38%, #f1f2f4 0%, transparent 75%)" }} />

      {/* The giant condensed letters. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        {glyphs.map((g, i) => (
          <text key={i} x={g.x} y={g.top + g.h} textLength={g.w} lengthAdjust="spacingAndGlyphs" fill={BLACK} style={{ fontFamily: BEBAS, fontSize: g.h / CAP }}>
            {g.c}
          </text>
        ))}
      </svg>
      {slotNodes}

      {/* Floor: a soft grey pool under the player. */}
      <div style={{ position: "absolute", left: fcx - shadowW * 0.9, width: shadowW * 1.8, top: 1060, height: 420, background: "radial-gradient(closest-side, rgba(40,40,44,.34), rgba(40,40,44,.12) 55%, transparent)", filter: "blur(10px)" }} />
      {fig.feet && <div style={{ position: "absolute", left: fcx - shadowW / 2, width: shadowW, top: fig.top + fig.height - 30, height: 60, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,.14) 60%, transparent)", filter: "blur(5px)" }} />}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, filter: "drop-shadow(0 16px 20px rgba(0,0,0,.3))" }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", filter: "grayscale(1) contrast(1.18) brightness(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={agencyStyle}>
        <AgencyLogo data={data} height={30} onLight style={{ color: BLACK, filter: "grayscale(1)" }} />
      </div>

      <div data-bleed style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.12, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
