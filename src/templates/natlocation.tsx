/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 16px rgba(0,0,0,.5)";

/** Rough advance of mixed-case Inter 600 at 1px (venue names keep their own capitalisation). */
function mixedEm(text: string): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    if (/[MW]/.test(ch)) em += 0.86;
    else if (/[A-Z]/.test(ch)) em += 0.68;
    else if (/[mw]/.test(ch)) em += 0.84;
    else if (/[iljtfr]/.test(ch)) em += 0.32;
    else if (/[a-z0-9]/.test(ch)) em += 0.57;
    else if (ch === " ") em += 0.26;
    else em += 0.3;
  }
  return em;
}

/** Splits a long name into two balanced lines (never after an abbreviation like "Dr." / "S."). */
function balance(s: string): string[] {
  const words = s.split(/\s+/);
  if (words.length < 2) return [s];
  let best = [s];
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const d = Math.abs(mixedEm(a) - mixedEm(b)) + (/\.$/.test(words[i - 1]) ? 100 : 0);
    if (d < diff) {
      diff = d;
      best = [a, b];
    }
  }
  return best;
}

/** The Instagram location pin: a solid white teardrop with a round hole, soft shadow. */
function Pin({ x, y, h }: { x: number; y: number; h: number }) {
  const w = h * 0.74;
  return (
    <svg width={w} height={h} viewBox="0 0 24 32" style={{ position: "absolute", left: x, top: y, overflow: "visible", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.55)) drop-shadow(0 2px 10px rgba(0,0,0,.4))" }} aria-hidden>
      <path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.6 12 32 12 32s12-11.4 12-20.1C24 5.3 18.6 0 12 0z" fill="#ffffff" fillRule="evenodd" />
      <circle cx="12" cy="11.6" r="4.4" fill="rgba(0,0,0,.78)" />
    </svg>
  );
}

/**
 * Natural · location (matchday): his own match photo full-bleed — real grass, stands and light, only the
 * light grade — tagged like an Instagram post's location: a small map pin + the venue's name in medium sans
 * (as stored, its own capitalisation), and under it "MATCHDAY · 25 OCT · 15:00" and HOME v AWAY (exact
 * names, home first). Top-left in the clear area above him; when the photo has no headroom it sits at the
 * lower-left over the grass. No venue: the home team's name is the place. The NEYOD logo alone.
 */
export function Natlocation({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 72 : 60;

  const fx_ = natFixture(data);
  const place_ = (fx_.venue || fx_.homeName || fx_.awayName || "Matchday").trim();
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const meta = [kicker, fx_.date, fx_.kickoff].filter(Boolean).join("  ·  ");
  const match = fx_.homeName && fx_.awayName ? `${fx_.homeName.toUpperCase()}  v  ${fx_.awayName.toUpperCase()}` : (fx_.homeName || fx_.awayName).toUpperCase();

  /* ---- the tag: pin + venue (one line, or two balanced lines when one would be under ~34px) ---- */
  const pinH = 46 * k * ts;
  const pinW = pinH * 0.74;
  const textX = M + pinW + 16 * k;
  const nameW = CANVAS_W - M - textX;
  const cap = 48 * k * ts;
  const one = Math.min(cap, nameW / Math.max(1, mixedEm(place_)));
  const rows = one >= 36 * k ? [place_] : balance(place_);
  const size = rows.length === 1 ? one : Math.min(cap, nameW / Math.max(1, ...rows.map(mixedEm)));
  const lead = size * 1.12;
  const nameH = size + (rows.length - 1) * lead;

  const smalls = [
    { text: meta, size: 22, weight: 700, tracking: 0.2, opacity: 0.94 },
    { text: match, size: 24, weight: 700, tracking: 0.08, opacity: 1 },
  ]
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, nameW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 20 * k;
  const smallH = smalls.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = nameH + (smalls.length ? under + smallH : 0);

  /* ---- his face below the tag (hair ~0.8 face-heights above its centre) ---- */
  const topY = (story ? STORY_TOP + 4 : 70) - (params.textY ?? 0);
  const fs = story ? 240 : 156;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: Math.max(story ? 660 : 470, topY + blockH + 60 + fs * 0.75),
    fs,
  });
  const upper = place.fy - place.fs * 0.8 >= topY + blockH + 24;
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  const top = upper ? topY : footBottom - blockH;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (upper ? (story ? STORY_BOTTOM : CANVAS_H - 50) - logoH : story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: top + blockH + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.22) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - top + (story ? 240 : 180), background: "linear-gradient(to top, rgba(0,0,0,.52), rgba(0,0,0,.28) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  let y = top + nameH + under;
  const placed = smalls.map((l) => {
    const t = y;
    y += l.px + gap;
    return { ...l, top: t };
  });
  // The pin sits on the venue's first line (its point a touch under the baseline).
  const pinTop = top + size * 0.5 - pinH * 0.5;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A soft local shade under the tag and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <Pin x={M} y={pinTop} h={pinH} />
      {rows.map((r, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: textX, top: top + i * lead - size * 0.1, fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.2, letterSpacing: "-0.005em", whiteSpace: "nowrap", color: "#ffffff", textShadow: SHADOW }}
        >
          {r}
        </div>
      ))}

      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: textX + 2, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity, textShadow: SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}
