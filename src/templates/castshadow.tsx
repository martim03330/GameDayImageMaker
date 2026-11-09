/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** Inter capitals, roughly, with the tracking added per glyph (accents ignored). */
export const capsEm = (t: string, tracking: number) =>
  [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);
/** Inter lower-case text, roughly. */
export const textEm = (t: string) => t.length * 0.5;

export type Figure = { left: number; top: number; width: number; height: number; feet: boolean; anchorY: number; faceCx: number };

/**
 * The player standing on an implied floor: with legs in the photo his feet land on `floor` and his head
 * near `headTop`; a photo cut at the bottom is placed by its face and anchored at the canvas bottom.
 */
export function figure(data: RenderData, o: { cx: number; headTop: number; floor: number; maxW: number; faceTop: number; sizes: Record<string, number> }): Figure {
  const p = data.params;
  const H = data.canvasH ?? CANVAS_H;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const fx = face[0] + face[2] / 2;
  if ((data.cut?.bottom ?? 0) > 0) {
    const b = placeByFace(data, o.cx, o.faceTop, o.sizes);
    return { ...b, feet: false, anchorY: H, faceCx: b.left + fx * b.width };
  }
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  let h = (o.floor - o.headTop) / (1 - hair);
  // The face never past ~2.1× its real pixels (export is 2×); never wider than the column.
  const cap = data.facePx > 0 ? data.facePx * 2.1 : 400;
  if (h * face[3] > cap) h = cap / face[3];
  if (h * aspect > o.maxW) h = o.maxW / aspect;
  h *= p.playerScale ?? 1;
  const w = h * aspect;
  const top = o.floor - h + (p.playerY ?? 0);
  const left = o.cx - fx * w + (p.playerX ?? 0);
  return { left, top, width: w, height: h, feet: true, anchorY: top + h, faceCx: left + fx * w };
}

/**
 * ONE long, flat cast shadow of the cutout: his silhouette filled with a dark tone, foreshortened and
 * sheared from his feet across the floor towards `dir` (+1 right, −1 left), sharp at the feet and
 * softening and fading towards its far end — low evening sun.
 */
export function CastShadow({ url, fig, dir, color, angle = 52, squash = 0.6, opacity = 0.9, reach = 0.12 }: { url: string; fig: Figure; dir: number; color: string; angle?: number; squash?: number; opacity?: number; reach?: number }) {
  const oy = fig.anchorY - fig.top;
  // Never steeper than `angle`, and flatter when a tall (cut) figure would throw it far off the canvas.
  const room = (dir > 0 ? CANVAS_W - fig.faceCx : fig.faceCx) + 80;
  const tilt = (Math.atan(Math.min(Math.tan((angle * Math.PI) / 180), room / Math.max(1, squash * oy))) * 180) / Math.PI;
  const shape: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: color,
    WebkitMaskImage: `url("${url}")`,
    maskImage: `url("${url}")`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
  // Gradients in the figure's own coordinates (0% = his head, 100% = his feet); the shear stretches them along the shadow.
  const feetPct = Math.min(100, (oy / fig.height) * 100);
  const g = (stops: string) => `linear-gradient(to bottom, ${stops})`;
  const near = g(`transparent ${feetPct * 0.42}%, #000 ${feetPct * 0.66}%`);
  const far = g(`#000 0%, #000 ${feetPct * 0.5}%, transparent ${feetPct * 0.74}%`);
  const fade = g(`rgba(0,0,0,${reach * 0.4}) 0%, rgba(0,0,0,${reach}) ${feetPct * 0.08}%, rgba(0,0,0,${Math.max(0.5, reach)}) ${feetPct * 0.3}%, rgba(0,0,0,.85) ${feetPct * 0.6}%, #000 ${feetPct * 0.88}%`);
  return (
    <div
      data-bleed
      style={{
        position: "absolute",
        left: fig.left,
        top: fig.top,
        width: fig.width,
        height: fig.height,
        transformOrigin: `${fig.faceCx - fig.left}px ${oy}px`,
        transform: `skewX(${-dir * tilt}deg) scaleY(${squash})`,
        opacity,
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    >
      {/* Near his feet: crisp. */}
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: near, maskImage: near }}>
        <div style={{ position: "absolute", inset: 0, filter: "blur(1px)" }}>
          <div style={shape} />
        </div>
      </div>
      {/* Far end: the edge goes soft, as a real shadow does. */}
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: far, maskImage: far }}>
        <div style={{ position: "absolute", inset: 0, filter: "blur(6px)" }}>
          <div style={shape} />
        </div>
      </div>
    </div>
  );
}

/** The ground and light shared by the cast-shadow looks: a deep club tone, warmer where the low sun comes from. */
export function shadowTones(data: RenderData) {
  const club = clubTone(data);
  return { club, ground: shade(club, -0.74), light: shade(club, -0.52), dark: shade(club, -0.93) };
}

/**
 * Cast shadow: the player standing in natural colour on an implied floor in a deep, clean club-tone ground,
 * and ONE long flat shadow of his own silhouette stretched diagonally across the floor behind him — low
 * evening sun. "Matchday" small at the top on his side; at the foot, on the same side, the fixture (home
 * first, names exactly as stored), date · kick-off and the ground, small. Flips with params.side.
 */
export function Castshadow({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { ground, light, dark } = shadowTones(data);

  // He stands on `side`; the sun is low in front of him on that side, so the shadow runs to the other.
  const onLeft = params.side !== "right";
  const dir = onLeft ? 1 : -1;
  const floor = story ? 1410 : 1084;
  const fig = figure(data, {
    cx: 540 - dir * (story ? 180 : 170),
    headTop: story ? 330 : 196,
    floor,
    maxW: story ? 640 : 520,
    faceTop: story ? 380 : 260,
    sizes: story ? { chest: 400, waist: 300, knees: 230, full: 180 } : { chest: 280, waist: 214, knees: 164, full: 124 },
  });

  /* ---- type ---- */
  const title = sentenceCase(content.kicker || "MATCHDAY");
  const tSize = 30 * k * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("  v  ").toUpperCase() || (f.comp || "").toUpperCase();
  const colW = CANVAS_W - 2 * M - (story ? 300 : 250);
  const F_TRACK = 0.18;
  const fixSize = Math.max(11, Math.min(18 * k, colW / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const whenSize = Math.min(21 * k, colW / Math.max(1, textEm(when))) * ts;
  const venue = titleCase(f.venue);
  const venueSize = Math.min(16 * k, colW / Math.max(1, textEm(venue))) * ts;
  const footBottom = (story ? H - STORY_BOTTOM : 62) - (params.textY ?? 0);
  const align: CSSProperties = onLeft ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const line = (size: number, weight: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.15, whiteSpace: "nowrap", color: WHITE, ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* Low sun from his side: the ground warms a touch there and falls away into the shadow side. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at ${onLeft ? 22 : 78}% ${(floor / H) * 100 - 14}%, ${light}, ${ground} 78%)` }} />

      {data.photoUrl && <CastShadow url={data.photoUrl} fig={fig} dir={dir} color={dark} angle={story ? 50 : 54} squash={story ? 0.6 : 0.58} />}
      {/* Contact: a tight dark pool under his boots. */}
      {fig.feet && <div style={{ position: "absolute", left: fig.left + fig.width * 0.2, top: fig.anchorY - 12 * k, width: fig.width * 0.6, height: 22 * k, borderRadius: "50%", background: dark, opacity: 0.6, filter: `blur(${8 * k}px)` }} />}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
      )}
      {/* A photo cut at the waist melts into the ground under the info. */}
      {!fig.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 470, background: `linear-gradient(to bottom, transparent, ${ground}d9 55%, ${ground})` }} />}

      <div style={{ position: "absolute", top: titleTop, ...align, ...line(tSize, 500, { letterSpacing: "-0.01em", lineHeight: 1 }) }}>{title}</div>

      <div style={{ position: "absolute", bottom: footBottom, display: "flex", flexDirection: "column", gap: 10 * k * ts, ...align }}>
        {fixture && <div style={line(fixSize, 600, { letterSpacing: `${F_TRACK}em`, marginBottom: 4 * k })}>{fixture}</div>}
        {when && <div style={line(whenSize, 300, { color: "rgba(255,255,255,.82)" })}>{when}</div>}
        {venue && <div style={line(venueSize, 300, { color: "rgba(255,255,255,.58)" })}>{venue}</div>}
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
