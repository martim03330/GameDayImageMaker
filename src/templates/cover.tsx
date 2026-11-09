/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
export const BODONI = "var(--font-bodoni), 'Bodoni 72', Didot, serif";

/** Bodoni Moda 600: advance widths per 100px of font size (measured in the browser). */
const BODONI_W: Record<string, number> = { "0": 64.3, "1": 47, "2": 57.9, "3": 55, "4": 62.1, "5": 52.1, "6": 58.9, "7": 52.5, "8": 57.9, "9": 58.9, A: 78.9, B: 68.8, C: 72.1, D: 75.2, E: 63.4, F: 61.1, G: 75.7, H: 78.8, I: 41.3, J: 50.7, K: 75, L: 62, M: 89.8, N: 77.9, O: 76.5, P: 66.7, Q: 76.5, R: 74.2, S: 59.3, T: 68.9, U: 73.4, V: 79, W: 107.3, X: 79.1, Y: 74.3, Z: 60.6, " ": 25, "-": 35.9, "'": 23.5, ".": 23.5, ":": 23.4, "/": 52.8, "&": 83.8 };
const bodoniEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BODONI_W[c] ?? 70) / 100 + tracking, -tracking);
const CAP = 0.75;

/**
 * Classic magazine cover (AC Milan v Venezia "MATCHDAY"): a dark studio backdrop washed with the club
 * colour, the title as one enormous high-contrast serif word across the full width with the player's
 * head in front of it, a quiet line of small caps above and below the cover (club · MATCH DAY ·
 * competition), the fixture and the date under the title, and both crests as white marks by his shoulder.
 */
export function Cover({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 23;
  const r = rng(seed);
  const right = params.side !== "left";

  let tint = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(tint) > 0.6) tint = vivid(params.accent);
  const wall = shade(tint, -0.72);
  const f = matchFacts(data);
  const score = scoreOf(data, "–");

  /* ---- the title: one word across the cover ---- */
  const raw = content.kicker.toUpperCase().replace(/’/g, "'").trim();
  const title = raw.replace(/\s+/g, "").length <= 10 ? raw.replace(/\s+/g, "") : raw;
  const tracking = -0.03;
  const M = 44;
  const size = Math.min(300, (CANVAS_W - M * 2) / bodoniEm(title, tracking)) * (params.textScale ?? 1);
  const titleTop = 128 + (params.textY ?? 0);
  const capBottom = titleTop + size * CAP;

  /* ---- the player: his head breaks the lower half of the title ---- */
  // Close up, as on a cover: the hair runs well into the letters, the face stays clear below them.
  const want = ({ chest: 300, waist: 270, knees: 250, full: 240 } as Record<string, number>)[params.framing ?? "waist"] ?? 270;
  const faceTop = capBottom + 8;
  const faceX = 540 + (right ? -1 : 1) * (10 + r() * 40);
  const box = placeFace(data, faceX, faceTop, want);

  const ours = (data.club?.name ?? "").toUpperCase();
  const fixture = f.opp ? (content.home === false ? `${f.opp} v ${ours}` : `${ours} v ${f.opp}`) : ours;
  const when = postType === "result" && score ? `FULL TIME ${score}` : [f.longDate, f.time].filter(Boolean).join(" · ");
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = `${params.crestColor ? "" : "url(#cover-mono) "}drop-shadow(0 4px 14px rgba(0,0,0,.45))`;
  const middle = postType === "matchday" ? "MATCH DAY" : raw;

  // Room either side of the head for the line under the title.
  const sideRoom = Math.max(220, Math.min(box.left + box.width * ((data.face?.[0] ?? 0.38) - 0.04), CANVAS_W - (box.left + box.width * ((data.face?.[0] ?? 0.38) + (data.face?.[2] ?? 0.24) + 0.04))) - M - 20);
  const fitSmall = (t: string, room: number, max = 22) => Math.max(14, Math.min(max, room / Math.max(1, [...t].length * 0.66)));
  const small = (fs = 21): CSSProperties => ({ fontFamily: BODONI, fontWeight: 700, fontSize: fs, letterSpacing: "0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textShadow: "0 2px 10px rgba(0,0,0,.45)" });
  const row = (top: number | undefined, bottom?: number) => (
    <div style={{ position: "absolute", left: M, right: M, top, bottom, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ ...small(fitSmall(ours, 320, 21)), flex: 1 }}>{ours}</span>
      <span style={{ ...small(fitSmall(middle, 300, 21)), flex: 1, textAlign: "center" }}>{middle}</span>
      <span style={{ ...small(fitSmall(f.comp || f.round, 320, 21)), flex: 1, textAlign: "right" }}>{f.comp || f.round}</span>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: wall, color: WHITE }}>
      <MonoDefs id="cover-mono" ink={0.6} />
      {/* Studio wall: a soft pool of light behind him, falling off into the club colour's darkest shade. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 48%, ${shade(tint, -0.45)} 0%, ${shade(tint, -0.62)} 45%, ${shade(tint, -0.82)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 45% at 50% 42%, rgba(255,255,255,.10), transparent 70%)", mixBlendMode: "screen" }} />
      {/* Dust specks on the backdrop, as on a printed cover. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={r() * CANVAS_W} cy={r() * CANVAS_H} r={0.8 + r() * 1.6} fill={WHITE} opacity={0.12 + r() * 0.2} />
        ))}
      </svg>

      {row(30)}

      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: titleTop - size * 0.2, textAlign: "center", fontFamily: BODONI, fontWeight: 600, fontSize: size, lineHeight: 1, letterSpacing: `${tracking}em`, whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(0,0,0,.25)" }}>
        {title}
      </div>

      {/* Fixture and date in the two corners under the title, each kept clear of his head. */}
      <div style={{ position: "absolute", left: M, right: M, top: capBottom + 30, display: "flex", justifyContent: "space-between" }}>
        <span style={small(fitSmall(fixture, sideRoom))}>{fixture}</span>
        <span style={small(fitSmall(when, sideRoom))}>{when}</span>
      </div>

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
            filter: "contrast(1.06) saturate(1.02) drop-shadow(0 30px 60px rgba(0,0,0,.45))",
            ...cutMask(data.cut),
          }}
        />
      )}

      {/* Crests by his shoulder, on the side with more room. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: capBottom + 300, [right ? "right" : "left"]: 70, display: "flex", gap: 14, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 120, height: 120, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 180, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.45))" }} />
      {row(undefined, 30)}
      <AgencyLogo data={data} height={22} style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: 74 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom", opacity: 0.92 }} />

      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(125% 95% at 50% 45%, transparent 58%, rgba(0,0,0,.4) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
