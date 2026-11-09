/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const INK = "#16171b";
const PALE = "#e9e5de";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/**
 * Goal measure: the celebrating player drawn up like an architect's elevation. On a plain ground (deep club
 * tone with white hairlines, or pale paper with ink ones — by seed) two dimension lines annotate him: a
 * vertical one beside him, from the drawing's baseline up to the top of his raised fist, labelled "GOAL"
 * in a gap; a horizontal one under him spanning his shoulders (extension lines rising behind his body),
 * his name in its gap. A small callout leader from his shoulder carries the fixture, home team first, no
 * score. Nothing else but the NEYOD logo.
 */
export function Goalmeasure({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const pale = rng((params.seed ?? 0) * 7919 + 23)() < 0.5;
  const ground = pale ? PALE : shade(club, -0.72);
  const lift = pale ? "#f7f5f0" : shade(club, -0.46);
  const fg = pale ? INK : WHITE;
  const soft = pale ? "rgba(22,23,27,.6)" : "rgba(255,255,255,.62)";
  const faint = pale ? "rgba(22,23,27,.28)" : "rgba(255,255,255,.3)";
  const accent = pale ? shade(club, -0.1) : WHITE;
  const lw = story ? 2 : 1.5;
  const tick = story ? 15 : 11;

  /* ---- the foot: logo, then the shoulder dimension with his name ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.3;
  const nSize = Math.max(14, Math.min(22 * k, (story ? 640 : 560) / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  // The name's caps centred on the dimension line, 64px (story) / 50px (post) of air above the logo.
  const hY = Math.round(logoTop - (story ? 64 : 50) - nSize * 0.37 + (params.textY ?? 0));

  /* ---- the player ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceC = face[0] + face[2] / 2;
  // The raised fist is where the cutout has room beside the face: the wider side.
  const fistLeft = faceC > 0.5;
  // The GOAL dimension stands on the side asked for, else beside the fist.
  const dimLeft = params.side === "left" ? true : params.side === "right" ? false : fistLeft;
  const sizes = story ? { chest: 186, waist: 166, knees: 136, full: 110 } : { chest: 168, waist: 150, knees: 120, full: 96 };
  const faceTopY = story ? STORY_TOP + 100 : 210;
  // placeByFace, but reaching only down to the shoulder dimension (he dissolves above it), not the canvas foot.
  let faceHt = (sizes[(params.framing ?? "waist") as keyof typeof sizes] ?? sizes.waist) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceHt = Math.min(faceHt, Math.max(96, data.facePx * 1.2));
  const bh = Math.max(faceHt / face[3], (hY - faceTopY) / Math.max(0.2, 1 - face[1]));
  const bw = bh * (data.photoAspect ?? 0.6);
  let box = { left: 540 - bw * faceC + (params.playerX ?? 0), top: faceTopY - bh * face[1] + (params.playerY ?? 0), width: bw, height: bh, faceH: face[3] * bh };
  // Centre the figure, then make room for the dimension column on its side.
  box = { ...box, left: box.left + (540 - (box.left + box.width / 2)) };
  const col = story ? 170 : 150;
  if (dimLeft && box.left < col) box = { ...box, left: Math.min(box.left + (col - box.left), box.left + 140) };
  if (!dimLeft && box.left + box.width > CANVAS_W - col) box = { ...box, left: Math.max(box.left - (box.left + box.width - (CANVAS_W - col)), box.left - 140) };
  const faceTop = box.top + face[1] * box.height;
  const chin = faceTop + box.faceH;
  const faceW = face[2] * box.width;
  const faceCx = box.left + faceC * box.width;

  /* ---- shoulders (estimated from the face) ---- */
  const shY = chin + box.faceH * 0.5;
  const span = faceW * 3.9;
  const shC = faceCx + (box.left + box.width / 2 - faceCx) * 0.35;
  const nameGap = capsEm(name, N_TRACK) * nSize + (story ? 52 : 40);
  const hw = Math.min(CANVAS_W / 2 - 70, Math.max(span / 2, nameGap / 2 + (story ? 70 : 54)));
  const hC = Math.max(70 + hw, Math.min(CANVAS_W - 70 - hw, shC));
  const hL = hC - hw;
  const hR = hC + hw;

  /* ---- the GOAL dimension: baseline up to the top of his fist ---- */
  const fistY = Math.max(story ? STORY_TOP : 64, box.top + box.height * 0.006);
  const vX = dimLeft ? Math.max(66, Math.min(hL - 46, box.left - 34)) : Math.min(CANVAS_W - 66, Math.max(hR + 46, box.left + box.width + 34));
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.6;
  const vLen = hY - fistY;
  const tSize = Math.max(12, Math.min(19 * k, (vLen * 0.5) / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const tLen = capsEm(title, T_TRACK) * tSize;
  const vMid = (fistY + hY) / 2;
  const vGap = tLen / 2 + (story ? 24 : 18);

  /* ---- the callout: fixture, home first, never the score ---- */
  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = ((weHost ? content.homeTeam : content.awayTeam) || oursName).trim();
  const opp = ((weHost ? content.awayTeam : content.homeTeam) || f.opp || "").trim();
  const [home, away] = weHost ? [ours, opp] : [opp, ours];
  const cLeft = !dimLeft;
  const F_TRACK = 0.2;
  const M = story ? 66 : 60;
  const low = cLeft === fistLeft;
  // Room beside his head (open side) or beside his chest (fist side).
  const room = low ? (cLeft ? hL + span * 0.19 - M - 40 : CANVAS_W - M - (hR - span * 0.19) - 40) : cLeft ? faceCx - faceW * 0.95 - M : CANVAS_W - M - (faceCx + faceW * 0.95);
  const lines = [home.toUpperCase(), away ? `V  ${away.toUpperCase()}` : ""].filter(Boolean);
  const longest = Math.max(1, ...lines.map((l) => capsEm(l, F_TRACK)));
  const fSize = Math.max(11, Math.min(15 * k, Math.max(170, room) / longest)) * ts;
  // Beside his head on the open side; on the fist side under the raised arm, level with his chest.
  const shelfEnd = cLeft ? M : CANVAS_W - M;
  const minShelf = story ? 120 : 96;
  const shelfY = Math.round(low ? shY + box.faceH * 0.95 : Math.max(faceTop + box.faceH * 0.2, shY - box.faceH * 0.75));
  // The leader: on the open side it drops at 45° from the shelf to a dot on his shoulder; on the fist side
  // it runs straight in to his side.
  const dotX = low ? (cLeft ? hL + span * 0.19 : hR - span * 0.19) : cLeft ? hL + span * 0.14 : hR - span * 0.14;
  const dotY = low ? shelfY : shY;
  const drop = Math.max(0, dotY - shelfY);
  // A figure close to the edge: the leader climbs steeper rather than running past the shelf.
  const kneeX = cLeft ? Math.max(dotX - drop, shelfEnd + minShelf) : Math.min(dotX + drop, shelfEnd - minShelf);
  const leader = `${dotX},${dotY} ${kneeX},${shelfY} ${shelfEnd},${shelfY}`;
  // He dissolves into the ground just above the shoulder dimension.
  const fadeEnd = Math.min(hY - (story ? 70 : 54), box.top + box.height);
  const fadeLen = story ? 360 : 280;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap" });
  const slash = (x: number, y: number) => <line x1={x - tick / 2} y1={y + tick / 2} x2={x + tick / 2} y2={y - tick / 2} strokeWidth={lw * 1.6} />;
  const ext = story ? 22 : 16;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: fg }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 44% at 50% ${((shY + 40) / H) * 100}%, ${lift} 0%, transparent 78%)`, opacity: pale ? 0.9 : 0.8 }} />

      {/* Extension lines, under him: they vanish behind his body. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }} stroke={faint} strokeWidth={lw * 0.7} fill="none">
        {/* The one under a low callout stops short of its text. */}
        <line x1={hL} y1={hY + ext} x2={hL} y2={low && cLeft ? shelfY + ext : shY} />
        <line x1={hR} y1={hY + ext} x2={hR} y2={low && !cLeft ? shelfY + ext : shY} />
        <line x1={vX + (dimLeft ? -ext : ext)} y1={fistY} x2={faceCx} y2={fistY} />
        <line x1={vX + (dimLeft ? -ext : ext)} y1={hY} x2={dimLeft ? hL - 14 : hR + 14} y2={hY} />
      </svg>

      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: chin, width: box.width * 0.64, height: Math.max(80, fadeEnd - chin - box.faceH), borderRadius: "50%", background: pale ? "rgba(40,36,30,.15)" : "rgba(0,0,0,.22)", filter: `blur(${story ? 80 : 64}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The dimension lines and the callout leader. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0 }} stroke={fg} strokeWidth={lw} fill="none" strokeLinecap="square">
        {/* Shoulders: open in the middle for his name. */}
        <line x1={hL} y1={hY} x2={hC - nameGap / 2} y2={hY} />
        <line x1={hC + nameGap / 2} y1={hY} x2={hR} y2={hY} />
        {slash(hL, hY)}
        {slash(hR, hY)}
        {/* Height: open for the title. */}
        <line x1={vX} y1={fistY} x2={vX} y2={vMid - vGap} />
        <line x1={vX} y1={vMid + vGap} x2={vX} y2={hY} />
        {slash(vX, fistY)}
        {slash(vX, hY)}
        {/* Callout. */}
        <circle cx={dotX} cy={dotY} r={story ? 5 : 4} fill={fg} stroke="none" />
        <polyline points={leader} strokeWidth={lw * 0.85} />
      </svg>

      {/* GOAL, written up the vertical line. */}
      <div style={{ position: "absolute", left: vX, top: vMid, transform: "translate(-50%, -50%) rotate(-90deg)", ...caps(tSize, T_TRACK, 600), color: accent, paddingLeft: `${T_TRACK}em` }}>{title}</div>
      {/* His name in the shoulder line. */}
      {name && <div style={{ position: "absolute", left: hC, top: hY, transform: "translate(-50%, -50%)", ...caps(nSize, N_TRACK, 600), paddingLeft: `${N_TRACK}em`, color: fg }}>{name}</div>}
      {/* The fixture on the callout shelf. */}
      <div style={{ position: "absolute", [cLeft ? "left" : "right"]: M, top: shelfY - (story ? 14 : 11) - fSize * lines.length * 1.5 + fSize * 0.5, display: "flex", flexDirection: "column", alignItems: cLeft ? "flex-start" : "flex-end", gap: fSize * 0.5 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ ...caps(fSize, F_TRACK, i === 0 ? 600 : 500), color: i === 0 ? fg : soft }}>{l}</div>
        ))}
      </div>

      <AgencyLogo data={data} onLight={pale} height={18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={pale ? 0.12 : 0.18} />
    </div>
  );
}
