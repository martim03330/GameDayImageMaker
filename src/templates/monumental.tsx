import { AgencyLogo, Background, Canvas, CONDENSED, DISPLAY, factRows, fitSize, M, PlayerFigure, SANS } from "./shared";
import type { RenderData } from "./types";

/** Giant surname behind the player, with an outlined copy in front; everything else small (Real Madrid / Man City style). */
export function Monumental({ data }: { data: RenderData }) {
  const { params, content } = data;
  const last = content.lastName.toUpperCase();
  const size = Math.min(fitSize(last, 1080 - 2 * 40, 420, 0.5), 420) * (params.textScale ?? 1);
  const facts = factRows(data);
  const nameStyle = {
    position: "absolute" as const,
    left: 0,
    right: 0,
    top: 190,
    textAlign: "center" as const,
    fontFamily: DISPLAY,
    fontSize: size,
    lineHeight: 0.82,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap" as const,
  };

  return (
    <Canvas params={params}>
      <Background data={data} />

      <div style={{ ...nameStyle, color: params.text, opacity: 0.92 }}>{last}</div>

      <PlayerFigure data={data} box={{ left: 90, width: 900, top: 230 }} />

      {/* Outline copy in front of the player: the letters seem to wrap around him. */}
      <div style={{ ...nameStyle, color: "transparent", WebkitTextStroke: `3px color-mix(in srgb, ${params.text} 70%, transparent)` }}>{last}</div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 460,
          background: `linear-gradient(to top, color-mix(in srgb, ${params.primary} 22%, #04050a) 0%, color-mix(in srgb, ${params.primary} 22%, #04050a) 30%, color-mix(in srgb, ${params.primary} 25%, rgba(4,5,10,.6)) 62%, transparent 100%)`,
        }}
      />

      <AgencyLogo data={data} height={58} style={{ position: "absolute", top: M - 6, left: M }} />

      <div style={{ position: "absolute", left: M, right: M, bottom: M }}>
        {facts.length > 0 && (
          <div style={{ display: "flex", gap: 0, marginBottom: 34 }}>
            {facts.map((f, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderLeft: i ? `2px solid color-mix(in srgb, ${params.text} 18%, transparent)` : "none",
                }}
              >
                <div style={{ fontFamily: DISPLAY, fontSize: 84, lineHeight: 1, color: params.text, fontFeatureSettings: '"tnum"' }}>{f.value}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, letterSpacing: "0.25em", textTransform: "uppercase", color: params.accent, marginTop: 8 }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: 44, letterSpacing: "0.08em", color: params.accent, lineHeight: 1 }}>
              {content.kicker}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 14 }}>
              {content.firstName} {content.lastName}
            </div>
          </div>
          {content.subline && (
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.75, textAlign: "right", maxWidth: 380 }}>
              {content.subline}
            </div>
          )}
        </div>
      </div>
    </Canvas>
  );
}
