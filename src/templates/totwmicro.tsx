/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO, ringSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const DIM = "rgba(255,255,255,.6)";
const M = 64;
const MONO_EM = 0.6;

/** Mono size that keeps `t` inside `room` px. */
const fitMono = (t: string, room: number, max: number, min = 10, tracking = 0.14) => Math.max(min, Math.min(max, room / Math.max(1, t.length * (MONO_EM + tracking))));

/**
 * The official league graphic at a fixed height (the wrapper shrinks to the image, so the highlight's
 * percentages land on the graphic), a hairline passe-partout instead of a glowing frame, and his circle
 * marked by a crisp accent ring. A quiet dashed placeholder when the edit has no graphic yet.
 */
function LeagueCard({ data, height, ring, style }: { data: RenderData; height: number; ring: string; style: CSSProperties }) {
  const { insetUrl, content } = data;
  const pad = Math.round(height * 0.018);
  const hl = content.insetHighlight;
  if (!insetUrl) {
    return (
      <div
        style={{
          ...style,
          width: Math.round(height * 0.69),
          height,
          border: "1.5px dashed rgba(255,255,255,.4)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: DIM,
          textAlign: "center",
          padding: 30,
        }}
      >
        Official league graphic
      </div>
    );
  }
  return (
    <div style={{ ...style, padding: pad, border: "1px solid rgba(255,255,255,.42)", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
      <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom" }}>
        <img src={insetUrl} alt="" style={{ height, width: "auto", display: "block", maxWidth: "none" }} />
        {hl && (
          <>
            <div
              style={{
                position: "absolute",
                left: `${hl.x}%`,
                top: `${hl.y}%`,
                width: ringSize(hl, "17.5%"),
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: `${Math.max(3, height * 0.006)}px solid ${ring}`,
                boxShadow: `0 0 0 1.5px rgba(255,255,255,.9), 0 0 18px 2px ${ring}`,
                boxSizing: "border-box",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Team of the Week — micro: a big natural-colour player on a flat deep club ground, every word tiny (small
 * mono caps in the corners: the honour, the competition line, his name) and the official league graphic as a
 * neat mid-size card in the lower corner opposite him, his circle ringed in the club accent.
 */
export function Totwmicro({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  // The player on params.side, the card in the opposite lower corner.
  const left = params.side !== "right";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.6) club = vivid(params.accent);
  if (luminance(club) < 0.04) club = shade(club, 0.3);
  const ground = shade(club, -0.78);
  let ring = vivid(params.accent);
  if (luminance(ring) < 0.1) ring = shade(ring, 0.4);

  /* ---- type ---- */
  const kicker = (content.kicker || "Team of the Week").replace(/’/g, "'").trim().toUpperCase();
  const sub = (content.subline || "").toUpperCase();
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || "").toUpperCase();
  const name = [first, last].filter(Boolean).join(" ");
  const half = CANVAS_W / 2 - M - 30;
  const kSize = fitMono(kicker, half, 15 * S * ts);
  const sSize = fitMono(sub, half, 15 * S * ts);
  const nSize = fitMono(name, CANVAS_W - M * 2 - 40, 17 * S * ts);
  const top = (story ? STORY_TOP : 64) + ty;

  /* ---- the card ---- */
  const logoH = story ? 88 : 52;
  const bottomLine = story ? STORY_BOTTOM : H - 64;
  const cardH = story ? 800 : 640;
  const cardPad = Math.round(cardH * 0.018);
  // Card bottom sits a clear gap above the name/logo row.
  const cardBottom = bottomLine - logoH - (story ? 64 : 44);
  const cardTop = cardBottom - cardH - cardPad * 2;
  const cardW = cardH * 0.69 + cardPad * 2;
  const cardX = left ? CANVAS_W - M - cardW : M;

  /* ---- the player, big, on the other side ---- */
  const faceX = left ? (story ? 360 : 340) : CANVAS_W - (story ? 360 : 340);
  const faceTop = story ? STORY_TOP + 200 : 190;
  // The figure only has to reach the fade above the foot row, not the canvas floor (else it swells in the story).
  const box = placeByFace(story ? { ...data, canvasH: bottomLine - 60 } : data, faceX, faceTop, story ? { chest: 320, waist: 260, knees: 200, full: 150 } : { chest: 280, waist: 230, knees: 180, full: 150 });
  const fadeTo = story ? bottomLine - 40 : H - 120;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 260 - box.top}px, transparent ${fadeTo - box.top}px)`;

  const mono = (s: number, color = WHITE, spacing = 0.14): CSSProperties => ({ fontFamily: MONO, fontSize: s, letterSpacing: `${spacing}em`, color, lineHeight: 1, whiteSpace: "nowrap", textTransform: "uppercase" });
  const sideA = left ? "left" : "right";
  const sideB = left ? "right" : "left";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <filter id="totwmicro-clean" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.1" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
      </svg>
      {/* A breath of light behind him on the flat ground. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${(faceX / CANVAS_W) * 100}% ${story ? 36 : 40}%, ${shade(ground, 0.16)}, ${ground} 78%)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#totwmicro-clean) contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Corners: the honour, the competition line. */}
      <div style={{ position: "absolute", [sideA]: M, top, display: "flex", alignItems: "center", gap: 12 * S, ...mono(kSize) }}>
        <span style={{ display: "inline-block", width: 8 * S, height: 8 * S, background: ring }} />
        {kicker}
      </div>
      {sub && <div style={{ position: "absolute", [sideB]: M, top, ...mono(sSize, DIM), textAlign: left ? "right" : "left" }}>{sub}</div>}
      <div style={{ position: "absolute", left: M, right: M, top: top + kSize + 22 * S, height: 1, background: "rgba(255,255,255,.18)" }} />

      {/* The league graphic, a neat card in the lower corner. */}
      <LeagueCard data={data} height={cardH} ring={ring} style={{ position: "absolute", left: cardX, top: cardTop }} />

      {/* Foot: his name small on his side, the mark on the other. */}
      <div style={{ position: "absolute", [sideA]: M, top: bottomLine - logoH / 2 - nSize / 2, ...mono(nSize, WHITE, 0.16) }}>{name}</div>
      <AgencyLogo
        data={data}
        height={story ? 26 : 22}
        style={{ position: "absolute", [sideB]: M, bottom: H - bottomLine - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
