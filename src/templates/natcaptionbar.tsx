import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "caption bar" natural looks (a news photo credit): his real photo full-bleed and a
 * thin near-black bar across the full width at the foot, holding in one line the word in bold at the left and
 * the details in light text at the right. The NEYOD logo alone at the top.
 */
function NatCaptionbarFrame({ data, word, detail }: { data: RenderData; word: string; detail: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const barH = 76 * k;
  const barTop = (story ? STORY_BOTTOM + 30 : H) - barH - (params.textY ?? 0);
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 48;
  const wPx = 22 * k * ts;
  const dPx = 18 * k * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#111", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: barTop, height: barH, background: "rgba(12,12,12,.9)", display: "flex", alignItems: "center", gap: 22 * k, padding: `0 ${M}px` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.16em", whiteSpace: "nowrap", flexShrink: 0 }}>{word}</span>
        <span style={{ width: 1.5, height: wPx * 1.1, background: OFF_WHITE, opacity: 0.5, flexShrink: 0 }} />
        <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: dPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.9 }}>{detail}</span>
      </div>
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: barTop + barH, bottom: 0, background: "rgba(12,12,12,.9)" }} />}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · faixa de legenda (matchday): a thin dark bar: MATCHDAY | Home v Away · date · time (exact names). */
export function Natcaptionbar({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCaptionbarFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} detail={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ")} />;
}

/** Natural goal · faixa de legenda: GOAL | his name · his club's exact name, on a thin bar under his celebration. No score. */
export function Goalnatcaptionbar({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCaptionbarFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} detail={[name, ourClub(data)].filter(Boolean).join("  ·  ")} />;
}
