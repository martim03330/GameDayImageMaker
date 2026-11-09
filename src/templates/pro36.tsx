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
import { CREST_HALO, Front, M, Page, caps, portraitOf, shotBox } from "./prokit";
import { bustAt, stripFigure } from "./pro19";

/* Round 49 · new pro families, part 2 (Pinterest "goal graphic championship 2026", "final score graphic college 2025"). */

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

/* ================= 7 · Giant G (goal) — a single letter filled with his photo ================= */

/**
 * Golo · letra G (goal): a single giant G across the canvas filled with his black-and-white photo (a clip) and a white
 * outline; his whole sharp cut-out in colour in front of the letter's foot, so the face is always whole; OAL small
 * tracked beside it; name and exact club at the foot.
 */
export function Goalprog({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const ch = word[0] || "G";
  const px = Math.min(1250 * k, (W + 60 * k) / Math.max(0.1, wordW(ch, 1)));
  const base = top + px * 0.78;
  const b = s ? shotBox(s, W / 2, top + px * 0.3, px * 0.2) : null;
  const footT = lt - 170 * k;
  const p = isCut(d) ? bustAt(d, 540, top + px * 0.45, 110 * k) : stripFigure(d, 12, W - 12, footT, Math.min(1100 * k / 1.3, footT - top - px * 0.2), top + px * 0.25, 115 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.85)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="pro-g">
            <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }}>
              {ch}
            </text>
          </clipPath>
        </defs>
        <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill={t.ink}>
          {ch}
        </text>
        {s && b && <image href={s.url} x={b.left} y={b.top} width={b.width} height={b.height} preserveAspectRatio="none" clipPath="url(#pro-g)" style={{ filter: "grayscale(1)", opacity: 0.6 }} />}
        <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke="#fff" strokeWidth={3 * k}>
          {ch}
        </text>
      </svg>
      <Front d={d} p={p} />
      {word.length > 1 && <div style={{ position: "absolute", right: M, top, ...caps(44 * k, 0.5, 900, "#fff") }}>{word}</div>}
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 8 · Marquee (goal) — repeated surname strip for a goal ================= */

/**
 * Golo · faixa do nome (goal): his real celebration photo with its own surroundings filling the canvas left of a
 * club-colour strip that repeats GOAL up the right edge (solid and outline, static); his name and exact club in a card.
 */
export function Goalpromarquee({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const sw = 170 * k;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = sw * 0.72;
  const unit = (wordW(word, 1) + 0.5) * px;
  const n = Math.ceil(H / Math.max(1, unit)) + 1;
  const g = standAt(d, (W - sw) / 2, 760, 170);
  const cx = W - sw / 2;
  const footT = lt - 170 * k;
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px ${sw}px 0px 0px)` }}>
        <NatGround place={g} W={W} H={H} style={{ filter: "contrast(1.05) brightness(.9)" }} />
        <NatFigure data={d} place={g} W={W} H={H} clean />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,.7))" }} />
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: sw, background: t.ink }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n }, (_, i) => {
          const y = H - i * unit - unit / 2;
          return (
            <text key={i} x={cx} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill={i % 2 ? "none" : "#fff"} stroke={i % 2 ? "#fff" : "none"} strokeWidth={2.5 * k}>
              {word}
            </text>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: M - 10 * k, right: sw + 20 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.65)" }} />
      <div style={{ position: "absolute", left: 0, right: sw, top: footT + 20 * k }}>
        <NameClub d={d} top={0} clubColor={t.glow} />
      </div>
    </Page>
  );
}

/* ================= 9 · Crest circles (goal) — the two crest discs for a goal ================= */

/**
 * Golo · emblemas (goal): GOAL huge at the top, both crests in white-rimmed circles under it (no score — only the
 * fixture), him full-body celebrating below them, sharp; name and exact club in a card.
 */
export function Goalprocrests({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(240 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const R = 110 * k;
  const cy = top + gPx * 0.88 + 30 * k + R;
  const footT = lt - 170 * k;
  const disc = (crest: string | null, cx: number) => (
    <div style={{ position: "absolute", left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", background: shade(t.ink, -0.3), border: `${6 * k}px solid #fff`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {crest && <img src={crest} alt="" style={{ width: R * 1.25, height: R * 1.25, objectFit: "contain", filter: CREST_HALO }} />}
    </div>
  );
  const p = isCut(d) ? bustAt(d, 540, cy + R + 200 * k, 120 * k) : stripFigure(d, 12, W - 12, footT + 70 * k, Math.min(1300 * k / 1.3, footT + 70 * k - cy + R * 0.2), cy - R * 0.3, 150 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.8)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.88, color: "#fff" }}>{word}</div>
      {disc(fx.homeCrest, W / 2 - R - 30 * k)}
      {disc(fx.awayCrest, W / 2 + R + 30 * k)}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footT, height: 130 * k, borderRadius: 16 * k, background: "rgba(0,0,0,.6)" }} />
      <NameClub d={d} top={footT + 20 * k} clubColor={t.glow} />
    </Page>
  );
}

/* ================= 10 · W/D/L pill (result) — Pinterest "37 | 10 FINAL" college finals ================= */

/**
 * Resultado · V/E/D (result): his real photo with its own surroundings filling the top; a dark score panel below with a
 * club-colour WIN / DRAW / LOSS pill (from the score for his club), the score as two big numerals split by a rule with
 * a crest over each, the exact names, and the competition.
 */
export function Resultprowdl({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const hg = Number(d.content.homeGoals ?? NaN);
  const ag = Number(d.content.awayGoals ?? NaN);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  const us = weAway ? ag : hg;
  const them = weAway ? hg : ag;
  const res = Number.isNaN(us) || Number.isNaN(them) ? "FULL TIME" : us > them ? "WIN" : us < them ? "LOSS" : "DRAW";
  const panelT = H * 0.52;
  const colW = W / 2 - M - 40 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 24 * k * ts, colW, 0.04, 14 * k);
  const an = lines3(fx.awayName.toUpperCase(), 24 * k * ts, colW, 0.04, 14 * k);
  const npx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const g = standAt(d, 540, panelT * 0.36, 150);
  const nPx = 250 * k * ts;
  const side = (crest: string | null, v: string, lines: string[], left: boolean) => (
    <div style={{ position: "absolute", [left ? "left" : "right"]: M, width: colW, top: panelT + 130 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k }}>
      {crest ? <img src={crest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ height: 80 * k }} />}
      <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, color: "#fff" }}>{v}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{lines.map((l, i) => <div key={i} style={{ ...caps(npx, 0.04, 800, "#fff"), textAlign: "center" }}>{l}</div>)}</div>
    </div>
  );
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px ${H - panelT}px 0px)` }}>
        <NatGround place={g} W={W} H={H} />
        <NatFigure data={d} place={g} W={W} H={H} clean />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: panelT, bottom: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.7)}, #0b0c10)`, borderTop: `${6 * k}px solid ${t.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: panelT - 36 * k, display: "flex", justifyContent: "center" }}>
        <div style={{ background: t.ink, borderRadius: 999, padding: `${12 * k}px ${44 * k}px`, border: `${4 * k}px solid #fff`, ...caps(40 * k, 0.3, 900, "#fff") }}>{res}</div>
      </div>
      {side(fx.homeCrest, String(d.content.homeGoals ?? "–"), hn.lines, true)}
      <div style={{ position: "absolute", left: W / 2 - 2 * k, top: panelT + 150 * k, width: 4 * k, height: nPx * 0.9 + 100 * k, background: "rgba(255,255,255,.6)" }} />
      {side(fx.awayCrest, String(d.content.awayGoals ?? "–"), an.lines, false)}
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: lt - 40 * k, textAlign: "center", ...caps(15 * k * ts, 0.3, 700, "rgba(255,255,255,.75)") }}>{comp}</div>}
    </Page>
  );
}

