/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const HEAVY = "var(--font-archivo-black), 'Arial Black', sans-serif";

/**
 * The shared frame of the "fight night" natural looks (reference: the UFC "HALL / STRICKLAND" poster): his
 * real photo, untouched, his face in the upper part; across the lower half two stacked bands — the first in
 * his club's colour with a huge white heavy word, a tiny tracked line between, the second white with a huge
 * word in the club's colour. A small black box at the foot with the date and kick-off; the NEYOD logo opposite.
 */
export function NatFightFrame({ data, top, mid, bottom, tag }: { data: RenderData; top: string; mid: string; bottom: string; tag: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const colour = panelColour(params.primary, params.accent);
  const maxW = CANVAS_W - 2 * 40;
  // Archivo Black caps ~0.82em a letter: each band word as big as its band allows.
  const size = (t: string, max: number) => Math.min(max * k * ts, maxW / Math.max(1, t.length * 0.82));
  const p1 = size(top, 200);
  const p2 = size(bottom, 150);
  const midPx = Math.min(16 * k, maxW / Math.max(1, capsEm(mid, 0.3)));
  const b1H = p1 * 0.98;
  const b2H = p2 * 1.02;
  const footY = (story ? STORY_BOTTOM : H - 44) - (params.textY ?? 0);
  const tagH = 74 * k;
  const b2Top = footY - tagH - 40 * k - b2H;
  const midTop = b2Top - midPx - 12 * k;
  const b1Top = midTop - 12 * k - b1H;
  const fs = story ? 230 : 172;
  const fx0 = params.side === "left" ? 440 : params.side === "right" ? 640 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.min(b1Top - fs * 1.15, story ? 560 : 400), fs });
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const band = (t: string, y: number, h: number, px: number, bg: string, fg: string) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: h, background: bg, overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,.25)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: (h - px * 0.74) / 2 - px * 0.12, textAlign: "center", fontFamily: HEAVY, fontSize: px, lineHeight: 1, letterSpacing: "-0.01em", color: fg, whiteSpace: "nowrap" }}>{t}</div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#111" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: b1Top - 120, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35) 120px, rgba(0,0,0,.5))" }} />
      {band(top, b1Top, b1H, p1, colour, "#ffffff")}
      <div style={{ position: "absolute", left: 0, right: 0, top: midTop, textAlign: "center", paddingLeft: "0.3em", fontFamily: SANS, fontWeight: 800, fontSize: midPx, letterSpacing: "0.3em", color: "#fff", lineHeight: 1, textShadow: "0 1px 6px rgba(0,0,0,.6)" }}>{mid}</div>
      {band(bottom, b2Top, b2H, p2, "#f5f5f2", colour)}
      <div style={{ position: "absolute", left: 40, top: footY - tagH, height: tagH, padding: `0 ${18 * k}px`, background: "#0d0d0d", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: CONDENSED, fontWeight: 800, lineHeight: 1.05, letterSpacing: "0.02em" }}>
        {tag.filter(Boolean).map((t, i) => (
          <div key={t} style={{ fontSize: (i ? 22 : 30) * k * ts }}>
            {t}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: CANVAS_W - 40 - logoW, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }} />
    </div>
  );
}

/**
 * Natural · combate (matchday): his real photo untouched above; across the lower half a band of his club's
 * colour with the HOME name huge in white heavy caps, "MATCHDAY · COMPETITION" tiny between, a white band
 * with the AWAY name huge in the club's colour (exact names, home first). A black box with the date and
 * kick-off at the foot, the NEYOD logo opposite.
 */
export function Natfight({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  return <NatFightFrame data={data} top={fx.homeName.toUpperCase()} mid={[kicker, f.comp].filter(Boolean).join("  ·  ")} bottom={fx.awayName.toUpperCase()} tag={[fx.date, fx.kickoff]} />;
}

/**
 * Natural goal · combate: his real celebration photo untouched above; a club-colour band with "GOAL" huge in
 * white, his first name tiny between, a white band with his last name huge in the club's colour. A black box
 * with his club's exact name at the foot, the NEYOD logo opposite. No score.
 */
export function Goalnatfight({ data }: { data: RenderData }) {
  const { content } = data;
  return (
    <NatFightFrame
      data={data}
      top={(content.kicker || "Goal").toUpperCase()}
      mid={(content.firstName || "").toUpperCase()}
      bottom={(content.lastName || content.firstName || "").toUpperCase()}
      tag={[ourClub(data).toUpperCase()]}
    />
  );
}
