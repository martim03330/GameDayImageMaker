import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "folio" natural looks (a magazine page header): his real photo full-bleed and only a
 * small running header across the top — the word in bold at the left, the details at the right, a hairline under
 * them — leaving the whole photo to him. The NEYOD logo alone at the foot centre.
 */
function NatFolioFrame({ data, word, right }: { data: RenderData; word: string; right: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 740 : 540,
    fs: story ? 250 : 160,
  });
  const M = 56;
  const top = (story ? STORY_TOP : 56) - (params.textY ?? 0);
  const px = 17 * k * ts;
  const bottom = story ? STORY_BOTTOM : H - 56;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 180 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 120 * k, background: "linear-gradient(to top, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: SANS, fontSize: px, lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 800, letterSpacing: "0.24em" }}>{word}</span>
        <span style={{ fontWeight: 500, letterSpacing: "0.08em", opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis", marginLeft: 30 * k }}>{right}</span>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: top + px + 16 * k, height: 1.5, background: OFF_WHITE, opacity: 0.7 }} />
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · fólio (matchday): a small running header — MATCHDAY at the left, Home v Away · date · time at the right (exact names). */
export function Natfolio({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFolioFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} right={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · fólio: the running header over his celebration — GOAL, his name · his club's exact name. No score. */
export function Goalnatfolio({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFolioFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} right={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
