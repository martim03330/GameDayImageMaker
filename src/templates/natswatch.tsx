/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#fdfcf9";
const INK = "#1a1c21";

/** The real club colour: params.primary (the app's neutral default dark → accent). Returns hex + luminance. */
function swatchColour(data: RenderData): { hex: string; lum: number } {
  const { primary, accent } = data.params;
  const pick = !primary || primary.toLowerCase() === "#10131c" ? accent || primary : primary;
  const hex = (pick ?? "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return { hex: "#12406b", lum: 60 };
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return { hex: `#${hex.toLowerCase()}`, lum: 0.2126 * r + 0.7152 * g + 0.0722 * b };
}

export type SwatchLine = { text: string; /** bold label line ("MATCHDAY" / "GOAL") */ main?: boolean; /** may wrap to two lines */ wrap?: boolean };

/**
 * The shared frame of the natural swatch looks: his photo full-bleed (real grass, stands, light), light grade
 * only, and one idea — a Pantone-style colour swatch card stuck on the photo in the clear lower corner away
 * from him: white card, soft shadow, a slight tilt, the top ~60% a solid block of the club colour, the bottom
 * white with dark small caps (label in bold, then the info lines). The NEYOD logo alone in the top corner away
 * from his head.
 */
export function NatSwatchFrame({ data, lines }: { data: RenderData; lines: SwatchLine[] }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const ts = params.textScale ?? 1;
  const k = (story ? 1.3 : 1) * ts;
  const M = story ? 70 : 58;

  /* ---- him: face in the upper part, to one side, so the card gets the other lower corner ---- */
  const fs = story ? 230 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 640;
  const place = natPlace(data, W, H, { fx: fx0, fy: story ? 720 : 470, fs });
  const room = { left: place.box.left, right: W - (place.box.left + place.box.width) };
  const cardLeft = params.side === "left" ? false : params.side === "right" ? true : place.fx >= W / 2 || room.left >= room.right;

  /* ---- the card ---- */
  const { hex, lum } = swatchColour(data);
  const cardW = Math.round(300 * k);
  const pad = Math.round(22 * k);
  const blockH = Math.round(cardW * 0.8);
  const tilt = cardLeft ? -1.8 : 1.6;
  const bottom = (story ? H - STORY_BOTTOM : M + 4) + (params.textY ?? 0);

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = place.fx >= W / 2 ? M + 6 : W - M - 6 - logoW;

  const code = hex.slice(1).toUpperCase();
  const shown = lines.filter((l) => l.text);

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}

      {/* The gentlest shade behind the logo only. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + logoH + (story ? 180 : 130), background: "linear-gradient(to bottom, rgba(0,0,0,.26), rgba(0,0,0,0))" }} />

      {/* The swatch card. */}
      <div
        style={{
          position: "absolute",
          bottom,
          ...(cardLeft ? { left: M } : { right: M }),
          width: cardW,
          boxSizing: "border-box",
          padding: Math.round(10 * k),
          background: PAPER,
          borderRadius: 6 * k,
          transform: `rotate(${tilt}deg)`,
          transformOrigin: cardLeft ? "left bottom" : "right bottom",
          boxShadow: `0 2px 4px rgba(0,0,0,.22), 0 ${14 * k}px ${30 * k}px rgba(0,0,0,.32)`,
          color: INK,
        }}
      >
        <div style={{ height: blockH, background: hex, borderRadius: 3 * k, boxShadow: lum > 225 ? "inset 0 0 0 1px rgba(0,0,0,.12)" : "none" }} />
        <div style={{ padding: `${18 * k}px ${pad - 10 * k}px ${14 * k}px` }}>
          {shown.map((l, i) =>
            l.main ? (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 * k }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27 * k, letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap" }}>{l.text}</span>
                {capsEm(l.text, 0.06) * 27 * k + capsEm(code, 0.06) * 18 * k + 10 * k <= cardW - 2 * pad && (
                  <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18 * k, letterSpacing: "0.06em", lineHeight: 1, opacity: 0.5 }}>{code}</span>
                )}
              </div>
            ) : (
              <div
                key={i}
                style={{
                  fontFamily: SANS,
                  fontWeight: i === 1 ? 700 : 600,
                  fontSize: (i === 1 ? 21 : 19) * k,
                  letterSpacing: "0.07em",
                  lineHeight: 1.25,
                  marginTop: (i === 1 ? 12 : 6) * k,
                  opacity: i === 1 ? 0.92 : 0.6,
                  whiteSpace: l.wrap ? "normal" : "nowrap",
                  overflow: "hidden",
                  textOverflow: "clip",
                }}
              >
                {l.text.split("\n").map((t, j) => (
                <div key={j}>{t}</div>
              ))}
              </div>
            ),
          )}
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · swatch (matchday): his own match photo full-bleed, light grade only, and one idea: a Pantone-style
 * colour swatch card in the club colour, stuck in a clear corner — "MATCHDAY", the club's exact name, then
 * "25 OCT · 15:00" and HOME v AWAY (exact names, home first). The NEYOD logo alone.
 */
export function Natswatch({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const kick = (data.content.kicker || "Matchday").replace(/[.!]+$/, "").trim().toUpperCase();
  const club = (data.club?.name || (data.content.home === false ? fx.awayName : fx.homeName) || "").trim().toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join(" · ").toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} v\n${fx.awayName.toUpperCase()}` : "";
  return <NatSwatchFrame data={data} lines={[{ text: kick, main: true }, { text: club }, { text: when }, { text: match, wrap: true }]} />;
}
