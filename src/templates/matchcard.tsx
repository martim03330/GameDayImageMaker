/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#141414";

/**
 * Cartão de jogo (matchday; trend: the minimal "match card" of 2026 fixture graphics — two team slots, the
 * kick-off with the local time-zone note, the ground, nothing else): his real photo full-bleed and, at the
 * foot, one white rounded card. Home crest and exact name left, away right, the kick-off big in the middle
 * (Portugal's time under it when the club plays abroad); a hairline, then competition · round · venue.
 * The NEYOD logo on top.
 */
export function Matchcard({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 48;
  const fx = natFixture(data);
  const f = matchFacts(data);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 450 : 630, fy: story ? 640 : 430, fs: story ? 220 : 150 });
  const ink = panelColour(params.primary, params.accent);

  const cardW = CANVAS_W - 2 * M;
  const pad = 28 * k;
  const slotW = (cardW - 2 * pad - 210 * k) / 2;
  const crest = 64 * k;
  const nameSize = (n: string) => Math.min(17 * k * ts, slotW / Math.max(1, capsEm(n.toUpperCase(), 0.06)));
  const foot = [f.comp, f.round, fx.venue].filter(Boolean).join("  ·  ");
  const footPx = Math.min(13 * k * ts, (cardW - 2 * pad) / Math.max(1, capsEm(foot, 0.14)));
  const cardH = pad * 2 + crest + 14 * k + 20 * k + (foot ? 26 * k + footPx : 0);
  const bottom = (story ? STORY_BOTTOM : H - 44) - (params.textY ?? 0);
  const cardTop = bottom - cardH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);

  const slot = (name: string, crestUrl: string | null) => (
    <div style={{ width: slotW, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
      {crestUrl ? <img src={crestUrl} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} /> : <div style={{ height: crest }} />}
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nameSize(name), letterSpacing: "0.06em", lineHeight: 1.15, whiteSpace: "nowrap" }}>{name.toUpperCase()}</div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#24301f" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + 240, background: "linear-gradient(to bottom, rgba(0,0,0,.32), rgba(0,0,0,0))" }} />

      <div style={{ position: "absolute", left: M, top: cardTop, width: cardW, height: cardH, background: "#fbfaf7", color: INK, borderRadius: 22 * k, boxShadow: "0 14px 40px rgba(0,0,0,.3)", padding: pad, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {slot(fx.homeName, fx.homeCrest)}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 * k }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12 * k, letterSpacing: "0.22em", color: ink }}>{(data.content.kicker || "Matchday").toUpperCase()}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44 * k * ts, letterSpacing: "-0.01em", lineHeight: 1.1, marginTop: 6 * k }}>{fx.time || "—"}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13 * k, letterSpacing: "0.14em", opacity: 0.6, marginTop: 4 * k }}>{[fx.date, fx.ptTime].filter(Boolean).join(" · ")}</div>
          </div>
          {slot(fx.awayName, fx.awayCrest)}
        </div>
        {foot && (
          <>
            <div style={{ height: 1, background: INK, opacity: 0.14, marginTop: 20 * k }} />
            <div style={{ marginTop: 14 * k, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: footPx, letterSpacing: "0.14em", lineHeight: 1, opacity: 0.7, whiteSpace: "nowrap" }}>{foot}</div>
          </>
        )}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
