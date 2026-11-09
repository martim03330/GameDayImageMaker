/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

/**
 * The free column beside him: from the margin to a body's width away from his face (shoulders and arms
 * included), on the side away from him. Small type lives only here, never over his kit.
 */
export function freeColumn(place: NatPlace, heLeft: boolean, M: number) {
  const reach = 1.9 * place.faceW;
  const colW = Math.max(360, heLeft ? CANVAS_W - M - (place.fx + reach) : place.fx - reach - M);
  return { colX: heLeft ? CANVAS_W - M - colW : M, colW };
}

/** The common ground of these looks: his real photo, a soft shade behind the free column, the logo centred at the foot. */
export function FreeFrame({ data, place, colX, colW, shadeTop, shadeH, children }: { data: RenderData; place: NatPlace; colX: number; colW: number; shadeTop: number; shadeH: number; children: ReactNode }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoTop = bottom - (story ? 88 : 52) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: colX - 120, width: colW + 240, top: shadeTop, height: shadeH, background: "radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      {children}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));

/**
 * Natural · ficha (matchday): a team sheet in the free column beside him — MATCHDAY 14 tracked small, a hairline,
 * each club's crest with its exact name (home first), a hairline, then the date, the kick-off (local, Portugal's
 * next to it abroad) and the ground, one per line. Left-aligned, calm, nothing over his kit.
 */
export function Natsheet({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 620 : 430, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 64);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const kicker = [(data.content.kicker || "Matchday").toUpperCase(), f.roundNo].filter(Boolean).join(" ");
  const crest = 64 * k;
  const team = (n: string) => fit(n.toUpperCase(), 24 * k * ts, colW - crest - 18 * k, 0.06);
  const facts = [fx.date, fx.kickoff, fx.venue].filter(Boolean).map((s) => s.toUpperCase());
  const blockH = 20 * k + 2 * crest + 60 * k + facts.length * 30 * k + 60 * k;
  const top = Math.round(H * 0.56 - blockH / 2);
  const rule: CSSProperties = { height: 1, background: "rgba(244,241,234,.6)", margin: `${18 * k}px 0` };
  const row = (src: string | null, name: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * k, height: crest + 8 * k }}>
      {src && <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: team(name), letterSpacing: "0.06em", whiteSpace: "nowrap", textShadow: SHADOW }}>{name.toUpperCase()}</div>
    </div>
  );
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={top - 120} shadeH={blockH + 240}>
      <div style={{ position: "absolute", left: colX, width: colW, top }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fit(kicker, 16 * k * ts, colW, 0.3), letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{kicker}</div>
        <div style={rule} />
        {row(fx.homeCrest, fx.homeName)}
        {row(fx.awayCrest, fx.awayName)}
        <div style={rule} />
        {facts.map((s) => (
          <div key={s} style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(s, 17 * k * ts, colW, 0.14), letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", marginBottom: 13 * k, opacity: 0.9, textShadow: SHADOW }}>
            {s}
          </div>
        ))}
      </div>
    </FreeFrame>
  );
}

/**
 * Natural · pintado na relva (matchday): "MATCHDAY 14" painted on the grass beside him, laid flat in perspective
 * like the words a groundsman paints by the touchline (soft, a little transparent, taking the grass's light).
 * The fixture tiny and centred at the top, above his head.
 */
export function Natpitchpaint({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 380 : 700, fy: story ? 640 : 440, fs: story ? 200 : 140 });
  const { colX, colW } = freeColumn(place, heLeft, 56);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const num = f.roundNo;
  const wPx = Math.min(130 * k * ts, colW / Math.max(1, capsEm(word, 0.02) * 1.05));
  const nPx = Math.min(260 * k * ts, wPx * 2.2);
  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const paintBottom = bottom - (story ? 88 : 52) - 40 * k;
  const top = (story ? STORY_TOP : 48) - (params.textY ?? 0);
  const line1 = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const line2 = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const small = (t: string, max: number, w: number) => ({ fontFamily: SANS, fontWeight: w, fontSize: fit(t, max * k * ts, CANVAS_W - 140, 0.16), letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW });
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={-200} shadeH={0}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 220, background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k }}>
        {line1 && <div style={small(line1, 18, 800)}>{line1}</div>}
        {line2 && <div style={{ ...small(line2, 14, 600), opacity: 0.88 }}>{line2}</div>}
      </div>
      {/* Painted flat on the turf: perspective from the camera, so the far letters shrink. */}
      <div style={{ position: "absolute", left: colX, width: colW, top: paintBottom - nPx - wPx, height: nPx + wPx, perspective: 700 * k, perspectiveOrigin: "50% -40%" }}>
        <div style={{ position: "absolute", inset: 0, transform: "rotateX(38deg)", transformOrigin: "50% 100%", display: "flex", flexDirection: "column", alignItems: heLeft ? "flex-end" : "flex-start", justifyContent: "flex-end", color: "rgba(255,255,255,.92)", filter: "blur(.4px) drop-shadow(0 2px 6px rgba(0,0,0,.35))" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
          {num && <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: nPx, letterSpacing: "-0.02em", lineHeight: 0.9, whiteSpace: "nowrap" }}>{num}</div>}
        </div>
      </div>
    </FreeFrame>
  );
}

/**
 * Natural · data gigante (matchday): the day and month as one big thin figure ("02.11") high in the free column,
 * the kick-off under it, then the two clubs (exact names) and the ground, all in that column beside him.
 */
export function Natdatehero({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 370 : 710, fy: story ? 700 : 480, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 60);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const MON: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };
  const [d, m] = fx.date.toUpperCase().split(" ");
  const figure = d && MON[m] ? `${d.padStart(2, "0")}.${MON[m]}` : (data.content.kicker || "Matchday").toUpperCase();
  const fPx = Math.min(210 * k * ts, colW / Math.max(1, capsEm(figure, -0.02) * 0.92));
  const kicker = [(data.content.kicker || "Matchday").toUpperCase(), f.roundNo].filter(Boolean).join(" ");
  const lines = [fx.kickoff && `KICK-OFF ${fx.kickoff}`, fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}` : "", fx.venue].filter(Boolean).map((s) => (s as string).toUpperCase());
  const top = (story ? STORY_TOP + 120 : 90) - (params.textY ?? 0);
  const align = heLeft ? "right" : "left";
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={top - 140} shadeH={fPx + 420 * k}>
      <div style={{ position: "absolute", left: colX, width: colW, top, textAlign: align }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fit(kicker, 15 * k * ts, colW, 0.3), letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{kicker}</div>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: fPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 14 * k, textShadow: "0 2px 24px rgba(0,0,0,.35)" }}>{figure}</div>
        {lines.map((s, i) => (
          <div key={s} style={{ fontFamily: SANS, fontWeight: i ? 600 : 800, fontSize: fit(s, (i ? 15 : 19) * k * ts, colW, 0.12), letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", marginTop: (i ? 12 : 22) * k, opacity: i ? 0.88 : 1, textShadow: SHADOW }}>
            {s}
          </div>
        ))}
      </div>
    </FreeFrame>
  );
}

/**
 * Natural goal · letras empilhadas: G / O / A / L stacked one under the other in DM Serif in the free column beside
 * his celebration, his name and his club's exact name under the stack.
 */
export function Goalnatletters({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 370 : 720, fy: story ? 620 : 430, fs: story ? 200 : 145 });
  const { colX, colW } = freeColumn(place, heLeft, 60);
  const word = (data.content.kicker || "Goal").toUpperCase().replace(/\s+/g, "");
  const letters = [...word].slice(0, 6);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoTop = bottom - (story ? 88 : 52);
  const nPx = fit(name, 20 * k * ts, colW, 0.14);
  const cPx = fit(club, 14 * k * ts, colW, 0.2);
  const textBottom = logoTop - 90 * k;
  const room = textBottom - nPx - cPx - 50 * k - ((story ? STORY_TOP : 48) + 20);
  const lPx = Math.min((room / letters.length) / 0.86, 190 * k * ts, colW * 0.9);
  const stackTop = textBottom - nPx - cPx - 50 * k - letters.length * lPx * 0.86;
  const align = heLeft ? "flex-end" : "flex-start";
  return (
    <FreeFrame data={data} place={place} colX={colX} colW={colW} shadeTop={stackTop - 100} shadeH={textBottom - stackTop + 200}>
      <div style={{ position: "absolute", left: colX, width: colW, top: stackTop, display: "flex", flexDirection: "column", alignItems: align }}>
        {letters.map((l, i) => (
          <div key={i} style={{ fontFamily: SERIF, fontSize: lPx, lineHeight: 0.86, textShadow: "0 2px 24px rgba(0,0,0,.35)" }}>{l}</div>
        ))}
        {name && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 30 * k, textShadow: SHADOW }}>{name}</div>}
        {club && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 14 * k, opacity: 0.85, textShadow: SHADOW }}>{club}</div>}
      </div>
    </FreeFrame>
  );
}

/**
 * Natural goal · faixa de topo: one slim row across the top, above his head — his club's crest, GOAL, his name —
 * with his club's exact name and a hairline under it. He is framed a little lower to leave that sky free.
 */
export function Goalnattopbar({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 64;
  const top = (story ? STORY_TOP + 20 : 50) - (params.textY ?? 0);
  const crestPx = 58 * k;
  // His head starts well under the bar (hair ~ 0.75 of a face above the face centre).
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 430 : 650, fy: top + crestPx + 120 * k + (story ? 230 : 160) * 0.75 + 140 * k, fs: story ? 230 : 160 });
  const crest = data.content.home === false ? natFixture(data).awayCrest : natFixture(data).homeCrest;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const rowW = CANVAS_W - 2 * M - crestPx - 30 * k;
  const wPx = Math.min(40 * k * ts, rowW * 0.4 / Math.max(1, capsEm(word, 0.1)));
  const nPx = fit(name, 22 * k * ts, rowW - wPx * capsEm(word, 0.1) - 40 * k, 0.12);
  const cPx = fit(club, 14 * k * ts, CANVAS_W - 2 * M, 0.24);
  return (
    <FreeFrame data={data} place={place} colX={M} colW={CANVAS_W - 2 * M} shadeTop={-400} shadeH={0}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + crestPx + 260 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.25) 60%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", alignItems: "center", gap: 24 * k }}>
        {crest && <img src={crest} alt="" style={{ width: crestPx, height: crestPx, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }} />}
        <div style={{ fontFamily: SERIF, fontSize: wPx, lineHeight: 1, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ flex: 1 }} />
        {name && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{name}</div>}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: top + crestPx + 22 * k, height: 1, background: "rgba(244,241,234,.6)" }} />
      {club && <div style={{ position: "absolute", left: M, right: M, top: top + crestPx + 40 * k, fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.24em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.85, textShadow: SHADOW }}>{club}</div>}
    </FreeFrame>
  );
}
