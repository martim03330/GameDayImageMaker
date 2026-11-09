/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure, GradientMapDefs } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

/** A giant face silhouette holding the stadium / city, the player running in front of it (Foden, Man City × Chelsea). */
export function Memory({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.55);
  const bust = data.cutouts.find((c) => (c.face?.[3] ?? 0) > 0.24) ?? data.cutouts[0];
  const scene = data.club?.stadiumImages?.[0] ?? data.club?.cityImages?.[0] ?? data.bgPhotoUrl;
  const full = data.cutouts.find((c) => (c.face?.[3] ?? 1) < 0.24)?.url ?? data.photoUrl;
  const box = figureBox(data, 720, 90, 900);
  const [fx, fy, fw, fh] = bust?.face ?? [0.4, 0.1, 0.25, 0.3];
  const faceW = 700;
  const w = faceW / fw;
  const h = w / (bust?.aspect ?? 0.7);
  const big = { left: 380 - (fx + fw / 2) * w, top: 620 - (fy + fh / 2) * h, width: w, height: h };
  const mask = bust ? { WebkitMaskImage: `url(${maskUrl(bust.url)})`, maskImage: `url(${maskUrl(bust.url)})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" } : {};

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#e9edf2", color: deep }}>
      <GradientMapDefs id="mem-duo" dark={deep} light="#eef1f5" />
      {bust && (
        <div style={{ position: "absolute", ...big, ...mask, WebkitMaskImage: `url(${maskUrl(bust.url)}), linear-gradient(to bottom, #000 60%, transparent 90%)`, WebkitMaskComposite: "source-in" }}>
          <img src={bust.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "url(#mem-duo)" }} />
          {scene && <img src={scene} alt="" style={{ position: "absolute", left: "25%", top: "35%", width: "70%", height: "45%", objectFit: "cover", filter: "url(#mem-duo)", mixBlendMode: "multiply", opacity: 0.95 }} />}
        </div>
      )}
      <GradedFigure data={data} src={full} box={box} />
      <div style={{ position: "absolute", left: "50%", top: 40, transform: "translateX(-50%)", display: "flex" }}>
        {[content.homeCrest ?? data.club?.crestUrl, content.awayCrest].filter(Boolean).map((c, i) => (
          <div key={i} style={{ width: 120, height: 120, background: i ? deep : accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={c!} alt="" style={{ width: 84, height: 84, objectFit: "contain" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 60, top: 760, fontFamily: CONDENSED, fontWeight: 700, fontSize: 64, lineHeight: 0.95, textTransform: "uppercase" }}>
        {postType === "matchday" || postType === "result" ? (
          <>
            {(data.club?.name ?? "").split(" ")[0]} <span style={{ fontSize: 34 }}>vs</span>
            <br />
            {opponentOf(data)}
          </>
        ) : (
          <>
            {content.firstName}
            <br />
            {content.lastName}
          </>
        )}
      </div>
      <div style={{ position: "absolute", left: 180, top: 1080, fontFamily: CONDENSED, fontWeight: 600, fontSize: 36, lineHeight: 1.1, textTransform: "uppercase" }}>
        {content.kicker}
        <br />
        {content.time || content.date || content.subline}
      </div>
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", left: 60, bottom: 50 }} />
      <Film strength={0.8} />
    </div>
  );
}
