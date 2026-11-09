/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, aboveHead, capsEm, natFixture, natPlace, pickTextSpot } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/**
 * Natural · duas colunas (matchday): his real photo full-bleed; "MATCHDAY 14 · date · ground" small, then two
 * columns like a scoreboard without a score — home crest and exact name on the left, away on the right — and the
 * kick-off between them (local time big, the player's second clock below it when it differs). The block sits
 * above his head when the photo has room there, else at the foot — whichever covers the least of him and the
 * other players (pickTextSpot; a dark panel when it still sits over someone). The NEYOD logo centred at the bottom.
 */
export function Natteams({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 56;
  const fx = natFixture(data);
  const f = matchFacts(data);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 440 : 640, fy: story ? 700 : 480, fs: story ? 220 : 150 });

  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  const sub = [f.roundNo ? `${kicker} ${f.roundNo}` : kicker, fx.date.toUpperCase(), fx.venue].filter(Boolean).join("  ·  ");
  const colW = (CANVAS_W - 2 * M - 220 * k) / 2;
  const nameSize = (n: string) => Math.min(24 * k * ts, colW / Math.max(1, capsEm(n.toUpperCase(), 0.06)));
  const crest = 72 * k;
  const subPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(sub, 0.14)));

  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoTop = bottom - logoH - (params.logoY ?? 0);
  // The block, top-down: the small line, then the two columns (crest, name) with the kick-off between them.
  const blockH = subPx + 26 * k + crest + 16 * k + 24 * k * ts;
  const foot = { x0: M, y0: bottom - logoH - 44 * k - blockH, x1: CANVAS_W - M, y1: bottom - logoH - 44 * k };
  const over = aboveHead(place, (story ? STORY_TOP : 46) + 10 * k, blockH, M, CANVAS_W - M);
  const spot = pickTextSpot(place, over ? [over, foot] : [foot]);
  const atFoot = spot.rect === foot;
  const subTop = spot.rect.y0;
  const colTop = subTop + subPx + 26 * k;
  const col = (name: string, crestUrl: string | null, right: boolean) => (
    <div style={{ position: "absolute", top: colTop, [right ? "right" : "left"]: M, width: colW, display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", gap: 16 * k }}>
      {crestUrl ? <img src={crestUrl} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} /> : <div style={{ height: crest }} />}
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nameSize(name), letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{name.toUpperCase()}</div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#24301f", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {atFoot ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: subTop - 180 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 55%, rgba(0,0,0,.5))" }} />
      ) : (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: subTop + blockH + 150 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.3) 60%, rgba(0,0,0,0))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - 120 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.3))" }} />
        </>
      )}
      {atFoot && spot.crowded && <div style={{ position: "absolute", left: M - 24, right: M - 24, top: subTop - 24 * k, height: blockH + 48 * k, borderRadius: 14 * k, background: "rgba(10,14,12,.58)" }} />}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
      <div style={{ position: "absolute", left: M, right: M, top: subTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: subPx, letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{sub}</div>

      {col(fx.homeName, fx.homeCrest, false)}
      {col(fx.awayName, fx.awayCrest, true)}
      <div style={{ position: "absolute", left: "50%", top: colTop + crest * 0.15, transform: "translateX(-50%)", textAlign: "center", textShadow: SHADOW }}>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 52 * k * ts, letterSpacing: "0.02em", lineHeight: 1 }}>{fx.time || "v"}</div>
        {fx.ptTime && <div style={{ marginTop: 10 * k, fontFamily: SANS, fontWeight: 700, fontSize: 14 * k * ts, letterSpacing: "0.16em", opacity: 0.85 }}>{fx.ptTime}</div>}
      </div>
    </div>
  );
}
