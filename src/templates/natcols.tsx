/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

type Col = { label: string; value: string; crest?: string | null };

/**
 * The shared frame of the "columns" natural looks (a data sheet): his real photo full-bleed; at the foot, over
 * a soft shade, a hairline and then three equal columns — each a tiny label in caps and a value in bold —
 * like a match-sheet's header. The word sits small above the hairline at the left, the NEYOD logo at the top.
 */
function NatColsFrame({ data, word, cols: all }: { data: RenderData; word: string; cols: Col[] }) {
  const cols = all.filter((c) => c.value);
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 700 : 510,
    fs: story ? 240 : 155,
  });
  const M = 64;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const vPx = 24 * k * ts;
  const tPx = 12 * k * ts;
  const colH = tPx + 12 * k + vPx * 2.4;
  const ruleTop = bottom - colH - 22 * k;
  const wPx = 30 * k * ts;
  const colW = (CANVAS_W - 2 * M) / cols.length;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ruleTop - 260 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top: ruleTop - 18 * k - wPx, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.12em", lineHeight: 1 }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: ruleTop, height: 2, background: OFF_WHITE, opacity: 0.85 }} />
      {cols.map((c, i) => (
        <div key={c.label} style={{ position: "absolute", left: M + i * colW, width: colW - 20 * k, top: ruleTop + 22 * k }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.22em", opacity: 0.75 }}>{c.label}</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 * k, marginTop: 12 * k }}>
            {c.crest && <img src={c.crest} alt="" style={{ width: vPx * 1.3, height: vPx * 1.3, objectFit: "contain", flexShrink: 0 }} />}
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: vPx, lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.value}</div>
          </div>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · colunas (matchday): MATCHDAY over three columns — HOME (crest + exact name), AWAY (crest + exact name), KICK-OFF (date · time). */
export function Natcols({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatColsFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      cols={[
        { label: "HOME", value: fx.homeName, crest: fx.homeCrest },
        { label: "AWAY", value: fx.awayName, crest: fx.awayCrest },
        { label: "KICK-OFF", value: [fx.date, fx.kickoff].filter(Boolean).join(" · ") },
      ]}
    />
  );
}

/** Natural goal · colunas: GOAL over PLAYER (his name), CLUB (crest + exact name), DATE — on his celebration photo. No score. */
export function Goalnatcols({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatColsFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      cols={[
        { label: "PLAYER", value: name },
        { label: "CLUB", value: ourClub(data), crest: data.content.home === false ? fx.awayCrest : fx.homeCrest },
        { label: "DATE", value: fx.date },
      ]}
    />
  );
}
