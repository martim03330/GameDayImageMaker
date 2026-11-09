/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

/** Inter 500 capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/** Crests as flat marks of one ink (white on the deep ground, near-black on off-white), cut to their own shape. */
function InkDefs({ id, rgb, ink = 0.55 }: { id: string; rgb: [number, number, number]; ink?: number }) {
  const k = (w: number) => (w * ink * 2).toFixed(3);
  const [r, g, b] = rgb.map((v) => (v / 255).toFixed(3));
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${k(0.3)} ${k(0.6)} ${k(0.1)} 0 ${(1 - ink * 1.3).toFixed(3)}`} result="ink" />
        <feComposite in="ink" in2="SourceAlpha" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * Crestline: the two crests as small marks at the player's eye level, one either side of him, joined by
 * a single hairline that runs behind his head. The kick-off time (or the score) sits just above the line
 * where it meets him. The title small at the top, date · ground small at the foot. A calm deep club tone
 * or an off-white ground, by seed.
 */
export function Crestline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  // Native 9:16 story: title under the profile bar, the foot above the reply bar, a bigger figure and line between.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const r = rng(params.seed ?? 1);
  const light = r() < 0.42;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);

  const ground = light ? "#eeebe5" : shade(club, -0.7);
  const ink = light ? "#16181d" : "#ffffff";
  const soft = light ? "rgba(22,24,29,.62)" : "rgba(255,255,255,.72)";
  const lineCol = light ? "rgba(22,24,29,.55)" : "rgba(255,255,255,.62)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- home first ---- */
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  // White marks on the deep ground; on off-white a dark mark turns most crests into blobs, so they keep their colour.
  const crestFilter = params.crestColor || light ? "none" : "url(#crestline-ink)";

  /* ---- the player, centred; his eyes set the line ---- */
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const box = story
    ? placeByFace(data, faceX, 470, { chest: 350, waist: 280, knees: 220, full: 172 })
    : placeByFace(data, faceX, 340, { chest: 260, waist: 205, knees: 160, full: 124 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = box.top + face[1] * box.height;
  const eye = Math.round(faceTop + box.faceH * 0.42);

  /* ---- crests and the line ---- */
  const CREST = story ? 86 : 62;
  const M = story ? 72 : 76;
  const lineL = M + CREST + 26;
  const lineR = CANVAS_W - M - CREST - 26;
  const label = isResult ? score : f.time || "v";
  const lSize = (isResult ? 22 : label === "v" ? 22 : 17) * k * ts;

  /* ---- top and foot ---- */
  const title = (isResult && postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.5;
  const tSize = Math.max(11, Math.min(15 * (story ? 1.5 : 1), 600 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 82) + (params.textY ?? 0);
  const when = [niceDate(content.date), titleCase(f.venue)].filter(Boolean).join("   ·   ") || titleCase(f.comp || f.round || "");
  const wSize = Math.max(13, Math.min(18 * k, 880 / Math.max(1, when.length * 0.52))) * ts;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const whenTop = story ? STORY_BOTTOM - 108 - 44 - wSize * 1.2 : CANVAS_H - 44 - 52 - 30 - wSize;
  const fadeEnd = whenTop - 40;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - 320 - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <InkDefs id="crestline-ink" rgb={[255, 255, 255]} />
      {/* A breath of light behind him, nothing else. */}
      <div style={{ position: "absolute", inset: 0, background: light ? "radial-gradient(70% 55% at 50% 40%, #f6f4ef, #eeebe5 60%, #e4e0d8 100%)" : `radial-gradient(70% 55% at 50% 38%, ${shade(club, -0.52)}, ${ground} 62%, ${shade(club, -0.8)} 100%)` }} />

      {/* The line, behind him. */}
      <div style={{ position: "absolute", left: lineL, width: lineR - lineL, top: eye, height: 1, background: lineCol }} />

      {/* The player, natural colour, melting into the ground above the foot. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.22, top: faceTop + box.faceH * 1.6, width: box.width * 0.56, height: box.faceH * 4, borderRadius: "50%", background: light ? "rgba(60,50,40,.12)" : "rgba(0,0,0,.25)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The label, just above the line as it leaves the first crest — clear of his head and hands. */}
      <div style={{ position: "absolute", left: lineL, top: eye - lSize - 12, fontFamily: SANS, fontWeight: label === "v" ? 300 : 500, fontSize: lSize, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{label}</div>

      {/* The crests, at his eyes. */}
      {crests.map((c, i) => (
        <img
          key={i}
          src={c}
          alt=""
          style={{ position: "absolute", left: i === 0 ? M : CANVAS_W - M - CREST, top: eye - CREST / 2, width: CREST, height: CREST, objectFit: "contain", filter: crestFilter }}
        />
      ))}

      {/* Top: the title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK) }}>{title}</div>

      {/* Foot: date · ground. */}
      {when && <div style={{ position: "absolute", left: 60, right: 60, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: wSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: soft }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 24 : 18} onLight={light} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={light ? 0.12 : 0.2} />
    </div>
  );
}
