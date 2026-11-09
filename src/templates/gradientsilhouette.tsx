/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { SilhouetteFill, twinPair, wordTone, type Box } from "./typesilhouette";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** "#rrggbb" + alpha → rgba(). */
const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return `rgba(${n(0)},${n(2)},${n(4)},${a})`;
};

/**
 * The twin's fill: a smooth vertical gradient, the club colour lifted bright at `from` (fraction of the twin's
 * height) easing out to nothing at `to`. Eased stops so the fade has no visible band.
 */
function gradientOf(color: string, from: number, to: number): string {
  const steps = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];
  const stops = steps.map((t) => {
    const a = Math.pow(1 - t, 1.7); // ease-out: holds its brightness near the head, then lets go
    return `${rgba(color, +(0.96 * a).toFixed(3))} ${((from + (to - from) * t) * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/**
 * The shared body of the gradient silhouette looks: the player in natural colour on a deep, clean club-tone
 * ground and beside him a twin of his own silhouette (same placement as typesilhouette) filled with one smooth
 * vertical gradient — the club colour lifted bright at the head (goal: at the raised fist, the very top of the
 * figure) fading to nothing by the waist. Crisp edges: masked straight by the cutout's alpha, no blur.
 * Matchday: the title small at the top, fixture and date · kick-off · ground at the foot. Goal: "GOAL" at the
 * top, his name and the fixture (never the score) at the foot. Flips with params.side.
 */
export function GradientSilhouette({ data, goal }: { data: RenderData; goal?: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? (goal ? 53 : 47));
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const { deep, lift, club } = wordTone(data, false);
  // Bright, lifted club colour — a dark club colour needs a bigger lift to glow on its own deep ground.
  const bright = luminance(club) < 0.1 ? shade(club, 0.42) : shade(club, 0.24);
  const f = matchFacts(data);

  /* ---- title ---- */
  const title = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'");
  const T_TRACK = goal ? 0.6 : 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- foot ---- */
  const teams = teamsOf(data);
  const fixture = teams.join("   v   ").toUpperCase() || (goal ? "" : (f.comp || "").toUpperCase());
  const F_TRACK = goal ? 0.28 : 0.3;
  const fixSize = Math.max(goal ? 11 : 12, Math.min((goal ? 15 : 17) * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const date = niceDate(content.date);
  const when = goal ? "" : [date, f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const name = goal ? [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ") : "";
  const nameSize = Math.min(32 * k, (CANVAS_W - 2 * M) / Math.max(1, name.length * 0.56)) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  let fixTop: number, whenTop = 0, nameTop = 0;
  if (goal) {
    fixTop = logoTop - 64 - fixSize - (params.textY ?? 0);
    nameTop = fixTop - 20 * k - nameSize;
  } else {
    whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
    fixTop = whenTop - fixSize - 22 * k;
  }
  const footTop = goal && name ? nameTop : fixTop;

  /* ---- the pair ---- */
  const pair = twinPair(data, {
    onLeft,
    faceTop: story ? 420 : 270,
    sizes: goal
      ? story ? { chest: 300, waist: 240, knees: 184, full: 140 } : { chest: 244, waist: 190, knees: 146, full: 114 }
      : story ? { chest: 320, waist: 254, knees: 190, full: 138 } : { chest: 262, waist: 206, knees: 156, full: 120 },
    minHead: titleTop + tSize + (story ? 80 : 56),
    twinMinHead: titleTop + tSize + (story ? 60 : 42),
    wholeTop: goal,
    lift: story ? 36 : 26,
  });
  // The twin stays whole on the canvas (a celebrating arm can reach past the edge): slide the pair inwards a
  // little, then tuck the twin closer to him.
  let { box, twin } = pair;
  {
    const d = pair.dir;
    const twinOut = (b: Box) => (d > 0 ? b.left + b.width - (CANVAS_W - 28) : 28 - b.left);
    const over = twinOut(twin) - twin.width * 0.01;
    if (over > 0) {
      const frameCut = (d > 0 ? data.cut?.left : data.cut?.right) ?? 0;
      const room = frameCut ? 999 : (d > 0 ? box.left : CANVAS_W - box.left - box.width) + box.width * 0.01 - 16;
      const slide = Math.max(0, Math.min(over, story ? 70 : 56, room));
      const tuck = Math.min(over - slide, Math.abs(twin.left - box.left) - 110);
      box = { ...box, left: box.left - d * slide };
      twin = { ...twin, left: twin.left - d * (slide + Math.max(0, tuck)) };
    }
  }

  /* ---- the gradient: head (or raised fist) → waist ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const from = goal ? 0 : Math.max(0, face[1] - face[3] * 0.4);
  // Waist ≈ 4 face-heights under the chin; a bust photo just fades out near its bottom edge. The fade also
  // finishes above the foot's text in canvas terms.
  const waist = face[1] + face[3] * (goal ? 4.6 : 4.2);
  const canvasEnd = (footTop - (story ? 90 : 70) - twin.top) / Math.max(1, twin.height);
  const to = Math.max(from + 0.25, Math.min(0.96, waist, canvasEnd));

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && (
        <SilhouetteFill url={data.photoUrl} twin={twin} cut={data.cut} clipTop={titleTop + tSize + (story ? 44 : 30)} fadeEnd={footTop - (story ? 50 : 36)} H={H}>
          <div style={{ position: "absolute", inset: 0, background: gradientOf(bright, from, to) }} />
        </SilhouetteFill>
      )}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 32%, ${deep} 55%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK), color: goal ? "rgba(255,255,255,.72)" : WHITE }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}

/**
 * Gradient silhouette: the player in natural colour on a deep, clean club-tone ground, and beside him a twin
 * of his own silhouette filled with a smooth vertical gradient — bright lifted club colour at the head fading
 * to transparent by the waist, crisp edges. The title small at the top, the fixture (home first, names exactly
 * as stored) and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Gradientsilhouette({ data }: { data: RenderData }) {
  return <GradientSilhouette data={data} />;
}
