/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { competitionOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { clubDeep, goodStats, lift } from "./column";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, INTER, mix, MonoDefs, titleCase } from "./wall";

/* ---------- helpers shared by the gradient / ring / glass looks ---------- */

const MON_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };
const MON = Object.keys(MON_NO);

/** The game's date as "SAT 10 OCT": the post's own date, else (goal / result) the last game played. */
export function gameDate(data: RenderData): string {
  const d = (data.content.date ?? "").trim().toUpperCase();
  if (d) return d;
  if (data.postType !== "goal" && data.postType !== "result") return "";
  const iso = data.matches?.[0]?.date;
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  if (!m) return "";
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${Number(m[3])} ${MON[dt.getMonth()]}`;
}

/** Inter Light: rough advance of mixed-case text, per 1px of font size. */
export const INTER_LIGHT = 0.53;

/** Font size that fits `text` in `width` (Inter Light, mixed case), capped at `max`. */
export const fitLight = (text: string, width: number, max: number, ratio = INTER_LIGHT) => Math.min(max, width / Math.max(1, [...text].length * ratio));

/** "MOISÉS" → "Moisés"; names typed in mixed case stay as they are. */
export const nameCase = (s: string) => (s && (s === s.toUpperCase() || s === s.toLowerCase()) ? s.toLowerCase().replace(/(^|[\s\-'’])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()) : s);

/** Short words that are real words, not initials (so "RIO AVE" → "Rio Ave" but "USC PAREDES" → "USC Paredes"). */
const SHORT_WORDS = new Set(["RIO", "AVE", "SAN", "SAO", "SÃO", "DEL", "LOS", "LAS", "VAL", "BOA", "LUZ", "SOL", "MAR", "FOZ", "OS", "AS", "DE", "DA", "DO", "LA", "EL", "LE", "OLD", "NEW", "ONE", "TOP", "BAY", "SEA", "ST", "ST."]);

/** Team names in title case, keeping initials such as "USC", "SC", "FC" in capitals. */
export function teamCase(name: string): string {
  if (!name || name !== name.toUpperCase()) return name;
  const orig = name.split(/(\s+)/);
  return titleCase(name)
    .split(/(\s+)/)
    .map((w, i) => (/^\p{L}{2,3}$/u.test(orig[i] ?? "") && !SHORT_WORDS.has(orig[i]) ? orig[i] : w))
    .join("");
}

/** "2026/27": the season running today (it turns over in July). */
export function seasonOf(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
}

/** The other team as it should be printed, and which crest is ours / theirs (never swapped). */
export function sides(data: RenderData) {
  const md = matchFacts(data);
  const c = data.content;
  const ours = (data.club?.name ?? "").toLowerCase();
  // A goal / result post holds both teams: the one that is not us.
  let opp = md.opp;
  if (!opp && c.homeTeam && c.awayTeam) opp = (c.homeTeam.toLowerCase() === ours ? c.awayTeam : c.homeTeam).toUpperCase();
  return { ...md, opp };
}

/** The score with our team first when we know which side we were ("" when there is none). */
export function ourScore(data: RenderData): { text: string; ours: number; theirs: number } | null {
  const s = scoreOf(data);
  if (!s) return null;
  const c = data.content;
  const ours = (data.club?.name ?? "").toLowerCase();
  const weHome = c.home ?? ((c.homeTeam ?? "").toLowerCase() === ours ? true : (c.awayTeam ?? "").toLowerCase() === ours ? false : true);
  const h = Number(c.homeGoals);
  const a = Number(c.awayGoals);
  return { text: `${c.homeGoals}–${c.awayGoals}`, ours: weHome ? h : a, theirs: weHome ? a : h };
}

/* ---------- the look ---------- */

/**
 * Minimal Premier League goal card (Morgan Rogers "Brace", Aston Villa): a smooth vertical fade from a pale
 * sky tint to the deep club colour, one big translucent arrowhead pointing away from the player with thin
 * numbers at its corners (kick-off and round on matchday; score and minutes after the game), the player on
 * the move with a soft floor shadow, and quiet Inter Light labels around him — date, ground, kicker, name,
 * "vs Opponent" — with the competition and a white crest mark in the bottom corners.
 */
export function Gradient({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 21;
  const r = rng(seed);
  const mirror = params.side === "left";
  const X = (x: number) => (mirror ? CANVAS_W - x : x);
  const ts = params.textScale ?? 1;

  // ---- colours: sky at the top, the deep club colour below ----
  const club = clubColour(data);
  let deep = clubDeep(data);
  if (luminance(deep) > 0.12) deep = shade(deep, -0.3);
  const acc = params.accent;
  const accUsable = luminance(acc) > 0.18 && luminance(acc) < 0.9 && acc.toLowerCase() !== params.primary.toLowerCase();
  const sky = accUsable ? mix(acc, "#f4f6f8", 0.45) : mix(club, "#eef2f6", 0.72);
  const at = (y: number) => {
    const t = y / CANVAS_H;
    return t < 0.2 ? sky : t < 0.72 ? mix(sky, deep, (t - 0.2) / 0.52) : deep;
  };
  const inkFor = (y: number) => (luminance(at(y)) > 0.5 ? mix(deep, "#000000", 0.15) : "#ffffff");

  // ---- the player: on the move, feet on the floor ----
  const floor = 1030 + r() * 16;
  const cx = X(500 + (r() - 0.5) * 30);
  const placed = standing(data, { cx, headTop: 370, floor, maxFace: 104, framing: "full" });
  const { box, style: figMask } = lift(data, placed, 370 + placed.faceH * 0.2);
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceBottom = box.top + (face[1] + face[3]) * box.height;

  // ---- the arrowhead (points away from the player) ----
  const jit = (r() - 0.5) * 30;
  const B: [number, number] = [610 + jit, 270];
  const C: [number, number] = [668 + jit * 0.5, 585];
  const D: [number, number] = [905, 735 + jit];
  const E: [number, number] = [705, 905];
  const A: [number, number] = [400, 390];
  const pts = [A, B, C, D, E].map(([x, y]) => `${X(x).toFixed(0)},${y}`).join(" ");

  // ---- words ----
  const md = sides(data);
  const date = gameDate(data);
  const dm = /^([A-Z]{3})\s+(\d{1,2})\s+([A-Z]{3})/.exec(date);
  const dateText = dm ? `${nameCase(dm[1])}.${dm[2]} / ${MON_NO[dm[3]] ?? dm[3]}` : titleCase(date);
  const isMatch = postType === "matchday" || postType === "goal" || postType === "result";
  const comp = isMatch ? titleCase(competitionOf(data) || md.comp) : titleCase(content.subline.toUpperCase());
  const roundText = titleCase(md.round);
  const venue = md.venue ? titleCase(md.venue) : "";
  const topRight = postType === "matchday" ? venue || roundText : isMatch ? roundText || venue : `Season ${seasonOf()}`;
  const topLeft = isMatch ? dateText : teamCase((data.club?.name ?? "").toUpperCase());
  const kicker = titleCase(content.kicker.trim().toUpperCase().replace(/^IT'S\s+/, "").replace(/\b(MATCH|GAME) ?DAY\b/, "$1DAY"));
  const first = nameCase(content.firstName.trim());
  const last = nameCase(content.lastName.trim());
  const opp = isMatch && md.opp ? teamCase(md.opp) : "";

  // Corner numbers: kick-off and round on matchday, score and minutes after it, the two best stats otherwise.
  const stats = goodStats(data).filter((s) => String(s.value).trim() !== "0");
  const statLabel = (s: { label: string; value: string }) => ({ value: String(s.value), unit: s.label.toLowerCase().replace(/^minutes$/, "min") });
  const sc = ourScore(data);
  const mins = stats.find((s) => /min/i.test(s.label));
  const rating = stats.find((s) => /rating/i.test(s.label));
  let corners: { value: string; unit?: string }[] = [];
  if (postType === "matchday") {
    corners = [
      md.time ? { value: md.time } : dm ? { value: `${dm[2]}.${MON_NO[dm[3]] ?? ""}` } : null,
      md.roundNo ? { value: `MD ${md.roundNo}` } : dm && md.time ? { value: `${dm[2]}.${MON_NO[dm[3]] ?? ""}` } : null,
    ].filter((x): x is { value: string } => !!x);
  } else if (postType === "goal" || postType === "result") {
    const scoring = stats.find((s) => /goal|assist/i.test(s.label));
    const second = postType === "result" ? (rating ?? mins ?? scoring) : (scoring ?? rating ?? mins);
    corners = [sc ? { value: sc.text } : null, second ? statLabel(second) : null].filter((x): x is { value: string; unit?: string } => !!x);
  } else {
    corners = stats.slice(0, 2).map(statLabel);
  }

  // Name: one line to the side of the player, two when it would get too small.
  const nameEdge = 1010;
  // Cutouts are trimmed to the player: the box's far edge is his furthest arm or boot.
  const bodyEdge = mirror ? CANVAS_W - Math.min(faceCx - 120, box.left + 10) : Math.max(faceCx + 120, box.left + box.width - 10);
  const nameRoom = Math.max(240, nameEdge - Math.max(560, bodyEdge + 24));
  const full = [first, last].filter(Boolean).join(" ");
  const oneSize = fitLight(full, nameRoom, 60 * ts);
  const nameLines = oneSize >= 44 || !first || !last ? [full] : [first, last];
  const nameSize = nameLines.length === 1 ? oneSize : Math.min(60 * ts, ...nameLines.map((l) => fitLight(l, nameRoom, 60)));
  const nameTop = Math.max(faceBottom + 40, 505);
  const nameInk = inkFor(nameTop + 30);

  const kickSize = fitLight(kicker, Math.max(170, (mirror ? CANVAS_W - (box.left + box.width * 0.8) : box.left + box.width * 0.2) - 110), 46 * ts);
  const kickTop = Math.min(720, nameTop + 150);

  const light = (size: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: INTER, fontWeight: 300, fontSize: size, lineHeight: 1.1, whiteSpace: "nowrap", letterSpacing: "0.005em", ...extra });
  const topInk = inkFor(80);
  const smallSize = 30 * ts;
  const topRightSize = fitLight(topRight, 470, smallSize);
  const dateSize = fitLight(topLeft, 400, smallSize);
  const oppSize = fitLight(`vs ${opp}`, 440, 46 * ts);
  const compSize = Math.min(24, 360 / Math.max(1, comp.length * 0.55));
  const crest = data.club?.crestUrl;
  const oppCrest = postType === "matchday" ? md.oppCrest : null;
  const filterId = `gradient-mono-${seed}`;

  // Stats posts have no opponent: the period ("Last 5 games") sits on the floor line instead.
  const floorLine = opp ? null : [data.player.number ? `#${data.player.number}` : "", titleCase(data.player.position.toUpperCase())].filter(Boolean).join(" ");

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: deep, color: "#ffffff" }}>
      <MonoDefs id={filterId} ink={0.35} />
      {/* The sky: a long smooth fade into the club colour. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, ${sky} 0%, ${mix(sky, deep, 0.12)} 18%, ${mix(sky, deep, 0.45)} 38%, ${mix(sky, deep, 0.75)} 55%, ${deep} 76%, ${shade(deep, -0.12)} 100%)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 45% at ${mirror ? 35 : 65}% 48%, ${mix(sky, deep, 0.35)}55, transparent 70%)` }} />

      {/* The arrowhead: sky-tinted where it meets the player, club colour at its tip. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`gradient-arrow-${seed}`} x1={mirror ? "1" : "0"} y1="0" x2={mirror ? "0" : "1"} y2="0.75">
            <stop offset="0" stopColor={mix(sky, "#ffffff", 0.6)} stopOpacity={0.9} />
            <stop offset="0.45" stopColor={mix(sky, deep, 0.35)} stopOpacity={0.6} />
            <stop offset="1" stopColor={shade(deep, 0.05)} stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id={`gradient-arrow-fade-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="0.8" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0.15} />
          </linearGradient>
          <mask id={`gradient-arrow-mask-${seed}`}>
            <rect x={0} y={250} width={CANVAS_W} height={680} fill={`url(#gradient-arrow-fade-${seed})`} />
          </mask>
        </defs>
        <polygon points={pts} fill={`url(#gradient-arrow-${seed})`} mask={`url(#gradient-arrow-mask-${seed})`} />
      </svg>

      {/* Corner numbers. */}
      {corners[0] && (
        <div style={{ ...light(fitLight(corners[0].value + (corners[0].unit ?? ""), 220, 40 * ts), { position: "absolute", top: B[1] - 62, left: X(B[0]) - 200, width: 400, textAlign: "center", color: inkFor(B[1] - 40) }) }}>
          {corners[0].value}
          {corners[0].unit && <span style={{ fontSize: "0.5em", marginLeft: 8, opacity: 0.8 }}>{corners[0].unit}</span>}
        </div>
      )}
      {corners[1] && (
        <div
          style={{
            ...light(Math.min(40 * ts, (mirror ? X(D[0]) - 16 - 70 : 1010 - X(D[0]) - 16) / Math.max(1, corners[1].value.length * 0.56 + (corners[1].unit ? corners[1].unit.length * 0.28 + 0.2 : 0))), {
              position: "absolute",
              top: D[1] - 26,
              ...(mirror ? { right: CANVAS_W - X(D[0]) + 16 } : { left: X(D[0]) + 16 }),
              color: "#ffffff",
            }),
          }}
        >
          {corners[1].value}
          {corners[1].unit && <span style={{ fontSize: "0.5em", marginLeft: 6, opacity: 0.8 }}>{corners[1].unit}</span>}
        </div>
      )}

      {/* Floor shadow and the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: faceCx - 330, width: 660, top: floor - 50, height: 100, borderRadius: "50%", background: `radial-gradient(closest-side, ${shade(deep, -0.6)}88, transparent)`, filter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: faceCx - 200, width: 400, top: floor - 18, height: 34, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.5), transparent)", filter: "blur(6px)" }} />
        </>
      )}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...figMask }} />
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: `linear-gradient(to bottom, ${deep}00, ${deep}dd 60%, ${deep})` }} />}

      {/* Date and ground. */}
      {topLeft && <div style={{ ...light(dateSize, { position: "absolute", top: 58, [mirror ? "right" : "left"]: 70, color: topInk }) }}>{topLeft}</div>}
      {topRight && <div style={{ ...light(topRightSize, { position: "absolute", top: 58, [mirror ? "left" : "right"]: 70, color: topInk }) }}>{topRight}</div>}

      {/* Kicker beside him, name across the arrow. */}
      {kicker && <div style={{ ...light(kickSize, { position: "absolute", top: kickTop, [mirror ? "right" : "left"]: 96, color: inkFor(kickTop) }) }}>{kicker}</div>}
      <div style={{ position: "absolute", top: nameTop, [mirror ? "left" : "right"]: 70, textAlign: mirror ? "left" : "right", color: nameInk, textShadow: nameInk === "#ffffff" ? "0 2px 18px rgba(0,0,0,.18)" : undefined }}>
        {nameLines.map((l, i) => (
          <div key={i} style={light(nameSize, { lineHeight: 1.12 })}>
            {l}
          </div>
        ))}
      </div>

      {/* vs Opponent on the floor line. */}
      {(opp || floorLine) && (
        <div style={{ position: "absolute", top: floor + 50, left: X(700) - 300, width: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
          {opp ? (
            <>
              <span style={light(oppSize * 0.5, { alignSelf: "flex-start", marginTop: 2, opacity: 0.85 })}>vs</span>
              {oppCrest && <img src={oppCrest} alt="" style={{ width: oppSize * 1.05, height: oppSize * 1.05, objectFit: "contain" }} />}
              <span style={light(oppSize)}>{opp}</span>
            </>
          ) : (
            <span style={light(fitLight(floorLine ?? "", 440, 38 * ts))}>{floorLine}</span>
          )}
        </div>
      )}

      {/* Competition (bottom corner), crest mark (other corner), agency in between. */}
      {comp && (
        <div style={{ position: "absolute", bottom: 66, [mirror ? "right" : "left"]: 70, width: 380, fontFamily: INTER, fontWeight: 600, fontSize: compSize, lineHeight: 1.05, letterSpacing: "-0.01em", textAlign: mirror ? "right" : "left", whiteSpace: "normal" }}>
          {comp}
        </div>
      )}
      {crest && <img src={crest} alt="" style={{ position: "absolute", bottom: 56, [mirror ? "left" : "right"]: 70, width: 74, height: 74, objectFit: "contain", filter: `url(#${filterId})` }} />}
      <AgencyLogo data={data} height={20} style={{ position: "absolute", bottom: 32, left: 540 - 60, width: 120, opacity: 0.6 }} />
      <Film strength={0.55} />
    </div>
  );
}
