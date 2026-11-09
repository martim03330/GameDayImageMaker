/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { teamsOf } from "./notify";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { faceAxis, fittedPair, SplitTwin, splitTones } from "./splitsilhouette";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal split silhouette: the celebrating player in natural colour on a deep, clean club-tone ground, and beside
 * him a twin of his celebration (same size, offset to the free side) split down its middle — the half nearer
 * him a flat solid club-tone fill, the outer half only a white hairline: half filled, half drawn. "GOAL" small
 * and wide-tracked at the top; his name, the fixture (home first, names exactly as stored, no score) and the
 * competition small at the foot. Flips with params.side.
 */
export function Goalsplitsilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 43);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const { deep, lift, solid, line } = splitTones(data);

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(15 * k, Math.min(26 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + (story ? 44 : 30);

  /* ---- the pair ---- */
  const { box, twin } = fittedPair(data, {
    onLeft,
    faceTop: story ? 420 : 296,
    sizes: story ? { chest: 300, waist: 236, knees: 180, full: 140 } : { chest: 230, waist: 184, knees: 142, full: 110 },
    minHead: clipTop + (story ? 24 : 16),
    twinMinHead: clipTop + 16,
    wholeTop: true,
    lift: story ? 36 : 26,
    maxOff: story ? 270 : undefined,
  });

  /* ---- foot ---- */
  const f = matchFacts(data);
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : "";
  const comp = (f.comp || "").trim().toUpperCase();
  const N_TRACK = 0.24;
  const F_TRACK = 0.3;
  const nameSize = Math.max(16, Math.min(28 * k, 860 / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const fixSize = Math.max(11, Math.min(15 * k, 860 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const compSize = Math.max(10, Math.min(12 * k, 860 / Math.max(1, capsEm(comp, F_TRACK)))) * ts;
  // Story: the logo (~88px) ends at STORY_BOTTOM, top at 1592; the last line ends 64px above it.
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (params.textY ?? 0);
  const compTop = lastBottom - compSize;
  const fixTop = (comp ? compTop - 18 * k : lastBottom) - fixSize;
  const nameTop = fixTop - 22 * k - nameSize;

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && <SplitTwin id="goalsplitsilhouette" url={data.photoUrl} twin={twin} H={H} cut={data.cut} clipTop={clipTop} fadeEnd={nameTop - 30 * k} splitX={faceAxis(data, twin)} solidLeft={onLeft} solid={solid} line={line} />}

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 820 : 480, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 36%, ${deep} 58%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 500, { opacity: 0.86 }) }}>{fixture}</div>}
      {comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...caps(compSize, F_TRACK, 500, { opacity: 0.58 }) }}>{comp}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
