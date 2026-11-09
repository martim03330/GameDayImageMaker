/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const HEAVY = "var(--font-archivo-black), 'Arial Black', sans-serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 16px rgba(0,0,0,.4)";

/**
 * The shared frame of the "repeat" natural looks (reference: the Charlotte FC "GOAL GOAL GOAL" poster — the
 * word stacked down the whole poster behind the player): his real photo, then one word repeated in rows of
 * huge heavy caps across the full width — set BETWEEN the photo and the sharp figure layer, so it runs behind
 * him and never over his face — alternating solid off-white and outline rows, fading towards the foot. At
 * the top, small: the crests and one tracked line; the NEYOD logo at the foot.
 */
export function NatRepeatFrame({ data, word, crests, line }: { data: RenderData; word: string; crests: (string | null)[]; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const fs = story ? 220 : 165;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 640 : 470, fs });
  // Archivo Black caps ~0.8em a letter: the word fills the width (it may bleed a little at the edges).
  const wPx = Math.min(300 * k, (CANVAS_W * 1.04) / Math.max(1, word.length * 0.8));
  const rowH = wPx * 0.86;
  const top = (story ? STORY_TOP : 40) - (params.textY ?? 0);
  const crestH = 46 * k;
  const lPx = Math.min(16 * k * ts, (CANVAS_W * 0.8) / Math.max(1, capsEm(line, 0.2)));
  const rowsTop = top + crestH + lPx + 40 * k;
  const rows = Math.ceil((H - rowsTop) / rowH) + 1;
  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1d2a35", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,30,.22)" }} />
      {/* The rows: behind him (he is drawn after them). */}
      {Array.from({ length: rows }, (_, i) => {
        const solid = i % 2 === 0;
        return (
          <div
            key={i}
            data-bleed
            style={{
              position: "absolute",
              left: 0,
              width: CANVAS_W,
              top: rowsTop + i * rowH - wPx * 0.12,
              textAlign: "center",
              fontFamily: HEAVY,
              fontSize: wPx,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              color: solid ? "rgba(244,241,234,.9)" : "transparent",
              WebkitTextStroke: solid ? undefined : `${2.5 * k}px rgba(244,241,234,.75)`,
              opacity: Math.max(0.25, 1 - i * 0.14),
              textShadow: solid ? "0 4px 24px rgba(0,0,0,.25)" : undefined,
            }}
          >
            {word}
          </div>
        );
      })}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 300 : 220, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />

      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top, height: crestH, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
        ))}
      </div>
      {line && <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: top + crestH + 12 * k, textAlign: "center", paddingLeft: "0.2em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.2em", whiteSpace: "nowrap", textShadow: SHADOW }}>{line}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · repetido (matchday): his real photo with "MATCHDAY" repeated in rows of huge heavy caps behind
 * him (solid and outline, fading down); at the top both crests and date · kick-off · HOME V AWAY (exact names,
 * home first) in tiny caps. NEYOD logo at the foot.
 */
export function Natrepeat({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} V ${fx.awayName.toUpperCase()}` : "";
  return <NatRepeatFrame data={data} word={(data.content.kicker || "Matchday").toUpperCase()} crests={[fx.homeCrest, fx.awayCrest]} line={[fx.date, fx.kickoff, match].filter(Boolean).join("  ·  ")} />;
}

/**
 * Natural goal · repetido: his real celebration photo with "GOAL" repeated in rows of huge heavy caps behind
 * him; at the top his club's crest and his full name · club's exact name in tiny caps. No score.
 */
export function Goalnatrepeat({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatRepeatFrame data={data} word={(data.content.kicker || "Goal").toUpperCase()} crests={[crest]} line={[name, ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ")} />;
}
