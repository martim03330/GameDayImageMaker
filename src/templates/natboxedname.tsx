import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "boxed line" natural looks: his real photo full-bleed; on the side away from him at
 * the foot, the word in bold, and under it the main line inside a thin off-white outlined box that hugs it,
 * then one quiet line. The NEYOD logo alone at the top.
 */
function NatBoxednameFrame({ data, word, boxed, line }: { data: RenderData; word: string; boxed: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 500 * k;
  const pad = 14 * k;
  const bPx = Math.min(22 * k * ts, (colW - 2 * pad) / Math.max(1, boxed.length * 0.58));
  const boxW = Math.min(colW, boxed.length * 0.58 * bPx + 2 * pad);
  const boxH = bPx + 2 * pad * 0.8;
  const wPx = Math.min(60 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = 16 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = line ? bottom - lPx : bottom + 14 * k;
  const boxTop = lineTop - 14 * k - boxH;
  const wTop = boxTop - 16 * k - wPx * 0.86;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [edge]: M, top: boxTop, width: boxW, height: boxH, border: `1.5px solid ${OFF_WHITE}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: bPx, lineHeight: 1, whiteSpace: "nowrap" }}>{boxed}</div>
      {line && <div style={{ position: "absolute", [edge]: M, width: colW, top: lineTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{line}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha em caixa (matchday): MATCHDAY, then Home v Away inside a thin box, then date · time (exact names). */
export function Natboxedname({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBoxednameFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} boxed={`${fx.homeName} v ${fx.awayName}`} line={[fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · linha em caixa: GOAL, then his name inside a thin box, then his club's exact name. No score. */
export function Goalnatboxedname({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBoxednameFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} boxed={name} line={ourClub(data)} />;
}
