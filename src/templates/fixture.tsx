import { AgencyLogo, Background, BEBAS, Canvas, GROTESK, M, PlayerFigure, SANS, TeamBadge } from "./shared";
import { CANVAS_H, type RenderData } from "./types";

/** Gig-poster matchday: vertical title, stripes, both crests and the kick-off time on a strict grid. */
export function Fixture({ data }: { data: RenderData }) {
  const { params, content } = data;
  const playerRight = params.side !== "left";
  const home = { name: content.homeTeam, crest: content.homeCrest };
  const away = { name: content.awayTeam, crest: content.awayCrest };

  return (
    <Canvas params={params}>
      <Background data={{ ...data, params: { ...params, bgStyle: "pitch" } }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, color-mix(in srgb, ${params.text} 7%, transparent) 0 60px, transparent 60px 120px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: M,
          bottom: 420,
          [playerRight ? "left" : "right"]: M - 20,
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontFamily: BEBAS,
          // Fits the column between the top margin and the info block, whatever the title.
          fontSize: Math.min(210, (CANVAS_H - M - 420) / (content.kicker.length * 0.44)) * (params.textScale ?? 1),
          lineHeight: 0.85,
          color: params.accent,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {content.kicker}
      </div>

      <PlayerFigure data={data} box={{ left: playerRight ? 300 : 20, width: 760, top: 110, bottom: 330 }} />

      <AgencyLogo data={data} height={44} style={{ position: "absolute", top: M, [playerRight ? "right" : "left"]: M }} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 380,
          background: `linear-gradient(to top, color-mix(in srgb, ${params.primary} 30%, #05070d) 60%, transparent)`,
        }}
      />

      <div style={{ position: "absolute", left: M, right: M, bottom: M, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20 }}>
        <div style={{ justifySelf: "start" }}>
          <TeamBadge name={home.name} crestUrl={home.crest} size={110} color={params.text} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: "-0.02em" }}>{content.time || "--:--"}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10, color: params.accent }}>
            {content.date}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 8, opacity: 0.7 }}>
            {[content.subline, content.venue].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ justifySelf: "end" }}>
          <TeamBadge name={away.name} crestUrl={away.crest} size={110} color={params.text} />
        </div>
      </div>
    </Canvas>
  );
}
