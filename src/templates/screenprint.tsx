/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask } from "./fx";
import { Paper, rng } from "./kit";
import { ANTON, em } from "./mist";
import { crestsOf, scoreOf } from "./outline";
import { CrestMarkDefs } from "./profile";
import { AgencyLogo, DISPLAY } from "./shared";
import { matchFacts, placeFace, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { bestLines, clubColour, mix } from "./wall";

const CREAM = "#eee5d1";

/** One halftone cell on a 45° lattice (dots at the corners and the centre), alpha = dot strength. */
const DOT = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><defs><radialGradient id='d'><stop offset='0' stop-color='#000' stop-opacity='1'/><stop offset='1' stop-color='#000' stop-opacity='0'/></radialGradient></defs><circle cx='0' cy='0' r='6' fill='url(#d)'/><circle cx='12' cy='0' r='6' fill='url(#d)'/><circle cx='0' cy='12' r='6' fill='url(#d)'/><circle cx='12' cy='12' r='6' fill='url(#d)'/><circle cx='6' cy='6' r='6' fill='url(#d)'/></svg>`,
)}`;

/** Worn ink: small holes where the screen did not print. */
const WORN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='4' seed='8' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -14 0 0 0 10.4'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`,
)}")`;

/** The two inks: the club colour (light) and a deep one (the accent when it is dark, else an indigo of the club's hue). */
function inks(data: RenderData): { light: string; dark: string } {
  const club = clubColour(data);
  const acc = data.params.accent;
  let light: string;
  let dark: string;
  if (luminance(club) >= 0.1) {
    light = club;
    dark = luminance(acc) < 0.06 && acc.toLowerCase() !== "#000000" ? acc : mix(club, "#1b1540", 0.78);
  } else {
    dark = luminance(club) < 0.02 ? mix(club, "#1b1540", 0.5) : club;
    const la = luminance(acc);
    light = la > 0.12 && la < 0.7 ? acc : mix(club, "#ffffff", 0.45);
  }
  // A black-and-white club still gets a second, living ink: classic poster red.
  if (hueOf(light) === null) light = "#d2432a";
  for (let i = 0; i < 6 && luminance(light) > 0.5; i++) light = shade(light, -0.12);
  for (let i = 0; i < 6 && luminance(dark) > 0.05; i++) dark = shade(dark, -0.2);
  return { light, dark };
}

/**
 * Screen-print filter: the photo's darkness plus a halftone dot screen, thresholded, becomes one flat ink
 * (with fine grain where the screen skipped).
 */
function InkLayerDefs({ id, ink, threshold, spread, seed }: { id: string; ink: string; threshold: number; spread: number; seed: number }) {
  const k = 7;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.3 -0.59 -0.11 0 1" result="dark" />
        <feImage href={DOT} x="0" y="0" width="12" height="12" result="cell" />
        <feTile in="cell" result="dots" />
        <feComposite in="dark" in2="dots" operator="arithmetic" k1={0} k2={k} k3={k * spread} k4={-k * (threshold + spread * 0.5)} result="tone" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -6 4.3" result="grain" />
        <feComposite in="tone" in2="grain" operator="in" result="toneGrain" />
        <feComposite in="toneGrain" in2="SourceAlpha" operator="in" result="shape" />
        <feFlood floodColor={ink} />
        <feComposite in2="shape" operator="in" />
      </filter>
    </svg>
  );
}

/** A ragged ink shard torn in from an edge: base centred at (x, y), pointing `angle` (deg), `w` wide, `len` long. */
function shard(x: number, y: number, angle: number, w: number, len: number, r: () => number): string {
  const a = (angle * Math.PI) / 180;
  const [dx, dy] = [Math.cos(a), Math.sin(a)];
  const [nx, ny] = [-dy, dx];
  const side = (s: number) => {
    const pts: [number, number][] = [];
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      // Tapers to a torn tip, wobbling as it goes.
      const half = (w / 2) * (1 - t) ** 0.8 * (0.8 + r() * 0.4);
      const along = len * t + (r() - 0.5) * 12;
      pts.push([x - dx * 30 + dx * along + nx * half * s, y - dy * 30 + dy * along + ny * half * s]);
    }
    return pts;
  };
  const left = side(1);
  const right = side(-1).reverse();
  return "M" + [...left, ...right].map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join("L") + "Z";
}

const MON: Record<string, number> = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };

/** "SAT 10 OCT" → "10.10.26" (the year from the next fixture when it is that day, else the coming one). */
function numericDate(data: RenderData, date: string): string {
  const m = date.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m || !MON[m[2]]) return date;
  const day = Number(m[1]);
  const mon = MON[m[2]];
  const f = data.fixtures?.find((x) => Number(x.date.slice(8, 10)) === day && Number(x.date.slice(5, 7)) === mon);
  const now = new Date();
  let year = f ? Number(f.date.slice(0, 4)) : now.getFullYear();
  if (!f && mon < now.getMonth() + 1 - 3) year += 1;
  return `${day}.${mon}.${String(year % 100).padStart(2, "0")}`;
}

const GENERIC = /^(F\.?C\.?|S\.?C\.?|C\.?F\.?|A\.?F\.?C\.?|C\.?D\.?|U\.?D\.?|S\.?A\.?D\.?|CLUBE|CLUB|FUTEBOL|FOOTBALL)$/;
const short = (name: string) => {
  const w = name.toUpperCase().split(/\s+/).filter(Boolean);
  const k = w.filter((x) => !GENERIC.test(x));
  return (k.length ? k : w).join(" ");
};

/** Archivo Black caps: average advance relative to the size. */
const AB = 0.78;
const fitAB = (t: string, width: number, max: number) => Math.min(max, width / Math.max(1, [...t].length * AB));

type Row = { prefix?: string; text: string; size: number; font: string; color: string; weight?: number; crest?: string | null; gapTop?: number; case?: "upper" | "none"; tracking?: string };

const VALUES = ["EFFORT", "TOUGHNESS", "PHYSICALITY", "ATTITUDE", "DISCIPLINE", "RESILIENCE", "HUNGER", "UNITY", "PRIDE"];

/**
 * College "GAME WEEK" screenprint (Clemson): cream paper printed in two inks only — the club colour and a
 * deep second ink. The player, big and cropped, becomes a two-ink halftone print with a slight
 * misregistration; ragged ink shards tear in from the edges; a giant worn condensed kicker in the light ink
 * with a faint ghost; on the other side a mixed-size fixture stack (round / us / v / them / date / ground /
 * kick-off), a small name tag with the crest and a tiny column of values in the corner.
 */
export function Screenprint({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 23;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);
  const ts = params.textScale ?? 1;
  const { light, dark } = inks(data);
  // A dark kit would print as a solid silhouette: its screens are set darker, so the folds still read.
  const kitDark = luminance(params.primary) < 0.06;

  // ---- the player: big, cropped by the bottom edge ----
  const faceTop = 575 + (r() - 0.5) * 30;
  // Printed in halftone, the face may go a little past its real pixels (placeFace caps it at ~1.9×).
  const faceSizes: Record<string, number> = { chest: 215, waist: 185, knees: 160, full: 145 };
  const wantFace = faceSizes[params.framing ?? "knees"] ?? 160;
  let faceX = X(450 + (r() - 0.5) * 40);
  let fig = placeFace(data, faceX, faceTop, wantFace);
  // A big head moves further from the fixture stack.
  if (fig.faceH > 160) {
    faceX = X(450 - (fig.faceH - 160) * 0.7);
    fig = placeFace(data, faceX, faceTop, wantFace);
  }
  const figStyle: CSSProperties = { position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", ...cutMask(data.cut) };

  // ---- the kicker ----
  const kick = (content.kicker || "GAME WEEK").toUpperCase();
  const stretch = 1.42;
  const kb = bestLines(kick, 900, Math.max(150, faceTop + (params.playerY ?? 0) - fig.faceH * 0.5 - 170) / stretch, { tracking: 0, pitch: 0.9, cap: 0.9, maxSize: 250, measure: (t) => em(t, ANTON, 0.46) });
  const kSize = kb.size * ts;
  const kTop = 150;
  const kLineH = kSize * 0.9 * stretch;
  const kBottom = kTop + kb.lines.length * kLineH;

  // ---- the fixture stack ----
  const md = matchFacts(data);
  const score = scoreOf(data, "–");
  const ours = short(data.club?.name ?? "");
  const c = content;
  const home = c.homeTeam && c.awayTeam ? short(c.homeTeam) : ours;
  const away = c.homeTeam && c.awayTeam ? short(c.awayTeam) : md.opp;
  const [crestH, crestA] = (() => {
    const cs = crestsOf(data);
    return cs.length === 2 ? cs : [data.club?.crestUrl ?? null, md.oppCrest];
  })();
  // The stack stays clear of the hair.
  const W = Math.max(250, Math.min(400, (flip ? faceX - fig.faceH * 0.9 : CANVAS_W - faceX - fig.faceH * 0.9) - 86 - 30));
  const tiny = (t: string, color = dark): Row => ({ text: t, size: Math.min(17, W / Math.max(1, t.length * 0.66)), font: ARCHIVO, weight: 700, color, tracking: "0.14em" });
  const team = (t: string, color: string, crest: string | null | undefined, max: number, extra = 0): Row => ({ text: t, size: fitAB(t, W - (crest ? 58 : 0) - extra, max), font: ARCHIVO_BLACK, color, crest });
  const round = md.round || md.comp;
  const rows: Row[] = [];
  const date = md.date ? numericDate(data, md.date) : "";
  const facts = shortFacts(data, 3);
  if (postType === "potm") {
    if (round) rows.push(tiny(round));
    if (home && away && (c.homeTeam || score)) {
      rows.push(team(home, light, crestH, 50));
      rows.push({ ...team(away, dark, crestA, 50, 34), prefix: "v" });
    }
    if (score) rows.push({ text: score, size: 58, font: ARCHIVO_BLACK, color: dark, gapTop: 6 });
    facts.forEach((f, i) => rows.push({ text: `${f.value} ${f.label}`, size: fitAB(`${f.value} ${f.label}`, W, 30), font: ARCHIVO_BLACK, color: i ? dark : light, gapTop: i ? 0 : 10 }));
  } else {
    if (round) rows.push(tiny(round));
    if (home) rows.push(team(home, light, crestH, 66));
    if (away) rows.push({ ...team(away, dark, crestA, 76, 40), prefix: "v", gapTop: 4 });
    if ((postType === "result" || postType === "goal") && score) rows.push({ text: score, size: 74, font: ARCHIVO_BLACK, color: dark, gapTop: 6 });
    else if (date) rows.push({ text: date, size: 46, font: ARCHIVO_BLACK, color: dark, gapTop: 6 });
    if (md.venue && postType === "matchday") rows.push({ text: md.venue, size: Math.min(19, W / Math.max(1, md.venue.length * 0.52)), font: ARCHIVO, weight: 500, color: dark, case: "none" });
    if (postType === "matchday" && md.time) rows.push({ text: `${md.time} Kick-off`, size: 22, font: ARCHIVO, weight: 800, color: dark, case: "none" });
    if (postType !== "matchday" && date && score) rows.push({ text: date, size: 20, font: ARCHIVO, weight: 800, color: dark, case: "none" });
  }
  const stackTop = Math.max(kBottom + 36, 520);
  const stackRight = 86;

  // ---- name tag, beside the head ----
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").toUpperCase();
  const tagSub = [data.player.number ? `#${data.player.number}` : "", data.player.position.toUpperCase()].filter(Boolean).join(" · ");
  const tagW = 300;
  const tagSize = fitAB(name, tagW - 44, 26);
  // Beside the head when there is room, else at the head of the fixture stack.
  const besideX = flip ? faceX + fig.faceH * 0.8 : faceX - fig.faceH * 0.8 - tagW;
  const beside = flip ? besideX + tagW < CANVAS_W - 56 : besideX > 56;

  // ---- ink shards torn in from the edges ----
  const shards: { d: string; color: string; o: number }[] = [];
  for (let i = 0; i < 3; i++) shards.push({ d: shard(X(50 + i * 58 + r() * 30), -10, flip ? 100 - r() * 22 : 80 + r() * 22, 22 + r() * 18, 80 + r() * 70, r), color: dark, o: 1 });
  shards.push({ d: shard(X(610 + r() * 90), -10, flip ? 108 : 72, 80 + r() * 30, 110 + r() * 50, r), color: light, o: 1 });
  shards.push({ d: shard(X(1090), 560 + r() * 100, flip ? 20 : 160, 120, 150 + r() * 50, r), color: light, o: 1 });
  shards.push({ d: shard(X(-10), 900 + r() * 100, flip ? 190 : -10, 230 + r() * 60, 230 + r() * 60, r), color: dark, o: 1 });
  shards.push({ d: shard(X(-10), 660 + r() * 60, flip ? 172 : 8, 110, 120 + r() * 40, r), color: light, o: 1 });
  shards.push({ d: shard(X(1090), 1180 + r() * 60, flip ? 12 : 168, 200, 170 + r() * 40, r), color: dark, o: 1 });

  const values = [...VALUES].sort(() => r() - 0.5).slice(0, 5);
  const ink: CSSProperties = { WebkitMaskImage: WORN, maskImage: WORN, WebkitMaskSize: "420px 420px", maskSize: "420px 420px" };

  const tag = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: flip ? "row" : "row-reverse", textAlign: flip ? "left" : "right", color: dark }}>
      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 34, height: 34, objectFit: "contain", filter: "url(#sp-crest)" }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: tagSize, lineHeight: 1, whiteSpace: "nowrap" }}>{name}</div>
        {tagSub && <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 12, letterSpacing: "0.16em", marginTop: 5, whiteSpace: "nowrap" }}>{tagSub}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: CREAM }}>
      <InkLayerDefs id="sp-light" ink={light} threshold={kitDark ? 0.3 : 0.2} spread={0.55} seed={seed} />
      <InkLayerDefs id="sp-dark" ink={dark} threshold={kitDark ? 0.84 : 0.56} spread={0.4} seed={seed + 4} />
      <CrestMarkDefs id="sp-crest" color={dark} />
      <Paper color={CREAM} strength={1.3} />

      {/* Ragged ink shards. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="sp-rough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={seed} />
            <feDisplacementMap in="SourceGraphic" scale={20} />
          </filter>
        </defs>
        <g filter="url(#sp-rough)">
          {shards.map((s, i) => (
            <path key={i} d={s.d} fill={s.color} opacity={s.o} />
          ))}
        </g>
      </svg>

      {/* The giant kicker: a faint ghost below, a dark misprint behind, the light ink on top. */}
      {kb.lines.map((l, i) => {
        const base: CSSProperties = { position: "absolute", left: 0, right: 0, top: kTop + i * kLineH, height: kLineH, textAlign: "center", fontFamily: DISPLAY, fontSize: kSize, lineHeight: `${kLineH}px`, whiteSpace: "nowrap", transform: `scaleY(${stretch})`, transformOrigin: "center top" };
        return (
          <div key={i}>
            {i === kb.lines.length - 1 && <div style={{ ...base, top: base.top as number + kLineH * 0.42, color: light, opacity: 0.1, filter: "blur(1.5px)" }}>{l}</div>}
            <div style={{ ...base, color: dark, opacity: 0.22, transform: `translate(7px, 6px) scaleY(${stretch})`, mixBlendMode: "multiply", ...ink }}>{l}</div>
            <div style={{ ...base, color: light, ...ink }}>{l}</div>
          </div>
        );
      })}

      {/* The player, printed in two inks, the dark screen a hair off register. */}
      {data.photoUrl && (
        <>
          <img src={data.photoUrl} alt="" style={{ ...figStyle, filter: "url(#sp-light)" }} />
          <img src={data.photoUrl} alt="" style={{ ...figStyle, left: fig.left + 5, top: fig.top - 4, filter: "url(#sp-dark)", mixBlendMode: "multiply" }} />
        </>
      )}

      {/* Fixture stack. */}
      <div style={{ position: "absolute", top: stackTop, [flip ? "left" : "right"]: stackRight, width: W + 20, display: "flex", flexDirection: "column", alignItems: flip ? "flex-start" : "flex-end", textAlign: flip ? "left" : "right" }}>
        {/* No room beside a big head: his name leads the stack as one small line instead. */}
        {name && !beside && (
          <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: Math.min(20, W / Math.max(1, (name.length + (data.player.number ? 5 : 0)) * 0.8)), letterSpacing: "0.04em", color: dark, whiteSpace: "nowrap", marginBottom: 6 }}>
            {name}
            {data.player.number ? <span style={{ fontFamily: ARCHIVO, fontWeight: 700, opacity: 0.8 }}>{`  #${data.player.number}`}</span> : null}
          </div>
        )}
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: flip ? "row-reverse" : "row",
              alignItems: "center",
              gap: 12,
              marginTop: row.gapTop ?? 0,
              fontFamily: row.font,
              fontWeight: row.weight,
              fontSize: row.size,
              lineHeight: 1.08,
              letterSpacing: row.tracking ?? (row.font === ARCHIVO_BLACK ? "-0.01em" : "0"),
              color: row.color,
              whiteSpace: "nowrap",
              textTransform: row.case === "none" ? "none" : "uppercase",
              ...(row.font === ARCHIVO_BLACK && row.size >= 44 ? ink : {}),
            }}
          >
            <span style={{ [flip ? "paddingLeft" : "paddingRight"]: !row.crest && rows.some((x) => x.crest) ? 58 : 0 }}>{row.text}</span>
            {row.prefix && <span style={{ order: flip ? 1 : -1, fontFamily: ARCHIVO, fontWeight: 500, fontSize: Math.max(22, Math.min(30, row.size * 0.5)), textTransform: "none", alignSelf: "flex-end", marginBottom: row.size * 0.14 }}>{row.prefix}</span>}
            {row.crest && <img src={row.crest} alt="" style={{ order: 2, width: 46, height: 46, objectFit: "contain", filter: "url(#sp-crest)" }} />}
          </div>
        ))}
      </div>

      {/* Name tag beside the head. */}
      {name && beside && <div style={{ position: "absolute", left: besideX, top: faceTop + fig.faceH * 0.1, width: tagW }}>{tag}</div>}

      {/* Small print: values in the corner, the agency and the competition at the top. */}
      <div style={{ position: "absolute", top: 58, [flip ? "left" : "right"]: 64, textAlign: flip ? "left" : "right", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", lineHeight: 1.75, color: dark }}>
        {values.map((v) => (
          <div key={v}>{v}</div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 62, [flip ? "right" : "left"]: 250, display: "flex", alignItems: "center", gap: 16, flexDirection: flip ? "row-reverse" : "row" }}>
        <AgencyLogo data={data} height={20} onLight style={{ color: dark }} />
        {md.comp && <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: Math.min(12, 300 / Math.max(1, md.comp.length * 0.7)), letterSpacing: "0.18em", color: dark, whiteSpace: "nowrap" }}>{md.comp}</div>}
      </div>
      {/* Registration marks. */}
      {[
        [30, 30],
        [CANVAS_W - 30, 30],
        [30, CANVAS_H - 30],
        [CANVAS_W - 30, CANVAS_H - 30],
      ].map(([x, y], i) => (
        <svg key={i} width={30} height={30} style={{ position: "absolute", left: x - 15, top: y - 15 }}>
          <circle cx={15} cy={15} r={7} fill="none" stroke={dark} strokeWidth={1.2} />
          <line x1={0} y1={15} x2={30} y2={15} stroke={dark} strokeWidth={1.2} />
          <line x1={15} y1={0} x2={15} y2={30} stroke={dark} strokeWidth={1.2} />
        </svg>
      ))}

      <Paper color="transparent" strength={1.1} style={{ mixBlendMode: "multiply" }} />
    </div>
  );
}
