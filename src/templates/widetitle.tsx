/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const M = 60;
const OFF_WHITE = "#eeebe5";
const INK = "#16171b";
/** Horizontal stretch of the thin capitals: Inter has no width axis, so the line is drawn extended. */
const STRETCH = 1.3;
/** Tracking between the thin capitals, in em (before the stretch). */
const TRACK = 0.34;

/** One run of extended thin capitals, filling exactly `width` from `x` (baseline `y`). */
function WideText({ x, y, width, size, fill, text }: { x: number; y: number; width: number; size: number; fill: string; text: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${STRETCH} 1)`}>
      <text x={0} y={0} textLength={width / STRETCH} lengthAdjust="spacing" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={100} fontSize={size} fill={fill}>
        {text}
      </text>
    </g>
  );
}

/** Inter Thin capitals, advance per 1px of font size (approximate). */
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const thinEm = (t: string) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.26 : /[\d–-]/.test(c) ? 0.58 : /[IJ]/.test(c) ? 0.26 : c === "M" || c === "W" ? 0.86 : c === "'" ? 0.2 : 0.66), 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/**
 * Widetitle: the title across the full width in ultra-thin extended capitals at his eye level, split in two
 * (MATCH | DAY) so the gap falls exactly on his head; a single word goes whole above his head. White on a deep club tone, or ink on off-white (by seed). Everything
 * else tiny: date · kick-off top-left, the opponent top-right, the ground and crests at the foot.
 */
export function Widetitle({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  // Native 9:16 story: corners under the profile bar, the foot above the reply bar, a bigger bust between.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const top0 = story ? STORY_TOP : M;
  const foot = story ? H - STORY_BOTTOM : 0;
  const r = rng(params.seed ?? 11);
  const light = r() < 0.45;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const ground = light ? OFF_WHITE : shade(club, -0.7);
  const lift = light ? "#f6f4ef" : shade(club, -0.52);
  const ink = light ? INK : "#ffffff";
  const soft = light ? "rgba(22,23,27,.62)" : "rgba(255,255,255,.66)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, centred, a bust ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const box = story
    ? placeByFace(data, faceX, 490, { chest: 360, waist: 296, knees: 232, full: 180 })
    : placeByFace(data, faceX, 360, { chest: 270, waist: 220, knees: 170, full: 130 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const eyeY = box.top + (face[1] + face[3] * 0.42) * box.height;
  const fadeFrom = story ? 1420 : 1010;
  const fadeTo = story ? 1610 : 1180;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  /* ---- the wide line: two parts, the gap exactly where his head is ---- */
  const title = (postType === "result" && isResult ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const span = CANVAS_W - 2 * M;
  const lineY = story ? Math.max(460, Math.min(1100, eyeY + (params.textY ?? 0))) : Math.max(260, Math.min(760, eyeY + (params.textY ?? 0)));
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fW = face[2] * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;
  // Head with hair, plus breathing room either side.
  const headHalf = fW * 0.72;
  const leftEnd = fCx - headHalf - 40;
  const rightStart = fCx + headHalf + 40;
  const words = title.replace(/\b(MATCH|GAME)DAY\b/, "$1 DAY").split(/\s+/).filter(Boolean);
  let parts: [string, string] | null = null;
  if (words.length >= 2) {
    let best = 1;
    for (let i = 1; i < words.length; i++) {
      const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
      if (d < Math.abs(words.slice(0, best).join(" ").length - words.slice(best).join(" ").length)) best = i;
    }
    parts = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  // Each part's advance per 1px of font size, tracking and stretch included.
  const partEm = (t: string) => (thinEm(t) + Math.max(0, [...t].length - 1) * TRACK) * STRETCH;
  let size = parts ? Math.min(140 * k * ts, (leftEnd - M) / partEm(parts[0]), (CANVAS_W - M - rightStart) / partEm(parts[1])) : 0;
  if (size < 56) parts = null;
  // One word (or no room beside his head): the whole line across the width, above his head.
  if (!parts) size = Math.min(130 * k, (span * 0.62) / STRETCH / Math.max(1, thinEm(title))) * ts;
  const capH = size * 0.727;
  const base = parts ? lineY + capH / 2 : Math.max((story ? STORY_TOP + 150 : 200) + capH, fTop - fH * (story ? 0.8 : 0.6) - 36 + (params.textY ?? 0));
  const leftW = parts ? partEm(parts[0]) * size : 0;
  const rightW = parts ? partEm(parts[1]) * size : 0;

  /* ---- the tiny type ---- */
  const date = niceDate(content.date);
  const when = [date, isResult ? "" : f.time].filter(Boolean).join("  ·  ");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? titleCase(f.opp));
  const ours = shortName(data.club?.name ?? "");
  const vs = isResult && opp && ours ? (content.home === false ? `${opp} ${score} ${ours}` : `${ours} ${score} ${opp}`) : opp ? `v ${opp}` : "";
  const comp = titleCase(f.comp || f.round || "");
  const venue = titleCase(f.venue);
  const fit = (t: string, max: number, w: number) => Math.max(12, Math.min(max * k, (w * (story ? 1.15 : 1)) / Math.max(1, t.length * 0.52))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor || light ? "none" : "url(#widetitle-mono)";

  const tiny: CSSProperties = { fontFamily: SANS, color: ink, whiteSpace: "nowrap", lineHeight: 1.25 };
  const caps: CSSProperties = { ...tiny, fontWeight: 500, fontSize: story ? 16 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: soft };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="widetitle-mono" ink={0.5} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 48% at ${faceX / 10.8}% ${(eyeY / H) * 100}%, ${lift}, ${ground} 75%)` }} />

      {/* The title: ultra thin, extended, across the full width, split around his head (behind him). */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {parts ? (
          <>
            <WideText x={leftEnd - leftW} y={base} width={leftW} size={size} fill={ink} text={parts[0]} />
            <WideText x={rightStart} y={base} width={rightW} size={size} fill={ink} text={parts[1]} />
          </>
        ) : (
          <WideText x={M} y={base} width={span} size={size} fill={ink} text={title} />
        )}
      </svg>

      {/* The player, natural colour, melting into the ground at the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top corners. */}
      <div style={{ position: "absolute", top: top0, left: M, display: "flex", flexDirection: "column", gap: story ? 12 : 8, maxWidth: story ? 470 : 420 }}>
        {comp && <div style={{ ...caps, fontSize: Math.min(story ? 16 : 12, ((story ? 470 : 420) / Math.max(1, comp.length * 0.95))) }}>{comp}</div>}
        {when && <div style={{ ...tiny, fontWeight: 300, fontSize: fit(when, 19, 400) }}>{when}</div>}
      </div>
      {vs && (
        <div style={{ position: "absolute", top: top0, right: M, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: story ? 12 : 8, maxWidth: story ? 470 : 420 }}>
          {f.round && <div style={caps}>{titleCase(f.round)}</div>}
          <div style={{ ...tiny, fontWeight: 300, fontSize: fit(vs, 19, 400) }}>{vs}</div>
        </div>
      )}

      {/* Foot: ground left, crests right, the logo centred. */}
      {venue && <div style={{ position: "absolute", left: M, bottom: foot + (story ? 14 : 62), ...tiny, fontWeight: 300, fontSize: fit(venue, 15, 300), color: soft }}>{venue}</div>}
      {crests.length > 0 && (
        <div style={{ position: "absolute", right: M, bottom: foot + (story ? 4 : 56), display: "flex", gap: story ? 20 : 16, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 50 : 34, height: story ? 50 : 34, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={story ? 23 : 16}
        onLight={light}
        style={{ position: "absolute", left: "50%", bottom: (story ? foot : 48) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={light ? 0.12 : 0.18} />
    </div>
  );
}
