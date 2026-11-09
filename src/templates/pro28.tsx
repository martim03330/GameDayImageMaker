/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
import { seasonGoals } from "./goalherotally";
import { NatFigure, NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { standAt, wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, Portrait, caps, portraitOf } from "./prokit";
import { stripFigure } from "./pro19";

/* Round 45 · new pro families, part 2 (Pinterest "goal graphic minimal typography", "final score poster design"). */

const W = CANVAS_W;
const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();

function NameClub({ d, top, color = "#fff", clubColor }: { d: RenderData; top: number; color?: string; clubColor: string }) {
  const { k, ts } = frameOf(d);
  const nl = lines3(fullName(d), 36 * k * ts, W - 2 * M - 40 * k, 0.02, 18 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 17 * k * ts, W - 2 * M - 40 * k, 0.2, 11 * k);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {nl.lines.map((l, i) => (
        <div key={i} style={caps(nl.px, 0.02, 900, color)}>{l}</div>
      ))}
      <div style={{ height: 6 * k }} />
      {cl.lines.map((l, i) => (
        <div key={"c" + i} style={caps(cl.px, 0.2, 800, clubColor)}>{l}</div>
      ))}
    </div>
  );
}

/* ================= 7 · Serif "1" (goal) — Pinterest minimal goal-count typography ================= */

/** His goals in this game when a stat records them ("Goals 2"), else the season tally, else 0. */
function goalCount(d: RenderData): { n: number; label: string } {
  const st = d.content.stats ?? [];
  const g = st.find((x) => /^(goals?|golos?)$/i.test(x.label.trim()) && /^\d+$/.test(String(x.value).trim()));
  if (g) return { n: Number(g.value), label: Number(g.value) === 1 ? "GOAL THIS GAME" : "GOALS THIS GAME" };
  const s = seasonGoals(d);
  return s > 0 ? { n: s, label: s === 1 ? "GOAL THIS SEASON" : "GOALS THIS SEASON" } : { n: 0, label: "" };
}

/**
 * Golo · número em serifa (goal): a warm paper ground; a huge serif numeral — his goals this game if recorded, else
 * his season tally (GOAL when neither is on record) — with its label tracked under it; his colour portrait large beside
 * it; GOAL, his name and exact club at the foot.
 */
export function Goalproserifcount({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const gc = goalCount(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const hero = gc.n > 0 ? String(gc.n) : word;
  const hPx = Math.min(gc.n > 0 ? 760 * k : 260 * k, (W * (gc.n > 0 ? 0.55 : 0.9)) / Math.max(0.1, wordW(hero, 1) * 1.1));
  return (
    <Page d={d} bg="#f1ece2" light>
      {s && <Portrait s={s} cx={Math.min(W * 0.66, W - M - 260 * k * 0.9)} cy={top + 560 * k} fh={260 * k} mode="color" fade={30} />}
      <div style={{ position: "absolute", left: M - 10 * k, top: top - 40 * k, fontFamily: DMSERIF, fontSize: hPx, lineHeight: 1, color: t.ink, textShadow: "0 0 0 transparent" }}>{hero}</div>
      {gc.label && <div style={{ position: "absolute", left: M, top: top - 40 * k + hPx * 0.98, ...caps(20 * k, 0.4, 800, "#16181c") }}>{gc.label}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - 300 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(241,236,226,0), #f1ece2 40%)" }} />
      {gc.n > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: lt - 270 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 0.9, color: "#16181c" }}>{word}</div>}
      <NameClub d={d} top={lt - 150 * k} color="#16181c" clubColor={t.ink} />
    </Page>
  );
}

/* ================= 8 · Letterbox (goal) — cinema bars for a goal ================= */

/**
 * Golo · cinema (goal): his real celebration photo with its own surroundings in a wide letterbox band, black bars above
 * and below; GOAL huge in the top bar, his name and exact club in the bottom bar.
 */
export function Goalproletterbox({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(220 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const barT = top + gPx * 0.9 + 40 * k;
  const barB = lt - 210 * k;
  const p = standAt(d, 540, barT + (barB - barT) * 0.3, 165);
  const shift = Math.max(0, barT + p.fs * 1.9 - p.fy);
  return (
    <Page d={d} bg="#050505">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${barT}px 0px ${H - barB}px 0px)` }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}>
          <NatGround place={p} W={W} H={H} />
          <NatFigure data={d} place={p} W={W} H={H} clean />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.9, color: "#fff" }}>{word}</div>
      <NameClub d={d} top={barB + 40 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 9 · Name column (goal) — the vertical-name column for a goal ================= */

/**
 * Golo · coluna do nome (goal): a narrow club-colour column on the left with his surname running up it; his real photo
 * with its own surroundings filling the rest; GOAL huge at the top of the photo; the exact club in a card at the foot.
 */
export function Goalprocolumn({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const cw = W * 0.22;
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const nPx = Math.min(cw * 0.9, (H - 120 * k) / Math.max(0.1, wordW(sur, 1)));
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(220 * k, (W - cw - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const p = standAt(d, cw + (W - cw) * 0.5, 820, 175);
  const cl = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W - cw - 2 * M, 0.2, 11 * k);
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px 0px ${cw}px)` }}>
        <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.06) brightness(.88)" }} />
        <NatFigure data={d} place={p} W={W} H={H} clean />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,0) 28%, rgba(0,0,0,0) 65%, rgba(0,0,0,.7))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: cw, background: t.ink }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={cw / 2} y={H / 2} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cw / 2} ${H / 2})`} style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff">
          {sur}
        </text>
      </svg>
      <div style={{ position: "absolute", left: cw, right: 0, top: lt - 140 * k - gPx * 0.9, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.9, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.5)" }}>{word}</div>
      <div style={{ position: "absolute", left: cw + M - 10 * k, right: M - 10 * k, top: lt - 120 * k, padding: `${12 * k}px 0`, borderRadius: 14 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {cl.lines.map((l, i) => (
          <div key={i} style={caps(cl.px, 0.2, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 10 · Split numerals (result) — Pinterest "2 | 0" full-time posters ================= */

/**
 * Resultado · traço vertical (result): both crests side by side at the top; the score in giant numerals split by a thin
 * vertical white rule (home left, away right) with each club's exact name under its numeral; FULL TIME and the
 * competition; him big at the foot (waist-up for a wide pose).
 */
export function Resultprosplitrule({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const hg = String(d.content.homeGoals ?? "–");
  const ag = String(d.content.awayGoals ?? "–");
  const colW = W / 2 - M - 30 * k;
  const nPx = Math.min(420 * k, colW / Math.max(0.1, Math.max(wordW(hg, 1), wordW(ag, 1))));
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW, 0.04, 12 * k);
  const npx = Math.min(hn.px, an.px);
  const nTop = top + 170 * k;
  const namesTop = nTop + nPx * 0.84 + 20 * k;
  const blockB = namesTop + Math.max(hn.lines.length, an.lines.length) * npx * 1.3 + 50 * k;
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const p = stripFigure(d, 12, W - 12, H + 20 * k, Math.max(H * 0.55, H + 20 * k - blockB), blockB - 10 * k, 140 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.75)} 0%, ${shade(t.ink, -0.45)} 60%, ${t.ink})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", gap: 40 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <div style={{ position: "absolute", left: W / 2 - 1.5 * k, top: nTop, width: 3 * k, height: blockB - nTop - 30 * k, background: "#fff" }} />
      <div style={{ position: "absolute", left: M, width: colW, top: nTop, textAlign: "center", fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.84, color: "#fff" }}>{hg}</div>
      <div style={{ position: "absolute", right: M, width: colW, top: nTop, textAlign: "center", fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.84, color: "#fff" }}>{ag}</div>
      <div style={{ position: "absolute", left: M, width: colW, top: namesTop, display: "flex", flexDirection: "column", alignItems: "center" }}>{hn.lines.map((l, i) => <div key={i} style={caps(npx, 0.04, 800, "#fff")}>{l}</div>)}</div>
      <div style={{ position: "absolute", right: M, width: colW, top: namesTop, display: "flex", flexDirection: "column", alignItems: "center" }}>{an.lines.map((l, i) => <div key={i} style={caps(npx, 0.04, 800, "#fff")}>{l}</div>)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 125 * k, textAlign: "center", ...caps(18 * k, 0.5, 900, "rgba(255,255,255,.85)") }}>{comp ? `FULL TIME · ${comp}` : "FULL TIME"}</div>
    </Page>
  );
}

