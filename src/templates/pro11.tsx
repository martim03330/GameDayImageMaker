/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { isoFromShortDate } from "@/lib/timezone";
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, frontFeet, nameLines, portraitOf, vsLines, type FrontPlace } from "./prokit";

/* Round 37 · new pro families (Pinterest "matchday graphic bundesliga", "player spotlight graphic football", "derby day poster"). */

const W = CANVAS_W;

/** His season on record up to this edit's date: games, goals, assists. */
export function seasonOf(d: RenderData) {
  const iso = isoFromShortDate(d.content.date) ?? new Date().toISOString().slice(0, 10);
  const ms = d.matches.filter((m) => m.date <= iso);
  return { games: ms.length, goals: ms.reduce((a, m) => a + (m.goals || 0), 0), assists: ms.reduce((a, m) => a + (m.assists || 0), 0) };
}

/* ================= 1 · Stat hero (matchday) — Pinterest player-spotlight stat posters ================= */

/**
 * Estatística em destaque (matchday): a deep club-colour ground; his big colour portrait on the right; his season so far
 * as a stat hero on the left — goals huge, assists and games under it with labels and hairlines; MATCHDAY, crests,
 * HOME X AWAY and the flags clock at the foot. With no games on record it shows his shirt number instead.
 */
export function Prostathero({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const se = seasonOf(d);
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const rows = se.games ? [{ v: se.goals, l: se.goals === 1 ? "GOAL" : "GOALS", big: true }, { v: se.assists, l: se.assists === 1 ? "ASSIST" : "ASSISTS" }, { v: se.games, l: se.games === 1 ? "GAME" : "GAMES" }] : no ? [{ v: no, l: "SHIRT", big: true }] : [];
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const footH = 80 * k + 14 * k + vs.lines.length * (vs.px + 6 * k) + 12 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.72)})` }} />
      {s && <Portrait s={s} cx={W * 0.66} cy={top + 400 * k} fh={360 * k} mode="color" fade={35} />}
      <div style={{ position: "absolute", left: M, top, ...caps(18 * k, 0.32, 800, "rgba(255,255,255,.8)") }}>SEASON SO FAR</div>
      <div style={{ position: "absolute", left: M, top: top + 50 * k, width: W * 0.42, display: "flex", flexDirection: "column" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid rgba(255,255,255,.35)" : "none", padding: `${14 * k}px 0` }}>
            <div style={{ fontFamily: DISPLAY, fontSize: r.big ? 300 * k : 120 * k, lineHeight: 0.86, color: "#fff" }}>{r.v}</div>
            <div style={caps(r.big ? 30 * k : 22 * k, 0.24, 800, t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.3))}>{r.l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 80 * k, bottom: 0, background: `linear-gradient(to bottom, transparent, ${shade(t.ink, -0.75)} 35%)` }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 * k, height: 80 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 70 * k, color: "#fff", lineHeight: 1 }}>MATCHDAY</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ height: 14 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 2 · Club initial (matchday) — Pinterest Bundesliga "B" / "S" initial posters ================= */

const PREFIX = /^(SC|FC|CF|CD|SL|AC|AS|SD|UD|CS|SK|FK|NK|SV|VFB|VFL|TSV|AFC|CA|AL|EL|LA|LE|DE|THE|UNIVERSITY|DESP\.?|EST\.?)$/i;
const fitCapsK = (s0: string, max: number, w: number) => Math.min(max, w / Math.max(1, s0.length * (0.68 + 0.3)));
const clubInitial = (d: RenderData) => {
  const words = ourClub(d).split(/\s+/).filter(Boolean);
  const w = words.find((x) => x.length > 2 && !PREFIX.test(x)) ?? words[0] ?? "";
  return (w.normalize("NFD").replace(/\p{M}/gu, "").match(/[A-Za-z]/)?.[0] ?? "").toUpperCase();
};

/**
 * Inicial do clube (matchday): an off-white ground; his club's initial letter giant in a bold serif in the club colour,
 * filling the canvas behind him; him full-body in front, sharp; the club's exact name small under the letter, MATCHDAY
 * and the fixture in a white card at the foot with the flags clock.
 */
export function Proinitial({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const letter = clubInitial(d) || "M";
  const px = 1250 * k;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const cardH = 40 * k + 50 * k + 12 * k + vs.lines.length * (vs.px + 6 * k) + 12 * k + 26 * k * ts;
  const cardTop = lt - 40 * k - cardH;
  const p = frontFeet(d, 560, cardTop + 30 * k, 1180 * k / 1.3);
  const club = ourClub(d).toUpperCase();
  return (
    <Page d={d} bg="#f4f2ec" light>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 120 * k, textAlign: "center", fontFamily: DMSERIF, fontSize: px, lineHeight: 0.8, color: t.ink, whiteSpace: "nowrap" }}>{letter}</div>
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", gap: 6 * k }}>
        <div style={caps(fitCapsK(club, 16 * k, W - 2 * M), 0.3, 800, "#111")}>{club}</div>
        <div style={caps(14 * k, 0.3, 700, t.ink)}>{roundTitle(d)}</div>
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: cardTop - 16 * k, height: cardH + 26 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.94)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: cardTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 * k, height: 50 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 50 * k, width: 50 * k, objectFit: "contain" }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 46 * k, color: t.ink, lineHeight: 1 }}>MATCHDAY</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 50 * k, width: 50 * k, objectFit: "contain" }} />}
        </div>
        <div style={{ height: 12 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#111"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#111" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Long shadow (matchday + goal) — Pinterest studio spotlight posters ================= */

/**
 * His long flat shadow on the floor: his own cut-out silhouette (a solid shape — never a blur of him) laid down along
 * the floor plane from his feet towards the back-right (flattened, sheared), and faded with a gradient so it is darkest
 * at his feet and dissolves at its tip. A soft contact shadow sits under his feet.
 */
function LongShadow({ p, color }: { p: FrontPlace; color: string }) {
  if (!p.img || !p.shot) return null;
  const { left, top, width, height } = p.img;
  const feet = top + height;
  const id = "ls-" + Math.round(left);
  // Flatten to a third of his height and shear it far to the right: a low evening light from the front-left.
  const sy = 0.34;
  const shear = 1.9;
  return (
    <svg width={CANVAS_W} height={feet + height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1={left + width / 2} y1={feet} x2={left + width / 2 + height * sy * shear} y2={feet - height * sy}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.6" stopColor="#fff" stopOpacity={0.45} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W * 3} height={feet + height}>
          <rect x={-CANVAS_W} y={0} width={CANVAS_W * 4} height={feet + height} fill={`url(#${id}-g)`} />
        </mask>
        <filter id={`${id}-sil`}>
          <feFlood floodColor={color} />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <radialGradient id={`${id}-c`}>
          <stop offset="0" stopColor={color} stopOpacity={0.55} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g mask={`url(#${id}-m)`} opacity={0.62}>
        {/* matrix(a b c d e f): x' = x + shear·(feet − y)·sy, y' = feet − (feet − y)·sy  — the figure laid on the floor. */}
        <g transform={`matrix(1 0 ${-shear * sy} ${sy} ${shear * sy * feet} ${feet * (1 - sy)})`}>
          <image href={p.shot.url} x={left} y={top} width={width} height={height} preserveAspectRatio="none" filter={`url(#${id}-sil)`} />
        </g>
      </g>
      <ellipse cx={left + width * 0.5} cy={feet - 6} rx={width * 0.32} ry={height * 0.018 + 6} fill={`url(#${id}-c)`} />
    </svg>
  );
}

function ShadowStage({ d, children }: { d: RenderData; children: (p: FrontPlace) => ReactNode }) {
  const { H, k } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const p = frontFeet(d, 330, lt - 200 * k, 1000 * k / 1.3);
  return (
    <Page d={d} bg="#ece9e1" light>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #f7f5ef 0%, #ebe7dc 62%, ${shade(t.ink, 0.6)} 62%, ${shade(t.ink, 0.45)} 100%)` }} />
      <LongShadow p={p} color={shade(t.ink, -0.4)} />
      <Front d={d} p={p} light />
      {children(p)}
    </Page>
  );
}

/** Sombra longa (matchday): a studio set — warm paper wall and a club-tinted floor — him full-body with a long flat shadow cast across the floor; MATCHDAY stacked on the right wall with crests, HOME X AWAY and the flags clock. */
export function Prolongshadow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const cw = W * 0.4;
  const fl = lines3(`${fx.homeName} X ${fx.awayName}`.toUpperCase(), 24 * k * ts, cw, 0.04, 14 * k);
  return (
    <ShadowStage d={d}>
      {() => (
        <div style={{ position: "absolute", right: M, top: top + 20 * k, width: cw, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 150 * k, lineHeight: 0.84, color: t.ink }}>
            MATCH
            <br />
            DAY
          </div>
          <div style={{ display: "flex", gap: 12 * k, margin: `${18 * k}px 0` }}>
            {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
              <img key={i} src={u!} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain" }} />
            ))}
          </div>
          {fl.lines.map((l, i) => (
            <div key={i} style={{ ...caps(fl.px, 0.04, 900, "#111"), marginBottom: 6 * k }}>{l}</div>
          ))}
          <div style={{ ...caps(16 * k * ts, 0.14, 700, t.ink), margin: `${8 * k}px 0 ${14 * k}px` }}>{dateVenue(d)}</div>
          <FlagClock d={d} px={24 * k * ts} color="#111" gap={8 * k} dir="column" />
        </div>
      )}
    </ShadowStage>
  );
}

/** Golo · sombra longa (goal): the studio set with his long shadow; GOAL stacked on the right wall with his crest, full name and exact club. */
export function Goalprolongshadow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, top } = frameOf(d);
  const t = tones(d);
  const crest = d.club?.crestUrl;
  const nl = nameLines(d, W * 0.4, 34 * k, 18 * k);
  return (
    <ShadowStage d={d}>
      {() => (
        <div style={{ position: "absolute", right: M, top: top + 20 * k, width: W * 0.4, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 220 * k, lineHeight: 0.84, color: t.ink }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
          {crest && <img src={crest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", margin: `${18 * k}px 0` }} />}
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#111"), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px * 0.85, 0.16, 700, t.ink), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      )}
    </ShadowStage>
  );
}

/* ================= 4 · Rivalry diagonal (matchday) — Pinterest derby posters ================= */

/**
 * Rivalidade · diagonal (matchday): the canvas split on a steep diagonal — his club's colour on his side, charcoal on the
 * opponent's — each half with its crest huge and ghosted; a white VS band along the split; him full-body in front across
 * it; MATCHDAY at the top, HOME X AWAY, date · ground and the flags clock at the foot.
 */
export function Prorivalry({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const ourHome = d.content.home !== false;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const footH = vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 14 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  const p = frontFeet(d, 540, footTop + 20 * k, 1150 * k / 1.3);
  const leftC = ourHome ? t.ink : "#26292f";
  const rightC = ourHome ? "#26292f" : t.ink;
  const cs = 560 * k;
  const wPx = Math.min(150 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  return (
    <Page d={d} bg="#16181c">
      <div style={{ position: "absolute", inset: 0, background: leftC, clipPath: `polygon(0 0, 62% 0, 38% 100%, 0 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: rightC, clipPath: `polygon(62% 0, 100% 0, 100% 100%, 38% 100%)` }} />
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: -cs * 0.25, top: H * 0.22, width: cs, height: cs, objectFit: "contain", opacity: 0.22 }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", right: -cs * 0.25, top: H * 0.38, width: cs, height: cs, objectFit: "contain", opacity: 0.22 }} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={W * 0.62} y1={0} x2={W * 0.38} y2={H} stroke="#fff" strokeWidth={12 * k} />
      </svg>
      <div style={{ position: "absolute", left: W / 2 - 50 * k, top: H * 0.5 - 50 * k, width: 100 * k, height: 100 * k, borderRadius: "50%", background: "#fff", color: "#111", fontFamily: DISPLAY, fontSize: 46 * k, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>VS</div>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff" }}>MATCHDAY</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 60 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.72) 35%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

