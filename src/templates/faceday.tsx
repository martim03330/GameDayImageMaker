/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { Paper, rng } from "./kit";
import { ANTON, em } from "./mist";
import { competitionOf, crestsOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Worn print: speckled holes and a few scuffs knocked out of the big word. */
const WORN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' seed='21' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -20 15.2'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`,
)}")`;
const SCUFF = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='300'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.05' numOctaves='4' seed='8' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -16 12.8'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;
/** Coarse paper grain for the flat colour. */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' seed='5' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Splits text into at most `max` lines of roughly `chars` characters. */
function wrap(t: string, chars: number, max = 2): string[] {
  const words = t.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= chars) out[out.length - 1] = last + " " + w;
    else out.push(w);
  }
  if (out.length > max) return [...out.slice(0, max - 1), out.slice(max - 1).join(" ")];
  return out;
}

/** The big word, on one line or (long kickers) two balanced ones. */
function wordLines(kicker: string): string[] {
  const k = kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").trim();
  const joined = /DAY$/.test(k.replace(/\s+/g, "")) && k.replace(/\s+/g, "").length <= 9 ? k.replace(/\s+/g, "") : k;
  if (em(joined, ANTON, 47) <= 5.4) return [joined];
  const words = joined.split(/\s+/);
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Face-and-title club poster (Atleti "MATCHDAY"): a flat club-colour background with paper grain, a huge,
 * tight portrait filling the top two thirds (cut at the top of the head), tiny white caps in the corner
 * (ground and kick-off), the competition and the fixture either side of the chin, one massive worn white
 * word across the neck, the two crests under it and a small "POWERED BY" line with the agency logo.
 */
export function Faceday({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 37);
  const flip = params.side === "left";
  const sgn = flip ? -1 : 1;

  // ---- background colour: the club colour, deep enough for white type ----
  const base = params.primary === "#10131c" ? params.accent : params.primary;
  let bg = hueOf(base) == null ? (luminance(base) > 0.5 ? "#23262c" : shade(base, 0.12)) : base;
  for (let i = 0; i < 6 && luminance(bg) > 0.2; i++) bg = shade(bg, -0.12);
  // Neon greens / cyans read garish as a flat field: take them a step deeper.
  if (luminance(bg) > 0.15 && (hueOf(bg) ?? 0) > 75 && (hueOf(bg) ?? 0) < 200) bg = shade(bg, -0.22);

  // ---- the big word first: the face is fitted above it ----
  const lines = wordLines(content.kicker);
  const widest = Math.max(...lines.map((l) => em(l, ANTON, 47)));
  let size = Math.min(lines.length > 1 ? 180 : 250, 930 / widest) * (params.textScale ?? 1);
  const blockOf = (s: number) => lines.length * s * 0.86 + (lines.length - 1) * s * 0.1;
  // Room under the word for the crests (at least ~84px) and the credit line.
  const floor = 1350 - 44 - 26 - 30 - 40 - 84;
  const chinWant = Math.min(830, floor - blockOf(size) - 22);

  // ---- the portrait: as tight as the photo allows, chin just above the word ----
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const want = 640 * (params.playerScale ?? 1);
  // Exported at 2×: up to ~3.6× the real face pixels, softened by the heavy grain; below that, a looser crop.
  let faceH = data.facePx > 0 ? Math.min(want, Math.max(130, data.facePx * 1.8)) : Math.min(want, 460);
  faceH = Math.min(faceH, chinWant - 150);
  let faceTop = Math.min(330, Math.max(150, chinWant - faceH));
  let h = faceH / face[3];
  // The body always runs off the bottom edge: that can enlarge a head-and-shoulders photo, so lift it.
  for (let i = 0; i < 3; i++) {
    h = Math.max(faceH / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
    if (face[3] * h + faceTop > chinWant) faceTop = Math.max(90, chinWant - face[3] * h);
  }
  faceH = face[3] * h;
  const w = h * aspect;
  const fW = face[2] * w;
  const faceCx = 560 + sgn * (30 + r() * 30) + (fW > 420 ? sgn * 20 : 0);
  const box = {
    left: faceCx - (face[0] + face[2] / 2) * w + (params.playerX ?? 0),
    top: faceTop - face[1] * h + (params.playerY ?? 0),
    width: w,
    height: h,
  };
  const chin = faceTop + faceH;
  const mag = data.facePx > 0 ? (faceH * 2) / data.facePx : 2;

  let wordTop = Math.min(floor - blockOf(size), Math.max(chin + 22, 700));
  if (wordTop < chin + 10) {
    // A very long face still: shrink the word rather than cover the mouth.
    wordTop = chin + 10;
    size = Math.max(100, (size * (floor - wordTop)) / blockOf(size));
  }
  const capH = size * 0.86;
  const gap = size * 0.1;
  const wordBottom = wordTop + blockOf(size);

  // ---- small print ----
  const score = scoreOf(data, " - ");
  const comp = competitionOf(data);
  const round = roundOf(data).split("·").slice(1).join("·").trim();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = (data.toClub ?? data.club)?.name ?? "";
  const facts = content.stats.filter((s) => s.value && Number(s.value) !== 0 && !/-/.test(s.value)).slice(0, 2);
  let corner: string[];
  let midL: string;
  let midR: string;
  let crests: string[];
  if (postType === "matchday") {
    corner = [...wrap((content.venue ?? data.club?.stadium ?? "").toUpperCase(), 18), [content.date, content.time].filter(Boolean).join(" · ").toUpperCase()].filter(Boolean);
    midL = comp;
    midR = content.homeTeam && content.awayTeam ? `${content.homeTeam} VS ${content.awayTeam}`.toUpperCase() : "";
    crests = crestsOf(data);
  } else if (postType === "result") {
    corner = [comp, round].filter(Boolean);
    midL = "FULL TIME";
    midR = score && content.homeTeam && content.awayTeam ? `${content.homeTeam} ${score} ${content.awayTeam}`.toUpperCase() : name;
    crests = crestsOf(data);
  } else if (postType === "transfer") {
    corner = [club.toUpperCase(), content.subline.toUpperCase()].filter((t, i, a) => t && a.indexOf(t) === i);
    midL = name;
    midR = data.fromClub ? `FROM ${data.fromClub.name}`.toUpperCase() : [data.player.number ? `#${data.player.number}` : "", data.player.position].filter(Boolean).join(" · ").toUpperCase();
    crests = [data.fromClub?.crestUrl, (data.toClub ?? data.club)?.crestUrl].filter(Boolean) as string[];
  } else {
    corner = [club.toUpperCase(), content.subline.toUpperCase()].filter(Boolean);
    midL = name;
    midR = facts.map((f) => `${f.value} ${f.label}`).join(" · ").toUpperCase();
    crests = [data.club?.crestUrl].filter(Boolean) as string[];
  }

  // The flanking labels sit at jaw level: they only get the room left and right of the face.
  const midY = wordTop - 48;
  const onFace = midY < chin + 6;
  // Beside the face (jaw level), or beside his shoulders when the labels sit lower.
  const half = onFace ? fW * 0.62 : fW * 1.7;
  const roomL = Math.min(440, faceCx - half - 20 - 64);
  const roomR = Math.min(440, CANVAS_W - 64 - (faceCx + half + 20));
  const fit = (t: string, room: number, max: number) => Math.min(max, room / Math.max(1, [...t].length * 0.62));
  const small: CSSProperties = { fontFamily: SANS, fontWeight: 700, color: WHITE, letterSpacing: "0.02em", whiteSpace: "nowrap", lineHeight: 1.25, textShadow: "0 1px 10px rgba(0,0,0,.18)" };
  const showL = !!midL && fit(midL, roomL, 30) >= 20;
  const showR = !!midR && fit(midR, roomR, 24) >= 17;
  // Whatever doesn't fit beside the chin joins the corner caps.
  for (const t of [!showL ? midL : "", !showR ? midR : ""]) if (t && corner.length < 4) corner.push(t);

  corner = corner.flatMap((t) => wrap(t, 28, 2)).slice(0, 5);
  const crestSize = Math.max(70, Math.min(crests.length > 1 ? 116 : 130, 1350 - 44 - 26 - 30 - (wordBottom + 40)));
  const crestTop = wordBottom + 40;
  const wornMask = `${WORN}, ${SCUFF}`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: WHITE }}>
      <Paper color={bg} strength={1.3} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay" }} />
      {/* Studio light: a soft lift behind the head. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${faceCx / 10.8}% 30%, rgba(255,255,255,.14), transparent 70%)`, mixBlendMode: "soft-light" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 30px 60px rgba(0,0,0,.35))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              ...box,
              maxWidth: "none",
              ...(data.photoIsCutout ? cutMask(data.cut) : {}),
              filter: `contrast(1.06) saturate(1.04)${mag > 3 ? ` blur(${Math.min(1.2, (mag - 3) * 0.6).toFixed(2)}px)` : ""}`,
              ...(data.photoIsCutout
                ? {}
                : {
                    WebkitMaskImage: `radial-gradient(${Math.round(fW * 1.6)}px ${Math.round(faceH * 2.2)}px at ${Math.round(faceCx - box.left)}px ${Math.round(chin - box.top - faceH * 0.3)}px, #000 55%, transparent 100%)`,
                    maskImage: `radial-gradient(${Math.round(fW * 1.6)}px ${Math.round(faceH * 2.2)}px at ${Math.round(faceCx - box.left)}px ${Math.round(chin - box.top - faceH * 0.3)}px, #000 55%, transparent 100%)`,
                  }),
            }}
          />
        </div>
      )}
      {/* The lower portrait sinks into the club colour, so the white word and small print hold on a white kit. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop - 90, bottom: 0, background: `linear-gradient(to bottom, ${bg}00, ${bg}66 ${Math.round(blockOf(size) * 0.7 + 90)}px, ${bg}b3)`, pointerEvents: "none" }} />
      {/* Grain over the portrait too: it holds a large enlargement together. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: mag > 2.6 ? 0.26 : 0.14, mixBlendMode: "overlay", pointerEvents: "none" }} />

      {/* Corner caps. */}
      <div style={{ position: "absolute", top: 64, [flip ? "right" : "left"]: 64, textAlign: flip ? "right" : "left", ...small, fontSize: Math.min(22, ...corner.map((t) => fit(t, 360, 22))) }}>
        {corner.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
      </div>

      {/* Either side of the chin. */}
      {showL && <div style={{ position: "absolute", top: midY - 14, [flip ? "right" : "left"]: 64, ...small, fontWeight: 800, fontSize: fit(midL, roomL, 30), letterSpacing: "0" }}>{midL}</div>}
      {showR && <div style={{ position: "absolute", top: midY - 10, [flip ? "left" : "right"]: 64, ...small, fontWeight: 600, fontSize: fit(midR, roomR, 24) }}>{midR}</div>}

      {/* The massive worn word. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: wordTop - size * 0.065,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: `${capH + gap}px`,
          letterSpacing: "-0.005em",
          color: WHITE,
          whiteSpace: "nowrap",
          WebkitMaskImage: wornMask,
          maskImage: wornMask,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          filter: "drop-shadow(0 4px 22px rgba(0,0,0,.3))",
        } as CSSProperties}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ height: capH + gap, lineHeight: 1 }}>
            {l}
          </div>
        ))}
      </div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, display: "flex", justifyContent: "center", gap: 44 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.35))" }} />
          ))}
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
        <div style={{ ...small, fontSize: 14, fontWeight: 600, letterSpacing: "0.08em" }}>POWERED BY</div>
        <AgencyLogo data={data} height={26} />
      </div>
      <Film strength={0.9} />
    </div>
  );
}
