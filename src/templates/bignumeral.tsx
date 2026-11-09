/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { ANTON, em } from "./mist";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/**
 * The shared frame of the "big numeral" looks (trend on Dribbble's #matchday posters: one huge condensed
 * numeral used as the graphic itself, generous empty space around it): his real photo, a little darker, a
 * giant off-white numeral standing behind him — his head crosses its upper half, his face never covered —
 * a tiny tracked word on top and two small lines at the foot. The NEYOD logo centred under them.
 */
function NumeralFrame({ data, figure, word, lines }: { data: RenderData; figure: string; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 60;
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 470 : 610, fy: story ? 620 : 420, fs: story ? 210 : 145 });

  // The numeral: as tall as fits between the word on top and the lines at the foot, as wide as the canvas allows
  // (Anton digits measured a little wider than the table: 58 per digit).
  const nEm = Math.max(0.3, em(figure, ANTON, 58) - 0.02 * [...figure].length);
  const capFrac = 0.86;
  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoTop = bottom - (story ? 88 : 52) - (params.logoY ?? 0);
  const lPx = (l: string) => Math.min(18 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(l, 0.14)));
  const linesTop = logoTop - 44 * k - lines.length * 18 * k * 1.7;
  const wordTop = (story ? STORY_TOP : 48) - (params.textY ?? 0);
  const roomH = linesTop - 40 * k - (wordTop + 60 * k);
  const size = Math.min(roomH / capFrac, (CANVAS_W - 2 * M) / nEm) * ts;
  // Sits on the line block; its top half behind his head and shoulders.
  const numTop = linesTop - 40 * k - size * (capFrac + 0.07);
  const wPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(word, 0.4)));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1d2419", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "contrast(1.05) saturate(.95) brightness(.8)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: numTop, textAlign: "center", fontFamily: DISPLAY, fontSize: size, lineHeight: 1, letterSpacing: "-0.02em", color: OFF_WHITE, opacity: 0.94, whiteSpace: "nowrap" }}>{figure}</div>
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: wordTop + 160, background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: linesTop - 120 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.5))" }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", paddingLeft: "0.4em", fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.4em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: linesTop, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k }}>
        {lines.filter(Boolean).map((l, i) => (
          <div key={l} style={{ fontFamily: SANS, fontWeight: i ? 600 : 800, fontSize: lPx(l) * (i ? 0.82 : 1), letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", opacity: i ? 0.85 : 1, textShadow: SHADOW }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Número gigante (matchday): the round's number huge ("14"), MATCHDAY on top, HOME v AWAY and date · kick-off · venue at the foot. */
export function Bignumeral({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  // No round number: the day of the month carries the graphic instead.
  const figure = f.roundNo || fx.date.split(" ")[0] || "MD";
  return (
    <NumeralFrame
      data={data}
      figure={figure}
      word={f.roundNo ? kicker : [kicker, fx.date].filter(Boolean).join(" · ").toUpperCase()}
      lines={[fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : "", [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase()]}
    />
  );
}

/** Número da camisola (goal): his shirt number huge behind his celebration, GOAL on top, his name and his club's exact name at the foot. */
export function Goalshirtno({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const figure = (data.player.number || "").replace(/\D/g, "") || "GOAL";
  return <NumeralFrame data={data} figure={figure} word={(data.content.kicker || "Goal").toUpperCase()} lines={[name, ourClub(data).toUpperCase()]} />;
}
