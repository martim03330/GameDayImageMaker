import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "three dots" natural looks: his real photo full-bleed; on the side away from him at
 * the foot, the word in bold, three small dots in his club's colour under it, then two quiet lines. The NEYOD
 * logo alone at the top.
 */
function NatUnderdotsFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 660 : 420, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 480 * k;
  const ls = lines.filter(Boolean);
  const wPx = Math.min(62 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = 18 * k * ts;
  const D = 9 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const dotsTop = linesTop - 18 * k - D;
  const wTop = dotsTop - 16 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right" };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...side, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ ...side, top: dotsTop, height: D, display: "flex", gap: D * 0.9, justifyContent: left ? "flex-start" : "flex-end" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: D, height: D, borderRadius: "50%", background: colour }} />
        ))}
      </div>
      <div style={{ ...side, top: linesTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · três pontos (matchday): MATCHDAY, three dots in his club's colour, Home v Away and date · time (exact names). */
export function Natunderdots({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatUnderdotsFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · três pontos: GOAL, three dots, his name and his club's exact name. No score. */
export function Goalnatunderdots({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatUnderdotsFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
