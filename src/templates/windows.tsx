/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { DMSERIF, figureBox, Film, Furniture, GradedFigure, HeadLayer } from "./fx";
import { matchInfo, opponentOf, VersusCrests } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const G = { x: 60, y: 300, w: 960, h: 860, cols: 3, rows: 2, gap: 16 };

/** Grid of window panes cropped from the original photos; the player stands in front, the grid crosses his body but not his head (Georgia "Crimson Tide"). */
export function Windows({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const originals = data.cutouts.map((c) => c.original);
  const cw = (G.w - G.gap * (G.cols - 1)) / G.cols;
  const ch = (G.h - G.gap * (G.rows - 1)) / G.rows;
  const box = figureBox(data, 540, 60, 1040);
  const info = matchInfo(data);
  const cells = Array.from({ length: G.cols * G.rows }, (_, i) => ({ c: i % G.cols, r: Math.floor(i / G.cols), i }));
  const positions = ["20% 20%", "50% 80%", "80% 30%", "30% 60%", "60% 15%", "90% 90%"];
  const lines = (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: G.cols - 1 }, (_, k) => (
        <rect key={`c${k}`} x={G.x + (k + 1) * cw + k * G.gap} y={G.y} width={G.gap} height={G.h} fill="#0e0e10" />
      ))}
      {Array.from({ length: G.rows - 1 }, (_, k) => (
        <rect key={`r${k}`} x={G.x} y={G.y + (k + 1) * ch + k * G.gap} width={G.w} height={G.gap} fill="#0e0e10" />
      ))}
      <rect x={G.x} y={G.y} width={G.w} height={G.h} fill="none" stroke="#0e0e10" strokeWidth={G.gap} />
    </svg>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0e0e10", color: "#f3f1ee" }}>
      {cells.map(({ c, r, i }) => (
        <div key={i} style={{ position: "absolute", left: G.x + c * (cw + G.gap), top: G.y + r * (ch + G.gap), width: cw, height: ch, overflow: "hidden", background: "#1c1c1f" }}>
          {originals.length > 0 && (
            <img
              src={originals[i % originals.length]}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: positions[i],
                transform: `scale(${1.3 + (i % 3) * 0.35})`,
                filter: i === 4 ? "grayscale(1) contrast(1.3)" : "grayscale(1) contrast(1.2) brightness(.7)",
              }}
            />
          )}
          {i === 4 && <div style={{ position: "absolute", inset: 0, background: accent, mixBlendMode: "multiply" }} />}
        </div>
      ))}
      <GradedFigure data={data} box={box} rim="rgba(255,255,255,.6)" grade={accent} gradeStrength={0.18} shadow={false} />
      {lines}
      <HeadLayer data={data} box={box} grow={2.1} />

      <Furniture data={data} color="#f3f1ee" accent={accent} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 150, display: "flex", alignItems: "baseline", gap: 18, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: DMSERIF, fontSize: 96, lineHeight: 1 }}>{content.lastName}</span>
        <span style={{ background: accent, color: "#fff", borderRadius: 99, padding: "2px 14px", fontFamily: SANS, fontWeight: 700, fontSize: 20 }}>
          {postType === "matchday" ? "vs" : content.kicker}
        </span>
        {postType === "matchday" && <span style={{ fontFamily: DMSERIF, fontSize: 60 }}>{opponentOf(data)}</span>}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 50, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: SANS, fontSize: 24, lineHeight: 1.4 }}>
          <b>{postType === "matchday" ? [content.date, content.time].filter(Boolean).join(" | ") : content.subline}</b>
          <br />
          <span style={{ opacity: 0.75 }}>{postType === "matchday" ? info.where : content.stats.map((s) => `${s.value} ${s.label}`).join(" · ")}</span>
        </div>
        <VersusCrests data={data} size={58} color="#f3f1ee" gap={10} />
        <AgencyLogo data={data} height={30} />
      </div>
      <Film strength={1.4} />
    </div>
  );
}
