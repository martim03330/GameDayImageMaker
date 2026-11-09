/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { lift, PRINT_GRAIN } from "./column";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, BEBAS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { MonoDefs } from "./wall";

const WHITE = "#ffffff";

/** Bebas Neue: capital height and average advance, relative to the font size. */
const CAP = 0.7;
const ADV = 0.4;

/** Archivo caps: average advance relative to the size (plus tracking). */
const fitCaps = (t: string, width: number, max: number, tracking = 0.06) => Math.min(max, width / Math.max(1, [...t].length * (0.7 + tracking)));

/** Words that are never the club's short name ("FC", "Clube", "de"…). */
const WEAK = new Set(["FC", "SC", "CF", "CD", "AC", "AS", "SS", "SL", "SV", "VFB", "VFL", "TSG", "RC", "RCD", "CA", "UD", "SD", "AD", "GD", "CS", "FK", "NK", "HNK", "PFC", "KV", "KRC", "AFC", "US", "USC", "OAF", "SAD", "EST", "CLUBE", "CLUB", "ASSOCIAÇÃO", "ASSOCIACAO", "GRUPO", "DESPORTIVO", "DESPORTIVA", "FUTEBOL", "FOOTBALL", "DE", "DA", "DO", "DOS", "DAS", "E", "OF", "THE"]);

/** "UD Leiria" → "LEIRIA", "Valletta FC" → "VALLETTA", "Cherno More" → "CHERNO MORE" (short enough to keep whole). */
export function shortClubName(name: string): string {
  const words = name
    .toUpperCase()
    .replace(/\./g, "")
    .split(/\s+/)
    .filter((w) => w && !WEAK.has(w) && !/^\d+$/.test(w));
  if (!words.length) return name.toUpperCase().slice(0, 10);
  const whole = words.join(" ");
  if (whole.replace(/\s/g, "").length <= 9 && words.length <= 2) return whole;
  return words.find((w) => w.length >= 4) ?? words[0];
}

/** Background, big-letter and small-text colours that always read (light clubs get a darker ground). */
function palette(data: RenderData): { bg: string; letters: string; text: string } {
  const p = data.params;
  const raw = p.primary === "#10131c" ? p.accent : p.primary;
  const acc = p.accent;
  let bg = hueOf(raw) !== null ? vivid(raw) : raw;
  if (luminance(bg) > 0.62) bg = hueOf(acc) !== null && luminance(vivid(acc)) < 0.55 ? vivid(acc) : "#1f2c4a";
  if (luminance(bg) < 0.03) bg = "#1c1e24";
  // Letters: the club's dark second colour when it has one, else a deep shade of the ground.
  const accDark = luminance(acc) < 0.16 && luminance(acc) > 0.004 && acc.toLowerCase() !== bg.toLowerCase() && hueOf(acc) !== null;
  let letters = accDark ? acc : shade(bg, luminance(bg) > 0.4 ? -0.62 : -0.5);
  // A very dark ground (navy / black club): the letters go lighter instead.
  if (luminance(bg) < 0.06) letters = shade(bg, 0.24);
  const text = luminance(bg) > 0.5 ? shade(bg, -0.75) : WHITE;
  return { bg, letters, text };
}

/**
 * Bold club-name poster (Bahia "FINAL", Futbrall): a flat, saturated club-colour sheet with paper grain; the
 * club's short name gigantic in tall condensed letters of its dark second colour; the player in action in
 * front, ball and shadow on the floor. Small white bold caps inside the first letter (competition, date,
 * venue, kick-off); the round spaced vertically up the left and down the right; both crests as white marks
 * stacked on the left (upper) and right (lower) edges; the two team names small by his hand; logos at the foot.
 */
export function Clubname({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 63);
  const mirror = params.side === "left";
  const { bg, letters, text } = palette(data);
  const md = matchFacts(data);
  const score = scoreOf(data, "-");
  const ts = params.textScale ?? 1;
  const lightBg = text !== WHITE;

  // ---- the giant word ----
  const word = shortClubName(data.club?.name || content.homeTeam || "CLUB");
  // An accented capital (ACADÉMICA) needs headroom: its mark stretches with the letters (~0.3 of their height).
  const accented = /[À-ÖØ-Þ]/.test(word);
  const L = { left: 150, right: 930, top: accented ? 1160 - (1160 - 60) / 1.32 : 250, bottom: 1160 };
  const W = L.right - L.left;
  const H = L.bottom - L.top;
  const n = Math.max(3, [...word].length);
  // Between squeezing and stretching: a size where the letters are neither hairlines nor slabs.
  const fW = W / (n * ADV);
  const fH = H / CAP;
  const size = Math.sqrt(fW * fH);
  const sy = H / (CAP * size);

  // ---- the player, in front, feet just past the letters' foot ----
  const cx = 540 + (mirror ? -30 : 30) + (r() - 0.5) * 40;
  const floor = 1228;
  const headTop = 410;
  let placed = standing(data, { cx, headTop, floor, maxFace: 105, framing: "full" });
  // A wide pose (a kick) must stay between the edge columns (crests, verticals): smaller, centred on its box.
  const maxW = 700;
  if (placed.width > maxW) {
    const k = maxW / placed.width;
    const first = standing(data, { cx, headTop: floor - (floor - headTop) * k, floor, maxFace: 105, framing: "full" });
    placed = standing(data, { cx: cx + (540 - (first.left + first.width / 2)), headTop: floor - (floor - headTop) * k, floor, maxFace: 105, framing: "full" });
  }
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.3);
  // Mirrored: the info moves into the last letter, the teams to the left, crests and verticals swap edges.
  const near = (x: number): CSSProperties => (mirror ? { right: x } : { left: x });
  const far = (x: number): CSSProperties => (mirror ? { left: x } : { right: x });

  // ---- words ----
  const round = md.round || (content.kicker || "").toUpperCase();
  const kicker = content.kicker.toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const vLeft = postType === "matchday" ? round : kicker;
  const vRight = postType === "matchday" ? round : name || kicker;
  const vSize = (t: string) => Math.min(30, 470 / Math.max(1, [...t].length * 1.3));

  const info =
    postType === "matchday"
      ? [md.comp, md.date, md.venue, md.time]
      : postType === "result"
        ? [md.comp, md.round, "FULL TIME", md.date]
        : [md.comp, md.round || md.date, kicker];
  const lines = info.filter(Boolean).slice(0, 5);
  // Long venues wrap onto two lines rather than shrinking everything.
  const infoW = 270;
  const wrapped = lines.flatMap((l) => {
    // Greedy wrap at ~16 characters (a long competition or venue takes two or three short lines).
    const out: string[] = [];
    for (const w of l.split(/\s+/)) {
      const last = out[out.length - 1];
      if (last && (last + " " + w).length <= 16) out[out.length - 1] = last + " " + w;
      else out.push(w);
    }
    return out;
  }).slice(0, 7);
  const infoSize = Math.min(29 * ts, ...wrapped.map((l) => fitCaps(l, infoW, 29)));

  // Team names by his hand (with the score after a game).
  const home = (content.homeTeam || "").toUpperCase();
  const away = (content.awayTeam || "").toUpperCase();
  const teams = home && away ? [home + (score ? `  ${content.homeGoals}` : ""), away + (score ? `  ${content.awayGoals}` : "")] : [];
  const teamSize = Math.min(34, ...teams.map((t) => fitCaps(t, 250, 34, 0.02)));

  // Home crest first, then away: the same order as the fixture.
  const crests = crestsOf(data);
  const crestStyle: CSSProperties = { width: 78, height: 78, objectFit: "contain", filter: lightBg ? "brightness(0) opacity(.8)" : "url(#clubname-mono)" };
  const crestStack = (s: CSSProperties) => (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...s }}>
      {crests.map((c, i) => (
        <img key={i} src={c} alt="" style={crestStyle} />
      ))}
    </div>
  );
  const vertical = (t: string, s: CSSProperties, up: boolean) => (
    <div
      style={{
        position: "absolute",
        writingMode: "vertical-rl",
        transform: up ? "rotate(180deg)" : undefined,
        fontFamily: ARCHIVO,
        fontWeight: 500,
        fontSize: vSize(t),
        letterSpacing: "0.55em",
        color: text,
        whiteSpace: "nowrap",
        ...s,
      }}
    >
      {t}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg }}>
      <MonoDefs id="clubname-mono" ink={0.25} />
      {/* Paper: soft mottling and fine grain. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 35%, rgba(255,255,255,.07), transparent 60%), radial-gradient(90% 60% at 50% 100%, rgba(0,0,0,.18), transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.3, mixBlendMode: "multiply" }} />

      {/* The club's name, tall and condensed (data-bleed: the checker measures it unscaled). */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text
          x={L.left}
          y={L.bottom}
          textLength={W}
          lengthAdjust="spacingAndGlyphs"
          transform={`translate(0 ${L.bottom}) scale(1 ${sy}) translate(0 ${-L.bottom})`}
          style={{ fontFamily: BEBAS, fontSize: size, letterSpacing: size * 0.03 }}
          fill={letters}
        >
          {word}
        </text>
      </svg>

      {/* Info inside the first letters. */}
      <div style={{ position: "absolute", ...near(L.left + 34), top: L.top + 70, width: infoW, textAlign: mirror ? "right" : "left", color: WHITE, fontFamily: ARCHIVO, fontWeight: 800, fontSize: infoSize, lineHeight: 1.18, letterSpacing: "0.06em", textShadow: "0 1px 6px rgba(0,0,0,.25)" }}>
        {wrapped.map((l, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </div>

      {/* Floor shadow, then the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 300, width: 600, top: floor - 40, height: 80, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.32), rgba(0,0,0,0))", filter: "blur(8px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 170, width: 340, top: floor - 16, height: 30, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,0))", filter: "blur(5px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 14px 22px rgba(0,0,0,.28))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.04)", ...figMask }}
          />
        </div>
      )}

      {/* Crests: left edge upper, right edge lower. */}
      {crests.length > 0 && crestStack({ ...near(56), top: L.top + 50 })}
      {crests.length > 0 && crestStack({ ...far(56), bottom: CANVAS_H - L.bottom + 20 })}

      {/* The round, spaced, up the left and down the right. */}
      {vLeft && vertical(vLeft, { ...near(72), bottom: CANVAS_H - L.bottom + 10 }, true)}
      {vRight && vertical(vRight, { ...far(72), top: L.top + 40 }, false)}

      {/* The two teams by his hand. */}
      {teams.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: box.faceTop + 6,
            ...far(CANVAS_W - L.right + 26),
            textAlign: mirror ? "left" : "right",
            color: WHITE,
            fontFamily: ARCHIVO,
            fontWeight: 800,
            fontSize: teamSize,
            lineHeight: 1.08,
            letterSpacing: "0.02em",
            whiteSpace: "pre",
            textShadow: "0 2px 10px rgba(0,0,0,.3)",
          }}
        >
          {teams.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={34} onLight={lightBg} />
      </div>
    </div>
  );
}
