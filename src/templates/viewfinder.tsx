/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const DIM = "rgba(255,255,255,.62)";
const REC = "#ff3b30";

/** Inter capitals and figures: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28, "/": 40 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 63) / 100 + tracking, 0);
/** The biggest size (≤ max, ≥ min) at which the caps line fits `width`. */
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

/** Four thin L-shaped corners around a box, and an optional tiny cross at its centre. */
export function Brackets({ x, y, w, h, arm, stroke, color, cross }: { x: number; y: number; w: number; h: number; arm: number; stroke: number; color: string; cross?: number }) {
  const b = `${stroke}px solid ${color}`;
  const corner = (extra: CSSProperties): CSSProperties => ({ position: "absolute", width: arm, height: arm, ...extra });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, filter: "drop-shadow(0 0 5px rgba(0,0,0,.35))" }}>
      <div style={corner({ left: 0, top: 0, borderLeft: b, borderTop: b })} />
      <div style={corner({ right: 0, top: 0, borderRight: b, borderTop: b })} />
      <div style={corner({ left: 0, bottom: 0, borderLeft: b, borderBottom: b })} />
      <div style={corner({ right: 0, bottom: 0, borderRight: b, borderBottom: b })} />
      {cross ? (
        <>
          <div style={{ position: "absolute", left: w / 2 - cross / 2, top: h / 2 - stroke / 2, width: cross, height: stroke, background: color }} />
          <div style={{ position: "absolute", left: w / 2 - stroke / 2, top: h / 2 - cross / 2, width: stroke, height: cross, background: color }} />
        </>
      ) : null}
    </div>
  );
}

/**
 * Viewfinder: the frame as seen through a camera at the moment it focuses. His own photo melted into a dark,
 * club-graded ground; the player sharp and centred; four thin white autofocus corners lock onto his head and
 * shoulders with a tiny cross at their centre and his name as the focus tag. Small tracked caps sit in the
 * canvas corners like a camera HUD: a red dot and MATCHDAY over the competition, the kick-off top right, and
 * at the foot the fixture (home first) over date · ground, the NEYOD mark in the last corner.
 */
export function Viewfinder({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.38 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);
  const ground = shade(club, -0.72);

  const f = matchFacts(data);
  const teams = teamsOf(data);

  /* ---- HUD geometry ---- */
  const M = story ? 64 : 56;
  const top = (story ? STORY_TOP : 56) + ty;
  const logoScale = params.logoScale ?? 1;
  const logoH = story ? 88 : 52;
  const logoW = logoH * 3.06 * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 52;

  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const tSize = fit(title, 440, 19 * k, 0.26, 12);
  const comp = titleCase(f.comp || f.round || "").trim().toUpperCase();
  const cSize = fit(comp, story ? 600 : 560, 12.5 * k, 0.2, 9);
  const time = f.time;
  const kickLabel = time ? "KICK-OFF" : "";
  const tr = time || niceDate(content.date).toUpperCase();

  const fixture = teams.map((t) => t.toUpperCase()).join("  v  ");
  const fixW = CANVAS_W - 2 * M - logoW - 48;
  const fixSize = fit(fixture, fixW, 18 * k, 0.16, 11);
  const facts = [niceDate(content.date), titleCase(f.venue)].filter(Boolean).join("  ·  ").toUpperCase();
  const factSize = fit(facts, fixW, 13 * k, 0.18, 9);
  const footTop = footBottom - (facts ? factSize + 12 * k : 0) - fixSize;

  /* ---- the player, centred, head in the upper third ---- */
  const faceTop = story ? 520 : 318;
  const sizes = story ? { chest: 300, waist: 250, knees: 196, full: 150 } : { chest: 218, waist: 180, knees: 140, full: 108 };
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fH = box.faceH;
  const realTop = box.top + face[1] * box.height;
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;

  // He melts into the ground above the foot of the HUD.
  const fadeEnd = footTop - (story ? 60 : 40) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 260)}px, transparent ${fadeEnd}px)`;

  /* ---- the autofocus frame: head and shoulders ---- */
  const fw = Math.min(CANVAS_W - 2 * M - 40, fH * 3.1);
  const fh = Math.min(footTop - 120 - (realTop - fH * 0.55), fH * 3.9);
  const fx = Math.max(M + 20, Math.min(CANVAS_W - M - 20 - fw, faceCx - fw / 2));
  const fy = realTop - fH * 0.55;
  const arm = Math.round((story ? 58 : 44) * Math.min(1.15, Math.max(0.8, fw / 560)));
  const stroke = story ? 4 : 3;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const nSize = fit(name, fw, 13 * k, 0.24, 10);

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
      {/* The ground: his own photo melted to soft fields, graded down into the club's darkest tone. */}
      {data.bgPhotoUrl && (
        <img
          src={data.bgPhotoUrl}
          alt=""
          style={{ position: "absolute", left: -160, top: -160, width: CANVAS_W + 320, height: H + 320, maxWidth: "none", objectFit: "cover", filter: "blur(60px) saturate(.6) brightness(.8)", opacity: 0.55 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.35 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 38% at ${(faceCx / CANVAS_W) * 100}% ${((fy + fh / 2) / H) * 100}%, rgba(255,255,255,.12), transparent 75%)` }} />

      {/* The player, sharp and natural. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* A quiet darkening at the edges, so the HUD reads. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 520 : 300, background: "linear-gradient(to bottom, rgba(0,0,0,.32), transparent)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 640 : 420, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.42))" }} />

      {/* The autofocus lock and its tag. */}
      <Brackets x={fx} y={fy} w={fw} h={fh} arm={arm} stroke={stroke} color={WHITE} cross={story ? 26 : 20} />
      {name && <div style={{ position: "absolute", left: fx, top: fy - nSize - 14 * k, ...caps(nSize, 0.24, 500) }}>{name}</div>}

      {/* HUD: top left, the title over the competition. */}
      <div style={{ position: "absolute", left: M, top, display: "flex", alignItems: "center", gap: 12 * k }}>
        <div style={{ width: 10 * k, height: 10 * k, borderRadius: "50%", background: REC, boxShadow: "0 0 10px rgba(255,59,48,.55)" }} />
        <div style={caps(tSize, 0.26, 600)}>{title}</div>
      </div>
      {comp && <div style={{ position: "absolute", left: M, top: top + tSize + 14 * k, ...caps(cSize, 0.2, 500, DIM) }}>{comp}</div>}

      {/* HUD: top right, the kick-off. */}
      {tr && (
        <div style={{ position: "absolute", right: M, top, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 * k }}>
          <div style={caps(tSize, 0.12, 600)}>{tr}</div>
          {kickLabel && <div style={caps(cSize, 0.2, 500, DIM)}>{kickLabel}</div>}
        </div>
      )}

      {/* HUD: the foot, the fixture over date · ground. */}
      {fixture && <div style={{ position: "absolute", left: M, top: footTop, ...caps(fixSize, 0.16, 600) }}>{fixture}</div>}
      {facts && <div style={{ position: "absolute", left: M, top: footBottom - factSize, ...caps(factSize, 0.18, 500, DIM) }}>{facts}</div>}

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", right: M, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "right bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
