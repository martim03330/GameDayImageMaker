/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { matchInfo, Paper, rng } from "./kit";
import { AgencyLogo, CONDENSED, Crest, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Light paper poster: the title huge in club colour — arched like a college banner or straight and
 * fading out — a faint city skyline behind, the player in front, crest in a ring at the bottom
 * (Iowa State "Gameday at Arrowhead", Farmington "Game Day").
 */
export function PaperLight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 5);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.35);
  const arched = r() < 0.55;
  const stripes = r() < 0.6;
  const cities = data.club?.cityImages ?? [];
  const city = cities.length ? cities[Math.floor(r() * cities.length)] : data.club?.cityImageUrl;
  const title = content.kicker.toUpperCase().replace(/\s+/g, " ");
  const len = [...title].length;

  // Barlow Condensed Black caps are ≈0.5em wide; the title is stretched tall.
  const width = 940;
  const size = Math.min(300, width / (len * 0.5));
  const stretch = Math.min(1.9, 360 / (size * 0.72));
  const titleTop = 150;
  const box = figureBox(data, 540, 150, 900);
  const info = matchInfo(data);
  const bottomLine = [info.when, info.where].filter(Boolean).join("  ·  ") || content.subline;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: deep }}>
      <Paper color="#ecebe8" />
      {city && (
        <img
          src={city}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            top: 380,
            width: CANVAS_W,
            height: 560,
            objectFit: "cover",
            filter: "grayscale(1) contrast(1.2) brightness(1.15)",
            opacity: 0.16,
            mixBlendMode: "multiply",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 30%, #000 60%, transparent)",
            maskImage: "linear-gradient(to bottom, transparent, #000 30%, #000 60%, transparent)",
          }}
        />
      )}
      {stripes && (
        <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 26, display: "flex", gap: 6 }}>
          <div style={{ flex: 2, background: accent }} />
          <div style={{ flex: 1, background: shade(accent, 0.5) }} />
        </div>
      )}

      {/* Title: arched (bulging up in the middle) or straight, fading towards the player. */}
      {arched ? (
        <svg width={CANVAS_W} height={620} style={{ position: "absolute", left: 0, top: titleTop - 60 }}>
          <defs>
            <path id="pl-arc" d={`M 70 ${440} Q 540 ${200} 1010 ${440}`} />
          </defs>
          <text fontFamily="var(--font-barlow), sans-serif" fontWeight={900} fontSize={size * 1.1} fill={accent} textAnchor="middle" letterSpacing={-2}>
            <textPath href="#pl-arc" startOffset="50%">
              {title}
            </textPath>
          </text>
        </svg>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: titleTop,
            textAlign: "center",
            fontFamily: CONDENSED,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 0.8,
            whiteSpace: "nowrap",
            transform: `scaleY(${stretch})`,
            transformOrigin: "50% 0",
            background: `linear-gradient(to bottom, ${accent} 0%, ${accent} 45%, ${shade(accent, 0.75)} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.5em", textTransform: "uppercase" }}>
        {data.club?.name ?? ""}
      </div>

      {/* Soft floor light + player. */}
      <div style={{ position: "absolute", left: -100, right: -100, bottom: 60, height: 320, background: "radial-gradient(50% 45% at 50% 70%, rgba(255,255,255,.85), transparent 70%)" }} />
      <GradedFigure data={data} box={box} grade="#ffffff" gradeStrength={0.08} />

      {/* The paper comes back over the lower body, so the caption always sits on a clean ground. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(to bottom, rgba(236,235,232,0) 0%, rgba(236,235,232,.92) 50%, #ecebe8 100%)" }} />
      {/* Bottom: crest in a ring, name and fixture. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <div style={{ width: 104, height: 104, borderRadius: "50%", border: `3px solid ${accent}`, background: "#f6f5f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Crest club={data.club} size={70} style={{ filter: "none" }} />
        </div>
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: Math.min(40, 560 / ((content.firstName.length + content.lastName.length + 1) * 0.5)), lineHeight: 1, textTransform: "uppercase", color: accent, whiteSpace: "nowrap" }}>
            {content.firstName} {content.lastName}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: Math.min(16, 560 / (bottomLine.length * 0.78)), letterSpacing: "0.14em", marginTop: 8, textTransform: "uppercase", whiteSpace: "nowrap" }}>{bottomLine}</div>
        </div>
      </div>
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", right: 60, top: 62 }} />
      <Film strength={0.4} />
    </div>
  );
}
