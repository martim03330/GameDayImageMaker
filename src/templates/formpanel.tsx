/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { brightOnDark, formRecord, formStats, luminance } from "./formfire";
import { NatFigure, NatGround, capsEm, natPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Barlow Condensed caps: cap height (em) and a rough advance per character at 1px (weight 800). */
const CAPH = 0.7;
function condEm(text: string, tracking = 0): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    if (/[MW]/.test(ch)) em += 0.68;
    else if (/[I1]/.test(ch)) em += 0.26;
    else if (/[0-9]/.test(ch)) em += 0.47;
    else if (ch === " ") em += 0.2;
    else if (/[.·:,']/.test(ch)) em += 0.2;
    else if (/[–-]/.test(ch)) em += 0.36;
    else if (/[/]/.test(ch)) em += 0.32;
    else em += 0.48;
    em += tracking;
  }
  return em;
}

function Cond({ text, x, capTop, size, color, weight = 800, tracking = 0, align = "left", style }: { text: string; x: number; capTop: number; size: number; color: string; weight?: number; tracking?: number; align?: "left" | "right" | "center"; style?: CSSProperties }) {
  const pos: CSSProperties = align === "left" ? { left: x } : align === "right" ? { right: CANVAS_W - x } : { left: x, transform: "translateX(-50%)" };
  return (
    <div
      style={{
        position: "absolute",
        // Barlow Condensed in a 1em line box: the cap top sits ~0.15em below the box top.
        top: capTop - size * 0.15,
        ...pos,
        fontFamily: CONDENSED,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: `${tracking}em`,
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

/**
 * Form carousel · club panel: a sports graphic. His match photo fills the upper ~62% (natural, untouched
 * apart from the light grade), a solid panel in the club colour holds the type in Barlow Condensed caps
 * under an accent stripe: 1 "ON A RUN" + the key line, 2 the six games as a strip of columns (result,
 * score, exact opponent, his G/A that game), 3 four big numbers in a row. Header over the photo's top, the
 * NEYOD logo at the panel's foot with the slide counter opposite.
 */
export function Formpanel({ data }: { data: RenderData }) {
  const { params, content } = data;
  const slide = params.slide ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const M = story ? 72 : 60;
  const maxW = CANVAS_W - 2 * M;
  const s = formStats(data);
  const rec = formRecord(s);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = (data.club?.name ?? "").toUpperCase();

  /* ---- colours: the panel in the club's primary, the type white (or ink on a light primary) ---- */
  const panel = params.primary || "#12406b";
  const light = luminance(panel) > 0.45;
  const ink = light ? "#0d0f12" : "#ffffff";
  const soft = light ? "rgba(13,15,18,.68)" : "rgba(255,255,255,.72)";
  const lineC = light ? "rgba(13,15,18,.22)" : "rgba(255,255,255,.22)";
  const acc0 = params.accent || "#ffffff";
  // The accent where it reads on the panel, else white / ink.
  const accOk = Math.abs(luminance(acc0) - luminance(panel)) > 0.18;
  const accent = light ? (accOk ? acc0 : "#0d0f12") : brightOnDark(acc0, Math.max(0.3, luminance(panel) + 0.26));
  const stripe = acc0;

  /* ---- the photo: upper part, his face in its upper half ---- */
  const photoH = Math.round(story ? 1060 : CANVAS_H * 0.62);
  const fs = slide === 2 ? (story ? 150 : 120) : story ? 230 : 170;
  const fx0 = params.side === "left" ? 400 : params.side === "right" ? 680 : 540;
  const fy0 = story ? (slide === 2 ? 470 : 520) : slide === 2 ? 280 : 330;
  const place = natPlace(data, CANVAS_W, photoH, { fx: fx0, fy: fy0, fs });

  const top = (story ? STORY_TOP : 52) - (params.textY ?? 0);
  const hSize = 22 * k * ts;
  const hName = Math.min(hSize, (maxW * 0.6) / Math.max(1, capsEm(name, 0.18)));
  const lastN = `LAST ${s.games} GAMES`;

  /* ---- panel rhythm: stripe, content, footer row (logo left, counter right) ---- */
  const pad = story ? 54 : 44;
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_BOTTOM : CANVAS_H - pad) - logoH - (params.logoY ?? 0);
  const cTop = photoH + 8 + pad;
  const cBottom = logoTop - (story ? 60 : 44);

  let body: React.ReactNode = null;
  if (slide === 1) {
    const head = "ON A RUN";
    const size = Math.min((story ? 250 : 200) * ts, maxW / condEm(head, -0.01));
    const key = `${s.goals} ${s.goals === 1 ? "GOAL" : "GOALS"} · ${s.assists} ${s.assists === 1 ? "ASSIST" : "ASSISTS"} · ${s.wins}W ${s.draws}D ${s.losses}L`;
    const keySize = Math.min(50 * k * ts, maxW / condEm(key, 0.02));
    const kick = `${lastN} · ${club}`;
    const kickSize = Math.min(24 * k * ts, maxW / Math.max(1, capsEm(kick, 0.2)));
    const total = kickSize + 26 * k + size * CAPH + 30 * k + keySize * CAPH;
    const y0 = cTop + Math.max(0, (cBottom - cTop - total) / 2);
    body = (
      <>
        <div style={{ position: "absolute", left: M, top: y0, fontFamily: SANS, fontWeight: 700, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.2em", color: accent, whiteSpace: "nowrap" }}>{kick}</div>
        <Cond text={head} x={M - size * 0.02} capTop={y0 + kickSize + 26 * k} size={size} color={ink} weight={900} tracking={-0.01} />
        <Cond text={key} x={M} capTop={y0 + kickSize + 26 * k + size * CAPH + 30 * k} size={keySize} color={ink} weight={700} tracking={0.02} />
      </>
    );
  } else if (slide === 2) {
    const head = `${rec.big} ${rec.top} ${rec.bottom}`;
    const headSize = Math.min(84 * k * ts, (maxW * 0.7) / condEm(head));
    const mins = `${s.minutes} MIN`;
    const n = Math.max(1, s.list.length);
    const colGap = 10 * k;
    const colW = (maxW - colGap * (n - 1)) / n;
    const chip = 34 * k;
    const score = Math.min(70 * k * ts, (colW - 26) / condEm("8–0"));
    const opp = 19 * k * ts;
    const gaS = 26 * k * ts;
    const stripH = chip + 18 * k + score * CAPH + 18 * k + opp * 2.3 + 14 * k + gaS * CAPH;
    const headTop = cTop;
    const stripTop = Math.max(headTop + headSize * CAPH + 36 * k, cBottom - stripH);
    body = (
      <>
        <Cond text={head} x={M} capTop={headTop} size={headSize} color={ink} weight={900} />
        <Cond text={mins} x={CANVAS_W - M} capTop={headTop + headSize * CAPH - 30 * k * ts * CAPH} size={30 * k * ts} color={accent} weight={700} tracking={0.06} align="right" />
        {s.list.map((g, i) => {
          const left = M + i * (colW + colGap);
          const win = g.result === "W";
          const ga = [g.goals ? `${g.goals}G` : "", g.assists ? `${g.assists}A` : ""].filter(Boolean).join(" ") || "–";
          const oppName = g.opponent.toUpperCase();
          const longest = Math.max(...oppName.split(/\s+/).map((w) => condEm(w, 0.03)));
          const oppPx = Math.min(opp, (colW - 6) / Math.max(1, longest));
          const sc = `${g.gf}–${g.ga}`;
          return (
            <div key={i} style={{ position: "absolute", left, top: stripTop, width: colW, height: stripH, textAlign: "center" }}>
              {i > 0 && <div style={{ position: "absolute", left: -colGap / 2 - 1, top: 0, bottom: 0, width: 2, background: lineC }} />}
              <div
                style={{
                  position: "absolute",
                  left: (colW - chip * 1.9) / 2,
                  top: 0,
                  width: chip * 1.9,
                  height: chip,
                  boxSizing: "border-box",
                  borderRadius: chip / 2,
                  background: win ? stripe : "transparent",
                  border: win ? "none" : `${2 * k}px solid ${g.result === "L" ? soft : ink}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: CONDENSED,
                  fontWeight: 800,
                  fontSize: chip * 0.62,
                  letterSpacing: "0.06em",
                  color: win ? (luminance(stripe) > 0.45 ? "#0d0f12" : "#ffffff") : ink,
                }}
              >
                {g.result}
                <span style={{ opacity: 0.7, marginLeft: 6 * k, fontWeight: 600 }}>{g.home ? "H" : "A"}</span>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: chip + 18 * k - score * 0.15, fontFamily: CONDENSED, fontWeight: 800, fontSize: score, lineHeight: 1, color: ink, whiteSpace: "nowrap" }}>{sc}</div>
              <div
                style={{
                  position: "absolute",
                  left: 2,
                  right: 2,
                  top: chip + 18 * k + score * CAPH + 18 * k,
                  height: opp * 2.3,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  fontFamily: CONDENSED,
                  fontWeight: 600,
                  fontSize: oppPx,
                  lineHeight: 1.12,
                  letterSpacing: "0.03em",
                  color: soft,
                  overflow: "hidden",
                }}
              >
                {oppName}
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: stripH - gaS * CAPH - gaS * 0.15, fontFamily: CONDENSED, fontWeight: 800, fontSize: gaS, lineHeight: 1, letterSpacing: "0.04em", color: g.goals || g.assists ? accent : soft, whiteSpace: "nowrap" }}>
                {ga}
              </div>
            </div>
          );
        })}
      </>
    );
  } else {
    const cells = [
      { v: String(s.goals), l: s.goals === 1 ? "GOAL" : "GOALS" },
      { v: String(s.assists), l: s.assists === 1 ? "ASSIST" : "ASSISTS" },
      { v: String(s.ga), l: "G/A" },
      { v: s.perMatch, l: "PER GAME" },
    ];
    const head = "THE NUMBERS";
    const headSize = Math.min(60 * k * ts, maxW / condEm(head, 0.02));
    const colW = maxW / 4;
    const num = Math.min((story ? 210 : 170) * ts, ...cells.map((c) => (colW - 34) / condEm(c.v)));
    const lab = 26 * k * ts;
    const foot = s.minPerGa ? `${s.minutes} MINUTES · A GOAL CONTRIBUTION EVERY ${s.minPerGa}'` : `${s.minutes} MINUTES`;
    const footSize = Math.min(20 * k * ts, maxW / Math.max(1, capsEm(foot, 0.16)));
    const gridH = num * CAPH + 20 * k + lab * CAPH;
    const footTop = cBottom - footSize;
    const gridTop = Math.max(cTop + headSize * CAPH + 34 * k, footTop - 46 * k - gridH);
    body = (
      <>
        <Cond text={head} x={M} capTop={cTop} size={headSize} color={ink} weight={900} tracking={0.02} />
        <Cond text={lastN} x={CANVAS_W - M} capTop={cTop + headSize * CAPH - 30 * k * ts * CAPH} size={30 * k * ts} color={accent} weight={700} tracking={0.06} align="right" />
        {cells.map((c, i) => (
          <div key={c.l}>
            {i > 0 && <div style={{ position: "absolute", left: M + i * colW, top: gridTop, height: gridH, width: 2, background: lineC }} />}
            <Cond text={c.v} x={M + i * colW + colW / 2} capTop={gridTop} size={num} color={i === 3 ? accent : ink} weight={800} align="center" />
            <Cond text={c.l} x={M + i * colW + colW / 2} capTop={gridTop + num * CAPH + 20 * k} size={lab} color={soft} weight={700} tracking={0.08} align="center" />
          </div>
        ))}
        <div style={{ position: "absolute", left: M, top: footTop, fontFamily: SANS, fontWeight: 700, fontSize: footSize, lineHeight: 1, letterSpacing: "0.16em", color: soft, whiteSpace: "nowrap" }}>{foot}</div>
      </>
    );
  }

  const counter = `0${slide} / 03`;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: panel, color: ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: photoH, overflow: "hidden", background: "#1d2a22" }}>
        <NatGround place={place} W={CANVAS_W} H={photoH} />
        {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={photoH} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 160, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      </div>
      {/* The accent stripe on the panel's top edge. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: photoH, height: 8 * (story ? 1.25 : 1), background: stripe }} />

      {/* Header row over the photo: name · topic · last N games. */}
      <div style={{ position: "absolute", left: M, top, fontFamily: SANS, fontWeight: 700, fontSize: hName, lineHeight: 1, letterSpacing: "0.18em", color: "#fff", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>{name}</div>
      <div style={{ position: "absolute", right: M, top, fontFamily: SANS, fontWeight: 700, fontSize: hSize * 0.92, lineHeight: 1, letterSpacing: "0.18em", color: "#fff", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>
        {slide === 1 ? "FORM" : slide === 2 ? "GAME BY GAME" : "OUTPUT"}
      </div>

      {body}

      <AgencyLogo
        data={data}
        height={24}
        onLight={light}
        style={{ position: "absolute", left: M, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
      <div style={{ position: "absolute", right: M, top: logoTop + logoH / 2 - 13 * k, fontFamily: CONDENSED, fontWeight: 700, fontSize: 26 * k, lineHeight: 1, letterSpacing: "0.14em", color: soft }}>{counter}</div>
    </div>
  );
}
