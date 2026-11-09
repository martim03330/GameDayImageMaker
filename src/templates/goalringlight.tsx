/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
/** The ring's warm white core and its amber bloom. */
const CORE = "#fff3e2";
const BLOOM = "#ffb766";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/**
 * Goal ring light: the celebrating player on a warm dark ground with one thin, bright ring light glowing
 * behind his head, the way a studio ring light reads in a portrait. "GOAL" small and wide-tracked at the
 * top; his name and the fixture (never the score) small at the foot.
 */
export function Goalringlight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  /** A warm near-black, only faintly carrying the club. */
  const ground = "#0d0a08";
  const tint = shade(club, -0.82);

  const f = matchFacts(data);

  /* ---- the foot: name, then the fixture, measured from the logo up ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = (ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join("   v   ") : f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fSize = Math.max(11, Math.min(15 * k, 880 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.22;
  const nSize = Math.max(16, Math.min(30 * k, 860 / Math.max(1, capsEm(name, N_TRACK)))) * ts;

  const fixBottom = story ? STORY_BOTTOM - logoH - 62 : CANVAS_H - 44 - logoH - 30;
  const fixTop = fixBottom - fSize;
  const nameTop = fixTop - (story ? 26 : 20) - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player: sized by his face, head in the upper middle ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const sizes: Record<string, number> = story ? { chest: 215, waist: 180, knees: 150, full: 124 } : { chest: 165, waist: 138, knees: 114, full: 94 };
  let faceH = (sizes[params.framing ?? "waist"] ?? sizes.waist) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  let h = faceH / face[3];
  // Never so tall that he can't reach down to the name; a short crop is lifted rather than floating.
  const shift = params.side === "left" ? -40 : params.side === "right" ? 40 : 0;
  const faceCy0 = story ? 700 : 450;
  let top = faceCy0 - (face[1] + face[3] / 2) * h;
  if (top + h < footTop - 40) {
    h = (footTop - 40 - faceCy0) / (1 - face[1] - face[3] / 2);
    if (h * face[3] > faceH * 1.45) h = (faceH * 1.45) / face[3];
    top = faceCy0 - (face[1] + face[3] / 2) * h;
  }
  const w = h * aspect;
  const left = 540 + shift - (face[0] + face[2] / 2) * w + (params.playerX ?? 0);
  top += params.playerY ?? 0;
  const fH = face[3] * h;
  const faceCx = left + (face[0] + face[2] / 2) * w;
  const faceCy = top + (face[1] + face[3] / 2) * h;
  // He dissolves into the dark well above the name.
  const fadeEnd = Math.min(footTop - (story ? 70 : 50), top + h);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - 250 - top)}px, transparent ${fadeEnd - top}px)`;

  /* ---- the ring: centred on his head, a little above the face centre ---- */
  const R = Math.max(story ? 270 : 205, Math.min(story ? 360 : 280, fH * 2));
  const rx = Math.max(R + 30, Math.min(CANVAS_W - R - 30, faceCx));
  const ry = faceCy - fH * 0.15;
  const ring = (stroke: number, color: string, extra?: CSSProperties): CSSProperties => ({
    position: "absolute",
    left: rx - R - stroke / 2,
    top: ry - R - stroke / 2,
    width: 2 * R + stroke,
    height: 2 * R + stroke,
    borderRadius: "50%",
    border: `${stroke}px solid ${color}`,
    boxSizing: "border-box",
    ...extra,
  });

  /* ---- type ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.7;
  const tSize = Math.max(12, Math.min(17 * (story ? 1.5 : 1), 640 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The room: a faint warm lift around the ring, the club only as a shadow tone low down. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 42% at ${(rx / CANVAS_W) * 100}% ${(ry / H) * 100}%, #3a2716 0%, #1a120c 45%, transparent 80%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.45, background: `linear-gradient(to bottom, transparent, ${tint}aa 70%, ${ground})` }} />

      {/* The ring light: a wide amber bloom, a tighter glow, then the thin white-hot core. */}
      <div style={ring(story ? 60 : 46, BLOOM, { opacity: 0.32, filter: `blur(${story ? 38 : 30}px)` })} />
      <div style={ring(story ? 20 : 16, BLOOM, { opacity: 0.75, filter: `blur(${story ? 12 : 9}px)` })} />
      <div style={ring(story ? 8 : 6, CORE, { filter: "blur(1.4px)" })} />
      <div style={ring(story ? 3 : 2.5, WHITE)} />

      {/* The player, natural colour, warmed a touch by the ring. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left, top, width: w, height: h, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.06) brightness(1.03) sepia(.07) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* The dark closing in at the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(85% 70% at 50% 45%, transparent 58%, ${ground}cc 100%)` }} />

      {/* Top: the title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK), color: CORE, opacity: 0.94 }}>{title}</div>

      {/* Foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: 50, right: 50, top: nameTop, ...caps(nSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: 50, right: 50, top: fixTop, ...caps(fSize, F_TRACK, 400), color: "rgba(255,255,255,.64)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.2} />
    </div>
  );
}
