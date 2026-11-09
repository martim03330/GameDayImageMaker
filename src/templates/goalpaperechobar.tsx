import type { CSSProperties } from "react";
import { footTexts, goalBox, M } from "./goalechotitle";
import { ContactShade, goalPaperTones, PaperEdge, PaperGround, PaperPlayer, PaperTooth } from "./goalpaperechoname";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal paper echo bar: the celebrating player in natural colour on warm off-white paper, a soft shade where he
 * meets it and one hairline echo of his own edge offset behind him in the deep club colour (or ink) — and one
 * thin deep-club rule across the lower third with a refined ink caption on the free side: "GOAL" small and
 * wide-tracked in the club colour, his name above the rule, the fixture (home first, names exactly as stored,
 * no score) and the competition tiny below, NEYOD under it on the same margin. No box, no plate.
 */
export function Goalpaperechobar({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { ink, echo, paper, deepClub } = goalPaperTones(data);
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
  // He melts into the paper behind his name, so the caption sits on clean paper.
  const fadeEnd = nameTop + nameSize * 0.6;

  /* ---- the player, on his side ---- */
  const dx = (toRight ? -1 : 1) * 30 * k;
  const dy = -26 * k;
  const cx = 540 + (toRight ? 1 : -1) * (story ? 90 : 110);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 380 : 270, cx, maxW: story ? 900 : 860, story, minHead: (story ? STORY_TOP : 60) + 10 - dy });

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
    color: ink,
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <PaperGround data={data} x={toRight ? 60 : 40} y={story ? 36 : 38} />

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={!toRight} />
      {data.photoUrl && <PaperEdge id="goalpaperechobar" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={story ? STORY_TOP - 60 : 40} cut={data.cut} fadeEnd={fadeEnd} width={story ? 2.2 : 1.8} />}
      <PaperPlayer data={data} box={box} fadeEnd={fadeEnd} story={story} />

      {/* The rule: from the caption's edge across the lower third, fading out a margin short of the far edge. */}
      <div style={{ position: "absolute", top: barY, height: barH, [toRight ? "left" : "right"]: 0, width: CANVAS_W - M, background: `linear-gradient(to ${toRight ? "right" : "left"}, ${deepClub} 0%, ${deepClub} 55%, ${deepClub}00 100%)` }} />

      <div style={{ ...line(kSize, K_TRACK, 600), top: kTop, color: deepClub }}>{kicker}</div>
      {t.name && <div style={{ ...line(nameSize, N_TRACK, 600), top: nameTop }}>{t.name}</div>}
      {t.fixture && <div style={{ ...line(t.fixSize, t.F_TRACK, 500, { opacity: 0.82 }), top: fixTop }}>{t.fixture}</div>}
      {t.comp && <div style={{ ...line(t.compSize, t.F_TRACK, 500, { opacity: 0.56 }), top: compTop }}>{t.comp}</div>}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", [toRight ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: toRight ? "left bottom" : "right bottom" }} />
      <PaperTooth />
    </div>
  );
}
