/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "badge" natural looks: his real photo full-bleed and, in the lower corner away
 * from him, one round off-white badge: the crest at its top, the word in bold caps in his club's colour, a
 * small line under it. Nothing else but the NEYOD logo at the top.
 */
function NatBadgeFrame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right";
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 460 : 620, fy: story ? 700 : 520, fs: story ? 245 : 155 });
  const ink = panelColour(params.primary, params.accent);
  const D = 300 * k;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const wPx = Math.min(40 * k * ts, (D * 0.78) / Math.max(1, word.length * 0.66));
  const lPx = 13 * k * ts;
  const crestS = 58 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          [right ? "right" : "left"]: 56,
          top: bottom - D,
          width: D,
          height: D,
          borderRadius: "50%",
          background: OFF_WHITE,
          color: ink,
          boxShadow: "0 12px 34px rgba(0,0,0,.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10 * k,
          textAlign: "center",
        }}
      >
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.06em", lineHeight: 1 }}>{word}</div>
        <div style={{ width: 40 * k, height: 2, background: ink, opacity: 0.6 }} />
        {lines.filter(Boolean).map((l) => (
          <div key={l} style={{ fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.12em", lineHeight: 1.3, maxWidth: D * 0.74, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · selo (matchday): a round badge — his club's crest, MATCHDAY, date · time and the opponent. */
export function Natbadge({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const opp = data.content.home === false ? fx.homeName : fx.awayName;
  return (
    <NatBadgeFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      lines={[[fx.date, fx.kickoff].filter(Boolean).join(" · ").toUpperCase(), opp ? `V ${opp.toUpperCase()}` : ""]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · selo: a round badge on his celebration — his crest, GOAL, his name and his club's exact name. No score. */
export function Goalnatbadge({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBadgeFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name.toUpperCase(), ourClub(data).toUpperCase()]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
