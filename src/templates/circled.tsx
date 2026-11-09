/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { interEm } from "./marker";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { longDate } from "./superscript";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1eee8";
const INK = "#16171a";
const QUIET = "rgba(22,23,26,.5)";

/* Measured in the browser (per 1px of font size). */
const INTER_ASC = 0.97;
const INTER_CONTENT = 1.21;
const INTER_CAP = 0.728;
const DM_ASC = 1.04;
const DM_CONTENT = 1.38;
const DM_CAP = 0.66;
/** DM Serif Display regular: advance widths per 100px. */
const DM_W: Record<string, number> = { a: 50.4, b: 52.6, c: 43.2, d: 53.6, e: 45, f: 31.4, g: 48.6, h: 55.4, i: 27.6, j: 26.8, k: 51.2, l: 27, m: 82.6, n: 55.6, o: 50.4, p: 53, q: 52, r: 39.4, s: 40.4, t: 32.4, u: 55, v: 48.6, w: 73.4, x: 49.6, y: 48.4, z: 43.6, " ": 22, "-": 33, "'": 25 };
const dmEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (DM_W[c] ?? 66) / 100, 0);

/**
 * One pen loop round a w×h box: a slightly wobbly, slightly tilted ellipse that starts at the upper right,
 * runs anticlockwise once round and a little past where it began, drifting outward as hands do, so the end
 * overshoots the start instead of closing neatly. Returned in the box's own coordinates (may run outside).
 */
function penLoop(w: number, h: number, seed: number): string {
  const r = rng(seed * 4099 + 7);
  const cx = w / 2;
  const cy = h / 2;
  const tilt = ((-3 - r() * 4) * Math.PI) / 180;
  const a0 = (-38 - r() * 18) * (Math.PI / 180);
  const sweep = Math.PI * 2 + 0.42 + r() * 0.18;
  const ph = r() * Math.PI * 2;
  const N = 56;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = a0 - t * sweep;
    // A gentle egg shape, a hair of wobble, and the outward drift of the second pass.
    const k = 1 + 0.03 * Math.sin(2 * a + ph) + 0.012 * Math.sin(5 * a + ph * 2) + 0.075 * t * t;
    const ex = (w / 2) * k * Math.cos(a);
    const ey = (h / 2) * k * Math.sin(a) * (1 + 0.05 * Math.cos(a));
    pts.push([cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)]);
  }
  // Catmull-Rom through the points, as cubic Béziers.
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Circled: a calm info block on pale paper — "Matchday" in DM Serif, the fixture (home first, names exactly as
 * stored), "17 October · 15:00" and the ground in small spaced caps — where the kick-off time has been circled
 * once with a pen in the club colour: one thin, slightly irregular ellipse that overshoots where it closes.
 * No handwriting, no highlighter (that's `marker`); the player big on the other side.
 */
export function Circled({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const club = clubTone(data);
  const f = matchFacts(data);
  const seed = params.seed ?? 11;

  /* ---- the words ---- */
  const title = sentenceCase(content.kicker || "Matchday");
  const [home = "", away = ""] = teamsOf(data);
  const date = longDate(content.date);
  const time = f.timeLocal || f.time;
  const venue = [((content.venue ?? "").trim() || titleCase(f.venue)).toUpperCase(), f.timePt ? `${f.timePt} ${f.timeRef || "PT"}` : ""].filter(Boolean).join(" · ");

  /* ---- sizes, fitted to the column ---- */
  const M = story ? 84 : 72;
  const colW = story ? 560 : 440;
  const k = (story ? 1.34 : 1) * ts;
  const tSize = Math.min(104 * k, colW / Math.max(0.1, dmEm(title)));
  const fixSize0 = 32 * k;
  const fixW = (t: string) => interEm(t) * 0.99;
  const fixSize = Math.min(fixSize0, colW / Math.max(0.1, fixW(home)), colW / Math.max(0.1, fixW(away ? `v ${away}` : "")));
  const dSize0 = 40 * k;
  const dateLine = [date, time].filter(Boolean).join(" · ");
  const dSize = Math.min(dSize0, (colW - 0.75 * dSize0) / Math.max(0.1, fixW(dateLine)));
  const vSize = Math.max(11, Math.min(15 * k, colW / Math.max(1, interEm(venue, 0.22))));

  /* ---- vertical rhythm: each line by its cap top, measured from the block's top ---- */
  const capTitle = DM_CAP * tSize;
  const yTitle = 0; // cap top of "Matchday"
  const yHome = yTitle + capTitle + 0.62 * tSize;
  const yAway = yHome + fixSize * 1.3;
  const yDate = (away ? yAway : yHome) + fixSize * INTER_CAP + dSize * 1.3;
  const yVenue = yDate + dSize * INTER_CAP + dSize * 1.1;
  const blockH = yVenue + (venue ? vSize * INTER_CAP : -dSize * 1.1);
  const lines = [fixW(home) * fixSize, away ? fixW(`v ${away}`) * fixSize : 0, fixW(dateLine) * dSize + dSize * 0.9, venue ? interEm(venue, 0.22) * vSize : 0, dmEm(title) * tSize];
  const blockW = Math.min(colW, Math.max(...lines));

  /* ---- the foot: logo under the block ---- */
  const logoAsked = 22;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsked * 2) * 1.7)) : Math.max(52, logoAsked * 2);
  const logoTop = H - logoBottom - logoH;
  // Post: the block sits over the logo (66px clear); story: it opens the page, the logo stays at the foot.
  const top = (story ? STORY_TOP + 10 : logoTop - 66 - blockH) + (params.textY ?? 0);
  const left = right ? M : CANVAS_W - M - blockW;
  const align: "left" | "right" = right ? "left" : "right";

  /* ---- the player, big, on his side, clear of the block ---- */
  const faceX = right ? (story ? 760 : 780) : story ? 320 : 300;
  const faceTop = story ? top + blockH - 90 : 230;
  const sizes = story ? { chest: 300, waist: 240, knees: 190, full: 150 } : { chest: 262, waist: 214, knees: 168, full: 132 };
  let box = placeByFace(data, faceX, faceTop, sizes);
  // In the post his arms come down beside the block: slide him off it (cropping at the far edge); in the
  // story the block is above his shoulders. Never so far that his head leaves the canvas.
  if (!story) {
    const clear = 30;
    const bRight = left + blockW;
    let shift = right ? Math.max(0, bRight + clear - box.left) : Math.min(0, left - clear - (box.left + box.width));
    const headR = box.faceH * 1.05;
    shift = Math.max(Math.max(-160, 40 + headR - faceX), Math.min(Math.min(160, CANVAS_W - 40 - headR - faceX), shift));
    box = { ...box, left: box.left + shift };
  }

  /* ---- the pen loop round the time ---- */
  const timeW = fixW(time) * dSize;
  const loopW = timeW + dSize * 1.0;
  const loopH = dSize * 1.62;
  const stroke = story ? 4.4 : 3.4;

  const lineBox = (size: number, asc: number, content: number, cap: number) => (size * 1.0 - content * size) / 2 + asc * size - cap * size; // cap top under a 1.0 line box's top
  const at = (capTop: number, size: number, asc = INTER_ASC, cont = INTER_CONTENT, cap = INTER_CAP) => top + capTop - lineBox(size, asc, cont, cap);

  const row = { position: "absolute" as const, left, width: blockW, textAlign: align, whiteSpace: "nowrap" as const, lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 70 : 30}% 50%, ${shade(PAPER, 0.4)}, ${PAPER} 62%, ${shade(PAPER, -0.05)} 100%)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}

      {/* The block. */}
      <div style={{ ...row, top: at(yTitle, tSize, DM_ASC, DM_CONTENT, DM_CAP), fontFamily: DMSERIF, fontSize: tSize, letterSpacing: "-0.01em" }}>{title}</div>
      {home && <div style={{ ...row, top: at(yHome, fixSize), fontFamily: SANS, fontWeight: 500, fontSize: fixSize, letterSpacing: "-0.01em" }}>{home}</div>}
      {away && (
        <div style={{ ...row, top: at(yAway, fixSize), fontFamily: SANS, fontWeight: 500, fontSize: fixSize, letterSpacing: "-0.01em" }}>
          <span style={{ color: QUIET, fontWeight: 400 }}>v</span> {away}
        </div>
      )}
      {dateLine && (
        <div style={{ ...row, top: at(yDate, dSize), fontFamily: SANS, fontWeight: 400, fontSize: dSize, letterSpacing: "-0.01em", ...(right ? {} : { paddingRight: dSize * 0.5 }) }}>
          {date && time ? `${date} · ` : date}
          {time && (
            <span style={{ position: "relative", display: "inline-block", marginLeft: dSize * 0.34 }}>
              {time}
              <svg
                aria-hidden
                width={loopW}
                height={loopH}
                viewBox={`0 0 ${loopW} ${loopH}`}
                style={{ position: "absolute", left: (timeW - loopW) / 2 + dSize * 0.01, top: dSize * (INTER_ASC - INTER_CAP / 2) - loopH / 2 + (dSize - INTER_CONTENT * dSize) / 2, overflow: "visible", pointerEvents: "none" }}
              >
                <path d={penLoop(loopW, loopH, seed)} fill="none" stroke={club} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
              </svg>
            </span>
          )}
        </div>
      )}
      {venue && (
        <div style={{ ...row, top: at(yVenue, vSize), fontFamily: SANS, fontWeight: 500, fontSize: vSize, letterSpacing: "0.22em", color: QUIET, ...(right ? {} : { marginRight: "-0.22em" }) }}>{venue}</div>
      )}

      <AgencyLogo
        data={data}
        onLight
        height={logoAsked}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
