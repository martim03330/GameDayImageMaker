/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { lift, statText, PRINT_GRAIN, tableRows } from "./column";
import { ARCHIVO, ARCHIVO_BLACK, DELA } from "./fx";
import { opponentOf, rng } from "./kit";
import { standing } from "./mist";
import { competitionOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Dela Gothic One: advance of a digit and cap height, relative to the size. */
const DELA_DIGIT = 0.86;
const DELA_CAP = 0.74;

/** The solid top colour: the club's own (navy stays navy, red stays red), never white. */
function panel(data: RenderData): string {
  const p = data.params;
  const raw = p.primary === "#10131c" ? p.accent : p.primary;
  if (luminance(raw) < 0.5) return luminance(raw) < 0.012 ? "#16181d" : raw;
  const v = vivid(p.accent);
  return luminance(v) < 0.5 ? v : shade(vivid(raw), -0.3);
}

/** "SAT 10 OCT" → "SAT 10 OCT · 15:00". */
const when = (d?: string, t?: string) => [d, t].filter(Boolean).join(" · ").toUpperCase();

/**
 * Manchester United "Dalot 20" wallpaper: the canvas split into a solid club colour above and paper below;
 * one giant wide, slanted shirt number sits across the split, white over the colour and club colour over
 * the paper. The player stands in front, feet on the paper with a thin shadow; a tiny spaced hashtag
 * at the top, the name small beside his legs ("DIOGO" / bold "DALOT"), the post's line on the other side.
 */
export function Splitnumber({ data }: { data: RenderData }) {
  const { params, content, postType, player } = data;
  const seed = params.seed ?? 20;
  const r = rng(seed);
  const id = `sn-${seed % 997}`;
  const top = panel(data);
  const paper = "#eeedeb";
  const ink = "#15161a";
  // The number's lower part, on the paper, in the club colour (a dark black club still reads).
  const lower = top;
  const nameLeft = params.side !== "right";

  // ---- the number ----
  const stat = content.stats.find((s) => /^\d+$/.test(String(s.value)) && Number(s.value) > 0);
  const num = (player.number || (postType === "renewal" && content.until ? content.until.slice(-2) : "") || (stat ? String(stat.value) : "") || "1").slice(0, 3);
  const n = [...num].length;
  const ts = params.textScale ?? 1;
  const capWanted = (n === 1 ? 480 : 430) * ts;
  let size = capWanted / DELA_CAP;
  const maxW = n === 1 ? 560 : 960;
  let width = n * DELA_DIGIT * size;
  if (width > maxW) {
    // Wider than the page: squeeze the glyphs a little, then shrink.
    width = Math.max(maxW, width * 0.82);
    if (width > maxW) {
      size *= maxW / width;
      width = maxW;
    }
  }
  const cap = size * DELA_CAP;
  const split = 815 + (r() - 0.5) * 30;
  const base = split + cap * 0.24;
  const skew = -11;
  const xc = 540 - (cap * Math.tan((-skew * Math.PI) / 180)) / 2;

  // ---- the player ----
  const cx = 540 + (r() - 0.5) * 40;
  const floor = 1150;
  const placed = standing(data, { cx, headTop: split - cap - 60, floor, maxFace: 105, framing: "full" });
  const { box, style: figMask } = lift(data, placed, split - cap - 60 + placed.faceH * 0.3);

  // ---- small type ----
  const hash = (data.club?.name ?? content.lastName).normalize("NFD").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().trim();
  const hashWords = hash.split(/\s+/).filter(Boolean);
  const hashA = hashWords.length > 1 ? hashWords[0] : "";
  const hashB = (hashWords.length > 1 ? hashWords.slice(1) : hashWords).join("");
  const hashSize = Math.min(22, 640 / Math.max(1, (hash.length + 1) * 1.1));

  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || content.firstName || "").toUpperCase();
  // Beside the legs, well clear of hips and hands; an action pose (wide cutout) spreads its limbs there,
  // so its texts go under the floor line instead, at the margins.
  const wide = box.width > box.height * 0.56 || !box.feet;
  const legHalf = Math.max(120, box.faceH * 2.1);
  // An action pose: the margin up to the edge of his figure (a leg or arm reaching out), so no line runs
  // over him now that the texts stay up beside the number.
  const leftRoom = wide ? Math.min(380, Math.max(210, box.left - 72 - 20)) : Math.max(170, box.faceCx - legHalf - 60);
  const rightRoom = wide ? Math.min(380, Math.max(210, CANVAS_W - (box.left + box.width) - 72 - 20)) : Math.max(170, CANVAS_W - (box.faceCx + legHalf) - 60);
  const room = nameLeft ? leftRoom : rightRoom;
  const roomR = nameLeft ? rightRoom : leftRoom;
  const lastSize = Math.min(wide ? 44 : 52, room / Math.max(3, last.length * 0.78));
  const firstSize = Math.min(26, lastSize * 0.55);

  const all = tableRows(data, 4);
  const nonZero = all.filter((s) => String(s.value).trim() !== "0");
  const rows = (nonZero.length ? nonZero : all).slice(0, 2);
  const [smallR, bigR] = ((): [string, string] => {
    const k = content.kicker.toUpperCase();
    switch (postType) {
      case "matchday": {
        const opp = opponentOf(data).toUpperCase();
        return [when(content.date, content.time) || competitionOf(data), opp ? `VS ${opp}` : k];
      }
      case "transfer":
        return [data.fromClub ? `FROM ${data.fromClub.name.toUpperCase()}` : k, (data.toClub ?? data.club)?.name?.toUpperCase() ?? k];
      case "renewal":
        return [k, content.until ? `UNTIL ${content.until}` : (data.club?.name ?? "").toUpperCase()];
      case "stats":
      case "potm":
        return [content.subline.toUpperCase() || k, rows.length ? rows.map(statText).join(" · ") : k];
      default:
        return [content.subline.toUpperCase(), k];
    }
  })();
  // Too long for its room at a readable size: two lines, split at the word nearest the middle.
  const bigRLines = ((): string[] => {
    if (roomR / Math.max(3, bigR.length * 0.72) >= 26) return [bigR];
    const w = bigR.split(" ");
    if (w.length < 2) return [bigR];
    let best = 1;
    for (let i = 1; i < w.length; i++) if (Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length) < Math.abs(w.slice(0, best).join(" ").length - w.slice(best).join(" ").length)) best = i;
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  })();
  const bigRSize = Math.min(34, ...bigRLines.map((l) => roomR / Math.max(3, l.length * 0.72)));
  const smallRSize = Math.min(18, roomR / Math.max(3, smallR.length * 0.66));
  const kickerLine = postType === "stats" || postType === "potm" ? content.kicker.toUpperCase() : "";

  // The name and the post's line always sit at the same height, just under the number (as on a standing pose):
  // an action pose only moves them out to the margins, never down to the logo (user, 2026-11-06: one spacing
  // for every player, Joaquim's).
  const blockY = base + 48;
  const atLeft: CSSProperties = wide ? { left: 72, textAlign: "left" } : { right: CANVAS_W - (box.faceCx - legHalf), textAlign: "right" };
  const atRight: CSSProperties = wide ? { right: 72, textAlign: "right" } : { left: box.faceCx + legHalf, textAlign: "left" };
  const blockL = nameLeft ? atLeft : atRight;
  const blockR = nameLeft ? atRight : atLeft;

  const numberText = (fill: string) => (
    <g transform={`translate(${xc} ${base}) skewX(${skew})`}>
      <text x={-width / 2} y={0} textLength={width} lengthAdjust="spacingAndGlyphs" fill={fill} style={{ fontFamily: DELA, fontSize: size }}>
        {num}
      </text>
    </g>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: paper }}>
      {/* Top: solid club colour, a soft light from above. */}
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: split, background: top }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: split, background: "radial-gradient(90% 70% at 50% 20%, rgba(255,255,255,.1), transparent 70%), linear-gradient(to bottom, transparent 60%, rgba(0,0,0,.12))" }} />
      {/* Bottom: paper, a touch greyer towards the foot. */}
      <div style={{ position: "absolute", left: 0, top: split, width: CANVAS_W, height: CANVAS_H - split, background: "linear-gradient(to bottom, #f1f0ee, #e3e2df)" }} />

      {/* The number, white over the colour, club colour over the paper. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={`${id}-a`}>
            <rect x={0} y={0} width={CANVAS_W} height={split} />
          </clipPath>
          <clipPath id={`${id}-b`}>
            <rect x={0} y={split} width={CANVAS_W} height={CANVAS_H - split} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-a)`}>{numberText(luminance(top) > 0.55 ? ink : "#f4f3f1")}</g>
        <g clipPath={`url(#${id}-b)`}>{numberText(lower)}</g>
      </svg>

      {/* Hashtag. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: ARCHIVO_BLACK, fontSize: hashSize, letterSpacing: "0.24em", whiteSpace: "nowrap" }}>
        <span style={{ color: luminance(top) > 0.3 ? ink : luminance(top) < 0.03 ? "#8d9098" : "#0d0e11" }}>#{hashA}</span>
        <span style={{ color: luminance(top) > 0.55 ? ink : "#ffffff" }}>{hashB}</span>
      </div>
      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 540 - 30, top: 70, width: 60, height: 60, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.25))" }} />}

      {/* Name beside the legs — behind him, so a leg reaching out passes in front of the line. */}
      <div style={{ position: "absolute", top: blockY, ...blockL, whiteSpace: "nowrap", lineHeight: 1 }}>
        {first && first !== last && <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: firstSize, color: lower, letterSpacing: "0.02em", marginBottom: 4 }}>{first}</div>}
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: lastSize, color: ink, letterSpacing: "0.01em" }}>{last}</div>
      </div>
      {/* The post's line on the other side. */}
      <div style={{ position: "absolute", top: blockY, ...blockR, whiteSpace: "nowrap", lineHeight: 1 }}>
        {smallR && <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: smallRSize, color: lower, letterSpacing: "0.04em", marginBottom: 6 }}>{smallR}</div>}
        {bigRLines.map((l) => (
          <div key={l} style={{ fontFamily: ARCHIVO_BLACK, fontSize: bigRSize, color: ink, lineHeight: 1.05 }}>{l}</div>
        ))}
        {kickerLine && kickerLine !== smallR && <div style={{ marginTop: 8, fontFamily: ARCHIVO, fontWeight: 600, fontSize: 15, color: ink, opacity: 0.6, letterSpacing: "0.18em" }}>{kickerLine}</div>}
      </div>

      {/* Thin contact shadow. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 260, width: 520, top: floor - 9, height: 18, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,0))", filter: "blur(3px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 150, width: 300, top: floor - 6, height: 10, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(4px)" }} />
        </>
      )}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05)", ...figMask }} />
      )}

      {/* Credit. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <AgencyLogo data={data} height={22} onLight style={{ color: ink, opacity: 0.85 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.06, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
