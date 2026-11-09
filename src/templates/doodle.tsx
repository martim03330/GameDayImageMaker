/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { MARKER } from "./fx";
import { opponentOf, Paper, SCRIPT } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Everything drawn by hand with a marker on paper: the goal net, the ball, the crest (Parma "Match Day"). */
export function Doodle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ink = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const words = content.kicker.toUpperCase().split(/\s+/);
  const first = words.slice(0, -1).join(" ") || words[0];
  const last = words.length > 1 ? words[words.length - 1].toLowerCase() : "";
  const net: string[] = [];
  for (let i = 0; i <= 8; i++) net.push(`M ${300 + i * 60} 690 L ${270 + i * 58 + (i % 2) * 8} 950`);
  for (let j = 0; j <= 5; j++) net.push(`M ${290 - j * 4} ${700 + j * 50} L ${790 + j * 3} ${705 + j * 49}`);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: ink }}>
      <Paper color="#fbfbf8" strength={0.7} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="wobble">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={4} />
            <feDisplacementMap in="SourceGraphic" scale={7} />
          </filter>
        </defs>
        <g filter="url(#wobble)" stroke={ink} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M 270 960 L 280 680 L 800 690 L 815 955" />
          {net.map((d, i) => (
            <path key={i} d={d} strokeWidth={6} opacity={0.9} />
          ))}
          <circle cx={230} cy={1040} r={70} stroke="#111" strokeWidth={9} />
          <path d="M 200 1000 l 30 20 l -8 36 M 262 1010 l -30 10 M 190 1060 l 30 -4 l 40 22" stroke="#111" strokeWidth={8} />
        </g>
      </svg>
      {data.club?.crestUrl && (
        <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 600, top: 980, width: 260, height: 260, objectFit: "contain", filter: "url(#wobble) saturate(1.2)" }} />
      )}
      <div style={{ position: "absolute", left: 110, top: 130, fontFamily: MARKER, fontSize: Math.min(150, 860 / Math.max(3, first.length * 0.52)) * (params.textScale ?? 1), lineHeight: 1, letterSpacing: "-0.02em" }}>{first}</div>
      {last && <div style={{ position: "absolute", left: 480, top: 190, fontFamily: SCRIPT, fontSize: Math.min(250, 560 / Math.max(3, last.length * 0.42)), lineHeight: 1, transform: "rotate(-10deg)" }}>{last}</div>}
      <div style={{ position: "absolute", left: 110, right: 110, top: 520, fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: "0.12em", textAlign: "center" }}>
        {(content.subline || "").toUpperCase()}
        <br />
        {[content.date, content.time].filter(Boolean).join(" H ")} · {opponentOf(data).toUpperCase()}
      </div>
      <AgencyLogo data={data} onLight height={30} style={{ position: "absolute", left: 60, bottom: 50 }} />
    </div>
  );
}
