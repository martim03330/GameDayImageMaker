/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { FreeFrame, freeColumn } from "./natfree";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));

/**
 * A deeper shade on the free side, from the edge in: whoever stands behind him there (a blurred team-mate or
 * opponent) recedes, so the small type reads on the dark and never on another player's kit.
 */
export function SideShade({ heLeft, colX, colW }: { heLeft: boolean; colX: number; colW: number }) {
  const reach = (heLeft ? CANVAS_W - colX : colX + colW) + 120;
  return <div style={{ position: "absolute", top: 0, bottom: 0, [heLeft ? "right" : "left"]: 0, width: reach, background: `linear-gradient(to ${heLeft ? "left" : "right"}, rgba(0,0,0,.58), rgba(0,0,0,.4) 55%, rgba(0,0,0,0))`, pointerEvents: "none" }} />;
}

/**
 * Celebrations raise an arm into the free side: the column keeps a wider berth from his face, and its block
 * sits low, at his waist, under where a raised elbow reaches.
 */
export function goalColumn(place: NatPlace, heLeft: boolean, M: number) {
  const reach = 2.4 * place.faceW;
  const colW = Math.max(300, heLeft ? CANVAS_W - M - (place.fx + reach) : place.fx - reach - M);
  return { colX: heLeft ? CANVAS_W - M - colW : M, colW, mid: place.fy + 3.4 * place.fs };
}

/** Story or post, the scale of the type, his side and the type scale the user set. */
function frameOf(data: RenderData) {
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  return { H, story, k: story ? 1.3 : 1, heLeft: data.params.side === "left", ts: data.params.textScale ?? 1 };
}

/**
 * Natural · cara a cara (matchday): the fixture stood upright in the free column beside him — home crest and
 * exact name, a hairline running down with a small "V" in its middle, the away crest and name — then the
 * date and kick-off (local, Portugal's next to it abroad) under it. Centred in the column, nothing over him.
 */
export function Natvsline({ data }: { data: RenderData }) {
  const { H, story, k, heLeft, ts } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 620 : 430, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 60);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const crest = 92 * k;
  const line = 70 * k;
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 22 * k * ts, colW, 0.08), fit(fx.awayName.toUpperCase(), 22 * k * ts, colW, 0.08));
  const when = [fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const label = f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
  const blockH = 30 * k + 2 * (crest + 18 * k + nPx) + 2 * line + 30 * k + 60 * k;
  const top = Math.round(H * 0.55 - blockH / 2);
  const name: CSSProperties = { fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 18 * k, textShadow: SHADOW };
  const hair = <div style={{ width: 1, height: line, background: "rgba(244,241,234,.7)" }} />;
  const crestEl = (src: string | null) => (src ? <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))" }} /> : <div style={{ height: crest }} />);
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={top - 120} shadeH={blockH + 240}>
      <SideShade heLeft={heLeft} colX={colX} colW={colW} />
      <div style={{ position: "absolute", left: colX, width: colW, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {label && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fit(label, 15 * k * ts, colW, 0.32), letterSpacing: "0.32em", lineHeight: 1, whiteSpace: "nowrap", marginBottom: 30 * k, textShadow: SHADOW }}>{label}</div>}
        {crestEl(fx.homeCrest)}
        <div style={name}>{fx.homeName.toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k, margin: `${18 * k}px 0` }}>
          {hair}
          <div style={{ fontFamily: SERIF, fontSize: 30 * k * ts, lineHeight: 1, textShadow: SHADOW }}>v</div>
          {hair}
        </div>
        {crestEl(fx.awayCrest)}
        <div style={name}>{fx.awayName.toUpperCase()}</div>
        {when && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(when, 16 * k * ts, colW, 0.14), letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 30 * k, opacity: 0.9, textShadow: SHADOW }}>{when}</div>}
      </div>
    </FreeFrame>
  );
}

/**
 * Natural · marcos (matchday): a thin vertical rule down the free column with small ticks, the facts of the
 * game hung on it like stops on a line — MATCHDAY 14, the two clubs (exact names), the date, the kick-off and
 * the ground. Quiet, left-aligned to the rule, beside him.
 */
export function Natmilestones({ data }: { data: RenderData }) {
  const { H, story, k, heLeft, ts } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 620 : 430, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 64);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const stops = [
    { k: f.roundNo ? "MATCHDAY" : "", v: f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : "" },
    { k: "HOME", v: fx.homeName.toUpperCase() },
    { k: "AWAY", v: fx.awayName.toUpperCase() },
    { k: "DATE", v: fx.date.toUpperCase() },
    { k: "KICK-OFF", v: fx.kickoff.toUpperCase() },
    { k: "VENUE", v: fx.venue.toUpperCase() },
  ].filter((s) => s.v);
  const gap = 96 * k;
  const textW = colW - 44 * k;
  const vPx = Math.min(...stops.map((s) => fit(s.v, 21 * k * ts, textW, 0.06)));
  const run = (stops.length - 1) * gap;
  const top = Math.round(H * 0.55 - run / 2);
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={top - 140} shadeH={run + 280}>
      <SideShade heLeft={heLeft} colX={colX} colW={colW} />
      <div style={{ position: "absolute", left: colX + 6 * k, top: top - 10 * k, width: 1, height: run + 20 * k, background: "rgba(244,241,234,.55)" }} />
      {stops.map((s, i) => (
        <div key={s.k} style={{ position: "absolute", left: colX, top: top + i * gap - 6 * k, display: "flex", alignItems: "flex-start", gap: 26 * k }}>
          <div style={{ width: 13 * k, height: 13 * k, borderRadius: "50%", background: i === 0 ? OFF_WHITE : "transparent", border: `1.5px solid ${OFF_WHITE}`, flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,.4)" }} />
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11 * k * ts, letterSpacing: "0.3em", lineHeight: 1, opacity: 0.75, textShadow: SHADOW }}>{s.k}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: vPx, letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 9 * k, textShadow: SHADOW }}>{s.v}</div>
          </div>
        </div>
      ))}
    </FreeFrame>
  );
}

/**
 * Natural · emblemas no céu (matchday): him lower in the frame, and in the sky above his head both crests side
 * by side with a thin "×" between them, the clubs' exact names in one small line under them and the date and
 * kick-off under that. Centred, on a soft shade at the top.
 */
export function Natskycrests({ data }: { data: RenderData }) {
  const { H, story, k, ts } = frameOf(data);
  const top = (story ? STORY_TOP + 20 : 56) - (data.params.textY ?? 0);
  const crest = 110 * k;
  const blockH = crest + 30 * k + 22 * k + 16 * k + 18 * k;
  // His head clears the block: the face sits a good way under it.
  const place = natPlace(data, CANVAS_W, H, { fx: data.params.side === "left" ? 460 : 620, fy: top + blockH + (story ? 330 : 230), fs: story ? 210 : 145 });
  const fx = natFixture(data);
  const teams = fx.homeName && fx.awayName ? `${fx.homeName}  ×  ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const crestEl = (src: string | null) => (src ? <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 3px 12px rgba(0,0,0,.45))" }} /> : null);
  return (
    <FreeFrame data={data} place={place} colX={0} colW={CANVAS_W} shadeTop={-400} shadeH={0}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 260 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 * k }}>
          {crestEl(fx.homeCrest)}
          <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 40 * k, lineHeight: 1, textShadow: SHADOW }}>×</div>
          {crestEl(fx.awayCrest)}
        </div>
        {teams && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(teams, 19 * k * ts, CANVAS_W - 120, 0.12), letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 30 * k, textShadow: SHADOW }}>{teams}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(when, 14 * k * ts, CANVAS_W - 120, 0.16), letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 16 * k, opacity: 0.88, textShadow: SHADOW }}>{when}</div>}
      </div>
    </FreeFrame>
  );
}

/**
 * Golo natural · selo (goal): a round seal in the free column beside his celebration — his club's crest in the
 * middle, and around it, set on the circle, "GOAL · HIS NAME · HIS CLUB" (exact club name) in tiny tracked caps.
 */
export function Goalnatseal({ data }: { data: RenderData }) {
  const { H, story, k, heLeft, ts } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 380 : 700, fy: story ? 640 : 440, fs: story ? 210 : 150 });
  const { colX, colW, mid } = goalColumn(place, heLeft, 56);
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const ring = [word, name, ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ") + "  ·  ";
  const D = Math.min(colW, 330 * k);
  const r = D / 2 - 18 * k;
  // The ring's type fills the circle once round.
  const tPx = Math.min(17 * k * ts, (2 * Math.PI * r) / Math.max(1, capsEm(ring, 0.2)));
  const top = Math.round(Math.min(mid, H * 0.7) - D / 2);
  const left = colX + (colW - D) / 2;
  const id = `seal-${Math.round(D)}`;
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={top - 120} shadeH={D + 240}>
      <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} style={{ position: "absolute", left, top, overflow: "visible", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))" }}>
        <defs>
          <path id={id} d={`M ${D / 2} ${D / 2 - r} a ${r} ${r} 0 1 1 -0.01 0`} />
        </defs>
        <circle cx={D / 2} cy={D / 2} r={r - tPx - 12 * k} fill="none" stroke={OFF_WHITE} strokeOpacity={0.6} strokeWidth={1.2} />
        <text fill={OFF_WHITE} style={{ fontFamily: SANS, fontWeight: 700, fontSize: tPx, letterSpacing: "0.2em" }}>
          <textPath href={`#${id}`}>{ring}</textPath>
        </text>
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: left + D / 2 - D * 0.22, top: top + D / 2 - D * 0.22, width: D * 0.44, height: D * 0.44, objectFit: "contain", filter: "drop-shadow(0 3px 12px rgba(0,0,0,.45))" }} />}
    </FreeFrame>
  );
}

/**
 * Golo natural · manchete (goal): a short newspaper headline in DM Serif above his head — "Moisés Conceição
 * scores for SC Vianense SAD" (exact club name), mixed case on two balanced lines — with a tiny GOAL label and
 * a hairline over it. He stands lower so the headline sits in the sky / stands, never over him.
 */
export function Goalnatheadline({ data }: { data: RenderData }) {
  const { H, story, k, ts } = frameOf(data);
  const top = (story ? STORY_TOP + 20 : 56) - (data.params.textY ?? 0);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const club = ourClub(data);
  const lines = [name ? `${name} scores` : "Goal", club ? `for ${club}` : ""].filter(Boolean);
  const hPx = Math.min(64 * k * ts, ...lines.map((l) => (CANVAS_W - 120) / Math.max(1, l.length * 0.5)));
  const blockH = 16 * k + 40 * k + lines.length * hPx * 1.08;
  const place = natPlace(data, CANVAS_W, H, { fx: data.params.side === "left" ? 460 : 620, fy: top + blockH + (story ? 300 : 210), fs: story ? 210 : 145 });
  const word = (data.content.kicker || "Goal").toUpperCase();
  return (
    <FreeFrame data={data} place={place} colX={0} colW={CANVAS_W} shadeTop={-400} shadeH={0}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 240 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15 * k * ts, letterSpacing: "0.4em", paddingLeft: "0.4em", lineHeight: 1, textShadow: SHADOW }}>{word}</div>
        <div style={{ width: 70 * k, height: 1, background: "rgba(244,241,234,.75)", margin: `${20 * k}px 0` }} />
        {lines.map((l) => (
          <div key={l} style={{ fontFamily: SERIF, fontSize: hPx, lineHeight: 1.08, whiteSpace: "nowrap", textShadow: SHADOW }}>{l}</div>
        ))}
      </div>
    </FreeFrame>
  );
}
