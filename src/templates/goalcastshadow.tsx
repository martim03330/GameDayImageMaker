/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { CastShadow, capsEm, figure, shadowTones } from "./castshadow";
import { cutMask, Film } from "./fx";
import { sentenceCase, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal cast shadow: the celebrating player in natural colour on an implied floor in a deep, clean club-tone
 * ground, and ONE long flat shadow of his own silhouette thrown diagonally across the floor behind him — the
 * raised fist reaching furthest, low evening sun. "Goal" small at the top on his side; at the foot, on the
 * same side, his name and the fixture (home first, names as stored, no score), small. Flips with params.side.
 */
export function Goalcastshadow({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { ground, light, dark } = shadowTones(data);

  const onLeft = params.side !== "right";
  const dir = onLeft ? 1 : -1;
  const floor = story ? 1400 : 1076;
  const fig = figure(data, {
    cx: 540 - dir * (story ? 170 : 160),
    headTop: story ? 320 : 186,
    floor,
    maxW: story ? 660 : 540,
    faceTop: story ? 400 : 270,
    sizes: story ? { chest: 360, waist: 280, knees: 220, full: 170 } : { chest: 250, waist: 196, knees: 152, full: 118 },
  });

  /* ---- type ---- */
  const title = sentenceCase(content.kicker || "GOAL");
  const tSize = 30 * k * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const colW = CANVAS_W - 2 * M - (story ? 300 : 250);
  const nameSize = Math.min(34 * k, colW / Math.max(1, name.length * 0.56)) * ts;
  const fixture = teamsOf(data).join("  v  ").toUpperCase();
  const F_TRACK = 0.18;
  const fixSize = Math.max(11, Math.min(16 * k, colW / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const footBottom = (story ? H - STORY_BOTTOM : 62) - (params.textY ?? 0);
  const align: CSSProperties = onLeft ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const line = (size: number, weight: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.15, whiteSpace: "nowrap", color: WHITE, ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at ${onLeft ? 22 : 78}% ${(floor / H) * 100 - 14}%, ${light}, ${ground} 78%)` }} />

      {data.photoUrl && <CastShadow url={data.photoUrl} fig={fig} dir={dir} color={dark} angle={story ? 50 : 54} squash={story ? 0.62 : 0.6} reach={0.5} />}
      {fig.feet && <div style={{ position: "absolute", left: fig.left + fig.width * 0.2, top: fig.anchorY - 12 * k, width: fig.width * 0.6, height: 22 * k, borderRadius: "50%", background: dark, opacity: 0.6, filter: `blur(${8 * k}px)` }} />}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
      )}
      {!fig.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 470, background: `linear-gradient(to bottom, transparent, ${ground}d9 55%, ${ground})` }} />}

      <div style={{ position: "absolute", top: titleTop, ...align, ...line(tSize, 500, { letterSpacing: "-0.01em", lineHeight: 1 }) }}>{title}</div>

      <div style={{ position: "absolute", bottom: footBottom, display: "flex", flexDirection: "column", gap: 14 * k * ts, ...align }}>
        {name && <div style={line(nameSize, 600, { letterSpacing: "-0.01em", lineHeight: 1 })}>{name}</div>}
        {fixture && <div style={line(fixSize, 500, { letterSpacing: `${F_TRACK}em`, color: "rgba(255,255,255,.72)" })}>{fixture}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 22}
        style={{ position: "absolute", [onLeft ? "right" : "left"]: M, bottom: (story ? H - STORY_BOTTOM : 58) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: onLeft ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
