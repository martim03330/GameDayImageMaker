/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#0b0c0f";
const PAPER = "#f7f6f3";

/** Barlow Condensed 900 capitals: advance widths per 100px (measured in the browser). */
const BC9: Record<string, number> = { A: 53.1, B: 48.4, C: 47.6, D: 48.3, E: 44.4, F: 43.2, G: 47.8, H: 48.6, I: 24, J: 47, K: 51.7, L: 44.6, M: 56.6, N: 52.8, O: 48.4, P: 48.1, Q: 47.3, R: 49, S: 46.3, T: 49.9, U: 48.1, V: 52.1, W: 72, X: 50.3, Y: 50.8, Z: 42.4, "-": 29.6, " ": 20, "!": 24, "'": 20 };
/** Inter 600 capitals, roughly. */
const I6: Record<string, number> = { A: 74, B: 66, C: 74, D: 72, E: 61, F: 59, G: 75, H: 75, I: 28, J: 58, K: 71, L: 56, M: 93, N: 76, O: 77, P: 65, Q: 78, R: 66, S: 65, T: 67, U: 73, V: 75, W: 105, X: 73, Y: 73, Z: 66, " ": 24, "–": 55, "-": 46, ".": 28 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const em = (t: string, table: Record<string, number>, tracking = 0) => plain(t).reduce((a, c) => a + (table[c] ?? (/\d/.test(c) ? 60 : 64)) / 100 + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/**
 * Goal flash: a high-key camera-flash moment. A near-white ground with a soft bloom of light bursting from
 * behind the player and a faint club tint at the edges; the player in natural colour, crisp as if lit by a
 * flash; the title huge in black condensed ink at the foot, and under it one small line: crest, the score
 * between the two clubs, crest.
 */
export function Goalflash({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the foot sits on the reply bar's safe line, a size up, and the
  // player fills the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const S = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.6) club = shade(club, -0.3);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");

  /* ---- the foot: title, then the score line, then the logo ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 40) - (params.logoY ?? 0);
  const lineTop = story ? STORY_BOTTOM - 88 - 60 - 66 : CANVAS_H - 40 - 52 - 40 - 40;
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const kTrack = -0.01;
  const kSize = Math.min(330 * S, (CANVAS_W - 2 * 56) / Math.max(1, em(kicker, BC9, kTrack))) * ts;
  // Cap height of Barlow Condensed ≈ 0.7em; the caps sit just above the score line.
  const kBase = lineTop - 34 * S + (params.textY ?? 0);

  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typedOpp = (weHost ? content.awayTeam : content.homeTeam) || f.opp;
  const ours = shortName(oursName);
  const them = typedOpp ? shortName(typedOpp) : "";
  const pair = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]) as (string | null)[];
  const mid = score || "v";
  const lTrack = 0.18;
  const lineText = pair.join(`  ${mid}  `) + (f.comp ? `   ·   ${f.comp}` : "");
  const lSize = Math.max(11, Math.min(16 * S, (story ? 860 : 760) / Math.max(1, em(lineText, I6, lTrack)))) * ts;
  const crestSize = 36 * S;

  /* ---- the player, big, head high ---- */
  const sizes = story ? { chest: 360, waist: 286, knees: 226, full: 176 } : { chest: 260, waist: 206, knees: 162, full: 126 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  let box = placeByFace(data, faceX, story ? STORY_TOP + 140 : 150, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceTop = box.top + face[1] * box.height;
  // The bloom bursts from just behind his shoulders.
  const bx = faceCx;
  const by = faceTop + box.faceH * 1.8;
  // He fades into the white just above the title.
  const fadeTo = kBase - kSize * 0.62 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 280}px, transparent ${fadeTo}px)`;

  const tint = shade(club, 0.55);
  const caps = (size: number, weight: number, track: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    textTransform: "uppercase",
    whiteSpace: "pre",
    color: INK,
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: PAPER, color: INK }}>
      {/* High-key ground: a faint club tint at the edges, a white bloom of flash light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 95% at ${bx}px ${by}px, ${PAPER} 30%, ${tint} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(48% 38% at ${bx}px ${by}px, #ffffff 0%, rgba(255,255,255,.9) 35%, rgba(255,255,255,0) 100%)` }} />
      {/* Soft streaks of light radiating from the bloom. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-conic-gradient(from 0deg at ${bx}px ${by}px, rgba(255,255,255,.75) 0deg 2.5deg, rgba(255,255,255,0) 2.5deg 9deg)`,
          WebkitMaskImage: `radial-gradient(70% 60% at ${bx}px ${by}px, #000 10%, transparent 75%)`,
          maskImage: `radial-gradient(70% 60% at ${bx}px ${by}px, #000 10%, transparent 75%)`,
          filter: "blur(6px)",
        }}
      />
      {/* A soft shade behind the figure, so the white of the kit doesn't vanish into the light. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: faceTop + box.faceH * 0.9, width: box.width * 0.64, height: box.faceH * 4.5, borderRadius: "50%", background: shade(club, -0.3), opacity: 0.16, filter: "blur(70px)" }} />

      {/* The player, crisp, flash-lit. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.12) saturate(1.06) brightness(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The title, black ink, huge. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: kBase - kSize * 0.86,
          textAlign: "center",
          fontFamily: CONDENSED,
          fontWeight: 900,
          fontSize: kSize,
          lineHeight: 1,
          letterSpacing: `${kTrack}em`,
          color: INK,
          whiteSpace: "nowrap",
        }}
      >
        {kicker}
      </div>

      {/* One small line: crest · OURS 2–1 THEM · competition · crest. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: lineTop, height: 40 * S, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        {crests[0] && <img src={crests[0]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />}
        <span style={caps(lSize, 600, lTrack)}>
          {pair.length === 2 ? (
            <>
              {pair[0]}
              <span style={{ fontWeight: 800, margin: "0 0.9em" }}>{mid}</span>
              {pair[1]}
            </>
          ) : (
            pair[0]
          )}
          {f.comp && <span style={{ fontWeight: 500, color: "rgba(11,12,15,.55)" }}>{`   ·   ${f.comp}`}</span>}
        </span>
        {crests[1] && <img src={crests[1]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />}
      </div>

      <AgencyLogo data={data} height={story ? 26 : 20} onLight style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
    </div>
  );
}
