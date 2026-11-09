import { AgencyLogo, BEBAS, Canvas, Crest, factRows, fitSize, M, PlayerFigure, SANS } from "./shared";
import type { RenderData } from "./types";

/** Night mode: blurred colour light leaks, outlined glowing word, rim-lit player. */
export function Neon({ data }: { data: RenderData }) {
  const { params, content } = data;
  // The whole title when short, otherwise its strongest (longest) word.
  const kicker = content.kicker.toUpperCase();
  const word = kicker.length <= 9 ? kicker : kicker.split(/\s+/).sort((a, b) => b.length - a.length)[0];
  const wordSize = fitSize(word, 1000, 330, 0.42) * (params.textScale ?? 1);
  const glow = params.accent;
  const facts = factRows(data);
  const rimX = params.side === "left" ? 6 : -6;

  return (
    <Canvas params={{ ...params, primary: "#05060a" }}>
      <div style={{ position: "absolute", inset: 0, background: "#05060a" }} />
      {[
        { x: -120, y: 80, c: params.primary, s: 620 },
        { x: 640, y: 380, c: glow, s: 520 },
        { x: 180, y: 900, c: params.primary, s: 560 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.s,
            height: b.s,
            borderRadius: "50%",
            background: b.c,
            filter: "blur(130px)",
            opacity: 0.55,
            mixBlendMode: "screen",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,.05) 0 1px, transparent 1px 14px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 110,
          textAlign: "center",
          fontFamily: BEBAS,
          fontSize: wordSize,
          lineHeight: 0.85,
          color: "transparent",
          WebkitTextStroke: `4px ${glow}`,
          textShadow: `0 0 8px ${glow}, 0 0 32px ${glow}, 0 0 80px color-mix(in srgb, ${glow} 60%, transparent)`,
          whiteSpace: "nowrap",
        }}
      >
        {word}
      </div>

      <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(${rimX}px 0 10px ${glow})` }}>
        <PlayerFigure data={data} box={{ left: 110, width: 860, top: 200 }} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 480, background: "linear-gradient(to top, #05060a 0%, #05060a 32%, rgba(5,6,10,.7) 60%, transparent)" }} />

      <Crest club={data.club} size={84} style={{ position: "absolute", top: M, left: M }} />
      <AgencyLogo data={data} height={46} style={{ position: "absolute", top: M + 16, right: M }} />

      <div style={{ position: "absolute", left: M, right: M, bottom: M, textAlign: "center" }}>
        <div style={{ fontFamily: BEBAS, fontSize: fitSize(`${content.firstName} ${content.lastName}`.toUpperCase(), 936, 130, 0.42), lineHeight: 0.9, letterSpacing: "0.02em" }}>
          {content.firstName.toUpperCase()} <span style={{ color: glow, textShadow: `0 0 24px ${glow}` }}>{content.lastName.toUpperCase()}</span>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.7, marginTop: 12 }}>
          {content.kicker} {content.subline && `· ${content.subline}`}
        </div>
        {facts.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 56, marginTop: 30 }}>
            {facts.map((f, i) => (
              <div key={i}>
                <div style={{ fontFamily: BEBAS, fontSize: f.value.length > 6 ? 44 : 76, lineHeight: 1, color: "#fff", textShadow: `0 0 18px ${glow}` }}>{f.value}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, letterSpacing: "0.25em", textTransform: "uppercase", color: glow }}>{f.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Canvas>
  );
}
