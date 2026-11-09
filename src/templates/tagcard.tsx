/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask, MARKER } from "./fx";
import { rng } from "./kit";
import { scoreOf, sceneOf } from "./outline";
import { AgencyLogo, CONDENSED, MONO } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#ece5d5";
const CREAM = "#f4efe4";
const BAR = "#1c1a19";

/** Permanent Marker: advance widths per 100px of font size (measured in the browser). */
const MARKER_W: Record<string, number> = { "0": 68.7, "1": 32.2, "2": 65, "3": 56.2, "4": 58.2, "5": 58, "6": 50.1, "7": 57.6, "8": 53.7, "9": 52.9, A: 70.2, B: 68.7, C: 59.4, D: 58, E: 62.7, F: 57.5, G: 78.9, H: 69.5, I: 51.6, J: 66.9, K: 77.6, L: 63.3, M: 97.4, N: 68.5, O: 74.4, P: 64, Q: 74.4, R: 64.6, S: 57.6, T: 60.7, U: 69.5, V: 58.4, W: 99.4, X: 62.3, Y: 49.3, Z: 66.4, " ": 37, "-": 60.9, "'": 26.6, ".": 22.9, ":": 24.1, "/": 40.1, "&": 60 };
const markerW = (c: string) => (MARKER_W[c.normalize("NFD").replace(/\p{M}/gu, "")] ?? 66) / 100;
const markerEm = (t: string, tracking: number) => [...t].reduce((a, c) => a + markerW(c) + tracking, -tracking);

/** Archivo Black: advance widths per 100px (digits, colon, dash, P/M). */
const ARCHIVO_W: Record<string, number> = { ":": 33.3, "-": 33.3, " ": 33.3, A: 77.8, P: 72.2, M: 94.4, F: 66.7, T: 72.2 };
const archivoEm = (t: string) => [...t].reduce((a, c) => a + (ARCHIVO_W[c] ?? 66.7) / 100, 0);

const PAPER_TEX = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4  0 0 0 0 .36  0 0 0 0 .3  0 0 0 1.5 -0.6'/></filter><rect width='100%' height='100%' filter='url(#p)'/></svg>`,
)}")`;
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** The tag text in one or two lines: a long kicker would be too small on one. */
function tagLines(kicker: string, room: number, tracking: number): { lines: string[]; size: number } {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim();
  const one = Math.min(150, room / markerEm(k, tracking));
  const words = k.split(/\s+/).filter(Boolean);
  if (one >= 100 || words.length < 2) return { lines: [k], size: one };
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(markerEm(words.slice(0, i).join(" "), tracking) - markerEm(words.slice(i).join(" "), tracking));
    if (d < diff) [diff, best] = [d, i];
  }
  const lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  return { lines, size: Math.min(130, room / Math.max(...lines.map((l) => markerEm(l, tracking)))) };
}

/**
 * Game-week card (USC Trojans v Aggies): cream paper, a big rounded photo card with the player over a
 * stadium scene (his head breaking out of the top), the title sprayed across the card in white marker
 * with a fine glow, drips and an arrow, a thin hand-drawn line looping off the corner, a dark bar with
 * both crests and "OURS versus THEM", and under it the competition beside the kick-off set big.
 */
export function Tagcard({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 18;
  const r = rng(seed);
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45 || luminance(club) < 0.02) club = "#b3202a";
  let pop = vivid(params.accent);
  if (luminance(pop) < 0.06 || luminance(pop) > 0.8 || Math.abs(luminance(pop) - luminance(club)) < 0.05) pop = "#f2b632";
  const ink = shade(club, -0.6);

  const f = matchFacts(data);
  const score = scoreOf(data, "-");
  const scene = sceneOf(data);

  /* ---- card ---- */
  const C = { x: 130, y: 150, w: 820, h: 860 };
  const barH = 124;
  const barTop = C.y + C.h;

  /* ---- player: head at the top of the card, breaking out of it ---- */
  const want = ({ chest: 250, waist: 220, knees: 195, full: 175 } as Record<string, number>)[params.framing ?? "waist"] ?? 220;
  const faceX = right ? 600 : 480;
  const faceTop = C.y + 34;
  const box = placeFace(data, faceX, faceTop, want, barTop + 40);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;

  /* ---- the tag ---- */
  const tracking = -0.02;
  const { lines, size } = tagLines(content.kicker, C.w - 170, tracking);
  const tilt = -5;
  const lineH = size * 0.95;
  const tagH = lineH * lines.length;
  const tagW = Math.max(...lines.map((l) => markerEm(l, tracking))) * size;
  // Below his chin (rotation lifts one end), above the bar.
  const tilted = Math.sin((Math.abs(tilt) * Math.PI) / 180) * (tagW / 2);
  const tagTop = Math.min(barTop - tagH - 70, Math.max(chin + 60 + tilted, C.y + C.h * 0.5 + (params.textY ?? 0)));
  const tagLeft = C.x + (C.w - tagW) / 2 - 20;
  // Drips under a few letters of the last line.
  const last = lines[lines.length - 1];
  const starts: number[] = [];
  [...last].reduce((x, ch) => (starts.push(x), x + (markerW(ch) + tracking) * size), 0);
  const lastW = markerEm(last, tracking) * size;
  const lastLeft = (tagW - lastW) / 2;
  const drips = [...last]
    .map((ch, i) => ({ ch, x: lastLeft + starts[i] + markerW(ch) * size * (0.3 + r() * 0.4) }))
    .filter((d, i) => d.ch !== " " && (i % 3 === seed % 3 || r() > 0.8))
    .slice(0, 4)
    .map((d) => ({ x: d.x, len: 18 + r() * 40, w: 6.5 + r() * 3 }));

  /* ---- words ---- */
  const ours = (data.club?.name ?? "").toUpperCase();
  const homeFirst = content.home !== false;
  const [nameA, nameB] = homeFirst ? [ours, f.opp] : [f.opp, ours];
  const [crestA, crestB] = homeFirst ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest];
  const nameRoom = (C.w - barH * 2 - 140) / 2 - 20;
  const nameSize = (t: string) => Math.max(17, Math.min(34, nameRoom / Math.max(1, [...t].length * 0.62)));
  const nameStyle = (t: string, align: "left" | "right"): CSSProperties => ({
    fontFamily: CONDENSED,
    fontWeight: 700,
    fontSize: nameSize(t),
    letterSpacing: "0.12em",
    lineHeight: 1.05,
    color: CREAM,
    width: nameRoom,
    textAlign: align,
    textWrap: "balance",
  });
  const middle = postType !== "matchday" && score ? score : "VERSUS";

  const big = postType === "matchday" ? f.time || f.longDate : score || f.time || f.longDate;
  const bigLabel = postType === "matchday" ? (f.time ? "KO" : "") : score ? "FT" : "";
  const bigSize = Math.min(96, 360 / Math.max(1, archivoEm(big)));
  const topLine = [postType === "matchday" || !score ? f.longDate : f.longDate, f.venue].filter(Boolean).filter((t) => t !== big).join("  |  ");
  const topSize = Math.max(13, Math.min(19, 460 / Math.max(1, [...topLine].length * 0.6)));
  const comp = f.comp || f.round || ours;
  const compWords = comp.split(/\s+/);
  // The competition in two short stacked lines when it is long.
  const compLines = comp.length > 14 && compWords.length > 1 ? [compWords.slice(0, Math.ceil(compWords.length / 2)).join(" "), compWords.slice(Math.ceil(compWords.length / 2)).join(" ")] : [comp];
  const compSize = Math.max(16, Math.min(34, 230 / Math.max(1, Math.max(...compLines.map((l) => l.length)) * 0.68)));

  /* ---- the hand-drawn line off the top corner ---- */
  const lx = right ? C.x - 40 : C.x + C.w + 40;
  const s = right ? 1 : -1;
  const loop = `M ${lx} ${C.y - 70} c ${s * 40} 10 ${s * 70} 40 ${s * 30} 70 s ${s * -70} 20 ${s * -40} 60 c ${s * 30} 30 ${s * 90} 0 ${s * 80} 40 s ${s * -50} 40 ${s * -20} 70 c ${s * 20} 20 ${s * 60} 20 ${s * 70} 40`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: BAR }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_TEX, backgroundSize: "300px 300px", opacity: 0.45, mixBlendMode: "multiply" }} />

      {/* The photo card. */}
      <div style={{ position: "absolute", left: C.x, top: C.y, width: C.w, height: C.h, borderRadius: "34px 34px 0 0", overflow: "hidden", background: shade(club, -0.55) }}>
        {scene ? (
          <img src={scene} alt="" style={{ position: "absolute", inset: -20, width: C.w + 40, height: C.h + 40, maxWidth: "none", objectFit: "cover", filter: "blur(5px) saturate(1.15) contrast(1.05)" }} />
        ) : (
          data.bgPhotoUrl && <img src={data.bgPhotoUrl} alt="" style={{ position: "absolute", inset: -80, width: C.w + 160, height: C.h + 160, maxWidth: "none", objectFit: "cover", filter: "blur(26px) saturate(1.1)" }} />
        )}
        {/* Sun-faded print: a warm wash, sprayed colour clouds at the top, darker towards the bar. */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(230,200,150,.12)", mixBlendMode: "soft-light" }} />
        <div style={{ position: "absolute", left: -80, top: -90, width: 520, height: 300, borderRadius: "50%", background: pop, filter: "blur(50px)", opacity: 0.55, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", right: -100, top: -60, width: 480, height: 260, borderRadius: "50%", background: pop, filter: "blur(55px)", opacity: 0.45, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,.35))" }} />
      </div>

      {/* The player, clipped by the card's sides and foot but free above it. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: C.x, top: 0, width: C.w, height: barTop, clipPath: "inset(0 0 0 0)", overflow: "hidden" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left - C.x, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.06) drop-shadow(0 18px 30px rgba(0,0,0,.4))", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Club chip on the card's edge. */}
      {f.ourCrest && (
        <div style={{ position: "absolute", [right ? "right" : "left"]: CANVAS_W - (C.x + C.w) - 30, top: C.y + C.h * 0.36, width: 64, height: 64, borderRadius: 10, background: club, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,.3)" }}>
          <img src={f.ourCrest} alt="" style={{ width: 46, height: 46, objectFit: "contain" }} />
        </div>
      )}

      {/* The sprayed tag. */}
      <div style={{ position: "absolute", left: tagLeft, top: tagTop, width: tagW, height: tagH, transform: `rotate(${tilt}deg)`, transformOrigin: "center" }}>
        <div
          style={{
            fontFamily: MARKER,
            fontSize: size,
            lineHeight: `${lineH}px`,
            letterSpacing: `${tracking}em`,
            textAlign: "center",
            whiteSpace: "nowrap",
            color: "#fbfaf6",
            WebkitTextStroke: `2px ${BAR}`,
            paintOrder: "stroke fill",
            textShadow: "0 0 10px rgba(255,255,255,.55), 0 0 26px rgba(255,255,255,.35), 0 4px 16px rgba(0,0,0,.35)",
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <svg width={tagW + 200} height={tagH + 80} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
          {drips.map((d, i) => {
            // From the baseline of the last line, straight down (undoing the tilt), thinning to a bead.
            const y0 = (lines.length - 1) * lineH + size * 0.7;
            const path = `M ${d.x - d.w / 2} ${y0} L ${d.x - d.w * 0.32} ${y0 + d.len} L ${d.x + d.w * 0.32} ${y0 + d.len} L ${d.x + d.w / 2} ${y0} Z`;
            return (
              <g key={i} transform={`rotate(${-tilt} ${d.x} ${y0})`}>
                <path d={path} fill="#fbfaf6" stroke={BAR} strokeWidth={1.6} paintOrder="stroke" />
                <circle cx={d.x} cy={y0 + d.len} r={d.w * 0.62} fill="#fbfaf6" stroke={BAR} strokeWidth={1.4} paintOrder="stroke" />
                <path d={`M ${d.x - d.w / 2 + 0.8} ${y0 - 2} L ${d.x - d.w * 0.3} ${y0 + d.len} L ${d.x + d.w * 0.3} ${y0 + d.len} L ${d.x + d.w / 2 - 0.8} ${y0 - 2} Z`} fill="#fbfaf6" />
              </g>
            );
          })}
          {/* An arrow sprayed off the end. */}
          <path d={`M ${tagW + 6} ${tagH * 0.62} q 60 -8 130 4`} fill="none" stroke="#fbfaf6" strokeWidth={4.5} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.6))" }} />
          <path d={`M ${tagW + 118} ${tagH * 0.62 - 12} l 20 16 l -24 10`} fill="none" stroke="#fbfaf6" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Thin hand-drawn line looping off the corner. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
        <path d={loop} fill="none" stroke={shade(club, -0.15)} strokeWidth={2.2} strokeLinecap="round" opacity={0.9} />
      </svg>

      {/* The bar: crests at both ends, OURS versus THEM between. */}
      <div style={{ position: "absolute", left: C.x, top: barTop, width: C.w, height: barH, background: BAR, display: "flex", alignItems: "center" }}>
        <div style={{ width: barH, height: barH, background: club, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(45deg, transparent 0 14px, ${shade(club, -0.2)} 14px 17px)` }} />
          {crestA && <img src={crestA} alt="" style={{ position: "relative", width: 82, height: 82, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.35))" }} />}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={nameStyle(nameA, "right")}>{nameA}</div>
          <div style={{ width: 104, height: 104, borderRadius: "50%", border: `2.5px solid ${pop}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CONDENSED, fontWeight: 700, fontSize: middle === "VERSUS" ? 19 : 34, letterSpacing: middle === "VERSUS" ? "0.08em" : "0.02em", color: CREAM, flexShrink: 0 }}>
            {middle}
          </div>
          <div style={nameStyle(nameB, "left")}>{nameB}</div>
        </div>
        <div style={{ width: barH, height: barH, borderLeft: `1px solid rgba(255,255,255,.15)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {crestB && <img src={crestB} alt="" style={{ width: 82, height: 82, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.35))" }} />}
        </div>
      </div>

      {/* Under the card: fine print and the agency on one side, competition and kick-off on the other. */}
      <div style={{ position: "absolute", top: barTop + barH + 58, [right ? "left" : "right"]: C.x, display: "flex", flexDirection: "column", gap: 14, alignItems: right ? "flex-start" : "flex-end" }}>
        <AgencyLogo data={data} onLight height={24} style={{ transform: `translateY(${-(params.logoY ?? 0)}px) scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left center" : "right center" }} />
        <div style={{ display: "flex", gap: 26, fontFamily: MONO, fontWeight: 500, fontSize: 9.5, lineHeight: 1.35, letterSpacing: "0.06em", color: BAR, opacity: 0.7 }}>
          <div>
            {`${content.firstName} ${content.lastName}`.toUpperCase()}
            <br />
            {data.player.position.toUpperCase()}
          </div>
          {data.player.number && (
            <div>
              NO.
              <br />
              {data.player.number}
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "absolute", top: barTop + barH + 34, [right ? "right" : "left"]: CANVAS_W - (C.x + C.w), display: "flex", alignItems: "stretch", flexDirection: right ? "row" : "row-reverse" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", padding: right ? "0 22px 0 0" : "0 0 0 22px", [right ? "borderRight" : "borderLeft"]: `2px solid ${BAR}`, fontFamily: ARCHIVO_BLACK, fontSize: compSize, lineHeight: 1.02, color: BAR, textAlign: "right", whiteSpace: "nowrap" }}>
          {compLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: right ? "0 0 0 22px" : "0 22px 0 0" }}>
          {topLine && (
            <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: topSize, letterSpacing: "0.1em", color: BAR, whiteSpace: "nowrap", paddingBottom: 8, borderBottom: `2px solid ${BAR}`, marginRight: right ? -(CANVAS_W - (C.x + C.w)) : 0 }}>{topLine}</div>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 6 }}>
            <span style={{ fontFamily: ARCHIVO_BLACK, fontSize: bigSize, lineHeight: 1, color: BAR, letterSpacing: "-0.01em" }}>{big}</span>
            {bigLabel && <span style={{ fontFamily: ARCHIVO_BLACK, fontSize: 20, color: BAR, marginTop: 8 }}>{bigLabel}</span>}
          </div>
        </div>
      </div>

      {/* Colour strip at the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 20, background: pop }} />

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}
