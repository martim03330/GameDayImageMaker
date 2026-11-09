/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import type { StatItem } from "@/lib/types";
import { cutMask, Film, GradientMapDefs } from "./fx";
import { Paper, rng } from "./kit";
import { competitionOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo, BEBAS, CONDENSED, DISPLAY, factRows } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const GREY = "#e2e2e4";

/** Bebas Neue: average advance of a digit and cap height, relative to the font size. */
const DIGIT_W = 0.4;
const CAP = 0.7;
/** The numbers are drawn taller than the font (the Kings' tall condensed figures). */
const STRETCH = 1.22;

/** Blends two hex colours (t = share of b). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** "2026 - 27": the season running today (it turns over in July). */
function season(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y} - ${String((y + 1) % 100).padStart(2, "0")}`;
}

/** Up to three short numbers worth a poster: the score first on a result, then the post's stats. */
function numbersOf(data: RenderData): StatItem[] {
  const ok = (s: StatItem) => !!s.value && s.value !== "—" && [...String(s.value)].length <= 5 && !!s.label;
  const score = scoreOf(data);
  // Zeros read as a bad night: left out unless nothing else is left.
  const all = data.content.stats.filter(ok);
  let rows = all.filter((s) => !/^0+$/.test(String(s.value).trim()));
  if (!rows.length) rows = all.slice(0, 1);
  if (data.postType === "result" && score) rows = [{ value: score, label: "Result" }, ...rows.filter((s) => s.value !== score)];
  if (data.postType === "goal" && score && rows.length < 3) rows = [...rows, { value: score, label: "Score" }];
  if (!rows.length) rows = factRows(data).filter(ok);
  if (!rows.length && data.player.number) rows = [{ value: data.player.number, label: data.player.position || "Shirt" }];
  return rows.slice(0, 3);
}

function Crosshair({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <svg width={44} height={44} style={{ position: "absolute", left: x - 22, top: y - 22 }}>
      <circle cx={22} cy={22} r={10} fill="none" stroke={color} strokeWidth={1.6} />
      <line x1={0} y1={22} x2={44} y2={22} stroke={color} strokeWidth={1.6} />
      <line x1={22} y1={0} x2={22} y2={44} stroke={color} strokeWidth={1.6} />
    </svg>
  );
}

/**
 * NBA stat-line poster (Kings, Westbrook triple double): light grey paper, a tall rounded photo card
 * with the player in black and white and club-colour shadows, and beside it the numbers stacked huge
 * in a tall condensed face, each over a club-colour label box. Name and a two-line caption under the
 * card, tiny vertical side notes and crosshair marks in the corners.
 */
export function Numbers({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 29);
  const flip = params.side === "left";
  const club0 = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // Label boxes carry white text and the duotone needs a dark end: light club colours are deepened.
  const lum = luminance(club0);
  const club = lum < 0.03 ? "#2b2c31" : lum > 0.4 ? shade(club0, -0.45) : lum > 0.25 ? shade(club0, -0.28) : club0;
  const ink = shade(club, -0.78);
  const ts = params.textScale ?? 1;
  const X = (left: number, width: number) => (flip ? CANVAS_W - left - width : left);

  // ---- the photo card ----
  const card = { left: X(108, 540), top: 118 + Math.round(r() * 10), width: 540, height: 850 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const SIZES: Record<string, number> = { chest: 250, waist: 205, knees: 160, full: 130 };
  let faceH = (SIZES[params.framing ?? "waist"] ?? 205) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(110, data.facePx * 1.25));
  const faceTop = 70 + r() * 30;
  // Always reaching the bottom of the card.
  const h = Math.max(faceH / face[3], (card.height + 20 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  const faceCx = card.width / 2 + (flip ? -1 : 1) * (r() - 0.5) * 50;
  const fig = {
    left: faceCx - w * (face[0] + face[2] / 2) + (params.playerX ?? 0),
    top: faceTop - h * face[1] + (params.playerY ?? 0),
    width: w,
    height: h,
  };

  // ---- the numbers ----
  const rows = numbersOf(data);
  const colW = 300;
  const col = { left: X(700, colW), width: colW };
  const n = Math.max(1, rows.length);
  const zoneTop = 140;
  const zoneBottom = 1215;
  const labelH = n === 1 ? 70 : 58;
  const gapAfter = n === 1 ? 0 : n === 2 ? 90 : 52;
  const blockH = (zoneBottom - zoneTop - gapAfter * (n - 1)) / n;
  const capMax = blockH - labelH - 26;
  const numberSize = (v: string) => Math.min(capMax / (CAP * STRETCH), (colW - 10) / Math.max(1.4, [...v].length * DIGIT_W * (/[-.:]/.test(v) ? 0.92 : 1))) * ts;
  // Blocks stacked from their real heights, centred on the card.
  const heights = rows.map((s) => numberSize(String(s.value)) * CAP * STRETCH + 26 + labelH);
  const stackH = heights.reduce((a, b) => a + b, 0) + gapAfter * (n - 1);
  const tops = heights.map((_, i) => (zoneTop + zoneBottom) / 2 - stackH / 2 + heights.slice(0, i).reduce((a, b) => a + b, 0) + gapAfter * i);

  // ---- text under the card ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min(96, card.width / Math.max(1, [...name].length * 0.43));
  const line1 = content.kicker.toUpperCase();
  const round = roundOf(data);
  const line2 = (postType === "potm" ? content.subline.toUpperCase() : round) || competitionOf(data);
  const fit = (t: string, max: number) => Math.min(max, (card.width + 20) / Math.max(1, [...t].length * 0.5));
  const club1 = (data.club?.name ?? "").toUpperCase();
  const sideLeft = [club1, competitionOf(data) || line1].filter(Boolean);
  const tiny: CSSProperties = { fontFamily: CONDENSED, fontWeight: 600, fontSize: 15, letterSpacing: "0.34em", color: ink, whiteSpace: "nowrap", opacity: 0.85 };
  const id = `num-${params.seed ?? 0}`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: ink }}>
      <GradientMapDefs id={`${id}-fig`} dark={shade(club, -0.55)} mid="#8e8d93" light="#fbfbfb" />
      <GradientMapDefs id={`${id}-bg`} dark={shade(club, -0.6)} mid={mix(shade(club, -0.2), "#707076", 0.55)} light="#d9d9de" />
      <Paper color={GREY} strength={1.6} />

      {/* Corner tab with the crest. */}
      <div style={{ position: "absolute", left: flip ? CANVAS_W - 136 : 0, top: 0, width: 136, height: 92, background: club, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 66, height: 66, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.3))" }} />}
      </div>
      <Crosshair x={flip ? 44 : CANVAS_W - 44} y={42} color={ink} />
      <Crosshair x={flip ? CANVAS_W - 44 : 44} y={CANVAS_H - 42} color={ink} />

      {/* The card: his own photo blurred into a club-tinted wall, the cutout in black and white over it. */}
      <div style={{ position: "absolute", ...card, borderRadius: 22, overflow: "hidden", background: shade(club, -0.45), boxShadow: "0 18px 40px rgba(0,0,0,.18)" }}>
        {data.bgPhotoUrl && (
          <img
            src={data.bgPhotoUrl}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: card.width + 120, height: card.height + 120, maxWidth: "none", objectFit: "cover", filter: `url(#${id}-bg) blur(18px) brightness(.8)` }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 55% at 50% 30%, ${shade(club, 0.15)}55, transparent 70%), linear-gradient(to bottom, transparent 55%, ${shade(club, -0.6)}88)` }} />
        {data.photoUrl && (
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.35))" }}>
            <img
              src={data.photoUrl}
              alt=""
              style={{ position: "absolute", ...fig, maxWidth: "none", filter: `url(#${id}-fig) contrast(1.12)`, ...(data.photoIsCutout ? cutMask(data.cut) : {}) }}
            />
          </div>
        )}
        {/* Print grain on the photo only. */}
        <Film strength={1.4} />
      </div>

      {/* Name and caption under the card. */}
      <div style={{ position: "absolute", left: card.left - 10, width: card.width + 20, top: 992, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: nameSize * ts, lineHeight: 1.05, color: ink, whiteSpace: "nowrap", transform: "scaleY(1.08)" }}>{name}</div>
        <div style={{ marginTop: 14, fontFamily: CONDENSED, fontWeight: 700, fontSize: fit(line1, 30), lineHeight: 1.2, letterSpacing: "0.02em", color: ink, whiteSpace: "nowrap" }}>{line1}</div>
        {line2 && <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: fit(`(${line2})`, 30), lineHeight: 1.2, letterSpacing: "0.02em", color: ink, whiteSpace: "nowrap" }}>({line2})</div>}
      </div>

      {/* The numbers. */}
      {rows.map((s, i) => {
        const v = String(s.value).toUpperCase();
        const size = numberSize(v);
        const cap = size * CAP * STRETCH;
        const top = tops[i];
        const label = s.label.toUpperCase();
        return (
          <div key={i} style={{ position: "absolute", left: col.left, width: col.width, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ height: cap, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ fontFamily: BEBAS, fontSize: size, lineHeight: 1, color: "#101114", transform: `scaleY(${STRETCH})`, transformOrigin: "50% 100%", marginBottom: -size * 0.1, whiteSpace: "nowrap" }}>{v}</div>
            </div>
            <div
              style={{
                marginTop: 26,
                width: colW - 60,
                height: labelH,
                background: club,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: CONDENSED,
                fontWeight: 700,
                fontSize: Math.min(n === 1 ? 40 : 34, (colW - 90) / Math.max(1, [...label].length * 0.55)),
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                boxShadow: `inset 0 0 0 2px ${shade(club, -0.25)}`,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}

      {/* Tiny vertical notes on both edges. */}
      <div style={{ position: "absolute", left: flip ? CANVAS_W - 58 : 36, top: 470, height: 440, display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", ...tiny, fontSize: Math.min(15, 430 / Math.max(1, sideLeft.join("  →  ").length * 0.85)) }}>
        {sideLeft.join("   →   ")}
      </div>
      <div style={{ position: "absolute", left: flip ? 36 : CANVAS_W - 58, top: 470, height: 440, display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", ...tiny }}>{season()}</div>

      <AgencyLogo data={data} onLight height={24} style={{ position: "absolute", [flip ? "left" : "right"]: 150, top: 34, opacity: 0.85, color: ink }} />
      <Film strength={0.6} />
    </div>
  );
}
