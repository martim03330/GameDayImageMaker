/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { clearOfRow, ClueLine, clueW, crossAt, CrossGrid, gridOf, lettersOf } from "./crossword";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const NIGHT = "#111214";
const WHITE = "#f4f4f2";
const SOFT = "rgba(244,244,242,.55)";
const LINE = "#6d7075";

/**
 * Goal crossword: the matchday `crossword` turned to the goal, on a dark ground with white hairlines.
 * "GOAL" (the kicker: BRACE, HAT-TRICK…) written across a few squares, his surname running down through
 * the letter they share — that square filled with the club colour, "1" and "2" small in the corners. When
 * the surname shares no letter his first name crosses instead; failing that, the surname sits under the word
 * as 2 ACROSS. At the foot, a tiny clue line ("1 ACROSS — Goal · 2 DOWN — Conceição") and the fixture, home
 * first, names as stored, never the score. The celebrating player big on the other side, natural colour.
 */
export function Goalcrossword({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const right = params.side !== "left";
  let club = clubTone(data);
  // On the night ground a deep club colour would sink: lift it until the square reads.
  for (let k = 0; k < 4 && luminance(club) < 0.1; k++) club = shade(club, 0.18);
  const M = story ? 70 : 64;

  /* ---- the words ---- */
  const kicker = (content.kicker || "Goal").replace(/[.!]+$/, "");
  const across = lettersOf(kicker);
  const last = (content.lastName ?? "").trim();
  const first = (content.firstName ?? "").trim();
  let downName = last || first;
  if (last && !crossAt(across, lettersOf(last), !right) && first && crossAt(across, lettersOf(first), !right)) downName = first;
  const grid = gridOf(across, lettersOf(downName, 18), !right);

  /* ---- the foot ---- */
  const fixture = teamsOf(data).join(" v ");
  const clues: [string, string, string][] = [["1", "ACROSS", sentenceCase(kicker)]];
  if (downName) clues.push(["2", grid.mode === "down" ? "DOWN" : "ACROSS", downName]);
  const footW = story ? 640 : 600;
  const clueSize = Math.max(12, Math.min(18 * q * ts, footW / Math.max(1, clueW(clues, 1))));
  const fixSize = Math.max(14, Math.min(22 * q * ts, (footW * 0.98) / Math.max(1, fixture.length * 0.57)));
  const logoScale = params.logoScale ?? 1;
  const footBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const footH = clueSize * 1.3 + (fixture ? 20 * q + fixSize * 1.3 : 0);
  const footTop = H - footBottom - footH + ty;

  /* ---- the grid ---- */
  const gridTop = (story ? STORY_TOP : M) + ty;
  const freeW = story ? 620 : 600;
  const room = footTop - (story ? 100 : 76) - gridTop;
  const cell = Math.floor(Math.min((story ? 156 : 132) * ts, freeW / grid.cols, room / grid.rows));
  const lineW = story ? 2 : 1.5;
  const gridW = grid.cols * cell;
  const gridLeft = right ? M : CANVAS_W - M - gridW;
  const gridBottom = gridTop + grid.rows * cell;
  const crossRow = grid.mode === "down" ? (grid.cells.find((c) => c.shared)?.row ?? 0) : grid.rows - 1;
  const rowBottom = gridTop + (crossRow + 1) * cell;

  /* ---- the player, celebrating, big on his side ---- */
  const faceX = right ? (story ? 742 : 750) : story ? 338 : 330;
  const faceTop = story ? Math.max(STORY_TOP + 230, Math.min(rowBottom + 120, 560)) : Math.max(220, Math.min(rowBottom + 90, 380));
  const sizes = story ? { chest: 320, waist: 266, knees: 212, full: 166 } : { chest: 250, waist: 206, knees: 162, full: 124 };
  const box = clearOfRow(data, faceX, faceTop, sizes, { l: gridLeft, r: gridLeft + gridW, top: grid.mode === "down" ? rowBottom - cell : gridTop, bottom: rowBottom }, story ? 56 : 44);
  const fadeEnd = Math.max(footTop - 30, gridBottom) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 260)}px, transparent ${fadeEnd}px)`;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;

  const side: CSSProperties = right ? { left: M, textAlign: "left" } : { right: M, textAlign: "right" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: NIGHT, color: WHITE }}>
      {/* The night: a faint lift of light behind him, the corners a touch deeper. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(58% 46% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(NIGHT, 0.09)}, ${NIGHT} 70%, ${shade(NIGHT, -0.35)} 100%)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      <CrossGrid grid={grid} left={gridLeft} top={gridTop} cell={cell} line={LINE} lineW={lineW} ink={WHITE} fill={club} onFill="#ffffff" numInk={SOFT} weight={300} cellBg="rgba(17,18,20,.93)" block="#2b2d31" />

      <div style={{ position: "absolute", top: footTop, ...side, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        <ClueLine clues={clues} size={clueSize} ink={WHITE} soft={SOFT} accent={shade(club, 0.25)} />
        {fixture && (
          <div style={{ marginTop: 20 * q, fontFamily: SANS, fontWeight: 500, fontSize: fixSize, lineHeight: 1.3, letterSpacing: "-0.005em", whiteSpace: "nowrap", color: SOFT }}>{fixture}</div>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", ...(right ? { right: M } : { left: M }), bottom: footBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
