/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { Figure, matchInfo, twoLines } from "./kit";
import { AgencyLogo, CONDENSED, DISPLAY, factRows, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const FRAME = { x: 170, y: 560, w: 740, h: 520, rot: -4 };

function corners() {
  const { x, y, w, h, rot } = FRAME;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const a = (rot * Math.PI) / 180;
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ].map(([px, py]) => [cx + (px - cx) * Math.cos(a) - (py - cy) * Math.sin(a), cy + (px - cx) * Math.sin(a) + (py - cy) * Math.cos(a)]);
}

/** Tilted photo frame with the player breaking out of it; spaced + knockout headline (Liverpool "MATCH DAY"). */
export function Frame({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const [l1, l2] = twoLines(content.kicker).length > 1 ? twoLines(content.kicker) : ["", content.kicker.toUpperCase()];
  const inside = data.club?.cityImages?.[3] ?? data.club?.cityImageUrl ?? data.bgPhotoUrl;
  const bg = data.bgPhotoUrl ?? data.club?.cityImageUrl;
  const [tl, tr, br, bl] = corners();
  // Player visible inside the frame and everywhere above its top edge.
  const clip = `polygon(0 0, 1080px 0, 1080px ${tr[1]}px, ${tr[0]}px ${tr[1]}px, ${br[0]}px ${br[1]}px, ${bl[0]}px ${bl[1]}px, ${tl[0]}px ${tl[1]}px, 0 ${tl[1]}px)`;
  const info = matchInfo(data);
  const facts = factRows(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0b0b0d", color: "#fff" }}>
      {bg && <img src={bg} alt="" style={{ position: "absolute", inset: -60, width: CANVAS_W + 120, height: CANVAS_H + 120, objectFit: "cover", filter: "blur(22px) saturate(.8)" }} />}
      <div style={{ position: "absolute", inset: 0, background: accent, mixBlendMode: "multiply", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, transparent 30%, rgba(0,0,0,.65) 100%)" }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 64, textAlign: "center" }}>
        {l1 && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: "0.32em", paddingLeft: "0.32em", lineHeight: 1 }}>{l1}</div>}
        <div style={{ display: "inline-block", marginTop: 14, background: "#fff", padding: "4px 40px", color: accent, fontFamily: DISPLAY, fontSize: fitSize(l2, 740, 190) * (params.textScale ?? 1), lineHeight: 1.02, letterSpacing: "0.12em" }}>
          {l2}
        </div>
      </div>

      <div style={{ position: "absolute", left: FRAME.x + 26, top: FRAME.y + 22, width: FRAME.w, height: FRAME.h, transform: `rotate(${FRAME.rot + 3}deg)`, border: "3px solid rgba(255,255,255,.6)" }} />
      <div
        style={{
          position: "absolute",
          left: FRAME.x,
          top: FRAME.y,
          width: FRAME.w,
          height: FRAME.h,
          transform: `rotate(${FRAME.rot}deg)`,
          border: "14px solid #fff",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,.5)",
          background: accent,
        }}
      >
        {inside && <img src={inside} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.05) contrast(1.05)" }} />}
      </div>

      <div style={{ position: "absolute", inset: 0, clipPath: clip }}>
        <Figure data={data} cx={560} bottom={CANVAS_H - FRAME.y - FRAME.h + 20} height={660} style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,.5))" }} />
      </div>

      <AgencyLogo data={data} height={32} style={{ position: "absolute", left: 60, bottom: 76 }} />

      <div style={{ position: "absolute", left: 140, right: 140, bottom: 70, textAlign: "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          {postType === "matchday" ? info.teams : `${content.firstName} ${content.lastName}`}
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,.6)", margin: "14px 0" }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {postType === "matchday" ? content.date : facts.map((f) => `${f.value} ${f.label}`).slice(0, 2).join(" · ") || content.subline}
        </div>
        <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 30, letterSpacing: "0.1em", opacity: 0.85 }}>{postType === "matchday" ? [content.time, info.where].filter(Boolean).join(" · ") : content.subline}</div>
      </div>
    </div>
  );
}
