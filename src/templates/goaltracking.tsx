/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { placeFree, w800 } from "./fadeword";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/** How bright each of the four lines is: a crescendo. */
const LEVELS = [0.26, 0.46, 0.7, 1];

/**
 * Goaltracking: the goal sibling of `tracking`. On a deep club-tone ground, the kicker in Inter Extra Bold
 * capitals ("GOAL") set four times, same size, flush to the free side — the tracking opening up line by line
 * until the last line spans the whole column, and each line brighter than the one before, like a shout
 * expanding. Under it only his name and the fixture (home first, names as stored, never a score), then the
 * logo. The celebrating player on the other side (flips with params.side).
 */
export function Goaltracking({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const M = 64;
  const right = params.side !== "left";
  const club = clubTone(data);
  const ground = shade(club, -0.7);
  const lift = shade(club, -0.42);

  /* ---- the celebrating player, on his side ---- */
  const FRAME = story ? { chest: 220, waist: 180, knees: 148, full: 120 } : { chest: 196, waist: 158, knees: 128, full: 102 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  let box = placeFree(data, right ? (story ? 800 : 780) : story ? 280 : 300, story ? 350 : 220, faceH0, H + 30);
  // A fist flung wide: pull the whole figure a little towards its own half rather than pinning the face.
  const lean = Math.max(-120, Math.min(120, (right ? (story ? 770 : 750) : story ? 310 : 330) - (box.left + box.width / 2)));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;

  /* ---- the foot, from the logo up ---- */
  const colW = story ? 548 : 520;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const nameSize = Math.max(20 * k, Math.min(30 * k, colW / Math.max(1, [...name].length * 0.6))) * ts;
  const fixSize = Math.max(14 * k, Math.min(18 * k, colW / Math.max(1, [...fixture].length * 0.53))) * ts;
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 52;
  const logoTop = H - logoBottom - logoH;
  const fixTop = logoTop - (story ? 66 : 56) - fixSize * 1.25;
  const nameTop = fixTop - (story ? 10 : 6) - nameSize * 1.2;

  /* ---- the four lines: first tight, last spanning the column ---- */
  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim().toUpperCase();
  const letters = [...word];
  const gaps = Math.max(1, letters.length - 1);
  const base = w800(word);
  const size = Math.min(story ? 132 : 112, (colW * 0.56) / Math.max(1, base - 0.04 * gaps)) * ts;
  const lastTrack = Math.max(0.1, (colW / size - base) / gaps);
  const steps = [-0.04, lastTrack * 0.22, lastTrack * 0.55, lastTrack];
  const lh = 0.98;
  const blockH = size * lh * steps.length;
  const blockTop = nameTop - (story ? 54 : 40) - blockH + (params.textY ?? 0);

  // Whatever of him reaches into the type column (a flung arm) dissolves before it, level with the type only.
  const edge = right ? M + colW + 10 - box.left : CANVAS_W - M - colW - 10 - box.left;
  const across = right
    ? `linear-gradient(to right, transparent 0, transparent ${edge}px, #000 ${edge + 200}px)`
    : `linear-gradient(to left, transparent 0, transparent ${box.width - edge}px, #000 ${box.width - edge + 200}px)`;
  const above = `linear-gradient(to bottom, #000 0, #000 ${blockTop - 300 - box.top}px, transparent ${blockTop - 20 - box.top}px)`;
  const keepOut = `${above}, ${across}`;

  const side: CSSProperties = right ? { left: M, width: colW, textAlign: "left" } : { left: CANVAS_W - M - colW, width: colW, textAlign: "right" };
  const small: CSSProperties = { position: "absolute", ...side, fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap", lineHeight: 1.2 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#ffffff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 46% at ${(faceCx / CANVAS_W) * 100}% ${((box.top + box.faceH * 3) / H) * 100}%, ${lift}, ${ground} 75%)` }} />

      {/* The player, sharp, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: keepOut, maskImage: keepOut }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The four lines, opening up and brightening. */}
      <div style={{ position: "absolute", top: blockTop, ...side, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        {steps.map((t, i) => (
          <div key={i} style={{ display: "flex", fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: lh, whiteSpace: "nowrap", color: `rgba(255,255,255,${LEVELS[i]})` }}>
            {letters.map((c, j) => (
              <span key={j} style={{ marginRight: j < letters.length - 1 ? `${t}em` : 0, whiteSpace: "pre" }}>
                {c}
              </span>
            ))}
          </div>
        ))}
      </div>

      {name && <div style={{ ...small, top: nameTop, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em" }}>{name}</div>}
      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 400, fontSize: fixSize, color: "rgba(255,255,255,.64)" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
