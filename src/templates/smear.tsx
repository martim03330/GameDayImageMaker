import { vivid } from "@/lib/color";
import { ARCHIVO_BLACK, Echo, figureBox, Film, GradedFigure, GradientMapDefs } from "./fx";
import { factRows, MONO } from "./shared";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Motion-smeared black & white portrait over a neon dot grid with monospace data tags (SIGNAL XI). */
export function Smear({ data }: { data: RenderData }) {
  const { params, content } = data;
  const dot = vivid(params.accent.toLowerCase() === "#ffffff" ? params.primary : params.accent);
  const right = params.side !== "left";
  const box = figureBox(data, right ? 650 : 430, 0, 1250);
  const age = (() => {
    const b = data.content.date;
    void b;
    return "";
  })();
  const tags = [
    ...factRows(data).map((f) => `${f.value} ${f.label}`.toUpperCase()),
    data.club?.name?.toUpperCase(),
    data.player.position?.toUpperCase(),
    age,
  ].filter(Boolean) as string[];
  const spots = [
    [70, 330],
    [70, 470],
    [610, 880],
    [70, 610],
    [650, 1010],
  ];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#050506", color: "#fff" }}>
      <GradientMapDefs id="smearbw" dark="#050506" mid="#6f6f72" light="#ffffff" />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${dot} 2.2px, transparent 2.8px)`, backgroundSize: "54px 54px", opacity: 0.9 }} />
      <Echo data={data} box={box} color="#ffffff" count={10} dx={right ? 22 : -22} />
      <div style={{ position: "absolute", ...box, left: box.left - (right ? 140 : -140), filter: "blur(28px)", opacity: 0.35 }}>
        <GradedFigure data={data} box={{ left: 0, top: 0, width: box.width, height: box.height }} gradientMap="smearbw" shadow={false} />
      </div>
      <GradedFigure data={data} box={box} gradientMap="smearbw" shadow={false} />

      {/* Stops before the agency logo in the top-right corner. */}
      <div style={{ position: "absolute", left: 60, top: 60, fontFamily: MONO, fontSize: Math.min(18, 790 / ((content.kicker.length + content.subline.length + 3) * 0.8)), letterSpacing: "0.2em", whiteSpace: "nowrap" }}>
        {content.kicker} <span style={{ color: dot }}>■</span> {content.subline}
      </div>
      {tags.slice(0, spots.length).map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: right ? spots[i][0] : 1080 - spots[i][0] - 300,
            top: spots[i][1],
            background: "#000",
            border: `1px solid ${dot}`,
            padding: "6px 12px",
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: "0.1em",
          }}
        >
          <span style={{ color: dot }}>→ </span>
          {t}
        </div>
      ))}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 70, textAlign: right ? "left" : "right" }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: dot }}>{content.firstName.toUpperCase()}</div>
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: Math.min(150, 1600 / Math.max(6, content.lastName.length)) * (params.textScale ?? 1), lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.03em" }}>
          {content.lastName}
        </div>
      </div>
      <AgencyLogo data={data} height={30} style={{ position: "absolute", right: 60, top: 54 }} />
      <Film strength={1.5} />
    </div>
  );
}
