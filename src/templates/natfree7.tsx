/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const roundLabel = (data: RenderData) => {
  const f = matchFacts(data);
  return f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
};
const caps = (px: number, tracking = 0.2): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW });
const column = (top: number): CSSProperties => ({ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" });
const pool = (top: number, blockH: number) => ({ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 });

/** Late-afternoon light over the whole photo: warm highlights, a soft sun from the top corner. No blur. */
function GoldenGrade({ side }: { side: "left" | "right" }) {
  const sun = side === "left" ? "88% 4%" : "12% 4%";
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(255,184,92,.34), rgba(255,150,70,.12) 45%, rgba(40,30,60,.18))", mixBlendMode: "soft-light", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 40% at ${sun}, rgba(255,214,150,.38), rgba(255,214,150,0) 70%)`, mixBlendMode: "screen", pointerEvents: "none" }} />
    </>
  );
}

/**
 * Natural · luz dourada (matchday): his photo in warm late-afternoon light, the sun from the corner away from
 * him. Above his head MATCHDAY 14 in DM Serif, the fixture (exact names) and the date · kick-off · ground.
 */
export function Natgolden({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const title = roundLabel(data);
  const tPx = Math.min(76 * k * ts, W / Math.max(1, title.length * 0.6));
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const fPx = fit(fixture, 24 * k * ts, W, 0.1);
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = tPx + 28 * k + fPx + 16 * k + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <GoldenGrade side={data.params.side === "left" ? "left" : "right"} />
      <div style={column(top)}>
        <div style={{ fontFamily: SERIF, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title.charAt(0) + title.slice(1).toLowerCase()}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.92 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/** Golo natural · luz dourada (goal): the same warm light on his celebration; "Goal" in DM Serif, his name and club. */
export function Goalnatgolden({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const W = CANVAS_W - 120;
  const word = data.content.kicker || "Goal";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const gPx = 96 * k * ts;
  const nPx = fit(name, 28 * k * ts, W, 0.12);
  const cPx = fit(club, 20 * k * ts, W, 0.22);
  const blockH = gPx + 26 * k + nPx + 14 * k + cPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <GoldenGrade side={data.params.side === "left" ? "left" : "right"} />
      <div style={column(top)}>
        <div style={{ fontFamily: SERIF, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.92 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · emblemas ligados (matchday): above his head, the two crests joined by a hairline with a small
 * "v" in the middle, each club's exact name under its crest; MATCHDAY 14 over it, date · kick-off · ground under.
 */
export function Natcresthair({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const W = CANVAS_W - 120;
  const crest = 96 * k;
  const half = (W - 40 * k) / 2;
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 22 * k * ts, half, 0.08), fit(fx.awayName.toUpperCase(), 22 * k * ts, half, 0.08));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const rPx = 22 * k * ts;
  const blockH = rPx + 30 * k + crest + 18 * k + nPx + 30 * k + sPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  const team = (name: string, src: string | null) => (
    <div style={{ width: half, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {src ? <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.45))" }} /> : <div style={{ height: crest }} />}
      <div style={{ ...caps(nPx, 0.08), fontWeight: 800, marginTop: 18 * k }}>{name.toUpperCase()}</div>
    </div>
  );
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={column(top)}>
        <div style={{ ...caps(rPx, 0.34), opacity: 0.92 }}>{roundLabel(data)}</div>
        <div style={{ position: "relative", width: W, display: "flex", justifyContent: "space-between", marginTop: 30 * k }}>
          {/* The hairline runs between the crests, broken by the "v". */}
          <div style={{ position: "absolute", left: half / 2 + crest * 0.75, right: half / 2 + crest * 0.75, top: crest / 2, height: 2, background: "rgba(255,255,255,.85)", boxShadow: "0 1px 6px rgba(0,0,0,.4)" }} />
          <div style={{ position: "absolute", left: "50%", top: crest / 2 - 22 * k, width: 44 * k, height: 44 * k, marginLeft: -22 * k, borderRadius: "50%", background: clubInk(data), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 20 * k, boxShadow: "0 2px 10px rgba(0,0,0,.35)" }}>v</div>
          {team(fx.homeName, fx.homeCrest)}
          {team(fx.awayName, fx.awayCrest)}
        </div>
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 30 * k, opacity: 0.92 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Natural · desencontrado (matchday): the title broken in two and staggered across the top — "MATCH" flush
 * left, "DAY 14" flush right, in light wide caps — the fixture and the kick-off centred under the step.
 */
export function Natstagger({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = CANVAS_W - 120;
  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  const [a, b] = kicker === "MATCHDAY" ? ["MATCH", `DAY${f.roundNo ? ` ${f.roundNo}` : ""}`] : [kicker, f.roundNo ? `Nº ${f.roundNo}` : ""];
  const px = Math.min(fit(a, 78 * k * ts, W * 0.78, 0.12), b ? fit(b, 78 * k * ts, W * 0.78, 0.12) : Infinity);
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const fPx = fit(fixture, 24 * k * ts, W, 0.1);
  const sPx = fit(when, 20 * k * ts, W, 0.16);
  const blockH = px * 2 + 8 * k + 30 * k + fPx + 16 * k + sPx;
  // The staggered title is taller than it looks: he stands a little lower than under a single line.
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 370 : 250), fs: story ? 205 : 145 });
  const word: CSSProperties = { ...caps(px, 0.12), fontWeight: 300 };
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={{ position: "absolute", left: 60, right: 60, top }}>
        <div style={{ ...word, textAlign: "left", paddingLeft: 0 }}>{a}</div>
        {b && <div style={{ ...word, textAlign: "right", marginTop: 8 * k }}>{b}</div>}
      </div>
      <div style={column(top + px * 2 + 8 * k + 30 * k)}>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800 }}>{fixture}</div>}
        {when && <div style={{ ...caps(sPx, 0.16), fontWeight: 600, marginTop: 16 * k, opacity: 0.92 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Golo natural · desencontrado (goal): his first name flush left and his surname flush right, staggered over
 * his head in heavy caps, GOAL small between them on the left, his club's exact name under on the right.
 */
export function Goalnatstagger({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const W = CANVAS_W - 120;
  const first = (data.content.firstName || "").toUpperCase();
  const last = (data.content.lastName || "").toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const px = Math.min(first ? fit(first, 92 * k * ts, W * 0.8, 0.04) : Infinity, last ? fit(last, 92 * k * ts, W * 0.8, 0.04) : Infinity, 92 * k * ts);
  const cPx = fit(club, 20 * k * ts, W * 0.7, 0.22);
  const gap = 34 * k;
  const blockH = px + gap + px + 22 * k + cPx;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  const big: CSSProperties = { ...caps(px, 0.04), fontWeight: 900, paddingLeft: 0 };
  return (
    <PoolFrame data={data} place={place} H={H} pool={pool(top, blockH)}>
      <div style={{ position: "absolute", left: 60, right: 60, top }}>
        <div style={{ ...big, textAlign: "left" }}>{first}</div>
        <div style={{ ...caps(22 * k * ts, 0.4), fontWeight: 800, paddingLeft: 0, color: "#ffffff", marginTop: (gap - 22 * k) / 2, height: 22 * k, marginBottom: (gap - 22 * k) / 2, display: "flex", alignItems: "center", gap: 14 * k }}>
          <span style={{ display: "inline-block", width: 40 * k, height: 3, background: clubInk(data) }} />
          {word}
        </div>
        <div style={{ ...big, textAlign: "right" }}>{last}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, textAlign: "right", marginTop: 22 * k, opacity: 0.92 }}>{club}</div>}
      </div>
    </PoolFrame>
  );
}
