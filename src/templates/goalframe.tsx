/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const INK = "#16171b";
const PALE = "#e9e5de";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/**
 * Goal frame: one thin hairline rectangle inset from the edges of a plain ground (deep club tone with a
 * white line, or pale paper with an ink line — by seed). The celebrating player stands inside it, but his
 * head and raised arms break out over the top edge, the line running behind him. The bottom edge opens
 * for the word "GOAL", small and wide-tracked, sitting in the gap; his name and the fixture (home team
 * first, never the score) small just inside the foot; the NEYOD logo under the frame like a gallery label.
 * Not `frame` (a tilted photo frame filled with a picture): here there is no picture, only a line.
 */
export function Goalframe({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const pale = rng((params.seed ?? 0) * 7919 + 11)() < 0.5;
  const ground = pale ? PALE : shade(club, -0.74);
  const lift = pale ? "#f8f6f2" : shade(club, -0.5);
  const fg = pale ? INK : WHITE;
  const soft = pale ? "rgba(22,23,27,.62)" : "rgba(255,255,255,.64)";
  // The one accent: the title in the club colour on paper, white on the deep ground.
  const accent = pale ? shade(club, -0.12) : WHITE;

  /* ---- the frame's foot, measured from the logo up ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.62;
  const tSize = Math.max(12, Math.min(18 * k, 520 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const capH = tSize * 0.73;
  // The title's caps centred on the bottom line; 64px (story) / 40px (post) of air down to the logo.
  const yb = Math.round(logoTop - (story ? 66 : 40) - capH / 2);
  const M = story ? 60 : 56;
  const lineW = story ? 2.5 : 2;
  const gapHalf = (capsEm(title, T_TRACK) * tSize) / 2 + (story ? 30 : 22);

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = (ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join("  v  ") : f.comp || "").toUpperCase();
  const inner = CANVAS_W - 2 * M - 2 * (story ? 50 : 44);
  const F_TRACK = 0.26;
  const fSize = Math.max(11, Math.min(14 * k, inner / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.2;
  const nSize = Math.max(16, Math.min(28 * k, inner / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const fixTop = yb - (story ? 58 : 44) - fSize + (params.textY ?? 0);
  const nameTop = fixTop - (story ? 22 : 16) - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player: head high, the top line running behind his neck ---- */
  const sizes = story ? { chest: 236, waist: 196, knees: 160, full: 128 } : { chest: 176, waist: 146, knees: 120, full: 98 };
  const faceX = 540 + (params.side === "left" ? -46 : params.side === "right" ? 46 : 0);
  let box = placeByFace(data, faceX, story ? STORY_TOP + 120 : 150, sizes);
  // An arm flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = box.top + face[1] * box.height;
  const chin = faceTop + box.faceH;
  const yt = Math.round(Math.max(story ? 420 : 300, Math.min(story ? 700 : 480, chin + box.faceH * 0.3)));
  // He dissolves into the ground above his name, inside the frame.
  const fadeEnd = Math.min(footTop - (story ? 64 : 44), box.top + box.height);
  const fadeLen = story ? 330 : 250;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const line = (s: CSSProperties): CSSProperties => ({ position: "absolute", background: fg, opacity: pale ? 0.9 : 0.92, ...s });
  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: fg }}>
      {/* A faint lift of light behind him, nothing else on the ground. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 46% at 50% ${((yt + 60) / H) * 100}%, ${lift} 0%, transparent 78%)`, opacity: pale ? 0.9 : 0.75 }} />

      {/* The frame: a hairline rectangle, its foot open for the title. Drawn under him. */}
      <div style={line({ left: M, right: M, top: yt, height: lineW })} />
      <div style={line({ left: M, top: yt, width: lineW, height: yb - yt + lineW })} />
      <div style={line({ right: M, top: yt, width: lineW, height: yb - yt + lineW })} />
      <div style={line({ left: M, top: yb, width: 540 - gapHalf - M, height: lineW })} />
      <div style={line({ left: 540 + gapHalf, top: yb, width: 540 - gapHalf - M, height: lineW })} />

      {/* A soft shade behind his torso so a white kit still separates from the ground (never a drop shadow on the cutout). */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: chin, width: box.width * 0.64, height: Math.max(80, fadeEnd - chin - box.faceH), borderRadius: "50%", background: pale ? "rgba(40,36,30,.16)" : "rgba(0,0,0,.22)", filter: `blur(${story ? 80 : 64}px)` }} />

      {/* The player, natural colour, standing in the frame with his head through its top edge. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The title in the gap of the bottom line. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: yb + lineW / 2 - tSize * 0.5 - tSize * 0.035, ...caps(tSize, T_TRACK, 500), color: accent }}>{title}</div>

      {/* Inside the foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nSize, N_TRACK, 600), color: fg }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fSize, F_TRACK, 400), color: soft }}>{fixture}</div>}

      <AgencyLogo data={data} onLight={pale} height={18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={pale ? 0.12 : 0.18} />
    </div>
  );
}
