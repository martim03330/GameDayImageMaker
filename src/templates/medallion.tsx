/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeFace, matchFacts } from "./strokes";
import { AgencyLogo, SANS } from "./shared";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = {
  a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8,
  n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9,
  A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3,
  N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1,
  " ": 26.7, "'": 31.3, "-": 46.3, ".": 27, ":": 27, "–": 50, "·": 27,
};
const interEm = (t: string, tracking = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? (/\d/.test(c) ? 62 : 62)) / 100 + tracking, 0);
/** The biggest size (≤ max) at which `t` fits `width`. */
const fitTo = (t: string, width: number, max: number, tracking = 0, min = 10) => Math.max(min, Math.min(max, width / Math.max(0.5, interEm(t, tracking))));

/** "MATCHDAY" → "Matchday". */
const sentence = (k: string) => {
  const s = k.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Home team first, names exactly as stored (only the case may change), with their crests. */
function fixture(data: RenderData) {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = (weHost ? c.homeTeam : c.awayTeam) || ours;
  const oppName = (weHost ? c.awayTeam : c.homeTeam) || f.opp;
  const teams = (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean) as string[];
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  return { f, teams, crests };
}

/**
 * Medallion: a flat, warm paper-white ground and one large perfect circle — a medallion holding his own photo,
 * softly blurred and toned into the club colour. The sharp, natural-colour cutout stands inside it and breaks
 * out over the top rim (the head and shoulders above the circle, the body clipped by it below). Under the
 * medallion, centred and small: the title in Inter, the competition in club colour, the fixture in spaced
 * caps between two tiny crests, and date · kick-off · ground. The NEYOD mark at the foot.
 */
export function Medallion({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.36 : 1);
  const ty = params.textY ?? 0;

  // The club colour, guarded against white / yellow / near-black kits.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.42) club = vivid(params.accent);
  if (luminance(club) > 0.42) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);
  const ink = "#16171b";
  const ground = "#f1efea";

  const { f, teams, crests } = fixture(data);

  /* ---- the medallion ---- */
  const D = story ? 820 : 620;
  const cx = CANVAS_W / 2;
  const top = story ? 420 : 262;
  const cy = top + D / 2;

  /* ---- the player: face centred over the rim, the head above it, the body filling the disc ---- */
  const faceH = story ? 176 : 124;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = top - faceH * 0.55;
  let box = placeFace(data, cx, faceTop, faceH, top + D + D * 0.3);
  // A photo cut at one side: slide him so the cut edge falls on or past the rim, never inside the disc.
  const cutL = (data.cut?.left ?? 0) > 0;
  const cutR = (data.cut?.right ?? 0) > 0;
  if (cutR && !cutL) box = { ...box, left: box.left + Math.min(D * 0.3, Math.max(0, cx + D / 2 + 6 - (box.left + box.width))) };
  if (cutL && !cutR) box = { ...box, left: box.left - Math.min(D * 0.3, Math.max(0, box.left - (cx - D / 2 - 6))) };
  const realFaceTop = box.top + face[1] * box.height;
  // The cut line between "inside the disc" and "free above it": a little above the centre, where the disc is near its widest.
  const freeTo = cy - D * 0.08;

  /* ---- type under the medallion ---- */
  const title = sentence(content.kicker || "Matchday");
  const titleSize = fitTo(title, 700, 46 * ts, -0.02);
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ").toUpperCase();
  const compSize = fitTo(comp, story ? 860 : 760, 13 * ts, 0.24, 10);
  const fixtureText = teams.map((t) => t.toUpperCase()).join("  v  ");
  const crestSize = Math.round(30 * ts);
  const fixW = (story ? 900 : 820) - (crests.length ? 2 * (crestSize + 22) : 0);
  const fixSize = fitTo(fixtureText, fixW, 17 * ts, 0.16, 11);
  const details = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const detSize = fitTo(details, story ? 900 : 820, 17 * ts, 0.01, 11);

  // Post: the type hangs under the disc. Story: it stands on the NEYOD mark (88px), ~64px clear of it.
  const typePos: CSSProperties = story
    ? { bottom: H - (STORY_BOTTOM - (params.logoY ?? 0) - 88 * (params.logoScale ?? 1) - 64) - ty }
    : { top: top + D + 50 + ty };

  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  const img = (extra?: CSSProperties): CSSProperties => ({
    position: "absolute",
    width: box.width,
    height: box.height,
    maxWidth: "none",
    filter: "contrast(1.03)",
    ...cutMask(data.cut),
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* A whisper of light on the ground, so it is paper and not a fill. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 45% at 50% ${((cy - 80) / H) * 100}%, rgba(255,255,255,.7), transparent 70%)` }} />

      {/* The medallion's soft shadow on the ground. */}
      <div
        style={{
          position: "absolute",
          left: cx - D * 0.42,
          top: top + D * 0.86,
          width: D * 0.84,
          height: D * 0.2,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(40,30,20,.22), transparent)",
          filter: "blur(18px)",
        }}
      />

      {/* The medallion: his own photo, blurred and toned in the club colour. */}
      <div style={{ position: "absolute", left: cx - D / 2, top, width: D, height: D, borderRadius: "50%", overflow: "hidden", background: shade(club, -0.35) }}>
        {data.bgPhotoUrl && (
          <img
            src={data.bgPhotoUrl}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: D + 120, height: D + 120, objectFit: "cover", maxWidth: "none", filter: "blur(22px) grayscale(1) contrast(1.1) brightness(1.15)" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.92 }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 60% at 50% 38%, rgba(255,255,255,.16), transparent 70%), radial-gradient(closest-side, transparent 72%, rgba(0,0,0,.28))` }} />
        {/* The body, clipped by the disc. */}
        {data.photoUrl && <img src={data.photoUrl} alt="" style={img({ left: box.left - (cx - D / 2), top: box.top - top })} />}
      </div>

      {/* Above the disc's widest line the figure is free: head and shoulders break out over the rim. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: Math.max(freeTo, realFaceTop + faceH * 1.4), overflow: "hidden" }}>
          {/* Only what lies outside the disc shows here; inside, the clipped layer draws him. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: `radial-gradient(circle ${D / 2}px at ${cx}px ${cy}px, transparent ${D / 2 - 0.5}px, #000 ${D / 2 + 0.5}px)`,
              maskImage: `radial-gradient(circle ${D / 2}px at ${cx}px ${cy}px, transparent ${D / 2 - 0.5}px, #000 ${D / 2 + 0.5}px)`,
            }}
          >
            <img src={data.photoUrl} alt="" style={img({ left: box.left, top: box.top })} />
          </div>
        </div>
      )}

      {/* The type, small and centred under the medallion. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typePos, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: titleSize, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{title}</div>
        {comp && (
          <div style={{ ...caps, marginTop: 16 * ts, fontSize: compSize, letterSpacing: "0.24em", marginRight: "-0.24em", color: shade(club, -0.1) }}>{comp}</div>
        )}
        <div style={{ marginTop: 34 * ts, display: "flex", alignItems: "center", gap: 22 }}>
          {crests[0] && <img src={crests[0]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />}
          <div style={{ ...caps, fontSize: fixSize, letterSpacing: "0.16em", marginRight: "-0.16em", fontWeight: 600 }}>{fixtureText}</div>
          {crests[1] && <img src={crests[1]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />}
        </div>
        {details && (
          <div style={{ marginTop: 14 * ts, fontFamily: SANS, fontWeight: 400, fontSize: detSize, color: "rgba(22,23,27,.62)", whiteSpace: "nowrap", lineHeight: 1 }}>{details}</div>
        )}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 22}
        style={{
          position: "absolute",
          left: "50%",
          bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0),
          transform: `translateX(-50%) scale(${params.logoScale ?? 1})`,
          transformOrigin: "center bottom",
        }}
      />
      <Film strength={0.15} />
    </div>
  );
}
