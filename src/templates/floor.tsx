/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, CastShadow, figureBox, Film } from "./fx";
import { twoLines, VersusCrests } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** The headline lies on the ground in 3D perspective; the player stands on it and casts a shadow over the letters (Endicott). */
export function Floor({ data }: { data: RenderData }) {
  const { params, content } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const lines = twoLines(content.kicker);
  const box = figureBox(data, 520, 330, 720);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#fff", perspective: 1100 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 35%, ${shade(base, 0.15)}, ${shade(base, -0.45)} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 110 }}>
        <VersusCrests data={data} size={110} color="#fff" gap={30} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 695,
          transformOrigin: "50% 100%",
          transform: "rotateX(58deg) rotateZ(-16deg)",
          textAlign: "center",
          fontFamily: ARCHIVO_BLACK,
          fontStyle: "italic",
          // Longer titles ("IT'S MATCHDAY") shrink instead of wrapping onto a third line.
          fontSize: Math.min(230, 1000 / (Math.max(...lines.map((l) => l.length)) * 0.72)) * (params.textScale ?? 1),
          lineHeight: 0.86,
          letterSpacing: "-0.02em",
        }}
      >
        {/* The headline's 0.86 line height lets its ascenders ride up, so the captions keep their distance. */}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 40, letterSpacing: "0.12em", textAlign: "right", marginRight: 60, marginBottom: 46 }}>{(data.club?.stadium ?? content.subline).toUpperCase()}</div>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 48, textAlign: "left", marginLeft: 40 }}>{content.time ? `INÍCIO ${content.time}` : content.date}</div>
      </div>
      {data.photoUrl && <CastShadow box={box} url={data.photoUrl} skew={-58} length={0.42} opacity={0.4} />}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "drop-shadow(0 10px 12px rgba(0,0,0,.3))" }} />}
      <AgencyLogo data={data} height={30} style={{ position: "absolute", left: "50%", bottom: 60, transform: "translateX(-50%)" }} />
      <Film strength={1} />
    </div>
  );
}
