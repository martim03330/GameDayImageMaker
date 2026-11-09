/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, figureBox, Film, GradedFigure, PseudoQR } from "./fx";
import { Micro, Paper } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const A = { x: 160, y: 250, w: 760, h: 950 };
const ARCH = `path('M0 ${A.w / 2} A${A.w / 2} ${A.w / 2} 0 0 1 ${A.w} ${A.w / 2} V${A.h} H0 Z')`;

/** Arched window holding the city (duotone) with the player breaking out of it (VW × US Soccer). */
export function Arch({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(base, -0.6);
  const city = data.club?.cityImageUrl ?? data.bgPhotoUrl;
  const box = figureBox(data, 540, 100, 1040);
  const headZone = A.y + 120; // above this line the player is drawn outside the arch too

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#fff" }}>
      <Paper color={base} strength={0.9} />
      <div style={{ position: "absolute", left: A.x, top: A.y, width: A.w, height: A.h, clipPath: ARCH, background: deep, overflow: "hidden" }}>
        {city && (
          <>
            <img src={city} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.2)" }} />
            <div style={{ position: "absolute", inset: 0, background: base, mixBlendMode: "multiply", opacity: 0.85 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${deep}, transparent 60%)` }} />
          </>
        )}
      </div>
      <div style={{ position: "absolute", left: A.x - 14, top: A.y - 14, width: A.w + 28, height: A.h + 14, clipPath: `path('M0 ${A.w / 2 + 14} A${A.w / 2 + 14} ${A.w / 2 + 14} 0 0 1 ${A.w + 28} ${A.w / 2 + 14} V${A.h + 14} H${A.w + 14} V${A.w / 2 + 14} A${A.w / 2} ${A.w / 2} 0 0 0 14 ${A.w / 2 + 14} V${A.h + 14} H0 Z')`, background: "#fff", opacity: 0.9 }} />

      {/* Inside the arch… */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${A.y}px ${CANVAS_W - A.x - A.w}px 0 ${A.x}px)` }}>
        <GradedFigure data={data} box={box} grade={base} gradeStrength={0.2} rim="rgba(255,255,255,.5)" />
      </div>
      {/* …and breaking out above it — kept to the arch's own columns, or a wide photo spills out sideways
          and ends on a hard horizontal edge where the clip stops. */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${CANVAS_W - A.x - A.w}px ${CANVAS_H - headZone}px ${A.x}px)` }}>
        <GradedFigure data={data} box={box} grade={base} gradeStrength={0.2} shadow={false} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 70,
          textAlign: "center",
          fontSize: Math.min(76, 1500 / Math.max(10, content.firstName.length + content.lastName.length + 1)),
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: ARCHIVO, fontWeight: 300 }}>{content.firstName} </span>
        <span style={{ fontFamily: ARCHIVO_BLACK }}>{content.lastName}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.35em" }}>
        {postType === "renewal" && content.until ? `UNTIL ${content.until}` : content.kicker}
      </div>

      <div style={{ position: "absolute", left: 60, bottom: 50 }}>
        <PseudoQR color="#fff" size={80} seed={content.lastName.length + 3} />
      </div>
      <Micro color="#fff" style={{ position: "absolute", left: 160, bottom: 60, lineHeight: 1.6 }}>
        {data.club?.name ?? ""}
        <br />
        {content.subline}
      </Micro>
      <AgencyLogo data={data} height={30} style={{ position: "absolute", right: 60, bottom: 60 }} />
      <Film strength={1.1} />
    </div>
  );
}
