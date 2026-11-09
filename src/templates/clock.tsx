/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const M = 60;
const OFF_WHITE = "#eeebe5";
const INK = "#16171b";

/** Inter capitals, roughly, per 1px of font size, with the tracking added per glyph. */
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, tracking: number) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/** "15:00", "15h00", "3.45pm" → [hours 0–23, minutes]; null when there is no time. */
function parseTime(t: string): [number, number] | null {
  const m = t.trim().match(/^(\d{1,2})(?:[:hH.](\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3]?.toLowerCase() === "pm" && h < 12) h += 12;
  if (m[3]?.toLowerCase() === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return [h, min];
}

/**
 * Clock: matchday only. A large minimal analogue dial in hairlines behind the player — a thin circle,
 * sixty ticks, twelve longer — its two thin hands set to the kick-off. The hub sits at his brow, so his
 * head and shoulders fill the lower half of the dial and the hands, drawn behind him, rise around his head. The kick-off small under the dial, the title small at
 * the top, crests and the logo at the foot. Deep club tone or off-white, by seed.
 */
export function Clock({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  const light = r() < 0.45;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const ground = light ? OFF_WHITE : shade(club, -0.7);
  const lift = light ? "#f7f5f1" : shade(club, -0.5);
  const ink = light ? INK : "#ffffff";
  const soft = light ? "rgba(22,23,27,.6)" : "rgba(255,255,255,.66)";
  const hair = light ? "rgba(22,23,27,.55)" : "rgba(255,255,255,.6)";

  const f = matchFacts(data);
  const time = parseTime(f.time);

  /* ---- the player: head and shoulders inside the dial ---- */
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const box = placeByFace(data, faceX, 620, { chest: 240, waist: 210, knees: 170, full: 140 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fW = face[2] * box.width;

  /* ---- the dial, its hub at his brow: the face sits just under it, the hands rise and spread above him ---- */
  const R = 400;
  const cx = 540;
  const cy = Math.max(R + 150, Math.min(660, fTop + fH * 0.08));
  const dialBottom = cy + R;
  const fadeFrom = dialBottom - 170;
  const fadeTo = dialBottom + 8;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r0 = R - (major ? 30 : 12);
    return { x1: cx + Math.sin(a) * r0, y1: cy - Math.cos(a) * r0, x2: cx + Math.sin(a) * R, y2: cy - Math.cos(a) * R, major };
  });
  const [hh, mm] = time ?? [12, 0];
  const minA = (mm / 60) * Math.PI * 2;
  const hourA = (((hh % 12) + mm / 60) / 12) * Math.PI * 2;
  const hand = (a: number, len: number) => ({ x2: cx + Math.sin(a) * len, y2: cy - Math.cos(a) * len });
  const hourEnd = hand(hourA, R * 0.6);
  const minEnd = hand(minA, R * 0.9);
  // The hands never show across his face: an oval around the head is cut out of them.
  const headRx = fW * 0.95;
  const headRy = fH * 1.0;
  const headCy = fTop + fH * 0.45;

  /* ---- the type ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.5;
  const titleSize = Math.min(15, 640 / Math.max(1, capsEm(title, T_TRACK))) * ts;
  const titleTop = Math.max(64, cy - R - 82) + (params.textY ?? 0);
  const kick = f.time ? `Kick-off ${f.time}` : "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? titleCase(f.opp));
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? `${pair[0]}  v  ${pair[1]}` : opp ? `v ${opp}` : "";
  const fixSize = Math.max(16, Math.min(22, 700 / Math.max(1, fixture.length * 0.52))) * ts;
  const when = [niceDate(content.date), titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const whenSize = Math.max(12, Math.min(15, 640 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor || light ? "none" : "url(#clock-mono)";
  const kickTop = dialBottom + 34;

  const caps = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: ink,
    textAlign: "center",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="clock-mono" ink={0.5} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${R * 1.3}px ${R * 1.3}px at ${cx}px ${cy}px, ${lift}, ${ground})` }} />

      {/* The dial, in hairlines. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <mask id="clock-head" maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <rect width={CANVAS_W} height={CANVAS_H} fill="#fff" />
            <ellipse cx={fCx} cy={headCy} rx={headRx} ry={headRy} fill="#000" />
          </mask>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={hair} strokeWidth={1.2} />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={hair} strokeWidth={t.major ? 1.6 : 1} />
        ))}
        <g mask="url(#clock-head)" stroke={ink} strokeLinecap="round">
          <line x1={cx} y1={cy} x2={hourEnd.x2} y2={hourEnd.y2} strokeWidth={2.2} opacity={0.85} />
          <line x1={cx} y1={cy} x2={minEnd.x2} y2={minEnd.y2} strokeWidth={1.2} opacity={0.85} />
          <circle cx={cx} cy={cy} r={4} fill={ink} stroke="none" opacity={0.85} />
        </g>
      </svg>

      {/* The player, natural colour, in front of the hands, melting away under the dial. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The title, small, at the top. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(titleSize, T_TRACK, 500) }}>{title}</div>

      {/* Under the dial: the kick-off, then the fixture and date · ground. */}
      {kick && <div style={{ position: "absolute", left: M, right: M, top: kickTop, ...caps(14 * ts, 0.32, 500, { color: soft }) }}>{kick}</div>}
      <div style={{ position: "absolute", left: M, right: M, top: kickTop + (kick ? 44 : 10), display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {fixture && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: fixSize, lineHeight: 1.1, whiteSpace: "nowrap", color: ink }}>{fixture}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", whiteSpace: "nowrap", color: soft }}>{when}</div>}
      </div>

      {/* Foot: crests left, logo right. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: M, bottom: 54, display: "flex", gap: 16, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 36, height: 36, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={16}
        onLight={light}
        style={{ position: "absolute", right: M, bottom: 50 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
      <Film strength={light ? 0.12 : 0.18} />
    </div>
  );
}
