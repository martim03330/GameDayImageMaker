/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { DMSERIF, figureBox, Film, GradedFigure } from "./fx";
import { opponentOf, VersusCrests } from "./kit";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Photographic, shallow depth of field: blurred stadium, sharp player, elegant serif (Celtic) or solid/outline header (Real Madrid). */
export function Cinematic({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const bg = data.club?.stadiumImages?.[0] ?? data.bgPhotoUrl ?? data.club?.cityImageUrl;
  const serif = params.side === "left";
  const box = figureBox(data, serif ? 680 : 560, 0, serif ? 980 : 1080);
  const words = content.kicker.toUpperCase().split(/\s+/);
  const solid = words.slice(0, Math.max(1, words.length - 1)).join(" ");
  const outline = words.length > 1 ? words[words.length - 1] : "";
  const line = postType === "matchday" || postType === "result" ? `${data.club?.name ?? ""} v ${opponentOf(data)} | ${content.time || content.date || ""}` : `${content.firstName} ${content.lastName} | ${content.subline}`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0b0c10", color: "#fff" }}>
      {bg && <img src={bg} alt="" style={{ position: "absolute", inset: -50, width: CANVAS_W + 100, height: CANVAS_H + 100, objectFit: "cover", filter: "blur(16px) saturate(1.1) brightness(.62)" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.55), transparent 35%, rgba(0,0,0,.2) 70%, rgba(0,0,0,.8))" }} />
      <GradedFigure data={data} box={box} rim="rgba(255,255,255,.35)" grade="#ffe7c2" gradeStrength={0.15} />

      {serif ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center" }}>
          <VersusCrests data={data} size={80} color="#fff" gap={16} />
          <div style={{ fontFamily: DMSERIF, fontSize: 150 * (params.textScale ?? 1), lineHeight: 1, marginTop: 24, letterSpacing: "-0.02em" }}>
            {content.kicker.charAt(0) + content.kicker.slice(1).toLowerCase()}
          </div>
          <div style={{ fontFamily: DMSERIF, fontSize: 34, marginTop: 14 }}>{line}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "22px 120px 0" }}>
            <span style={{ flex: 1, height: 2, background: "#fff" }} />
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.2em" }}>{content.subline.split("·")[0].toUpperCase()}</span>
            <span style={{ flex: 1, height: 2, background: "#fff" }} />
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 60,
              display: "flex",
              gap: 12,
              whiteSpace: "nowrap",
              fontFamily: DISPLAY,
              // Anton caps average ~0.58em wide; the gap counts as one more glyph.
              fontSize: Math.min(260, 990 / Math.max(4, (solid.length + outline.length + 1) * 0.58)) * (params.textScale ?? 1),
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#fff" }}>{solid}</span>
            <span style={{ color: "transparent", WebkitTextStroke: "3px #fff" }}>{outline}</span>
          </div>
          <div style={{ position: "absolute", left: 40, top: 360 }}>
            <VersusCrests data={data} size={64} color="#fff" gap={10} />
          </div>
          <div style={{ position: "absolute", right: 40, top: 380, fontFamily: SANS, fontWeight: 800, fontSize: 32 }}>{content.time || content.date}</div>
        </>
      )}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 60, display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontSize: 20 }}>
        <span>{data.club?.stadium ?? data.club?.name ?? ""}</span>
        <span style={{ flex: 1, height: 1.5, background: "rgba(255,255,255,.7)" }} />
        <AgencyLogo data={data} height={28} />
        <span style={{ flex: 1, height: 1.5, background: "rgba(255,255,255,.7)" }} />
        <span style={{ color: accent === "#ffffff" ? "#fff" : "#fff" }}>{content.subline.split("·")[0]}</span>
      </div>
      <Film strength={1.3} />
    </div>
  );
}
