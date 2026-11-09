/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const NEUTRAL = "#f3eee8";

/** Fine grain, just enough to keep the gradients from banding. */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Inter 300 caps: rough advance per 100px. */
const capsEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.26 : /[MW]/.test(c) ? 0.86 : /[I]/.test(c) ? 0.27 : 0.66) + tracking, 0);
/** DM Serif italic, rough. */
const serifEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].length * 0.5;

/** Hue-safe colour pair from the club: a vivid main tone and a second one (accent or a lighter step). */
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
 * Aura: a soft, grainy mesh gradient — three or four large blurred blobs in the club colours and a warm
 * neutral light behind his shoulders — the player in natural colour with a faint glow, a small title in
 * light wide-tracked caps (or serif italic, by seed) centred at the top, and two calm lines at the foot.
 */
export function Aura({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 11;
  const r = rng(seed);
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  // Native story (1080×1920): the mesh fills the tall frame, the title starts at STORY_TOP,
  // the two foot lines and the mark end at STORY_BOTTOM; type and player a size up.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.35 : 1;
  const vy = H / CANVAS_H;
  const [a, b] = palette(params.primary, params.accent);
  const deep = shade(a, -0.62);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- blobs: positions drift a little by seed ---- */
  const j = () => (r() - 0.5) * 14;
  const blobs: { x: number; y: number; w: number; h: number; c: string; o: number }[] = [
    { x: 14 + j(), y: 14 + j(), w: 900, h: 820, c: a, o: 0.95 },
    { x: 92 + j(), y: 52 + j(), w: 720, h: 820, c: b, o: 0.9 },
    { x: 62 + j() * 0.5, y: 30 + j() * 0.5, w: 560, h: 600, c: NEUTRAL, o: 0.7 },
    { x: 18 + j(), y: 96 + j(), w: 1000, h: 720, c: deep, o: 0.95 },
  ];

  /* ---- title ---- */
  const serif = seed % 2 === 0;
  const kicker = (content.kicker || "MATCHDAY").replace(/’/g, "'").toUpperCase();
  const tracking = 0.34;
  let size = (serif ? 82 : 46) * S * ts;
  const titleText = serif ? kicker.charAt(0) + kicker.slice(1).toLowerCase() : kicker;
  const em = serif ? serifEm(titleText) : capsEm(titleText, tracking);
  size = Math.min(size, (story ? 900 : 820) / Math.max(1, em));
  const titleTop = (story ? STORY_TOP : 92) + ty;
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(12, Math.min(15, 700 / Math.max(1, comp.length * 0.78))) * S;
  const titleBottom = titleTop + size * (serif ? 1.05 : 1) + (comp ? 44 * S : 0);

  /* ---- player, centred ---- */
  const sideShift = params.side === "left" ? -30 : params.side === "right" ? 30 : 0;
  const box = story
    ? placeByFace(data, CANVAS_W / 2 + sideShift, Math.max(480, titleBottom + 100), { chest: 345, waist: 275, knees: 212, full: 166, bust: 370 })
    : placeByFace(data, CANVAS_W / 2 + sideShift, Math.max(300, titleBottom + 90), { chest: 238, waist: 186, knees: 144, full: 112, bust: 260 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const glowX = box.left + (face[0] + face[2] / 2) * box.width;
  const glowY = box.top + face[1] * box.height + box.faceH * 1.6;

  /* ---- foot ---- */
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed && typed !== typed.toUpperCase() ? typed : titleCase(f.opp);
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const line1 = opp ? (hasScore ? `${pair[0]}   ${score}   ${pair[1]}` : `${pair[0]}  v  ${pair[1]}`) : [content.firstName, content.lastName].filter(Boolean).join(" ");
  const line2 = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const l1Size = Math.max(18, Math.min(26 * S, (story ? 800 : 760) / Math.max(1, line1.length * 0.56))) * ts;
  const l2Size = Math.max(13, Math.min(17 * S, 900 / Math.max(1, line2.length * 0.56)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 1px 18px rgba(0,0,0,.18)" };
  const footTop = story ? STORY_BOTTOM - 88 - 66 - (line2 ? Math.round(l2Size) + 58 * S : Math.round(l1Size)) : CANVAS_H - 64 - 24 - 44 - 74;
  const fadeTo = footTop - 20 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 280}px, transparent ${fadeTo}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(a, -0.25), color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        {/* Drops the faint haze some cutouts carry around the figure. */}
        <filter id="aura-clean" colorInterpolationFilters="sRGB">
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
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.14, mixBlendMode: "overlay" }} />

      {/* A very soft glow behind his head and shoulders. */}
      <div style={{ position: "absolute", left: glowX - 360, top: glowY - 340, width: 720, height: 760, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,250,244,.42), rgba(255,250,244,.12) 60%, transparent)" }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#aura-clean) contrast(1.02)", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Title. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: titleTop,
          textAlign: "center",
          lineHeight: 1,
          ...soft,
          ...(serif
            ? { fontFamily: DMSERIF, fontStyle: "italic", fontSize: size, letterSpacing: "-0.005em" }
            : { fontFamily: SANS, fontWeight: 300, fontSize: size, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em` }),
        }}
      >
        {titleText}
      </div>
      {comp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: titleTop + size * (serif ? 1.05 : 1) + 22, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: compSize, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", lineHeight: 1, opacity: 0.85, ...soft }}>
          {comp}
        </div>
      )}

      {/* Foot: crests either side of the fixture, then the date line. */}
      <div style={{ position: "absolute", left: 56, right: 56, top: footTop, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * S }}>
        {crests[0] && <img src={crests[0]} alt="" style={{ width: 38 * S, height: 38 * S, objectFit: "contain" }} />}
        <span style={{ ...soft, fontFamily: SANS, fontWeight: 400, fontSize: l1Size, letterSpacing: "0.02em", lineHeight: 1 }}>{line1}</span>
        {crests[1] && <img src={crests[1]} alt="" style={{ width: 38 * S, height: 38 * S, objectFit: "contain" }} />}
      </div>
      {line2 && (
        <div style={{ position: "absolute", left: 56, right: 56, top: footTop + 58 * S, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: l2Size, letterSpacing: "0.08em", lineHeight: 1, opacity: 0.9, ...soft }}>{line2}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 20} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 60) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.3} />
    </div>
  );
}
