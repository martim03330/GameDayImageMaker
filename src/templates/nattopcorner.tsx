import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "top corner" natural looks: his real photo full-bleed, nothing at the foot; all the
 * type sits high in the corner away from him, just under the NEYOD logo band — the word in bold, a short rule
 * in his club's colour, two quiet lines. The logo at the top. `low` anchors the same block at the foot instead:
 * goal photos usually have a raised arm in that top corner.
 */
function NatTopcornerFrame({ data, word, lines, low }: { data: RenderData; word: string; lines: string[]; low?: boolean }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 680 : 400, fy: story ? 720 : 540, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 400 * k;
  const ls = lines.filter(Boolean);
  const wPx = Math.min(50 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = 17 * k * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const blockH = wPx + 32 * k + 3 * k + ls.length * lPx * 1.4;
  const top = low ? (story ? STORY_BOTTOM : H - 60) - blockH - (params.textY ?? 0) : logoTop + (story ? 150 : 100) + (params.textY ?? 0);
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {low ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: top - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
        </>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 240 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.25) 55%, rgba(0,0,0,0))" }} />
      )}
      <div style={{ position: "absolute", [edge]: M, width: colW, top, textAlign: edge, fontFamily: SANS, lineHeight: 1 }}>
        <div style={{ fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ margin: `${16 * k}px 0`, width: 44 * k, height: 3 * k, background: colour, [left ? "marginRight" : "marginLeft"]: "auto" }} />
        <div style={{ fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
          {ls.map((l) => (
            <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · canto de cima (matchday): MATCHDAY, a short club-colour rule, Home v Away and date · time high in the free corner (exact names). */
export function Nattopcorner({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatTopcornerFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · "), fx.venue]} />;
}

/** Natural goal · canto com traço: the same block — GOAL, a short rule, his name and his club's exact name — low in the free corner (his raised arm is usually up top). No score. */
export function Goalnattopcorner({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTopcornerFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} low />;
}
