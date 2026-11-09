/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { DELA, figureBox, Film, GradedFigure } from "./fx";
import { Micro, Paper } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Japanese poster: warm paper, big flat disc, vertical surname, hanko stamp, city ink-wash inside the disc. */
export function Rising({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const city = data.club?.cityImages?.[1] ?? data.club?.cityImageUrl;
  const box = figureBox(data, 470, 0, 1130);
  const initials = `${content.firstName[0] ?? ""}${content.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#1b1a18" }}>
      <Paper color="#f5f1e8" strength={1.1} />
      <div style={{ position: "absolute", inset: 36, border: "1.5px solid #1b1a18" }} />
      <div style={{ position: "absolute", left: 560 - 380, top: 620 - 380, width: 760, height: 760, borderRadius: "50%", background: accent, overflow: "hidden" }}>
        {city && <img src={city} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.3)", mixBlendMode: "multiply", opacity: 0.35 }} />}
      </div>
      <GradedFigure data={data} box={box} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 70, display: "flex", alignItems: "center", gap: 20, fontFamily: DELA, fontSize: 40 }}>
        <span>{content.lastName.toUpperCase()}</span>
        <span style={{ flex: 1, height: 2, background: "#1b1a18" }} />
        <span>{data.player.number}</span>
      </div>
      <div style={{ position: "absolute", right: 70, top: 160, writingMode: "vertical-rl", fontFamily: DELA, fontSize: Math.min(120, 1000 / Math.max(5, content.lastName.length)), lineHeight: 1, color: accent, letterSpacing: "0.05em" }}>
        {content.lastName.toUpperCase()}
      </div>
      <div style={{ position: "absolute", right: 76, bottom: 200, writingMode: "vertical-rl", fontFamily: SANS, fontSize: 18, letterSpacing: "0.3em" }}>{(data.club?.name ?? "").toUpperCase()}</div>
      <div style={{ position: "absolute", left: 70, bottom: 70, fontFamily: SANS, fontSize: 18, lineHeight: 1.6 }}>
        <b>{content.kicker}</b>
        <br />
        {content.subline}
        <br />
        <Micro color="#1b1a18">{content.subline}</Micro>
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 70, width: 84, height: 84, background: "#c8102e", color: "#f5f1e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DELA, fontSize: 34, transform: "rotate(-6deg)", borderRadius: 6 }}>
        {initials}
      </div>
      <AgencyLogo data={data} onLight height={26} style={{ position: "absolute", left: 70, top: 130, opacity: 0.8 }} />
      <Film strength={1.2} />
    </div>
  );
}
