/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS, ringSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const M = 64;

/** Inter capitals, roughly, per 1px of font size, with the tracking added per glyph. */
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, tracking: number) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/** Luminance → a ramp of shades of the one club hue, with a gentle S-curve so the figure keeps its form. */
function ToneMap({ id, stops, contrast }: { id: string; stops: string[]; contrast: number }) {
  const c = stops.map(rgb);
  const table = (i: number) => c.map((s) => s[i].toFixed(3)).join(" ");
  const off = (0.5 - 0.5 * contrast).toFixed(3);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.28 0.6 0.12 0 0  0.28 0.6 0.12 0 0  0.28 0.6 0.12 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={contrast} intercept={off} />
          <feFuncG type="linear" slope={contrast} intercept={off} />
          <feFuncB type="linear" slope={contrast} intercept={off} />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table(0)} />
          <feFuncG type="table" tableValues={table(1)} />
          <feFuncB type="table" tableValues={table(2)} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

/**
 * The official league graphic, large and in full colour (the wrapper shrinks to the image so the highlight's
 * percentages land on it), his circle ringed in the pale tint. A quiet dashed placeholder without a graphic.
 */
function LeagueGraphic({ data, height, ring, style }: { data: RenderData; height: number; ring: string; style: CSSProperties }) {
  const { insetUrl, content } = data;
  const hl = content.insetHighlight;
  if (!insetUrl) {
    return (
      <div
        style={{
          ...style,
          width: Math.round(height * 0.69),
          height,
          border: `1.5px dashed ${ring}66`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: `${ring}99`,
          textAlign: "center",
          padding: 30,
        }}
      >
        Official league graphic
      </div>
    );
  }
  return (
    <div style={{ ...style, boxShadow: "0 40px 90px rgba(0,0,0,.45)" }}>
      <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom" }}>
        <img src={insetUrl} alt="" style={{ height, width: "auto", display: "block", maxWidth: "none" }} />
        {hl && (
          <div
            style={{
              position: "absolute",
              left: `${hl.x}%`,
              top: `${hl.y}%`,
              width: ringSize(hl, "17.5%"),
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `${Math.max(3, Math.round(height * 0.005))}px solid ${ring}`,
              boxShadow: `0 0 22px 4px ${ring}aa`,
              boxSizing: "border-box",
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Team of the Week — tonal: the whole canvas one deep club tone, the player graded into that hue (his face
 * kept in natural colour, sharp), and the official league graphic large as the only full-colour element.
 * "Team of the Week" and his name set light in a pale tint of the same tone.
 */
export function Totwtonal({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  // The player on params.side, the graphic on the other.
  const left = params.side !== "right";

  // One clear club hue; white / yellow / near-black clubs fall back to the accent, then to a muted tone.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const ground = shade(club, -0.62);
  const low = shade(club, -0.76);
  const tint = shade(club, 0.82);
  const stops = [shade(club, -0.84), shade(club, -0.6), shade(club, -0.3), shade(club, 0.08), shade(club, 0.4), shade(club, 0.64)];

  /* ---- the graphic, large, on the far side ---- */
  const logoH = story ? 88 : 52;
  const top = (story ? STORY_TOP : 64) + ty;
  const bottomLine = story ? STORY_BOTTOM : H - 60;
  const gH = story ? 960 : 880;
  const gW = gH * 0.69;
  const gTop = story ? STORY_TOP + 110 : 64;
  const gX = left ? CANVAS_W - M - gW : M;

  /* ---- type ---- */
  const kicker = (content.kicker || "Team of the Week").replace(/’/g, "'").trim().toUpperCase();
  const room = CANVAS_W - gW - M * 2 - 30;
  const K_TRACK = 0.32;
  const kSize = Math.min(20 * k * ts, room / Math.max(1, capsEm(kicker, K_TRACK)));
  const first = content.firstName || "";
  const last = content.lastName || "";
  const nameRoom = CANVAS_W - M * 2;
  const N_TRACK = -0.01;
  const nSize = Math.min(78 * k * ts, nameRoom / Math.max(1, capsEm(last, N_TRACK) * 0.82), nameRoom / Math.max(1, capsEm(first, N_TRACK) * 0.82));
  const sub = content.subline || "";
  const subSize = Math.min(17 * k * ts, (CANVAS_W - M * 2 - 220) / Math.max(1, capsEm(sub, 0.2)));

  /* ---- the player, large, on his side, partly behind the graphic ---- */
  const faceX = left ? (story ? 215 : 250) : CANVAS_W - (story ? 215 : 250);
  const faceTop = story ? STORY_TOP + 170 : 190;
  /* ---- the foot: name over the subline, the mark ---- */
  const nameBottom = bottomLine - logoH - (story ? 64 : 48);
  const nameTop = nameBottom - nSize * 1.42 - 12 * k;
  // The figure melts away just above his name.
  const floorY = nameTop + 30;
  const box = placeByFace({ ...data, canvasH: floorY }, faceX, faceTop, story ? { chest: 300, waist: 250, knees: 200, full: 160 } : { chest: 250, waist: 210, knees: 165, full: 136 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fcx = (face[0] + face[2] / 2) * 100;
  const fcy = (face[1] + face[3] / 2) * 100;
  // Natural-colour head: an ellipse around the face, feathered into the toned figure.
  const headMask = `radial-gradient(${face[2] * 95}% ${face[3] * 95}% at ${fcx}% ${fcy}%, #000 55%, transparent 100%)`;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${floorY - (story ? 380 : 300) - box.top}px, transparent ${floorY - box.top}px)`;

  const sideA = left ? "left" : "right";
  const sideB = left ? "right" : "left";
  const caps = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: tint,
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: tint }}>
      <ToneMap id="totwtonal-map" stops={stops} contrast={1.1} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 42% at ${(faceX / CANVAS_W) * 100}% ${story ? 30 : 34}%, ${shade(club, -0.46)}, ${ground} 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 700 : 420, background: `linear-gradient(to bottom, transparent, ${low})` }} />

      {/* The player in the club's own hue, his face natural. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#totwtonal-map)", ...cutMask(data.cut) }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: headMask, maskImage: headMask }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "saturate(.92) contrast(1.02)", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}

      {/* The one full-colour thing: the league graphic. */}
      <LeagueGraphic data={data} height={gH} ring={tint} style={{ position: "absolute", left: gX, top: gTop }} />

      {/* Title, top, on his side. */}
      <div style={{ position: "absolute", [sideA]: M, top, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>
      <div style={{ position: "absolute", [sideA]: M, top: top + kSize + 18 * k, width: 36 * k, height: 1, background: tint, opacity: 0.5 }} />

      {/* Foot: his name, light, then the competition line; the mark on the far side. */}
      <div style={{ position: "absolute", [sideA]: M, bottom: H - nameBottom, textAlign: left ? "left" : "right" }}>
        {first && <div style={{ ...caps(nSize * 0.42, 0.22, 400, { opacity: 0.8 }), marginBottom: 12 * k }}>{first}</div>}
        <div style={{ ...caps(nSize, N_TRACK, 300) }}>{last || first}</div>
      </div>
      {sub && <div style={{ position: "absolute", [sideA]: M, bottom: H - bottomLine + logoH / 2 - subSize / 2, ...caps(subSize, 0.2, 400, { opacity: 0.66 }) }}>{sub}</div>}
      <AgencyLogo
        data={data}
        height={story ? 26 : 22}
        style={{ position: "absolute", [sideB]: M, bottom: H - bottomLine - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.14} />
    </div>
  );
}
