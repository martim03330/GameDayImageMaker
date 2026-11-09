/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** Inter 900 / 400: advance widths per 100px (measured in the browser). The ladder is fitted on its heaviest rung. */
const I900: Record<string, number> = { a: 59.7, b: 64.6, c: 60.3, d: 64.6, e: 60.6, f: 42.2, g: 64.7, h: 64.9, i: 29.6, j: 29.6, k: 60.6, l: 29.6, m: 94.3, n: 64.9, o: 62.5, p: 64.6, q: 64.6, r: 43.4, s: 58.8, t: 39.9, u: 64.9, v: 63.2, w: 87.7, x: 60.9, y: 63.6, z: 59, A: 79.5, B: 66.8, C: 74.8, D: 72.3, E: 61.3, F: 58.4, G: 75.4, H: 75, I: 29.1, J: 59.6, K: 75.9, L: 56.5, M: 95.6, N: 77, O: 77.5, P: 65.6, Q: 78.7, R: 66.8, S: 66.6, T: 68.7, U: 72.2, V: 79.5, W: 108.2, X: 78.6, Y: 77.5, Z: 69.4, " ": 19.9, "-": 47.5, "'": 37.2, "!": 38.1 };
const I400: Record<string, number> = { a: 56.2, b: 61.2, c: 57.1, d: 61.2, e: 58.3, f: 37, g: 61.3, h: 59.1, i: 24.2, j: 24.2, k: 54.9, l: 24.2, m: 87.6, n: 59.1, o: 60, p: 61.2, q: 61.2, r: 37.6, s: 52.8, t: 32.7, u: 59.1, v: 56.2, w: 81.8, x: 54.6, y: 56.2, z: 55.2, A: 69, B: 65.4, C: 73, D: 72.2, E: 60.1, F: 59, G: 74.6, H: 74.3, I: 26.9, J: 57.1, K: 67.2, L: 56.5, M: 90.3, N: 75.3, O: 76.5, P: 63.9, Q: 76.5, R: 64.4, S: 64.2, T: 64.6, U: 74.4, V: 69, W: 98.5, X: 68.2, Y: 67.9, Z: 62.9, " ": 28.1, "-": 46, "'": 30, "!": 28.8, "·": 28.8 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const em = (t: string, table: Record<string, number>, track = 0) => plain(t).reduce((a, c) => a + (table[c] ?? 62) / 100 + track, 0);

/** The four rungs of the ladder: Thin → Regular → Bold → Black. */
const RUNGS = [100, 400, 700, 900] as const;
const TRACK = -0.035;

/**
 * Goal weights: the word "Goal" set four times, same size, stacked flush-left, each rung a heavier Inter
 * (100 → 400 → 700 → 900) — a type-weight ladder building up to the goal, the last rung in solid white.
 * The celebrating player big on the other side of a dark club-tone ground; under the ladder only his
 * name, the fixture (home first, exact names, no score) and the competition, then the agency mark.
 */
export function Goalweights({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const right = params.side !== "left"; // the player's side

  const club = clubTone(data);
  const ground = shade(club, -0.74);
  const lift = shade(club, -0.5);
  const f = matchFacts(data);

  /* ---- the foot, measured up from the logo ---- */
  const logoAsk = story ? 26 : 20;
  const postLogo = Math.max(52, Math.round(logoAsk * 2));
  const logoH = story ? Math.max(88, Math.round(postLogo * 1.7)) : postLogo;
  const logoBottom = story ? H - STORY_BOTTOM : 56;
  const logoTop = H - logoBottom - logoH;
  const colW = story ? 540 : 500;
  const tx = right ? M : CANVAS_W - M - colW;
  const align = right ? "left" : "right";

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const fixture = teamsOf(data).join(" v ");
  const comp = titleCase(f.comp || f.round || "").trim();
  const nameSize = Math.max(22, Math.min(34 * S, colW / Math.max(1, em(name, I400) * 1.04))) * ts;
  const fixSize = Math.max(15, Math.min(22 * S, colW / Math.max(1, em(fixture, I400)))) * ts;
  const compSize = Math.max(10, Math.min(12.5 * S, colW / Math.max(1, comp.length * 0.62 * 1.3)));
  const gap = story ? 64 : 60;
  const infoH = (name ? nameSize * 1.15 + 10 * S : 0) + (fixture ? fixSize * 1.3 : 0) + (comp ? 14 * S + compSize * 1.2 : 0);
  const infoTop = logoTop - gap - infoH;

  /* ---- the ladder ---- */
  const word = sentenceCase(content.kicker || "Goal");
  const wordEm = em(word, I900, TRACK);
  const maxW = colW + (wordEm > 3.2 ? 120 : 0);
  const size = Math.min((story ? 262 : 214) * ts, maxW / Math.max(1, wordEm));
  const lead = size * 0.9;
  const ladderH = lead * 4;
  const top0 = story ? STORY_TOP : 96;
  const ladderTop = Math.max(top0, infoTop - (story ? 120 : 64) - ladderH) + (params.textY ?? 0) - size * 0.1;

  /* ---- the player, big, on the other side ---- */
  const faceX = right ? (story ? 740 : 750) : story ? 340 : 330;
  let box = placeByFace(data, faceX, story ? 420 : 250, story ? { chest: 320, waist: 260, knees: 205, full: 165 } : { chest: 270, waist: 214, knees: 168, full: 130 });
  const fadeFrom = (story ? 1440 : 1080) - box.top;
  const fadeTo = H - (story ? 120 : 30) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, transparent ${fadeTo}px)`;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // Keep the ladder readable: slide him outwards until his shoulders clear the longest rung, but never so
  // far that his head leaves the frame (the head itself must always clear the ladder).
  {
    const ladderW = wordEm * size;
    const edge = right ? tx + ladderW : tx + colW - ladderW;
    const fCx = box.left + (face[0] + face[2] / 2) * box.width;
    const fW = face[2] * box.width;
    const want = right ? Math.max(0, edge + 10 - (fCx - fW * 1.25)) : Math.max(0, fCx + fW * 1.25 - (edge - 10));
    const head = right ? Math.max(0, edge + 30 - (fCx - fW * 0.75)) : Math.max(0, fCx + fW * 0.75 - (edge - 30));
    const room = right ? CANVAS_W - 40 - (fCx + fW * 0.9) : fCx - fW * 0.9 - 40;
    const push = Math.max(head, Math.min(want, room));
    box = { ...box, left: box.left + (right ? push : -push) };
  }
  const fCy = box.top + (face[1] + face[3] / 2) * box.height;

  const soft: CSSProperties = { fontFamily: SANS, whiteSpace: "nowrap", color: "rgba(255,255,255,.66)", lineHeight: 1.2 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 46% at ${(faceX / CANVAS_W) * 100}% ${(fCy / H) * 100}%, ${lift}, ${ground} 78%)` }} />

      {/* The player, natural colour, melting into the ground at the foot; a soft shade behind instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: fCy, width: box.width * 0.7, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The ladder: four rungs of the same word, thin to black — in front of him (his head always clear of it). */}
      <div style={{ position: "absolute", left: tx, top: ladderTop, width: colW, textAlign: align, fontFamily: SANS, fontSize: size, lineHeight: `${lead}px`, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", textShadow: "0 2px 18px rgba(0,0,0,.18)" }}>
        {RUNGS.map((w, i) => (
          <div key={w} style={{ fontWeight: w, color: i === 3 ? WHITE : `rgba(255,255,255,${[0.42, 0.56, 0.72][i]})`, marginLeft: right ? -size * 0.06 : 0, marginRight: right ? 0 : -size * 0.02 }}>
            {word}
          </div>
        ))}
      </div>

      {/* Name, fixture, competition — small, on the ladder's edge. */}
      <div style={{ position: "absolute", left: tx, top: infoTop, width: colW, textAlign: align }}>
        {name && <div style={{ ...soft, fontWeight: 600, fontSize: nameSize, lineHeight: 1.15, color: WHITE, letterSpacing: "-0.01em", marginBottom: 10 * S }}>{name}</div>}
        {fixture && <div style={{ ...soft, fontWeight: 300, fontSize: fixSize, lineHeight: 1.3 }}>{fixture}</div>}
        {comp && <div style={{ ...soft, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 14 * S, color: "rgba(255,255,255,.5)" }}>{comp}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={logoAsk}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
