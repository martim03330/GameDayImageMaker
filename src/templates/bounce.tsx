/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#efede8";
const INK = "#16171b";
const GREY = "rgba(22,23,27,.56)";

/** Inter 700 / 400: advance widths per 100px (measured in the browser). */
const I700: Record<string, number> = { a: 58.1, b: 63, c: 58.8, d: 63, e: 59.6, f: 39.8, g: 63.2, h: 62.3, i: 27.1, j: 27.1, k: 58, l: 27.1, m: 91.2, n: 62.2, o: 61.3, p: 63, q: 63, r: 40.7, s: 56, t: 36.6, u: 62.3, v: 60, w: 85, x: 58, y: 60.2, z: 57.3, A: 74.7, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 74.7, W: 103.8, X: 73.8, Y: 73.1, Z: 66.4, " ": 23.7, "-": 46.8, "'": 33.9, "!": 33.8 };
const I400: Record<string, number> = { a: 56.2, b: 61.2, c: 57.1, d: 61.2, e: 58.3, f: 37, g: 61.3, h: 59.1, i: 24.2, j: 24.2, k: 54.9, l: 24.2, m: 87.6, n: 59.1, o: 60, p: 61.2, q: 61.2, r: 37.6, s: 52.8, t: 32.7, u: 59.1, v: 56.2, w: 81.8, x: 54.6, y: 56.2, z: 55.2, A: 69, B: 65.4, C: 73, D: 72.2, E: 60.1, F: 59, G: 74.6, H: 74.3, I: 26.9, J: 57.1, K: 67.2, L: 56.5, M: 90.3, N: 75.3, O: 76.5, P: 63.9, Q: 76.5, R: 64.4, S: 64.2, T: 64.6, U: 74.4, V: 69, W: 98.5, X: 68.2, Y: 67.9, Z: 62.9, " ": 28.1, "-": 46, "'": 30, "·": 28.8 };
const base = (c: string) => c.normalize("NFD").replace(/\p{M}/gu, "");
const adv = (c: string, table: Record<string, number>) => (table[base(c)] ?? (/\d/.test(c) ? 62 : 60)) / 100;
const em = (t: string, table: Record<string, number>) => [...t].reduce((a, c) => a + adv(c, table), 0);
const TRACK = -0.02;

/**
 * A ball's bounce as a height profile: it drops from its apex at `xa`, then hops ever lower (each hop half
 * the height, hop length ∝ √height, as a real ball), touching the ground the last time at `xb`.
 * Returns h(x) ∈ [0, 1] (1 = the apex) and the contact points.
 */
export function bounceProfile(xa: number, xb: number, hops: number) {
  const heights = Array.from({ length: hops }, (_, i) => 0.5 ** (i + 1));
  const units = 0.5 + heights.reduce((a, h) => a + Math.sqrt(h), 0);
  const k = (xb - xa) / units;
  const contacts = [xa + 0.5 * k];
  heights.forEach((h) => contacts.push(contacts[contacts.length - 1] + Math.sqrt(h) * k));
  const h = (x: number) => {
    if (x <= contacts[0]) return Math.max(0, 1 - ((x - xa) / (0.5 * k)) ** 2);
    for (let i = 0; i < hops; i++) {
      const a = contacts[i];
      const b = contacts[i + 1];
      if (x <= b) {
        const m = (a + b) / 2;
        return heights[i] * Math.max(0, 1 - ((x - m) / ((b - a) / 2)) ** 2);
      }
    }
    return 0;
  };
  return { h, contacts };
}

/**
 * Bounce: one idea — the letters of "Matchday" (Inter Bold) each lifted so together they trace a ball's
 * bounce, falling from the first letter and hopping ever lower to the right, a dotted trajectory riding
 * under them and the ball itself (a small club-colour dot) landing after the last letter. Pale paper
 * ground, the player big and centred beneath, melting into the paper above a quiet centred foot:
 * fixture (home first), date · kick-off, ground, then the agency mark.
 */
export function Bounce({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ball = clubTone(data);
  const f = matchFacts(data);

  /* ---- the bouncing word ---- */
  const word = sentenceCase(content.kicker || "Matchday");
  const chars = [...word];
  const M = story ? 80 : 84;
  const ballGap = 0.5; // ems between the last letter and the ball
  const wordEm = em(word, I700) + TRACK * (chars.length - 1);
  const size = Math.min((story ? 190 : 150) * ts, (CANVAS_W - 2 * M - 40) / (wordEm + ballGap + 0.1));
  const A = size * (story ? 1.55 : 1.3); // the drop, apex to ground
  const capH = size * 0.73;
  const top = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const ground = top + capH + A; // the lowest baseline
  const startX = M + (CANVAS_W - 2 * M - (wordEm + ballGap) * size) / 2;
  const xs: { c: string; x: number; w: number }[] = [];
  let cx = startX;
  for (const c of chars) {
    const w = adv(c, I700) * size;
    xs.push({ c, x: cx, w });
    cx += w + TRACK * size;
  }
  const first = xs[0];
  const last = xs[xs.length - 1];
  const ballX = last.x + last.w + ballGap * size;
  const hops = chars.length > 9 ? 4 : 3;
  const { h } = bounceProfile(first.x + first.w / 2, ballX, hops);
  const yOf = (x: number) => ground - A * h(x);
  const dotOff = size * 0.12; // the trajectory rides just under the baselines
  const pts: string[] = [];
  for (let x = first.x + first.w / 2; x <= ballX; x += 3) pts.push(`${x.toFixed(1)},${(yOf(x) + dotOff).toFixed(1)}`);
  const ballR = Math.max(9, size * 0.075);

  /* ---- the foot, measured up from the logo ---- */
  const logoAsk = story ? 26 : 20;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsk * 2) * 1.7)) : Math.max(52, logoAsk * 2);
  const logoBottom = story ? H - STORY_BOTTOM : 48;
  const logoTop = H - logoBottom - logoH;
  const fixture = teamsOf(data).join("  v  ");
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const venue = titleCase(f.venue);
  const span = CANVAS_W - 2 * 72;
  const fixSize = Math.max(18, Math.min(30 * S, span / Math.max(1, em(fixture, I400) * 1.02))) * ts;
  const whenSize = Math.max(15, Math.min(21 * S, span / Math.max(1, em(when, I400)))) * ts;
  const venueSize = Math.max(13, Math.min(17 * S, span / Math.max(1, em(venue, I400)))) * ts;
  const infoH = (fixture ? fixSize * 1.25 : 0) + (when ? 10 * S + whenSize * 1.25 : 0) + (venue ? 6 * S + venueSize * 1.25 : 0);
  const infoTop = logoTop - (story ? 64 : 60) - infoH;

  /* ---- the player, centred under the word ---- */
  // His head (hair included, ~0.6 face-heights above the face box) stays clear of the lowest letters' descenders.
  const sizes = story ? { chest: 330, waist: 262, knees: 206, full: 160 } : { chest: 240, waist: 196, knees: 152, full: 118 };
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  let box = placeByFace(data, faceX, story ? 640 : 470, sizes);
  const clear = ground + size * 0.24 + (story ? 50 : 36) + box.faceH * 0.6;
  box = placeByFace(data, faceX, Math.max(clear, story ? 600 : 440), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCy = box.top + (face[1] + face[3] / 2) * box.height;
  const fadeTo = infoTop - 30 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 300 : 220)}px, transparent ${fadeTo}px)`;

  const line: CSSProperties = { fontFamily: SANS, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 46% at 50% ${(fCy / H) * 100}%, #f8f7f3, ${PAPER} 76%)` }} />

      {/* The player, natural colour, melting into the paper above the foot. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: fCy + box.faceH, width: box.width * 0.6, height: box.faceH * 4, borderRadius: "50%", background: "rgba(0,0,0,.07)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The bounce: dotted trajectory, the letters riding it, the ball at the end. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <polyline points={pts.join(" ")} fill="none" stroke="rgba(22,23,27,.34)" strokeWidth={story ? 3.2 : 2.6} strokeLinecap="round" strokeDasharray={`0 ${story ? 11 : 9}`} />
        <circle cx={ballX} cy={yOf(ballX) + dotOff - ballR} r={ballR} fill={ball} />
        {xs.map(({ c, x, w }, i) =>
          c === " " ? null : (
            <text key={i} x={x + w / 2} y={yOf(x + w / 2)} textAnchor="middle" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={700} fontSize={size} fill={INK}>
              {c}
            </text>
          ),
        )}
      </svg>

      {/* The foot: fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", left: 56, right: 56, top: infoTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {fixture && <div style={{ ...line, fontWeight: 600, fontSize: fixSize, letterSpacing: "-0.01em", color: INK }}>{fixture}</div>}
        {when && <div style={{ ...line, fontWeight: 400, fontSize: whenSize, color: INK, marginTop: 10 * S }}>{when}</div>}
        {venue && <div style={{ ...line, fontWeight: 400, fontSize: venueSize, color: GREY, marginTop: 6 * S }}>{venue}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={logoAsk}
        onLight
        style={{ position: "absolute", left: "50%", bottom: logoBottom - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
