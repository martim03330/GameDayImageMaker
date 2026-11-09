/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { lift, statText, tableRows } from "./column";
import { ARCHIVO, ARCHIVO_BLACK } from "./fx";
import { opponentOf, rng, tornRect } from "./kit";
import { standing } from "./mist";
import { competitionOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Archivo Black: digit advance and cap height, relative to the size. */
const DIGIT = 0.7;
const CAP = 0.72;

/** Background: the club colour, deep enough for white type (navy stays navy, yellow gets darker). */
function ground(data: RenderData): string {
  const p = data.params;
  const raw = p.primary === "#10131c" ? p.accent : p.primary;
  let c = luminance(raw) < 0.012 ? "#1a1c22" : raw;
  if (luminance(c) > 0.5) c = vivid(p.accent);
  if (luminance(c) > 0.3) c = shade(c, -0.35);
  if (luminance(c) > 0.3) c = shade(c, -0.3);
  return c;
}

/** A hand-drawn line: many small jittered segments, with a slight bow. */
function sketchLine(x1: number, y1: number, x2: number, y2: number, r: () => number, amp = 2.2): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(4, Math.round(len / 38));
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  const bow = (r() - 0.5) * 7;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = Math.sin(t * Math.PI) * bow + (i === 0 || i === n ? 0 : (r() - 0.5) * 2 * amp);
    pts.push(`${(x1 + (x2 - x1) * t + nx * off).toFixed(1)},${(y1 + (y2 - y1) * t + ny * off).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

/** The kicker in at most two lines, balanced. */
function twoLines(k: string): string[] {
  const w = k.split(/\s+/).filter(Boolean);
  if (w.length < 2 || k.length <= 10) return [k];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length);
    if (d < diff) [best, diff] = [i, d];
  }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
}

/**
 * Dayton "#2 preseason poll": the club colour with a faint grid, one giant white number drawn as a notebook
 * page (thin ruled lines, pencil marks) inside a sketchy hand-drawn frame, a torn strip of tape with a
 * distressed "#" stuck on its corner, and the player in action in front of it at the bottom. A bold italic
 * caption by the number (competition / the post's title), a tiny row of crest, agency mark and small print on top.
 */
export function Notebook({ data }: { data: RenderData }) {
  const { params, content, postType, player } = data;
  const seed = params.seed ?? 2;
  const r = rng(seed);
  const id = `nb-${seed % 997}`;
  const bg = ground(data);
  const flip = params.side === "right";
  const WHITE = "#ffffff";
  // Tape: the second colour when it is dark and stands out, else navy; on a dark ground a light tape.
  const acc = params.accent;
  let tape = luminance(acc) < 0.2 && Math.abs(luminance(acc) - luminance(bg)) > 0.03 ? acc : "#18213f";
  if (luminance(bg) < 0.06) tape = luminance(vivid(acc)) > 0.15 && vivid(acc) !== vivid(bg) ? vivid(acc) : "#e9e6df";
  const tapeInk = luminance(tape) > 0.4 ? "#141518" : WHITE;
  const frameInk = luminance(bg) < 0.06 ? "#e9e6df" : luminance(tape) < 0.2 ? shade(tape, -0.25) : "#141726";

  // ---- the number ----
  const stat = content.stats.find((s) => /^\d+$/.test(String(s.value)) && Number(s.value) > 0);
  const num = (player.number || (stat ? String(stat.value) : "") || "1").slice(0, 2);
  const n = [...num].length;
  const ts = params.textScale ?? 1;
  let size = (620 * ts) / CAP;
  let width = n * DIGIT * size;
  const maxW = n === 1 ? 520 : 700;
  if (width > maxW) {
    width = Math.max(maxW, width * 0.8);
    if (width > maxW) {
      size *= maxW / width;
      width = maxW;
    }
  }
  const cap = size * CAP;
  const numTop = 240;
  const base = numTop + cap;
  const cx = 540 + (flip ? -1 : 1) * (30 + r() * 20);
  const numL = cx - width / 2;
  const numR = cx + width / 2;

  // Sketchy frame: a little larger than the number, with overshooting corners.
  const fx0 = numL - 18 - r() * 10;
  const fx1 = numR + 14 + r() * 10;
  const fy0 = numTop - 10 - r() * 8;
  const fy1 = base + 6 + r() * 6;
  const over = 12;
  const frame = [0, 1].flatMap((pass) => [
    sketchLine(fx0 - over * r(), fy0 + pass * 2, fx1 + over * r(), fy0 - 2 + pass * 3, r),
    sketchLine(fx1 + pass * 2, fy0 - over * r(), fx1 - 2 + pass, fy1 + over * r(), r),
    sketchLine(fx1 + over * r(), fy1 + pass * 2, fx0 - over * r(), fy1 - 1 + pass * 2, r),
    sketchLine(fx0 - pass * 2, fy1 + over * r(), fx0 + 2 - pass, fy0 - over * r(), r),
  ]);

  // Pencil marks on the page (faint scribbles, as in a used notebook).
  const scribbles = Array.from({ length: 7 }, (_, i) => {
    const y = numTop + 60 + r() * (cap - 120);
    const x = numL + r() * width * 0.6;
    const w = 60 + r() * 160;
    return <path key={i} d={sketchLine(x, y, x + w, y + (r() - 0.5) * 6, r, 3)} stroke="#8c96a3" strokeWidth={1.2} fill="none" opacity={0.35} />;
  });

  // ---- tape with the "#" ----
  const tapeW = Math.min(230, Math.max(170, width * 0.36));
  const tapeH = tapeW * 0.78;
  const tapeX = flip ? numR - tapeW * 0.72 : numL - tapeW * 0.28;
  const tapeY = numTop - 10;
  const tapeRot = (flip ? 1 : -1) * (3 + r() * 4);

  // ---- the player ----
  const pcx = cx + (flip ? 1 : -1) * (60 + r() * 50);
  const floor = 1165;
  const headTop = 555;
  const placed = standing(data, { cx: pcx, headTop, floor, maxFace: 100, framing: "full" });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.3);

  // ---- caption ----
  const comp = competitionOf(data) || (data.club?.name ?? "").toUpperCase();
  const k = content.kicker.toUpperCase();
  const capLines = twoLines(k);
  const score = scoreOf(data);
  const opp = opponentOf(data).toUpperCase();
  const rows = tableRows(data, 3).filter((s) => String(s.value).trim() !== "0");
  const md = postType === "matchday" ? matchFacts(data) : null;
  const vsLine = md?.opp ? `VS ${md.opp}` : "";
  const extra = md
    ? [md.date, md.time].filter(Boolean).join(" · ")
    : postType === "goal"
      ? [opp ? `VS ${opp}` : "", score].filter(Boolean).join(" · ")
      : postType === "stats"
        ? rows.map(statText).join(" · ")
        : content.subline
            .split("·")
            .map((x) => x.trim().toUpperCase())
            .filter((x) => x && x !== comp)
            .join(" · ");
  const capRoom = 380;
  const capSize = Math.min(52, 300 / Math.max(4, Math.max(...capLines.map((l) => l.length)) * 0.5));
  const compSize = Math.min(34, capRoom / Math.max(3, comp.length * 0.62));
  const extraSize = Math.min(22, 300 / Math.max(3, extra.length * 0.5));
  const vsSize = vsLine ? Math.min(capSize * 0.62, 330 / Math.max(3, vsLine.length * 0.5 + (md?.oppCrest ? 1.6 : 0))) : 0;
  // Beside the player (outside his photo's box) when there is room there, else in the bottom corner.
  const capW = Math.max(...capLines.map((l) => l.length * capSize * 0.5), comp.length * compSize * 0.55, extra.length * extraSize * 0.55, (vsLine.length * 0.5 + (md?.oppCrest ? 1.6 : 0)) * vsSize);
  const roomL = box.left - 56;
  const roomR = CANVAS_W - 56 - (box.left + box.width);
  const capLeft = flip ? roomR < capW && roomL >= roomR : !(roomL < capW && roomR > roomL);
  const beside = (capLeft ? roomL : roomR) >= capW;
  const capTop = beside ? fy1 + 26 : Math.min(CANVAS_H - 70 - (compSize + capLines.length * capSize * 0.88 + (vsLine ? vsSize * 1.1 + 8 : 0) + (extra ? extraSize + 10 : 0)), floor + 10);
  const capStyle: CSSProperties = capLeft
    ? { left: beside ? Math.max(56, Math.min(fx0 - 10, box.left - capW - 20)) : 60, textAlign: "left" }
    : { right: beside ? Math.max(56, Math.min(CANVAS_W - fx1 - 10, CANVAS_W - (box.left + box.width) - capW - 20)) : 60, textAlign: "right" };

  // ---- small print ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const fine = [
    `${name}${player.position ? ` · ${player.position.toUpperCase()}` : ""}${player.number ? ` · NO. ${player.number}` : ""}.`,
    `${k}${content.subline ? ` · ${content.subline.toUpperCase()}` : ""}.`,
    md ? `${[vsLine, md.date, md.time, md.venue].filter(Boolean).join(" · ")}.` : "",
    `${(data.club?.name ?? "").toUpperCase()}${comp ? ` · ${comp}` : ""}.`,
    rows.length && !md ? `${rows.map(statText).join(" · ")}.` : "",
  ].filter(Boolean);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg }}>
      {/* Club colour, lighter towards the top, faint grid and grain. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(bg, 0.1)} 0%, ${bg} 45%, ${shade(bg, -0.3)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${flip ? 35 : 65}% 38%, rgba(255,255,255,.08), transparent 70%)` }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,.045) 0 1px, transparent 1px 54px), repeating-linear-gradient(to bottom, rgba(255,255,255,.045) 0 1px, transparent 1px 54px)",
        }}
      />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id={`${id}-ruled`} width={40} height={15} patternUnits="userSpaceOnUse" y={numTop}>
            <rect width={40} height={15} fill="#fbfbf9" />
            <rect y={13.6} width={40} height={1.1} fill="#a9b6c4" opacity={0.55} />
          </pattern>
          <mask id={`${id}-num`}>
            <text x={cx} y={base} textAnchor="middle" textLength={width} lengthAdjust="spacingAndGlyphs" fill="#fff" style={{ fontFamily: ARCHIVO_BLACK, fontSize: size }}>
              {num}
            </text>
          </mask>
          <filter id={`${id}-worn`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" seed={seed % 50} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -22 14.6" result="m" />
            <feComposite in="SourceGraphic" in2="m" operator="in" />
          </filter>
          <filter id={`${id}-soft`}>
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Shadow of the page on the colour. */}
        <text x={cx + 10} y={base + 16} textAnchor="middle" textLength={width} lengthAdjust="spacingAndGlyphs" fill="rgba(0,0,0,.35)" filter={`url(#${id}-soft)`} style={{ fontFamily: ARCHIVO_BLACK, fontSize: size }}>
          {num}
        </text>
        {/* The number as a notebook page. */}
        <g mask={`url(#${id}-num)`}>
          <rect x={numL - 40} y={numTop - 40} width={width + 80} height={cap + 80} fill={`url(#${id}-ruled)`} />
          <rect x={numL + width * 0.08} y={numTop - 40} width={1.6} height={cap + 80} fill="#d97a7a" opacity={0.35} />
          {scribbles}
        </g>
        {/* The hand-drawn frame. */}
        {frame.map((d, i) => (
          <path key={i} d={d} stroke={frameInk} strokeWidth={i < 4 ? 3 : 1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={i < 4 ? 0.95 : 0.7} />
        ))}
      </svg>

      {/* Torn tape with the distressed "#". */}
      <div style={{ position: "absolute", left: tapeX, top: tapeY, width: tapeW, height: tapeH, transform: `rotate(${tapeRot}deg)`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(tape, 0.12)}, ${tape} 50%, ${shade(tape, -0.12)})`, clipPath: tornRect(tapeW, tapeH, { top: false, bottom: false, left: true, right: true, amp: 5, seed: seed + 11 }) }} />
        <svg width={tapeW} height={tapeH} style={{ position: "absolute", inset: 0 }}>
          <text x={tapeW / 2} y={tapeH * 0.8} textAnchor="middle" fill={tapeInk} filter={`url(#${id}-worn)`} style={{ fontFamily: ARCHIVO_BLACK, fontSize: tapeH * 0.88 }}>
            #
          </text>
        </svg>
      </div>

      {/* Top row: crest, agency mark, small print. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        {data.club?.crestUrl && (
          <div style={{ width: 52, height: 52, borderRadius: 10, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={data.club.crestUrl} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
          </div>
        )}
        <AgencyLogo data={data} height={22} style={{ color: WHITE }} />
        <div style={{ width: 300, fontFamily: ARCHIVO, fontWeight: 400, fontSize: 8.5, lineHeight: 1.35, letterSpacing: "0.06em", color: WHITE, opacity: 0.72, textAlign: "justify" }}>
          {fine.join(" ")}
        </div>
      </div>

      {/* Floor shadow + player. */}
      {data.photoUrl && box.feet && (
        <div style={{ position: "absolute", left: box.faceCx - 280, width: 560, top: floor - 16, height: 34, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,0))", filter: "blur(5px)" }} />
      )}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04) drop-shadow(0 18px 30px rgba(0,0,0,.25))", ...figMask }} />
      )}

      {/* Caption. */}
      <div style={{ position: "absolute", top: capTop, ...capStyle, color: WHITE, fontFamily: CONDENSED, fontStyle: "italic", fontWeight: 800, textShadow: "0 2px 14px rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>
        {comp && <div style={{ fontSize: compSize, lineHeight: 0.9, fontWeight: 900, letterSpacing: "-0.01em" }}>{comp}</div>}
        {capLines.map((l, i) => (
          <div key={i} style={{ fontSize: capSize, lineHeight: 0.88, letterSpacing: "0.005em" }}>
            {l}
          </div>
        ))}
        {vsLine && (
          <div style={{ marginTop: 8, fontSize: vsSize, lineHeight: 1, fontWeight: 800, display: "flex", alignItems: "center", gap: vsSize * 0.3, justifyContent: capLeft ? "flex-start" : "flex-end" }}>
            {md?.oppCrest && <img src={md.oppCrest} alt="" style={{ width: vsSize * 1.1, height: vsSize * 1.1, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.3))" }} />}
            <span>{vsLine}</span>
          </div>
        )}
        {extra && extra !== comp && <div style={{ marginTop: 10, fontSize: extraSize, fontWeight: 700, fontStyle: "normal", letterSpacing: "0.12em", opacity: 0.85 }}>{extra}</div>}
      </div>
    </div>
  );
}
