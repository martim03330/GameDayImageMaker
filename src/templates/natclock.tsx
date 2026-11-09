/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

/** "15:00" / "15h00" / "3:30" → hours + minutes (null when no time is known). */
function clockTime(time: string): { h: number; m: number } | null {
  const m = time.match(/(\d{1,2})\s*[:h.]\s*(\d{2})/i);
  if (!m) return null;
  return { h: Number(m[1]) % 24, m: Number(m[2]) % 60 };
}

/** The analogue clock: thin white ring, 12 ticks, hour + minute hands at the kick-off time, the double shadow. */
function Clock({ d, x, y, t, id }: { d: number; x: number; y: number; t: { h: number; m: number }; id: string }) {
  const r = d / 2;
  const s = d / 260;
  const ring = 5 * s;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const major = i % 3 === 0;
    const r1 = r - ring - 10 * s;
    const r0 = r1 - (major ? 30 : 16) * s;
    return { x0: r + Math.sin(a) * r0, y0: r - Math.cos(a) * r0, x1: r + Math.sin(a) * r1, y1: r - Math.cos(a) * r1, w: (major ? 6 : 3.5) * s };
  });
  const ha = (((t.h % 12) + t.m / 60) * Math.PI) / 6;
  const ma = (t.m * Math.PI) / 30;
  const hand = (a: number, len: number, back: number) => ({ x0: r - Math.sin(a) * back, y0: r + Math.cos(a) * back, x1: r + Math.sin(a) * len, y1: r - Math.cos(a) * len });
  const hh = hand(ha, r * 0.5, 14 * s);
  const mh = hand(ma, r * 0.76, 18 * s);
  return (
    <svg width={d} height={d} style={{ position: "absolute", left: x, top: y, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} stroke="#ffffff" strokeLinecap="round" fill="none">
        <circle cx={r} cy={r} r={r - ring / 2} strokeWidth={ring} />
        {ticks.map((k, i) => (
          <line key={i} x1={k.x0} y1={k.y0} x2={k.x1} y2={k.y1} strokeWidth={k.w} />
        ))}
        <line x1={hh.x0} y1={hh.y0} x2={hh.x1} y2={hh.y1} strokeWidth={10 * s} />
        <line x1={mh.x0} y1={mh.y0} x2={mh.x1} y2={mh.y1} strokeWidth={6 * s} />
        <circle cx={r} cy={r} r={9 * s} fill="#ffffff" stroke="none" />
      </g>
    </svg>
  );
}

type Line = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * Natural · clock (matchday): his own match photo full-bleed (real grass, stands, light — light grade only)
 * and one idea: a minimal analogue clock — a thin white ring, 12 ticks, the hour and minute hands set to the
 * kick-off time — in the clear upper area, with "KICK-OFF 15:00" and HOME v AWAY (exact names, home first)
 * small beside it. His face sits below the clock (hair never under it), the NEYOD logo alone at the foot.
 * No headroom in the photo: the clock group goes to the lower-left over the grass, the logo to the top corner.
 */
export function Natclock({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.26 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  const fx = natFixture(data);
  const t = clockTime(fx.time) ?? { h: 10, m: 10 };
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = content.timePt && content.timePt !== fx.time ? `${content.timePt} ${content.timeRef || "PT"}` : "";
  const kicker = (content.kicker || "MATCHDAY").toUpperCase();
  const lines: Line[] = [
    { text: [kicker, fx.date, pt].filter(Boolean).join("  ·  "), size: 19, weight: 700, tracking: 0.24, opacity: 0.9 },
    { text: fx.time ? `KICK-OFF ${fx.time}` : "", size: 38, weight: 800, tracking: 0.06 },
    { text: match, size: 22, weight: 700, tracking: 0.12 },
  ].filter((l) => l.text);

  /* ---- the clock with the lines beside it (or under it when the names are too long to sit beside) ---- */
  const gapX = 44 * k;
  const gap = 16 * k;
  const under = 40 * k;
  const top0 = (story ? STORY_TOP + 8 : 66) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const fit = (w: number, kk: number) => lines.map((l) => ({ ...l, px: Math.min(l.size * kk * ts, w / Math.max(1, capsEm(l.text, l.tracking))) }));
  /** One clock size: the lines beside it (or under it when the names are too long), his face below the group. */
  const layout = (d: number, kk: number) => {
    let sized = fit(maxW - d - gapX, kk);
    const beside = sized.every((l) => l.px >= Math.min(l.size, 20) * kk * 0.95);
    if (!beside) sized = fit(maxW, kk);
    const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
    const blockH = beside ? Math.max(d, linesH) : d + under + linesH;
    const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, top0 + blockH + 56 + fs * 0.75), fs });
    const upper = place.fy - place.fs * 0.8 >= top0 + blockH + 24;
    return { d, sized, beside, linesH, blockH, place, upper };
  };
  /* ---- the full clock at the top; a little smaller when his head is high; else the whole group at the foot ---- */
  const full = Math.round((story ? 290 : 224) * ts);
  const big = layout(full, k);
  const small = big.upper ? big : layout(Math.round(full * 0.8), k);
  const L = small.upper ? small : big;
  const { d, sized, beside, linesH, blockH, place, upper } = L;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const groupTop = upper ? top0 : footBottom - blockH;
  const clockTop = beside ? groupTop + (blockH - d) / 2 : groupTop;
  const textLeft = beside ? M + d + gapX : M + 4 * k;
  let y = beside ? groupTop + (blockH - linesH) / 2 : groupTop + d + under;
  const placed = sized.map((l) => {
    const top = y;
    y += l.px + gap;
    return { ...l, top };
  });
  const groupBottom = groupTop + blockH;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: groupBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.38), rgba(0,0,0,.22) 55%, rgba(0,0,0,0))" }
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

      <Clock d={d} x={M} y={clockTop} t={t} id={story ? "nc-soft-s" : "nc-soft"} />
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
