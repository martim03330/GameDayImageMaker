import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "vs" natural looks: his real photo full-bleed; at the foot one centred line with a
 * big italic serif "v" in the middle and the two names in bold caps either side of it, right- and
 * left-aligned to it; under it one small tracked line. The NEYOD logo alone at the top.
 */
function NatVsFrame({ data, a, b, mid, line }: { data: RenderData; a: string; b: string; mid: string; line: string }) {
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
  const vPx = 96 * k * ts;
  const gap = vPx * 0.5;
  const half = CANVAS_W / 2 - gap - 50;
  const nPx = Math.min(36 * k * ts, half / Math.max(1, capsEm(a, 0.04)), half / Math.max(1, capsEm(b, 0.04)));
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.24)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const rowMid = lineTop - 30 * k - vPx * 0.42;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const name = { position: "absolute", top: rowMid - nPx * 0.55, fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: rowMid - vPx - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ ...name, right: CANVAS_W / 2 + gap, textAlign: "right" }}>{a}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: rowMid - vPx * 0.62, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: vPx, lineHeight: 1 }}>{mid}</div>
      <div style={{ ...name, left: CANVAS_W / 2 + gap }}>{b}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", paddingLeft: "0.24em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · vs (matchday): HOME  v  AWAY with a big italic "v" (exact names); MATCHDAY · date · time under it. */
export function Natvs({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const line = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff].filter(Boolean).join("  ·  ");
  return <NatVsFrame data={data} a={fx.homeName.toUpperCase()} b={fx.awayName.toUpperCase()} mid="v" line={line} />;
}

/** Natural goal · vs: his first name and surname either side of a big italic dot; GOAL · his club's exact name under it. No score. */
export function Goalnatvs({ data }: { data: RenderData }) {
  const w = (data.content.kicker || "GOAL").toUpperCase();
  return <NatVsFrame data={data} a={(data.content.firstName ?? "").toUpperCase()} b={(data.content.lastName ?? "").toUpperCase()} mid="·" line={[w, ourClub(data).toUpperCase()].join("  ·  ")} />;
}
