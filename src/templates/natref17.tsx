/* eslint-disable @next/next/no-img-element */
import { natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { Filled } from "./natref4";
import { Shell, fit, frameOf } from "./natref1";
import { SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 69 · natural RESULT looks, each after ONE real reference captured this round (Pinterest), photo treatment
 * first. Photos only through the Shell and `Filled` (the graded ground with him removed, so no second copy of him
 * shows); he and his face stay sharp and in colour. The score always has its own clear space.
 *
 *   resultnatrefsideband  "1 · FULL-TIME · 4" (Stoke v Man Utd youth; Pinterest "full time score poster minimal photo",
 *                         row 2 col 5)
 *     treatment: muted overcast daylight — the real photo in natural colour, a little drained and softened, a touch
 *                cool; he stays as photographed
 *     type:      a solid dark slate band down the side away from him (about 36% of the frame) with a hairline near
 *                its outer edge; in it, centred: home crest, the home goals huge in a heavy grotesque, "FULL-TIME"
 *                tracked small, the away goals, the away crest. The photo slides clear of the band.
 *
 *   resultnatrefcyanfog   "FULL-TIME 0 | 3" (Palermo v Man City; Pinterest "full time graphic football photo design",
 *                         row 4 col 4)
 *     treatment: cool, slightly dimmed photo with a violet-to-cyan haze rising from the foot (violet at the left,
 *                bright cyan at the right) and a faint violet haze at the top
 *     type:      "FULL-TIME" tracked small, the score huge in a heavy grotesque split by a thin cyan bar, each crest
 *                on a small square tile beside its number (his club's colour / the cyan) — at the foot over the ground's haze (the haze is ground only;
 *                he stays untouched, the score reads on a soft dark backing behind its block)
 */

const W = CANVAS_W;

const goalsOf = (d: RenderData) => [d.content.homeGoals ?? "–", d.content.awayGoals ?? "–"].map((g) => String(g).trim() || "–");

/** A crest, or — with no crest — the club's exact name, wrapped (never cut). */
function CrestOr({ src, name, size, px, color }: { src: string | null; name: string; size: number; px: number; color: string }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain" }} />;
  return <div style={{ maxWidth: size * 2.4, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: px, lineHeight: 1.15, letterSpacing: "0.06em", textTransform: "uppercase", color }}>{name}</div>;
}

/* ===== resultnatrefsideband — the score stacked in a slate side band ===== */

const SLATE = "#2c3633";

export function Resultnatrefsideband({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  // The band on the side away from him (the reference: he on the left, the band on the right).
  const bandRight = d.params.side !== "right";
  const bw = Math.round(W * 0.36);
  const photoW = W - bw;
  const want = { fx: bandRight ? photoW * 0.5 : bw + photoW * 0.5, fy: story ? 700 : 500, fs: story ? 220 : 150 };
  const p0 = natPlace(d, W, H, want);
  // The framed photo (ground and figure together, as the "move player" nudge does) slides away from the band until
  // his face is well clear of it and most of his body is in the photo part; the strip it uncovers lies under the band.
  const b0 = p0.box;
  const nx0 = p0.nudge?.x ?? 0;
  const faceNeed = bandRight ? p0.fx + nx0 + p0.faceW * 0.9 + 70 - photoW : bw + 70 - (p0.fx + nx0 - p0.faceW * 0.9);
  const bodyNeed = bandRight ? b0.left + b0.width * 0.82 - photoW : bw - (b0.left + b0.width * 0.18);
  const room = bandRight ? p0.fx + nx0 - p0.faceW * 0.9 - 40 : W - 40 - (p0.fx + nx0 + p0.faceW * 0.9);
  const slide = Math.max(0, Math.min(bw, Math.max(faceNeed, bodyNeed), room));
  const dd = slide ? { ...d, params: { ...d.params, playerX: (d.params.playerX ?? 0) + (bandRight ? -slide : slide) } } : d;
  const place = slide ? natPlace(dd, W, H, want) : p0;
  // The stack, centred in the band: numbers as big as the band allows (the reference: about a fifth of the frame).
  const inner = bw - 2 * 30 * k;
  const nLen = Math.max(hg.length, ag.length, 1);
  const nPx = Math.min(fit(470 * k * ts, inner, nLen, 0.64), 470 * k * ts);
  const tPx = 25 * k * ts;
  const cs = 118 * k;
  const gap = 56 * k;
  const stackH = cs + gap + nPx * 0.78 + gap * 1.1 + tPx + gap * 1.1 + nPx * 0.78 + gap + cs;
  const top = H * 0.5 - stackH / 2;
  const at = bandRight ? { right: 0 } : { left: 0 };
  const num = { fontFamily: SANS, fontWeight: 800, fontSize: nPx, lineHeight: 0.78, letterSpacing: "-0.03em", whiteSpace: "nowrap" as const, color: "#fff" };
  return (
    <Shell
      data={dd}
      place={place}
      bg={SLATE}
      // The reference's photo treatment: muted overcast daylight — natural colour, a little drained, softer, a touch
      // cool. His sharp figure goes on top, ungraded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.8) contrast(.94) brightness(1.02)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(150,170,180,.12)", mixBlendMode: "soft-light" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(225,232,235,.07)" }} />
        </>
      }
      front={
        <div style={{ position: "absolute", top: 0, bottom: 0, width: bw, ...at, background: SLATE }}>
          {/* The hairline near the outer edge. */}
          <div style={{ position: "absolute", top: 0, bottom: 0, [bandRight ? "right" : "left"]: 20 * k, width: Math.max(2, 2 * k), background: "rgba(236,222,222,.55)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CrestOr src={fx.homeCrest} name={fx.homeName} size={cs} px={tPx * 0.9} color="#fff" />
            <div style={{ height: gap }} />
            <div style={num}>{hg}</div>
            <div style={{ height: gap * 1.1 }} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: tPx, lineHeight: 1, letterSpacing: "0.14em", whiteSpace: "nowrap", color: "rgba(255,255,255,.88)" }}>FULL-TIME</div>
            <div style={{ height: gap * 1.1 }} />
            <div style={num}>{ag}</div>
            <div style={{ height: gap }} />
            <CrestOr src={fx.awayCrest} name={fx.awayName} size={cs} px={tPx * 0.9} color="#fff" />
          </div>
        </div>
      }
    />
  );
}

/* ===== resultnatrefcyanfog — the score in a violet-to-cyan haze at the foot ===== */

const CYAN = "#3cc8f0";
const HAZE = "linear-gradient(to right, rgba(132,96,170,.95) 0%, rgba(84,128,206,.95) 45%, rgba(46,182,232,.97) 100%)";

export function Resultnatrefcyanfog({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  // The score block at the foot: "FULL-TIME", then the numbers with the bar between and a tile either side.
  const nLen = Math.max(hg.length, ag.length, 1);
  const tile = 132 * k;
  const nPx = Math.min(fit(380 * k * ts, (W - 2 * 50 - 2 * tile - 2 * 40 * k - 70 * k) / 2, nLen, 0.64), 380 * k * ts);
  const tPx = 24 * k * ts;
  const nTop = bottom - 120 * k - nPx * 0.76;
  const tTop = nTop - 46 * k - tPx;
  // He stands with his face well above the haze: when his photo frames it lower, the framed photo goes up.
  const want = { fx: d.params.side === "left" ? 440 : 640, fy: story ? 760 : 540, fs: story ? 230 : 160 };
  const p0 = natPlace(d, W, H, want);
  const faceBottom = p0.fy + (p0.nudge?.y ?? 0) + p0.fs * 0.7;
  const lift = Math.max(0, Math.min(story ? 420 : 300, faceBottom - (tTop - 300 * k)));
  const dd = lift ? { ...d, params: { ...d.params, playerY: (d.params.playerY ?? 0) - lift } } : d;
  const place = lift ? natPlace(dd, W, H, want) : p0;
  const hazeTop = tTop - 330 * k;
  const pct = (y: number) => `${Math.max(0, Math.min(100, (y / H) * 100))}%`;
  const ink = clubInk(d);
  const ourHome = d.content.home !== false;
  const tileOf = (src: string | null, name: string, ours: boolean) => (
    <div style={{ width: tile, height: tile, borderRadius: 14 * k, background: ours ? ink : CYAN, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 * k, boxSizing: "border-box", flexShrink: 0 }}>
      <CrestOr src={src} name={name} size={tile - 30 * k} px={13 * k} color="#fff" />
    </div>
  );
  const num = { fontFamily: SANS, fontWeight: 800, fontSize: nPx, lineHeight: 0.76, letterSpacing: "-0.02em", whiteSpace: "nowrap" as const, color: "#fff", textShadow: "0 2px 6px rgba(10,16,44,.45), 0 4px 30px rgba(10,16,44,.4)" };
  return (
    <Shell
      data={dd}
      place={place}
      bg="#2a3550"
      // The reference's photo treatment: the photo cooled and a little dimmed, a violet haze faint at the top and a
      // violet-to-cyan haze rising from the foot. His sharp figure goes on top, ungraded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "brightness(.84) saturate(.78) contrast(1.04) hue-rotate(-6deg)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(60,90,150,.28)", mixBlendMode: "soft-light" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.3, background: "linear-gradient(to bottom, rgba(176,160,214,.38), rgba(176,160,214,0))" }} />
          <div style={{ position: "absolute", inset: 0, background: HAZE, WebkitMaskImage: `linear-gradient(to bottom, transparent ${pct(hazeTop - 260 * k)}, rgba(0,0,0,.75) ${pct(tTop)}, #000 ${pct(bottom)})`, maskImage: `linear-gradient(to bottom, transparent ${pct(hazeTop - 260 * k)}, rgba(0,0,0,.75) ${pct(tTop)}, #000 ${pct(bottom)})` }} />
        </>
      }
      front={
        <>
          {/* A soft dark backing behind the score block only (he stays untouched elsewhere, legs included). */}
          <div style={{ position: "absolute", left: 0, right: 0, top: tTop - 120 * k, height: nTop + nPx * 0.76 - tTop + 240 * k, background: "radial-gradient(ellipse 58% 52% at 50% 52%, rgba(16,22,52,.66) 0%, rgba(16,22,52,.46) 50%, rgba(16,22,52,0) 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: tTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: tPx, lineHeight: 1, letterSpacing: "0.22em", whiteSpace: "nowrap", color: "#fff" }}>FULL-TIME</div>
          <div style={{ position: "absolute", left: 50, right: 50, top: nTop, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {tileOf(fx.homeCrest, fx.homeName, ourHome)}
            <div style={{ display: "flex", alignItems: "center", gap: 40 * k }}>
              <div style={{ ...num, minWidth: nPx * 0.62 * nLen, textAlign: "right" }}>{hg}</div>
              <div style={{ width: Math.max(4, 5 * k), height: nPx * 0.42, background: CYAN, borderRadius: 2 }} />
              <div style={{ ...num, minWidth: nPx * 0.62 * nLen, textAlign: "left" }}>{ag}</div>
            </div>
            {tileOf(fx.awayCrest, fx.awayName, !ourHome)}
          </div>
        </>
      }
    />
  );
}
