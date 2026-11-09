/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#161616";
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** DM Serif Display: advance widths per 1px of font size (lower case and caps, approximate). */
const serifEm = (t: string) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.24 : c === "." ? 0.25 : c === "-" ? 0.33 : /[il]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.78 : /[MW]/.test(c) ? 0.92 : /[A-Z]/.test(c) ? 0.68 : /\d/.test(c) ? 0.55 : 0.49), 0);
/** Inter 500 title case, roughly. */
const sansEm = (t: string) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.27 : c === "." ? 0.27 : c === "-" ? 0.36 : /[il]/.test(c) ? 0.24 : /[mw]/.test(c) ? 0.86 : /[MW]/.test(c) ? 0.9 : /[A-Z]/.test(c) ? 0.68 : 0.56), 0);
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Goalmono: the goal post of `monoaccent`. The celebrating player big in crisp black and white on a warm
 * white or soft grey ground, the title ("Goal.", "Brace.") large and quiet above him, and exactly one thing
 * in the club colour — the title's full stop, or a small solid square holding the score. At the foot on the
 * free side: home v away with the score, the competition in small spaced caps, crests as grey marks.
 */
export function Goalmono({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  const grey = r() < 0.4;
  const serif = r() < 0.6;
  const right = params.side !== "left";
  // A native 9:16 story (1080×1920): the type runs from STORY_TOP to STORY_BOTTOM, a size larger, and the
  // player fills the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  // The one colour: the club's, kept readable on a pale ground.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5 || luminance(club) < 0.025) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);
  if (luminance(club) < 0.025) club = "#b3122e";
  const ground = grey ? "#e3e2df" : "#f2eee8";

  /* ---- facts: home first ---- */
  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const oppName = titleCase(f.opp);
  const homeName = shortName(content.homeTeam?.trim() || (weHost ? oursName : oppName));
  const awayName = shortName(content.awayTeam?.trim() || (weHost ? oppName : oursName));
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const accent: "stop" | "square" = score && r() < 0.45 ? "square" : "stop";

  /* ---- the title ---- */
  const M = 68;
  const word = sentence(content.kicker || "Goal").replace(/[.!]+$/, "");
  const em = (t: string) => (serif ? serifEm(t) : sansEm(t));
  const maxW = CANVAS_W - 2 * M;
  let titleLines = [word];
  let tSize = Math.min((serif ? 200 : 176) * k, maxW / Math.max(1, em(word + ".")));
  const words = word.split(" ");
  if (tSize < (serif ? 120 : 96) && words.length > 1) {
    let best = 1;
    let bestW = Infinity;
    for (let i = 1; i < words.length; i++) {
      const w = Math.max(em(words.slice(0, i).join(" ")), em(words.slice(i).join(" ") + "."));
      if (w < bestW) [best, bestW] = [i, w];
    }
    titleLines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    tSize = Math.min((serif ? 170 : 140) * k, maxW / bestW);
  }
  tSize *= ts;
  const lineH = serif ? 0.98 : 1.0;
  // (The story: the ascenders, not the line box, start at STORY_TOP.)
  const titleTop = (story ? STORY_TOP - tSize * (serif ? 0.14 : 0.12) : 84) + (params.textY ?? 0);
  const titleBottom = titleTop + tSize * lineH * titleLines.length;

  /* ---- the player, B&W, big, on his side; the top of the cutout (a raised fist) clears the title ---- */
  const faceX = right ? (story ? 712 : 690) : 390;
  const sizes = story ? { chest: 320, waist: 252, knees: 206, full: 160 } : { chest: 240, waist: 188, knees: 154, full: 120 };
  let box = placeByFace(data, faceX, titleBottom + (story ? 120 : 110), sizes);
  const clear = titleBottom + 26 - box.top;
  if (clear > 0) box = { ...box, top: box.top + clear };
  // A fist raised to one side: centre the figure a little towards his side rather than the face alone.
  // Only ever away from the free side, so the foot text keeps its room.
  const mid = right ? 690 : 390;
  const shift = mid - (box.left + box.width / 2);
  // ... and never so far that the outer edge of the cutout (a raised fist) leaves the canvas.
  const edge = 28;
  let lean = right ? Math.max(0, Math.min(110, shift)) : Math.min(0, Math.max(-110, shift));
  if (right) lean = Math.min(lean, Math.max(-70, CANVAS_W - edge - (box.left + box.width)));
  else lean = Math.max(lean, Math.min(70, edge - box.left));
  box = { ...box, left: box.left + lean };

  /* ---- the foot, on the free side ---- */
  const colW = story ? 430 : 360;
  const line = homeName && awayName ? `${homeName} ${score || "v"} ${awayName}` : "";
  // The story stacks home over "v away": bigger type in a narrower column, clear of the bigger figure.
  const lines = story && line ? [homeName, `${score || "v"} ${awayName}`] : line ? [line] : [];
  const fixSize = Math.max(19 * k, Math.min(28 * k, (colW * 1.8) / Math.max(1, ...lines.map((l) => l.length)))) * ts;
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(10 * k, Math.min(12.5 * k, (colW * 0.95) / Math.max(1, capsEm(comp, 0.26)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const crestFilter = params.crestColor ? "none" : "grayscale(1) contrast(1.25) brightness(.62)";
  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const small: CSSProperties = { fontFamily: SANS, color: INK, lineHeight: 1.3, maxWidth: colW };
  const titleStyle: CSSProperties = serif ? { fontFamily: DMSERIF, fontWeight: 400, letterSpacing: "-0.01em" } : { fontFamily: SANS, fontWeight: 500, letterSpacing: "-0.035em" };
  const logoBottom = (story ? H - STORY_BOTTOM : 54) - (params.logoY ?? 0);
  const footBottom = story ? H - STORY_BOTTOM + 88 + 60 : 54 + 52 + 46;
  // The story's figure is bigger: below the chest it melts away only where it would run into the foot
  // column (a union of two masks: everything above the column, everything beside it), never at the face.
  const colEdge = right ? M + colW : CANVAS_W - M - colW;
  const colTop = H - footBottom - 250;
  const storyMask = [
    `linear-gradient(to bottom, #000 ${colTop - 150 - box.top}px, transparent ${colTop - box.top}px)`,
    right
      ? `linear-gradient(to right, transparent ${colEdge + 10 - box.left}px, #000 ${colEdge + 230 - box.left}px)`
      : `linear-gradient(to left, transparent ${box.left + box.width - colEdge + 10}px, #000 ${box.left + box.width - colEdge + 230}px)`,
  ].join(", ");

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      {/* The ground: flat, a soft fall-off to the corners. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at ${right ? 62 : 38}% 55%, ${shade(ground, 0.25)}, ${ground} 60%, ${shade(ground, -0.06)} 100%)` }} />

      {/* The title, its full stop the one colour (when that is the accent). */}
      <div style={{ position: "absolute", top: titleTop, ...side, display: "flex", flexDirection: "column" }}>
        {titleLines.map((l, i) => (
          <div key={i} style={{ ...titleStyle, fontSize: tSize, lineHeight: lineH, color: INK, whiteSpace: "nowrap" }}>
            {l}
            {i === titleLines.length - 1 && <span style={{ color: accent === "stop" ? club : INK }}>.</span>}
          </div>
        ))}
      </div>

      {/* The player, black and white. */}
      {data.photoUrl && !story && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "grayscale(1) contrast(1.2) brightness(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {data.photoUrl && story && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: storyMask, maskImage: storyMask }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "grayscale(1) contrast(1.2) brightness(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Foot on the free side: the score square, the name, home score away, the competition, crests. */}
      <div style={{ position: "absolute", bottom: footBottom, ...side, display: "flex", flexDirection: "column" }}>
        {accent === "square" && (
          <div style={{ width: 92, height: 92, background: club, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 30, fontFamily: SANS, fontWeight: 500, fontSize: 30, color: "#fff", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            {score}
          </div>
        )}
        {name && <div style={{ ...small, fontWeight: 500, fontSize: Math.max(10 * k, Math.min(13 * k, (colW * 0.95) / Math.max(1, capsEm(name, 0.3)))) * ts, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 * k }}>{name}</div>}
        {lines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 400, fontSize: fixSize, whiteSpace: "nowrap", lineHeight: story ? 1.18 : 1.3 }}>
            {l}
          </div>
        ))}
        {comp && <div style={{ ...small, fontWeight: 500, fontSize: compSize, letterSpacing: "0.26em", textTransform: "uppercase", marginTop: 12 * k, opacity: 0.55 }}>{comp}</div>}
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 18 * k, marginTop: 26 * k, alignItems: "center" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 38 * k, height: 38 * k, objectFit: "contain", filter: crestFilter, opacity: params.crestColor ? 1 : 0.85 }} />
            ))}
          </div>
        )}
      </div>
      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 18}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
