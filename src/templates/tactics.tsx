import { vivid } from "@/lib/color";
import { figureBox, GradedFigure } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, MONO, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Swiss-style tactics board: lowercase headline, line-drawn pitch, a dotted play, a small restrained cutout. */
export function Tactics({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const field = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const box = figureBox(data, 700, 110, 560);
  const lines = [
    postType === "totw" ? "no onze" : content.kicker.toLowerCase(),
    `${content.firstName.toLowerCase()} ${content.lastName.toLowerCase()}`,
    postType === "matchday" || postType === "result" || postType === "goal" ? `vs ${opponentOf(data).toLowerCase()}` : (data.club?.name ?? "").toLowerCase(),
  ];
  const s = "rgba(255,255,255,.9)";
  // Half pitch drawn from (80,600) to (1000,1300); goal at the top.
  const P = { x: 80, y: 600, w: 920, h: 700 };
  const path = `M 260 1180 C 380 1000, 300 880, 520 860 S 600 700, 540 640`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: field, color: "#fff" }}>
      <div style={{ position: "absolute", left: 60, top: 60, fontFamily: SANS, fontWeight: 700, fontSize: 92, lineHeight: 0.98, letterSpacing: "-0.03em" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 460, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, fontFamily: MONO, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>
        <span>{content.date || content.subline}</span>
        <span>{content.subline}</span>
        <span>{data.club?.stadium ?? data.club?.name ?? ""}</span>
      </div>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke={s} strokeWidth={3}>
          <rect x={P.x} y={P.y} width={P.w} height={P.h} />
          <rect x={P.x + 230} y={P.y} width={P.w - 460} height={200} />
          <rect x={P.x + 360} y={P.y} width={P.w - 720} height={80} />
          <path d={`M ${P.x + 360} ${P.y + 200} A 110 110 0 0 0 ${P.x + P.w - 360} ${P.y + 200}`} />
          <circle cx={540} cy={P.y + P.h} r={120} />
        </g>
        <path d={path} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="2 16" strokeLinecap="round" />
        {[
          [260, 1180],
          [520, 860],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={14} fill="none" stroke="#fff" strokeWidth={4} />
        ))}
        <circle cx={540} cy={640} r={9} fill="#fff" />
      </svg>
      <GradedFigure data={data} box={box} shadow />
      <AgencyLogo data={data} height={28} style={{ position: "absolute", right: 60, top: 70 }} />
    </div>
  );
}
