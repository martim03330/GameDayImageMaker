/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm, MirrorOutline, mirrorPair, mirrorTones } from "./mirrorecho";
import { teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal mirror echo: the celebrating player in natural colour on a deep, clean club-tone ground, and facing
 * him his own celebration mirrored — the silhouette drawn only as a thin hairline in the club colour or
 * white, the twin answering his raised fist. "Goal" small at the top; at the foot his name and the fixture
 * (home first, names exactly as stored, never the score), small. Flips with params.side.
 */
export function Goalmirrorecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 23);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side !== "right";
  const { deep, lift, line } = mirrorTones(data, r() < 0.5);

  /* ---- title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.6;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the pair ---- */
  const { box, twin } = mirrorPair(data, {
    onLeft,
    faceTop: story ? 390 : 290,
    sizes: story ? { chest: 280, waist: 220, knees: 170, full: 134 } : { chest: 230, waist: 184, knees: 140, full: 110 },
    minHead: titleTop + tSize + (story ? 64 : 44),
    minBottom: story ? H - 290 : undefined,
    wholeTop: true,
    maxHalf: 520,
  });

  /* ---- foot: his name, the fixture ---- */
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const nameSize = Math.min(32 * k, (CANVAS_W - 2 * M) / Math.max(1, name.length * 0.56)) * ts;
  const fixture = teamsOf(data).join("   v   ").toUpperCase();
  const F_TRACK = 0.28;
  const fixSize = Math.max(11, Math.min(15 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const fixTop = logoTop - 64 - fixSize - (params.textY ?? 0);
  const nameTop = fixTop - 20 * k - nameSize;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && <MirrorOutline id="goalmirrorecho" url={data.photoUrl} cut={data.cut} twin={twin} H={H} color={line} clipTop={titleTop + tSize + (story ? 40 : 26)} />}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 480, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 32%, ${deep} 55%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK), color: "rgba(255,255,255,.72)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
