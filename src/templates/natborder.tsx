/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · border (matchday): his own match photo as it is (real grass, stands and light, light grade only)
 * inside a thin white inset frame, like a printed photo. The NEYOD logo interrupts the top edge (on the side away from his face); one small
 * caption in white interrupts the bottom edge — "MATCHDAY · HOME v AWAY · date · kick-off" (exact names,
 * shrunk to fit). Nothing else. In the story the caption takes two lines (fixture, then kicker · date · kick-off) and the frame keeps the side inset and runs from the logo (top of
 * the safe band) to the caption (bottom of it).
 */
export function Natborder({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 450 : params.side === "right" ? 630 : 540,
    fy: story ? 740 : 500,
    fs: story ? 190 : 135,
  });

  const inset = story ? 44 : 40;
  const logoH = story ? 88 : 52;
  const logoScale = params.logoScale ?? 1;
  // The top edge runs through the logo's middle; the bottom edge through the caption's.
  const topY = story ? STORY_TOP + (logoH * logoScale) / 2 : inset;

  /* ---- the caption: one line in the post; two in the story (fixture, then kicker · date · kick-off) ---- */
  const fx = natFixture(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const fixture = `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}`;
  const gapX = 22 * k;
  const maxW = CANVAS_W - 2 * inset - 2 * (story ? 60 : 44) - 2 * gapX;
  const caption = [kicker, fixture, fx.date, fx.kickoff].filter(Boolean).join("  ·  ");
  const sub = [kicker, fx.date, fx.kickoff].filter(Boolean).join("  ·  ");
  const capSize = Math.min(15 * ts, maxW / Math.max(1, capsEm(caption, 0.2)));
  const fixSize = Math.min(25 * ts, maxW / Math.max(1, capsEm(fixture, 0.12)));
  const subSize = Math.min(17 * ts, maxW / Math.max(1, capsEm(sub, 0.3)));
  const blockH = story ? fixSize + 14 + subSize : capSize;
  const bottomY = (story ? STORY_BOTTOM - blockH / 2 : H - inset) - (params.textY ?? 0);

  // The logo interrupts the top edge on the side away from his face (centred when he is).
  const logoAt = params.side === "right" ? "left" : params.side === "left" ? "right" : "centre";
  const lead = 64 * k;

  const line = "#ffffff";
  const lineShadow = "0 0 3px rgba(0,0,0,.35), 0 1px 10px rgba(0,0,0,.25)";
  const typeShadow = "0 2px 3px rgba(0,0,0,.38), 0 6px 22px rgba(0,0,0,.42)";
  const seg = (fixed?: boolean) => <div style={{ flex: fixed ? `0 0 ${lead}px` : 1, height: 2, background: line, boxShadow: lineShadow }} />;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: "#ffffff" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The gentlest local shades behind the logo and the caption. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: topY + 150 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.26), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bottomY - 190 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.34) 60%, rgba(5,8,5,.42))" }} />

      {/* The frame: sides, then the top and bottom edges as rows that open around the logo and the caption. */}
      <div style={{ position: "absolute", left: inset - 1, top: topY, width: 2, height: bottomY - topY, background: line, boxShadow: lineShadow }} />
      <div style={{ position: "absolute", left: CANVAS_W - inset - 1, top: topY, width: 2, height: bottomY - topY, background: line, boxShadow: lineShadow }} />

      <div style={{ position: "absolute", left: inset - 1, right: inset - 1, top: topY - 1, height: 2, display: "flex", alignItems: "center", gap: gapX }}>
        {seg(logoAt === "left")}
        <div style={{ flexShrink: 0, height: logoH * logoScale, display: "flex", alignItems: "flex-start", transform: `translateY(${-(params.logoY ?? 0)}px)` }}>
          <AgencyLogo data={data} height={24} style={{ transform: `scale(${logoScale})`, transformOrigin: "center top" }} />
        </div>
        {seg(logoAt === "right")}
      </div>

      <div style={{ position: "absolute", left: inset - 1, right: inset - 1, top: bottomY - 1, height: 2, display: "flex", alignItems: "center", gap: gapX }}>
        {seg()}
        {story ? (
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textShadow: typeShadow, whiteSpace: "nowrap", lineHeight: 1 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.12em", paddingLeft: "0.12em" }}>
              {fx.homeName.toUpperCase()}
              <span style={{ fontWeight: 400, opacity: 0.8, margin: "0 0.45em" }}>v</span>
              {fx.awayName.toUpperCase()}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: subSize, letterSpacing: "0.3em", paddingLeft: "0.3em", opacity: 0.92 }}>{sub}</div>
          </div>
        ) : (
          <div style={{ flexShrink: 0, fontFamily: SANS, fontWeight: 600, fontSize: capSize, lineHeight: 1, letterSpacing: "0.2em", paddingLeft: "0.2em", whiteSpace: "nowrap", textShadow: typeShadow }}>{caption}</div>
        )}
        {seg()}
      </div>
    </div>
  );
}
