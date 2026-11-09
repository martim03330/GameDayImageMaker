/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { interEm, Mark } from "./marker";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** The fluorescent ink, a touch hotter than the paper highlighter so it glows on the deep ground. */
const GLOW = "#eeff3d";

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Goal marker: the goal post of `marker`. A deep club-tone ground; at the top, on the side away from him,
 * "Goal" set big in Inter 600 with one fluorescent highlighter swipe dragged across it — the word knocked out
 * of the swipe in the ground's own dark tone, like a page marked up by hand. The celebrating player big on
 * the other side in natural colour, melting into the ground above the foot; at the foot only his name and
 * the fixture (home team first, never the score), the NEYOD mark under them.
 */
export function Goalmarker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const seed = params.seed ?? 0;
  const playerLeft = params.side === "left";
  const M = story ? 72 : 64;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);
  const ground = shade(club, -0.76);
  const lift = shade(club, -0.45);

  /* ---- the fixture, home first, names exactly as stored ---- */
  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join(" v ") : ours || opp;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();

  /* ---- the word, top, on his far side ---- */
  const title = sentence(content.kicker || "Goal");
  const T = -0.04;
  const W600 = 1.035; // Inter 600 runs ~3.5% wider than the 500 table
  const wordW = story ? 720 : 620;
  const tSize = Math.min((story ? 300 : 236) * ts, wordW / Math.max(1, interEm(title, T) * W600));
  const titleTop = (story ? STORY_TOP - tSize * 0.1 : 56 - tSize * 0.06) + ty;
  const titleBottom = titleTop + tSize * 1.02;

  /* ---- the foot, measured up from the logo ---- */
  const colW = CANVAS_W - 2 * M;
  const nSize = Math.max(22, Math.min((story ? 54 : 42) * ts, (colW * 0.9) / Math.max(1, interEm(name, -0.02) * W600)));
  const fSize = Math.max(14, Math.min((story ? 30 : 23) * ts, (colW * 0.9) / Math.max(1, interEm(fixture))));
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const fixTop = logoTop - (story ? 66 : 46) - fSize * 1.05 + ty;
  const nameTop = fixTop - (story ? 18 : 12) - nSize * 1.05;
  const footTop = name ? nameTop : fixTop;

  /* ---- the celebrating player, big on his side ---- */
  const sizes = story ? { chest: 310, waist: 250, knees: 200, full: 158 } : { chest: 246, waist: 196, knees: 158, full: 124 };
  const faceX = playerLeft ? (story ? 350 : 360) : story ? 730 : 720;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  let box = placeByFace(data, faceX, story ? STORY_TOP + 330 : 250, sizes);
  // His face never meets the word: if it would, he steps down below it.
  const fTop = () => box.top + face[1] * box.height;
  const fL = box.left + face[0] * box.width;
  const fR = fL + face[2] * box.width;
  const titleEdge = playerLeft ? CANVAS_W - M - wordW : M + Math.min(wordW, interEm(title, T) * W600 * tSize) + 30;
  const underWord = playerLeft ? fR + box.faceH * 0.3 > titleEdge : fL - box.faceH * 0.3 < titleEdge;
  if (underWord && fTop() - box.faceH * 0.6 < titleBottom + 30) box = placeByFace(data, faceX, titleBottom + 30 + box.faceH * 0.6, sizes);
  const chin = fTop() + box.faceH;
  // An arm flung wide: centre the figure a little rather than the face, never past the canvas centre.
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (playerLeft ? Math.min(0, lean) : Math.max(0, lean)) };
  const fadeEnd = footTop - (story ? 50 : 34) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 280)}px, transparent ${fadeEnd}px)`;

  const align: CSSProperties = playerLeft ? { right: M, textAlign: "right" } : { left: M, textAlign: "left" };
  const tilt = -1.6 + rng(seed * 17 + 5)() * 1.4;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 42% at ${(faceX / CANVAS_W) * 100}% ${((chin + box.faceH) / H) * 100}%, ${lift}, transparent 75%)`, opacity: 0.9 }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word with the fluorescent swipe dragged over it; the word sits in the ground's own tone. */}
      <div style={{ position: "absolute", top: titleTop, ...align, ...(playerLeft ? { right: M + tSize * 0.16 } : {}), fontFamily: SANS, fontWeight: 600, fontSize: tSize, letterSpacing: `${T}em`, lineHeight: 1, whiteSpace: "nowrap", color: ground }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          {/* The swipe goes under the knocked-out word: on a dark ground it is paint, not multiply. */}
          <span style={{ position: "absolute", inset: 0, color: "transparent" }}>
            <Mark text={title} size={tSize} color={GLOW} seed={seed * 7 + 2} tilt={tilt} blend="normal" opacity={1} cover={[0.02, 1.05]} over={[0.12, 0.26]} />
          </span>
          <span style={{ position: "relative" }}>{title}</span>
        </span>
      </div>

      {/* The foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", top: nameTop, ...align, fontFamily: SANS, fontWeight: 600, fontSize: nSize, letterSpacing: "-0.02em", lineHeight: 1.05, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", top: fixTop, ...align, fontFamily: SANS, fontWeight: 500, fontSize: fSize, letterSpacing: "-0.005em", lineHeight: 1.05, whiteSpace: "nowrap", color: "rgba(255,255,255,.62)" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", bottom: logoBottom, [playerLeft ? "right" : "left"]: M, transform: `scale(${logoScale})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
