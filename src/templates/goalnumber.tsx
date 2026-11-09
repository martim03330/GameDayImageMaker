/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film, GradientMapDefs, type Box } from "./fx";
import { rng } from "./kit";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 60;

/** Inter advance widths per 100px for the numerals. */
const NUM_W: Record<string, number> = { "0": 60.4, "1": 38, "2": 61.8, "3": 59.4, "4": 61.2, "5": 56.6, "6": 58.3, "7": 55.3, "8": 60.4, "9": 58.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : /[!'.,]/.test(c) ? 0.3 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/** A back shot without a usable face: the top of the cutout at `top`, the body running off the foot. */
function placeBack(data: RenderData, top: number): Box {
  const p = data.params;
  const H = data.canvasH ?? CANVAS_H;
  const aspect = data.photoAspect ?? 0.6;
  const scale = p.playerScale ?? 1;
  let h = (H + 40 - top) * scale;
  if (h * aspect > 900 * scale) h = (900 * scale) / aspect;
  const w = h * aspect;
  return { left: 540 - w / 2 + (p.playerX ?? 0), top: top + (p.playerY ?? 0), width: w, height: h };
}

/**
 * Goalnumber: the goal post of `backline`. A quiet deep club-tone ground (his own photo melted into one
 * hue), the celebrating player centred, and his shirt number huge behind him as a hairline outline (the
 * title as the outline word when he has no number). The title small and wide-tracked at the top; at the
 * foot his name and the fixture (home v away), small.
 */
export function Goalnumber({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 1);
  const flat = r() < 0.4;
  // A native 9:16 story (1080×1920): the title starts at STORY_TOP, the logo ends at STORY_BOTTOM, type a
  // size larger, and the player and his number fill the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const deep = shade(club, -0.74);
  const mid = shade(club, -0.52);
  const light = shade(club, -0.22);

  const f = matchFacts(data);

  /* ---- top: the title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const TITLE_TRACK = 0.62;
  const titleSize = Math.max(14, Math.min(22 * k, 760 / Math.max(1, capsEm(title, TITLE_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 76) + (params.textY ?? 0);

  /* ---- the foot: his name, then the fixture, home team first ---- */
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const oppName = (typed ?? f.opp ?? "").trim();
  const homeName = shortName(content.homeTeam?.trim() || (weHost ? oursName : oppName));
  const awayName = shortName(content.awayTeam?.trim() || (weHost ? oppName : oursName));
  const vs = homeName && awayName ? `${homeName}  v  ${awayName}` : oppName ? `v ${shortName(oppName)}` : (f.comp || "").toUpperCase();
  const VS_TRACK = 0.3;
  const vsSize = Math.max(11, Math.min(15 * k, (story ? 900 : 860) / Math.max(1, capsEm(vs, VS_TRACK)))) * ts;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const vsTop = story ? STORY_BOTTOM - 88 - 62 - vsSize : CANVAS_H - 44 - 30 - 50;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const NAME_TRACK = 0.42;
  const nameSize = Math.max(16, Math.min(28 * k, 860 / Math.max(1, capsEm(name, NAME_TRACK)))) * ts;
  const nameTop = vsTop - 22 * k - nameSize;

  /* ---- the player: by his face when the photo has one, else by his outline ---- */
  const back = !data.face || data.face[3] < 0.035;
  const figTop = titleTop + titleSize + (story ? 130 : 96);
  const sizes = story ? { chest: 280, waist: 210, knees: 160, full: 128 } : { chest: 210, waist: 156, knees: 120, full: 96 };
  let box: Box = back ? placeBack(data, figTop) : placeByFace(data, 540, figTop + 30, sizes);
  if (!back) {
    // A fist raised to one side: centre the figure a little rather than the face.
    const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
    box = { ...box, left: box.left + lean };
  }
  const fadeEnd = nameTop - 30;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 300 - box.top}px, transparent ${fadeEnd - box.top}px)`;

  /* ---- the outline behind him: his number, else the title ---- */
  const num = (data.player.number || "").replace(/\D/g, "").slice(0, 2);
  const word = num || title;
  const em = num ? plain(num).reduce((a, c) => a + (NUM_W[c] ?? 60) / 100, 0) : capsEm(title, -0.02);
  const bigSize = Math.min(num ? (story ? 1300 : 1060) : 420, 960 / Math.max(0.5, em));
  // The cap height starts a little above his head, so it frames his shoulders.
  const bigBase = num ? Math.min(figTop - 50 + bigSize * 0.727, H - 160) : figTop + 120 + bigSize * 0.727;

  const own = data.bgPhotoUrl ?? sceneOf(data);
  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: mid, color: WHITE }}>
      <GradientMapDefs id="goalnumber-tone" dark={deep} mid={mid} light={light} />

      {/* Ground: one deep hue — his photo melted into it, or flat with a soft lift behind him. */}
      {!flat && own && (
        <img
          src={own}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(40px) url(#goalnumber-tone) contrast(.75)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 44%, ${flat ? shade(club, -0.38) : "transparent"}, ${deep}${flat ? "" : "aa"} 100%)` }} />

      {/* The number (or the title), a hairline outline, huge behind him. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <text
          x={540}
          y={bigBase}
          textAnchor="middle"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontWeight={600}
          fontSize={bigSize}
          letterSpacing={-bigSize * 0.02}
          fill="none"
          stroke="rgba(255,255,255,.5)"
          strokeWidth={num ? 1.6 : 1.3}
        >
          {word}
        </text>
      </svg>

      {/* A soft shade behind him, then the player, natural colour, melting away above the foot. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: box.top + box.height * 0.2, width: box.width * 0.7, height: box.height * 0.45, borderRadius: "50%", background: "rgba(0,0,0,.25)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the title, small and wide. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(titleSize, TITLE_TRACK, 500) }}>{title}</div>
      <div style={{ position: "absolute", left: 540 - 22, top: titleTop + titleSize + 24 * k, width: 44 * k, height: 1, background: "rgba(255,255,255,.55)" }} />

      {/* Foot: his name, then the opponent. */}
      {name && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: nameTop, ...caps(nameSize, NAME_TRACK, 300) }}>{name}</div>}
      {vs && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: vsTop, ...caps(vsSize, VS_TRACK, 500), opacity: 0.75 }}>{vs}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.22} />
    </div>
  );
}
