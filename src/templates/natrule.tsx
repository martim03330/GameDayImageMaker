/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "rule" natural looks: his real photo full-bleed; near the top a single line across
 * the width — a long hairline, the word in small bold tracked caps, a long hairline. At the foot the same
 * construction, smaller, with the details and the crest in the middle. The NEYOD logo at the foot under it.
 */
function NatRuleFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 740 : 560,
    fs: story ? 250 : 160,
  });
  const M = 56;
  const top = (story ? STORY_TOP : 64) - (params.textY ?? 0);
  const wPx = 30 * k * ts;
  const bottom = story ? STORY_BOTTOM : H - 50;
  const logoH = story ? 88 : 52;
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 2 * M - 160) / Math.max(1, capsEm(line, 0.22)));
  const footY = bottom - logoH - 34 * k;
  const crestS = 34 * k;
  const hair = { flex: 1, height: 1.5, background: OFF_WHITE, opacity: 0.75 } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - footY + 220 * k, background: "linear-gradient(to top, rgba(0,0,0,.66), rgba(0,0,0,.4) 55%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, height: wPx, display: "flex", alignItems: "center", gap: 26 * k }}>
        <div style={hair} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.32em", paddingLeft: "0.32em", whiteSpace: "nowrap", lineHeight: 1, textShadow: "0 1px 10px rgba(0,0,0,.35)" }}>{word}</div>
        <div style={hair} />
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: footY - crestS / 2, height: crestS, display: "flex", alignItems: "center", gap: 18 * k }}>
        <div style={hair} />
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{line}</div>
        <div style={hair} />
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · fio (matchday): ——— MATCHDAY ——— at the top; ——— crest HOME v AWAY · date · time ——— at the foot. */
export function Natrule({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatRuleFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · fio: ——— GOAL ——— over his celebration; ——— crest NAME · CLUB ——— at the foot (exact club name). No score. */
export function Goalnatrule({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatRuleFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}
