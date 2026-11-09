import type { CSSProperties } from "react";
import { Film } from "./fx";
import { EchoLine, echoTones, FootFade, footTexts, goalBox, M, Player, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo bar: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and one thin club-colour rule across the lower third,
 * a refined caption set on it on the free side: "GOAL" small and wide-tracked in the club colour, his name
 * above the rule, the fixture (home first, names exactly as stored, no score) and the competition tiny below,
 * NEYOD under it on the same margin. No box, no plate: just the line and the type.
 */
export function Goalechobar({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo, clubLine } = echoTones(data);
  // He stands on params.side; the caption reads from the other edge.
  const toRight = params.side !== "left";

  /* ---- the caption, bottom up: competition, fixture, the rule, name, kicker ---- */
  const t = footTexts(data, k, story ? 860 : 700);
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.5;
  const kSize = Math.max(13 * k, Math.min(17 * k, 400 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const N_TRACK = 0.1;
  const nameSize = Math.max(22 * k, Math.min(46 * k, (story ? 900 : 760) / Math.max(1, capsEm(t.name, N_TRACK)))) * ts;
  // Story: the logo (~88px) ends at STORY_BOTTOM (top 1592); the last line ends 64px above it. Post: logo top ~1254.
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150 - 4) - (params.textY ?? 0);
  const compTop = lastBottom - t.compSize;
  const fixTop = (t.comp ? compTop - 14 * k : lastBottom) - t.fixSize;
  const barH = story ? 3 : 2;
  const barY = fixTop - 24 * k - barH;
  const nameTop = barY - 20 * k - nameSize * 0.86;
  const kTop = nameTop - 18 * k - kSize;

  /* ---- the player, on his side ---- */
  const cx = 540 + (toRight ? 1 : -1) * (story ? 90 : 110);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 380 : 270, cx, maxW: story ? 900 : 860, story, minHead: (story ? STORY_TOP : 60) + 10 });
  const dx = (toRight ? -1 : 1) * 28 * k;
  const dy = -24 * k;

  const side: CSSProperties = toRight ? { left: M, textAlign: "left" } : { right: M, textAlign: "right" };
  const line = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    position: "absolute",
    ...side,
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    // Trailing tracking would push right-aligned lines off the margin.
    marginRight: toRight ? 0 : `-${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: WHITE,
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 46% at ${toRight ? 60 : 40}% ${story ? 36 : 38}%, ${lift}, ${deep} 82%)` }} />

      <EchoLine id="goalechobar" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={story ? STORY_TOP - 60 : 40} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* The rule: from the caption's edge across the lower third, stopping a margin short of the far edge. */}
      <div style={{ position: "absolute", top: barY, height: barH, [toRight ? "left" : "right"]: 0, width: CANVAS_W - M, background: `linear-gradient(to ${toRight ? "right" : "left"}, ${clubLine} 0%, ${clubLine} 55%, transparent 100%)` }} />

      <div style={{ ...line(kSize, K_TRACK, 500), top: kTop, color: clubLine }}>{kicker}</div>
      {t.name && <div style={{ ...line(nameSize, N_TRACK, 600), top: nameTop }}>{t.name}</div>}
      {t.fixture && <div style={{ ...line(t.fixSize, t.F_TRACK, 500, { opacity: 0.86 }), top: fixTop }}>{t.fixture}</div>}
      {t.comp && <div style={{ ...line(t.compSize, t.F_TRACK, 500, { opacity: 0.58 }), top: compTop }}>{t.comp}</div>}

      {/* NEYOD under the caption, on its margin. */}
      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", [toRight ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: toRight ? "left bottom" : "right bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
