import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "corner marks" natural looks (a viewfinder around the type): his real photo
 * full-bleed; on the side away from him at the foot, the word in bold over two quiet lines, framed by four
 * small L-shaped corner marks — the top-left one in his club's colour. The NEYOD logo alone at the top.
 */
function NatBlockcornersFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const pad = 26 * k;
  const ls = lines.filter(Boolean);
  const wPx = Math.min(50 * k * ts, (420 * k) / Math.max(1, word.length * 0.66));
  const lPx = 17 * k * ts;
  // The frame hugs the text: as wide as its longest line.
  const innerW = Math.min(440 * k, Math.max(word.length * 0.66 * wPx, ...ls.map((l) => l.length * 0.55 * lPx)));
  const innerH = wPx * 0.9 + 14 * k + ls.length * lPx * 1.4;
  const boxW = innerW + 2 * pad;
  const boxH = innerH + 2 * pad;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const top = bottom - boxH;
  const x = left ? M : CANVAS_W - M - boxW;
  const L = 22 * k;
  const T = 2.5 * k;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const corner = (cx: "left" | "right", cy: "top" | "bottom", c: string) => (
    <div key={cx + cy} style={{ position: "absolute", [cx]: 0, [cy]: 0, width: L, height: L, [`border${cy === "top" ? "Top" : "Bottom"}`]: `${T}px solid ${c}`, [`border${cx === "left" ? "Left" : "Right"}`]: `${T}px solid ${c}` }} />
  );
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: x, top, width: boxW, height: boxH }}>
        {corner("left", "top", colour)}
        {corner("right", "top", OFF_WHITE)}
        {corner("left", "bottom", OFF_WHITE)}
        {corner("right", "bottom", OFF_WHITE)}
        <div style={{ position: "absolute", left: pad, top: pad, width: innerW, fontFamily: SANS, lineHeight: 1 }}>
          <div style={{ fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", whiteSpace: "nowrap", marginTop: -wPx * 0.08 }}>{word}</div>
          <div style={{ marginTop: 14 * k, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
            {ls.map((l) => (
              <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cantos no bloco (matchday): MATCHDAY, Home v Away and date · time inside four corner marks (exact names). */
export function Natblockcorners({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBlockcornersFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · cantos no bloco: GOAL, his name and his club's exact name inside four corner marks. No score. */
export function Goalnatblockcorners({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBlockcornersFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
