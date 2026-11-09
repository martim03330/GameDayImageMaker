/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#161616";
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** DM Serif Display: advance widths per 1px of font size (lower case and caps, approximate). */
const serifEm = (t: string) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.24 : c === "." ? 0.25 : /[il]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.78 : /[MW]/.test(c) ? 0.92 : /[A-Z]/.test(c) ? 0.68 : /\d/.test(c) ? 0.55 : 0.49), 0);
/** Inter 500 title case, roughly. */
const sansEm = (t: string) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.27 : c === "." ? 0.27 : /[il]/.test(c) ? 0.24 : /[mw]/.test(c) ? 0.86 : /[MW]/.test(c) ? 0.9 : /[A-Z]/.test(c) ? 0.68 : 0.56), 0);
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/** "MATCHDAY" → "Matchday", "PLAYER OF THE MATCH" → "Player of the Match". */
function sentence(t: string): string {
  return t
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && /^(of|the|and|v|vs)$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * Monoaccent: black-and-white editorial. The player in crisp black and white on a warm white or soft grey
 * ground, a big quiet title, small info — and exactly one thing in the club colour (the title's full stop,
 * a thin vertical bar, or a small solid square holding the round number). Crests as grey marks.
 */
export function Monoaccent({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920): title at STORY_TOP, info ~1.4× larger under it, the player larger, the logo ending at STORY_BOTTOM.
  const ts = (params.textScale ?? 1) * (story ? 1.4 : 1);
  const q = story ? 1.4 : 1;
  const r = rng(params.seed ?? 5);
  const grey = r() < 0.4;
  const serif = r() < 0.6;
  const right = params.side !== "left";

  // The one colour: the club's, kept readable on a pale ground.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5 || luminance(club) < 0.025) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);
  if (luminance(club) < 0.025) club = "#b3122e";
  const ground = grey ? "#e3e2df" : "#f2eee8";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;
  const roundNo = f.roundNo || (/(\d+)/.exec(f.round)?.[1] ?? "");
  const pick = r();
  const accent: "stop" | "bar" | "square" = pick < 0.4 ? "stop" : pick < 0.7 || !roundNo ? "bar" : "square";

  /* ---- the title ---- */
  const M = 68;
  const raw = isResult && postType === "result" ? "Full Time" : sentence((content.kicker || "Matchday").replace(/’/g, "'"));
  const word = raw.replace(/[.!]+$/, "");
  const em = (t: string) => (serif ? serifEm(t) : sansEm(t) * 1.0);
  const maxW = CANVAS_W - 2 * M;
  let titleLines = [word];
  let tSize = Math.min((serif ? 172 : 150) * (story ? 1.15 : 1), maxW / Math.max(1, em(word + ".")));
  const words = word.split(" ");
  if (tSize < (serif ? 110 : 86) && words.length > 1) {
    // Two lines, split where they are most even.
    let best = 1;
    let bestW = Infinity;
    for (let i = 1; i < words.length; i++) {
      const w = Math.max(em(words.slice(0, i).join(" ")), em(words.slice(i).join(" ") + "."));
      if (w < bestW) [best, bestW] = [i, w];
    }
    titleLines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    tSize = Math.min(serif ? 150 : 112, maxW / bestW);
  }
  tSize *= params.textScale ?? 1;
  const lineH = serif ? 0.98 : 1.0;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const titleBottom = titleTop + tSize * lineH * titleLines.length;

  /* ---- the player, B&W, on his side ---- */
  const faceX = right ? 690 : 390;
  const faceTop = story ? Math.max(titleBottom + 110, 500) : Math.max(titleBottom + 50, 360);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 310, waist: 270, knees: 218, full: 168 } : { chest: 230, waist: 200, knees: 162, full: 126 });

  /* ---- the small info, on the free side ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? titleCase(f.opp));
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? (isResult ? `${pair[0]} ${score} ${pair[1]}` : `${pair[0]} v ${pair[1]}`) : opp ? `v ${opp}` : "";
  const colW = story ? 420 : 340;
  const fixSize = Math.max(18 * q, Math.min(26 * q, (colW * 1.85) / Math.max(1, fixture.length))) * (params.textScale ?? 1);
  const lines = [[niceDate(content.date), isResult ? "" : f.time].filter(Boolean).join("  ·  "), titleCase(f.venue)].filter(Boolean);
  const comp = titleCase(f.comp || "") || titleCase(f.round || "");
  const compSize = Math.max(10 * q, Math.min(12 * q, (colW * 0.95) / Math.max(1, capsEm(comp, 0.26)))) * (params.textScale ?? 1);
  const infoTop = titleBottom + 58 * q;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : "grayscale(1) contrast(1.25) brightness(.62)";
  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const small: CSSProperties = { fontFamily: SANS, color: INK, lineHeight: 1.3, maxWidth: colW };
  const titleStyle: CSSProperties = serif
    ? { fontFamily: DMSERIF, fontWeight: 400, letterSpacing: "-0.01em" }
    : { fontFamily: SANS, fontWeight: 500, letterSpacing: "-0.035em" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      {/* The ground: flat, a soft fall-off to the corners. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at ${right ? 62 : 38}% 55%, ${shade(ground, 0.25)}, ${ground} 60%, ${shade(ground, -0.06)} 100%)` }} />

      {/* The title, with its full stop as the one colour (when that is the accent). */}
      <div style={{ position: "absolute", top: titleTop, ...side, display: "flex", flexDirection: "column" }}>
        {titleLines.map((l, i) => (
          <div key={i} style={{ ...titleStyle, fontSize: tSize, lineHeight: lineH, color: INK, whiteSpace: "nowrap" }}>
            {l}
            {i === titleLines.length - 1 && <span style={{ color: accent === "stop" ? club : INK }}>.</span>}
          </div>
        ))}
      </div>

      {/* The player, black and white. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "grayscale(1) contrast(1.22) brightness(1.03)", ...cutMask(data.cut) }}
        />
      )}

      {/* Info on the free side: the accent bar or square, the fixture, date · kick-off, ground, competition. */}
      <div style={{ position: "absolute", top: infoTop, ...side, display: "flex", flexDirection: "column" }}>
        {accent === "square" && (
          <div style={{ width: 62 * q, height: 62 * q, background: club, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 * q, fontFamily: SANS, fontWeight: 500, fontSize: 26 * q, color: "#fff", letterSpacing: "-0.01em" }}>
            {roundNo}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: right ? "row" : "row-reverse", gap: 22 * q }}>
          {accent === "bar" && <div style={{ width: story ? 6 : 5, alignSelf: "stretch", background: club, flexShrink: 0 }} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
            {comp && <div style={{ ...small, fontWeight: 500, fontSize: compSize, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 16 * q, opacity: 0.6 }}>{comp}</div>}
            {fixture && <div style={{ ...small, fontWeight: 500, fontSize: fixSize }}>{fixture}</div>}
            {lines.map((l, i) => (
              <div key={i} style={{ ...small, fontWeight: 300, fontSize: 19 * ts, marginTop: (i === 0 ? 10 : 4) * q, opacity: 0.75 }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Foot on the free side: crests as grey marks, then the agency logo. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", bottom: story ? H - STORY_BOTTOM + 152 : 128, ...side, display: "flex", gap: 20 * q, alignItems: "center", flexDirection: "row" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 40 * q, height: 40 * q, objectFit: "contain", filter: crestFilter, opacity: params.crestColor ? 1 : 0.85 }} />
          ))}
        </div>
      )}
      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 18}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 54) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
