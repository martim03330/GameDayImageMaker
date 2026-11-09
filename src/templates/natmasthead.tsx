/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { NAT_SERIF, serifEm } from "./natserif";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** DM Serif Display: ascender (h, d, T) and descender (em). */
const ASC = 0.72;
const DESC = 0.24;

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";
const RULE_SHADOW = "0 1px 2px rgba(0,0,0,.4), 0 2px 10px rgba(0,0,0,.3)";

const DAYS: Record<string, string> = { MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY" };
const MONTHS: Record<string, string> = {
  JAN: "JANUARY", FEB: "FEBRUARY", FEV: "FEBRUARY", MAR: "MARCH", APR: "APRIL", ABR: "APRIL", MAY: "MAY", MAI: "MAY", JUN: "JUNE", JUL: "JULY",
  AUG: "AUGUST", AGO: "AUGUST", SEP: "SEPTEMBER", SET: "SEPTEMBER", OCT: "OCTOBER", OUT: "OCTOBER", NOV: "NOVEMBER", DEC: "DECEMBER", DEZ: "DECEMBER",
};

/** "SAT 25 OUT" → "SATURDAY, 25 OCTOBER"; "20 SET" → "20 SEPTEMBER" (the weekday only when it was stored). */
export function mastDate(raw: string | undefined): string {
  const m = (raw ?? "").toUpperCase().trim().match(/^(?:([A-Z]{3})\s+)?(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  const date = `${m[2]} ${MONTHS[m[3]] ?? m[3]}`;
  return m[1] && DAYS[m[1]] ? `${DAYS[m[1]]}, ${date}` : date;
}

/** The newspaper's double rule: a heavier line over a hairline. */
function DoubleRule({ top, left, width, k }: { top: number; left: number; width: number; k: number }) {
  const a = Math.round(3 * k);
  const b = Math.max(1, Math.round(1.5 * k));
  const gap = Math.round(4 * k);
  return (
    <>
      <div style={{ position: "absolute", left, top, width, height: a, background: "#ffffff", boxShadow: RULE_SHADOW }} />
      <div style={{ position: "absolute", left, top: top + a + gap, width, height: b, background: "#ffffff", boxShadow: RULE_SHADOW }} />
    </>
  );
}
const ruleH = (k: number) => Math.round(3 * k) + Math.round(4 * k) + Math.max(1, Math.round(1.5 * k));

/**
 * The shared frame of the natural masthead looks: his photo full-bleed (real grass, stands, light) and one
 * idea — a newspaper masthead across the top: the title in a big centred serif ("The Matchday" / "Goal"),
 * then a double rule, a small caps dateline, a double rule. White with the double shadow, on the photo. His
 * face sits below the masthead (hair never under it); the NEYOD logo alone at the foot. No headroom in the
 * photo: the masthead goes to the foot over the grass and the logo to the top corner away from his head.
 */
export function NatMastheadFrame({ data, title, dateline, split, max = 160 }: { data: RenderData; title: string; dateline: string; split: [string, string]; /** Largest title size in the post (px). */ max?: number }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the title: centred, as big as the width allows ---- */
  const size = Math.min((story ? max * 1.3 : max) * ts, (maxW - 20) / Math.max(1, serifEm(title)));
  /* ---- the dateline: one line when it stays readable, else fixture over date ---- */
  const TRACK = 0.16;
  const minPx = story ? 25 : 18;
  const want = (story ? 26 : 20) * ts;
  const fit = (t: string) => Math.min(want, (maxW - 8) / Math.max(1, capsEm(t, TRACK)));
  const one = fit(dateline);
  const lines = one >= minPx || !split[1] ? [{ text: dateline, px: one }] : split.filter(Boolean).map((t) => ({ text: t, px: fit(t) }));
  const px = Math.min(...lines.map((l) => l.px));
  const lineGap = 10 * k;
  const pad = 15 * k;
  const RH = ruleH(k);
  const dateH = lines.length * px + (lines.length - 1) * lineGap;
  const titleH = size * (ASC + DESC);
  const under = 14 * k;
  const blockH = titleH + under + RH + pad + dateH + pad + RH;

  /* ---- upper layout: masthead at the top, his face below it ---- */
  const topCap = (story ? STORY_TOP + 4 : 70) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, topCap + blockH + 56 + fs * 0.75), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const capTop = upper ? topCap : footBottom - blockH;
  const baseline = capTop + size * ASC;
  const rule1 = baseline + size * DESC + under;
  const dateTop = rule1 + RH + pad;
  const rule2 = dateTop + dateH + pad;
  const typeBottom = rule2 + RH;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  const fid = story ? "nmh-soft-s" : "nmh-soft";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <svg width={CANVAS_W} height={size * 1.4} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={fid} x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text x={CANVAS_W / 2} y={size} textAnchor="middle" filter={`url(#${fid})`} style={{ fontFamily: NAT_SERIF, fontWeight: 400, fontSize: size, letterSpacing: "-0.005em", fill: "#ffffff" }}>
          {title}
        </text>
      </svg>

      <DoubleRule top={rule1} left={M} width={maxW} k={k} />
      {lines.map((l, i) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: M, width: maxW, top: dateTop + i * (px + lineGap), textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", color: "#ffffff", textShadow: SMALL_SHADOW }}
        >
          {l.text}
        </div>
      ))}
      <DoubleRule top={rule2} left={M} width={maxW} k={k} />

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · masthead (matchday): his own match photo full-bleed, light grade only, and one idea: a newspaper
 * masthead across the top — "The Matchday" in a big centred Didone serif, then between thin double rules a
 * small caps dateline "SATURDAY, 25 OCTOBER · HOME v AWAY · 15:00" (exact names, home first). The NEYOD logo
 * alone at the foot.
 */
export function Natmasthead({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const kick = (data.content.kicker || "").trim();
  const title = kick && !/^match\s*day$/i.test(kick) ? kick.charAt(0).toUpperCase() + kick.slice(1).toLowerCase() : "The Matchday";
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const date = mastDate(data.content.date);
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const time = [fx.time, pt].filter(Boolean).join(" · ");
  const dateline = [date, match, time].filter(Boolean).join("  ·  ");
  return <NatMastheadFrame data={data} title={title} dateline={dateline} split={[match, [date, time].filter(Boolean).join("  ·  ")]} />;
}
