import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "ball icon" natural looks: his real photo full-bleed; at the foot-left a simple
 * line-drawn football icon (a circle with a pentagon) the height of the word, then the word in bold and two
 * small lines under it. The NEYOD logo alone at the top.
 */
function NatBalliconFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
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
  const wPx = Math.min(70 * k * ts, 600 / Math.max(1, word.length * 0.62));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 16 * k - wPx;
  const I = wPx * 0.9;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <svg width={I} height={I} viewBox="0 0 48 48" style={{ position: "absolute", left: M, top: wTop + (wPx - I) / 2 }} aria-hidden>
        <circle cx="24" cy="24" r="21.5" fill="none" stroke={OFF_WHITE} strokeWidth="3" />
        <polygon points="24,14 33.5,21 30,32 18,32 14.5,21" fill={OFF_WHITE} />
        <path d="M24 14V4.5M33.5 21l9-3M30 32l5.5 7.5M18 32l-5.5 7.5M14.5 21l-9-3" stroke={OFF_WHITE} strokeWidth="2.5" fill="none" />
      </svg>
      <div style={{ position: "absolute", left: M + I + 20 * k, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: linesTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, opacity: 0.92 }}>
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

/** Natural · ícone de bola (matchday): a line-drawn ball and "Matchday"; Home v Away and date · time under it (exact names). */
export function Natballicon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatBalliconFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · ícone de bola: the ball icon and "Goal" under his celebration; his name and his club's exact name. No score. */
export function Goalnatballicon({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBalliconFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}
