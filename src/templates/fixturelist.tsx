/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** English and Portuguese month abbreviations → month number. */
const MONTH_NO: Record<string, string> = {
  JAN: "01", FEB: "02", FEV: "02", MAR: "03", APR: "04", ABR: "04", MAY: "05", MAI: "05", JUN: "06", JUL: "07",
  AUG: "08", AGO: "08", SEP: "09", SET: "09", OCT: "10", OUT: "10", NOV: "11", DEC: "12", DEZ: "12",
};

/** Inter 500: advance widths per 100px (measured in the browser). */
const W500: Record<string, number> = { "0": 64.5, "1": 41.5, "2": 61.6, "3": 62.7, "4": 65.6, "5": 60.3, "6": 63, "7": 58.9, "8": 62.9, "9": 63, a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, ".": 30.3, ":": 30.3, "-": 46.3, "–": 50, "'": 31.3, "·": 30.3, "/": 37 };
const em = (t: string, track = -0.015) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (W500[c] ?? 60) / 100 + track, -track);
/** Spaced caps: width per 1px of font size (Inter 500 caps ≈ 0.68em + tracking). */
const capsEm = (t: string, track: number) => t.length * (0.68 + track);

/** "2026-10-17" → "17.10"; "17 OCT" / "20 SET" → "17.10" / "20.09". */
function numeric(d?: string): string {
  const s = (d ?? "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[3]}.${iso[2]}`;
  const m = s.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]] ?? m[2]}`;
}

/** "TAÇA DE PORTUGAL 3RD QUALIFYING ROUND" → "Taça de Portugal"; "Liga Portugal 2 Meu Super" stays. */
function shortComp(c: string): string {
  let s = c.toUpperCase().replace(/\s+\b(OPENING|CLOSING|\d+(ST|ND|RD|TH)|QUALIFYING|ROUND|MATCHDAY|PHASE|STAGE)\b.*$/, "").trim();
  let w = s.split(/\s+/);
  if (s.length > 18 && w.length > 2 && /^(MALTA|MALTESE|PORTUGUESE|ENGLISH|SPANISH|ITALIAN|GERMAN|FRENCH|SWISS|CYPRUS|CYPRIOT|GREEK|POLISH|ROMANIAN|BELGIAN|DUTCH)$/.test(w[0])) w = w.slice(1);
  s = w.join(" ");
  return titleCase(s);
}

type Row = { date: string; time: string; opp: string; crest: string | null; comp: string };

/**
 * Fixture list: today's game and the next ones as a quiet timetable on the free side — hairline rows in
 * Inter (date, opponent crest, "v Opponent", competition in tiny caps, kick-off), today's row a solid band
 * in the club colour bleeding off the edge. The title above, the player in natural colour on the other side,
 * on a deep club tone or an off-white ground (by seed).
 */
export function Fixturelist({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 31);
  const right = params.side !== "left";
  const light = r() < 0.5;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * ts;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.6 || luminance(club) < 0.02) club = light ? "#16181d" : "#2b2f38";
  const bright = luminance(club) > 0.4;
  const deep = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.55);
  const ground = light ? "#efede8" : deep;
  const ink = light ? "#121214" : "#ffffff";
  const dim = light ? "rgba(18,18,20,.46)" : "rgba(255,255,255,.5)";
  const hair = light ? "rgba(18,18,20,.16)" : "rgba(255,255,255,.18)";
  const bandInk = luminance(club) > 0.5 ? "#121214" : "#ffffff";
  const bandDim = luminance(club) > 0.5 ? "rgba(18,18,20,.6)" : "rgba(255,255,255,.68)";

  /* ---- today's game and the next ones ---- */
  const f = matchFacts(data);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const todayDate = numeric(content.date);
  const today: Row = {
    date: todayDate,
    time: f.time && f.time !== "00:00" ? f.time : "",
    opp: (typed ?? titleCase(f.opp)).trim(),
    crest: f.oppCrest,
    comp: shortComp(f.comp || f.round || data.fixtures[0]?.competition || ""),
  };
  const venue = titleCase(f.venue);
  const maxNext = story ? 5 : 4;
  const next: Row[] = data.fixtures
    .filter((x) => numeric(x.date) !== todayDate)
    .slice(0, maxNext)
    .map((x) => ({ date: numeric(x.date), time: x.time && x.time !== "00:00" ? x.time : "", opp: x.opponent.trim(), crest: x.opponentCrest, comp: shortComp(x.competition) }));

  /* ---- the column ---- */
  const M = 64;
  const colW = (story ? 520 : 450) * Math.min(1, ts);
  const x0 = right ? M : CANVAS_W - M - colW;
  const dateW = 96 * k;
  const crestS = 30 * k;
  const nameX = dateW + crestS + 16 * k;
  const timeW = 72 * k;
  const nameMax = colW - nameX - timeW - 8;

  const todayName = today.opp ? `v ${today.opp}` : [content.firstName, content.lastName].filter(Boolean).join(" ");
  const todayNameS = Math.min(32 * k, (colW - nameX - 8) / Math.max(0.5, em(todayName)));
  const bandPad = 30 * k;
  const bandH = bandPad * 2 + 32 * k + 18 * k + (today.comp ? 22 * k : 0) + (venue ? 24 * k : 0);
  const headH = next.length ? 64 * k : 0;
  const rowH = 82 * k;
  const listH = bandH + headH + next.length * rowH;

  const logoAsk = 20;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsk * 2) * 1.7)) : Math.max(52, logoAsk * 2);
  const logoBottom = story ? H - STORY_BOTTOM : 56;
  const listBottom = H - logoBottom - logoH - (story ? 64 : 58);
  const titleS = (story ? 96 : 72) * ts;
  const titleTop = story ? STORY_TOP : M;
  const listTop = Math.max(titleTop + titleS * 2.2, listBottom - listH + (params.textY ?? 0));

  /* ---- the player, on the other side ---- */
  const cx = right ? 790 + r() * 20 : 290 - r() * 20;
  const box = story
    ? placeByFace(data, right ? cx + 20 : cx - 20, STORY_TOP + 200, { chest: 300, waist: 232, knees: 182, full: 150 })
    : placeByFace(data, cx, 230, { chest: 236, waist: 178, knees: 138, full: 110 });

  // Below the top of the list the player fades out before the column, so the rows always read on clean ground.
  const colEdge = right ? x0 + colW + 28 * k : x0 - 28 * k;
  const fadeTo = right ? colEdge + 110 : colEdge - 110;
  const clear = [
    `linear-gradient(to bottom, #000 ${listTop - 120}px, transparent ${listTop - 20}px)`,
    `linear-gradient(to ${right ? "right" : "left"}, transparent ${right ? colEdge : CANVAS_W - colEdge}px, #000 ${right ? fadeTo : CANVAS_W - fadeTo}px)`,
  ].join(", ");
  const crestFilter = light || params.crestColor ? "none" : "url(#fixturelist-mono)";
  const bandCrest = "none";
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };
  const clubName = (data.club?.name ?? "").trim();
  const capsFit = (t: string, max: number, w: number) => Math.max(9, Math.min(max, w / Math.max(1, capsEm(t, 0.24))));

  const nameEl = (text: string, size: number, color: string, top: number, left: number, weight = 400) => (
    <div style={{ position: "absolute", left, top: top - size * 0.97, fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: "-0.015em", whiteSpace: "nowrap", color }}>{text}</div>
  );

  // Today's band: bleeds off the canvas on the free side.
  const bandL = right ? 0 : x0 - 28 * k;
  const bandR = right ? x0 + colW + 28 * k : CANVAS_W;
  const base1 = listTop + bandPad + 32 * k * 0.74;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="fixturelist-mono" ink={0.55} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light
            ? `radial-gradient(60% 50% at ${right ? 72 : 28}% 42%, #f7f6f2, ${ground} 70%, #e4e1da 100%)`
            : `radial-gradient(60% 50% at ${right ? 72 : 28}% 40%, ${shade(deep, 0.12)}, ${deep} 65%, ${shade(deep, -0.32)} 100%)`,
        }}
      />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: clear, maskImage: clear }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Title + the club, top of the free side. */}
      <div style={{ position: "absolute", top: titleTop, [right ? "left" : "right"]: M, textAlign: right ? "left" : "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: titleS, lineHeight: 0.9, letterSpacing: "-0.035em", color: ink, whiteSpace: "nowrap" }}>
          {titleCase((content.kicker || "Matchday").toUpperCase())}
        </div>
        {clubName && <div style={{ ...caps, marginTop: 22 * k, fontSize: capsFit(clubName, 13 * k, colW), color: dim }}>{clubName}</div>}
      </div>

      {/* Today's game: the band in the club colour. */}
      <div style={{ position: "absolute", left: bandL, width: bandR - bandL, top: listTop, height: bandH, background: club }} />
      {nameEl(today.date, 32 * k, bandInk, base1, x0, 500)}
      {today.time && nameEl(today.time, 18 * k, bandDim, base1 + 30 * k, x0)}
      {today.crest && (
        <img src={today.crest} alt="" style={{ position: "absolute", left: x0 + dateW, top: base1 - 11.5 * k - crestS / 2, width: crestS, height: crestS, objectFit: "contain", filter: bandCrest }} />
      )}
      {todayName && nameEl(todayName, todayNameS, bandInk, base1, x0 + nameX, 500)}
      {today.comp && <div style={{ ...caps, position: "absolute", left: x0 + nameX, top: base1 + 22 * k, fontSize: capsFit(today.comp, 12 * k, colW - nameX), color: bandDim }}>{today.comp}</div>}
      {venue && (
        <div style={{ position: "absolute", left: x0 + nameX, top: base1 + (today.comp ? 46 : 22) * k, fontFamily: SANS, fontWeight: 400, fontSize: Math.min(16 * k, (colW - nameX) / Math.max(1, em(venue))), lineHeight: 1, whiteSpace: "nowrap", color: bandDim }}>
          {venue}
        </div>
      )}

      {/* The next games: hairline rows. */}
      {next.length > 0 && (
        <div style={{ ...caps, position: "absolute", left: x0, top: listTop + bandH + headH - 26 * k, fontSize: 11 * k, color: dim }}>Next</div>
      )}
      {next.map((g, i) => {
        const top = listTop + bandH + headH + i * rowH;
        const name = `v ${g.opp}`;
        const s = Math.min(24 * k, nameMax / Math.max(0.5, em(name)));
        const base = top + rowH * 0.48;
        return (
          <div key={i}>
            <div style={{ position: "absolute", top, left: x0, width: colW, height: 1, background: hair }} />
            {nameEl(g.date, 22 * k, ink, base, x0, 500)}
            {g.crest && <img src={g.crest} alt="" style={{ position: "absolute", left: x0 + dateW, top: base - 8 * k - crestS * 0.5, width: crestS, height: crestS, objectFit: "contain", filter: crestFilter }} />}
            {nameEl(name, s, ink, base, x0 + nameX)}
            {g.comp && <div style={{ ...caps, position: "absolute", left: x0 + nameX, top: base + 13 * k, fontSize: capsFit(g.comp, 10 * k, nameMax), color: dim }}>{g.comp}</div>}
            {g.time && (
              <div style={{ position: "absolute", left: x0 + colW - timeW, width: timeW, top: base - 18 * k * 0.97, textAlign: "right", fontFamily: SANS, fontWeight: 400, fontSize: 18 * k, lineHeight: 1, color: dim, fontVariantNumeric: "tabular-nums" }}>{g.time}</div>
            )}
          </div>
        );
      })}
      {next.length > 0 && <div style={{ position: "absolute", top: listTop + listH, left: x0, width: colW, height: 1, background: hair }} />}

      <AgencyLogo
        data={data}
        height={logoAsk}
        onLight={light}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
