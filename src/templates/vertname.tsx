/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
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
 * Vertname: his surname set very large and vertical (reading bottom to top) in a thin, wide-tracked sans
 * along the free edge — tone on tone with the deep club ground, or white at 85% — the player in natural
 * colour on the other side, and a narrow column of small type (title, fixture, date · kick-off · ground)
 * standing beside the name.
 */
export function Vertname({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920): the name runs the band (STORY_TOP..above the logo at STORY_BOTTOM), the column ~1.4×
  // larger at STORY_TOP, the player larger.
  const ts = (params.textScale ?? 1) * (story ? 1.4 : 1);
  const q = story ? 1.4 : 1;
  const r = rng(params.seed ?? 11);
  const tonal = r() < 0.5;
  // The player stands on params.side; the name runs up the other edge.
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#111216" : shade(club, -0.55);
  const nameInk = tonal ? (bright ? shade(club, -0.55) : shade(club, -0.18)) : "rgba(255,255,255,.85)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the name, vertical ---- */
  const M = 64;
  const name = (content.lastName || content.firstName || "").toUpperCase().normalize("NFC");
  const TRACK = 0.16;
  const nameBottom = story ? STORY_BOTTOM - 152 : CANVAS_H - 132;
  const maxLen = nameBottom - (story ? STORY_TOP : M);
  const hasMarks = name !== plain(name).join("");
  // As long as the canvas allows, but never thicker than a column (~165px of cap height).
  const size = Math.min(story ? 290 : 230, maxLen / Math.max(1, lightEm(name, TRACK))) * (params.textScale ?? 1);
  const nameLen = Math.min(maxLen, lightEm(name, TRACK) * size);
  const capH = size * CAP;
  // Rotated -90°, the glyph tops (and accents) face left. On the left edge the baseline is the column's inner
  // edge; on the right edge it sits on the outer margin and the tops face inwards.
  const markRoom = hasMarks ? size * 0.2 : 0;
  const nameX = right ? M + markRoom + capH : CANVAS_W - M;
  /** Canvas x of the name's inner edge (accents included). */
  const inner = right ? nameX : CANVAS_W - M - capH - markRoom;

  /* ---- the player, on his side ---- */
  const faceX = right ? 720 : 360;
  const box = placeByFace(data, faceX, story ? 610 : 330, story ? { chest: 300, waist: 262, knees: 210, full: 166 } : { chest: 230, waist: 200, knees: 160, full: 124 });

  /* ---- the small column beside the name ---- */
  const gapX = 36 + (hasMarks ? size * 0.14 : 0);
  const colX = right ? inner + gapX : inner - gapX;
  const colW = story ? 400 : 300;
  const title = (isResult && postType === "result" ? "Full Time" : content.kicker || "Matchday").toUpperCase().replace(/’/g, "'");
  const tSize = Math.max(14 * q, Math.min(22 * q, colW / Math.max(1, capsEm(title, 0.3)))) * (params.textScale ?? 1);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? titleCase(f.opp));
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? (isResult ? `${pair[0]} ${score} ${pair[1]}` : `${pair[0]} v ${pair[1]}`) : opp ? `v ${opp}` : "";
  const fixSize = Math.max(16 * q, Math.min(23 * q, (colW * 1.85) / Math.max(1, fixture.length))) * (params.textScale ?? 1);
  const lines = [niceDate(content.date), isResult ? "" : f.time ? `Kick-off ${f.time}` : "", titleCase(f.venue)].filter(Boolean);
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(10 * q, Math.min(12 * q, (colW * 0.95) / Math.max(1, capsEm(comp, 0.26)))) * (params.textScale ?? 1);
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : "url(#vertname-mono)";
  const colTop = (story ? STORY_TOP : M + 6) + (params.textY ?? 0);
  const align: CSSProperties = right ? { left: colX, textAlign: "left", alignItems: "flex-start" } : { left: colX - colW, width: colW, textAlign: "right", alignItems: "flex-end" };
  const small: CSSProperties = { fontFamily: SANS, color: WHITE, lineHeight: 1.3, maxWidth: colW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="vertname-mono" ink={0.55} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% 55% at ${right ? 66 : 34}% 42%, ${shade(ground, 0.12)}, ${ground} 62%, ${shade(ground, -0.35)} 100%)` }} />

      {/* The name, vertical, bottom to top. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <text
          transform={`translate(${nameX} ${nameBottom}) rotate(-90)`}
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontWeight={200}
          fontSize={size}
          letterSpacing={`${TRACK}em`}
          fill={nameInk}
        >
          {name}
        </text>
      </svg>

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 300, background: `linear-gradient(to bottom, transparent, ${shade(ground, -0.4)}bb)` }} />

      {/* The column beside the name. */}
      <div style={{ position: "absolute", top: colTop, ...align, display: "flex", flexDirection: "column" }}>
        <div style={{ ...small, fontWeight: 500, fontSize: tSize, letterSpacing: "0.3em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 }}>{title}</div>
        <div style={{ width: 36 * q, height: 1, background: "rgba(255,255,255,.55)", margin: `${22 * q}px 0 ${22 * q}px` }} />
        {fixture && <div style={{ ...small, fontWeight: 400, fontSize: fixSize }}>{fixture}</div>}
        {lines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 300, fontSize: 18 * ts, marginTop: (i === 0 ? 10 : 4) * q, opacity: 0.78 }}>
            {l}
          </div>
        ))}
        {comp && <div style={{ ...small, fontWeight: 500, fontSize: compSize, letterSpacing: "0.26em", textTransform: "uppercase", marginTop: 18 * q, opacity: 0.55 }}>{comp}</div>}
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 18 * q, marginTop: 26 * q, flexDirection: "row" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 38 * q, height: 38 * q, objectFit: "contain", filter: crestFilter }} />
            ))}
          </div>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 24 : 18}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
