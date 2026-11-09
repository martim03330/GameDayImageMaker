/* eslint-disable @next/next/no-img-element */
import { refName } from "@/lib/timezone";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const MONTHS: Record<string, string> = {
  JAN: "January", FEB: "February", MAR: "March", APR: "April", MAY: "May", JUN: "June", JUL: "July", AUG: "August", SEP: "September", OCT: "October", NOV: "November", DEC: "December",
};

/** "25 OCT" → "25 October" (the Portuguese abbreviations already turned English by natFixture). */
export function longDay(date: string): string {
  const [d = "", m = ""] = date.split(/\s+/);
  return [d, MONTHS[m] ?? (m ? m.charAt(0) + m.slice(1).toLowerCase() : "")].filter(Boolean).join(" ");
}

/** Keeps a phrase (a club name, a date) on one line: its spaces become non-breaking. */
export const keep = (s: string) => s.replace(/ /g, "\u00a0");

/** The venue as stored, but never shouted: all-caps names get a title case. */
export function softCase(s: string): string {
  if (!s || s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s.'(-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

/**
 * The editorial caption shared by the natural caption looks: a tiny spaced caps label, a thin rule and a
 * small serif caption under it — laid out bottom-up from `bottom`, left-aligned on the margin, like a
 * photo caption in a magazine.
 */
export function CaptionBlock({ label, lead, rest, bottom, H, story, ts }: { label: string; lead: string; rest: string; bottom: number; H: number; story: boolean; ts: number }) {
  const k = story ? 1.36 : 1;
  const left = story ? 76 : 64;
  return (
    <div style={{ position: "absolute", left, right: left, bottom: H - bottom, display: "flex", flexDirection: "column", color: OFF_WHITE }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13 * k * ts, lineHeight: 1, letterSpacing: "0.42em", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,.5), 0 2px 12px rgba(0,0,0,.45)" }}>{label}</div>
      <div style={{ height: Math.max(1, Math.round(1.5 * k)), background: "rgba(244,241,234,.85)", margin: `${16 * k}px 0 ${18 * k}px`, boxShadow: "0 1px 4px rgba(0,0,0,.35)" }} />
      <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 27 * k * ts, lineHeight: 1.32, maxWidth: story ? 860 : 820, textWrap: "pretty", textShadow: "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.5)" }}>
        <span style={{ fontWeight: 600 }}>{lead}</span>
        {rest && <span style={{ opacity: 0.92 }}> {rest}</span>}
      </div>
    </div>
  );
}

/**
 * Natural · caption (matchday): his own match photo almost untouched — real grass, stands and light, only
 * the light grade — and at the foot, on the gentlest local shade, a magazine caption: a tiny "MATCHDAY"
 * label, a thin rule, then one small serif sentence — "Moisés Conceição. SC Vianense SAD v S. João Ver,
 * 25 October, 15:00, Estádio …" (exact names, home first). The NEYOD logo small at the top centre.
 */
export function Natcaption({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 660 : 460,
    fs: story ? 262 : 180,
  });

  const fx = natFixture(data);
  const name = keep([content.firstName, content.lastName].filter(Boolean).join(" "));
  const time = (content.timeLocal || content.time || "").replace(/h/i, ":").trim();
  const pt = content.timePt && content.timePt !== time ? `(${keep(`${content.timePt} in ${refName(content.timeRef)}`)})` : "";
  const when = [keep(longDay(fx.date)), [time, pt].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const match = fx.homeName && fx.awayName ? `${keep(fx.homeName)} v ${keep(fx.awayName)}` : keep(fx.homeName || fx.awayName);
  const rest = [match, when, softCase((content.venue ?? "").trim())].filter(Boolean).join(", ");
  const label = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();

  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 62) - (params.textY ?? 0);
  const shadeH = story ? 620 : 470;
  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The gentlest shades: a breath at the top for the logo, a soft one at the foot for the caption. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.24), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H - shadeH, bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.38) 45%, rgba(5,8,5,.64))" }} />

      <CaptionBlock label={label} lead={name ? `${name}.` : ""} rest={rest ? `${rest}.` : ""} bottom={bottom} H={H} story={story} ts={ts} />

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
