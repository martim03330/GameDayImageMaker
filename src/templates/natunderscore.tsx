import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "underscore" natural looks: his real photo full-bleed; at the foot-left the word in
 * heavy lowercase followed by a thick underscore bar in his club's colour sitting on the baseline; two small lines
 * under it. The NEYOD logo alone at the top.
 */
function NatUnderscoreFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const wPx = Math.min(110 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, (word.length + 1) * 0.58));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 18 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "flex-end" }}>
        {word}
        <span style={{ display: "inline-block", width: wPx * 0.5, height: wPx * 0.12, background: colour, marginLeft: wPx * 0.06, marginBottom: wPx * 0.12 }} />
      </div>
      <div style={{ position: "absolute", left: M + 2, right: M, top: linesTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, opacity: 0.92 }}>
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

/** Natural · sublinhado de cursor (matchday): "matchday_" with the underscore in his club's colour; Home v Away and date · time (exact names). */
export function Natunderscore({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatUnderscoreFrame data={data} word={(data.content.kicker || "matchday").toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · sublinhado de cursor: "goal_" under his celebration; his name and his club's exact name. No score. */
export function Goalnatunderscore({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatUnderscoreFrame data={data} word={(data.content.kicker || "goal").toLowerCase()} lines={[name, ourClub(data)]} />;
}
