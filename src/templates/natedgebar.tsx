import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "edge bar" natural looks: his real photo full-bleed with one thin bar of his club's colour
 * running the full height of the edge away from him; at the foot on that side, the word in bold and two lines. The
 * NEYOD logo alone at the top.
 */
function NatEdgebarFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const B = 16 * k;
  const M = 50 + B;
  const wPx = Math.min(70 * k * ts, 540 / Math.max(1, word.length * 0.64));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 16 * k - wPx;
  const side = left ? { left: M, textAlign: "left" as const } : { right: M, textAlign: "right" as const };
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: wTop - 200 * k, bottom: 0, [left ? "left" : "right"]: 0, width: CANVAS_W * 0.75, background: `radial-gradient(100% 90% at ${left ? "0%" : "100%"} 100%, rgba(0,0,0,.62), rgba(0,0,0,0) 72%)` }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [left ? "left" : "right"]: 0, width: B, background: colour }} />
      <div style={{ position: "absolute", ...side, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", ...side, top: linesTop, width: CANVAS_W * 0.6, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, opacity: 0.92 }}>
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

/** Natural · orla lateral (matchday): a full-height bar of his club's colour on the edge; "Matchday", Home v Away, date · time. */
export function Natedgebar({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatEdgebarFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · orla lateral: the edge bar beside his celebration; "Goal", his name and his club's exact name. No score. */
export function Goalnatedgebar({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatEdgebarFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}
