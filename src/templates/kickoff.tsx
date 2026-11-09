/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MONTH_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", SET: "09", OCT: "10", OUT: "10", NOV: "11", DEC: "12", DEZ: "12", FEV: "02", ABR: "04", MAI: "05", AGO: "08" };

/** Inter Thin (100): advance widths of the figures per 1px of font size (proportional figures). */
const THIN_W: Record<string, number> = { "0": 0.66, "1": 0.38, "2": 0.6, "3": 0.62, "4": 0.64, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.63, "9": 0.62, ".": 0.24, ":": 0.24 };
const thinEm = (t: string, tracking: number) => [...t].reduce((a, c) => a + (THIN_W[c] ?? 0.6) + tracking, -tracking);
/** Cap / figure height of Inter, relative to the font size. */
const FIG = 0.727;

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/** "15:00" / "15h00" / "15.00" → "15:00"; "" when there is no time. */
function clock(t?: string): string {
  const m = (t ?? "").match(/^(\d{1,2})[:hH.](\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
}

/** "17 OCT" (or "SAT 17 OCT") → "17.10". */
function numericDate(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]] ?? m[2]}`;
}

/**
 * Kick-off: the time ("15:00") is the hero — set across the canvas in an ultra-thin Inter 100, behind the
 * player's body (never over his face), on a flat deep club tone. "Kick-off" tiny above it; "Matchday" and
 * the competition small at the top; the fixture (home first, full names) and date · ground small at the
 * foot over the agency logo. No time → the date takes its place.
 */
export function Kickoff({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 31);
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  // Deep club tone; a club colour too bright for a deep ground becomes near-black with a hint of it.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.88) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.5);
  const low = shade(ground, -0.4);

  const f = matchFacts(data);
  const time = clock(f.timeLocal || f.time);
  const hero = time || numericDate(content.date);
  const label = time ? (f.timePt ? `Kick-off · ${f.timePt} ${f.timeRef || "PT"}` : "Kick-off") : "Date";

  /* ---- the hero figures: one line across the top, ~88% of the width ---- */
  const M = 64;
  const tracking = -0.03;
  const em = thinEm(hero || "00:00", tracking);
  const size = Math.min(story ? 430 : 400, (CANVAS_W - 2 * M + 24) / Math.max(0.5, em)) * ts;
  const capH = size * FIG;
  const figTop = (story ? STORY_TOP + 120 : 132) + (params.textY ?? 0);
  const figBottom = figTop + capH;
  const figLeft = (CANVAS_W - em * size) / 2;

  /* ---- the player, in front of the figures: his head just overlaps their foot, his face below them ---- */
  const cx = 540 + (right ? 1 : -1) * (story ? 70 : 60) + (r() - 0.5) * 20;
  const sizes = story ? { chest: 320, waist: 256, knees: 196, full: 150 } : { chest: 236, waist: 186, knees: 142, full: 108 };
  const probe = placeByFace(data, cx, 600, sizes);
  const faceTop = figBottom + probe.faceH * 0.62 - (story ? 70 : 46);
  const box = placeByFace(data, cx, faceTop, sizes);

  /* ---- the small type ---- */
  const title = titleCase(content.kicker || "MATCHDAY");
  const comp = titleCase(f.comp || f.round || "");
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join("  v  ") : pair[0] ?? "";
  const when = [time ? niceDate(content.date) : "", titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const W = story ? 900 : 820;
  const fit = (t: string, max: number, e = 0.54) => Math.max(12 * k, Math.min(max * k * ts, W / Math.max(1, t.length * e)));
  const fixSize = fit(fixture, 24);
  const whenSize = Math.min(fixSize * 0.78, fit(when, 18));
  const compSize = Math.min(12 * k * ts, fit(comp, 12, 0.9));

  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const footBottom = (story ? H - STORY_BOTTOM + logoH + 62 : 44 + logoH + 32) - (params.textY ?? 0);
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };
  const topY = (story ? STORY_TOP : 60) + (params.textY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% ${Math.round(((figTop + capH / 2) / H) * 100)}%, ${shade(ground, 0.1)}, ${ground} 62%, ${low} 100%)` }} />

      {/* The time, ultra thin, across the top — his head overlaps its foot. */}
      {hero && (
        <div
          style={{
            position: "absolute",
            left: figLeft,
            top: figTop - size * (0.865 - FIG),
            fontFamily: SANS,
            fontWeight: 100,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: `${tracking}em`,
            whiteSpace: "nowrap",
            fontVariantNumeric: "proportional-nums",
            color: WHITE,
            opacity: 0.94,
          }}
        >
          {hero}
        </div>
      )}

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: footBottom + (story ? 520 : 300), background: `linear-gradient(to bottom, ${low}00, ${low}ee ${story ? 380 : 220}px, ${low})` }} />

      {/* Top line: the title left, "Kick-off" right — both tiny, over the figures. */}
      <div style={{ ...caps, position: "absolute", left: M, top: topY, fontSize: 15 * k * ts }}>{title}</div>
      <div style={{ ...caps, position: "absolute", right: M - 4, top: topY, fontSize: 15 * k * ts, opacity: 0.7 }}>{label}</div>

      {/* Foot: the fixture, then date · ground, centred over the logo. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: "center", gap: 9 * k, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        {comp && <div style={{ ...caps, fontWeight: 400, letterSpacing: "0.24em", paddingLeft: "0.24em", fontSize: compSize, opacity: 0.6, marginBottom: 6 * k }}>{comp}</div>}
        <div style={{ fontSize: fixSize, fontWeight: 500 }}>{fixture}</div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 300, opacity: 0.7 }}>{when}</div>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: logoBottom, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={story ? 26 : 20} style={{ transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      </div>
      <Film strength={0.18} />
    </div>
  );
}
