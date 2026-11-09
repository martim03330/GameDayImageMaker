/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { ARCHIVO_BLACK, figureBox, Film, GradedFigure } from "./fx";
import { Micro } from "./kit";
import { AgencyLogo, CONDENSED, fitSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Four city photos in staggered vertical slices; the player crosses them all. */
export function Slices({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const photos = data.club?.cityImages?.length ? data.club.cityImages : [data.club?.cityImageUrl ?? data.bgPhotoUrl ?? ""];
  const n = 4;
  const gap = 14;
  const w = (CANVAS_W - 120 - gap * (n - 1)) / n;
  const offsets = [60, -40, 90, -10];
  const box = figureBox(data, 540, 0, 1120);
  const club = (data.club?.name ?? "").toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0d0e11", color: "#fff" }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 60 + i * (w + gap), top: 170 + offsets[i], width: w, height: 880, overflow: "hidden", background: accent }}>
          {photos[i % photos.length] && (
            <img
              src={photos[i % photos.length]}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${[30, 55, 70, 45][i]}% 50%`, filter: "saturate(1.05) contrast(1.05) brightness(.85)" }}
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 55%, color-mix(in srgb, ${accent} 70%, #000))` }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 380, background: "linear-gradient(to top, #0d0e11 30%, transparent)" }} />
      <GradedFigure data={data} box={box} grade="#ffe0b0" gradeStrength={0.18} rim="rgba(255,255,255,.55)" />

      <AgencyLogo data={data} height={36} style={{ position: "absolute", left: 60, top: 60 }} />
      <Micro color="#fff" style={{ position: "absolute", right: 60, top: 70 }}>
        {club}
      </Micro>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 56 }}>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: 36, color: accent, letterSpacing: "0.06em" }}>{content.kicker}</div>
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: fitSize(`${content.firstName} ${content.lastName}`, 960, 104, 0.62) * (params.textScale ?? 1), lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          {content.firstName} {content.lastName}
        </div>
        <Micro color="#fff" style={{ marginTop: 8, opacity: 0.8 }}>
          {content.subline}
        </Micro>
      </div>
      <Film strength={1.2} />
    </div>
  );
}
