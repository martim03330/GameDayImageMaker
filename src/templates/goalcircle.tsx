/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f2ede4";
const INK = "#111111";
const MARGIN = 64;

/** Inter capitals (500–700): advance widths per 100px. */
const IC: Record<string, number> = { A: 76, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 76, W: 105.7, X: 73.8, Y: 73.1, Z: 66.4, "-": 46.8, " ": 23.7, "'": 26, ".": 28, "!": 30 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, tracking = 0) => plain(t).reduce((a, c) => a + (IC[c] ?? 66) / 100 + tracking, 0);
const fit = (t: string, w: number, max: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(t, tracking)));

/**
 * Goal circle: a Japanese poster. A warm off-white ground, one large solid circle in the club colour rising
 * behind his head and shoulders like a sun, the celebrating player in natural colour in front of it. The
 * title small in black spaced caps, his name and the fixture tiny. Two colours and the photo, nothing else.
 */
export function Goalcircle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // A native 9:16 story (1080×1920): the title starts at STORY_TOP, the credits end at STORY_BOTTOM (he melts into the paper above them),
  // type a size larger, and the sun and the player fill the height between.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  // The sun must hold against off-white: no white / pale yellow, no near-black.
  let sun = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(sun) > 0.55) sun = vivid(params.accent);
  if (luminance(sun) > 0.55) sun = shade(sun, -0.3);
  if (luminance(sun) < 0.03) sun = shade(sun, 0.2);

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = (weHost ? content.homeTeam : content.awayTeam) || oursName;
  const opp = (weHost ? content.awayTeam : content.homeTeam) || f.opp;
  const fixture = (opp ? (weHost ? [ours, opp] : [opp, ours]).filter(Boolean).join("  v  ") : "").toUpperCase();
  const comp = (f.comp || f.round || "").trim().toUpperCase();

  /* ---- the player, a little off-centre; the sun sits on his head and shoulders ---- */
  const shift = params.side === "left" ? -60 : params.side === "right" ? 60 : 0;
  const faceX = 540 + shift;
  const sizes = story ? { chest: 300, waist: 236, knees: 186, full: 150 } : { chest: 220, waist: 172, knees: 136, full: 110 };
  const faceTop = story ? 560 : 470;
  let box = placeByFace(data, faceX, faceTop, sizes);
  const wide = Math.min(1, 1000 / box.width);
  if (wide < 1) box = placeByFace(data, faceX, faceTop, Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, v * wide])));
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceCy = box.top + (face[1] + face[3] / 2) * box.height;
  const R = story ? 430 : 330;
  // Centred a little below the face so the disc frames head and shoulders; kept inside the canvas.
  const sunCx = Math.max(R + 40, Math.min(CANVAS_W - R - 40, 540 + (faceCx - 540) * 0.5));
  const sunCy = faceCy + box.faceH * 0.55;

  /* ---- type ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const kTrack = 0.42;
  const kSize = fit(kicker, story ? 640 : 520, 30 * (story ? 1.8 : 1), kTrack) * ts;
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const colW = story ? 700 : 520;
  const nameSize = fit(name, colW, 15 * (story ? 1.6 : 1), 0.3) * ts;
  const fixSize = fit(fixture, colW, 12 * (story ? 1.5 : 1), 0.28) * ts;
  const compSize = fit(comp, colW, 11 * k, 0.3) * ts;
  const top = (story ? STORY_TOP : 78) + (params.textY ?? 0);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${1330 - box.top}px, transparent ${1520 - box.top}px)`;

  const caps = (size: number, weight: number, track: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: INK,
    ...extra,
  });

  const credits = (
    <>
      <div style={caps(nameSize, 600, 0.3)}>{name}</div>
      {fixture && <div style={caps(fixSize, 500, 0.28, { marginTop: 12 * k * ts, opacity: 0.72 })}>{fixture}</div>}
      {comp && <div style={caps(compSize, 500, 0.3, { marginTop: 9 * k * ts, opacity: 0.5 })}>{comp}</div>}
    </>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* A whisper of paper warmth, no texture. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 40%, rgba(255,255,255,.35), transparent 70%)" }} />

      {/* The sun. */}
      <div style={{ position: "absolute", left: sunCx - R, top: sunCy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", background: sun }} />

      {/* A soft shade under him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.25, top: faceCy + box.faceH * 1.2, width: box.width * 0.5, height: story ? Math.min(box.faceH * 5, 1300 - faceCy - box.faceH * 1.2) : box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.16)", filter: "blur(50px)" }} />

      {/* The player, natural colour. */}
      {data.photoUrl && !story && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }} />
      )}
      {/* The story: he melts into the paper above the credits. */}
      {data.photoUrl && story && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Title and credits, top left (the story: the title alone up top, the credits at the foot). */}
      <div style={{ position: "absolute", left: MARGIN, top, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={caps(kSize, 700, kTrack)}>{kicker}</div>
        <div style={{ width: 36 * k, height: 3 * k, background: sun, marginTop: 22 * k * ts, marginBottom: story ? 0 : 22 * ts }} />
        {!story && credits}
      </div>
      {story && <div style={{ position: "absolute", left: MARGIN, bottom: H - STORY_BOTTOM - (params.textY ?? 0), display: "flex", flexDirection: "column", alignItems: "flex-start" }}>{credits}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", right: MARGIN, ...(story ? { bottom: H - STORY_BOTTOM + (params.logoY ?? 0) } : { top: 70 - (params.logoY ?? 0) }), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: story ? "right bottom" : "right top" }}
      />
    </div>
  );
}
