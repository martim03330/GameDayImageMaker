/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film, type Box } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { crestsOf, placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** Inter 800 capitals: advance widths per 100px (approximate, a touch generous). */
const I800: Record<string, number> = { A: 77, B: 70, C: 75, D: 76, E: 62, F: 60, G: 78, H: 78, I: 31, J: 60, K: 74, L: 59, M: 95, N: 78, O: 79, P: 68, Q: 79, R: 70, S: 68, T: 68, U: 76, V: 77, W: 106, X: 75, Y: 74, Z: 68, " ": 26, "-": 50, "'": 30, "!": 33 };
export const heavyEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (I800[c] ?? (/\d/.test(c) ? 66 : 72)) / 100, 0);
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/**
 * placeByFace, pushed down until the top of his head (hair, ~0.8 face-height above the face box — or the top
 * of the cutout when `byOutline`) clears `headLimit`. Celebrations pass byOutline=false so raised arms may run up.
 */
export function placeClear(data: RenderData, sizes: Record<string, number>, faceTop: number, headLimit: number, byOutline = true) {
  const fy = data.face?.[1] ?? 0.08;
  let box = placeByFace(data, 540, faceTop, sizes);
  for (let i = 0; i < 6; i++) {
    const hair = box.top + fy * box.height - 0.8 * box.faceH;
    const head = byOutline ? Math.max(box.top, hair) : hair;
    if (head >= headLimit - 1) break;
    faceTop += headLimit - head;
    box = placeByFace(data, 540, faceTop, sizes);
  }
  return box;
}

/**
 * One heavy Inter 800 word drawn twice: `ground` colour everywhere, then — clipped to the letters — his cutout
 * reduced to two flat tones by its own luminance (`onDark` where his kit/skin is dark, `onLight` where it is
 * light; averaged over a wide blur first so stripes, folds and sponsors don't speckle — big flat areas), his alpha kept. So inside his silhouette the letters
 * switch colour, always contrasting with what they cross, and the word stays whole.
 */
export function TwoToneWord(props: { id: string; word: string; base: number; width: number; size: number; H: number; k: number; photoUrl: string | null; box: Box; ground: string; onDark: string; onLight: string; threshold?: number }) {
  const { word, base, width, size, H, k, photoUrl, box } = props;
  // Unique per instance (a grid may show several of these on one page): hash of what makes it differ.
  const key = `${photoUrl}|${word}|${H}|${Math.round(base)}|${Math.round(box.left)}`;
  let hsh = 0;
  for (let i = 0; i < key.length; i++) hsh = (hsh * 31 + key.charCodeAt(i)) | 0;
  const id = `${props.id}-${(hsh >>> 0).toString(36)}`;
  const BINS = 20;
  const cut = Math.round((props.threshold ?? 0.34) * BINS);
  const rgb = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.replace("#", "").padEnd(6, "0").slice(i, i + 2), 16) / 255);
  const [dr, dg, db] = rgb(props.onDark);
  const [lr, lg, lb] = rgb(props.onLight);
  const tone = (light: number, dark: number) => Array.from({ length: BINS }, (_, i) => (i < cut ? dark : light).toFixed(3)).join(" ");
  const text = (fill: string) => (
    <text x={540} y={base} textAnchor="middle" textLength={width} lengthAdjust="spacing" fontFamily={SANS} fontWeight={800} fontSize={size} fill={fill}>
      {word}
    </text>
  );
  return (
    <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
      <defs>
        <clipPath id={`${id}-word`}>{text(WHITE)}</clipPath>
        <filter id={`${id}-tone`} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={24 * k} result="b" />
          <feColorMatrix in="b" type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" result="g" />
          <feComponentTransfer in="g" result="t">
            <feFuncR type="discrete" tableValues={tone(lr, dr)} />
            <feFuncG type="discrete" tableValues={tone(lg, dg)} />
            <feFuncB type="discrete" tableValues={tone(lb, db)} />
          </feComponentTransfer>
          <feComposite in="t" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      {text(props.ground)}
      {photoUrl && (
        <g clipPath={`url(#${id}-word)`}>
          <image href={photoUrl} x={box.left} y={box.top} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-tone)`} />
        </g>
      )}
    </svg>
  );
}

/**
 * Twotone: the player in natural colour on a deep, clean club ground and one heavy word — "MATCHDAY" in
 * Inter 800 — running edge to edge across his chest, in front of him. Where the letters cross his
 * silhouette they switch colour — white over the ground; over him the club colour where his kit is dark,
 * the deep ground tone where it is light (TwoToneWord: the second copy is his own cutout, clipped to the
 * letters and reduced to two flat tones) — so the word stays whole and readable but reads as part of him.
 * Competition small at the top; fixture, date · kick-off · ground small at the foot.
 */
export function Twotone({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;

  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.58);
  // Over him the letters turn two-tone from his own pixels: the club colour where his kit/skin is dark, the deep
  // ground tone where it is light — so the switch always reads against white letters on the ground.
  let onDark = club;
  if (luminance(onDark) < 0.1) onDark = shade(onDark, 0.35);

  const f = matchFacts(data);

  /* ---- the top line ---- */
  const top = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const T_TRACK = 0.36;
  const tSize = Math.max(11, Math.min(15 * k, (CANVAS_W - 2 * M) / Math.max(1, capsEm(top, T_TRACK)))) * ts;
  const titleTop = story ? STORY_TOP : 84;

  /* ---- the player: hair clear of the top line ---- */
  const sizes = story ? { chest: 340, waist: 280, knees: 210, full: 160 } : { chest: 260, waist: 206, knees: 156, full: 118 };
  const box = placeClear(data, sizes, story ? 360 : 250, titleTop + tSize + (story ? 56 : 44));
  const faceY = box.top + (data.face?.[1] ?? 0.08) * box.height;
  const chin = faceY + box.faceH;

  /* ---- the word ---- */
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const wordW = CANVAS_W - 2 * (story ? 52 : 56);
  const wSize = Math.min((story ? 300 : 250) * ts, wordW / Math.max(1, heavyEm(word) * 0.99));
  const capH = wSize * 0.727;
  const textW = Math.min(wordW, heavyEm(word) * wSize * 0.99);

  /* ---- the foot ---- */
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (teams[0] ?? f.comp ?? "");
  const F_TRACK = 0.22;
  const crests = crestsOf(data).slice(0, 2);
  const CR = 40 * k;
  const crestRoom = crests.length === 2 ? 2 * (CR + 26 * k) : 0;
  const fixSize = Math.max(11, Math.min(17 * k, (CANVAS_W - 2 * M - crestRoom) / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(13, Math.min(19 * k, (CANVAS_W - 2 * M) / Math.max(1, when.length * 0.5))) * ts;
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const whenTop = logoTop - (story ? 66 : 50) - whenSize * 1.2;
  const footTop = whenTop - 22 * k - CR;

  // The word across his chest, below the chin, kept clear of the foot.
  const wordTop = Math.max(chin + box.faceH * 0.5, Math.min(chin + box.faceH * 0.62, footTop - 120 * k - capH)) + (params.textY ?? 0);
  const base = wordTop + capH;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 50% at 50% ${story ? 38 : 40}%, ${lift}, ${deep} 82%)` }} />

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - footTop + (story ? 260 : 200), background: `linear-gradient(to bottom, transparent, ${deep}e6 45%, ${deep} 70%)` }} />

      {/* The word, twice: white on the ground, the deep tone where it crosses him (masked by his cutout). */}
      <TwoToneWord id="twotone" word={word} base={base} width={textW} size={wSize} H={H} k={k} photoUrl={data.photoUrl} box={box} ground={WHITE} onDark={onDark} onLight={deep} />

      {/* Top: competition, small. */}
      {top && <div style={{ position: "absolute", left: M, right: M, top: titleTop, ...caps(tSize, T_TRACK, 500), color: "rgba(255,255,255,.82)" }}>{top}</div>}

      {/* Foot: crests either side of the fixture, then date · kick-off · ground. */}
      <div style={{ position: "absolute", left: M, right: M, top: footTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 * k }}>
        {crests.length === 2 && <img src={crests[0]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
        {fixture && <div style={{ ...caps(fixSize, F_TRACK, 600) }}>{fixture}</div>}
        {crests.length === 2 && <img src={crests[1]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
      </div>
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
