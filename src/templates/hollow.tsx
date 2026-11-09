/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { crestsOf, scoreOf } from "./outline";
import { lift } from "./column";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { bestLines, mix, MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- helpers shared by the hollow / selective / dotscript looks ---------- */

/** Barlow Condensed (500) advance widths per em, roughly: enough to size a giant outlined word. */
const BARLOW: Record<string, number> = { M: 0.6, W: 0.74, I: 0.22, J: 0.4, L: 0.4, T: 0.42, F: 0.42, E: 0.43, " ": 0.2, "-": 0.3, "'": 0.16, "!": 0.22, "1": 0.36 };
export const barlowEm = (t: string, tracking = 0) => {
  const ch = [...t.normalize("NFD").replace(/\p{M}/gu, "")];
  return ch.reduce((a, c) => a + (BARLOW[c] ?? 0.5), 0) + tracking * Math.max(0, ch.length - 1);
};

const MONTH_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };
const MONTH_NAME: Record<string, string> = { JAN: "JANUARY", FEB: "FEBRUARY", MAR: "MARCH", APR: "APRIL", MAY: "MAY", JUN: "JUNE", JUL: "JULY", AUG: "AUGUST", SEP: "SEPTEMBER", OCT: "OCTOBER", NOV: "NOVEMBER", DEC: "DECEMBER" };

/** The year of the game: the next fixture's when it is the same day, else the nearest one ahead of today. */
export function yearOf(data: RenderData): string {
  const m = (data.content.date ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  const f = data.fixtures?.[0]?.date;
  if (m && f && Number(f.slice(8, 10)) === Number(m[1]) && f.slice(5, 7) === MONTH_NO[m[2]]) return f.slice(0, 4);
  const now = new Date();
  if (!m || !MONTH_NO[m[2]]) return String(now.getFullYear());
  const month = Number(MONTH_NO[m[2]]) - 1;
  // A result looks back, a matchday forward: only a month far behind today means next year.
  return String(data.postType === "matchday" && month < now.getMonth() - 2 ? now.getFullYear() + 1 : now.getFullYear());
}

/** "SAT 10 OCT" → { long: "OCTOBER 10", dots: "10.10", day: "10", month: "10" }. */
export function dateParts(d?: string): { long: string; dots: string } {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m || !MONTH_NO[m[2]]) return { long: (d ?? "").toUpperCase(), dots: (d ?? "").toUpperCase() };
  return { long: `${MONTH_NAME[m[2]]} ${Number(m[1])}`, dots: `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]]}` };
}

/**
 * A full-body player (standing()) kept inside [minX, maxX]: a wide pose (a kick, arms out) is drawn a little
 * smaller rather than running into the text or off the canvas; the feet stay on the floor.
 */
export function runner(data: RenderData, o: { cx: number; headTop: number; floor: number; maxFace: number; minX: number; maxX: number }) {
  let placed = standing(data, { cx: o.cx, headTop: o.headTop, floor: o.floor, maxFace: o.maxFace, framing: "full" });
  const room = o.maxX - o.minX;
  if (placed.feet && placed.width > room) {
    const k = Math.max(0.66, room / placed.width);
    placed = standing(data, { cx: o.cx, headTop: o.floor - (o.floor - o.headTop) * k, floor: o.floor, maxFace: o.maxFace, framing: "full" });
  }
  const right = placed.left + placed.width;
  const dx = right > o.maxX ? o.maxX - right : placed.left < o.minX ? Math.min(o.minX - placed.left, o.maxX - right) : 0;
  return { ...placed, left: placed.left + dx, faceCx: placed.faceCx + dx };
}

/** The club's colour as a mid-dark, calm printed ground (Gladbach green, not neon). */
function ground(data: RenderData): string {
  const p = data.params;
  let c = p.primary === "#10131c" ? p.accent : p.primary;
  if (luminance(c) > 0.6 || hueOf(c) == null) c = hueOf(p.accent) != null && luminance(p.accent) < 0.6 ? p.accent : c;
  if (hueOf(c) == null) return luminance(c) > 0.5 ? "#34363b" : "#2b2d31";
  c = mix(vivid(c), "#4a4d4f", 0.45);
  for (let i = 0; i < 12 && luminance(c) > (hueOf(c)! > 70 && hueOf(c)! < 170 ? 0.075 : 0.09); i++) c = shade(c, -0.1);
  for (let i = 0; i < 12 && luminance(c) < 0.07; i++) c = shade(c, 0.08);
  return c;
}

const MOTTLE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1100' height='1400'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.0035 0.005' numOctaves='4' seed='11'/><feColorMatrix values='1.5 0 0 0 -.25  1.5 0 0 0 -.25  1.5 0 0 0 -.25  0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
)}")`;
const SPECKS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  16 0 0 0 -11.4'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;

/**
 * "MATCH / DAY" (Gladbach v Bochum): a flat, printed club-colour ground with soft mottling and grain; the
 * kicker huge in thin white outline-only capitals, top corner, the player running through it; under the
 * letters a near-black bar carrying both crests as white marks, then the long English date, the kick-off
 * and the ground in spaced caps; a few thin light-leak streaks cross the whole poster diagonally, and the
 * full-body player with the ball on the other half, on a soft floor shadow.
 */
export function Hollow({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 31;
  const r = rng(seed);
  const mirror = params.side === "left";
  const id = `hollow-${seed}`;
  const bg = ground(data);
  const barC = mix(shade(bg, -0.7), "#1d1817", 0.55);
  const ts = params.textScale ?? 1;
  const m = matchFacts(data);
  const score = scoreOf(data, "–");

  // ---- the outlined title ----
  const kicker = content.kicker.trim() || "MATCHDAY";
  const tracking = 0.035;
  const measure = (t: string) => barlowEm(t, tracking);
  const TW = 820 * Math.min(1.05, ts);
  const fit = bestLines(kicker, TW, 560, { tracking, pitch: 0.86, cap: 0.7, maxSize: 330 * ts, measure });
  const size = fit.size;
  const cap = size * 0.7;
  const pitch = size * 0.86;
  const titleTop = 128 + r() * 24;
  const baselines = fit.lines.map((_, i) => titleTop + cap + i * pitch);
  const titleBottom = baselines[baselines.length - 1];
  const tx = mirror ? CANVAS_W - 86 : 86;

  // ---- the player: running on the other half, feet on a soft shadow ----
  const floor = 1205 + r() * 25;
  const cx = mirror ? 380 + r() * 40 : 700 - r() * 40;
  const headTop = Math.max(250, titleTop + cap * 0.55);
  const placed = runner(data, { cx, headTop, floor, maxFace: 112, minX: mirror ? 20 : 380, maxX: mirror ? 700 : 1060 });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.25);

  // ---- the bar and the facts under it ----
  const barTop = Math.min(760, titleBottom + 44);
  const barH = 108;
  const barW = 470;
  const crests = postType === "matchday" ? ([m.ourCrest, m.oppCrest].filter(Boolean) as string[]) : crestsOf(data);
  const side = (x: number): CSSProperties => (mirror ? { right: x } : { left: x });
  const year = yearOf(data);
  const dp = dateParts(content.date);
  const label: CSSProperties = { fontFamily: SANS, fontWeight: 800, color: "#fff", letterSpacing: "0.16em", whiteSpace: "nowrap", textTransform: "uppercase" };
  // The text column stops short of the player's body.
  const reach = mirror ? CANVAS_W - Math.max(box.faceCx + 2.3 * box.faceH, box.left + box.width * 0.9 - 40) : Math.min(box.faceCx - 2.3 * box.faceH, box.left + box.width * 0.1 + 40);
  const colW = Math.max(300, Math.min(470, reach - 86 - 16));
  const fitS = (t: string, max: number, w = colW, k = 0.78) => Math.min(max, w / Math.max(1, [...t].length * k));
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  type Line = { big: string; small?: string; tiny?: boolean };
  const lines: Line[] = [];
  if (postType === "matchday") {
    if (dp.long) lines.push({ big: dp.long, small: year });
    if (m.time) lines.push({ big: m.time, small: "KICK OFF" });
    if (m.venue) lines.push({ big: m.venue, tiny: true });
    else if (m.comp) lines.push({ big: m.comp, tiny: true });
  } else if (postType === "result") {
    if (m.opp && !m.oppCrest) lines.push({ big: `VS ${m.opp}` });
    // A long sponsor-style competition name only when there is no round to show instead.
    if (m.comp && !(m.round && m.comp.length > 28)) lines.push({ big: m.comp, tiny: m.comp.length > 22 });
    if (m.round) lines.push({ big: m.round, tiny: true });
    if (dp.long) lines.push({ big: dp.long, small: year, tiny: !!m.round });
  } else {
    if (name) lines.push({ big: name });
    if (m.opp) lines.push({ big: `VS ${m.opp}`, small: score && crests.length < 2 ? score : undefined });
    if (m.comp) lines.push({ big: m.comp, tiny: true });
  }

  // Bar contents: crests as white marks (score between them after the game); a lone crest carries the name.
  const barScore = (postType === "result" || postType === "goal") && score && crests.length === 2;
  const opponentText = !m.oppCrest && m.opp && postType === "matchday" ? `VS ${m.opp}` : "";

  // ---- light streaks ----
  const streaks = Array.from({ length: 4 }, (_, i) => {
    const y0 = 180 + i * 300 + (r() - 0.5) * 160;
    const len = 380 + r() * 520;
    const x0 = -80 + r() * 700;
    return { x0, y0, len, a: 24 + r() * 8, o: 0.28 + r() * 0.3, front: i === 1 || i === 3 };
  });
  const streak = (s: (typeof streaks)[number], i: number) => (
    <div
      key={i}
      data-bleed
      style={{
        position: "absolute",
        left: mirror ? CANVAS_W - s.x0 - s.len : s.x0,
        top: s.y0,
        width: s.len,
        height: 2,
        transformOrigin: mirror ? "100% 50%" : "0 50%",
        transform: `rotate(${mirror ? -s.a : s.a}deg)`,
        background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95) 45%, rgba(255,255,255,.95) 60%, rgba(255,255,255,0))",
        opacity: s.o,
        boxShadow: "0 0 10px rgba(255,255,255,.35)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg }}>
      <MonoDefs id={`${id}-mono`} ink={0.25} />
      {/* Printed ground: soft mottling, a lighter band where the light falls, grain and specks. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: MOTTLE, backgroundSize: "cover", mixBlendMode: "soft-light", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${mirror ? 30 : 70}% 30%, rgba(255,255,255,.13), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.14), transparent 30%, transparent 70%, rgba(0,0,0,.22))" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: SPECKS, opacity: 0.35, mixBlendMode: "screen" }} />

      {/* The outlined kicker, behind everything else. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {fit.lines.map((l, i) => {
          const w = measure(l) * size;
          return (
            <text
              key={i}
              x={mirror ? tx - w : tx}
              y={baselines[i]}
              textLength={w}
              lengthAdjust="spacingAndGlyphs"
              style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: size, letterSpacing: `${tracking}em` }}
              fill="none"
              stroke="rgba(255,255,255,.92)"
              strokeWidth={2}
            >
              {l}
            </text>
          );
        })}
      </svg>

      {streaks.filter((s) => !s.front).map(streak)}

      {/* The bar with the crests. */}
      <div style={{ position: "absolute", top: barTop, ...side(86), width: barW, height: barH, background: barC, display: "flex", alignItems: "center", justifyContent: mirror ? "flex-end" : "flex-start", gap: 28, padding: "0 30px", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,.18)" }}>
        {crests.map((c, i) => (
          <div key={i} style={{ display: "contents" }}>
            {i === 1 && barScore && <div style={{ ...label, fontSize: 40, letterSpacing: "0.04em" }}>{score}</div>}
            <img src={c} alt="" style={{ width: 70, height: 70, objectFit: "contain", filter: `url(#${id}-mono)` }} />
          </div>
        ))}
        {opponentText && <div style={{ ...label, fontSize: fitS(opponentText, 24, 280), letterSpacing: "0.14em" }}>{opponentText}</div>}
        {!crests.length && !opponentText && <div style={{ ...label, fontSize: fitS(data.club?.name ?? "", 24, 330) }}>{data.club?.name ?? ""}</div>}
        {crests.length === 1 && !opponentText && (postType === "result" || postType === "goal") && score && <div style={{ ...label, fontSize: 40, letterSpacing: "0.04em" }}>{score}</div>}
      </div>

      {/* Floor shadow and the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.left + box.width / 2 - 360, width: 720, top: floor - 70, height: 140, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.34), rgba(0,0,0,0))", filter: "blur(14px)" }} />
          <div style={{ position: "absolute", left: box.left + box.width / 2 - 190, width: 380, top: floor - 24, height: 44, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,0))", filter: "blur(7px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.25))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.02)", ...figMask }}
          />
        </div>
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 240, background: `linear-gradient(to bottom, ${bg}00, ${bg}ee 70%, ${bg})` }} />}

      {streaks.filter((s) => s.front).map(streak)}

      {/* Date, kick-off, ground. */}
      <div style={{ position: "absolute", top: barTop + barH + 40, ...side(86), display: "flex", flexDirection: "column", alignItems: mirror ? "flex-end" : "flex-start", gap: 16, textShadow: "0 2px 10px rgba(0,0,0,.25)" }}>
        {lines.map((l, i) => {
          // Small spaced lines wrap onto two rows rather than shrinking out of sight.
          const s = l.tiny ? Math.max(16, fitS(l.big, 19, colW, 0.86)) : Math.max(19, fitS(l.big + (l.small ? ` ${l.small}` : ""), 25));
          const wrap = s * (l.tiny ? 0.86 : 0.78) * [...(l.big + (l.small ? ` ${l.small}` : ""))].length > colW;
          return (
            <div key={i} style={{ ...label, fontSize: s, ...(wrap ? { whiteSpace: "normal", width: colW, lineHeight: 1.6, textAlign: mirror ? "right" : "left" } : {}), letterSpacing: l.tiny ? "0.34em" : "0.16em", fontWeight: l.tiny ? 700 : 800, marginTop: l.tiny ? 4 : 0 }}>
              {l.big}
              {l.small && <span style={{ fontWeight: 400, marginLeft: "0.45em", letterSpacing: "0.08em" }}>{l.small}</span>}
            </div>
          );
        })}
      </div>

      <AgencyLogo data={data} height={26} style={{ position: "absolute", bottom: 52, ...side(86), opacity: 0.9 }} />
      <Film strength={0.55} />
    </div>
  );
}
