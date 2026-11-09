import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "pull bar" natural looks (a magazine pull-out): his real photo full-bleed; at the foot-left
 * a thick vertical bar in his club's colour beside a short factual sentence in large italic serif (never a made-up
 * quote: only who, where and when), the word small in tracked caps above. The NEYOD logo alone at the top.
 */
function NatPullbarFrame({ data, word, sentence }: { data: RenderData; word: string; sentence: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 660 : 470,
    fs: story ? 240 : 150,
  });
  const M = 60;
  const bar = 8 * k;
  const x = M + bar + 26 * k;
  const W = CANVAS_W - x - M;
  const sPx = Math.min(44 * k * ts, (W * 3) / Math.max(1, sentence.length * 0.46));
  const nLines = Math.max(1, Math.ceil((sentence.length * sPx * 0.46) / W));
  const wPx = 14 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const sTop = bottom - nLines * sPx * 1.18;
  const wTop = sTop - 18 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 45%, rgba(0,0,0,.7))" }} />
      <div style={{ position: "absolute", left: x, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.28em", lineHeight: 1, opacity: 0.88 }}>{word}</div>
      <div style={{ position: "absolute", left: M, top: wTop, width: bar, height: bottom - wTop, background: colour }} />
      <div style={{ position: "absolute", left: x, width: W, top: sTop, fontFamily: SERIF, fontStyle: "italic", fontSize: sPx, lineHeight: 1.18 }}>{sentence}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · barra de citação (matchday): a colour bar beside "Home v Away, date at time." in italic serif (exact names). */
export function Natpullbar({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const when = [fx.date && `, ${fx.date}`, fx.time && ` at ${fx.kickoff}`].filter(Boolean).join("");
  return <NatPullbarFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} sentence={`${fx.homeName} v ${fx.awayName}${when}.`} />;
}

/** Natural goal · barra de citação: the bar beside "Name scores for Club." in italic serif (exact club name). No score. */
export function Goalnatpullbar({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatPullbarFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} sentence={`${name} scores for ${ourClub(data)}.`} />;
}
