/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MONTH_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** Inter Thin (100): advance widths of the figures per 1px of font size (proportional figures). */
const THIN_W: Record<string, number> = { "0": 0.66, "1": 0.38, "2": 0.6, "3": 0.62, "4": 0.64, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.63, "9": 0.62, ".": 0.24, "–": 0.62, "-": 0.42, ":": 0.24 };
const thinEm = (t: string, tracking: number) => [...t].reduce((a, c) => a + (THIN_W[c] ?? 0.6) + tracking, -tracking);
/** Cap / figure height of Inter, relative to the font size. */
const FIG = 0.727;

/** "17 OCT" (or "SAT 17 OCT") → "17.10". */
function numericDate(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]] ?? m[2]}`;
}

/**
 * Date first: a flat deep ground in the club colour, the date (or the final score) set enormous in an
 * ultra-thin sans behind the player, pushed towards the side he leaves free; everything else tiny —
 * the label and kick-off on one side, the opponent and ground on the other, crests as small white marks.
 */
export function Datefirst({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 23);
  // Native story (1080×1920): the date stacks day over month and fills the tall free side; type and marks
  // run from STORY_TOP to STORY_BOTTOM.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.4 : 1;
  const right = params.side !== "left";

  // Deep club tone; a club colour too bright for a deep ground becomes near-black with a hint of it.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.88) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.42);
  const low = shade(ground, -0.35);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;
  const big = (isResult ? score : numericDate(content.date)) || numericDate(content.date) || "";

  /* ---- the figures: ~70% of the width, on the free side ---- */
  const M = 64;
  const tracking = -0.02;
  const ts = params.textScale ?? 1;
  const lines = story && !isResult && /^\d+\.\d+$/.test(big) ? big.split(".") : [big];
  const widest = Math.max(...lines.map((l) => thinEm(l, tracking)));
  const size = (story ? Math.min(lines.length > 1 ? 640 : 660, (CANVAS_W * 0.66) / Math.max(0.5, widest)) : Math.min(520, (CANVAS_W * 0.72) / Math.max(0.5, widest))) * ts;
  const figW = widest * size;
  const lineGap = size * 0.16;
  const figTop = (story ? (lines.length > 1 ? 400 : 600) : 300) + (params.textY ?? 0);
  const figBottom = figTop + lines.length * size * FIG + (lines.length - 1) * lineGap;

  /* ---- the player, off-centre towards his side, in front of the figures ---- */
  const cx = (right ? 700 + r() * 30 : 380 - r() * 30) + (story ? (right ? 50 : -50) : 0);
  const box = story ? placeByFace(data, cx, 470, { chest: 350, waist: 280, knees: 215, full: 172 }) : placeByFace(data, cx, 360, { chest: 250, waist: 196, knees: 150, full: 118 });

  /* ---- the small type ---- */
  const label = isResult ? "Full Time" : titleCase(content.kicker || "Matchday");
  const kick = isResult ? "" : f.time ? `Kick-off ${f.time}` : "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const vs = opp ? `v ${opp}` : [content.firstName, content.lastName].filter(Boolean).join(" ");
  const ground2 = titleCase(f.venue);
  const comp = titleCase(f.comp || f.round || "");
  const fit = (t: string, max: number, w = 380) => Math.max(13, Math.min(max, w / Math.max(1, t.length * 0.55))) * S;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : "url(#datefirst-mono)";
  const tiny: CSSProperties = { fontFamily: SANS, color: WHITE, whiteSpace: "nowrap", lineHeight: 1.25 };
  const caps: CSSProperties = { ...tiny, fontWeight: 500, fontSize: 13 * S, letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.7 };
  // Label + kick-off on the free side, opponent + ground on his side (top, clear of his head).
  const freeSide: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const hisSide: CSSProperties = right ? { right: M, textAlign: "right", alignItems: "flex-end" } : { left: M, textAlign: "left", alignItems: "flex-start" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="datefirst-mono" ink={0.55} />
      {/* The ground: flat, just a breath of light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 62 : 38}% 45%, ${shade(ground, 0.1)}, ${ground} 60%, ${low} 100%)` }} />

      {/* The figures, ultra thin, enormous. */}
      <div
        style={{
          position: "absolute",
          [right ? "left" : "right"]: M - size * 0.04,
          top: figTop - size * (0.97 - FIG),
          fontFamily: SANS,
          fontWeight: 100,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: `${tracking}em`,
          whiteSpace: "nowrap",
          color: WHITE,
          opacity: 0.92,
          fontVariantNumeric: "proportional-nums",
        }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ height: i < lines.length - 1 ? size * FIG + lineGap : undefined }}>{l}</div>
        ))}
      </div>
      {/* Under the figures, a hairline and the competition — the only other line that reads at a glance. */}
      <div style={{ position: "absolute", [right ? "left" : "right"]: M, top: figBottom + 40 * S, width: Math.min(figW, 220), height: 1, background: "rgba(255,255,255,.5)" }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 720 : 360, background: `linear-gradient(to bottom, transparent, ${low}cc)` }} />

      {/* Top: label + kick-off on the free side, opponent + ground on his side. */}
      <div style={{ position: "absolute", top: story ? STORY_TOP : M, ...freeSide, display: "flex", flexDirection: "column", gap: 10 * S }}>
        <div style={caps}>{label}</div>
        {kick && <div style={{ ...tiny, fontWeight: 300, fontSize: 20 * S }}>{kick}</div>}
      </div>
      <div style={{ position: "absolute", top: story ? STORY_TOP : M, ...hisSide, display: "flex", flexDirection: "column", gap: 10 * S, maxWidth: story ? 560 : 440 }}>
        {comp && <div style={{ ...caps, fontSize: Math.min(13 * S, fit(comp, 13, 420 * 0.6)) }}>{comp}</div>}
        {vs && <div style={{ ...tiny, fontWeight: 300, fontSize: fit(vs, 20) }}>{vs}</div>}
        {ground2 && <div style={{ ...tiny, fontWeight: 300, fontSize: fit(ground2, 16), opacity: 0.7 }}>{ground2}</div>}
      </div>

      {/* Foot on the free side: crests as small white marks, then the agency logo. */}
      <div style={{ position: "absolute", bottom: story ? H - STORY_BOTTOM + 108 + 44 : 130, ...freeSide, display: "flex", gap: 22 * S, alignItems: "center", flexDirection: "row" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: story ? 64 : 44, height: story ? 64 : 44, objectFit: "contain", filter: crestFilter }} />
        ))}
      </div>
      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.2} />
    </div>
  );
}
