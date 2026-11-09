/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { capsEm, frontBox, type Box } from "./giantsilhouette";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import type { CutEdges } from "@/lib/types";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** The cutout's alpha as a mask, intersected with fades along any edge where the photo frame cut him. */
function silhouetteMask(url: string, cut: CutEdges | undefined): CSSProperties {
  const layers = [`url("${url}")`];
  const fade = (d: string, a: number) => `linear-gradient(${d}, transparent 0%, #000 ${a}%)`;
  if ((cut?.bottom ?? 0) > 0) layers.push(fade("to top", 22));
  if ((cut?.top ?? 0) > 0) layers.push(fade("to bottom", 8));
  if ((cut?.left ?? 0) > 0) layers.push(fade("to right", 16));
  if ((cut?.right ?? 0) > 0) layers.push(fade("to left", 16));
  const m = layers.join(", ");
  const size = layers.map(() => "100% 100%").join(", ");
  return {
    WebkitMaskImage: m,
    maskImage: m,
    WebkitMaskSize: size,
    maskSize: size,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    ...(layers.length > 1 ? { WebkitMaskComposite: "source-in", maskComposite: "intersect" } : {}),
  } as CSSProperties;
}

/**
 * Goal line silhouette: the celebrating player in natural colour on a deep, clean club-tone ground, and
 * behind him ONE twin of his own silhouette — a touch larger, offset to one side and up — filled only with
 * fine horizontal hairlines in the club colour or white, like a line-screen print of the moment. "Goal" small
 * at the top; his name and the fixture (home first, names exactly as stored, never the score) small at the
 * foot. Flips with params.side.
 */
export function Goallinesilhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 29);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side !== "right";
  const dir = onLeft ? 1 : -1;

  const club = clubTone(data);
  const deep = shade(club, -0.82);
  const lift = shade(club, -0.66);
  const whiteLines = r() < 0.45;
  const lineColor = whiteLines ? "rgba(255,255,255,.62)" : luminance(club) < 0.12 ? shade(club, 0.45) : shade(club, 0.2);

  /* ---- title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.6;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const titleBottom = titleTop + tSize;

  /* ---- the player, and his line-screen twin behind ---- */
  let box: Box = frontBox(data, 540 - dir * (story ? 70 : 60), story ? 580 : 420, story ? { chest: 320, waist: 250, knees: 190, full: 150 } : { chest: 250, waist: 192, knees: 148, full: 116 }, story ? H - 150 : undefined);
  const S = 1.14;
  const dx = dir * (story ? 120 : 100);
  const dy = -(story ? 70 : 54);
  const twinOf = (b: Box): Box => ({ left: b.left - (b.width * (S - 1)) / 2 + dx, top: b.top - (b.height * (S - 1)) / 2 + dy, width: b.width * S, height: b.height * S });
  // The pair (his raised fist and the twin's) fits across the canvas: shrink him about his face if not.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const span = (b: Box) => Math.max(b.left + b.width, twinOf(b).left + twinOf(b).width) - Math.min(b.left, twinOf(b).left);
  const room = CANVAS_W - 2 * 36;
  if (span(box) > room) {
    const sc = Math.max(0.6, (room - Math.abs(dx)) / (span(box) - Math.abs(dx)));
    const fx = box.left + (face[0] + face[2] / 2) * box.width;
    const fy = box.top + face[1] * box.height;
    box = { left: fx - (face[0] + face[2] / 2) * box.width * sc, top: fy - face[1] * box.height * sc, width: box.width * sc, height: box.height * sc };
  }
  // ...and sits centred as a pair.
  {
    const t = twinOf(box);
    const l = Math.min(box.left, t.left);
    const rgt = Math.max(box.left + box.width, t.left + t.width);
    const shift = Math.max(36 - l, Math.min(CANVAS_W - 36 - rgt, (CANVAS_W - (l + rgt)) / 2));
    box = { ...box, left: box.left + shift };
  }
  // The twin's top (a raised fist) and his own stay clear of the title.
  const minTop = titleBottom + (story ? 70 : 50);
  const push = Math.max(0, minTop - Math.min(twinOf(box).top, box.top));
  box = { ...box, top: box.top + push };
  const twin = twinOf(box);

  // Hairlines: fixed pixel pitch across the canvas so every line is crisp.
  const lw = story ? 2 : 1.6;
  const pitch = story ? 8 : 6.4;
  const lines = `repeating-linear-gradient(to bottom, ${lineColor} 0px, ${lineColor} ${lw}px, transparent ${lw}px, transparent ${pitch}px)`;

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
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at ${50 + dir * 8}% 38%, ${lift}, ${deep} 80%)` }} />

      {/* The twin: his silhouette, larger and offset, filled with hairlines (the lines stay put; the cutout masks them). */}
      {data.photoUrl && (
        <div data-bleed style={{ position: "absolute", left: twin.left, top: twin.top, width: twin.width, height: twin.height, ...silhouetteMask(data.photoUrl, data.cut) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: -(twin.top % pitch), bottom: 0, background: lines }} />
        </div>
      )}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 480, background: story ? `linear-gradient(to bottom, transparent, ${deep}e6 40%, ${deep} 58%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK), color: "rgba(255,255,255,.72)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
