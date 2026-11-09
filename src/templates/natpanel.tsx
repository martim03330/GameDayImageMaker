/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/** Relative luminance 0..1 of a #rrggbb colour. */
export function lum(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0.2;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** The panel's colour: the club's main colour, or its accent when that one is near-white / near-black. */
export function panelColour(primary?: string, accent?: string): string {
  const ok = (c?: string) => !!c && lum(c) > 0.025 && lum(c) < 0.7;
  return ok(primary) ? primary! : ok(accent) ? accent! : "#23402f";
}

/**
 * The shared frame of the "panel" natural looks (reference: the Celtics "AT" Raptors poster — a band of solid
 * club colour across a real photo): his real photo in the upper part, untouched, and a solid band of his
 * club's colour across the lower part. At the band's top edge a thin line of tiny repeated words; in the band,
 * centred, the content (crests, kick-off pill, venue — or GOAL and his name) and the NEYOD logo.
 */
export function NatPanelFrame({ data, ticker, children }: { data: RenderData; ticker: string; children: (ink: string, k: number) => ReactNode }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const bg = panelColour(params.primary, params.accent);
  const ink = lum(bg) > 0.45 ? "#111111" : "#ffffff";
  // The band: the lower ~40% (story: from ~58% down to the safe area's foot, then the colour runs on).
  const bandTop = story ? 1080 : 830;
  const fs = story ? 220 : 160;
  const fx0 = params.side === "left" ? 440 : params.side === "right" ? 640 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.min(bandTop - fs * 2.4, story ? 640 : 400), fs });
  const tick = `${ticker}   ·   `.repeat(12);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: bg }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: bandTop, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={H} />
        <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      </div>
      {/* The band's top edge: a thin rule and a run of tiny repeated words, as in the reference. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, height: 36 * k, borderTop: `1px solid ${ink}33`, borderBottom: `1px solid ${ink}33`, overflow: "hidden" }}>
        <div data-bleed style={{ position: "absolute", left: -40, top: 11 * k, fontFamily: MONO, fontWeight: 500, fontSize: 12 * k, letterSpacing: "0.28em", color: ink, opacity: 0.55, whiteSpace: "nowrap" }}>
          {tick}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop + 36 * k, bottom: story ? H - STORY_BOTTOM : 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 * k, color: ink }}>
        {children(ink, k)}
        <AgencyLogo data={data} height={24} onLight={ink === "#111111"} style={{ transform: `scale(${params.logoScale ?? 1})`, marginTop: 6 * k - (params.logoY ?? 0) }} />
      </div>
    </div>
  );
}

const crestBox = (src: string | null, size: number) =>
  src ? <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.25))" }} /> : <div style={{ width: size, height: size }} />;

/**
 * Natural · painel (matchday): his real photo untouched in the upper part, a solid band of his club's colour
 * across the lower part (a thin run of tiny repeated words on its edge). In the band, centred: home crest,
 * a small "V" in a ring, away crest; a pill with the kick-off and the date; HOME V AWAY and the venue in tiny
 * tracked caps (exact names, home first); the NEYOD logo.
 */
export function Natpanel({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const ts = data.params.textScale ?? 1;
  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  const names = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  V  ${fx.awayName.toUpperCase()}` : "";
  return (
    <NatPanelFrame data={data} ticker={[kicker, fx.homeName.toUpperCase(), fx.awayName.toUpperCase()].filter(Boolean).join("   ·   ")}>
      {(ink, k) => (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 28 * k }}>
            {crestBox(fx.homeCrest, 96 * k)}
            <div style={{ width: 54 * k, height: 54 * k, borderRadius: "50%", border: `2px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 20 * k }}>V</div>
            {crestBox(fx.awayCrest, 96 * k)}
          </div>
          {(fx.time || fx.date) && (
            <div style={{ border: `2px solid ${ink}`, borderRadius: 999, padding: `${8 * k}px ${22 * k}px`, fontFamily: SANS, fontWeight: 700, fontSize: 22 * k * ts, letterSpacing: "0.06em", lineHeight: 1 }}>
              {[fx.kickoff, fx.date].filter(Boolean).join("  ·  ")}
            </div>
          )}
          <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 600, letterSpacing: "0.2em", lineHeight: 1.6, fontSize: Math.min(15 * k * ts, 900 / Math.max(1, capsEm(names, 0.2))) }}>
            <div>{names}</div>
            {fx.venue && <div style={{ opacity: 0.8 }}>{fx.venue.toUpperCase()}</div>}
          </div>
        </>
      )}
    </NatPanelFrame>
  );
}

/**
 * Natural goal · painel: his real celebration photo untouched in the upper part, a solid band of his club's
 * colour below. In the band, centred: his club's crest, "GOAL" in bold tracked caps, his full name and his
 * club's exact name in tiny caps, the NEYOD logo. No score.
 */
export function Goalnatpanel({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const ts = data.params.textScale ?? 1;
  const club = ourClub(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  return (
    <NatPanelFrame data={data} ticker={[word, name, club.toUpperCase()].filter(Boolean).join("   ·   ")}>
      {(_ink, k) => (
        <>
          {crestBox(crest, 88 * k)}
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: Math.min(64 * k * ts, 880 / Math.max(1, capsEm(word, 0.3))), letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1 }}>{word}</div>
          <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 600, letterSpacing: "0.2em", lineHeight: 1.6, fontSize: Math.min(16 * k * ts, 900 / Math.max(1, capsEm(name, 0.2))) }}>
            <div>{name}</div>
            <div style={{ opacity: 0.8 }}>{club.toUpperCase()}</div>
          </div>
        </>
      )}
    </NatPanelFrame>
  );
}
