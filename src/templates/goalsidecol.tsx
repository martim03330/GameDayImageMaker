/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const PAPER = "#f3f1ec";
const INK = "#1b1a18";
const SOFT = "#7a766f";

/** DM Serif Display, roman and italic: advance widths per 100px (measured in the browser). */
const DMS_W: Record<string, number> = { a: 51.8, b: 57.7, c: 48.9, d: 57.4, e: 50.7, f: 34.4, g: 52.2, h: 58, i: 28, j: 30.1, k: 58.2, l: 28.6, m: 87.1, n: 57.8, o: 55, p: 56.9, q: 56, r: 44.1, s: 43.6, t: 36, u: 56.7, v: 53.4, w: 78.5, x: 57, y: 53.5, z: 46.5, A: 65.4, B: 58.3, C: 59.8, D: 62.6, E: 55.5, F: 53.2, G: 66.5, H: 69.1, I: 30.1, J: 42.2, K: 65.4, L: 53.2, M: 79.1, N: 65.3, O: 68.4, P: 55.6, Q: 68.4, R: 62.8, S: 51.5, T: 63.1, U: 63.6, V: 63.7, W: 92.6, X: 61.4, Y: 59.5, Z: 56, " ": 21.8, "'": 22.3, "-": 33.2 };
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmsEm = (t: string) => plain(t).reduce((a, c) => a + (DMS_W[c] ?? 56) / 100, 0);
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
/** Inter light, roughly. */
const interEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? 0.68 : /[ilj']/.test(c) ? 0.25 : /[mw]/.test(c) ? 0.85 : 0.56), 0);

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Goal side column: the goal post of `sidecol`. A solid off-white column on the free side holds the type —
 * small crests, "Goal" big in italic serif, the scorer's name in roman serif under it, a club-colour hairline,
 * the fixture (home first, "v"), and at its foot the competition and the agency mark; the rest is the
 * celebrating player over his own photo, softly blurred, in natural colour, crossing the column edge a little.
 */
export function Goalsidecol({ data }: { data: RenderData }) {
  const { params, content } = data;
  const right = params.side !== "left";
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5) club = shade(club, -0.35);

  const f = matchFacts(data);

  /* ---- the column ---- */
  const COL_W = story ? 450 : 420;
  const PAD = 56;
  const inner = COL_W - PAD * 2;
  const colLeft = right ? 0 : CANVAS_W - COL_W;
  const textLeft = colLeft + PAD;

  /* ---- title: the kicker in italic serif ---- */
  const title = sentence(content.kicker || "Goal");
  const tSize = Math.max(56, Math.min(132 * S, inner / Math.max(1, dmiEm(title)))) * ts;

  /* ---- the scorer, roman serif, first name over surname ---- */
  const nameLines = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean);
  const nSize = Math.max(26, Math.min(46 * S, inner / Math.max(1, ...nameLines.map(dmsEm)))) * ts;

  /* ---- fixture, home first ---- */
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const [first, second] = weHost ? [ours, opp] : [opp, ours];
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const fit = (t: string, max: number, min: number) => Math.max(min, Math.min(max * S, inner / Math.max(1, interEm(t))));
  const light: CSSProperties = { fontFamily: SANS, fontWeight: 300, color: INK, lineHeight: 1.3, whiteSpace: "nowrap" };
  const capsSize = (t: string) => Math.max(11, Math.min(14 * S, inner / Math.max(1, interEm(t.toUpperCase()) * 1.18)));

  /* ---- the photo side ---- */
  const photoLeft = right ? COL_W : 0;
  const photoW = CANVAS_W - COL_W;
  // A little away from the column, so a raised fist stays off the type.
  const faceX = photoLeft + photoW * (right ? (story ? 0.6 : 0.55) : story ? 0.4 : 0.45);
  let box = story
    ? placeByFace(data, faceX, STORY_TOP + 230, { chest: 350, waist: 272, knees: 215, full: 170 })
    : placeByFace(data, faceX, 230, { chest: 290, waist: 228, knees: 178, full: 136 });
  // A fist raised towards the column: centre the figure on the photo side a little rather than the face.
  const lean = Math.max(-140, Math.min(140, (2 * photoLeft + photoW - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (right ? Math.max(0, lean) : Math.min(0, lean)) };
  const own = data.bgPhotoUrl;
  const scene = own ? null : sceneOf(data);
  const overlap = story ? 24 : 44;
  const clipLeft = right ? COL_W - overlap : 0;
  const clipW = photoW + overlap;
  const fade = right ? `linear-gradient(to right, transparent 0, #000 ${overlap}px)` : `linear-gradient(to left, transparent 0, #000 ${overlap}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* The photo side: his own photo (or the ground), softly out of focus, natural colour. */}
      <div style={{ position: "absolute", left: photoLeft, top: 0, width: photoW, height: H, overflow: "hidden", background: `linear-gradient(to bottom, ${shade(club, 0.55)}, ${shade(club, 0.25)})` }}>
        {(own || scene) && (
          <img src={(own || scene)!} alt="" style={{ position: "absolute", left: -80, top: -80, width: photoW + 160, height: H + 160, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(1.02) brightness(.95)" }} />
        )}
        {own && (
          <img src={own} alt="" style={{ position: "absolute", left: box.left - photoLeft, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "blur(22px) saturate(1.02) brightness(.95)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,.18))" }} />
        {/* A soft shade behind the figure instead of a drop shadow on the cutout. */}
        <div style={{ position: "absolute", left: box.left - photoLeft + box.width * 0.18, top: box.top + box.height * 0.3, width: box.width * 0.64, height: box.height * 0.6, borderRadius: "50%", background: "rgba(0,0,0,.16)", filter: "blur(60px)" }} />
      </div>

      {/* The player, allowed just over the column edge. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: clipLeft, top: 0, width: clipW, height: H, overflow: "hidden", WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left - clipLeft, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top of the column: crests, the title, the scorer, hairline, fixture. */}
      <div style={{ position: "absolute", left: textLeft, top: story ? STORY_TOP : 60, width: inner }}>
        <div style={{ display: "flex", gap: 16 * S, alignItems: "center", height: 48 * S }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 46 * S, height: 46 * S, objectFit: "contain" }} />
          ))}
        </div>
        <div style={{ marginTop: (story ? 110 : 76) + (params.textY ?? 0), fontFamily: DMSERIF, fontStyle: "italic", fontSize: tSize, lineHeight: 1, color: INK, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{title}</div>
        {nameLines.length > 0 && (
          <div style={{ marginTop: 22 * S, fontFamily: DMSERIF, fontSize: nSize, lineHeight: 1.08, color: INK, whiteSpace: "nowrap" }}>
            {nameLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 40 * S, width: 64 * S, height: 2, background: club }} />
        <div style={{ marginTop: 34 * S }}>
          <div style={{ ...light, fontWeight: 400, fontSize: fit(first, 24, 16) }}>{first}</div>
          {second && <div style={{ ...light, fontWeight: 400, fontSize: fit(`v ${second}`, 24, 16) }}>v {second}</div>}
        </div>
      </div>

      {/* Foot of the column: competition, round, the agency mark. */}
      <div style={{ position: "absolute", left: textLeft, bottom: story ? H - STORY_BOTTOM : 60, width: inner, display: "flex", flexDirection: "column", gap: 6 * S }}>
        {comp && <div style={{ ...light, fontWeight: 500, fontSize: capsSize(comp), letterSpacing: "0.16em", textTransform: "uppercase", color: SOFT }}>{comp}</div>}
        {round && <div style={{ ...light, fontWeight: 500, fontSize: capsSize(round), letterSpacing: "0.16em", textTransform: "uppercase", color: SOFT }}>{round}</div>}
        <div style={{ height: story ? 62 : 32 }} />
        <AgencyLogo data={data} onLight height={story ? 26 : 22} style={{ position: "relative", alignSelf: "flex-start", marginBottom: -(params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }} />
      </div>
    </div>
  );
}
