/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/** Date · kick-off · ground rows, sized for a phone. */
function whenOf(data: RenderData, k: number, ts: number) {
  const when = whenRows(data, 21 * k * ts, W, 0.16);
  const px = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W, 0.16)));
  const h = when.length ? when.length * px + (when.length - 1) * 10 * k : 0;
  const node = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 0, opacity: 0.94 }}>{l}</div>
      ))}
    </div>
  );
  return { h, node };
}

/**
 * Natural · equipas (matchday): the two clubs are the title — home over away in Anton, exact names (only the case
 * changes), a light "v" between them — above his head; MATCHDAY 14 small on top, date · kick-off · ground under.
 */
export function Natteamstack({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const home = fx.homeName.toUpperCase();
  const away = fx.awayName.toUpperCase();
  const title = roundTitle(data);
  const tPx = fit(title, 22 * k * ts, W, 0.3);
  if (!home || !away) {
    const px = Math.min(78 * k * ts, W / Math.max(1, title.length * 0.5));
    return (
      <Top data={data} blockH={px} drop={290}>
        <div style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      </Top>
    );
  }
  const nPx = Math.min(56 * k * ts, W / Math.max(1, Math.max(home.length, away.length) * 0.5));
  const vPx = 22 * k * ts;
  const when = whenOf(data, k, ts);
  const blockH = tPx + 16 * k + nPx + 8 * k + vPx + 8 * k + nPx + 22 * k + when.h;
  const team = (t: string) => <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{t}</div>;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ ...caps(tPx, 0.3), opacity: 0.92, marginBottom: 16 * k }}>{title}</div>
      {team(home)}
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: vPx, lineHeight: 1, margin: `${8 * k}px 0`, textShadow: SHADOW }}>v</div>
      {team(away)}
      <div style={{ marginTop: 22 * k }}>{when.node}</div>
    </Top>
  );
}

/**
 * Natural · anel da jornada (matchday): the round number in Anton inside a thick white ring above his head,
 * MATCHDAY spaced over it, then the fixture and its facts. No round number on record: the ring is left out.
 */
export function Natroundring({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const fixture = fixtureOf(data);
  const ring = f.roundNo ? 96 * k : 0;
  const wPx = fit(word, 26 * k * ts, W, 0.34);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = wPx + 16 * k + ring + (ring ? 20 * k : 0) + (fixture ? fPx + 14 * k : 0) + when.h;
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ ...caps(wPx, 0.34), marginBottom: 16 * k }}>{word}</div>
      {ring > 0 && (
        <div
          style={{
            width: ring,
            height: ring,
            borderRadius: "50%",
            border: `${6 * k}px solid #fff`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: DISPLAY,
            fontSize: ring * (f.roundNo.length > 2 ? 0.4 : 0.52),
            lineHeight: 1,
            textShadow: SHADOW,
            boxShadow: "0 2px 18px rgba(0,0,0,.35), inset 0 2px 18px rgba(0,0,0,.25)",
            marginBottom: 20 * k,
          }}
        >
          {f.roundNo}
        </div>
      )}
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginBottom: 14 * k }}>{fixture}</div>}
      {when.node}
    </Top>
  );
}

/**
 * Natural · minúsculas (matchday): everything in lower case, quiet — "matchday 14" in light Inter, large, the
 * fixture (exact names, lower case) and its facts under it — above his head.
 */
export function Natlowercase({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data).toLowerCase();
  const fixture = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toLowerCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toLowerCase();
  const tPx = Math.min(104 * k * ts, W / Math.max(1, title.length * 0.52));
  const fPx = Math.min(34 * k * ts, W / Math.max(1, fixture.length * 0.5));
  // One line when it stays ≥ 26px, else date · kick-off / ground.
  const sizeOf = (t: string) => Math.min(28 * k * ts, W / Math.max(1, t.length * 0.5));
  const wLines = !when ? [] : sizeOf(when) >= 26 ? [when] : [[fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toLowerCase(), fx.venue.toLowerCase()].filter(Boolean);
  const wPx = Math.min(...wLines.map(sizeOf), 28 * k * ts);
  const blockH = tPx + 26 * k + (fixture ? fPx + 14 * k : 0) + wLines.length * (wPx + 8 * k);
  const line = (px: number, weight: number) => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, lineHeight: 1.1, whiteSpace: "nowrap" as const, textShadow: SHADOW });
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ ...line(tPx, 300), letterSpacing: "-0.01em", lineHeight: 1 }}>{title}</div>
      {fixture && <div style={{ ...line(fPx, 600), marginTop: 26 * k }}>{fixture}</div>}
      {wLines.map((l, i) => (
        <div key={i} style={{ ...line(wPx, 400), marginTop: (i ? 8 : 14) * k, opacity: 0.94 }}>{l}</div>
      ))}
    </Top>
  );
}

/**
 * Golo natural · minúsculas (goal): "goal" in light lower case, large, above his head; his name and exact club
 * under it, also in lower case (only the case changes).
 */
export function Goalnatlowercase({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toLowerCase();
  const name = fullName(data).toLowerCase();
  const club = ourClub(data).toLowerCase();
  const gPx = Math.min(170 * k * ts, W / Math.max(1, word.length * 0.55));
  const nPx = Math.min(40 * k * ts, W / Math.max(1, name.length * 0.52));
  const cPx = Math.max(26, Math.min(28 * k * ts, W / Math.max(1, club.length * 0.5)));
  const blockH = gPx + 24 * k + nPx + (club ? 10 * k + cPx : 0);
  const line = (px: number, weight: number) => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW });
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ ...line(gPx, 300), letterSpacing: "-0.02em" }}>{word}</div>
      <div style={{ ...line(nPx, 600), marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...line(cPx, 400), marginTop: 10 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}

/**
 * Golo natural · clube em destaque (goal): his exact club name is the title, in Anton, with GOAL spaced small over it
 * and his name in bold caps under it — the goal told as the club's.
 */
export function Goalnatclubhero({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const name = fullName(data);
  const gPx = fit(word, 26 * k * ts, W, 0.4);
  const cPx = club ? Math.min(96 * k * ts, W / Math.max(1, club.length * 0.5)) : 0;
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const blockH = gPx + 20 * k + cPx + 26 * k + nPx;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ ...caps(gPx, 0.4), fontWeight: 800 }}>{word}</div>
      {club && <div style={{ fontFamily: DISPLAY, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap", marginTop: 20 * k, textShadow: SHADOW }}>{club}</div>}
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
    </Top>
  );
}
