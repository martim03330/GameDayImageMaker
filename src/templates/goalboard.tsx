/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 500: advance widths per 100px (measured in the browser). */
const W500: Record<string, number> = { "0": 64.5, "1": 41.5, "2": 61.6, "3": 62.7, "4": 65.6, "5": 60.3, "6": 63, "7": 58.9, "8": 62.9, "9": 63, a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, ".": 30.3, ":": 30.3, "-": 46.3, "–": 50, "'": 31.3, "·": 30.3, "/": 37 };
const TRACK = -0.025;
const em = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (W500[c] ?? 60) / 100 + TRACK, -TRACK);

/** One line, or the most even two-line split of the words when that sets it notably larger. */
function layoutRow(text: string, colW: number, target: number, keep = 0.8): { lines: string[]; size: number } {
  const one = colW / Math.max(0.5, em(text));
  if (one >= target * keep) return { lines: [text], size: Math.min(target, one) };
  const w = text.split(/\s+/);
  let best = { lines: [text], size: one };
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(" ");
    const b = w.slice(i).join(" ");
    const s = colW / Math.max(0.5, em(a), em(b));
    if (s > best.size) best = { lines: [a, b], size: s };
  }
  return { lines: best.lines, size: Math.min(target, best.size) };
}

/**
 * Goalboard: the goal version of Timetable — a departures board on the free side. A stack of large
 * Inter medium lines, one size, alternating full and 40% ink, each with a tiny spaced label: the event
 * (GOAL / BRACE …), the scorer's full name, the opponent, the full competition. No score. The
 * celebrating player on the other side in natural colour, on a deep club tone or an off-white ground (by seed).
 */
export function Goalboard({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 11);
  const right = params.side !== "left";
  const light = r() < 0.5;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.22 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const deep = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.5);
  const ground = light ? "#efede8" : deep;
  const ink = light ? "#121214" : "#ffffff";
  const dim = light ? "rgba(18,18,20,.4)" : "rgba(255,255,255,.4)";
  const hair = light ? "rgba(18,18,20,.16)" : "rgba(255,255,255,.18)";

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  // The opponent exactly as stored (e.g. "SC Vianense SAD"); only the case may change.
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = (typed ?? titleCase(f.opp)).trim();
  const comp = titleCase(f.comp || f.round || "").trim();
  const title = titleCase((content.kicker || "GOAL").toUpperCase().replace(/’/g, "'"));
  const scorer = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();

  const rowsIn = [
    { label: "Event", text: title } as { label: string; text: string; keep?: number },
    { label: "Scorer", text: scorer },
    { label: "Opp", text: opp ? `v ${opp}` : "", keep: 0.6 },
    { label: "Comp", text: comp },
  ].filter((x) => x.text);

  /* ---- the stack: one size for all; long lines split in two or shrink on their own ---- */
  const M = 64;
  const labelW = 112 * (story ? 1.06 : 1);
  const colW = 430 * (story ? 1.05 : 1);
  const base = 76 * ts * k;
  const laid = rowsIn.map((x) => ({ ...x, ...layoutRow(x.text, colW, base, x.keep ?? 0.8) }));
  const common = Math.max(56 * ts * k, Math.min(base, ...laid.map((x) => x.size)));
  const pad = common * (story ? 0.4 : 0.22);
  const lead = 1.04;
  const rows = laid.map((x) => {
    const size = Math.min(common, x.size);
    return { ...x, size, h: pad * 2 + common * 0.727 + (x.lines.length - 1) * size * lead };
  });
  const stackH = rows.reduce((a, x) => a + x.h, 0);
  const logoH = story ? 88 : 52;
  const stackTop = story
    ? Math.max(STORY_TOP + 260, STORY_BOTTOM - logoH - 52 - stackH + (params.textY ?? 0))
    : Math.max(150, Math.min(CANVAS_H - 56 - logoH - 70 - stackH, (CANVAS_H - stackH) / 2 + 20 + (params.textY ?? 0)));
  const blockX = right ? M : CANVAS_W - M - labelW - colW;
  const textX = blockX + labelW;
  const boardEdge = right ? blockX + labelW + colW : blockX;

  /* ---- the celebrating player, on the other side ---- */
  const cx = right ? 800 + r() * 20 : 280 - r() * 20;
  let box = story
    ? placeByFace(data, right ? cx + 20 : cx - 20, STORY_TOP + 170, { chest: 300, waist: 236, knees: 186, full: 150 })
    : placeByFace(data, cx, 230, { chest: 230, waist: 180, knees: 140, full: 112 });
  // The whole head (face box + ~0.6 face-height of hair/ears each side) must stay ≥ 40px inside the canvas.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const head = (bx: typeof box) => {
    const m = face[3] * bx.height * 0.6;
    return { lo: bx.left + face[0] * bx.width - m, hi: bx.left + (face[0] + face[2]) * bx.width + m };
  };
  // Arms flung wide: nudge the figure off the board (a little), never past the face.
  const overlap = right ? boardEdge + 10 - box.left : box.left + box.width - (boardEdge - 10);
  if (overlap > 0) {
    const faceR = box.left + (face[0] + face[2]) * box.width;
    const faceL = box.left + face[0] * box.width;
    const room = right ? CANVAS_W - 40 - faceR : faceL - 40;
    const nudge = Math.max(0, Math.min(overlap, 110, room));
    box = { ...box, left: box.left + (right ? nudge : -nudge) };
  }
  // Head too close to the outer edge: shrink the figure about the point where the board's edge meets the
  // floor. Everything beside the board stays on its side of that line (the board stays clear) while the
  // head draws in from the canvas edge.
  {
    const { lo, hi } = head(box);
    const edge = right ? boardEdge + 10 : boardEdge - 10;
    let s = 1;
    if (right && hi > CANVAS_W - 40) s = (CANVAS_W - 40 - edge) / Math.max(1, hi - edge);
    if (!right && lo < 40) s = (edge - 40) / Math.max(1, edge - lo);
    s = Math.max(0.66, Math.min(1, s));
    if (s < 1) {
      const bottom = box.top + box.height;
      box = { ...box, left: edge + (box.left - edge) * s, top: bottom - box.height * s, width: box.width * s, height: box.height * s, faceH: box.faceH * s };
    }
    const h2 = head(box);
    const shift = h2.hi > CANVAS_W - 40 ? CANVAS_W - 40 - h2.hi : h2.lo < 40 ? 40 - h2.lo : 0;
    if (shift) box = { ...box, left: box.left + shift };
  }

  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const crestFilter = light || params.crestColor ? "none" : "url(#goalboard-mono)";
  const tiny: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: story ? 17 : 13, letterSpacing: "0.28em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, color: dim };
  const freeSide: CSSProperties = right ? { left: M } : { right: M };

  let y = stackTop;
  const placed = rows.map((x) => {
    const top = y;
    y += x.h;
    return { ...x, top };
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="goalboard-mono" ink={0.55} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light
            ? `radial-gradient(60% 50% at ${right ? 72 : 28}% 46%, #f7f6f2, ${ground} 70%, #e6e3dc 100%)`
            : `radial-gradient(60% 50% at ${right ? 72 : 28}% 42%, ${shade(deep, 0.1)}, ${deep} 65%, ${shade(deep, -0.3)} 100%)`,
        }}
      />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}

      {crests.length > 0 && (
        <div style={{ position: "absolute", top: story ? STORY_TOP : M, ...freeSide, display: "flex", gap: story ? 22 : 18, alignItems: "center", flexDirection: right ? "row" : "row-reverse" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 60 : 40, height: story ? 60 : 40, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}

      {/* The board. */}
      {placed.map((row, i) => {
        const cap = common * 0.727;
        const first = row.top + pad + cap;
        return (
          <div key={i}>
            <div style={{ position: "absolute", top: row.top, left: blockX, width: labelW + colW, height: 1, background: hair }} />
            <div style={{ position: "absolute", left: blockX, top: first - cap - 1, ...tiny }}>{row.label}</div>
            {row.lines.map((line, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: textX,
                  top: first + j * row.size * lead - row.size * 0.97,
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: row.size,
                  lineHeight: 1,
                  letterSpacing: `${TRACK}em`,
                  whiteSpace: "nowrap",
                  color: i % 2 ? dim : ink,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: stackTop + stackH, left: blockX, width: labelW + colW, height: 1, background: hair }} />

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight={light}
        style={{ position: "absolute", ...freeSide, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
