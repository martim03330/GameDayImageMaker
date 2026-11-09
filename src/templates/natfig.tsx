import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "figure" natural looks (a book plate): his real photo full-bleed; at the foot-left a
 * scholarly caption — "Fig. 1" in small bold caps, an em dash, then one serif sentence in italic for the key
 * words — set narrow like a printed caption. The NEYOD logo alone at the top.
 */
function NatFigFrame({ data, parts }: { data: RenderData; parts: { t: string; i?: boolean }[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const W = 640 * k;
  const sPx = 28 * k * ts;
  const len = parts.reduce((n, p) => n + p.t.length, 0) + 9;
  const lines = Math.max(1, Math.ceil((len * sPx * 0.46) / W));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - lines * sPx * 1.28;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, width: W, top, fontFamily: SERIF, fontWeight: 500, fontSize: sPx, lineHeight: 1.28, textShadow: "0 1px 10px rgba(0,0,0,.35)" }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: sPx * 0.62, letterSpacing: "0.18em", marginRight: "0.5em", verticalAlign: "0.12em" }}>FIG. 1</span>
        <span style={{ marginRight: "0.35em" }}>—</span>
        {parts.map((p, i) => (
          <span key={i} style={{ fontStyle: p.i ? "italic" : "normal" }}>
            {p.t}
          </span>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · figura (matchday): "FIG. 1 — Matchday: Home v Away, date, kick-off." (exact names, teams in italic). */
export function Natfig({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  const tail = [fx.date, fx.kickoff].filter(Boolean).join(", ");
  return <NatFigFrame data={data} parts={[{ t: `${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}: ` }, { t: `${fx.homeName} v ${fx.awayName}`, i: true }, { t: tail ? `, ${tail}.` : "." }]} />;
}

/** Natural goal · figura: "FIG. 1 — Name celebrates a goal for Club." (exact club name, italic). No score. */
export function Goalnatfig({ data }: { data: RenderData }) {
  const w = (data.content.kicker || "goal").toLowerCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFigFrame data={data} parts={[{ t: name, i: true }, { t: ` celebrates a ${w} for ` }, { t: ourClub(data), i: true }, { t: "." }]} />;
}
