import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

type Fact = { label: string; value: string };

/**
 * The shared frame of the "fact row" natural looks (a stats strip): his real photo full-bleed; at the foot a row of
 * big bold values with tiny labels above them, spread evenly across the width; the word small in tracked caps above
 * the row and one line of exact names under it. The NEYOD logo alone at the top.
 */
function NatFactrowFrame({ data, word, facts, line }: { data: RenderData; word: string; facts: Fact[]; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const fs = facts.filter((f) => f.value);
  const colW = (CANVAS_W - 2 * M) / Math.max(1, fs.length);
  const vPx = Math.min(58 * k * ts, ...fs.map((f) => (colW - 20) / Math.max(1, f.value.length * 0.62)));
  const tPx = 12 * k * ts;
  const lPx = 15 * k * ts;
  const wPx = 15 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const rowTop = lineTop - 24 * k - (tPx + 10 * k + vPx);
  const wTop = rowTop - 22 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, opacity: 0.88 }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: rowTop, display: "flex" }}>
        {fs.map((f) => (
          <div key={f.label} style={{ width: colW, textAlign: "center" }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.72 }}>{f.label}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: vPx, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 10 * k, whiteSpace: "nowrap" }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.18em", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · fila de factos (matchday): DATE · KICK-OFF big with tiny labels; MATCHDAY above, HOME V AWAY under (exact names). */
export function Natfactrow({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatFactrowFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      facts={[
        { label: "DATE", value: fx.date },
        { label: "KICK-OFF", value: fx.kickoff },
      ]}
      line={`${fx.homeName} v ${fx.awayName}`.toUpperCase()}
    />
  );
}

/** Natural goal · fila de factos: his first name and surname big with tiny labels; GOAL above, his club's exact name under. No score. */
export function Goalnatfactrow({ data }: { data: RenderData }) {
  return (
    <NatFactrowFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      facts={[
        { label: "PLAYER", value: [data.content.firstName, data.content.lastName].filter(Boolean).join(" ") },
      ]}
      line={ourClub(data).toUpperCase()}
    />
  );
}
