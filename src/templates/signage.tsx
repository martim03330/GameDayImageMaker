/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const GROUND = "#e7e6e2";
const PANEL = "#121212";
const WHITE = "#ffffff";

/** Inter 600: advance widths per 100px (Inter 500 table + ~2%). */
const INTER_W: Record<string, number> = {
  a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8,
  n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9,
  A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3,
  N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1,
  " ": 26.7, "'": 31.3, "-": 46.3, ".": 27, ",": 27, ":": 27, "–": 50, "·": 27, "&": 70,
};
const interEm = (t: string, tracking = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + ((INTER_W[c] ?? (/\d/.test(c) ? 63 : 62)) * 1.02) / 100 + tracking, 0);

/** Greedy lines that fit `width` at `size`. */
function wrap(text: string, size: number, width: number, tracking: number): string[] {
  const lines: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last && interEm(`${last} ${w}`, tracking) * size <= width) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines.length ? lines : [""];
}

/** A long, thin wayfinding arrow drawn as lines (crisper and more precise than a glyph). */
function Arrow({ w, h, stroke, dir, color }: { w: number; h: number; stroke: number; dir: 1 | -1; color: string }) {
  const head = h / 2;
  const tip = dir === 1 ? w - stroke / 2 : stroke / 2;
  const back = tip - dir * head;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      <g stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="square" strokeLinejoin="miter">
        <line x1={dir === 1 ? stroke / 2 : w - stroke / 2} y1={h / 2} x2={tip} y2={h / 2} />
        <polyline points={`${back},${stroke / 2} ${tip},${h / 2} ${back},${h - stroke / 2}`} />
      </g>
    </svg>
  );
}

/**
 * Signage: stadium wayfinding. On a plain pale-concrete ground, one black sign panel with small rounded
 * corners — a club-colour "Matchday" tag, a long thin arrow pointing at the player, the ground's name large
 * in Inter 600, and under a hairline the fixture, date and kick-off in wide-tracked signage caps. The
 * player stands big beside it in natural colour. Flips with params.side.
 */
export function Signage({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ts = (params.textScale ?? 1) * S;
  const ty = params.textY ?? 0;
  const M = story ? 72 : 64;
  const playerLeft = params.side === "left";
  const dir: 1 | -1 = playerLeft ? -1 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);
  if (luminance(club) < 0.04) club = shade(club, 0.35);
  const tagInk = luminance(club) > 0.4 ? "#111111" : WHITE;

  /* ---- facts, home team first, names exactly as stored ---- */
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? content.homeTeam : content.awayTeam) || ours).trim();
  const oppName = ((weHost ? content.awayTeam : content.homeTeam) || titleCase(f.opp)).trim();
  const teams = (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean);
  const venue = (content.venue ?? "").trim() || titleCase(f.venue) || teams[0] || "Matchday";
  const when = [niceDate(content.date), f.time].filter(Boolean).join("   ·   ").toUpperCase();
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const tag = (content.kicker || "Matchday").toUpperCase();

  /* ---- the panel ---- */
  const PW = story ? 640 : 520;
  const pad = story ? 56 : 44;
  const inner = PW - 2 * pad;
  // The ground's name: two lines if it can stay big (≥ 72% of the full size), else up to three.
  const fitVenue = (maxLines: number, minSize: number) => {
    let sz = 62 * ts;
    let ls = wrap(venue, sz, inner, -0.015);
    while ((ls.length > maxLines || ls.some((l) => interEm(l, -0.015) * sz > inner)) && sz > minSize) {
      sz -= 1;
      ls = wrap(venue, sz, inner, -0.015);
    }
    return { sz, ls, ok: ls.length <= maxLines && !ls.some((l) => interEm(l, -0.015) * sz > inner) };
  };
  const two = fitVenue(2, 62 * ts * 0.72);
  const { sz: vSize, ls: vLines } = two.ok ? two : fitVenue(3, 28);
  const CAPS_T = 0.14;
  const capsFit = (t: string, max: number) => Math.max(11, Math.min(max, inner / Math.max(1, interEm(t, CAPS_T))));
  const teamSize = Math.min(...teams.map((t) => capsFit(t.toUpperCase() + "  ", 21 * ts)), 21 * ts);
  const whenSize = capsFit(when, 19 * ts);
  const compSize = capsFit(comp, 14 * ts);
  const tagSize = 15 * ts;

  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const panelSide: CSSProperties = playerLeft ? { right: M } : { left: M };

  // Estimated panel height, so it can stand above the logo (story) or sit in the optical middle (post).
  const panelH =
    2 * pad + 64 * S + 52 * S + vLines.length * vSize * 1.04 + 40 * S + 1 + 32 * S + teams.length * teamSize * 1.5 + (when ? 22 * S + whenSize : 0) + (comp ? 34 * S + compSize : 0);
  const panelTop = (story ? STORY_BOTTOM - logoH - 64 - panelH : Math.max(150, (1350 - 56 - logoH - panelH) / 2 - 10)) + ty;

  /* ---- the player beside the sign ---- */
  const faceX = playerLeft ? (story ? 360 : 300) : story ? 720 : 780;
  const sizes = story ? { chest: 300, waist: 240, knees: 196, full: 160 } : { chest: 230, waist: 180, knees: 146, full: 120 };
  // The whole head (hair included) stays well inside the canvas.
  const probe = placeByFace(data, faceX, 200, sizes);
  const faceTop = Math.max(story ? 300 : 170, (story ? 120 : 64) + probe.faceH * 0.8);
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;

  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 600, letterSpacing: `${CAPS_T}em`, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: PANEL }}>
      {/* Daylight from the player's side, so the concrete is not dead flat. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% 50% at ${faceX / 10.8}% ${(chin / H) * 100}%, rgba(255,255,255,.6), transparent 72%)` }} />
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.4, top: chin + box.faceH * 0.4, width: box.faceH * 4.8, height: box.faceH * 5, borderRadius: "50%", background: "rgba(30,28,24,.12)", filter: `blur(${story ? 70 : 56}px)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}

      {/* The sign. */}
      <div
        style={{
          position: "absolute",
          top: panelTop,
          width: PW,
          ...panelSide,
          boxSizing: "border-box",
          padding: pad,
          background: PANEL,
          color: WHITE,
          borderRadius: story ? 12 : 10,
          boxShadow: "0 30px 60px -30px rgba(0,0,0,.45), 0 2px 6px rgba(0,0,0,.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: dir === 1 ? "row" : "row-reverse", height: 64 * S }}>
          <div style={{ ...caps, fontSize: tagSize, letterSpacing: "0.18em", padding: `${10 * S}px ${14 * S}px ${10 * S}px ${(14 + 2.7) * S}px`, background: club, color: tagInk, borderRadius: 4 * S }}>{tag}</div>
          <Arrow w={(story ? 190 : 150) * (params.textScale ?? 1)} h={56 * S} stroke={story ? 5 : 4} dir={dir} color={WHITE} />
        </div>
        <div style={{ marginTop: 52 * S, fontFamily: SANS, fontWeight: 600, fontSize: vSize, lineHeight: 1.04, letterSpacing: "-0.015em" }}>
          {vLines.map((l, i) => (
            <div key={i} style={{ whiteSpace: "nowrap" }}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 40 * S, height: 1, background: "rgba(255,255,255,.28)" }} />
        <div style={{ marginTop: 32 * S, display: "flex", flexDirection: "column", gap: teamSize * 0.5 }}>
          {teams.map((t, i) => (
            <div key={i} style={{ ...caps, fontSize: teamSize }}>
              {i > 0 && <span style={{ color: "rgba(255,255,255,.45)", marginRight: "0.4em", textTransform: "none" }}>v</span>}
              {t}
            </div>
          ))}
        </div>
        {when && <div style={{ ...caps, marginTop: 22 * S, fontSize: whenSize, color: "rgba(255,255,255,.72)" }}>{when}</div>}
        {comp && <div style={{ ...caps, marginTop: 34 * S, fontSize: compSize, fontWeight: 500, color: "rgba(255,255,255,.42)" }}>{comp}</div>}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{
          position: "absolute",
          ...panelSide,
          bottom: logoBottom,
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: playerLeft ? "right bottom" : "left bottom",
        }}
      />
      <Film strength={0.12} />
    </div>
  );
}
