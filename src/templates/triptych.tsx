/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import type { CutEdges } from "@/lib/types";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, SANS, SERIF } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Barlow Condensed 500: advance widths per 100px of font size (measured in the browser). */
const BARLOW_W: Record<string, number> = { "0": 44.7, "1": 25.1, "2": 41.5, "3": 41.8, "4": 44, "5": 42, "6": 42, "7": 38.1, "8": 42.9, "9": 41.4, A: 46.1, B: 45.1, C: 45.2, D: 46.4, E: 43.2, F: 41, G: 45.7, H: 47.5, I: 22, J: 43.5, K: 46.6, L: 40.7, M: 53, N: 50.1, O: 46.2, P: 45.1, Q: 45, R: 45.3, S: 42.6, T: 43.9, U: 47.7, V: 45.7, W: 64.6, X: 44.9, Y: 44.2, Z: 40.1, " ": 20, "-": 29.6, "'": 13.7, ".": 20.2, ":": 23.4, "/": 36.3, "&": 56.4 };
const barlowEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BARLOW_W[c] ?? 45) / 100 + tracking, -tracking);
/** Cap height of Barlow Condensed, relative to the font size. */
const CAP = 0.7;

const PAPER = "#e7ddcc";
const CREAM = "#f1e8d8";

/** Warm paper fibres. */
const PAPER_TEX = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .42  0 0 0 0 .36  0 0 0 0 .28  0 0 0 1.6 -0.62'/></filter><rect width='100%' height='100%' filter='url(#p)'/></svg>`,
)}")`;
const BLOTCH = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='700'><filter id='b'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='4' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .44  0 0 0 0 .36  0 0 0 1.2 -0.4'/></filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`,
)}")`;
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

type Shot = { url: string; original: string | null; face: [number, number, number, number]; aspect: number; cut: CutEdges; main: boolean };

/** Title lines: one word stays on one line; a long kicker ("MAN OF THE MATCH") breaks into two balanced lines. */
function titleLines(kicker: string): string[] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim().replace(/^FULLTIME$/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length < 2 || [...k].length <= 10) return [k];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(barlowEm(words.slice(0, i).join(" "), 0) - barlowEm(words.slice(i).join(" "), 0));
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Three-portrait matchday (Aston Villa "MATCHDAY"): warm textured paper, a rounded frame holding three
 * tall photo panels of the player, each a close bust set by his face over his own photo blurred and
 * washed in a dark club tone, a very tall, thin condensed title in cream across the lower half of all
 * three with the fixture on a fine rule above it, both crests as small marks at the top and the
 * competition · kick-off · ground in a quiet line under the frame.
 */
export function Triptych({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 29;
  const r = rng(seed);
  const right = params.side !== "left";

  // Club tones, kept deep enough for cream type over them.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  let second = vivid(params.accent);
  if (luminance(second) > 0.5 || luminance(second) < 0.02 || second === club) second = shade(club, 0.25);
  const ink = luminance(club) < 0.05 ? "#2b1a14" : shade(club, -0.55);
  const tints = [shade(club, -0.52), shade(second, -0.5), shade(club, -0.3)];

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");

  /* ---- the three photos: the chosen one in the middle, others either side; one photo shown three ways ---- */
  const all: Shot[] = data.cutouts
    .filter((c) => c.face)
    .map((c) => ({ url: c.url, original: c.original, face: c.face!, aspect: c.aspect ?? 0.6, cut: c.cut ?? {}, main: c.url === data.photoUrl }));
  if (data.photoUrl && !all.some((s) => s.main)) all.unshift({ url: data.photoUrl, original: data.bgPhotoUrl, face: data.face ?? [0.38, 0.08, 0.24, 0.12], aspect: data.photoAspect ?? 0.6, cut: data.cut ?? {}, main: true });
  const main = all.find((s) => s.main) ?? all[0];
  const others = all.filter((s) => s !== main);
  // Rotate the extra photos by seed so a re-roll shows other pictures.
  const off = others.length ? seed % others.length : 0;
  const pickOther = (k: number) => (others.length ? others[(off + k) % others.length] : main);
  const shots = main ? (right ? [pickOther(0), main, pickOther(1)] : [pickOther(1), main, pickOther(0)]) : [];
  // Side panels repeating the middle photo get their own crop and grade.
  const same = shots.map((s, i) => (i === 0 && s === shots[1]) || (i === 2 && (s === shots[1] || s === shots[0])));

  /* ---- frame ---- */
  const F = { x: 120, y: 140, w: 840, h: 1050 };
  const PW = F.w / 3;
  const radius = 36;

  /* ---- title: tall and thin, drawn condensed further ---- */
  const lines = titleLines(content.kicker);
  const squeeze = 0.45;
  const tracking = 0.02;
  const widest = Math.max(...lines.map((l) => barlowEm(l, tracking)));
  const maxW = lines.length > 1 ? 720 : 560;
  const size = Math.min(lines.length > 1 ? 220 : 290, maxW / (widest * squeeze)) * (params.textScale ?? 1);
  const pitch = size * CAP * 1.14;
  const titleBottom = F.y + F.h - 230 + (params.textY ?? 0);
  const titleTop = titleBottom - size * CAP - (lines.length - 1) * pitch;

  // Faces sit in the upper part of each panel, chins well clear of the fixture rule over the title.
  const ruleY = titleTop - 44;
  const faceRoomBottom = ruleY - 70;

  const placed = shots.map((s, i) => {
    const baseTop = [F.y + 150, F.y + 105, F.y + 175][i] + (same[i] && i === 0 ? 60 : 0) + (r() - 0.5) * 30;
    // The same photo again: a different crop (tighter or looser) so the three panels never look copied.
    let fh = ([240, 270, 225][i] + (r() - 0.5) * 20) * (params.playerScale ?? 1);
    if (s.main && data.facePx > 0) fh = Math.min(fh, Math.max(110, data.facePx * 1.9));
    fh = Math.min(fh, faceRoomBottom - baseTop, PW * 1.12);
    // After the caps, so the crops really differ: a looser shot (more shirt) and a slightly smaller one.
    if (same[i]) fh *= i === 0 ? 0.74 : 0.87;
    const [fx, fy, fw, fhr] = s.face;
    // Tall enough to reach the panel's foot, but never a face too big for the panel.
    let h = Math.max(fh / fhr, (F.y + F.h + 20 - baseTop) / Math.max(0.2, 1 - fy));
    h = Math.min(h, Math.min(330, PW * 1.2) / fhr);
    const w = h * s.aspect;
    const cx = F.x + PW * (i + 0.5) + (same[i] ? (i === 0 ? 34 : -22) : 0);
    const left = cx - w * (fx + fw / 2) + (params.playerX ?? 0) * 0.4 - (F.x + PW * i);
    const top = baseTop - h * fy + (params.playerY ?? 0) - F.y;
    return { s, left, top, w, h, faceH: fhr * h };
  });

  /* ---- words ---- */
  const ours = (data.club?.name ?? "").toUpperCase();
  const homeFirst = content.home !== false;
  const [nameA, nameB] = homeFirst ? [ours, f.opp] : [f.opp, ours];
  const middle = postType !== "matchday" && score ? score : "vs";
  const fixtureLen = [...`${nameA} ${middle} ${nameB}`].length;
  const fixtureSize = Math.max(15, Math.min(25, 520 / Math.max(1, fixtureLen * 0.7)));
  const crests = (homeFirst ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  const centre = postType === "matchday" ? (f.time ? `KICK OFF ${f.time}` : f.longDate) : score ? `FULL TIME ${score.replace(/ /g, "")}` : f.longDate || (f.time ? `KICK OFF ${f.time}` : "");
  const leftText = f.comp || f.round || (data.club?.name ?? "").toUpperCase();
  const rightText = f.venue || f.longDate;
  const fitRow = (t: string, room = 270, max = 23) => Math.max(15, Math.min(max, room / Math.max(1, [...t].length * 0.62)));
  const rowStyle = (t: string, weight: number, align: CSSProperties["textAlign"]): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: fitRow(t),
    lineHeight: 1.15,
    letterSpacing: "0.02em",
    color: ink,
    width: 280,
    textAlign: align,
    textWrap: "balance",
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: ink }}>
      {/* Paper: soft blotches and fibres. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: BLOTCH, backgroundSize: "900px 900px", opacity: 0.35, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_TEX, backgroundSize: "300px 300px", opacity: 0.55, mixBlendMode: "multiply" }} />

      {/* Crests as small marks over the frame. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 46, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          {crests.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {i > 0 && <div style={{ width: 1.5, height: 46, background: ink, opacity: 0.45 }} />}
              <img src={c} alt="" style={{ width: 66, height: 66, objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(60,40,20,.2))" }} />
            </div>
          ))}
        </div>
      )}

      {/* The frame with three panels. */}
      <div style={{ position: "absolute", left: F.x, top: F.y, width: F.w, height: F.h, borderRadius: radius, overflow: "hidden", background: "#15110f", boxShadow: "0 2px 0 rgba(255,255,255,.25), 0 18px 40px rgba(60,40,20,.18)" }}>
        {placed.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: PW * i, top: 0, width: PW, height: F.h, overflow: "hidden", background: tints[i] }}>
            {/* His own photo, far out of focus, washed in a dark club tone. */}
            {(p.s.original ?? data.bgPhotoUrl) && (
              <img
                src={p.s.original ?? data.bgPhotoUrl!}
                alt=""
                style={{ position: "absolute", left: -120, top: -120, width: PW + 240, height: F.h + 240, maxWidth: "none", objectFit: "cover", objectPosition: `${[30, 50, 70][i]}% 30%`, filter: "blur(22px) saturate(.8) brightness(.8)", opacity: 0.85 }}
              />
            )}
            <div style={{ position: "absolute", inset: 0, background: tints[i], mixBlendMode: "multiply", opacity: 0.9 }} />
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 45% at 50% 28%, ${shade(tints[i], 0.25)}aa, transparent 70%)` }} />
            {/* The player, set by his face. */}
            <img
              src={p.s.url}
              alt=""
              style={{
                position: "absolute",
                left: p.left,
                top: p.top,
                width: p.w,
                height: p.h,
                maxWidth: "none",
                filter: `contrast(1.06) saturate(${same[i] && i === 0 ? 0.25 : 0.92}) sepia(.08) drop-shadow(0 20px 30px rgba(0,0,0,.45))`,
                ...cutMask(p.s.cut),
              }}
            />
            {/* Low, warm falloff into the foot of the panel, and a soft shadow at each join. */}
            {/* Darker from the fixture rule down, so the cream type holds over a white or red shirt. */}
            <div style={{ position: "absolute", left: 0, right: 0, top: ruleY - F.y - 170, bottom: 0, background: `linear-gradient(to bottom, transparent, ${shade(tints[i], -0.5)}99 170px, ${shade(tints[i], -0.6)}c4 100%)` }} />
            {i > 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 26, background: "linear-gradient(to right, rgba(0,0,0,.35), transparent)" }} />}
          </div>
        ))}

        {/* Fixture on a fine rule with ringed ends. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: ruleY - F.y - fixtureSize * 0.6, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
          <svg width={96} height={12} aria-hidden>
            <circle cx={6} cy={6} r={4} fill="none" stroke={CREAM} strokeWidth={1.6} />
            <line x1={10} y1={6} x2={96} y2={6} stroke={CREAM} strokeWidth={1.6} />
          </svg>
          <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: fixtureSize, letterSpacing: "0.05em", color: CREAM, whiteSpace: "nowrap", lineHeight: 1.2, textShadow: "0 2px 10px rgba(0,0,0,.45)" }}>
            {nameA}
            {nameB && (
              <span style={{ fontSize: middle === "vs" ? fixtureSize * 0.82 : fixtureSize, margin: "0 0.45em", fontStyle: middle === "vs" ? "italic" : "normal" }}>{middle}</span>
            )}
            {nameB}
          </div>
          <svg width={96} height={12} aria-hidden>
            <line x1={0} y1={6} x2={86} y2={6} stroke={CREAM} strokeWidth={1.6} />
            <circle cx={90} cy={6} r={4} fill="none" stroke={CREAM} strokeWidth={1.6} />
          </svg>
        </div>

        {/* Title: very tall, thin condensed caps across all three panels. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: titleTop - F.y - size * (1 - CAP) * 0.62,
            fontFamily: CONDENSED,
            fontWeight: 500,
            fontSize: size,
            lineHeight: `${pitch}px`,
            letterSpacing: `${tracking}em`,
            color: CREAM,
            textAlign: "center",
            whiteSpace: "nowrap",
            transform: `scaleX(${squeeze})`,
            transformOrigin: "center top",
            textShadow: "0 6px 26px rgba(0,0,0,.35)",
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>

        <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
      </div>

      {/* Competition · kick-off · ground under the frame. */}
      <div style={{ position: "absolute", left: F.x, width: F.w, top: F.y + F.h + 30, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={rowStyle(leftText, 500, "left")}>{leftText}</div>
        <div style={rowStyle(centre, 800, "center")}>{centre}</div>
        <div style={rowStyle(rightText, 500, "right")}>{rightText}</div>
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", left: "50%", bottom: 24 + (params.logoY ?? 0) * -1, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.1, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}
