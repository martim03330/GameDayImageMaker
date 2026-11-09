/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ourClub } from "./goalnatcaption";
import { capsEm, natFixture, natPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { DISPLAY, SANS } from "./shared";
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
const tiny = (px: number, tracking = 0.24): CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap" });

/**
 * The corner tab of Cambridge United's modular 25/26 system: a solid block in the club's colour hanging from
 * the top-left edge, its own ground for the type, with a small cut-off corner. He stands lower and to the right.
 */
function CornerTab({ data, rows, crests, hTab }: { data: RenderData; rows: React.ReactNode; crests: (string | null)[]; hTab: number }) {
  const { H, story, k } = frameOf(data);
  const tabW = 600;
  const notch = 46 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: data.params.side === "left" ? 520 : 640, fy: hTab + (story ? 230 : 160), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={null}>
      <div style={{ position: "absolute", left: 0, top: 0, width: tabW, height: hTab, background: clubInk(data), clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${notch}px), calc(100% - ${notch}px) 100%, 0 100%)`, boxShadow: "0 10px 30px rgba(0,0,0,.25)" }}>
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 44 * k, color: "#fff" }}>{rows}</div>
      </div>
      {crests.some(Boolean) && (
        <div style={{ position: "absolute", right: 56, top: (story ? 190 : 56) + 6, display: "flex", gap: 16 * k, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }}>
          {crests.filter(Boolean).map((c, i) => (
            <img key={i} src={c!} alt="" style={{ width: 62 * k, height: 62 * k, objectFit: "contain" }} />
          ))}
        </div>
      )}
    </PoolFrame>
  );
}

/**
 * Canto do clube (matchday) — Cambridge United's 25/26 modular identity: the club-colour tab in the top-left
 * corner with MATCHDAY / 14 in condensed caps, the fixture (exact names) and the date · kick-off · ground;
 * both crests at the top right.
 */
export function Cornertab({ data }: { data: RenderData }) {
  const { story, k, ts } = frameOf(data);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const W = 480;
  const kicker = (data.content.kicker || "Matchday").toUpperCase();
  const kPx = Math.min(110 * k * ts, W / Math.max(1, kicker.length * 0.46));
  const lines = [fx.homeName.toUpperCase(), `v ${fx.awayName.toUpperCase()}`];
  const nPx = Math.min(...lines.map((l) => fit(l, 20 * k * ts, W, 0.06)));
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const wPx = fit(when, 12 * k * ts, W, 0.16);
  const hTab = (story ? 190 : 56) + kPx * (f.roundNo ? 2 : 1) * 0.95 + 26 * k + nPx * 2.5 + 18 * k + wPx + 44 * k;
  return (
    <CornerTab
      data={data}
      hTab={hTab}
      crests={[fx.homeCrest, fx.awayCrest]}
      rows={
        <>
          <div style={{ fontFamily: DISPLAY, fontSize: kPx, lineHeight: 0.95, textTransform: "uppercase" }}>{kicker}</div>
          {f.roundNo && <div style={{ fontFamily: DISPLAY, fontSize: kPx, lineHeight: 0.95 }}>{f.roundNo}</div>}
          <div style={{ marginTop: 26 * k }}>
            {lines.map((l) => (
              <div key={l} style={{ ...tiny(nPx, 0.06), fontWeight: 800, lineHeight: 1.25 }}>{l}</div>
            ))}
          </div>
          {when && <div style={{ ...tiny(wPx, 0.16), fontWeight: 600, marginTop: 18 * k, opacity: 0.9 }}>{when}</div>}
        </>
      }
    />
  );
}

/** Golo · canto do clube (goal): the same tab with GOAL in condensed caps, his name and his club's exact name; his club's crest at the top right. */
export function Goalcornertab({ data }: { data: RenderData }) {
  const { story, k, ts } = frameOf(data);
  const fx = natFixture(data);
  const W = 480;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(150 * k * ts, W / Math.max(1, word.length * 0.46));
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const nPx = fit(name, 22 * k * ts, W, 0.06);
  const cPx = fit(club, 12 * k * ts, W, 0.2);
  const hTab = (story ? 190 : 56) + gPx * 0.95 + 26 * k + nPx + 14 * k + cPx + 44 * k;
  return (
    <CornerTab
      data={data}
      hTab={hTab}
      crests={[data.content.home === false ? fx.awayCrest : fx.homeCrest]}
      rows={
        <>
          <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.95 }}>{word}</div>
          <div style={{ ...tiny(nPx, 0.06), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
          {club && <div style={{ ...tiny(cPx, 0.2), fontWeight: 600, marginTop: 14 * k, opacity: 0.9 }}>{club}</div>}
        </>
      }
    />
  );
}

/**
 * Palavra expressiva (matchday) — the DFL's 25/26 typographic programme, where one expressive face is used
 * sparingly: everything in small plain caps except the opponent's exact name, set big in DM Serif italic, above
 * his head. MATCHDAY 14 · date · kick-off on top, "CHERNO MORE v" over the name, the ground under it.
 */
export function Accentword({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const away = data.content.home === false;
  const us = away ? fx.awayName : fx.homeName;
  const them = away ? fx.homeName : fx.awayName;
  const W = CANVAS_W - 120;
  const head = [roundLabel(data), fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  const lead = away ? `${them.toUpperCase()} v` : `${us.toUpperCase()} v`;
  const big = away ? us : them;
  const bPx = Math.min(104 * k * ts, W / Math.max(1, big.length * 0.5));
  const venue = fx.venue.toUpperCase();
  const blockH = 13 * k + 34 * k + 16 * k + 14 * k + bPx * 1.1 + 18 * k + 13 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 290 : 200), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 0, y: top - 140, w: CANVAS_W, h: blockH + 280 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center", textShadow: SHADOW }}>
        <div style={{ ...tiny(fit(head, 13 * k * ts, W, 0.24)), fontWeight: 600, opacity: 0.92 }}>{head}</div>
        <div style={{ ...tiny(fit(lead, 16 * k * ts, W, 0.18), 0.18), fontWeight: 800, marginTop: 34 * k }}>{lead}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: bPx, lineHeight: 1.1, whiteSpace: "nowrap", marginTop: 14 * k }}>{big}</div>
        {venue && <div style={{ ...tiny(fit(venue, 13 * k * ts, W, 0.24)), fontWeight: 600, marginTop: 18 * k, opacity: 0.88 }}>{venue}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Emblema ao alto (matchday) — Liverpool's 25/26 identity, built around one emblem (the Liver bird): his club's
 * crest alone, centred high above his head, MATCHDAY 14 in condensed caps under it, then the fixture and the
 * date · kick-off · ground in small caps.
 */
export function Crestcrown({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const fx = natFixture(data);
  const crest = data.club?.crestUrl ?? (data.content.home === false ? fx.awayCrest : fx.homeCrest);
  const W = CANVAS_W - 120;
  const cSize = 132 * k;
  const label = roundLabel(data);
  const lPx = Math.min(64 * k * ts, W / Math.max(1, label.length * 0.46));
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const blockH = (crest ? cSize + 28 * k : 0) + lPx + 24 * k + 17 * k + 14 * k + 13 * k;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 280 : 190), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: 40, y: top - 120, w: CANVAS_W - 80, h: blockH + 240 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexDirection: "column", alignItems: "center", textShadow: SHADOW }}>
        {crest && <img src={crest} alt="" style={{ width: cSize, height: cSize, objectFit: "contain", filter: "drop-shadow(0 4px 16px rgba(0,0,0,.45))", marginBottom: 28 * k }} />}
        <div style={{ fontFamily: DISPLAY, fontSize: lPx, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{label}</div>
        {fixture && <div style={{ ...tiny(fit(fixture, 17 * k * ts, W, 0.12), 0.12), fontWeight: 800, marginTop: 24 * k }}>{fixture}</div>}
        {when && <div style={{ ...tiny(fit(when, 13 * k * ts, W, 0.2), 0.2), fontWeight: 600, marginTop: 14 * k, opacity: 0.9 }}>{when}</div>}
      </div>
    </PoolFrame>
  );
}

/**
 * Golo · fita (goal) — Fulham's refresh by F37 Foundry, where one line of the club's type runs off both edges:
 * a single line across the sky, "GOAL · GOAL · NAME · CLUB · GOAL · GOAL", the name and the club's exact name
 * whole in the middle (sized to fit), only the repeated GOALs cut by the edges. A hairline in the club's colour
 * under it.
 */
export function Goaltape({ data }: { data: RenderData }) {
  const { H, story, k, ts, fx: faceX, top } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const middle = [name, club].filter(Boolean).join("  ·  ");
  const px = fit(`${word}  ·  ${middle}  ·  ${word}`, 34 * k * ts, CANVAS_W - 40, 0.14);
  const line = [word, word, word, middle, word, word, word].join("  ·  ");
  const blockH = px + 22 * k + 2;
  const place = natPlace(data, CANVAS_W, H, { fx: faceX, fy: top + blockH + (story ? 320 : 220), fs: story ? 205 : 145 });
  return (
    <PoolFrame data={data} place={place} H={H} pool={{ x: -100, y: top - 140, w: CANVAS_W + 200, h: blockH + 280 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top, overflow: "hidden", display: "flex", justifyContent: "center" }}>
        <div style={{ ...tiny(px, 0.14), fontWeight: 800, textShadow: SHADOW, flexShrink: 0 }}>{line}</div>
      </div>
      <div style={{ position: "absolute", left: CANVAS_W / 2 - 60 * k, width: 120 * k, top: top + px + 22 * k, height: 3, background: clubInk(data), borderRadius: 2 }} />
    </PoolFrame>
  );
}
