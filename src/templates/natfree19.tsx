import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
/** Small caps over a busy sky (trees, sun through leaves): a tighter, darker halo than SHADOW. */
export const HALO = "0 0 6px rgba(0,0,0,.85), 0 1px 3px rgba(0,0,0,.75), 0 2px 16px rgba(0,0,0,.5)";

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/** The fixture and date · kick-off · ground under a block. */
export function Facts({ data, k, ts, mt }: { data: RenderData; k: number; ts: number; mt: number }) {
  const fixture = fixtureOf(data);
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  return (
    <>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: mt, textShadow: HALO }}>{fixture}</div>}
      {when.rows.map((l, i) => (
        <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94, textShadow: HALO }}>{l}</div>
      ))}
    </>
  );
}

export const factsH = (data: RenderData, k: number, ts: number, mt: number) => {
  const fixture = fixtureOf(data);
  const when = whenOf(data, k, ts);
  return (fixture ? mt + fit(fixture, 27 * k * ts, W, 0.1) : 0) + (when.h ? 14 * k + when.h : 0);
};

/**
 * A supporter's scarf held out straight: a band in his club's colour edged in white (it holds on any sky), two
 * white stripes along it, the fringe at both ends, and one line of caps knitted in the middle.
 */
function Scarf({ data, text, k, ts, h }: { data: RenderData; text: string; k: number; ts: number; h: number }) {
  const ink = clubInk(data);
  const fringe = 40 * k;
  const bodyW = W - 2 * fringe;
  const px = fit(text, 40 * k * ts, bodyW - 60 * k, 0.12);
  const tassels = { width: fringe, height: h - 12 * k, background: `repeating-linear-gradient(to bottom, ${ink} 0 ${7 * k}px, transparent ${7 * k}px ${12 * k}px)`, filter: "drop-shadow(0 0 1px rgba(255,255,255,.9))" };
  return (
    <div style={{ display: "flex", alignItems: "center", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.35))" }}>
      <div style={tassels} />
      <div style={{ position: "relative", width: bodyW, height: h, background: ink, border: `${4 * k}px solid #fff`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 12 * k, height: 6 * k, background: "#fff" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 12 * k, height: 6 * k, background: "#fff" }} />
        <div style={{ ...caps(px, 0.12), fontWeight: 900, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.35)" }}>{text}</div>
      </div>
      <div style={tassels} />
    </div>
  );
}

/**
 * Natural · cachecol (matchday): MATCHDAY 14 in Anton above his head, then his club's exact name knitted on a
 * supporter's scarf in the club's colour, and the fixture with date · kick-off · ground under it.
 */
export function Natscarf({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const club = ourClub(data).toUpperCase();
  const tPx = Math.min(64 * k * ts, W / Math.max(1, title.length * 0.5));
  const blockH = tPx + 20 * k + 88 * k + factsH(data, k, ts, 20 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        <div style={{ marginTop: 20 * k }}>
          <Scarf data={data} text={club} k={k} ts={ts} h={88 * k} />
        </div>
        <Facts data={data} k={k} ts={ts} mt={20 * k} />
      </Shade>
    </Top>
  );
}

/** Golo natural · cachecol (goal): GOAL in Anton, his name knitted on the scarf in his club's colour, the club under it. */
export function Goalnatscarf({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const cPx = fit(club, 24 * k * ts, W, 0.22);
  const blockH = gPx + 26 * k + 104 * k + (club ? 22 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        <div style={{ marginTop: 26 * k }}>
          <Scarf data={data} text={name} k={k} ts={ts} h={104 * k} />
        </div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 700, marginTop: 22 * k, opacity: 0.96 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * A string of triangular flags across the whole width, sagging a little in the middle, alternating his club's
 * colour and white; the coloured ones carry a white edge so a blue club still reads on a blue sky.
 */
function Bunting({ data, k }: { data: RenderData; k: number }) {
  const ink = clubInk(data);
  const n = 11;
  const fw = CANVAS_W / n;
  const fh = 52 * k;
  const sag = 22 * k;
  const yAt = (x: number) => sag * (1 - ((x - CANVAS_W / 2) / (CANVAS_W / 2)) ** 2);
  return (
    <svg width={CANVAS_W} height={fh + sag + 8 * k} style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.35))" }}>
      <path d={`M 0 ${yAt(0)} Q ${CANVAS_W / 2} ${2 * sag} ${CANVAS_W} ${yAt(CANVAS_W)}`} fill="none" stroke="#fff" strokeWidth={3 * k} />
      {Array.from({ length: n }, (_, i) => {
        const x0 = i * fw + 6 * k;
        const x1 = (i + 1) * fw - 6 * k;
        const y0 = yAt(x0);
        const y1 = yAt(x1);
        const tip = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 + fh };
        const own = i % 2 === 0;
        return <path key={i} d={`M ${x0} ${y0} L ${x1} ${y1} L ${tip.x} ${tip.y} Z`} fill={own ? ink : "#fff"} stroke="#fff" strokeWidth={own ? 3 * k : 0} strokeLinejoin="round" />;
      })}
    </svg>
  );
}

const buntingH = (k: number) => 52 * k + 22 * k + 8 * k;

/**
 * Natural · bandeirinhas (matchday): a string of little flags in his club's colour and white strung across the top
 * of the sky, as on a matchday street; MATCHDAY 14 in Anton under it, the fixture and date · kick-off · ground.
 */
export function Natbunting({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const tPx = Math.min(66 * k * ts, W / Math.max(1, title.length * 0.5));
  const blockH = buntingH(k) + 20 * k + tPx + factsH(data, k, ts, 20 * k);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Bunting data={data} k={k} />
      <Shade k={k} h={blockH - buntingH(k) - 20 * k}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 20 * k }}>{title}</div>
        <Facts data={data} k={k} ts={ts} mt={20 * k} />
      </Shade>
    </Top>
  );
}

/** Golo natural · bandeirinhas (goal): the same string of flags, GOAL in Anton under it, his name and exact club. */
export function Goalnatbunting({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 34 * k * ts, W, 0.12);
  const cPx = fit(club, 24 * k * ts, W, 0.22);
  const blockH = buntingH(k) + 30 * k + gPx + 24 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Bunting data={data} k={k} />
      <Shade k={k} h={blockH - buntingH(k) - 30 * k}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 30 * k }}>{word}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 700, marginTop: 12 * k, opacity: 0.96 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * A supporter's rosette: a pleated ring in his club's colour (white pleats between), a white ring, his club's
 * crest large on a white disc in the middle, two ribbon tails behind it.
 */
function Rosette({ data, d, k }: { data: RenderData; d: number; k: number }) {
  const ink = clubInk(data);
  const crest = data.club?.crestUrl;
  const tail = { position: "absolute" as const, top: d * 0.55, width: d * 0.2, height: d * 0.5, background: ink, border: `${3 * k}px solid #fff`, boxSizing: "border-box" as const, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)" };
  return (
    <div style={{ position: "relative", width: d, height: d * 1.08, flexShrink: 0, filter: "drop-shadow(0 6px 18px rgba(0,0,0,.4))" }}>
      <div style={{ ...tail, left: d * 0.28, transform: "rotate(16deg)", transformOrigin: "top center" }} />
      <div style={{ ...tail, left: d * 0.52, transform: "rotate(-16deg)", transformOrigin: "top center" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: d, height: d, borderRadius: "50%", background: `repeating-conic-gradient(${ink} 0deg 9deg, #fff 9deg 12deg)`, border: `${4 * k}px solid #fff`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: d * 0.14, top: d * 0.14, width: d * 0.72, height: d * 0.72, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 ${5 * k}px ${ink}, 0 0 0 ${9 * k}px #fff` }}>
        {crest && <img src={crest} alt="" style={{ width: d * 0.56, height: d * 0.56, objectFit: "contain" }} />}
      </div>
    </div>
  );
}

/**
 * Natural · roseta (matchday): his club's crest large on a supporter's rosette in the club's colour, and beside it
 * MATCHDAY 14 in Anton with the fixture and date · kick-off · ground set flush left — one row above his head.
 */
export function Natrosette({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const d = 200 * k;
  const gap = 34 * k;
  const tw = W - d - gap;
  const tPx = Math.min(70 * k * ts, tw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, tw, 0.08);
  const rows = whenRows(data, 21 * k * ts, tw, 0.12);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, tw, 0.12)));
  const textH = tPx + (fixture ? 18 * k + fPx : 0) + rows.length * (wPx + 10 * k);
  const blockH = Math.max(d * 1.08, textH);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Rosette data={data} d={d} k={k} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
            {fixture && <div style={{ ...caps(fPx, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: 18 * k, textShadow: HALO }}>{fixture}</div>}
            {rows.map((l, i) => (
              <div key={i} style={{ ...caps(wPx, 0.12), paddingLeft: 0, fontWeight: 600, marginTop: 10 * k, opacity: 0.94, textShadow: HALO }}>{l}</div>
            ))}
          </div>
        </div>
      </Shade>
    </Top>
  );
}
