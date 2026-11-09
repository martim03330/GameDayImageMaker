/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";
const PAPER = "#fbf9f4";
const INK = "#17191e";

/** The header strip colour: params.accent when white type reads on it (not too light), else the primary, else ink. */
function stripOf(data: RenderData): string {
  const ok = (c?: string) => {
    const hex = (c ?? "").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return false;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 165;
  };
  const { accent, primary } = data.params;
  return ok(accent) ? accent! : ok(primary) ? primary! : INK;
}

/** The calendar page: white paper, rounded, soft shadow, a coloured strip with the month, the day big, the time at the foot. */
function CalendarTile({ w, x, y, month, day, time, color }: { w: number; x: number; y: number; month: string; day: string; time: string; color: string }) {
  const s = w / 220;
  const strip = 62 * s;
  const h = w * 1.12;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 20 * s,
        background: PAPER,
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,.2), 0 16px 40px rgba(0,0,0,.34)",
        display: "flex",
        flexDirection: "column",
        color: INK,
      }}
    >
      <div style={{ height: strip, background: color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* two binding rings */}
        {[0.28, 0.72].map((p) => (
          <div key={p} style={{ position: "absolute", top: 10 * s, left: w * p - 5 * s, width: 10 * s, height: 10 * s, borderRadius: "50%", background: "rgba(0,0,0,.28)" }} />
        ))}
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30 * s, letterSpacing: "0.22em", marginLeft: "0.22em", color: "#ffffff", lineHeight: 1, marginTop: 6 * s }}>{month}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: (day.length > 2 ? 70 : 112) * s, letterSpacing: "-0.03em", lineHeight: 1 }}>{day}</span>
      </div>
      {time && (
        <div style={{ borderTop: `${1.5 * s}px solid rgba(23,25,30,.14)`, height: 46 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 * s, letterSpacing: "0.08em", lineHeight: 1, opacity: 0.7 }}>{time}</span>
        </div>
      )}
    </div>
  );
}

type Line = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * Natural · calendar (matchday): his own match photo full-bleed (real grass, stands, light — light grade only)
 * and one idea: a small calendar page — white paper, rounded, soft shadow, a club-colour strip with the month
 * ("OCT"), the day ("25") big below, the kick-off small at its foot — in the clear upper area, with "MATCHDAY"
 * and HOME v AWAY (exact names, home first) in white beside it. His face sits below the group (hair never
 * under it), the NEYOD logo alone at the foot. No headroom: the group goes to the lower-left, the logo to the top.
 */
export function Natcalendar({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.26 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  const fx = natFixture(data);
  const [day, month] = fx.date ? fx.date.split(" ") : ["", ""];
  const pt = content.timePt && content.timePt !== fx.time ? `${content.timePt} ${content.timeRef || "PT"}` : "";
  const kicker = (content.kicker || "MATCHDAY").toUpperCase();
  const home = fx.homeName.toUpperCase();
  const away = fx.awayName.toUpperCase();
  const lines: Line[] = [
    { text: kicker, size: 50, weight: 800, tracking: 0.04 },
    { text: home, size: 25, weight: 700, tracking: 0.1 },
    { text: home && away ? `v  ${away}` : away, size: 25, weight: 700, tracking: 0.1 },
    { text: pt, size: 19, weight: 700, tracking: 0.2, opacity: 0.9 },
  ].filter((l) => l.text);

  const gapX = 40 * k;
  const gap = 14 * k;
  const under = 36 * k;
  const top0 = (story ? STORY_TOP + 8 : 66) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const fit = (w: number) => lines.map((l, i) => ({ ...l, px: Math.min(l.size * k * ts, w / Math.max(1, capsEm(l.text, l.tracking))), gapBefore: i === 1 ? gap * 1.6 : i ? gap : 0 }));
  /** One tile size: the lines beside the tile (or under it when the names are too long), his face below the group. */
  const layout = (w: number) => {
    const th = w * 1.12;
    let sized = fit(maxW - w - gapX);
    const beside = sized.every((l) => l.px >= Math.min(l.size, 22) * k * 0.95);
    if (!beside) sized = fit(maxW);
    const linesH = sized.reduce((h, l) => h + l.px + l.gapBefore, 0);
    const blockH = beside ? Math.max(th, linesH) : th + under + linesH;
    const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, top0 + blockH + 56 + fs * 0.75), fs });
    const upper = place.fy - place.fs * 0.8 >= top0 + blockH + 24;
    return { w, th, sized, beside, linesH, blockH, place, upper };
  };
  const full = Math.round((story ? 250 : 196) * ts);
  const big = layout(full);
  const small = big.upper ? big : layout(Math.round(full * 0.82));
  const L = small.upper ? small : big;
  const { w, th, sized, beside, linesH, blockH, place, upper } = L;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const groupTop = upper ? top0 : footBottom - blockH;
  const tileTop = beside ? groupTop + (blockH - th) / 2 : groupTop;
  const textLeft = beside ? M + w + gapX : M + 4 * k;
  let y = beside ? groupTop + (blockH - linesH) / 2 : groupTop + th + under;
  const placed = sized.map((l) => {
    y += l.gapBefore;
    const top = y;
    y += l.px;
    return { ...l, top };
  });
  const groupBottom = groupTop + blockH;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: groupBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,.2) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - groupTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <CalendarTile w={w} x={M} y={tileTop} month={month || "—"} day={day || "?"} time={fx.time} color={stripOf(data)} />
      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: textLeft, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, color: "#ffffff", textShadow: SMALL_SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}
