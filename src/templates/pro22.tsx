/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
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
import { CREST_HALO, Front, M, Page, caps } from "./prokit";
import { bustAt, feetInside, stripFigure } from "./pro19";

/* Round 42 · new pro families, part 2 (Pinterest "goal celebration graphic minimal", "soccer result graphic college"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;

/* ================= 7 · Name up both sides (goal) — Pinterest vertical-name goal posters ================= */

/**
 * Golo · nome nas laterais (goal): a club-colour ground; his first name running up the left edge and his surname down the
 * right edge, huge; him full-body in the middle, sharp; GOAL across the top; the exact club at the foot.
 */
export function Goalprosidenames({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const first = (d.content.firstName || "").toUpperCase();
  const last = (d.content.lastName || "").toUpperCase();
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const y0 = top + gPx * 0.86 + 40 * k;
  const y1 = lt - 110 * k;
  const len = y1 - y0;
  const fit = (s: string) => Math.min(190 * k, len / Math.max(0.1, wordW(s, 1)));
  const nPx = Math.min(first ? fit(first) : 999, last ? fit(last) : 999);
  const lx = M + nPx * 0.42;
  const rx = W - M - nPx * 0.42;
  const cy = (y0 + y1) / 2;
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M, 0.2, 12 * k);
  const p = stripFigure(d, nPx * 0.95 + M, W - nPx * 0.95 - M, y1 + 20 * k, Math.min(1150 * k / 1.3, y1 + 20 * k - y0), Math.max(y0 + 40 * k, H * 0.42));
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, 0.08)}, ${shade(t.ink, -0.6)})` }} />
      <Front d={d} p={p} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {first && (
          <text x={lx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${lx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff">
            {first}
          </text>
        )}
        {last && (
          <text x={rx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(90 ${rx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff">
            {last}
          </text>
        )}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.86, color: "#fff" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: y1 + 30 * k, display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(0,0,0,.5)", borderRadius: 14 * k, padding: `${12 * k}px 0` }}>
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.2, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 8 · GO / AL split (goal) — Pinterest Sarr "GO AL" around the player ================= */

/**
 * Golo · GO | AL (goal): his real photo with its own surroundings, graded; the word split around him — "GO" big at the
 * top-left above his head, "AL" big at the lower-right below his chest — so the face stays free; name and exact club in
 * a card at the foot.
 */
export function Goalprosplitword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const p = standAt(d, 540, 760, 170);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const cut = Math.ceil(word.length / 2);
  const a = word.slice(0, cut);
  const b = word.slice(cut);
  const px = Math.min(340 * k, (W * 0.62) / Math.max(0.1, Math.max(wordW(a, 1), wordW(b, 1))));
  const box = p.box;
  const headTop = p.fy - p.fs * 1.7;
  const goTop = Math.max(frameOf(d).top, headTop - px * 0.86 - 10 * k);

  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nl = lines3(name, 34 * k * ts, W - 2 * M - 40 * k, 0.04, 18 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 17 * k * ts, W - 2 * M - 40 * k, 0.2, 11 * k);
  const cardH = nl.lines.length * nl.px * 1.15 + cl.lines.length * cl.px * 1.4 + 40 * k;
  const cardTop = lt - 40 * k - cardH;
  // "AL": below his feet when there is room above the card; else on the side of the canvas his body leaves free; else
  // up top beside "GO" (both above his head).
  const bW = wordW(b, 1);
  const leftFree = box.left - M;
  const rightFree = W - M - (box.left + box.width);
  const sideFree = Math.max(leftFree, rightFree);
  const below = box.top + box.height + px * 0.86 + 10 * k < cardTop;
  const sidePx = Math.min(px, sideFree / Math.max(0.1, bW));
  const alMode = below ? "below" : sidePx >= 130 * k ? "side" : "top";
  const alPx = alMode === "side" ? sidePx : alMode === "top" ? Math.min(px, (W * 0.42) / Math.max(0.1, bW)) : px;
  const goPx = alMode === "top" ? Math.min(px, (W * 0.42) / Math.max(0.1, wordW(a, 1))) : px;
  const alStyle: CSSProperties =
    alMode === "below"
      ? { right: M - 10 * k, top: cardTop - 20 * k - alPx * 0.86 }
      : alMode === "side"
        ? { ...(rightFree >= leftFree ? { right: M - 10 * k } : { left: M - 10 * k }), top: box.top + box.height * 0.5 }
        : { right: M - 10 * k, top: goTop };
  return (
    <Page d={d} bg="#0e1014">
      <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.08) brightness(.78)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(t.ink, -0.6)}aa, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.75))` }} />
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", left: M - 10 * k, top: alMode === "top" ? goTop : Math.max(frameOf(d).top, headTop - goPx * 0.86 - 10 * k), fontFamily: DISPLAY, fontSize: goPx, lineHeight: 0.86, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{a}</div>
      <div style={{ position: "absolute", ...alStyle, fontFamily: DISPLAY, fontSize: alPx, lineHeight: 0.86, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{b}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 40 * k - cardH, height: cardH, borderRadius: 16 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        {cl.lines.map((l, i) => (
          <div key={"c" + i} style={caps(cl.px, 0.2, 700, t.glow)}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Repeated GOAL rows (goal) — Pinterest Marquinhos stacked "GOAL" ================= */

/**
 * Golo · repetido (goal): a deep club ground; GOAL repeated in full-width rows top to bottom, alternating solid white and
 * a white outline; him full-body in front (the word stays readable in the rows around him); his name in a tilted
 * club-colour band at the foot with the exact club under it.
 */
export function Goalprorows({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = (W + 40 * k) / Math.max(0.1, wordW(word, 1));
  const rows = Math.ceil((lt - 120 * k - (top - 60 * k)) / (px * 0.84));
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nl = lines3(name, 46 * k * ts, W - 2 * M - 60 * k, 0.02, 22 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W - 2 * M, 0.2, 12 * k);
  const bandTop = lt - 80 * k - nl.lines.length * nl.px * 1.1 - cl.lines.length * cl.px * 1.4 - 40 * k;
  const p = isCut(d) ? bustAt(d, 540, top + 520 * k, 120 * k) : feetInside(d, 540, bandTop + 40 * k, Math.min(1250 * k / 1.3, bandTop + 40 * k - top));
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.4)}, ${shade(t.ink, -0.75)})` }} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: -20 * k, right: -20 * k, top: top - 60 * k + i * px * 0.84, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.84, whiteSpace: "nowrap", color: i % 2 ? "transparent" : "rgba(255,255,255,.92)", WebkitTextStroke: i % 2 ? `${2.5 * k}px rgba(255,255,255,.75)` : undefined }}>{word}</div>
      ))}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: -40 * k, right: -40 * k, top: bandTop, padding: `${18 * k}px ${M + 40 * k}px`, background: t.ink, transform: "rotate(-4deg)", boxShadow: "0 14px 34px rgba(0,0,0,.35)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        {cl.lines.map((l, i) => (
          <div key={"c" + i} style={caps(cl.px, 0.2, 700, "rgba(255,255,255,.88)")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 10 · Flip-digit scoreboard (result) — clean flat flip-clock score cards ================= */

function Flip({ v, w, h, ink }: { v: string; w: number; h: number; ink: string }) {
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.08, overflow: "hidden", background: "#16181d", boxShadow: "0 18px 40px rgba(0,0,0,.4)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h / 2, background: "#1f2228" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: h * 0.82, lineHeight: 1, color: "#fff" }}>{v}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: h / 2 - 2, height: 4, background: "#0b0c0f" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: ink }} />
    </div>
  );
}

/**
 * Resultado · placar de virar (result): a dark ground; FULL TIME tracked over two flat flip-digit cards (each goal count
 * on a split card, no animation, no texture) with the crests over them and the clubs' exact names under; the competition;
 * him full-body below, kept inside the canvas.
 */
export function Resultproflip({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const hg = String(d.content.homeGoals ?? "–");
  const ag = String(d.content.awayGoals ?? "–");
  const cw = 170 * k;
  const ch = 210 * k;
  const colW = W / 2 - M - 20 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW, 0.04, 12 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const blockB = top + 40 * k + 86 * k + ch + 26 * k + Math.max(hn.lines.length, an.lines.length) * nPx * 1.3 + 40 * k;
  const p = stripFigure(d, 12, W - 12, H + 30 * k, Math.max(H * 0.6, H + 30 * k - blockB), blockB - 20 * k);
  const side = (crest: string | null, v: string, lines: string[]) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * k }}>
      {crest ? <img src={crest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ height: 70 * k }} />}
      <Flip v={v} w={cw} h={ch} ink={t.glow} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10 * k }}>
        {lines.map((l, i) => (
          <div key={i} style={caps(nPx, 0.04, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </div>
  );
  return (
    <Page d={d} bg="#0c0d11">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #0c0d11 0%, ${shade(t.ink, -0.55)} 70%, ${shade(t.ink, -0.3)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(26 * k, 0.5, 900, "#fff") }}>FULL TIME</div>
      <div style={{ position: "absolute", left: M, right: M, top: top + 40 * k, display: "flex", justifyContent: "space-between" }}>
        {side(fx.homeCrest, hg, hn.lines)}
        {side(fx.awayCrest, ag, an.lines)}
      </div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: blockB - 40 * k, textAlign: "center", ...caps(16 * k * ts, 0.3, 700, "rgba(255,255,255,.75)") }}>{comp}</div>}
    </Page>
  );
}
