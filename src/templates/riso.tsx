/* eslint-disable @next/next/no-img-element */
import { figureBox, Film, InkDefs, RUBIKMONO } from "./fx";
import { Paper } from "./kit";
import { AgencyLogo, DISPLAY, factRows, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const BLUE = "#0078bf";
const PINK = "#ff48b0";
const RED = "#e8352b";

/** Two flat overprinting inks with misregistration: giant number in one ink, the player in the other (risograph). */
export function Riso({ data }: { data: RenderData }) {
  const { params, content } = data;
  const second = params.side === "left" ? RED : PINK;
  const box = figureBox(data, 560, 0, 1220);
  const number = data.player.number || content.stats[0]?.value || "7";
  const facts = factRows(data);
  const name = content.lastName.toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: BLUE }}>
      <InkDefs id="riso-blue" ink={BLUE} />
      <Paper color="#f2ede3" strength={1.2} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 80,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: number.length > 1 ? 980 : 1150,
          lineHeight: 0.85,
          color: second,
          mixBlendMode: "multiply",
          transform: "translate(6px,-4px)",
          opacity: 0.92,
        }}
      >
        {number}
      </div>
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", ...box, maxWidth: "none", filter: "url(#riso-blue)", mixBlendMode: "multiply" }}
        />
      )}
      <svg width={CANVAS_W} height={260} style={{ position: "absolute", left: 0, top: 30 }}>
        <defs>
          <path id="arc" d="M 90 230 Q 540 20 990 230" />
        </defs>
        <text fill={BLUE} fontFamily="var(--font-rubikmono), monospace" fontSize={Math.min(96, 1500 / Math.max(6, name.length))} textAnchor="middle" style={{ mixBlendMode: "multiply" }}>
          <textPath href="#arc" startOffset="50%">
            {name}
          </textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 50, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, letterSpacing: "0.12em", color: BLUE }}>
        <span>{content.kicker}</span>
        <span>{facts.map((f) => `${f.value} ${f.label}`).slice(0, 2).join(" · ").toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", left: 50, top: 250, fontFamily: RUBIKMONO, fontSize: 22, color: second, mixBlendMode: "multiply" }}>{content.firstName.toUpperCase()}</div>
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", right: 50, top: 250, opacity: 0.85 }} />
      <Film strength={1.4} />
    </div>
  );
}
