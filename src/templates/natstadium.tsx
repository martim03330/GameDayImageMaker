import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "stadium" natural looks: his real photo full-bleed; at the foot the place given the
 * billing — the venue's name big in bold caps (his club's exact name on goals), the word and a small line of details
 * above it in tracked caps. The NEYOD logo alone at the top.
 */
function NatStadiumFrame({ data, word, big, line }: { data: RenderData; word: string; big: string; line: string }) {
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
  const M = 56;
  const bPx = Math.min(74 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(big, -0.01)));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const wPx = 15 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const bTop = bottom - bPx * 0.92;
  const lTop = bTop - 16 * k - lPx;
  const wTop = lTop - 10 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, opacity: 0.88 }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bTop - bPx * 0.08, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: bPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap" }}>{big}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · estádio (matchday): the venue big; MATCHDAY and HOME v AWAY · date · time over it (exact names). Without a venue, the home team. */
export function Natstadium({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatStadiumFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} big={(fx.venue || fx.homeName).toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · estádio: his club's exact name big under his celebration; GOAL and his name over it. No score. */
export function Goalnatstadium({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatStadiumFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} big={ourClub(data).toUpperCase()} line={name.toUpperCase()} />;
}
