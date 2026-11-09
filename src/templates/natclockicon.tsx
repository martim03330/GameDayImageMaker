import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "clock" natural looks: his real photo full-bleed; at the foot-left a line-drawn clock
 * icon whose hands show the kick-off time, the time itself big beside it, and two small lines under it (on goals
 * the icon shows the hour of the date's kick-off when known, else just 12:00 and the word takes the big slot).
 * The NEYOD logo alone at the top.
 */
function NatClockiconFrame({ data, big, lines, hm }: { data: RenderData; big: string; lines: string[]; hm: [number, number] }) {
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
  const bPx = Math.min(96 * k * ts, 520 / Math.max(1, big.length * 0.6));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const bTop = linesTop - 16 * k - bPx;
  const I = bPx * 0.92;
  const [h, m] = hm;
  const ma = (m / 60) * 360;
  const ha = ((h % 12) / 12) * 360 + m / 2;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <svg width={I} height={I} viewBox="0 0 48 48" style={{ position: "absolute", left: M, top: bTop + (bPx - I) / 2 }} aria-hidden>
        <circle cx="24" cy="24" r="21.5" fill="none" stroke={OFF_WHITE} strokeWidth="3" />
        <line x1="24" y1="24" x2="24" y2="13" stroke={OFF_WHITE} strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${ha} 24 24)`} />
        <line x1="24" y1="24" x2="24" y2="8" stroke={OFF_WHITE} strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${ma} 24 24)`} />
        <circle cx="24" cy="24" r="2.2" fill={OFF_WHITE} />
      </svg>
      <div style={{ position: "absolute", left: M + I + 22 * k, top: bTop, fontFamily: SANS, fontWeight: 800, fontSize: bPx, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{big}</div>
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

const hmOf = (t: string): [number, number] => {
  const m = t.match(/(\d{1,2})[:h](\d{2})/);
  return m ? [Number(m[1]), Number(m[2])] : [12, 0];
};

/** Natural · relógio (matchday): a clock icon set to kick-off, the time big, MATCHDAY · date and Home v Away under it (exact names). */
export function Natclockicon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatClockiconFrame data={data} big={fx.time || word} hm={hmOf(fx.time)} lines={[[word, fx.date, fx.ptTime].filter(Boolean).join(" · "), `${fx.homeName} v ${fx.awayName}`]} />;
}

/** Natural goal · relógio: the clock icon and "Goal" big under his celebration; his name and his club's exact name. No score. */
export function Goalnatclockicon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatClockiconFrame data={data} big={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} hm={hmOf(fx.time)} lines={[name, ourClub(data)]} />;
}
