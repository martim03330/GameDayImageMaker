/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · frosted strip (matchday): his own match photo as it is (light grade only) and one slim
 * full-width strip of frosted glass laid across the grass low in the frame, below his knees and never near
 * his face — the photo blurred through it, a faint white tint, hairlines top and bottom. Inside, left
 * "MATCHDAY" in condensed caps; right the fixture: crests either side of HOME v AWAY (exact names) over
 * date · kick-off. The NEYOD logo alone at the top.
 */
export function Natstrip({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 450 : params.side === "right" ? 630 : 540,
    fy: story ? 700 : 460,
    fs: story ? 180 : 132,
  });

  /* ---- the strip, low in the frame, always well under his face ---- */
  const stripH = Math.round((story ? 128 : 100) * ts);
  const pad = Math.round(48 * k);
  const faceFloor = place.fy + place.fs * 1.4;
  const stripBottom = (story ? STORY_BOTTOM : CANVAS_H - 64) - (params.textY ?? 0);
  const stripTop = Math.max(faceFloor, stripBottom - stripH);

  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const condEm = (t: string) => wordEm(FACES.barlow, t.replace(/[^A-Z\-!' ]/g, "A")) + t.length * 0.02;
  const kickSize = Math.min(stripH * 0.5, 280 * k / Math.max(1, condEm(kicker)));
  const kickW = kickSize * condEm(kicker);

  const fx = natFixture(data);
  const when = [fx.date, fx.time, fx.ptTime].filter(Boolean).join("  ·  ");
  const crest = Math.round(30 * k);
  const cgap = 12 * k;
  const avail = CANVAS_W - 2 * pad - kickW - 44 * k;
  const fixture = `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}`;
  const fixSize = Math.min(17 * k * ts, (avail - 2 * (crest + cgap)) / Math.max(1, capsEm(fixture, 0.08)));
  const whenSize = Math.min(13 * k * ts, avail / Math.max(1, capsEm(when, 0.2)));

  const logoTop = (story ? STORY_TOP : 44) - (params.logoY ?? 0);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 4px rgba(0,0,0,.3))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A halo behind the logo; a faint fade around the strip so the glass reads on bright grass. */}
      <div style={{ position: "absolute", left: "50%", top: logoTop - 140 * k, width: 640 * k, height: 380 * k, transform: "translateX(-50%)", background: "radial-gradient(closest-side, rgba(0,0,0,.26), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: stripTop - 160 * k, height: stripH + 320 * k, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.22) 40%, rgba(0,0,0,.22) 60%, rgba(0,0,0,0))" }} />

      {/* The frosted strip. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: stripTop,
          height: stripH,
          backdropFilter: "blur(14px) saturate(1.1)",
          WebkitBackdropFilter: "blur(14px) saturate(1.1)",
          background: "linear-gradient(to bottom, rgba(255,255,255,.14), rgba(255,255,255,.1))",
          borderTop: "1px solid rgba(255,255,255,.42)",
          borderBottom: "1px solid rgba(255,255,255,.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${pad}px`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap", paddingTop: kickSize * 0.06, textShadow: "0 1px 10px rgba(0,0,0,.25)" }}>{kicker}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 * k }}>
          <div style={{ width: 1, height: stripH * 0.46, background: "rgba(255,255,255,.4)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9 * k, textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: cgap, height: crest }}>
              {crestImg(fx.homeCrest)}
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, lineHeight: 1, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                {fx.homeName.toUpperCase()}
                <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.45em" }}>v</span>
                {fx.awayName.toUpperCase()}
              </div>
              {crestImg(fx.awayCrest)}
            </div>
            {when && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: whenSize, lineHeight: 1, letterSpacing: "0.2em", whiteSpace: "nowrap", opacity: 0.9 }}>{when}</div>}
          </div>
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
