/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { BODONI } from "./cover";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

/** Bodoni Moda 500 capitals: advance widths per 100px. */
const BODONI_W: Record<string, number> = { A: 78.9, B: 68.8, C: 72.1, D: 75.2, E: 63.4, F: 61.1, G: 75.7, H: 78.8, I: 41.3, J: 50.7, K: 75, L: 62, M: 89.8, N: 77.9, O: 76.5, P: 66.7, Q: 76.5, R: 74.2, S: 59.3, T: 68.9, U: 73.4, V: 79, W: 107.3, X: 79.1, Y: 74.3, Z: 60.6 };
/** Cap height of Bodoni Moda, relative to the font size. */
const CAP = 0.66;
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/** First letter of a name, upper-case, accents dropped ("Ângelo" → "A"). */
const initial = (s?: string) => plain((s ?? "").trim().charAt(0).toUpperCase())[0] ?? "";

/**
 * Monogram: his initials (first + last name) cut enormous in a thin Bodoni behind him, the two letters
 * overlapping a little like an engraved monogram, tone-on-tone with the ground so his face reads first.
 * Title small at the top; at the foot one line of crests and fixture, one of date and kick-off.
 * The ground is a warm off-white or a deep club tone (by seed).
 */
export function Monogram({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  // Native 9:16 story: title under the profile bar, the foot above the reply bar, the monogram and a bigger figure between.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const r = rng(params.seed ?? 7);
  const lightGround = r() < 0.5;
  const stagger = r() < 0.6;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);

  const ground = lightGround ? "#efebe4" : shade(club, -0.7);
  const groundLow = lightGround ? "#e2ddd4" : shade(club, -0.8);
  const ink = lightGround ? "#1f1d1a" : "#ffffff";
  const soft = lightGround ? "rgba(31,29,26,.6)" : "rgba(255,255,255,.66)";
  // The letters: a breath darker (or lighter) than the ground, a hint of club colour on the light one.
  const letterFill = lightGround ? shade(club, -0.3) : "#ffffff";
  const letterAlpha = lightGround ? 0.085 : 0.07;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the monogram ---- */
  const a = initial(content.firstName);
  const b = initial(content.lastName);
  const letters = [a, b].filter(Boolean);
  const OVERLAP = 0.2; // share of the narrower letter the two letters share
  const wA = (BODONI_W[letters[0]] ?? 72) / 100;
  const wB = letters[1] ? (BODONI_W[letters[1]] ?? 72) / 100 : 0;
  const shared = letters[1] ? Math.min(wA, wB) * OVERLAP : 0;
  const em = wA + wB - shared;
  const drop = stagger && letters[1] ? 0.12 : 0; // second letter set a little lower, in em
  const size = Math.min(1060 / Math.max(0.5, em), (story ? 900 : 760) / (CAP + drop));
  const monoW = em * size;
  const x0 = 540 - monoW / 2;
  const capTop = (story ? STORY_TOP + 160 : 230) + (params.textY ?? 0) * 0.3;
  const base = capTop + CAP * size;

  /* ---- the player, centred in front of it ---- */
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const box = story
    ? placeByFace(data, faceX, STORY_TOP + 290, { chest: 350, waist: 280, knees: 214, full: 166 })
    : placeByFace(data, faceX, 300, { chest: 250, waist: 196, knees: 150, full: 118 });

  /* ---- type ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.5;
  const tSize = Math.max(11, Math.min(15 * (story ? 1.5 : 1), 620 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 66) + (params.textY ?? 0);

  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = shortName(oursName).toUpperCase();
  const them = shortName(typed ?? f.opp).toUpperCase();
  const pair = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `   ${score}   ` : "   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.28;
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const CREST = story ? 52 : 36;
  const crestRoom = crests.length === 2 ? 2 * (CREST + 26) : 0;
  const fSize = Math.max(11, Math.min(15 * k, (900 - crestRoom) / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time ? (hasScore ? "" : `Kick-off ${f.time}`) : ""].filter(Boolean).join("   ·   ");
  const wSize = Math.max(13, Math.min(18 * k, 860 / Math.max(1, when.length * 0.52))) * ts;

  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const whenTop = story ? STORY_BOTTOM - 105 - 46 - wSize * 1.2 : CANVAS_H - 44 - 52 - 40 - wSize;
  const fixTop = whenTop - (story ? 26 + CREST : 22 + 36);
  const fadeEnd = fixTop - (story ? 30 : 24);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(0, fadeEnd - (story ? 320 : 260) - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* The ground: flat, a soft lift behind him and a little weight at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 42%, ${lightGround ? "#f6f3ee" : shade(club, -0.58)}, ${ground} 62%, ${groundLow} 100%)` }} />

      {/* The monogram, tone on tone; the shared stroke reads a shade deeper. */}
      {letters.length > 0 && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <g fontFamily={BODONI} fontWeight={500} fontSize={size} fill={letterFill} fillOpacity={letterAlpha}>
            <text x={x0} y={base}>
              {letters[0]}
            </text>
            {letters[1] && (
              <text x={x0 + (wA - shared) * size} y={base + drop * size}>
                {letters[1]}
              </text>
            )}
          </g>
        </svg>
      )}

      {/* The player, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the title, a hairline under it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", ...caps(tSize, T_TRACK, 500) }}>{title}</div>
      <div style={{ position: "absolute", left: 540 - 18, top: titleTop + tSize + 18 * k, width: 36 * k, height: 1, background: soft }} />

      {/* Foot: crests flanking the fixture (home first), then date · kick-off. */}
      {fixture && (
        <div style={{ position: "absolute", left: 56, right: 56, top: fixTop, height: CREST, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          {crests.length === 2 && <img src={crests[0]} alt="" style={{ width: CREST, height: CREST, objectFit: "contain" }} />}
          <div style={caps(fSize, F_TRACK, 500)}>{fixture}</div>
          {crests.length === 2 && <img src={crests[1]} alt="" style={{ width: CREST, height: CREST, objectFit: "contain" }} />}
        </div>
      )}
      {when && (
        <div style={{ position: "absolute", left: 56, right: 56, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: wSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: soft }}>{when}</div>
      )}

      <AgencyLogo
        data={data}
        onLight={lightGround}
        height={story ? 24 : 18}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={lightGround ? 0.12 : 0.2} />
    </div>
  );
}
