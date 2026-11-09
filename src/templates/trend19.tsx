import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SERIF } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
/** Small caps over a busy sky (trees, sun through leaves): a tighter, darker halo than SHADOW. */
const HALO = "0 0 6px rgba(0,0,0,.85), 0 1px 3px rgba(0,0,0,.75), 0 2px 16px rgba(0,0,0,.5)";

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

function When({ data, k, ts, mt }: { data: RenderData; k: number; ts: number; mt: number }) {
  const when = whenOf(data, k, ts);
  return (
    <>
      {when.rows.map((l, i) => (
        <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : mt, opacity: 0.94, textShadow: HALO }}>{l}</div>
      ))}
    </>
  );
}

const whenH = (data: RenderData, k: number, ts: number, mt: number) => {
  const h = whenOf(data, k, ts).h;
  return h ? mt + h : 0;
};

/** Serif display size that fits a line (Fraunces runs about 0.56 em per character). */
const serifPx = (text: string, max: number, w: number) => Math.min(max, w / Math.max(1, [...text].length * 0.56));

/** A short double rule, the divider of a classic fair poster. */
function DoubleRule({ k, w }: { k: number; w: number }) {
  return <div style={{ width: w, height: 9 * k, borderTop: `${3 * k}px solid #fff`, borderBottom: `${2 * k}px solid #fff`, boxSizing: "border-box", filter: "drop-shadow(0 1px 4px rgba(0,0,0,.4))" }} />;
}

/**
 * Cartaz de feira (matchday), after Summa's identity for Sevilla FC (layouts on the hierarchies of Seville's classic
 * fair posters, a display serif "between folklore and football"): MATCHDAY 14 in small caps, his club's exact
 * name large in serif, "versus" and the opponent in a smaller italic, a double rule, then date · kick-off · ground.
 * The poster's weight sits on his own club.
 */
export function Feriaposter({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const ours = ourClub(data);
  const opp = data.content.home === false ? fx.homeName : fx.awayName;
  const lPx = fit(title, 26 * k * ts, W, 0.26);
  const cPx = serifPx(ours, 80 * k * ts, W);
  const oPx = opp ? serifPx(`versus ${opp}`, 34 * k * ts, W) : 0;
  const blockH = lPx + 18 * k + cPx + (opp ? 12 * k + oPx : 0) + 20 * k + 9 * k + whenH(data, k, ts, 18 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ ...caps(lPx, 0.26), fontWeight: 800 }}>{title}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 18 * k }}>{ours}</div>
        {opp && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: oPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 12 * k }}>versus {opp}</div>}
        <div style={{ marginTop: 20 * k }}>
          <DoubleRule k={k} w={260 * k} />
        </div>
        <When data={data} k={k} ts={ts} mt={18 * k} />
      </Shade>
    </Top>
  );
}

/** Golo · cartaz de feira (goal): GOAL in small caps, his name large in serif, "for" and his club in italic, a double rule. */
export function Goalferiaposter({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const club = ourClub(data);
  const lPx = fit(word, 30 * k * ts, W, 0.3);
  const nPx = serifPx(name, 96 * k * ts, W);
  const cPx = club ? serifPx(`for ${club}`, 40 * k * ts, W) : 0;
  const blockH = lPx + 22 * k + nPx + (club ? 16 * k + cPx : 0) + 26 * k + 9 * k;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <div style={{ ...caps(lPx, 0.3), fontWeight: 800 }}>{word}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: nPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 22 * k }}>{name}</div>
        {club && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 16 * k }}>for {club}</div>}
        <div style={{ marginTop: 26 * k }}>
          <DoubleRule k={k} w={260 * k} />
        </div>
      </Shade>
    </Top>
  );
}

/** Rallying lines in the spirit of Oxford United's "Push Forward" / "Chase Glory" (never a claim about the game). */
const MATCH_LINES = ["PUSH FORWARD.", "CHASE GLORY.", "ALL IN.", "HERE WE GO."];
const GOAL_LINES = ["BACK OF THE NET.", "GET IN.", "THERE IT IS."];
const lineOf = (data: RenderData, lines: string[]) => lines[Math.abs(data.params.seed ?? 0) % lines.length];

/** One short rallying line set huge on up to two lines, the full stop in his club's colour edged in white. */
function Rally({ text, px, data }: { text: string; px: number; data: RenderData }) {
  const words = text.replace(/\.$/, "").split(" ");
  const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : words;
  const ink = clubInk(data);
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.98, whiteSpace: "nowrap", textShadow: SHADOW }}>
          {l}
          {i === lines.length - 1 && <span style={{ color: ink, WebkitTextStroke: `${Math.max(2, px * 0.03)}px #fff` }}>.</span>}
        </div>
      ))}
    </>
  );
}

const rallyPx = (text: string, max: number) => {
  const words = text.replace(/\.$/, "").split(" ");
  const longest = words.length > 1 ? Math.max(words.slice(0, Math.ceil(words.length / 2)).join(" ").length, words.slice(Math.ceil(words.length / 2)).join(" ").length + 1) : text.length;
  return { px: Math.min(max, W / Math.max(1, longest * 0.5)), rows: words.length > 1 ? 2 : 1 };
};

/**
 * Lema (matchday), after LoveGunn's Oxford United identity (rallying lines such as "Push Forward" and "Chase
 * Glory" carried across the brand): one short rallying line in huge Anton above his head, the full stop in his
 * club's colour; MATCHDAY 14, the fixture and date · kick-off · ground in caps under it.
 */
export function Rallyline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const text = lineOf(data, MATCH_LINES);
  const { px, rows } = rallyPx(text, 76 * k * ts);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const lPx = fit(title, 22 * k * ts, W, 0.26);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const blockH = lPx + 14 * k + px * 0.98 * rows + 20 * k + (fixture ? fPx : 0) + whenH(data, k, ts, 12 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ ...caps(lPx, 0.26), fontWeight: 800, marginBottom: 14 * k }}>{title}</div>
        <Rally text={text} px={px} data={data} />
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 20 * k, textShadow: HALO }}>{fixture}</div>}
        <When data={data} k={k} ts={ts} mt={12 * k} />
      </Shade>
    </Top>
  );
}

/** Golo · lema (goal): a short goal line ("BACK OF THE NET.") huge in Anton, GOAL · his name, then his exact club. */
export function Goalrallyline({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const text = lineOf(data, GOAL_LINES);
  const { px, rows } = rallyPx(text, 124 * k * ts);
  const name = `${(data.content.kicker || "Goal").toUpperCase()}  ·  ${fullName(data)}`;
  const club = ourClub(data).toUpperCase();
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 24 * k * ts, W, 0.22);
  const blockH = px * 0.98 * rows + 28 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Rally text={text} px={px} data={data} />
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 28 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 700, marginTop: 12 * k, opacity: 0.96 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/** Horizontal hoops in his club's colour and white, as on a hooped shirt, edged in white so they hold on any sky. */
function Hoops({ data, k, w }: { data: RenderData; k: number; w: number }) {
  const ink = clubInk(data);
  const band = 12 * k;
  return (
    <div style={{ width: w, height: band * 4, borderRadius: 6 * k, border: `${3 * k}px solid #fff`, boxSizing: "border-box", background: `repeating-linear-gradient(to bottom, ${ink} 0 ${band}px, #fff ${band}px ${band * 2}px)`, boxShadow: "0 6px 18px rgba(0,0,0,.35)" }} />
  );
}

/**
 * Aros (matchday), after the way a shirt pattern becomes a club's identity (Celtic's hoops, as read in
 * MadeGoodDesigns' brand-guidelines study): MATCHDAY 14 in Anton, a block of hoops in his club's colour and white
 * as the one graphic, then the fixture and date · kick-off · ground.
 */
export function Hoopsblock({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tPx = Math.min(76 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const blockH = tPx + 20 * k + 48 * k + (fixture ? 20 * k + fPx : 0) + whenH(data, k, ts, 14 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        <div style={{ marginTop: 20 * k }}>
          <Hoops data={data} k={k} w={W * 0.62} />
        </div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 20 * k, textShadow: HALO }}>{fixture}</div>}
        <When data={data} k={k} ts={ts} mt={14 * k} />
      </Shade>
    </Top>
  );
}
