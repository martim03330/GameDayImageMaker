/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#17181b";
const GREY = "#6e6e73";
const LIGHT = "#8e8e93";

/** Inter 500 is a touch wider than the 400 table. */
const w500 = (t: string, size: number) => bodyW(t, size) * 1.03;

/** Greedy lines of Inter 500 that fit `width` at `size`. */
function wrap(text: string, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last && w500(`${last} ${w}`, size) <= width) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines;
}

/** The ground's name at the biggest size (down to `min`) that sets it in at most two lines. */
function fitVenue(text: string, base: number, min: number, width: number): { lines: string[]; size: number } {
  for (let s = base; s >= min; s -= 1) {
    const lines = wrap(text, s, width);
    if (lines.length <= 2 && lines.every((l) => w500(l, s) <= width)) return { lines, size: s };
  }
  return { lines: wrap(text, min, width).slice(0, 2), size: min };
}

/**
 * Locator: the ground as a live location. A clean pale ground with the faintest map grid and one thin
 * road curving through; in the free space a small solid club-colour dot ringed in white, with three thin
 * pulse rings around it, and beside it the ground's name in Inter 500 under a small spaced "MATCHDAY",
 * then the fixture (home first, names as stored) and "17 October · 15:00" in small grey. The player stands
 * big on the other side in natural colour, melting into the ground. Flips with params.side.
 */
export function Locator({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const f = matchFacts(data);
  const M = story ? 72 : 64;

  /* ---- the column: opposite the player ---- */
  const playerLeft = params.side === "left";
  const colW = story ? 570 : 520;
  const colX = playerLeft ? CANVAS_W - M - colW : M;
  const dotR = 13 * k;
  const ring = [28, 46, 64].map((r) => r * k);
  const dotX = colX + ring[2];
  const textX = dotX + ring[2] + 18 * k;
  const textW = colX + colW - textX;

  /* ---- the foot: logo, then the block ~62px above it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  const venueText = (content.venue ?? "").trim() || titleCase(f.venue) || titleCase(f.comp) || "Matchday";
  const venue = fitVenue(venueText, (story ? 48 : 52) * k, 34 * k, textW);
  const vLead = venue.size * 1.1;
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const when = [niceDate(content.date), f.time].filter(Boolean).join(" · ");
  const small = (t: string, base: number) => Math.max(base * 0.72, Math.min(base, textW / Math.max(1, bodyW(t, 1))));
  const sF = small(fixture, 26 * k);
  const sW = small(when, 26 * k);
  const kicker = (content.kicker || "Matchday").toUpperCase();
  const kSize = 15 * k;

  // Stack from the bottom up.
  const whenTop = logoTop - (story ? 66 : 62) + ty - sW * 1.05;
  const fixTop = when ? whenTop - sF * 1.5 : logoTop - (story ? 66 : 62) + ty - sF * 1.05;
  const venueTop = (fixture ? fixTop : fixTop + sF * 1.5) - 24 * k - vLead * venue.lines.length;
  const kickTop = venueTop - 22 * k - kSize;
  const dotY = venueTop + vLead / 2; // level with the first line of the name

  /* ---- the player, big, on the other side ---- */
  const faceX = playerLeft ? (story ? 290 : 330) : story ? 790 : 750;
  const sizes = story ? { chest: 290, waist: 228, knees: 180, full: 140 } : { chest: 240, waist: 190, knees: 148, full: 116 };
  const probe = placeByFace(data, faceX, 300, sizes);
  let box = placeByFace(data, faceX, (story ? STORY_TOP + 30 : 50) + probe.faceH * 0.7, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The type's real right edge (the column is ragged): he melts away just past it.
  const textRight = textX + Math.max(...venue.lines.map((l) => w500(l, venue.size)), fixture ? bodyW(fixture, sF) : 0, when ? bodyW(when, sW) : 0);
  const soft = story ? 170 : 130;
  {
    // Slide him away from the column (face ≥ 40px inside) so the melt finishes before his face.
    const fl = box.left + face[0] * box.width;
    const fr = fl + face[2] * box.width;
    const need = playerLeft ? fr + soft + 24 - (colX - 10) : textRight + 20 - (fl - soft - 24);
    const room = playerLeft ? fl - 40 - box.faceH * 0.6 : CANVAS_W - 40 - box.faceH * 0.6 - fr;
    if (need > 0) box = { ...box, left: box.left + (playerLeft ? -1 : 1) * Math.min(need, Math.max(0, room)) };
  }
  const face0 = box.left + face[0] * box.width;
  const faceL = face0;
  const faceR = face0 + face[2] * box.width;
  const faceCx = (faceL + faceR) / 2;
  const chin = box.top + face[1] * box.height + box.faceH;
  // He melts into the ground beside the column (never across his face) and at his feet.
  const colEdge = playerLeft ? colX - 10 : textRight + 20;
  const edge = playerLeft ? Math.max(colEdge, faceR + soft + 24) : Math.min(colEdge, faceL - soft - 24);
  const sideFade = playerLeft
    ? `linear-gradient(to right, #000 0, #000 ${edge - soft - box.left}px, transparent ${edge - box.left}px)`
    : `linear-gradient(to right, transparent ${edge - box.left}px, #000 ${edge + soft - box.left}px, #000 100%)`;
  const footFade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 360 : 260) - box.top}px, transparent ${H - 20 - box.top}px)`;
  // Only melt beside the column where the column has type: above it he stays whole.
  const blockTop = kickTop - 80 * k;
  const keepTop = `linear-gradient(to bottom, #000 0, #000 ${blockTop - 140 - box.top}px, transparent ${blockTop - box.top}px)`;

  /* ---- the map: the faintest grid around the dot and one thin road through it ---- */
  const cell = story ? 150 : 135;
  const gridMask = `radial-gradient(${story ? 560 : 480}px ${story ? 640 : 520}px at ${dotX}px ${dotY}px, rgba(0,0,0,1), rgba(0,0,0,0) 100%)`;
  // From under the dot, through it, then up and away from the type (which always sits right of the dot).
  const road = `M ${dotX - 60 * k} ${H + 20} C ${dotX - 20 * k} ${dotY + 300 * k}, ${dotX + 12 * k} ${dotY + 110 * k}, ${dotX} ${dotY} S ${dotX - 150 * k} ${dotY - 320 * k}, ${dotX - 460 * k} ${dotY - 760 * k}`;

  const ground = "#f3f3f1";
  const caps = { fontFamily: SANS, whiteSpace: "nowrap" as const, lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(club, 0.9)} 0%, ${ground} 55%)`, opacity: 0.7 }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, WebkitMaskImage: gridMask, maskImage: gridMask }}>
        {Array.from({ length: Math.ceil(CANVAS_W / cell) + 1 }, (_, i) => (
          <line key={`v${i}`} x1={i * cell + (dotX % cell)} y1={0} x2={i * cell + (dotX % cell)} y2={H} stroke="rgba(20,22,28,.07)" strokeWidth={1} />
        ))}
        {Array.from({ length: Math.ceil(H / cell) + 1 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * cell + (dotY % cell)} x2={CANVAS_W} y2={i * cell + (dotY % cell)} stroke="rgba(20,22,28,.07)" strokeWidth={1} />
        ))}
        <path d={road} fill="none" stroke="rgba(20,22,28,.09)" strokeWidth={14 * k} strokeLinecap="round" />
        <path d={road} fill="none" stroke="#ffffff" strokeWidth={11 * k} strokeLinecap="round" />
      </svg>

      {/* A soft light and shade behind him. */}
      <div style={{ position: "absolute", left: faceCx - box.faceH * 2.2, top: chin + box.faceH * 0.4, width: box.faceH * 4.4, height: box.faceH * 4.6, borderRadius: "50%", background: "rgba(30,34,44,.10)", filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: footFade, maskImage: footFade }}>
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `${sideFade}, ${keepTop}`, maskImage: `${sideFade}, ${keepTop}`, WebkitMaskComposite: "source-over", maskComposite: "add" }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}

      {/* A breath of the ground behind the type, where his body may still show faintly. */}
      <div style={{ position: "absolute", left: textX - 60 * k, top: kickTop - 50 * k, width: textRight - textX + 120 * k, height: whenTop + sW + 60 * k - kickTop + 50 * k, borderRadius: "50%", background: ground, opacity: 0.75, filter: `blur(${40 * k}px)` }} />

      {/* The live-location dot. */}
      {ring.map((r, i) => (
        <div key={i} style={{ position: "absolute", left: dotX - r, top: dotY - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `${story ? 2 : 1.5}px solid ${club}`, opacity: [0.55, 0.32, 0.16][i], boxSizing: "border-box" }} />
      ))}
      <div style={{ position: "absolute", left: dotX - ring[0], top: dotY - ring[0], width: 2 * ring[0], height: 2 * ring[0], borderRadius: "50%", background: club, opacity: 0.1 }} />
      <div
        style={{
          position: "absolute",
          left: dotX - dotR,
          top: dotY - dotR,
          width: 2 * dotR,
          height: 2 * dotR,
          borderRadius: "50%",
          background: club,
          border: `${4 * k}px solid #ffffff`,
          boxShadow: `0 ${2 * k}px ${8 * k}px rgba(0,0,0,.22)`,
          boxSizing: "content-box",
          transform: `translate(${-4 * k}px, ${-4 * k}px)`,
        }}
      />

      {/* Beside it: the ground, then the fixture and the time. */}
      <div style={{ position: "absolute", left: textX, top: kickTop, ...caps, fontWeight: 600, fontSize: kSize, letterSpacing: "0.3em", color: club }}>{kicker}</div>
      {venue.lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: textX, top: venueTop + i * vLead, height: vLead, ...caps, fontWeight: 500, fontSize: venue.size, lineHeight: `${vLead}px`, letterSpacing: "-0.02em", color: INK }}>{l}</div>
      ))}
      {fixture && <div style={{ position: "absolute", left: textX, top: fixTop, ...caps, fontWeight: 400, fontSize: sF, lineHeight: 1.05, letterSpacing: "-0.01em", color: GREY }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: textX, top: whenTop, ...caps, fontWeight: 400, fontSize: sW, lineHeight: 1.05, letterSpacing: "-0.01em", color: LIGHT }}>{when}</div>}

      <AgencyLogo data={data} onLight height={22} style={{ position: "absolute", left: textX - 4, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "left bottom" }} />
      <Film strength={0.08} />
    </div>
  );
}
