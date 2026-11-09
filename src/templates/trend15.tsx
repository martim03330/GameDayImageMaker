/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const ROUND = "var(--font-unbounded), var(--font-inter), sans-serif";

/** Date · kick-off · ground rows under a block (one or two lines, never under ~26px on a phone). */
function When({ data, k, ts, mt }: { data: RenderData; k: number; ts: number; mt: number }) {
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  return (
    <>
      {rows.map((l, i) => (
        <div key={i} style={{ ...caps(px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : mt, opacity: 0.94 }}>{l}</div>
      ))}
    </>
  );
}
const whenH = (data: RenderData, k: number, ts: number) => {
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  return rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0;
};

/**
 * The ironwork of a stadium gate as one band: a row of round arches between two bars, drawn in thick white (JKR's
 * Sporting CP identity turned the grille of Porta 10-A, the stadium entrance, into a brand pattern).
 */
function IronBand({ w, h, k }: { w: number; h: number; k: number }) {
  const sw = 5 * k;
  const n = Math.max(6, Math.round(w / (h * 1.1)));
  const a = (w - sw) / n;
  const arches = Array.from({ length: n }, (_, i) => {
    const x = sw / 2 + i * a;
    const r = a / 2;
    return `M ${x} ${h - sw / 2} L ${x} ${sw / 2 + r} A ${r} ${r} 0 0 1 ${x + a} ${sw / 2 + r} L ${x + a} ${h - sw / 2}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.4))" }}>
      <path d={arches.join(" ")} fill="none" stroke="#fff" strokeWidth={sw} strokeLinejoin="round" />
      <line x1={0} y1={sw / 2} x2={w} y2={sw / 2} stroke="#fff" strokeWidth={sw} />
      <line x1={0} y1={h - sw / 2} x2={w} y2={h - sw / 2} stroke="#fff" strokeWidth={sw} />
    </svg>
  );
}

/**
 * Grade (matchday), after JKR's Sporting CP identity (the ironwork of the Porta 10-A gate as a pattern): MATCHDAY 14
 * in Anton over one band of white gate arches, the fixture (exact names) and date · kick-off · ground under it.
 */
export function Ironband({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tPx = Math.min(88 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const bw = Math.min(W, 620 * k);
  const bh = 64 * k;
  const wh = whenH(data, k, ts);
  const blockH = tPx + 26 * k + bh + (fixture ? 26 * k + fPx : 0) + (wh ? 16 * k + wh : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      <div style={{ marginTop: 26 * k }}>
        <IronBand w={bw} h={bh} k={k} />
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
      {wh > 0 && <When data={data} k={k} ts={ts} mt={16 * k} />}
    </Top>
  );
}

/** Golo · grade (goal): GOAL in Anton over the same band of gate arches, his name and exact club under it. */
export function Goalironband({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(140 * k * ts, W / Math.max(1, word.length * 0.5));
  const bw = Math.min(W, 520 * k);
  const bh = 58 * k;
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 24 * k + bh + 24 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ marginTop: 24 * k }}>
        <IronBand w={bw} h={bh} k={k} />
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}

/**
 * Letra redonda (matchday), after Sporting Sans (JKR with F37 for Sporting CP: letters with rounded angles from the
 * 1945 crest): MATCHDAY over a large 14 in a wide rounded geometric face, the fixture and the details under it.
 */
export function Roundsans({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const fixture = fixtureOf(data);
  const wPx = Math.min(60 * k * ts, W / Math.max(1, word.length * 0.86));
  const nPx = f.roundNo ? Math.min(92 * k * ts, W / Math.max(1, f.roundNo.length * 0.9)) : 0;
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const wh = whenH(data, k, ts);
  const blockH = wPx + (nPx ? 10 * k + nPx : 0) + (fixture ? 28 * k + fPx : 0) + (wh ? 16 * k + wh : 0);
  const round = { fontFamily: ROUND, lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: SHADOW };
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ ...round, fontWeight: 800, fontSize: wPx, letterSpacing: "0.01em" }}>{word}</div>
      {nPx > 0 && <div style={{ ...round, fontWeight: 300, fontSize: nPx, marginTop: 10 * k }}>{f.roundNo}</div>}
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
      {wh > 0 && <When data={data} k={k} ts={ts} mt={16 * k} />}
    </Top>
  );
}

/** A heater shield path in a w × h box (flat top, sides running into a point). */
const shieldPath = (w: number, h: number) => `M 0 0 H ${w} V ${h * 0.46} C ${w} ${h * 0.78} ${w * 0.72} ${h * 0.92} ${w / 2} ${h} C ${w * 0.28} ${h * 0.92} 0 ${h * 0.78} 0 ${h * 0.46} Z`;

/**
 * A heraldic shield "per pale": the left half in his club's colour, the right half white, edged in white; the
 * figure inside is counterchanged — white on the colour, the colour on the white — as heraldry does.
 */
function PerPale({ w, h, ink, text, k }: { w: number; h: number; ink: string; text: string; k: number }) {
  const px = h * (text.length > 2 ? 0.36 : 0.5);
  const fig = (color: string) => (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: h * 0.1, fontFamily: DISPLAY, fontSize: px, lineHeight: 1, color }}>{text}</div>
  );
  const half = (left: boolean) => ({ position: "absolute" as const, top: 0, bottom: 0, left: left ? 0 : w / 2, width: w / 2, overflow: "hidden" });
  return (
    <div style={{ position: "relative", width: w, height: h, clipPath: `path('${shieldPath(w, h)}')`, filter: "drop-shadow(0 6px 18px rgba(0,0,0,.4))" }}>
      <div style={{ ...half(true), background: ink }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}>{fig("#fff")}</div>
      </div>
      <div style={{ ...half(false), background: "#fff" }}>
        <div style={{ position: "absolute", left: -w / 2, top: 0, width: w, height: h }}>{fig(ink)}</div>
      </div>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <path d={shieldPath(w, h)} fill="none" stroke="#fff" strokeWidth={10 * k} />
      </svg>
    </div>
  );
}

/**
 * Brasão (matchday), after Nomad's heraldic Tottenham Hotspur identity: the round number counterchanged in a shield
 * per pale (his club's colour and white) beside MATCHDAY in Anton, above his head; the fixture and the details under it.
 * No round number: the shield is left out.
 */
export function Heraldsplit({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const ink = clubInk(data);
  const word = (data.content.kicker || "Matchday").toUpperCase();
  const fixture = fixtureOf(data);
  const sw = 104 * k;
  const sh = 122 * k;
  const tPx = Math.min(96 * k * ts, (W - (f.roundNo ? sw + 30 * k : 0)) / Math.max(1, word.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const wh = whenH(data, k, ts);
  const blockH = Math.max(f.roundNo ? sh : 0, tPx) + (fixture ? 26 * k + fPx : 0) + (wh ? 16 * k + wh : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 * k }}>
        {f.roundNo && <PerPale w={sw} h={sh} ink={ink} text={f.roundNo} k={k} />}
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
      {wh > 0 && <When data={data} k={k} ts={ts} mt={16 * k} />}
    </Top>
  );
}

/** Golo · brasão (goal): his shirt number counterchanged in the shield per pale beside GOAL in Anton, his name and exact club under them. No number: GOAL alone. */
export function Goalheraldsplit({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const num = (data.player?.number ?? "").trim();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const sw = 108 * k;
  const sh = 126 * k;
  const gPx = Math.min(120 * k * ts, (W - (num ? sw + 30 * k : 0)) / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = Math.max(num ? sh : 0, gPx) + 22 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 * k }}>
        {num && <PerPale w={sw} h={sh} ink={ink} text={num} k={k} />}
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 22 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}
