/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, aboveHead, capsEm, natFixture, natPlace, pickTextSpot } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

/**
 * The shared frame of the "speed" natural looks (reference: the "ROUND OF 16 · SB BENFICA X CFC" poster — a
 * match photo dragged sideways by speed, calm small type in the middle): his real photo with the GROUND
 * motion-blurred horizontally (an SVG blur along x only) while he stays perfectly sharp on the figure layer —
 * face always crisp. One tiny tracked line at the top; in the middle, on the side away from him, a short
 * line in DM Serif caps, the crests and one small bold line. The NEYOD logo at the foot.
 */
export function NatBlurFrame({ data, top, title, crests, line }: { data: RenderData; top: string; title: string; crests: (string | null)[]; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 60;
  const heLeft = params.side === "left";
  const fs = story ? 210 : 155;
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 380 : 700, fy: story ? 600 : 420, fs });
  // The type column on the free side, centred in it.
  const colW = Math.max(380, heLeft ? CANVAS_W - M - (place.fx + 1.6 * place.faceW) : place.fx - 1.6 * place.faceW - M);
  const colX = heLeft ? CANVAS_W - M - colW : M;
  const tPx = Math.min(44 * k * ts, colW / Math.max(1, title.length * 0.62));
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, capsEm(line, 0.08)));
  const topPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(top, 0.12)));
  const crestH = 92 * k;
  const blockH = tPx + 24 * k + crestH + 22 * k + lPx;
  const footY = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  // Where the block goes: on the free side (middle, a bit higher or lower, or just above the logo), above his
  // head, or — when the photo could not put him where asked — on the other side; whichever covers the least of
  // him and of the other players standing there (pickTextSpot).
  const side = (y: number, x = colX) => ({ x0: x, y0: y, x1: x + colW, y1: y + blockH });
  const ys = [H * 0.5 - blockH / 2, H * 0.4 - blockH / 2, H * 0.6 - blockH / 2, footY - logoH - 60 * k - blockH];
  const over = aboveHead(place, (story ? STORY_TOP : 44) + topPx + 40 * k, blockH, (CANVAS_W - colW) / 2, (CANVAS_W + colW) / 2);
  const otherX = heLeft ? M : CANVAS_W - M - colW;
  const spots = [...ys.map((y) => side(y)), ...(over ? [over] : []), ...ys.map((y) => side(y, otherX))];
  const spot = pickTextSpot(place, spots);
  const blockTop = spot.rect.y0;
  const blockX = spot.rect.x0;
  const col = { position: "absolute" as const, left: blockX, width: colW, textAlign: "center" as const, whiteSpace: "nowrap" as const, lineHeight: 1, textShadow: SHADOW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="natspeed" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${22 * k} 0`} edgeMode="duplicate" />
        </filter>
      </svg>
      {/* Speed on the ground only; he is redrawn sharp on top (the face is never blurred). */}
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "url(#natspeed) saturate(1.05) brightness(.92)" }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      {/* A soft shade behind the block; over another player even at its best spot, a dark cushion with blurred edges. */}
      {spot.crowded ? (
        <div style={{ position: "absolute", left: blockX - 34, width: colW + 68, top: blockTop - 40, height: blockH + 80, borderRadius: 28 * k, background: "rgba(8,12,10,.62)", filter: `blur(${16 * k}px)` }} />
      ) : (
        <div style={{ position: "absolute", left: blockX - 60, width: colW + 120, top: blockTop - 80, height: blockH + 160, background: "radial-gradient(ellipse at center, rgba(0,0,0,.32), rgba(0,0,0,0) 70%)" }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,0))" }} />

      {top && <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: (story ? STORY_TOP : 44) - (params.textY ?? 0), textAlign: "center", paddingLeft: "0.12em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 600, fontSize: topPx, letterSpacing: "0.12em", whiteSpace: "nowrap", textShadow: SHADOW }}>{top}</div>}
      <div style={{ ...col, top: blockTop, fontFamily: SERIF, fontSize: tPx, letterSpacing: "0.02em" }}>{title}</div>
      <div style={{ position: "absolute", left: blockX, width: colW, top: blockTop + tPx + 24 * k, height: crestH, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.5))" }} />
        ))}
      </div>
      <div style={{ ...col, top: blockTop + tPx + 24 * k + crestH + 22 * k, fontFamily: SANS, fontWeight: 800, fontSize: lPx, letterSpacing: "0.08em" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · arrasto (matchday): his real photo with the ground dragged sideways by speed, he perfectly sharp.
 * Date | kick-off | venue tiny at the top; on the free side "MATCHDAY 7" in DM Serif caps, both crests and
 * HOME X AWAY in small bold caps (exact names, home first). NEYOD logo at the foot.
 */
export function Natblur({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  return (
    <NatBlurFrame
      data={data}
      top={[fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  |  ")}
      title={f.roundNo ? `${kicker} ${f.roundNo}` : kicker}
      crests={[fx.homeCrest, fx.awayCrest]}
      line={fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} X ${fx.awayName.toUpperCase()}` : ""}
    />
  );
}

/**
 * Natural goal · arrasto: his real celebration photo with the ground dragged by speed, he sharp. His club's
 * exact name tiny at the top; "GOAL" in DM Serif caps, his club's crest and his full name in small bold caps.
 */
export function Goalnatblur({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatBlurFrame data={data} top={ourClub(data).toUpperCase()} title={(data.content.kicker || "Goal").toUpperCase()} crests={[crest]} line={name} />;
}
