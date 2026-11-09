/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { sceneOf } from "./outline";
import { AgencyLogo, SERIF } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { photoOval, portraitBox } from "./versus";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- condensed lettering (shared with redgrain) ---------- */

export const BARLOW = "var(--font-barlow), 'Arial Narrow', sans-serif";

/** Barlow Condensed at weight 900: advance widths per 100px of font size (measured in the browser). */
export const BARLOW_W: Record<string, number> = { "0": 45.9, "1": 30.3, "2": 46.3, "3": 45.4, "4": 53, "5": 45.9, "6": 46, "7": 43.5, "8": 45.2, "9": 45.6, A: 53.1, B: 48.4, C: 47.6, D: 48.3, E: 44.4, F: 43.2, G: 47.8, H: 48.6, I: 24, J: 47, K: 51.7, L: 44.6, M: 56.6, N: 52.8, O: 48.4, P: 48.1, Q: 47.3, R: 49, S: 46.3, T: 49.9, U: 48.1, V: 52.1, W: 72, X: 50.3, Y: 50.8, Z: 42.4, " ": 20, "-": 34.3, "'": 20.4, ".": 24.6, ":": 31.8, "·": 24.4, "/": 47, "&": 64.3, ",": 23.3, "!": 29.8 };

/** Cap height of Barlow Condensed, relative to the font size. */
export const BARLOW_CAP = 0.7;

/** Letters of a string with their accents dropped, so the width table always has an entry. */
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];

/** Width in em of a line of Barlow Condensed 900 caps at the given tracking (em). */
export function barlowEm(text: string, tracking = 0): number {
  const chars = plain(text);
  return chars.reduce((a, c) => a + (BARLOW_W[c] ?? 48) / 100, 0) + tracking * Math.max(0, chars.length - 1);
}

/** Single words that read as two ("MATCHDAY" → "MATCH" + "DAY"). */
const COMPOUNDS: [RegExp, number][] = [
  [/^(MATCH|GAME)DAY$/, 5],
  [/^FULLTIME$/, 4],
  [/^HAT-?TRICK$/, 3],
];

/**
 * Where the word is cut in two: at the seam of a compound ("MATCH|DAY"), else at the space or letter
 * boundary nearest the middle. Returns the offset in em from the start of the line.
 */
export function halfPoint(text: string, tracking = 0): number {
  const up = text.toUpperCase();
  const c = COMPOUNDS.find(([re]) => re.test(up));
  const chars = plain(up);
  const total = barlowEm(up, tracking);
  const at = (i: number) => barlowEm(chars.slice(0, i).join(""), tracking) + (i > 0 ? tracking : 0);
  if (c) return at(c[1]);
  if (chars.length < 2) return total / 2;
  // A space near the middle beats a letter boundary.
  const spaces = chars.map((ch, i) => (ch === " " ? i + 1 : -1)).filter((i) => i > 0);
  const pick = (cands: number[]) => cands.reduce((b, i) => (Math.abs(at(i) - total / 2) < Math.abs(at(b) - total / 2) ? i : b), cands[0]);
  if (spaces.length) return at(pick(spaces)) - BARLOW_W[" "] / 100 / 2;
  return at(pick(chars.map((_, i) => i).slice(1)));
}

/* ---------- the look ---------- */

const WHITE = "#ffffff";
const INK = "#0a0b0d";
const X0 = 84;

const LIGHT: CSSProperties = { fontFamily: SERIF, fontWeight: 500, color: WHITE, whiteSpace: "nowrap", lineHeight: 1 };

/** Fraunces 500 caps: average advance relative to the font size, for the spaced info lines. */
const fitSerif = (t: string, width: number, max: number, track: number) => Math.max(11, Math.min(max, width / Math.max(1, plain(t).length * (0.66 + track))));

/** Soft out-of-focus lights, low and wide, as the reference's blurred stand. */
function discs(seed: number, tint: string) {
  const r = rng(seed * 31 + 9);
  return Array.from({ length: 16 }, () => {
    const y = Math.pow(r(), 1.6) * 760;
    return { x: r() * CANVAS_W, y, r: 40 + r() * 130, c: r() < 0.2 ? tint : r() < 0.55 ? "#dfe7ee" : "#efe6d6", a: 0.06 + r() * 0.13, blur: 12 + r() * 20 };
  });
}

/**
 * Half-solid "MATCHDAY" (FC Barcelona): a desaturated, blurred night background, the player's
 * head and shoulders large on the right with his kit still in colour, and a huge condensed title
 * across the top whose first half is solid white and second half only an outline; under it the two
 * crests as white marks either side of a small "v", the tie in a light serif, and the kick-off,
 * the date and the ground in widely spaced serif caps bottom left.
 */
export function Halfline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 29);
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const tint = luminance(base) < 0.06 ? vivid(params.accent) : base;
  const f = matchFacts(data);
  const score = [content.homeGoals, content.awayGoals].every((g) => g != null && String(g) !== "") ? `${content.homeGoals}–${content.awayGoals}` : "";

  /* ---- the player: head and shoulders, right of centre ---- */
  const right = params.side !== "left";
  const faceX = right ? 730 + r() * 40 : 350 - r() * 40;
  const sizes = { chest: 430, waist: 405, knees: 370, full: 335 };
  // The title owns the top of the frame: whatever his face measures, his hair starts just under it.
  const probe = portraitBox(data, faceX, 600, sizes, 2.1);
  const fig = portraitBox(data, faceX, 300 + probe.faceH * 0.74 + r() * 22, sizes, 2.1);

  /* ---- the title ---- */
  const kick = content.kicker.toUpperCase().replace(/’/g, "'").trim();
  const tracking = -0.018;
  const maxW = CANVAS_W - 2 * X0;
  const em = Math.max(0.6, barlowEm(kick, tracking));
  const size = Math.min(300, maxW / em) * (params.textScale ?? 1);
  const textW = em * size;
  const split = halfPoint(kick, tracking) * size;
  const cap = size * BARLOW_CAP;
  const PAD = 46;
  const titleTop = 132;
  const titleCss: CSSProperties = {
    position: "absolute",
    left: X0 - PAD,
    top: titleTop - PAD,
    padding: PAD,
    boxSizing: "content-box",
    width: textW,
    fontFamily: BARLOW,
    fontWeight: 900,
    fontSize: size,
    lineHeight: `${cap}px`,
    letterSpacing: `${tracking}em`,
    whiteSpace: "nowrap",
  };
  // The solid half always falls on the empty side of the frame, the outline over the player.
  const headClip = `inset(0 ${Math.max(0, textW + PAD - split)}px 0 0)`;
  const tailClip = `inset(0 0 0 ${PAD + split}px)`;

  /* ---- teams, tie and info ---- */
  const ours = data.club?.name ?? "";
  const weHost = content.home ?? ((content.homeTeam ?? "").toUpperCase() === ours.toUpperCase() ? true : (content.awayTeam ?? "").toUpperCase() === ours.toUpperCase() ? false : undefined);
  // Always home then away, so the crests and the score read in the same order.
  const crests = ((weHost === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]).slice(0, 2);
  const teamA = content.homeTeam || (weHost === false ? f.opp : ours);
  const teamB = content.awayTeam || (weHost === false ? ours : f.opp);
  const tie = postType === "goal" || postType === "result" ? [teamA, score || "V", teamB].filter(Boolean).join("  ") : [teamA, teamB].filter(Boolean).join("  VS  ");

  const stats = shortFacts(data, 3)
    .map((s) => `${s.value} ${s.label.toUpperCase()}`)
    .join("   ·   ");
  const info: string[] =
    postType === "matchday"
      ? [[f.time, f.date].filter(Boolean).join("  ·  "), f.venue || f.comp]
      : [[postType === "result" ? "FULL TIME" : content.kicker.toUpperCase(), f.date].filter(Boolean).join("  ·  "), stats || f.venue || f.comp];
  const infoLines = info.filter(Boolean);

  const crestFilter = `${params.crestColor ? "" : "url(#halfline-mono) "}drop-shadow(0 5px 16px rgba(0,0,0,.55))`;
  const scene = sceneOf(data);
  const bg = scene ?? data.bgPhotoUrl;
  // The column of crests and times always sits on the side the player leaves free.
  const col: CSSProperties = right ? { left: X0 } : { right: X0, textAlign: "right" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: INK, color: WHITE }}>
      <MonoDefs id="halfline-mono" ink={0.72} />

      {/* Desaturated, blurred night background with soft lights. */}
      {bg && (
        <img
          src={bg}
          alt=""
          style={{ position: "absolute", left: -80, top: -80, width: CANVAS_W + 160, height: CANVAS_H + 160, maxWidth: "none", objectFit: "cover", filter: `blur(${scene ? 22 : 38}px) grayscale(.72) brightness(.5) contrast(1.12)` }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(175deg, #23272b 0%, #14171a 42%, ${INK} 100%)`, opacity: bg ? 0.55 : 1 }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {discs(params.seed ?? 29, tint).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={d.a} style={{ filter: `blur(${d.blur}px)`, mixBlendMode: "screen" }} />
        ))}
      </svg>

      {/* The player: kit in colour, everything around him pushed down into the dark. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 26px 46px rgba(0,0,0,.6))" }}>
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
              filter: "contrast(1.1) saturate(1.02) brightness(.96)",
              ...(data.photoIsCutout ? cutMask(data.cut) : photoOval(fig)),
            }}
          />
        </div>
      )}
      {/* Light falls from the upper left; the far side of him sinks into the background. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${right ? 255 : 105}deg, rgba(0,0,0,.55), transparent 42%)`, mixBlendMode: "multiply", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,11,13,.55) 0%, transparent 22%, transparent 70%, rgba(10,11,13,.82) 100%)", pointerEvents: "none" }} />

      {/* The title: the same word twice, one half solid, the other only its outline. */}
      <div data-bleed style={{ ...titleCss, color: WHITE, clipPath: right ? headClip : tailClip }}>
        {kick}
      </div>
      <div data-bleed style={{ ...titleCss, color: "transparent", WebkitTextStroke: `${Math.max(2.4, size * 0.018).toFixed(1)}px ${WHITE}`, clipPath: right ? tailClip : headClip }}>
        {kick}
      </div>

      {/* Crests, the tie and the kick-off: a quiet column down the empty side. */}
      <div style={{ position: "absolute", ...col, top: titleTop + cap + 78, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 26 }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <img src={crests[0]} alt="" style={{ width: 96, height: 96, objectFit: "contain", filter: crestFilter }} />
            {crests[1] && (
              <>
                <span style={{ ...LIGHT, fontSize: 40, fontStyle: "italic", opacity: 0.85 }}>v</span>
                <img src={crests[1]} alt="" style={{ width: 96, height: 96, objectFit: "contain", filter: crestFilter }} />
              </>
            )}
          </div>
        )}
        {tie && (
          <div style={{ ...LIGHT, fontSize: fitSerif(tie, 460, 31, 0.02), letterSpacing: "0.02em", textShadow: "0 2px 14px rgba(0,0,0,.6)" }}>{tie}</div>
        )}
      </div>

      {/* Kick-off, date and ground, widely spaced. */}
      <div style={{ position: "absolute", ...col, bottom: 108, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 20 }}>
        {infoLines.map((t, i) => (
          <div key={i} style={{ ...LIGHT, fontSize: fitSerif(t, 560, i ? 27 : 31, 0.2), letterSpacing: "0.2em", opacity: i ? 0.8 : 1, textShadow: "0 2px 14px rgba(0,0,0,.6)" }}>
            {t}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} height={24} style={{ position: "absolute", ...(right ? { right: X0 } : { left: X0 }), top: 58, opacity: 0.85, filter: "drop-shadow(0 2px 10px rgba(0,0,0,.7))" }} />
      <Film strength={0.75} />
    </div>
  );
}
