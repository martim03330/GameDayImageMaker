/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask, figureBox, Film } from "./fx";
import { Paper } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const CARD = { x: 60, y: 240, w: 960, h: 960 };

/** Op-art: dozens of wave lines bulging around the player's torso, in club tints (Messi "10" wave poster). */
export function Waves({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const tints = [accent, shade(accent, 0.55), params.accent.toLowerCase() === "#ffffff" ? shade(accent, -0.4) : vivid(params.accent)];
  const box = figureBox(data, 540, 150, 1000);
  const cx = 540 - CARD.x;
  const cy = box.top + box.height * 0.35 - CARD.y;
  const paths: string[] = [];
  for (let k = 0; k < 82; k++) {
    const y0 = k * 12;
    let d = "";
    for (let x = 0; x <= CARD.w; x += 12) {
      const bump = 90 * Math.exp(-((x - cx) ** 2 + (y0 - cy) ** 2) / (2 * 230 ** 2));
      const y = y0 + 9 * Math.sin(x / 90 + k * 0.35) + bump * Math.sin((x - cx) / 60);
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
    }
    paths.push(d);
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#1a1a1a" }}>
      <Paper color="#efe9dd" />
      <div style={{ position: "absolute", left: 60, top: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: ARCHIVO_BLACK, fontSize: 118 * (params.textScale ?? 1), lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.03em" }}>
        <span>{content.lastName}</span>
        <span style={{ color: accent }}>{data.player.number}</span>
      </div>
      <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", left: CARD.x, top: CARD.y, background: "#f6f1e6" }}>
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={tints[i % 3]} strokeWidth={5} strokeLinecap="round" />
        ))}
      </svg>
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "grayscale(1) contrast(1.15) drop-shadow(0 20px 26px rgba(0,0,0,.25))", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1250, borderTop: "2px solid #1a1a1a", paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <span>{content.kicker}</span>
        <span>{content.subline}</span>
        <AgencyLogo data={data} onLight height={24} />
      </div>
      <Film strength={0.7} />
    </div>
  );
}
