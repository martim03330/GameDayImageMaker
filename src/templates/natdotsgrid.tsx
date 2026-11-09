import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "dot grid" natural looks: his real photo full-bleed and, in the top corner away from
 * him, a small square grid of fine dots (a quiet graphic accent); at the foot the word in bold and two small
 * lines aligned to the same corner side. The NEYOD logo at the top on the other side.
 */
function NatDotsgridFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 620 : 460, fy: story ? 720 : 520, fs: story ? 245 : 155 });
  const M = 60;
  const top = (story ? STORY_TOP : 56) - (params.textY ?? 0);
  const N = 6;
  const step = 22 * k;
  const D = 4 * k;
  const wPx = Math.min(72 * k * ts, 520 / Math.max(1, word.length * 0.62));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 16 * k - wPx;
  const side = left ? { left: M } : { right: M };
  const logoSide = left ? { right: M } : { left: M };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + N * step + 140 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", ...side, top, width: N * step, height: N * step, backgroundImage: `radial-gradient(${OFF_WHITE} ${D / 2}px, transparent ${D / 2 + 0.5}px)`, backgroundSize: `${step}px ${step}px`, opacity: 0.85 }} />
      <div style={{ position: "absolute", ...side, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", textAlign: left ? "left" : "right" }}>{word}</div>
      <div style={{ position: "absolute", ...side, top: linesTop, width: CANVAS_W * 0.6, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, textAlign: left ? "left" : "right", opacity: 0.92 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", ...logoSide, top: top - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "right top" : "left top" }} />
    </div>
  );
}

/** Natural · grelha de pontos (matchday): a fine dot grid in the corner; "Matchday", Home v Away and date · time at the foot. */
export function Natdotsgrid({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatDotsgridFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · grelha de pontos: the dot grid beside his celebration; "Goal", his name and his club's exact name. No score. */
export function Goalnatdotsgrid({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDotsgridFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}
