/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { Brackets } from "./viewfinder";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const DIM = "rgba(255,255,255,.62)";
const REC = "#ff3b30";

/** Inter capitals and figures: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28, "/": 40 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 63) / 100 + tracking, 0);
const fit = (t: string, width: number, max: number, tracking: number, min = 10) => Math.max(min, Math.min(max, width / Math.max(0.5, capsEm(t, tracking))));

/** Home team first, names exactly as stored (only the case may change). */
function teamsOf(data: RenderData): string[] {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? c.homeTeam : c.awayTeam) || ours).trim();
  const oppName = ((weHost ? c.awayTeam : c.homeTeam) || f.opp || "").trim();
  return (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean);
}

/**
 * Goal viewfinder: the camera catching the celebration. The celebrating player big on a dark, club-graded
 * ground made of his own photo melted away; four white autofocus corners snap tight around his shouting
 * face (a square lock, nothing over the face itself). The HUD is spare: a red dot and GOAL top left, the
 * competition top right, and at the foot his name in larger caps over the fixture (home first, never the
 * score), the NEYOD mark in the last corner.
 */
export function Goalviewfinder({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.38 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);
  const ground = shade(club, -0.74);

  const f = matchFacts(data);
  const teams = teamsOf(data);

  /* ---- HUD ---- */
  const M = story ? 64 : 56;
  const top = (story ? STORY_TOP : 56) + ty;
  const logoScale = params.logoScale ?? 1;
  const logoH = story ? 88 : 52;
  const logoW = logoH * 3.06 * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 52;

  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const tSize = fit(title, 420, 19 * k, 0.3, 12);
  const comp = titleCase(f.comp || f.round || "").trim().toUpperCase();
  const cSize = fit(comp, story ? 560 : 500, 12.5 * k, 0.2, 9);

  const footW = CANVAS_W - 2 * M - logoW - 48;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const nSize = fit(name, footW, 34 * k, 0.08, 16);
  const fixture = teams.map((t) => t.toUpperCase()).join("  v  ");
  const fixSize = fit(fixture, footW, 14 * k, 0.18, 9);
  const fixTop = footBottom - fixSize;
  const nameTop = fixTop - 16 * k - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player: big, a little off-centre, face high ---- */
  const sizes = story ? { chest: 330, waist: 270, knees: 214, full: 168 } : { chest: 240, waist: 200, knees: 156, full: 122 };
  const shift = params.side === "left" ? -60 : params.side === "right" ? 60 : 0;
  let box = placeByFace(data, 540 + shift, story ? 470 : 270, sizes);
  // Arms flung to one side: centre the figure a little rather than only the face.
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fH = box.faceH;
  const realTop = box.top + face[1] * box.height;
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceCy = realTop + fH / 2;

  const fadeEnd = footTop - (story ? 60 : 40) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 280)}px, transparent ${fadeEnd}px)`;

  /* ---- the lock: a tight square on the face ---- */
  const side = Math.max(story ? 220 : 160, fH * 1.75);
  const lx = faceCx - side / 2;
  const ly = faceCy - side / 2;
  const arm = Math.round(side * 0.17);
  const stroke = story ? 4 : 3;

  const caps = (size: number, track: number, weight = 500, color = WHITE): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color,
    fontVariantNumeric: "tabular-nums",
    textShadow: "0 1px 10px rgba(0,0,0,.35)",
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {data.bgPhotoUrl && (
        <img
          src={data.bgPhotoUrl}
          alt=""
          style={{ position: "absolute", left: -160, top: -160, width: CANVAS_W + 320, height: H + 320, maxWidth: "none", objectFit: "cover", filter: "blur(60px) saturate(.6) brightness(.8)", opacity: 0.55 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.35 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 34% at ${(faceCx / CANVAS_W) * 100}% ${((faceCy + fH) / H) * 100}%, rgba(255,255,255,.13), transparent 75%)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 520 : 300, background: "linear-gradient(to bottom, rgba(0,0,0,.32), transparent)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 680 : 440, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.45))" }} />

      {/* The focus lock, tight on the face. */}
      <Brackets x={lx} y={ly} w={side} h={side} arm={arm} stroke={stroke} color={WHITE} />

      {/* HUD: GOAL top left, the competition top right. */}
      <div style={{ position: "absolute", left: M, top, display: "flex", alignItems: "center", gap: 12 * k }}>
        <div style={{ width: 10 * k, height: 10 * k, borderRadius: "50%", background: REC, boxShadow: "0 0 10px rgba(255,59,48,.55)" }} />
        <div style={caps(tSize, 0.3, 600)}>{title}</div>
      </div>
      {comp && <div style={{ position: "absolute", right: M, top: top + (tSize - cSize) / 2, ...caps(cSize, 0.2, 500, DIM), marginRight: "-0.2em" }}>{comp}</div>}

      {/* HUD foot: name over the fixture. */}
      {name && <div style={{ position: "absolute", left: M, top: nameTop, ...caps(nSize, 0.08, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, top: fixTop, ...caps(fixSize, 0.18, 500, DIM) }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", right: M, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "right bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
