/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = {
  a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8,
  n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9,
  A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3,
  N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1,
  " ": 26.7, "'": 31.3, "-": 46.3, ".": 27, ":": 27, "–": 50, "·": 27,
};
const interEm = (t: string, tracking = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);
/** The biggest size (≤ max) at which `t` fits `width`. */
const fitTo = (t: string, width: number, max: number, tracking = 0, min = 10) => Math.max(min, Math.min(max, width / Math.max(0.5, interEm(t, tracking))));

const sentence = (k: string) => {
  const s = k.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** `hex` pulled `t` of the way towards its own grey. */
function calm(hex: string, t: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const g = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
  return "#" + c.map((v) => Math.round(v + (g - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Home team first, names exactly as stored (only the case may change). */
function teamsOf(data: RenderData): string[] {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = (weHost ? c.homeTeam : c.awayTeam) || ours;
  const oppName = (weHost ? c.awayTeam : c.homeTeam) || titleCase(f.opp);
  return (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean) as string[];
}

/** The league round as a number ("Matchday 8", "Round 8", "Jornada 8", "MD 8"), or 0 for a cup tie / none. */
function roundNumber(data: RenderData): number {
  const m = /\b(?:MATCHDAY|MATCH DAY|ROUND|JORNADA|GAMEWEEK|MD|J)\s*(\d{1,2})\b/i.exec(data.content.subline ?? "");
  const n = m ? Number(m[1]) : 0;
  return n >= 1 && n <= 60 ? n : 0;
}

/**
 * Matchbar: the season so far as one thin line. On a flat deep club-tone ground, the free side carries a
 * medium Inter title at the top and, at the foot, a row of hairline ticks — one per matchday played up to
 * today, today's taller and in the club colour, labelled tiny ("MD 8") — with a faint hairline running on to
 * the column's edge (the season still to play). Fixture, date · kick-off · ground small under it. A cup tie
 * (no round number) shows a single highlighted tick labelled with the date. The player stands on the other
 * side, natural colour. params.side flips it.
 */
export function Matchbar({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.38 : 1;
  const ts = (params.textScale ?? 1) * S;
  const ty = params.textY ?? 0;
  const right = params.side !== "left";
  const M = 64;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) < 0.03) club = shade(club, 0.35);
  // The ground: the club colour calmed and taken deep; a pale club keeps a near-black ground with a hint of it.
  const ground = luminance(club) > 0.45 ? shade(calm(club, 0.4), -0.86) : shade(calm(club, 0.35), -0.7);
  const low = shade(ground, -0.4);
  // Today's tick must read on the ground: a dark club colour is lifted.
  const mark = luminance(club) < 0.1 ? shade(club, 0.35) : club;

  const f = matchFacts(data);
  const teams = teamsOf(data);
  const n = roundNumber(data);

  /* ---- the player on his side ---- */
  const cx = story ? (right ? 790 : 290) : right ? 770 : 310;
  const box = story
    ? placeByFace(data, cx, 540, { chest: 310, waist: 244, knees: 192, full: 156 })
    : placeByFace(data, cx, 290, { chest: 230, waist: 176, knees: 138, full: 110 });

  /* ---- the free column ---- */
  const colW = story ? 560 : 470;
  const side: CSSProperties = right ? { left: M } : { right: M };
  const align: CSSProperties = right ? { alignItems: "flex-start", textAlign: "left" } : { alignItems: "flex-end", textAlign: "right" };

  const title = sentence(content.kicker || "Matchday");
  const titleSize = fitTo(title, colW, 92 * ts, -0.035);
  // A cup tie has no round number for the row: its round goes up here with the competition.
  const comp = [titleCase(f.comp || ""), roundNumber(data) ? "" : titleCase(f.round || "")].filter(Boolean).join(" · ").toUpperCase();
  const capsTrack = 0.26;
  const compSize = fitTo(comp, colW, 13 * ts, capsTrack, 10);
  const fixtureText = teams.join("  v  ");
  // The foot stays clear of his body: the row and the lines end well before his centre line.
  const footW = Math.min(colW, Math.abs(cx - (right ? M : CANVAS_W - M)) - (story ? 380 : 330));
  const fixSize = fitTo(fixtureText, footW + 60, 22 * ts, -0.005, 12);
  const date = niceDate(content.date);
  const details = [n ? date : "", f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const detSize = fitTo(details, footW + 60, 18 * ts, 0, 11);

  /* ---- the ticks ---- */
  const count = Math.max(1, n);
  const step = Math.min(34 * S, (footW * 0.8) / count);
  const tickH = 22 * S;
  const todayH = 46 * S;
  const label = n ? `MD ${n}` : date.toUpperCase();
  const labelSize = 12 * ts;
  const ticks = Array.from({ length: count }, (_, i) => i);
  // Read from the margin towards the player: today's tick is the one nearest him.
  const rowH = todayH + labelSize + 14 * S;

  // The foot block stands on the NEYOD mark (post 52px, story 88px), ≥ 56px clear of it.
  const logoH = (story ? 88 : 52) * (params.logoScale ?? 1);
  const footBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0) + logoH + (story ? 66 : 60) - ty;

  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#fff" }}>
      {/* Flat ground, a breath of light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 50% at ${(cx / CANVAS_W) * 100}% ${story ? 40 : 38}%, ${shade(ground, 0.12)}, ${ground} 62%, ${low} 100%)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {/* The foot settles into the ground, so the small type always reads. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 460, background: `linear-gradient(to bottom, transparent, ${low}d9 70%, ${low})` }} />

      {/* Top: competition, then the title. */}
      <div style={{ position: "absolute", top: (story ? STORY_TOP : 72) + ty, ...side, width: colW, display: "flex", flexDirection: "column", ...align }}>
        {comp && <div style={{ ...caps, fontSize: compSize, letterSpacing: `${capsTrack}em`, marginRight: right ? 0 : `-${capsTrack}em`, color: "rgba(255,255,255,.66)" }}>{comp}</div>}
        <div
          style={{
            marginTop: comp ? 22 * S : 0,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: titleSize,
            lineHeight: 1,
            letterSpacing: "-0.035em",
            whiteSpace: "nowrap",
            marginLeft: right ? -titleSize * 0.05 : 0,
          }}
        >
          {title}
        </div>
      </div>

      {/* Foot: the season row, then the fixture. */}
      <div style={{ position: "absolute", bottom: footBottom, ...side, width: footW + 60, display: "flex", flexDirection: "column", ...align }}>
        <div style={{ position: "relative", width: footW, height: rowH }}>
          {/* The season still to play: a faint hairline on to the column's edge. */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,.22)" }} />
          {ticks.map((i) => {
            const today = i === count - 1;
            const x = i * step;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  bottom: 0,
                  [right ? "left" : "right"]: x,
                  width: today ? 4 * S : 2 * S,
                  height: today ? todayH : tickH,
                  background: today ? mark : "rgba(255,255,255,.55)",
                }}
              />
            );
          })}
          {/* Today's label over its tick. */}
          <div
            style={{
              ...caps,
              position: "absolute",
              bottom: todayH + 12 * S,
              [right ? "left" : "right"]: (count - 1) * step,
              fontSize: labelSize,
              letterSpacing: "0.18em",
              color: "#fff",
            }}
          >
            {label}
          </div>
        </div>
        <div style={{ marginTop: 40 * S, fontFamily: SANS, fontWeight: 500, fontSize: fixSize, letterSpacing: "-0.005em", whiteSpace: "nowrap", lineHeight: 1.1 }}>{fixtureText}</div>
        {details && <div style={{ marginTop: 12 * S, fontFamily: SANS, fontWeight: 400, fontSize: detSize, color: "rgba(255,255,255,.66)", whiteSpace: "nowrap", lineHeight: 1.1 }}>{details}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 24 : 20}
        style={{
          position: "absolute",
          ...side,
          bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: right ? "left bottom" : "right bottom",
        }}
      />
      <Film strength={0.18} />
    </div>
  );
}
