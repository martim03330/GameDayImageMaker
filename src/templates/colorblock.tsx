/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Archivo Black: advance widths per 100px of font size (measured in the browser). */
const ARCHIVO_W: Record<string, number> = { A: 77.8, B: 77.8, C: 77.8, D: 77.8, E: 72.2, F: 66.7, G: 83.3, H: 83.3, I: 38.9, J: 66.7, K: 83.3, L: 66.7, M: 94.4, N: 83.3, O: 83.3, P: 72.2, Q: 83.3, R: 77.8, S: 72.2, T: 72.2, U: 83.3, V: 77.8, W: 100, X: 77.8, Y: 77.8, Z: 72.2, " ": 33.3, "-": 33.3, "'": 27.8, ".": 33.3, ":": 33.3, "/": 27.8, "&": 88.9 };
const archivoEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (ARCHIVO_W[c] ?? (/\d/.test(c) ? 66.7 : 80)) / 100 + tracking, -tracking);
/** Cap height of Archivo Black, relative to the font size. */
const CAP = 0.688;

/** "MATCHDAY" → MATCH / DAY; otherwise the words in at most two balanced lines. */
function twoLines(kicker: string): string[] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim().replace(/^(MATCH|GAME)DAY$/, "$1 DAY").replace(/^FULLTIME$/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words.length ? words : [""];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(archivoEm(words.slice(0, i).join(" "), 0) - archivoEm(words.slice(i).join(" "), 0));
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Paper-like mottling, so the flat colour reads as a printed sheet. */
function textureUrl(seed: number): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='540' height='540'><filter id='t'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.03' numOctaves='4' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.1 -0.1'/></filter><rect width='100%' height='100%' filter='url(#t)'/></svg>`,
  )}")`;
}
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/**
 * Bold club-colour matchday (Borussia Mönchengladbach "MATCH DAY"): one flat, softly mottled sheet in the
 * club colour, the title as two enormous white lines filling the width, the player standing in front of
 * them with a soft shadow on the floor and a few streaks of light; under the title a dark bar with both
 * crests, a white tag with the competition and the round, then date, kick-off and ground in spaced caps.
 */
export function Colorblock({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 41;
  const r = rng(seed);
  const right = params.side !== "left";

  // The club colour, kept deep enough for white type: a white or yellow club falls back to its other colour.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.18);
  const deep = shade(club, -0.35);
  const ink = shade(club, -0.78);

  const f = matchFacts(data);
  const score = scoreOf(data, " - ");

  /* ---- title: line 1 fills the measure, line 2 (shorter) at the same size ---- */
  const X0 = 64;
  const tracking = -0.02;
  const lines = twoLines(content.kicker);
  const widest = Math.max(...lines.map((l) => archivoEm(l, tracking)));
  const size = Math.min(330, (CANVAS_W - X0 * 2) / widest) * (params.textScale ?? 1);
  const pitch = size * CAP * 1.16;
  const titleTop = 190 + (params.textY ?? 0);
  const titleBottom = titleTop + size * CAP + (lines.length - 1) * pitch;

  /* ---- the player, standing in front of the title ---- */
  const cx = right ? 640 + r() * 40 : 440 - r() * 40;
  // Made for a whole figure: a tight framing would push his head down under the info column.
  const framing = params.framing === "chest" || params.framing === "waist" ? "knees" : params.framing;
  const box = standing(data, { cx, headTop: titleTop + size * CAP * 0.55, floor: 1250, maxFace: 240, framing });
  const floorY = box.top + box.height;

  /* ---- the info column under the title, on the side he leaves free ---- */
  const crests = [f.ourCrest, f.oppCrest].filter(Boolean) as string[];
  const barTop = titleBottom + 34;
  const barW = right ? Math.max(380, Math.min(500, box.faceCx - 120)) : Math.max(380, Math.min(500, CANVAS_W - box.faceCx - 120));
  const tag = [f.comp, f.round].filter(Boolean).join(" ") || (data.club?.name ?? "").toUpperCase();
  const lines2 =
    postType === "result" || (postType === "goal" && score)
      ? [score ? `FULL TIME ${score}` : "", f.longDate, f.venue]
      : [f.longDate, f.time ? `KICK OFF ${f.time}` : "", f.venue];
  const info = lines2.filter(Boolean);
  const crestFilter = `${params.crestColor ? "" : "url(#colorblock-mono) "}drop-shadow(0 3px 10px rgba(0,0,0,.4))`;
  const col: CSSProperties = right ? { left: 0 } : { right: 0 };
  const pad = right ? { paddingLeft: X0 } : { paddingRight: X0 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: club, color: WHITE }}>
      <MonoDefs id="colorblock-mono" ink={0.62} />

      {/* The sheet: flat colour, lit from the upper side, mottled like print. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at ${right ? 70 : 30}% 30%, ${shade(club, 0.12)} 0%, ${club} 45%, ${deep} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: textureUrl((seed % 50) + 2), backgroundSize: "1080px 1080px", mixBlendMode: "soft-light", opacity: 0.55 }} />

      {/* Title. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          [right ? "left" : "right"]: X0,
          top: titleTop - size * (1 - CAP) * 0.8,
          fontFamily: ARCHIVO_BLACK,
          fontSize: size,
          lineHeight: `${pitch}px`,
          letterSpacing: `${tracking}em`,
          whiteSpace: "nowrap",
          textAlign: right ? "left" : "right",
          color: WHITE,
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* Streaks of light crossing behind him. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
        <defs>
          <linearGradient id={`colorblock-streak-${seed}`} x1="0" x2="1">
            <stop offset="0" stopColor={WHITE} stopOpacity="0" />
            <stop offset=".5" stopColor={WHITE} stopOpacity=".75" />
            <stop offset="1" stopColor={WHITE} stopOpacity="0" />
          </linearGradient>
          <filter id={`colorblock-glow-${seed}`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        {[0, 1, 2].map((i) => {
          const y = 760 + i * 130 + r() * 60;
          const x = right ? 260 + r() * 200 : 260 + r() * 200;
          const len = 360 + r() * 260;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={len}
              height={2 + r() * 1.5}
              fill={`url(#colorblock-streak-${seed})`}
              filter={`url(#colorblock-glow-${seed})`}
              transform={`rotate(${right ? 22 : -22} ${x + len / 2} ${y})`}
              opacity={0.55 + r() * 0.3}
            />
          );
        })}
      </svg>

      {/* The dark bar with both crests, the competition tag and the facts. */}
      <div style={{ position: "absolute", top: barTop, ...col, width: barW + X0, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        <div style={{ width: "100%", height: 136, background: `linear-gradient(${right ? 90 : 270}deg, ${ink}f2, ${ink}d9)`, display: "flex", alignItems: "center", gap: 34, justifyContent: right ? "flex-start" : "flex-end", ...pad, boxSizing: "border-box" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 92, height: 92, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
        <div style={{ ...pad, marginTop: 40, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
          {tag && (
            <div style={{ background: WHITE, color: deep, fontFamily: CONDENSED, fontWeight: 800, fontSize: Math.max(17, Math.min(34, (barW - 80) / Math.max(1, tag.length * 0.55))), letterSpacing: "0.02em", lineHeight: 1, padding: "10px 16px 9px", whiteSpace: "nowrap", border: `3px solid ${WHITE}`, outline: `2px solid ${WHITE}`, outlineOffset: 5 }}>
              {tag}
            </div>
          )}
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14, alignItems: right ? "flex-start" : "flex-end" }}>
            {info.map((t, i) => (
              <div key={i} style={{ fontFamily: CONDENSED, fontWeight: i === 0 ? 800 : 700, fontSize: i === 0 ? 34 : 30, letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,.25)" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Soft shadow on the floor, then the player. */}
      {data.photoUrl && box.feet && (
        <div style={{ position: "absolute", left: box.faceCx - 230, top: floorY - 34, width: 460, height: 64, borderRadius: "50%", background: "rgba(0,0,0,.45)", filter: "blur(22px)" }} />
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.05) saturate(1.04) drop-shadow(0 18px 34px rgba(0,0,0,.32))",
            ...cutMask(data.cut),
          }}
        />
      )}
      {/* A haze of light off his shoulder, as in the reference. */}
      <div style={{ position: "absolute", left: box.faceCx + (right ? 60 : -360), top: floorY - 520, width: 300, height: 360, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,.22), transparent)", mixBlendMode: "screen", pointerEvents: "none" }} />

      <AgencyLogo data={data} height={24} style={{ position: "absolute", [right ? "left" : "right"]: X0, bottom: 52 + (params.logoY ? -params.logoY : 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }} />

      {/* Grain over everything. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 95% at 50% 40%, transparent 55%, rgba(0,0,0,.32) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
