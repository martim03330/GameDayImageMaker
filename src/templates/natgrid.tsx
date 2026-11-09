/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 1px 2px rgba(0,0,0,.45), 0 1px 10px rgba(0,0,0,.3)";

/**
 * The shared frame of the "grid" natural looks (reference: the Greenwood "mason · 41' 58' · greenwood" poster —
 * a club-colour sky over the player, three tiny lowercase captions in a row at the top and at the foot):
 * his real photo with his club's colour washing down from the top over the ground only (he is redrawn
 * untouched on top), and two rows of three tiny lowercase captions — left aligned, centred, right aligned —
 * at the top and above the NEYOD logo at the foot.
 */
export function NatGridFrame({ data, top, bottom }: { data: RenderData; top: [string, string, string]; bottom: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 80 : 72;
  const colour = panelColour(params.primary, params.accent);
  const fs = story ? 200 : 150;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 640 : 470, fs });
  const px = 19 * k * ts;
  const topY = (story ? STORY_TOP : 70) - (params.textY ?? 0);
  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const bottomY = footY - logoH - 34 * k - px;
  const row = (cells: string[], y: number) =>
    cells.map((t, i) =>
      t ? (
        <div
          key={i + t}
          style={{
            position: "absolute",
            top: y,
            left: M,
            width: CANVAS_W - 2 * M,
            textAlign: (["left", "center", "right"] as const)[i],
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: px,
            letterSpacing: "0.01em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: OFF_WHITE,
            textShadow: SHADOW,
          }}
        >
          {t}
        </div>
      ) : null,
    );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: colour }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {/* The club's colour washing down from the top, on the ground only. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${colour} 0%, ${colour}d9 22%, ${colour}66 48%, ${colour}00 72%)` }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 340 : 240, background: "linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      {row(top, topY)}
      {row(bottom, bottomY)}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

const low = (s: string) => s.toLowerCase();

/**
 * Natural · grelha (matchday): his real photo under a wash of his club's colour from the top; at the top three
 * tiny lowercase captions — home · kick-off · away (exact names, home first) — and at the foot date ·
 * competition · matchday N. NEYOD logo at the foot.
 */
export function Natgrid({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  return <NatGridFrame data={data} top={[low(fx.homeName), fx.kickoff, low(fx.awayName)]} bottom={[low(fx.date), low(f.comp), low(f.round || data.content.kicker || "matchday")]} />;
}

/**
 * Natural goal · grelha: his real celebration photo under a wash of his club's colour; at the top his first
 * name · "goal" · his last name, at the foot his club's exact name · competition, tiny lowercase. No score.
 */
export function Goalnatgrid({ data }: { data: RenderData }) {
  const { content } = data;
  const f = matchFacts(data);
  return <NatGridFrame data={data} top={[low(content.firstName || ""), low(content.kicker || "goal"), low(content.lastName || "")]} bottom={[low(ourClub(data)), low(f.comp), ""]} />;
}
