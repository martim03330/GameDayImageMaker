/* eslint-disable @next/next/no-img-element */
import { keep, longDay, softCase } from "./natcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Real film subtitles: white with a thin dark outline and a soft drop, no box. */
const SUB_SHADOW =
  "0 0 2px #000, 0 0 2px #000, 1.5px 1.5px 0 rgba(0,0,0,.75), -1.5px -1.5px 0 rgba(0,0,0,.75), 1.5px -1.5px 0 rgba(0,0,0,.75), -1.5px 1.5px 0 rgba(0,0,0,.75), 0 2px 14px rgba(0,0,0,.6)";

/**
 * The shared frame of the natural subtitle looks: his photo full-bleed (real grass, stands and light, the
 * light grade only) and one or two centred lines near the foot in a clean sans, sentence case, white with a
 * thin dark outline — like the subtitles of a film. A barely-there shade at the foot keeps them readable on
 * white kit. The NEYOD logo small and alone at the top centre.
 */
export function SubtitleFrame({ data, lines, alt }: { data: RenderData; lines: string[]; /** Shorter lines used when `lines` would wrap past two lines. */ alt?: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 680 : 470,
    fs: story ? 262 : 180,
  });

  const base = (story ? 46 : 34) * ts;
  const maxW = CANVAS_W - 2 * (story ? 70 : 60) - 20;
  /** The size at which every line fits on one line (Inter 600 ≈ 0.55em per character). */
  const fit = (ls: string[]) => Math.min(base, ...ls.filter(Boolean).map((l) => maxW / (l.length * 0.55)));
  // Subtitles stay at one line each: shrink a little (to 84%) if needed, else use the shorter lines.
  const useAlt = !!alt && fit(lines) < base * 0.84;
  const shown = (useAlt ? alt : lines).filter(Boolean);
  const size = Math.max(base * 0.84, fit(shown));
  const bottom = (story ? STORY_BOTTOM - 40 : CANVAS_H - 96) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const shadeH = story ? 600 : 430;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The gentlest shades: a breath at the top for the logo, a soft one at the foot under the subtitles. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.22), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H - shadeH, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.3) 45%, rgba(0,0,0,.48))" }} />

      <div
        style={{
          position: "absolute",
          left: story ? 70 : 60,
          right: story ? 70 : 60,
          bottom: H - bottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: size * 0.28,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.22,
          textAlign: "center",
          color: "#ffffff",
          textShadow: SUB_SHADOW,
          textWrap: "balance",
        }}
      >
        {shown.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

/** "MATCHDAY" (or the kicker as typed) in sentence case: "Matchday". */
export function subWord(kicker: string | undefined, fallback: string): string {
  const raw = (kicker || fallback).replace(/’/g, "'").trim().replace(/[.!]+$/, "");
  const low = raw === raw.toUpperCase() ? raw.toLowerCase() : raw;
  return low.charAt(0).toUpperCase() + low.slice(1);
}

/**
 * Natural · subtitle (matchday): his own match photo almost untouched and two film-subtitle lines near the
 * foot — "Matchday. SC Vianense SAD v S. João Ver." / "25 October, 15:00 — Estádio …" (exact names as
 * stored, home first). The NEYOD logo small at the top centre.
 */
export function Natsubtitle({ data }: { data: RenderData }) {
  const { content } = data;
  const fx = natFixture(data);
  const word = subWord(content.kicker, "Matchday");
  const match = fx.homeName && fx.awayName ? `${keep(fx.homeName)} v ${keep(fx.awayName)}` : keep(fx.homeName || fx.awayName);
  const time = (content.timeLocal || content.time || "").replace(/h/i, ":").trim();
  const when = [keep(longDay(fx.date)), time].filter(Boolean).join(", ");
  const venue = softCase((content.venue ?? "").trim());
  const l1 = match ? `${word}. ${match}.` : `${word}.`;
  const l2 = [when, venue ? keep(venue) : ""].filter(Boolean).join("\u00a0— ");
  // When the venue is too long for one subtitle line, the second line keeps the date and kick-off only.
  return <SubtitleFrame data={data} lines={[l1, l2]} alt={[l1, when ? `${when}.` : ""]} />;
}
