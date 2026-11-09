/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { SilhouetteFill, twinPair, wordTone } from "./typesilhouette";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Line silhouette: the player in natural colour on a deep, clean club-tone ground, and behind him a slightly
 * larger echo of his silhouette, offset to the free side and up, drawn only as a screen of thin horizontal
 * hairlines in the club colour or white (masked by the cutout's own alpha) — like a printed line-screen echo.
 * The title small at the top, the fixture and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Linesilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 31);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const { deep, lift, word, club } = wordTone(data, r() < 0.55);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the pair ---- */
  const { box, twin } = twinPair(data, {
    onLeft,
    faceTop: story ? 420 : 270,
    sizes: story ? { chest: 320, waist: 254, knees: 190, full: 138 } : { chest: 262, waist: 206, knees: 156, full: 120 },
    minHead: titleTop + tSize + (story ? 80 : 56),
    twinMinHead: titleTop + tSize + (story ? 60 : 42),
    lift: story ? 44 : 32,
    spread: 0.26,
    maxOff: 230,
    grow: 1.1,
  });

  /* ---- foot: fixture, date · kick-off · ground ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const fixture = teams.join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const date = niceDate(content.date);
  const when = [date, f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;

  /* ---- the line screen ---- */
  const lw = story ? 2.5 : 2;
  const pitch = story ? 9 : 7;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && (
        <SilhouetteFill url={data.photoUrl} twin={twin} cut={data.cut} clipTop={titleTop + tSize + (story ? 44 : 30)} fadeEnd={fixTop - (story ? 50 : 36)} H={H} base={`${club}1a`}>
          <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(to bottom, ${word} 0px, ${word} ${lw}px, transparent ${lw}px, transparent ${pitch}px)` }} />
        </SilhouetteFill>
      )}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 32%, ${deep} 55%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
