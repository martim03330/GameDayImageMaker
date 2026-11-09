/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "nav" natural looks (a website header): a slim off-white bar across the top — the
 * crest and the club's exact name at the left, the word in a small solid tag in his club's colour at the
 * right — and his real photo full-bleed under it, untouched. At the foot, one line and the NEYOD logo.
 */
function NatNavFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = panelColour(params.primary, params.accent);
  const barTop = story ? STORY_TOP - 60 : 0;
  const barH = 96 * k;
  const photoTop = barTop + barH;
  const place = natPlace(data, CANVAS_W, H - photoTop, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 560 : 400,
    fs: story ? 240 : 150,
  });
  const M = 48;
  const nPx = 22 * k * ts;
  const tPx = 18 * k * ts;
  const lPx = 18 * k * ts;
  const bottom = story ? STORY_BOTTOM : H - 56;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: OFF_WHITE }}>
      <div style={{ position: "absolute", left: 0, top: photoTop, width: CANVAS_W, height: H - photoTop, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={H - photoTop} />
        <NatFigure data={data} place={place} W={CANVAS_W} H={H - photoTop} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 220 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      </div>
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: barTop, background: OFF_WHITE }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: barTop, height: barH, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${M}px`, color: ink, borderBottom: "1px solid rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * k }}>
          {crest && <img src={crest} alt="" style={{ width: 52 * k, height: 52 * k, objectFit: "contain" }} />}
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: nPx, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{ourClub(data)}</span>
        </div>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: tPx, letterSpacing: "0.16em", color: "#fff", background: ink, padding: `${8 * k}px ${14 * k}px`, borderRadius: 999 }}>{word}</span>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: bottom - logoH - 26 * k - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · barra de navegação (matchday): the bar reads his crest, his club's exact name and a MATCHDAY tag; Home v Away · date · time at the foot. */
export function Natnav({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatNavFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ")}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · barra de navegação: the bar reads his crest, club and a GOAL tag; his name at the foot of his celebration. No score. */
export function Goalnatnav({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatNavFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={name} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
