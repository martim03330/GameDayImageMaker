/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { DMSERIF, DoubleExposure, figureBox, Film } from "./fx";
import { Micro } from "./kit";
import { AgencyLogo, Crest, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Double exposure: the city lives inside the player's silhouette; his face stays sharp and untouched. */
export function Exposure({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const city = data.club?.cityImages?.[1] ?? data.club?.cityImages?.[0] ?? data.club?.cityImageUrl ?? data.bgPhotoUrl;
  const box = figureBox(data, 560, -40, 1240);
  const url = data.photoUrl;
  const [fx, fy, fw, fh] = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const faceMask = `radial-gradient(${fw * 95}% ${fh * 80}% at ${(fx + fw / 2) * 100}% ${(fy + fh / 2) * 100}%, #000 55%, transparent 100%)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f4f2ee", color: "#16171b" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 60% at 55% 45%, color-mix(in srgb, ${accent} 16%, transparent), transparent 70%)` }} />
      {url && (
        <>
          {/* Faint full figure keeps the body readable. */}
          <img src={url} alt="" style={{ position: "absolute", ...box, filter: "grayscale(1) contrast(1.2)", opacity: 0.35 }} />
          {city && <DoubleExposure box={box} cutoutUrl={url} photoUrl={city} tint={undefined} opacity={0.95} />}
          <img src={url} alt="" style={{ position: "absolute", ...box, WebkitMaskImage: faceMask, maskImage: faceMask, filter: "grayscale(.15) contrast(1.05)" }} />
        </>
      )}

      {/* The silhouette dissolves into the page at the foot, so the caption never lands on dark city. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(to top, #f4f2ee 40%, transparent)" }} />

      <div style={{ position: "absolute", left: 60, top: 64, fontFamily: DMSERIF, fontSize: 88, lineHeight: 0.95 }}>
        {content.firstName}
        <br />
        <span style={{ fontStyle: "italic", color: accent }}>{content.lastName}</span>
      </div>
      <div style={{ position: "absolute", left: 62, top: 260, fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase" }}>{content.kicker}</div>
      <Micro color="#16171b" style={{ position: "absolute", right: 50, top: 300, writingMode: "vertical-rl", fontSize: 18, letterSpacing: "0.4em" }}>
        {[(data.club?.name ?? "").toUpperCase(), content.subline].filter(Boolean).join(" · ")}
      </Micro>
      <Crest club={data.club} size={70} style={{ position: "absolute", right: 56, top: 56 }} />
      <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: SANS, fontSize: 22, lineHeight: 1.5 }}>
        <b>{content.subline}</b>
        <br />
        <span style={{ opacity: 0.7 }}>{content.stats.map((s) => `${s.value} ${s.label}`).join(" · ") || data.club?.name}</span>
      </div>
      <AgencyLogo data={data} onLight height={32} style={{ position: "absolute", right: 60, bottom: 60 }} />
      <Film strength={0.9} />
    </div>
  );
}
