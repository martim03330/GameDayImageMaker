/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { capsW, I500 } from "./bleedword";
import { placeFree } from "./fadeword";
import { cutMask, Film } from "./fx";
import { teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const INK = "#15171c";
const GROUND = "#f1eee9";

/**
 * One run of small Inter caps spanning exactly `width` from `x` (baseline `y`): the font size is fitted to the
 * width at `track` em, then SVG's textLength closes the last few pixels so both ends sit on the margins.
 */
export function OneLineText({ x, y, width, text, track, maxSize, weight = 500, fill, shadow }: { x: number; y: number; width: number; text: string; track: number; maxSize: number; weight?: number; fill: string; shadow?: string }) {
  const size = Math.min(maxSize, width / Math.max(1, capsW(text, I500, track)));
  return (
    <svg data-bleed width={CANVAS_W} height={y + size} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
      <text
        x={x}
        y={y}
        textLength={width}
        lengthAdjust="spacing"
        fontFamily={SANS}
        fontWeight={weight}
        fontSize={size}
        fill={fill}
        style={shadow ? { filter: shadow } : undefined}
      >
        {text}
      </text>
    </svg>
  );
}

/** The size OneLineText will draw `text` at. */
export const oneLineSize = (text: string, width: number, track: number, maxSize: number) => Math.min(maxSize, width / Math.max(1, capsW(text, I500, track)));

/**
 * Oneline: everything in ONE line. Title, fixture (home first, names as stored), date, kick-off and ground set
 * as a single run of small spaced Inter caps straight across the whole width, edge margin to edge margin, on
 * a pale ground — behind the player, whose head stands over the ground's name so those letters vanish while
 * the fixture, date and kick-off read whole on the free side. The player sharp, natural colour, off to the
 * right and melting away; the logo bottom-left on the line's margin. Nothing else.
 */
export function Oneline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const M = 56;
  const f = matchFacts(data);

  /* ---- the line ---- */
  const kicker = (content.kicker || "MATCHDAY").replace(/’/g, "'").trim();
  const when = niceDate(content.date);
  const line = [kicker, teamsOf(data).join(" v "), when, f.time, f.venue]
    .filter(Boolean)
    .map((t) => t.toUpperCase())
    .join("  —  ");
  const track = story ? 0.08 : 0.13;
  const span = CANVAS_W - 2 * M;
  const size = oneLineSize(line, span, track, (story ? 30 : 24) * ts);
  // A short line would end before the margins at its largest: keep it centred instead.
  const lineW = Math.min(span, capsW(line, I500, track) * size);

  /* ---- the logo, bottom left on the line's margin ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 52;
  const logoTop = H - logoBottom - logoH;

  /* ---- the player, his neck over the ground's name ---- */
  // Where the last segment (the ground) runs: his throat goes there, so the letters he hides are the least
  // needed ones and the fixture, date and kick-off read whole on the free side.
  const segs = line.split("  —  ");
  const lastStart = (CANVAS_W - lineW) / 2 + (segs.length > 1 ? capsW(segs.slice(0, -1).join("  —  ") + "  —  ", I500, track) * size * (lineW / Math.max(1, capsW(line, I500, track) * size)) : 0);
  const target = segs.length > 1 ? (lastStart + (CANVAS_W + lineW) / 2) / 2 : 760;
  const lean = params.side === "left" ? -40 : params.side === "right" ? 30 : 0;
  const faceX = Math.max(620, Math.min(830, target)) + lean;
  const FRAME = story ? { chest: 360, waist: 300, knees: 236, full: 184 } : { chest: 228, waist: 186, knees: 148, full: 116 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const box = placeFree(data, faceX, story ? 420 : 320, faceH0, logoTop - 20);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;
  // Behind his head at the mouth: the one place whose width is known (the face box), so exactly the letters
  // of the ground's name under his head vanish — never the fixture, the date or the kick-off.
  const capH = size * 0.727;
  const baseline = Math.max(story ? 560 : 380, Math.min(story ? 1300 : 960, chin - box.faceH * 0.3)) + capH / 2 + (params.textY ?? 0);
  const fadeEnd = logoTop - (story ? 80 : 50);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300) - box.top}px, transparent ${fadeEnd - box.top}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${faceX / 10.8}% ${(baseline / H) * 100}%, #fbfaf7, ${GROUND} 70%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The one line, behind him. */}
      <OneLineText x={(CANVAS_W - lineW) / 2} y={baseline} width={lineW} text={line} track={track} maxSize={size} fill={INK} />

      {/* The player, sharp, natural colour, melting away above the logo. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 20}
        style={{ position: "absolute", left: (CANVAS_W - lineW) / 2, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
