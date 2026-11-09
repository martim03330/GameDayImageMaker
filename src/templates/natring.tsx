/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const RING = "#ffd9bd";
const GLOW = "rgba(255,110,50,";
const SHADOW = "0 1px 3px rgba(0,0,0,.55), 0 2px 18px rgba(0,0,0,.45)";

/**
 * The shared frame of the "ring" natural looks (reference: "NO PRESSURE", a figure before a glowing sun
 * ring): his real photo slightly darkened, and one thin glowing ring of warm light BEHIND him — drawn
 * between the photo and the sharp figure layer, so it passes behind his head and shoulders, never over him.
 * At the foot, tiny: one word in spaced serif caps and one tracked line. The NEYOD logo at the top.
 */
export function NatRingFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const M = story ? 76 : 70;
  const maxW = CANVAS_W - 2 * M;

  const fs = story ? 210 : 150;
  const fx0 = params.side === "left" ? 450 : params.side === "right" ? 630 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 640 : 470, fs: fs });
  // The ring is centred a little under his face (round his head and shoulders), ~4.6 face-heights across.
  const d = place.fs * 4.6;
  const cx = place.fx;
  const cy = place.fy + place.fs * 0.55;

  const footY = (story ? STORY_BOTTOM : H - 64) - (params.textY ?? 0);
  const wPx = Math.min(34 * k * ts, maxW / Math.max(1, word.length * 0.95));
  const lPx = Math.min(15 * k * ts, maxW / Math.max(1, capsEm(line, 0.24)));
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const centred = { position: "absolute" as const, left: 0, width: CANVAS_W, textAlign: "center" as const, lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW, boxSizing: "border-box" as const };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1a0d08", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "brightness(.72) saturate(.9) contrast(1.05)" }} />
      {/* The warm light the ring throws on the photo around it. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle ${d * 0.85}px at ${cx}px ${cy}px, ${GLOW}.32), ${GLOW}0) 100%)`, mixBlendMode: "screen" }} />
      <div
        style={{
          position: "absolute",
          left: cx - d / 2,
          top: cy - d / 2,
          width: d,
          height: d,
          borderRadius: "50%",
          border: `${Math.max(3, d / 150)}px solid ${RING}`,
          boxShadow: `0 0 18px 4px ${GLOW}.9), 0 0 60px 14px ${GLOW}.5), inset 0 0 18px 4px ${GLOW}.8), inset 0 0 50px 10px ${GLOW}.35)`,
        }}
      />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 420 : 300, background: "linear-gradient(to top, rgba(10,4,2,.72), rgba(10,4,2,0))" }} />

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: (story ? STORY_TOP : 50) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
      <div style={{ ...centred, top: footY - lPx - 16 * k - wPx, paddingLeft: "0.5em", fontFamily: SERIF, fontWeight: 500, fontSize: wPx, letterSpacing: "0.5em" }}>{word}</div>
      <div style={{ ...centred, top: footY - lPx, paddingLeft: "0.24em", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", opacity: 0.85 }}>{line}</div>
    </div>
  );
}

/**
 * Natural · anel (matchday): his real photo, slightly darkened, with one thin glowing ring of warm light
 * behind his head and shoulders. At the foot, tiny: "MATCHDAY" in spaced serif caps and HOME V AWAY · date ·
 * kick-off (exact names, home first). NEYOD logo at the top.
 */
export function Natring({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} V ${fx.awayName.toUpperCase()}` : "";
  return <NatRingFrame data={data} word={(data.content.kicker || "Matchday").toUpperCase()} line={[match, fx.date, fx.kickoff].filter(Boolean).join("  ·  ")} />;
}

/**
 * Natural goal · anel: his real celebration photo with a thin glowing ring of warm light behind him. At the
 * foot, tiny: "GOAL" in spaced serif caps and his full name · his club's exact name. No score.
 */
export function Goalnatring({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  return <NatRingFrame data={data} word={(data.content.kicker || "Goal").toUpperCase()} line={[name, ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ")} />;
}
