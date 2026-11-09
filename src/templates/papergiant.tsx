/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance } from "@/lib/color";
import { cutMask } from "./fx";
import { capsEm, frontBox, giantBox, giantScale, GiantShape } from "./giantsilhouette";
import { teamsOf } from "./notify";
import { mix, PaperTooth, paperTones } from "./paperecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/** Warm paper, its lighter centre and edge, the ink, and the giant: a soft pale tint of the club colour. */
export function paperGiantTones(data: RenderData) {
  const t = paperTones(data);
  // A pale club tint, crisp but quiet: a light club colour needs a bigger share to show on the paper.
  const giant = mix(t.paper, t.club, luminance(t.club) > 0.45 ? 0.22 : luminance(t.club) > 0.12 ? 0.115 : 0.14);
  return { ...t, giant };
}

/** RGBA string from a #rrggbb colour. */
export const rgba = (h: string, a: number) => {
  const m = h.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const [r, g, b] = m ? [1, 2, 3].map((i) => parseInt(m[i], 16)) : [0, 0, 0];
  return `rgba(${r},${g},${b},${a})`;
};

/**
 * Paper giant: giantsilhouette on light warm paper — his own silhouette blown up about twice behind him as
 * one crisp, flat, pale tint of the club colour, so big the canvas crops it to head and shoulders; the player
 * in natural colour, smaller, in front on the other side with a soft shade on the paper. Ink type: the title
 * small and tracked at the top; the fixture (home first, names exactly as stored) and date · kick-off · ground
 * small at the foot. Flips with params.side.
 */
export function Papergiant({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side !== "right";
  const dir = onLeft ? 1 : -1;
  const { paper, light, edge, ink, giant } = paperGiantTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player (front, smaller) and the giant (behind, ~2×) ---- */
  const faceTop = story ? 760 : 470;
  const box = frontBox(data, 540 - dir * (story ? 150 : 140), faceTop, story ? { chest: 300, waist: 230, knees: 176, full: 140 } : { chest: 230, waist: 176, knees: 136, full: 108 }, story ? H - 280 : undefined);
  const scale = giantScale(data, box, story ? 540 : 420);
  const gx = 540 + dir * (story ? 150 : 130);
  const big = giantBox(data, box, { scale, cx: gx, wholeTop: titleTop + tSize + (story ? 90 : 70) });

  /* ---- foot: fixture, date · kick-off · ground ---- */
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(76% 56% at ${50 + dir * 10}% 34%, ${light}, ${paper} 64%, ${edge})` }} />

      {data.photoUrl && <GiantShape id="papergiant" url={data.photoUrl} box={big} H={H} color={giant} />}

      {/* A soft shade on the paper behind him, so he stands off the giant. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.16 + dir * 26, top: box.top + box.height * 0.12, width: box.width * 0.72, height: box.height * 0.55, borderRadius: "50%", background: rgba(ink, 0.12), filter: `blur(${56 * k}px)` }} />

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 880 : 470, background: story ? `linear-gradient(to bottom, ${rgba(paper, 0)}, ${rgba(paper, 0.9)} 34%, ${paper} 56%)` : `linear-gradient(to bottom, ${rgba(paper, 0)}, ${rgba(paper, 0.86)} 52%, ${paper})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: ink, opacity: 0.72 }}>{when}</div>
      )}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <PaperTooth />
    </div>
  );
}
