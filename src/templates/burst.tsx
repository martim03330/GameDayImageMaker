/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { cutMask, figureBox, Film, GradientMapDefs } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const CX = 540;
const CY = 620;
const CREAM = "#f1ead8";
const INK = "#0e0e0e";
const START = 280;

/** Room along a spoke (rotated `deg` clockwise from straight up) between START and the canvas edge. */
function spokeRoom(deg: number): number {
  const a = (deg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const t = Math.min(dx > 0.01 ? (CANVAS_W - CX) / dx : dx < -0.01 ? -CX / dx : Infinity, dy > 0.01 ? (CANVAS_H - CY) / dy : dy < -0.01 ? -CY / dy : Infinity);
  return t - START - 40;
}

/** Woodcut-style typographic explosion: cream spokes radiating from the player's chest, words riding them ("Battle Ready"). */
export function Burst({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const n = 14;
  const words = [content.kicker, content.lastName.toUpperCase(), data.club?.name?.toUpperCase() ?? "", opponentOf(data).toUpperCase() || content.kicker];
  const box = figureBox(data, CX, 90, 960);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: INK, color: CREAM }}>
      <GradientMapDefs id="burst-duo" dark={INK} light={CREAM} />
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="wood">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={8} />
            <feDisplacementMap in="SourceGraphic" scale={6} />
          </filter>
          {Array.from({ length: n }, (_, i) => (
            <path key={i} id={`sp${i}`} d={`M ${CX} ${CY} L ${CX} ${CY - 1100}`} transform={`rotate(${(360 / n) * i} ${CX} ${CY})`} />
          ))}
        </defs>
        <g filter="url(#wood)">
          {Array.from({ length: n }, (_, i) => (
            <g key={i} transform={`rotate(${(360 / n) * i} ${CX} ${CY})`}>
              <polygon points={`${CX},${CY} ${CX - 90},${CY - 1100} ${CX + 90},${CY - 1100}`} fill={i % 2 ? CREAM : "transparent"} />
            </g>
          ))}
          {Array.from({ length: n }, (_, i) =>
            i % 2 ? (
              (() => {
                // Each word shrinks to fit its spoke, so long names are never cut by the edge.
                const word = words[Math.floor(i / 2) % words.length];
                const size = Math.max(40, Math.min(88, spokeRoom((360 / n) * i) / Math.max(1, [...word].length * 0.47)));
                return (
                  <text key={i} fill={i % 4 === 1 ? accent : INK} fontFamily="var(--font-anton), sans-serif" fontSize={size} dy={size * 0.34}>
                    <textPath href={`#sp${i}`} startOffset={START}>
                      {word}
                    </textPath>
                  </text>
                );
              })()
            ) : null,
          )}
        </g>
      </svg>
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "url(#burst-duo) contrast(1.15) drop-shadow(0 0 0 #0e0e0e)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 230, background: `linear-gradient(to top, ${INK} 60%, transparent)` }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span>{postType === "matchday" ? `${data.club?.name ?? ""} vs ${opponentOf(data)}` : `${content.firstName} ${content.lastName}`}</span>
        <span style={{ color: accent }}>{[content.date, content.time].filter(Boolean).join(" · ") || content.subline}</span>
        <AgencyLogo data={data} height={26} />
      </div>
      <Film strength={1.4} />
    </div>
  );
}
