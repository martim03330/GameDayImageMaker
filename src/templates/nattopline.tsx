import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "top only" natural looks: every word at the top and the foot left to the photo —
 * his real photo full-bleed; across the top, under a soft shade, the word in bold at the left and two small
 * lines right-aligned at the right, on one baseline; the NEYOD logo alone at the foot centre.
 */
function NatToplineFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 560,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const top = (story ? STORY_TOP : 60) - (params.textY ?? 0);
  const wPx = Math.min(64 * k * ts, 520 / Math.max(1, word.length * 0.62));
  const lPx = 17 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = story ? STORY_BOTTOM : H - 56;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + wPx + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.25) 55%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 120 * k, background: "linear-gradient(to top, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", right: M, top: top + wPx - ls.length * lPx * 1.3, textAlign: "right", fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.3, opacity: 0.92 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · só no topo (matchday): "Matchday" top-left; Home v Away and date · time top-right (exact names); the foot left to the photo. */
export function Nattopline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatToplineFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · só no topo: "Goal" top-left over his celebration; his name and his club's exact name top-right. No score. */
export function Goalnattopline({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatToplineFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}

