/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 0 2px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.55), 0 3px 18px rgba(0,0,0,.5)";
const TRACK = 0.34;

/** Splits a long name into two balanced lines at a space (or keeps it whole). */
function balance(s: string): string[] {
  const words = s.split(/\s+/);
  if (words.length < 2) return [s];
  let best = [s];
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    // Never break after an abbreviation ("DR.", "S."): it belongs to the name that follows.
    const d = Math.abs(capsEm(a, TRACK) - capsEm(b, TRACK)) + (/\.$/.test(words[i - 1]) ? 100 : 0);
    if (d < diff) {
      diff = d;
      best = [a, b];
    }
  }
  return best;
}

/**
 * Natural · venue (matchday): his own match photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: the ground's name (the fixture venue, e.g. "ESTÁDIO DR. JOSÉ DE MATOS")
 * in wide-spaced caps across the top, centred; under it, small, "MATCHDAY · 25 OCT · 15:00" and HOME v AWAY
 * (exact names, home first). No venue known: "MATCHDAY" takes its place. His face sits below the type; the
 * NEYOD logo alone at the foot. When the photo has no headroom above him, the type runs along the foot
 * instead and the logo goes to the top corner away from his head.
 */
export function Natvenue({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 70 : 60;
  const maxW = CANVAS_W - 2 * M;

  const fx_ = natFixture(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const venue = (fx_.venue || "").trim().toUpperCase();
  const big = venue || kicker;
  const meta = [venue ? kicker : "", fx_.date, fx_.kickoff].filter(Boolean).join("  ·  ");
  const match = fx_.homeName && fx_.awayName ? `${fx_.homeName.toUpperCase()}  v  ${fx_.awayName.toUpperCase()}` : (fx_.homeName || fx_.awayName).toUpperCase();

  /* ---- the venue: one line across the width, or two balanced lines when one would be too small ---- */
  const cap = (story ? 60 : 46) * ts;
  const one = Math.min(cap, maxW / Math.max(1, capsEm(big, TRACK)));
  const rows = one >= 26 * k ? [big] : balance(big);
  const size = rows.length === 1 ? one : Math.min(cap, maxW / Math.max(1, ...rows.map((r) => capsEm(r, TRACK))));
  const lead = size * 1.22;
  const venueH = size + (rows.length - 1) * lead;

  const smalls = [
    { text: meta, size: 19, weight: 700, tracking: 0.3, opacity: 0.92 },
    { text: match, size: 21, weight: 700, tracking: 0.12, opacity: 1 },
  ]
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 30 * k;
  const smallH = smalls.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = venueH + (smalls.length ? under + smallH : 0);

  /* ---- his face below the type (hair ~0.75 face-heights above its centre) ---- */
  const topY = (story ? STORY_TOP + 6 : 78) - (params.textY ?? 0);
  const fs = story ? 240 : 156;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: Math.max(story ? 660 : 480, topY + blockH + 60 + fs * 0.75),
    fs,
  });
  const upper = place.fy - place.fs * 0.8 >= topY + blockH + 24;
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 54) - (params.textY ?? 0);
  const top = upper ? topY : footBottom - blockH;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (upper ? (story ? STORY_BOTTOM : CANVAS_H - 50) - logoH : story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: top + blockH + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.22) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - top + (story ? 240 : 180), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.28) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  let y = top + venueH + under;
  const placed = smalls.map((l) => {
    const t = y;
    y += l.px + gap;
    return { ...l, top: t };
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A soft local shade under the type and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The ground's name, wide-spaced across the width. */}
      {rows.map((r, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: 0, right: 0, top: top + i * lead - size * 0.14, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.28, letterSpacing: `${TRACK}em`, paddingLeft: `${TRACK}em`, whiteSpace: "nowrap", color: "#ffffff", textShadow: SHADOW }}
        >
          {r}
        </div>
      ))}

      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: 0, right: 0, top: l.top, textAlign: "center", fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, paddingLeft: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity, textShadow: SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}
