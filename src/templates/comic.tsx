/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { BANGERS, cutMask, figureBox } from "./fx";
import { factRows } from "./shared";
import { SANS } from "./shared";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function starburst(cx: number, cy: number, r1: number, r2: number, n = 16) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n;
    const r = i % 2 ? r2 : r1;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
}

/** Comic-book cover: masthead, issue box, speed lines, starburst bubbles, small panels (Alvastudio comics). */
export function Comic({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const box = figureBox(data, 560, 250, 900);
  const facts = factRows(data);
  const shout = content.kicker.split(" ")[0] + "!!";
  const d = new Date();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#fff6d6", color: "#111" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-conic-gradient(from 0deg at 50% 45%, #ffffff 0 2deg, #ffe9a8 2deg 5deg)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,0,0,.14) 1.6px, transparent 2px)", backgroundSize: "9px 9px", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 210, background: accent, borderBottom: "8px solid #111" }} />
      <div style={{ position: "absolute", left: 24, top: 20, width: 150, height: 170, background: "#fff", border: "5px solid #111", textAlign: "center", fontFamily: BANGERS, lineHeight: 1 }}>
        <div style={{ fontSize: 46, marginTop: 8 }}>#{data.player.number || "07"}</div>
        <div style={{ fontSize: 22 }}>{MONTHS[d.getMonth()]}</div>
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ height: 56, marginTop: 4 }} />}
        <div style={{ fontSize: 18 }}>2,50€</div>
      </div>
      <div style={{ position: "absolute", left: 200, right: 20, top: 16, fontFamily: BANGERS, fontSize: Math.min(170, 1500 / Math.max(6, content.lastName.length)), lineHeight: 1, color: "#ffd400", WebkitTextStroke: "6px #111", paintOrder: "stroke fill", textShadow: "10px 10px 0 #e4202e", letterSpacing: "0.02em", textTransform: "uppercase" }}>
        {content.lastName}
      </div>
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "contrast(1.35) saturate(1.5) drop-shadow(6px 6px 0 #111)", ...cutMask(data.cut) }} />}
      {/* Caption box in front of the player, like a comic panel caption. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 214, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#fff", border: "3px solid #111", padding: "4px 14px", fontFamily: SANS, fontWeight: 900, fontSize: 22, letterSpacing: "0.2em" }}>{`THE LEGEND · ${content.kicker} · SPECIAL EDITION`}</span>
      </div>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={starburst(230, 520, 150, 105)} fill="#ffd400" stroke="#111" strokeWidth={6} />
        <text x={230} y={540} textAnchor="middle" fontFamily="var(--font-bangers), sans-serif" fontSize={64} fill="#e4202e" stroke="#111" strokeWidth={2}>
          {shout}
        </text>
        <polygon points={starburst(880, 780, 110, 78, 12)} fill="#fff" stroke="#111" strokeWidth={6} />
        <text x={880} y={796} textAnchor="middle" fontFamily="var(--font-bangers), sans-serif" fontSize={50} fill="#111">
          BOOM!
        </text>
      </svg>
      <div style={{ position: "absolute", left: 30, right: 30, top: 1100, height: 220, display: "flex", gap: 18 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, background: i === 1 ? accent : "#fff", border: "6px solid #111", transform: `rotate(${(i - 1) * 1.5}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: BANGERS }}>
            <div style={{ fontSize: 76, lineHeight: 1, color: i === 1 ? "#fff" : "#111" }}>{facts[i]?.value ?? (i === 1 ? "⚽" : "★")}</div>
            <div style={{ fontSize: 28, color: i === 1 ? "#fff" : "#111" }}>{facts[i]?.label ?? [content.firstName, data.club?.name ?? "", data.player.position][i]}</div>
          </div>
        ))}
      </div>
      <AgencyLogo data={data} onLight height={24} style={{ position: "absolute", right: 30, top: 1066 }} />
    </div>
  );
}
