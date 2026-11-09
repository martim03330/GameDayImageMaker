import { shade, vivid } from "@/lib/color";
import { Figure, Micro } from "./kit";
import { AgencyLogo, Canvas, Crest, DISPLAY, factRows, M, SANS } from "./shared";
import type { RenderData } from "./types";

/** Repeated headline rows with 3D offset + angular shards, player in front (Arsenal "GOAL GOAL GOAL"). */
export function Repeat({ data }: { data: RenderData }) {
  const { params, content } = data;
  const base = vivid(params.primary);
  const deep = shade(base, -0.55);
  const word = content.kicker.split(/\s+/).sort((a, b) => b.length - a.length)[0].toUpperCase();
  const size = Math.min(290, 1040 / (word.length * 0.62)) * (params.textScale ?? 1);
  const rows = Math.ceil(1250 / (size * 0.86));
  const facts = factRows(data);
  const shards = [
    "polygon(0 62%, 38% 48%, 22% 70%, 0 78%)",
    "polygon(100% 20%, 62% 34%, 100% 44%)",
    "polygon(100% 70%, 58% 84%, 100% 100%)",
    "polygon(0 18%, 30% 28%, 0 36%)",
  ];

  return (
    <Canvas params={params}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 40%, ${base} 0%, ${shade(base, -0.25)} 50%, ${deep} 100%)` }} />
      {shards.map((s, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, clipPath: s, background: i % 2 ? shade(base, 0.18) : shade(base, -0.35), opacity: 0.85 }} />
      ))}

      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center" }}>
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: size,
              lineHeight: 0.86,
              letterSpacing: "0.02em",
              color: i % 2 === 0 ? "#fff" : "transparent",
              WebkitTextStroke: i % 2 === 0 ? undefined : "3px rgba(255,255,255,.85)",
              textShadow: i % 2 === 0 ? Array.from({ length: 10 }, (_, k) => `${k + 1}px ${k + 1}px 0 ${deep}`).join(",") : undefined,
              opacity: 1 - i * 0.12,
            }}
          >
            {word}
          </div>
        ))}
      </div>

      <Figure data={data} cx={540} bottom={0} height={1150} style={{ filter: `drop-shadow(0 0 2px ${shade(base, 0.4)}) drop-shadow(0 30px 40px rgba(0,0,0,.5))` }} />

      {/* Foreground shards cut across the player for depth. */}
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 88%, 44% 76%, 18% 100%, 0 100%)", background: shade(base, 0.1) }} />
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(100% 56%, 74% 66%, 100% 62%)", background: "#fff", opacity: 0.9 }} />

      <AgencyLogo data={data} height={44} style={{ position: "absolute", top: M - 10, left: M }} />
      <Crest club={data.club} size={80} style={{ position: "absolute", top: M - 22, right: M }} />

      <div style={{ position: "absolute", right: M, bottom: M, textAlign: "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.3em", textTransform: "uppercase" }}>{content.firstName}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 84, lineHeight: 0.95, textTransform: "uppercase" }}>{content.lastName}</div>
        {facts.length > 0 && (
          <Micro color="#fff" style={{ marginTop: 10, opacity: 0.85 }}>
            {facts
              .slice(0, 3)
              .map((f) => `${f.value} ${f.label}`)
              .join("  ·  ")}
          </Micro>
        )}
      </div>
    </Canvas>
  );
}
