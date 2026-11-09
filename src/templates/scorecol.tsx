/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { Film } from "./fx";
import { Micro } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const COL = 250;

/** Full-bleed celebration photo with the score stacked in a vertical column (full-time posters). */
export function ScoreCol({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const col = shade(accent, -0.55);
  const photo = data.bgPhotoUrl;
  const [fx, , fw] = data.face ?? [0.4, 0.1, 0.2, 0.1];
  const crest = (src?: string | null) => (src ? <img src={src} alt="" style={{ width: 110, height: 110, objectFit: "contain" }} /> : <div style={{ height: 110 }} />);
  const score = (v?: string) => <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 280, lineHeight: 0.95, color: "#fff" }}>{v ?? "0"}</div>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#111", color: "#fff" }}>
      {photo && (
        <img
          src={photo}
          alt=""
          style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W - COL, height: CANVAS_H, objectFit: "cover", objectPosition: `${(fx + fw / 2) * 100}% 25%`, filter: "contrast(1.08) saturate(1.05)" }}
        />
      )}
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W - COL, height: CANVAS_H, background: "linear-gradient(to top, rgba(0,0,0,.8), transparent 40%)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: COL, height: CANVAS_H, background: col, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,.25)" }} />
        {crest(content.homeCrest)}
        {score(content.homeGoals)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.3em", color: accent === "#ffffff" ? "#fff" : shade(accent, 0.5) }}>FINAL</div>
        {score(content.awayGoals)}
        {crest(content.awayCrest)}
      </div>
      <div style={{ position: "absolute", left: 50, bottom: 60, width: CANVAS_W - COL - 100 }}>
        <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 72, lineHeight: 1, textTransform: "uppercase" }}>
          {content.firstName} {content.lastName}
        </div>
        <Micro color="#fff" style={{ marginTop: 10 }}>
          {content.stats.map((s) => `${s.value} ${s.label}`).join("  ·  ")}
        </Micro>
        <Micro color="#fff" style={{ marginTop: 6, opacity: 0.7 }}>
          {content.subline}
        </Micro>
      </div>
      <AgencyLogo data={data} height={28} style={{ position: "absolute", left: 50, top: 50 }} />
      <Film strength={1.1} />
    </div>
  );
}
