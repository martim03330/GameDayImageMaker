/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS, ringSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const PAPER = "#f2f1ee";
const INK = "#111111";
const GREY = "#8a8985";
const RULE = "rgba(17,17,17,.85)";
const GUIDE = "rgba(17,17,17,.07)";

/** Inter 500: advance widths per 100px (measured in the browser; as in swiss.tsx). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3, "·": 30 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);

/* The grid: 12 columns, 60px margins, 20px gutters (as swiss.tsx). */
const MARGIN = 60;
const GUTTER = 20;
const COL = (CANVAS_W - MARGIN * 2 - GUTTER * 11) / 12;
const colX = (i: number) => MARGIN + i * (COL + GUTTER);
const span = (n: number) => n * COL + (n - 1) * GUTTER;

/** "TEAM OF THE WEEK" → "Team of the Week", "XI OF THE WEEK" → "XI of the Week". */
function titleOf(kicker: string): string {
  const words = (kicker || "Team of the week").replace(/’/g, "'").trim().split(/\s+/);
  return words
    .map((w, i) => {
      if (i === 0 && /^[IVXL]{1,4}$/i.test(w)) return w.toUpperCase();
      const l = w.toLowerCase();
      if (i > 0 && /^(of|the|and|a)$/.test(l)) return l;
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(" ");
}

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

/**
 * The official league graphic with the player's circle ringed. The wrapper shrinks to the image, so the
 * highlight percentages land on the same spot as in the editor (as ContentBlock in shared.tsx does).
 */
function LeagueGraphic({ data, maxW, maxH, ring }: { data: RenderData; maxW: number; maxH: number; ring: string }) {
  const { insetUrl, content } = data;
  if (!insetUrl) {
    const h = Math.min(maxH, maxW / 0.69);
    return (
      <div style={{ width: h * 0.69, height: h, border: "2px dashed rgba(17,17,17,.35)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 22, color: GREY, padding: 30 }}>
        Official league graphic
      </div>
    );
  }
  const hl = content.insetHighlight;
  const bw = Math.max(4, Math.round(maxW * 0.01));
  return (
    <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom" }}>
      <img src={insetUrl} alt="" style={{ maxWidth: maxW, maxHeight: maxH, display: "block" }} />
      {hl && (
        <div
          style={{
            position: "absolute",
            left: `${hl.x}%`,
            top: `${hl.y}%`,
            width: ringSize(hl, "19%"),
            boxSizing: "border-box",
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `${bw}px solid ${ring}`,
            boxShadow: `0 0 ${bw * 6}px ${bw}px color-mix(in srgb, ${ring} 70%, transparent), inset 0 0 ${bw * 4}px color-mix(in srgb, ${ring} 45%, transparent)`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Team of the Week on the Swiss grid: an off-white sheet with faint 12-column guides, a small top row (club,
 * round) over a hairline, "Team of the Week" set big and flush-left in Inter, then two halves — the official
 * league graphic in one (his circle ringed in club colour), the player in the other bleeding off the sheet's
 * edge and cut square by the foot rule — and under that rule a quiet table of labels and values.
 */
export function Totwswiss({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  // He stands on params.side; the graphic takes the other half.
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);
  let ring = vivid(params.accent === "#ffffff" ? params.primary : params.accent);
  if (luminance(ring) < 0.12) ring = "#ffffff";

  /* ---- top row ---- */
  const TOP = story ? STORY_TOP : 62;
  const TOP_RULE = TOP + (story ? 70 : 62);
  const ours = data.club?.name ?? "";
  const sub = content.subline.trim();
  const topText = (t: string, w: number): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: Math.max(13, Math.min(18 * S, w / Math.max(1, interEm(t)))), color: INK, lineHeight: 1.2, whiteSpace: "nowrap" });

  /* ---- title: as big as the sheet allows, at most two lines ---- */
  const title = titleOf(content.kicker);
  const tracking = -0.045;
  const titleW = span(12);
  let size = (story ? 158 : 132) * ts;
  let lines = wrap(title, size, titleW, tracking);
  // Post: one line across the sheet if it fits at a good size; story: two lines, bigger.
  while ((lines.length > (story ? 2 : 1) || lines.some((l) => interEm(l, tracking) * size > titleW)) && size > 70) {
    size -= 4;
    lines = wrap(title, size, titleW, tracking);
  }
  const lead = size * 0.98;
  const titleTop = TOP_RULE + 26 * S + (params.textY ?? 0);
  const titleBottom = titleTop + lead * lines.length;
  const MID_RULE = titleBottom + 30 * S;

  /* ---- the two halves ---- */
  const FOOT_RULE = story ? STORY_BOTTOM - 88 - 64 - 150 : 1144;
  const gCols = story ? 7 : 6;
  const gx = right ? colX(0) : colX(12 - gCols);
  const gTop = MID_RULE + 34 * S;
  const gMaxW = span(gCols);
  const gMaxH = FOOT_RULE - 34 * S - gTop;

  // The player on the other half, large, bleeding off his edge.
  const faceX = right ? colX(9) + COL * 0.6 + (story ? 30 : 0) : colX(2) + COL * 0.4 - (story ? 30 : 0);
  const faceTop = MID_RULE + (story ? 150 : 115);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 360, waist: 300, knees: 250, full: 210 } : { chest: 270, waist: 225, knees: 185, full: 160 });

  /* ---- the foot table ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const cells = [
    { label: "Player", value: name },
    { label: "Club", value: ours },
    { label: "Round", value: sub },
  ].filter((c) => c.value);
  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 15 * S, letterSpacing: "0.01em", color: GREY, lineHeight: 1.2 };
  const value: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "-0.01em", color: INK, lineHeight: 1.18 };
  const cellW = span(3);
  /** One line when it fits at a readable size; otherwise lines broken at the " · " joints (or words). */
  const cellLines = (t: string): { size: number; lines: string[] } => {
    const max = 23 * S * ts;
    const one = Math.min(max, cellW / Math.max(1, interEm(t) * 1.03));
    if (one >= 18 * S * ts * 0.95) return { size: one, lines: [t] };
    const parts = t.includes("·") ? t.split(/\s*·\s*/) : t.split(/\s+/);
    const joint = t.includes("·") ? " · " : " ";
    const lines: string[] = [];
    for (const p of parts) {
      const last = lines[lines.length - 1];
      if (last && interEm(`${last}${joint}${p}`) * max * 1.03 <= cellW) lines[lines.length - 1] = `${last}${joint}${p}`;
      else lines.push(p);
    }
    const size = Math.min(max, ...lines.map((l) => cellW / Math.max(1, interEm(l) * 1.03)));
    return { size, lines: lines.slice(0, 2) };
  };

  // One size for the whole table row: the smallest any cell needs.
  const cellSize = Math.min(...cells.map((c) => cellLines(c.value).size));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 72 : 28}% 48%, rgba(255,255,255,.55), transparent 70%)` }} />

      {/* Faint column guides between the rules. */}
      {Array.from({ length: 13 }, (_, i) => (i === 12 ? CANVAS_W - MARGIN : colX(i))).map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: MID_RULE, height: FOOT_RULE - MID_RULE, width: 1, background: GUIDE }} />
      ))}

      {/* The player, cut square by the foot rule. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: 0, top: MID_RULE + 1, width: CANVAS_W, height: FOOT_RULE - MID_RULE - 1, overflow: "hidden" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top - MID_RULE - 1, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* The graphic, top-aligned in its half. */}
      <div style={{ position: "absolute", left: gx, top: gTop, width: gMaxW, display: "flex", justifyContent: right ? "flex-start" : "flex-end", lineHeight: 0 }}>
        <div style={{ boxShadow: "0 1px 2px rgba(0,0,0,.12), 0 18px 40px -16px rgba(0,0,0,.35)" }}>
          <LeagueGraphic data={data} maxW={gMaxW} maxH={gMaxH} ring={ring} />
        </div>
      </div>

      {/* Top row and hairline. */}
      <div style={{ position: "absolute", left: colX(0), top: TOP, width: span(5) }}>
        <div style={topText(ours, span(5))}>{ours}</div>
      </div>
      {sub && (
        <div style={{ position: "absolute", left: colX(6), top: TOP, width: span(6), display: "flex", alignItems: "center", gap: 12 * S }}>
          <span style={{ width: 13 * S, height: 13 * S, background: club, display: "inline-block", flexShrink: 0 }} />
          <div style={{ ...topText(sub, span(6) - 26 * S), color: GREY }}>{sub}</div>
        </div>
      )}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: TOP_RULE, height: 1.5, background: RULE }} />

      {/* Title, flush-left. */}
      <div style={{ position: "absolute", left: colX(0), top: titleTop, width: titleW, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: `${lead}px`, letterSpacing: `${tracking}em`, color: INK, whiteSpace: "nowrap" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginLeft: -size * 0.05 }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: MID_RULE, height: 1, background: "rgba(17,17,17,.35)" }} />

      {/* Foot rule and the table. */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: FOOT_RULE, height: 1.5, background: RULE }} />
      <div style={{ position: "absolute", left: colX(0), top: FOOT_RULE + 24 * S, display: "grid", gridTemplateColumns: `repeat(${cells.length}, ${cellW}px)`, columnGap: GUTTER }}>
        {cells.map((c, i) => (
          <div key={i}>
            <div style={label}>{c.label}</div>
            {(() => {
              const v = cellLines(c.value);
              return (
                <div style={{ ...value, marginTop: 8 * S, fontSize: cellSize, whiteSpace: "nowrap" }}>
                  {v.lines.map((l, j) => (
                    <div key={j}>{l}</div>
                  ))}
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", right: MARGIN, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
    </div>
  );
}
