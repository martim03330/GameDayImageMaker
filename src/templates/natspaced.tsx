import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "spaced" natural looks (Swiss): his real photo full-bleed; across the top the word
 * in light Inter caps, the letters spread over the whole width (one letter per column), small and calm;
 * a hairline under it. At the foot one line of small caps, the same spread margins. The NEYOD logo at the
 * foot centre. Soft shades only where the type sits.
 */
function NatSpacedFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 580,
    fs: story ? 250 : 160,
  });
  const M = 64;
  const top = (story ? STORY_TOP : 60) - (params.textY ?? 0);
  const wPx = 54 * k * ts;
  const letters = [...word];
  const bottom = story ? STORY_BOTTOM : H - 50;
  const logoH = story ? 88 : 52;
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.3)));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 220 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 200 * k, background: "linear-gradient(to top, rgba(0,0,0,.62), rgba(0,0,0,.3) 55%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 300, fontSize: wPx, lineHeight: 1, textShadow: "0 1px 10px rgba(0,0,0,.35)" }}>
        {letters.map((c, i) => (
          <span key={i}>{c === " " ? " " : c}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: top + wPx + 22 * k, height: 1, background: OFF_WHITE, opacity: 0.7 }} />
      <div style={{ position: "absolute", left: M, right: M, top: bottom - logoH - 30 * k - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: lPx, letterSpacing: "0.3em", paddingLeft: "0.3em", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
        {line}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · espaçado (matchday): M A T C H D A Y across the top; HOME v AWAY · date · time at the foot. */
export function Natspaced({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSpacedFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · espaçado: G O A L across the top of his celebration photo; his name · his club's exact name at the foot. No score. */
export function Goalnatspaced({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSpacedFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
