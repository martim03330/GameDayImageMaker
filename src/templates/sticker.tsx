/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { CAVEAT, figureBox, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** The player as a die-cut sticker with a thick white border, hand-lettered surname orbiting him ("From the terraces"). */
export function Sticker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const box = figureBox(data, 540, 110, 1000);
  const border = [
    [6, 0], [-6, 0], [0, 6], [0, -6], [5, 5], [-5, 5], [5, -5], [-5, -5], [9, 0], [-9, 0], [0, 9], [0, -9],
  ]
    .map(([x, y]) => `drop-shadow(${x}px ${y}px 0 #fff)`)
    .join(" ");
  const r = rng(content.lastName.length + 5);
  const letters = [...content.lastName.toUpperCase()];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: base, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, transparent 45%, rgba(255,255,255,.14) 50%, transparent 56%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 40%, transparent 55%, rgba(0,0,0,.25))" }} />
      {letters.map((l, i) => {
        const a = Math.PI * (1.08 + (i / Math.max(1, letters.length - 1)) * 0.84);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(a) * 420 - 45,
              top: 620 + Math.sin(a) * 470 - 60,
              fontFamily: CAVEAT,
              fontSize: 130 * (params.textScale ?? 1),
              lineHeight: 1,
              transform: `rotate(${(r() - 0.5) * 30}deg)`,
              textShadow: "0 6px 14px rgba(0,0,0,.25)",
            }}
          >
            {l}
          </div>
        );
      })}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: `${border} drop-shadow(0 18px 20px rgba(0,0,0,.35))`, transform: "rotate(-3deg)" }} />}
      <div style={{ position: "absolute", right: 70, top: 80, fontSize: 60, lineHeight: 1 }}>✦ ✦</div>
      <svg width={180} height={180} style={{ position: "absolute", right: 90, bottom: 150 }}>
        <circle cx={90} cy={90} r={60} fill="none" stroke="#fff" strokeWidth={7} />
        <path d="M 60 70 l 30 16 l -6 34 M 118 76 l -28 10 M 58 118 l 26 -4 l 32 16" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 60, bottom: 60, display: "flex", alignItems: "baseline", gap: 18 }}>
        <span style={{ fontFamily: CAVEAT, fontSize: 56 }}>{content.kicker.toLowerCase()}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 48 }}>{content.firstName.toUpperCase()}</span>
      </div>
      <AgencyLogo data={data} height={26} style={{ position: "absolute", right: 60, bottom: 66 }} />
      <Film strength={1} />
    </div>
  );
}
