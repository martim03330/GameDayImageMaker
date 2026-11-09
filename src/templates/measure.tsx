/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { clubTone, fixtureOf } from "./instant";
import { AgencyLogo, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const GROUND = "#ecebe6";
const INK = "#1c1d21";
const SOFT = "rgba(28,29,33,.5)";
const MONO_EM = 0.6;
const CAPS_EM = 0.7;

/** Biggest size (≤ max, ≥ min) at which a caps line of `t` fits `room`. */
const fitCaps = (t: string, room: number, max: number, min: number, tracking: number) => Math.max(min, Math.min(max, room / Math.max(1, [...t].length * (CAPS_EM + tracking))));

/**
 * Measure: an architect's elevation of the player. He stands full length on a pale drafting ground, sharp
 * and natural, on a hairline floor. Thin dimension lines with 45° ticks annotate him like a drawing: one
 * vertical dimension from the top of his head to the floor, its value the kick-off time; one horizontal
 * dimension under his feet, its value the date; and a small leader callout from his leg to the fixture
 * (home first, names as stored) and the ground, in tiny Inter caps. Everything in one ink, the callout's
 * dot in the club colour. Flips with params.side (the drawing sits on the side away from him).
 */
export function Measure({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  // dir = 1: he stands right, the drawing on the left; -1 mirrors it.
  const dir = params.side === "left" ? -1 : 1;
  const M = story ? 72 : 60;

  /* ---- the figure: head top to floor ---- */
  const headTarget = story ? STORY_TOP + 70 : 128;
  const floor = story ? 1420 : 1036;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  const framing = params.framing ?? "full";
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  const feet = !cutBottom && framing === "full";
  const depth: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
  let h: number;
  let top: number;
  if (feet) {
    h = (floor - headTarget) / (1 - hair);
    top = headTarget - hair * h;
  } else {
    const crop = Math.min(1, depth[framing] ? face[1] + face[3] * depth[framing] : 1);
    h = (floor + 40 - headTarget) / Math.max(0.2, crop - hair);
    top = headTarget - hair * h;
  }
  // Face size cap from the photo's own resolution; resize keeping the feet on the floor (or the head in place).
  const cap = data.facePx > 0 ? Math.max(110, data.facePx * 2.1) : 400;
  const resize = (nh: number) => {
    if (feet) top = top + h - nh;
    h = nh;
  };
  if (h * face[3] > cap) resize(cap / face[3]);
  if ((params.playerScale ?? 1) !== 1) resize(h * (params.playerScale ?? 1));
  const w = h * aspect;
  const fx = face[0] + face[2] / 2;
  const cx = 540 + dir * (story ? 150 : 140);
  const left = cx - fx * w + (params.playerX ?? 0);
  top += params.playerY ?? 0;
  const fH = face[3] * h;
  const faceCx = left + fx * w;
  const headTop = top + hair * h;
  const feetY = feet ? top + h : floor + (params.playerY ?? 0);
  const fade = feet ? undefined : `linear-gradient(to bottom, #000 0, #000 ${feetY - top - (story ? 260 : 200)}px, transparent ${feetY - top}px)`;
  const boxL = left + ((data.cut?.left ?? 0) > 0 ? w * 0.08 : 0);
  const boxR = left + w - ((data.cut?.right ?? 0) > 0 ? w * 0.08 : 0);

  /* ---- drawing constants ---- */
  const sw = story ? 1.6 : 1.3;
  const tick = story ? 11 : 9;
  const ext = story ? 16 : 13;
  const gap = story ? 14 : 11;

  /* ---- vertical dimension: kick-off ---- */
  const f = matchFacts(data);
  const date = niceDate(content.date).toUpperCase();
  const vVal = f.time || date;
  const hVal = f.time ? date : "";
  const dimX = dir === 1 ? M + (story ? 40 : 34) : CANVAS_W - M - (story ? 40 : 34);
  const vSize = 30 * k;
  const vLen = [...vVal].length * (MONO_EM + 0.04) * vSize + 2 * gap * 1.4;
  const vMid = (headTop + feetY) / 2;
  const kLabel = f.time ? "KICK-OFF" : "MATCH DATE";
  const kSize = 11.5 * k;

  /* ---- horizontal dimension: date ---- */
  const hy = feetY + (story ? 74 : 60);
  const x1 = Math.max(M + 80, boxL);
  const x2 = Math.min(CANVAS_W - M, boxR);
  const hSize = 19 * k;
  const hLen = [...hVal].length * (MONO_EM + 0.1) * hSize + 2 * gap * 1.4;
  const hInside = x2 - x1 > hLen + 60;
  const hMid = (x1 + x2) / 2;

  /* ---- callout: from his leg to the fixture and ground ---- */
  const teams = fixtureOf(data).map((t) => t.toUpperCase());
  const venue = titleCase(f.venue).toUpperCase();
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const cy = headTop + (feetY - headTop) * 0.6 + ty;
  // The block's inner edge: clear of his legs and of a hanging arm.
  const textEdge = dir === 1 ? Math.min(faceCx - fH * 2.1, boxL - 28) : Math.max(faceCx + fH * 2.1, boxR + 28);
  const outer = dimX + dir * (story ? 40 : 34);
  const room = Math.abs(textEdge - outer);
  const t1 = fitCaps(kicker, room, 12.5 * k, 9, 0.32);
  // A line that would get too small breaks into two balanced lines (names are never shortened).
  const split = (t: string, max: number, min: number, track: number) => {
    if (fitCaps(t, room, max, min, track) >= max * 0.86) return [t];
    const words = t.split(" ");
    let best = [t, ""];
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      if (Math.max(a.length, b.length) < Math.max(best[0].length, best[1].length)) best = [a, b];
    }
    return best.filter(Boolean);
  };
  const teamLines = teams.map((t, i) => split(i ? `V ${t}` : t, 17 * k, 10, 0.06));
  const t2 = Math.min(...teamLines.flat().map((t) => fitCaps(t, room, 17 * k, 10, 0.06)));
  const venueLines = venue ? split(venue, 11 * k, 8, 0.14) : [];
  const t3 = Math.min(...venueLines.map((v) => fitCaps(v, room, 11 * k, 8, 0.14)), 11 * k);
  const lines: { text: string; size: number; weight: number; track: number; color: string; gapBefore: number }[] = [
    { text: kicker, size: t1, weight: 600, track: 0.32, color: INK, gapBefore: 0 },
    ...teamLines.flatMap((ls, i) => ls.map((t, j) => ({ text: t, size: t2, weight: 500, track: 0.06, color: INK, gapBefore: i === 0 && j === 0 ? 14 * k : 8 * k }))),
    ...venueLines.map((v, i) => ({ text: v, size: t3, weight: 500, track: 0.14, color: SOFT, gapBefore: i ? 6 * k : 13 * k })),
  ];
  const blockH = lines.reduce((a, l) => a + l.gapBefore + l.size, 0);
  const blockTop = cy - blockH / 2;
  const leaderY = blockTop + t1 / 2; // the leader meets the block at its first line
  const anchorX = faceCx - dir * fH * 0.35;
  const anchorY = cy + fH * 0.2;
  const elbowX = textEdge + dir * (story ? 26 : 20);
  const r = story ? 8 : 6.5;

  /* ---- logo: the free corner ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);

  const caps = (size: number, weight: number, track: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color });
  const mono = (size: number, track: number): CSSProperties => ({ fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK, fontVariantNumeric: "tabular-nums" });
  const L = (xa: number, ya: number, xb: number, yb: number, key: string, color = INK, width = sw) => <line key={key} x1={xa} y1={ya} x2={xb} y2={yb} stroke={color} strokeWidth={width} strokeLinecap="square" />;
  const Tick = (x: number, y: number, key: string) => L(x - tick / 2, y + tick / 2, x + tick / 2, y - tick / 2, key, INK, sw * 1.6);

  // Vertical dimension: line broken for its value.
  const vA = headTop;
  const vB = feetY;
  const vBreak = vB - vA > vLen + 80;
  // Lines in the drawing.
  const strokes = [
    // Floor: a hairline from the dimension line out past his feet.
    L(dimX - dir * ext, feetY, dir === 1 ? CANVAS_W - M + 30 : M - 30, feetY, "floor", INK, sw * 0.8),
    // Extension line from the top of his head.
    L(faceCx - dir * fH * 0.75, vA, dimX - dir * ext, vA, "ext-top", SOFT, sw * 0.8),
    ...(vBreak
      ? [L(dimX, vA, dimX, vMid - vLen / 2, "v1"), L(dimX, vMid + vLen / 2, dimX, vB, "v2")]
      : [L(dimX, vA, dimX, vB, "v")]),
    Tick(dimX, vA, "tv1"),
    Tick(dimX, vB, "tv2"),
    ...(hVal
      ? [
          L(x1, feetY + gap, x1, hy + ext, "e1", SOFT, sw * 0.8),
          L(x2, feetY + gap, x2, hy + ext, "e2", SOFT, sw * 0.8),
          ...(hInside ? [L(x1, hy, hMid - hLen / 2, hy, "h1"), L(hMid + hLen / 2, hy, x2, hy, "h2")] : [L(x1, hy, x2, hy, "h")]),
          Tick(x1, hy, "th1"),
          Tick(x2, hy, "th2"),
        ]
      : []),
    // Callout leader: block → elbow → his leg.
    L(elbowX, leaderY, textEdge + dir * 4, leaderY, "ld1"),
    L(elbowX, leaderY, anchorX - dir * r * 0.7, anchorY - r * 0.7 * Math.sign(anchorY - leaderY || 1), "ld2"),
  ];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      {/* Drafting paper: plain, a whisper of light toward him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 50% at ${(faceCx / CANVAS_W) * 100}% 40%, #f6f5f1 0%, transparent 75%)` }} />

      {/* Contact shade at his feet (never a drop-shadow on the cutout). */}
      {feet && <div style={{ position: "absolute", left: (boxL + boxR) / 2 - fH * 1.7, top: feetY - fH * 0.16, width: fH * 3.4, height: fH * 0.34, borderRadius: "50%", background: "rgba(30,28,24,.32)", filter: `blur(${story ? 14 : 11}px)` }} />}

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left, top, width: w, height: h, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut, 1.4) }} />
        </div>
      )}

      {/* The drawing. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {strokes}
        <circle cx={anchorX} cy={anchorY} r={r} fill={club} stroke="#ffffff" strokeWidth={sw * 1.4} />
      </svg>

      {/* Vertical value (kick-off), reading upward, and its small label outside the line. */}
      <div style={{ position: "absolute", left: dimX, top: vBreak ? vMid : vMid, transform: "translate(-50%, -50%) rotate(-90deg)", ...mono(vSize, 0.04), ...(vBreak ? {} : { background: GROUND, padding: "0 10px" }) }}>{vVal}</div>
      <div style={{ position: "absolute", left: dimX - dir * (story ? 30 : 24), top: vMid, transform: "translate(-50%, -50%) rotate(-90deg)", ...caps(kSize, 600, 0.34, SOFT), paddingLeft: "0.34em" }}>{kLabel}</div>

      {/* Horizontal value (date). */}
      {hVal && (
        <div style={{ position: "absolute", left: hMid, top: hInside ? hy : hy + hSize * 0.9, transform: "translate(-50%, -50%)", ...mono(hSize, 0.1), paddingLeft: "0.1em" }}>{hVal}</div>
      )}

      {/* The callout block. */}
      <div style={{ position: "absolute", top: blockTop, ...(dir === 1 ? { right: CANVAS_W - textEdge } : { left: textEdge }), display: "flex", flexDirection: "column", alignItems: dir === 1 ? "flex-end" : "flex-start" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ ...caps(l.size, l.weight, l.track, l.color), marginTop: l.gapBefore, marginRight: dir === 1 ? `-${l.track}em` : undefined }}>
            {l.text}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", ...(dir === 1 ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: dir === 1 ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
