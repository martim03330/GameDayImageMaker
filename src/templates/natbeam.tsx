/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatLight, NatSpot, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, BEBAS, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 20px rgba(0,0,0,.45)";

/**
 * The shared frame of the "beam" natural looks (reference: the moody "GAMEDAY" poster with a shaft of light):
 * his real photo darkened around him (NatSpot) and gently lit on him (NatLight), with one soft diagonal shaft
 * of light falling from the top corner on his side. At the top, centred and small: one word in tall Bebas
 * caps and two tiny tracked lines. Nothing else but the NEYOD logo at the foot.
 */
export function NatBeamFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const M = story ? 76 : 70;
  const maxW = CANVAS_W - 2 * M;

  const top = (story ? STORY_TOP + 10 : 84) - (params.textY ?? 0);
  // Bebas capitals are ~0.4em wide.
  const wPx = Math.min(92 * k * ts, maxW / Math.max(1, word.length * 0.42));
  const lPx = (t: string) => Math.min(16 * k * ts, maxW / Math.max(1, capsEm(t, 0.24)));
  let y = top + wPx + 14 * k;
  const placed = lines.filter(Boolean).map((t) => {
    const px = lPx(t);
    const r = { t, px, top: y };
    y += px + 10 * k;
    return r;
  });
  const fs = story ? 220 : 160;
  const fx0 = params.side === "left" ? 450 : params.side === "right" ? 630 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 720 : 520, y + 80 * k + fs * 0.85), fs });

  // The shaft comes from the top corner on HIS side and falls across him.
  const fromLeft = place.fx < CANVAS_W / 2;
  const footY = (story ? STORY_BOTTOM : H - 50) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const centred = { position: "absolute" as const, left: 0, width: CANVAS_W, textAlign: "center" as const, lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW, boxSizing: "border-box" as const };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#15171c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "saturate(.8) brightness(.9) contrast(1.06)" }} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.5} color="#0c0e14" />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <NatLight place={place} W={CANVAS_W} H={H} amount={0.08} />
      {/* The shaft of light: a soft wide band, screened (it only ever lightens), dying out towards the foot. */}
      <div
        style={{
          position: "absolute",
          left: fromLeft ? -260 : CANVAS_W - 380,
          top: -300,
          width: 640,
          height: H * 1.6,
          transform: `rotate(${fromLeft ? -24 : 24}deg)`,
          transformOrigin: "50% 0",
          background: "linear-gradient(to right, rgba(255,255,255,0), rgba(235,240,255,.22) 45%, rgba(235,240,255,.22) 55%, rgba(255,255,255,0))",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.6) 45%, transparent 80%)",
          maskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.6) 45%, transparent 80%)",
          filter: "blur(26px)",
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: y + 180 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />

      <div style={{ ...centred, top, paddingLeft: "0.03em", fontFamily: BEBAS, fontSize: wPx, letterSpacing: "0.03em" }}>{word}</div>
      {placed.map((l) => (
        <div key={l.t} style={{ ...centred, top: l.top, paddingLeft: "0.24em", fontFamily: SANS, fontWeight: 600, fontSize: l.px, letterSpacing: "0.24em", opacity: 0.88 }}>
          {l.t}
        </div>
      ))}
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · feixe (matchday): his real photo darkened around him, gently lit on him, a soft shaft of light
 * falling from the top corner across him. At the top, small and centred: "MATCHDAY" in tall Bebas caps, then
 * HOME VS AWAY (exact names, home first) and date | kick-off in tiny tracked caps. NEYOD logo alone.
 */
export function Natbeam({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  VS  ${fx.awayName.toUpperCase()}` : "";
  return <NatBeamFrame data={data} word={(data.content.kicker || "Matchday").toUpperCase()} lines={[match, [fx.date, fx.kickoff].filter(Boolean).join("  |  ")]} />;
}

/**
 * Natural goal · feixe: his real celebration photo darkened around him with a soft shaft of light across
 * him. At the top, small: "GOAL" in tall Bebas caps, his full name and his club's exact name in tiny caps.
 */
export function Goalnatbeam({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatBeamFrame data={data} word={(data.content.kicker || "Goal").toUpperCase()} lines={[name, ourClub(data).toUpperCase()]} />;
}
