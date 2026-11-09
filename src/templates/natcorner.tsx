/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · corner caption (matchday): his own match photo, untouched and dominant (light grade only), and
 * type only in the corners, small and quiet like a magazine photo caption — top-left "MATCHDAY" in spaced
 * caps over a tiny local shade; bottom-left the fixture stacked (home crest + name, away crest + name,
 * date · kick-off, venue); the NEYOD logo bottom-right.
 */
export function Natcorner({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = Math.round(56 * (story ? 1.15 : 1));

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 660 : 580,
    fy: story ? 700 : 450,
    fs: story ? 225 : 168,
  });

  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const kickSize = 17 * k * ts;
  const top = (story ? STORY_TOP : 58) + (params.textY ?? 0);

  /* ---- the caption, bottom-up ---- */
  const fx = natFixture(data);
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 58;
  // Narrow, like a caption: it stays in the corner, clear of him.
  const avail = CANVAS_W * (story ? 0.38 : 0.36);
  const crest = Math.round(30 * k);
  const nameSize = Math.min(18 * k * ts, (avail - crest - 14 * k) / Math.max(1, capsEm(fx.homeName.toUpperCase(), 0.08), capsEm(fx.awayName.toUpperCase(), 0.08)));
  const when = fx.line.split("  ·  ").filter((b) => b !== fx.venue).join("  ·  ");
  const smallSize = Math.min(14 * k * ts, avail / Math.max(1, capsEm(fx.venue, 0.16), capsEm(when, 0.16)));
  const rows: { h: number; gap: number }[] = [
    { h: crest, gap: 0 },
    { h: crest, gap: 10 * k },
    ...(when ? [{ h: smallSize, gap: 22 * k }] : []),
    ...(fx.venue ? [{ h: smallSize, gap: 10 * k }] : []),
  ];
  const blockH = rows.reduce((a, r) => a + r.h + r.gap, 0);
  const blockTop = bottom - blockH;

  const team = (name: string, url: string | null) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * k, height: crest }}>
      {url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 4px rgba(0,0,0,.35))" }} /> : <div style={{ width: crest, flexShrink: 0 }} />}
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "0.08em", whiteSpace: "nowrap", lineHeight: 1 }}>{name.toUpperCase()}</div>
    </div>
  );
  const small = (text: string, mt: number, weight: number, op: number) => (
    <div style={{ marginTop: mt, fontFamily: SANS, fontWeight: weight, fontSize: smallSize, lineHeight: 1, letterSpacing: "0.16em", whiteSpace: "nowrap", opacity: op }}>{text}</div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* Tiny local shades, only under the type. */}
      <div style={{ position: "absolute", left: -200, top: top - 260, width: 760 * k, height: 520 * k, background: "radial-gradient(closest-side, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: blockTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.34) 55%, rgba(5,8,5,.5))" }} />

      {/* Top-left: the kicker, small spaced caps with a short rule. */}
      <div style={{ position: "absolute", left: M, top, display: "flex", alignItems: "center", gap: 16 * k, textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>
        <div style={{ width: 30 * k, height: Math.max(2, 2 * k), background: OFF_WHITE, opacity: 0.9 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.42em", whiteSpace: "nowrap" }}>{kicker}</div>
      </div>

      {/* Bottom-left: the fixture, stacked like a caption. */}
      <div style={{ position: "absolute", left: M, top: blockTop, display: "flex", flexDirection: "column", textShadow: "0 1px 8px rgba(0,0,0,.45)" }}>
        {team(fx.homeName, fx.homeCrest)}
        <div style={{ marginTop: 10 * k }}>{team(fx.awayName, fx.awayCrest)}</div>
        {when && small(when, 22 * k, 600, 0.92)}
        {fx.venue && small(fx.venue, 10 * k, 500, 0.72)}
      </div>

      {/* Bottom-right: the agency mark, on the caption's last line. */}
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", right: M, bottom: H - bottom + (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
    </div>
  );
}
