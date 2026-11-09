/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask, Film } from "./fx";
import { rng } from "./kit";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { photoOval, portraitBox } from "./versus";

const WHITE = "#ffffff";

/** Archivo Black: average advance of its capitals relative to the font size. */
const AB_W = 0.8;

/** Compound kickers split where a designer would ("MATCH" / "DAY"). */
const COMPOUNDS: [RegExp, number][] = [
  [/^(MATCH|GAME)DAY$/, -3],
  [/^FULLTIME$/, 4],
  [/^HAT-?TRICK$/, 3],
];

/** The chrome front word and the club-colour word behind it. `stacked`: the back word reads first (above). */
export function titleWords(kicker: string, fallback: string): { front: string; back: string; stacked: boolean } {
  const k = kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").trim();
  const words = k.split(/\s+/).filter(Boolean);
  const joined = words.join("");
  const c = COMPOUNDS.find(([re]) => re.test(joined));
  if (c) {
    const at = c[1] < 0 ? joined.length + c[1] : c[1];
    return { front: joined.slice(0, at).replace(/-$/, ""), back: joined.slice(at).replace(/^-/, ""), stacked: false };
  }
  if (words.length === 2 && /^(DAY|TIME)$/.test(words[1])) return { front: words[0], back: words[1], stacked: false };
  if (words.length >= 2) return { front: words[words.length - 1], back: words.slice(0, -1).join(" "), stacked: true };
  return { front: joined, back: fallback.toUpperCase(), stacked: false };
}

/**
 * Chrome lettering in SVG: a white→steel→white vertical gradient with a hard horizon line, a dark outline
 * drawn under the fill, a thin top highlight and a lens glint on one letter.
 */
function ChromeWord({ text, cx, baseline, width, size, id, glint }: { text: string; cx: number; baseline: number; width: number; size: number; id: string; glint: number }) {
  const pad = 40;
  const h = size * 1.1;
  return (
    <svg width={width + pad * 2} height={h + pad} style={{ position: "absolute", left: cx - width / 2 - pad, top: baseline - size * 0.9 - pad / 2, overflow: "visible", filter: "drop-shadow(0 14px 22px rgba(0,0,0,.45))" }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1={pad / 2 + size * 0.18} x2="0" y2={pad / 2 + size * 0.9} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#f4f4f6" />
          <stop offset="0.5" stopColor="#c3c5cb" />
          <stop offset="0.53" stopColor="#8f929a" />
          <stop offset="0.6" stopColor="#dcdde1" />
          <stop offset="0.85" stopColor="#ffffff" />
          <stop offset="1" stopColor="#aeb0b7" />
        </linearGradient>
        <linearGradient id={`${id}-hl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g style={{ fontFamily: ARCHIVO_BLACK, fontSize: size }}>
        {/* Dark bevel outline, then the metal. */}
        <text x={pad} y={pad / 2 + size * 0.9} textLength={width} lengthAdjust="spacingAndGlyphs" fill="#1a1b1f" stroke="#1a1b1f" strokeWidth={size * 0.07} strokeLinejoin="round">
          {text}
        </text>
        <text x={pad} y={pad / 2 + size * 0.9} textLength={width} lengthAdjust="spacingAndGlyphs" fill={`url(#${id}-g)`} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1.2}>
          {text}
        </text>
      </g>
      {/* Lens glint: a four-point star on the top edge of one letter. */}
      <g transform={`translate(${pad + glint * width}, ${pad / 2 + size * 0.2})`} style={{ mixBlendMode: "screen" }}>
        <ellipse rx={size * 0.5} ry={2.2} fill={`url(#${id}-hl)`} />
        <ellipse rx={2.2} ry={size * 0.22} fill="#fff" opacity={0.85} />
        <circle r={7} fill="#fff" />
        <circle r={20} fill="#fff" opacity={0.25} />
      </g>
    </svg>
  );
}

/** Angular club-colour bands with bokeh inside, over light grey (the Bayern "MATCH DAY" background). */
function Bands({ color, seed, flip }: { color: string; seed: number; flip: boolean }) {
  const r = rng(seed);
  const deep = shade(color, -0.35);
  const light = shade(color, 0.35);
  // Chevron bands at 45°, their positions nudged by the seed.
  const a = 300 + r() * 60;
  const b = 820 + r() * 60;
  const shapes = [
    // Top-left: a thick band from the left edge up to the top, and a thinner echo inside it.
    `M0 ${a + 120} L${a + 120} 0 L${a + 300} 0 L0 ${a + 300} Z`,
    `M0 ${a - 70} L${a - 70} 0 L${a - 10} 0 L0 ${a - 10} Z`,
    // Top-right corner bracket.
    `M${b} 0 L1080 0 L1080 ${1080 - b + 200} L${1080 - 110} ${1080 - b + 90} L${1080 - 110} 110 L${b + 110} 110 Z`,
    // Right: a long band running down behind the shoulder.
    `M1080 ${380 + r() * 40} L1080 ${600 + r() * 40} L700 980 L700 760 Z`,
    // Left: a notched block at mid height.
    `M0 ${700 + r() * 40} L110 ${800 + r() * 40} L110 1010 L0 1060 Z`,
  ];
  const dots = Array.from({ length: 70 }, () => ({ x: r() * 1080, y: r() * 1100, s: 6 + r() * 28, o: 0.25 + r() * 0.6 }));
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, transform: flip ? "scaleX(-1)" : undefined }} data-bleed>
      <defs>
        <linearGradient id="chr-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.6" stopColor={shade(color, -0.12)} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <clipPath id="chr-clip">
          {shapes.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <filter id="chr-bokeh" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="chr-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      {/* A soft shadow under the bands, so they sit on the grey like printed plates. */}
      <g opacity={0.28} filter="url(#chr-soft)" transform="translate(10 16)">
        {shapes.map((d, i) => (
          <path key={i} d={d} fill="#000" />
        ))}
      </g>
      {shapes.map((d, i) => (
        <path key={i} d={d} fill="url(#chr-band)" />
      ))}
      <g clipPath="url(#chr-clip)" filter="url(#chr-bokeh)">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={i % 3 ? light : "#ffffff"} opacity={d.o * (i % 3 ? 0.55 : 0.3)} />
        ))}
      </g>
      {/* Hard light edge on each band. */}
      <g fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2}>
        {shapes.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Three small dots under each info column. */
const Dots = ({ color }: { color: string }) => (
  <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 5, height: 5, borderRadius: 5, background: color }} />
    ))}
  </div>
);

type Col = { small?: string; big?: string; bigColor?: string; tag?: [string, string]; smallAfter?: string };

/**
 * Wolfsburg v Bayern "MATCH DAY": light grey, grainy background cut by angular club-colour bands with
 * bokeh inside; the player waist-up and big, smiling at the camera; both crests with "vs" on his chest;
 * a heavy chrome "MATCH" with "DAY" in the club colour, italic and outlined, behind it; three small
 * info columns at the foot (teams + kick-off box, venue, name + position), each with three dots.
 */
export function Chrome({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 29;
  const r = rng(seed);
  const flip = params.side === "left";
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const club = luminance(base) < 0.05 ? vivid(params.accent) : base;
  // Light club colours (yellow, sky) need a deeper tone for the bands on light grey.
  const band = luminance(club) > 0.45 ? shade(club, -0.25) : club;
  // Club-colour print on the dark foot: black clubs print in light grey instead.
  const hot = luminance(club) < 0.08 ? "#d9dadd" : luminance(club) < 0.15 ? shade(club, 0.4) : shade(club, 0.12);
  const ts = params.textScale ?? 1;

  // ---- the player: waist-up, big, centred ----
  const shift = (flip ? -1 : 1) * (20 + r() * 40);
  const fig = portraitBox(data, 540 + shift, 200, { chest: 260, waist: 215, knees: 165, full: 130 }, 1.5);

  // ---- title ----
  const { front, back, stacked } = titleWords(content.kicker, content.lastName || content.firstName || "");
  const frontW = Math.min(960, [...front].length * 190) * ts;
  const frontSize = Math.min(250 * ts, frontW / Math.max(1, [...front].length * AB_W));
  const baseline = 1098;
  const backSize = stacked ? Math.min(150, 940 / Math.max(1, [...back].length * 0.72)) : Math.min(frontSize * 1.45, 1000 / Math.max(1, [...back].length * 0.78));
  // Compound: "DAY" centred behind "MATCH", a little higher, so it shows above and below it.
  const frontMid = baseline - frontSize * 0.36;
  const backTop = stacked ? baseline - frontSize * 0.72 - backSize * 0.92 : frontMid - 56 - backSize * (0.36 + 0.17);

  // ---- crests "vs" on the chest ----
  const crests = crestsOf(data);
  const score = scoreOf(data, "-");
  const chest = fig.faceTop + fig.faceH * 2.6;
  const crestY = Math.max(660, Math.min(backTop - 150, chest));
  const showCrests = postType !== "potm" ? crests : ([data.club?.crestUrl].filter(Boolean) as string[]);
  const mid = (postType === "result" || postType === "goal") && score ? score : showCrests.length === 2 ? "vs" : "";

  // ---- foot columns ----
  const home = (content.homeTeam || "").toUpperCase();
  const away = (content.awayTeam || "").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const pos = [(data.player.position || "").toUpperCase(), data.player.number ? `#${data.player.number}` : ""].filter(Boolean).join(" ");
  const cols: Col[] = [];
  if (postType === "potm") {
    // Only numbers worth showing: no zeros.
    const facts = content.stats.filter((s) => s.value && String(s.value) !== "0").slice(0, 2);
    facts.forEach((f) => cols.push({ small: f.label.toUpperCase(), big: String(f.value).toUpperCase() }));
    if (!facts.length) cols.push({ small: (content.subline || "").toUpperCase(), big: content.kicker.toUpperCase() });
  } else {
    if (home || away) {
      const tag: [string, string] | undefined =
        postType === "matchday" && content.time ? ["KICK OFF", content.time.replace(":", ".")] : undefined;
      cols.push({ small: home && away ? `${home} VERSUS` : "VERSUS", big: away || home, tag });
    }
    const where = (content.venue || "").toUpperCase();
    const when = (content.date || "").toUpperCase();
    const round = (content.subline || "").split("·").map((s) => s.trim()).filter((s) => s && !/^VS\b/i.test(s)).join(" · ").toUpperCase();
    if (where || when) cols.push({ big: where || when, bigColor: hot, smallAfter: where ? when : round });
    else if (round) cols.push({ big: round, bigColor: hot });
  }
  cols.push({ small: name, big: pos || (data.club?.name ?? "").toUpperCase(), bigColor: hot });
  const colW = (CANVAS_W - 120 - (cols.length - 1) * 36) / cols.length;
  // Long lines (a sponsor-named league) wrap onto two lines rather than shrinking to nothing.
  const bigFit = (t: string) => Math.max(21, Math.min(30, colW / Math.max(1, [...t].length * 0.64)));
  const smallFit = (t: string) => Math.min(21, colW / Math.max(1, [...t].length * 0.6));

  const column = (c: Col, i: number): ReactNode => (
    <div key={i} style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, whiteSpace: "nowrap" }}>
      {c.small && <div style={{ fontFamily: ARCHIVO, fontWeight: 400, fontSize: smallFit(c.small), letterSpacing: "0.02em", color: WHITE, opacity: 0.92 }}>{c.small}</div>}
      {c.big && <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontStyle: "italic", fontSize: /^[\d.,+%-]+$/.test(c.big) ? 46 : bigFit(c.big), letterSpacing: "0.03em", lineHeight: 1.08, whiteSpace: "normal", color: c.bigColor ?? WHITE }}>{c.big}</div>}
      {c.smallAfter && <div style={{ fontFamily: ARCHIVO, fontWeight: 400, fontSize: smallFit(c.smallAfter), letterSpacing: "0.02em", color: WHITE, opacity: 0.85 }}>{c.smallAfter}</div>}
      {c.tag && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontFamily: ARCHIVO, fontSize: 17, letterSpacing: "0.04em" }}>
          <span style={{ color: hot, fontWeight: 600 }}>{c.tag[0]}</span>
          <span style={{ opacity: 0.6 }}>-</span>
          <span style={{ background: band, color: WHITE, padding: "3px 9px 2px", fontWeight: 600, border: "1px solid rgba(255,255,255,.35)" }}>{c.tag[1]}</span>
        </div>
      )}
      {!c.tag && <Dots color={hot} />}
    </div>
  );

  const crestImg = (src: string, key: number) => (
    <img key={key} src={src} alt="" style={{ width: 150, height: 150, objectFit: "contain", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.45))" }} />
  );
  const backStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: backTop,
    textAlign: "center",
    fontFamily: ARCHIVO_BLACK,
    fontStyle: "italic",
    fontSize: backSize,
    lineHeight: 1,
    whiteSpace: "nowrap",
    transform: "skewX(-10deg)",
    color: stacked ? WHITE : band,
    WebkitTextStroke: `${stacked ? 3 : 4}px ${stacked ? band : shade(band, -0.45)}`,
    opacity: stacked ? 1 : 0.92,
    textShadow: `0 0 30px ${shade(band, -0.3)}66`,
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#d4d4d6", color: WHITE }}>
      {/* Light grey studio with a brighter centre. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% 35%, #f3f3f4, #dcdcde 55%, #b9b9bd 100%)" }} />
      <Bands color={band} seed={seed + 7} flip={flip} />

      {/* The player. The drop shadow lives on a wrapper (a masked img with its own shadow draws a box on light grey). */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 26px 40px rgba(0,0,0,.35))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.05)", ...(data.photoIsCutout ? cutMask(data.cut) : photoOval(fig)) }} />
        </div>
      )}

      {/* The foot sinks into a deep club tone, so the chrome title and the small print read. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 52%, ${shade(band, -0.55)}99 70%, ${shade(band, -0.72)}f0 84%, ${shade(band, -0.8)} 100%)` }} />

      {/* Crests with "vs" on his chest. */}
      {showCrests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestY - 75, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          {showCrests[0] && crestImg(showCrests[0], 0)}
          {mid === "vs" && (
            <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontStyle: "italic", fontSize: 40, color: WHITE, lineHeight: 1, WebkitTextStroke: "1px rgba(0,0,0,.35)", textShadow: "0 2px 4px rgba(0,0,0,.7), 0 3px 14px rgba(0,0,0,.6)", minWidth: 50, textAlign: "center" }}>vs</div>
          )}
          {mid && mid !== "vs" && (
            <div style={{ position: "relative", width: [...mid].length * 62, height: 110 }}>
              <ChromeWord text={mid} cx={[...mid].length * 31} baseline={92} width={[...mid].length * 58} size={96} id="chr-s" glint={0.75} />
            </div>
          )}
          {showCrests[1] && crestImg(showCrests[1], 1)}
        </div>
      )}

      {/* "DAY" behind, then the chrome "MATCH". */}
      {back && <div style={backStyle}>{back}</div>}
      <ChromeWord text={front} cx={540} baseline={baseline} width={frontW} size={frontSize} id="chr" glint={0.2 + r() * 0.5} />

      {/* Foot: three columns. */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1150, display: "flex", justifyContent: "space-between", gap: 36 }}>{cols.map(column)}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: 60, bottom: 36, opacity: 0.8 }} />
      <Film strength={1.6} />
    </div>
  );
}
