/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { longDate } from "./superscript";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* The crossing: shared by `crossword` (matchday) and `goalcrossword` (goal).                         */
/* ------------------------------------------------------------------------------------------------ */

const base = (c: string) => c.normalize("NFD").replace(/\p{M}/gu, "");
/** A word break in an entry: an empty, shaded square, like the black squares of a real crossword. */
export const BLOCK = "#";
/**
 * "Leixões" → L E I X Õ E S; "SC Vianense SAD" → S C ▪ V I A N E N S E ▪ S A D: upper case, accents kept, every
 * break between words (space, ".", "/", "-") a shaded square, so the name still reads exactly as stored.
 */
export const lettersOf = (s: string, max = 24) => {
  const words = (s ?? "").normalize("NFC").toUpperCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const out: string[] = [];
  for (const w of words) {
    const next = [...(out.length ? [BLOCK] : []), ...w];
    if (out.length && out.length + next.length > max) break;
    out.push(...next);
  }
  return out;
};

/**
 * Where `down` crosses `across`: the shared letter that keeps the across word highest (smallest row in
 * the down word), then the across column furthest from the player. null when they share no letter.
 */
export function crossAt(across: string[], down: string[], preferLate: boolean): { i: number; j: number } | null {
  let best: { i: number; j: number; s: number } | null = null;
  down.forEach((d, j) =>
    across.forEach((a, i) => {
      if (a === BLOCK || base(a) !== base(d)) return;
      const s = j * 100 + (preferLate ? across.length - i : i);
      if (!best || s < best.s) best = { i, j, s };
    }),
  );
  return best ? { i: (best as { i: number }).i, j: (best as { j: number }).j } : null;
}

export type Grid = {
  /** columns × rows of the whole figure */
  cols: number;
  rows: number;
  cells: { col: number; row: number; ch: string; num?: number; shared?: boolean }[];
  /** "down": the second word crosses; "below": no shared letter, set as 2 ACROSS under the first */
  mode: "down" | "below";
};

/** The figure for `across` (1 ACROSS) and `down` (2 DOWN). */
export function gridOf(across: string[], down: string[], preferLate: boolean): Grid {
  const at = down.length ? crossAt(across, down, preferLate) : null;
  if (!at) {
    const cells = [
      ...across.map((ch, c) => ({ col: c, row: 0, ch, num: c === 0 ? 1 : undefined })),
      ...down.map((ch, c) => ({ col: c, row: 1, ch, num: c === 0 ? 2 : undefined })),
    ];
    return { cols: Math.max(across.length, down.length), rows: down.length ? 2 : 1, cells, mode: "below" };
  }
  const cells: Grid["cells"] = across.map((ch, c) => ({ col: c, row: at.j, ch, num: c === 0 ? 1 : undefined, shared: c === at.i }));
  down.forEach((ch, r) => {
    if (r === at.j) return;
    cells.push({ col: at.i, row: r, ch, num: r === 0 ? 2 : undefined });
  });
  // A down word starting on the crossing square: its "2" shares the corner with nothing else unless the
  // square also starts the across word, where real puzzles keep the single "1".
  if (at.j === 0 && at.i !== 0) cells.find((c) => c.row === 0 && c.col === at.i)!.num = 2;
  return { cols: across.length, rows: down.length, cells, mode: "down" };
}

/** The squares: hairline rules only, letters set light, the shared square filled with the club colour. */
export function CrossGrid({
  grid,
  left,
  top,
  cell,
  line,
  lineW,
  ink,
  fill,
  onFill,
  numInk,
  weight = 400,
  cellBg = "transparent",
  block = "rgba(0,0,0,.12)",
}: {
  grid: Grid;
  left: number;
  top: number;
  cell: number;
  line: string;
  lineW: number;
  ink: string;
  fill: string;
  onFill: string;
  numInk: string;
  weight?: number;
  /** the ground inside the squares: the grid sits in front of the player, his arm passes behind it */
  cellBg?: string;
  /** the fill of a word-break square */
  block?: string;
}) {
  const numSize = Math.max(11, cell * 0.17);
  return (
    <div style={{ position: "absolute", left, top, width: grid.cols * cell + lineW, height: grid.rows * cell + lineW }}>
      {grid.cells.map((c, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: c.col * cell,
            top: c.row * cell,
            width: cell + lineW,
            height: cell + lineW,
            boxSizing: "border-box",
            border: `${lineW}px solid ${line}`,
            background: c.shared ? fill : c.ch === BLOCK ? block : cellBg,
          }}
        >
          {c.num && (
            <span style={{ position: "absolute", left: cell * 0.07, top: cell * 0.055, fontFamily: SANS, fontWeight: 500, fontSize: numSize, lineHeight: 1, color: c.shared ? onFill : numInk }}>
              {c.num}
            </span>
          )}
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: cell * 0.53 + lineW / 2,
              transform: "translateY(-50%)",
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: weight,
              fontSize: cell * 0.5,
              lineHeight: 1,
              color: c.shared ? onFill : ink,
            }}
          >
            {c.ch === BLOCK ? "" : c.ch}
          </span>
        </div>
      ))}
    </div>
  );
}

/** "1 ACROSS — Matchday · 2 DOWN — Leixões": the numbers and directions set in small spaced capitals. */
export function ClueLine({ clues, size, ink, soft, accent }: { clues: [string, string, string][]; size: number; ink: string; soft: string; accent: string }) {
  return (
    <div style={{ fontFamily: SANS, fontSize: size, lineHeight: 1.3, whiteSpace: "nowrap", color: ink }}>
      {clues.map(([n, dir, word], k) => (
        <span key={k}>
          {k > 0 && <span style={{ color: soft, margin: `0 ${size * 0.55}px` }}>·</span>}
          <span style={{ fontWeight: 600, color: accent, fontSize: size * 0.82 }}>{n}</span>
          <span style={{ fontWeight: 600, fontSize: size * 0.72, letterSpacing: "0.16em", marginLeft: size * 0.32 }}>{dir}</span>
          <span style={{ color: soft, margin: `0 ${size * 0.4}px` }}>—</span>
          <span style={{ fontWeight: 400 }}>{word}</span>
        </span>
      ))}
    </div>
  );
}
/** Rough width of a clue line in px (Inter, mixed weights), for fitting it on one line. */
export const clueW = (clues: [string, string, string][], size: number) =>
  clues.reduce((a, [n, dir, word], k) => a + (k ? 1.4 : 0) + n.length * 0.52 + dir.length * 0.72 * 0.78 + 0.32 + 1.85 + word.length * 0.56, 0) * size;


/**
 * The player placed by his face, his whole head (hair ~0.65 face-height above the face box, ~0.6 to each
 * side, chin ~1.05 below its top) kept clear of the across row: moved just above it or just below it,
 * whichever is the smaller move and keeps the head inside the canvas.
 */
export function clearOfRow(
  data: RenderData,
  faceX: number,
  faceTop: number,
  sizes: Record<string, number>,
  row: { l: number; r: number; top: number; bottom: number },
  gap: number,
) {
  const box = placeByFace(data, faceX, faceTop, sizes);
  const fh = box.faceH;
  if (faceX + fh * 0.6 < row.l - 30 || faceX - fh * 0.6 > row.r + 30) return box;
  if (faceTop - fh * 0.65 >= row.bottom + gap || faceTop + fh * 1.05 + gap <= row.top) return box;
  const below = placeByFace(data, faceX, row.bottom + gap + fh * 0.65, sizes);
  // Above: moving up can grow the face (the photo still reaches the bottom), so settle it in a few steps.
  let t = row.top - gap - fh * 1.05;
  let above = placeByFace(data, faceX, t, sizes);
  for (let k = 0; k < 4; k++) {
    const over = t + above.faceH * 1.05 + gap - row.top;
    if (over <= 0) break;
    t -= over;
    above = placeByFace(data, faceX, t, sizes);
  }
  const headTop = t - above.faceH * 0.65;
  const fits = headTop >= 60 && t + above.faceH * 1.05 + gap <= row.top + 1;
  return fits && faceTop - t < row.bottom + gap + fh * 0.65 - faceTop ? above : below;
}

/* ------------------------------------------------------------------------------------------------ */

const PAPER = "#f1efea";
const INK = "#16171a";
const GREY = "rgba(22,23,26,.56)";
const LINE = "#bdb9b1";

/**
 * Crossword: one typographic idea. "MATCHDAY" written across a few hairline squares, the opponent's name
 * (letters only, exactly as spelt) running down through the letter they share — that one square filled with
 * the club colour, small clue numbers "1" and "2" in the corners, nothing else on the grid. Light rules only,
 * no tiles, no frames. Under it on the free side, a tiny clue line ("1 ACROSS — Matchday · 2 DOWN — Leixões")
 * then the fixture (home first, names as stored), date · kick-off and ground. The player big on the other side,
 * natural colour, on a pale paper ground. When the opponent shares no letter with the word, our club's name
 * (letters only) crosses it, then the ground's first word.
 */
export function Crossword({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const right = params.side !== "left";
  const club = clubTone(data);
  const f = matchFacts(data);
  const M = story ? 70 : 64;

  /* ---- the words ---- */
  const teams = teamsOf(data);
  const ours = data.club?.name ?? "";
  const lc = (s: string) => s.toLowerCase().trim();
  const oppName = teams.find((t) => lc(t) !== lc(ours)) ?? teams[1] ?? "";
  const oursName = teams.find((t) => lc(t) === lc(ours)) ?? ours;
  const venue = (content.venue ?? "").trim() || titleCase(f.venue || "");
  const kicker = (content.kicker || "Matchday").replace(/[.!]+$/, "");
  const across = lettersOf(kicker);
  const candidates = [oppName, oursName, venue.split(/\s+/)[0] ?? ""].filter(Boolean);
  let downName = candidates[0] ?? "";
  for (const c of candidates) {
    if (crossAt(across, lettersOf(c), !right)) {
      downName = c;
      break;
    }
  }
  const grid = gridOf(across, lettersOf(downName, 24), !right);

  /* ---- the foot (measured up from the bottom line) ---- */
  const fixture = teams.join(" v ");
  const when = [longDate(content.date), f.time].filter(Boolean).join(" · ");
  const clues: [string, string, string][] = [["1", "ACROSS", sentenceCase(kicker)]];
  if (downName) clues.push(["2", grid.mode === "down" ? "DOWN" : "ACROSS", downName]);
  const footW = story ? 640 : 600;
  const clueSize = Math.max(12, Math.min(17 * q * ts, footW / Math.max(1, clueW(clues, 1))));
  const infoSize = Math.max(14, Math.min(22 * q * ts, (footW * 0.98) / Math.max(1, fixture.length * 0.56, (when.length + 3 + venue.length) * 0.52)));
  const twoLines = (when.length + 3 + venue.length) * 0.52 * infoSize > footW;
  const infoLines = (fixture ? 1 : 0) + (when || venue ? (twoLines && when && venue ? 2 : 1) : 0);
  const logoScale = params.logoScale ?? 1;
  const footBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const footH = clueSize * 1.3 + 22 * q + infoLines * infoSize * 1.42;
  const footTop = H - footBottom - footH + ty;

  /* ---- the grid, as big as the free side and the height allow ---- */
  const gridTop = (story ? STORY_TOP : M) + ty;
  const freeW = story ? 620 : 600;
  const room = footTop - (story ? 90 : 70) - gridTop;
  const cell = Math.floor(Math.min((story ? 150 : 128) * ts, freeW / grid.cols, room / grid.rows));
  const lineW = story ? 2 : 1.5;
  const gridW = grid.cols * cell;
  const gridLeft = right ? M : CANVAS_W - M - gridW;
  const gridBottom = gridTop + grid.rows * cell;
  // The crossing row: the player's head stays clear of it when it runs towards him.
  const crossRow = grid.cells.find((c) => c.shared)?.row ?? 0;
  const rowBottom = gridTop + (crossRow + 1) * cell;

  /* ---- the player, big, on his side ---- */
  const faceX = right ? (story ? 742 : 748) : story ? 338 : 332;
  const faceTop = story ? Math.max(STORY_TOP + 250, Math.min(rowBottom + 140, 620)) : Math.max(250, Math.min(rowBottom + 110, 420));
  const sizes = story ? { chest: 340, waist: 280, knees: 222, full: 170 } : { chest: 262, waist: 214, knees: 168, full: 128 };
  const box = clearOfRow(data, faceX, faceTop, sizes, { l: gridLeft, r: gridLeft + gridW, top: rowBottom - cell, bottom: rowBottom }, story ? 56 : 44);
  const fadeEnd = Math.max(footTop - 20, gridBottom) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 320 : 240)}px, transparent ${fadeEnd}px)`;

  const side: CSSProperties = right ? { left: M, textAlign: "left" } : { right: M, textAlign: "right" };
  const info: CSSProperties = { fontFamily: SANS, fontSize: infoSize, lineHeight: 1.42, letterSpacing: "-0.005em", whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 52% at ${right ? 70 : 30}% 50%, ${shade(PAPER, 0.45)}, ${PAPER} 64%, ${shade(PAPER, -0.04)} 100%)` }} />

      {/* The player, natural colour, a soft shade behind his shoulders. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: box.top + box.height * 0.3, width: box.width * 0.64, height: box.height * 0.5, borderRadius: "50%", background: "rgba(60,50,40,.09)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      <CrossGrid grid={grid} left={gridLeft} top={gridTop} cell={cell} line={LINE} lineW={lineW} ink={INK} fill={club} onFill="#ffffff" numInk={GREY} weight={400} cellBg="rgba(241,239,234,.94)" block="#d8d4cb" />

      {/* The clues, then the fixture. */}
      <div style={{ position: "absolute", top: footTop, ...side, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        <ClueLine clues={clues} size={clueSize} ink={INK} soft={GREY} accent={club} />
        <div style={{ height: 22 * q }} />
        {fixture && <div style={{ ...info, fontWeight: 600, color: INK }}>{fixture}</div>}
        {(when || venue) &&
          (twoLines && when && venue ? (
            <>
              <div style={{ ...info, fontWeight: 400, color: GREY }}>{when}</div>
              <div style={{ ...info, fontWeight: 400, color: GREY }}>{venue}</div>
            </>
          ) : (
            <div style={{ ...info, fontWeight: 400, color: GREY }}>{[when, venue].filter(Boolean).join(" · ")}</div>
          ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", ...(right ? { right: M } : { left: M }), bottom: footBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.08} />
    </div>
  );
}
