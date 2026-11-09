/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const MARGIN = 60;
const GROUND = "#ebe8e2";
const INK = "#1a1c22";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly (semibold), with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.62 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.94 : /[!'.,]/.test(c) ? 0.3 : 0.72) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/**
 * Goalbar: a clean light ground crossed by one thick solid club-colour bar — a crossbar, a goal line — at
 * his shoulders. The celebrating player stands over it on one side, his head clear above it; on the free
 * side the title is set in white inside the bar, never under his head. Above and below the bar only empty
 * ground; at the foot of the free side his name and the fixture, small.
 */
export function Goalbar({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // A native 9:16 story (1080×1920): the logo starts at STORY_TOP, the foot ends at STORY_BOTTOM, type a
  // size larger, and the player fills the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.32) club = shade(club, -0.35);
  if (luminance(club) < 0.03) club = shade(club, 0.2);

  /* ---- the player on one side, the type on the other ---- */
  const right = params.side !== "left";
  const sizes = story ? { chest: 244, waist: 184, knees: 146, full: 114 } : { chest: 200, waist: 150, knees: 118, full: 92 };
  const faceTop = story ? 470 : 300;
  let box = placeByFace(data, right ? (story ? 655 : 690) : story ? 425 : 390, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // Keep the free side free: push a wide figure (arms out) towards its edge, the face staying on canvas.
  const faceCx = () => box.left + (face[0] + face[2] / 2) * box.width;
  // (The story's figure is taller, so wider: it may come a little further in, so a raised arm stays on canvas.)
  const keep = story ? 330 : 480;
  if (right && box.left < keep) box = { ...box, left: box.left + Math.min(keep - box.left, Math.max(0, 880 - faceCx())) };
  if (!right && box.left + box.width > CANVAS_W - keep) {
    const over = box.left + box.width - (CANVAS_W - keep);
    box = { ...box, left: box.left - Math.min(over, Math.max(0, faceCx() - 200)) };
  }
  const fTop = box.top + face[1] * box.height;
  const fx0 = box.left + face[0] * box.width;
  const fx1 = fx0 + face[2] * box.width;
  const chin = fTop + box.faceH;

  /* ---- the bar, at his shoulders ---- */
  /* ---- the title inside the bar, on the free side ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const TRACK = 0.02;
  // The free width: up to the figure's edge (never past his head when the figure is very wide).
  const freeR = right ? Math.max(box.left - 28, Math.min(fx0 - 60, 420)) : CANVAS_W - MARGIN;
  const freeL = right ? MARGIN : Math.min(box.left + box.width + 28, Math.max(fx1 + 60, CANVAS_W - 420));
  const freeW = Math.max(200, freeR - freeL);
  const capH = 0.727;
  const titleSize = Math.min(150 / capH, freeW / Math.max(1, capsEm(title, TRACK))) * ts;
  // The bar is cut to the title: thick, the caps filling a little over half of it.
  const barH = Math.max(180, Math.min(270, (titleSize * capH) / 0.48));
  const barTop = chin + box.faceH * 0.2 + (params.textY ?? 0);
  const titleTop = barTop + (barH - titleSize * capH) / 2 - titleSize * 0.13;

  /* ---- the foot: his name, then the fixture ---- */
  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(oursName);
  const pair = (weHost ? [ours, opp] : [opp, ours]).filter(Boolean);
  const fixture = pair.length === 2 ? `${pair[0]}  v  ${pair[1]}` : (f.comp || "").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const footW = story ? 620 : Math.min(520, Math.max(280, freeW + 40));
  const NAME_TRACK = 0.2;
  const nameSize = Math.max(14, Math.min(22 * k, footW / Math.max(1, capsEm(name, NAME_TRACK)))) * ts;
  const FIX_TRACK = 0.24;
  const fixSize = Math.max(11, Math.min((story ? 15 : 14) * k, footW / Math.max(1, capsEm(fixture, FIX_TRACK)))) * ts;
  const footBottom = story ? H - STORY_BOTTOM : 64;
  const align: CSSProperties = right ? { left: MARGIN, textAlign: "left" } : { right: MARGIN, textAlign: "right" };
  const caps = (size: number, track: number, weight: number): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    ...(right ? {} : { marginRight: `-${track}em` }),
  });

  const fade = "linear-gradient(to bottom, #000 0, #000 calc(100% - 120px), transparent 100%)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 40%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)" }} />

      {/* The bar, edge to edge. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: barTop, height: barH, background: club }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: barTop, height: barH, background: "linear-gradient(to bottom, rgba(255,255,255,.07), rgba(0,0,0,.08))" }} />

      {/* The title in the bar, on the free side. */}
      <div style={{ position: "absolute", top: titleTop, ...(right ? { left: freeL } : { right: CANVAS_W - freeR }), fontFamily: SANS, fontWeight: 700, fontSize: titleSize, lineHeight: 1, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", color: "#ffffff" }}>
        {title}
      </div>

      {/* A soft shade where he meets the bar, then the player, natural colour. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: barTop - 10, width: box.width * 0.64, height: barH * 0.6, borderRadius: "50%", background: "rgba(0,0,0,.16)", filter: "blur(40px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The foot, on the free side. */}
      {name && <div style={{ position: "absolute", bottom: footBottom + fixSize + 18 * k, ...align, ...caps(nameSize, NAME_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", bottom: footBottom, ...align, ...caps(fixSize, FIX_TRACK, 400), color: "rgba(26,28,34,.66)" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 22}
        onLight
        style={{ position: "absolute", top: (story ? STORY_TOP : 56) - (params.logoY ?? 0), ...(right ? { left: MARGIN } : { right: MARGIN }), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left top" : "right top" }}
      />
      <Film strength={0.15} />
    </div>
  );
}
