/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, aboveHead, capsEm, fitAbove, natFixture, natPlace, pickTextSpot } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/**
 * Natural · passe-partout (matchday): his real photo full-bleed behind a thin off-white frame drawn inside the
 * edges, like a mounted print. Inside the frame: date | kick-off | venue tiny at the top; "Matchday 14" in serif,
 * both crests and HOME v AWAY (exact names) above his head when the photo has room there, else at the foot —
 * whichever covers the least of him and the other players (pickTextSpot; a dark panel when it still sits over
 * someone). The NEYOD logo centred at the bottom.
 */
export function Natpassepartout({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const inset = story ? 46 : 36;
  const M = inset + 40;
  const fx = natFixture(data);
  const f = matchFacts(data);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 440 : 640, fy: story ? 660 : 450, fs: story ? 220 : 150 });

  const top = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  |  ").toUpperCase();
  const kicker = data.content.kicker || "Matchday";
  const title = f.roundNo ? `${kicker.charAt(0).toUpperCase()}${kicker.slice(1).toLowerCase()} ${f.roundNo}` : kicker;
  const teams = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : "";
  const topPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(top, 0.12)));
  const topLine = (story ? STORY_TOP : inset + 26) - (params.textY ?? 0);
  const fullH = Math.min(58 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, title.length * 0.5)) + 22 * k + 64 * k + 18 * k + Math.min(17 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(teams, 0.12)));
  // A little smaller when that is all it takes to sit above his head instead of over his body.
  const sc = fitAbove(place, topLine + topPx + 44 * k, fullH) ?? 1;
  const tPx = sc * Math.min(58 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, title.length * 0.5));
  const lPx = Math.max(16, sc * Math.min(17 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(teams, 0.12))));
  const crest = sc * 64 * k;

  const bottom = (story ? STORY_BOTTOM : H - inset - 30) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoTop = bottom - logoH - (params.logoY ?? 0);
  // The block, top-down: title, crests, teams.
  const blockH = tPx + sc * 22 * k + crest + sc * 18 * k + lPx;
  const foot = { x0: M, y0: logoTop - 40 * k - blockH, x1: CANVAS_W - M, y1: logoTop - 40 * k };
  const over = aboveHead(place, topLine + topPx + 44 * k, blockH, M, CANVAS_W - M);
  const spot = pickTextSpot(place, over ? [over, foot] : [foot]);
  const atFoot = spot.rect === foot;
  const titleTop = spot.rect.y0;
  const crestTop = titleTop + tPx + sc * 22 * k;
  const teamsTop = crestTop + crest + sc * 18 * k;
  const centred = { position: "absolute" as const, left: M, right: M, textAlign: "center" as const, whiteSpace: "nowrap" as const, lineHeight: 1, textShadow: SHADOW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#24301f", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {atFoot && <div style={{ position: "absolute", left: 0, right: 0, top: titleTop - 140 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.4) 50%, rgba(0,0,0,.45))" }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: atFoot ? (story ? STORY_TOP : 44) + 140 : teamsTop + lPx + 140 * k, background: `linear-gradient(to bottom, rgba(0,0,0,${atFoot ? 0.3 : 0.45}), rgba(0,0,0,${atFoot ? 0 : 0.3}) 60%, rgba(0,0,0,0))` }} />
      {atFoot && spot.crowded && <div style={{ position: "absolute", left: M - 24, right: M - 24, top: titleTop - 24 * k, height: blockH + 48 * k, borderRadius: 14 * k, background: "rgba(10,14,12,.58)" }} />}
      <div style={{ position: "absolute", left: inset, right: inset, top: inset, bottom: inset, border: `1.5px solid ${OFF_WHITE}`, opacity: 0.8 }} />

      {top && <div style={{ ...centred, top: topLine, fontFamily: SANS, fontWeight: 600, fontSize: topPx, letterSpacing: "0.12em" }}>{top}</div>}
      <div style={{ ...centred, top: titleTop, fontFamily: SERIF, fontWeight: 500, fontSize: tPx, letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ position: "absolute", left: M, right: M, top: crestTop, height: crest, display: "flex", justifyContent: "center", gap: 34 * k }}>
        {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />
        ))}
      </div>
      {teams && <div style={{ ...centred, top: teamsTop, fontFamily: SANS, fontWeight: 800, fontSize: lPx, letterSpacing: "0.12em" }}>{teams}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
