/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { capsEm, frontBox, giantBox, giantScale, GiantShape, giantTones } from "./giantsilhouette";
import { teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal giant silhouette: a deep, clean club-tone ground and, behind the celebrating player, his own
 * celebration blown up to a single flat shape a few steps lighter than the ground — the giant's raised fist
 * and shoulders filling the background, cropped by the canvas. The player in natural colour, smaller, in
 * front on the other side. "Goal" small at the top; his name and the fixture (home first, names exactly as
 * stored, never the score) small at the foot. Flips with params.side.
 */
export function Goalgiantsilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side !== "right";
  const dir = onLeft ? 1 : -1;
  const { deep, lift, giant } = giantTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.6;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const titleBottom = titleTop + tSize;

  /* ---- the player (front) — his raised fist clear of the title ---- */
  let box = frontBox(data, 540 - dir * (story ? 150 : 140), story ? 760 : 520, story ? { chest: 300, waist: 230, knees: 176, full: 140 } : { chest: 230, waist: 176, knees: 136, full: 108 }, story ? H - 150 : undefined);
  // He stays the smaller figure: a close, high-resolution crop is shrunk about his face.
  const maxW = story ? 660 : 580;
  if (box.width > maxW) {
    const f0 = data.face ?? [0.38, 0.08, 0.24, 0.12];
    const sc = maxW / box.width;
    const cx = box.left + (f0[0] + f0[2] / 2) * box.width;
    const cy = box.top + f0[1] * box.height;
    box = { left: cx - (f0[0] + f0[2] / 2) * box.width * sc, top: cy - f0[1] * box.height * sc, width: box.width * sc, height: box.height * sc };
  }
  const minHead = titleBottom + (story ? 260 : 170);
  if (box.top < minHead) box = { ...box, top: minHead };

  /* ---- the giant: his whole celebration ~2–2.6×, centred across the canvas so the raised fist stays in,
     its top (the fist) just under the title ---- */
  const scale = Math.min(giantScale(data, box, story ? 360 : 290), (CANVAS_W * (story ? 0.98 : 1.04)) / Math.max(1, box.width));
  const gw = box.width * Math.max(1.8, scale);
  const g0 = giantBox(data, box, { scale: Math.max(1.8, scale), cx: 0, wholeTop: titleBottom + (story ? 70 : 46) });
  // The giant is the backdrop, the same on both sides: centred, nudged towards his face so the fist (the
  // other side of the cutout) stays inside the canvas.
  const fx = (data.face ?? [0.38, 0.08, 0.24, 0.12])[0] + (data.face ?? [0.38, 0.08, 0.24, 0.12])[2] / 2;
  const big = { ...g0, left: (CANVAS_W - gw) / 2 + (fx - 0.5) * gw * 0.45 };

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
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 55% at ${50 + dir * 12}% 30%, ${lift}, ${deep} 82%)` }} />

      {data.photoUrl && <GiantShape id="goalgiantsilhouette" url={data.photoUrl} box={big} H={H} color={giant} fade={[H * 0.6, H * 0.86]} />}

      <div style={{ position: "absolute", left: box.left + box.width * 0.1, top: box.top + box.height * 0.08, width: box.width * 0.8, height: box.height * 0.6, borderRadius: "50%", background: deep, opacity: 0.35, filter: `blur(${60 * k}px)` }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 470, background: story ? `linear-gradient(to bottom, transparent, ${deep}e6 40%, ${deep} 58%)` : `linear-gradient(to bottom, transparent, ${deep}d9 52%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK), color: "rgba(255,255,255,.72)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
