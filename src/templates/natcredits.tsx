import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "credits" natural looks (a film poster's billing): his real photo full-bleed; at the
 * foot, centred, a small italic serif lead ("featuring" / "starring"), the main line big in condensed caps, and
 * a credit line in tiny tracked caps under it. The NEYOD logo alone at the top.
 */
function NatCreditsFrame({ data, lead, main, credit }: { data: RenderData; lead: string; main: string; credit: string }) {
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
  const mPx = Math.min(78 * k * ts, (CANVAS_W - 120) / Math.max(1, main.length * 0.46));
  const lPx = 30 * k * ts;
  const cPx = 13 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const cTop = bottom - cPx;
  const mTop = cTop - 18 * k - mPx;
  const lTop = mTop - 8 * k - lPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lTop, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: lPx, lineHeight: 1 }}>{lead}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: mTop, textAlign: "center", fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: mPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{main}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: cTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.85 }}>{credit}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · créditos (matchday): "it's matchday" lead, HOME V AWAY big, date · time · venue as the credit line (exact names). */
export function Natcredits({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = (data.content.kicker || "matchday").toLowerCase();
  return <NatCreditsFrame data={data} lead={`it's ${w}`} main={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} credit={[fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · créditos: "a goal by" lead, his name big, his club's exact name as the credit. No score. */
export function Goalnatcredits({ data }: { data: RenderData }) {
  const w = (data.content.kicker || "goal").toLowerCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCreditsFrame data={data} lead={`a ${w} by`} main={name.toUpperCase()} credit={ourClub(data).toUpperCase()} />;
}
