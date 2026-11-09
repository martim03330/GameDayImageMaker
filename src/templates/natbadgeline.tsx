import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "tag and rule" natural looks: his real photo full-bleed; at the foot, on the side
 * away from him, a small rounded tag in his club's colour holding the word, with a hairline running from it to
 * the far margin; under them his main line in bold and a quiet one. The NEYOD logo alone at the top.
 */
function NatBadgelineFrame({ data, word, main, sub }: { data: RenderData; word: string; main: string; sub: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 520 * k;
  const tPx = 15 * k * ts;
  const tagW = capsEm(word, 0.2) * tPx + 28 * k;
  const tagH = tPx + 16 * k;
  const mPx = Math.min(34 * k * ts, colW / Math.max(1, main.length * 0.6));
  const sPx = 17 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const subTop = bottom - sPx;
  const mainTop = (sub ? subTop - 12 * k : bottom) - mPx * 0.86;
  const tagTop = mainTop - 20 * k - tagH;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const far = left ? "right" : "left";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: tagTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", [edge]: M, top: tagTop, width: tagW, height: tagH, borderRadius: tagH / 2, background: colour, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: tPx, letterSpacing: "0.2em", paddingLeft: "0.2em", boxSizing: "border-box", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [edge]: M + tagW + 16 * k, [far]: M, top: tagTop + tagH / 2 - 0.75, height: 1.5, background: OFF_WHITE, opacity: 0.6 }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: mainTop - mPx * 0.12, textAlign: edge, fontFamily: SANS, fontWeight: 800, fontSize: mPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{main}</div>
      {sub && <div style={{ position: "absolute", [edge]: M, width: colW, top: subTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: sPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{sub}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · etiqueta e fio (matchday): a club-colour MATCHDAY tag and a hairline; Home v Away in bold, date · time below (exact names). */
export function Natbadgeline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBadgelineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} main={`${fx.homeName} v ${fx.awayName}`} sub={[fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · etiqueta e fio: a GOAL tag and a hairline; his name in bold, his club's exact name below. No score. */
export function Goalnatbadgeline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBadgelineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} main={name} sub={ourClub(data)} />;
}
