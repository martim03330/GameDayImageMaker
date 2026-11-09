/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { interEm } from "./marker";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#efece6";
const INK = "#141518";
const GREY = "#86847f";

/** "HAT-TRICK" → "Hat-trick", "GOAL!" → "Goal" (the full stop is ours). */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").replace(/[.!]+$/, "").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Goal punct: one statement — "Goal." The word set enormous in Inter 500, sentence case, across the top of
 * a warm paper ground, and its full stop blown up into a big, perfect circle in the club colour: the hero
 * of the post. The celebrating player stands under it in natural colour, his head just below the baseline
 * and a raised fist free to rise in front of the dot; he melts into the paper above the foot, where only
 * his name and the fixture (home team first, never the score) sit small, over the NEYOD mark.
 * Not `goalcircle` (a sun behind his head, small title) nor `goalunderline` (word + bar beside him).
 */
export function Goalpunct({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const playerLeft = params.side === "left";
  const M = story ? 64 : 58;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.42) club = vivid(params.accent);
  if (luminance(club) > 0.42) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  /* ---- the fixture, home first, names exactly as stored ---- */
  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join(" v ") : ours || opp;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();

  /* ---- "Goal." across the top: the word, then the dot ---- */
  const title = sentence(content.kicker || "Goal");
  const T = -0.045;
  const DOT = 0.44; // the full stop's diameter, in ems (Inter's own is ~0.12): under the x-height, so it still reads as a stop
  const GAP = 0.05;
  const width = CANVAS_W - 2 * M;
  const tSize = Math.min((story ? 380 : 360) * ts, width / (interEm(title, T) + GAP + DOT));
  const D = tSize * DOT;
  const titleTop = (story ? STORY_TOP - tSize * 0.13 : 50 - tSize * 0.1) + ty;
  const baseline = titleTop + tSize * 0.863;
  const rowW = (interEm(title, T) + GAP + DOT) * tSize;
  // The row sits on the side away from him when there is room to spare, so the dot leans towards him.
  const rowLeft = playerLeft ? CANVAS_W - M - rowW : M;
  const dotCx = rowLeft + rowW - D / 2;

  /* ---- the foot, measured up from the logo ---- */
  const footW = CANVAS_W - 2 * M;
  const nSize = Math.max(22, Math.min((story ? 54 : 40) * ts, (footW * 0.9) / Math.max(1, interEm(name, -0.02) * 1.035)));
  const fSize = Math.max(14, Math.min((story ? 30 : 22) * ts, (footW * 0.9) / Math.max(1, interEm(fixture))));
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const fixTop = logoTop - (story ? 66 : 46) - fSize * 1.05 + ty;
  const nameTop = fixTop - (story ? 18 : 12) - nSize * 1.05;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player, under the word, on the dot's side ---- */
  const sizes = story ? { chest: 350, waist: 290, knees: 228, full: 182 } : { chest: 270, waist: 222, knees: 178, full: 140 };
  const faceX = playerLeft ? Math.max(story ? 330 : 320, Math.min(540, dotCx)) : Math.min(story ? 750 : 760, Math.max(540, dotCx - D * 0.4));
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const first = placeByFace(data, faceX, baseline + 100, sizes);
  // The whole head (hair ~0.6 face-height above the face box) clears the baseline.
  let box = placeByFace(data, faceX, baseline + (story ? 50 : 30) + first.faceH * 0.62, sizes);
  const lean = Math.max(-70, Math.min(70, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean * 0.5 };
  const chin = box.top + (face[1] + face[3]) * box.height;
  const fadeEnd = footTop - (story ? 50 : 34) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 270)}px, transparent ${fadeEnd}px)`;

  const footAlign: CSSProperties = playerLeft ? { right: M, textAlign: "right" } : { left: M, textAlign: "left" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 42% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.7), transparent 72%)` }} />

      {/* The word and its full stop, a perfect circle in the club colour sitting on the baseline. */}
      <div style={{ position: "absolute", left: rowLeft, top: titleTop, fontFamily: SANS, fontWeight: 500, fontSize: tSize, letterSpacing: `${T}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK }}>
        {title}
        <span style={{ display: "inline-block", width: D, height: D, marginLeft: tSize * (GAP - T), borderRadius: "50%", background: club, verticalAlign: "baseline" }} />
      </div>

      {/* A soft shade under his shoulders, then the player in natural colour, in front of the type. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin, width: box.width * 0.6, height: Math.max(60, Math.min(box.faceH * 4.2, box.top + fadeEnd - chin - 160)), borderRadius: "50%", background: "rgba(40,34,28,.10)", filter: `blur(${story ? 70 : 56}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", top: nameTop, ...footAlign, fontFamily: SANS, fontWeight: 600, fontSize: nSize, letterSpacing: "-0.02em", lineHeight: 1.05, whiteSpace: "nowrap", color: INK }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", top: fixTop, ...footAlign, fontFamily: SANS, fontWeight: 500, fontSize: fSize, letterSpacing: "-0.005em", lineHeight: 1.05, whiteSpace: "nowrap", color: GREY }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", bottom: logoBottom, [playerLeft ? "right" : "left"]: M, transform: `scale(${logoScale})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
