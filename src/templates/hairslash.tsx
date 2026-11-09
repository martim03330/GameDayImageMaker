/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { fitInter, fixtureOf } from "./datestamp";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1efea";
const INK = "#15161a";

/**
 * Hair slash: a clean paper ground crossed corner to corner by one thin hairline in the club colour, the
 * cutout player centred in front of it. The home team sits above-left of the line, the away team
 * below-right (exact names, Inter 500); the date, kick-off and ground run tiny along the line itself.
 * The NEYOD mark bottom-left, the title tiny top-right.
 */
export function Hairslash({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.42) club = vivid(params.accent);
  if (luminance(club) > 0.42) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  const { f, teams } = fixtureOf(data);
  const [home, away] = [teams[0] ?? "", teams[1] ?? ""];

  /* ---- the line: from low on the left edge to high on the right edge ---- */
  const M = story ? 72 : 64;
  const yL = story ? 1500 : 1100;
  const yR = story ? 430 : 290;
  const ang = Math.atan2(yR - yL, CANVAS_W);
  const len = Math.hypot(CANVAS_W, yL - yR);
  const yAt = (x: number) => yL + ((yR - yL) * x) / CANVAS_W;

  /* ---- teams ---- */
  const nameW = story ? 700 : 560;
  const nSize = Math.min(fitInter(home, nameW, 44 * S * ts, -0.01, 18), fitInter(away, nameW, 44 * S * ts, -0.01, 18));
  const homeTop = (story ? STORY_TOP : 72) + ty;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const awayBottom = logoBottom + (logoH - nSize * 0.86) / 2; // optically level with the logo

  /* ---- tiny facts riding the line ---- */
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ").toUpperCase();
  const fSize = Math.max(10, Math.min(13 * S, 520 / Math.max(1, facts.length * 0.78)));
  const title = (content.kicker || "MATCHDAY").toUpperCase();
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ").toUpperCase();
  const capSize = 13 * S * ts;

  /* ---- the player, centred, the line behind him ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const box = placeByFace(data, faceX, story ? 520 : 300, story ? { chest: 300, waist: 236, knees: 186, full: 146 } : { chest: 210, waist: 166, knees: 130, full: 102 });
  // He melts into the paper above the foot so the away name and the logo sit on clean ground.
  const fadeTo = (story ? STORY_BOTTOM - 150 : CANVAS_H - 150) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 360 : 280)}px, transparent ${fadeTo}px)`;

  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, color: INK };
  // Facts start just inside the left edge, sitting on top of the line.
  const fx0 = M;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% ${((box.top + box.faceH * 3) / H) * 100}%, rgba(255,255,255,.75), transparent 75%)` }} />

      {/* The hairline. */}
      <div style={{ position: "absolute", left: 0, top: yL, width: len, height: story ? 2 : 1.5, background: club, transform: `rotate(${ang}rad)`, transformOrigin: "0 50%" }} />
      {/* Date, kick-off, ground: tiny, riding the line. */}
      {facts && (
        <div
          style={{
            position: "absolute",
            left: fx0,
            top: yAt(fx0) - fSize - 10 * S,
            transform: `rotate(${ang}rad)`,
            transformOrigin: `0 ${fSize + 10 * S}px`,
            ...caps,
            fontSize: fSize,
            letterSpacing: "0.22em",
            color: shade(club, -0.15),
          }}
        >
          {facts}
        </div>
      )}

      {/* The player, in front of the line. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Home above-left of the line, away below-right. */}
      {home && <div style={{ position: "absolute", left: M, top: homeTop, fontFamily: SANS, fontWeight: 500, fontSize: nSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap" }}>{home}</div>}
      {comp && <div style={{ position: "absolute", left: M, top: homeTop + nSize + 16 * S, ...caps, fontSize: capSize * 0.86, letterSpacing: "0.24em", color: "rgba(21,22,26,.55)" }}>{comp}</div>}
      <div style={{ position: "absolute", right: M, top: homeTop + nSize * 0.86 - capSize, ...caps, fontSize: capSize, letterSpacing: "0.32em", marginRight: "-0.32em", color: shade(club, -0.15) }}>{title}</div>
      {away && <div style={{ position: "absolute", right: M, bottom: awayBottom, fontFamily: SANS, fontWeight: 500, fontSize: nSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", textAlign: "right" }}>{away}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 20}
        style={{ position: "absolute", left: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.14} />
    </div>
  );
}
