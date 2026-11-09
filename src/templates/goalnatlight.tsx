"use client";
/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { FACES, wordEm } from "./goalhero";
import { clearSpot, GRID, layPhoto, originalOf, useNatAlign } from "./goalnatalign";
import { deepClub, inkFor, logoPx, NameLine, nameOf, photoStyle } from "./goalnatword";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#f4f1ea";

/**
 * Natural goal · light — his celebration photo with a gentle, natural light treatment: a soft warm
 * sunlight bloom falling from one top corner (the brighter one in the photo) and a very light vignette.
 * The kicker set large across the grass at the foot in off-white with a subtle shadow, his name spaced
 * above it. The NEYOD logo small at the top. Nothing else.
 */
export function Goalnatlight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const club = deepClub(data);
  const orig = originalOf(data);
  const { align } = useNatAlign(data);
  const face = FACES.archivo;

  /* ---- the word at the foot, the name above it ---- */
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const M = story ? 64 : 70;
  const size = Math.min((W - 2 * M) / Math.max(0.5, wordEm(face, word)), (story ? 260 : 210) / face.cap) * ts;
  const capH = size * face.cap;
  const baseline = (story ? STORY_BOTTOM : H - 72) + (params.textY ?? 0);
  const capTop = baseline - capH;
  const name = nameOf(data);
  const nameSize = Math.min((story ? 32 : 25) * ts, 860 / Math.max(1, name.length * 1.12));
  const nameTop = capTop - (story ? 40 : 30) - nameSize;

  /* ---- the photo: his face in the upper part, clear of the type ---- */
  const faceH = (story ? 150 : 116) * (params.playerScale ?? 1);
  const side = params.side === "left" ? -60 : params.side === "right" ? 60 : 0;
  const lay = align && data.face ? layPhoto(align, data.face, W, H, W / 2 + side + (params.playerX ?? 0), H * (story ? 0.27 : 0.25) + (params.playerY ?? 0), faceH, 2.4) : null;

  // The sun comes from the brighter top corner of the photo (else top-left).
  let fromRight = false;
  if (align) {
    const row = (x0: number, x1: number) => {
      let s = 0;
      for (let y = 0; y < GRID / 3; y++) for (let x = x0; x < x1; x++) s += align.lum[y * GRID + x];
      return s;
    };
    fromRight = row(GRID / 2, GRID) > row(0, GRID / 2) * 1.04;
  }
  const ink = align && lay ? inkFor(align, lay, M, nameTop - 10, W - M, baseline, "#17191c") : INK;
  const dark = ink !== INK;
  const logoH = logoPx(24, story);
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  // Top centre, unless his head is there: then the clearer top corner.
  const logoW = logoH * 3;
  const spots = [W / 2 - logoW / 2, M, W - M - logoW];
  const spot = align && lay ? clearSpot(align, lay.fig, spots.map((x) => ({ x, y: logoTop, w: logoW, h: logoH }))) : 0;
  const logoX = spots[spot];
  const logoDark = align && lay ? inkFor(align, lay, logoX, logoTop, logoX + logoW, logoTop + logoH, club) !== INK : false;

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#1b1d1a" }}>
      {align && lay ? (
        <>
          <img src={orig!} alt="" style={photoStyle(lay, align, "contrast(1.03) saturate(1.05) sepia(.04)")} />
          {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: lay.fig.x, top: lay.fig.y, width: lay.fig.w, height: lay.fig.h, maxWidth: "none", filter: "contrast(1.03) saturate(1.05) sepia(.04)" }} />}
        </>
      ) : (
        orig && <img src={orig} alt="" style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", objectPosition: "50% 25%" }} />
      )}

      {/* Sunlight: a warm bloom from one top corner, and a faint warm wash over the whole frame. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(85% 70% at ${fromRight ? "96%" : "4%"} 0%, rgba(255,222,160,.85), rgba(255,196,125,.42) 32%, rgba(255,180,110,.12) 62%, transparent 82%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${fromRight ? "215deg" : "145deg"}, rgba(255,196,120,.45), rgba(255,196,120,.12) 45%, transparent 70%)`,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />
      {/* A very light vignette, and a soft shade on the grass under the word. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 42%, transparent 58%, rgba(0,0,0,.32) 100%)", pointerEvents: "none" }} />
      {!dark && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - nameTop + 120, background: "linear-gradient(to top, rgba(0,0,0,.42), rgba(0,0,0,.16) 60%, transparent)" }} />}

      <svg width={W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={W / 2}
          y={size * (1 - face.cap) * 0.9 + capH}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: ink, letterSpacing: `${face.tracking ?? 0}em`, filter: dark ? undefined : "drop-shadow(0 4px 18px rgba(0,0,0,.35))" }}
        >
          {word}
        </text>
      </svg>
      <NameLine name={name} top={nameTop} size={nameSize} color={ink === INK ? INK : "#1d2024"} />

      <AgencyLogo
        data={data}
        height={24}
        onLight={logoDark}
        style={{
          position: "absolute",
          ...(spot === 0 ? { left: "50%", transform: `translateX(-50%) scale(${params.logoScale ?? 1})` } : spot === 1 ? { left: M, transform: `scale(${params.logoScale ?? 1})` } : { right: M, transform: `scale(${params.logoScale ?? 1})` }),
          top: logoTop,
          transformOrigin: spot === 0 ? "center top" : spot === 1 ? "left top" : "right top",
        }}
      />
    </div>
  );
}
