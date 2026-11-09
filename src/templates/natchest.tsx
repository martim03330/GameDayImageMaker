/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const SHADOW = "0 2px 4px rgba(0,0,0,.45), 0 6px 34px rgba(0,0,0,.5)";

/**
 * The shared frame of the "chest" natural looks (reference: the 76ers "GAMEDAY" poster — a close, intense
 * shot with one heavy white word laid across the player's chest): his real photo, close and large, untouched
 * but for a soft shade at the foot. Across his chest — always below his chin, never on his face — the crests
 * small, one heavy Anton word in white, a short white rule and one tiny tracked line. NEYOD logo at the foot.
 */
export function NatChestFrame({ data, crests, word, line }: { data: RenderData; crests: (string | null)[]; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 60;
  const fs = story ? 300 : 230;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 560 : 380, fs });
  // Anton caps ~0.5em a letter; the block is centred on him but kept inside the margins.
  const wPx = Math.min(176 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.5));
  const lPx = Math.min(19 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.12)));
  const crestH = 56 * k;
  // Below his chin with a clear gap (chin ≈ face centre + 0.55 face-height).
  const crestTop = place.fy + place.fs * 0.95;
  const wordTop = crestTop + (crests.some(Boolean) ? crestH + 14 * k : 0);
  const ruleTop = wordTop + wPx * 0.98 + 16 * k;
  const blockW = Math.max(capsEm(line, 0.12) * lPx, word.length * 0.5 * wPx);
  const cx = Math.min(CANVAS_W - M - blockW / 2, Math.max(M + blockW / 2, place.fx));
  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const centred = { position: "absolute" as const, left: cx - CANVAS_W / 2, width: CANVAS_W, textAlign: "center" as const, whiteSpace: "nowrap" as const, lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#121212", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {/* A soft shade behind the type block and the foot, so white reads on any kit. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop - 60 * k, bottom: 0, background: `radial-gradient(ellipse ${blockW * 0.75}px ${(ruleTop - crestTop) * 1.1}px at ${cx}px ${(crestTop + ruleTop) / 2 + 60 * k}px, rgba(0,0,0,.42), rgba(0,0,0,0)), linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))` }} />

      {crests.some(Boolean) && (
        <div style={{ position: "absolute", left: cx - 200, width: 400, top: crestTop, height: crestH, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 * k }}>
          {crests.filter(Boolean).map((c, i) => (
            <img key={i} src={c!} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }} />
          ))}
        </div>
      )}
      <div style={{ ...centred, top: wordTop, fontFamily: DISPLAY, fontSize: wPx, letterSpacing: "-0.005em", textShadow: SHADOW }}>{word}</div>
      <div style={{ position: "absolute", left: cx - 110 * k, width: 220 * k, top: ruleTop, height: 3 * k, background: OFF_WHITE, boxShadow: "0 1px 8px rgba(0,0,0,.5)" }} />
      <div style={{ ...centred, top: ruleTop + 18 * k, paddingLeft: "0.12em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.12em", textShadow: SHADOW }}>{line}</div>

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · peito (matchday): his real photo close and large; across his chest (below his chin) both crests
 * small, "MATCHDAY" in heavy white Anton, a short rule and kick-off · date · HOME V AWAY (exact names, home
 * first) in tiny tracked caps. NEYOD logo at the foot.
 */
export function Natchest({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} V ${fx.awayName.toUpperCase()}` : "";
  return <NatChestFrame data={data} crests={[fx.homeCrest, fx.awayCrest]} word={(data.content.kicker || "Matchday").toUpperCase()} line={[fx.kickoff, fx.date, match].filter(Boolean).join("  ·  ")} />;
}

/**
 * Natural goal · peito: his real celebration photo close and large; across his chest his club's crest,
 * "GOAL" in heavy white Anton, a short rule and his full name · club's exact name in tiny caps. No score.
 */
export function Goalnatchest({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatChestFrame data={data} crests={[crest]} word={(data.content.kicker || "Goal").toUpperCase()} line={[name, ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ")} />;
}
