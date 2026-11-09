import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "split box" natural looks: his real photo full-bleed; at the foot one hairline box across
 * the width split in two by a vertical hairline: the word in bold in the left cell, two small lines in the right
 * cell; a dark translucent fill so it reads over a white kit. The NEYOD logo alone at the top.
 */
function NatRuleboxFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 50;
  const W = CANVAS_W - 2 * M;
  const leftW = W * 0.42;
  const pad = 24 * k;
  const wPx = Math.min(46 * k * ts, (leftW - 2 * pad) / Math.max(1, word.length * 0.66));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const boxH = Math.max(wPx, ls.length * lPx * 1.4) + 2 * pad;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const top = bottom - boxH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, top, width: W, height: boxH, border: "1.5px solid rgba(244,241,234,.8)", background: "rgba(10,12,10,.45)", backdropFilter: "blur(3px)", boxSizing: "border-box", display: "flex" }}>
        <div style={{ width: leftW, display: "flex", alignItems: "center", padding: `0 ${pad}px`, borderRight: "1.5px solid rgba(244,241,234,.8)", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${pad}px`, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
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

/** Natural · caixa dividida (matchday): [ MATCHDAY | Home v Away / date · time ] in a hairline box (exact names). */
export function Natrulebox({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatRuleboxFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · caixa dividida: [ GOAL | his name / his club's exact name ] under his celebration. No score. */
export function Goalnatrulebox({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatRuleboxFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
