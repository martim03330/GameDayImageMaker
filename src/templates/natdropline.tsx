import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "drop line" natural looks: his real photo full-bleed; on the side away from him one
 * thin vertical hairline drops from just under the NEYOD logo band down the margin, ending in a small dot in his
 * club's colour; the type hangs at its foot, flush against it — the word in bold over two quiet lines.
 */
function NatDroplineFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 60;
  const colW = 460 * k;
  const ls = lines.filter(Boolean);
  const wPx = Math.min(54 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = 17 * k * ts;
  const D = 10 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const blockH = wPx + 12 * k + ls.length * lPx * 1.4;
  const textTop = bottom - blockH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const lineTop = logoTop + (story ? 150 : 100);
  const dotY = textTop - 26 * k;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [edge]: 0, width: colW + M + 160, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.38), rgba(0,0,0,0))` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: textTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 55%, rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", [edge]: M + D / 2 - 0.75, top: lineTop, width: 1.5, height: dotY - lineTop, background: `linear-gradient(to bottom, rgba(255,255,255,0), ${OFF_WHITE} 30%)`, opacity: 0.8 }} />
      <span style={{ position: "absolute", [edge]: M, top: dotY - D / 2, width: D, height: D, borderRadius: "50%", background: colour }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: textTop, textAlign: edge, fontFamily: SANS, lineHeight: 1 }}>
        <div style={{ fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{word}</div>
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

/** Natural · fio vertical (matchday): a hairline drops down the free margin to a club-colour dot; MATCHDAY, Home v Away, date · time hang at its foot (exact names). */
export function Natdropline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatDroplineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · fio vertical: the hairline drops to GOAL, his name and his club's exact name. No score. */
export function Goalnatdropline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDroplineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
