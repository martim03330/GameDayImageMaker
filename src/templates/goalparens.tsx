/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { parenPath } from "./parens";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM } from "./types";

const WHITE = "#ffffff";
const INK = "#16171b";
const PALE = "#ebe7e0";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);
/** Inter (light weights), mixed case: advance widths per 100px (approximate). */
const LOW_W: Record<string, number> = { a: 55, b: 60, c: 55, d: 60, e: 57, f: 33, g: 60, h: 58, i: 24, j: 24, k: 53, l: 24, m: 86, n: 58, o: 59, p: 60, q: 60, r: 37, s: 51, t: 33, u: 58, v: 55, w: 80, x: 53, y: 55, z: 53, " ": 26, "-": 45, "'": 30, "!": 28 };
const lightEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (/[A-Z]/.test(c) ? (CAPS_W[c] ?? 70) : (LOW_W[c] ?? 56)) / 100, 0);

/** "GOAL" → "Goal", "HAT-TRICK" → "Hat-trick". */
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Goal parens: the celebration put in brackets. The celebrating player large on a deep club tone (or pale
 * paper, by seed), and across his waist — where he melts into the ground — one light typographic aside:
 * "(Goal)", the word in Inter extra-light between two tall hairline parentheses drawn like the glyphs of a
 * very thin face. His head and raised arms stay free above it. His name and the fixture (home team first,
 * names exactly as stored, never the score) small underneath, the NEYOD logo with air below.
 */
export function Goalparens({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const pale = rng((params.seed ?? 0) * 7919 + 41)() < 0.35;
  const ground = pale ? PALE : shade(club, -0.72);
  const lift = pale ? "#f7f5f1" : shade(club, -0.42);
  const fg = pale ? INK : WHITE;
  const soft = pale ? "rgba(22,23,27,.6)" : "rgba(255,255,255,.66)";
  const accent = pale ? shade(club, -0.22) : WHITE;

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
  const F_TRACK = 0.22;
  const fSize = Math.max(11, Math.min(16 * k, inner / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.22;
  const nSize = Math.max(14, Math.min(24 * k, inner / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const gap = story ? 66 : 46;
  const fixTop = logoTop - gap - fSize + (params.textY ?? 0);
  const nameTop = fixTop - (story ? 24 : 18) - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the bracketed word ---- */
  const word = sentenceCase((content.kicker || "GOAL").replace(/’/g, "'").trim());
  const wMax = story ? 250 : 196;
  const wSize = Math.min(wMax, (story ? 700 : 600) / Math.max(1, lightEm(word))) * ts;
  const wWidth = lightEm(word) * wSize;
  const pH = Math.round(wSize * 1.5);
  const lockBottom = footTop - (story ? 96 : 64);
  const lockTop = lockBottom - pH;
  const pad = wSize * 0.3;
  const bulge = pH * 0.12;
  const xL = 540 - wWidth / 2 - pad;
  const xR = 540 + wWidth / 2 + pad;
  const strokeW = story ? 6.5 : 5;

  /* ---- the player: big, head and arms free above the aside ---- */
  const sizes = story ? { chest: 280, waist: 232, knees: 190, full: 150 } : { chest: 210, waist: 174, knees: 142, full: 112 };
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  let box = placeByFace(data, faceX, story ? 300 : 170, sizes);
  // Keep the chin (and some neck) clear of the bracket tops.
  const chin0 = box.top + face[1] * box.height + box.faceH;
  if (chin0 + box.faceH * 0.5 > lockTop) box = { ...box, top: box.top - (chin0 + box.faceH * 0.5 - lockTop) };
  // An arm flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = Math.min(lockTop + pH * 0.5, box.top + box.height);
  const fadeLen = story ? 420 : 330;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: fg }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 46% at 50% ${((chin + 80) / H) * 100}%, ${lift} 0%, transparent 78%)`, opacity: pale ? 0.95 : 0.8 }} />

      {/* A soft shade behind his torso (never a drop shadow on the cutout). */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin, width: box.width * 0.6, height: Math.max(80, fadeEnd - chin - box.faceH), borderRadius: "50%", background: pale ? "rgba(40,36,30,.15)" : "rgba(0,0,0,.24)", filter: `blur(${story ? 80 : 64}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* (Goal) */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={parenPath(xL, lockTop, lockBottom, bulge * (4 / 3), strokeW)} fill={accent} />
        <path d={parenPath(xR, lockTop, lockBottom, -bulge * (4 / 3), strokeW)} fill={accent} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: lockTop + pH / 2 - wSize * 0.56, fontFamily: SANS, fontWeight: 200, fontSize: wSize, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", textAlign: "center", color: accent }}>{word}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nSize, N_TRACK, 600), color: fg }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fSize, F_TRACK, 400), color: soft }}>{fixture}</div>}

      <AgencyLogo data={data} onLight={pale} height={18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={pale ? 0.12 : 0.18} />
    </div>
  );
}
