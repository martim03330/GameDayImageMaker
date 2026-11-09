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
import { stripFigure } from "./pro19";
import { CREST_HALO, Front, M, Page, Portrait, caps, frontFeet, nameLines, portraitOf } from "./prokit";

/* Round 41 · new pro families, part 2 (Pinterest "goal graphic serie a", "soccer final score design minimal"). */

const W = CANVAS_W;

/** The opponent's exact name, caps. */
function oppOf(d: RenderData) {
  const fx = natFixture(d);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  return (weAway ? fx.homeName : fx.awayName).toUpperCase();
}

/** Name + exact club in a dark card. */
function NameCard({ d, top }: { d: RenderData; top: number }) {
  const { k } = frameOf(d);
  const t = tones(d);
  const nl = nameLines(d, W - 2 * M - 100 * k, 34 * k, 18 * k);
  const crest = d.club?.crestUrl;
  return (
    <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top, minHeight: 110 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 * k, padding: `${12 * k}px 0` }}>
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
  );
}

/* ================= 7 · Minute / season count (goal) — Pinterest Del Piero "121st minute", Kane "MOST GOALS 29" ================= */

/**
 * Golo · minuto (goal): a deep club-colour ground; a giant figure at the top — the minute of the goal when one is on
 * record ("67'"), else his season goal count ("07 · GOALS THIS SEASON"), else GOAL; a tracked label under it; him
 * full-body below, sharp; name and exact club in a card at the foot.
 */
export function Goalprominute({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const st = d.content.stats ?? [];
  const minStat = st.find((x) => /min/i.test(x.label) && /\d/.test(String(x.value))) ?? st.find((x) => /^\s*\d{1,3}\s*(\+\s*\d+)?\s*['’]\s*$/.test(String(x.value)));
  const minute = minStat ? String(minStat.value).replace(/[^\d+]/g, "") : "";
  const n = seasonGoals(d);
  const hero = minute ? `${minute}'` : n > 0 && n < 1000 ? String(n).padStart(2, "0") : (d.content.kicker || "Goal").toUpperCase();
  const label = minute ? `MINUTE · GOAL VS ${oppOf(d)}` : n > 0 ? "GOALS THIS SEASON" : `VS ${oppOf(d)}`;
  const lab = lines3(label, 22 * k, W - 2 * M, 0.3, 14 * k);
  const hPx = Math.min(420 * k, (W - 2 * M) / Math.max(0.1, wordW(hero, 1)));
  const hBot = top + hPx * 0.82 + 20 * k + lab.lines.length * lab.px * 1.4;
  const cardTop = lt - 150 * k;
  const p = frontFeet(d, 540, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - hBot - 30 * k));
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(175deg, ${shade(t.ink, -0.05)}, ${shade(t.ink, -0.75)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: hPx, lineHeight: 0.82, color: "#fff" }}>{hero}</div>
      <div style={{ position: "absolute", left: M, right: M, top: top + hPx * 0.82 + 20 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {lab.lines.map((l, i) => (
          <div key={i} style={{ ...caps(lab.px, 0.3, 800, "rgba(255,255,255,.88)"), marginBottom: lab.px * 0.4 }}>{l}</div>
        ))}
      </div>
      <Front d={d} p={p} />
      <NameCard d={d} top={cardTop} />
    </Page>
  );
}

/* ================= 8 · Duotone (goal) — Pinterest "football player poster duotone" ================= */

/**
 * Golo · duotone (goal): his real photo duotoned in the club colour (grayscale + colour blend — no texture, no blur);
 * him cut out on top in full colour and sharp; GOAL huge at the foot, his name and exact club under it.
 */
export function Goalproduotone({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const p = standAt(d, 540, 820, 190);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(250 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const sur = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nl = lines3(sur, 34 * k * ts, W - 2 * M, 0.06, 18 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W - 2 * M, 0.2, 12 * k);
  const blockH = gPx * 0.82 + 20 * k + nl.lines.length * nl.px * 1.1 + cl.lines.length * cl.px * 1.4 + 10 * k;
  const bTop = lt - 40 * k - blockH;
  return (
    <Page d={d} bg={t.deep}>
      <div style={{ position: "absolute", inset: 0, isolation: "isolate", background: t.deep }}>
        <NatGround place={p} W={W} H={H} style={{ filter: "grayscale(1) contrast(1.45) brightness(1.05)" }} />
        {/* A real two-tone: deep club shade in the shadows (multiply), a light club tint in the highlights (screen). */}
        <div style={{ position: "absolute", inset: 0, background: shade(t.ink, -0.25), mixBlendMode: "multiply" }} />
        <div style={{ position: "absolute", inset: 0, background: shade(t.ink, -0.85), mixBlendMode: "screen", opacity: 0.9 }} />
        <div style={{ position: "absolute", inset: 0, background: t.ink, mixBlendMode: "color", opacity: 0.6 }} />
      </div>
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, top: bTop - 160 * k, bottom: 0, background: `linear-gradient(to bottom, ${t.deep}00, ${t.deep}f2 45%)` }} />
      <div style={{ position: "absolute", left: M, right: M, top: bTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff" }}>{word}</div>
        <div style={{ height: 20 * k }} />
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.06, 900, "#fff")}>{l}</div>
        ))}
        <div style={{ height: 10 * k }} />
        {cl.lines.map((l, i) => (
          <div key={"c" + i} style={caps(cl.px, 0.2, 700, t.glow)}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Goal fact sheet (goal) — Pinterest Kane "2024 stat leaders" sheet ================= */

/**
 * Golo · ficha (goal): a charcoal ground; his colour close-up at the top fading down; GOAL in the club colour; a clean
 * fact table in thin rules — opponent, competition, date, season goals (only the rows on record); his name and club.
 */
export function Goalprofacts({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const mf = matchFacts(d);
  const n = seasonGoals(d);
  const rows: [string, string][] = [
    ["VS", oppOf(d)],
    ["COMPETITION", (mf.comp || "").toUpperCase()],
    ["DATE", mf.longDate || mf.date],
    ...(n > 0 ? ([["GOALS THIS SEASON", String(n)]] as [string, string][]) : []),
  ].filter((r) => r[1]) as [string, string][];
  const rowH = 64 * k;
  const valW = W - 2 * M - 300 * k;
  const vals = rows.map((r) => lines3(r[1], 22 * k * ts, valW, 0.06, 13 * k));
  const tableH = vals.reduce((a, v) => a + Math.max(rowH, v.lines.length * v.px * 1.25 + 30 * k), 0);
  const nl = nameLines(d, W - 2 * M, 44 * k, 20 * k);
  const tTop = lt - 50 * k - tableH;
  const gTop = tTop - 40 * k - 170 * k - nl.name.lines.length * nl.name.px - nl.club.lines.length * nl.club.px * 1.2;
  return (
    <Page d={d} bg="#121418">
      {s && <Portrait s={s} cx={W / 2} cy={top + 330 * k} fh={300 * k} mode="color" fade={40} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: gTop - 240 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(18,20,24,0), #121418 30%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: gTop, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 160 * k, lineHeight: 0.86, color: t.glow }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
        <div style={{ height: 14 * k }} />
        {nl.name.lines.map((l, i) => (
          <div key={i} style={caps(nl.name.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
        {nl.club.lines.map((l, i) => (
          <div key={"c" + i} style={{ ...caps(nl.club.px, 0.18, 700, "rgba(255,255,255,.8)"), marginTop: 6 * k }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: tTop, display: "flex", flexDirection: "column" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: rowH, borderTop: `${2 * k}px solid rgba(255,255,255,.35)`, padding: `${12 * k}px 0` }}>
            <div style={caps(16 * k, 0.24, 700, "rgba(255,255,255,.7)")}>{r[0]}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: valW }}>
              {vals[i].lines.map((l, j) => (
                <div key={j} style={caps(vals[i].px, 0.06, 900, "#fff")}>{l}</div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ borderTop: `${2 * k}px solid rgba(255,255,255,.35)` }} />
      </div>
    </Page>
  );
}

/* ================= 10 · Stacked crests (result) — Pinterest Everton "2 / Full-Time / 0" ================= */

/**
 * Resultado · emblemas empilhados (result): a pale ground; the home crest huge over the away crest down the left, each
 * with its goals set huge beside it and its exact name under; "Full-Time" in a serif italic between thin rules at the
 * middle; him full-body in colour on the right.
 */
export function Resultprostacked({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const hg = d.content.homeGoals ?? "";
  const ag = d.content.awayGoals ?? "";
  const colW = W * 0.56 - M;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW, 0.06, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW, 0.06, 12 * k);
  const mid = (top + lt) / 2 - 40 * k;
  const cS = 250 * k;
  const p = stripFigure(d, M + colW + 10 * k, W - 12, lt + 40 * k, Math.min(H * 0.62, lt + 40 * k - top), H * 0.42);
  const block = (crest: string | null, goals: string | number, lines: string[], px: number, y: number) => (
    <div style={{ position: "absolute", left: M, top: y, width: colW, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 * k }}>
        {crest ? <img src={crest} alt="" style={{ height: cS, width: cS, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ width: cS }} />}
        <div style={{ fontFamily: DISPLAY, fontSize: 250 * k * ts, lineHeight: 0.82, color: t.ink }}>{String(goals)}</div>
      </div>
      <div style={{ marginTop: 14 * k }}>
        {lines.map((l, i) => (
          <div key={i} style={caps(px, 0.06, 800, "#16181c")}>{l}</div>
        ))}
      </div>
    </div>
  );
  return (
    <Page d={d} bg="#eef0f2" light>
      <div style={{ position: "absolute", left: W * 0.5, right: 0, top: 0, bottom: 0, background: `linear-gradient(180deg, ${shade(t.ink, 0.55)}55, ${t.ink}33)` }} />
      <Front d={d} p={p} light />
      {block(fx.homeCrest, hg, hn.lines, Math.min(hn.px, an.px), mid - 60 * k - cS - 2 * 24 * k - 40 * k)}
      <div style={{ position: "absolute", left: M, width: colW, top: mid - 40 * k, display: "flex", alignItems: "center", gap: 16 * k }}>
        <div style={{ flex: 1, height: 2 * k, background: "#16181c" }} />
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 60 * k, lineHeight: 1, color: "#16181c" }}>Full-Time</div>
        <div style={{ flex: 1, height: 2 * k, background: "#16181c" }} />
      </div>
      {block(fx.awayCrest, ag, an.lines, Math.min(hn.px, an.px), mid + 60 * k)}
    </Page>
  );
}
