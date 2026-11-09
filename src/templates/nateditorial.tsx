/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const BODONI = "var(--font-bodoni), 'Didot', Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.55), 0 2px 18px rgba(0,0,0,.45)";

/**
 * The shared frame of the "editorial" natural looks (reference: the "FLOWER / BLACK ROSE" design poster):
 * his real photo with the surroundings muted to near black-and-white and sunk (NatSpot), he alone in colour.
 * At the top one word in thin wide-spaced Bodoni caps between two small four-point stars; down both sides a
 * short line of tiny caps set vertically (home on the left, away on the right); at the foot an outlined pill
 * with one tiny line, flanked by small rings, and the NEYOD logo under it.
 */
export function NatEditorialFrame({ data, word, leftV, rightV, pill }: { data: RenderData; word: string; leftV: string; rightV: string; pill: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 64 : 54;
  const top = (story ? STORY_TOP : 70) - (params.textY ?? 0);
  // Bodoni caps with 0.28em spacing run ~1em a letter.
  const wPx = Math.min(96 * k * ts, (CANVAS_W - 2 * M - 120 * k) / Math.max(1, word.length * 0.98));
  const fs = story ? 220 : 160;
  const fx0 = params.side === "left" ? 470 : params.side === "right" ? 610 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 700 : 500, top + wPx + 110 * k + fs * 0.85), fs });

  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const pPx = Math.min(15 * k * ts, (CANVAS_W * 0.6) / Math.max(1, capsEm(pill, 0.24)));
  const pillH = 44 * k;
  const pillTop = footY - logoH - 26 * k - pillH;
  const vPx = (t: string) => Math.min(14 * k, (H * 0.36) / Math.max(1, capsEm(t, 0.36)));
  const star = (x: number) => (
    <svg width={22 * k} height={22 * k} viewBox="0 0 20 20" style={{ position: "absolute", left: x - 11 * k, top: top + wPx * 0.36 - 11 * k, filter: "drop-shadow(0 1px 4px rgba(0,0,0,.6))" }}>
      <path d="M10 0 C10.8 7 13 9.2 20 10 C13 10.8 10.8 13 10 20 C9.2 13 7 10.8 0 10 C7 9.2 9.2 7 10 0Z" fill={OFF_WHITE} />
    </svg>
  );
  const vertical = (t: string, left: boolean) => (
    <div
      style={{
        position: "absolute",
        top: H * 0.42,
        [left ? "left" : "right"]: M,
        transform: `translate(${left ? "-50%" : "50%"}, -50%) rotate(${left ? -90 : 90}deg)`,
        transformOrigin: "center",
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: vPx(t),
        letterSpacing: "0.36em",
        whiteSpace: "nowrap",
        color: OFF_WHITE,
        opacity: 0.88,
        textShadow: SHADOW,
      }}
    >
      {t}
    </div>
  );
  const ring = (x: number) => <div style={{ position: "absolute", left: x - 9 * k, top: pillTop + pillH / 2 - 9 * k, width: 18 * k, height: 18 * k, borderRadius: "50%", border: `1.5px solid ${OFF_WHITE}`, opacity: 0.8 }} />;
  const pillW = Math.min(CANVAS_W * 0.66, capsEm(pill, 0.24) * pPx + 64 * k);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0e0e0e", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "grayscale(.85) brightness(.8) contrast(1.12)" }} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.42} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + wPx + 220 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 380 : 280, background: "linear-gradient(to top, rgba(0,0,0,.66), rgba(0,0,0,0))" }} />

      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top, textAlign: "center", paddingLeft: "0.28em", boxSizing: "border-box", fontFamily: BODONI, fontWeight: 500, fontSize: wPx, letterSpacing: "0.28em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>
        {word}
      </div>
      {star(M + 26 * k)}
      {star(CANVAS_W - M - 26 * k)}
      {leftV && vertical(leftV, true)}
      {rightV && vertical(rightV, false)}

      {ring((CANVAS_W - pillW) / 2 - 30 * k)}
      <div style={{ position: "absolute", left: (CANVAS_W - pillW) / 2, top: pillTop, width: pillW, height: pillH, borderRadius: 999, border: `1.5px solid ${OFF_WHITE}`, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: "0.24em", boxSizing: "border-box", fontFamily: SANS, fontWeight: 600, fontSize: pPx, letterSpacing: "0.24em", whiteSpace: "nowrap", textShadow: SHADOW }}>
        {pill}
      </div>
      {ring((CANVAS_W + pillW) / 2 + 30 * k)}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/**
 * Natural · editorial (matchday): his real photo, surroundings muted near black-and-white, he alone in
 * colour. "MATCHDAY" in thin wide-spaced Bodoni caps between two small stars; HOME and AWAY set vertically
 * down the left and right edges (exact names, home first); date · kick-off in an outlined pill flanked by
 * small rings; NEYOD logo under it.
 */
export function Nateditorial({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatEditorialFrame
      data={data}
      word={(data.content.kicker || "Matchday").toUpperCase()}
      leftV={fx.homeName.toUpperCase()}
      rightV={fx.awayName.toUpperCase()}
      pill={[fx.date, fx.kickoff].filter(Boolean).join("  ·  ")}
    />
  );
}

/**
 * Natural goal · editorial: his real celebration photo, surroundings muted, he in colour. "GOAL" in thin
 * wide-spaced Bodoni caps between two stars; his first and last name set vertically down the edges; his
 * club's exact name in the outlined pill; NEYOD logo under it. No score.
 */
export function Goalnateditorial({ data }: { data: RenderData }) {
  const { content } = data;
  return (
    <NatEditorialFrame
      data={data}
      word={(content.kicker || "Goal").toUpperCase()}
      leftV={(content.firstName || "").toUpperCase()}
      rightV={(content.lastName || "").toUpperCase()}
      pill={ourClub(data).toUpperCase()}
    />
  );
}
