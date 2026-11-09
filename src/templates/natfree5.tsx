/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { isoFromShortDate, refName } from "@/lib/timezone";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { LogoShade, frameOf } from "./natfree4";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, clubInk, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const roundLabel = (data: RenderData) => {
  const f = matchFacts(data);
  return f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
};
const fullName = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");

/**
 * His real photo with a soft dark pool behind the type only (a bright sky keeps its light elsewhere), the
 * NEYOD logo at the foot over its own shade. The type always sits above his head: he stands lower.
 */
export function PoolFrame({ data, place, H, pool, children }: { data: RenderData; place: NatPlace; H: number; pool: { x: number; y: number; w: number; h: number } | null; children: ReactNode }) {
  const logoTop = logoTopOf(data, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      {pool && <div style={{ position: "absolute", left: pool.x, top: pool.y, width: pool.w, height: pool.h, background: "radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,.18) 65%, rgba(0,0,0,0))", pointerEvents: "none" }} />}
      <LogoShade top={logoTop} />
      {children}
      <Logo data={data} top={logoTop} />
    </div>
  );
}

const tiny = (px: number, tracking = 0.24): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });

/**
 * Natural · dois fusos (matchday): for a game abroad, the two kick-offs side by side above his head — the
 * local time and the player's second clock (Portugal's unless he chose another), each in light figures with its label, a hairline between. At home, one time.
 * MATCHDAY 14 small on top; the fixture (exact names), the date and the ground under it.
 */
export function Natdualclock({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const pt = fx.ptTime ? data.content.timePt ?? "" : "";
  const clocks = pt ? [{ t: fx.time, l: "LOCAL" }, { t: pt, l: refName(data.content.timeRef).toUpperCase() }] : fx.time ? [{ t: fx.time, l: "KICK-OFF" }] : [];
  const tPx = 92 * k * ts;
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const under = [fx.date, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const blockH = 14 * k + 34 * k + tPx + 16 * k + 12 * k + 34 * k + 18 * k + 14 * k + 14 * k + 13 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 280 : 190), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={tiny(fit(roundLabel(data), 14 * k * ts, CANVAS_W - 120, 0.34), 0.34)}>{roundLabel(data)}</div>
        <div style={{ display: "flex", alignItems: "stretch", marginTop: 34 * k }}>
          {clocks.map((c, i) => (
            <div key={c.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `0 ${44 * k}px`, borderLeft: i ? "1px solid rgba(255,255,255,.5)" : undefined }}>
              <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: tPx, letterSpacing: "0.02em", lineHeight: 1, textShadow: SHADOW }}>{c.t}</div>
              <div style={{ ...tiny(12 * k * ts, 0.3), marginTop: 16 * k, opacity: 0.85 }}>{c.l}</div>
            </div>
          ))}
        </div>
        {fixture && <div style={{ ...tiny(fit(fixture, 18 * k * ts, CANVAS_W - 120, 0.1), 0.1), fontWeight: 800, marginTop: 34 * k }}>{fixture}</div>}
        {under && <div style={{ ...tiny(fit(under, 13 * k * ts, CANVAS_W - 120, 0.2), 0.2), fontWeight: 600, marginTop: 14 * k, opacity: 0.9 }}>{under}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · dia da semana (matchday): the day of the game spelled out in wide light caps above his head
 * ("SUNDAY"), the date and kick-off under it, then both crests flanking the fixture in one small line.
 */
export function Natweekday({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const iso = isoFromShortDate(data.content.date);
  const day = iso ? DAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()] : roundLabel(data);
  const dPx = fit(day, 96 * k * ts, CANVAS_W - 120, 0.28);
  const when = [roundLabel(data), fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const crest = 46 * k;
  const nPx = Math.min(17 * k * ts, (CANVAS_W - 120 - 2 * crest - 60 * k) / Math.max(1, capsEm(`${fx.homeName} v ${fx.awayName}`.toUpperCase(), 0.1)));
  const blockH = dPx + 26 * k + 14 * k + 34 * k + crest + 13 * k + 22 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 280 : 190), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: dPx, letterSpacing: "0.28em", paddingLeft: "0.28em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{day}</div>
        <div style={{ ...tiny(fit(when, 14 * k * ts, CANVAS_W - 120, 0.24)), fontWeight: 600, marginTop: 26 * k, opacity: 0.92 }}>{when}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 34 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          <div style={{ ...tiny(nPx, 0.1), fontWeight: 800, paddingLeft: 0 }}>{`${fx.homeName} v ${fx.awayName}`.toUpperCase()}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
        </div>
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · legenda (matchday): a magazine photo caption above his head, left-aligned under a short rule —
 * "Matchday 14." in DM Serif, then one sentence: the fixture (exact names), the ground, the date and the
 * kick-off (Portugal's next to it abroad).
 */
export function Natcaptionserif({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 160;
  const head = `${(data.content.kicker || "Matchday").replace(/^\w/, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase())}${matchFacts(data).roundNo ? ` ${matchFacts(data).roundNo}` : ""}.`;
  const where = [fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}` : "", fx.venue ? `at ${fx.venue.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase())}` : ""].filter(Boolean).join(" ");
  const sentence = [where, fx.date.replace(/[A-Z]{3}/, (m) => m[0] + m.slice(1).toLowerCase()), fx.kickoff].filter(Boolean).join(", ");
  const sPx = Math.min(38 * k * ts, (W * 2.1) / Math.max(1, (head.length + sentence.length) * 0.5));
  const lines = Math.ceil(((head.length + sentence.length + 1) * sPx * 0.5) / W) + 1;
  const blockH = 2 + 30 * k + lines * sPx * 1.25;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 0, y: top - 140, w: CANVAS_W, h: blockH + 280 }}>
      <div style={{ position: "absolute", left: 80, width: W, top }}>
        <div style={{ width: 90 * k, height: 2, background: OFF_WHITE, opacity: 0.9 }} />
        <div style={{ marginTop: 30 * k, fontFamily: SERIF, fontSize: sPx, lineHeight: 1.25, textShadow: SHADOW }}>
          <span>{head}</span> <span style={{ fontStyle: "italic", opacity: 0.92 }}>{sentence}.</span>
        </div>
      </div>
    </PoolFrame>
  );
}

/**
 * Golo natural · canto (goal): a small block in the top-left corner above his head — a thin bar in the club's
 * colour, GOAL in heavy caps, his name, his club's exact name — the rest of the frame left to his celebration.
 */
export function Goalnatnook({ data }: { data: RenderData }) {
  const { H, story, k, ts, top } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data).toUpperCase();
  const club = ourClub(data).toUpperCase();
  const W = CANVAS_W - 160;
  const gPx = 64 * k * ts;
  const nPx = fit(name, 24 * k * ts, W, 0.08);
  const cPx = fit(club, 13 * k * ts, W, 0.24);
  const blockH = gPx + 18 * k + nPx + 12 * k + cPx;
  const place = natPlace(data, CANVAS_W, H, { fx: data.params.side === "left" ? 460 : 600, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: -200, y: top - 160, w: 1000, h: blockH + 320 }}>
      <div style={{ position: "absolute", left: 60, top, display: "flex", gap: 24 * k }}>
        <div style={{ width: 5 * k, background: clubInk(data), borderRadius: 3 }} />
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: gPx, letterSpacing: "0.02em", lineHeight: 1, textShadow: SHADOW }}>{word}</div>
          <div style={{ ...tiny(nPx, 0.08), fontWeight: 800, paddingLeft: 0, marginTop: 18 * k }}>{name}</div>
          {club && <div style={{ ...tiny(cPx, 0.24), fontWeight: 600, paddingLeft: 0, marginTop: 12 * k, opacity: 0.88 }}>{club}</div>}
        </div>
      </div>
    </PoolFrame>
  );
}

/**
 * Golo natural · dois pesos (goal): his name above his head in two weights — the first name hairline, the
 * surname heavy, same size — GOAL tiny above it and his club's exact name under it.
 */
export function Goalnatweights({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const first = (data.content.firstName ?? "").toUpperCase();
  const last = (data.content.lastName ?? "").toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const W = CANVAS_W - 120;
  const nPx = Math.min(fit(first || last, 80 * k * ts, W, 0.04), fit(last || first, 80 * k * ts, W, 0.04));
  const blockH = 14 * k + 26 * k + nPx * 2 + 8 * k + 24 * k + 13 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 0, y: top - 140, w: CANVAS_W, h: blockH + 280 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={tiny(14 * k * ts, 0.4)}>{word}</div>
        {first && <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: nPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 26 * k, textShadow: SHADOW }}>{first}</div>}
        {last && <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: nPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 8 * k, textShadow: SHADOW }}>{last}</div>}
        {club && <div style={{ ...tiny(fit(club, 13 * k * ts, W, 0.26), 0.26), fontWeight: 600, marginTop: 24 * k, opacity: 0.88 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}
