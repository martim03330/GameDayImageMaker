/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { standAt, wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, Portrait, caps, frontAt, portraitOf } from "./prokit";
import { bustAt, stripFigure } from "./pro19";

/* Round 46 · new pro families, part 2 (Pinterest "goal poster minimal behance", "match result graphic design 2026"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;
const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();

function NameClub({ d, top, clubColor }: { d: RenderData; top: number; clubColor: string }) {
  const { k, ts } = frameOf(d);
  const nl = lines3(fullName(d), 36 * k * ts, W - 2 * M - 40 * k, 0.02, 18 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 17 * k * ts, W - 2 * M - 40 * k, 0.2, 11 * k);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {nl.lines.map((l, i) => (
        <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
      ))}
      <div style={{ height: 6 * k }} />
      {cl.lines.map((l, i) => (
        <div key={"c" + i} style={caps(cl.px, 0.2, 800, clubColor)}>{l}</div>
      ))}
    </div>
  );
}

/* ================= 7 · Vertical triptych (goal) — three stacked celebration crops ================= */

/**
 * Golo · tríptico (goal): three stacked horizontal frames of his celebration photo at three scales — face close-up,
 * chest-up, full figure — with thin white gaps on a deep club ground; GOAL huge at the top; his name and exact club at
 * the foot.
 */
export function Goalprotriptych({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(200 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const g = 12 * k;
  const y0 = top + gPx * 0.88 + 30 * k;
  const y1 = lt - 190 * k;
  // Two short frames over a tall one: the full-figure frame gets about half the height (waist-up for a wide pose).
  const avail = y1 - y0 - 2 * g;
  const hs = [avail * 0.25, avail * 0.25, avail * 0.5];
  const ys = [y0, y0 + hs[0] + g, y0 + hs[0] + hs[1] + 2 * g];
  const clip = (i: number) => `inset(${ys[i]}px ${M}px ${H - ys[i] - hs[i]}px ${M}px)`;
  // The tall frame: waist-up, big (his face about a fifth of the frame), the legs running out of its foot.
  const full = isCut(d) ? bustAt(d, W / 2, ys[2] + hs[2] * 0.32, hs[2] * 0.17) : frontAt(d, W / 2, ys[2] + hs[2] * 0.27, hs[2] * 0.3);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.85)})` }} />
      {ys.map((y, i) => (
        <div key={i} style={{ position: "absolute", left: M, right: M, top: y, height: hs[i], background: i === 1 ? t.ink : shade(t.ink, -0.3) }} />
      ))}
      {s && <Portrait s={s} cx={W / 2} cy={ys[0] + hs[0] * 0.5} fh={hs[0] * 0.62} mode="color" style={{ clipPath: clip(0) }} />}
      {s && <Portrait s={s} cx={W / 2} cy={ys[1] + hs[1] * 0.32} fh={hs[1] * 0.3} mode="bw" style={{ clipPath: clip(1) }} />}
      <div style={{ position: "absolute", inset: 0, clipPath: clip(2) }}>
        <Front d={d} p={full} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.88, color: "#fff" }}>{word}</div>
      <NameClub d={d} top={y1 + 30 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 8 · Window (goal) — the circular window for a goal ================= */

/**
 * Golo · janela (goal): a big circular window showing the real ground from his photo (or his club's stadium), a thick
 * white rim; him full-body celebrating in front of it, sharp; GOAL huge at the top; name and exact club at the foot.
 */
export function Goalprowindow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(220 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const R = 420;
  const cx = W / 2;
  const cy = top + gPx * 0.88 + 50 * k + R;
  const g = standAt(d, 540, cy - R * 0.2, 150);
  const stadium = d.club?.stadiumImages?.[0] ?? null;
  const footT = lt - 170 * k;
  const p = isCut(d) ? bustAt(d, 540, cy + R * 0.3, 110 * k) : stripFigure(d, 12, W - 12, footT - 10 * k, Math.min(1100 * k / 1.3, footT - 10 * k - (cy - R * 0.5)), cy - R * 0.2);
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.75)})` }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `circle(${R}px at ${cx}px ${cy}px)` }}>
        {stadium ? <img src={stadium} alt="" style={{ position: "absolute", left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, objectFit: "cover" }} /> : <NatGround place={g} W={W} H={H} />}
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#fff" strokeWidth={12 * k} />
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.88, color: "#fff" }}>{word}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 9 · Kit hoops (goal) — horizontal kit stripes for a goal ================= */

/**
 * Golo · riscas (goal): wide two-tone horizontal hoops from his kit across the canvas; him full-body in front, sharp;
 * GOAL huge on a dark band at the top; his name and exact club in a card at the foot.
 */
export function Goalprohoops({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(180 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const two = t.acc === "#ffffff" ? "#f1f1ee" : t.acc;
  const hh = 120 * k;
  const n = Math.ceil(H / hh);
  const bandB = top - 20 * k + gPx * 0.9 + 40 * k;
  const footT = lt - 170 * k;
  const p = isCut(d) ? bustAt(d, 540, bandB + 220 * k, 120 * k) : stripFigure(d, 12, W - 12, footT + 20 * k, Math.min(1150 * k / 1.3, footT + 20 * k - bandB - 20 * k), Math.max(bandB, H * 0.36));
  return (
    <Page d={d} bg={t.ink}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * hh, height: hh, background: i % 2 ? two : t.ink }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.2), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5))" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 20 * k, height: bandB - top + 20 * k, background: "rgba(6,8,12,.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.9, color: "#fff" }}>{word}</div>
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(6,8,12,.78)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.3)} />
    </Page>
  );
}

/* ================= 10 · Outlined circle (result) — minimal circle-score posters ================= */

/**
 * Resultado · círculo (result): the score set huge inside a big thin outlined circle, the crests either side of it, the
 * clubs' exact names under the crests; FULL TIME and the competition over the circle; him big at the foot (waist-up for
 * a wide pose).
 */
export function Resultprocircle({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const score = `${d.content.homeGoals ?? "–"}–${d.content.awayGoals ?? "–"}`;
  const R = 250;
  const cx = W / 2;
  const cy = top + 110 * k + R;
  const sPx = Math.min(240 * k, (R * 1.6) / Math.max(0.1, wordW(score, 1)));
  const colW = W / 2 - R - M - 10 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 17 * k * ts, colW, 0.04, 10 * k);
  const an = lines3(fx.awayName.toUpperCase(), 17 * k * ts, colW, 0.04, 10 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const blockB = cy + R + 40 * k;
  const p = stripFigure(d, 12, W - 12, H + 20 * k, Math.max(H * 0.55, H + 20 * k - blockB), blockB - 20 * k, 150 * k);
  const side = (crest: string | null, lines: string[], left: boolean) => (
    <div style={{ position: "absolute", [left ? "left" : "right"]: M, top: cy - 90 * k, width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k }}>
      {crest ? <img src={crest} alt="" style={{ height: 120 * k, width: 120 * k, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ height: 120 * k }} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ ...caps(nPx, 0.04, 800, "#fff"), textAlign: "center" }}>{l}</div>
        ))}
      </div>
    </div>
  );
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.8)} 0%, ${shade(t.ink, -0.5)} 60%, ${t.ink})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(22 * k, 0.5, 900, "#fff") }}>FULL TIME</div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: top + 40 * k, textAlign: "center", ...caps(15 * k * ts, 0.3, 700, "rgba(255,255,255,.75)") }}>{comp}</div>}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill={`${shade(t.ink, -0.6)}cc`} stroke="#fff" strokeWidth={4 * k} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: DISPLAY, fontSize: sPx }} fill="#fff">
          {score}
        </text>
      </svg>
      {side(fx.homeCrest, hn.lines, true)}
      {side(fx.awayCrest, an.lines, false)}
    </Page>
  );
}
