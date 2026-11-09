/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, vivid } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { DISPLAY, SANS } from "./shared";
import { logoTopOf } from "./trend2";
import { matchFacts } from "./strokes";
import { CANVAS_W, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";
const INK = "#16181c";
/** Paint card width at post scale (story: ×1.3). */
const CARD = 700;

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const caps = (px: number, tracking = 0.2, shadow = true): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: shadow ? SHADOW : undefined });
const roundTitle = (data: RenderData) => {
  const f = matchFacts(data);
  const k = (data.content.kicker || "Matchday").toUpperCase();
  return f.roundNo ? `${k} ${f.roundNo}` : k;
};
const fixtureOf = (data: RenderData) => {
  const fx = natFixture(data);
  return fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
};
/** Date · kick-off · ground on one line, or on two (date · kick-off / ground) when one would shrink under ~26px. */
const whenRows = (data: RenderData, max: number, w: number, tracking: number): string[] => {
  const fx = natFixture(data);
  const one = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  if (!one || fit(one, max, w, tracking) >= Math.min(max, 26)) return one ? [one] : [];
  return [[fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase(), fx.venue.toUpperCase()].filter(Boolean);
};
const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();

/** The club's two colours as they are (swatches, shapes); a white second colour falls back to a light grey so it still shows. */
function clubPair(data: RenderData): [string, string] {
  const a = vivid(data.params.primary === "#10131c" ? data.params.accent : data.params.primary);
  let b = vivid(data.params.accent);
  if (Math.abs(luminance(a) - luminance(b)) < 0.08) b = luminance(a) > 0.5 ? "#1d2230" : "#f2f2f2";
  return [a, b];
}

/** The type block above his head on its own soft shade; he stands below it. */
function TopFrame({ data, blockH, children }: { data: RenderData; blockH: number; children: ReactNode }) {
  const { H, story, k, top, fx: faceX } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  // His head high in the photo (no room above it): the block goes to the foot, above the logo, off his face.
  const head = place.fy - place.fs * 0.8;
  const y = head >= top + blockH - 6 * k ? top : Math.max(top, logoTopOf(data, H) - 90 * k - blockH);
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 40, y: y - 120, w: CANVAS_W - 80, h: blockH + 240 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </PoolFrame>
  );
}

/** A paint-sample card: the club's two colours as chips on top, a white strip with the type under them. */
function SwatchCard({ data, k, lines }: { data: RenderData; k: number; lines: { text: string; px: number; weight: number; tracking: number; gap: number }[] }) {
  const [a, b] = clubPair(data);
  const w = CARD * k;
  const chip = 84 * k;
  return (
    <div style={{ width: w, background: "#fbfaf7", borderRadius: 14 * k, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,.35)" }}>
      <div style={{ display: "flex", height: chip }}>
        <div style={{ flex: 1, background: a }} />
        <div style={{ flex: 1, background: b }} />
      </div>
      <div style={{ padding: `${26 * k}px ${30 * k}px ${28 * k}px`, display: "flex", flexDirection: "column", alignItems: "flex-start", color: INK }}>
        {lines.map((l, i) => (
          <div key={i} style={{ ...caps(l.px, l.tracking, false), paddingLeft: 0, fontWeight: l.weight, marginTop: i ? l.gap : 0 }}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Amostra de cor (matchday) — after Sean Ford's Euro 2016 posters, which turn each nation's flag colours into
 * paint-sample palettes: a small paint card above his head, the club's two colours as chips on top, MATCHDAY 14,
 * the fixture (exact names) and date · kick-off · ground typed under them in dark ink.
 */
export function Swatchcard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const inner = CARD * k - 60 * k;
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, inner, 0.12);
  const wPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, inner, 0.12)));
  const lines = [
    { text: title, px: fit(title, 40 * k * ts, inner, 0.06), weight: 800, tracking: 0.06, gap: 0 },
    { text: fixture, px: fit(fixture, 27 * k * ts, inner, 0.08), weight: 700, tracking: 0.08, gap: 18 * k },
    ...when.map((t, i) => ({ text: t, px: wPx, weight: 600, tracking: 0.12, gap: (i ? 8 : 14) * k })),
  ].filter((l) => l.text);
  const blockH = 84 * k + 54 * k + lines.reduce((s, l) => s + l.px + l.gap, 0);
  return (
    <TopFrame data={data} blockH={blockH}>
      <SwatchCard data={data} k={k} lines={lines} />
    </TopFrame>
  );
}

/** Golo · amostra de cor (goal): the same paint card, GOAL, his name and exact club typed under the club's colours. */
export function Goalswatchcard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const inner = CARD * k - 60 * k;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const lines = [
    { text: word, px: fit(word, 56 * k * ts, inner, 0.06), weight: 800, tracking: 0.06, gap: 0 },
    { text: name, px: fit(name, 28 * k * ts, inner, 0.08), weight: 800, tracking: 0.08, gap: 18 * k },
    { text: club, px: fit(club, 21 * k * ts, inner, 0.14), weight: 600, tracking: 0.14, gap: 12 * k },
  ].filter((l) => l.text);
  const blockH = 84 * k + 54 * k + lines.reduce((s, l) => s + l.px + l.gap, 0);
  return (
    <TopFrame data={data} blockH={blockH}>
      <SwatchCard data={data} k={k} lines={lines} />
    </TopFrame>
  );
}

/** Three small flat shapes in a three-colour palette (the club's two colours and white): circle, square, triangle. */
function Shapes({ data, size }: { data: RenderData; size: number }) {
  const [a, b] = clubPair(data);
  const edge = "0 2px 10px rgba(0,0,0,.35)";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.32 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: a, boxShadow: edge, border: "2px solid rgba(255,255,255,.85)" }} />
      <div style={{ width: size, height: size, background: b, boxShadow: edge, border: "2px solid rgba(255,255,255,.85)" }} />
      <svg width={size * 1.1} height={size} viewBox="0 0 44 40" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }}>
        <path d="M22 2 L42 38 L2 38 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * Formas geométricas (matchday) — after LoveGunn's World Cup typographic posters (a three-colour palette and
 * geometric shapes): a row of three flat shapes in the club's colours and white above MATCHDAY 14 in Anton,
 * the fixture and date · kick-off · ground.
 */
export function Geotype({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const s = 46 * k;
  const tPx = Math.min(84 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const sPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const blockH = s + 30 * k + tPx + 32 * k + fPx + 16 * k + when.length * sPx + Math.max(0, when.length - 1) * 10 * k;
  return (
    <TopFrame data={data} blockH={blockH}>
      <Shapes data={data} size={s} />
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 30 * k, textShadow: SHADOW }}>{title}</div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 32 * k }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: (i ? 10 : 16) * k, opacity: 0.94 }}>{l}</div>
      ))}
    </TopFrame>
  );
}

/** Golo · formas geométricas (goal): the same three shapes over GOAL in Anton, his name and exact club. */
export function Goalgeotype({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const s = 46 * k;
  const tPx = Math.min(116 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = s + 30 * k + tPx + 30 * k + nPx + 14 * k + cPx;
  return (
    <TopFrame data={data} blockH={blockH}>
      <Shapes data={data} size={s} />
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 30 * k, textShadow: SHADOW }}>{word}</div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
    </TopFrame>
  );
}

/**
 * Golo · baliza (goal) — after Rick Hincks' minimalist World Cup goal posters (Minimalissimo): a goal drawn in
 * thin white lines above his head (posts, crossbar, a light net), GOAL set inside its mouth, his name and
 * exact club under it.
 */
export function Goalnetline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gw = 640 * k;
  const gh = gw * 0.34;
  const tPx = Math.min(gh * 0.62, (gw - 80 * k) / Math.max(1, word.length * 0.5)) * ts;
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = gh + 30 * k + nPx + 14 * k + cPx;
  const net = Array.from({ length: 9 }, (_, i) => i);
  return (
    <TopFrame data={data} blockH={blockH}>
      <div style={{ position: "relative", width: gw, height: gh }}>
        <svg width={gw} height={gh} viewBox={`0 0 ${gw} ${gh}`} style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }}>
          {net.map((i) => (
            <line key={`v${i}`} x1={(gw / 10) * (i + 1)} y1={6} x2={(gw / 10) * (i + 1)} y2={gh} stroke="rgba(255,255,255,.22)" strokeWidth={1.2} />
          ))}
          {[1, 2, 3].map((i) => (
            <line key={`h${i}`} x1={6} y1={(gh / 4) * i} x2={gw - 6} y2={(gh / 4) * i} stroke="rgba(255,255,255,.22)" strokeWidth={1.2} />
          ))}
          <path d={`M 4 ${gh} L 4 4 L ${gw - 4} 4 L ${gw - 4} ${gh}`} fill="none" stroke="#ffffff" strokeWidth={Math.max(4, 6 * k)} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8 * k }}>
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        </div>
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 30 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
    </TopFrame>
  );
}
