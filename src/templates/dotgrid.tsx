/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
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

/** "17 OCT" / "20 SET" → "17.10" / "20.09". */
function numeric(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]] ?? m[2]}`;
}

/** The grid pitch: every position on the canvas snaps to it. */
const G = 24;
const snap = (v: number) => Math.round(v / G) * G;

/**
 * Dot grid: a very fine dot grid (a tiny dot every 24px, low opacity) over a clean deep club tone or an
 * off-white ground, a short run of dots in the club colour as the only accent line under the title.
 * The title medium in Inter, the fixture, date and ground small, every baseline and edge on the grid.
 * The player in natural colour on the other side. Precise and calm.
 */
export function Dotgrid({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 17);
  const right = params.side !== "left";
  const light = r() < 0.5;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * ts;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const deep = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.6);
  const ground = light ? "#f1f0ec" : deep;
  const ink = light ? "#121214" : "#ffffff";
  const dim = light ? "rgba(18,18,20,.5)" : "rgba(255,255,255,.55)";
  const dotInk = light ? "rgba(18,18,20,.26)" : "rgba(255,255,255,.24)";
  // The accent dots: the club colour, lifted on a deep ground, deepened on the light one when too pale.
  let accent = club;
  if (!light && luminance(accent) < 0.12) accent = shade(accent, 0.45);
  if (light && luminance(accent) > 0.5) accent = shade(accent, -0.4);
  if (luminance(accent) < 0.02) accent = light ? "#121214" : "#ffffff";

  /* ---- facts ---- */
  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;
  const ours = (data.club?.name ?? "").toLowerCase();
  const weHost = content.home ?? ((content.homeTeam ?? "").toLowerCase() === ours ? true : (content.awayTeam ?? "").toLowerCase() === ours ? false : true);
  const homeName = (content.homeTeam ?? (weHost ? data.club?.name : titleCase(f.opp)) ?? "").trim();
  const awayName = (content.awayTeam ?? (weHost ? titleCase(f.opp) : data.club?.name) ?? "").trim();
  const homeCrest = content.homeCrest ?? (weHost ? f.ourCrest : f.oppCrest);
  const awayCrest = content.awayCrest ?? (weHost ? f.oppCrest : f.ourCrest);
  const teams = [
    { name: homeName, crest: homeCrest, goals: isResult ? String(content.homeGoals ?? "") : "" },
    { name: awayName, crest: awayCrest, goals: isResult ? String(content.awayGoals ?? "") : "" },
  ].filter((t) => t.name || t.crest);
  const title = isResult && postType === "result" ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase().replace(/’/g, "'"));
  const when = [numeric(content.date), isResult ? "" : f.time && f.time !== "00:00" ? f.time : ""].filter(Boolean).join("  ·  ");
  const venue = titleCase(f.venue);
  const comp = titleCase(f.comp || f.round || "");
  const meta = [{ t: when, big: true }, { t: venue, big: false }, { t: comp, big: false }].filter((m) => m.t);

  /* ---- grid layout ---- */
  const M = 3 * G; // 72
  const colW = (story ? 22 : 19) * G;
  const xL = right ? M : CANVAS_W - M - colW;
  const alignEnd = !right;
  const titleS = (story ? 104 : 80) * ts;
  const titleBase = Math.ceil(((story ? STORY_TOP : M) + titleS * 0.727) / G) * G;
  const accentY = titleBase + (story ? 3 : 2) * G;

  const logoAsk = 20;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsk * 2) * 1.7)) : Math.max(52, logoAsk * 2);
  const logoBottom = story ? H - STORY_BOTTOM : 56;
  const infoBottom = H - logoBottom - logoH - (story ? 64 : 58);

  const teamS = 30 * k;
  const crestS = 34 * k;
  const teamPitch = snap(52 * k);
  const metaPitch = snap(30 * k);
  const goalsW = isResult ? 44 * k : 0;
  const nameW = colW - crestS - 18 * k - goalsW;
  // Bottom up: meta rows, then a gap of two cells, then the teams.
  const metaBase0 = snap(infoBottom - 6) - (meta.length - 1) * metaPitch;
  const teamBase1 = metaBase0 - metaPitch - (story ? 3 : 2) * G;
  const teamBase0 = teamBase1 - (teams.length - 1) * teamPitch;
  const infoTop = teamBase0 - teamS - G;

  /* ---- the player, on the other side ---- */
  const cx = right ? 770 + r() * 20 : 310 - r() * 20;
  const box = story
    ? placeByFace(data, right ? cx + 60 : cx - 60, STORY_TOP + 230, { chest: 300, waist: 234, knees: 184, full: 152 })
    : placeByFace(data, cx, 250, { chest: 236, waist: 178, knees: 138, full: 110 });
  // Behind the info the player fades before the column, so the type always sits on the clean grid.
  // (measured to the real end of the type, not the column, so as little of him as possible fades)
  const textW = Math.min(
    colW,
    Math.max(
      ...teams.map((t) => goalsW + crestS + 18 * k + Math.min(teamS, nameW / Math.max(0.5, em(t.name))) * em(t.name)),
      ...meta.map((m) => (m.big ? 21 * k * em(m.t) : Math.min(12 * k, colW / Math.max(1, capsEm(m.t, 0.22))) * capsEm(m.t, 0.22))),
    ),
  );
  const colEdge = right ? xL + textW + 20 : xL + colW - textW - 20;
  const fadeTo = right ? colEdge + 200 : colEdge - 200;
  const clear = [
    `linear-gradient(to bottom, #000 ${infoTop - 110}px, transparent ${infoTop - 10}px)`,
    `linear-gradient(to ${right ? "right" : "left"}, transparent ${right ? colEdge : CANVAS_W - colEdge}px, #000 ${right ? fadeTo : CANVAS_W - fadeTo}px)`,
  ].join(", ");

  const crestFilter = light || params.crestColor ? "none" : "url(#dotgrid-mono)";
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };
  const capsFit = (t: string, max: number, w: number) => Math.max(9, Math.min(max, w / Math.max(1, capsEm(t, 0.22))));
  const side: CSSProperties = alignEnd ? { right: CANVAS_W - xL - colW, textAlign: "right" } : { left: xL };
  const at = (base: number, size: number): CSSProperties => ({ position: "absolute", top: base - size * 0.97, ...side });

  // Accent: a run of dots in the club colour on grid points, easing off towards its end.
  const runN = story ? 11 : 9;
  const accentDots = Array.from({ length: runN }, (_, i) => {
    const x = right ? M + i * G : CANVAS_W - M - i * G;
    return { x, o: 1 - (i / runN) * 0.75 };
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="dotgrid-mono" ink={0.55} />
      {/* The ground: flat, a breath of light behind him. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light
            ? `radial-gradient(60% 50% at ${right ? 70 : 30}% 40%, #f8f7f4, ${ground} 70%, #e7e5df 100%)`
            : `radial-gradient(60% 50% at ${right ? 70 : 30}% 40%, ${shade(deep, 0.12)}, ${deep} 65%, ${shade(deep, -0.3)} 100%)`,
        }}
      />
      {/* The dot grid: one tiny dot on every grid point. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${dotInk} 1.1px, transparent 1.7px)`,
          backgroundSize: `${G}px ${G}px`,
          backgroundPosition: `-${G / 2}px -${G / 2}px`,
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

      {/* Title. */}
      <div
        style={{
          position: "absolute",
          top: titleBase - titleS * 0.97,
          [right ? "left" : "right"]: M - titleS * 0.04,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: titleS,
          lineHeight: 1,
          letterSpacing: "-0.035em",
          whiteSpace: "nowrap",
          color: ink,
        }}
      >
        {title}
      </div>
      {/* The accent line: club-colour dots sitting on the grid. */}
      {accentDots.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x - 3.5 * (story ? 1.2 : 1), top: accentY - 3.5 * (story ? 1.2 : 1), width: 7 * (story ? 1.2 : 1), height: 7 * (story ? 1.2 : 1), borderRadius: "50%", background: accent, opacity: d.o }} />
      ))}

      {/* The fixture: crest + team per row, home first; goals at the column's end on a result. */}
      {teams.map((t, i) => {
        const base = teamBase0 + i * teamPitch;
        const s = Math.min(teamS, nameW / Math.max(0.5, em(t.name)));
        // Goals on the outer margin, then the crest, then the name.
        const crestX = alignEnd ? xL + colW - goalsW - crestS : xL + goalsW;
        const nameX = alignEnd ? xL : xL + goalsW + crestS + 18 * k;
        return (
          <div key={i}>
            {t.crest && <img src={t.crest} alt="" style={{ position: "absolute", left: crestX, top: base - teamS * 0.36 - crestS / 2, width: crestS, height: crestS, objectFit: "contain", filter: crestFilter }} />}
            <div style={{ position: "absolute", left: nameX, width: nameW, top: base - s * 0.97, textAlign: alignEnd ? "right" : "left", fontFamily: SANS, fontWeight: 500, fontSize: s, lineHeight: 1, letterSpacing: "-0.015em", whiteSpace: "nowrap", color: ink }}>
              {t.name}
            </div>
            {t.goals && (
              <div style={{ position: "absolute", left: alignEnd ? xL + colW - goalsW : xL, width: goalsW, top: base - teamS * 0.97, textAlign: alignEnd ? "right" : "left", fontFamily: SANS, fontWeight: 500, fontSize: teamS, lineHeight: 1, color: ink, fontVariantNumeric: "tabular-nums" }}>
                {t.goals}
              </div>
            )}
          </div>
        );
      })}

      {/* Date · kick-off, ground, competition: small, one grid row apart. */}
      {meta.map((m, i) => {
        const base = metaBase0 + i * metaPitch;
        if (m.big) {
          const s = 21 * k;
          return <div key={i} style={{ ...at(base, s), fontFamily: SANS, fontWeight: 400, fontSize: s, lineHeight: 1, whiteSpace: "pre", color: ink, fontVariantNumeric: "tabular-nums" }}>{m.t}</div>;
        }
        const s = capsFit(m.t, 12 * k, colW);
        return <div key={i} style={{ ...caps, ...at(base, s), fontSize: s, color: dim }}>{m.t}</div>;
      })}

      <AgencyLogo
        data={data}
        height={logoAsk}
        onLight={light}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
