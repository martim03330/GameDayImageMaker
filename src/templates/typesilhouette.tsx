/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm, mirrorTones } from "./mirrorecho";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

export type Box = { left: number; top: number; width: number; height: number };

/**
 * The player and his twin: the same cutout, same orientation, offset sideways to the free side (and a touch
 * up), the pair centred on the canvas. `grow` scales the twin about the player's face (1 = same size).
 * The top of the hair (or, with `wholeTop`, of the whole cutout: a raised fist) stays under `minHead`.
 */
export function twinPair(data: RenderData, o: { onLeft: boolean; faceTop: number; sizes: Record<string, number>; minHead: number; wholeTop?: boolean; spread?: number; lift?: number; grow?: number; maxOff?: number; twinMinHead?: number }): { box: Box; twin: Box; dir: number } {
  const dir = o.onLeft ? 1 : -1;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const probe = placeByFace(data, 540, o.faceTop, o.sizes);
  const off = Math.max(170, Math.min(o.maxOff ?? 320, probe.width * (o.spread ?? 0.44)));
  let box: Box = { ...probe, left: probe.left - dir * off * 0.5 };
  // His outer edge (a raised fist) stays on the canvas — unless the photo frame itself cut him there:
  // shrink him around his face (never below 72%).
  const frameCut = (o.onLeft ? data.cut?.left : data.cut?.right) ?? 0;
  if (!frameCut) {
    const fcx = box.left + (face[0] + face[2] / 2) * box.width;
    const fcy = box.top + face[1] * box.height;
    const room = o.onLeft ? fcx - 24 : CANVAS_W - 24 - fcx;
    const reach = o.onLeft ? fcx - box.left : box.left + box.width - fcx;
    if (reach > room && reach > 0) {
      const sc = Math.max(0.72, room / reach);
      box = { left: fcx - (fcx - box.left) * sc, top: fcy - (fcy - box.top) * sc, width: box.width * sc, height: box.height * sc };
    }
  }
  const head = o.wholeTop ? box.top : box.top + Math.max(0, face[1] - face[3]) * box.height;
  if (head < o.minHead) box = { ...box, top: box.top + o.minHead - head };
  const g = o.grow ?? 1;
  const fx = box.left + (face[0] + face[2] / 2) * box.width;
  const fy = box.top + face[1] * box.height;
  const twin: Box = {
    left: fx - (face[0] + face[2] / 2) * box.width * g + dir * off,
    top: fy - face[1] * box.height * g - (o.lift ?? 0),
    width: box.width * g,
    height: box.height * g,
  };
  // The twin's hair stays under the clip line too (it rises less rather than being sliced flat).
  if (o.twinMinHead != null) {
    const th = twin.top + Math.max(0, face[1] - face[3]) * twin.height;
    if (th < o.twinMinHead) twin.top += o.twinMinHead - th;
  }
  return { box, twin, dir };
}

const footFade = (end: number) => `linear-gradient(to bottom, transparent 0px, #000 24px, #000 ${Math.round(end - 300)}px, transparent ${Math.round(end)}px)`;

/** A layer the shape of his silhouette: `children` masked by the cutout's own alpha (and the photo frame's cuts faded). */
export function SilhouetteFill({ url, twin, cut, clipTop, fadeEnd, H, children, base }: { url: string; twin: Box; cut?: RenderData["cut"]; clipTop: number; fadeEnd: number; H: number; children: ReactNode; base?: string }) {
  const layers = [`url("${url}")`];
  const fade = (dir: string, a: number) => `linear-gradient(${dir}, transparent 0%, #000 ${Math.round(a * 100)}%)`;
  if ((cut?.bottom ?? 0) > 0) layers.push(fade("to top", 0.16));
  if ((cut?.top ?? 0) > 0) layers.push(fade("to bottom", 0.07));
  if ((cut?.left ?? 0) > 0) layers.push(fade("to right", 0.2));
  if ((cut?.right ?? 0) > 0) layers.push(fade("to left", 0.2));
  const m = layers.join(", ");
  const mask = {
    WebkitMaskImage: m,
    maskImage: m,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskComposite: layers.length > 1 ? "source-in" : undefined,
    maskComposite: layers.length > 1 ? "intersect" : undefined,
  } as CSSProperties;
  return (
    // The twin dissolves well above the foot's text (fadeEnd, canvas y).
    <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: clipTop, height: H - clipTop, overflow: "hidden", WebkitMaskImage: footFade(fadeEnd - clipTop), maskImage: footFade(fadeEnd - clipTop) }} aria-hidden>
      <div style={{ position: "absolute", left: twin.left, top: twin.top - clipTop, width: twin.width, height: twin.height, overflow: "hidden", ...mask }}>
        {base && <div style={{ position: "absolute", inset: 0, background: base }} />}
        {children}
      </div>
    </div>
  );
}

/** Tiny tracked caps, the same phrase over and over, each line starting a little further along. */
export function WordFill({ phrase, size, color, width, height }: { phrase: string; size: number; color: string; width: number; height: number }) {
  const lh = size * 1.42;
  const n = Math.ceil(height / lh) + 1;
  const per = Math.max(1, Math.ceil((width * 1.3) / Math.max(1, capsEm(phrase, 0.24) * size)) + 1);
  const run = Array(per + 1).fill(phrase).join(" ");
  const step = Math.max(5, Math.round(phrase.length * 0.37));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height, fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: `${lh}px`, letterSpacing: "0.24em", color, whiteSpace: "nowrap" }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ height: lh }}>
          {run.slice((i * step) % phrase.length)}
        </div>
      ))}
    </div>
  );
}

/** The word colour: white, or the club colour lifted to read on its own deep ground. */
export function wordTone(data: RenderData, white: boolean) {
  const t = mirrorTones(data, white);
  return { ...t, word: white ? "rgba(255,255,255,.62)" : t.line };
}

/**
 * Type silhouette: the player in natural colour on a deep, clean club-tone ground, and beside him a second
 * copy of his silhouette — same size, offset to the free side — made only of tiny tracked caps of the match
 * information (MATCHDAY · HOME V AWAY · DATE · KICK-OFF · GROUND), so the twin reads as a shape made of words.
 * The title small at the top, the fixture and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Typesilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 29);
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
    lift: (story ? 36 : 26),
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

  /* ---- the words that make the twin ---- */
  const phrase = [title, teams.join(" v "), date, f.time, f.venue].filter(Boolean).join(" · ").toUpperCase() + " ·";

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && (
        <SilhouetteFill url={data.photoUrl} twin={twin} cut={data.cut} clipTop={titleTop + tSize + (story ? 44 : 30)} fadeEnd={fixTop - (story ? 50 : 36)} H={H} base={`${club}26`}>
          <WordFill phrase={phrase} size={(story ? 13.5 : 11) * ts} color={word} width={twin.width} height={twin.height} />
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
