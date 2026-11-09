/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { SCRIPT } from "./kit";
import { NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { fullName } from "./natfree9";
import { scoreOf } from "./outline";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { CREST_HALO, ourCrest } from "./usgame1";
import { tones } from "./usgame4";
import { Fig, Frame, Info, M, type Row, TypeLayer, belowLine, fitWord, headBox, infoOf, notHead, rowBox, safeRow, standAt, wordW } from "./usgame6";

/* Round 31, part 2 (refs-analysis.md): pattern rows, GOAL + stat column, block + script, echo rows, final column. */

const caps = (px: number, tracking: number, weight: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", color });

/** His full name and his club's exact name, each wrapped (never cut), in a block of width `w`. */
function nameBlock(d: RenderData, w: number) {
  const { k, ts } = frameOf(d);
  const name = lines3(fullName(d), 44 * k * ts, w, 0.02, 28 * k);
  const club = lines3(ourClub(d).toUpperCase(), 21 * k * ts, w, 0.16, 16 * k);
  const h = name.lines.length * (name.px + 8 * k) + 6 * k + club.lines.length * (club.px + 6 * k);
  return { name, club, h, k };
}

function NameBlock({ b, x, y, w, color, accent, align = "flex-start" }: { b: ReturnType<typeof nameBlock>; x: number; y: number; w: number; color: string; accent: string; align?: "flex-start" | "center" }) {
  const { k } = b;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexDirection: "column", alignItems: align }}>
      {b.name.lines.map((l, i) => (
        <div key={i} style={{ ...caps(b.name.px, 0.02, 900, color), marginBottom: 8 * k }}>{l}</div>
      ))}
      {b.club.lines.map((l, i) => (
        <div key={"c" + i} style={{ ...caps(b.club.px, 0.16, 700, accent), marginTop: i ? 0 : 6 * k, marginBottom: 6 * k }}>{l}</div>
      ))}
    </div>
  );
}

/* ================= 6 · Repeated name (matchday) — pin0 r5c1 FLORIDA, pin6 r1c1 GAMEDAY ×4 ================= */

/**
 * Nome repetido (matchday): his club's exact name repeated in rows down a deep club-colour ground — solid accent rows
 * alternating with outlined ones — and him in front in full colour; the fixture on a dark band at the foot.
 */
export function Usrepeatname({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const p = standAt(d, 540, 860, 210);
  const name = ourClub(d).toUpperCase() || "MATCHDAY";
  const px = fitWord(name, CANVAS_W - 2 * M, 260 * k);
  const w = CANVAS_W - 2 * M;
  const info = infoOf(d, w);
  const iy = logoTopOf(d, H) - 40 * k - info.h;
  const gap = px * 0.08;
  const rows: Row[] = [];
  for (let y = top - px * 0.3; y < iy - 40 * k; y += px * 0.8 + gap) rows.push({ text: name, x: CANVAS_W / 2, y, px, anchor: "middle" });
  const deep = shade(t.ink, -0.45);
  const solid = t.acc === "#ffffff" ? t.glow : t.acc;
  return (
    <Frame
      d={d}
      bg={deep}
      ground={<div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.15)}, ${deep} 75%)` }} />}
      behind={<TypeLayer id="rep-b" H={H} rows={rows} paint={(r) => (rows.indexOf(r) % 2 ? { fill: "none", stroke: "#fff", strokeOpacity: 0.55, strokeWidth: px * 0.012 } : { fill: solid, opacity: 0.92 })} />}
      fig={<Fig d={d} p={p} />}
      front={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: iy - 34 * k, bottom: 0, background: `linear-gradient(to bottom, ${deep}00, ${deep}ee 18%, ${deep})` }} />
          <Info i={info} x={M} y={iy} w={w} color="#fff" accent={solid} align="center" />
        </>
      }
    />
  );
}

/* ================= 7 · GOAL + stat column (goal) — pin3 r3c1 Hanover GOAL ================= */

/**
 * Golo · coluna de stats (goal): his photo; GOAL huge in white across the top, his head in front of it and the rest
 * over him (interlock, free-side fallback); a narrow stat column on the free side — his shirt number in a box with his
 * club's crest, his name and exact club, the opponent with its crest, the round. Never the score (goal posts never
 * show it).
 */
export function Goalusstatcol({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const left = d.params.side === "left";
  const p = standAt(d, left ? 400 : 660, 880, 210);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = fitWord(word, CANVAS_W - 2 * M, 440 * k);
  const r = safeRow(p, word, top + 30 * k, px, M, CANVAS_W - M, "middle", 0.25, logoTopOf(d, H) - 420 * k);
  const fx = natFixture(d);
  const cw = 300 * k;
  const cx = left ? CANVAS_W - M - cw : M;
  const box = 96 * k;
  // Goal posts never show the score (the user's rule): the column carries his number, his club and the opponent.
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  // Which side is his: the stored home flag, else his club's exact name against the two teams.
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club && fx.homeName.toLowerCase() !== club);
  const mine = (weAway ? fx.awayCrest : fx.homeCrest) ?? ourCrest(d);
  const opp = weAway ? fx.homeName : fx.awayName;
  const oppCrest = weAway ? fx.homeCrest : fx.awayCrest;
  const vs = opp ? lines3(`VS ${opp.toUpperCase()}`, 18 * k * ts, cw, 0.08, 13 * k) : { lines: [], px: 0 };
  const round = matchFacts(d).round.toUpperCase();
  const nb = nameBlock(d, cw);
  const topH = no || mine ? box + 20 * k : 0;
  const vsH = vs.lines.length ? 18 * k + Math.max(oppCrest ? 50 * k : 0, vs.lines.length * (vs.px + 6 * k)) : 0;
  const rH = round ? 16 * k + 16 * k : 0;
  const colH = topH + nb.h + vsH + rH;
  const cy = Math.max(rowBox(r).y1 + 40 * k, logoTopOf(d, H) - 60 * k - colH);
  return (
    <Frame
      d={d}
      bg="#0c0f14"
      ground={
        <>
          <NatGround place={p} W={CANVAS_W} H={H} style={{ filter: "contrast(1.08) saturate(.95) brightness(.84)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,0) 40%, rgba(0,0,0,.15) 70%, rgba(0,0,0,.6))" }} />
        </>
      }
      behind={<TypeLayer id="gs-b" H={H} rows={[r]} paint={(q) => ({ fill: "#fff", style: { fontFamily: DISPLAY, fontSize: q.px, filter: "drop-shadow(0 10px 26px rgba(0,0,0,.4))" } })} />}
      fig={<Fig d={d} p={p} />}
      front={
        <>
          <TypeLayer id="gs-f" H={H} rows={[r]} clipD={notHead(p, H)} paint={() => ({ fill: "#fff" })} />
          <div style={{ position: "absolute", left: cx - 16 * k, top: cy - 20 * k, width: cw + 32 * k, height: colH + 40 * k, borderRadius: 18 * k, background: "rgba(8,10,14,.62)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: cx, top: cy, width: cw, display: "flex", flexDirection: "column" }}>
            {(no || mine) && (
              <div style={{ display: "flex", alignItems: "center", gap: 18 * k, height: box, marginBottom: 20 * k }}>
                {no && <div style={{ width: box, height: box, background: t.ink, border: `${3 * k}px solid #fff`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 64 * k * ts, color: "#fff" }}>{no}</div>}
                {mine && <img src={mine} alt="" style={{ height: 84 * k, width: 84 * k, objectFit: "contain", filter: CREST_HALO }} />}
              </div>
            )}
          </div>
          <NameBlock b={nb} x={cx} y={cy + topH} w={cw} color="#fff" accent={t.glow} />
          {vs.lines.length > 0 && (
            <div style={{ position: "absolute", left: cx, top: cy + topH + nb.h + 18 * k, width: cw, display: "flex", alignItems: "center", gap: 12 * k }}>
              {oppCrest && <img src={oppCrest} alt="" style={{ height: 50 * k, width: 50 * k, objectFit: "contain", flexShrink: 0, filter: CREST_HALO }} />}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {vs.lines.map((l, i) => (
                  <div key={i} style={{ ...caps(vs.px, 0.08, 800, "#fff"), opacity: 0.9, marginTop: i ? 6 * k : 0 }}>{l}</div>
                ))}
              </div>
            </div>
          )}
          {round && <div style={{ position: "absolute", left: cx, top: cy + topH + nb.h + vsH + 16 * k, ...caps(16 * k * ts, 0.22, 700, t.glow) }}>{round}</div>}
        </>
      }
    />
  );
}

/* ================= 8 · Block + script, light (goal) — pin3 r4c2 FIRST GOAL, r5c1 Preseason MVP ================= */

/**
 * Golo · bloco e script (goal): a pale ground tinted with the club colour; GOAL huge in the club colour, interlocked
 * with him; his surname in a brush script crossing it in near-black with a white edge (kept off his face); his full
 * name and exact club on a white card at the foot.
 */
export function Goalusscript({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const p = standAt(d, 540, 900, 205);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = fitWord(word, CANVAS_W - 2 * M, 430 * k);
  const w = CANVAS_W - 2 * M - 80 * k;
  const nb = nameBlock(d, w);
  const cy = logoTopOf(d, H) - 60 * k - nb.h;
  const r = safeRow(p, word, top + 40 * k, px, M, CANVAS_W - M, "middle", 0.25, cy - 260 * k);
  const b = rowBox(r);
  const last = (d.content.lastName || d.content.firstName || "").trim();
  const script = last ? last.charAt(0).toUpperCase() + last.slice(1).toLowerCase() : "";
  const sPx = Math.min(200 * k * ts, (CANVAS_W - 120 * k) / Math.max(1, script.length * 0.42));
  const h = headBox(p);
  // On the lower half of GOAL; if that is his face, under the word instead (the script is drawn in front of him).
  let sBase = b.y0 + (b.y1 - b.y0) * 0.92;
  if (sBase > h.y0 - 10 && sBase - sPx * 0.7 < h.y1) sBase = Math.max(b.y1 + sPx * 0.6, h.y1 + sPx * 0.75);
  sBase = Math.min(sBase, cy - 50 * k);
  const pale = `linear-gradient(180deg, #ffffff 0%, ${t.ink}14 100%), #ffffff`;
  return (
    <Frame
      d={d}
      light
      bg="#ffffff"
      ground={<div style={{ position: "absolute", inset: 0, background: pale }} />}
      behind={<TypeLayer id="sc-b" H={H} rows={[r]} paint={() => ({ fill: t.ink })} />}
      fig={<Fig d={d} p={p} light />}
      front={
        <>
          <TypeLayer id="sc-f" H={H} rows={[r]} clipD={notHead(p, H)} paint={() => ({ fill: t.ink })} />
          {script && (
            <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
              <text x={CANVAS_W / 2} y={sBase} textAnchor="middle" transform={`rotate(-7 ${CANVAS_W / 2} ${sBase})`} style={{ fontFamily: SCRIPT, fontSize: sPx }} fill="#15171b" stroke="#fff" strokeWidth={sPx * 0.08} strokeLinejoin="round" paintOrder="stroke">
                {script}
              </text>
            </svg>
          )}
          <div style={{ position: "absolute", left: M, right: M, top: cy - 28 * k, height: nb.h + 56 * k, borderRadius: 20 * k, background: "rgba(255,255,255,.92)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
          <NameBlock b={nb} x={M + 40 * k} y={cy} w={w} color="#15171b" accent={t.ink} align="center" />
        </>
      }
    />
  );
}

/* ================= 9 · Echo rows, light (goal) — pin3 r1c4 gold GOAL ================= */

/**
 * Golo · eco (goal): a warm beige ground; GOAL three times across his body — outlined, solid in the club colour,
 * outlined — him standing in them: the solid row behind his upper half and in front of his lower half (interlock);
 * his name, shirt number and exact club on a card at the foot.
 */
export function Goalusecho({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const p = standAt(d, 540, 760, 200);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const w = CANVAS_W - 2 * M - 80 * k;
  const nb = nameBlock(d, w - (no ? 120 * k : 0));
  const cy = logoTopOf(d, H) - 60 * k - nb.h;
  const h = headBox(p);
  // Three rows between his chin and the card; when that room is short, the block rises (his head then in front of the top row).
  const room = cy - 50 * k - (h.y1 + 20 * k);
  const px = Math.min(fitWord(word, CANVAS_W - 2 * M, 360 * k), Math.max(room, 600 * k) / (3 * 0.86));
  const step = px * 0.86;
  const y0 = Math.max(frameOf(d).top, Math.min(h.y1 + 20 * k, cy - 50 * k - 3 * step));
  const rows: Row[] = [0, 1, 2].map((i) => ({ text: word, x: CANVAS_W / 2, y: y0 + i * step, px, anchor: "middle" }));
  const mid = rows[1];
  const mb = rowBox(mid);
  const BEIGE = "#efe8da";
  return (
    <Frame
      d={d}
      light
      bg={BEIGE}
      ground={<div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 35%, #f8f4ec, ${BEIGE} 60%, #e2d9c6)` }} />}
      behind={<TypeLayer id="ec-b" H={H} rows={rows} paint={(r) => (r === mid ? { fill: t.ink } : { fill: "none", stroke: t.ink, strokeOpacity: 0.55, strokeWidth: px * 0.014 })} />}
      fig={<Fig d={d} p={p} light />}
      front={
        <>
          <TypeLayer id="ec-f" H={H} rows={[mid]} clipD={belowLine(mb.y0 + (mb.y1 - mb.y0) * 0.5, H, p)} paint={() => ({ fill: t.ink })} />
          <div style={{ position: "absolute", left: M, right: M, top: cy - 28 * k, height: nb.h + 56 * k, borderRadius: 20 * k, background: "rgba(255,255,255,.9)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
          {no && <div style={{ position: "absolute", left: M + 34 * k, top: cy - 28 * k, height: nb.h + 56 * k, display: "flex", alignItems: "center", fontFamily: DISPLAY, fontSize: Math.min(110 * k * ts, nb.h + 30 * k), color: t.ink, lineHeight: 1 }}>{no}</div>}
          <NameBlock b={nb} x={M + 40 * k + (no ? 120 * k : 0)} y={cy} w={w - (no ? 120 * k : 0)} color="#15171b" accent={t.ink} />
        </>
      }
    />
  );
}

/* ================= 10 · Final column (result) — pin0 r1c5 0/3 FINAL, pin2 r1c3, r3c5 ================= */

/**
 * Resultado · coluna final (result): his real photo; on the free side a full-height column in the club colour with
 * the home goals huge, the home crest and exact name, a FINAL pill, the away crest and exact name, the away goals
 * huge, and the competition at its foot.
 */
export function Resultuscolumn({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const left = d.params.side === "left";
  const p = standAt(d, left ? 420 : 660, 860, 210);
  const fx = natFixture(d);
  const cw = 320 * k;
  const cx = left ? CANVAS_W - cw - M : M;
  const score = scoreOf(d, "–");
  const [hg, ag] = score ? score.split("–") : ["–", "–"];
  const iw = cw - 40 * k;
  const nPx = 18 * k * ts;
  const hn = lines3(fx.homeName.toUpperCase(), nPx, iw, 0.06, 13 * k);
  const an = lines3(fx.awayName.toUpperCase(), nPx, iw, 0.06, 13 * k);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const cl = comp ? lines3(comp, 16 * k * ts, iw, 0.14, 12 * k) : { lines: [], px: 0 };
  const lt = logoTopOf(d, H);
  const colTop = top - 40 * k;
  const colBot = lt - 50 * k;
  const crest = 74 * k;
  const fixedH = 2 * (crest + 12 * k) + hn.lines.length * (hn.px + 6 * k) + an.lines.length * (an.px + 6 * k) + 60 * k + 40 * k + cl.lines.length * (cl.px + 6 * k) + 60 * k;
  const dPx = Math.min((colBot - colTop - fixedH) / 2 / 0.86, iw / Math.max(0.1, wordW(String(Math.max(hg.length, ag.length) > 1 ? "88" : "8"), 1)));
  const digit = (n: string) => <div style={{ fontFamily: DISPLAY, fontSize: dPx, lineHeight: 0.86, color: "#fff", textShadow: "0 8px 24px rgba(0,0,0,.25)" }}>{n}</div>;
  const team = (c: string | null, n: { lines: string[]; px: number }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 * k }}>
      {c && <img src={c} alt="" style={{ height: crest, width: crest, objectFit: "contain", filter: CREST_HALO }} />}
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(n.px, 0.06, 800, "#fff"), marginTop: i ? 6 * k : 10 * k }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Frame
      d={d}
      bg="#0c0f14"
      ground={
        <>
          <NatGround place={p} W={CANVAS_W} H={H} style={{ filter: "contrast(1.06) saturate(.95) brightness(.9)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,0) 40%, rgba(0,0,0,.5))" }} />
        </>
      }
      fig={<Fig d={d} p={p} />}
      front={
        <div style={{ position: "absolute", left: cx, top: colTop, width: cw, height: colBot - colTop, background: `${t.ink}eb`, boxShadow: "0 20px 50px rgba(0,0,0,.45)", borderBottom: `${8 * k}px solid ${t.acc}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", padding: `${30 * k}px ${20 * k}px` }}>
          {digit(hg)}
          {team(fx.homeCrest, hn)}
          <div style={{ margin: `${20 * k}px 0`, padding: `${8 * k}px ${22 * k}px`, borderRadius: 30 * k, background: "#fff", color: t.ink, fontFamily: DISPLAY, fontSize: 30 * k, letterSpacing: "0.16em", lineHeight: 1 }}>FINAL</div>
          {team(fx.awayCrest, an)}
          <div style={{ height: 12 * k }} />
          {digit(ag)}
          {cl.lines.map((l, i) => (
            <div key={i} style={{ ...caps(cl.px, 0.14, 700, "#fff"), opacity: 0.85, marginTop: i ? 6 * k : 18 * k }}>{l}</div>
          ))}
        </div>
      }
    />
  );
}

