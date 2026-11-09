/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { NAT_SERIF, serifEm } from "./natserif";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData, type RenderMatch } from "./types";

/** DM Serif Display: cap height and descender (em). */
const CAP = 0.7;
const DESC = 0.24;
const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.45)";

/** His form over the last N games, from data.matches (newest first). */
export function formOf(data: RenderData) {
  const n = Math.max(1, Math.round(data.params.formGames ?? 6));
  const recent = data.matches.slice(0, n);
  const games = recent.length;
  const sum = (f: (m: RenderMatch) => number) => recent.reduce((s, m) => s + f(m), 0);
  const goals = sum((m) => m.goals);
  const assists = sum((m) => m.assists);
  const minutes = sum((m) => m.minutes);
  const wins = recent.filter((m) => m.goalsFor > m.goalsAgainst).length;
  const draws = recent.filter((m) => m.goalsFor === m.goalsAgainst).length;
  const losses = games - wins - draws;
  let unbeaten = 0;
  for (const m of recent) {
    if (m.goalsFor < m.goalsAgainst) break;
    unbeaten++;
  }
  const ga = goals + assists;
  const perMatch = games ? (ga / games).toFixed(1) : "0.0";
  const minPer = ga ? Math.round(minutes / ga) : 0;
  return { games, goals, assists, ga, perMatch, minutes, wins, draws, losses, unbeaten, minPer, recent };
}

/** A serif word / number set on its baseline, white with the natural looks' soft double shadow. */
function Serif({ text, size, x, baseline, id, color = "#ffffff", anchor = "start" }: { text: string; size: number; x: number; baseline: number; id: string; color?: string; anchor?: "start" | "end" }) {
  return (
    <svg width={CANVAS_W} height={size * 1.4} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={id} x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.34" result="tight" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.38" />
        </filter>
      </defs>
      <text x={x} y={size} textAnchor={anchor} filter={`url(#${id})`} style={{ fontFamily: NAT_SERIF, fontWeight: 400, fontSize: size, letterSpacing: "-0.01em", fill: color }}>
        {text}
      </text>
    </svg>
  );
}

type Caps = { text: string; size: number; weight?: number; tracking?: number; color?: string; opacity?: number; maxW: number };
function capsPx(c: Caps): number {
  return Math.min(c.size, c.maxW / Math.max(1, capsEm(c.text, c.tracking ?? 0.18)));
}
function CapsLine({ c, left, top, align = "left", width }: { c: Caps; left: number; top: number; align?: "left" | "right" | "center"; width?: number }) {
  const px = capsPx(c);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        textAlign: align,
        fontFamily: SANS,
        fontWeight: c.weight ?? 700,
        fontSize: px,
        lineHeight: 1,
        letterSpacing: `${c.tracking ?? 0.18}em`,
        whiteSpace: "nowrap",
        color: c.color ?? OFF_WHITE,
        opacity: c.opacity ?? 1,
        textShadow: SMALL_SHADOW,
      }}
    >
      {c.text}
    </div>
  );
}

/**
 * Form carousel · natural (3 slides, params.slide): his own match photo almost untouched (real grass and
 * light, face sharp), an elegant DM Serif headline and small clean sans info, a soft local shade only where
 * type sits. Same header (name · topic · LAST 6 GAMES) and the NEYOD logo at the foot on every slide.
 * 1 "In form." + name + key line · 2 the record: "6 unbeaten." and the six results · 3 the numbers in a calm grid.
 */
export function Formnatural({ data }: { data: RenderData }) {
  const { params } = data;
  const slide = params.slide ?? 1;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 72 : 66;
  const W = CANVAS_W;
  const maxW = W - 2 * M;
  const ty = params.textY ?? 0;
  const f = formOf(data);
  const sid = `fn${slide}${story ? "s" : ""}`;

  // The club colour, used sparingly (header topic, one figure): kept light enough to read over the photo.
  let acc = vivid(params.primary === "#10131c" || luminance(params.accent ?? "#888888") > luminance(params.primary ?? "#000000") ? params.accent ?? "#2c88dd" : params.primary ?? "#2c88dd");
  if (luminance(acc) > 0.8) acc = "#e9d9a8";
  for (let i = 0; i < 4 && luminance(acc) < 0.32; i++) acc = shade(acc, 0.22);

  const first = (data.content.firstName || "").trim();
  const last = (data.content.lastName || "").trim();
  const name = `${first} ${last}`.trim().toUpperCase();
  const clubName = (data.club?.name ?? "").trim();
  const lastN = `LAST ${f.games} GAMES`;

  /* ---- frame: header at the top, logo at the foot ---- */
  const headTop = (story ? STORY_TOP + 6 : 58) - ty;
  const headSize = 17 * k * ts;
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (story ? STORY_BOTTOM - logoH : CANVAS_H - 48 - logoH) - (params.logoY ?? 0);
  const blockBottom = logoTop - (story ? 72 : 58) - ty;

  const topic = slide === 1 ? "CURRENT FORM" : slide === 2 ? "THE RECORD" : "THE NUMBERS";
  const third = (maxW - 40) / 3;
  const header = (
    <>
      <CapsLine c={{ text: slide === 1 ? clubName.toUpperCase() : name, size: headSize, tracking: 0.2, maxW: third }} left={M} top={headTop} />
      <CapsLine c={{ text: topic, size: headSize, weight: 800, tracking: 0.22, maxW: third }} left={0} width={W} align="center" top={headTop} />
      <CapsLine c={{ text: lastN, size: headSize, tracking: 0.2, maxW: third }} left={M} width={maxW} align="right" top={headTop} />
    </>
  );

  /* ---- the slide's block (laid out bottom-up from blockBottom), its top decides where his face goes ---- */
  const parts: ReactNode[] = [];
  let blockTop = blockBottom;

  if (slide === 1) {
    const key = [`${f.goals} ${f.goals === 1 ? "GOAL" : "GOALS"}`, `${f.assists} ${f.assists === 1 ? "ASSIST" : "ASSISTS"}`, f.losses === 0 && f.games > 1 ? "UNBEATEN" : `${f.ga} G/A`].join("   ·   ");
    const keyC: Caps = { text: key, size: 21 * k * ts, tracking: 0.2, maxW, opacity: 0.95 };
    const nameC: Caps = { text: name, size: 33 * k * ts, weight: 700, tracking: 0.12, maxW };
    const word = "In form.";
    const size = Math.min((story ? 270 : 212) * ts, (maxW + 8) / serifEm(word));
    const keyTop = blockBottom - capsPx(keyC);
    const ruleTop = keyTop - 26 * k;
    const nameTop = ruleTop - 24 * k - capsPx(nameC);
    const baseline = nameTop - 30 * k - size * DESC * 0.5;
    blockTop = baseline - size * CAP;
    parts.push(
      <Serif key="w" text={word} size={size} x={M - 4} baseline={baseline} id={`${sid}w`} />,
      <CapsLine key="n" c={nameC} left={M} top={nameTop} />,
      <div key="r" style={{ position: "absolute", left: M, top: ruleTop, width: 64 * k, height: 2 * k, background: acc }} />,
      <CapsLine key="k" c={keyC} left={M} top={keyTop} />,
    );
  } else if (slide === 2) {
    const rowH = (story ? 84 : 60) * ts;
    const rows = f.recent;
    const listTop = blockBottom - rows.length * rowH;
    const markD = (story ? 44 : 32) * ts;
    const gaW = (story ? 128 : 96) * ts;
    const scoreW = (story ? 100 : 78) * ts;
    const teamsL = M + markD + 22 * k;
    const teamsW = W - M - gaW - scoreW - 18 * k - teamsL;
    const teamSize = 21 * k * ts;
    const our = clubName;
    rows.forEach((m, i) => {
      const top = listTop + i * rowH;
      const res = m.goalsFor > m.goalsAgainst ? "W" : m.goalsFor === m.goalsAgainst ? "D" : "L";
      const home = m.home ? our : m.opponent;
      const away = m.home ? m.opponent : our;
      const score = m.home ? `${m.goalsFor}–${m.goalsAgainst}` : `${m.goalsAgainst}–${m.goalsFor}`;
      const gaTxt = [m.goals ? `${m.goals}G` : "", m.assists ? `${m.assists}A` : ""].filter(Boolean).join(" ") || "—";
      const line = `${home.toUpperCase()}  v  ${away.toUpperCase()}`;
      const px = Math.min(teamSize, teamsW / Math.max(1, capsEm(line, 0.06)));
      const midY = top + rowH / 2;
      parts.push(
        <div key={`h${i}`} style={{ position: "absolute", left: M, right: M, top, height: 1, background: "rgba(255,255,255,.2)" }} />,
        <div
          key={`m${i}`}
          style={{
            position: "absolute",
            left: M,
            top: midY - markD / 2,
            width: markD,
            height: markD,
            borderRadius: "50%",
            boxSizing: "border-box",
            border: res === "W" ? "none" : `${1.5 * k}px solid rgba(244,241,234,${res === "D" ? 0.85 : 0.45})`,
            background: res === "W" ? OFF_WHITE : "rgba(0,0,0,.12)",
            color: res === "W" ? "#15181c" : OFF_WHITE,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: markD * 0.46,
            lineHeight: `${markD}px`,
            textAlign: "center",
          }}
        >
          {res}
        </div>,
        <div key={`t${i}`} style={{ position: "absolute", left: teamsL, top: midY - px * 0.52, fontFamily: SANS, fontWeight: 600, fontSize: px, lineHeight: 1, letterSpacing: "0.06em", whiteSpace: "nowrap", color: OFF_WHITE, textShadow: SMALL_SHADOW }}>
          {line}
        </div>,
        <div key={`s${i}`} style={{ position: "absolute", left: W - M - gaW - scoreW, width: scoreW, top: midY - teamSize * 0.62, textAlign: "right", fontFamily: SANS, fontWeight: 700, fontSize: teamSize * 1.18, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: OFF_WHITE, textShadow: SMALL_SHADOW }}>
          {score}
        </div>,
        <div key={`g${i}`} style={{ position: "absolute", left: W - M - gaW, width: gaW, top: midY - teamSize * 0.5, textAlign: "right", fontFamily: SANS, fontWeight: 700, fontSize: teamSize * 0.95, lineHeight: 1, letterSpacing: "0.1em", color: gaTxt === "—" ? "rgba(244,241,234,.5)" : acc, textShadow: SMALL_SHADOW }}>
          {gaTxt}
        </div>,
      );
    });
    parts.push(<div key="hl" style={{ position: "absolute", left: M, right: M, top: blockBottom, height: 1, background: "rgba(255,255,255,.2)" }} />);
    const sub: Caps = { text: `${f.wins} ${f.wins === 1 ? "WIN" : "WINS"}   ·   ${f.draws} ${f.draws === 1 ? "DRAW" : "DRAWS"}   ·   ${f.losses} ${f.losses === 1 ? "LOSS" : "LOSSES"}   ·   ${f.minutes} MINUTES`, size: 19 * k * ts, tracking: 0.2, maxW, opacity: 0.92 };
    const subTop = listTop - (story ? 48 : 34) - capsPx(sub);
    const word = f.losses === 0 && f.games > 1 ? `${f.games} unbeaten.` : `${f.wins}W ${f.draws}D ${f.losses}L.`;
    const size = Math.min((story ? 200 : 150) * ts, (maxW + 8) / serifEm(word));
    const baseline = subTop - 22 * k - size * DESC * 0.5;
    blockTop = baseline - size * CAP;
    parts.push(<Serif key="w" text={word} size={size} x={M - 3} baseline={baseline} id={`${sid}w`} />, <CapsLine key="sub" c={sub} left={M} top={subTop} />);
  } else {
    const cells = [
      { v: String(f.goals), l: f.goals === 1 ? "GOAL" : "GOALS" },
      { v: String(f.assists), l: f.assists === 1 ? "ASSIST" : "ASSISTS" },
      { v: String(f.ga), l: "GOAL CONTRIBUTIONS" },
      { v: f.perMatch, l: "G/A PER MATCH", acc: true },
    ];
    const size = (story ? 200 : 150) * ts;
    const labelSize = 18 * k * ts;
    const colW = maxW / 2;
    const foot: Caps = { text: f.minPer ? `${f.minutes} MINUTES   ·   ONE EVERY ${f.minPer}'` : `${f.minutes} MINUTES`, size: 18 * k * ts, tracking: 0.2, maxW, opacity: 0.9 };
    const footTop = blockBottom - capsPx(foot);
    const cellH = size * CAP + 20 * k + labelSize;
    const rowGap = (story ? 64 : 44) * ts;
    const gridBottom = footTop - (story ? 46 : 34);
    const row2Top = gridBottom - cellH;
    const row1Top = row2Top - rowGap - cellH;
    cells.forEach((c, i) => {
      const top = i < 2 ? row1Top : row2Top;
      const left = M + (i % 2) * colW + (i % 2 ? 36 * k : 0);
      const baseline = top + size * CAP;
      parts.push(
        <Serif key={`v${i}`} text={c.v} size={size} x={left - 4} baseline={baseline} id={`${sid}v${i}`} color={c.acc ? acc : "#ffffff"} />,
        <CapsLine key={`l${i}`} c={{ text: c.l, size: labelSize, tracking: 0.2, maxW: colW - 40 * k, opacity: 0.92 }} left={left} top={baseline + 20 * k} />,
      );
    });
    parts.push(
      <div key="hz" style={{ position: "absolute", left: M, right: M, top: row2Top - rowGap / 2, height: 1, background: "rgba(255,255,255,.22)" }} />,
      <div key="vt" style={{ position: "absolute", left: M + colW, top: row1Top - 6 * k, width: 1, height: gridBottom - row1Top + 12 * k, background: "rgba(255,255,255,.22)" }} />,
      <CapsLine key="ft" c={foot} left={M} top={footTop} />,
    );
    blockTop = row1Top;
  }

  /* ---- his photo: face between the header and the block, hair clear of the header ---- */
  const fs = (story ? (slide === 1 ? 220 : 180) : slide === 1 ? 156 : 124) * 1;
  const headBottom = headTop + headSize;
  const room = blockTop - 40 * k;
  let fy = Math.min(room - fs * 0.7, (story ? (slide === 1 ? 700 : 560) : slide === 1 ? 460 : 340));
  fy = Math.max(fy, headBottom + fs * 0.95 + 20);
  const fx0 = params.side === "left" ? 400 : params.side === "right" ? 660 : 640;
  const place = natPlace(data, W, H, { fx: fx0, fy, fs });

  const shadeTop = blockTop - (story ? 300 : 240);
  const strength = slide === 2 ? 0.72 : 0.62;
  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure clean data={data} place={place} W={W} H={H} />}
      {/* Soft local shades only: under the header and under the block + logo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: headBottom + (story ? 230 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.26) 55%, rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: shadeTop,
          bottom: 0,
          background: `linear-gradient(to bottom, rgba(6,8,10,0), rgba(6,8,10,${(strength * 0.72).toFixed(2)}) ${story ? 300 : 240}px, rgba(6,8,10,${strength}) 70%, rgba(6,8,10,${(strength + 0.06).toFixed(2)}))`,
        }}
      />
      {header}
      {parts}
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: (W - logoW) / 2, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}
