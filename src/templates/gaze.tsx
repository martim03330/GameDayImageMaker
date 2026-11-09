/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { cutMask, DELA, figureBox, Film } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Three bands: an extreme crop of the eyes, a small action shot on white, the mouth and chin (eye-strip posters). */
export function Gaze({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const bust = data.cutouts.find((c) => (c.face?.[3] ?? 0) > 0.2) ?? data.cutouts[0];
  const full = data.cutouts.find((c) => (c.face?.[3] ?? 1) < 0.2)?.url ?? data.photoUrl;
  const src = bust?.original ?? data.bgPhotoUrl;
  const [fx, fy, fw, fh] = bust?.face ?? data.face ?? [0.4, 0.1, 0.25, 0.3];
  // Scale so the face is ~1.5× the canvas width; eye line ≈ 40% down the face box, mouth ≈ 78%.
  const w = (CANVAS_W * 1.5) / fw;
  const h = w / (bust?.aspect ?? data.photoAspect ?? 0.7);
  const band = (top: number, height: number, focusY: number) => (
    <div style={{ position: "absolute", left: 0, top, width: CANVAS_W, height, overflow: "hidden", background: "#111" }}>
      {src && (
        <img
          src={bust?.url ?? src}
          alt=""
          style={{ position: "absolute", width: w, height: h, maxWidth: "none", left: CANVAS_W / 2 - (fx + fw / 2) * w, top: height / 2 - (fy + fh * focusY) * h, filter: "grayscale(1) contrast(1.25)" }}
        />
      )}
    </div>
  );
  const box = figureBox(data, 600, 330, 600);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f7f7f5", color: "#141414" }}>
      {band(0, 330, 0.42)}
      {band(1020, 330, 0.82)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, height: 1, background: "#141414" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1019, height: 1, background: "#141414" }} />
      <div style={{ position: "absolute", left: 60, top: 390, fontFamily: DELA, fontSize: 230, lineHeight: 1, color: accent }}>{data.player.number || "#"}</div>
      {full && <img src={full} alt="" style={{ position: "absolute", ...box, maxWidth: "none", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", right: 60, top: 400, width: 280, textAlign: "right", fontFamily: MONO, fontSize: 18, lineHeight: 1.6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <b style={{ fontSize: 26 }}>{content.kicker}</b>
        <br />
        {content.firstName} {content.lastName}
        <br />
        {postType === "matchday" || postType === "result" ? `vs ${opponentOf(data)}` : content.subline}
        <br />
        {[content.date, content.time].filter(Boolean).join(" · ")}
      </div>
      <AgencyLogo data={data} onLight height={26} style={{ position: "absolute", left: 60, top: 960 }} />
      <Film strength={1} />
    </div>
  );
}
