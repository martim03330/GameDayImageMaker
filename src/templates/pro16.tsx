/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { scoreOf } from "./outline";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, Portrait, caps, frontFeet, nameLines, portraitOf } from "./prokit";
import { seasonOf } from "./pro11";

/* Round 39 · new pro families, part 2. */

const W = CANVAS_W;

/* ================= 7 · Season goal count (goal) — Pinterest "FIRST NWSL GOAL" ================= */

/**
 * Golo · contagem da época (goal): a light ground; "GOAL" with his season count as an ordinal ("GOAL N.º 6") — the
 * number giant in the club colour, behind him; "FIRST" / "SECOND" spelled out for the first ones; him full-body in front;
 * his full name and exact club at the foot.
 */
export function Goalprocount({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const n = Math.max(1, seasonOf(d).goals);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const ORD = ["FIRST", "SECOND", "THIRD"];
  const lead = n <= 3 ? `${ORD[n - 1]} ${word}` : `${word} NO.`;
  const num = String(n);
  const px = Math.min(820 * k, (W - 2 * M) / Math.max(0.1, wordW(num, 1)));
  const nl = nameLines(d, W - 2 * M - 120 * k, 34 * k, 18 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const p = frontFeet(d, 560, lt - nh - 40 * k, 1100 * k / 1.3);
  const lPx = Math.min(110 * k, (W - 2 * M) / Math.max(0.1, wordW(lead, 1)));
  return (
    <Page d={d} bg="#f3f1ec" light>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: lPx, lineHeight: 0.9, color: "#16181c" }}>{lead}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + lPx + 10 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.8, color: t.ink, whiteSpace: "nowrap" }}>{num}</div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k, background: "rgba(255,255,255,.92)", borderRadius: 14 * k, padding: `${10 * k}px 0` }}>
        {crest && <img src={crest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain" }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#16181c"), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px * 0.85, 0.16, 700, t.ink), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 8 · Diagonal panel (goal) — Pinterest "ACC Offensive Player of the Week" ================= */

/**
 * Golo · painel diagonal (goal): his big colour portrait on the left; a pale club-tinted panel cut diagonally across the
 * top-left with "The goal is…" in a serif italic and his name in condensed caps, GOAL huge; him full-body in front at the
 * right; his crest and exact club at the foot.
 */
export function Goalprodiagonal({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const crest = d.club?.crestUrl;
  const first = d.content.firstName || "";
  const sur = (d.content.lastName || "").toUpperCase();
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(210 * k, (W * 0.6) / Math.max(0.1, wordW(word, 1)));
  const sPx = Math.min(80 * k, (W * 0.55) / Math.max(0.1, wordW(sur, 1)));
  const club = lines3(ourClub(d).toUpperCase(), 18 * k * ts, W - 2 * M - 80 * k, 0.18, 12 * k);
  const p = frontFeet(d, 790, lt - 60 * k, 900 * k / 1.3);
  return (
    <Page d={d} bg={shade(t.ink, -0.3)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, 0.15)}, ${shade(t.ink, -0.4)})` }} />
      {s && <Portrait s={s} cx={W * 0.35} cy={top + 620 * k} fh={360 * k} mode="color" fade={25} />}
      <div style={{ position: "absolute", inset: 0, background: shade(t.ink, 0.82), clipPath: `polygon(0 0, 100% 0, 100% ${top + 140 * k}px, 0 ${top + 560 * k}px)` }} />
      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column" }}>
        {first && <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 50 * k, lineHeight: 1.1, color: t.ink }}>{`The ${word.toLowerCase()} is… ${first}`}</div>}
        {sur && <div style={{ fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.95, color: "#16181c" }}>{sur}</div>}
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.85, color: t.ink, marginTop: 6 * k }}>{word}</div>
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 86 * k, height: 84 * k, borderRadius: 16 * k, background: `${shade(t.ink, -0.6)}e6` }} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 70 * k, display: "flex", alignItems: "center", gap: 14 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 52 * k, width: 52 * k, objectFit: "contain", filter: CREST_HALO }} />}
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.18, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Podium disc (goal) — Pinterest "SEASON OPENER" podium ================= */

/**
 * Golo · pódio (goal): a club-colour ground; GOAL huge at the top; him full-body standing on a round podium disc (a
 * lit ellipse with a club-colour rim and a soft shadow under it); his full name and exact club at the foot.
 */
export function Goalpropodium({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const nl = nameLines(d, W - 2 * M - 120 * k, 34 * k, 18 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const discY = lt - nh - 90 * k;
  const p = frontFeet(d, 540, discY + 10 * k, Math.min(1050 * k / 1.3, discY - (top + gPx * 0.82) - 20 * k));
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 35%, ${shade(t.ink, 0.15)}, ${shade(t.ink, -0.55)} 80%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff" }}>{word}</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={W / 2} cy={discY + 50 * k} rx={330 * k} ry={60 * k} fill="rgba(0,0,0,.35)" />
        <ellipse cx={W / 2} cy={discY + 26 * k} rx={300 * k} ry={56 * k} fill={shade(t.ink, -0.35)} />
        <ellipse cx={W / 2} cy={discY} rx={300 * k} ry={56 * k} fill={shade(t.ink, 0.35)} stroke="#fff" strokeOpacity={0.7} strokeWidth={3 * k} />
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px * 0.85, 0.16, 700, "rgba(255,255,255,.85)"), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 10 · Word filled with the photo (result) — Pinterest "WIN" with players in the letters ================= */

/**
 * Resultado · palavra com foto (result): a dark ground; WIN / DRAW / LOSS (from the score, for his club) huge across the
 * canvas with his original photo showing through the letters; the score and both crests with exact names under it; him
 * full-body in front; the competition at the foot.
 */
export function Resultproword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const cut = d.cutouts.find((c) => c.url === d.photoUrl);
  const photo = d.club?.stadiumImages?.[0] ?? cut?.original ?? null;
  const hg = Number(d.content.homeGoals ?? NaN);
  const ag = Number(d.content.awayGoals ?? NaN);
  const club = ourClub(d).toLowerCase();
  const weAway = d.content.home === false || (d.content.home == null && fx.awayName.toLowerCase() === club);
  const us = weAway ? ag : hg;
  const them = weAway ? hg : ag;
  const word = Number.isNaN(us) || Number.isNaN(them) ? "FINAL" : us > them ? "WIN" : us < them ? "LOSS" : "DRAW";
  const px = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const wy = top + px * 0.8;
  const score = scoreOf(d, "–") || "";
  // Score and teams in a column on the left; he takes the right half, half the canvas tall.
  const colW = W * 0.42 - M;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW - 20 * k, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW - 20 * k, 0.04, 12 * k);
  const nPx = Math.min(hn.px, an.px);
  const p = frontFeet(d, W * 0.7, lt - 30 * k, Math.min(H * 0.6, lt - 30 * k - wy - 10 * k));
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const words = (
    <text x={W / 2} y={wy} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }}>
      {word}
    </text>
  );
  const team = (c: string | null, n: { lines: string[] }) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {c && <img src={c} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.04, 800, "#fff"), marginTop: i ? 4 * k : 8 * k, textAlign: "center" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg="#0e1014">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.4)}, #0b0c0f 75%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="rpw-clip">{words}</clipPath>
        </defs>
        <g fill={t.ink}>{words}</g>
        {photo && <image href={photo} x={0} y={top} width={W} height={px} preserveAspectRatio="xMidYMid slice" clipPath="url(#rpw-clip)" />}
        <g fill="none" stroke="#fff" strokeWidth={3 * k}>
          {words}
        </g>
      </svg>
      <div style={{ position: "absolute", left: M, top: wy + 60 * k, width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 * k }}>
        {team(fx.homeCrest, hn)}
        <div style={{ fontFamily: DISPLAY, fontSize: 150 * k * ts, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{score}</div>
        {team(fx.awayCrest, an)}
      </div>
      <Front d={d} p={p} />
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: lt - 50 * k, textAlign: "center", ...caps(16 * k * ts, 0.24, 700, "rgba(255,255,255,.85)") }}>{comp}</div>}
    </Page>
  );
}
