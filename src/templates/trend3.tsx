/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { freeColumn } from "./natfree";
import { SideShade, goalColumn } from "./natfree3";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, clubInk, logoTopOf } from "./trend2";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));

function frameOf(data: RenderData) {
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  return { H, story, k: story ? 1.3 : 1, heLeft: data.params.side === "left", ts: data.params.textScale ?? 1 };
}

/**
 * The atmospheric ground of the Hull City 26/27 matchday set: his real photo darkened at the edges, a wash
 * of the club's colour rising from the foot, and a soft shade behind the free column.
 */
function Atmosphere({ data, place, H, colX, colW }: { data: RenderData; place: ReturnType<typeof natPlace>; H: number; colX: number; colW: number }) {
  const ink = clubInk(data);
  return (
    <>
      <NatGround place={place} W={CANVAS_W} H={H} spot={[0.38, 0.06]} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${ink}cc, ${ink}55 22%, rgba(0,0,0,0) 48%)`, mixBlendMode: "multiply" }} />
      <SideShade heLeft={data.params.side === "left"} colX={colX} colW={colW} />
    </>
  );
}

/**
 * Atmosférico (matchday) — Hull City's praised 26/27 matchday graphics: atmospheric photography and sleek
 * type. In the free column: MATCHDAY 14 tracked wide, the two clubs in large light caps (exact names), one
 * short rule in the club's colour, then date · kick-off · ground small.
 */
export function Atmosrule({ data }: { data: RenderData }) {
  const { H, story, k, heLeft, ts } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 620 : 430, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 64);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const kicker = f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
  const tPx = Math.min(fit(fx.homeName.toUpperCase(), 52 * k * ts, colW, 0.02), fit(fx.awayName.toUpperCase(), 52 * k * ts, colW, 0.02));
  const facts = [fx.date, fx.kickoff, fx.venue].filter(Boolean).map((s) => s.toUpperCase());
  const blockH = 16 * k + 40 * k + 2 * tPx * 1.1 + 36 * k + facts.length * 28 * k;
  const top = Math.round(H * 0.52 - blockH / 2);
  const team: CSSProperties = { fontFamily: SANS, fontWeight: 300, fontSize: tPx, letterSpacing: "0.02em", lineHeight: 1.1, whiteSpace: "nowrap", textShadow: SHADOW };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#11151a", color: OFF_WHITE }}>
      <Atmosphere data={data} place={place} H={H} colX={colX} colW={colW} />
      <div style={{ position: "absolute", left: colX, width: colW, top }}>
        {kicker && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(kicker, 15 * k * ts, colW, 0.42), letterSpacing: "0.42em", lineHeight: 1, whiteSpace: "nowrap", marginBottom: 40 * k, textShadow: SHADOW }}>{kicker}</div>}
        <div style={team}>{fx.homeName.toUpperCase()}</div>
        <div style={team}>{fx.awayName.toUpperCase()}</div>
        <div style={{ width: 80 * k, height: 4 * k, background: clubInk(data), margin: `${30 * k}px 0 ${26 * k}px`, boxShadow: "0 0 18px rgba(0,0,0,.3)" }} />
        {facts.map((s) => (
          <div key={s} style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(s, 15 * k * ts, colW, 0.16), letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", marginBottom: 13 * k, opacity: 0.9, textShadow: SHADOW }}>
            {s}
          </div>
        ))}
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Golo atmosférico (goal) — the same Hull City 26/27 mood for a goal: GOAL in wide light caps in the free
 * column, the club-colour rule, his name in bold and his club's exact name under it.
 */
export function Goalatmos({ data }: { data: RenderData }) {
  const { H, story, k, heLeft, ts } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 380 : 700, fy: story ? 640 : 440, fs: story ? 210 : 150 });
  const { colX, colW, mid } = goalColumn(place, heLeft, 60);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const wPx = fit(word, 120 * k * ts, colW, 0.12);
  const blockH = wPx + 64 * k + 26 * k + 20 * k;
  const top = Math.round(Math.min(mid, H * 0.7) - blockH / 2);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#11151a", color: OFF_WHITE }}>
      <Atmosphere data={data} place={place} H={H} colX={colX} colW={colW} />
      <div style={{ position: "absolute", left: colX, width: colW, top, display: "flex", flexDirection: "column", alignItems: heLeft ? "flex-end" : "flex-start" }}>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: wPx, letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        <div style={{ width: 80 * k, height: 4 * k, background: clubInk(data), margin: `${28 * k}px 0` }} />
        {name && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(name, 24 * k * ts, colW, 0.08), letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{name}</div>}
        {club && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(club, 14 * k * ts, colW, 0.2), letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 14 * k, opacity: 0.85, textShadow: SHADOW }}>{club}</div>}
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Grelha (matchday) — the Swiss grid of France's 2026 gameday graphics: above his head, a header ruled with
 * hairlines into three cells (MATCHDAY 14 · date · kick-off), and under it the fixture (exact names) and the
 * ground. He stands below the header, his real photo whole.
 */
export function Gridlines({ data }: { data: RenderData }) {
  const { H, story, k, ts } = frameOf(data);
  const top = (story ? STORY_TOP + 20 : 56) - (data.params.textY ?? 0);
  const M = 56;
  const fx = natFixture(data);
  const f = matchFacts(data);
  const cells = [
    { k: "MATCHDAY", v: f.roundNo || f.comp.toUpperCase() },
    { k: "DATE", v: fx.date.toUpperCase() },
    { k: "KICK-OFF", v: fx.time },
  ].filter((c) => c.v);
  const cellW = (CANVAS_W - 2 * M) / Math.max(1, cells.length);
  const cellH = 112 * k;
  const teams = fx.homeName && fx.awayName ? `${fx.homeName}  v  ${fx.awayName}`.toUpperCase() : "";
  const sub = [fx.venue, fx.ptTime].filter(Boolean).join("  ·  ").toUpperCase();
  const blockH = cellH + 34 * k + 22 * k + 16 * k + 14 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: data.params.side === "left" ? 460 : 620, fy: top + blockH + (story ? 320 : 220), fs: story ? 210 : 145 });
  const hair = "1px solid rgba(244,241,234,.7)";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 260 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTopOf(data, H) - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", borderTop: hair, borderBottom: hair }}>
        {cells.map((c, i) => (
          <div key={c.k} style={{ width: cellW, height: cellH, borderLeft: i ? hair : undefined, padding: `${18 * k}px ${16 * k}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11 * k * ts, letterSpacing: "0.3em", lineHeight: 1, opacity: 0.75, textShadow: SHADOW }}>{c.k}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(c.v, 36 * k * ts, cellW - 32 * k, 0.02), letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{c.v}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: top + cellH + 34 * k }}>
        {teams && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(teams, 20 * k * ts, CANVAS_W - 2 * M, 0.1), letterSpacing: "0.1em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{teams}</div>}
        {sub && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(sub, 14 * k * ts, CANVAS_W - 2 * M, 0.16), letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 16 * k, opacity: 0.85, textShadow: SHADOW }}>{sub}</div>}
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Golo · moldura de cor (goal) — Palermo FC's clean identity: his celebration in a window set in a thick
 * frame of his club's colour; the deeper band at the foot carries GOAL in tall condensed caps, his name and
 * his club's exact name, and the NEYOD logo.
 */
export function Goalcolorframe({ data }: { data: RenderData }) {
  const { H, story, k, ts } = frameOf(data);
  const ink = clubInk(data);
  const B = story ? 40 : 32;
  const winTop = story ? STORY_TOP - 40 : B;
  const winH = Math.round(H * (story ? 0.6 : 0.62)) - winTop;
  const winW = CANVAS_W - 2 * B;
  const place = natPlace(data, winW, winH, { fx: winW * (data.params.side === "left" ? 0.42 : 0.58), fy: winH * 0.34, fs: Math.min(story ? 230 : 160, winH * 0.17) });
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const bandTop = winTop + winH;
  const wPx = Math.min(150 * k * ts, (CANVAS_W - 2 * B - 40) / Math.max(1, word.length * 0.5));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ink, color: "#fff" }}>
      <div style={{ position: "absolute", left: B, top: winTop, width: winW, height: winH, overflow: "hidden", background: "#2b3a2a" }}>
        <NatGround place={place} W={winW} H={winH} />
        <NatFigure data={data} place={place} W={winW} H={winH} />
      </div>
      <div style={{ position: "absolute", left: B, right: B, top: bandTop + 40 * k, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.95, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{word}</div>
        {name && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(name, 24 * k * ts, winW, 0.1), letterSpacing: "0.1em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 22 * k }}>{name}</div>}
        {club && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(club, 14 * k * ts, winW, 0.22), letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 14 * k, opacity: 0.85 }}>{club}</div>}
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Etiquetas (matchday) — the outlined pill tags of the USWNT Gold Cup social templates: in the free column, the
 * two crests and clubs (exact names), then one pill per fact — MATCHDAY 14 filled in the club's colour, the
 * date, the kick-off (Portugal's next to it abroad) and the ground outlined.
 */
export function Tagstack({ data }: { data: RenderData }) {
  const { H, story, k, heLeft, ts } = frameOf(data);
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 620 : 430, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 60);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const ink = clubInk(data);
  const crest = 70 * k;
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 26 * k * ts, colW - crest - 18 * k, 0.04), fit(fx.awayName.toUpperCase(), 26 * k * ts, colW - crest - 18 * k, 0.04));
  const pills = [
    { t: f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase(), fill: true },
    { t: fx.date.toUpperCase(), fill: false },
    { t: fx.kickoff.toUpperCase(), fill: false },
    { t: fx.venue.toUpperCase(), fill: false },
  ].filter((p) => p.t);
  const pPx = Math.min(...pills.map((p) => fit(p.t, 17 * k * ts, colW - 48 * k, 0.12)));
  const blockH = 2 * (crest + 14 * k) + 36 * k + pills.length * (pPx + 44 * k);
  const top = Math.round(H * 0.54 - blockH / 2);
  const row = (src: string | null, n: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * k, marginBottom: 14 * k, flexDirection: heLeft ? "row-reverse" : "row" }}>
      {src && <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: nPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{n.toUpperCase()}</div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <SideShade heLeft={heLeft} colX={colX} colW={colW} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTopOf(data, H) - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <div style={{ position: "absolute", left: colX, width: colW, top, display: "flex", flexDirection: "column", alignItems: heLeft ? "flex-end" : "flex-start" }}>
        {row(fx.homeCrest, fx.homeName)}
        {row(fx.awayCrest, fx.awayName)}
        <div style={{ height: 22 * k }} />
        {pills.map((p) => (
          <div key={p.t} style={{ padding: `${12 * k}px ${22 * k}px`, borderRadius: 999, border: `1.5px solid ${p.fill ? ink : "rgba(244,241,234,.85)"}`, background: p.fill ? ink : "rgba(0,0,0,.18)", fontFamily: SANS, fontWeight: 700, fontSize: pPx, letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", marginBottom: 14 * k, textShadow: p.fill ? undefined : SHADOW, color: "#fff" }}>
            {p.t}
          </div>
        ))}
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}
