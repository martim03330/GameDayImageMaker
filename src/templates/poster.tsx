import type { PostType } from "@/lib/types";
import { AgencyLogo, Background, Canvas, CONDENSED, ContentBlock, Crest, DISPLAY, fitSize, GrungeText, PlayerFigure, Subline } from "./shared";
import type { RenderData } from "./types";

const CHIP: Record<PostType, string> = {
  totw: "TOTW",
  potm: "POTM",
  stats: "STATS",
  result: "MOTM",
  goal: "GOAL",
  matchday: "MATCHDAY",
  transfer: "OFFICIAL",
  renewal: "OFFICIAL",
  speed: "TOP SPEED",
  welcome: "WELCOME",
  press: "IN THE NEWS",
  form: "STATS",
  clip: "GOAL",
};

const TAG: Record<PostType, string> = {
  totw: "OFFICIAL SELECTION",
  potm: "OFFICIAL AWARD",
  stats: "THE NUMBERS",
  result: "STANDOUT DISPLAY",
  goal: "MAKING THE DIFFERENCE",
  matchday: "MATCHDAY",
  transfer: "IT'S OFFICIAL",
  renewal: "IT'S OFFICIAL",
  speed: "FULL SPEED",
  welcome: "NEW PLAYER",
  press: "IN THE NEWS",
  form: "THE NUMBERS",
  clip: "GOAL",
};

/** Split "TEAM OF THE WEEK" into big / small / big lines like "TEAM of the WEEK". */
function headlineLines(kicker: string): { text: string; big: boolean }[] {
  const words = kicker.toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return words.map((w) => ({ text: w, big: true }));
  return [
    { text: words[0], big: true },
    { text: words.slice(1, -1).join(" "), big: false },
    { text: words[words.length - 1], big: true },
  ];
}

/** Giant textured headline, tilted official graphic, name at the bottom (Diogo Tavares style). */
export function Poster({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const playerLeft = params.side === "left";
  const colW = 470;
  const colX = playerLeft ? 1080 - 50 - colW : 50;
  const align = playerLeft ? "right" : "left";
  const lines = headlineLines(content.kicker);
  const ts = params.textScale ?? 1;
  const bigSize = Math.min(...lines.filter((l) => l.big).map((l) => fitSize(l.text, colW, 200))) * ts;

  const last = content.lastName.toUpperCase();
  const nameW = 600;
  const lastSize = fitSize(last, nameW, 190) * ts;
  const nameX = playerLeft ? 60 : 1080 - 60 - nameW;

  return (
    <Canvas params={params}>
      <Background data={data} />

      <PlayerFigure data={data} box={{ left: playerLeft ? -80 : 440, width: 720, top: 90, bottom: 60 }} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 420,
          background: `linear-gradient(to top, color-mix(in srgb, ${params.primary} 25%, #04050a) 25%, transparent)`,
        }}
      />

      <AgencyLogo data={data} height={60} style={{ position: "absolute", top: 60, [playerLeft ? "left" : "right"]: 60 }} />

      <div
        style={{
          position: "absolute",
          top: 26,
          [playerLeft ? "right" : "left"]: 50,
          background: params.accent,
          color: "#0b0d12",
          borderRadius: 999,
          padding: "4px 28px",
          fontFamily: CONDENSED,
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: 2,
        }}
      >
        {CHIP[postType]} ✦
      </div>

      <div style={{ position: "absolute", left: colX, width: colW, top: 90, textAlign: align }}>
        {lines.map((l, i) =>
          l.big ? (
            <div key={i}>
              <GrungeText size={bigSize} color={params.text}>
                {l.text}
              </GrungeText>
            </div>
          ) : (
            <div
              key={i}
              style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: 68, letterSpacing: 8, color: params.accent, lineHeight: 1.05 }}
            >
              {l.text}
            </div>
          ),
        )}
        {content.subline && (
          <div style={{ marginTop: 14 }}>
            <Subline text={content.subline} width={colW} color={params.accent} max={40} />
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 620,
          [playerLeft ? "right" : "left"]: 50,
          width: colW,
          display: "flex",
          justifyContent: playerLeft ? "flex-end" : "flex-start",
          transform: `rotate(${params.insetTilt}deg)`,
          transformOrigin: "center",
        }}
      >
        <ContentBlock data={data} width={colW} height={440} framed />
      </div>

      <div style={{ position: "absolute", left: nameX, width: nameW, bottom: 70, textAlign: playerLeft ? "left" : "right" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontFamily: CONDENSED,
            fontWeight: 800,
            fontStyle: "italic",
            fontSize: 34,
            letterSpacing: 2,
            color: params.accent,
            background: "rgba(0,0,0,.35)",
            padding: "4px 16px",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 99,
              background: params.accent,
              color: "#0b0d12",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontStyle: "normal",
              fontSize: 24,
            }}
          >
            ✓
          </span>
          {TAG[postType]}
        </div>
        <div style={{ marginTop: 10, fontFamily: DISPLAY, fontSize: 70, letterSpacing: 26, lineHeight: 1, color: params.text }}>
          {content.firstName.toUpperCase()}
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: lastSize, lineHeight: 0.95, color: params.accent, fontStyle: "italic" }}>{last}</div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 70,
          [playerLeft ? "right" : "left"]: 50,
          width: 1080 - 100 - nameW - 30,
          display: "flex",
          flexDirection: "column",
          alignItems: playerLeft ? "flex-end" : "flex-start",
          gap: 14,
        }}
      >
        <Crest club={data.club} size={120} />
        {data.club && (
          <div
            style={{
              fontFamily: CONDENSED,
              fontWeight: 700,
              fontSize: fitSize(data.club.name.toUpperCase(), 1080 - 100 - nameW - 30, 34, 0.5, 10),
              letterSpacing: 10,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              color: params.text,
            }}
          >
            {data.club.name}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 50, right: 50, bottom: 24, height: 6, background: params.accent, borderRadius: 3 }} />
    </Canvas>
  );
}
