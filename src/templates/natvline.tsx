import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "divider" natural looks: his real photo full-bleed; at the foot a short vertical
 * hairline in the middle with text set against it on both sides — the word right-aligned on the left, the
 * details left-aligned on the right — like a split caption. The NEYOD logo alone at the top.
 */
function NatVlineFrame({ data, word, sub, lines }: { data: RenderData; word: string; sub: string; lines: string[] }) {
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
  const gap = 28 * k;
  const half = CANVAS_W / 2 - gap - 56;
  const wPx = Math.min(56 * k * ts, half / Math.max(1, word.length * 0.64));
  const sPx = 15 * k * ts;
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const blockH = Math.max(wPx + 12 * k + sPx, ls.length * lPx * 1.45);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - blockH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: CANVAS_W / 2 - 1, top: top - 6 * k, width: 2, height: blockH + 12 * k, background: OFF_WHITE, opacity: 0.85 }} />
      <div style={{ position: "absolute", right: CANVAS_W / 2 + gap, top, textAlign: "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: sPx, letterSpacing: "0.22em", lineHeight: 1, marginTop: 12 * k, opacity: 0.85, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: CANVAS_W / 2 + gap, width: half, top, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.45 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · divisória (matchday): "MATCHDAY / date" left of a hairline; Home, v Away, kick-off · venue right of it (exact names). */
export function Natvline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatVlineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} sub={fx.date.toUpperCase()} lines={[fx.homeName, `v ${fx.awayName}`, [fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · divisória: "GOAL" left of the hairline; his name and his club's exact name right of it. No score. */
export function Goalnatvline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatVlineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} sub={fx.date.toUpperCase()} lines={[data.content.firstName ?? "", data.content.lastName ?? "", ourClub(data)]} />;
}
