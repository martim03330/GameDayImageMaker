/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { InkFilter } from "./band";
import { lift } from "./column";
import { ANTON, em, standing } from "./mist";
import { natFixture } from "./natkit";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { CREST_HALO } from "./usgame1";
import { clubColour } from "./wall";

/*
 * Round 75 · bold US gameday looks in the "Faixa lateral" / "Banda do emblema" family, each one adapting one
 * real college gameday graphic (Pinterest "college soccer gameday graphic"). Laid out for 1080×1350 and centred
 * in the story (dy), with every colour field running the full height.
 */

const PAPER = "#f2f2ef";

/** Greedy wrap of condensed caps into at most `maxLines` lines, as big as the width allows (names never cut). */
export function wrapCaps(text: string, w: number, max: number, min: number, tracking: number, maxLines = 3, adv = 0.58): { lines: string[]; px: number } {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return { lines: [], px: 0 };
  const width = (s: string, px: number) => [...s].length * (adv + tracking) * px;
  const wrap = (px: number) => {
    const lines: string[] = [];
    let cur = "";
    for (const wd of words) {
      const t = cur ? `${cur} ${wd}` : wd;
      if (!cur || width(t, px) <= w) cur = t;
      else {
        lines.push(cur);
        cur = wd;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  for (let px = max; px >= min; px -= 1) {
    const lines = wrap(px);
    if (lines.length <= maxLines && lines.every((l) => width(l, px) <= w)) return { lines, px };
  }
  const longest = Math.max(...words.map((x) => [...x].length));
  const px = Math.min(min, w / Math.max(1, longest * (adv + tracking)));
  return { lines: wrap(px), px };
}

/** The kicker as two stacked words: MATCH / DAY, GAME / DAY, or the words split in two. */
export function stackWords(kicker: string): string[] {
  const k = (kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").replace(/\s+/g, " ").trim();
  const m = /^(MATCH|GAME|AWAY|HOME|SENIOR)\s?(DAY)$/.exec(k);
  if (m) return [m[1], m[2]];
  const w = k.split(" ");
  if (w.length < 2) return [k];
  let best = [k];
  let diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(" ");
    const b = w.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (d < diff) [best, diff] = [[a, b], d];
  }
  return best;
}

/** Everything the three looks print about the game. */
export function facts(data: RenderData) {
  const fx = natFixture(data);
  const md = matchFacts(data);
  const away = data.content.home === false;
  const ours = (away ? fx.awayName : fx.homeName) || data.club?.name || "";
  const opp = (away ? fx.homeName : fx.awayName) || md.opp;
  const ourCrest = (away ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
  const oppCrest = (away ? fx.homeCrest : fx.awayCrest) ?? null;
  const time = fx.time;
  const second = fx.ptTime ? `(${fx.ptTime})` : "";
  const comp = [md.comp, md.round].filter(Boolean).join(" · ");
  return { fx, md, ours: ours.toUpperCase(), opp: opp.toUpperCase(), ourCrest, oppCrest: oppCrest === ourCrest ? null : oppCrest, time, second, date: fx.date.toUpperCase(), venue: fx.venue.toUpperCase(), comp: comp.toUpperCase() };
}

/** The canvas: full story height, layout centred (dy), the NEYOD mark at the agreed foot centre. */
export function frame(data: RenderData) {
  const H = data.canvasH ?? CANVAS_H;
  const dy = H > CANVAS_H ? (H - CANVAS_H) / 2 : 0;
  return { H, dy, ts: data.params.textScale ?? 1, logoTop: logoTopOf(data, H) };
}

export function Logo({ data, top, onLight }: { data: RenderData; top: number; onLight: boolean }) {
  return <AgencyLogo data={data} height={24} onLight={onLight} style={{ position: "absolute", left: "50%", top, transform: `translateX(-50%) scale(${data.params.logoScale ?? 1})`, transformOrigin: "center top" }} />;
}

/** The cut-out player, sharp and in colour, with a contact shadow under the boots when the feet are in. */
export function Player({ data, cx, headTop, floor, maxFace = 110, shadow = "rgba(0,0,0,.3)" }: { data: RenderData; cx: number; headTop: number; floor: number; maxFace?: number; shadow?: string }) {
  const fig = data.photoUrl;
  if (!fig) return null;
  const placed = standing(data, { cx, headTop, floor, maxFace, framing: "full" });
  const { box, style } = lift(data, placed, headTop + placed.faceH * 0.2);
  return (
    <>
      {box.feet && <div style={{ position: "absolute", left: box.faceCx - 210, width: 420, top: floor - 26, height: 52, borderRadius: "50%", background: `radial-gradient(closest-side, ${shadow}, rgba(0,0,0,0))`, filter: "blur(6px)" }} />}
      <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 26px rgba(0,0,0,.3))" }}>
        <img src={fig} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...style }} />
      </div>
    </>
  );
}

/**
 * Where he goes so his whole silhouette (a kick, arms out) stays between `minLeft` and `maxRight`: first he
 * slides sideways (within minCx..maxCx), then he gets smaller (feet kept on the floor). Returns his head top,
 * centre and face for the type around him.
 */
export function fitFigure(data: RenderData, o: { cx: number; headTop: number; floor: number; maxFace?: number; minLeft?: number; maxRight?: number; minCx?: number; maxCx?: number }) {
  let { cx, headTop } = o;
  const at = () => standing(data, { cx, headTop, floor: o.floor, maxFace: o.maxFace ?? 110, framing: "full" });
  let p = at();
  for (let i = 0; i < 10; i++) {
    const overR = o.maxRight != null ? p.left + p.width - o.maxRight : 0;
    const overL = o.minLeft != null ? o.minLeft - p.left : 0;
    if (overR <= 1 && overL <= 1) break;
    const roomL = cx - (o.minCx ?? cx);
    const roomR = (o.maxCx ?? cx) - cx;
    if (overR > 1 && overL <= 1 && roomL > 4) cx -= Math.min(roomL, overR, overL < -1 ? -overL : Infinity);
    else if (overL > 1 && overR <= 1 && roomR > 4) cx += Math.min(roomR, overL, overR < -1 ? -overR : Infinity);
    else headTop = Math.min(o.floor - 520, headTop + Math.max(overR, overL, 0) * (p.height / Math.max(1, p.width)) * 0.9 + 6);
    p = at();
  }
  return { cx, headTop, face: { cx: p.faceCx, top: p.faceTop, h: p.faceH }, box: { left: p.left, top: p.top, width: p.width, height: p.height } };
}

export const capsStyle = (px: number, weight: number, tracking: number, color: string, extra?: CSSProperties): CSSProperties => ({
  fontFamily: CONDENSED,
  fontWeight: weight,
  fontSize: px,
  lineHeight: 1.12,
  letterSpacing: `${tracking}em`,
  whiteSpace: "nowrap",
  color,
  ...extra,
});

/** The ground colour: the club's own, kept deep enough for white type. */
export function groundOf(data: RenderData) {
  const club = clubColour(data);
  const l = luminance(club);
  const deep = l > 0.35 ? shade(club, -0.5) : l > 0.2 ? shade(club, -0.25) : l < 0.03 ? shade(club, 0.12) : club;
  const ink = luminance(club) > 0.28 ? shade(club, -0.35) : club;
  return { club, deep, ink };
}

/* =============================================================================================================
 * 1 · "It's gameday" vertical (BYU women's soccer, Addie Kotter — Pinterest "college soccer gameday graphic",
 * row 3 col 1): the club colour on the left, a tall white panel down the right; the kicker gigantic and vertical
 * in the club colour at the panel's inner edge, reading top to bottom and cut by the top edge; a tilted
 * club-colour "IT'S" tag across it; the crest top left on the colour with his name small under it; him in
 * front, crossing the panel edge; the fixture in bold condensed club-colour lines at the panel's foot.
 * ========================================================================================================== */
export function Usitsvertical({ data }: { data: RenderData }) {
  const { H, dy, ts, logoTop } = frame(data);
  const { deep, ink } = groundOf(data);
  const f = facts(data);
  const story = H > CANVAS_H;
  const panelX = 684;
  const panelW = CANVAS_W - panelX;

  // ---- the fixture block at the panel's foot ----
  const infoX = panelX + 34;
  const infoW = CANVAS_W - infoX - 40;
  const vs = wrapCaps(`${f.ours} VS ${f.opp}`, infoW, 36 * ts, 21, 0.02, 4, 0.6);
  const when = [f.date && `${f.date} AT ${f.time}`.replace(/ AT $/, ""), f.second].filter(Boolean).join(" ");
  const whenW = wrapCaps(when, infoW, 27 * ts, 17, 0.04, 2);
  const venue = wrapCaps(f.venue, infoW, 25 * ts, 16, 0.06, 2);
  const comp = wrapCaps(f.comp, infoW, 21 * ts, 14, 0.1, 2);
  const rows: { lines: string[]; px: number; weight: number; tracking: number; opacity: number; gap: number }[] = [
    { ...vs, weight: 800, tracking: 0.02, opacity: 1, gap: 0 },
    { ...whenW, weight: 700, tracking: 0.04, opacity: 1, gap: 14 },
    { ...venue, weight: 600, tracking: 0.06, opacity: 0.9, gap: 6 },
    { ...comp, weight: 600, tracking: 0.1, opacity: 0.7, gap: 10 },
  ].filter((r) => r.lines.length);
  const infoH = rows.reduce((a, r) => a + r.gap + r.lines.length * r.px * 1.12, 0);
  const infoBottom = (story ? 1300 : 1268) + dy;
  const infoTop = infoBottom - infoH;

  // ---- the giant vertical word: from above the top edge to just over the fixture ----
  const word = (data.content.kicker || "GAMEDAY").toUpperCase().replace(/’/g, "'").replace(/\s+/g, "").trim();
  const natural = em(word, ANTON, 44);
  const top0 = -40;
  const room = infoTop - 46 - top0;
  const size = Math.min((panelW * 0.66) / 0.86, (room / natural) * 1.12);
  const len = Math.min(room, natural * size * 1.14);
  const cap = size * 0.86;
  const baseX = panelX + 14; // the letters' feet on the panel edge, their tops towards the far edge
  const showIts = /DAY$/.test(word) && !/^IT'?S/.test(word);
  const itsPx = Math.min(78, cap * 0.36);

  // ---- him, crossing the panel edge ----
  const floor = 1300 + dy;
  const { cx, headTop, face } = fitFigure(data, { cx: 420, headTop: 318 + dy, floor, minLeft: 0, maxRight: infoX - 14, minCx: 130, maxCx: 520 });

  // ---- crest and his name, top left on the colour ----
  const crestTop = 70 + dy;
  const crestS = 112;
  const nameRoom = Math.max(150, face.cx - face.h * 1.4 - 56);
  const first = (data.content.firstName || "").toUpperCase();
  const last = (data.content.lastName || "").toUpperCase();
  const namePx = Math.min(34 * ts, ...[first, last].filter(Boolean).map((t) => nameRoom / Math.max(1, [...t].length * 0.64)));
  const nameTop = crestTop + crestS + 30;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 30% 40%, ${shade(deep, 0.12)}, ${deep} 62%, ${shade(deep, -0.22)} 100%)` }} />
      <div style={{ position: "absolute", left: panelX, top: 0, width: panelW, height: H, background: `linear-gradient(to right, #e6e6e3, ${PAPER} 18%, #fafaf8)` }} />
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${baseX.toFixed(1)},${top0}) rotate(90)`}>
          <text x={0} y={0} textLength={len} lengthAdjust="spacingAndGlyphs" style={{ fontFamily: DISPLAY, fontSize: size }} fill={ink}>
            {word}
          </text>
        </g>
      </svg>
      {showIts && (
        <div
          style={{
            position: "absolute",
            left: baseX - cap * 0.2,
            top: top0 + len * 0.3,
            transform: "rotate(-9deg)",
            transformOrigin: "left center",
            background: ink,
            border: `5px solid ${PAPER}`,
            padding: `${itsPx * 0.12}px ${itsPx * 0.22}px ${itsPx * 0.02}px`,
            fontFamily: DISPLAY,
            fontSize: itsPx,
            lineHeight: 1.05,
            color: "#fff",
            boxShadow: "0 8px 18px rgba(0,0,0,.18)",
          }}
        >
          IT&apos;S
        </div>
      )}

      <Player data={data} cx={cx} headTop={headTop} floor={floor} />

      {f.ourCrest && <img src={f.ourCrest} alt="" style={{ position: "absolute", left: 56, top: crestTop, width: crestS, height: crestS, objectFit: "contain", filter: CREST_HALO }} />}
      {[first, last].filter(Boolean).map((t, i) => (
        <div key={i} style={{ position: "absolute", left: 58, top: nameTop + i * namePx * 1.08, ...capsStyle(namePx, 700, 0.06, "rgba(255,255,255,.82)") }}>
          {t}
        </div>
      ))}

      <div style={{ position: "absolute", left: infoX, top: infoTop, width: infoW, color: ink }}>
        {rows.map((r, i) => (
          <div key={i} style={{ marginTop: r.gap, opacity: r.opacity }}>
            {r.lines.map((l, j) => (
              <div key={j} style={capsStyle(r.px, r.weight, r.tracking, ink)}>
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}

/* =============================================================================================================
 * 2 · Stacked "GAME / DAY" (Hanover men's soccer v Mount St. Joseph — Pinterest "college soccer gameday
 * graphic", row 3 col 2): a light paper ground with a faint ball-panel hexagon pattern; a full-height
 * club-colour panel down the right third; the kicker in two gigantic stacked lines top left, the first in the
 * club colour, the second near-black; him full-body in front of the panel edge, over the words' ends; under the
 * words two spaced lines (his club / VS opponent), the kick-off big, the town, and the two crests at the foot.
 * ========================================================================================================== */
export function Usgamestack({ data }: { data: RenderData }) {
  const { H, dy, ts, logoTop } = frame(data);
  const { club, deep, ink } = groundOf(data);
  const f = facts(data);
  const story = H > CANVAS_H;
  const panelX = 748;
  const black = "#161616";
  const grey = "#3a3a3a";
  const left = 56;

  // ---- him, on the panel edge ----
  const floor = 1300 + dy;
  const { cx, headTop, face, box: fig } = fitFigure(data, { cx: 772, headTop: 96 + dy, floor, maxFace: 116, minLeft: left + 400, maxRight: CANVAS_W - 6, minCx: 640, maxCx: 900 });
  const textW = Math.max(400, Math.min(fig.left - left - 24, face.cx - face.h * 1.25 - left));

  // ---- the bottom up: crests, then the facts, then the words fill what is left ----
  const crestBottom = (story ? 1290 : 1270) + dy;
  const bigCrest = 138;
  const smallCrest = 84;
  const hasCrests = !!(f.ourCrest || f.oppCrest);
  const factsBottom = hasCrests ? crestBottom - bigCrest - 30 : crestBottom;
  const l1 = wrapCaps(f.ours, textW, 27 * ts, 17, 0.16, 2, 0.56);
  const l2 = wrapCaps(`VS ${f.opp}`, textW, 27 * ts, 17, 0.16, 3, 0.56);
  const teamPx = Math.min(l1.px, l2.px);
  const teamLines = [...wrapCaps(f.ours, textW, teamPx, teamPx, 0.16, 9, 0.56).lines, ...wrapCaps(`VS ${f.opp}`, textW, teamPx, teamPx, 0.16, 9, 0.56).lines];
  const timePx = 84 * ts;
  const where = [f.date, f.venue].filter(Boolean).join("  ·  ");
  const whereW = wrapCaps(where, textW, 25 * ts, 15, 0.16, 2, 0.56);
  const compW = wrapCaps(f.comp, textW, 20 * ts, 13, 0.14, 2, 0.56);
  const factsH = teamLines.length * teamPx * 1.25 + 26 + (f.time ? timePx * 1.02 + 10 : 0) + whereW.lines.length * whereW.px * 1.2 + (compW.lines.length ? 10 + compW.lines.length * compW.px * 1.2 : 0);
  const factsTop = factsBottom - factsH;

  const words = stackWords(data.content.kicker);
  const lh = 0.9;
  const byWidth = Math.min(...words.map((w) => (textW + 190) / em(w, ANTON, 44)));
  const wordPx0 = Math.min(350, byWidth, (factsTop - 40 - (62 + dy)) / (words.length * lh));
  // The block (words, facts, crests) hangs from the top like the poster; what is left over goes under it.
  const blockH = words.length * wordPx0 * lh + 44 + factsH + (hasCrests ? 34 + bigCrest : 0);
  const wordsTop = story ? Math.max(205, Math.min(62 + dy, crestBottom - blockH)) : 62;
  const wordPx = wordPx0;
  const factsTop2 = wordsTop + words.length * wordPx * lh + 44;
  const crestTop2 = Math.max(factsTop2 + factsH + 34, crestBottom - bigCrest);

  const hex = (id: string, stroke: string) => (
    <pattern id={id} width={180} height={311.77} patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
      <path d="M0 0 L90 0 L135 77.94 L90 155.88 L0 155.88 L-45 77.94 Z M90 155.88 L135 77.94 L225 77.94 M135 233.83 L90 155.88 M0 155.88 L-45 233.83 L0 311.77 L90 311.77 L135 233.83 L225 233.83" fill="none" stroke={stroke} strokeWidth={2} />
    </pattern>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#eeece7" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 80% at 30% 35%, #f6f5f1, #ebe9e3 70%, #dfddd7)" }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {hex("usgs-hex-a", "rgba(0,0,0,.045)")}
          {hex("usgs-hex-b", "rgba(255,255,255,.1)")}
          <linearGradient id="usgs-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={shade(club, 0.06)} />
            <stop offset="1" stopColor={deep} />
          </linearGradient>
        </defs>
        <rect width={panelX} height={H} fill="url(#usgs-hex-a)" />
        <rect x={panelX} width={CANVAS_W - panelX} height={H} fill="url(#usgs-panel)" />
        <rect x={panelX} width={CANVAS_W - panelX} height={H} fill="url(#usgs-hex-b)" />
      </svg>

      {words.map((w, i) => (
        <div key={i} style={{ position: "absolute", left: left - wordPx * 0.02, top: wordsTop + i * wordPx * lh, fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 1, whiteSpace: "nowrap", color: i === 0 && words.length > 1 ? ink : black }}>
          {w}
        </div>
      ))}

      <Player data={data} cx={cx} headTop={headTop} floor={floor} maxFace={116} shadow="rgba(0,0,0,.34)" />

      <div style={{ position: "absolute", left, top: factsTop2, width: textW }}>
        {teamLines.map((t, i) => (
          <div key={i} style={capsStyle(teamPx, 600, 0.16, grey, { lineHeight: 1.25 })}>
            {t}
          </div>
        ))}
        <div style={{ height: 26 }} />
        {f.time && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: timePx, lineHeight: 1.02, color: black }}>{f.time}</span>
            {f.second && <span style={capsStyle(24 * ts, 700, 0.08, grey)}>{f.second}</span>}
          </div>
        )}
        {whereW.lines.map((t, i) => (
          <div key={i} style={capsStyle(whereW.px, 600, 0.16, grey, { lineHeight: 1.2 })}>
            {t}
          </div>
        ))}
        {compW.lines.length > 0 && <div style={{ height: 10 }} />}
        {compW.lines.map((t, i) => (
          <div key={i} style={capsStyle(compW.px, 600, 0.14, grey, { lineHeight: 1.2, opacity: 0.7 })}>
            {t}
          </div>
        ))}
      </div>

      {hasCrests && (
        <div style={{ position: "absolute", left, top: crestTop2, height: bigCrest, display: "flex", alignItems: "flex-end", gap: 26 }}>
          {f.oppCrest && <img src={f.oppCrest} alt="" style={{ width: smallCrest, height: smallCrest, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.16))" }} />}
          {f.ourCrest && <img src={f.ourCrest} alt="" style={{ width: bigCrest, height: bigCrest, objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.18))" }} />}
        </div>
      )}

      <Logo data={data} top={logoTop} onLight />
    </div>
  );
}

/* =============================================================================================================
 * 3 · Split panel (BYU football v Washington St. — Pinterest "college soccer gameday graphic", row 5 col 2):
 * the canvas split down the left third — a deep club-colour panel (the reference's giant tinted second photo
 * replaced by the crest blown up as a tonal mark, so he is never duplicated) and a light panel; him full-body
 * on the seam; the kicker stacked gigantic in the club colour on the light side, the crest in an outlined box
 * beside the last line; an outlined bar with a "VS" roundel and the opponent's exact name; the kick-off and
 * ground small under it; the competition small at the top; his name small at the foot of the dark panel.
 * ========================================================================================================== */
export function Ussplitpanel({ data }: { data: RenderData }) {
  const { H, dy, ts, logoTop } = frame(data);
  const { club, deep: deep0, ink } = groundOf(data);
  const deep = luminance(deep0) > 0.12 ? shade(deep0, -0.35) : deep0;
  const f = facts(data);
  const story = H > CANVAS_H;
  const splitX = 396;
  const right = 1030;

  // ---- him on the seam ----
  const floor = 1290 + dy;

  // ---- the words ----
  const words = stackWords(data.content.kicker);
  const wordsX = 520;
  const { cx, headTop } = fitFigure(data, { cx: 404, headTop: 250 + dy, floor, maxFace: 112, minLeft: 0, maxRight: wordsX + 60, minCx: 120, maxCx: 440 });
  const lh = 0.88;
  const boxGap = 18;
  const last = words[words.length - 1];
  const byFirst = Math.min(...words.slice(0, -1).map((w) => (right - wordsX) / em(w, ANTON, 44)));
  // the last line carries the crest box (≈ its cap height) beside it
  const byLast = (right - wordsX - boxGap) / (em(last, ANTON, 44) + 0.74);
  const wordPx = Math.min(280 * ts, byFirst, byLast);
  const capH = wordPx * 0.74;
  const wordsTop = (story ? 210 : 200) + dy;
  const lastW = em(last, ANTON, 44) * wordPx;
  const lastTop = wordsTop + (words.length - 1) * wordPx * lh;
  const box = capH;

  // ---- the VS bar ----
  const barTop = lastTop + wordPx * 0.98 + 26;
  const barW = right - wordsX;
  const vsD = 52;
  const opp = wrapCaps(f.opp, barW - vsD - 52, 38 * ts, 20, 0.04, 3, 0.6);
  const barH = Math.max(76, opp.lines.length * opp.px * 1.1 + 26);
  const small = [[f.time, f.second].filter(Boolean).join(" "), [f.date, f.venue].filter(Boolean).join("  ·  ")].filter(Boolean);
  const smallW = small.map((t) => wrapCaps(t, barW, 23 * ts, 14, 0.12, 2, 0.56));
  const topLines = wrapCaps(f.comp, barW, 21 * ts, 13, 0.16, 2, 0.56);

  const first = (data.content.firstName || "").toUpperCase();
  const lastName = (data.content.lastName || "").toUpperCase();
  const namePx = Math.min(30 * ts, ...[first, lastName].filter(Boolean).map((t) => (splitX - 80) / Math.max(1, [...t].length * 0.66)));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER }}>
      <div style={{ position: "absolute", left: splitX, top: 0, right: 0, height: H, background: "linear-gradient(to right, #e4e4e1, #f3f3f0 12%, #fafaf8)" }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <InkFilter id="ussp-mark" color={shade(deep, 0.16)} />
          <clipPath id="ussp-clip">
            <rect width={splitX} height={H} />
          </clipPath>
          <radialGradient id="ussp-glow" cx="0.45" cy="0.4" r="0.8">
            <stop offset="0" stopColor={shade(deep, 0.1)} />
            <stop offset="1" stopColor={shade(deep, -0.15)} />
          </radialGradient>
        </defs>
        <rect width={splitX} height={H} fill="url(#ussp-glow)" />
        {f.ourCrest && (
          <g clipPath="url(#ussp-clip)">
            <image href={f.ourCrest} x={splitX - 690} y={dy + 120} width={960} height={960} preserveAspectRatio="xMidYMid meet" filter="url(#ussp-mark)" />
          </g>
        )}
        <rect x={splitX - 3} width={6} height={H} fill={club} opacity={0.9} />
      </svg>

      {topLines.lines.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: wordsX, top: wordsTop - 40 - (topLines.lines.length - i) * topLines.px * 1.25, ...capsStyle(topLines.px, 700, 0.16, ink) }}>
          {t}
        </div>
      ))}
      {words.map((w, i) => (
        <div key={i} style={{ position: "absolute", left: wordsX - wordPx * 0.02, top: wordsTop + i * wordPx * lh, fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>
          {w}
        </div>
      ))}
      {f.ourCrest && (
        <div style={{ position: "absolute", left: wordsX + lastW + boxGap, top: lastTop + wordPx * 0.2, width: box, height: box, border: `4px solid ${ink}`, background: "#fff", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={f.ourCrest} alt="" style={{ width: box * 0.78, height: box * 0.78, objectFit: "contain" }} />
        </div>
      )}

      <div style={{ position: "absolute", left: wordsX, top: barTop, width: barW, height: barH, border: `4px solid ${ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 18px 0 12px" }}>
        <div style={{ width: vsD, height: vsD, borderRadius: "50%", border: `3px solid ${ink}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...capsStyle(22, 800, 0.02, ink, { lineHeight: 1 }) }}>VS</div>
        <div>
          {opp.lines.map((t, i) => (
            <div key={i} style={capsStyle(opp.px, 800, 0.04, ink, { lineHeight: 1.1 })}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: wordsX, top: barTop + barH + 22, width: barW, textAlign: "right" }}>
        {smallW.map((s, i) =>
          s.lines.map((t, j) => (
            <div key={`${i}-${j}`} style={capsStyle(s.px, 700, 0.12, ink, { lineHeight: 1.3 })}>
              {t}
            </div>
          )),
        )}
      </div>

      <Player data={data} cx={cx} headTop={headTop} floor={floor} maxFace={112} />

      {[first, lastName].filter(Boolean).map((t, i, all) => (
        <div key={i} style={{ position: "absolute", left: 40, top: floor - 30 - (all.length - i) * namePx * 1.08, ...capsStyle(namePx, 800, 0.06, "rgba(255,255,255,.9)", { lineHeight: 1 }) }}>
          {t}
        </div>
      ))}

      <Logo data={data} top={logoTop} onLight />
    </div>
  );
}
