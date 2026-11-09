/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest tower" natural looks: his real photo full-bleed; on the edge away from him,
 * low, the crests stacked in one column (a small "v" between two), and beside the column the word in bold
 * over two quiet lines. The NEYOD logo alone at the top.
 */
function NatCresttowerFrame({ data, crests, word, lines }: { data: RenderData; crests: (string | null)[]; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 680 : 400, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const cs = crests.filter(Boolean) as string[];
  const C = 78 * k;
  const vH = cs.length > 1 ? 30 * k : 0;
  const towerH = cs.length * C + vH;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const towerTop = bottom - towerH;
  const textX = M + C + 28 * k;
  const colW = 380 * k;
  const ls = lines.filter(Boolean);
  const wPx = Math.min(46 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = 17 * k * ts;
  const textTop = bottom - (wPx + 12 * k + ls.length * lPx * 1.4);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: Math.min(towerTop, textTop) - 200 * k, bottom: 0, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.55), rgba(0,0,0,0) 70%)`, WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 40%)", maskImage: "linear-gradient(to bottom, transparent, #000 40%)" }} />
      <div style={{ position: "absolute", [edge]: M, width: C, top: towerTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {cs.map((c, i) => (
          <div key={i} style={{ display: "contents" }}>
            {i > 0 && <div style={{ height: vH, display: "flex", alignItems: "center", fontFamily: SANS, fontWeight: 600, fontSize: 16 * k, opacity: 0.85 }}>v</div>}
            <img src={c} alt="" style={{ width: C, height: C, objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", [edge]: cs.length ? textX : M, width: colW, top: textTop, textAlign: edge, fontFamily: SANS, lineHeight: 1 }}>
        <div style={{ fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ marginTop: 12 * k, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
          {ls.map((l) => (
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

/** Natural · torre de emblemas (matchday): home crest, "v", away crest stacked at the edge; MATCHDAY, Home v Away, date · time beside (exact names). */
export function Natcresttower({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCresttowerFrame data={data} crests={[fx.homeCrest, fx.awayCrest]} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · torre de emblemas: his club's crest at the edge; GOAL, his name and his club's exact name beside. No score. */
export function Goalnatcresttower({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCresttowerFrame data={data} crests={[crest]} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
