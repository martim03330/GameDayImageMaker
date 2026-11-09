/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
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
import { CREST_HALO, Front, M, Page, Portrait, caps, portraitOf } from "./prokit";
import { bustAt, stripFigure } from "./pro19";

/* Round 50 · new pro families, part 2 (Pinterest "football poster editorial serif 2025" — "GOALS" stacked letters). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;
const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();

function NameClub({ d, top, clubColor, color = "#fff" }: { d: RenderData; top: number; clubColor: string; color?: string }) {
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

/* ================= 7 · Diagonal number lockup (goal) ================= */

/**
 * Golo · número na diagonal (goal): his shirt number and GOAL locked up together on a diagonal band in the club colour
 * (number huge, GOAL stacked beside it); him full-body in front, sharp; name and exact club in a card at the foot.
 */
export function Goalprodiagnum({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const footT = lt - 170 * k;
  const by = top + 360 * k;
  const p = isCut(d) ? bustAt(d, 540, by + 300 * k, 120 * k) : stripFigure(d, 12, W - 12, footT + 30 * k, Math.min(1250 * k / 1.3, footT + 30 * k - top - 80 * k), H * 0.36);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.3)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", left: -160 * k, right: -160 * k, top: by - 170 * k, height: 400 * k, background: t.ink, transform: "rotate(-12deg)", display: "flex", alignItems: "center", justifyContent: "center", gap: 30 * k }}>
        {num && <div style={{ fontFamily: DISPLAY, fontSize: 400 * k, lineHeight: 0.86, color: "#fff" }}>{num}</div>}
        <div style={{ fontFamily: DISPLAY, fontSize: num ? 170 * k : 300 * k, lineHeight: 0.86, color: "#fff" }}>{word}</div>
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 8 · Stacked letters (goal) — Pinterest "GOALS" vertical block ================= */

/**
 * Golo · letras empilhadas (goal): G-O-A-L stacked one letter per row in a club-colour column down the right; his big
 * colour portrait on the left beside it; his name and exact club at the foot.
 */
export function Goalprostackletters({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase().replace(/\s+/g, "");
  const letters = [...word].slice(0, 6);
  const cw = 300 * k;
  const ct = top;
  const cb = lt - 200 * k;
  const lh = (cb - ct) / letters.length;
  const px = Math.min(lh / 0.86, cw * 1.1);
  return (
    <Page d={d} bg="#efe9df" light>
      {s && <Portrait s={s} cx={(W - cw) / 2 + 20 * k} cy={top + 520 * k} fh={300 * k} mode="color" fade={25} style={{ clipPath: `inset(0px ${cw + M}px 0px 0px)` }} />}
      <div style={{ position: "absolute", right: M, top: ct, width: cw, height: cb - ct, background: t.ink }} />
      {letters.map((c, i) => (
        <div key={i} style={{ position: "absolute", right: M, width: cw, top: ct + i * lh, height: lh, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: "#fff" }}>{c}</div>
      ))}
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 170 * k, height: 130 * k, borderRadius: 16 * k, background: "#16181c" }} />
      <NameClub d={d} top={lt - 150 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 9 · Arched window (goal) ================= */

/**
 * Golo · arco (goal): his colour celebration portrait in a tall centred arched window in the club colour, GOAL huge in
 * front across the arch's foot (below the face), name and exact club under it.
 */
export function Goalproarch({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const aw = 680;
  const al = (W - aw) / 2;
  const at = top;
  const ab = lt - 230 * k;
  const r = aw / 2;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.4)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", left: al, top: at, width: aw, height: ab - at, borderRadius: `${r}px ${r}px 0 0`, background: t.ink }} />
      {s && <Portrait s={s} cx={W / 2} cy={at + r + 100 * k} fh={250 * k} mode="color" style={{ clipPath: `inset(${at}px ${al}px ${H - ab}px ${al}px round ${r}px ${r}px 0px 0px)` }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: ab - gPx * 0.6, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff", textShadow: "0 14px 40px rgba(0,0,0,.45)" }}>{word}</div>
      <NameClub d={d} top={ab + gPx * 0.3 + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 10 · Final (result) — big score, clean FINAL label, stat line ================= */

/**
 * Resultado · final (result): the score huge in the middle with a clean club-colour FINAL label over it, the crests and
 * exact names either side; a short stat line from the post's stats when any are recorded ("Goals 1 · Assists 1"); him
 * big at the foot (waist-up for a wide pose).
 */
export function Resultprofinallabel({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const score = `${d.content.homeGoals ?? "–"}–${d.content.awayGoals ?? "–"}`;
  const sPx = Math.min(300 * k * ts, (W - 2 * M - 300 * k) / Math.max(0.1, wordW(score, 1)));
  const colW = 150 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 15 * k * ts, colW, 0.04, 9 * k);
  const an = lines3(fx.awayName.toUpperCase(), 15 * k * ts, colW, 0.04, 9 * k);
  const npx = Math.min(hn.px, an.px);
  const stats = (d.content.stats ?? []).filter((x) => x.label && String(x.value).trim() && !/^resultado$|^result$/i.test(x.label.trim())).slice(0, 3);
  const statLine = stats.map((x) => `${x.label} ${x.value}`).join("  ·  ");
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const sy = top + 110 * k;
  const blockB = sy + sPx * 0.86 + 60 * k + (statLine ? 50 * k : 0);
  const p = stripFigure(d, 12, W - 12, H + 20 * k, Math.max(H * 0.55, H + 20 * k - blockB), blockB - 20 * k, 150 * k);
  const side = (crest: string | null, lines: string[], left: boolean) => (
    <div style={{ position: "absolute", [left ? "left" : "right"]: M, top: sy + sPx * 0.1, width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
      {crest && <img src={crest} alt="" style={{ height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {lines.map((l, i) => (
        <div key={i} style={{ ...caps(npx, 0.04, 800, "#fff"), textAlign: "center" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.85)}, ${shade(t.ink, -0.45)} 60%, ${t.ink})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
        <div style={{ background: t.ink, padding: `${10 * k}px ${36 * k}px`, borderRadius: 10 * k, ...caps(30 * k, 0.5, 900, "#fff") }}>FINAL</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: sy, textAlign: "center", fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.86, color: "#fff", whiteSpace: "nowrap" }}>{score}</div>
      {side(fx.homeCrest, hn.lines, true)}
      {side(fx.awayCrest, an.lines, false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: sy + sPx * 0.86 + 20 * k, textAlign: "center", ...caps(16 * k * ts, 0.3, 700, "rgba(255,255,255,.8)") }}>{comp}</div>
      {statLine && <div style={{ position: "absolute", left: 0, right: 0, top: sy + sPx * 0.86 + 60 * k, textAlign: "center", ...caps(20 * k * ts, 0.14, 900, t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.3)) }}>{statLine.toUpperCase()}</div>}
    </Page>
  );
}
