/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const INK = "#16171b";
const PALE = "#ebe7e0";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/**
 * One parenthesis as a hairline crescent, like a very light typeface's "(": pointed ends, the stroke
 * swelling to `w` at its middle. `x` is the tip line, `bulge` how far the curve bows out (negative = ")").
 */
export function parenPath(x: number, top: number, bottom: number, bulge: number, w: number): string {
  const h = bottom - top;
  const c1 = top + h * 0.2;
  const c2 = bottom - h * 0.2;
  // A cubic with both handles at the bulge peaks at 0.75·bulge; the inner edge is 4/3·w shallower.
  const o = x - bulge;
  const i = x - bulge + Math.sign(bulge) * w * (4 / 3);
  return `M ${x} ${top} C ${o} ${c1} ${o} ${c2} ${x} ${bottom} C ${i} ${c2} ${i} ${c1} ${x} ${top} Z`;
}

/**
 * Parens: the player as the parenthetical. Two giant hairline parentheses — drawn like the "(" and ")"
 * of a very thin typeface, in the club colour on pale paper (or white on a deep club tone, by seed) —
 * stand either side of him, behind the cutout, so his shoulders and arms may cross them. He fades out
 * before their lower tips, which close freely below him. "Matchday" small and wide-tracked above; the
 * fixture (home team first, names exactly as stored) and one quiet line of date · time · ground below;
 * the NEYOD logo with air under it.
 */
export function Parens({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const pale = rng((params.seed ?? 0) * 7919 + 23)() < 0.6;
  const ground = pale ? PALE : shade(club, -0.72);
  const lift = pale ? "#f7f5f1" : shade(club, -0.46);
  const fg = pale ? INK : WHITE;
  const soft = pale ? "rgba(22,23,27,.6)" : "rgba(255,255,255,.66)";
  const parenColor = pale ? shade(club, -0.08) : WHITE;

  /* ---- the foot, measured up from the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = (ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join("  v  ") : ours || f.comp || "").toUpperCase();
  const M = story ? 70 : 64;
  const inner = CANVAS_W - 2 * M;
  const F_TRACK = 0.2;
  const fSize = Math.max(12, Math.min(21 * k, inner / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const dSize = Math.max(12, Math.min(19 * k, inner / Math.max(1, facts.length * 0.5))) * ts;
  const gap = story ? 66 : 46;
  const dateTop = logoTop - gap - dSize * 1.15 + (params.textY ?? 0);
  const fixTop = (facts ? dateTop - (story ? 22 : 16) - fSize : logoTop - gap - fSize) + (params.textY ?? 0) * (facts ? 0 : 1);

  /* ---- the title, small at the top ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.56;
  const tSize = Math.max(12, Math.min(17 * k, 640 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 70) + (params.textY ?? 0);

  /* ---- the parentheses ---- */
  const pTop = titleTop + tSize + (story ? 70 : 42);
  const pBottom = fixTop - (story ? 64 : 44);
  const pH = pBottom - pTop;
  const bulge = Math.min(story ? 150 : 120, pH * 0.15);
  const tipIn = story ? 168 : 182; // the tips' distance from the edge
  const strokeW = story ? 9 : 7;
  const xL = tipIn;
  const xR = CANVAS_W - tipIn;

  /* ---- the player, his face in the upper third of the parentheses ---- */
  const sizes = story ? { chest: 300, waist: 236, knees: 186, full: 146 } : { chest: 220, waist: 172, knees: 136, full: 106 };
  const faceX = 540 + (params.side === "left" ? -30 : params.side === "right" ? 30 : 0);
  const box = placeByFace(data, faceX, pTop + pH * (story ? 0.12 : 0.1), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  // He melts into the ground before the lower tips, so the brackets close on their own.
  const fadeEnd = Math.min(pBottom - pH * 0.1, box.top + box.height);
  const fadeLen = story ? 380 : 280;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: fg }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 44% at 50% ${((pTop + pH * 0.45) / H) * 100}%, ${lift} 0%, transparent 80%)`, opacity: pale ? 0.95 : 0.8 }} />

      {/* The two brackets, behind him. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={parenPath(xL, pTop, pBottom, bulge * (4 / 3), strokeW)} fill={parenColor} opacity={pale ? 0.92 : 0.9} />
        <path d={parenPath(xR, pTop, pBottom, -bulge * (4 / 3), strokeW)} fill={parenColor} opacity={pale ? 0.92 : 0.9} />
      </svg>

      {/* A soft shade behind his torso so a white kit separates from the paper (not a drop shadow on the cutout). */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin, width: box.width * 0.6, height: Math.max(80, fadeEnd - chin - box.faceH * 1.2), borderRadius: "50%", background: pale ? "rgba(40,36,30,.15)" : "rgba(0,0,0,.24)", filter: `blur(${story ? 80 : 64}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500), color: pale ? shade(club, -0.1) : WHITE }}>{title}</div>

      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fSize, F_TRACK, 600), color: fg }}>{fixture}</div>}
      {facts && <div style={{ position: "absolute", left: M, right: M, top: dateTop, fontFamily: SANS, fontWeight: 400, fontSize: dSize, lineHeight: 1.15, letterSpacing: "0.04em", whiteSpace: "nowrap", textAlign: "center", color: soft }}>{facts}</div>}

      <AgencyLogo data={data} onLight={pale} height={18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={pale ? 0.12 : 0.18} />
    </div>
  );
}
