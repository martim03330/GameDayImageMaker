/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { bounceProfile } from "./bounce";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Inter 800 (≈ the 700/900 mean) / 400: advance widths per 100px (measured in the browser). */
const I800: Record<string, number> = { A: 77.1, B: 66.5, C: 74.4, D: 72.3, E: 61, F: 58.6, G: 75.3, H: 74.9, I: 28.6, J: 59, K: 73.9, L: 56.5, M: 94.4, N: 76.6, O: 77.3, P: 65.2, Q: 78.2, R: 66.3, S: 66.1, T: 67.8, U: 72.7, V: 77.1, W: 106, X: 76.2, Y: 75.3, Z: 67.9, " ": 21.8, "-": 47.2, "'": 35.6, "!": 36 };
const I400: Record<string, number> = { a: 56.2, b: 61.2, c: 57.1, d: 61.2, e: 58.3, f: 37, g: 61.3, h: 59.1, i: 24.2, j: 24.2, k: 54.9, l: 24.2, m: 87.6, n: 59.1, o: 60, p: 61.2, q: 61.2, r: 37.6, s: 52.8, t: 32.7, u: 59.1, v: 56.2, w: 81.8, x: 54.6, y: 56.2, z: 55.2, A: 69, B: 65.4, C: 73, D: 72.2, E: 60.1, F: 59, G: 74.6, H: 74.3, I: 26.9, J: 57.1, K: 67.2, L: 56.5, M: 90.3, N: 75.3, O: 76.5, P: 63.9, Q: 76.5, R: 64.4, S: 64.2, T: 64.6, U: 74.4, V: 69, W: 98.5, X: 68.2, Y: 67.9, Z: 62.9, " ": 28.1, "-": 46, "'": 30, "·": 28.8 };
const base = (c: string) => c.normalize("NFD").replace(/\p{M}/gu, "");
const adv = (c: string, table: Record<string, number>) => (table[base(c)] ?? (/\d/.test(c) ? 62 : 64)) / 100;
const em = (t: string, table: Record<string, number>) => [...t].reduce((a, c) => a + adv(c, table), 0);
const TRACK = -0.01;

/**
 * Goal bounce: the goal sibling of `bounce`. "GOAL" (or the kicker) in Inter ExtraBold, each letter lifted
 * so the word traces a ball's bounce — dropping from the first letter, hopping lower to the right — and the
 * last hop falls into the corner of a goal drawn with a few hairlines: post, crossbar, the side netting and
 * a faint mesh, the ball (a small white dot) resting in the net. Deep club-tone ground, the celebrating
 * player big beneath; at the foot only his name, the fixture (home first, no score) and the competition.
 */
export function Goalbounce({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const club = clubTone(data);
  const ground = shade(club, -0.66);
  const lift = shade(club, -0.38);
  const f = matchFacts(data);

  /* ---- the bouncing word and the goal ---- */
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const chars = [...word];
  const M = story ? 72 : 76;
  const goalEm = 1.15; // from the last letter to the canvas edge: the hop into the net and the goal mouth
  const wordEm = em(word, I800) + TRACK * (chars.length - 1);
  const size = Math.min((story ? 250 : 196) * ts, (CANVAS_W - M - 20) / (wordEm + goalEm));
  const A = size * (story ? 1.25 : 1.05);
  const capH = size * 0.727;
  const top = (story ? STORY_TOP : 88) + (params.textY ?? 0);
  const floor = top + capH + A; // the lowest baseline = the goal line
  const xs: { c: string; x: number; w: number }[] = [];
  let cx = M - size * 0.04;
  for (const c of chars) {
    const w = adv(c, I800) * size;
    xs.push({ c, x: cx, w });
    cx += w + TRACK * size;
  }
  const first = xs[0];
  const last = xs[xs.length - 1];
  const postX = last.x + last.w + size * 0.34; // the near post
  const ballX = postX + size * 0.42;
  const barY = floor - size * 0.92; // the crossbar
  const hops = chars.length > 6 ? 3 : 2;
  const { h } = bounceProfile(first.x + first.w / 2, ballX, hops);
  const yOf = (x: number) => floor - A * h(x);
  const dotOff = size * 0.1;
  const ballR = Math.max(9, size * 0.07);
  const pts: string[] = [];
  for (let x = first.x + first.w / 2; x <= ballX; x += 3) pts.push(`${x.toFixed(1)},${Math.min(floor + dotOff - ballR, yOf(x) + dotOff).toFixed(1)}`);
  const netBottom = floor + dotOff; // the grass line inside the goal
  const mesh = size * 0.17;
  const meshLines: string[] = [];
  for (let x = postX + mesh; x < CANVAS_W + mesh; x += mesh) meshLines.push(`M${x.toFixed(1)} ${barY} V${netBottom}`);
  for (let y = barY + mesh; y < netBottom; y += mesh) meshLines.push(`M${postX} ${y.toFixed(1)} H${CANVAS_W}`);

  /* ---- the foot, measured up from the logo ---- */
  const logoAsk = story ? 26 : 20;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsk * 2) * 1.7)) : Math.max(52, logoAsk * 2);
  const logoBottom = story ? H - STORY_BOTTOM : 48;
  const logoTop = H - logoBottom - logoH;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const fixture = teamsOf(data).join("  v  ");
  const comp = titleCase(f.comp || f.round || "").trim();
  const span = CANVAS_W - 2 * 72;
  const nameSize = Math.max(20, Math.min(32 * S, span / Math.max(1, em(name, I400) * 1.04))) * ts;
  const fixSize = Math.max(15, Math.min(21 * S, span / Math.max(1, em(fixture, I400)))) * ts;
  const compSize = Math.max(10, Math.min(12.5 * S, span / Math.max(1, comp.length * 0.62 * 1.3)));
  const infoH = (name ? nameSize * 1.2 : 0) + (fixture ? 8 * S + fixSize * 1.3 : 0) + (comp ? 12 * S + compSize * 1.2 : 0);
  const infoTop = logoTop - (story ? 64 : 58) - infoH;

  /* ---- the player, big and centred under the word ---- */
  const sizes = story ? { chest: 340, waist: 270, knees: 212, full: 166 } : { chest: 250, waist: 200, knees: 156, full: 122 };
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  let box = placeByFace(data, faceX, story ? 640 : 460, sizes);
  const clear = floor + (story ? 56 : 40) + box.faceH * 0.6;
  box = placeByFace(data, faceX, Math.max(clear, story ? 560 : 400), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCy = box.top + (face[1] + face[3] / 2) * box.height;
  const fadeTo = infoTop - 24 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 320 : 240)}px, transparent ${fadeTo}px)`;

  const soft: CSSProperties = { fontFamily: SANS, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.2, color: "rgba(255,255,255,.7)" };
  const hair = story ? 2.4 : 2;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${(faceX / CANVAS_W) * 100}% ${(fCy / H) * 100}%, ${lift}, ${ground} 80%)` }} />

      {/* The player, natural colour, melting into the ground above the foot. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: fCy, width: box.width * 0.64, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.25)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The goal corner (hairlines), the dotted flight, the letters riding it, the ball in the net. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id="goalbounce-net" x1={postX} x2={CANVAS_W} y1={0} y2={0} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity={1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.15} />
          </linearGradient>
          <mask id="goalbounce-fade" maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={H}>
            <rect x={postX - 10} y={barY - 10} width={CANVAS_W - postX + 20} height={netBottom - barY + 20} fill="url(#goalbounce-net)" />
          </mask>
        </defs>
        <g mask="url(#goalbounce-fade)">
          <path d={meshLines.join(" ")} stroke="rgba(255,255,255,.16)" strokeWidth={1} fill="none" />
          <path d={`M${postX} ${netBottom} H${CANVAS_W + 4}`} stroke="rgba(255,255,255,.45)" strokeWidth={hair * 0.6} fill="none" />
          <path d={`M${postX} ${barY} H${CANVAS_W + 4}`} stroke="rgba(255,255,255,.92)" strokeWidth={hair * 1.3} fill="none" />
        </g>
        <path d={`M${postX} ${netBottom} V${barY}`} stroke="rgba(255,255,255,.92)" strokeWidth={hair * 1.3} fill="none" strokeLinecap="square" />
        <polyline points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={story ? 3.4 : 2.8} strokeLinecap="round" strokeDasharray={`0 ${story ? 12 : 10}`} />
        <circle cx={ballX} cy={netBottom - ballR - hair} r={ballR} fill={WHITE} />
        <g style={{ filter: "drop-shadow(0 3px 18px rgba(0,0,0,.28))" }}>
          {xs.map(({ c, x, w }, i) =>
            c === " " ? null : (
              <text key={i} x={x + w / 2} y={yOf(x + w / 2)} textAnchor="middle" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={800} fontSize={size} fill={WHITE} letterSpacing={0}>
                {c}
              </text>
            ),
          )}
        </g>
      </svg>

      {/* The foot: name, fixture, competition. */}
      <div style={{ position: "absolute", left: 56, right: 56, top: infoTop, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 2px 12px rgba(0,0,0,.3)" }}>
        {name && <div style={{ ...soft, fontWeight: 600, fontSize: nameSize, color: WHITE, letterSpacing: "-0.01em" }}>{name}</div>}
        {fixture && <div style={{ ...soft, fontWeight: 300, fontSize: fixSize, lineHeight: 1.3, marginTop: 8 * S }}>{fixture}</div>}
        {comp && <div style={{ ...soft, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", marginTop: 12 * S, color: "rgba(255,255,255,.52)" }}>{comp}</div>}
      </div>

      <AgencyLogo data={data} height={logoAsk} style={{ position: "absolute", left: "50%", bottom: logoBottom - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
