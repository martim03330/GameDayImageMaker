/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { DoubleEdge, doubleTones, keepHead } from "./doubleline";
import { cutMask, Film } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal double line: the celebrating player, sharp and in natural colour, centred on a clean deep ground, and
 * two hairline echoes of his own edge — slipped left in the club colour and right in white, the same distance
 * each side — the moment printed twice, slightly out of register. "GOAL" small and wide-tracked at the top;
 * his name, the fixture (home first, names exactly as stored, no score) and the competition small at the foot.
 */
export function Goaldoubleline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const { deep, lift, left, right } = doubleTones(data);

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(15 * k, Math.min(26 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + 34 * k;

  /* ---- the player, centred; wide celebrations are scaled down so both lines stay in frame ---- */
  const sizes = story ? { chest: 320, waist: 260, knees: 206, full: 162 } : { chest: 228, waist: 184, knees: 146, full: 118 };
  const faceTop = story ? 440 : 300;
  let box = placeByFace(data, 540, faceTop, sizes);
  const wide = Math.min(1, (story ? 900 : 860) / box.width);
  if (wide < 1) box = placeByFace(data, 540, faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  // Centre the figure (not the face): his raised arms balance around the middle.
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = keepHead(data, { ...box, left: box.left + lean }, clipTop + (story ? 28 : 20), true);
  const dx = story ? 32 : 24;

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
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 48% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 82%)` }} />

      {data.photoUrl && <DoubleEdge id="goaldoubleline" url={data.photoUrl} box={box} H={H} dx={dx} left={left} right={right} clipTop={clipTop} fadeEnd={nameTop - 30 * k} />}

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 820 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 36%, ${deep} 58%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 500, { opacity: 0.86 }) }}>{fixture}</div>}
      {comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...caps(compSize, F_TRACK, 500, { opacity: 0.58 }) }}>{comp}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
