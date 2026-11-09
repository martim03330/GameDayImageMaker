import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "overline" natural looks (an article header): his real photo full-bleed; at the
 * foot-left a tiny overline in tracked caps in his club's accent tone, the title in a medium serif under it,
 * then a light byline. The NEYOD logo alone at the top. A soft shade only under the header.
 */
function NatOverlineFrame({ data, over, title, by }: { data: RenderData; over: string; title: string; by: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: story ? 680 : 500,
    fs: story ? 240 : 150,
  });
  const M = 64;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const oPx = 15 * k * ts;
  const tPx = Math.min(78 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, title.length * 0.5));
  const bPx = 18 * k * ts;
  const byTop = bottom - bPx * 1.2;
  const tTop = byTop - 18 * k - tPx * 1.05;
  const oTop = tTop - 16 * k - oPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: oTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top: oTop, fontFamily: SANS, fontWeight: 700, fontSize: oPx, letterSpacing: "0.26em", lineHeight: 1, opacity: 0.9 }}>{over}</div>
      <div style={{ position: "absolute", left: M, right: M, top: tTop, fontFamily: SERIF, fontWeight: 600, fontSize: tPx, lineHeight: 1.05, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ position: "absolute", left: M, right: M, top: byTop, fontFamily: SANS, fontWeight: 400, fontSize: bPx, lineHeight: 1.2, opacity: 0.82, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{by}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · sobretítulo (matchday): MATCHDAY overline, "Home v Away" in serif, "date · time · venue" byline. */
export function Natoverline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatOverlineFrame data={data} over={(data.content.kicker || "MATCHDAY").toUpperCase()} title={`${fx.homeName} v ${fx.awayName}`} by={[fx.date, fx.kickoff, fx.venue].filter(Boolean).join(" · ")} />;
}

/** Natural goal · sobretítulo: GOAL overline, his name in serif, his club's exact name as the byline. No score. */
export function Goalnatoverline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatOverlineFrame data={data} over={(data.content.kicker || "GOAL").toUpperCase()} title={name} by={ourClub(data)} />;
}
