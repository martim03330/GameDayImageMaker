/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const GOLD = "linear-gradient(160deg, #f6dc8c 0%, #d9ad48 45%, #a8781f 100%)";

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/** His club's crest, from the render data (home or away side of the fixture). */
function ourCrest(data: RenderData): string | null {
  const fx = natFixture(data);
  return data.club?.crestUrl ?? (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? null;
}

/**
 * Six white bars stacked like a wing, longest on top, each shorter than the one above (Bureau Borsche drew Venezia's
 * winged lion with six bars — the six sestieri, the comb of a gondola's prow). `flip` mirrors it for the left side.
 */
function Wing({ k, flip = false }: { k: number; flip?: boolean }) {
  const lens = [150, 128, 106, 84, 62, 40];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 * k, alignItems: flip ? "flex-end" : "flex-start", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }}>
      {lens.map((l, i) => (
        <div key={i} style={{ width: l * k, height: 9 * k, background: "#fff", borderRadius: 1 }} />
      ))}
    </div>
  );
}

/** A title with a wing on each side, the wings as tall as six bars (~100px in a story). */
function Winged({ text, px, k }: { text: string; px: number; k: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30 * k }}>
      <Wing k={k} flip />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: px, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{text}</div>
      <Wing k={k} />
    </div>
  );
}

const WING_W = (k: number) => 2 * (150 + 30) * k;

/**
 * Asas (matchday), after Bureau Borsche's Venezia FC identity (the winged lion redrawn as six bars, set in a
 * neo-grotesque sans): MATCHDAY 14 in heavy grotesque between two six-bar wings above his head; the fixture
 * (exact names) and date · kick-off · ground under it.
 */
export function Wingbars({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tPx = Math.min(64 * k * ts, (W - WING_W(k)) / Math.max(1, title.length * 0.62));
  const wingH = 6 * 9 * k + 5 * 9 * k;
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = Math.max(tPx, wingH) + (fixture ? 26 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <Winged text={title} px={tPx} k={k} />
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
        ))}
      </Shade>
    </Top>
  );
}

/** Golo · asas (goal): GOAL between the same six-bar wings, his name and exact club under it. */
export function Goalwingbars({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(104 * k * ts, (W - WING_W(k)) / Math.max(1, word.length * 0.66));
  const wingH = 6 * 9 * k + 5 * 9 * k;
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = Math.max(gPx, wingH) + 26 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Winged text={word} px={gPx} k={k} />
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * His crest toned to gold (grey, then a warm sepia pushed to gold), as Venezia's lion went back to gold: every
 * detail of the crest stays readable, only its colours turn to gold. A soft dark drop shadow keeps it off any sky.
 */
function GoldCrest({ src, size }: { src: string; size: number }) {
  return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "grayscale(1) sepia(1) saturate(2.6) hue-rotate(-8deg) brightness(1.08) contrast(1.05) drop-shadow(0 3px 10px rgba(0,0,0,.55))" }} />;
}

/** A short gold rule between title and facts. */
const GoldRule = ({ k }: { k: number }) => <div style={{ width: 90 * k, height: 5 * k, background: GOLD, boxShadow: "0 1px 6px rgba(0,0,0,.45)" }} />;

/**
 * Emblema dourado (matchday), after Bureau Borsche's Venezia FC identity (the crest's lion returned to gold): his
 * club's crest as one flat gold mark above his head, MATCHDAY 14 in heavy grotesque under it, a short gold rule and the
 * fixture with date · kick-off · ground. No crest on record: the gold rule leads.
 */
export function Goldcrest({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const crest = ourCrest(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const cs = 84 * k;
  const tPx = Math.min(60 * k * ts, W / Math.max(1, title.length * 0.62));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = (crest ? cs + 16 * k : 0) + tPx + 16 * k + 5 * k + (fixture ? 16 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        {crest && <GoldCrest src={crest} size={cs} />}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: tPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: crest ? 16 * k : 0 }}>{title}</div>
        <div style={{ marginTop: 16 * k }}>
          <GoldRule k={k} />
        </div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 16 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
        ))}
      </Shade>
    </Top>
  );
}

/** Golo · emblema dourado (goal): the gold crest over GOAL, a short gold rule, his name and exact club. */
export function Goalgoldcrest({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const crest = ourCrest(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const cs = 96 * k;
  const gPx = Math.min(110 * k * ts, W / Math.max(1, word.length * 0.66));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = (crest ? cs + 22 * k : 0) + gPx + 22 * k + 5 * k + 22 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        {crest && <GoldCrest src={crest} size={cs} />}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: gPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: crest ? 22 * k : 0 }}>{word}</div>
        <div style={{ marginTop: 22 * k }}>
          <GoldRule k={k} />
        </div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 22 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Fundação (matchday), after Middlesbrough's 2026/27 crest (the roundel carrying the club's full name and its founding
 * year): above his head his crest beside his club's exact name, "EST. 1913" and a short rule under the name, then
 * MATCHDAY 14 and the fixture facts. Founding year unknown: the name stands alone beside the crest.
 */
export function Estyear({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const crest = ourCrest(data);
  const club = ourClub(data).toUpperCase();
  const year = /^\d{4}$/.test((data.club?.founded ?? "").trim()) ? (data.club?.founded ?? "").trim() : "";
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const cs = 80 * k;
  const nameW = W - (crest ? cs + 26 * k : 0);
  const nPx = fit(club, 30 * k * ts, nameW * 0.9, 0.18);
  const yPx = 21 * k * ts;
  const headH = Math.max(crest ? cs : 0, nPx + (year ? 12 * k + yPx : 0));
  const tPx = Math.min(60 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 26 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = headH + 22 * k + tPx + (fixture ? 18 * k + fPx : 0) + (when.h ? 12 * k + when.h : 0);
  const rule = <div style={{ width: 34 * k, height: 3 * k, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.45)" }} />;
  return (
    <Top data={data} blockH={blockH} drop={300}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k, height: headH }}>
          {crest && <img src={crest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.5))" }} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ ...caps(nPx, 0.18), paddingLeft: 0, fontWeight: 800 }}>{club}</div>
            {year && (
              <div style={{ display: "flex", alignItems: "center", gap: 14 * k, marginTop: 12 * k }}>
                <div style={{ ...caps(yPx, 0.3), paddingLeft: 0, fontWeight: 700 }}>{`EST. ${year}`}</div>
                {rule}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: tPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 22 * k }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 18 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 12 * k, opacity: 0.94 }}>{l}</div>
        ))}
      </Shade>
    </Top>
  );
}
