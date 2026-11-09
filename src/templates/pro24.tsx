/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
import { SCRIPT } from "./kit";
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

/* Round 43 · new pro families, part 2 (Pinterest "goal graphic design behance 2025", "full time graphic soccer"). */

const W = CANVAS_W;

function ClubLine({ d, top, color }: { d: RenderData; top: number; color: string }) {
  const { k, ts } = frameOf(d);
  const cl = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W - 2 * M, 0.2, 12 * k);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {cl.lines.map((l, i) => (
        <div key={i} style={caps(cl.px, 0.2, 800, color)}>{l}</div>
      ))}
    </div>
  );
}

/* ================= 7 · Serif name + script "scores" (goal) — editorial goal posters ================= */

/**
 * Golo · marca em serifa (goal): a warm paper ground; his first name small in tracked caps, his surname huge in a serif,
 * "scores" in a club-colour script swung across its lower right; him full-body in colour below; the exact club at the
 * foot.
 */
export function Goalproserifname({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const first = (d.content.firstName || "").toUpperCase();
  const sur = d.content.lastName || d.content.firstName || "";
  const sPx = Math.min(230 * k, (W - 2 * M) / Math.max(0.1, wordW(sur, 1) * 1.05));
  const sTop = top + 50 * k;
  const blockB = sTop + sPx * 0.95 + 70 * k;
  const p = stripFigure(d, 12, W - 12, lt - 30 * k, Math.min(1150 * k / 1.3, lt - 30 * k - blockB), blockB + 20 * k);
  return (
    <Page d={d} bg="#f2ede3" light>
      <div style={{ position: "absolute", left: 0, right: 0, top: blockB, bottom: 0, background: `linear-gradient(180deg, ${shade(t.ink, 0.75)}00, ${shade(t.ink, 0.55)}66)` }} />
      <Front d={d} p={p} light />
      {first && <div style={{ position: "absolute", left: M, right: M, top, textAlign: "center", ...caps(24 * k * ts, 0.5, 800, "#16181c") }}>{first}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: sTop, textAlign: "center", fontFamily: DMSERIF, fontSize: sPx, lineHeight: 1, color: "#16181c" }}>{sur}</div>
      <div style={{ position: "absolute", right: M, top: sTop + sPx * 0.62, fontFamily: SCRIPT, fontSize: 130 * k, lineHeight: 1, color: t.ink, transform: "rotate(-8deg)" }}>scores</div>
      <ClubLine d={d} top={lt - 70 * k} color="#16181c" />
    </Page>
  );
}

/* ================= 8 · Pill (goal) — the pill frame for a goal ================= */

/**
 * Golo · cápsula (goal): his colour portrait in a tall centred pill on a club-colour ground; GOAL huge in front, crossing
 * the pill's lower third (below his face); his name and exact club under it.
 */
export function Goalpropill({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const pw = 600;
  const pl = (W - pw) / 2;
  const pt = top;
  const pb = lt - 230 * k;
  const r = pw / 2;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const gy = pt + (pb - pt) * 0.62;
  const nl = lines3([d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase(), 40 * k * ts, W - 2 * M, 0.02, 20 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.75)})` }} />
      <div style={{ position: "absolute", left: pl, top: pt, width: pw, height: pb - pt, borderRadius: r, background: shade(t.ink, 0.15) }} />
      {s && <Portrait s={s} cx={W / 2} cy={pt + (pb - pt) * 0.3} fh={220 * k} mode="color" style={{ clipPath: `inset(${pt}px ${pl}px ${H - pb}px ${pl}px round ${r}px)` }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: gy, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff", textShadow: "0 14px 40px rgba(0,0,0,.45)" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: pb + 26 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
      </div>
      <ClubLine d={d} top={pb + 40 * k + nl.lines.length * nl.px * 1.1} color={t.glow} />
    </Page>
  );
}

/* ================= 9 · Outline shirt number (goal) — Pinterest Dembélé "11" goal ================= */

/**
 * Golo · número em contorno (goal): a deep club ground; his shirt number giant in a white outline behind him (else
 * GOAL outlined); him full-body, sharp, in front; GOAL solid at the foot with his name and exact club.
 */
export function Goalprooutline({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const back = num || word;
  const bPx = Math.min(900 * k, (W + 40 * k) / Math.max(0.1, wordW(back, 1)));
  const gPx = Math.min(200 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const nl = lines3([d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase(), 34 * k * ts, W - 2 * M, 0.02, 18 * k);
  const footTop = lt - 80 * k - nl.lines.length * nl.px * 1.1 - gPx * 0.86;
  const p = stripFigure(d, 12, W - 12, footTop + 60 * k, Math.min(1200 * k / 1.3, footTop + 60 * k - top), H * 0.34);
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.05)}, ${shade(t.ink, -0.8)} 75%)` }} />
      <div style={{ position: "absolute", left: -20 * k, right: -20 * k, top, textAlign: "center", fontFamily: DISPLAY, fontSize: bPx, lineHeight: 0.8, color: "transparent", WebkitTextStroke: `${4 * k}px rgba(255,255,255,.75)`, whiteSpace: "nowrap" }}>{back}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 120 * k, bottom: 0, background: `linear-gradient(to bottom, ${shade(t.ink, -0.8)}00, ${shade(t.ink, -0.85)}f2 40%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: footTop + gPx * 0.86 + 14 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
      </div>
      <ClubLine d={d} top={lt - 60 * k} color={t.glow} />
    </Page>
  );
}

/* ================= 10 · Scoreboard strip (result) — Pinterest "full time" horizontal strips ================= */

/**
 * Resultado · faixa do marcador (result): his real photo with its own surroundings, graded; a dark horizontal
 * scoreboard strip across the canvas below his face — home crest, the score big, away crest, with the exact names under
 * each crest — FULL TIME tracked over the strip and the competition under it.
 */
export function Resultprostrip({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const p = standAt(d, 540, 640, 165);
  const score = `${d.content.homeGoals ?? "–"}–${d.content.awayGoals ?? "–"}`;
  const colW = 250 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 17 * k * ts, colW, 0.04, 11 * k);
  const an = lines3(fx.awayName.toUpperCase(), 17 * k * ts, colW, 0.04, 11 * k);
  const nPx = Math.min(hn.px, an.px);
  const stripH = 150 * k + Math.max(hn.lines.length, an.lines.length) * nPx * 1.3 + 20 * k;
  const sy = Math.min(Math.max(p.fy + p.fs * 2.2, H * 0.52), lt - 120 * k - stripH);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const side = (crest: string | null, lines: string[]) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k }}>
      {crest ? <img src={crest} alt="" style={{ height: 96 * k, width: 96 * k, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ height: 96 * k }} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {lines.map((l, i) => (
          <div key={i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </div>
  );
  return (
    <Page d={d} bg="#0e1014">
      <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.08) brightness(.72)" }} />
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, top: sy - 70 * k, ...caps(24 * k, 0.5, 900, "#fff"), textAlign: "center", textShadow: "0 4px 18px rgba(0,0,0,.6)" }}>FULL TIME</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: sy, height: stripH, background: `${shade(t.ink, -0.75)}eb`, borderTop: `${4 * k}px solid ${t.glow}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: `${20 * k}px ${M}px 0` }}>
        {side(fx.homeCrest, hn.lines)}
        <div style={{ fontFamily: DISPLAY, fontSize: 130 * k * ts, lineHeight: 1, color: "#fff", marginTop: -6 * k, whiteSpace: "nowrap", flexShrink: 0 }}>{score}</div>
        {side(fx.awayCrest, an.lines)}
      </div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: sy + stripH + 18 * k, textAlign: "center", ...caps(16 * k * ts, 0.3, 700, "#fff"), textShadow: "0 4px 18px rgba(0,0,0,.6)" }}>{comp}</div>}
    </Page>
  );
}
