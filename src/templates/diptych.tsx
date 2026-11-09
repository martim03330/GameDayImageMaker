/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, DMSERIF } from "./fx";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const SIDE = 72;
const GUTTER = 18;
const PANEL_TOP = 150;
const PANEL_H = 900;
const PANEL_W = (CANVAS_W - SIDE * 2 - GUTTER) / 2;

/** DM Serif Display italic: advance widths per 100px (measured in the browser). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** "MATCHDAY" → "Matchday", "MAN OF THE MATCH" → "Man of the match". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase();
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

type Shot = RenderData["cutouts"][number];
const hasFace = (c: Shot) => !!c.face && c.face[3] >= 0.035;

/**
 * One panel: his own photo blurred as the ground, the cutout sharp over it. Placed by the face (centred,
 * its top at `faceTopFrac` of the panel, never cut by an edge), or by the outline for a photo from behind.
 */
function Panel({ shot, left, faceH, faceTopFrac, mono, data }: { shot: Shot; left: number; faceH: number; faceTopFrac: number; mono: boolean; data: RenderData }) {
  const p = data.params;
  const aspect = shot.aspect ?? 0.6;
  let w: number;
  let h: number;
  let x: number;
  let y: number;
  if (hasFace(shot)) {
    const face = shot.face!;
    let fh = faceH * (p.playerScale ?? 1);
    // Never wider than the panel allows with a margin either side of the face.
    fh = Math.min(fh, ((PANEL_W - 60) * face[3]) / Math.max(0.01, face[2] * aspect));
    // The main photo's real face size is known: never blown up past ~1.9× (export is 2×).
    if (shot.url === data.photoUrl && data.facePx > 0) fh = Math.min(fh, Math.max(80, data.facePx * 1.9));
    const faceTop = PANEL_H * faceTopFrac;
    h = Math.max(fh / face[3], (PANEL_H + 10 - faceTop) / Math.max(0.2, 1 - face[1]));
    w = h * aspect;
    const fw = face[2] * w;
    let cx = PANEL_W / 2 + (p.playerX ?? 0) * 0.5;
    cx = Math.max(fw / 2 + 24, Math.min(PANEL_W - fw / 2 - 24, cx));
    x = cx - w * (face[0] + face[2] / 2);
    y = faceTop - h * face[1] + (p.playerY ?? 0) * 0.5;
    // A photo cut at a side meets the panel's edge there, so the cut never shows inside the panel.
    if ((shot.cut?.right ?? 0) > 0 && x + w < PANEL_W) x = PANEL_W - w;
    if ((shot.cut?.left ?? 0) > 0 && x > 0) x = 0;
    // The face stays inside the panel.
    y = Math.max(y, 24 - h * face[1]);
  } else {
    // From behind: by the outline, the closer crop a little larger and higher.
    const zoom = Math.max(0.85, Math.min(1.3, faceH / 118));
    y = PANEL_H * (zoom > 1 ? 0.07 : 0.12);
    h = (PANEL_H + 20 - y) * (p.playerScale ?? 1);
    if (h * aspect > PANEL_W * 1.05 * zoom) h = (PANEL_W * 1.05 * zoom) / aspect;
    // A photo cut at the foot always reaches the panel's bottom edge.
    if ((shot.cut?.bottom ?? 0) > 0) h = Math.max(h, PANEL_H + 10 - y);
    w = h * aspect;
    x = (PANEL_W - w) / 2 + (p.playerX ?? 0) * 0.5;
  }
  const tone = mono ? "grayscale(1) contrast(1.08)" : "contrast(1.03)";
  return (
    <div style={{ position: "absolute", left, top: PANEL_TOP, width: PANEL_W, height: PANEL_H, overflow: "hidden", background: "#777" }}>
      <img
        src={shot.original}
        alt=""
        style={{ position: "absolute", left: -60, top: -60, width: PANEL_W + 120, height: PANEL_H + 120, maxWidth: "none", objectFit: "cover", filter: `blur(22px) ${mono ? "grayscale(1)" : "saturate(.85)"} brightness(.92)` }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.1)" }} />
      <img src={shot.url} alt="" style={{ position: "absolute", left: x, top: y, width: w, height: h, maxWidth: "none", filter: `${tone} drop-shadow(0 16px 30px rgba(0,0,0,.28))`, ...cutMask(shot.cut) }} />
    </div>
  );
}

/**
 * Diptych: two photographs of him hung side by side on a gallery wall (warm off-white or near-black, by
 * seed), a thin gutter between them. Each panel is the cutout over his own photo blurred. With a single
 * photo: the same one twice — a wide black-and-white crop and a close colour one. Under the panels one
 * line of italic serif title on the left and a small block of fixture, date and kick-off on the right;
 * name and crests small above.
 */
export function Diptych({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 1);
  const dark = r() < 0.5;
  const sheet = dark ? "#121212" : "#efece6";
  const ink = dark ? "#f1efe9" : "#1d1c1a";
  const soft = dark ? "rgba(241,239,233,.6)" : "#7a756d";

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the two photos ---- */
  const all = data.cutouts.length ? data.cutouts : data.photoUrl ? [{ url: data.photoUrl, original: data.bgPhotoUrl ?? data.photoUrl, aspect: data.photoAspect, face: data.face, cut: data.cut }] : [];
  const faced = all.filter(hasFace);
  const first = all[0] && hasFace(all[0]) ? all[0] : faced[0] ?? all[0];
  const sideCut = (c: Shot) => (c.cut?.left ?? 0) > 0 || (c.cut?.right ?? 0) > 0;
  const others = faced.filter((c) => c !== first && c.url !== first?.url);
  // Whole figures first: a photo cut at a side reads as a mistake in a narrow panel.
  const pool = others.some((c) => !sideCut(c)) ? others.filter((c) => !sideCut(c)) : others;
  const second = pool.find((c) => c.url === data.photo2Url) ?? pool[Math.floor(r() * pool.length)] ?? null;
  const single = !second;
  const shots: { shot: Shot; faceH: number; faceTop: number; mono: boolean }[] = first
    ? single
      ? [
          { shot: first, faceH: 92, faceTop: 0.2, mono: true },
          { shot: first, faceH: 150, faceTop: 0.24, mono: false },
        ]
      : [
          { shot: first, faceH: 118, faceTop: 0.2, mono: false },
          { shot: second, faceH: 118, faceTop: 0.2, mono: false },
        ]
    : [];
  if (params.side === "left") shots.reverse();

  /* ---- type ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const NAME_TRACK = 0.36;
  const nameSize = Math.max(11, Math.min(14, 520 / Math.max(1, capsEm(name, NAME_TRACK)))) * ts;
  const title = isResult && postType === "result" ? "Full time" : sentence(content.kicker || "MATCHDAY");
  const titleSize = Math.min(84, 470 / Math.max(1, dmiEm(title))) * ts;
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? (isResult ? `${pair[0]}  ${score}  ${pair[1]}` : `${pair[0]}  —  ${pair[1]}`) : "";
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const venue = titleCase(f.venue);
  const comp = (f.comp || f.round || "").toUpperCase();
  const FIX_TRACK = 0.22;
  const fixSize = Math.max(11, Math.min(14, 420 / Math.max(1, capsEm(fixture, FIX_TRACK)))) * ts;
  const lineSize = (t: string) => Math.max(13, Math.min(17, 430 / Math.max(1, t.length * 0.5))) * ts;
  const COMP_TRACK = 0.3;
  const compSize = Math.max(10, Math.min(12, 520 / Math.max(1, capsEm(comp, COMP_TRACK)))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const textTop = PANEL_TOP + PANEL_H + 46 + (params.textY ?? 0);
  const caps = (size: number, track: number, color = ink): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: sheet, color: ink }}>
      {/* Head: his name left, crests right, on the panels' edges. */}
      <div style={{ position: "absolute", left: SIDE, top: PANEL_TOP - 52, ...caps(nameSize, NAME_TRACK) }}>{name}</div>
      {crests.length > 0 && (
        <div style={{ position: "absolute", right: SIDE, top: PANEL_TOP - 66, height: 40, display: "flex", alignItems: "center", gap: 16 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 38, height: 38, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* The two panels. */}
      {shots.map((s, i) => (
        <Panel key={i} shot={s.shot} left={SIDE + i * (PANEL_W + GUTTER)} faceH={s.faceH} faceTopFrac={s.faceTop} mono={s.mono} data={data} />
      ))}

      {/* Under the panels: the title left, the fixture right. */}
      <div style={{ position: "absolute", left: SIDE - titleSize * 0.04, top: textTop - titleSize * 0.18, fontFamily: DMSERIF, fontStyle: "italic", fontSize: titleSize, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{title}</div>
      <div style={{ position: "absolute", right: SIDE, top: textTop, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        {fixture && <div style={caps(fixSize, FIX_TRACK)}>{fixture}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: lineSize(when), lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{when}</div>}
        {venue && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: lineSize(venue), lineHeight: 1, whiteSpace: "nowrap", color: soft }}>{venue}</div>}
      </div>

      {/* Foot: the competition left, the agency right, on one line. */}
      {comp && <div style={{ position: "absolute", left: SIDE, bottom: 66, ...caps(compSize, COMP_TRACK, soft) }}>{comp}</div>}
      <AgencyLogo
        data={data}
        onLight={!dark}
        height={18}
        style={{ position: "absolute", right: SIDE, bottom: 50 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
    </div>
  );
}
