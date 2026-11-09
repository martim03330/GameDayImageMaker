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
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter ExtraLight (200) capitals: advance widths per 1px of font size (approximate). */
const LIGHT_W: Record<string, number> = { A: 0.68, B: 0.64, C: 0.72, D: 0.72, E: 0.58, F: 0.56, G: 0.75, H: 0.73, I: 0.25, J: 0.53, K: 0.65, L: 0.53, M: 0.88, N: 0.74, O: 0.77, P: 0.62, Q: 0.77, R: 0.64, S: 0.62, T: 0.62, U: 0.72, V: 0.68, W: 0.98, X: 0.66, Y: 0.64, Z: 0.62, " ": 0.26, "'": 0.2, "-": 0.4 };
const lightEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (LIGHT_W[c] ?? 0.66) + tracking, -tracking);
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);
/** Cap height of Inter relative to its size. */
const CAP = 0.727;

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/**
 * Goalvert: the goal post of `vertname`. The title ("GOAL", "BRACE", "HAT-TRICK") set huge and vertical
 * (reading bottom to top) in Inter ExtraLight caps along the free edge, its tracking opened up so a short
 * word still runs the height of the canvas — tone on tone with the deep club ground, or white at 85%. The
 * celebrating player in natural colour on the other side, and a narrow column of small type at the foot beside
 * the title: his name, home score away, the competition, crests as white marks, the agency logo.
 */
export function Goalvert({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const tonal = r() < 0.5;
  // The player stands on params.side; the title runs up the other edge.
  const right = params.side !== "left";
  // A native 9:16 story (1080×1920): the type runs from STORY_TOP to STORY_BOTTOM, a size larger, and the
  // player fills the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#111216" : shade(club, -0.55);
  const wordInk = tonal ? (bright ? shade(club, -0.55) : shade(club, -0.12)) : "rgba(255,255,255,.85)";

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

  /* ---- the title, vertical ---- */
  const M = 64;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").normalize("NFC");
  const wordBottom = story ? STORY_BOTTOM : CANVAS_H - M;
  const maxLen = wordBottom - (story ? STORY_TOP : M);
  const n = Math.max(1, plain(word).length);
  // Big, but never thicker than a column (~190px of cap height); short words get their tracking opened up
  // so they still run the height of the canvas.
  const size = Math.min(story ? 300 : 262, maxLen / Math.max(1, lightEm(word, 0.12))) * ts;
  const glyphs = lightEm(word, 0) * size;
  const track = n > 1 ? Math.max(0.12, Math.min(story ? 0.95 : 0.62, (maxLen - glyphs) / (n - 1) / size)) : 0;
  const capH = size * CAP;
  const hasMarks = word !== plain(word).join("");
  const markRoom = hasMarks ? size * 0.2 : 0;
  const wordX = right ? M + markRoom + capH : CANVAS_W - M;
  /** Canvas x of the title's inner edge. */
  const inner = right ? wordX : CANVAS_W - M - capH - markRoom;

  /* ---- the player, on his side ---- */
  const faceX = right ? (story ? 785 : 745) : 335;
  let box = placeByFace(data, faceX, story ? 360 : 300, story ? { chest: 256, waist: 212, knees: 178, full: 142 } : { chest: 214, waist: 176, knees: 150, full: 118 });
  // A fist raised to one side: centre the figure a little towards his side, never into the title.
  const mid = right ? (story ? 770 : 735) : 345;
  const shift = mid - (box.left + box.width / 2);
  let lean = right ? Math.max(0, Math.min(110, shift)) : Math.min(0, Math.max(-110, shift));
  const edge = 24;
  if (right) lean = Math.min(lean, Math.max(-60, CANVAS_W - edge - (box.left + box.width)));
  else lean = Math.max(lean, Math.min(60, edge - box.left));
  box = { ...box, left: box.left + lean };

  /* ---- the small column beside the title, at the foot ---- */
  const gapX = 40 + (hasMarks ? size * 0.14 : 0);
  const colX = right ? inner + gapX : inner - gapX;
  const colW = story ? 290 : 300;
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const lastSize = Math.max(16 * k, Math.min(24 * k, (colW * 0.98) / Math.max(1, capsEm(last || first, 0.14)))) * ts;
  const line = homeName && awayName ? `${homeName} ${score || "v"} ${awayName}` : "";
  // The story stacks home over "v away": bigger type in a narrower column, clear of the bigger figure.
  const lines = story && line ? [homeName, `${score || "v"} ${awayName}`] : line ? [line] : [];
  const fixSize = Math.max(16 * k, Math.min(22 * k, (colW * 1.85) / Math.max(1, ...lines.map((l) => l.length)))) * ts;
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(10 * k, Math.min(12 * k, (colW * 0.95) / Math.max(1, capsEm(comp, 0.26)))) * ts;
  const crestFilter = params.crestColor ? "none" : "url(#goalvert-mono)";
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const colBottom = (story ? H - STORY_BOTTOM + 88 + 60 : M + 2 + 52 + 40) - (params.textY ?? 0);
  const align: CSSProperties = right ? { left: colX, textAlign: "left", alignItems: "flex-start" } : { left: colX - colW, width: colW, textAlign: "right", alignItems: "flex-end" };
  const small: CSSProperties = { fontFamily: SANS, color: WHITE, lineHeight: 1.3, maxWidth: colW };
  // The story: he melts into the ground above the foot, so the column beside the title stays clear.
  const storyFade = `linear-gradient(to bottom, #000 0, #000 ${1060 - box.top}px, transparent ${1330 - box.top}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="goalvert-mono" ink={0.55} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% 55% at ${right ? 66 : 34}% 40%, ${shade(ground, 0.14)}, ${ground} 62%, ${shade(ground, -0.35)} 100%)` }} />

      {/* The title, vertical, bottom to top. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <text
          transform={`translate(${wordX} ${wordBottom}) rotate(-90)`}
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontWeight={200}
          fontSize={size}
          letterSpacing={`${track}em`}
          fill={wordInk}
        >
          {word}
        </text>
      </svg>

      {/* The player, natural colour. */}
      {data.photoUrl && !story && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {/* The story: he melts into the ground above the foot, so the column beside the title stays clear. */}
      {data.photoUrl && story && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: storyFade, maskImage: storyFade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 420, background: `linear-gradient(to bottom, transparent, ${shade(ground, -0.4)}cc)` }} />

      {/* The column beside the title, at the foot. */}
      <div style={{ position: "absolute", bottom: colBottom, ...align, display: "flex", flexDirection: "column" }}>
        {first && last && <div style={{ ...small, fontWeight: 300, fontSize: 20 * k * ts, lineHeight: 1.1, opacity: 0.85 }}>{first}</div>}
        {(last || first) && <div style={{ ...small, fontWeight: 600, fontSize: lastSize, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1.15, marginTop: 4 }}>{last || first}</div>}
        <div style={{ width: 36, height: 1, background: "rgba(255,255,255,.55)", margin: `${22 * k}px 0 ${20 * k}px` }} />
        {lines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 400, fontSize: fixSize, whiteSpace: "nowrap", lineHeight: story ? 1.2 : 1.3 }}>
            {l}
          </div>
        ))}
        {comp && <div style={{ ...small, fontWeight: 500, fontSize: compSize, letterSpacing: "0.26em", textTransform: "uppercase", marginTop: 12 * k, opacity: 0.6 }}>{comp}</div>}
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 18 * k, marginTop: 24 * k, flexDirection: "row" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 38 * k, height: 38 * k, objectFit: "contain", filter: crestFilter }} />
            ))}
          </div>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 24 : 18}
        style={{ position: "absolute", ...(right ? { left: colX } : { right: CANVAS_W - colX }), bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
