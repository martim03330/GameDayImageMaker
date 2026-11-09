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

/**
 * Ringlight: a dark studio. Behind his head hangs one thin, bright ring light — a perfect circle of warm white
 * with a soft bloom inside and out, throwing a faint pool of light on the dark, barely club-tinted ground. The
 * player stands in front of it, natural colour, his body falling off into the dark at the foot. Type kept to
 * the edges: the title in small spaced caps at the top (competition under it), the fixture and
 * date · kick-off · ground at the foot, the NEYOD mark under them.
 */
export function Ringlight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = (params.textScale ?? 1) * S;
  const ty = params.textY ?? 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  const ground = luminance(club) < 0.03 ? "#0c0d10" : shade(club, -0.9);
  const low = shade(ground, -0.5);
  const LIGHT = "#fffaf1";

  const f = matchFacts(data);
  const teams = teamsOf(data);

  /* ---- the player, centred, head inside the ring ---- */
  const nudge = params.side === "left" ? -40 : params.side === "right" ? 40 : 0;
  let box = story
    ? placeByFace(data, 540 + nudge, 600, { chest: 300, waist: 236, knees: 186, full: 150 })
    : placeByFace(data, 540 + nudge, 330, { chest: 220, waist: 172, knees: 136, full: 110 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The ring centred on the head (hair included), wide enough to frame it with air.
  let R = Math.max(story ? 300 : 215, box.faceH * 1.75);
  // The ring stays clear of the title: he steps down a little, then the ring tightens.
  const ringMin = (story ? STORY_TOP + 160 : 72 + 112) + ty;
  const over = ringMin - (box.top + face[1] * box.height + box.faceH * 0.36 - R);
  if (over > 0) {
    const drop = Math.min(over, story ? 160 : 110);
    box = { ...box, top: box.top + drop };
    R = Math.max(box.faceH * 1.3, R - (over - drop));
  }
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceTop = box.top + face[1] * box.height;
  const rcx = faceCx;
  const rcy = faceTop + box.faceH * 0.36;
  const stroke = story ? 7 : 5;

  /* ---- the type ---- */
  const title = (content.kicker || "Matchday").toUpperCase();
  const titleTrack = 0.42;
  const titleSize = fitTo(title, 760, 24 * ts, titleTrack, 14);
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ").toUpperCase();
  const compTrack = 0.24;
  const compSize = fitTo(comp, story ? 900 : 820, 12 * ts, compTrack, 10);
  const fixtureText = teams.join("  v  ");
  const fixSize = fitTo(fixtureText, story ? 920 : 860, 24 * ts, -0.005, 12);
  const details = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const detSize = fitTo(details, story ? 920 : 860, 18 * ts, 0, 11);

  const logoH = (story ? 88 : 52) * (params.logoScale ?? 1);
  const footBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0) + logoH + (story ? 66 : 56) - ty;
  // Where the foot type starts (roughly): the figure is gone into the dark by then.
  const footTop = H - footBottom - (fixSize * 1.1 + 14 * S + detSize * 1.1);

  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };
  const ring = (w: number, blur: number, opacity: number, color = LIGHT): CSSProperties => ({
    position: "absolute",
    left: rcx - R - w / 2,
    top: rcy - R - w / 2,
    width: 2 * R + w,
    height: 2 * R + w,
    borderRadius: "50%",
    border: `${w}px solid ${color}`,
    filter: blur ? `blur(${blur}px)` : undefined,
    opacity,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#fff" }}>
      {/* The pool of light the ring throws on the studio. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle ${R * 2.3}px at ${rcx}px ${rcy}px, ${shade(ground, 0.16)}, ${ground} 60%, ${low} 100%)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle ${R * 1.15}px at ${rcx}px ${rcy}px, rgba(255,250,241,.07), transparent 100%)` }} />

      {/* The ring light: a wide soft bloom, a tighter glow, then the bright tube itself. */}
      <div style={ring(stroke * 9, 34, 0.32)} />
      <div style={ring(stroke * 3, 10, 0.55)} />
      <div style={ring(stroke, 0, 1)} />
      <div style={ring(Math.max(2, stroke * 0.4), 0.6, 1, "#ffffff")} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) brightness(.97)", ...cutMask(data.cut) }}
        />
      )}
      {/* His body falls off into the dark before the foot type. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: footTop - (story ? 520 : 380),
          bottom: 0,
          background: `linear-gradient(to bottom, ${low}00 0px, ${low}99 ${story ? 260 : 190}px, ${low}f0 ${story ? 480 : 350}px, ${low} ${story ? 540 : 400}px)`,
        }}
      />

      {/* Title, small at the top. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: (story ? STORY_TOP : 72) + ty, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...caps, fontSize: titleSize, letterSpacing: `${titleTrack}em`, marginRight: `-${titleTrack}em` }}>{title}</div>
        {comp && <div style={{ ...caps, marginTop: 16 * S, fontSize: compSize, letterSpacing: `${compTrack}em`, marginRight: `-${compTrack}em`, color: "rgba(255,255,255,.55)" }}>{comp}</div>}
      </div>

      {/* Foot: fixture, then date · kick-off · ground. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fixSize, letterSpacing: "-0.005em", whiteSpace: "nowrap", lineHeight: 1.1 }}>{fixtureText}</div>
        {details && <div style={{ marginTop: 14 * S, fontFamily: SANS, fontWeight: 400, fontSize: detSize, color: "rgba(255,255,255,.62)", whiteSpace: "nowrap", lineHeight: 1.1 }}>{details}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 24 : 20}
        style={{
          position: "absolute",
          left: "50%",
          bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0),
          transform: `translateX(-50%) scale(${params.logoScale ?? 1})`,
          transformOrigin: "center bottom",
        }}
      />
      <Film strength={0.22} />
    </div>
  );
}
