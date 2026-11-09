/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, BARCODE, DMSERIF, figureBox, Film, GradedFigure, HeadLayer } from "./fx";
import { factRows, SANS } from "./shared";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

/** Sports magazine cover: masthead the head overlaps, headline riding a pitch line, coverlines, barcode. */
export function Magazine({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const field = params.bgStyle === "photo" ? "#101217" : accent;
  const ink = params.bgStyle === "photo" ? accent : shade(accent, -0.65);
  const box = figureBox(data, 600, 0, 1160);
  const [x1, y1, x2, y2] = [0, 1000, 1080, 440];
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const facts = factRows(data);
  const d = new Date();
  const masthead = "STAR";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: field, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 60% 40%, rgba(255,255,255,.18), transparent 70%)" }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={14} />
      </svg>
      <div style={{ position: "absolute", left: 44, top: 20, fontFamily: DMSERIF, fontSize: 250, lineHeight: 1, letterSpacing: "-0.03em", color: "#fff" }}>{masthead}</div>
      <GradedFigure data={data} box={box} grade="#fff" gradeStrength={0.1} />
      <HeadLayer data={data} box={box} />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 1000 - 20,
          transformOrigin: "0 100%",
          transform: `rotate(${angle}deg) translateY(-100%)`,
          fontFamily: ARCHIVO_BLACK,
          // Long titles shrink so the diagonal never climbs into the facts column.
          fontSize: Math.min(88, 560 / (content.kicker.length * 0.6)) * (params.textScale ?? 1),
          lineHeight: 0.95,
          whiteSpace: "nowrap",
          color: "#fff",
          textShadow: `0 4px 20px ${shade(accent, -0.6)}80`,
        }}
      >
        {content.kicker.toLowerCase()}
      </div>
      <div style={{ position: "absolute", left: 50, top: 330, width: 330, fontFamily: SANS, fontWeight: 700, fontSize: 26, lineHeight: 1.25, color: ink }}>
        <div style={{ fontSize: 40, fontFamily: DMSERIF, fontWeight: 400, color: "#fff" }}>
          {content.firstName} {content.lastName}
        </div>
        <div style={{ marginTop: 16 }}>{content.subline}</div>
        {facts.slice(0, 3).map((f, i) => (
          // Numbers sit inline with their label; words (a club name) get their own line so they never collide.
          <div key={i} style={{ marginTop: 14, color: "#fff", lineHeight: 1.1 }}>
            <span style={{ fontFamily: ARCHIVO_BLACK, fontSize: f.value.length > 6 ? 30 : 40, display: f.value.length > 6 ? "block" : "inline" }}>{f.value}</span>{" "}
            <span style={{ opacity: 0.85 }}>{f.label.toLowerCase()}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 44, bottom: 40, background: "#fff", color: "#111", padding: "6px 14px 4px", textAlign: "center" }}>
        <div style={{ fontFamily: BARCODE, fontSize: 64, lineHeight: 1 }}>{`${content.lastName}${d.getFullYear()}`}</div>
        <div style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.1em" }}>
          Nº {data.player.number || "07"} · {MONTHS[d.getMonth()]} {d.getFullYear()} · 2,50€
        </div>
      </div>
      <AgencyLogo data={data} height={30} style={{ position: "absolute", left: 50, bottom: 50 }} />
      <Film strength={0.9} />
    </div>
  );
}
