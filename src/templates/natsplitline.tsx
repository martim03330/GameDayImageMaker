import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "split line" natural looks: his real photo full-bleed; at the foot a short vertical
 * hairline at the centre, the word and a small fact on its left (flush right to it), two facts on its right
 * (flush left). The NEYOD logo alone at the top.
 */
function NatSplitlineFrame({ data, l, r }: { data: RenderData; l: [string, string]; r: [string, string] }) {
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
  const half = CANVAS_W / 2 - 60 - 24 * k;
  const bPx = Math.min(40 * k * ts, half / Math.max(1, l[0].length * 0.64));
  const sPx = 17 * k * ts;
  const rPx = Math.min(19 * k * ts, half / Math.max(1, Math.max(r[0].length, 1) * 0.56));
  const blockH = Math.max(bPx + 10 * k + sPx, rPx * 2 + 10 * k);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - blockH;
  const gap = 24 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const ell = { whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55) 50%, rgba(0,0,0,.7))" }} />
      <div style={{ position: "absolute", left: CANVAS_W / 2 - 0.75, width: 1.5, top: top - 4 * k, height: blockH + 8 * k, background: OFF_WHITE, opacity: 0.85 }} />
      <div style={{ position: "absolute", right: CANVAS_W / 2 + gap, width: half, top, textAlign: "right", fontFamily: SANS, lineHeight: 1 }}>
        <div style={{ fontWeight: 800, fontSize: bPx, letterSpacing: "-0.01em", ...ell }}>{l[0]}</div>
        <div style={{ marginTop: 10 * k, fontWeight: 500, fontSize: sPx, letterSpacing: "0.12em", opacity: 0.85, ...ell }}>{l[1]}</div>
      </div>
      <div style={{ position: "absolute", left: CANVAS_W / 2 + gap, width: half, top: top + blockH - (rPx * 2 + 10 * k), fontFamily: SANS, lineHeight: 1 }}>
        <div style={{ fontWeight: 700, fontSize: rPx, ...ell }}>{r[0]}</div>
        <div style={{ marginTop: 10 * k, fontWeight: 500, fontSize: rPx, opacity: 0.85, ...ell }}>{r[1]}</div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha ao meio (matchday): MATCHDAY + date left of a hairline; Home and Away (exact names) right of it. */
export function Natsplitline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSplitlineFrame data={data} l={[(data.content.kicker || "MATCHDAY").toUpperCase(), [fx.date, fx.kickoff].filter(Boolean).join(" · ").toUpperCase()]} r={[fx.homeName, `v ${fx.awayName}`]} />;
}

/** Natural goal · linha ao meio: GOAL left of a hairline; his name and his club's exact name right of it. No score. */
export function Goalnatsplitline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSplitlineFrame data={data} l={[(data.content.kicker || "GOAL").toUpperCase(), ""]} r={[name, ourClub(data)]} />;
}
