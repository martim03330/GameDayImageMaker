import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "big names" natural looks: his real photo full-bleed; at the foot-left two big bold lines
 * stacked (the two teams on matchday with a small italic "v" between; his first name and surname on goals), the word
 * small in tracked caps above them. The NEYOD logo alone at the top.
 */
function NatNamesbigFrame({ data, word, a, b, mid }: { data: RenderData; word: string; a: string; b: string; mid: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 680 : 480,
    fs: story ? 240 : 150,
  });
  const M = 56;
  const nPx = Math.min(78 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(a, -0.02)), (CANVAS_W - 2 * M) / Math.max(1, capsEm(b, -0.02)));
  const mPx = nPx * 0.4;
  const wPx = 15 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const bTop = bottom - nPx * 0.92;
  const mTop = mid ? bTop - 4 * k - mPx : bTop;
  const aTop = mTop - (mid ? 4 * k : 0) - nPx * 0.92;
  const wTop = aTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const name = { position: "absolute", left: M, fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "-0.02em", lineHeight: 0.92, whiteSpace: "nowrap" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M + 2, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.28em", lineHeight: 1, opacity: 0.88 }}>{word}</div>
      <div style={{ ...name, top: aTop }}>{a}</div>
      {mid && <div style={{ position: "absolute", left: M + 4, top: mTop, fontFamily: "var(--font-dmserif), Georgia, serif", fontStyle: "italic", fontSize: mPx, lineHeight: 1, opacity: 0.85 }}>{mid}</div>}
      <div style={{ ...name, top: bTop }}>{b}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · nomes grandes (matchday): MATCHDAY · date small; the home team big, "v", the away team big (exact names). */
export function Natnamesbig({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff].filter(Boolean).join("  ·  ");
  return <NatNamesbigFrame data={data} word={word} a={fx.homeName.toUpperCase()} b={fx.awayName.toUpperCase()} mid="v" />;
}

/** Natural goal · nomes grandes: GOAL · his club's exact name small; his first name and surname big, stacked. No score. */
export function Goalnatnamesbig({ data }: { data: RenderData }) {
  const word = [(data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()].join("  ·  ");
  return <NatNamesbigFrame data={data} word={word} a={(data.content.firstName ?? "").toUpperCase()} b={(data.content.lastName ?? "").toUpperCase()} mid="" />;
}
