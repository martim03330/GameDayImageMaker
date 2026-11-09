/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
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
import { bustAt, stripFigure } from "./pro19";

/* Round 47 · new pro families, part 2 (Pinterest "goal celebration poster typography", "full time result poster minimal"). */

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

/* ================= 7 · Radial fan (goal) — surname outlines fanned out ================= */

/**
 * Golo · leque (goal): his surname set in white outline and fanned out in a clean radial spread from below his feet
 * (rotated copies, no blur), the centre copy solid; him full-body in front, sharp; GOAL huge at the top; name and exact
 * club in a card at the foot.
 */
export function Goalproradial({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(220 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const footT = lt - 170 * k;
  const ox = W / 2;
  const oy = footT - 20 * k;
  const len = 1000 * k;
  const sPx = Math.min(130 * k, len / Math.max(0.1, wordW(sur, 1)));
  const angles = [-64, -48, -32, -16, 0, 16, 32, 48, 64];
  const g0 = top + gPx * 0.88 + 30 * k;
  const p = isCut(d) ? bustAt(d, 540, g0 + 220 * k, 120 * k) : stripFigure(d, 12, W - 12, footT + 10 * k, Math.min(1100 * k / 1.3, footT + 10 * k - g0), Math.max(g0, H * 0.36));
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 80%, ${shade(t.ink, -0.05)}, ${shade(t.ink, -0.8)} 75%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {angles.map((a) => (
          <text key={a} x={ox} y={oy} textAnchor="start" dominantBaseline="central" transform={`rotate(${a - 90} ${ox} ${oy}) translate(${120 * k} 0)`} style={{ fontFamily: DISPLAY, fontSize: sPx }} fill={a === 0 ? "rgba(255,255,255,.9)" : "none"} stroke="#fff" strokeOpacity={a === 0 ? 0 : 0.55} strokeWidth={2.5 * k}>
            {sur}
          </text>
        ))}
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.88, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.4)" }}>{word}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 8 · Side bars (goal) — the two-bar frame for a goal ================= */

/**
 * Golo · barras laterais (goal): his big colour celebration portrait between two tall club-colour bars, GOAL running up
 * the left bar and his surname up the right; his full name and exact club at the foot.
 */
export function Goalprosidebars({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const bw = 130 * k;
  const bt = top;
  const bb = lt - 200 * k;
  const len = bb - bt - 60 * k;
  const bar = (text: string, x: number, w: number) => {
    const px = Math.min(w * 0.72, len / Math.max(0.1, wordW(text, 1)));
    const y = (bt + bb) / 2;
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${x} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
        {text}
      </text>
    );
  };
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.85)} 75%)` }} />
      {s && <Portrait s={s} cx={W / 2} cy={bt + 440 * k} fh={300 * k} mode="color" fade={25} style={{ clipPath: `inset(0px ${M + bw + 10 * k}px 0px ${M + bw + 10 * k}px)` }} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={M} y={bt} width={bw} height={bb - bt} fill={t.ink} />
        <rect x={W - M - bw} y={bt} width={bw} height={bb - bt} fill={t.ink} />
        {bar(word, M + bw / 2, bw)}
        {bar(sur, W - M - bw / 2, bw)}
      </svg>
      <NameClub d={d} top={bb + 40 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 9 · Panorama (goal) — the stadium strip for a goal ================= */

/**
 * Golo · panorama (goal): a wide strip across the middle with his club's stadium (or the real ground from his photo);
 * him full-body celebrating in front, breaking out of it; GOAL huge above; name and exact club below.
 */
export function Goalpropanorama({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(220 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const st = top + gPx * 0.88 + 120 * k;
  const sb = st + 540 * k;
  const footT = lt - 170 * k;
  const stadium = d.club?.stadiumImages?.[0] ?? null;
  const g = standAt(d, 540, (st + sb) / 2, 130);
  const p = isCut(d) ? bustAt(d, 540, st + 80 * k, 110 * k) : stripFigure(d, 12, W - 12, footT - 10 * k, Math.min(1100 * k / 1.3, footT - 10 * k - st + 80 * k), st - 60 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.45)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${st}px 0px ${H - sb}px 0px)` }}>
        {stadium ? <img src={stadium} alt="" style={{ position: "absolute", left: 0, top: st, width: W, height: sb - st, objectFit: "cover" }} /> : <NatGround place={g} W={W} H={H} />}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: st - 3 * k, height: 6 * k, background: t.ink }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: sb - 3 * k, height: 6 * k, background: t.ink }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.88, color: "#fff" }}>{word}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 10 · Split screen (result) — score half / photo half ================= */

/**
 * Resultado · ecrã dividido (result): the canvas split down the middle — the left half in his club's colour with FULL
 * TIME, both crests, the score stacked huge (home over away) and the exact names; the right half his real photo with
 * its own surroundings; the competition at the foot of the score half.
 */
export function Resultprosplitscreen({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const half = W * 0.5;
  const colW = half - 2 * M + 20 * k;
  const hg = String(d.content.homeGoals ?? "–");
  const ag = String(d.content.awayGoals ?? "–");
  const hn = lines3(fx.homeName.toUpperCase(), 18 * k * ts, colW - 90 * k, 0.04, 10 * k);
  const an = lines3(fx.awayName.toUpperCase(), 18 * k * ts, colW - 90 * k, 0.04, 10 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const g = standAt(d, half + half / 2, 760, 165);
  const row = (crest: string | null, goals: string, lines: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 * k }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 * k }}>
        {crest ? <img src={crest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ width: 80 * k }} />}
        <div style={{ fontFamily: DISPLAY, fontSize: 260 * k * ts, lineHeight: 0.84, color: "#fff" }}>{goals}</div>
      </div>
      <div>{lines.map((l, i) => <div key={i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>)}</div>
    </div>
  );
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px 0px ${half}px)` }}>
        {/* Shifted so his face sits centred in the photo half (a photo that cannot slide far enough is moved, not cut). */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${Math.max(-300, Math.min(300, half + half / 2 - g.fx))}px)` }}>
          <NatGround place={g} W={W} H={H} />
          <NatFigure data={d} place={g} W={W} H={H} clean />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: half, bottom: 0, background: `linear-gradient(180deg, ${t.ink}, ${shade(t.ink, -0.55)})` }} />
      <div style={{ position: "absolute", left: half - 3 * k, top: 0, width: 6 * k, bottom: 0, background: "#fff" }} />
      <div style={{ position: "absolute", left: M, top, width: colW, display: "flex", flexDirection: "column", gap: 26 * k }}>
        <div style={caps(22 * k, 0.5, 900, "#fff")}>FULL TIME</div>
        {row(fx.homeCrest, hg, hn.lines)}
        <div style={{ width: 80 * k, height: 4 * k, background: "rgba(255,255,255,.7)" }} />
        {row(fx.awayCrest, ag, an.lines)}
      </div>
      {comp && <div style={{ position: "absolute", left: M, width: colW, top: lt - 130 * k, ...caps(14 * k * ts, 0.3, 700, "rgba(255,255,255,.8)") }}>{lines3(comp, 14 * k * ts, colW, 0.3, 10 * k).lines.join(" ")}</div>}
    </Page>
  );
}

