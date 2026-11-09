/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { matchInfo, opponentOf } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** A match poster pasted in the city, seen in perspective, with the player standing in front at street level. */
export function StreetPoster({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const city = data.club?.cityImages?.[2] ?? data.club?.cityImages?.[0] ?? data.club?.cityImageUrl ?? data.bgPhotoUrl;
  const left = params.side === "left";
  const box = figureBox(data, left ? 330 : 750, 0, 1020);
  const info = matchInfo(data);
  const headline = postType === "matchday" ? `vs ${opponentOf(data)}`.toUpperCase() : content.kicker.toUpperCase();
  const wrinkle = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.03' numOctaves='3' seed='4'/><feDiffuseLighting lighting-color='#fff' surfaceScale='2'><feDistantLight azimuth='45' elevation='55'/></feDiffuseLighting></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`,
  )}")`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#111", color: "#fff", perspective: 1400 }}>
      {city && <img src={city} alt="" style={{ position: "absolute", inset: -20, width: CANVAS_W + 40, height: CANVAS_H + 40, objectFit: "cover", filter: "blur(2px) brightness(.8) saturate(1.1)" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.35), transparent 30%, rgba(0,0,0,.75) 100%)" }} />

      <div
        style={{
          position: "absolute",
          left: left ? 470 : 90,
          top: 170,
          width: 520,
          height: 720,
          transform: `rotateY(${left ? -20 : 20}deg) rotateX(2deg)`,
          transformOrigin: left ? "right center" : "left center",
          background: accent,
          boxShadow: "0 30px 60px rgba(0,0,0,.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: wrinkle, mixBlendMode: "multiply", opacity: 0.45 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,.22) 50%, transparent 60%)" }} />
        <div style={{ position: "absolute", left: 36, right: 36, top: 36 }}>
          <Crest club={data.club} size={90} />
          <div style={{ fontFamily: DISPLAY, fontSize: fitSize(headline, 448, 130), lineHeight: 0.95, marginTop: 20 }}>{headline}</div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 40, marginTop: 16 }}>{postType === "matchday" ? info.when : content.subline}</div>
          <div style={{ fontFamily: SANS, fontSize: 18, letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase", opacity: 0.85 }}>{info.where || data.club?.name}</div>
        </div>
        <div style={{ position: "absolute", left: 36, bottom: 30, fontFamily: DISPLAY, fontSize: 64, lineHeight: 0.9, opacity: 0.95 }}>{(data.club?.name ?? "").toUpperCase()}</div>
      </div>

      <GradedFigure data={data} box={box} grade="#ffd9a8" gradeStrength={0.25} rim="rgba(255,230,190,.6)" rimSide={left ? "right" : "left"} />

      <AgencyLogo data={data} height={36} style={{ position: "absolute", left: 56, top: 50 }} />
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 56, textAlign: left ? "right" : "left" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.3em", color: accent }}>{content.firstName.toUpperCase()}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 96, lineHeight: 0.95, textTransform: "uppercase" }}>{content.lastName}</div>
      </div>
      <Film strength={1.2} />
    </div>
  );
}
