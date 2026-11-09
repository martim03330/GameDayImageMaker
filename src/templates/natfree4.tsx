/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, logoTopOf } from "./trend2";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));

export function frameOf(data: RenderData) {
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  return { H, story, k: story ? 1.3 : 1, ts: data.params.textScale ?? 1, fx: data.params.side === "left" ? 460 : 620, top: (story ? STORY_TOP + 10 : 50) - (data.params.textY ?? 0) };
}

/**
 * A soft dark pool behind the NEYOD logo at the foot (big enough for the agreed lift: 20% bigger, 50px lower),
 * so the mark reads even where it lands on his kit.
 */
export function LogoShade({ top }: { top: number }) {
  return <div style={{ position: "absolute", left: CANVAS_W / 2 - 360, width: 720, top: top - 90, height: 330, background: "radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,0))", pointerEvents: "none" }} />;
}

/** His real photo (the ground and him in it), the shade at the top for the type, the logo at the foot. */
function SkyFrame({ data, place, H, shadeH, shade = 0.45, children }: { data: RenderData; place: NatPlace; H: number; shadeH: number; shade?: number; children: ReactNode }) {
  const logoTop = logoTopOf(data, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      {shadeH > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: shadeH, background: `linear-gradient(to bottom, rgba(0,0,0,${shade}), rgba(0,0,0,${shade * 0.6}) 60%, rgba(0,0,0,0))` }} />}
      <LogoShade top={logoTop} />
      {children}
      <Logo data={data} top={logoTop} />
    </div>
  );
}

/** Frosted glass: the photo itself, blurred behind the card. */
const FROST: CSSProperties = {
  background: "rgba(18,22,26,.26)",
  backdropFilter: "blur(22px) saturate(1.15)",
  WebkitBackdropFilter: "blur(22px) saturate(1.15)",
  border: "1px solid rgba(255,255,255,.22)",
  boxShadow: "0 10px 40px rgba(0,0,0,.25)",
};

/**
 * Natural · vidro (matchday): a frosted-glass card in the sky above his head — MATCHDAY 14 small, both crests
 * with the clubs' exact names under them and a thin "v" between, then date · kick-off · ground. He stands lower,
 * so the card never covers him or anyone behind him.
 */
export function Natfrost({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const cardW = CANVAS_W - 120;
  const colW = (cardW - 120 * k) / 2;
  const crest = 78 * k;
  const label = f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 19 * k * ts, colW, 0.08), fit(fx.awayName.toUpperCase(), 19 * k * ts, colW, 0.08));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const cardH = 34 * k + 14 * k + 26 * k + crest + 16 * k + nPx + 26 * k + 14 * k + 34 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + cardH + (story ? 300 : 200), fs: story ? 205 : 145 });
  const team = (crestSrc: string | null, name: string) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {crestSrc ? <img src={crestSrc} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} /> : <div style={{ height: crest }} />}
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 16 * k }}>{name.toUpperCase()}</div>
    </div>
  );
  return (
    <SkyFrame data={data} place={place} H={H} shadeH={0}>
      <div style={{ ...FROST, position: "absolute", left: 60, width: cardW, top, height: cardH, borderRadius: 30 * k, boxSizing: "border-box", padding: `${34 * k}px 0`, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>
        {label && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fit(label, 14 * k * ts, cardW - 80, 0.34), letterSpacing: "0.34em", paddingLeft: "0.34em", lineHeight: 1 }}>{label}</div>}
        <div style={{ display: "flex", alignItems: "center", marginTop: 26 * k }}>
          {team(fx.homeCrest, fx.homeName)}
          <div style={{ width: 120 * k, textAlign: "center", fontFamily: SERIF, fontSize: 34 * k, lineHeight: 1, marginTop: -nPx }}>v</div>
          {team(fx.awayCrest, fx.awayName)}
        </div>
        {when && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(when, 14 * k * ts, cardW - 80, 0.14), letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 26 * k, opacity: 0.92 }}>{when}</div>}
      </div>
    </SkyFrame>
  );
}

/**
 * Natural · faixa (matchday): one translucent dark strip right above the logo, the whole width — home crest and
 * exact name on the left, the kick-off (Portugal's under it abroad) and the date in the middle, away name and
 * crest on the right. MATCHDAY 14 and the ground in one tiny line in the sky. The strip is its own panel: the
 * type never sits on his kit.
 */
export function Natfootstrip({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: story ? 560 : 400, fs: story ? 205 : 145 });
  const logoTop = logoTopOf(data, H);
  const stripH = 132 * k;
  const stripTop = logoTop - 40 * k - stripH;
  const M = 36;
  const midW = 230 * k;
  const crest = 58 * k;
  const sideW = (CANVAS_W - 2 * M - midW) / 2 - crest - 46 * k;
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 21 * k * ts, sideW, 0.06), fit(fx.awayName.toUpperCase(), 21 * k * ts, sideW, 0.06));
  const time = fx.time;
  const pt = fx.ptTime;
  const sky = [f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const name: CSSProperties = { fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap" };
  const crestEl = (src: string | null) => (src ? <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest }} />);
  return (
    <SkyFrame data={data} place={place} H={H} shadeH={top + 160 * k}>
      {sky && <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: fit(sky, 14 * k * ts, CANVAS_W - 120, 0.3), letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{sky}</div>}
      <div style={{ position: "absolute", left: M, right: M, top: stripTop, height: stripH, borderRadius: 18 * k, background: "rgba(10,12,14,.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.14)", display: "flex", alignItems: "center", padding: `0 ${22 * k}px`, boxSizing: "border-box" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18 * k, minWidth: 0 }}>
          {crestEl(fx.homeCrest)}
          <div style={name}>{fx.homeName.toUpperCase()}</div>
        </div>
        <div style={{ width: midW, display: "flex", flexDirection: "column", alignItems: "center", borderLeft: "1px solid rgba(255,255,255,.2)", borderRight: "1px solid rgba(255,255,255,.2)" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34 * k * ts, letterSpacing: "0.02em", lineHeight: 1 }}>{time || fx.date}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12 * k * ts, letterSpacing: "0.18em", lineHeight: 1, marginTop: 10 * k, opacity: 0.85, whiteSpace: "nowrap" }}>{[time ? fx.date : "", pt].filter(Boolean).join(" · ").toUpperCase()}</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18 * k, minWidth: 0 }}>
          <div style={name}>{fx.awayName.toUpperCase()}</div>
          {crestEl(fx.awayCrest)}
        </div>
      </div>
    </SkyFrame>
  );
}

/**
 * A thin frame inset from the edges whose top line is broken by a small legend ("MATCHDAY 14", "GOAL"), like a
 * form's fieldset; under the legend, inside the frame and above his head, the lines of type. He stands lower.
 */
function Fieldset({ data, legend, lines }: { data: RenderData; legend: string; lines: { text: string; px: number; font: string; weight: number; tracking: number; gap: number }[] }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const M = story ? 46 : 38;
  const lineTop = top + 8 * k;
  const bottom = story ? H - 210 : H - 30;
  const lPx = fit(legend, 15 * k * ts, CANVAS_W - 300, 0.4);
  const gapW = capsEm(legend, 0.4) * lPx + 50 * k;
  const blockH = lines.reduce((s, l) => s + l.gap + l.px, 0);
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: lineTop + 40 * k + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  const stroke = "rgba(244,241,234,.8)";
  const seg = (CANVAS_W - 2 * M - gapW) / 2;
  let y = lineTop + 30 * k;
  return (
    <SkyFrame data={data} place={place} H={H} shadeH={lineTop + blockH + 220 * k} shade={0.62}>
      <div style={{ position: "absolute", left: M, top: lineTop, width: seg, height: 1.5, background: stroke }} />
      <div style={{ position: "absolute", right: M, top: lineTop, width: seg, height: 1.5, background: stroke }} />
      <div style={{ position: "absolute", left: M, top: lineTop, width: 1.5, height: bottom - lineTop, background: stroke }} />
      <div style={{ position: "absolute", right: M, top: lineTop, width: 1.5, height: bottom - lineTop, background: stroke }} />
      <div style={{ position: "absolute", left: M, right: M, top: bottom, height: 1.5, background: stroke }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lineTop - lPx / 2, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.4em", paddingLeft: "0.4em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{legend}</div>
      {lines.map((l) => {
        y += l.gap;
        const el = (
          <div key={l.text} style={{ position: "absolute", left: 80, right: 80, top: y, textAlign: "center", fontFamily: l.font, fontWeight: l.weight, fontSize: l.px, letterSpacing: `${l.tracking}em`, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>
            {l.text}
          </div>
        );
        y += l.px;
        return el;
      })}
    </SkyFrame>
  );
}

/**
 * Natural · moldura com legenda (matchday): a thin inset frame, its top line broken by MATCHDAY 14; inside, above
 * his head, HOME v AWAY (exact names) and date · kick-off · ground.
 */
export function Natfieldset({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const legend = f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : (data.content.kicker || "Matchday").toUpperCase();
  const teams = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const W = CANVAS_W - 160;
  return (
    <Fieldset
      data={data}
      legend={legend}
      lines={[
        { text: teams, px: fit(teams, 26 * k * ts, W, 0.08), font: SANS, weight: 800, tracking: 0.08, gap: 26 * k },
        { text: when, px: fit(when, 14 * k * ts, W, 0.16), font: SANS, weight: 600, tracking: 0.16, gap: 18 * k },
      ].filter((l) => l.text)}
    />
  );
}

/**
 * Golo natural · moldura com legenda (goal): the same inset frame broken by GOAL; inside, above his head, his
 * name in DM Serif and his club's exact name small.
 */
export function Goalnatfieldset({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const club = ourClub(data).toUpperCase();
  const W = CANVAS_W - 160;
  return (
    <Fieldset
      data={data}
      legend={(data.content.kicker || "Goal").toUpperCase()}
      lines={[
        { text: name, px: Math.min(54 * k * ts, W / Math.max(1, name.length * 0.5)), font: SERIF, weight: 400, tracking: 0.01, gap: 30 * k },
        { text: club, px: fit(club, 15 * k * ts, W, 0.22), font: SANS, weight: 700, tracking: 0.22, gap: 18 * k },
      ].filter((l) => l.text)}
    />
  );
}

/**
 * Golo natural · vidro (goal): a frosted-glass pill in the sky above his celebration — his club's crest, GOAL in
 * light tracked caps, a hairline, his name in bold with his club's exact name small under it. All inside the
 * pill: a bright sky never washes the type out.
 */
export function Goalnatfrost({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const pillH = 96 * k;
  const room = CANVAS_W - 120 - pillH - 140 * k;
  const nPx = Math.min(24 * k * ts, room / Math.max(1, capsEm(`${word} ${name}`, 0.12)));
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + pillH + (story ? 320 : 220), fs: story ? 205 : 145 });
  return (
    <SkyFrame data={data} place={place} H={H} shadeH={top + pillH + 200 * k}>
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...FROST, height: pillH, borderRadius: pillH / 2, display: "flex", alignItems: "center", gap: 22 * k, padding: `0 ${40 * k}px 0 ${18 * k}px`, maxWidth: CANVAS_W - 120, boxSizing: "border-box", textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>
          {crest && <img src={crest} alt="" style={{ width: pillH - 26 * k, height: pillH - 26 * k, objectFit: "contain" }} />}
          <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: nPx, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
          <div style={{ width: 1, height: pillH * 0.4, background: "rgba(255,255,255,.45)" }} />
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap" }}>{name}</div>
            {club && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: Math.min(12 * k * ts, nPx * 0.55), letterSpacing: "0.24em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 9 * k, opacity: 0.85 }}>{club}</div>}
          </div>
        </div>
      </div>
    </SkyFrame>
  );
}
