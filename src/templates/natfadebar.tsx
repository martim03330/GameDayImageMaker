import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "fade bar" natural looks: his real photo full-bleed and, on the side away from him,
 * a tall wash of his club's colour that fades into the photo (solid at the edge, gone by a third of the width),
 * holding the word set vertically small at its top and three lines at its foot. The NEYOD logo at the top.
 */
function NatFadebarFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 720 : 520, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const M = 56;
  const wPx = Math.min(60 * k * ts, 360 / Math.max(1, word.length * 0.62));
  const lPx = 19 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 20 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = left ? { left: M } : { right: M };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: ink }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [left ? "left" : "right"]: 0, width: CANVAS_W * 0.62, background: `linear-gradient(to ${left ? "right" : "left"}, ${colour} 0%, ${colour}cc 22%, ${colour}00 100%)` }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", ...side, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", textAlign: left ? "left" : "right" }}>{word}</div>
      <div style={{ position: "absolute", ...side, top: linesTop, width: CANVAS_W * 0.45, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, textAlign: left ? "left" : "right" }}>
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

/** Natural · barra esbatida (matchday): his club's colour washing in from the side; "Matchday", Home / v Away / date · time. */
export function Natfadebar({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatFadebarFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[fx.homeName, `v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · barra esbatida: his club's colour washing beside his celebration; "Goal", his name and his club's exact name. No score. */
export function Goalnatfadebar({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  return <NatFadebarFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[data.content.firstName ?? "", data.content.lastName ?? "", ourClub(data)]} />;
}
