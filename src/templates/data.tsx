import { AgencyLogo, Canvas, CONDENSED, Crest, factRows, fitSize, M, MONO, PlayerFigure, positionAbbr } from "./shared";
import type { RenderData } from "./types";

/** Broadcast-style data sheet: dark grid, hairlines, big tabular numbers, mono labels (Premier League "information" look). */
export function DataSheet({ data }: { data: RenderData }) {
  const { params, content } = data;
  const playerLeft = params.side === "left";
  const colW = 400;
  const colX = playerLeft ? 1080 - M - colW : M;
  const facts = factRows(data);
  const ts = params.textScale ?? 1;
  const first = content.firstName.toUpperCase();
  const last = content.lastName.toUpperCase();
  const hair = `1px solid color-mix(in srgb, ${params.text} 22%, transparent)`;

  return (
    <Canvas params={{ ...params, grain: false }}>
      <div style={{ position: "absolute", inset: 0, background: `color-mix(in srgb, ${params.primary} 14%, #0b0d10)` }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${params.text} 10%, transparent) 1.4px, transparent 1.6px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "20px 20px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [playerLeft ? "left" : "right"]: 0,
          width: 700,
          background: `radial-gradient(70% 55% at 50% 45%, color-mix(in srgb, ${params.primary} 55%, transparent), transparent 75%)`,
        }}
      />

      <PlayerFigure data={{ ...data, params: { ...params } }} box={{ left: playerLeft ? -40 : 420, width: 700, top: 150 }} />

      {/* Tick marks along the top edge, like a broadcast graphic ruler. */}
      <div style={{ position: "absolute", top: 40, left: M, right: M, height: 10, display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} style={{ width: 1, height: i % 4 === 0 ? 10 : 5, background: `color-mix(in srgb, ${params.text} 35%, transparent)` }} />
        ))}
      </div>

      <div style={{ position: "absolute", top: 72, left: M, right: M, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.15em", opacity: 0.7 }}>{content.subline.toUpperCase() || "2026/27"}</div>
        <AgencyLogo data={data} height={40} />
      </div>

      <div style={{ position: "absolute", left: colX, width: colW, top: 180 }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.15em", color: params.accent }}>{"// " + content.kicker}</div>
        <div style={{ marginTop: 18, fontFamily: CONDENSED, fontWeight: 800, lineHeight: 0.88, textTransform: "uppercase" }}>
          <div style={{ fontSize: fitSize(first, colW, 96, 0.46) * ts }}>{first}</div>
          <div style={{ fontSize: fitSize(last, colW, 110, 0.46) * ts, color: params.accent }}>{last}</div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 20, fontFamily: MONO, fontSize: 18, letterSpacing: "0.12em", opacity: 0.75 }}>
          {data.player.number && <span>#{data.player.number}</span>}
          {positionAbbr(data.player.position) && <span>{positionAbbr(data.player.position)}</span>}
          {data.club && <span>{data.club.name.toUpperCase()}</span>}
        </div>

        <div style={{ marginTop: 40, borderTop: hair }}>
          {facts.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "18px 0 14px", borderBottom: hair }}>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 18, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.75 }}>{f.label}</div>
              <div
                style={{
                  fontFamily: CONDENSED,
                  fontWeight: 800,
                  fontSize: f.value.length > 6 ? 56 : 104,
                  lineHeight: 0.9,
                  fontFeatureSettings: '"tnum"',
                  textTransform: "uppercase",
                  maxWidth: 260,
                  textAlign: "right",
                }}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: M, [playerLeft ? "right" : "left"]: M, display: "flex", alignItems: "center", gap: 18 }}>
        <Crest club={data.club} size={64} />
        <div style={{ width: 120, height: 6, background: params.accent }} />
      </div>
    </Canvas>
  );
}
