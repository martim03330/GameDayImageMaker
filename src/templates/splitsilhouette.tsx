/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { capsEm, SilhouetteFx } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { twinPair } from "./typesilhouette";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

type Box = { left: number; top: number; width: number; height: number };

/** Ground, light, the flat fill of the twin's solid half and the colour of its drawn half. */
export function splitTones(data: RenderData) {
  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  // The solid half: the club colour, a little quieter than the kit so he still stands in front of it.
  const solid = luminance(club) < 0.06 ? shade(club, 0.04) : shade(club, -0.4);
  return { club, deep, lift, solid, line: "rgba(255,255,255,.82)" };
}

/** His alpha, softened, thresholded and closed so small holes and frayed hair don't break the shape. */
const shape = (
  <>
    <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
    <feComponentTransfer in="s" result="a0">
      <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
    </feComponentTransfer>
    <feMorphology in="a0" operator="dilate" radius={5} result="c1" />
    <feMorphology in="c1" operator="erode" radius={5} result="c2" />
    <feGaussianBlur in="c2" stdDeviation={1.8} result="c3" />
    <feComponentTransfer in="c3" result="a">
      <feFuncA type="discrete" tableValues="0 1" />
    </feComponentTransfer>
  </>
);

/**
 * The split twin: his silhouette cut down its middle (the vertical through his face) — one half a flat solid
 * fill, the other half only its hairline edge (`solidLeft`: which half is solid).
 */
export function SplitTwin({ id, url, twin, H, cut, clipTop, fadeEnd, splitX, solidLeft, solid, line, width = 2 }: { id: string; url: string; twin: Box; H: number; cut?: RenderData["cut"]; clipTop: number; fadeEnd: number; splitX: number; solidLeft: boolean; solid: string; line: string; width?: number }) {
  const fillRect = solidLeft ? { x: -200, width: splitX + 200 } : { x: splitX, width: CANVAS_W + 200 - splitX };
  const lineRect = solidLeft ? { x: splitX, width: CANVAS_W + 200 - splitX } : { x: -200, width: splitX + 200 };
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - 280)}px, transparent ${Math.round(fadeEnd)}px)`;
  return (
    <div data-bleed style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }} aria-hidden>
      <SilhouetteFx id={`${id}-fill`} url={url} box={twin} H={H} clipTop={clipTop} cut={cut} pad={12} mask={<rect {...fillRect} y={-200} height={H + 400} fill="#fff" />}>
        {shape}
        <feFlood floodColor={solid} />
        <feComposite in2="a" operator="in" />
      </SilhouetteFx>
      <SilhouetteFx id={`${id}-line`} url={url} box={twin} H={H} clipTop={clipTop} cut={cut} pad={12} mask={<rect {...lineRect} y={-200} height={H + 400} fill="#fff" />}>
        {shape}
        <feMorphology in="a" operator="dilate" radius={width} result="d" />
        <feComposite in="d" in2="a" operator="out" result="ring" />
        <feGaussianBlur in="ring" stdDeviation={0.35} result="q" />
        <feFlood floodColor={line} />
        <feComposite in2="q" operator="in" />
      </SilhouetteFx>
    </div>
  );
}

/**
 * twinPair, and the pair then scaled down about the centre line at face height (never below 76%) until the
 * twin's outer edge — a raised fist included, the cutouts are cropped to him — stays `margin` inside the canvas.
 * (Sizes alone can't do it: the figure is sized to reach the canvas bottom.)
 */
export function fittedPair(data: RenderData, o: Parameters<typeof twinPair>[1], margin = 28) {
  const pair = twinPair(data, o);
  const { box, twin } = pair;
  if (o.onLeft ? data.cut?.right : data.cut?.left) return pair;
  const over = o.onLeft ? twin.left + twin.width - (CANVAS_W - margin) : margin - twin.left;
  if (over <= 1) return pair;
  const reach = o.onLeft ? twin.left + twin.width - CANVAS_W / 2 : CANVAS_W / 2 - twin.left;
  const sc = Math.max(0.76, 1 - over / Math.max(1, reach));
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const ay = box.top + face[1] * box.height;
  const fit = (b: Box): Box => ({ left: CANVAS_W / 2 + (b.left - CANVAS_W / 2) * sc, top: ay + (b.top - ay) * sc, width: b.width * sc, height: b.height * sc });
  return { ...pair, box: fit(box), twin: fit(twin) };
}

/** The vertical through the twin's face: where his silhouette is split. */
export function faceAxis(data: RenderData, twin: Box) {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  return twin.left + (face[0] + face[2] / 2) * twin.width;
}

/**
 * Split silhouette: the player in natural colour on a deep, clean club-tone ground, and beside him a twin of
 * his silhouette (same size, offset to the free side) split down its middle — the half nearer him a flat
 * solid club-tone fill, the outer half only a white hairline: half filled, half drawn. The title small at the
 * top; crests, the fixture (home first, names exactly as stored) and date · kick-off · ground small at the
 * foot. Flips with params.side.
 */
export function Splitsilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 41);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const { deep, lift, solid, line } = splitTones(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + (story ? 44 : 30);

  /* ---- the pair ---- */
  const { box, twin } = fittedPair(data, {
    onLeft,
    faceTop: story ? 420 : 270,
    sizes: story ? { chest: 320, waist: 254, knees: 190, full: 138 } : { chest: 262, waist: 206, knees: 156, full: 120 },
    minHead: titleTop + tSize + (story ? 80 : 56),
    twinMinHead: clipTop + 16,
    lift: story ? 36 : 26,
    // The story is narrow for its height: the pair sits closer so the twin's outer arm stays in frame.
    maxOff: story ? 270 : undefined,
  });

  /* ---- foot ---- */
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo (~88px) ends at STORY_BOTTOM (top 1592); the date line ends 64px above it.
  const whenTop = (story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize) - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 40 * k;
  const crestTop = fixTop - CR - 28 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && <SplitTwin id="splitsilhouette" url={data.photoUrl} twin={twin} H={H} cut={data.cut} clipTop={clipTop} fadeEnd={crestTop - 30 * k} splitX={faceAxis(data, twin)} solidLeft={onLeft} solid={solid} line={line} />}

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 32%, ${deep} 55%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
