/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Golo · grafismo TV (trend: broadcast-graphics energy in 2026 goal posts — the TV lower third): his real
 * celebration photo full-bleed, untouched, and low on it a clean lower third: a square of his club's colour
 * with the crest, a white bar with GOAL in the club colour and his name in bold, and under it a thin dark
 * strip with his club's exact name. The NEYOD logo on top.
 */
export function Goallowerthird({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 48;
  const fx = natFixture(data);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 460 : 620, fy: story ? 620 : 420, fs: story ? 230 : 160 });
  const ink = panelColour(params.primary, params.accent);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();

  const sq = 112 * k;
  const barW = CANVAS_W - 2 * M - sq;
  const nPx = Math.min(40 * k * ts, (barW - 56 * k) / Math.max(1, capsEm(name, 0.02)));
  const cPx = Math.min(15 * k * ts, (barW - 40 * k) / Math.max(1, capsEm(club, 0.2)));
  const stripH = 40 * k;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const barTop = bottom - stripH - sq;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#24301f" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + 240, background: "linear-gradient(to bottom, rgba(0,0,0,.32), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: barTop - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.3))" }} />

      <div style={{ position: "absolute", left: M, top: barTop, display: "flex", boxShadow: "0 12px 34px rgba(0,0,0,.3)" }}>
        <div style={{ width: sq, height: sq, background: ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {crest && <img src={crest} alt="" style={{ width: sq * 0.68, height: sq * 0.68, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />}
        </div>
        <div style={{ width: barW, height: sq, background: "#ffffff", color: "#121212", display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${28 * k}px`, boxSizing: "border-box", gap: 8 * k }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15 * k, letterSpacing: "0.3em", color: ink, lineHeight: 1 }}>{word}</div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: nPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{name}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: M + sq, top: barTop + sq, width: barW, height: stripH, background: "#121212", color: "#ffffff", display: "flex", alignItems: "center", padding: `0 ${28 * k}px`, boxSizing: "border-box", fontFamily: SANS, fontWeight: 700, fontSize: cPx, letterSpacing: "0.2em", whiteSpace: "nowrap" }}>
        {club}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
