/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, Film, GradientMapDefs } from "./fx";
import { rng } from "./kit";
import { lift } from "./column";
import { standing } from "./mist";
import { scoreOf, sceneOf } from "./outline";
import { AgencyLogo, DISPLAY } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { MonoDefs, mix } from "./wall";
import { fitText, fixtureSides } from "./bighead";

type Pt = [number, number];

/** Catmull-Rom spline through the points, sampled evenly per segment. */
function spline(pts: Pt[], per = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * A calligraphic flourish: a filled ribbon along the spline, hair-thin at the start, swelling to `width`
 * and tapering again into the curl at its end (the ornamental S-strokes of club lettering).
 */
function flourish(pts: Pt[], width: number, peak = 0.42): string {
  const c = spline(pts);
  const len: number[] = [0];
  for (let i = 1; i < c.length; i++) len.push(len[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const L = len[len.length - 1] || 1;
  // Local bending (turn angle per px): a ribbon wider than twice its bend radius folds over itself.
  const bend = c.map((_, i) => {
    const a = c[Math.max(0, i - 2)];
    const p = c[i];
    const b = c[Math.min(c.length - 1, i + 2)];
    const t1 = Math.atan2(p[1] - a[1], p[0] - a[0]);
    const t2 = Math.atan2(b[1] - p[1], b[0] - p[0]);
    let d = Math.abs(t2 - t1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    const ds = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 || 1;
    return d / ds;
  });
  // Width along the stroke: a broad, nearly even body with pointed ends (`peak` moves the belly), never
  // wider than the bend allows, then smoothed so the clamping leaves no steps.
  let ws = c.map((_, i) => {
    const v = (len[i] / L) ** (Math.log(0.5) / Math.log(peak));
    return Math.min(width * Math.sin(Math.PI * v) ** 0.4, bend[i] > 0 ? 1.7 / bend[i] : Infinity);
  });
  for (let pass = 0; pass < 4; pass++) ws = ws.map((w, i) => Math.min(w, (ws[Math.max(0, i - 2)] + ws[Math.max(0, i - 1)] + w + ws[Math.min(ws.length - 1, i + 1)] + ws[Math.min(ws.length - 1, i + 2)]) / 5));
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < c.length; i++) {
    const w = ws[i] + 1;
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const n = Math.hypot(dx, dy) || 1;
    const nx = -dy / n;
    const ny = dx / n;
    left.push([c[i][0] + (nx * w) / 2, c[i][1] + (ny * w) / 2]);
    right.push([c[i][0] - (nx * w) / 2, c[i][1] - (ny * w) / 2]);
  }
  const all = [...left, ...right.reverse()];
  return all.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
}

type Stroke = { pts: Pt[]; w: number; white: boolean; peak?: number };

/** The flourishes framing the canvas (drawn for the player standing right of centre; mirrored for the other side). */
const STROKES: Stroke[] = [
  // Left edge: one long white S swash — a hook at the top, the belly swinging in, a tail curling out.
  { white: true, w: 200, pts: [[130, -70], [205, 55], [150, 200], [40, 305], [-15, 425], [45, 565], [180, 685], [230, 825], [170, 960], [45, 1030], [-70, 1040]], peak: 0.55 },
  // Top right: a white hook.
  { white: true, w: 125, pts: [[630, -90], [815, -15], [960, 90], [1010, 215], [975, 310]], peak: 0.45 },
  // Club colour: the right edge S (behind the crests), and hooks at the corners, partly under the white.
  { white: false, w: 210, pts: [[1190, 360], [1045, 460], [960, 615], [990, 780], [1100, 885], [1150, 1005], [1080, 1135], [950, 1185], [855, 1150]], peak: 0.5 },
  { white: false, w: 175, pts: [[690, 1430], [815, 1305], [980, 1250], [1130, 1300]], peak: 0.5 },
  { white: false, w: 135, pts: [[-130, 55], [60, 120], [235, 90], [305, -30]], peak: 0.45 },
  { white: false, w: 115, pts: [[1190, 110], [1085, 195], [1070, 330], [1165, 405]], peak: 0.5 },
  { white: false, w: 125, pts: [[-110, 690], [60, 760], [85, 880], [-60, 965]], peak: 0.5 },
  // A last white tongue licking up from the bottom-right corner, over the club colour.
  { white: true, w: 95, pts: [[1190, 1190], [1075, 1245], [1030, 1330], [1070, 1420]], peak: 0.5 },
];

/**
 * Chelsea v Barça matchday: a dark club-night canvas framed by big calligraphic flourishes in white and the
 * club colour; behind, a huge duotone close-up of the player's face melting into the club's own ground,
 * tinted; in front, the player celebrating in full colour. The two crests stacked large on the right as
 * white marks, and three quiet lines bottom-left (ground, kick-off, day).
 */
export function Swirl({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 54;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);

  // ---- colours ----
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) < 0.05) club = vivid(params.accent);
  if (luminance(club) < 0.05 || luminance(club) > 0.85) club = "#8d96a6";
  // Neon (lime, yellow) takes over a dark canvas: deepen it a little.
  if (luminance(club) > 0.5) club = shade(club, -0.25);
  const deep = mix(club, "#04060b", 0.84);
  const ink = mix(club, "#000000", 0.78);
  const WHITE = "#eef1f6";

  const m = matchFacts(data);
  const sides = fixtureSides(data, m);
  const score = scoreOf(data);

  // ---- huge duotone face ----
  const facePx = data.facePx || 0;
  const FACE: Record<string, number> = { chest: 440, waist: 410, knees: 390, full: 370 };
  const want = (FACE[params.framing ?? "waist"] ?? 410) * (params.playerScale ?? 1);
  const faceH = facePx > 0 ? Math.min(want, Math.max(220, facePx * 2.4)) : want;
  const mag = facePx > 0 ? (faceH * 2) / facePx : 2;
  const faceBlur = mag > 3.6 ? Math.min(3, (mag - 3.6) * 0.7) : 0;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const fh = faceH / face[3];
  const fw = fh * aspect;
  const faceCx = X(470 + (r() - 0.5) * 40);
  const faceTop = 175 + r() * 25;
  const bigBox = { left: faceCx - fw * (face[0] + face[2] / 2), top: faceTop - fh * face[1], width: fw, height: fh };
  const bigMask = [
    `radial-gradient(${Math.round(faceH * 1.9)}px ${Math.round(faceH * 2.3)}px at ${Math.round(faceCx)}px ${Math.round(faceTop + faceH * 0.7)}px, #000 50%, transparent 100%)`,
    `linear-gradient(to bottom, #000 ${Math.round(faceTop + faceH * 1.3)}px, transparent ${Math.round(faceTop + faceH * 2.3)}px)`,
  ].join(", ");

  // ---- the player, full length ----
  // Always the whole player (the reference's celebrating figure); a photo cut at the legs is lifted so his head
  // still sits on the big face's chin, and its lower part dissolves into the dark.
  const headTop = 520 + r() * 30;
  const stood = standing(data, { cx: X(600 + (r() - 0.5) * 30), headTop, floor: 1330, maxFace: 125, framing: "full" });
  const faceWant = headTop + stood.faceH * 0.6;
  const { box, style: fade } = lift(data, stood, faceWant);

  // ---- the ground behind ----
  const scene = sceneOf(data);

  // ---- crests stacked on the right ----
  const potm = postType === "potm";
  const crests = potm ? [data.club?.crestUrl ?? null] : sides.crests;
  const crestSize = crests.filter(Boolean).length > 1 ? 150 : 180;
  const showScore = (postType === "result" || postType === "goal") && !!score;
  const goals = showScore ? [content.homeGoals ?? "", content.awayGoals ?? ""] : [];
  const crestCx = X(912);
  const crestTop = 690;

  // ---- bottom-left lines ----
  let info: string[];
  if (postType === "matchday") info = [m.venue, m.time ? `KICK-OFF ${m.time}` : "", m.longDate || m.date];
  else if (postType === "result" || postType === "goal") info = [score ? `FULL TIME ${score}` : "", m.opp ? `V ${m.opp}` : "", m.comp];
  else info = [content.subline.toUpperCase(), ...shortFacts(data, 2).map((s) => `${s.value} ${s.label}`.toUpperCase())];
  if (postType === "goal") info[0] = score ? `${content.kicker.toUpperCase()}  ${score}` : content.kicker.toUpperCase();
  info = info.filter(Boolean);
  const head = postType === "matchday" ? [content.kicker.toUpperCase(), m.comp].filter(Boolean).join("  ·  ") : postType === "goal" ? "" : content.kicker.toUpperCase();
  // The lines stop short of the player (his box, less the empty margin a cutout usually has).
  const nearEdge = flip ? CANVAS_W - (box.left + box.width * 0.9) : box.left + box.width * 0.1;
  const infoW = Math.max(230, Math.min(380, nearEdge - 96 - 18));
  // One size for the block, unless a single long line (a cup's full name) would drag all the others down.
  const infoSize = Math.max(20, Math.min(26, ...info.map((t) => fitText(t, infoW, 26, 0.68))));
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  const white = STROKES.filter((s) => s.white);
  const coloured = STROKES.filter((s) => !s.white);
  const jitter = (s: Stroke, i: number) => {
    const rr = rng(seed * 31 + i * 7);
    return s.pts.map(([x, y]) => [X(x + (rr() - 0.5) * 22), y + (rr() - 0.5) * 22] as Pt);
  };

  const smallCaps: CSSProperties = { fontFamily: ARCHIVO, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "0.03em", lineHeight: 1.3 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: deep, color: "#ffffff" }}>
      <GradientMapDefs id={`sw-face-${seed}`} dark={mix(club, "#000000", 0.9)} mid={shade(club, -0.15)} light="#f3f6fb" />
      <GradientMapDefs id={`sw-ground-${seed}`} dark={mix(club, "#000000", 0.92)} mid={mix(club, "#000000", 0.55)} light={shade(club, 0.25)} />
      <MonoDefs id={`sw-mono-${seed}`} ink={0.55} />

      {/* The ground, in the club's night colours, rising from the bottom. */}
      {scene ? (
        <img
          src={scene}
          alt=""
          style={{
            position: "absolute",
            left: -30,
            top: 300,
            width: CANVAS_W + 60,
            height: CANVAS_H - 270,
            maxWidth: "none",
            objectFit: "cover",
            filter: `url(#sw-ground-${seed}) blur(1.5px) brightness(.85)`,
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 30%)",
            maskImage: "linear-gradient(to bottom, transparent, #000 30%)",
          }}
        />
      ) : data.bgPhotoUrl ? (
        <img src={data.bgPhotoUrl} alt="" style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CANVAS_H + 180, maxWidth: "none", objectFit: "cover", filter: `blur(30px) url(#sw-ground-${seed}) brightness(.8)` }} />
      ) : null}

      {/* The face, huge, duotone, melting into the ground. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: bigMask, maskImage: bigMask, WebkitMaskComposite: "source-in", maskComposite: "intersect" } as CSSProperties}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", ...bigBox, maxWidth: "none", filter: `url(#sw-face-${seed}) contrast(1.08)${faceBlur ? ` blur(${faceBlur.toFixed(1)}px)` : ""}` }} />
        </div>
      )}
      {/* Night falls at the edges and the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 60%, ${deep}cc 100%), radial-gradient(90% 70% at 50% 40%, transparent 55%, ${deep}aa 100%)` }} />

      {/* Flourishes: club colour first, the white ones over them. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
        <defs>
          <filter id={`sw-tex-${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={seed % 50} result="n" />
            <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.22 1.06" result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#sw-tex-${seed})`}>
          {coloured.map((s, i) => (
            <path key={`c${i}`} d={flourish(jitter(s, i), s.w, s.peak)} fill={club} />
          ))}
          {white.map((s, i) => (
            <path key={`w${i}`} d={flourish(jitter(s, i + 20), s.w, s.peak)} fill={WHITE} />
          ))}
        </g>
      </svg>

      {/* The player celebrating, in colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 20px 40px ${ink})` }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              maxWidth: "none",
              filter: "contrast(1.05) saturate(1.05)",
              ...fade,
            }}
          />
        </div>
      )}
      {/* His feet sink into the dark. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, background: `linear-gradient(to bottom, transparent, ${deep}99)` }} />

      {/* Crests stacked, as white marks (the score beside each in result posts). */}
      <div style={{ position: "absolute", left: crestCx - 150, width: 300, top: crestTop, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        {crests.map((c, i) => (
          <div key={i} style={{ position: "relative", width: crestSize, height: crestSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {c ? (
              <img src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: `url(#sw-mono-${seed}) drop-shadow(0 8px 20px rgba(0,0,0,.45))` }} />
            ) : (
              <div style={{ width: crestSize * 0.8, height: crestSize * 0.8, borderRadius: "50%", border: "4px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: crestSize * 0.22, textAlign: "center", lineHeight: 1 }}>
                {(sides.names[i] ?? "").split(/\s+/).filter((w) => w.length > 2).map((w) => w[0]).join("").slice(0, 3)}
              </div>
            )}
            {goals[i] !== undefined && goals[i] !== "" && (
              <div style={{ position: "absolute", [flip ? "left" : "right"]: crestSize + 26, top: "50%", transform: "translateY(-50%)", fontFamily: DISPLAY, fontSize: 118, lineHeight: 1, color: "#ffffff", textShadow: `0 8px 30px ${ink}` }}>
                {goals[i]}
              </div>
            )}
          </div>
        ))}
        {/* Under the crests: his name, tiny, and the agency. */}
        <div style={{ ...smallCaps, marginTop: 6, fontSize: fitText(name, 250, 14, 0.8), letterSpacing: "0.3em", fontWeight: 700, textShadow: `0 2px 12px ${ink}` }}>{name}</div>
        <AgencyLogo data={data} height={22} style={{ opacity: 0.85, marginTop: -14 }} />
      </div>

      {/* Bottom-left lines. */}
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 96, bottom: 92, display: "flex", flexDirection: "column", alignItems: flip ? "flex-end" : "flex-start", textAlign: flip ? "right" : "left", textShadow: `0 2px 14px ${ink}` }}>
        {head && <div style={{ ...smallCaps, fontWeight: 800, fontSize: fitText(head, infoW, 15, 0.8), letterSpacing: "0.22em", opacity: 0.85, marginBottom: 12 }}>{head}</div>}
        {info.map((t, i) => (
          <div key={i} style={{ ...smallCaps, fontSize: Math.min(infoSize, fitText(t, infoW, 26, 0.68)) }}>
            {t}
          </div>
        ))}
      </div>

      <Film strength={0.8} />
    </div>
  );
}
