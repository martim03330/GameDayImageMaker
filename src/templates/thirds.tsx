/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const COL = CANVAS_W / 3;
const PAD = 56;
const CELL_W = COL - PAD - 28;

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter, mixed case, roughly: em per glyph. */
const textEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.26 : /[ilIj.,'·:]/.test(c) ? 0.27 : /[mwMW]/.test(c) ? 0.85 : /[A-Z]/.test(c) ? 0.66 : /\d/.test(c) ? 0.6 : 0.53), 0);
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/** Font size for `t` to fit `lines` lines of the cell width, between min and max. */
function fitSize(t: string, max: number, min: number, lines = 1, k = 1): number {
  const words = t.split(/\s+/);
  const longest = Math.max(...words.map(textEm));
  const bySpan = (CELL_W * lines * 0.92) / Math.max(0.5, textEm(t));
  const byWord = CELL_W / Math.max(0.5, longest);
  return Math.max(min, Math.min(max * k, bySpan, byWord));
}

/**
 * Thirds: a rule-of-thirds hairline grid over a clean ground, the player's eyes on the upper line and his
 * face on one of the verticals; the information set inside the grid cells on the free side as small,
 * aligned labels, each cell with a tiny index — 01 title, 02 date and kick-off, 03 fixture, 04 ground,
 * 05 competition. Flips with params.side.
 */
export function Thirds({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  // Native 9:16 story: the thirds of the tall frame; the top row's type drops under the profile bar,
  // everything stays above the reply bar, the type grows where the cells allow and the player is bigger.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ROW = H / 3;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const lightGround = r() < 0.55;
  // Player on the right third by default; side "left" puts him on the left third.
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);

  const ground = lightGround ? "#ecebe7" : shade(club, -0.74);
  const ink = lightGround ? "#1b1c1f" : "#ffffff";
  const soft = lightGround ? "rgba(27,28,31,.55)" : "rgba(255,255,255,.6)";
  const line = lightGround ? "rgba(27,28,31,.13)" : "rgba(255,255,255,.13)";
  const accent = lightGround ? club : "#ffffff";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player: face on the vertical, eyes on the upper horizontal ---- */
  const faceX = right ? 2 * COL : COL;
  const sizes = story ? { chest: 310, waist: 246, knees: 194, full: 152 } : { chest: 240, waist: 190, knees: 150, full: 116 };
  const probe = placeByFace(data, faceX, 0, sizes);
  const eyes = ROW;
  const box = placeByFace(data, faceX, eyes - probe.faceH * 0.45, sizes);
  // Story: a cropped photo grows to reach the foot, and his hair can climb into the top row — then the
  // competition leaves the top-right cell for the foot of the fixture cell, in the free column.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const hairTop = box.top + Math.max(0, face[1] - face[3] * 0.55) * box.height;
  const compBelow = story && hairTop < STORY_TOP + 200;

  /* ---- the cells ---- */
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = shortName(oursName);
  const them = shortName(typed ?? titleCase(f.opp));
  const pair = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  const title = (hasScore && postType === "result" ? "Full time" : content.kicker || "Matchday").replace(/’/g, "'");
  const titleCaps = title.toUpperCase();
  const tSize = Math.min(44 * k, (CELL_W * 0.98) / Math.max(1, capsEm(titleCaps, 0.04))) * ts;
  const date = niceDate(content.date);
  const venue = titleCase(f.venue);
  const comp = titleCase([f.comp, f.round].filter(Boolean).join(" · "));

  // Cell positions (column, row) counted from the free side.
  const col = (i: number) => (right ? i : 2 - i);
  const pos = (c: number, rr: number) => ({ left: col(c) * COL + PAD, top: (story && rr === 0 ? STORY_TOP : rr * ROW + PAD) + (params.textY ?? 0) });

  const label = (): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: (story ? 14 : 11) * ts, letterSpacing: "0.26em", textTransform: "uppercase", color: soft, whiteSpace: "nowrap", lineHeight: 1 });
  const value = (size: number, weight = 400): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size * k * ts, lineHeight: 1.18, color: ink, letterSpacing: "-0.005em" });

  const Cell = ({ n, c, row, name, children, flow }: { n: string; c: number; row: number; name: string; children: ReactNode; flow?: boolean }) => (
    <div style={{ position: flow ? "relative" : "absolute", ...(flow ? {} : pos(c, row)), width: CELL_W, display: "flex", flexDirection: "column", gap: story ? 18 : 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ ...label(), color: accent, opacity: lightGround ? 1 : 0.9, letterSpacing: "0.08em" }}>{n}</span>
        {name && <span style={label()}>{name}</span>}
      </div>
      {children}
    </div>
  );

  // value() grows the type for the story itself; these only fit it to the cell.
  const fixSize = Math.min(...pair.map((p) => fitSize(p, 24, 15, 1, k))) / k;
  const venueSize = fitSize(venue, 22, 14, 2, k) / k;
  const compSize = fitSize(comp, 18, 13, 2, k) / k;

  // The foot of the face's column: crests at the bottom of the fixture cell.
  const fixtureCell = (
    <Cell n="03" c={0} row={1} name="Fixture">
      {pair.length === 2 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={value(fixSize)}>{pair[0]}</div>
          <div style={{ ...value(fixSize), color: soft }}>v</div>
          <div style={value(fixSize)}>{pair[1]}</div>
        </div>
      ) : (
        <div style={value(fixSize)}>{pair[0] ?? ""}</div>
      )}
      {crests.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 50 : 34, height: story ? 50 : 34, objectFit: "contain" }} />
          ))}
        </div>
      )}
    </Cell>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* The ground: flat, a soft lift behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 50% at ${right ? 66 : 34}% 45%, ${lightGround ? "#f5f4f1" : shade(club, -0.6)}, ${ground} 70%)` }} />

      {/* The grid: two verticals, two horizontals, hairline. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {[COL, 2 * COL].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke={line} strokeWidth={1} />
        ))}
        {[ROW, 2 * ROW].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={CANVAS_W} y2={y} stroke={line} strokeWidth={1} />
        ))}
        {/* Tiny ticks where the lines cross, as on a viewfinder. */}
        {[COL, 2 * COL].flatMap((x) =>
          [ROW, 2 * ROW].map((y) => <path key={`${x}${y}`} d={`M${x - 7} ${y}H${x + 7}M${x} ${y - 7}V${y + 7}`} stroke={soft} strokeWidth={1} />),
        )}
      </svg>

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}

      {/* 01 title · 02 date / kick-off · 05 competition across the top row. */}
      <Cell n="01" c={0} row={0} name="">
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tSize, letterSpacing: "0.04em", lineHeight: 1, color: ink, whiteSpace: "nowrap", marginTop: 6 }}>{titleCaps}</div>
      </Cell>
      <Cell n="02" c={1} row={0} name={hasScore ? "Result" : "Date"}>
        {hasScore ? (
          <>
            <div style={{ ...value(30, 300), whiteSpace: "nowrap" }}>{score}</div>
            {date && <div style={{ ...value(17), color: soft }}>{date}</div>}
          </>
        ) : (
          <>
            {date && <div style={{ ...value(22, 400), whiteSpace: "nowrap" }}>{date}</div>}
            {f.time && <div style={{ ...value(17), color: soft, whiteSpace: "nowrap" }}>Kick-off {f.time}</div>}
          </>
        )}
      </Cell>
      {comp && !compBelow && (
        <Cell n="05" c={2} row={0} name="Competition">
          <div style={{ ...value(compSize), maxWidth: CELL_W }}>{comp}</div>
        </Cell>
      )}

      {/* 03 fixture · 04 ground down the free column. */}
      {fixtureCell}
      {venue && (
        <Cell n={compBelow && comp ? "05" : "04"} c={0} row={2} name="Ground">
          <div style={{ ...value(venueSize), maxWidth: CELL_W }}>{venue}</div>
        </Cell>
      )}
      {comp && compBelow && (
        <div style={{ position: "absolute", left: pos(0, 1).left, bottom: H - 2 * ROW + 44 - (params.textY ?? 0) }}>
          <Cell n="04" c={0} row={1} name="Competition" flow>
            <div style={{ ...value(compSize), maxWidth: CELL_W }}>{comp}</div>
          </Cell>
        </div>
      )}

      <AgencyLogo
        data={data}
        onLight={lightGround}
        height={story ? 24 : 18}
        style={{ position: "absolute", [right ? "left" : "right"]: PAD, bottom: (story ? H - STORY_BOTTOM : PAD + 6) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={lightGround ? 0.1 : 0.18} />
    </div>
  );
}
