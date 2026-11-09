/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM } from "./types";

export const PRINT_INK = "#1b1c20";
export const PRINT_GREY = "rgba(27,28,32,.52)";

/** Inter (regular/medium): rough advance per em, for fitting a line to the margin. */
const INTER_EM = 0.56;
const INTER_CAPS_EM = 0.68;
/** The biggest size (≤ max, ≥ min) at which `t` fits `room`. */
export const fitText = (t: string, room: number, max: number, min = 10, em = INTER_EM, tracking = 0) =>
  Math.max(min, Math.min(max, room / Math.max(1, [...t].length * (em + tracking))));

/** "MATCHDAY" → "Matchday", "HAT-TRICK" → "Hat-trick". */
export function sentence(t: string): string {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The club colour, guarded against white / yellow / near-black. */
export function clubTone(data: RenderData): string {
  const { params } = data;
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  return club;
}

/** Home team first, names exactly as stored (only the case may change). */
export function fixtureOf(data: RenderData): string[] {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? c.homeTeam : c.awayTeam) || ours).trim();
  const oppRaw = ((weHost ? c.awayTeam : c.homeTeam) || "").trim();
  const opp = oppRaw || (f.opp ? f.opp : "");
  return (weHost ? [oursName, opp] : [opp, oursName]).filter(Boolean);
}

/**
 * The player inside a square window (local coordinates): face centred at `faceX`, face top at `faceTop`,
 * face size from the framing, and always tall enough to run past the window's bottom edge.
 */
export function placeInWindow(data: RenderData, win: number, faceX: number, faceTop: number, sizes: Record<string, number>, fadeStrength = 1) {
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let faceH = (sizes[p.framing ?? "waist"] ?? sizes.waist) * (p.playerScale ?? 1);
  // The original photo's own resolution: past ~1.6× its face pixels the face goes soft.
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.6));
  // A photo cut at the bottom fades out over its last ~16%: keep that fade below the window's edge.
  const fadeFrac = (data.cut?.bottom ?? 0) > 0 ? 0.16 * fadeStrength : 0;
  const h = Math.max(faceH / face[3], (win + 12 - faceTop) / Math.max(0.2, 1 - face[1] - fadeFrac));
  const w = h * aspect;
  const left = faceX - w * (face[0] + face[2] / 2) + (p.playerX ?? 0);
  const top = faceTop - h * face[1] + (p.playerY ?? 0);
  return { left, top, width: w, height: h, faceH: face[3] * h, faceCx: left + (face[0] + face[2] / 2) * w, faceTop: top + face[1] * h };
}

/** His own photo, softly blurred and graded like an instant print, filling the window (or a club wash). */
export function PrintGround({ data, win, club, dark = false }: { data: RenderData; win: number; club: string; dark?: boolean }) {
  const back = data.bgPhotoUrl;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 80% at 50% 38%, ${shade(club, 0.18)}, ${shade(club, -0.45)})` }} />
      {back && (
        <img
          src={back}
          alt=""
          style={{
            position: "absolute",
            left: -win * 0.08,
            top: -win * 0.08,
            width: win * 1.16,
            height: win * 1.16,
            maxWidth: "none",
            objectFit: "cover",
            filter: `blur(${Math.round(win * 0.026)}px) saturate(.72) sepia(.14) brightness(${dark ? 0.98 : 1.04}) contrast(.88)`,
          }}
        />
      )}
      {/* Instant film: lifted, slightly warm shadows and a soft fall-off to the corners. */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(246,236,220,.10)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 75% at 50% 45%, transparent 55%, rgba(30,24,18,.22))" }} />
    </>
  );
}

/** The thin sheen and edge of the film inside the window, drawn over everything in it. */
export function PrintSheen() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(128deg, rgba(255,255,255,.07) 0%, transparent 38%, transparent 70%, rgba(255,255,255,.04) 100%)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,.10), inset 0 0 18px rgba(0,0,0,.12)",
      }}
    />
  );
}

/** The paper of the print: off-white with the faintest fall of light. */
export const PAPER_BG = "linear-gradient(170deg, #fbfaf6 0%, #f4f2ec 60%, #efece5 100%)";

/**
 * Instant: one instant-camera print lying on a calm, plain stone-coloured ground, turned a couple of
 * degrees, a soft shadow under it. In its square window the player, sharp and natural, over his own photo
 * softened and graded like instant film. On the thick white margin, set in clean Inter (never handwriting):
 * "Matchday", the fixture (home first, names as stored) and date · kick-off. The NEYOD mark sits on the ground
 * below the print, well clear of it. Not `frame` (a picture frame with a breakout) or `filmframe` (35mm strip).
 */
export function Instant({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const club = clubTone(data);

  /* ---- the print: classic instant proportions (square window, thick bottom margin) ---- */
  const W = story ? 980 : 840;
  const side = Math.round(W * 0.05);
  const win = W - 2 * side;
  const foot = Math.round(W * 0.24);
  const PH = side + win + foot;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const top = (story ? logoTop - 96 - PH : 104) + (params.textY ?? 0);
  const left = (CANVAS_W - W) / 2;
  const tilt = (params.seed ?? 0) % 2 === 0 ? -1.8 : 1.6;

  /* ---- the player in the window ---- */
  const faceX = win / 2 + (params.side === "left" ? -win * 0.08 : params.side === "right" ? win * 0.08 : 0);
  const sizes = { chest: win * 0.21, waist: win * 0.16, knees: win * 0.125, full: win * 0.1 };
  let box = placeInWindow(data, win, faceX, win * 0.15, sizes, 1.3);
  // Where his photo cut him off at a side, slide that edge onto the window's edge, like the print's own crop.
  const cutL = data.cut?.left ?? 0;
  const cutR = data.cut?.right ?? 0;
  if ((cutL > 0) !== (cutR > 0)) {
    const want = cutR >= cutL ? win - (box.left + box.width) : -box.left;
    const dx = Math.max(-win * 0.22, Math.min(win * 0.22, want));
    if (Math.sign(dx) === Math.sign(want)) box = { ...box, left: box.left + dx, faceCx: box.faceCx + dx };
  }
  const chin = box.faceTop + box.faceH;
  // The face never runs out of the window.
  const shiftX = Math.max(box.faceH * 1.1 - box.faceCx, Math.min(0, win - box.faceH * 1.1 - box.faceCx));
  box = { ...box, left: box.left + shiftX, faceCx: box.faceCx + shiftX };

  /* ---- the margin ---- */
  const f = matchFacts(data);
  const title = sentence(content.kicker || "Matchday");
  const teams = fixtureOf(data);
  const fixture = teams.join(" v ");
  const meta = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ").toUpperCase();
  const room = win - 8;
  const k = (story ? 1.3 : 1) * ts;
  const tSize = fitText(title, room, 38 * k, 18);
  const fSize = fitText(fixture, room, 25 * k, 12);
  const mSize = fitText(meta, room, 14 * k, 9, INTER_CAPS_EM, 0.22);
  const g1 = 14 * k;
  const g2 = 16 * k;
  const blockH = tSize + g1 + (fixture ? fSize + g2 : 0) + (meta ? mSize : 0);
  const blockTop = side + win + (foot - blockH) / 2 - 2 * k;

  const line = (size: number, weight: number, color: string, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color,
    ...extra,
  });

  const ground = "#e6e2da";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: plain warm stone, a soft pool of light where the print lies. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% ${((top + PH * 0.45) / H) * 100}%, #f1eee8 0%, ${ground} 60%, #d9d4ca 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "soft-light", opacity: 0.1 }} />

      {/* The print. */}
      <div style={{ position: "absolute", left, top, width: W, height: PH, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
        {/* Its shadow on the ground: tight contact plus a long soft fall. */}
        <div style={{ position: "absolute", left: 10, right: 10, top: 24, bottom: -18, background: "rgba(40,32,22,.34)", filter: `blur(${story ? 34 : 28}px)`, borderRadius: 8 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: PAPER_BG,
            borderRadius: 3,
            boxShadow: "0 1px 1.5px rgba(0,0,0,.16), 0 4px 10px rgba(0,0,0,.08)",
          }}
        />
        {/* The window. */}
        <div style={{ position: "absolute", left: side, top: side, width: win, height: win, overflow: "hidden", background: shade(club, -0.4) }}>
          <PrintGround data={data} win={win} club={club} />
          {/* A soft shade behind his shoulders so a pale kit separates from the photo. */}
          <div style={{ position: "absolute", left: box.faceCx - box.faceH * 2.4, top: chin, width: box.faceH * 4.8, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.2)", filter: `blur(${Math.round(win * 0.06)}px)` }} />
          {data.photoUrl && (
            <img
              src={data.photoUrl}
              alt=""
              style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(.95) sepia(.04)", ...cutMask(data.cut, 1.3) }}
            />
          )}
          <PrintSheen />
        </div>

        {/* The margin: title, fixture, date · kick-off. */}
        <div style={{ position: "absolute", left: side + 4, top: blockTop, ...line(tSize, 600, PRINT_INK, { letterSpacing: "-0.015em" }) }}>{title}</div>
        {fixture && <div style={{ position: "absolute", left: side + 4, top: blockTop + tSize + g1, ...line(fSize, 400, PRINT_INK, { letterSpacing: "-0.005em" }) }}>{fixture}</div>}
        {meta && (
          <div style={{ position: "absolute", left: side + 4, top: blockTop + tSize + g1 + (fixture ? fSize + g2 : 0), ...line(mSize, 500, PRINT_GREY, { letterSpacing: "0.22em" }) }}>{meta}</div>
        )}
      </div>

      <AgencyLogo data={data} onLight height={22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
