/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · grass band (matchday): his own match photo, the bottom ~30% melting into a solid band whose
 * colour is the photo's own grass — a heavily blurred, stretched copy of the photo's bottom strip, so it is
 * exactly the real green (or whatever ground the photo has). On the band, in off-white: "MATCHDAY" in
 * condensed caps, HOME v AWAY with the crests, date · kick-off · venue. He stands sharp above it.
 */
export function Natgrass({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  /* ---- the band ---- */
  const bandTop = Math.round(H * (story ? 0.69 : 0.7));
  const melt = story ? 220 : 170;

  /* ---- the photo: his head well above the melt ---- */
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 680 : 420,
    fs: story ? 215 : 160,
  });
  const src = place.frame.bg ?? place.frame.plain;

  /* ---- the type on the band, bottom-up ---- */
  const fx = natFixture(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const kickSize = Math.min(118 * k * ts, (CANVAS_W - 160) / Math.max(1, [...kicker].length * 0.5));
  const lineSize = Math.min(16 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(fx.line, 0.24)));
  const crest = Math.round(48 * k);
  const fixture = `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}`;
  const fixSize = Math.min(22 * k * ts, (CANVAS_W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
  // The block sits in the middle of the solid band (under the melt), never past the bottom line.
  const blockH = kickSize * 0.8 + 34 * k + crest + (fx.line ? 26 * k + lineSize : 0);
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 52;
  const kickTop = Math.min(bottom - blockH, bandTop + (bottom - bandTop - blockH) / 2 + 8) + (params.textY ?? 0);
  const rowTop = kickTop + kickSize * 0.8 + 34 * k;
  const lineTop = rowTop + crest + 26 * k;
  // The logo above it all on the photo, with space.
  const logoTop = (story ? STORY_TOP : 48) - (params.logoY ?? 0);


  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2f5a2c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The band: the photo's own ground colour (sampled along its foot, without him), melting in. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandTop - melt,
          bottom: 0,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0, rgba(0,0,0,.75) ${melt * 0.6}px, #000 ${melt}px)`,
          maskImage: `linear-gradient(to bottom, transparent 0, rgba(0,0,0,.75) ${melt * 0.6}px, #000 ${melt}px)`,
          background: place.frame.band ? `url("${place.frame.band}") 0 0 / 100% 100% no-repeat, #2f5a2c` : src ? undefined : "#2f5a2c",
        }}
      >
        {!place.frame.band && src && (
          <img src={src} alt="" style={{ position: "absolute", left: -200, top: -200, width: CANVAS_W + 400, height: H - bandTop + melt + 400, maxWidth: "none", objectFit: "cover", objectPosition: "50% 100%", filter: "blur(90px) brightness(.85)" }} />
        )}
        {/* A breath of shade and texture so it reads as a surface, not a flat fill. */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.06), rgba(0,0,0,.16) 50%, rgba(0,0,0,.26))" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            mixBlendMode: "overlay",
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
            )}")`,
          }}
        />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 250 : 180), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />

      {/* The fixture on the band. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: kickTop,
          textAlign: "center",
          fontFamily: CONDENSED,
          fontWeight: 800,
          fontSize: kickSize,
          lineHeight: 0.8,
          letterSpacing: "0.04em",
          paddingLeft: "0.04em",
          whiteSpace: "nowrap",
          textShadow: "0 2px 18px rgba(0,0,0,.18)",
        }}
      >
        {kicker}
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} />}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          {fx.homeName.toUpperCase()}
          <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
          {fx.awayName.toUpperCase()}
        </div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} />}
      </div>
      {fx.line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", opacity: 0.95, textShadow: "0 1px 6px rgba(0,0,0,.25)" }}>
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
