/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { opponentOf, rng, SCRIPT } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const BG = "#0a1315";
const PALE = "#e9eeec";
/** Gradient map of the stipple: teal-black shadows, grey-teal mids, near-white highlights. */
const TONE = ["#0b1718", "#23393b", "#6d8584", "#b9c8c5", "#f4f7f5"];

/** DM Serif Display: average advance of mixed-case letters, relative to the font size. */
const SERIF_W = 0.47;

/** Short string hash, so filter ids differ between photos (the Catalogue shows many edits on one page). */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const ACRONYM = /^(UEFA|FIFA|FC|SC|CP|CF|AC|SL|UD|CD|GD|AD|II|III|IV|U\d+|[A-Z]\d*)$/;

/** "LIGA PORTUGAL · MATCHDAY 5" → "Liga Portugal", keeping acronyms and numbers as they are. */
function title(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && /^(of|the|and|in|de|da|do)$/i.test(w)
        ? w.toLowerCase()
        : /^\d+(st|nd|rd|th)$/i.test(w)
          ? w.toLowerCase()
          : ACRONYM.test(w.toUpperCase()) || /\d/.test(w)
            ? w.toUpperCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

/** "FC Porto" → "Porto", "Sporting CP" → "Sporting": the name a club's own designers would write. */
function shortClub(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const kept = words.filter(
    (w) =>
      !/^(F\.?C\.?|S\.?C\.?|C\.?P\.?|C\.?F\.?|A\.?C\.?|U\.?D\.?|C\.?D\.?|G\.?D\.?|A\.?D\.?|S\.?L\.?|S\.?A\.?D\.?|CLUBE|CLUB|FUTEBOL|DE|DO|DA|\d{4})$/i.test(
        w,
      ),
  );
  return kept.length ? kept.slice(0, 2).join(" ") : name;
}

/** Sentence case for names typed in capitals. */
const nice = (s: string) => (s === s.toUpperCase() || s === s.toLowerCase() ? title(s) : s);

/**
 * Editorial United matchday (Man United v Bournemouth): a huge close portrait on teal-black, most of
 * the face dissolved into pale stipple dust (SVG noise thresholded against the photo's luminance),
 * with one sharp vertical strip in full colour. Bottom left, a thin serif "United" with a red script
 * "vs" behind it, the opponent smaller and a tiny serif line (ground | competition | round).
 */
export function Dispersion({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 34);
  const flip = params.side === "left";
  const pick = [params.primary === "#10131c" ? params.accent : params.primary, params.accent, params.primary].find(
    (c) => c && hueOf(c) !== null,
  );
  // Black-and-white clubs: a muted brass instead of a grey that would vanish.
  const club = pick ? vivid(pick) : "#c9a46a";
  // The "vs" must stay a clear colour on teal-black: lift dark ones, keep light ones.
  const red = luminance(club) < 0.1 ? shade(club, 0.25) : club;

  /* ---------- the portrait ---------- */
  const face = data.face ?? [0.38, 0.1, 0.24, 0.14];
  const aspect = data.photoAspect ?? 0.7;
  // Huge, but the sharp strip must hold up: past ~2.3x the real face pixels (4.6x in the 2x export)
  // it goes soft. The stipple hides softness, the strip doesn't.
  const want = 560 * (params.playerScale ?? 1);
  const faceH = data.facePx > 0 ? Math.min(want, Math.max(380, data.facePx * 2.3)) : want;
  const h = faceH / face[3];
  const w = h * aspect;
  const faceW = face[2] * w;
  const cx = 540 + (flip ? -1 : 1) * (20 + r() * 40) + (params.playerX ?? 0);
  const cy = 470 - (560 - faceH) * 0.25 + (params.playerY ?? 0);
  const box = { left: cx - (face[0] + face[2] / 2) * w, top: cy - (face[1] + face[3] / 2) * h, width: w, height: h };

  // The sharp strip: over the eye and nose, on the side the look is set to.
  const stripW = Math.max(220, Math.min(320, faceW * 0.5));
  const stripL = flip ? cx - stripW * 0.82 : cx - stripW * 0.18;

  const seed = Math.floor(r() * 1000);
  const id = `dsp${hash(`${data.photoUrl}|${seed}|${Math.round(faceH)}|${Math.round(cx)}`)}`;
  const table = (i: number) => TONE.map((c) => (parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) / 255).toFixed(3)).join(" ");
  // Stipple dissolves towards the edges and the lower corner with the headline.
  const fadeMask = `radial-gradient(${Math.round(faceW * 2.1)}px ${Math.round(faceH * 1.55)}px at ${Math.round(cx)}px ${Math.round(cy - faceH * 0.05)}px, #000 42%, transparent 100%)`;
  // ...and more so on the side away from the sharp strip, where the face blows away into dust.
  const sideMask = `linear-gradient(${flip ? "to left" : "to right"}, rgba(0,0,0,.25) ${Math.round(((flip ? CANVAS_W - cx - faceW * 1.1 : cx - faceW * 1.1) / CANVAS_W) * 100)}%, #000 ${Math.round(((flip ? CANVAS_W - cx - faceW * 0.1 : cx - faceW * 0.1) / CANVAS_W) * 100)}%)`;
  const maskStyle = {
    WebkitMaskImage: `${fadeMask}, ${sideMask}`,
    maskImage: `${fadeMask}, ${sideMask}`,
    WebkitMaskComposite: "source-in",
    maskComposite: "intersect",
  } as CSSProperties;

  const portrait = data.photoUrl && (
    <>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, ...maskStyle }}>
        <defs>
          <filter
            id={`${id}t`}
            x="0"
            y="0"
            width={CANVAS_W}
            height={CANVAS_H}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={table(0)} />
              <feFuncG type="table" tableValues={table(1)} />
              <feFuncB type="table" tableValues={table(2)} />
            </feComponentTransfer>
          </filter>
          <filter id={id} x="0" y="0" width={CANVAS_W} height={CANVAS_H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            {/* Grey, then mapped to the teal tone ramp. */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"
              result="g"
            />
            {/* Brightness as alpha, lifted so mid-tones still get plenty of dots. */}
            <feComponentTransfer in="g" result="lift">
              <feFuncR type="gamma" amplitude="1" exponent="0.5" offset="0" />
              <feFuncG type="gamma" amplitude="1" exponent="0.5" offset="0" />
              <feFuncB type="gamma" amplitude="1" exponent="0.5" offset="0" />
            </feComponentTransfer>
            <feComponentTransfer in="lift" result="tone">
              <feFuncR type="table" tableValues={table(0)} />
              <feFuncG type="table" tableValues={table(1)} />
              <feFuncB type="table" tableValues={table(2)} />
            </feComponentTransfer>
            <feColorMatrix in="lift" type="luminanceToAlpha" result="la" />
            {/* Fine noise spread to ~0..1, as a dither threshold. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="2" seed={seed} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.8 0 0 0 -0.9" result="na" />
            <feComposite in="la" in2="na" operator="arithmetic" k1="0" k2="0.86" k3="1" k4="-1" result="d" />
            <feComponentTransfer in="d" result="dots">
              <feFuncA type="linear" slope="9" intercept="0" />
            </feComponentTransfer>
            <feComposite in="dots" in2="SourceAlpha" operator="in" result="dots2" />
            <feComposite in="tone" in2="dots2" operator="in" result="stip" />
            {/* Dust: sparse coarse specks in a soft halo around the head, drifting to one side. */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="60" result="halo0" />
            <feOffset in="halo0" dx={flip ? 50 : -50} dy="-16" result="halo" />
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" seed={seed + 7} result="n2" />
            <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0.93  0 0 0 0 0.95  0 0 0 0 0.94  12 0 0 0 -7.5" result="specks" />
            <feComposite in="specks" in2="halo" operator="in" result="dust" />
            <feComposite in="dust" in2="SourceAlpha" operator="out" result="dustOut" />
            <feMerge>
              <feMergeNode in="dustOut" />
              <feMergeNode in="stip" />
            </feMerge>
          </filter>
        </defs>
        {/* A faint continuous layer under the dots, so the face still reads as a photograph. */}
        <image
          href={data.photoUrl}
          x={box.left}
          y={box.top}
          width={box.width}
          height={box.height}
          preserveAspectRatio="none"
          filter={`url(#${id}t)`}
          opacity={0.22}
        />
        <image
          href={data.photoUrl}
          x={box.left}
          y={box.top}
          width={box.width}
          height={box.height}
          preserveAspectRatio="none"
          filter={`url(#${id})`}
        />
      </svg>
      {/* The sharp strip: the real photo, full colour, hard vertical edges. */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: stripL, width: stripW, overflow: "hidden", background: "#060a0b" }}>
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left - stripL,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.1) saturate(1.05) brightness(.95)",
            ...cutMask(data.cut),
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(6,10,11,.35), transparent 25%, transparent 62%, rgba(6,10,11,.8))",
          }}
        />
      </div>
    </>
  );

  /* ---------- the words ---------- */
  const opp = nice(opponentOf(data));
  const us = nice(shortClub(data.club?.name ?? content.homeTeam ?? ""));
  const score = scoreOf(data, "–");
  const [compPart, ...roundParts] = content.subline
    .split("·")
    .map((s) => s.trim())
    .filter((s) => s && !/^VS\b/i.test(s));
  const comp = compPart ? title(compPart) : "";
  const round = roundParts.length ? title(roundParts.join(" ")) : "";
  const first = nice(content.firstName || content.lastName);
  const last = content.firstName ? nice(content.lastName) : "";
  const kickerWords = content.kicker.trim().split(/\s+/).filter(Boolean);
  const isMatch = (postType === "matchday" || postType === "result") && !!opp && !!us;
  // Results and goals sometimes lead with the kicker ("Full" / "time"), like the club's own series.
  const kickerLead = !isMatch ? kickerWords.length === 2 && r() < 0.5 : postType === "result" && kickerWords.length === 2 && r() < 0.35;

  let line1: string;
  let line2: string;
  let behind: string;
  let small: string[];
  if (isMatch && !kickerLead) {
    line1 = us;
    line2 = opp;
    behind = "vs";
    small =
      postType === "result"
        ? [score ? `Full time ${score}` : "Full time", comp, round]
        : [content.venue ? nice(content.venue) : "", comp, round, [content.date, content.time].filter((x): x is string => !!x).map(nice).join(" ")];
  } else if (kickerLead) {
    line1 = nice(kickerWords[0]).replace(/^./, (c) => c.toUpperCase());
    line2 = kickerWords[1].toLowerCase();
    behind = data.player.number || "";
    small = [
      [content.firstName, content.lastName].filter(Boolean).map(nice).join(" "),
      isMatch || opp ? `${us}${score ? ` ${score} ` : " v "}${opp}` : "",
      comp,
    ].filter(Boolean);
  } else {
    line1 = first;
    line2 = last;
    behind = content.kicker ? title(content.kicker) : "";
    small = [opp ? `v ${opp}` : "", comp, round, postType === "potm" ? "" : ""];
  }
  small = small.filter(Boolean).slice(0, 3);
  const smallText = small.join("  |  ");

  const left = 92;
  const scoreSplit = postType === "result" && isMatch && !kickerLead && score ? score.split("–") : null;
  // Room for the red score digits after each name.
  const extra1 = scoreSplit ? scoreSplit[0].length + 0.6 : 0;
  const extra2 = scoreSplit ? scoreSplit[1].length + 0.6 : 0;
  const s1 = Math.min(200, 860 / Math.max(3, (line1.length + extra1) * SERIF_W)) * (params.textScale ?? 1);
  const s2 = Math.min(isMatch && !kickerLead ? 86 : 120, 640 / Math.max(3, (line2.length + extra2) * SERIF_W));
  const s3 = Math.min(26, 860 / Math.max(10, smallText.length * 0.46));
  const smallTop = 1232;
  const line2Top = line2 ? smallTop - s2 * 1.12 : smallTop + s1 * 0.12;
  const line1Top = line2Top - s1 * 0.93;
  const w2 = (line2.length + extra2) * SERIF_W * s2;
  const indent = Math.max(0, Math.min(s1 * 1.05, CANVAS_W - 70 - left - w2));
  // "vs" sits low between the two names; a kicker in script floats above the first line.
  const vs = isMatch && !kickerLead;
  const behindSize = vs ? s1 * 0.95 : Math.min(120, 760 / Math.max(2, behind.length * 0.4));
  const behindPos = vs
    ? { left: Math.max(36, left + indent - behindSize * 0.72), top: line1Top + s1 * 0.62 }
    : { left: left + s1 * 0.2, top: line1Top - behindSize * 0.62 };

  const text: CSSProperties = {
    position: "absolute",
    fontFamily: DMSERIF,
    color: PALE,
    lineHeight: 1,
    whiteSpace: "nowrap",
    textShadow: "0 4px 30px rgba(0,0,0,.45)",
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: BG, color: PALE }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(70% 55% at ${Math.round((cx / CANVAS_W) * 100)}% 38%, #1b3134 0%, #10201f 45%, ${BG} 100%)`,
        }}
      />
      {portrait}
      {/* Darkened lower corner under the headline. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, rgba(6,11,12,.8), rgba(6,11,12,.35) 28%, transparent 45%)`,
        }}
      />

      {/* Red script behind the words: "vs", the kicker or the number. */}
      {behind && (
        <div
          style={{
            position: "absolute",
            ...behindPos,
            fontFamily: SCRIPT,
            fontSize: behindSize,
            lineHeight: 1,
            color: red,
            opacity: 0.92,
            whiteSpace: "nowrap",
            transform: `rotate(${-6 + r() * 3}deg)`,
          }}
        >
          {behind}
        </div>
      )}
      <div style={{ ...text, left, top: line1Top, fontSize: s1, letterSpacing: "0.005em" }}>
        {line1}
        {scoreSplit && <span style={{ color: red, marginLeft: "0.22em" }}>{scoreSplit[0]}</span>}
      </div>
      {line2 && (
        <div style={{ ...text, left: left + indent, top: line2Top, fontSize: s2 }}>
          {line2}
          {scoreSplit && <span style={{ color: red, marginLeft: "0.25em" }}>{scoreSplit[1]}</span>}
        </div>
      )}
      {smallText && (
        <div
          style={{
            ...text,
            left: left + Math.min(indent * 0.15, 30),
            top: smallTop + 8,
            fontSize: s3,
            color: "#cfd8d6",
            letterSpacing: "0.01em",
          }}
        >
          {smallText}
        </div>
      )}

      {data.club?.crestUrl && (
        <img
          src={data.club.crestUrl}
          alt=""
          style={{
            position: "absolute",
            [flip ? "right" : "left"]: 70,
            top: 64,
            width: 70,
            height: 70,
            objectFit: "contain",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))",
          }}
        />
      )}
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", [flip ? "left" : "right"]: 70, top: 88, opacity: 0.8, color: PALE }}
      />
      <Film strength={0.9} />
    </div>
  );
}
