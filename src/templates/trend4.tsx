/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { LogoShade, frameOf } from "./natfree4";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, clubInk, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";
const INK = "#16181c";
const CREAM = "#f2ede3";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));
const roundLabel = (data: RenderData) => {
  const f = matchFacts(data);
  return f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp.toUpperCase();
};

/** His photo under a panel at the top: the panel is its own ground, so its type never lands on anyone. */
function PanelFrame({ data, place, H, filter, children }: { data: RenderData; place: NatPlace; H: number; filter?: string; children: ReactNode }) {
  const logoTop = logoTopOf(data, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#15181c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={filter ? { filter } : undefined} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} style={filter ? { filter } : undefined} />}
      <LogoShade top={logoTop} />
      {children}
      <Logo data={data} top={logoTop} />
    </div>
  );
}

/**
 * Programa de jogo (matchday) — the printed match programme covers (Stoke City's, on SoccerBible): a cream
 * masthead across the top with MATCHDAY 14 and the date on a ruled line, the fixture in DM Serif (exact names,
 * "v" between), the kick-off and the ground under a second rule; his real photo fills the rest.
 */
export function Matchprogramme({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX } = frameOf(data);
  const fx = natFixture(data);
  const panelH = story ? 640 : 440;
  const padTop = story ? 190 : 56;
  const W = CANVAS_W - 120;
  const sPx = Math.min(68 * k * ts, ...[fx.homeName, fx.awayName].map((n) => W / Math.max(1, n.length * 0.52)));
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: panelH + (story ? 250 : 170), fs: story ? 200 : 140 });
  const small: CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 14 * k * ts, letterSpacing: "0.24em", lineHeight: 1, whiteSpace: "nowrap" };
  const rule = <div style={{ height: 1.5, background: INK, opacity: 0.85 }} />;
  const foot = [fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  return (
    <PanelFrame data={data} place={place} H={H}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: panelH, background: CREAM, color: INK, boxShadow: "0 8px 30px rgba(0,0,0,.25)" }}>
        <div style={{ position: "absolute", left: 60, right: 60, top: padTop, bottom: 34 * k, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 * k }}>
              <div style={small}>{roundLabel(data)}</div>
              <div style={small}>{fx.date.toUpperCase()}</div>
            </div>
            {rule}
          </div>
          <div style={{ textAlign: "center", fontFamily: SERIF, fontSize: sPx, lineHeight: 1.05, whiteSpace: "nowrap" }}>
            <div>{fx.homeName}</div>
            <div style={{ fontSize: sPx * 0.5, margin: `${6 * k}px 0`, fontStyle: "italic" }}>v</div>
            <div>{fx.awayName}</div>
          </div>
          <div>
            {rule}
            <div style={{ ...small, fontSize: fit(foot, 14 * k * ts, W, 0.24), marginTop: 14 * k, textAlign: "center" }}>{foot}</div>
          </div>
        </div>
      </div>
    </PanelFrame>
  );
}

/**
 * Preto e branco (matchday) — the black-and-white minimalist match-day posters (Venngage's template set): his
 * photo in black and white, MATCHDAY in very light wide caps above his head, a short rule in the club's colour,
 * HOME v AWAY and date · kick-off · ground small under it.
 */
export function Monoposter({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = CANVAS_W - 120;
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const wPx = fit(word, 96 * k * ts, W, 0.18);
  const teams = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [f.roundNo ? `MD ${f.roundNo}` : "", fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = fit(teams, 22 * k * ts, W, 0.1);
  const blockH = wPx + 30 * k + 4 * k + 30 * k + tPx + 16 * k + 14 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PanelFrame data={data} place={place} H={H} filter="grayscale(1) contrast(1.12) brightness(.95)">
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 220 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.66), rgba(0,0,0,.4) 60%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center", textShadow: SHADOW }}>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: wPx, letterSpacing: "0.18em", paddingLeft: "0.18em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ width: 90 * k, height: 4 * k, background: clubInk(data), margin: `${30 * k}px 0`, boxShadow: "none" }} />
        {teams && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: tPx, letterSpacing: "0.1em", lineHeight: 1, whiteSpace: "nowrap" }}>{teams}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(when, 14 * k * ts, W, 0.16), letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 16 * k, opacity: 0.9 }}>{when}</div>}
      </div>
    </PanelFrame>
  );
}

/** The club-colour band across the top (Boavista SC's official social posts, by bern4rdgfx on Behance). */
function Band({ data, height, children }: { data: RenderData; height: number; children: ReactNode }) {
  const ink = clubInk(data);
  return <div style={{ position: "absolute", left: 0, right: 0, top: 0, height, background: ink, boxShadow: "0 10px 34px rgba(0,0,0,.3)", color: "#ffffff" }}>{children}</div>;
}

/**
 * Faixa do clube (matchday) — Boavista SC's official matchday posts (bern4rdgfx, Behance): a solid band in the
 * club's colour across the top, the two crests at its ends with the exact names under them, MATCHDAY 14 and
 * the kick-off (Portugal's under it abroad) in the middle; date and ground on the band's foot.
 */
export function Versusband({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX } = frameOf(data);
  const fx = natFixture(data);
  const bandH = story ? 560 : 380;
  const padTop = story ? 200 : 50;
  const crest = 112 * k;
  const sideW = 300 * k;
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 18 * k * ts, sideW, 0.08), fit(fx.awayName.toUpperCase(), 18 * k * ts, sideW, 0.08));
  const label = roundLabel(data);
  const foot = [fx.date, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: bandH + (story ? 250 : 170), fs: story ? 200 : 140 });
  const side = (src: string | null, name: string) => (
    <div style={{ width: sideW, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {src ? <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.3))" }} /> : <div style={{ height: crest }} />}
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 18 * k }}>{name.toUpperCase()}</div>
    </div>
  );
  return (
    <PanelFrame data={data} place={place} H={H}>
      <Band data={data} height={bandH}>
        <div style={{ position: "absolute", left: 40, right: 40, top: padTop, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {side(fx.homeCrest, fx.homeName)}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: crest * 0.18 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fit(label, 13 * k * ts, 220 * k, 0.28), letterSpacing: "0.28em", paddingLeft: "0.28em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{label}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 64 * k * ts, lineHeight: 1, marginTop: 14 * k }}>{fx.time || "VS"}</div>
            {fx.ptTime && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13 * k * ts, letterSpacing: "0.16em", lineHeight: 1, marginTop: 10 * k, opacity: 0.85 }}>{fx.ptTime}</div>}
          </div>
          {side(fx.awayCrest, fx.awayName)}
        </div>
        {foot && <div style={{ position: "absolute", left: 60, right: 60, bottom: 30 * k, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: fit(foot, 14 * k * ts, CANVAS_W - 120, 0.2), letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{foot}</div>}
      </Band>
    </PanelFrame>
  );
}

/**
 * Golo · faixa do clube (goal) — the same Boavista band for a goal: his club's crest in the middle of the band,
 * GOAL in the condensed display face, his name in bold and the club's exact name small under it.
 */
export function Goalband({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX } = frameOf(data);
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const bandH = story ? 600 : 420;
  const padTop = story ? 190 : 46;
  const cPx = 92 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: bandH + (story ? 270 : 180), fs: story ? 200 : 140 });
  return (
    <PanelFrame data={data} place={place} H={H}>
      <Band data={data} height={bandH}>
        <div style={{ position: "absolute", left: 60, right: 60, top: padTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {crest && <img src={crest} alt="" style={{ width: cPx, height: cPx, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.3))" }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 120 * k * ts, lineHeight: 0.9, marginTop: 22 * k, letterSpacing: "0.02em" }}>{word}</div>
          {name && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(name, 26 * k * ts, CANVAS_W - 120, 0.08), letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 22 * k }}>{name}</div>}
          {club && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(club, 14 * k * ts, CANVAS_W - 120, 0.24), letterSpacing: "0.24em", paddingLeft: "0.24em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 14 * k, opacity: 0.9 }}>{club}</div>}
        </div>
      </Band>
    </PanelFrame>
  );
}

/**
 * Golo · preto e branco (goal) — the black-and-white minimalist posters (Venngage) for a goal: his celebration in
 * black and white, his first and last names in very light wide caps above his head on two lines, a rule in the
 * club's colour, GOAL and his club's exact name small.
 */
export function Goalmonoposter({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const W = CANVAS_W - 120;
  const names = [data.content.firstName, data.content.lastName].filter(Boolean).map((s) => s!.toUpperCase());
  const nPx = Math.min(78 * k * ts, ...names.map((n) => fit(n, 78 * k * ts, W, 0.14)));
  const line = [(data.content.kicker || "Goal").toUpperCase(), ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ");
  const blockH = names.length * nPx * 1.08 + 28 * k + 4 * k + 28 * k + 14 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 300 : 210), fs: story ? 205 : 145 });
  return (
    <PanelFrame data={data} place={place} H={H} filter="grayscale(1) contrast(1.12) brightness(.95)">
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + blockH + 220 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.66), rgba(0,0,0,.4) 60%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center", textShadow: SHADOW }}>
        {names.map((n) => (
          <div key={n} style={{ fontFamily: SANS, fontWeight: 300, fontSize: nPx, letterSpacing: "0.14em", paddingLeft: "0.14em", lineHeight: 1.08, whiteSpace: "nowrap" }}>{n}</div>
        ))}
        <div style={{ width: 90 * k, height: 4 * k, background: clubInk(data), margin: `${28 * k}px 0` }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fit(line, 14 * k * ts, W, 0.26), letterSpacing: "0.26em", paddingLeft: "0.26em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      </div>
    </PanelFrame>
  );
}
