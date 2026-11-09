/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, BEBAS, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const GOLD = "linear-gradient(180deg, #fff3a6 0%, #ffd23f 45%, #e8a312 100%)";
const SHADOW = "0 1px 3px rgba(0,0,0,.55), 0 2px 16px rgba(0,0,0,.45)";

/**
 * The shared frame of the "tall" natural looks (reference: the Sabres "GAME 2" playoff poster — a huge tall
 * condensed title in gold over the lower half): his real photo with a soft wash of his club's colour rising
 * from the foot; in the lower half one huge word in Bebas stretched taller (scaleY), gold, under a tiny
 * tracked line; under it the crests (or his name) and one more tiny line. The NEYOD logo at the foot.
 */
export function NatTallFrame({ data, over, word, crests, under, lineBelow }: { data: RenderData; over: string; word: string; crests: (string | null)[]; under: string; lineBelow: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const colour = panelColour(params.primary, params.accent);
  const fs = story ? 210 : 150;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 470 : 300, fs });
  const STRETCH = 1.45;
  // Bebas ~0.42em a letter (width is not stretched).
  const wPx = Math.min(210 * k * ts, (CANVAS_W * 0.86) / Math.max(1, word.length * 0.42));
  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const smallPx = (t: string) => Math.min(16 * k * ts, (CANVAS_W * 0.8) / Math.max(1, capsEm(t, 0.2)));
  const crestH = 58 * k;
  const belowTop = footY - logoH - 30 * k - smallPx(lineBelow);
  const rowTop = belowTop - 18 * k - crestH;
  const wordBottom = rowTop - 22 * k;
  const wordH = wPx * 0.86 * STRETCH;
  const wordTop = wordBottom - wordH;
  const overTop = wordTop - 18 * k - smallPx(over);
  // Never over his face: the title block starts below his chin.
  const centred = { position: "absolute" as const, left: 0, width: CANVAS_W, textAlign: "center" as const, whiteSpace: "nowrap" as const, lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: colour, color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: Math.max(place.fy + place.fs, overTop - 200 * k), bottom: 0, background: `linear-gradient(to bottom, ${colour}00, ${colour}cc 40%, ${colour}f2)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - overTop + 120, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.28))" }} />

      {over && <div style={{ ...centred, top: overTop, paddingLeft: "0.2em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 800, fontSize: smallPx(over), letterSpacing: "0.2em", textShadow: SHADOW }}>{over}</div>}
      <div style={{ ...centred, top: wordTop, height: wordH, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: BEBAS,
            fontSize: wPx,
            letterSpacing: "0.01em",
            transform: `scaleY(${STRETCH})`,
            background: GOLD,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 4px 0 rgba(0,0,0,.25)) drop-shadow(0 8px 24px rgba(0,0,0,.4))",
          }}
        >
          {word}
        </span>
      </div>
      <div style={{ ...centred, top: rowTop, height: crestH, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        {crests.filter(Boolean).map((c, i, a) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
            <img src={c!} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />
            {a.length > 1 && i === 0 && <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16 * k, letterSpacing: "0.1em" }}>VS</span>}
          </span>
        ))}
        {under && <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: smallPx(under) * 1.15, letterSpacing: "0.14em", textShadow: SHADOW }}>{under}</span>}
      </div>
      {lineBelow && <div style={{ ...centred, top: belowTop, paddingLeft: "0.2em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 700, fontSize: smallPx(lineBelow), letterSpacing: "0.2em", textShadow: SHADOW }}>{lineBelow}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · alto (matchday): his real photo with his club's colour rising from the foot; COMPETITION |
 * MATCHDAY N tiny, then "MATCHDAY" huge in tall gold Bebas, the crests with "VS" (home first), kick-off |
 * venue tiny. NEYOD logo at the foot.
 */
export function Nattall({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  return (
    <NatTallFrame
      data={data}
      over={[f.comp, f.round].filter(Boolean).join("  |  ")}
      word={(data.content.kicker || "Matchday").toUpperCase()}
      crests={[fx.homeCrest, fx.awayCrest]}
      under=""
      lineBelow={[fx.kickoff, fx.date, fx.venue].filter(Boolean).join("  |  ")}
    />
  );
}

/**
 * Natural goal · alto: his real celebration photo with his club's colour rising from the foot; his club's
 * exact name tiny, "GOAL" huge in tall gold Bebas, his crest and full name, nothing else. No score.
 */
export function Goalnattall({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatTallFrame data={data} over={ourClub(data).toUpperCase()} word={(data.content.kicker || "Goal").toUpperCase()} crests={[crest]} under={name} lineBelow="" />;
}
