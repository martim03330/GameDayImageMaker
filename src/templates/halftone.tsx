/* eslint-disable @next/next/no-img-element */
import { AgencyLogo, CONDENSED, Crest, DISPLAY, factRows, fitSize, M } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

const PAPER = "#efe8da";
const INK = "#15130f";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/** Jagged polygon for a torn paper strip. */
function tornClip(): string {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * 100;
    top.push(`${x}% ${(i * 37) % 7 === 0 ? 3 : (i * 13) % 5}%`);
    bottom.push(`${100 - x}% ${100 - ((i * 29) % 6)}%`);
  }
  return `polygon(${[...top, ...bottom].join(",")})`;
}
const TORN = tornClip();

/** 90s zine: paper, halftone dots, duotone player, skewed headline on a torn strip. */
export function Halftone({ data }: { data: RenderData }) {
  const { params, content, photoUrl } = data;
  const playerLeft = params.side === "left";
  const head = content.kicker.toUpperCase();
  const headSize = fitSize(head, 900, 170, 0.5) * (params.textScale ?? 1);
  const facts = factRows(data);
  const px = params.playerX ?? 0;
  const py = params.playerY ?? 0;
  const ps = params.playerScale ?? 1;
  const box = { left: (playerLeft ? -40 : 300) + px, top: 70 + py, width: 820, height: CANVAS_H - 70 };
  const mask = photoUrl
    ? {
        WebkitMaskImage: `url(${maskUrl(photoUrl)})`,
        maskImage: `url(${maskUrl(photoUrl)})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center bottom",
        maskPosition: "center bottom",
      }
    : {};

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK, fontFamily: CONDENSED }}>
      {/* Halftone field in the club colour, fading towards the text side. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at center, ${params.primary} 32%, transparent 34%)`,
          backgroundSize: "12px 12px",
          WebkitMaskImage: `linear-gradient(${playerLeft ? "to left" : "to right"}, transparent 5%, #000 75%)`,
          maskImage: `linear-gradient(${playerLeft ? "to left" : "to right"}, transparent 5%, #000 75%)`,
          opacity: 0.55,
        }}
      />

      {photoUrl && (
        <div
          style={{
            position: "absolute",
            ...box,
            transform: `rotate(${playerLeft ? 3 : -3}deg) scale(${ps})`,
            transformOrigin: "center bottom",
            isolation: "isolate",
          }}
        >
          <img
            src={photoUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", filter: "grayscale(1) contrast(1.35) brightness(1.05)" }}
          />
          {/* Duotone: club colour in the shadows, paper in the highlights, clipped to the player's shape. */}
          <div style={{ position: "absolute", inset: 0, background: params.primary, mixBlendMode: "screen", ...mask }} />
          <div style={{ position: "absolute", inset: 0, background: `color-mix(in srgb, ${params.accent} 45%, ${PAPER})`, mixBlendMode: "multiply", ...mask }} />
        </div>
      )}

      <Crest club={data.club} size={90} style={{ position: "absolute", top: M, [playerLeft ? "right" : "left"]: M }} />
      <AgencyLogo data={{ ...data }} height={46} style={{ position: "absolute", top: M + 18, [playerLeft ? "left" : "right"]: M, color: INK, filter: data.agency.logoUrl ? "invert(1)" : undefined }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 820, transform: "rotate(-3deg)" }}>
        <div style={{ background: params.accent, clipPath: TORN, padding: "34px 60px 30px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              transform: "skewX(-8deg)",
              fontFamily: DISPLAY,
              fontSize: headSize,
              lineHeight: 0.95,
              color: PAPER,
              textShadow: `4px 3px 0 color-mix(in srgb, ${params.primary} 85%, transparent)`,
              whiteSpace: "nowrap",
            }}
          >
            {head}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: M, right: M, bottom: M, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 76, lineHeight: 0.95, textTransform: "uppercase" }}>
            {content.firstName} <span style={{ color: params.primary }}>{content.lastName}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 10 }}>{content.subline}</div>
        </div>
        {facts.length > 0 && (
          <div style={{ display: "flex", gap: 26 }}>
            {facts.slice(0, 3).map((f, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: f.value.length > 5 ? 40 : 70, lineHeight: 1 }}>{f.value}</div>
                <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase" }}>{f.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, mixBlendMode: "multiply", opacity: 0.18, pointerEvents: "none" }} />
    </div>
  );
}
