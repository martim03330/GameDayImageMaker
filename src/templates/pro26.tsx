/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, caps, portraitOf, shotBox } from "./prokit";
import { bustAt, stripFigure } from "./pro19";

/* Round 44 · new pro families, part 2 (Pinterest "goal poster serif", "result graphic football minimal"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;
const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();

function NameClub({ d, top, color = "#fff", clubColor }: { d: RenderData; top: number; color?: string; clubColor: string }) {
  const { k, ts } = frameOf(d);
  const nl = lines3(fullName(d), 38 * k * ts, W - 2 * M, 0.02, 18 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W - 2 * M, 0.2, 12 * k);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {nl.lines.map((l, i) => (
        <div key={i} style={caps(nl.px, 0.02, 900, color)}>{l}</div>
      ))}
      <div style={{ height: 8 * k }} />
      {cl.lines.map((l, i) => (
        <div key={"c" + i} style={caps(cl.px, 0.2, 800, clubColor)}>{l}</div>
      ))}
    </div>
  );
}

/* ================= 7 · Photo inside GOAL (goal) — Pinterest image-filled letter posters ================= */

/**
 * Golo · foto nas letras (goal): GOAL set huge across the canvas with his colour photo held inside the letters (a clip,
 * his face sharp) and a thin white outline on them; a deep club ground; his name and exact club under the word.
 */
export function Goalproletters({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const lines = word.length > 4 ? [word] : [word.slice(0, 2), word.slice(2)];
  const px = Math.min(700 * k, (W - 40 * k) / Math.max(0.1, Math.max(...lines.map((l) => wordW(l, 1)))));
  const bTop = top + 60 * k;
  const blockH = lines.length * px * 0.82;
  const b = s ? shotBox(s, W / 2, bTop + blockH * 0.3, blockH * 0.2) : null;
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.4)}, ${shade(t.ink, -0.85)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="pro-goal-letters">
            {lines.map((l, i) => (
              <text key={i} x={W / 2} y={bTop + (i + 1) * px * 0.82 - px * 0.04} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }}>
                {l}
              </text>
            ))}
          </clipPath>
        </defs>
        {lines.map((l, i) => (
          <text key={"f" + i} x={W / 2} y={bTop + (i + 1) * px * 0.82 - px * 0.04} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill={t.ink}>
            {l}
          </text>
        ))}
        {s && b && <image href={s.url} x={b.left} y={b.top} width={b.width} height={b.height} preserveAspectRatio="none" clipPath="url(#pro-goal-letters)" />}
        {lines.map((l, i) => (
          <text key={"o" + i} x={W / 2} y={bTop + (i + 1) * px * 0.82 - px * 0.04} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke="#fff" strokeWidth={3 * k}>
            {l}
          </text>
        ))}
      </svg>
      {/* His whole, sharp cut-out in front of the letters' foot, so a whole face is always on the canvas. */}
      <Front d={d} p={isCut(d) ? bustAt(d, W / 2, bTop + blockH * 0.55, 90 * k) : stripFigure(d, 12, W - 12, lt - 190 * k, Math.min(H * 0.42, lt - 190 * k - bTop - blockH * 0.35), bTop + blockH * 0.45, 100 * k)} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 175 * k, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={lt - 155 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 8 · Horizon (goal) — the flat disc for a goal ================= */

/**
 * Golo · horizonte (goal): the flat club-colour disc sitting on a white horizon line, sky in a deep club shade; him
 * full-body celebrating in front of it, sharp; GOAL huge at the top; his name and exact club under the horizon.
 */
export function Goalprohorizon({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(260 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const hy = lt - 250 * k;
  const R = 400;
  const sun = t.acc === "#ffffff" ? shade(t.ink, 0.35) : t.acc;
  const g0 = top + gPx * 0.86 + 30 * k;
  const p = isCut(d) ? bustAt(d, 540, g0 + 200 * k, 120 * k) : stripFigure(d, 12, W - 12, hy + 20 * k, Math.min(1100 * k / 1.3, hy + 20 * k - g0), Math.max(g0, H * 0.36));
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: hy, background: `linear-gradient(180deg, ${shade(t.ink, -0.75)}, ${shade(t.ink, -0.3)})` }} />
      <div style={{ position: "absolute", left: W / 2 - R, top: hy - R * 1.3, width: 2 * R, height: 2 * R, borderRadius: "50%", background: sun, clipPath: `inset(0 0 ${2 * R - R * 1.3}px 0)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hy, bottom: 0, background: shade(t.ink, -0.85) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hy - 2 * k, height: 4 * k, background: "#fff" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff" }}>{word}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: hy + 24 * k, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={hy + 44 * k} clubColor={sun} />
    </Page>
  );
}

/* ================= 9 · GOAL vs opponent (goal) — the A-vs-B type for a goal ================= */

/**
 * Golo · versus (goal): GOAL huge at the top, the opponent's exact name huge at the bottom, a giant serif italic "vs"
 * between them in front of him; him full-body behind the "vs"; his name and club in a small card.
 */
export function Goalproversus({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  const opp = (weAway ? fx.homeName : fx.awayName).toUpperCase();
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const on = lines3(opp, 150 * k, W - 2 * M, 0, 50 * k);
  const oPx = Math.min(on.px, ...on.lines.map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const cardTop = lt - 130 * k;
  const oTop = cardTop - 30 * k - on.lines.length * oPx * 0.88;
  const gB = top + gPx * 0.86;
  const nl = lines3(fullName(d), 26 * k * ts, W - 2 * M - 40 * k, 0.04, 14 * k);
  const p = isCut(d) ? bustAt(d, 540, gB + 160 * k, 110 * k) : stripFigure(d, 12, W - 12, oTop + oPx * 0.5, oTop + oPx * 0.5 - gB + 30 * k, gB);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.8)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.35)" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: (gB + oTop) / 2 - 120 * k, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: 240 * k, lineHeight: 1, color: t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.2), textShadow: "0 10px 30px rgba(0,0,0,.4)" }}>vs</div>
      <div style={{ position: "absolute", left: M, right: M, top: oTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {on.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: oPx, lineHeight: 0.88, color: "#fff", whiteSpace: "nowrap", textShadow: "0 8px 26px rgba(0,0,0,.35)" }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: cardTop, minHeight: 90 * k, borderRadius: 14 * k, background: "rgba(0,0,0,.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${10 * k}px 0` }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(15 * k * ts, 0.2, 700, t.glow)}>{lines3(ourClub(d).toUpperCase(), 15 * k * ts, W - 2 * M - 40 * k, 0.2, 10 * k).lines.join(" ")}</div>
      </div>
    </Page>
  );
}

/* ================= 10 · FT block (result) — Pinterest "FT" minimal result posters ================= */

/**
 * Resultado · FT (result): "FT" set huge in white at the top-left; the score in a solid club-colour block overlapping its
 * lower right, the crests either side of the score; the clubs' exact names under the block; the competition; him big on
 * the right (waist-up for a wide pose).
 */
export function Resultproft({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const ftPx = 520 * k;
  const bTop = top + ftPx * 0.62;
  const score = `${d.content.homeGoals ?? "–"}–${d.content.awayGoals ?? "–"}`;
  const colW = W - 2 * M;
  const hn = lines3(fx.homeName.toUpperCase(), 22 * k * ts, colW, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 22 * k * ts, colW, 0.04, 12 * k);
  const nPx = Math.min(hn.px, an.px);
  const bH = 220 * k;
  const namesTop = bTop + bH + 24 * k;
  const namesB = namesTop + (hn.lines.length + an.lines.length + 1) * nPx * 1.25 + 30 * k;
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const p = stripFigure(d, W * 0.42, W - 12, H + 20 * k, Math.max(H * 0.58, H + 20 * k - namesB), bTop + bH - 60 * k, 165 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.5)}, ${shade(t.ink, -0.85)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 16 * k, top: top - 40 * k, fontFamily: DISPLAY, fontSize: ftPx, lineHeight: 0.86, color: "#fff" }}>FT</div>
      <div style={{ position: "absolute", left: M, right: M, top: bTop, height: bH, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 34 * k, boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ fontFamily: DISPLAY, fontSize: 190 * k * ts, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{score}</div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <div style={{ position: "absolute", left: M, top: namesTop, display: "flex", flexDirection: "column", gap: 4 * k, background: "rgba(0,0,0,.45)", padding: `${10 * k}px ${14 * k}px`, borderRadius: 10 * k }}>
        {hn.lines.map((l, i) => (
          <div key={"h" + i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>
        ))}
        <div style={caps(nPx * 0.8, 0.3, 700, "rgba(255,255,255,.6)")}>VS</div>
        {an.lines.map((l, i) => (
          <div key={"a" + i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>
        ))}
        {comp && <div style={{ ...caps(14 * k * ts, 0.3, 700, t.glow), marginTop: 8 * k }}>{comp}</div>}
      </div>
    </Page>
  );
}
