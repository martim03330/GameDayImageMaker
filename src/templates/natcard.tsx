/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const HEAVY = "var(--font-archivo-black), 'Arial Black', sans-serif";

export type CardBox = { label: string; value: string };

/**
 * The shared frame of the "card" natural looks (reference: the "TREVOR ETIENNE · ROUND 04 PICK 114" draft
 * card): his real photo, untouched; low on the side away from him a dark card — a row of small boxes in his
 * club's colour (tiny label over a bold value), his name huge in two lines of heavy white caps, and one line
 * in a club-colour bar under it. The NEYOD logo under the card.
 */
export function NatCardFrame({ data, boxes, name, bar }: { data: RenderData; boxes: CardBox[]; name: [string, string]; bar: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 64 : 54;
  const colour = panelColour(params.primary, params.accent);
  const heLeft = params.side === "left";
  const fs = story ? 220 : 165;
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 560 : 380, fs });
  const cardW = Math.min(560 * k, CANVAS_W - 2 * M);
  const pad = 26 * k;
  const inner = cardW - 2 * pad;
  // Archivo Black caps ~0.8em a letter; both lines one size.
  const longest = Math.max(1, ...name.map((n) => n.length));
  const nPx = Math.min(86 * k * ts, inner / (longest * 0.8));
  const boxH = 64 * k;
  const barPx = 18 * k * ts;
  const cardH = pad + boxH + 22 * k + name.filter(Boolean).length * nPx * 0.95 + 20 * k + barPx + 22 * k + pad;
  const footY = (story ? STORY_BOTTOM : H - 44) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const cardTop = footY - logoH - 24 * k - cardH;
  const cardX = heLeft ? CANVAS_W - M - cardW : M;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#151515", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - cardTop + 120, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.4))" }} />

      <div style={{ position: "absolute", left: cardX, top: cardTop, width: cardW, height: cardH, background: "rgba(18,18,18,.86)", boxShadow: "0 10px 40px rgba(0,0,0,.4)", padding: pad, boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 8 * k, height: boxH }}>
          {boxes.map((b) => (
            <div key={b.label} style={{ background: colour, padding: `${8 * k}px ${14 * k}px`, display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11 * k, letterSpacing: "0.16em", opacity: 0.9 }}>{b.label}</div>
              <div style={{ fontFamily: HEAVY, fontSize: 28 * k * ts, marginTop: 6 * k, whiteSpace: "nowrap" }}>{b.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22 * k }}>
          {name.filter(Boolean).map((n) => (
            <div key={n} style={{ fontFamily: HEAVY, fontSize: nPx, lineHeight: 0.95, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              {n}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20 * k, display: "inline-block", background: colour, padding: `${5 * k}px ${12 * k}px`, fontFamily: SANS, fontWeight: 800, fontSize: barPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", maxWidth: inner, overflow: "hidden" }}>{bar}</div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: heLeft ? CANVAS_W - M - logoW : M, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: heLeft ? "right top" : "left top" }} />
    </div>
  );
}

/**
 * Natural · cartão (matchday): his real photo; low on the free side a dark card: boxes in his club's colour
 * (DATE / KICK-OFF / MATCHDAY), his first and last name huge in heavy white caps, and "V AWAY" (exact name)
 * in a club-colour bar. NEYOD logo under the card.
 */
export function Natcard({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  const away = data.content.home === false ? fx.homeName : fx.awayName;
  const boxes: CardBox[] = [
    fx.date && { label: "DATE", value: fx.date },
    fx.time && { label: "KICK-OFF", value: fx.kickoff },
    f.roundNo && { label: (data.content.kicker || "Matchday").toUpperCase(), value: f.roundNo },
  ].filter(Boolean) as CardBox[];
  return <NatCardFrame data={data} boxes={boxes} name={[(data.content.firstName || "").toUpperCase(), (data.content.lastName || "").toUpperCase()]} bar={away ? `V ${away.toUpperCase()}` : (data.content.kicker || "Matchday").toUpperCase()} />;
}

/**
 * Natural goal · cartão: his real celebration photo; a dark card with a "GOAL" box in his club's colour, his
 * name huge in heavy white caps and his club's exact name in a club-colour bar. No score.
 */
export function Goalnatcard({ data }: { data: RenderData }) {
  return (
    <NatCardFrame
      data={data}
      boxes={[{ label: "MOMENT", value: (data.content.kicker || "Goal").toUpperCase() }]}
      name={[(data.content.firstName || "").toUpperCase(), (data.content.lastName || "").toUpperCase()]}
      bar={ourClub(data).toUpperCase()}
    />
  );
}
