/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const GOTHIC = "var(--font-gothic), 'Old English Text MT', serif";
const SHADOW = "0 3px 6px rgba(0,0,0,.45), 0 8px 34px rgba(0,0,0,.5)";

/**
 * The shared frame of the "gothic" natural looks (reference: the Duke "gameday" poster — blackletter over a
 * black-and-white crowd, a blue banner under it): his real photo with the surroundings in black-and-white
 * and sunk, he alone in colour. In the lower third, one lowercase word in big white blackletter, its foot
 * resting on a slim banner of his club's colour that holds one tiny line; a small tag under it; the NEYOD logo.
 */
export function NatGothicFrame({ data, word, line, tag }: { data: RenderData; word: string; line: string; tag: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const colour = panelColour(params.primary, params.accent);
  const fs = story ? 200 : 150;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 520 : 330, fs });
  // UnifrakturMaguntia lowercase ~0.5em a letter.
  const wPx = Math.min(190 * k * ts, (CANVAS_W * 0.86) / Math.max(1, word.length * 0.5));
  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const bandH = 50 * k;
  const tagPx = 14 * k;
  const tagTop = footY - logoH - 28 * k - tagPx - 16 * k;
  const bandTop = tagTop - 18 * k - bandH;
  // The word sits on the banner: its baseline a little inside the banner's top.
  const wordTop = bandTop - wPx * 0.78;
  const bandW = Math.min(CANVAS_W * 0.84, Math.max(word.length * 0.5 * wPx, capsEm(line, 0.16) * 15 * k + 80));
  const lPx = Math.min(15 * k * ts, (bandW - 50) / Math.max(1, capsEm(line, 0.16)));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#111", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "grayscale(1) brightness(.78) contrast(1.15)" }} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.35} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - wordTop + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55) 45%, rgba(0,0,0,.7))" }} />

      <div style={{ position: "absolute", left: (CANVAS_W - bandW) / 2, width: bandW, top: bandTop, height: bandH, background: colour, boxShadow: "0 6px 20px rgba(0,0,0,.35)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 9 * k, boxSizing: "border-box" }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.16em", paddingLeft: "0.16em", color: "#fff", whiteSpace: "nowrap" }}>{line}</span>
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wordTop, textAlign: "center", fontFamily: GOTHIC, fontSize: wPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      {tag && (
        <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: tagTop, textAlign: "center" }}>
          <span style={{ display: "inline-block", border: `1.5px solid ${OFF_WHITE}`, padding: `${5 * k}px ${12 * k}px`, fontFamily: SANS, fontWeight: 700, fontSize: tagPx * ts, letterSpacing: "0.18em", lineHeight: 1, background: "rgba(0,0,0,.35)" }}>{tag}</span>
        </div>
      )}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · gótico (matchday): his real photo, surroundings black-and-white, he in colour; "matchday" in big
 * white blackletter resting on a slim banner of his club's colour (kick-off | date | venue inside), a small
 * "V AWAY" tag (exact name) under it. NEYOD logo at the foot.
 */
export function Natgothic({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const away = data.content.home === false ? fx.homeName : fx.awayName;
  return (
    <NatGothicFrame
      data={data}
      word={(data.content.kicker || "Matchday").toLowerCase()}
      line={[fx.kickoff, fx.date, fx.venue].filter(Boolean).join("  |  ")}
      tag={away ? `V  ${away.toUpperCase()}` : ""}
    />
  );
}

/**
 * Natural goal · gótico: his real celebration photo, surroundings black-and-white; "goal" in big white
 * blackletter on a slim banner of his club's colour holding his full name, his club's exact name as a tag.
 */
export function Goalnatgothic({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatGothicFrame data={data} word={(data.content.kicker || "Goal").toLowerCase()} line={name} tag={ourClub(data).toUpperCase()} />;
}
