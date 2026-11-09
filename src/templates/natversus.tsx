import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "versus" natural looks (a theatre bill): his real photo full-bleed; at the foot, centred,
 * three serif lines — the first name, a small italic joining word ("versus" / "for"), the second name — then one
 * tiny tracked line of details. The NEYOD logo alone at the top.
 */
function NatVersusFrame({ data, a, mid, b, line }: { data: RenderData; a: string; mid: string; b: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 660 : 460,
    fs: story ? 240 : 145,
  });
  const nPx = Math.min(58 * k * ts, (CANVAS_W - 120) / Math.max(1, Math.max(a.length, b.length) * 0.5));
  const mPx = nPx * 0.5;
  const lPx = Math.min(13 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.26)));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const bTop = lineTop - 20 * k - nPx;
  const mTop = bTop - 6 * k - mPx;
  const aTop = mTop - 6 * k - nPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const name = { position: "absolute", left: 0, width: CANVAS_W, textAlign: "center", fontFamily: SERIF, fontWeight: 600, fontSize: nPx, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: aTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 45%, rgba(0,0,0,.7))" }} />
      <div style={{ ...name, top: aTop }}>{a}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: mTop, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: mPx, lineHeight: 1, opacity: 0.85 }}>{mid}</div>
      <div style={{ ...name, top: bTop }}>{b}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.26em", paddingLeft: "0.26em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · versus (matchday): "Home / versus / Away" in serif (exact names); MATCHDAY · date · time under it. */
export function Natversus({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const line = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff].filter(Boolean).join("  ·  ");
  return <NatVersusFrame data={data} a={fx.homeName} mid="versus" b={fx.awayName} line={line} />;
}

/** Natural goal · versus: "his name / for / his club" in serif (exact club name); GOAL under it. No score. */
export function Goalnatversus({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatVersusFrame data={data} a={name} mid="for" b={ourClub(data)} line={(data.content.kicker || "GOAL").toUpperCase()} />;
}
