/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const DMSERIF = "var(--font-dmserif), Georgia, serif";
const GOLD = "linear-gradient(180deg, #f3e3bf 0%, #d6b678 55%, #b8904a 100%)";
const SHADOW = "0 2px 4px rgba(0,0,0,.5), 0 4px 26px rgba(0,0,0,.45)";

/**
 * The shared frame of the "moody" natural looks (reference: the dark "Gameday" Celtics poster, a coloured
 * light grazing the player): his real photo sunk into shadow around him (NatSpot) with a soft wash of his
 * club's colour coming from the side away from him, he large and sharp. At the foot on that side: one big
 * word in DM Serif with a pale gold fill, the crests small beside two tiny tracked lines. NEYOD logo under.
 */
export function NatMoodyFrame({ data, word, crests, lines }: { data: RenderData; word: string; crests: (string | null)[]; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 72 : 60;
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 430 : 650, fy: story ? 620 : 420, fs: story ? 250 : 190 });
  const colour = panelColour(params.primary, params.accent);
  const align = heLeft ? "right" : "left";

  const footY = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const maxW = CANVAS_W - 2 * M;
  // DM Serif lowercase runs ~0.5em a letter.
  const wPx = Math.min(150 * k * ts, (maxW * 0.8) / Math.max(1, word.length * 0.5));
  const lPx = (t: string) => Math.min(17 * k * ts, (maxW * 0.62) / Math.max(1, capsEm(t, 0.16)));
  const rowH = 48 * k;
  const rowTop = footY - logoH - 34 * k - rowH;
  const wTop = rowTop - 18 * k - wPx * 0.98;
  const side = { position: "absolute" as const, left: M, width: maxW, textAlign: align as "left" | "right" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0b0f0c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "brightness(.78) saturate(.9) contrast(1.08)" }} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.55} color="#05070a" />
      {/* The coloured light from the side away from him, on the ground only. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at ${heLeft ? "105%" : "-5%"} 30%, ${colour}, transparent 70%)`, mixBlendMode: "screen", opacity: 0.55 }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 560 : 440, background: "linear-gradient(to top, rgba(4,6,5,.82), rgba(4,6,5,.4) 55%, rgba(4,6,5,0))" }} />

      <div
        style={{
          ...side,
          top: wTop,
          fontFamily: DMSERIF,
          fontSize: wPx,
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          whiteSpace: "nowrap",
          background: GOLD,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 3px 14px rgba(0,0,0,.55))",
        }}
      >
        {word}
      </div>
      <div style={{ ...side, top: rowTop, height: rowH, display: "flex", flexDirection: heLeft ? "row-reverse" : "row", alignItems: "center", gap: 16 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ height: rowH, width: rowH, objectFit: "contain", filter: "grayscale(.15) drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
        ))}
        <div style={{ textAlign: align, fontFamily: SANS, fontWeight: 700, letterSpacing: "0.16em", lineHeight: 1.45, textShadow: SHADOW, marginLeft: heLeft ? 0 : 6 * k, marginRight: heLeft ? 6 * k : 0 }}>
          {lines.filter(Boolean).map((t) => (
            <div key={t} style={{ fontSize: lPx(t), whiteSpace: "nowrap" }}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: heLeft ? CANVAS_W - M - logoW : M, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: heLeft ? "right top" : "left top" }}
      />
    </div>
  );
}

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Natural · sombrio (matchday): his real photo sunk in shadow around him, a soft wash of his club's colour
 * from the side, he large and sharp. At the foot: "Matchday" big in gold DM Serif, both crests small, and
 * COMPETITION · MATCHDAY N / kick-off | date in tiny tracked caps. NEYOD logo under.
 */
export function Natmoody({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  return (
    <NatMoodyFrame
      data={data}
      word={sentence(data.content.kicker || "Matchday")}
      crests={[fx.homeCrest, fx.awayCrest]}
      lines={[[f.comp, f.round].filter(Boolean).join(" · "), [fx.kickoff, fx.date].filter(Boolean).join("  |  ")]}
    />
  );
}

/**
 * Natural goal · sombrio: his real celebration photo sunk in shadow around him with his club's colour from
 * the side. At the foot: "Goal" big in gold DM Serif, his club's crest small, his full name and the club's
 * exact name in tiny tracked caps. No score.
 */
export function Goalnatmoody({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatMoodyFrame data={data} word={sentence(data.content.kicker || "Goal")} crests={[crest]} lines={[name, ourClub(data).toUpperCase()]} />;
}
