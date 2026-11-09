/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { ARCHIVO_BLACK, CastShadow, cutMask, Film } from "./fx";
import { AgencyLogo, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const C = 3;
const R = 4;
const W = CANVAS_W / C;
const H = CANVAS_H / R;

/** Checkerboard in club colour / white with the player repeated in the cells, long shadows, crests as outlines (Man City MD35). */
export function Checker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const photos = data.cutouts.length ? data.cutouts : [];
  // Which cells hold what (row-major).
  const plan: ("p" | "info" | "home" | "away" | "tag" | "")[] = ["p", "info", "p", "home", "p", "away", "p", "tag", "p", "", "", ""];
  let k = 0;
  // "Ta’Qali National Stadium Ta’Qali" → "Ta’Qali National Stadium"; "Estádio X" → "X".
  const venue = (data.club?.stadium ?? "").replace(/^Est[áa]dio /, "").split(" ").filter((w, i, a) => a.indexOf(w) === i).join(" ");

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#eef1f4", color: "#0d2a4a" }}>
      {Array.from({ length: C * R }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i % C) * W, top: Math.floor(i / C) * H, width: W, height: H, background: (i + Math.floor(i / C)) % 2 === 0 ? accent : "#eef1f4" }} />
      ))}
      {plan.map((what, i) => {
        const x = (i % C) * W;
        const y = Math.floor(i / C) * H;
        if (what === "p" && photos.length) {
          const p = photos[k++ % photos.length];
          const h = H * 1.45;
          const w = h * (p.aspect ?? 0.5);
          const box = { left: x + W / 2 - w / 2, top: y + H - h + 10, width: w, height: h };
          const flip = k % 2 === 0 ? "scaleX(-1)" : "";
          return (
            <div key={i}>
              <CastShadow box={box} url={p.url} skew={-62} length={0.22} opacity={0.35} />
              <img src={p.url} alt="" style={{ position: "absolute", ...box, maxWidth: "none", transform: flip, ...cutMask(p.cut) }} />
            </div>
          );
        }
        const light = (i + Math.floor(i / C)) % 2 !== 0;
        const ink = light ? accent : "#fff";
        if (what === "home" || what === "away") {
          const src = what === "home" ? content.homeCrest ?? data.club?.crestUrl : content.awayCrest;
          return src ? (
            <img key={i} src={src} alt="" style={{ position: "absolute", left: x + W * 0.2, top: y + H * 0.16, width: W * 0.6, height: H * 0.68, objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.25))" }} />
          ) : null;
        }
        if (what === "info")
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ink, textAlign: "center" }}>
              <AgencyLogo data={data} onLight={light} height={30} />
              <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: fitSize(venue, W - 60, 40, 0.62), lineHeight: 1.05, marginTop: 16, textTransform: "uppercase", padding: "0 20px" }}>{venue}</div>
            </div>
          );
        if (what === "tag")
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ border: `3px solid ${ink}`, borderRadius: 99, padding: "8px 26px", fontFamily: ARCHIVO_BLACK, fontSize: 30, color: ink, transform: "rotate(-4deg)" }}>{content.kicker}</div>
            </div>
          );
        return null;
      })}
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: "0.06em" }}>
        <span>{`${content.firstName} ${content.lastName}`.toUpperCase()}</span>
        <span>{[content.date, content.time].filter(Boolean).join(" · ")}</span>
      </div>
      <Film strength={0.6} />
    </div>
  );
}
