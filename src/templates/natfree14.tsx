/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
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

const crestImg = (src: string, size: number) => <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))", flexShrink: 0 }} />;

/**
 * Natural · emblemas ao lado (matchday): one row above his head — the home crest, MATCHDAY 14 in Anton, the away
 * crest — then the fixture (exact names) and date · kick-off · ground. A missing crest leaves its side empty.
 */
export function Natcrestflank({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const cr = 92 * k;
  const gap = 30 * k;
  const tPx = Math.min(78 * k * ts, (W - 2 * (cr + gap)) / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const rowH = Math.max(cr, tPx);
  const blockH = rowH + (fixture ? 28 * k + fPx : 0) + (when.h ? 16 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ display: "flex", alignItems: "center", gap }}>
        <div style={{ width: cr, height: cr }}>{fx.homeCrest && crestImg(fx.homeCrest, cr)}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        <div style={{ width: cr, height: cr }}>{fx.awayCrest && crestImg(fx.awayCrest, cr)}</div>
      </div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
      {when.h > 0 && <div style={{ marginTop: 16 * k }}>{when.node}</div>}
    </Top>
  );
}

/**
 * Golo natural · emblema e palavra (goal): his club's crest and GOAL side by side as one lockup above his head, the
 * crest as tall as the word; his name and exact club centred under it. No crest: GOAL alone.
 */
export function Goalnatcrestflank({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const crest = data.club?.crestUrl;
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(140 * k * ts, (W - (crest ? 160 * k : 0)) / Math.max(1, word.length * 0.5));
  const cr = gPx * 0.92;
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const blockH = gPx + 26 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
        {crest && crestImg(crest, cr)}
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      </div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}

/** "EFBET LEAGUE  /  MATCHDAY 14  /" — the path to the post, each step separated by a slash. */
function Crumbs({ steps, px }: { steps: string[]; px: number }) {
  return (
    <div style={{ ...caps(px, 0.16), fontWeight: 700, display: "flex", alignItems: "center" }}>
      {steps.map((s, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ opacity: 0.86 }}>{s}</span>
          <span style={{ opacity: 0.6, margin: "0 0.7em" }}>/</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Natural · percurso (matchday): the post's path as a breadcrumb — competition / MATCHDAY 14 / — and its last step,
 * the fixture, large in Anton; date · kick-off · ground under it, all above his head. No competition: one step.
 */
export function Natbreadcrumb({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const fx = natFixture(data);
  const round = roundTitle(data);
  const comp = f.roundNo && f.comp ? f.comp.toUpperCase() : "";
  const steps = [comp, round].filter(Boolean);
  const path = steps.join("  /  ") + "  /";
  const lines = fx.homeName && fx.awayName ? [fx.homeName.toUpperCase(), `V ${fx.awayName.toUpperCase()}`] : [round];
  const cPx = fit(path, 24 * k * ts, W, 0.16 + 0.05);
  const tPx = Math.min(74 * k * ts, ...lines.map((l) => W / Math.max(1, l.length * 0.48)));
  const when = whenOf(data, k, ts);
  const blockH = cPx + 26 * k + lines.length * tPx + (lines.length - 1) * 8 * k + (when.h ? 24 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Crumbs steps={steps} px={cPx} />
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: i ? 8 * k : 26 * k }}>{l}</div>
      ))}
      {when.h > 0 && <div style={{ marginTop: 24 * k }}>{when.node}</div>}
    </Top>
  );
}

/**
 * Golo natural · percurso (goal): the breadcrumb of his club and his name — SC VIANENSE SAD / MOISÉS CONCEIÇÃO / —
 * and its last step, GOAL, large in Anton above his head.
 */
export function Goalnatbreadcrumb({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const name = fullName(data);
  const steps = [club, name].filter(Boolean);
  const path = steps.join("  /  ") + "  /";
  const cPx = fit(path, 26 * k * ts, W, 0.21);
  const gPx = Math.min(150 * k * ts, W / Math.max(1, word.length * 0.5));
  const blockH = (steps.length ? cPx + 24 * k : 0) + gPx;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      {steps.length > 0 && <Crumbs steps={steps} px={cPx} />}
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: steps.length ? 24 * k : 0 }}>{word}</div>
    </Top>
  );
}

/**
 * Golo natural · contra (goal): GOAL in Anton, his name and exact club, then who he scored against — AGAINST, the
 * opponent's crest and exact name on one row. Opponent unknown: that row is left out.
 */
export function Goalnatagainst({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const f = matchFacts(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const opp = f.opp;
  const cr = 56 * k;
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 21 * k * ts, W, 0.22);
  const lPx = 20 * k * ts;
  const oPx = fit(opp, 28 * k * ts, W - cr - 18 * k - 150 * k, 0.1);
  const rowH = Math.max(cr, oPx);
  const blockH = gPx + 24 * k + nPx + (club ? 12 * k + cPx : 0) + (opp ? 34 * k + rowH : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      {opp && (
        <div style={{ display: "flex", alignItems: "center", gap: 18 * k, marginTop: 34 * k, height: rowH }}>
          <div style={{ ...caps(lPx, 0.3), fontWeight: 600, opacity: 0.86 }}>AGAINST</div>
          {f.oppCrest && crestImg(f.oppCrest, cr)}
          <div style={{ ...caps(oPx, 0.1), fontWeight: 800 }}>{opp}</div>
        </div>
      )}
    </Top>
  );
}
