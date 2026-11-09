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

/* Round 48 · new pro families, part 2 (Pinterest "goal poster player cutout bold", "result graphic sport design minimal"). */

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

/* ================= 7 · Interlock (goal) — outline GOAL behind, solid GOAL in front of his legs ================= */

/**
 * Golo · entrelaçado (goal): GOAL huge twice — an outline copy high behind his body and a solid copy low in front of his
 * legs (never over his face) — so he sits woven between them; deep club ground; name and exact club at the foot.
 */
export function Goalprointerlock({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(420 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const footT = lt - 170 * k;
  const frontTop = footT - 30 * k - gPx * 0.86;
  const p = isCut(d) ? bustAt(d, 540, top + 470 * k, 130 * k) : stripFigure(d, 12, W - 12, footT, Math.min(1250 * k / 1.3, footT - top), top + 20 * k, 115 * k);
  const headB = p.fy + p.fs * 0.7;
  const solidTop = Math.max(frontTop, headB + 40 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${shade(t.ink, -0.05)}, ${shade(t.ink, -0.8)} 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 40 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "transparent", WebkitTextStroke: `${3 * k}px rgba(255,255,255,.75)` }}>{word}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: solidTop, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff", textShadow: "0 14px 40px rgba(0,0,0,.4)" }}>{word}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 8 · L-frame (goal) — the corner block for a goal ================= */

/**
 * Golo · moldura em L (goal): a thick club-colour L block on the lower-left corner — GOAL up its arm, his name and exact
 * club along its foot; him full-body celebrating in the open corner.
 */
export function Goalprolframe({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const aw = 200 * k;
  const footTop = lt - 230 * k;
  const len = footTop - top - 40 * k;
  const px = Math.min(aw * 0.8, len / Math.max(0.1, wordW(word, 1)));
  const x = aw / 2;
  const y = top + len / 2;
  const nl = lines3(fullName(d), 40 * k * ts, W - aw - 2 * M, 0.02, 18 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 17 * k * ts, W - aw - 2 * M, 0.2, 11 * k);
  const p = isCut(d) ? bustAt(d, W * 0.6, top + 560 * k, 120 * k) : stripFigure(d, aw + 10 * k, W - 12, footTop + 20 * k, Math.min(1150 * k / 1.3, footTop + 20 * k - top), H * 0.36);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.4)}, ${shade(t.ink, -0.85)})` }} />
      {s && <Portrait s={s} cx={W * 0.62} cy={top + 360 * k} fh={260 * k} mode="bw" opacity={0.5} fade={40} />}
      <Front d={d} p={p} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`0,${top - 20 * k} ${aw},${top - 20 * k} ${aw},${footTop} ${W},${footTop} ${W},${H} 0,${H}`} fill={t.ink} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${x} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
          {word}
        </text>
      </svg>
      <div style={{ position: "absolute", left: aw + M, right: M, top: footTop + 30 * k, display: "flex", flexDirection: "column", gap: 6 * k }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
        {cl.lines.map((l, i) => (
          <div key={"c" + i} style={caps(cl.px, 0.2, 800, "rgba(255,255,255,.85)")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Two-colour GOAL (goal) — GOAL set in both his club's colours ================= */

/**
 * Golo · duas cores (goal): GO in white and AL in his club's lighter colour stacked huge at the top-left; him full-body
 * on the right in front, sharp; the opponent and competition tracked small; name and exact club in a card.
 */
export function Goalprotwocolour({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const cut = Math.ceil(word.length / 2);
  const a = word.slice(0, cut);
  const b = word.slice(cut);
  const px = Math.min(400 * k, (W * 0.6) / Math.max(0.1, Math.max(wordW(a, 1), wordW(b, 1))));
  const club = ourClub(d).toLowerCase();
  const opp = (club === fx.awayName.toLowerCase() ? fx.homeName : fx.awayName).toUpperCase();
  const footT = lt - 170 * k;
  const p = isCut(d) ? bustAt(d, W * 0.66, top + 560 * k, 120 * k) : stripFigure(d, W * 0.35, W - 12, footT + 10 * k, Math.min(1150 * k / 1.3, footT + 10 * k - top - 60 * k), H * 0.36);
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.45)}, #0b0c10)` }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: px, lineHeight: 0.84, color: "#fff" }}>{a}</div>
      <div style={{ position: "absolute", left: M, top: top + px * 0.84, fontFamily: DISPLAY, fontSize: px, lineHeight: 0.84, color: shade(t.ink, 0.3) }}>{b}</div>
      <div style={{ position: "absolute", left: M, top: top + px * 1.72, width: W * 0.4, display: "flex", flexDirection: "column", gap: 6 * k }}>
        {lines3(`VS ${opp}`, 20 * k, W * 0.4, 0.3, 12 * k).lines.map((l, i) => (
          <div key={i} style={caps(lines3(`VS ${opp}`, 20 * k, W * 0.4, 0.3, 12 * k).px, 0.3, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(14 * k, 0.3, 700, "rgba(255,255,255,.7)")}>{(matchFacts(d).comp || "").toUpperCase()}</div>
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 10 · Portrait between numerals (result) ================= */

/**
 * Resultado · retrato entre números (result): the home goals and the away goals set huge at the left and right edges
 * with his colour portrait large between them; both crests and the exact names under each numeral; FULL TIME and the
 * competition at the top.
 */
export function Resultprobetween({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const s = portraitOf(d);
  const hg = String(d.content.homeGoals ?? "–");
  const ag = String(d.content.awayGoals ?? "–");
  const nPx = 520 * k;
  const colW = 300 * k;
  const ny = top + 260 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 18 * k * ts, colW, 0.04, 10 * k);
  const an = lines3(fx.awayName.toUpperCase(), 18 * k * ts, colW, 0.04, 10 * k);
  const npx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const side = (crest: string | null, lines: string[], left: boolean) => (
    <div style={{ position: "absolute", [left ? "left" : "right"]: M, top: ny + nPx * 0.86 + 20 * k, width: colW, display: "flex", flexDirection: "column", alignItems: left ? "flex-start" : "flex-end", gap: 10 * k }}>
      {crest && <img src={crest} alt="" style={{ height: 90 * k, width: 90 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {lines.map((l, i) => (
        <div key={i} style={{ ...caps(npx, 0.04, 800, "#fff"), textAlign: left ? "left" : "right" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.75)}, ${shade(t.ink, -0.35)})` }} />
      {/* The portrait lives only between the two numerals, so it never covers them. */}
      {s && <Portrait s={s} cx={W / 2} cy={ny + 260 * k} fh={300 * k} mode="color" fade={30} style={{ clipPath: `inset(0px ${M - 20 * k + wordW(ag, 1) * nPx + 16 * k}px 0px ${M - 20 * k + wordW(hg, 1) * nPx + 16 * k}px)` }} />}
      <div style={{ position: "absolute", left: M - 20 * k, top: ny, fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, color: "#fff", textShadow: "0 14px 40px rgba(0,0,0,.4)" }}>{hg}</div>
      <div style={{ position: "absolute", right: M - 20 * k, top: ny, fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, color: "#fff", textShadow: "0 14px 40px rgba(0,0,0,.4)" }}>{ag}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(26 * k, 0.5, 900, "#fff") }}>FULL TIME</div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: top + 46 * k, textAlign: "center", ...caps(16 * k * ts, 0.3, 700, "rgba(255,255,255,.75)") }}>{comp}</div>}
      {side(fx.homeCrest, hn.lines, true)}
      {side(fx.awayCrest, an.lines, false)}
      <div style={{ position: "absolute", left: M, right: M, top: lt - 90 * k, borderTop: `${2 * k}px solid rgba(255,255,255,.4)` }} />
    </Page>
  );
}
