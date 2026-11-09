import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const ITALIC = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "magazine caption" natural looks (a photo credit in a printed magazine): his real
 * photo full-bleed; at the foot a hairline across the margins, under it on the left one sentence in a small
 * italic serif, and on the right the word in tiny tracked caps. The NEYOD logo alone at the top.
 */
function NatMagcaptionFrame({ data, word, caption }: { data: RenderData; word: string; caption: string }) {
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
  const M = 60;
  const wPx = 14 * k * ts;
  const wW = word.length * 0.9 * wPx;
  const capW = CANVAS_W - 2 * M - wW - 30 * k;
  const cPx = Math.min(24 * k * ts, capW / Math.max(1, caption.length * 0.45));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const capTop = bottom - cPx;
  const ruleTop = capTop - 18 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ruleTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 55%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, right: M, top: ruleTop, height: 1, background: OFF_WHITE, opacity: 0.7 }} />
      <div style={{ position: "absolute", left: M, width: capW, top: capTop - cPx * 0.1, fontFamily: ITALIC, fontStyle: "italic", fontWeight: 500, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap" }}>{caption}</div>
      <div style={{ position: "absolute", right: M, top: bottom - wPx - (cPx - wPx) * 0.15, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.28em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{word}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · legenda de revista (matchday): "Valletta FC v Hamrun Spartans, 25 Oct, 15:30." in italic serif under a hairline; MATCHDAY tiny on the right (exact names). */
export function Natmagcaption({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatMagcaptionFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} caption={`${[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(", ")}.`} />;
}

/** Natural goal · legenda de revista: "His Name, his club's exact name." in italic serif; GOAL tiny on the right. No score. */
export function Goalnatmagcaption({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatMagcaptionFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} caption={`${[name, ourClub(data)].filter(Boolean).join(", ")}.`} />;
}
