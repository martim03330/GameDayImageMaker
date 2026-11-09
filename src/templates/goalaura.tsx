/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
/** Warm light: the goal version glows peach/gold where `aura` is neutral. */
const WARM = "#ffd9a8";
const GOLD = "#ffb867";

/** Fine grain, just enough to keep the gradients from banding. */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Inter 300 caps: rough advance per 100px. */
const capsEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.26 : /[MW]/.test(c) ? 0.86 : /[I]/.test(c) ? 0.27 : 0.66) + tracking, 0);

/** Hue-safe colour pair from the club, a step brighter than `aura`'s. */
function palette(primary: string, accent: string): [string, string] {
  const p = primary === "#10131c" ? accent : primary;
  let a = vivid(p);
  if (luminance(a) > 0.55 || luminance(a) < 0.03) a = vivid(accent);
  if (luminance(a) > 0.55) a = shade(a, -0.35);
  if (luminance(a) < 0.03) a = shade(a, 0.3);
  let b = vivid(accent);
  const near = Math.abs(luminance(b) - luminance(a)) < 0.04 || luminance(b) > 0.7 || luminance(b) < 0.03;
  if (near) b = shade(a, 0.42);
  return [a, b];
}

/**
 * Goal aura: the goal post of `aura`. A soft grainy mesh of the club colours, warmed and brightened by a
 * peach-gold light bursting behind him, the celebrating player in natural colour with a soft glow, "GOAL"
 * in light wide-tracked caps at the top, and at the foot only his name and the fixture, small.
 */
export function Goalaura({ data }: { data: RenderData }) {
  const { params, content } = data;
  const seed = params.seed ?? 11;
  const r = rng(seed);
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.35 : 1;
  const vy = H / CANVAS_H;
  const [a, b] = palette(params.primary, params.accent);
  const deep = shade(a, -0.5);

  const f = matchFacts(data);

  /* ---- blobs: the club pair, a warm burst behind him, a deeper floor ---- */
  const j = () => (r() - 0.5) * 14;
  const blobs: { x: number; y: number; w: number; h: number; c: string; o: number }[] = [
    { x: 12 + j(), y: 16 + j(), w: 900, h: 820, c: a, o: 0.95 },
    { x: 92 + j(), y: 56 + j(), w: 760, h: 840, c: b, o: 0.9 },
    { x: 56 + j() * 0.4, y: 34 + j() * 0.4, w: 680, h: 680, c: WARM, o: 0.85 },
    { x: 78 + j(), y: 14 + j(), w: 420, h: 420, c: GOLD, o: 0.55 },
    { x: 20 + j(), y: 98 + j(), w: 1000, h: 640, c: deep, o: 0.9 },
  ];

  /* ---- title: always light wide-tracked caps ---- */
  const kicker = (content.kicker || "GOAL").replace(/’/g, "'").toUpperCase();
  const tracking = 0.42;
  const size = Math.min(58 * S * ts, (story ? 900 : 820) / Math.max(1, capsEm(kicker, tracking)));
  const titleTop = (story ? STORY_TOP : 92) + ty;
  const titleBottom = titleTop + size;

  /* ---- player, centred, a fist thrown to the side pulls the figure back to centre ---- */
  const sideShift = params.side === "left" ? -30 : params.side === "right" ? 30 : 0;
  let box = story
    ? placeByFace(data, CANVAS_W / 2 + sideShift, Math.max(470, titleBottom + 140), { chest: 350, waist: 280, knees: 216, full: 170, bust: 380 })
    : placeByFace(data, CANVAS_W / 2 + sideShift, Math.max(280, titleBottom + 100), { chest: 244, waist: 192, knees: 148, full: 116, bust: 266 });
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const glowX = box.left + (face[0] + face[2] / 2) * box.width;
  const glowY = box.top + face[1] * box.height + box.faceH * 1.6;

  /* ---- foot: name, then crests + fixture ---- */
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) !== lc(ours) && t.toUpperCase() === f.opp);
  const opp = typed && typed !== typed.toUpperCase() ? typed : titleCase(f.opp);
  const pair = weHost ? [ours, opp] : [opp, ours];
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const fixture = ours && opp ? `${pair[0]}  v  ${pair[1]}` : "";
  const nameSize = Math.max(18, Math.min(26 * S, (story ? 820 : 760) / Math.max(1, name.length * 0.9))) * ts;
  const fixSize = Math.max(13, Math.min(17 * S, 760 / Math.max(1, fixture.length * 0.56))) * ts;
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const crestS = 30 * S;
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 1px 18px rgba(0,0,0,.2)" };
  // Story: the info block sits ≥ 56px above the ~88px mark, which ends on STORY_BOTTOM.
  const fixTop = story ? STORY_BOTTOM - 88 - 66 - crestS : CANVAS_H - 60 - 52 - 40 - crestS;
  const nameTop = fixTop - (story ? 36 : 30) - nameSize;
  const fadeTo = nameTop - 20 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 300}px, transparent ${fadeTo}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(a, -0.15), color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <filter id="goalaura-clean" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.1" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
      </svg>
      {/* Mesh: big blurred blobs. */}
      <div style={{ position: "absolute", inset: -200, filter: "blur(110px)" }}>
        {blobs.map((bl, i) => (
          <div
            key={i}
            style={{ position: "absolute", left: 200 + (bl.x / 100) * CANVAS_W - bl.w / 2, top: 200 + (bl.y / 100) * H - (bl.h * vy) / 2, width: bl.w, height: bl.h * vy, borderRadius: "50%", background: bl.c, opacity: bl.o }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay" }} />

      {/* The glow: a warm halo behind his head and raised arms. */}
      <div style={{ position: "absolute", left: glowX - 440, top: glowY - 460, width: 880, height: 920, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,240,220,.55), rgba(255,214,170,.18) 58%, transparent)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#goalaura-clean) contrast(1.03) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", lineHeight: 1, ...soft, fontFamily: SANS, fontWeight: 300, fontSize: size, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em` }}>{kicker}</div>

      {/* Foot. */}
      {name && <div style={{ position: "absolute", left: 56, right: 56, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: nameSize, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, ...soft }}>{name}</div>}
      {fixture && (
        <div style={{ position: "absolute", left: 56, right: 56, top: fixTop, height: crestS, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 * S }}>
          {crests[0] && <img src={crests[0]} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
          <span style={{ ...soft, fontFamily: SANS, fontWeight: 300, fontSize: fixSize, letterSpacing: "0.06em", lineHeight: 1 }}>{fixture}</span>
          {crests[1] && <img src={crests[1]} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
        </div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 20} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 60) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.28} />
    </div>
  );
}
