/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest box" natural looks: his real photo full-bleed; at the foot-left a square
 * off-white tile holding his club's crest, and beside it, aligned to the tile's height, the word in bold over
 * two small lines. The NEYOD logo alone at the top. A soft shade only under the block.
 */
function NatCrestboxFrame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 580,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const S = 150 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - S;
  const x = M + S + 26 * k;
  const wPx = Math.min(58 * k * ts, (CANVAS_W - x - M) / Math.max(1, word.length * 0.64));
  const lPx = 18 * k * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top, width: S, height: S, background: OFF_WHITE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,.3)" }}>
        {crest && <img src={crest} alt="" style={{ width: S * 0.7, height: S * 0.7, objectFit: "contain" }} />}
      </div>
      <div style={{ position: "absolute", left: x, right: M, top, height: S, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.92 }}>
          {lines.filter(Boolean).map((l) => (
            <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · caixa do emblema (matchday): his club's crest in a square tile; MATCHDAY, Home v Away, date · time beside it. */
export function Natcrestbox({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatCrestboxFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · caixa do emblema: his crest in a tile; GOAL, his name and his club's exact name beside it. No score. */
export function Goalnatcrestbox({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCrestboxFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
