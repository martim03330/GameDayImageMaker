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

const MONTH_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** Inter 500: advance widths per 100px (measured in the browser). */
const W500: Record<string, number> = { "0": 64.5, "1": 41.5, "2": 61.6, "3": 62.7, "4": 65.6, "5": 60.3, "6": 63, "7": 58.9, "8": 62.9, "9": 63, a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, ".": 30.3, ":": 30.3, "-": 46.3, "–": 50, "'": 31.3, "·": 30.3, "/": 37 };
const TRACK = -0.025;
const em = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (W500[c] ?? 60) / 100 + TRACK, -TRACK);

/** "17 OCT" (or "SAT 17 OCT") → "17.10". */
function numericDate(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]] ?? m[2]}`;
}

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortClub(n: string): string {
  return n.trim();
}

/** "TAÇA DE PORTUGAL 3RD QUALIFYING ROUND" → "Taça de Portugal"; "MALTA PREMIER LEAGUE OPENING" → "Premier League"; "LIGA 3 PLACARD SÉRIE A" → "Liga 3". */
function shortComp(c: string): string {
  let s = c.toUpperCase().replace(/\s+\b(OPENING|CLOSING|\d+(ST|ND|RD|TH)|QUALIFYING|ROUND|MATCHDAY|PHASE|STAGE)\b.*$/, "").trim();
  let w = s.split(/\s+/);
  if (s.length > 16 && w.length > 2 && /^(MALTA|MALTESE|PORTUGAL|PORTUGUESE|ENGLISH|SPANISH|ITALIAN|GERMAN|FRENCH|SWISS|CYPRUS|CYPRIOT|GREEK|POLISH|ROMANIAN|BELGIAN|DUTCH)$/.test(w[0])) w = w.slice(1);
  s = w.join(" ");
  if (s.length > 16 && w.length > 2) s = w.slice(0, 2).join(" ");
  return titleCase(s);
}

/**
 * Timetable: a departures board. On the free side a tall stack of large lines in Inter medium, all one
 * size and tightly led — the title, the date, kick-off (or the score), the opponent, the competition —
 * alternating full and 40% ink, each with a tiny spaced label to its left and a hairline between rows.
 * The player on the other side in natural colour, on a deep club tone or an off-white ground (by seed).
 */
export function Timetable({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 11);
  const right = params.side !== "left";
  const light = r() < 0.5;
  const ts = params.textScale ?? 1;
  // Native 9:16 story: the board grows and drops to the lower safe zone, the player fills the height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const deep = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.5);
  const ground = light ? "#efede8" : deep;
  const ink = light ? "#121214" : "#ffffff";
  const dim = light ? "rgba(18,18,20,.4)" : "rgba(255,255,255,.4)";
  const hair = light ? "rgba(18,18,20,.16)" : "rgba(255,255,255,.18)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortClub(typed ?? titleCase(f.opp));
  const comp = shortComp(f.comp || f.round || "");
  const title = isResult && postType === "result" ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase().replace(/’/g, "'"));

  const rows = [
    { label: postType === "matchday" || isResult ? "Event" : "", text: title },
    { label: "Date", text: numericDate(content.date) },
    isResult ? { label: "Score", text: score } : { label: "KO", text: f.time },
    { label: "Opp", text: opp ? `v ${opp}` : "" },
    { label: "Comp", text: comp },
  ].filter((x) => x.text);

  /* ---- the stack: one size for all, long lines shrink on their own ---- */
  const M = 64;
  const labelW = 104 * (story ? 1.06 : 1);
  const colW = 430 * (story ? 1.05 : 1);
  const base = 76 * ts * k;
  const common = Math.max(58 * ts * k, Math.min(base, ...rows.map((x) => colW / Math.max(0.5, em(x.text)))));
  const pitch = common * (story ? 1.4 : 1.22);
  const stackH = rows.length * pitch;
  const stackTop = story
    ? Math.max(420, STORY_BOTTOM - (f.venue ? 198 : 150) - stackH + (params.textY ?? 0))
    : Math.max(150, Math.min(CANVAS_H - 260 - stackH, 320 + (params.textY ?? 0)));
  const blockX = right ? M : CANVAS_W - M - labelW - colW;
  const textX = blockX + labelW;

  /* ---- the player, on the other side ---- */
  const cx = right ? 790 + r() * 20 : 290 - r() * 20;
  const box = story
    ? placeByFace(data, right ? cx + 30 : cx - 30, STORY_TOP + 120, { chest: 300, waist: 230, knees: 180, full: 150 })
    : placeByFace(data, cx, 250, { chest: 230, waist: 176, knees: 136, full: 108 });

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = light || params.crestColor ? "none" : "url(#timetable-mono)";
  const venue = titleCase(f.venue);
  const tiny: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: story ? 17 : 13, letterSpacing: "0.28em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, color: dim };
  const freeSide: CSSProperties = right ? { left: M } : { right: M };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="timetable-mono" ink={0.55} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light
            ? `radial-gradient(60% 50% at ${right ? 72 : 28}% 46%, #f7f6f2, ${ground} 70%, #e6e3dc 100%)`
            : `radial-gradient(60% 50% at ${right ? 72 : 28}% 42%, ${shade(deep, 0.1)}, ${deep} 65%, ${shade(deep, -0.3)} 100%)`,
        }}
      />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}

      {/* Top of the free side: crests, small. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: story ? STORY_TOP : M, ...freeSide, display: "flex", gap: story ? 22 : 18, alignItems: "center", flexDirection: right ? "row" : "row-reverse" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 60 : 40, height: story ? 60 : 40, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}

      {/* The board. */}
      {rows.map((row, i) => {
        const size = Math.min(common, colW / Math.max(0.5, em(row.text)));
        const top = stackTop + i * pitch;
        const cap = common * 0.727;
        const base = top + (pitch + cap) / 2;
        return (
          <div key={i}>
            <div style={{ position: "absolute", top, left: blockX, width: labelW + colW, height: 1, background: hair }} />
            <div style={{ position: "absolute", left: blockX, top: base - cap - 3, ...tiny }}>{row.label}</div>
            <div
              style={{
                position: "absolute",
                left: textX,
                top: base - size * 0.97,
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: `${TRACK}em`,
                whiteSpace: "nowrap",
                color: i % 2 ? dim : ink,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.text}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: stackTop + rows.length * pitch, left: blockX, width: labelW + colW, height: 1, background: hair }} />
      {venue && <div style={{ position: "absolute", top: stackTop + rows.length * pitch + (story ? 30 : 26), left: textX, ...tiny, letterSpacing: "0.22em", fontSize: Math.max(10, Math.min(story ? 16 : 12, (story ? 500 : 420) / (venue.length * 0.9))) }}>{venue}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight={light}
        style={{ position: "absolute", ...freeSide, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
