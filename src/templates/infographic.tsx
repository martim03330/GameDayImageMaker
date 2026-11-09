/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { AgencyLogo, CONDENSED, DISPLAY, fitSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PANEL_FADE = "linear-gradient(to bottom, #000 0, #000 70%, transparent 97%), linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%)";

/** Print infographic poster: stat bars growing out of the body, bubbles sized by value, season totals. */
export function Infographic({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // The edit's own numbers win ("LAST 5 GAMES" with the goals the user typed); the games list follows them.
  const typed = (l: string) => {
    const v = Number(content.stats.find((x) => x.label.toLowerCase() === l)?.value);
    return Number.isFinite(v) && v >= 0 ? v : null;
  };
  const ms = data.matches.slice(0, typed("games") || 10);
  const sum = (f: (m: (typeof ms)[number]) => number) => ms.reduce((a, m) => a + f(m), 0);
  const bars = [
    { label: "Games", value: ms.length },
    { label: "Goals", value: typed("goals") ?? sum((m) => m.goals) },
    { label: "Assists", value: typed("assists") ?? sum((m) => m.assists) },
    { label: "Wins", value: ms.filter((m) => m.goalsFor > m.goalsAgainst).length },
    { label: "Minutes", value: typed("minutes") ?? sum((m) => m.minutes) },
  ];
  // With a typed span ("LAST 5 GAMES") the foot says it; otherwise the minutes played.
  const foot = typed("games") && content.subline ? content.subline.toUpperCase() : `${bars[4].value} MIN`;
  const max = Math.max(...bars.slice(0, 4).map((b) => b.value), 1);
  const box = figureBox(data, 540, 0, 1120);

  // Widest results bubble (radius grows with goals + assists in that game).
  const bubbleMax = Math.max(34, ...ms.slice(0, 6).map((m) => 34 + (m.goals + m.assists) * 12));
  const last = content.lastName.toUpperCase();
  const photoPanel = params.bgStyle === "photo" && !!data.bgPhotoUrl;
  // Bars growing out of his body (cutout), or, with his whole photo in the middle, stacked in the left column.
  const barsEl = bars.slice(0, 4).map((b, i) => {
    const colour = i === 1 ? accent : i === 2 ? "#ffd500" : "#16171b";
    const ink = i === 2 ? "#16171b" : "#fff";
    if (photoPanel) {
      const w = 110 + (b.value / max) * 150;
      return (
        <div key={i} style={{ position: "absolute", top: 330 + i * 150, left: 60, width: w, height: 58, background: colour, display: "flex", alignItems: "center", padding: "0 18px" }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 46, color: ink, lineHeight: 1 }}>{b.value}</span>
          <span style={{ position: "absolute", top: 64, left: 0, fontFamily: CONDENSED, fontWeight: 700, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase" }}>{b.label}</span>
        </div>
      );
    }
    // Every bar starts clear of the player's body, so its label never hides behind him.
    const right = i % 2 === 1;
    // Left bars stop 20px inside the canvas; right bars stop short of the results column.
    const room = right ? CANVAS_W - 50 - bubbleMax * 2 - 24 - 540 : 540 - 20;
    const minW = Math.min(room - 40, Math.max(90, box.width * 0.36 + 30 + b.label.length * 13));
    const w = Math.min(room, minW + (b.value / max) * Math.max(80, 440 - minW));
    return (
      <div key={i} style={{ position: "absolute", top: 360 + i * 150, [right ? "left" : "right"]: 540, width: w, height: 58, background: colour, display: "flex", alignItems: "center", justifyContent: right ? "flex-end" : "flex-start", padding: "0 18px" }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 46, color: ink, lineHeight: 1 }}>{b.value}</span>
        <span style={{ position: "absolute", top: 64, [right ? "right" : "left"]: 0, fontFamily: CONDENSED, fontWeight: 700, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase" }}>{b.label}</span>
      </div>
    );
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f4f1ea", color: "#16171b" }}>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: DISPLAY, fontSize: fitSize(last, 700, 170), lineHeight: 0.9, color: accent }}>{last}</div>
      <div style={{ position: "absolute", right: 60, top: 70, textAlign: "right", fontFamily: CONDENSED, fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {data.player.position}
        <br />
        <span style={{ color: accent }}>{data.club?.name}</span>
      </div>
      {!photoPanel && barsEl}
      {photoPanel ? (
        // "Outro fundo" → photo: his whole photo (ground, stands) in a tall centre panel melting into the
        // paper, for shots that can't be cut out cleanly (a team-mate behind him, a corner flag in front).
        <div
          style={{
            position: "absolute",
            left: 345,
            width: 520,
            top: 225,
            bottom: 0,
            backgroundImage: `url(${data.bgPhotoUrl})`,
            backgroundSize: `auto ${(params.playerScale ?? 1) * 118}%`,
            backgroundPosition: `${Math.max(0, Math.min(100, 50 + (params.playerX ?? 0) * 0.25))}% ${Math.max(0, Math.min(100, 22 + (params.playerY ?? 0) * 0.2))}%`,
            backgroundRepeat: "no-repeat",
            WebkitMaskImage: PANEL_FADE,
            maskImage: PANEL_FADE,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      ) : (
        <GradedFigure data={data} box={box} />
      )}
      {photoPanel && barsEl}
      <div style={{ position: "absolute", right: 50, top: 300, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        {ms.slice(0, 6).map((m, i) => {
          const r = 34 + (m.goals + m.assists) * 12;
          return (
            <div key={i} style={{ width: r * 2, height: r * 2, borderRadius: "50%", background: m.goals + m.assists ? accent : "#e3ded3", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: m.goals + m.assists ? "#fff" : "#16171b" }}>
              {m.opponentCrest && <img src={m.opponentCrest} alt="" style={{ width: r * 0.7, height: r * 0.7, objectFit: "contain" }} />}
              <span style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 16 }}>
                {m.goalsFor}-{m.goalsAgainst}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 50, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: CONDENSED, fontWeight: 800, fontSize: 26, letterSpacing: "0.1em" }}>
        <span>
          {content.kicker} · <span style={{ color: accent }}>{foot}</span>
        </span>
        <AgencyLogo data={data} onLight height={28} />
      </div>
      <Film strength={0.7} />
    </div>
  );
}
