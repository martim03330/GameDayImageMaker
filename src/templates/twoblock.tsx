/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const PAPER = "#efede8";
const INK = "#141416";

/** Inter 600 capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 64) / 100 + tracking, 0);

/** "SC Vianense SAD" → "Vianense". */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
  return s || n;
}

/**
 * Twoblock: Bauhaus-minimal geometry. The canvas cut into two flat fields — the club colour and an
 * off-white — either as a large rectangle in one corner or as a vertical split (by seed); the player in
 * action crossing the boundary so he joins the two. The title small on the colour field, the fixture small
 * on the paper field, crests small. Two colours and the photo, nothing else.
 */
export function Twoblock({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 7);
  const left = params.side !== "left"; // the colour field on the left, the player crossing its right edge
  const corner = r() < 0.5;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.4) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.18);
  club = shade(club, -0.16);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the two fields ---- */
  const M = 64;
  const edgeX = corner ? 620 : 594; // the colour field's inner vertical edge, from its own side
  const edgeY = corner ? 790 : CANVAS_H; // the corner block's bottom edge
  const block: CSSProperties = { position: "absolute", top: 0, width: edgeX, height: edgeY, background: club, ...(left ? { left: 0 } : { right: 0 }) };
  const boundaryX = left ? edgeX : CANVAS_W - edgeX;

  /* ---- the player, across the boundary ---- */
  const faceX = boundaryX + (left ? 20 : -20);
  const box = placeByFace(data, faceX, 390, { chest: 260, waist: 200, knees: 154, full: 120 });

  /* ---- the title, small, top of the colour field ---- */
  const title = (isResult && postType === "result" ? "Full time" : content.kicker || "Matchday").toUpperCase().replace(/’/g, "'");
  const tTrack = 0.34;
  const tSize = Math.min(30 * ts, 420 / Math.max(1, capsEm(title, tTrack)));
  const comp = titleCase(f.comp || f.round || "");
  const cSize = Math.max(12, Math.min(17, 400 / Math.max(1, comp.length * 0.55)));

  /* ---- the fixture, small, on the paper field ---- */
  const ours = shortName(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(isResult ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const fxSize = Math.max(16, Math.min(24 * ts, 360 / Math.max(1, fixture.length * 0.55)));
  const when = [niceDate(content.date), isResult ? "" : f.time].filter(Boolean).join("  ·  ");
  const venue = titleCase(f.venue);
  const vSize = Math.max(11, Math.min(13, 380 / Math.max(1, venue.length * 0.85)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const capsStyle = (size: number, track: number, weight: number, color: string): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color,
  });
  const colourSide: CSSProperties = left ? { left: M, alignItems: "flex-start", textAlign: "left" } : { right: M, alignItems: "flex-end", textAlign: "right" };
  const paperSide: CSSProperties = left ? { right: M, alignItems: "flex-end", textAlign: "right" } : { left: M, alignItems: "flex-start", textAlign: "left" };
  // The logo sits on paper: under the corner block, or on the paper half of a split.
  const logoSide = corner ? (left ? { left: M } : { right: M }) : left ? { right: M } : { left: M };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={block} />

      {/* The player, natural colour, joining the two fields. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}

      {/* Colour field: the title and the competition. */}
      <div style={{ position: "absolute", top: M + 6 + (params.textY ?? 0), ...colourSide, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={capsStyle(tSize, tTrack, 600, WHITE)}>{title}</div>
        {comp && <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: cSize, color: "rgba(255,255,255,.78)", whiteSpace: "nowrap", lineHeight: 1 }}>{comp}</div>}
      </div>

      {/* Paper field, level with the title: crests, the fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", top: M + (params.textY ?? 0), ...paperSide, display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 16, marginBottom: 12, flexDirection: left ? "row-reverse" : "row" }}>
            {(left ? [...crests].reverse() : crests).map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
            ))}
          </div>
        )}
        {fixture && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fxSize, whiteSpace: "nowrap", lineHeight: 1.1, color: INK, letterSpacing: "-0.01em" }}>{fixture}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 18 * ts, whiteSpace: "nowrap", lineHeight: 1.1, color: "rgba(20,20,22,.7)" }}>{when}</div>}
        {venue && <div style={{ ...capsStyle(vSize, 0.24, 500, "rgba(20,20,22,.5)"), marginTop: 4 }}>{venue}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={20}
        onLight
        style={{ position: "absolute", ...logoSide, bottom: 56 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left" in logoSide ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.15} />
    </div>
  );
}
