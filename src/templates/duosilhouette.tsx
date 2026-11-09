/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { SilhouetteFx, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * The trio: the player centred (his face on the centre line) and two twins of his silhouette at the same size
 * and height, one each side at the same distance. The whole trio — a raised fist on the outer twin included —
 * stays inside the canvas (`maxHalf` from the centre): he is shrunk around his face when it would not.
 * The top of his hair (or, with `wholeTop`, of the whole cutout) stays under `minHead`.
 */
export function trioBoxes(data: RenderData, o: { faceTop: number; sizes: Record<string, number>; minHead: number; maxHalf: number; floor: number; spread?: number; wholeTop?: boolean }): { box: Box; left: Box; right: Box; off: number } {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fx = face[0] + face[2] / 2;
  let box: Box = placeByFace(data, 540, o.faceTop, o.sizes);
  const offOf = (b: Box) => Math.max(150, Math.min(300, b.width * (o.spread ?? 0.36)));
  // The trio is balanced on the figure (the cutout's box — a raised fist included), not on his face alone;
  // his face stays within 110px of the centre line.
  const fcx = 540 + (data.params.playerX ?? 0);
  const fy = box.top + face[1] * box.height;
  const sized = (w: number, h: number): Box => ({ left: fcx - fx * w - Math.max(-110, Math.min(110, (0.5 - fx) * w)), top: fy - face[1] * h, width: w, height: h });
  box = sized(box.width, box.height);
  for (let i = 0; i < 4; i++) {
    const off = offOf(box);
    const half = Math.max(fcx - box.left, box.left + box.width - fcx) + off;
    if (half <= o.maxHalf + 1) break;
    const sc = Math.max(0.55, (o.maxHalf - off) / Math.max(1, half - off));
    box = sized(box.width * sc, box.height * sc);
  }
  // A full figure shrunk to fit ends inside the canvas: his feet stay above the foot's text (shrink a little more).
  const H = data.canvasH ?? CANVAS_H;
  const bottom = box.top + box.height;
  if (!(data.cut?.bottom ?? 0) && bottom > o.floor && bottom < H + 20) {
    const sc = Math.max(0.84, (o.floor - fy) / Math.max(1, bottom - fy));
    box = sized(box.width * sc, box.height * sc);
  }
  const head = o.wholeTop ? box.top : box.top + Math.max(0, face[1] - face[3]) * box.height;
  if (head < o.minHead) box = { ...box, top: box.top + o.minHead - head };
  const off = offOf(box);
  return { box, left: { ...box, left: box.left - off }, right: { ...box, left: box.left + off }, off };
}

/** Filter primitives: his alpha, smoothed, closed (small holes and gaps under the arms fill in), thresholded. */
function solidAlpha(close: number): ReactNode[] {
  return [
    <feGaussianBlur key="s" in="SourceAlpha" stdDeviation={1.6} result="s" />,
    <feComponentTransfer key="a0" in="s" result="a0">
      <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
    </feComponentTransfer>,
    <feMorphology key="c1" in="a0" operator="dilate" radius={close} result="c1" />,
    <feMorphology key="c2" in="c1" operator="erode" radius={close} result="c2" />,
    <feGaussianBlur key="c3" in="c2" stdDeviation={1.8} result="c3" />,
    <feComponentTransfer key="a" in="c3" result="a">
      <feFuncA type="discrete" tableValues="0 1" />
    </feComponentTransfer>,
  ];
}

/** His silhouette as one flat colour. */
export function solidFx(color: string): ReactNode {
  return [
    ...solidAlpha(3),
    <feGaussianBlur key="aa" in="a" stdDeviation={0.5} result="aa" />,
    <feFlood key="f" floodColor={color} result="f" />,
    <feComposite key="o" in="f" in2="aa" operator="in" />,
  ];
}

/** His silhouette as a hairline of `w` px. */
export function lineFx(color: string, w: number): ReactNode {
  return [
    ...solidAlpha(6),
    <feMorphology key="d" in="a" operator="dilate" radius={w} result="d" />,
    <feComposite key="r" in="d" in2="a" operator="out" result="r" />,
    <feGaussianBlur key="q" in="r" stdDeviation={0.35} result="q" />,
    <feFlood key="f" floodColor={color} result="f" />,
    <feComposite key="o" in="f" in2="q" operator="in" />,
  ];
}

/** The ground rising over the three figures' legs: clear at `top`, the plain ground from `end` (above the crests) down. */
export function FootFade({ top, end, H, deep }: { top: number; end: number; H: number; deep: string }) {
  const len = Math.max(60, end - top);
  return <div style={{ position: "absolute", left: 0, right: 0, top, height: H - top, background: `linear-gradient(to bottom, transparent 0px, ${deep}99 ${Math.round(len * 0.45)}px, ${deep}e8 ${Math.round(len * 0.8)}px, ${deep} ${Math.round(len)}px)` }} />;
}

/** The solid twin goes to the side where the photo frame cut him least (a cut edge fades out), else by seed. */
export function solidSide(data: RenderData, roll: number): boolean {
  const l = data.cut?.left ?? 0;
  const rt = data.cut?.right ?? 0;
  return Math.abs(l - rt) > 0.05 ? l < rt : roll < 0.5;
}

/** Ground, light, the solid twin's tone (a darker club tone that still reads on the ground) and the hairline. */
export function duoTones(data: RenderData, whiteLine: boolean) {
  const club = clubTone(data);
  const deep = shade(club, -0.82);
  const lift = shade(club, -0.64);
  const solid = luminance(club) < 0.1 ? shade(club, -0.22) : shade(club, -0.56);
  const line = whiteLine ? "rgba(255,255,255,.72)" : luminance(club) < 0.12 ? shade(club, 0.45) : shade(club, 0.2);
  return { club, deep, lift, solid, line };
}

/** The two twins behind him: one solid, one hairline. */
export function Twins({ id, data, left, right, solidLeft, solid, line, H, clipTop, k }: { id: string; data: RenderData; left: Box; right: Box; solidLeft: boolean; solid: string; line: string; H: number; clipTop: number; k: number }) {
  if (!data.photoUrl) return null;
  const sBox = solidLeft ? left : right;
  const lBox = solidLeft ? right : left;
  return (
    <>
      <SilhouetteFx id={`${id}-s`} url={data.photoUrl} box={sBox} H={H} clipTop={clipTop} cut={data.cut} pad={12}>
        {solidFx(solid)}
      </SilhouetteFx>
      <SilhouetteFx id={`${id}-l`} url={data.photoUrl} box={lBox} H={H} clipTop={clipTop} cut={data.cut} pad={16}>
        {lineFx(line, k > 1 ? 2 : 1.6)}
      </SilhouetteFx>
    </>
  );
}

/**
 * Duo silhouette: the player in natural colour, centred on a deep, clean club-tone ground, flanked
 * symmetrically by two twins of his own silhouette at the same size, partly behind him — one a flat solid
 * in a darker club tone, the other only a hairline (sides by seed): a balanced trio. The title small at the
 * top; crests, the fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Duosilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 31);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const solidLeft = solidSide(data, r());
  const { deep, lift, solid, line } = duoTones(data, r() < 0.5);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + (story ? 44 : 30);

  /* ---- foot: crests, fixture, date · kick-off · ground ---- */
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(18 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // The logo (52px post / 88px story) ends at its bottom line; the foot ends ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 40 * k;
  const crestTop = fixTop - CR - 28 * k;

  /* ---- the trio ---- */
  const { box, left, right } = trioBoxes(data, {
    faceTop: story ? 430 : 280,
    sizes: story ? { chest: 300, waist: 236, knees: 178, full: 136 } : { chest: 240, waist: 190, knees: 144, full: 110 },
    minHead: titleTop + tSize + (story ? 80 : 60),
    maxHalf: 516,
    floor: crestTop - (story ? 70 : 50),
  });

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 52% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 80%)` }} />

      <Twins id="duosilhouette" data={data} left={left} right={right} solidLeft={solidLeft} solid={solid} line={line} H={H} clipTop={clipTop} k={k} />

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <FootFade top={crestTop - (story ? 470 : 340)} end={crestTop - 12 * k} H={H} deep={deep} />

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
      <Film strength={0.16} />
    </div>
  );
}
