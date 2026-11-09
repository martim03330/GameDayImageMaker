/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { placeFree } from "./fadeword";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 600: advance widths per 100px (measured in the browser). */
const I600: Record<string, number> = { a: 57.4, b: 62.4, c: 58.3, d: 62.4, e: 59.2, f: 38.9, g: 62.6, h: 61.2, i: 26.2, j: 26.2, k: 57, l: 26.2, m: 90, n: 61.2, o: 60.9, p: 62.4, q: 62.4, r: 39.7, s: 55, t: 35.3, u: 61.2, v: 58.7, w: 84, x: 56.9, y: 58.9, z: 56.6, A: 72.8, B: 65.9, C: 73.7, D: 72.2, E: 60.5, F: 58.8, G: 74.9, H: 74.6, I: 27.7, J: 58, K: 70.3, L: 56.5, M: 92.2, N: 75.9, O: 76.9, P: 64.5, Q: 77.3, R: 65.2, S: 65, T: 66, U: 73.6, V: 72.8, W: 102, X: 72, Y: 71.4, Z: 65.3, " ": 25.2, "-": 46.5, "'": 32.6, "!": 32.1 };
const w600 = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (I600[c] ?? (/\d/.test(c) ? 64 : 62)) / 100, 0);

const INK = "#15171c";
const GROUND = "#efece6";
/** The tracking of each line, in em: a tracking test, tight to wide. */
const STEPS = [-0.04, 0.1, 0.3, 0.6];

/**
 * Tracking: a type-specimen idea. The title ("Matchday") set four times in Inter Semi Bold, same size, flush
 * left on the free side, its letter-spacing opening up line by line (−0.04 → 0.1 → 0.3 → 0.6 em) like a
 * tracking test — the last, widest line in the club colour. Under it only the fixture (home first, names as
 * stored), date · kick-off and the ground, then the logo. The player sharp on the other side of a pale
 * ground (flips with params.side); the competition in tiny caps at the top.
 */
export function Tracking({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const M = 64;
  const right = params.side !== "left";
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the player, on his side ---- */
  const FRAME = story ? { chest: 236, waist: 196, knees: 160, full: 128 } : { chest: 186, waist: 150, knees: 122, full: 98 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const box = placeFree(data, right ? (story ? 850 : 812) : story ? 230 : 268, story ? 420 : 230, faceH0, H + 30);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;

  /* ---- the foot, from the logo up ---- */
  const colW = story ? 570 : 530;
  const fixture = teamsOf(data).join(" v ");
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const venue = titleCase(f.venue);
  const fixSize = Math.max(17 * k, Math.min(25 * k, colW / Math.max(1, [...fixture].length * 0.58))) * ts;
  const lineSize = Math.max(14 * k, Math.min(18 * k, colW / Math.max(1, [...venue].length * 0.52))) * ts;
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 52;
  const logoTop = H - logoBottom - logoH;
  const facts = [when, venue].filter(Boolean);
  const factsH = facts.length * lineSize * 1.35;
  const factsTop = logoTop - (story ? 66 : 56) - factsH;
  const fixTop = factsTop - (story ? 12 : 8) - fixSize * 1.25;

  /* ---- the specimen: four lines, same size, tracking opening up ---- */
  const word = sentenceCase(content.kicker || "Matchday");
  const n = [...word].length;
  const lastEm = w600(word) + STEPS[3] * (n - 1);
  const size = Math.min(story ? 92 : 80, colW / Math.max(1, lastEm)) * ts;
  const lh = 1.08;
  const blockH = size * lh * STEPS.length;
  const blockTop = fixTop - (story ? 64 : 48) - blockH + (params.textY ?? 0);

  /* ---- the competition, tiny, at the top of the column ---- */
  const comp = titleCase(f.comp || f.round || "").trim();
  const compSize = Math.max(11, Math.min(13 * k, colW / Math.max(1, [...comp].length * 0.98)));

  // Whatever of him reaches into the type column (a flung arm, a kicking leg) dissolves before it.
  const edge = right ? M + colW + 10 - box.left : CANVAS_W - M - colW - 10 - box.left;
  const across = right
    ? `linear-gradient(to right, transparent 0, transparent ${edge}px, #000 ${edge + 200}px)`
    : `linear-gradient(to left, transparent 0, transparent ${box.width - edge}px, #000 ${box.width - edge + 200}px)`;
  // …but only level with the type: above it he stays whole.
  const above = `linear-gradient(to bottom, #000 0, #000 ${blockTop - 300 - box.top}px, transparent ${blockTop - 20 - box.top}px)`;
  const keepOut = `${above}, ${across}`;

  const side: CSSProperties = right ? { left: M, textAlign: "left" } : { left: CANVAS_W - M - colW, width: colW, textAlign: "right" };
  const small: CSSProperties = { position: "absolute", ...side, fontFamily: SANS, color: INK, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 50% at ${(faceCx / CANVAS_W) * 100}% 40%, #faf8f4, ${GROUND} 70%, ${shade(GROUND, -0.05)} 100%)` }} />

      {/* The player, sharp, natural colour; a soft shade beside him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: box.top + box.faceH * 2, width: box.width * 0.6, height: H, borderRadius: "50%", background: "rgba(40,36,30,.10)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: keepOut, maskImage: keepOut, WebkitMaskComposite: "source-over", maskComposite: "add" }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {comp && <div style={{ ...small, top: story ? STORY_TOP : M, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(21,23,28,.55)", ...(right ? {} : { marginRight: "-0.3em" }) }}>{comp}</div>}

      {/* The specimen. */}
      <div style={{ position: "absolute", top: blockTop, ...side, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        {STEPS.map((t, i) => (
          <div
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: size,
              lineHeight: lh,
              letterSpacing: `${t}em`,
              // CSS tracks after the last letter too: take it back so both edges stay flush.
              marginRight: right ? 0 : `${-t}em`,
              whiteSpace: "nowrap",
              color: i === STEPS.length - 1 ? club : INK,
            }}
          >
            {word}
          </div>
        ))}
      </div>

      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 600, fontSize: fixSize, letterSpacing: "-0.01em" }}>{fixture}</div>}
      {facts.map((l, i) => (
        <div key={i} style={{ ...small, top: factsTop + i * lineSize * 1.35, fontWeight: 400, fontSize: lineSize, color: "rgba(21,23,28,.62)" }}>
          {l}
        </div>
      ))}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 20}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
