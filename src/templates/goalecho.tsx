/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 64;

/** Inter capitals (500–600): advance widths per 100px. */
const IC: Record<string, number> = { A: 76, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 76, W: 105.7, X: 73.8, Y: 73.1, Z: 66.4, "-": 46.8, " ": 23.7, "'": 26, ".": 28, "!": 30 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, tracking = 0) => plain(t).reduce((a, c) => a + (IC[c] ?? 66) / 100 + tracking, 0);
/** Font size that fits `t` (caps, tracked) into `w`, at most `max`. */
const fit = (t: string, w: number, max: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(t, tracking)));

/**
 * Goal echo: the celebrating player, sharp and in natural colour, with three soft echoes of his own outline
 * trailing behind him (club-tinted silhouettes, fainter, smaller and more blurred the further back), the run
 * after the goal. A clean deep ground, the title in wide-tracked caps at the top, and at the foot only his
 * name, the fixture and the competition, small.
 */
export function Goalecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // A native 9:16 story (1080×1920): the type runs from STORY_TOP to STORY_BOTTOM, a size larger, and the
  // player fills the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const ground = shade(club, -0.72);
  const glow = shade(club, -0.38);

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = (weHost ? content.homeTeam : content.awayTeam) || oursName;
  const opp = (weHost ? content.awayTeam : content.homeTeam) || f.opp;
  const fixture = (opp ? (weHost ? [ours, opp] : [opp, ours]).filter(Boolean).join("  v  ") : "").toUpperCase();
  const comp = (f.comp || f.round || "").trim().toUpperCase();

  /* ---- the player; he runs towards `dir`, the echoes trail the other way ---- */
  const dir = params.side === "left" ? -1 : 1;
  const faceX = 540 + dir * 70;
  const sizes = story ? { chest: 290, waist: 232, knees: 184, full: 148 } : { chest: 210, waist: 168, knees: 134, full: 108 };
  const faceTop = story ? 440 : 330;
  let box = placeByFace(data, faceX, faceTop, sizes);
  const wide = Math.min(1, 980 / box.width);
  if (wide < 1) box = placeByFace(data, faceX, faceTop, Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, v * wide])));
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };

  /* ---- the echoes: further back = fainter, smaller, softer ---- */
  const step = Math.min(150, Math.max(90, box.width * 0.17));
  const echoes = [3, 2, 1].map((k) => {
    const s = 1 - 0.045 * k;
    const w = box.width * s;
    const h = box.height * s;
    // Shrink towards his feet so the echoes stand on the same ground, then slide back along the run.
    const left = box.left + (box.width - w) / 2 - dir * step * k;
    const top = box.top + (box.height - h) * 0.7 + 8 * k;
    return { k, left, top, w, h, opacity: [0, 0.4, 0.22, 0.11][k], blur: [0, 3, 7, 12][k] };
  });
  // Echoes split at the neck: the body blurred, the head never.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const neck = (face[1] + face[3] * 1.2) * 100;
  const head = `linear-gradient(to bottom, #000 0, #000 ${neck}%, transparent ${neck + 4}%)`;
  const body = `linear-gradient(to bottom, transparent 0, transparent ${neck - 1}%, #000 ${neck + 4}%)`;
  const echoGrade = "saturate(.55) brightness(.92)";

  /* ---- the foot ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const kTrack = 0.62;
  const kSize = fit(kicker, CANVAS_W - 2 * MARGIN - 40, 58 * k, kTrack) * ts;
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const footW = CANVAS_W - 2 * MARGIN - 230;
  const nameSize = fit(name, footW, 30 * k, 0.22) * ts;
  const fixSize = fit(fixture, footW, 15 * k, 0.26) * ts;
  const compSize = fit(comp, footW, 12 * k, 0.3) * ts;
  const footBottom = (story ? H - STORY_BOTTOM : 70) - (params.textY ?? 0);
  const fadeEnd = story ? 1500 : CANVAS_H - 170;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 210 - box.top}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (size: number, weight: number, track: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: WHITE,
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The ground: deep club tone with a soft lift behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 52% at ${50 + dir * 4}% 46%, ${glow}, ${ground} 78%)` }} />

      {/* The title, wide-tracked, behind the figure (a raised fist may pass in front of it). */}
      <div style={{ position: "absolute", left: 0, right: 0, top: story ? STORY_TOP : 104, textAlign: "center", ...caps(kSize, 300, kTrack, { paddingLeft: `${kTrack}em` }) }}>{kicker}</div>

      {/* The echoes: his own outline, club-tinted, trailing behind. No face detail in them. */}
      {data.photoUrl &&
        echoes.map((e) => (
          <div key={e.k} style={{ position: "absolute", left: e.left, top: e.top, width: e.w, height: e.h, opacity: e.opacity, WebkitMaskImage: fade, maskImage: fade }}>
            {/* His body, softer the further back. */}
            <div style={{ position: "absolute", inset: 0, WebkitMaskImage: body, maskImage: body }}>
              <img src={data.photoUrl!} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: `blur(${e.blur}px) ${echoGrade}`, ...cutMask(data.cut) }} />
            </div>
            {/* His head stays unblurred, only faint. */}
            <div style={{ position: "absolute", inset: 0, WebkitMaskImage: head, maskImage: head }}>
              <img src={data.photoUrl!} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: echoGrade, ...cutMask(data.cut) }} />
            </div>
          </div>
        ))}

      {/* A soft shade under him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.22, top: box.top + box.height * 0.3, width: box.width * 0.56, height: box.height * 0.45, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(70px)" }} />

      {/* The player, sharp, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 720 : 360, background: `linear-gradient(to bottom, transparent, ${ground}cc)` }} />

      {/* The foot: name, fixture, competition. */}
      <div style={{ position: "absolute", left: MARGIN, bottom: footBottom, display: "flex", flexDirection: "column", gap: 14 * k * ts }}>
        <div style={caps(nameSize, 600, 0.22)}>{name}</div>
        {fixture && <div style={caps(fixSize, 500, 0.26, { opacity: 0.86 })}>{fixture}</div>}
        {comp && <div style={caps(compSize, 500, 0.3, { opacity: 0.6 })}>{comp}</div>}
      </div>

      <AgencyLogo data={data} height={story ? 24 : 22} style={{ position: "absolute", right: MARGIN, bottom: (story ? H - STORY_BOTTOM : 62) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
