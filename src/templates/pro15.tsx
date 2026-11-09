/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { isoFromShortDate } from "@/lib/timezone";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, frontFeet, portraitOf, vsLines } from "./prokit";

/* Round 39 · new pro families (Pinterest "ncaa women's soccer graphics 2025", "matchday graphic eredivisie"). */

const W = CANVAS_W;

function Foot({ d, top, color = "#fff", sub = "rgba(255,255,255,.88)" }: { d: RenderData; top: number; color?: string; sub?: string }) {
  const { k, ts } = frameOf(d);
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {vs.lines.map((l, i) => (
        <div key={i} style={{ ...caps(vs.px, 0.04, 900, color), marginBottom: 6 * k }}>{l}</div>
      ))}
      <div style={{ height: 6 * k }} />
      <div style={caps(17 * k * ts, 0.14, 600, sub)}>{dateVenue(d)}</div>
      <div style={{ height: 14 * k }} />
      <FlagClock d={d} px={26 * k * ts} color={color} gap={22 * k} />
    </div>
  );
}
export const footH = (d: RenderData) => {
  const { k, ts } = frameOf(d);
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  return vs.lines.length * (vs.px + 6 * k) + 6 * k + 17 * k * ts + 14 * k + 26 * k * ts;
};

/* ================= 1 · Names stacked (matchday) — Pinterest "HEELS VERSUS CUSE" ================= */

/**
 * Nomes empilhados (matchday): a pale ground; the two clubs' exact names stacked huge across the top — home in the club
 * colour, "versus" small in a serif italic, away in near-black (each wrapped, never cut); the date · ground and the flags
 * clock under them; his big colour portrait filling the lower half, fading up into the ground.
 */
export function Prostacked({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const h = lines3(fx.homeName.toUpperCase(), 170 * k, W - 2 * M, 0, 60 * k);
  const a = lines3(fx.awayName.toUpperCase(), 170 * k, W - 2 * M, 0, 60 * k);
  const px = Math.min(h.px, a.px, ...[...h.lines, ...a.lines].map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const line: CSSProperties = { fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, whiteSpace: "nowrap", textAlign: "center" };
  const blockH = (h.lines.length + a.lines.length) * px * 0.86 + 230 * k;
  const pfh = 160 * k;
  const pcy = Math.max(top + blockH + 120 * k + pfh * 0.8, lt - 440 * k);
  return (
    <Page d={d} bg="#eef2f6" light>
      {s && <Portrait s={s} cx={W / 2} cy={pcy} fh={pfh} mode="color" fade={12} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 120 * k, background: "linear-gradient(to bottom, #eef2f6 80%, rgba(238,242,246,0))" }} />
      <div style={{ position: "absolute", left: M, right: M, top: top + 10 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {h.lines.map((l, i) => (
          <div key={"h" + i} style={{ ...line, color: t.ink }}>{l}</div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 34 * k, margin: `${10 * k}px 0` }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 120 * k, width: 120 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 54 * k, lineHeight: 1.1, color: "#222" }}>versus</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 120 * k, width: 120 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        {a.lines.map((l, i) => (
          <div key={"a" + i} style={{ ...line, color: "#16181c" }}>{l}</div>
        ))}
        <div style={{ height: 18 * k }} />
        <div style={caps(17 * k * ts, 0.16, 700, "#16181c")}>{dateVenue(d)}</div>
        <div style={{ height: 12 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#16181c" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 2 · Countdown (matchday) — Pinterest "THIS WEEK" / next-up countdowns ================= */

/** Days from today to the game (0 = today), or null without a date. */
function daysTo(d: RenderData): number | null {
  const iso = isoFromShortDate(d.content.date);
  if (!iso) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const g = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return Math.round((g - today) / 86400000);
}

/**
 * Contagem decrescente (matchday): a deep club-colour ground; the number of days to the game huge in condensed
 * caps with "DAYS TO GO" tracked under it (TOMORROW / TODAY when close; MATCHDAY once it has passed); him full-body
 * in front; the fixture and flags clock at the foot.
 */
export function Procountdown({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const n = daysTo(d);
  const big = n == null || n < 0 ? "MATCHDAY" : n === 0 ? "TODAY" : n === 1 ? "1" : String(n);
  const sub = n == null || n < 0 ? roundTitle(d) : n === 0 ? "IT'S MATCHDAY" : n === 1 ? "DAY TO GO" : "DAYS TO GO";
  const px = Math.min(n != null && n > 0 ? 640 * k : 260 * k, (W - 2 * M) / Math.max(0.1, wordW(big, 1)));
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = frontFeet(d, 640, ft + 10 * k, 1100 * k / 1.3);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, 0)}, ${shade(t.ink, -0.7)})` }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: px, lineHeight: 0.8, color: "rgba(255,255,255,.95)", whiteSpace: "nowrap" }}>{big}</div>
      <div style={{ position: "absolute", left: M + 6 * k, top: top + px * 0.8 + 18 * k, ...caps(30 * k, 0.32, 800, t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.35)) }}>{sub}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 80 * k, bottom: 0, background: `linear-gradient(to bottom, transparent, ${shade(t.ink, -0.75)} 35%)` }} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Four quadrants (matchday) — Pinterest media-day photo grids ================= */

/**
 * Quatro quadrantes (matchday): the canvas split 2×2 by white gutters — his portrait in four treatments (colour close,
 * black and white wide, club-colour duotone, colour far) — with MATCHDAY on a club-colour band across the middle and
 * the fixture and flags clock at the foot.
 */
export function Proquad({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const g = 12 * k;
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const gTop = top - 20 * k;
  const gBot = ft - 40 * k;
  const cw = (W - 2 * M - g) / 2;
  const ch = (gBot - gTop - g) / 2;
  const cells = [
    { x: M, y: gTop, fh: 300 * k, mode: "color" as const },
    { x: M + cw + g, y: gTop, fh: 170 * k, mode: "bw" as const },
    { x: M, y: gTop + ch + g, fh: 220 * k, mode: "duo" as const },
    { x: M + cw + g, y: gTop + ch + g, fh: 380 * k, mode: "bw" as const },
  ];
  const wPx = Math.min(130 * k, (W - 2 * M - 40 * k) / Math.max(0.1, wordW("MATCHDAY", 1)));
  return (
    <Page d={d} bg="#f3f2ee" light>
      {s &&
        cells.map((c, i) => (
          <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: cw, height: ch, overflow: "hidden", background: i % 3 ? "#2a2c30" : shade(t.ink, -0.3) }}>
            <div style={{ position: "absolute", left: -c.x, top: -c.y, width: W, height: H }}>
              <Portrait s={s} cx={c.x + cw / 2} cy={c.y + ch * 0.42} fh={c.fh} mode={c.mode} tint={t.ink} />
            </div>
          </div>
        ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: gTop + ch + g / 2 - 70 * k, height: 140 * k, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,.25)" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: wPx, lineHeight: 1, color: "#fff" }}>MATCHDAY</div>
      </div>
      <Foot d={d} top={ft} color="#16181c" sub={t.ink} />
    </Page>
  );
}

/* ================= 4 · Number in a circle (matchday) — Pinterest name lockups with kit number ================= */

/**
 * Número no círculo (matchday): an off-white ground; his shirt number in a big club-colour circle top-left, his first
 * name light and surname heavy stacked beside it as a lockup; him full-body in front; MATCHDAY tracked, crests,
 * HOME X AWAY and the flags clock at the foot on a white card.
 */
export function Pronumcircle({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || matchFacts(d).roundNo || "";
  const R = 130 * k;
  const first = (d.content.firstName || "").toUpperCase();
  const sur = (d.content.lastName || "").toUpperCase();
  const lw = W - 2 * M - 2 * R - 30 * k;
  const sPx = Math.min(120 * k, lw / Math.max(0.1, wordW(sur || first, 1)));
  const fh = footH(d) + 60 * k;
  const ft = lt - 40 * k - fh;
  const nameBot = top + 30 * k + (sur ? 62 * k : 0) + sPx * 0.9 + 20 * k;
  const p = frontFeet(d, 560, ft + 20 * k, Math.max(650 * k / 1.3, Math.min(1060 * k / 1.3, (ft + 20 * k - nameBot) / 0.97)));
  return (
    <Page d={d} bg="#f4f2ec" light>
      <div style={{ position: "absolute", left: M, top, width: 2 * R, height: 2 * R, borderRadius: "50%", background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: R * 1.15, color: "#fff", lineHeight: 1 }}>{no}</div>
      <div style={{ position: "absolute", left: M + 2 * R + 30 * k, top: top + 30 * k, width: lw, display: "flex", flexDirection: "column" }}>
        {sur && <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 54 * k, lineHeight: 1, color: "#16181c" }}>{d.content.firstName}</div>}
        <div style={{ fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.9, color: "#16181c", whiteSpace: "nowrap", marginTop: 8 * k }}>{sur || first}</div>
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: ft - 16 * k, height: fh + 26 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.94)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 * k, height: 50 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 46 * k, width: 46 * k, objectFit: "contain" }} />}
        <div style={caps(20 * k, 0.4, 800, t.ink)}>MATCHDAY</div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 46 * k, width: 46 * k, objectFit: "contain" }} />}
      </div>
      <Foot d={d} top={ft + 60 * k} color="#16181c" sub={t.ink} />
    </Page>
  );
}

/* ================= 5 · Kit-stripe border (matchday) — Pinterest duotone close-ups ================= */

/**
 * Moldura de riscas (matchday): a club-colour duotone close-up of him filling the canvas, framed by a thick border of
 * kit stripes (the club colour and its accent); him full-body and sharp in front; MATCHDAY tracked at the top inside the
 * frame; the fixture and flags clock at the foot.
 */
export function Prostripeframe({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const b = 34 * k;
  const st = 22 * k;
  const acc = t.acc === "#ffffff" ? "#fff" : t.acc;
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = frontFeet(d, 560, ft + 10 * k, 1080 * k / 1.3);
  const stripes = `repeating-linear-gradient(45deg, ${t.ink} 0, ${t.ink} ${st}px, ${acc} ${st}px, ${acc} ${st * 2}px)`;
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: stripes }} />
      <div style={{ position: "absolute", left: b, right: b, top: b, bottom: b, overflow: "hidden", background: shade(t.ink, -0.5) }}>
        {s && (
          <div style={{ position: "absolute", left: -b, top: -b, width: W, height: H }}>
            <Portrait s={s} cx={W / 2} cy={top + 420 * k} fh={420 * k} mode="duo" tint={t.ink} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.8))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 10 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <Front d={d} p={p} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 6 · Floodlight beams (matchday) — stadium lights row, beams along x only ================= */

/**
 * Holofotes em linha (matchday): a night ground; a row of six floodlight heads across the top, each throwing a long
 * beam sideways along the x-axis (bright cores fading out — no blur of him); MATCHDAY under the lights; him full-body
 * and sharp below; the fixture and flags clock at the foot.
 */
export function Profloodrow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = frontFeet(d, 540, ft + 10 * k, 1000 * k / 1.3);
  const ly = top + 30 * k;
  const lamps = Array.from({ length: 6 }, (_, i) => M + 20 * k + i * ((W - 2 * M - 40 * k) / 5));
  const wPx = Math.min(180 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  return (
    <Page d={d} bg="#05070b">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #0a0d14, ${shade(t.ink, -0.75)} 60%, #05070b)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="beam-l" x1="1" x2="0" y1="0" y2="0">
            <stop offset="0" stopColor="#fff8dc" stopOpacity={0.5} />
            <stop offset="1" stopColor="#fff8dc" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="beam-r" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff8dc" stopOpacity={0.5} />
            <stop offset="1" stopColor="#fff8dc" stopOpacity={0} />
          </linearGradient>
        </defs>
        {lamps.map((x, i) => (
          <g key={i}>
            {/* Solid gradient fans thrown sideways (x only): a wide pale fan and a brighter core. */}
            <polygon points={`${x},${ly + 20 * k} ${x - 560 * k},${ly - 90 * k} ${x - 560 * k},${ly + 130 * k}`} fill="url(#beam-l)" />
            <polygon points={`${x},${ly + 20 * k} ${x + 560 * k},${ly - 90 * k} ${x + 560 * k},${ly + 130 * k}`} fill="url(#beam-r)" />
            <polygon points={`${x},${ly + 20 * k} ${x - 420 * k},${ly + 2 * k} ${x - 420 * k},${ly + 38 * k}`} fill="url(#beam-l)" />
            <polygon points={`${x},${ly + 20 * k} ${x + 420 * k},${ly + 2 * k} ${x + 420 * k},${ly + 38 * k}`} fill="url(#beam-r)" />
            <rect x={x - 26 * k} y={ly} width={52 * k} height={40 * k} rx={6 * k} fill="#1c2129" stroke="#fff" strokeWidth={2 * k} />
            {[0, 1, 2].map((j) => (
              <circle key={j} cx={x - 14 * k + j * 14 * k} cy={ly + 20 * k} r={5 * k} fill="#fffbe6" />
            ))}
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: ly + 100 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", textShadow: `0 0 ${30 * k}px ${t.glow}` }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: W / 2 - 420 * k, top: ft - 200 * k, width: 840 * k, height: 260 * k, background: `radial-gradient(ellipse, ${t.glow}44, transparent 70%)` }} />
      <Front d={d} p={p} />
      {/* A backing keeps the long club line clear of his feet / the ball. */}
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: ft - 20 * k, height: fh + 40 * k, borderRadius: 18 * k, background: "rgba(5,7,11,.72)" }} />
      <Foot d={d} top={ft} />
    </Page>
  );
}
