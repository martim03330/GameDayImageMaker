/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const PAPER = "#efede8";
const INK = "#131313";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);
const fit = (t: string, w: number, max: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(t, tracking)));

/**
 * Goal medallion: one large circle on a pale ground holds his own photo, blurred and toned in the club
 * colour; the celebrating cutout stands in it and breaks out over the top of the rim (head, raised arms).
 * "GOAL", his name and the fixture small and centred under the medallion. Never the score.
 */
export function Goalmedallion({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const deep = shade(club, -0.55);

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const fixture = (ours && opp ? (weHost ? [ours, opp] : [opp, ours]).join("  v  ") : f.comp || "").toUpperCase();

  /* ---- the credits under the medallion, measured up from the logo ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = fit(kicker, 520, 15 * k, K_TRACK) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.2;
  const nSize = Math.max(15, fit(name, 820, 27 * k, N_TRACK)) * ts;
  const F_TRACK = 0.26;
  const fSize = Math.max(10, fit(fixture, 860, 13 * k, F_TRACK)) * ts;

  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const fixBottom = (story ? STORY_BOTTOM - logoH - 60 : CANVAS_H - 44 - logoH - 32) + (params.textY ?? 0);
  const fixTop = fixBottom - fSize;
  const nameTop = fixTop - (story ? 22 : 16) - nSize;
  const kTop = nameTop - (story ? 28 : 20) - kSize;
  const creditsTop = fixture ? (name ? kTop : fixTop - 20 - kSize) : kTop;

  /* ---- the medallion ---- */
  const R = story ? 430 : 360;
  const cx = 540;
  const cy = creditsTop - (story ? 76 : 52) - R;
  const rimTop = cy - R;

  /* ---- the player: his neck on the rim, head and raised arms above it ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const sizes: Record<string, number> = story ? { chest: 190, waist: 165, knees: 140, full: 118 } : { chest: 150, waist: 130, knees: 110, full: 92 };
  let faceH = (sizes[params.framing ?? "waist"] ?? sizes.waist) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  // Keep the whole head (plus hair) at least ~60px inside the top in both formats.
  const minFaceTop = (story ? STORY_TOP - 20 : 60) + faceH * 0.6;
  let faceTop = rimTop - faceH * 1.05;
  if (faceTop < minFaceTop) {
    faceH = Math.max(80, (rimTop - minFaceTop) / 1.05);
    faceTop = rimTop - faceH * 1.05;
  }
  let h = faceH / face[3];
  const shift = params.side === "left" ? -30 : params.side === "right" ? 30 : 0;
  let w = h * aspect;
  // Not wider than the medallion and a bit: shrink a wide figure.
  if (w > R * 2.6) {
    const s = (R * 2.6) / w;
    h *= s;
    w *= s;
  }
  const top = faceTop - face[1] * h + (params.playerY ?? 0);
  const left = cx + shift - (face[0] + face[2] / 2) * w + (params.playerX ?? 0);
  // A short crop must not end with a hard edge inside the medallion.
  const bottom = top + h;
  const fade = bottom < cy + R ? `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, h - 160)}px, transparent ${h}px)` : undefined;

  const img = (
    <div style={{ position: "absolute", left, top, width: w, height: h, WebkitMaskImage: fade, maskImage: fade }}>
      <img src={data.photoUrl ?? ""} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
    </div>
  );

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK, textAlign: "center", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 40%, rgba(255,255,255,.4), transparent 70%)" }} />

      {/* The medallion: his own photo, blurred and toned in the club colour. */}
      <div style={{ position: "absolute", left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", overflow: "hidden", background: deep }}>
        {(data.bgPhotoUrl || data.photoUrl) && (
          <img
            src={data.bgPhotoUrl ?? data.photoUrl ?? ""}
            alt=""
            style={{ position: "absolute", left: -80, top: -80, width: 2 * R + 160, height: 2 * R + 160, maxWidth: "none", objectFit: "cover", filter: "blur(26px) grayscale(1) contrast(1.1) brightness(1.05)" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.92 }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(closest-side, transparent 55%, ${deep}99 100%)` }} />
      </div>
      {/* The player: inside the medallion below its centre line, free above it. */}
      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", left: 0, top: cy, width: CANVAS_W, height: H - cy, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: cx - R, top: -R, width: 2 * R, height: 2 * R, borderRadius: "50%", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: -(cx - R), top: -(cy - R), width: CANVAS_W, height: H }}>{img}</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: cy, overflow: "hidden" }}>{img}</div>
        </>
      )}

      {/* The credits, centred under the medallion. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: kTop, ...caps(kSize, K_TRACK, 600, { color: club }) }}>{kicker}</div>
      {name && <div style={{ position: "absolute", left: 40, right: 40, top: nameTop, ...caps(nSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: 40, right: 40, top: fixTop, ...caps(fSize, F_TRACK, 500, { opacity: 0.6 }) }}>{fixture}</div>}

      <AgencyLogo data={data} onLight height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
    </div>
  );
}
