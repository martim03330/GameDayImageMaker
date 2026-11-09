/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { scoreOf } from "./outline";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, Portrait, caps, frontFeet, nameLines, portraitOf } from "./prokit";

/* Round 40 · new pro families, part 2. */

const W = CANVAS_W;

/* ================= 7 · Scoreline progression (goal) — Pinterest "1–1 GOAL" headers ================= */

/**
 * Golo · marcador do jogo (goal): his real photo graded dark; GOAL huge at the top; under it the scoreline his goal made
 * (taken from a "1-0"-style stat if one is on record; else the opponent and the round), with both crests — goal posts
 * never show a final result, only the moment; him sharp; name and exact club at the foot.
 */
export function Goalproscoreline({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const vsH0 = 140 * k;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(260 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const moment = d.content.stats?.map((x) => String(x.value).match(/^(\d+)\s*[-–:]\s*(\d+)$/)).find(Boolean);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  const opp = (weAway ? fx.homeName : fx.awayName).toUpperCase();
  const vs = lines3(`VS ${opp}`, 26 * k * ts, W - 2 * M - 200 * k, 0.08, 14 * k);
  const nl = nameLines(d, W - 2 * M - 100 * k, 34 * k, 18 * k);
  const crest = d.club?.crestUrl;
  const sy = top + gPx * 0.82 + 30 * k;
  const p = frontFeet(d, 540, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - sy - vsH0));
  return (
    <Page d={d} bg="#0e1014">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 70%, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.7)} 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: sy, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
        {moment ? (
          <div style={{ fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 1, color: "#fff", background: t.ink, padding: `${4 * k}px ${24 * k}px` }}>{`${moment[1]}–${moment[2]}`}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {vs.lines.map((l, i) => (
              <div key={i} style={caps(vs.px, 0.08, 900, "#fff")}>{l}</div>
            ))}
            <div style={{ ...caps(16 * k, 0.3, 700, "rgba(255,255,255,.8)"), marginTop: 8 * k }}>{(matchFacts(d).comp || "").toUpperCase()}</div>
          </div>
        )}
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 140 * k, height: 110 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 4 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={caps(nl.club.px * 0.85, 0.16, 700, t.glow)}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 8 · Editorial name poster (goal) — Pinterest "ERLING HAALAND" / "Mbappé" editorial posters ================= */

/**
 * Golo · cartaz editorial (goal): a warm paper ground; a big black-and-white portrait of him top-right; his first and last
 * names stacked flush-left in heavy caps over it; a club-colour GOAL block; a short tracked caption (club, competition);
 * him full-body in colour in front.
 */
export function Goalproeditorial({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const first = (d.content.firstName || "").toUpperCase();
  const sur = (d.content.lastName || "").toUpperCase();
  const nPx = Math.min(150 * k, (W - 2 * M) / Math.max(0.1, Math.max(wordW(first, 1), wordW(sur, 1))));
  const club = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W * 0.45, 0.2, 12 * k);
  const blockB = top + 2 * nPx * 0.86 + 110 * k;
  const p = frontFeet(d, 660, lt + 60 * k, Math.min(1150 * k / 1.3, lt + 60 * k - blockB));
  return (
    <Page d={d} bg="#efe9dd" light>
      {s && <Portrait s={s} cx={W * 0.62} cy={top + 460 * k} fh={300 * k} mode="bw" opacity={0.85} fade={30} />}
      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column" }}>
        {first && <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, color: "#16181c" }}>{first}</div>}
        {sur && <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, color: "#16181c" }}>{sur}</div>}
        <div style={{ alignSelf: "flex-start", background: t.ink, color: "#fff", fontFamily: DISPLAY, fontSize: 70 * k, lineHeight: 1, padding: `${6 * k}px ${18 * k}px`, marginTop: 18 * k }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, top: lt - 140 * k, display: "flex", flexDirection: "column", gap: 6 * k, background: "rgba(239,233,221,.9)", padding: `${10 * k}px ${12 * k}px`, borderRadius: 10 * k }}>
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.2, 800, "#16181c")}>{l}</div>
        ))}
        <div style={caps(14 * k, 0.24, 700, t.ink)}>{(matchFacts(d).comp || "").toUpperCase()}</div>
      </div>
    </Page>
  );
}

/* ================= 9 · Celebration close-up (goal) — Pinterest "Rashford" close-up celebration ================= */

/**
 * Golo · grande plano (goal): a club-colour ground; his big colour portrait filling the canvas; GOAL running vertically
 * up the right edge in white; his surname huge across the foot and exact club under it.
 */
export function Goalprocloseup({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const len = lt - 200 * k - top;
  const gPx = Math.min(200 * k, len / Math.max(0.1, wordW(word, 1)));
  const cx = W - M - gPx * 0.42;
  const cy = top + len / 2;
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const sPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW(sur, 1)));
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M, 0.2, 13 * k);
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.55)})` }} />
      {s && <Portrait s={s} cx={W * 0.45} cy={top + 560 * k} fh={460 * k} mode="color" fade={22} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: gPx }} fill="#fff">
          {word}
        </text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - 140 * k - sPx * 0.82, textAlign: "center", fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.82, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.45)" }}>{sur}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - 110 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.2, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 10 · VICTORY lockup (result) — Pinterest "VICTOIRE" / "WIN" result lockups ================= */

/**
 * Resultado · vitória (result): a clean lockup — VICTORY (or DRAW / DEFEAT, from the score for his club) in a wide serif
 * with thin rules above and below, the score huge between both crests, the clubs' exact names, the competition; him
 * full-body on a club-colour ground behind the lockup's lower half.
 */
export function Resultprovictory({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const hg = Number(d.content.homeGoals ?? NaN);
  const ag = Number(d.content.awayGoals ?? NaN);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  const us = weAway ? ag : hg;
  const them = weAway ? hg : ag;
  const word = Number.isNaN(us) || Number.isNaN(them) ? "Full Time" : us > them ? "Victory" : us < them ? "Defeat" : "Draw";
  const score = scoreOf(d, "–") || "";
  const colW = (W - 2 * M) / 2 - 20 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW, 0.04, 12 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const blockBot = top + 420 * k;
  // About half the canvas: his feet sink behind the logo at the very foot.
  const p = frontFeet(d, 540, H - 10 * k, H - 10 * k - blockBot);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.7)} 0%, ${shade(t.ink, -0.5)} 40%, ${t.ink} 100%)` }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", height: 2 * k, background: "rgba(255,255,255,.6)" }} />
        <div style={{ fontFamily: DMSERIF, fontSize: 124 * k, lineHeight: 1.1, color: "#fff", letterSpacing: "0.04em" }}>{word}</div>
        <div style={{ width: "100%", height: 2 * k, background: "rgba(255,255,255,.6)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 30 * k, marginTop: 26 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 84 * k, width: 84 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 116 * k * ts, lineHeight: 1, color: "#fff" }}>{score}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 84 * k, width: 84 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", marginTop: 14 * k }}>
          <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>{hn.lines.map((l, i) => <div key={i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>)}</div>
          <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>{an.lines.map((l, i) => <div key={i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>)}</div>
        </div>
        {comp && <div style={{ ...caps(16 * k * ts, 0.3, 700, "rgba(255,255,255,.75)"), marginTop: 14 * k }}>{comp}</div>}
      </div>
      <Front d={d} p={p} />
    </Page>
  );
}
