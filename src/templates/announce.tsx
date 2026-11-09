import { AgencyLogo, Canvas, CONDENSED, DISPLAY, fitSize, M, PlayerFigure, SANS, TeamBadge } from "./shared";
import type { RenderData } from "./types";

/** "IT'S OFFICIAL" / "HERE WE GO" transfer & renewal announcement: readable in under a second. */
export function Announce({ data }: { data: RenderData }) {
  const { params, content } = data;
  const playerLeft = params.side !== "right";
  const colX = playerLeft ? 700 : M;
  const colW = 1080 - 700 - M;
  const full = `${content.firstName} ${content.lastName}`.toUpperCase();
  const renewal = data.postType === "renewal";
  const newClub = data.toClub ?? data.club;

  return (
    <Canvas params={params}>
      <div style={{ position: "absolute", inset: 0, background: "#0a0b0e" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: playerLeft ? "polygon(0 0, 100% 0, 100% 62%, 0 92%)" : "polygon(0 0, 100% 0, 100% 92%, 0 62%)",
          background: `linear-gradient(160deg, color-mix(in srgb, ${params.primary} 85%, #fff) 0%, ${params.primary} 45%, color-mix(in srgb, ${params.primary} 60%, #000) 100%)`,
        }}
      />

      <PlayerFigure data={data} box={{ left: playerLeft ? -30 : 380, width: 700, top: 150, bottom: 200 }} />

      <div
        style={{
          position: "absolute",
          top: M - 8,
          left: M,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: "#e10600",
          color: "#fff",
          borderRadius: 16,
          padding: "8px 24px",
          fontFamily: SANS,
          fontWeight: 800,
          fontStyle: "italic",
          fontSize: 32,
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 99, background: "#fff" }} />
        {content.kicker}
      </div>
      <AgencyLogo data={data} height={44} style={{ position: "absolute", top: M, right: M }} />

      <div style={{ position: "absolute", left: colX, width: colW, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {renewal ? (
          <>
            <TeamBadge name={data.club?.name} crestUrl={data.club?.crestUrl} size={150} color={params.text} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.3em", opacity: 0.8 }}>ATÉ</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 140, lineHeight: 0.9 }}>{content.until || "20XX"}</div>
          </>
        ) : !data.fromClub ? (
          <>
            <TeamBadge name={newClub?.name} crestUrl={newClub?.crestUrl} size={190} color={params.text} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.3em", opacity: 0.8 }}>BEM-VINDO</div>
          </>
        ) : (
          <>
            <div style={{ opacity: 0.7, filter: "grayscale(.6)" }}>
              <TeamBadge name={data.fromClub?.name} crestUrl={data.fromClub?.crestUrl} size={130} color={params.text} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 70, color: params.accent, lineHeight: 0.6, transform: "rotate(90deg)" }}>›</div>
            <TeamBadge name={newClub?.name} crestUrl={newClub?.crestUrl} size={150} color={params.text} />
          </>
        )}
      </div>

      <div style={{ position: "absolute", left: M, right: M, bottom: M }}>
        <div style={{ fontFamily: DISPLAY, fontSize: fitSize(full, 936, 150) * (params.textScale ?? 1), lineHeight: 0.95, whiteSpace: "nowrap" }}>{full}</div>
        {content.subline && (
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 40, letterSpacing: "0.1em", color: params.accent, textTransform: "uppercase", marginTop: 8 }}>
            {content.subline}
          </div>
        )}
      </div>
    </Canvas>
  );
}
