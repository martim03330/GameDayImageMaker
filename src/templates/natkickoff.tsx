import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "kick-off" natural looks (a station clock / departures board): his real photo
 * full-bleed; at the foot-left a small label in tracked caps and, under it, the big figure in mono digits —
 * the kick-off time on matchday, the date on goals — with one line of details beside it. The NEYOD logo at
 * the top.
 */
function NatKickoffFrame({ data, label, figure, lines }: { data: RenderData; label: string; figure: string; lines: string[] }) {
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
  const M = 64;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const fPx = Math.min(150 * k * ts, 560 / Math.max(1, figure.length * 0.6));
  const tPx = 15 * k * ts;
  const lPx = 18 * k * ts;
  const figTop = bottom - fPx * 0.86;
  const labTop = figTop - 18 * k - tPx;
  const figW = figure.length * fPx * 0.6;
  const ls = lines.filter(Boolean);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: labTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: labTop, fontFamily: SANS, fontWeight: 700, fontSize: tPx, letterSpacing: "0.26em", lineHeight: 1, opacity: 0.9 }}>{label}</div>
      <div style={{ position: "absolute", left: M - 4, top: figTop - fPx * 0.1, fontFamily: MONO, fontWeight: 700, fontSize: fPx, letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>{figure}</div>
      <div style={{ position: "absolute", left: M + figW + 26 * k, right: M, top: bottom - ls.length * lPx * 1.35, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.92 }}>
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

/** Natural · hora (matchday): "MATCHDAY · date" label, the kick-off time in big mono digits, Home / v Away beside it (exact names). */
export function Natkickoff({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const label = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase()].filter(Boolean).join("  ·  ");
  return <NatKickoffFrame data={data} label={label} figure={fx.time || fx.date} lines={[fx.homeName, `v ${fx.awayName}`, fx.ptTime].filter(Boolean)} />;
}

/** Natural goal · hora: "GOAL" label, the date in big mono digits, his name and his club's exact name beside it. No score. */
export function Goalnatkickoff({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatKickoffFrame data={data} label={(data.content.kicker || "GOAL").toUpperCase()} figure={fx.date || "GOAL"} lines={[name, ourClub(data)]} />;
}
