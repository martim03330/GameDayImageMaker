/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const M = 60;
const WHITE = "#ffffff";
/** Horizontal stretch of the thin capitals: Inter has no width axis, so the line is drawn extended. */
const STRETCH = 1.3;
/** Tracking between the thin capitals, in em (before the stretch). */
const TRACK = 0.3;
/** Cap height of Inter relative to the font size. */
const CAP = 0.727;

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter Thin capitals, advance per 1px of font size (approximate). */
const thinEm = (t: string) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.26 : /[\d–-]/.test(c) ? 0.58 : /[IJ]/.test(c) ? 0.26 : c === "M" || c === "W" ? 0.86 : c === "'" ? 0.2 : 0.66), 0);
/** One part's advance per 1px of font size, tracking and stretch included. */
const partEm = (t: string) => (thinEm(t) + Math.max(0, [...t].length - 1) * TRACK) * STRETCH;
/** Inter caps (500), roughly, tracking included. */
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.9 : 0.69) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return titleCase((words.join(" ") || n).trim());
}

/** The kicker in two parts, split between words when it has several, else in the middle of the word. */
function splitTitle(t: string): [string, string] {
  const words = t.split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) {
    let best = 1;
    const diff = (i: number) => Math.abs(thinEm(words.slice(0, i).join(" ")) - thinEm(words.slice(i).join(" ")));
    for (let i = 2; i < words.length; i++) if (diff(i) < diff(best)) best = i;
    return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const chars = [...t];
  const k = Math.ceil(chars.length / 2);
  return [chars.slice(0, k).join(""), chars.slice(k).join("")];
}

/** One run of extended thin capitals, `width` wide from `x` (baseline `y`). */
function WideText({ x, y, width, size, fill, text }: { x: number; y: number; width: number; size: number; fill: string; text: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${STRETCH} 1)`}>
      <text x={0} y={0} textLength={width / STRETCH} lengthAdjust="spacing" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={100} fontSize={size} fill={fill}>
        {text}
      </text>
    </g>
  );
}

/**
 * Goalwide: the goal word across the full width in ultra-thin extended capitals, behind the celebrating player
 * at his shoulders, split in two so the gap sits on his body and head — never a letter behind his face. A deep
 * club-tone ground with a soft lift behind him; at the foot only the crests, the score line and the competition.
 */
export function Goalwide({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const ground = shade(club, -0.72);
  const lift = shade(club, -0.42);
  const low = shade(club, -0.84);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");

  /* ---- the player, a big expressive figure ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const box = placeByFace(data, faceX, 300, { chest: 230, waist: 178, knees: 142, full: 112 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fW = face[2] * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;

  /* ---- the foot ---- */
  const logoBottom = 44 - (params.logoY ?? 0);
  const compBottom = logoBottom + 82;
  const lineBottom = compBottom + 30;
  const crestBottom = lineBottom + 40;
  const fadeTo = CANVAS_H - crestBottom - 40;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 220 - box.top}px, transparent ${fadeTo - box.top}px)`;

  /* ---- the wide line, from his chin down to his shoulders, the gap on his head ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const [a, b] = splitTitle(title);
  const headHalf = fW * 0.74;
  const leftEnd = fCx - headHalf - 34;
  const rightStart = fCx + headHalf + 34;
  const room = Math.min(leftEnd - M, CANVAS_W - M - rightStart);
  const size = Math.max(56, Math.min(230 * ts, room / Math.max(partEm(a), partEm(b))));
  const capH = size * CAP;
  // The band's middle at his chin / the top of his shoulders: the line reads behind his neck and shoulders.
  const mid = fTop + fH * 1.02 + (params.textY ?? 0);
  const base = Math.min(CANVAS_H - crestBottom - 140, mid + capH / 2);
  // Either part runs out towards its margin (a little extra tracking, never a gaping one).
  const fill = (t: string, w: number) => Math.min(w, partEm(t) * size + Math.max(0, [...t].length - 1) * size * TRACK * STRETCH * 0.8);
  const aW = fill(a, leftEnd - M);
  const bW = fill(b, CANVAS_W - M - rightStart);

  /* ---- the small type ---- */
  const weHost = content.home ?? ((content.homeTeam ?? "").toUpperCase() !== f.opp);
  const ours = shortName(data.club?.name ?? (weHost ? content.homeTeam : content.awayTeam) ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp);
  const pair = weHost ? [ours, them] : [them, ours];
  const scoreLine = pair[0] && pair[1] ? (score ? `${pair[0]}  ${score}  ${pair[1]}` : `${pair[0]}  v  ${pair[1]}`) : score;
  const LINE_TRACK = 0.24;
  const lineSize = Math.max(12, Math.min(19 * ts, 820 / Math.max(1, capsEm(scoreLine, LINE_TRACK))));
  const comp = titleCase(f.comp || f.round || "");
  const COMP_TRACK = 0.3;
  const compSize = Math.max(10, Math.min(12 * ts, 820 / Math.max(1, capsEm(comp, COMP_TRACK))));
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : "url(#goalwide-mono)";
  const caps = (s: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: s,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: WHITE,
    textAlign: "center",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="goalwide-mono" ink={0.5} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(58% 46% at ${(fCx / CANVAS_W) * 100}% ${((fTop + fH * 2) / CANVAS_H) * 100}%, ${lift}, ${ground} 72%, ${low} 100%)` }} />

      {/* The word: ultra thin, extended, across the full width, split around him (behind him). */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <WideText x={leftEnd - aW} y={base} width={aW} size={size} fill="rgba(255,255,255,.94)" text={a} />
        <WideText x={rightStart} y={base} width={bW} size={size} fill="rgba(255,255,255,.94)" text={b} />
      </svg>

      {/* The player, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The same word again, faint, in front: what his arms and shoulders hide still reads — never over his head. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, opacity: 0.3 }} aria-hidden>
        <defs>
          <mask id="goalwide-head" maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <rect width={CANVAS_W} height={CANVAS_H} fill="#fff" />
            <ellipse cx={fCx} cy={fTop + fH * 0.45} rx={headHalf + 30} ry={fH * 0.95} fill="#000" />
          </mask>
        </defs>
        <g mask="url(#goalwide-head)">
          <WideText x={leftEnd - aW} y={base} width={aW} size={size} fill="#fff" text={a} />
          <WideText x={rightStart} y={base} width={bW} size={size} fill="#fff" text={b} />
        </g>
      </svg>

      {/* Foot: crests, the score line, the competition, the agency. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: crestBottom, display: "flex", justifyContent: "center", gap: 26, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 36, height: 36, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}
      {scoreLine && <div style={{ position: "absolute", left: M, right: M, bottom: lineBottom, ...caps(lineSize, LINE_TRACK, 500) }}>{scoreLine}</div>}
      {comp && <div style={{ position: "absolute", left: M, right: M, bottom: compBottom, ...caps(compSize, COMP_TRACK, 400, { color: "rgba(255,255,255,.6)" }) }}>{comp}</div>}
      <AgencyLogo
        data={data}
        height={18}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
