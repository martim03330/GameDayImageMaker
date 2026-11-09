import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "dot" natural looks (Swiss, lowercase): his real photo full-bleed; at the foot-left
 * a solid dot in his club's accent, then the word in big lowercase bold Inter with a full stop, and under it
 * two lines in regular lowercase. The NEYOD logo alone at the top. A soft shade only under the text.
 */
function NatDotFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: story ? 680 : 500,
    fs: story ? 240 : 150,
  });
  const M = 64;
  const wPx = Math.min(110 * k * ts, (CANVAS_W - 2 * M - 60 * k) / Math.max(1, word.length * 0.56));
  const lPx = 22 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const ls = lines.filter(Boolean);
  const linesTop = bottom - ls.length * lPx * 1.3;
  const wTop = linesTop - 18 * k - wPx;
  const D = 30 * k;
  const accent = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.62))" }} />
      <div style={{ position: "absolute", left: M, top: wTop + wPx * 0.32, width: D, height: D, borderRadius: "50%", background: accent, boxShadow: "0 0 0 3px rgba(255,255,255,.9)" }} />
      <div style={{ position: "absolute", left: M + D + 22 * k, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.045em", whiteSpace: "nowrap" }}>{word}.</div>
      <div style={{ position: "absolute", left: M + D + 24 * k, right: M, top: linesTop, fontFamily: SANS, fontWeight: 400, fontSize: lPx, lineHeight: 1.3, opacity: 0.92 }}>
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

/** Natural · ponto (matchday): "● matchday." then "home v away" and "date · time · venue" in lowercase (names as stored). */
export function Natdot({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatDotFrame data={data} word={(data.content.kicker || "matchday").toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date.toLowerCase(), fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · ponto: "● goal." over his celebration photo, his name and his club's exact name under it. No score. */
export function Goalnatdot({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDotFrame data={data} word={(data.content.kicker || "goal").toLowerCase()} lines={[name, ourClub(data)]} />;
}
