/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { factRows } from "./shared";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Giant crest outline as a halo behind the player on a club-colour-to-white gradient (Marseille / Cherki). */
export function Halo({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const crest = data.club?.crestUrl;
  const box = figureBox(data, 540, 170, 1050);
  const facts = factRows(data).slice(0, 3);
  const ring = { WebkitMaskImage: "radial-gradient(circle, #000 52%, transparent 72%)", maskImage: "radial-gradient(circle, #000 52%, transparent 72%)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: `linear-gradient(to bottom, ${accent} 0%, ${shade(accent, 0.45)} 55%, #ffffff 100%)`, color: shade(accent, -0.6) }}>
      {crest && (
        <>
          <img src={crest} alt="" style={{ position: "absolute", left: 90, top: 110, width: 900, height: 900, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.28, ...ring }} />
          <img src={crest} alt="" style={{ position: "absolute", left: 54, top: 74, width: 972, height: 972, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.1 }} />
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: "0.3em", color: "#fff", textTransform: "uppercase" }}>
        {[data.player.position, data.club?.name, content.subline].filter(Boolean).join("  ·  ")}
      </div>
      <GradedFigure data={data} box={box} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: DISPLAY, fontSize: 110 * (params.textScale ?? 1), lineHeight: 1, color: "#fff", textShadow: `0 10px 30px ${shade(accent, -0.5)}80`, textTransform: "uppercase" }}>
        {content.lastName}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 50, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
        {facts.map((f, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 54, lineHeight: 1, color: accent }}>{f.value}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, letterSpacing: "0.25em", textTransform: "uppercase" }}>{f.label}</div>
          </div>
        ))}
        <AgencyLogo data={data} onLight height={26} />
      </div>
      <Film strength={0.6} />
    </div>
  );
}
