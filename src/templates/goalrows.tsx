/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, BEBAS, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 60;

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Bebas Neue advance widths in em, roughly. */
const bebasEm = (t: string) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.18 : c === "I" ? 0.19 : c === "M" ? 0.5 : c === "W" ? 0.56 : /[-–']/.test(c) ? 0.26 : 0.4), 0);
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/**
 * Goalrows: the title repeated in tight full-width rows of condensed caps behind him, every row a hairline
 * outline in a light tint of the club colour except one solid row at the height of his chest. A deep club
 * ground, the player in front in natural colour, the score and competition small at the foot.
 */
export function Goalrows({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the rows run from under the profile bar, the foot sits on the reply
  // bar's safe line, a size up, and the player fills the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const SC = story ? 1.3 : 1;
  const r = rng(params.seed ?? 1);
  const rowCount = [6, 6, 5, 7][Math.floor(r() * 4)];

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const deep = shade(club, -0.76);
  const lift = shade(club, -0.5);
  const tint = shade(club, 0.62);

  const f = matchFacts(data);
  // Home side first: from content.home, else from the typed team names against our club.
  const lc = (t?: string) => (t ?? "").toLowerCase().trim();
  const oursName = data.club?.name ?? "";
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const score = scoreOf(data, "–");

  /* ---- the foot ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const compTop = story ? STORY_BOTTOM - 88 - 60 - 18 : CANVAS_H - 44 - 52 - 40 - 12;
  const lineTop = compTop - 44 * SC;
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = !weHost ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? `${pair[0]}   ${score || "v"}   ${pair[1]}` : score;
  const FIX_TRACK = 0.3;
  const fixSize = Math.max(11, Math.min(16 * SC, 760 / Math.max(1, capsEm(fixture, FIX_TRACK)))) * ts;
  const comp = [f.comp, f.round].filter(Boolean).join(" · ");
  const COMP_TRACK = 0.32;
  const compSize = Math.max(10, Math.min(12.5 * SC, 900 / Math.max(1, capsEm(comp, COMP_TRACK)))) * ts;
  const crests = (!weHost ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  /* ---- the rows ---- */
  const top = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const bottom = lineTop - 56;
  const S = (bottom - top) / ((rowCount - 1) * 0.8 + 0.7);
  const pitch = S * 0.8;
  const W = CANVAS_W - 2 * MARGIN;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const unit = bebasEm(word) * S;
  const space = 0.18 * S;
  // How many times the word fits a row: the count whose fit needs the least stretching or squeezing.
  let reps = 1;
  let best = Infinity;
  for (let n = 1; n <= 6; n++) {
    const natural = n * unit + (n - 1) * space;
    const cost = Math.abs(Math.log(W / natural));
    if (cost < best) {
      best = cost;
      reps = n;
    }
  }
  // Each word fitted into its own slot, so the gaps stay tight and equal however much the word is stretched.
  const gap = 0.13 * S;
  const slot = (W - (reps - 1) * gap) / reps;
  const baselines = Array.from({ length: rowCount }, (_, i) => top + 0.7 * S + i * pitch);

  /* ---- the player ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const faceTop = top + pitch * 0.9;
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 350, waist: 274, knees: 212, full: 164 } : { chest: 250, waist: 196, knees: 150, full: 116 });
  const chestY = faceTop + box.faceH * 2.5;
  let solid = 0;
  baselines.forEach((b, i) => {
    if (Math.abs(b - 0.35 * S - chestY) < Math.abs(baselines[solid] - 0.35 * S - chestY)) solid = i;
  });
  const fadeEnd = lineTop - 30 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 280}px, transparent ${fadeEnd}px)`;

  const caps = (size: number, track: number, weight: number): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 52% at 50% 46%, ${lift}, ${deep} 100%)` }} />

      {/* The rows: hairline outlines, one solid at his chest. */}
      <svg width={CANVAS_W} height={CH} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {baselines.map((y, i) =>
          Array.from({ length: reps }, (_, j) => (
            <text
              key={`${i}-${j}`}
              x={MARGIN + j * (slot + gap)}
              y={y}
              textLength={slot}
              lengthAdjust="spacingAndGlyphs"
              style={{ fontFamily: BEBAS, fontSize: S }}
              fill={i === solid ? tint : "none"}
              stroke={i === solid ? "none" : tint}
              strokeOpacity={0.62}
              strokeWidth={1.5}
            >
              {word}
            </text>
          )),
        )}
      </svg>

      {/* The player, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Foot: crests either side of the score, then the competition. */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: lineTop - 12 * SC, height: fixSize + 24 * SC, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * SC }}>
        {crests[0] && <img src={crests[0]} alt="" style={{ width: 34 * SC, height: 34 * SC, objectFit: "contain" }} />}
        {fixture && <div style={caps(fixSize, FIX_TRACK, 600)}>{fixture}</div>}
        {crests[1] && <img src={crests[1]} alt="" style={{ width: 34 * SC, height: 34 * SC, objectFit: "contain" }} />}
      </div>
      {comp && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: compTop, ...caps(compSize, COMP_TRACK, 400), color: "rgba(255,255,255,.66)" }}>{comp}</div>}

      <AgencyLogo data={data} height={story ? 26 : 20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
