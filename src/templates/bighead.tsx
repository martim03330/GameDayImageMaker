/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO } from "./fx";
import { Paper, rng, SCRIPT } from "./kit";
import { ANTON, em } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, DISPLAY } from "./shared";
import { matchFacts, secondPhoto, shortFacts, type MatchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { bestLines } from "./wall";

/* ---------- helpers shared by bighead, swirl and splitbw ---------- */

/** Anton: cap height relative to the font size. */
export const ANTON_CAP = 0.735;

/** Width in em of a line of Anton. */
export const antonEm = (t: string) => em(t.normalize("NFD").replace(/\p{M}/gu, ""), ANTON, 46);

/** Home and away as the post prints them: crests and names in fixture order (ours standing in when missing). */
export function fixtureSides(data: RenderData, m: MatchFacts = matchFacts(data)) {
  const c = data.content;
  const ours = data.club?.name ?? "";
  const same = (a?: string) => !!a && !!ours && a.trim().toLowerCase() === ours.trim().toLowerCase();
  // The teams as typed decide first; the next fixture only helps a matchday post that names none.
  const host = c.home ?? (same(c.homeTeam) ? true : same(c.awayTeam) ? false : data.postType === "matchday" ? (data.fixtures?.[0]?.home ?? true) : true);
  const hasCrests = !!(c.homeCrest || c.awayCrest);
  const crests = (hasCrests ? [c.homeCrest ?? (host ? m.ourCrest : null), c.awayCrest ?? (host ? null : m.ourCrest)] : host ? [m.ourCrest, m.oppCrest] : [m.oppCrest, m.ourCrest]) as (string | null)[];
  const oppName = m.opp;
  const names = c.homeTeam || c.awayTeam ? [c.homeTeam ?? "", c.awayTeam ?? ""] : host ? [ours, oppName] : [oppName, ours];
  return { crests, names: names.map((n) => n.toUpperCase()), host, ourIndex: host ? 0 : 1 };
}

/** Players sign with one short name: the first name, or the surname when that one is shorter. */
export function signatureName(data: RenderData): string {
  const first = data.content.firstName.split(/\s+/)[0] ?? "";
  const last = data.content.lastName.split(/\s+/).pop() ?? "";
  return !last || (first && first.length <= Math.max(8, last.length)) ? first : last;
}

/** Largest font size ≤ max at which `text` fits `width`, given an average advance `ratio` (em per char). */
export const fitText = (text: string, width: number, max: number, ratio: number) => Math.min(max, width / Math.max(1, [...text].length * ratio));

/* ---------- the look ---------- */

const INK = "#161718";
const GREY = "rgba(22,23,24,.42)";

/** Tiny vertical caps in the margins (read top to bottom), a column per line. */
function Margin({ lines, x, y, anchor, align }: { lines: string[]; x: number; y: number; anchor: "left" | "right"; align: "top" | "bottom" }) {
  const shown = lines.filter(Boolean);
  if (!shown.length) return null;
  return (
    <div
      data-bleed
      style={{
        position: "absolute",
        [anchor]: x,
        [align]: y,
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: align === "top" ? "flex-start" : "flex-end",
        gap: 7,
      }}
    >
      {shown.map((l, i) => (
        <div key={i} style={{ writingMode: "vertical-rl", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 11, letterSpacing: "0.28em", color: GREY, whiteSpace: "nowrap", lineHeight: 1 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/** A crest sitting in a flat white disc; initials when the crest is missing. */
function Disc({ src, name, size }: { src: string | null; name: string; size: number }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,.12)", flexShrink: 0 }}>
      {src ? (
        <img src={src} alt="" style={{ width: size * 0.64, height: size * 0.64, objectFit: "contain" }} />
      ) : (
        <div style={{ fontFamily: DISPLAY, fontSize: size * 0.32, color: INK, letterSpacing: "0.04em" }}>{initials || "—"}</div>
      )}
    </div>
  );
}

/**
 * Carolina "GAME DAY" (McCaffrey): light grey paper, the kicker in huge faint white letters behind, a
 * gigantic black & white head-and-shoulders of the player dissolving into white at the bottom, and in front
 * the same player small and in colour, running out of a flat club-colour disc with a brushed edge. The two
 * crests in white discs beside him, a small "15:00 | COMPETITION" line top corner, tiny vertical captions in
 * the margins and a signature scribble.
 */
export function Bighead({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 53;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);
  const ts = params.textScale ?? 1;

  // The disc's colour: the club colour as it is, unless it would vanish on grey paper.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.72) club = vivid(params.accent);
  if (luminance(club) > 0.72) club = "#1b1c1f";
  // Neon (lime, yellow) shouts on grey paper: take it down a notch. Black clubs get graphite, so a dark kit still reads on it.
  if (luminance(club) > 0.45) club = shade(club, -0.34);
  if (luminance(club) < 0.05) club = "#6f7278";

  const m = matchFacts(data);
  const sides = fixtureSides(data, m);
  const score = scoreOf(data);
  const isMatch = postType === "matchday" || postType === "result" || postType === "goal";

  // ---- the giant faint word ----
  const stretch = 1.28;
  const { lines, size: rawSize } = bestLines(content.kicker || "MATCHDAY", 940, 820, {
    tracking: 0,
    pitch: ANTON_CAP * stretch + 0.09,
    cap: ANTON_CAP * stretch,
    maxSize: 520,
    measure: antonEm,
  });
  const wordSize = rawSize * ts;
  const capS = ANTON_CAP * stretch * wordSize;
  const gapS = 0.09 * wordSize;
  const blockH = capS * lines.length + gapS * (lines.length - 1);
  const blockTop = Math.max(200, 625 - blockH / 2);

  // ---- the huge head (greyscale) ----
  const FACE: Record<string, number> = { chest: 330, waist: 300, knees: 285, full: 270 };
  const want = (FACE[params.framing ?? "waist"] ?? 300) * (params.playerScale ?? 1);
  const facePx = data.facePx || 0;
  // Never far past the photo's own resolution (export 2×); what is still enlarged goes soft, not blocky.
  const faceH = facePx > 0 ? Math.min(want, Math.max(190, facePx * 2.2)) : want;
  const mag = facePx > 0 ? (faceH * 2) / facePx : 2;
  const headBlur = mag > 3.4 ? Math.min(2.6, (mag - 3.4) * 0.7) : 0;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const hh = faceH / face[3];
  const hw = hh * aspect;
  const faceCx = X(655 + (r() - 0.5) * 40);
  const faceTop = 265 + r() * 30;
  const head = {
    left: faceCx - hw * (face[0] + face[2] / 2) + (params.playerX ?? 0),
    top: faceTop - hh * face[1] + (params.playerY ?? 0),
    width: hw,
    height: hh,
  };
  const fcy = faceTop + faceH * 0.55;
  const tight = !data.photoIsCutout;
  // Head and shoulders: an oval around the face, dissolving into white towards the bottom.
  const headMask = [
    `radial-gradient(${Math.round(faceH * (tight ? 1.5 : 2.1))}px ${Math.round(faceH * (tight ? 1.9 : 2.9))}px at ${Math.round(faceCx)}px ${Math.round(fcy + faceH * 0.25)}px, #000 52%, transparent 100%)`,
    `linear-gradient(to bottom, #000 ${Math.round(faceTop + faceH * 1.35)}px, transparent ${Math.round(faceTop + faceH * 2.6)}px)`,
  ].join(", ");

  // ---- the small action player in colour, over the disc ----
  const photo2 = secondPhoto(data, seed);
  const floor = 1192;
  const smallH = photo2?.cutBottom ? 540 : 610;
  const p2Aspect = photo2?.aspect ?? 0.6;
  const smallW = smallH * p2Aspect;
  const p2fx = photo2?.face ? photo2.face[0] + photo2.face[2] / 2 : 0.5;
  const smallCx = X(335 + (r() - 0.5) * 30);
  // Face of the small player centred on smallCx; keep the whole figure inside the canvas.
  let smallLeft = smallCx - p2fx * smallW;
  smallLeft = Math.max(40, Math.min(CANVAS_W - 40 - smallW, smallLeft));
  const smallTop = floor - smallH;
  const discR = smallH * 0.34;
  const discCx = smallCx + (flip ? -1 : 1) * 18;
  const discCy = smallTop + smallH * 0.42;
  const tail = flip ? -1 : 1;

  // ---- crests beside him ----
  const discSize = 98;
  const midSize = 40;
  const potm = postType === "potm";
  const crests = potm ? [data.club?.crestUrl ?? null] : sides.crests;
  const names = potm ? [(data.club?.name ?? "").toUpperCase()] : sides.names;
  const showScore = (postType === "result" || postType === "goal") && !!score;
  const midW = showScore ? 30 + score.length * 17 : midSize;
  const groupW = crests.length > 1 ? discSize * 2 + midW + 24 : discSize;
  // Worked out as if the small player stood on the left, then mirrored.
  const figRight = flip ? CANVAS_W - smallLeft : smallLeft + smallW;
  const groupCx = X(Math.min(CANVAS_W - 70 - groupW / 2, Math.max(700, figRight + 24 + groupW / 2)));
  const groupCy = discCy + 20;

  // ---- corner caption: "15:00 | SAT 10 OCT", then the competition, then the ground ----
  const comp = potm ? "" : m.comp || m.round;
  const capW = 440;
  let cap: string[];
  if (postType === "matchday") cap = [[m.time, m.date].filter(Boolean).join("  |  "), comp, m.venue];
  else if (postType === "goal") cap = [[score, m.opp ? `V ${m.opp}` : ""].filter(Boolean).join("  |  "), comp, comp && m.round && m.round !== comp ? m.round : ""];
  // The giant word is half hidden behind the heads: award posts spell their title out in the caption too.
  else if (postType === "result") cap = [content.kicker.toUpperCase(), [score ? `FULL TIME ${score}` : "", m.opp ? `V ${m.opp}` : ""].filter(Boolean).join("  ·  "), comp];
  else cap = [content.kicker.toUpperCase(), content.subline.toUpperCase(), shortFacts(data, 3).map((s) => `${s.value} ${s.label}`.toUpperCase()).join("  ·  ")];
  cap = cap.filter(Boolean);
  const capStyle = (i: number, t: string): CSSProperties => ({
    fontFamily: ARCHIVO,
    fontWeight: i === 0 ? 800 : 700,
    fontSize: fitText(t, capW, i === 0 ? 22 : 14, i === 0 ? 0.88 : 0.84),
    letterSpacing: i === 0 ? "0.16em" : "0.2em",
    whiteSpace: "nowrap",
    color: i === 0 ? INK : "rgba(22,23,24,.6)",
    marginTop: i === 1 ? 4 : 0,
  });

  // ---- margins ----
  const full = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const tag = "#" + (data.club?.name ?? "").normalize("NFD").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const topOuter = [content.firstName.toUpperCase(), content.lastName.toUpperCase()];
  const topInner = isMatch && sides.names[0] && sides.names[1] ? [sides.names[1], "V", sides.names[0]] : [(data.club?.name ?? "").toUpperCase(), content.subline.toUpperCase()];
  const botOuter = isMatch ? [m.round || m.comp, ...sides.names.slice().reverse()] : [data.player.position.toUpperCase(), data.player.number ? `NO. ${data.player.number}` : ""];
  const botInner = [tag.length > 1 ? tag : "", full];

  const sig = signatureName(data);
  const sigSize = fitText(sig + (data.player.number ? "  " : ""), 250, 64, 0.42);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#dcdcdc", color: INK }}>
      <Paper color="#d9d9d9" strength={1.5} />
      {/* Light falls in the middle, the edges stay a cooler grey. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 55% 50%, rgba(255,255,255,.5), rgba(255,255,255,.12) 60%, rgba(255,255,255,0) 100%)" }} />

      {/* The kicker, huge and faint. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {lines.map((l, i) => {
          const base = blockTop + capS + i * (capS + gapS);
          return (
            <text
              key={i}
              transform={`translate(540 ${base.toFixed(1)}) scale(1 ${stretch})`}
              textAnchor="middle"
              style={{ fontFamily: DISPLAY, fontSize: wordSize, letterSpacing: "0.01em" }}
              fill="#ffffff"
              opacity={0.9}
            >
              {l}
            </text>
          );
        })}
      </svg>

      {/* The giant head, black & white. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: headMask, maskImage: headMask, WebkitMaskComposite: "source-in", maskComposite: "intersect" } as CSSProperties}>
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              ...head,
              maxWidth: "none",
              filter: `grayscale(1) contrast(1.22) brightness(1.04)${headBlur ? ` blur(${headBlur.toFixed(1)}px)` : ""}`,
            }}
          />
        </div>
      )}

      {/* Club-colour disc: a slightly uneven edge, and a dry brush smear dragged out towards the head. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id={`bh-rough-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed % 97} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Bristle streaks along the stroke: alpha = noise + coverage - 1, sharpened, so it breaks up where the paint runs out. */}
          <filter id={`bh-dry-${seed}`} x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.16" numOctaves={3} seed={(seed % 89) + 3} result="s" />
            <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 0" result="sa" />
            <feComposite in="sa" in2="SourceGraphic" operator="arithmetic" k1={0} k2={5} k3={5} k4={-5.4} result="dry" />
            <feFlood floodColor={club} />
            <feComposite in2="dry" operator="in" />
          </filter>
          <linearGradient id={`bh-fade-${seed}`} x1={tail > 0 ? 0 : 1} x2={tail > 0 ? 1 : 0} y1={0} y2={0}>
            <stop offset="0" stopColor="#fff" stopOpacity={1} />
            <stop offset="0.35" stopColor="#fff" stopOpacity={0.95} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <circle cx={discCx} cy={discCy} r={discR} fill={club} filter={`url(#bh-rough-${seed})`} />
        {/* The smear: a band leaving the disc's upper side, fading out to the far side. */}
        <g transform={`rotate(${(tail * -14).toFixed(1)} ${discCx} ${discCy})`}>
          <path
            d={`M${discCx} ${discCy - discR * 0.92} L${discCx + tail * (discR + 260)} ${discCy - discR * 0.78} L${discCx + tail * (discR + 200)} ${discCy - discR * 0.05} L${discCx} ${discCy + discR * 0.1} Z`}
            fill={`url(#bh-fade-${seed})`}
            filter={`url(#bh-dry-${seed})`}
          />
        </g>
      </svg>

      {/* The small player: floor shadow, then the cutout. */}
      {photo2 && (
        <>
          <div style={{ position: "absolute", left: smallCx - 190, top: floor - 22, width: 380, height: 44, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.28), transparent)" }} />
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 12px 18px rgba(0,0,0,.22))" }}>
            <img
              src={photo2.url}
              alt=""
              style={{
                position: "absolute",
                left: smallLeft,
                top: smallTop,
                width: smallW,
                height: smallH,
                maxWidth: "none",
                filter: "contrast(1.06) saturate(1.08)",
                ...(photo2.cutBottom ? { WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 16%)", maskImage: "linear-gradient(to top, transparent 0%, #000 16%)" } : {}),
              }}
            />
          </div>
        </>
      )}

      {/* Crests in white discs, "V" (or the score) between them. */}
      {crests.some(Boolean) || names.some(Boolean) ? (
        <div style={{ position: "absolute", left: groupCx - groupW / 2, top: groupCy - discSize / 2, width: groupW, height: discSize, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Disc src={crests[0]} name={names[0] ?? ""} size={discSize} />
          {crests.length > 1 && (
            <>
              <div style={{ height: midSize, minWidth: midW, padding: showScore ? "0 14px" : 0, borderRadius: midSize, background: showScore ? INK : "#ffffff", color: showScore ? "#ffffff" : INK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: showScore ? 22 : 15, letterSpacing: showScore ? "0.08em" : 0, boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
                {showScore ? score : "V"}
              </div>
              <Disc src={crests[1]} name={names[1] ?? ""} size={discSize} />
            </>
          )}
        </div>
      ) : null}

      {/* Corner caption. */}
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 100, top: 112, display: "flex", flexDirection: "column", alignItems: flip ? "flex-end" : "flex-start", gap: 9 }}>
        {cap.map((t, i) => (
          <div key={i} style={capStyle(i, t)}>
            {t}
          </div>
        ))}
      </div>

      {/* Tiny vertical captions in the four margins. */}
      <Margin lines={topOuter} x={38} y={42} anchor={flip ? "right" : "left"} align="top" />
      <Margin lines={topInner} x={38} y={42} anchor={flip ? "left" : "right"} align="top" />
      <Margin lines={botOuter} x={38} y={60} anchor={flip ? "right" : "left"} align="bottom" />
      <Margin lines={botInner} x={38} y={60} anchor={flip ? "left" : "right"} align="bottom" />

      {/* Signature. */}
      {sig && (
        <div style={{ position: "absolute", [flip ? "left" : "right"]: 120, top: 1130, fontFamily: SCRIPT, fontSize: sigSize, lineHeight: 1, color: INK, whiteSpace: "nowrap", transform: `rotate(${-6 + r() * 3}deg)`, opacity: 0.88 }}>
          {sig}
          {data.player.number && <span style={{ marginLeft: "0.25em", fontSize: "0.7em" }}>{data.player.number}</span>}
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={22} onLight style={{ opacity: 0.8, color: INK }} />
      </div>
    </div>
  );
}
