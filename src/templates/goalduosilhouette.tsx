/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { teamsOf } from "./notify";
import { duoTones, FootFade, solidSide, trioBoxes, Twins } from "./duosilhouette";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal duo silhouette: the celebrating player in natural colour, centred on a deep, clean club-tone ground,
 * flanked symmetrically by two twins of his celebration at the same size, partly behind him — one a flat solid
 * in a darker club tone, the other only a hairline — both raising the same fist. "Goal" small at the top; at the
 * foot his name and the fixture (home first, names exactly as stored, never the score), small.
 */
export function Goalduosilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 37);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const solidLeft = solidSide(data, r());
  const { deep, lift, solid, line } = duoTones(data, r() < 0.5);

  /* ---- title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.6;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + (story ? 40 : 26);

  /* ---- foot: his name, the fixture ---- */
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const nameSize = Math.min(32 * k, (CANVAS_W - 2 * M) / Math.max(1, name.length * 0.56)) * ts;
  const fixture = teamsOf(data).join("   v   ").toUpperCase();
  const F_TRACK = 0.28;
  const fixSize = Math.max(11, Math.min(15 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot ends ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const fixTop = logoTop - 64 - fixSize - (params.textY ?? 0);
  const nameTop = fixTop - 20 * k - nameSize;

  /* ---- the trio ---- */
  const { box, left, right } = trioBoxes(data, {
    faceTop: story ? 430 : 310,
    sizes: story ? { chest: 270, waist: 214, knees: 164, full: 128 } : { chest: 220, waist: 176, knees: 134, full: 104 },
    minHead: titleTop + tSize + (story ? 70 : 48),
    maxHalf: 520,
    floor: nameTop - (story ? 70 : 50),
    wholeTop: true,
  });

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 52% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 80%)` }} />

      <Twins id="goalduosilhouette" data={data} left={left} right={right} solidLeft={solidLeft} solid={solid} line={line} H={H} clipTop={clipTop} k={k} />

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
      )}
      <FootFade top={nameTop - (story ? 480 : 340)} end={nameTop - 14 * k} H={H} deep={deep} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK), color: "rgba(255,255,255,.72)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
