import { vivid } from "@/lib/color";
import { Figure, InsetPanel, matchInfo, Micro, twoLines, VersusCrests } from "./kit";
import { AgencyLogo, Canvas, CONDENSED, DISPLAY, factRows, M, SANS } from "./shared";
import type { RenderData } from "./types";

/** Tall stretched condensed headline behind the player (Pinterest "MATCH DAY" posters, Yamal / Bellingham). */
export function Stretch({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const lines = twoLines(content.kicker);
  const longest = Math.max(...lines.map((l) => l.length));
  // Anton is ~0.5em wide per glyph; stretched 1.75× vertically.
  const size = Math.min(300, (1080 - 2 * 50) / (longest * 0.5)) * (params.textScale ?? 1);
  const stretch = 1.75;
  const accent = vivid(params.accent);
  const info = matchInfo(data);
  const facts = factRows(data);
  const showVs = postType === "matchday" || postType === "result" || postType === "goal";

  return (
    <Canvas params={params}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, color-mix(in srgb, ${params.primary} 55%, #0a0c12) 0%, color-mix(in srgb, ${params.primary} 30%, #06070b) 55%, #05060a 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(60% 45% at 50% 38%, color-mix(in srgb, ${params.primary} 60%, transparent), transparent 70%)`,
        }}
      />

      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: size,
              lineHeight: 0.86,
              color: params.text,
              transform: `scaleY(${stretch})`,
              transformOrigin: "top center",
              height: size * 0.86 * stretch,
              letterSpacing: "-0.01em",
              opacity: i === 0 ? 0.96 : 0.9,
            }}
          >
            {l}
          </div>
        ))}
      </div>

      <Figure data={data} cx={540} bottom={130} height={1080} style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,.5))" }} />

      {/* Outline copy over the player: the word behind the body still reads. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: size,
              lineHeight: 0.86,
              color: "transparent",
              WebkitTextStroke: `2px color-mix(in srgb, ${params.text} 80%, transparent)`,
              transform: `scaleY(${stretch})`,
              transformOrigin: "top center",
              height: size * 0.86 * stretch,
              letterSpacing: "-0.01em",
              opacity: i === 0 ? 0.96 : 0.9,
            }}
          >
            {l}
          </div>
        ))}
      </div>


      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, background: "linear-gradient(to top, #05060a 0%, #05060a 28%, rgba(5,6,10,.65) 60%, transparent)" }} />

      <AgencyLogo data={data} height={46} style={{ position: "absolute", top: M - 10, left: M }} />
      {showVs ? (
        <div style={{ position: "absolute", top: M - 22, right: M }}>
          <VersusCrests data={data} size={76} color={params.text} gap={16} />
        </div>
      ) : (
        <Micro color={params.text} style={{ position: "absolute", top: M, right: M, opacity: 0.8 }}>
          {content.subline}
        </Micro>
      )}

      {postType === "totw" && (
        <div style={{ position: "absolute", right: M, bottom: 250 }}>
          <InsetPanel data={data} width={330} height={400} accent={accent} rotate={3} />
        </div>
      )}

      <div style={{ position: "absolute", left: M, right: M, bottom: M, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 30 }}>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.35em", textTransform: "uppercase", color: accent }}>{content.firstName}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 96, lineHeight: 0.95, textTransform: "uppercase" }}>{content.lastName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {postType === "matchday" ? (
            <>
              <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, color: accent, lineHeight: 1 }}>{info.when}</div>
              <Micro color={params.text} style={{ marginTop: 10, opacity: 0.8 }}>
                {[info.teams, info.where].filter(Boolean).join(" · ")}
              </Micro>
            </>
          ) : (
            <div style={{ display: "flex", gap: 34 }}>
              {facts.slice(0, 3).map((f, i) => (
                <div key={i}>
                  <div style={{ fontFamily: DISPLAY, fontSize: f.value.length > 5 ? 40 : 68, lineHeight: 1 }}>{f.value}</div>
                  <Micro color={accent}>{f.label}</Micro>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Canvas>
  );
}
