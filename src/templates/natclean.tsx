/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · clean photo (matchday): his own match photo almost exactly as it is — real grass, stands and
 * light, only the light grade — and nothing big over it. The NEYOD logo small at the top centre; at the foot,
 * over the gentlest local shade, one refined fixture block: "MATCHDAY" as a tiny spaced tag between two
 * hairlines, the crests either side of HOME v AWAY (exact names), then date · kick-off (+PT) · venue.
 */
export function Natclean({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 450 : params.side === "right" ? 630 : 540,
    fy: story ? 720 : 470,
    fs: story ? 170 : 125,
  });

  /* ---- the foot, bottom-up ---- */
  const fx = natFixture(data);
  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 54) - (params.textY ?? 0);
  const lineSize = Math.min(14 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(fx.line, 0.22)));
  const lineTop = bottom - lineSize;
  const crest = Math.round(36 * k);
  const gap = 18 * k;
  const fixture = `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}`;
  const fixSize = Math.min(19 * k * ts, (CANVAS_W - 140 - 2 * (crest + gap)) / Math.max(1, capsEm(fixture, 0.1)));
  const rowTop = (fx.line ? lineTop - 20 * k : bottom) - crest;
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const tagSize = 12 * k * ts;
  const tagTop = rowTop - 22 * k - tagSize;
  const shadeTop = tagTop - (story ? 260 : 200);

  const logoTop = (story ? STORY_TOP : 44) - (params.logoY ?? 0);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The gentlest local shades: a halo behind the logo, a low fade under the fixture. */}
      <div style={{ position: "absolute", left: "50%", top: logoTop - 140 * k, width: 640 * k, height: 380 * k, transform: "translateX(-50%)", background: "radial-gradient(closest-side, rgba(0,0,0,.26), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.3) 45%, rgba(5,8,5,.5))" }} />
      {/* A soft pool right under the type, so it reads even where his boots or the ball cross it. */}
      <div style={{ position: "absolute", left: "50%", top: (tagTop + bottom) / 2 - (bottom - tagTop + 150 * k) / 2, width: CANVAS_W * 1.05, height: bottom - tagTop + 150 * k, transform: "translateX(-50%)", background: "radial-gradient(closest-side, rgba(5,8,5,.42), rgba(5,8,5,.3) 55%, rgba(5,8,5,0))" }} />

      {/* The tag: tiny spaced caps between hairlines. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: tagTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k, textShadow: "0 1px 3px rgba(0,0,0,.5), 0 0 12px rgba(0,0,0,.35)" }}>
        <div style={{ width: 34 * k, height: 1.5 * k, background: OFF_WHITE, opacity: 0.7 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tagSize, lineHeight: 1, letterSpacing: "0.5em", paddingLeft: "0.5em", whiteSpace: "nowrap", opacity: 0.92 }}>{kicker}</div>
        <div style={{ width: 34 * k, height: 1.5 * k, background: OFF_WHITE, opacity: 0.7 }} />
      </div>

      {/* The fixture. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap }}>
        {crestImg(fx.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, lineHeight: 1, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,.55), 0 0 14px rgba(0,0,0,.4)" }}>
          {fx.homeName.toUpperCase()}
          <span style={{ fontWeight: 400, opacity: 0.7, margin: "0 0.5em" }}>v</span>
          {fx.awayName.toUpperCase()}
        </div>
        {crestImg(fx.awayCrest)}
      </div>
      {fx.line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.22em", paddingLeft: "0.22em", whiteSpace: "nowrap", opacity: 0.86, textShadow: "0 1px 3px rgba(0,0,0,.6), 0 0 12px rgba(0,0,0,.4)" }}>
          {fx.line}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
