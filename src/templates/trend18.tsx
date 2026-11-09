import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const GOTHIC = "var(--font-gothic), serif";

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/** The fixture lines shared by the matchday looks below. */
function Facts({ data, k, ts, mt }: { data: RenderData; k: number; ts: number; mt: number }) {
  const fixture = fixtureOf(data);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  return (
    <>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: mt }}>{fixture}</div>}
      {when.rows.map((l, i) => (
        <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
      ))}
    </>
  );
}

const factsH = (data: RenderData, k: number, ts: number, mt: number) => {
  const fixture = fixtureOf(data);
  const when = whenOf(data, k, ts);
  return (fixture ? mt + fit(fixture, 27 * k * ts, W, 0.1) : 0) + (when.h ? 14 * k + when.h : 0);
};

/**
 * A word leaning left, the way FC Sans Pauli does: the whole word set back by a few degrees, a hint of rotation
 * so it doesn't read as a plain reverse italic. Set as one run so the letters keep their own spacing.
 */
function LeftLean({ text, px, family = SANS }: { text: string; px: number; family?: string }) {
  return (
    <div style={{ fontFamily: family, fontWeight: 900, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, letterSpacing: "-0.01em", transform: "skewX(11deg) rotate(-1.5deg)" }}>{text}</div>
  );
}

/**
 * Inclinado à esquerda (matchday), after FC St. Pauli's FC Sans Pauli by Karl Anders and Christoph Koeberlin (a
 * club face that leans left, each glyph slightly rotated): MATCHDAY 14 in heavy sans leaning left above his
 * head, the fixture (exact names) and date · kick-off · ground upright under it.
 */
export function Backslant({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const tPx = Math.min(96 * k * ts, W / Math.max(1, title.length * 0.68));
  const blockH = tPx + factsH(data, k, ts, 28 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <LeftLean text={title} px={tPx} />
        <Facts data={data} k={k} ts={ts} mt={28 * k} />
      </Shade>
    </Top>
  );
}

/** Golo · inclinado à esquerda (goal): GOAL leaning left in heavy sans, his name and exact club upright under it. */
export function Goalbackslant({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(150 * k * ts, W / Math.max(1, word.length * 0.72));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 28 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <LeftLean text={word} px={gPx} />
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 28 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Two widths of one voice: the first part tall and condensed (Anton), the second wide (heavy sans stretched to an
 * extended width), set on one baseline — after 1. FC Köln's variable EK Modena, whose widths take after the
 * club's stadiums. `wide` is drawn 1.45× as wide as it would set.
 */
function WidthPair({ narrow, wide, px, k }: { narrow: string; wide: string; px: number; k: number }) {
  const stretch = 1.45;
  const wideW = wide.length * px * 0.74 * WIDE_EM * stretch;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 22 * k, textShadow: SHADOW, whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86 }}>{narrow}</div>
      {wide && (
        <div style={{ width: wideW, display: "flex", justifyContent: "flex-start" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: px * 0.74, lineHeight: 1, transform: `scaleX(${stretch})`, transformOrigin: "left bottom" }}>{wide}</div>
        </div>
      )}
    </div>
  );
}

/** Heavy sans caps, average advance per letter (em). */
const WIDE_EM = 0.78;

/** Rough width of a WidthPair at `px`, for fitting it to the column (Anton caps ~0.5em a letter). */
const pairW = (narrow: string, wide: string, px: number, k: number) => narrow.length * px * 0.5 + (wide ? 22 * k + wide.length * px * 0.74 * WIDE_EM * 1.45 : 0);

/**
 * Duas larguras (matchday), after 1. FC Köln's variable EK Modena (NOCHNE.gmbh), its widths drawn from the club's
 * stadiums: MATCHDAY tall and condensed, the round number wide and extended beside it, above his head; the
 * fixture and date · kick-off · ground under it. No round number: the competition word alone, condensed.
 */
export function Widthpair({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const m = /^(.*\D)\s+(\d+)$/.exec(title);
  const narrow = m ? m[1] : title;
  const wide = m ? m[2] : "";
  const px = Math.min(110 * k * ts, (110 * k * W) / Math.max(1, pairW(narrow, wide, 110 * k, k)));
  const blockH = px * 0.9 + factsH(data, k, ts, 26 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <WidthPair narrow={narrow} wide={wide} px={px} k={k} />
        <Facts data={data} k={k} ts={ts} mt={26 * k} />
      </Shade>
    </Top>
  );
}

/** Golo · duas larguras (goal): GOAL tall and condensed with his surname wide and extended beside it; his full name and club under it. */
export function Goalwidthpair({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const last = (data.content.lastName || data.content.firstName || "").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const px = Math.min(130 * k * ts, (130 * k * W) / Math.max(1, pairW(word, last, 130 * k, k)));
  const nPx = fit(name, 30 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = px * 0.9 + 26 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <WidthPair narrow={word} wide={last} px={px} k={k} />
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Inicial gótica (matchday), after Arsenal's bespoke blackletter Rocastle, which the club keeps for rare, special
 * touches: only the first letter of MATCHDAY in blackletter, larger, the rest of the word in heavy sans, the
 * round number after it; the fixture and date · kick-off · ground under it.
 */
export function Gothicinitial({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const first = title.charAt(0);
  const rest = title.slice(1);
  const px = Math.min(84 * k * ts, W / Math.max(1, rest.length * 0.66 + 1.2));
  const blockH = px * 1.4 + factsH(data, k, ts, 24 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap", textShadow: SHADOW }}>
          <span style={{ fontFamily: GOTHIC, fontSize: px * 1.5, lineHeight: 1, marginRight: 6 * k }}>{first}</span>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: px, lineHeight: 1, letterSpacing: "-0.01em" }}>{rest}</span>
        </div>
        <Facts data={data} k={k} ts={ts} mt={24 * k} />
      </Shade>
    </Top>
  );
}
