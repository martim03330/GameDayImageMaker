/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { DMSERIF, Film } from "./fx";
import { matchInfo, Paper } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const W = 700;
const H = 900;

/** The photo as a perforated postage stamp with a circular postmark (AS Monaco / Wimbledon stamps). */
export function Stamp({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const photo = data.bgPhotoUrl ?? data.club?.cityImageUrl;
  const info = matchInfo(data);
  const mark = `${(data.club?.name ?? "").toUpperCase()} · ${(content.date || content.subline).toUpperCase()} · `;
  const perforation = "radial-gradient(circle 13px at 50% 50%, transparent 98%, #000) -13px -13px / 32px 32px";
  const value = postType === "renewal" ? content.until : data.player.number || content.stats[0]?.value || "";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#fff" }}>
      <Paper color={shade(accent, -0.55)} strength={1.2} />
      <div style={{ position: "absolute", left: 60, top: 70, fontFamily: DMSERIF, fontSize: 72, lineHeight: 1 }}>{content.kicker.toLowerCase()}</div>
      <div style={{ position: "absolute", left: 62, top: 150, fontFamily: SANS, fontSize: 22, letterSpacing: "0.2em", opacity: 0.8 }}>{info.teams.toUpperCase() || content.subline}</div>

      <div style={{ position: "absolute", left: (CANVAS_W - W) / 2, top: 250, width: W, height: H, transform: "rotate(-3deg)", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.45))" }}>
        <div style={{ position: "absolute", inset: 0, background: "#f4f0e8", WebkitMask: perforation, mask: perforation }} />
        <div style={{ position: "absolute", inset: 0, background: "#f4f0e8", margin: 13 }} />
        <div style={{ position: "absolute", left: 40, top: 40, right: 40, bottom: 150, overflow: "hidden", background: accent }}>
          {photo && <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%", filter: "contrast(1.08) saturate(.9)" }} />}
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 6px #f4f0e8" }} />
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, bottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: "#1b1b1d" }}>
          <div>
            <div style={{ fontFamily: DMSERIF, fontSize: 58, lineHeight: 0.95 }}>{content.lastName}</div>
            <div style={{ fontFamily: SANS, fontSize: 16, letterSpacing: "0.25em", marginTop: 6 }}>{(data.club?.name ?? "").toUpperCase()}</div>
          </div>
          <div style={{ fontFamily: DMSERIF, fontSize: 84, lineHeight: 0.8, color: accent }}>{value}</div>
        </div>
      </div>

      <svg data-bleed width={300} height={300} viewBox="0 0 300 300" style={{ position: "absolute", right: 70, top: 930, mixBlendMode: "screen", opacity: 0.9, transform: "rotate(-12deg)" }}>
        <defs>
          <path id="ring" d="M150,150 m-110,0 a110,110 0 1,1 220,0 a110,110 0 1,1 -220,0" />
        </defs>
        <circle cx={150} cy={150} r={138} fill="none" stroke="#fff" strokeWidth={4} />
        <circle cx={150} cy={150} r={84} fill="none" stroke="#fff" strokeWidth={2} />
        <text fill="#fff" fontFamily="var(--font-mono), monospace" fontSize={20} letterSpacing={3}>
          <textPath href="#ring">{mark.repeat(3)}</textPath>
        </text>
        {data.club?.crestUrl && <image href={data.club.crestUrl} x={105} y={105} width={90} height={90} />}
      </svg>

      <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: SANS, fontSize: 22, lineHeight: 1.4 }}>
        <b>{[content.date, content.time].filter(Boolean).join(" · ")}</b>
        <br />
        <span style={{ opacity: 0.75 }}>{info.where || content.subline}</span>
      </div>
      <AgencyLogo data={data} height={30} style={{ position: "absolute", right: 60, bottom: 60 }} />
      <Film strength={1.3} />
    </div>
  );
}
