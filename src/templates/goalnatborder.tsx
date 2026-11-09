/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · thin border: his real celebration photo as it is (light grade only) inside a thin inset white
 * frame (2px). The NEYOD logo interrupts the top edge; the bottom edge is interrupted by one small caption —
 * GOAL · HIS NAME · home crest v away crest — in white with natword's tight + wide shadows. No score.
 * In the story the frame keeps its side inset and its top / bottom edges ride the story band, so the logo and
 * the caption stay clear of Instagram's bars.
 */
export function Goalnatborder({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 740 : 540,
    fs: story ? 215 : 172,
  });

  /* ---- the caption on the bottom edge ---- */
  const fx = natFixture(data);
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const crest = Math.round(34 * k);
  const gap = 18 * k;
  const crests = (fx.homeCrest ? crest : 0) + (fx.awayCrest ? crest : 0);
  const sep = (s: number) => s * 0.3 + 2 * gap;
  const textEm = capsEm(kicker, 0.26) + capsEm(name, 0.22);
  const inset = story ? 44 : 36;
  const maxW = CANVAS_W - 2 * inset - 2 * 70;
  const fixed = crests + (crests ? 2 * gap + 12 * k : 0);
  let size = 17 * k * ts;
  const widthAt = (s: number) => s * textEm + sep(s) * (crests ? 2 : 1) + fixed;
  if (widthAt(size) > maxW) size = Math.max(9, (maxW - fixed) / (textEm + (0.3 * (crests ? 2 : 1))) - 2 * gap);
  const capW = widthAt(size);
  const pad = 22 * k;

  /* ---- the frame ---- */
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const top = (story ? STORY_TOP + logoH / 2 : inset + 10) - (params.logoY ?? 0);
  const capH = Math.max(crest, size);
  const bottom = story ? STORY_BOTTOM - capH / 2 : H - inset;
  const left = inset;
  const right = CANVAS_W - inset;
  const line = 2;
  const lineShadow = "0 1px 4px rgba(0,0,0,.35)";
  const seg = (s: { left: number; top: number; width: number; height: number }) => (
    <div style={{ position: "absolute", ...s, background: "#ffffff", boxShadow: lineShadow }} />
  );
  const logoGapL = CANVAS_W / 2 - logoW / 2 - pad;
  const logoGapR = CANVAS_W / 2 + logoW / 2 + pad;
  const capGapL = CANVAS_W / 2 - capW / 2 - pad;
  const capGapR = CANVAS_W / 2 + capW / 2 + pad;

  const shadow = "0 2px 6px rgba(0,0,0,.38), 0 8px 40px rgba(0,0,0,.42)";
  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.45))" }} /> : null;
  const dot = <span style={{ margin: `0 ${gap}px`, fontWeight: 400, opacity: 0.8 }}>·</span>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: "#ffffff" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* Breaths of shade where the logo and the caption sit. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + logoH + (story ? 140 : 100), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bottom - (story ? 260 : 200), bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.34) 65%, rgba(5,8,5,.42))" }} />
      {/* A soft pool of shade right under the caption: it stays legible over a white kit. */}
      <div
        style={{
          position: "absolute",
          left: CANVAS_W / 2 - capW / 2 - 140,
          width: capW + 280,
          top: bottom - capH / 2 - 70 * k,
          height: capH + 140 * k,
          background: "radial-gradient(closest-side, rgba(5,8,5,.55), rgba(5,8,5,.32) 60%, rgba(5,8,5,0))",
        }}
      />

      {/* The frame: four hairlines, the top broken by the logo, the bottom by the caption. */}
      {seg({ left, top: top - line / 2, width: logoGapL - left, height: line })}
      {seg({ left: logoGapR, top: top - line / 2, width: right - logoGapR, height: line })}
      {seg({ left, top: bottom - line / 2, width: capGapL - left, height: line })}
      {seg({ left: capGapR, top: bottom - line / 2, width: right - capGapR, height: line })}
      {seg({ left: left - line / 2, top: top - line / 2, width: line, height: bottom - top + line })}
      {seg({ left: right - line / 2, top: top - line / 2, width: line, height: bottom - top + line })}

      {/* The caption, centred on the bottom edge. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bottom - capH / 2,
          height: capH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          fontSize: size,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow: shadow,
        }}
      >
        <span style={{ fontWeight: 800, letterSpacing: "0.26em", marginRight: "-0.26em" }}>{kicker}</span>
        {dot}
        <span style={{ fontWeight: 600, letterSpacing: "0.22em", marginRight: "-0.22em" }}>{name}</span>
        {crests > 0 && (
          <>
            {dot}
            <span style={{ display: "flex", alignItems: "center", gap: 6 * k }}>
              {crestImg(fx.homeCrest)}
              <span style={{ fontWeight: 400, fontSize: size * 0.95, opacity: 0.85, margin: `0 ${4 * k}px` }}>v</span>
              {crestImg(fx.awayCrest)}
            </span>
          </>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: top - logoH / 2, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center center" }}
      />
    </div>
  );
}
