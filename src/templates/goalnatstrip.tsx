/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · frosted strip: his real celebration photo as it is (light grade only) crossed by ONE slim
 * full-width strip of frosted glass (backdrop blur + a light tint, hairlines top and bottom) set low, over a
 * calm part of the photo and always clear of his face. In it, the kicker ("GOAL") large-ish in condensed caps
 * on the left; his name and the two crests with "v" on the right. The NEYOD logo small at the top. No score.
 */
export function Goalnatstrip({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const M = story ? 64 : 56;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 680 : 440,
    fs: story ? 260 : 180,
  });

  /* ---- the strip: low, never over his face (chin + air) ---- */
  const stripH = Math.round(150 * k * Math.min(1.15, ts));
  const chin = place.fy + place.fs * 0.5 + place.fs * 0.55;
  const want = story ? STORY_BOTTOM - stripH - 150 : CANVAS_H - stripH - 150;
  const stripTop = Math.round(Math.min(Math.max(want, chin), (story ? STORY_BOTTOM : CANVAS_H - 40) - stripH) - (params.textY ?? 0));

  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const half = CANVAS_W / 2 - M - 20;
  // Barlow Condensed 800 caps ≈ 0.5em wide.
  const kickSize = Math.min(stripH * 0.62, half / Math.max(1, [...kicker].length * 0.5 + 0.1));
  const nameSize = Math.min(24 * k * ts, half / Math.max(1, capsEm(name, 0.22)));
  const fx = natFixture(data);
  const crest = Math.round(38 * k);
  const hair = "rgba(255,255,255,.5)";

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 4px rgba(0,0,0,.3))" }} /> : null;

  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A breath of shade at the top for the logo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.24), rgba(0,0,0,0))" }} />

      {/* The frosted strip. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: stripTop,
          height: stripH,
          boxSizing: "border-box",
          borderTop: `1px solid ${hair}`,
          borderBottom: `1px solid ${hair}`,
          background: "linear-gradient(to bottom, rgba(255,255,255,.2), rgba(255,255,255,.08)), rgba(16,20,16,.24)",
          backdropFilter: "blur(22px) saturate(1.15)",
          WebkitBackdropFilter: "blur(22px) saturate(1.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${M}px`,
          textShadow: "0 1px 8px rgba(0,0,0,.3)",
        }}
      >
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap", marginTop: kickSize * 0.06 }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 * k }}>
          {name && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.22em", marginRight: "-0.22em", whiteSpace: "nowrap" }}>{name}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 12 * k }}>
            {crestImg(fx.homeCrest)}
            <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 15 * k * ts, lineHeight: 1, opacity: 0.85 }}>v</div>
            {crestImg(fx.awayCrest)}
          </div>
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
