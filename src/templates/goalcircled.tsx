/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter (per 1px of font size): baseline under the top of a line box of 1em, and the cap height. */
const INTER_BASE = 0.865;
const INTER_CAP = 0.728;
const TRACK = -0.035;

/**
 * One pen stroke round an ellipse, as a filled outline so it can taper like ink: it starts thin up on the
 * right, runs once round (a little wobble in the radius, a slight tilt) and overshoots past where it began,
 * ending a touch inside the start so the two ends cross — the way a hand circles a word.
 */
function penEllipse(cx: number, cy: number, rx: number, ry: number, w: number, seed: number): string {
  const r = rng(seed || 7);
  const tilt = (-3 - r() * 3) * (Math.PI / 180);
  const a0 = -0.55 - r() * 0.3; // start: up and to the right
  const sweep = Math.PI * 2 + 0.55 + r() * 0.2; // once round, and past the start
  const ph = r() * Math.PI * 2;
  const N = 180;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = a0 - u * sweep; // anticlockwise on screen, as most hands draw it
    // Opens a little wide, closes a little tight: the ends cross instead of meeting.
    const k = 1.05 - 0.07 * u + 0.018 * Math.sin(2 * a + ph);
    const x = rx * k * Math.cos(a);
    const y = ry * k * Math.sin(a) * (1 + 0.03 * Math.cos(a + ph));
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  const L: [number, number][] = [];
  const R: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const [x0, y0] = pts[Math.max(0, i - 1)];
    const [x1, y1] = pts[Math.min(N, i + 1)];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const d = Math.hypot(dx, dy) || 1;
    // Pressure: lands softly, full through the curve, lifts off thinner at the end.
    const p = Math.min(1, u / 0.07) ** 0.6 * Math.min(1, (1 - u) / 0.16) ** 0.8;
    const hw = (w / 2) * (0.25 + 0.75 * p) * (0.9 + 0.1 * Math.sin(u * 9 + ph));
    L.push([pts[i][0] - (dy / d) * hw, pts[i][1] + (dx / d) * hw]);
    R.push([pts[i][0] + (dy / d) * hw, pts[i][1] - (dx / d) * hw]);
  }
  const f = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `M${L.map(f).join("L")}L${R.reverse().map(f).join("L")}Z`;
}

/**
 * Goal circled: one gesture. On a deep club-tone ground, "Goal" set big in Inter on the free side, and round it
 * a single thin pen ellipse in the club colour (white when the colour won't read), slightly imperfect, tapering,
 * overshooting where it closes. Under it, small, his name and the fixture (home first, names as stored, never a
 * score), then the agency logo. The celebrating player big on the other side, sinking into the dark at the foot.
 */
export function Goalcircled({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  const club = clubTone(data);
  const ground = shade(club, -0.66);
  // The pen: the club colour, lifted until it reads on the dark; white if it never does.
  let pen = club;
  for (let i = 0; i < 6 && luminance(pen) < 0.2; i++) pen = shade(pen, 0.16);
  if (luminance(pen) < 0.12) pen = "#ffffff";

  /* ---- the foot: logo, then (≥ 56px above it) the name and fixture ---- */
  const M = story ? 84 : 68;
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const fixture = teamsOf(data).join(" v ");
  const infoW = story ? 760 : 600;
  const nameSize = Math.max(16, Math.min(26 * q, infoW / Math.max(1, name.length * 0.6))) * ts;
  const fixSize = Math.max(14, Math.min(21 * q, infoW / Math.max(1, fixture.length * 0.54))) * ts;
  const infoBottom = logoBottom + logoH + (story ? 64 : 58) - (params.textY ?? 0);
  const infoH = (name ? nameSize * 1.25 : 0) + (fixture ? fixSize * 1.3 + 4 * q : 0);

  /* ---- the word and its ellipse ---- */
  const word = sentenceCase(content.kicker || "Goal").replace(/[.!]+$/, "") || "Goal";
  const n = [...word].length;
  const em = titleW(word, 1) / 0.99 + TRACK * (n - 1);
  const colW = story ? CANVAS_W - 2 * M - 120 : 530;
  // The ellipse adds ~0.26em each side of the ink, and its stroke a bit more.
  const S = Math.min((story ? 290 : 230) * ts, colW / (em + 0.8));
  const inkW = em * S;
  const rx = inkW / 2 + 0.36 * S;
  const ry = 0.36 * S + 0.38 * S;
  const penW = Math.max(3, S * 0.025);
  const ellW = 2 * rx * 1.06 + penW;
  const ellBottomPad = ry * 1.08 + penW; // below the ink centre
  // Ink centre in the line box: halfway between baseline and cap top.
  const inkMid = (INTER_BASE - INTER_CAP / 2) * S;
  const cy = H - infoBottom - infoH - 46 * q - ellBottomPad;
  const wordTop = cy - inkMid;
  const ellLeft = right ? M : CANVAS_W - M - ellW;
  const cx = ellLeft + ellW / 2;
  const wordLeft = cx - inkW / 2;

  /* ---- the player, big, on the other side ---- */
  const faceX = right ? (story ? 680 : 740) : story ? 400 : 340;
  const faceTop = story ? STORY_TOP + 110 : 150;
  let box = placeByFace(data, faceX, faceTop, story ? { chest: 310, waist: 256, knees: 204, full: 158 } : { chest: 240, waist: 200, knees: 160, full: 122 });
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (right ? Math.max(0, lean) : Math.min(0, lean)) };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;
  // The word must sit on near-dark: the fade starts early enough, but always below his chin.
  const darkFrom = Math.max(fTop + box.faceH * 1.4, cy - ry - (story ? 360 : 300));

  const path = penEllipse(cx, cy, rx, ry, penW, (params.seed ?? 11) % 9973);

  const side: CSSProperties = right ? { left: M + 4, alignItems: "flex-start", textAlign: "left" } : { right: M + 4, alignItems: "flex-end", textAlign: "right" };
  const small: CSSProperties = { fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "-0.005em" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#ffffff" }}>
      {/* The ground: deep club tone, a little light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(58% 44% at ${(faceX / CANVAS_W) * 100}% ${((fTop + box.faceH * 2.2) / H) * 100}%, ${shade(club, -0.4)}, ${ground} 72%, ${shade(ground, -0.3)} 100%)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: darkFrom, bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}cc ${story ? 320 : 280}px, ${ground} ${story ? 600 : 520}px)` }} />

      {/* The word, circled. */}
      <div style={{ position: "absolute", left: wordLeft, top: wordTop, fontFamily: SANS, fontWeight: 600, fontSize: S, lineHeight: 1, letterSpacing: `${TRACK}em`, color: "#ffffff", whiteSpace: "nowrap" }}>{word}</div>
      <svg width={CANVAS_W} height={H} viewBox={`0 0 ${CANVAS_W} ${H}`} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} aria-hidden>
        <path d={path} fill={pen} />
      </svg>

      {/* Name and fixture, small. */}
      <div style={{ position: "absolute", bottom: infoBottom, ...side, display: "flex", flexDirection: "column", gap: 4 * q }}>
        {name && <div style={{ ...small, fontWeight: 500, fontSize: nameSize, lineHeight: 1.25 }}>{name}</div>}
        {fixture && <div style={{ ...small, fontWeight: 400, fontSize: fixSize, lineHeight: 1.3, color: "rgba(255,255,255,.62)" }}>{fixture}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
