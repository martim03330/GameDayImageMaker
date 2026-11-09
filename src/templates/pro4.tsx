/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { NAT_GRADE, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { scoreOf } from "./outline";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, frontFeet, nameLines, portraitOf, secondShot, shotFeet, vsLines } from "./prokit";

/* Round 33 · new pro families, part 2. */

const W = CANVAS_W;

/* ================= 6 · Duo (matchday) — Pinterest "Aston Villa" trio, "Napoli v Milan" pair ================= */

/**
 * Dupla (matchday): two photos of him side by side on a deep club-colour ground — his second photo full-body on the
 * left, a step back and a little darker, the chosen one full-body in front on the right — with a giant MATCHDAY behind
 * both; crests "vs" at the top, HOME X AWAY, date · ground and the flags clock at the foot. Without a second photo the
 * left figure is his big black-and-white portrait.
 */
export function Produo({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const two = secondShot(d);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const vs = vsLines(d, 26 * k * ts, W - 2 * M, 16 * k);
  const dv = dateVenue(d);
  const footH = vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 16 * k + 28 * k * ts;
  const footTop = lt - 40 * k - footH;
  const wPx = Math.min(330 * k, (H * 0.4) / 0.82, (W - 2 * M) / Math.max(0.1, wordW("MATCH", 1)));
  const p = frontFeet(d, 680, footTop + 30 * k, 1150 * k / 1.3);
  const b2 = two ? shotFeet(two, 330, footTop - 40 * k, 1050 * k / 1.3) : null;
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.05)}, ${shade(t.ink, -0.65)})` }} />
      {["MATCH", "DAY"].map((w, i) => (
        <div key={w} style={{ position: "absolute", left: 0, right: 0, top: top + 120 * k + i * wPx * 0.86, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "rgba(255,255,255,.14)", whiteSpace: "nowrap" }}>{w}</div>
      ))}
      {two && b2 ? (
        <img src={two.url} alt="" style={{ position: "absolute", left: b2.left, top: b2.top, width: b2.width, height: b2.height, maxWidth: "none", filter: `${NAT_GRADE} brightness(.82) saturate(.85) drop-shadow(0 18px 30px rgba(0,0,0,.5))` }} />
      ) : (
        s && <Portrait s={s} cx={W * 0.3} cy={top + 420 * k} fh={260 * k} mode="bw" opacity={0.85} fade={35} />
      )}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", alignItems: "center", gap: 24 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 76 * k, width: 76 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ fontFamily: DISPLAY, fontSize: 30 * k, color: "#fff" }}>VS</div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 76 * k, width: 76 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 60 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.6) 40%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        {dv && <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dv}</div>}
        <div style={{ height: 16 * k }} />
        <FlagClock d={d} px={28 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 7 · Scoreboard with portrait (result) — Pinterest "Juventus 3–2 AC Milan FULL-TIME" ================= */

/**
 * Resultado · placar com retrato (result): a big black-and-white portrait of him filling the top on a dark ground,
 * FULL-TIME in tall condensed white over it; him full-body and in colour in front; a scoreboard band at the foot — home
 * crest and exact name, the score in a club-colour box, away name and crest — and the competition under it.
 */
export function Resultproboard({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const score = scoreOf(d, " – ") || "FT";
  const word = "FULL-TIME";
  const wPx = Math.min(240 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const bandH = 150 * k;
  const bandTop = lt - 90 * k - bandH;
  const sideW = (W - 2 * M - 220 * k) / 2;
  const hn = lines3(fx.homeName.toUpperCase(), 22 * k * ts, sideW - 80 * k, 0.04, 14 * k);
  const an = lines3(fx.awayName.toUpperCase(), 22 * k * ts, sideW - 80 * k, 0.04, 14 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const p = frontFeet(d, 560, bandTop + 40 * k, 950 * k / 1.3);
  const name = (n: { lines: string[] }, right: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start" }}>
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.04, 900, "#fff"), marginTop: i ? 4 * k : 0 }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg="#0d0f12">
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #2a2c30, #0d0f12 70%)" }} />
      {s && <Portrait s={s} cx={W / 2} cy={top + 380 * k} fh={360 * k} mode="bw" opacity={0.75} fade={30} />}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap", textShadow: "0 8px 30px rgba(0,0,0,.5)" }}>{word}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: bandTop, height: bandH, display: "flex", alignItems: "stretch", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
        <div style={{ width: sideW, background: "rgba(16,18,22,.94)", display: "flex", alignItems: "center", gap: 14 * k, padding: `0 ${16 * k}px` }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain", filter: CREST_HALO }} />}
          {name(hn, false)}
        </div>
        <div style={{ flex: 1, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 96 * k * ts, color: "#fff", whiteSpace: "nowrap" }}>{score}</div>
        <div style={{ width: sideW, background: "rgba(16,18,22,.94)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 * k, padding: `0 ${16 * k}px` }}>
          {name(an, true)}
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
      </div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: bandTop + bandH + 18 * k, textAlign: "center", ...caps(18 * k * ts, 0.24, 700, "rgba(255,255,255,.85)") }}>{comp}</div>}
    </Page>
  );
}

/* ================= 8 · Player-of-the-match card (goal) — liked08 Zanetti, Pinterest award cards ================= */

/**
 * Golo · cartão do jogo (goal): a dark ground lit in the club colour; a tall rounded card with a white frame line — his
 * big colour portrait inside, GOAL and his crest at the card's head, a white name band at its foot (full name, exact
 * club); the same player full-body in front, stepping out of the card.
 */
export function Goalprocard({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const crest = d.club?.crestUrl;
  const cx0 = M + 30 * k;
  const cw = W - 2 * (M + 30 * k);
  const cTop = top + 10 * k;
  const cBot = lt - 60 * k;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(150 * k * ts, (cw - 180 * k) / Math.max(0.1, wordW(word, 1)));
  const nl = nameLines(d, cw - 60 * k, 40 * k, 22 * k);
  const bandH = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k) + 36 * k;
  const p = frontFeet(d, 640, cBot - bandH + 60 * k, 900 * k / 1.3);
  return (
    <Page d={d} bg="#0e1014">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.25)}, #0b0c0f 75%)` }} />
      <div style={{ position: "absolute", left: cx0, top: cTop, width: cw, height: cBot - cTop, borderRadius: 34 * k, overflow: "hidden", background: `linear-gradient(170deg, ${shade(t.ink, 0.12)}, ${shade(t.ink, -0.45)})`, boxShadow: "0 30px 70px rgba(0,0,0,.55)" }}>
        {s && (
          <div style={{ position: "absolute", left: -cx0, top: -cTop, width: W, height: H }}>
            <Portrait s={s} cx={W * 0.42} cy={cTop + 420 * k} fh={300 * k} mode="color" fade={30} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 14 * k, borderRadius: 24 * k, border: `${3 * k}px solid rgba(255,255,255,.85)` }} />
        <div style={{ position: "absolute", left: 40 * k, top: 40 * k, fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,.35)" }}>{word}</div>
        {crest && <img src={crest} alt="" style={{ position: "absolute", right: 40 * k, top: 40 * k, height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: cx0 + 14 * k, width: cw - 28 * k, top: cBot - bandH - 14 * k, height: bandH, background: "#fff", borderRadius: `0 0 ${24 * k}px ${24 * k}px`, display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${30 * k}px`, boxSizing: "border-box" }}>
        {nl.name.lines.map((l, i) => (
          <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#15171b"), marginBottom: 8 * k }}>{l}</div>
        ))}
        {nl.club.lines.map((l, i) => (
          <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.ink), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Surname up the side (matchday) — Pinterest "Matthew GOURLEY" / "Ethan SOUTHARD" senior graphics ================= */

/**
 * Apelido na vertical (matchday): a deep club-colour ground; his surname huge up the left edge (rotated, white) with his
 * first name in a small serif beside it; a big black-and-white portrait of him on the right; the same player full-body
 * and in colour in front; the round, crests, HOME X AWAY, date · ground and the flags clock bottom-right.
 */
export function Pronamevertical({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const first = d.content.lastName ? d.content.firstName || "" : "";
  const len = lt - 40 * k - (top + 20 * k);
  const px = Math.min(260 * k, len / Math.max(0.1, wordW(sur, 1)));
  const cx = M + px * 0.42;
  const cy = top + 20 * k + len / 2;
  const cw = W * 0.5 - M;
  const vs = vsLines(d, 22 * k * ts, cw, 14 * k);
  const dv = lines3(dateVenue(d), 15 * k * ts, cw, 0.1, 11 * k);
  const infoH = 66 * k + 12 * k + 22 * k + vs.lines.length * (vs.px + 6 * k) + dv.lines.length * (dv.px + 6 * k) + 14 * k + 26 * k * ts;
  const p = frontFeet(d, 640, lt + 40 * k, 1300 * k / 1.3);
  const serif: CSSProperties = { fontFamily: DMSERIF, fontStyle: "italic", color: "#fff", whiteSpace: "nowrap" };
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.7)})` }} />
      {s && <Portrait s={s} cx={W * 0.68} cy={top + 360 * k} fh={300 * k} mode="bw" opacity={0.55} fade={35} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
          {sur}
        </text>
        {first && (
          <text x={cx + px * 0.62} y={top + 20 * k + len} textAnchor="start" transform={`rotate(-90 ${cx + px * 0.62} ${top + 20 * k + len})`} style={{ ...serif, fontSize: 48 * k }} fill="#fff">
            {first}
          </text>
        )}
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", right: M, width: cw, top: lt - 40 * k - infoH, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
        <div style={{ display: "flex", gap: 14 * k, height: 66 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 66 * k, width: 66 * k, objectFit: "contain", filter: CREST_HALO }} />
          ))}
        </div>
        <div style={{ height: 12 * k }} />
        <div style={caps(18 * k, 0.24, 800, t.glow)}>{roundTitle(d)}</div>
        <div style={{ height: 8 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{l}</div>
        ))}
        {dv.lines.map((l, i) => (
          <div key={"d" + i} style={{ ...caps(dv.px, 0.1, 600, "rgba(255,255,255,.85)"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 8 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 10 · Portrait in horizontal bands (goal) — Pinterest "Lazio v Milan" sliced portraits ================= */

/**
 * Golo · retrato em faixas (goal): a light ground; a big duotone portrait of him cut into five horizontal bands that
 * slide left and right; GOAL huge in the club colour over the lower bands; the same player full-body and in colour in
 * front; his full name and exact club at the foot.
 */
export function Goalprobands({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const n = 5;
  const gap = 12 * k;
  const bTop = top + 20 * k;
  const bBot = lt - 280 * k;
  const bh = (bBot - bTop - (n - 1) * gap) / n;
  const shift = [-40, 30, -20, 45, -30].map((v) => v * k);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(300 * k * ts, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const nl = nameLines(d, W - 2 * M, 40 * k, 22 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const p = frontFeet(d, 560, lt - nh - 10 * k, 1000 * k / 1.3);
  return (
    <Page d={d} bg="#f1f1ef" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #fbfbfa, #e6e6e3)" }} />
      {s &&
        Array.from({ length: n }, (_, i) => {
          const y = bTop + i * (bh + gap);
          return (
            <div key={i} style={{ position: "absolute", left: M + shift[i], top: y, width: W - 2 * M, height: bh, overflow: "hidden", background: shade(t.ink, -0.35) }}>
              <div style={{ position: "absolute", left: -(M + shift[i]), top: -y, width: W, height: H }}>
                <Portrait s={s} cx={W / 2} cy={bTop + 320 * k} fh={300 * k} mode="duo" tint={t.ink} />
              </div>
            </div>
          );
        })}
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: 0, right: 0, top: bBot - gPx * 0.82 + 30 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: lt - 20 * k - nh, display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,.85)", borderRadius: 14 * k, padding: `${8 * k}px 0` }}>
        {nl.name.lines.map((l, i) => (
          <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#15171b"), marginBottom: 8 * k }}>{l}</div>
        ))}
        {nl.club.lines.map((l, i) => (
          <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.ink), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}
