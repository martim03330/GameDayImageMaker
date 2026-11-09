/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { scoreOf } from "./outline";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, frontFeet, nameLines, portraitOf, vsLines } from "./prokit";
import { seasonOf } from "./pro11";

/* Round 37 · new pro families, part 2. */

const W = CANVAS_W;

/* ================= 5 · Swiss grid (matchday) — Pinterest minimal Swiss posters ================= */

/**
 * Grelha suíça · retrato (matchday): a white ground on a strict grid — a club-colour square top-left holding the round in
 * huge numerals, a black-and-white portrait of him in the right column, thin black rules, the fixture set flush-left in
 * small bold sans on the grid lines, and him full-body in colour stepping in front of the portrait.
 */
export function Proswiss({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const col = (W - 2 * M) / 2;
  const no = matchFacts(d).roundNo || "";
  const sq = col - 10 * k;
  const pTop = top;
  const pH = lt - 100 * k - pTop;
  const rule = (y: number) => <div style={{ position: "absolute", left: M, width: col - 20 * k, top: y, height: 3 * k, background: "#111" }} />;
  const h = lines3(fx.homeName.toUpperCase(), 34 * k * ts, col - 30 * k, 0.02, 16 * k);
  const a = lines3(fx.awayName.toUpperCase(), 34 * k * ts, col - 30 * k, 0.02, 16 * k);
  const nPx = Math.min(h.px, a.px);
  const fy = top + sq + 40 * k;
  const p = frontFeet(d, M + col * 1.35, lt + 50 * k, 1150 * k / 1.3);
  return (
    <Page d={d} bg="#fbfbf9" light>
      <div style={{ position: "absolute", left: M, top, width: sq, height: sq, background: t.ink, display: "flex", alignItems: "flex-end", padding: `${16 * k}px`, boxSizing: "border-box" }}>
        {no ? (
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: Math.min(sq * 0.82, (sq - 32 * k) / Math.max(0.1, no.length * 0.62)), lineHeight: 0.8, color: "#fff", letterSpacing: "-0.04em" }}>{no}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {lines3(roundTitle(d), 60 * k, sq - 40 * k, 0, 24 * k).lines.map((l, i) => (
              <div key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: lines3(roundTitle(d), 60 * k, sq - 40 * k, 0, 24 * k).px, lineHeight: 0.95, color: "#fff", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{l}</div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: M + col + 10 * k, top: pTop, width: col - 10 * k, height: pH, overflow: "hidden", background: "#d8d8d4" }}>
        {s && (
          <div style={{ position: "absolute", left: -(M + col + 10 * k), top: -pTop, width: W, height: H }}>
            <Portrait s={s} cx={M + col * 1.5} cy={pTop + 280 * k} fh={240 * k} mode="bw" />
          </div>
        )}
      </div>
      <Front d={d} p={p} light />
      {rule(fy)}
      <div style={{ position: "absolute", left: M, top: fy + 16 * k, ...caps(14 * k, 0.2, 800, t.ink) }}>{(d.content.kicker || "MATCHDAY").toUpperCase()}</div>
      <div style={{ position: "absolute", left: M, top: fy + 50 * k, width: col - 20 * k, display: "flex", flexDirection: "column" }}>
        {h.lines.map((l, i) => (
          <div key={"h" + i} style={caps(nPx, 0.02, 900, "#111")}>{l}</div>
        ))}
        <div style={{ ...caps(14 * k, 0.3, 800, t.ink), margin: `${10 * k}px 0` }}>VS</div>
        {a.lines.map((l, i) => (
          <div key={"a" + i} style={caps(nPx, 0.02, 900, "#111")}>{l}</div>
        ))}
        <div style={{ height: 24 * k }} />
        <div style={{ height: 3 * k, background: "#111", width: "100%" }} />
        <div style={{ height: 16 * k }} />
        <div style={{ display: "flex", gap: 12 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain" }} />
          ))}
        </div>
        <div style={{ height: 16 * k }} />
        <div style={caps(16 * k * ts, 0.08, 800, "#111")}>{lines3(dateVenue(d), 16 * k * ts, col - 30 * k, 0.08, 11 * k).lines.join(" ")}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#111" gap={8 * k} dir="column" />
      </div>
    </Page>
  );
}

/* ================= 6 · Player card with kit bands (matchday) — Pinterest "Man of the Match" / spotlight cards ================= */

/**
 * Cartão do jogador · faixas (matchday): a dark ground; a tall rounded player card with diagonal bands in his club's
 * colour and accent behind his full figure; his name, shirt number and the season's data rows (games, goals, assists) at
 * the card's foot; the fixture and flags clock above the card.
 */
export function Proplayercard({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const se = seasonOf(d);
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const vs = vsLines(d, 22 * k * ts, W - 2 * M, 14 * k);
  const headH = 60 * k + 12 * k + vs.lines.length * (vs.px + 6 * k) + 10 * k + 24 * k * ts;
  const cTop = top + headH + 30 * k;
  const cBot = lt - 50 * k;
  const cx0 = M + 30 * k;
  const cw = W - 2 * cx0;
  const nl = nameLines(d, cw - 180 * k, 40 * k, 20 * k);
  const dataH = 120 * k;
  const nameH = nl.name.lines.length * (nl.name.px + 6 * k) + 20 * k;
  const p = frontFeet(d, W / 2, cBot - dataH - nameH + 10 * k, (cBot - dataH - nameH - cTop) * 1.02);
  const acc = t.acc === "#ffffff" ? shade(t.ink, 0.35) : t.acc;
  const stats = se.games ? [{ v: se.games, l: "GAMES" }, { v: se.goals, l: "GOALS" }, { v: se.assists, l: "ASSISTS" }] : [];
  return (
    <Page d={d} bg="#0f1115">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${shade(t.ink, -0.45)}, #0b0c0f 75%)` }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 * k, height: 60 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 56 * k, color: "#fff", lineHeight: 1 }}>{roundTitle(d)}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ height: 12 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 4 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
      <div style={{ position: "absolute", left: cx0, top: cTop, width: cw, height: cBot - cTop, borderRadius: 30 * k, overflow: "hidden", background: shade(t.ink, -0.3), boxShadow: "0 30px 70px rgba(0,0,0,.55)" }}>
        <div style={{ position: "absolute", left: -cw * 0.3, top: 0, width: cw * 1.6, height: 140 * k, background: t.ink, transform: "rotate(-28deg)", transformOrigin: "0 0", marginTop: 420 * k }} />
        <div style={{ position: "absolute", left: -cw * 0.3, top: 0, width: cw * 1.6, height: 60 * k, background: acc, transform: "rotate(-28deg)", transformOrigin: "0 0", marginTop: 600 * k }} />
        <div style={{ position: "absolute", left: -cw * 0.3, top: 0, width: cw * 1.6, height: 26 * k, background: "#fff", opacity: 0.8, transform: "rotate(-28deg)", transformOrigin: "0 0", marginTop: 700 * k }} />
        <div style={{ position: "absolute", inset: 14 * k, borderRadius: 22 * k, border: "2px solid rgba(255,255,255,.6)" }} />
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: cx0, width: cw, top: cBot - dataH - nameH, height: nameH + dataH, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.75) 30%)", borderRadius: `0 0 ${30 * k}px ${30 * k}px` }} />
      <div style={{ position: "absolute", left: cx0 + 30 * k, width: cw - 60 * k, top: cBot - dataH - nameH + 10 * k, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
          ))}
        </div>
        {no && <div style={{ fontFamily: DISPLAY, fontSize: 90 * k, lineHeight: 0.9, color: acc }}>{no}</div>}
      </div>
      <div style={{ position: "absolute", left: cx0 + 30 * k, width: cw - 60 * k, top: cBot - dataH + 10 * k, height: dataH - 30 * k, display: "flex", borderTop: "1px solid rgba(255,255,255,.4)" }}>
        {stats.length ? (
          stats.map((s0, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: i ? "1px solid rgba(255,255,255,.25)" : "none" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 48 * k, color: "#fff", lineHeight: 1 }}>{s0.v}</div>
              <div style={caps(13 * k, 0.24, 700, "rgba(255,255,255,.75)")}>{s0.l}</div>
            </div>
          ))
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", ...caps(16 * k, 0.24, 800, "#fff") }}>{lines3(ourClub(d).toUpperCase(), 16 * k, cw - 80 * k, 0.24, 11 * k).lines.join(" ")}</div>
        )}
      </div>
    </Page>
  );
}

/* ================= 7 · Goal with the minute timeline (goal) — Pinterest "86' 90+2'" minute posters ================= */

/**
 * Golo · minuto na linha do tempo (goal): a dark ground; GOAL huge at the top; a match timeline across the canvas —
 * 0', 45', 90' ticks on a thin rule — with a ball marker at the minute of his goal (the minute on record; without one the
 * timeline shows his goals this season as dots); him full-body in front; his name and club at the foot.
 */
export function Goalprotimeline({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(280 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const minStat = d.content.stats?.find((x) => /min/i.test(x.label) && /^\d{1,3}(\+\d)?'?$/.test(String(x.value).trim()));
  const minute = minStat ? parseInt(String(minStat.value), 10) : null;
  const se = seasonOf(d);
  const ty = top + gPx * 0.82 + 70 * k;
  const x0 = M + 20 * k;
  const x1 = W - M - 20 * k;
  const xm = (m: number) => x0 + ((x1 - x0) * Math.min(95, m)) / 95;
  const nl = nameLines(d, W - 2 * M - 120 * k, 36 * k, 20 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const p = frontFeet(d, 540, lt - nh - 40 * k, Math.min(1080 * k / 1.3, lt - nh - 40 * k - ty - 80 * k));
  const dots = minute == null ? Math.min(12, se.goals) : 0;
  return (
    <Page d={d} bg="#0f1115">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${shade(t.ink, -0.35)}, #0b0c0f 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff" }}>{word}</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={ty} x2={x1} y2={ty} stroke="#fff" strokeOpacity={0.6} strokeWidth={3 * k} />
        {[0, 45, 90].map((m) => (
          <g key={m}>
            <line x1={xm(m)} y1={ty - 14 * k} x2={xm(m)} y2={ty + 14 * k} stroke="#fff" strokeWidth={3 * k} />
            <text x={xm(m)} y={ty + 44 * k} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20 * k }} fill="rgba(255,255,255,.75)">
              {m}&apos;
            </text>
          </g>
        ))}
        {minute != null && (
          <g>
            <circle cx={xm(minute)} cy={ty} r={20 * k} fill={t.glow} stroke="#fff" strokeWidth={4 * k} />
            <text x={xm(minute)} y={ty - 34 * k} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: 56 * k }} fill="#fff">
              {minute}&apos;
            </text>
          </g>
        )}
        {Array.from({ length: dots }, (_, i) => (
          <circle key={i} cx={x0 + ((x1 - x0) * (i + 0.5)) / Math.max(dots, 1)} cy={ty} r={11 * k} fill={t.glow} stroke="#fff" strokeWidth={3 * k} />
        ))}
      </svg>
      {minute == null && dots > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: ty - 50 * k, textAlign: "center", ...caps(16 * k * ts, 0.24, 800, "rgba(255,255,255,.85)") }}>{`${se.goals} GOAL${se.goals === 1 ? "" : "S"} THIS SEASON`}</div>}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.glow), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 8 · Serif spotlight portrait (goal) — Pinterest "Man Of the Match Gonçalo Ramos" ================= */

/**
 * Golo · homem do jogo (goal): a deep club-colour ground with a faint diamond lattice of thin lines; "Goal" in a serif
 * italic above, his surname huge in condensed caps under it; him full-body and sharp in front; his crest and exact club
 * at the foot.
 */
export function Goalprostar({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const word = (d.content.kicker || "Goal").toLowerCase();
  const w2 = word.charAt(0).toUpperCase() + word.slice(1);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const sPx = Math.min(200 * k, (W - 2 * M) / Math.max(0.1, wordW(sur, 1)));
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M - 100 * k, 0.18, 13 * k);
  const textBot = top + 120 * k + sPx * 0.82;
  const p = frontFeet(d, 560, lt - 60 * k, Math.min(1250 * k / 1.3, (lt - 60 * k - textBot - 20 * k) / 0.95));
  const step = 120 * k;
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.7)} 80%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        {Array.from({ length: Math.ceil((W + H) / step) }, (_, i) => (
          <g key={i}>
            <line x1={i * step - H} y1={0} x2={i * step} y2={H} stroke="#fff" strokeWidth={1.5 * k} />
            <line x1={i * step} y1={0} x2={i * step - H} y2={H} stroke="#fff" strokeWidth={1.5 * k} />
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: 120 * k, lineHeight: 1, color: "#fff" }}>{w2}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 120 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap" }}>{sur}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 70 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 52 * k, width: 52 * k, objectFit: "contain", filter: CREST_HALO }} />}
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.18, 800, "#fff")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Result with the scorers (result) — Pinterest "Final Score" scorer lists ================= */

/**
 * Resultado · marcadores (result): his photo-backed result card — a club-colour ground, FULL TIME tracked, both crests
 * either side of the score huge, the clubs' exact names under them, and his line (goals / assists in this game, when on
 * record) as a scorer row with a ball icon-free label; him full-body on the right.
 */
export function Resultproscorers({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const score = scoreOf(d, " – ") || "FT";
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const g = d.content.stats?.find((x) => /^goals?$/i.test(x.label.trim()));
  const a = d.content.stats?.find((x) => /^assists?$/i.test(x.label.trim()));
  const line = [g && Number(g.value) > 0 ? `${g.value} ${Number(g.value) === 1 ? "GOAL" : "GOALS"}` : "", a && Number(a.value) > 0 ? `${a.value} ${Number(a.value) === 1 ? "ASSIST" : "ASSISTS"}` : ""].filter(Boolean).join(" · ");
  const colW = W * 0.5 - M;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW / 2 - 10 * k, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW / 2 - 10 * k, 0.04, 12 * k);
  const nPx = Math.min(hn.px, an.px);
  const p = frontFeet(d, 790, lt + 60 * k, 1300 * k / 1.3);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const team = (c: string | null, n: { lines: string[] }) => (
    <div style={{ width: colW / 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {c && <img src={c} alt="" style={{ height: 90 * k, width: 90 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.04, 800, "#fff"), marginTop: i ? 4 * k : 10 * k, textAlign: "center" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, 0.08)}, ${shade(t.ink, -0.5)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, width: colW, display: "flex", flexDirection: "column" }}>
        <div style={caps(20 * k, 0.4, 800, "rgba(255,255,255,.85)")}>FULL TIME</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 230 * k * ts, lineHeight: 0.9, color: "#fff", marginTop: 10 * k, whiteSpace: "nowrap" }}>{score}</div>
        <div style={{ display: "flex", marginTop: 20 * k }}>
          {team(fx.homeCrest, hn)}
          {team(fx.awayCrest, an)}
        </div>
        {line && (
          <div style={{ marginTop: 40 * k, borderTop: "2px solid rgba(255,255,255,.5)", paddingTop: 16 * k }}>
            <div style={caps(14 * k, 0.3, 700, "rgba(255,255,255,.75)")}>HIS GAME</div>
            <div style={{ ...caps(26 * k * ts, 0.02, 900, "#fff"), marginTop: 8 * k }}>{lines3(name, 26 * k * ts, colW, 0.02, 15 * k).lines.join(" ")}</div>
            <div style={{ ...caps(22 * k * ts, 0.1, 800, t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.35)), marginTop: 8 * k }}>{line}</div>
          </div>
        )}
      </div>
      {comp && <div style={{ position: "absolute", left: M, top: lt - 50 * k, ...caps(16 * k * ts, 0.24, 700, "rgba(255,255,255,.85)") }}>{comp}</div>}
    </Page>
  );
}

