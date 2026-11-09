/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export type Pill = { text: string; /** The label chip ("MATCHDAY" / "GOAL"): larger, heavier. */ main?: boolean };

/** Chip type: size (post px), weight, tracking (em). */
const MAIN = { size: 34, weight: 800, tracking: 0.16 };
const INFO = { size: 23, weight: 700, tracking: 0.1 };
/** Inter caps run a little wider than capsEm's table: keep a safety margin when fitting. */
const SAFE = 1.08;

/**
 * The shared frame of the natural pill looks: his photo full-bleed (real grass, stands, light) and one idea —
 * a few rounded "chip" labels stacked left-aligned in a clear area, like tags on the photo. Over the clear
 * upper area (sky / stands, often bright) the chips are dark glass with white type; down at the foot over
 * the grass they are white (~92%) with dark type. His face sits below the stack (his hair never under it);
 * with no headroom the stack goes to the lower-left and the NEYOD logo to the top corner away from his head.
 */
export function NatPillFrame({ data, pills, mainSize = MAIN.size }: { data: RenderData; pills: Pill[]; /** The label chip's type size in the post (px). */ mainSize?: number }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = W - 2 * M;
  const minInfo = story ? 30 : 22;

  /* ---- chips: type size, padding, height (all from the type size) ---- */
  const chips = pills
    .filter((p) => p.text)
    .map((p) => {
      const t = p.main ? { ...MAIN, size: mainSize } : INFO;
      const want = t.size * k * ts;
      const padX = want * (p.main ? 0.78 : 0.82);
      const fit = (maxW - 2 * padX) / Math.max(1, capsEm(p.text, t.tracking) * SAFE);
      const px = Math.max(Math.min(want, fit), p.main ? want * 0.7 : minInfo);
      const padY = px * (p.main ? 0.5 : 0.56);
      return { ...p, ...t, px, padX: px * (p.main ? 0.78 : 0.82), padY, h: px + 2 * padY };
    });
  const gap = 12 * k;
  const blockH = chips.reduce((h, c, i) => h + c.h + (i ? gap : 0), 0);

  /* ---- upper layout: the stack at the top-left, his face below it ---- */
  const topCap = (story ? STORY_TOP : 70) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, topCap + blockH + 64 + fs * 0.75), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 28;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  const top = upper ? topCap : footBottom - blockH;
  const typeBottom = top + blockH;

  /* ---- the chip stack's own box, and his figure where the stack / logo would meet it ---- */
  const stackW = Math.max(...chips.map((c) => capsEm(c.text, c.tracking) * c.px * SAFE + 2 * c.padX));
  const { box } = place;
  const boxRight = box.left + box.width;
  // Low down (legs / shorts) he is narrower than his box (raised arms): about 1.4 face-heights each side.
  const legL = Math.max(box.left, place.fx - 1.4 * place.fs);
  const legR = Math.min(boxRight, place.fx + 1.4 * place.fs);

  /* ---- the NEYOD logo alone, never on his kit, ≥ 56px clear of the chips ---- */
  const footLogoTop = (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0);
  const topLogoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const leftX = M;
  const rightX = W - M - logoW;
  let logoTop: number;
  let logoLeft: number;
  if (upper) {
    // Stack at the top: the logo at the foot on the side his figure leaves clear; else the top-right corner
    // beside the stack (when it clears the chips and his head); else centred at the foot.
    const chipsClearRight = chips.every((c, i) => {
      const cTop = top + chips.slice(0, i).reduce((h, d) => h + d.h + gap, 0);
      const cRight = M + capsEm(c.text, c.tracking) * c.px * SAFE + 2 * c.padX;
      return cRight + 56 <= rightX || cTop >= topLogoTop + logoH + 56;
    });
    const headClear = hairTop >= topLogoTop + logoH + 48 || place.fx + 0.8 * place.fs < rightX - 24;
    if (box.left >= M + logoW + 24) [logoTop, logoLeft] = [footLogoTop, leftX];
    else if (boxRight <= rightX - 24) [logoTop, logoLeft] = [footLogoTop, rightX];
    else if (chipsClearRight && headClear) [logoTop, logoLeft] = [topLogoTop, rightX];
    else [logoTop, logoLeft] = [footLogoTop, (W - logoW) / 2];
  } else {
    // Stack at the foot: the logo up in the corner away from his head.
    [logoTop, logoLeft] = [topLogoTop, place.fx > W / 2 ? leftX : rightX];
  }
  const logoAtFoot = logoTop > H / 2;

  /* Up top (bright sky / stands): dark glass chips. At the foot: white chips over the grass, but dark glass
     where the stack crosses his legs (a white kit would swallow white chips). */
  const crossesHim = legL < M + stackW - 10 && legR > M && box.top + box.height > top;
  const dark = upper || crossesHim;
  const chipBg = dark ? "rgba(14,16,20,.74)" : "rgba(255,255,255,.92)";
  const chipInk = dark ? "#ffffff" : "#111418";
  const chipEdge = dark ? "inset 0 0 0 1px rgba(255,255,255,.22)" : "inset 0 0 0 1px rgba(255,255,255,.6)";
  const chipShadow = dark ? "0 4px 18px rgba(0,0,0,.22)" : "0 2px 4px rgba(0,0,0,.16), 0 6px 22px rgba(0,0,0,.24)";

  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 160 : 120), background: "linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,0))" }
    : { top: top - (story ? 220 : 160), bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.26) 60%, rgba(0,0,0,.34))" };
  const logoShade = logoAtFoot
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}

      {/* A soft local shade where the chips sit and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column", alignItems: "flex-start", gap }}>
        {chips.map((c) => (
          <div
            key={c.text}
            style={{
              height: c.h,
              boxSizing: "border-box",
              padding: `0 ${c.padX - c.tracking * c.px}px 0 ${c.padX}px`,
              display: "flex",
              alignItems: "center",
              borderRadius: c.h / 2,
              background: chipBg,
              boxShadow: `${chipEdge}, ${chipShadow}`,
              fontFamily: SANS,
              fontWeight: c.weight,
              fontSize: c.px,
              lineHeight: 1,
              letterSpacing: `${c.tracking}em`,
              whiteSpace: "nowrap",
              color: chipInk,
            }}
          >
            {c.text}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · pills (matchday): his own match photo full-bleed, light grade only, and one idea: rounded chip
 * labels stacked left-aligned in a clear area — "MATCHDAY", "25 OCT · 15:00", "HOME v AWAY" (exact names,
 * home first), the venue. The NEYOD logo alone, clear of them.
 */
export function Natpill({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const kick = (data.content.kicker || "Matchday").trim().toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join(" · ");
  return <NatPillFrame data={data} pills={[{ text: kick, main: true }, { text: when }, { text: match }, { text: (fx.venue || "").toUpperCase() }]} />;
}
