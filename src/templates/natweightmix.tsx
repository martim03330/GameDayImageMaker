import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "weight mix" natural looks: his real photo full-bleed; at the foot, centred, the word
 * in large lowercase split by weight — the first half hairline-thin, the second heavy (match**day**,
 * go**al**) — and one small tracked line under it. The NEYOD logo alone at the top.
 */
function NatWeightmixFrame({ data, a, b, line }: { data: RenderData; a: string; b: string; line: string }) {
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
  const wPx = Math.min(130 * k * ts, (CANVAS_W - 120) / Math.max(1, (a.length + b.length) * 0.56));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 20 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontSize: wPx, letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 200 }}>{a}</span>
        <span style={{ fontWeight: 800 }}>{b}</span>
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const halves = (word: string): [string, string] => {
  const w = word.toLowerCase();
  if (w === "matchday") return ["match", "day"];
  const m = Math.ceil(w.length / 2);
  return [w.slice(0, m), w.slice(m)];
};

/** Natural · fino e grosso (matchday): "match" thin + "day" heavy; HOME v AWAY · date · time under it (exact names). */
export function Natweightmix({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const [a, b] = halves(data.content.kicker || "matchday");
  return <NatWeightmixFrame data={data} a={a} b={b} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · fino e grosso: "go" thin + "al" heavy under his celebration; his name · his club's exact name. No score. */
export function Goalnatweightmix({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const [a, b] = halves(data.content.kicker || "goal");
  return <NatWeightmixFrame data={data} a={a} b={b} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
