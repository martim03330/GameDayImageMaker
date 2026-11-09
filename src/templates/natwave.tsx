import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "wave" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, the word in bold underlined by one thin wavy line in his club's colour (an SVG sine, as wide as the
 * word), two quiet lines under it. The NEYOD logo alone at the top.
 */
function NatWaveFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = Math.min(500 * k, CANVAS_W * 0.52);
  const ls = lines.filter(Boolean);
  const wPx = Math.min(62 * k * ts, colW / Math.max(1, word.length * 0.66));
  const wW = Math.min(colW, word.length * 0.66 * wPx);
  const lPx = 18 * k * ts;
  const amp = 5 * k;
  const period = 26 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const waveTop = linesTop - 18 * k - 2 * amp;
  const wTop = waveTop - 12 * k - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  let d = `M 0 ${amp}`;
  for (let x = 0; x < wW; x += period / 2) d += ` q ${period / 4} ${(x / (period / 2)) % 2 === 0 ? -2 * amp : 2 * amp} ${period / 2} 0`;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <svg width={wW} height={2 * amp + 4} style={{ position: "absolute", [edge]: M, top: waveTop, overflow: "visible" }}>
        <path d={d} fill="none" stroke={colour} strokeWidth={2.5 * k} strokeLinecap="round" transform="translate(0 2)" />
      </svg>
      <div style={{ position: "absolute", [edge]: M, width: colW, top: linesTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
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

/** Natural · onda (matchday): MATCHDAY over a thin wavy club-colour line; Home v Away and date · time below (exact names). */
export function Natwave({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatWaveFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · onda: GOAL over the wavy line; his name and his club's exact name. No score. */
export function Goalnatwave({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatWaveFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
