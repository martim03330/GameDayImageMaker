/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { ARCHIVO_BLACK, DMSERIF, figureBox, Film, GradedFigure } from "./fx";
import { Micro, Paper } from "./kit";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Collage of stepped rectangles (city, photo crops, colour and crest blocks) behind a full-colour player (Maldini collage). */
export function Steps({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const cities = data.club?.cityImages ?? [];
  const orig = data.bgPhotoUrl;
  const [fx, fy, fw, fh] = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const faceFocus = `${(fx + fw / 2) * 100}% ${(fy + fh / 2) * 100}%`;
  const blocks: { x: number; y: number; w: number; h: number; kind: "city" | "orig" | "color" | "crest"; i?: number; cap: string }[] = [
    { x: 150, y: 780, w: 230, h: 260, kind: "city", i: 0, cap: data.club?.name ?? "" },
    { x: 260, y: 640, w: 200, h: 200, kind: "color", cap: data.club?.name ?? "" },
    { x: 360, y: 470, w: 250, h: 290, kind: "orig", cap: content.subline },
    { x: 500, y: 380, w: 220, h: 240, kind: "city", i: 1, cap: data.content.subline },
    { x: 650, y: 200, w: 300, h: 260, kind: "city", i: 2, cap: data.club?.founded ? `EST. ${data.club.founded}` : "" },
    { x: 820, y: 470, w: 170, h: 170, kind: "crest", cap: "" },
  ];
  const box = figureBox(data, params.side === "left" ? 360 : 740, 0, 1150);
  // A block's caption is dropped when it would fall behind the player's body (the middle of the cutout).
  // The whole picture of the player, not just his middle: on a bust the shoulders fill the frame.
  const bodyL = box.left;
  const bodyR = box.left + box.width;
  // The caption sits under its block: it must clear the player's body sideways, or sit above him.
  const capClear = (b: { x: number; y: number; h: number; cap: string }) => b.x + b.cap.length * 11 + 10 < bodyL || b.x > bodyR || b.y + b.h + 30 < box.top;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#161616" }}>
      <Paper color="#ece8e1" />
      {blocks.map((b, k) => (
        <div key={k} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, boxShadow: "0 2px 0 #0002, 0 16px 30px #0002" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: b.kind === "color" ? accent : "#d8d3cb" }}>
            {b.kind === "city" && cities.length > 0 && <img src={cities[(b.i ?? 0) % cities.length]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.1)" }} />}
            {b.kind === "orig" && orig && <img src={orig} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: faceFocus, transform: "scale(1.6)", filter: "grayscale(1) contrast(1.15)" }} />}
            {b.kind === "crest" && data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", inset: 20, width: "calc(100% - 40px)", height: "calc(100% - 40px)", objectFit: "contain" }} />}
          </div>
          {b.cap && capClear(b) && (
            <Micro color="#161616" style={{ position: "absolute", top: b.h + 6, left: 0, fontSize: 11, opacity: 0.7 }}>
              {b.cap}
            </Micro>
          )}
        </div>
      ))}
      <GradedFigure data={data} box={box} />
      <div style={{ position: "absolute", left: 60, top: 70, writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DMSERIF, fontStyle: "italic", fontSize: 40, lineHeight: 1.1, maxHeight: 600 }}>
        “{content.kicker.toLowerCase()}”
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: ARCHIVO_BLACK, fontSize: 100, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-0.03em" }}>
        {content.lastName.slice(0, Math.ceil(content.lastName.length / 2))}
        <br />
        <span style={{ color: accent }}>{content.lastName.slice(Math.ceil(content.lastName.length / 2))}</span>
      </div>
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", right: 60, bottom: 60 }} />
      <Film strength={1} />
    </div>
  );
}
