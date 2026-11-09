/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { sceneOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { photoOval, portraitBox } from "./versus";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- typography ---------- */

/** DM Serif Display, italic: advance widths per 100px of font size (measured in the browser). */
const SERIF_W: Record<string, number> = { "0": 53.8, "1": 38.4, "2": 50.9, "3": 50.5, "4": 53.8, "5": 49.4, "6": 53.5, "7": 44.6, "8": 49, "9": 52.9, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3, " ": 22.1, "-": 33.7, "'": 27.4, ".": 30.8, ":": 32.1, "·": 30.6, "/": 37.4, "&": 72.6, ",": 30.8, "!": 29.9 };

/** Width in em of a line of DM Serif Display italic caps (accents keep their base letter's width). */
function serifEm(text: string): number {
  return [...text.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (SERIF_W[c] ?? 62), 0) / 100;
}

/** Cap height of DM Serif Display, relative to the font size. */
const SERIF_CAP = 0.66;

/** Single words that read as two in the stacked title. */
const COMPOUNDS: [RegExp, number][] = [
  [/^(MATCH|GAME)DAY$/, 5],
  [/^FULLTIME$/, 4],
  [/^HAT-?TRICK$/, 3],
];

/** The title on (at most) two lines, balanced by width: "NEXT" / "MATCH", "PLAYER OF" / "THE MONTH". */
function titleLines(kicker: string): string[] {
  const raw = kicker.toUpperCase().replace(/’/g, "'").trim();
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  if (words.length === 1) {
    const c = COMPOUNDS.find(([re]) => re.test(words[0]));
    if (c) return [words[0].slice(0, c[1]).replace(/-$/, ""), words[0].slice(c[1]).replace(/^-/, "")];
    return [words[0]];
  }
  // The break that makes the two lines as even as possible.
  let best: { lines: string[]; cost: number } | null = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const cost = Math.abs(serifEm(a) - serifEm(b)) + Math.max(serifEm(a), serifEm(b)) * 0.15;
    if (!best || cost < best.cost) best = { lines: [a, b], cost };
  }
  return best!.lines;
}

/* ---------- scene ---------- */

type Disc = { x: number; y: number; r: number; c: string; a: number; blur: number };

/** Out-of-focus floodlights across the top of the frame, as a long lens renders them. */
function bokeh(seed: number, tint: string): Disc[] {
  const r = rng(seed * 13 + 5);
  const warm = "#ffe9c2";
  const cool = "#cfe8ff";
  const discs: Disc[] = [];
  for (const side of [0, 1]) {
    const cx = side ? 760 + r() * 200 : 90 + r() * 200;
    const cy = 50 + r() * 130;
    discs.push({ x: cx, y: cy, r: 250, c: cool, a: 0.1, blur: 46 });
    for (let i = 0; i < 6; i++) {
      discs.push({ x: cx + (i % 3) * 56 - 56 + (r() - 0.5) * 18, y: cy + Math.floor(i / 3) * 50 - 25, r: 20 + r() * 12, c: r() < 0.7 ? warm : cool, a: 0.3 + r() * 0.34, blur: 6 });
    }
  }
  for (let i = 0; i < 18; i++) {
    const y = Math.pow(r(), 1.9) * 620;
    discs.push({ x: r() * CANVAS_W, y, r: 26 + r() * 86, c: r() < 0.24 ? tint : r() < 0.6 ? cool : warm, a: 0.05 + r() * 0.09, blur: 9 + r() * 14 });
  }
  return discs;
}

/* ---------- the look ---------- */

const CREAM = "#fffdf6";
const INK = "#05060a";

const SMALL: CSSProperties = { fontFamily: ARCHIVO, fontWeight: 600, textTransform: "uppercase", color: CREAM, whiteSpace: "nowrap", lineHeight: 1 };

/** Season of a date like "SAT 10 OCT" (northern calendar: July starts the new one). */
function season(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${String(y + 1).slice(2)}`;
}

/** Small spaced caps, shrunk so the line stays inside `width`. */
const tiny = (t: string, width: number, max = 15, track = 0.22) => Math.max(8.5, Math.min(max, width / Math.max(1, [...t].length * (0.62 + track))));

/**
 * Cinematic "NEXT MATCH" (Real Madrid): a blurred night stadium with bokeh floodlights, a large close
 * portrait of the player graded cool with a warm rim filling the upper two thirds, and, under a deep
 * gradient, an elegant italic serif title in cream-and-gold beside a hairline rule and tiny spaced caps;
 * the two crests as white marks on the right over the venue and kick-off, on a thin season strip.
 */
export function Nextmatch({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 57);
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const tint = luminance(base) < 0.06 ? vivid(params.accent) : base;
  const f = matchFacts(data);
  const score = postType === "result" ? [content.homeGoals, content.awayGoals].every((g) => g != null && String(g) !== "") ? `${content.homeGoals}–${content.awayGoals}` : "" : "";

  /* ---- the player: chest-up, face in the upper third ---- */
  const faceX = 540 + (r() - 0.5) * 80 + (params.side === "left" ? -34 : 30);
  const sizes = { chest: 470, waist: 430, knees: 385, full: 340 };
  let faceTop = 190 + r() * 26;
  let fig = portraitBox(data, faceX, faceTop, sizes, 1.9);
  // Hair never leaves the canvas at the top.
  if (fig.faceTop - fig.faceH * 0.74 < 44) {
    faceTop += 44 - (fig.faceTop - fig.faceH * 0.74);
    fig = portraitBox(data, faceX, faceTop, sizes, 1.9);
  }
  const chin = fig.faceTop + fig.faceH * 1.15;

  /* ---- the title ---- */
  const lines = titleLines(content.kicker);
  const longest = Math.max(...lines.map(serifEm));
  const titleW = 448;
  const size = Math.min(152, titleW / longest) * (params.textScale ?? 1);
  const cap = size * SERIF_CAP;
  const pitch = size * 0.88;
  const blockH = cap + (lines.length - 1) * pitch;

  /* ---- what the small type says ---- */
  const club = (data.club?.name ?? "").toUpperCase();
  const sub: string[] =
    postType === "potm"
      ? [content.subline.toUpperCase(), data.player.position.toUpperCase() || club]
      // The strip already carries the competition: here the round and the other team.
      : [f.round || club, f.opp ? `V ${f.opp}` : f.round ? club : ""];
  const subLines = sub.filter(Boolean).slice(0, 2);

  // Crests in the order the score reads: home first.
  const weHost = content.home ?? ((content.homeTeam ?? "").toUpperCase() === club ? true : (content.awayTeam ?? "").toUpperCase() === club ? false : undefined);
  const crests =
    postType === "potm"
      ? ([data.club?.crestUrl].filter(Boolean) as string[])
      : ((weHost === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]);
  const when = [f.mon && f.day ? `${f.mon} ${f.day}` : f.date, f.time].filter(Boolean).join(", ");
  const stats = shortFacts(data, 2)
    .map((s) => `${s.value} ${s.label.toUpperCase()}`)
    .join("   ·   ");
  const rightLines: { t: string; big?: boolean; xl?: boolean }[] =
    postType === "potm"
      ? [{ t: stats, big: true }, { t: content.subline.toUpperCase() === club ? "" : club }]
      : postType === "result"
        ? [{ t: score, xl: true }, { t: f.venue || (score ? "FULL TIME" : "") || f.comp }]
        : [{ t: f.venue }, { t: when, big: true }];
  const right = rightLines.filter((l) => l.t);

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const footLeft = [(postType === "potm" ? club : f.comp) || club, season()];
  const footRight = [name, data.player.number ? `#${data.player.number}` : ""].filter(Boolean).join("   ·   ");

  const STRIP = 54;
  const rowBottom = CANVAS_H - STRIP - 54;
  const scene = sceneOf(data);

  const crestRow = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 24 }}>
      {crests.map((c, i) => (
        <img key={i} src={c} alt="" style={{ width: 88, height: 88, objectFit: "contain", filter: "url(#nextmatch-mono) drop-shadow(0 6px 18px rgba(0,0,0,.6))" }} />
      ))}
    </div>
  );

  const figure: ReactNode = data.photoUrl && (
    <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(-7px 0 0 rgba(255,188,122,.42)) drop-shadow(-14px 2px 16px rgba(255,150,70,.24)) drop-shadow(0 30px 50px rgba(0,0,0,.55))" }}>
      <img
        src={data.photoUrl}
        alt=""
        style={{
          position: "absolute",
          left: fig.left,
          top: fig.top,
          width: fig.width,
          height: fig.height,
          maxWidth: "none",
          filter: "contrast(1.08) saturate(.88) brightness(.96)",
          ...(data.photoIsCutout ? cutMask(data.cut) : photoOval(fig)),
        }}
      />
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: INK, color: CREAM }}>
      <MonoDefs id="nextmatch-mono" ink={0.72} />

      {/* Night stadium: the ground (or his own frame) blurred right down, with bokeh lamps up top. */}
      {scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -70, top: -70, width: CANVAS_W + 140, height: CANVAS_H + 140, maxWidth: "none", objectFit: "cover", filter: "blur(26px) saturate(.6) brightness(.42) contrast(1.1)" }} />
      ) : data.bgPhotoUrl ? (
        <img src={data.bgPhotoUrl} alt="" style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CANVAS_H + 180, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(.55) brightness(.4)" }} />
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 55% at 50% 8%, ${shade(tint, -0.55)}55, transparent 70%), linear-gradient(180deg, #0b1018 0%, #070a10 42%, ${INK} 100%)`, opacity: scene || data.bgPhotoUrl ? 0.72 : 1 }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <g>
          {bokeh(params.seed ?? 57, tint).map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={d.a} style={{ filter: `blur(${d.blur}px)`, mixBlendMode: "screen" }} />
          ))}
        </g>
      </svg>
      {/* Cool night grade over the whole scene. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(190deg, rgba(120,170,230,.3), rgba(40,70,110,.12) 55%, rgba(10,14,22,.35))", mixBlendMode: "soft-light" }} />

      {figure}
      {/* The same cool light over the player, so he sits in the scene. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(200deg, rgba(150,195,245,.26), transparent 48%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />

      {/* Deep gradient under the chin: everything below reads as type, not photo. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: Math.min(760, Math.max(560, chin + 40)),
          bottom: 0,
          background: `linear-gradient(to bottom, rgba(5,6,10,0) 0%, rgba(5,6,10,.55) 30%, rgba(5,6,10,.9) 58%, ${INK} 82%)`,
        }}
      />

      {/* Title: elegant italic serif in a cream-to-gold gradient, a hairline rule and tiny caps beside it. */}
      <div style={{ position: "absolute", left: 84, top: rowBottom - blockH, display: "flex", alignItems: "flex-start", gap: 22 }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: DMSERIF,
            fontStyle: "italic",
            fontSize: size,
            lineHeight: `${pitch}px`,
            letterSpacing: "-0.005em",
            whiteSpace: "nowrap",
            backgroundImage: "linear-gradient(112deg, #fffdf8 0%, #fff6e4 26%, #ecd3a1 58%, #c9a865 88%, #e6cd99 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 6px 22px rgba(0,0,0,.6))",
            paddingTop: size * (1 - SERIF_CAP) * 0.42,
            marginTop: -size * (1 - SERIF_CAP) * 0.42,
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        {subLines.length > 0 && (
          <div style={{ display: "flex", alignItems: "stretch", gap: 14, paddingTop: size * 0.2 }}>
            <div style={{ width: 1.5, background: "rgba(255,253,246,.45)", height: cap * 0.92 }} />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 7 }}>
              {subLines.map((t, i) => (
                <div key={i} style={{ ...SMALL, fontSize: tiny(t, 186), letterSpacing: "0.22em", opacity: i ? 0.66 : 0.95 }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Crests, venue and kick-off. */}
      <div style={{ position: "absolute", right: 84, top: rowBottom - blockH, height: blockH, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end", gap: 16 }}>
        {crests.length > 0 && crestRow}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9, marginTop: crests.length ? 4 : 0 }}>
          {right.map((l, i) => (
            <div key={i} style={{ ...SMALL, fontSize: l.xl ? tiny(l.t, 330, 46, 0.06) : l.big ? tiny(l.t, 330, 25, 0.12) : tiny(l.t, 330, 19, 0.16), letterSpacing: l.xl ? "0.06em" : l.big ? "0.12em" : "0.16em", opacity: l.xl || l.big ? 1 : 0.72 }}>
              {l.t}
            </div>
          ))}
        </div>
      </div>

      {/* Thin season strip. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, borderTop: "1px solid rgba(255,253,246,.14)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 84px", background: "rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <span style={{ ...SMALL, fontSize: tiny(footLeft[0], 300, 13, 0.3), letterSpacing: "0.3em", fontWeight: 600 }}>{footLeft[0]}</span>
          <span style={{ ...SMALL, fontSize: 12, letterSpacing: "0.3em", fontWeight: 400, opacity: 0.5 }}>{footLeft[1]}</span>
        </div>
        <div style={{ ...SMALL, fontSize: tiny(footRight, 360, 12, 0.3), letterSpacing: "0.3em", fontWeight: 400, opacity: 0.5 }}>{footRight}</div>
      </div>

      <AgencyLogo data={data} height={26} style={{ position: "absolute", left: 84, top: 62, opacity: 0.92, filter: "drop-shadow(0 3px 12px rgba(0,0,0,.7))" }} />
      <Film strength={0.85} />
    </div>
  );
}
