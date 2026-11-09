/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { DMSERIF } from "./fx";
import { NatFigure, NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { scoreOf } from "./outline";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { standAt, wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, Portrait, caps, frontFeet, nameLines, portraitOf } from "./prokit";

/* Round 38 · new pro families, part 2 (Pinterest "soccer result graphic instagram", "football goal poster typography"). */

const W = CANVAS_W;

/* ================= 7 · Quote marks (goal) — Pinterest quote-mark celebration posters ================= */

/**
 * Golo · aspas (goal): a light ground; two giant quotation marks in the club colour framing GOAL in a bold serif — a
 * quote of the moment; him full-body in front; his full name and exact club as the attribution line ("— NAME") at the foot.
 */
export function Goalproquote({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const word = (d.content.kicker || "Goal").toUpperCase() + "!";
  const gPx = Math.min(240 * k, (W - 2 * M - 240 * k) / Math.max(0.1, word.length * 0.62));
  const nl = nameLines(d, W - 2 * M - 120 * k, 34 * k, 18 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const wy = top + 120 * k;
  const p = frontFeet(d, 560, lt - nh - 40 * k, Math.min(1150 * k / 1.3, lt - nh - 40 * k - (wy + gPx) + 40 * k));
  return (
    <Page d={d} bg="#f4f2ec" light>
      <div style={{ position: "absolute", left: M - 10 * k, top: top - 40 * k, fontFamily: DMSERIF, fontSize: 420 * k, lineHeight: 1, color: t.ink }}>&ldquo;</div>
      <div style={{ position: "absolute", right: M - 10 * k, top: wy + gPx * 0.2, fontFamily: DMSERIF, fontSize: 420 * k, lineHeight: 1, color: t.ink }}>&rdquo;</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wy, textAlign: "center", fontFamily: DMSERIF, fontSize: gPx, lineHeight: 1, color: "#111" }}>{word}</div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k, background: "rgba(255,255,255,.9)", borderRadius: 14 * k, padding: `${10 * k}px 0` }}>
        {crest && <img src={crest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain" }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#111"), marginBottom: 6 * k }}>{i === 0 ? `— ${l}` : l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px * 0.85, 0.16, 700, t.ink), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 8 · Sticker-free badge stack (goal) — Pinterest "GOAL GOAL GOAL" Liverpool stack ================= */

/**
 * Golo · eco vertical (goal): a club-colour ground; GOAL repeated four times in a tall stack down the left — solid,
 * then three outline echoes fading out — his big colour portrait on the right; his surname in a white box and exact club
 * at the foot.
 */
export function Goalprostack({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = Math.min(260 * k, (W * 0.62) / Math.max(0.1, wordW(word, 1)));
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M, 0.18, 13 * k);
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.5)})` }} />
      {s && <Portrait s={s} cx={W * 0.66} cy={top + 560 * k} fh={360 * k} mode="color" fade={25} />}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: M, top: top + i * px * 0.86, fontFamily: DISPLAY, fontSize: px, lineHeight: 0.82, whiteSpace: "nowrap", color: i ? "transparent" : "#fff", WebkitTextStroke: i ? `${3 * k}px rgba(255,255,255,${0.75 - i * 0.18})` : undefined }}>{word}</div>
      ))}
      <div style={{ position: "absolute", left: M, top: lt - 180 * k, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 * k }}>
        <div style={{ background: "#fff", color: "#111", fontFamily: DISPLAY, fontSize: 76 * k, lineHeight: 1, padding: `${6 * k}px ${16 * k}px` }}>{sur}</div>
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.18, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Serif italic surname (goal) — Pinterest "Metz AJACCIO" serif ================= */

/**
 * Golo · serifa itálica (goal): his real photo graded dark; GOAL tracked small at the top and his surname huge in a thin
 * serif italic across the upper canvas, behind him; him sharp; his crest and exact club at the foot.
 */
export function Goalproitalic({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const p = standAt(d, 540, 1180, 175);
  const crest = d.club?.crestUrl;
  const sur = d.content.lastName || d.content.firstName || "";
  const sPx = Math.min(240 * k, (W - 2 * M) / Math.max(0.1, sur.length * 0.48));
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M - 80 * k, 0.18, 13 * k);
  // Above his head when it fits there; on a tight crop (head high) it drops to the foot, over his legs, above the club.
  const headTop = p.fy + (p.nudge?.y ?? 0) - p.fs * 1.5;
  const surTop = top + 50 * k + sPx * 1.05 < headTop - 10 * k ? top + 50 * k : lt - 110 * k - sPx;
  return (
    <Page d={d} bg="#0e1014">
      <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.1) brightness(.6) saturate(.9)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(t.ink, -0.6)}dd, ${shade(t.ink, -0.6)}22 50%, rgba(0,0,0,.6))` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(24 * k, 0.6, 800, "#fff") }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: surTop, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: sPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap", textShadow: "0 6px 24px rgba(0,0,0,.5)" }}>{sur}</div>
      <NatFigure data={d} place={p} W={W} H={H} clean />
      {surTop > top + 50 * k && <div style={{ position: "absolute", left: 0, right: 0, top: surTop, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: sPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap", textShadow: "0 6px 24px rgba(0,0,0,.6)" }}>{sur}</div>}
      <div style={{ position: "absolute", left: M, right: M, top: lt - 80 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.18, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 10 · W / L / D badge (result) — Pinterest "Win" / "Victoire" results ================= */

/**
 * Resultado · letra gigante (result): a giant W, D or L (win, draw, loss for his club, from the score) in the club
 * colour as an outlined letter behind him; him full-body in front; the score and both crests with exact names in a
 * band at the foot; the competition under it.
 */
export function Resultproletter({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const hg = Number(d.content.homeGoals ?? NaN);
  const ag = Number(d.content.awayGoals ?? NaN);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  const us = weAway ? ag : hg;
  const them = weAway ? hg : ag;
  const letter = Number.isNaN(us) || Number.isNaN(them) ? "FT" : us > them ? "W" : us < them ? "L" : "D";
  const word = letter === "W" ? "WIN" : letter === "L" ? "LOSS" : letter === "D" ? "DRAW" : "FULL TIME";
  const px = Math.min(1050 * k, (W - 2 * M) / Math.max(0.1, wordW(letter, 1)));
  const bandH = 150 * k;
  const bandTop = lt - 80 * k - bandH;
  const p = frontFeet(d, 560, bandTop + 40 * k, 1150 * k / 1.3);
  const score = scoreOf(d, " – ") || "";
  const sideW = (W - 2 * M - 220 * k) / 2;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, sideW - 80 * k, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, sideW - 80 * k, 0.04, 12 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  return (
    <Page d={d} bg="#0f1115">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.4)}, #0b0c0f 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 20 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.8, color: t.ink, whiteSpace: "nowrap" }}>{letter}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(26 * k, 0.6, 800, "#fff") }}>{word}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: bandTop, height: bandH, display: "flex", alignItems: "stretch", boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>
        <div style={{ width: sideW, background: "rgba(14,16,20,.94)", display: "flex", alignItems: "center", gap: 12 * k, padding: `0 ${14 * k}px` }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ display: "flex", flexDirection: "column" }}>{hn.lines.map((l, i) => <div key={i} style={caps(nPx, 0.04, 900, "#fff")}>{l}</div>)}</div>
        </div>
        <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 84 * k * ts, color: "#111", whiteSpace: "nowrap" }}>{score}</div>
        <div style={{ width: sideW, background: "rgba(14,16,20,.94)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 * k, padding: `0 ${14 * k}px` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>{an.lines.map((l, i) => <div key={i} style={caps(nPx, 0.04, 900, "#fff")}>{l}</div>)}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
      </div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: bandTop + bandH + 16 * k, textAlign: "center", ...caps(16 * k * ts, 0.24, 700, "rgba(255,255,255,.85)") }}>{comp}</div>}
    </Page>
  );
}

