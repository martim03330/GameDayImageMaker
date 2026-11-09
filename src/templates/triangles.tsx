/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { ANTON, em } from "./mist";
import { AgencyLogo, DISPLAY, GROTESK, positionAbbr, SANS, SERIF } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { titleCase } from "./wall";

const PAPER = "#f2f1ee";
const INK = "#1c1d21";
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** "Sporting Clube de Portugal" → "SCP", "Benfica" → "BENFICA": the club's monogram. */
export function initialsOf(name: string): string {
  const words = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const keep = words.filter((w) => !/^(de|da|do|dos|das|e|of|the|and|y|del|la|le)$/i.test(w));
  // Acronyms stay whole ("Valletta FC" → "VFC", "SC Braga" → "SCB").
  if (keep.length >= 2) return keep.map((w) => (/^[A-Z]{2,3}$/.test(w) ? w : w[0].toUpperCase())).join("").slice(0, 4);
  return (keep[0] ?? words[0] ?? "").slice(0, 8).toUpperCase();
}

/**
 * Colour pop kept to the kit (like award's): only strongly saturated pixels of the club hues keep their
 * colour, so the face, the skin and the hair go black and white while the shirt stays in colour.
 * Several hues can be kept (a club whose kit is its second colour).
 */
export function KitPopDefs({ id, hue, hues }: { id: string; hue?: number; hues?: number[] }) {
  const list = (hues ?? [hue ?? 0]).filter((h, i, a) => a.findIndex((x) => Math.min(Math.abs(x - h), 360 - Math.abs(x - h)) < 25) === i);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        {list.map((h, i) => {
          // Reds, oranges and yellows sit next to skin tones: only strong kit colour survives. Greens and
          // blues never touch skin, so darker, duller shirts of those hues keep their colour too.
          const skinNear = h < 60 || h > 330;
          return [
            <feColorMatrix key={`r${i}`} in="SourceGraphic" type="hueRotate" values={String(-h)} result={`rot${i}`} />,
            <feColorMatrix
              key={`s${i}`}
              in={`rot${i}`}
              type="matrix"
              values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${skinNear ? "3 -1.5 -1.5 0 -0.7" : "4 -2 -2 0 -0.28"}`}
              result={`sel${i}`}
            />,
          ];
        })}
        <feMerge result="sel">
          {list.map((_, i) => (
            <feMergeNode key={i} in={`sel${i}`} />
          ))}
        </feMerge>
        <feGaussianBlur in="sel" stdDeviation="1.2" result="selSoft" />
        <feComposite in="SourceGraphic" in2="selSoft" operator="in" result="colour" />
        <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="grey" />
        <feComponentTransfer in="grey" result="greyC">
          <feFuncR type="linear" slope="1.2" intercept="-0.06" />
          <feFuncG type="linear" slope="1.2" intercept="-0.06" />
          <feFuncB type="linear" slope="1.2" intercept="-0.06" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="greyC" />
          <feMergeNode in="colour" />
        </feMerge>
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}

/** Stat label → the tiny lowercase abbreviation of the reference ("26.gp 04.gls 04.ast"). */
function abbr(label: string): string {
  const l = label.toLowerCase();
  const table: [RegExp, string][] = [
    [/game|match|app/, "gp"],
    [/clean/, "cs"],
    [/goal/, "gls"],
    [/assist/, "ast"],
    [/minute|mins/, "min"],
    [/save/, "sv"],
    [/rating/, "rtg"],
    [/shot/, "sh"],
    [/tackle/, "tkl"],
    [/pass/, "pas"],
    [/start/, "st"],
    [/cap/, "caps"],
  ];
  return table.find(([re]) => re.test(l))?.[1] ?? l.replace(/[^a-z]/g, "").slice(0, 3);
}

/** "4" → "04": the reference prints every count on two digits. */
const pad = (v: string) => (/^\d$/.test(v) ? `0${v}` : v);

type Fact = { value: string; label: string };

/** The numbers row of the bar, per post type. */
function barFacts(data: RenderData): Fact[] {
  const { postType, content, player } = data;
  const m = matchFacts(data);
  const now = new Date();
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const no = player.number ? { value: pad(player.number), label: "no" } : null;
  const pos = positionAbbr(player.position) ? { value: positionAbbr(player.position), label: "pos" } : null;
  const until = content.until ? { value: content.until.replace(/^.*?(\d{4}).*$/, "$1"), label: "until" } : null;
  let facts: (Fact | null)[];
  if (postType === "matchday") {
    facts = [
      m.day ? { value: pad(m.day), label: (m.mon || m.dow).toLowerCase().slice(0, 3) || "day" } : null,
      m.time ? { value: m.time, label: "ko" } : null,
      m.roundNo ? { value: pad(m.roundNo), label: "md" } : m.dow && m.day ? { value: m.dow.slice(0, 3).toUpperCase(), label: "day" } : null,
    ];
  } else if (postType === "transfer") {
    facts = [no, pos, until ?? { value: `${String(year).slice(2)}/${String(year + 1).slice(2)}`, label: "season" }];
  } else if (postType === "renewal") {
    facts = [until, no, pos];
  } else {
    const all = content.stats.filter((s) => s.value !== "" && s.value != null && String(s.value).length <= 5);
    const nonZero = all.filter((s) => Number(s.value) !== 0);
    facts = (nonZero.length >= 2 ? nonZero : all).slice(0, 3).map((s) => ({ value: pad(String(s.value)), label: abbr(s.label) }));
    if (!facts.length) facts = [no, pos];
  }
  return facts.filter(Boolean).slice(0, 3) as Fact[];
}

/** A right-pointing triangle: vertical back edge at x, apex w further on, centred on yc. */
type Tri = [x: number, yc: number, w: number, h: number, c: 0 | 1];

/** Two arrangements in the spirit of the reference (a zig-zag of arrows behind the head). */
const LAYOUTS: Tri[][] = [
  [
    [-30, 185, 250, 300, 0],
    [220, 390, 225, 400, 1],
    [-30, 590, 250, 280, 1],
    [220, 790, 225, 400, 0],
    [555, 190, 335, 400, 1],
    [555, 590, 335, 400, 1],
  ],
  [
    [-30, 250, 240, 380, 1],
    [210, 110, 240, 300, 0],
    [210, 520, 240, 380, 0],
    [-30, 720, 240, 330, 0],
    [560, 300, 330, 440, 1],
    [640, 690, 250, 300, 0],
  ],
];

/**
 * National-team "stats card" (Xavi Simons, Oranje): off-white paper with big flat triangles in the two
 * club colours, a faint giant crest and faint serif club initials behind; the player head-and-shoulders
 * in black and white with only his kit in colour, cut off square by a bar of the second colour; his
 * name up the right side (first name small in a colour tab, surname huge and condensed); a bar of
 * big numbers with tiny lowercase abbreviations; the club's hex codes, colour chips and a small
 * two-line caption as designer's furniture.
 */
export function Triangles({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 47;
  const r = rng(seed);
  const flip = params.side === "left";
  const ts = params.textScale ?? 1;
  const id = `tri-${seed}`;
  const m = matchFacts(data);

  // ---- colours: the club's own two, the second never lost on paper ----
  const rawA = params.primary === "#10131c" ? params.accent : params.primary;
  let c1 = luminance(rawA) > 0.72 ? params.accent : rawA;
  if (luminance(c1) > 0.72) c1 = "#22242a";
  const lumA = luminance(params.accent);
  const c2 =
    params.accent.toLowerCase() !== c1.toLowerCase() && lumA < 0.62 && Math.abs(lumA - luminance(c1)) + (vivid(params.accent) !== vivid(c1) ? 0.1 : 0) > 0.06
      ? params.accent
      : luminance(c1) > 0.2
        ? "#23252c"
        : shade(c1, 0.45);
  const cols = [c1, c2];
  const onC1 = luminance(c1) > 0.42 ? INK : "#ffffff";
  const deep = shade(c1, -0.32);
  const hexes = [params.primary, params.accent, "#3f3f3f"].map((h) => h.toLowerCase()).filter((h, i, a) => a.indexOf(h) === i);
  const hues = [hueOf(vivid(c1)), hueOf(vivid(c2)), hueOf(params.primary), hueOf(params.accent)].filter((h): h is number => h != null);
  const hue = hues[0] ?? null;

  // ---- triangles ----
  const layout = LAYOUTS[Math.floor(r() * LAYOUTS.length)];
  const swap = r() < 0.5 ? 1 : 0;
  const jit = () => (r() - 0.5) * 30;
  const tris = layout.map(([x, yc, w, h, c]) => {
    const X = x + jit();
    const Y = yc + jit();
    const pts: [number, number][] = [
      [X, Y - h / 2],
      [X, Y + h / 2],
      [X + w, Y],
    ];
    return { d: pts.map(([px, py]) => `${(flip ? CANVAS_W - px : px).toFixed(0)},${py.toFixed(0)}`).join(" "), fill: cols[(c + swap) % 2] };
  });

  // ---- the player: head and shoulders, cut square at the bar ----
  const barTop = 1018;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const faceCx = (flip ? 560 : 470) + (r() - 0.5) * 30;
  let faceTop = 290 + r() * 30;
  let faceH = 270 * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(150, data.facePx * 1.5));
  let h = faceH / face[3];
  // The photo must reach the bar: drop the head a little first, then grow.
  const need = barTop + 30;
  if (faceTop + h * (1 - face[1]) < need) faceTop = Math.min(400, need - h * (1 - face[1]));
  if (faceTop + h * (1 - face[1]) < need) h = (need - faceTop) / Math.max(0.2, 1 - face[1]);
  const w = h * aspect;
  const fig = {
    left: faceCx - w * (face[0] + face[2] / 2) + (params.playerX ?? 0),
    top: faceTop - h * face[1] + (params.playerY ?? 0),
    width: w,
    height: h,
  };
  const realFaceH = face[3] * h;
  const cutout = data.photoIsCutout;
  // An original photo becomes a tight panel around the head and shoulders (never a full background).
  const panel = { left: faceCx - 290, right: faceCx + 300, top: Math.max(170, faceTop - realFaceH * 0.9) };
  const playerFilter = hue != null ? `url(#${id}-pop) contrast(1.1)` : "grayscale(1) contrast(1.18)";

  // ---- name up the right side ----
  const first = content.firstName.toLowerCase();
  const last = (content.lastName || content.firstName).toUpperCase();
  const nameX = flip ? 118 : 842;
  const nameLen = 430;
  // The surname crosses the shirt: the second colour, unless it is the kit's own hue (then the darker one).
  const h1 = hueOf(c1);
  const h2 = hueOf(c2);
  const sameHue = h1 != null && h2 != null && Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) < 40;
  const nameInk = sameHue ? (luminance(c1) < luminance(c2) ? c1 : c2) : luminance(c2) > 0.5 ? shade(c1, -0.2) : c2;
  const nameSize = Math.min(128, nameLen / Math.max(1, em(last, ANTON, 45))) * ts;
  const nameW = em(last, ANTON, 45) * nameSize;
  const tabSize = Math.min(34, (nameW * 0.8) / Math.max(2, [...first].length * 0.52));

  // ---- the numbers bar ----
  const facts = barFacts(data);
  const bar = { left: 180, width: 720, top: 1086, height: 116 };
  const unitsW = facts.reduce((a, f) => a + [...f.value].length * 0.62 + 0.25 + [...f.label].length * 0.2, 0) + (facts.length - 1) * 0.5;
  const numSize = Math.min(92, (bar.width - 90) / Math.max(1, unitsW)) * Math.min(1, ts);

  // ---- the strip under the bar ----
  const kicker = content.kicker.toUpperCase().trim();
  let strip: ReactNode;
  const crest = (src: string | null | undefined, key: string) =>
    src ? <img key={key} src={src} alt="" style={{ width: 34, height: 34, objectFit: "contain", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))" }} /> : null;
  const stripText = (t: string, max = 560) => {
    const s = Math.min(19, max / Math.max(1, [...t].length * 0.78));
    return <span style={{ fontSize: s, whiteSpace: "nowrap" }}>{t}</span>;
  };
  if (postType === "matchday") {
    const tail = [m.opp ? (m.oppCrest ? m.opp : `VS ${m.opp}`) : "", m.comp].filter(Boolean).join("  ·  ") || kicker;
    strip = (
      <>
        {crest(m.ourCrest, "a")}
        {m.oppCrest && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, textTransform: "lowercase", opacity: 0.8 }}>v</span>}
        {crest(m.oppCrest, "b")}
        {stripText(tail, m.oppCrest ? 470 : 540)}
      </>
    );
  } else if (postType === "transfer") {
    const from = data.fromClub;
    const to = data.toClub ?? data.club;
    strip = (
      <>
        {crest(from?.crestUrl, "a")}
        {from?.crestUrl && to?.crestUrl && <span style={{ fontSize: 20 }}>→</span>}
        {crest(to?.crestUrl, "b")}
        {stripText([kicker, to?.name?.toUpperCase()].filter(Boolean).join("  ·  "), 470)}
      </>
    );
  } else {
    const extra = postType === "renewal" && content.until ? `UNTIL ${content.until}` : (content.subline.split("·")[0] ?? "").trim().toUpperCase();
    strip = (
      <>
        {crest(data.club?.crestUrl, "a")}
        {stripText([kicker, extra !== kicker ? extra : ""].filter(Boolean).join("  ·  "), 540)}
      </>
    );
  }

  // ---- caption, bottom left ----
  const club = data.club?.name ?? "";
  const round = m.round ? titleCase(m.round) : "";
  const captionLines: string[] =
    postType === "matchday"
      ? [m.venue ? `${titleCase(m.venue)}.` : `${club}.`, [m.comp ? titleCase(m.comp) : "", round, m.time ? `Kick-off ${m.time}` : ""].filter(Boolean).join(", ") + "."]
      : postType === "transfer"
        ? [`${(data.toClub ?? data.club)?.name ?? club}.`, data.fromClub ? `Joins from ${data.fromClub.name}.` : "A new chapter begins."]
        : postType === "renewal"
          ? [`${club}.`, content.until ? `Contract extended until ${content.until}.` : "Contract extended."]
          : [`${club}.`, content.subline ? `${titleCase(content.subline.replace(/\s*·\s*/g, ", "))}.` : "The numbers so far."];

  const initials = initialsOf(club);
  const initSize = Math.min(420, 980 / Math.max(1, initials.length * 0.72));

  const small: CSSProperties = { position: "absolute", fontFamily: SANS, fontWeight: 700, fontSize: 15, letterSpacing: "0.02em", whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      {hue != null && <KitPopDefs id={`${id}-pop`} hues={hues} />}
      {/* Paper: soft light from the upper left and fine grain. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 30% 25%, #fbfaf8, transparent 70%)" }} />

      {/* Faint giant crest and faint serif initials. */}
      {data.club?.crestUrl && (
        <img
          src={data.club.crestUrl}
          alt=""
          data-bleed
          style={{ position: "absolute", left: flip ? 380 : 120, top: -70, width: 600, height: 600, objectFit: "contain", filter: "grayscale(1) contrast(.7) brightness(1.15)", opacity: 0.13, mixBlendMode: "multiply" }}
        />
      )}
      <div
        data-bleed
        style={{ position: "absolute", left: -100, right: -100, top: 470 - initSize * 0.78, textAlign: "center", fontFamily: DMSERIF, fontSize: initSize, lineHeight: 1, color: "rgba(20,20,25,.075)", whiteSpace: "nowrap", letterSpacing: "0.02em" }}
      >
        {initials}
      </div>
      <div data-bleed style={{ position: "absolute", left: 540 - 620, top: 830, width: 1240, height: 1240, borderRadius: "50%", border: "3px solid rgba(20,20,25,.05)" }} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
        {tris.map((t, i) => (
          <polygon key={i} points={t.d} fill={t.fill} />
        ))}
      </svg>
      {/* Faint initials again over the flat colour, so they read across the triangles too. */}
      <div
        data-bleed
        style={{ position: "absolute", left: -100, right: -100, top: 470 - initSize * 0.78, textAlign: "center", fontFamily: DMSERIF, fontSize: initSize, lineHeight: 1, color: "rgba(255,255,255,.09)", whiteSpace: "nowrap", letterSpacing: "0.02em" }}
      >
        {initials}
      </div>

      {/* White bloom behind the head. */}
      <div style={{ position: "absolute", left: faceCx - (flip ? 180 : 360), top: faceTop - 300, width: 540, height: 540, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,.35) 45%, transparent)" }} />

      {/* The player, cut square at the bar. */}
      {data.photoUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: cutout ? `inset(0 0 ${CANVAS_H - barTop}px 0)` : `inset(${panel.top}px ${CANVAS_W - panel.right}px ${CANVAS_H - barTop}px ${panel.left}px)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.28))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", ...fig, maxWidth: "none", filter: playerFilter, ...(cutout ? cutMask({ ...data.cut, bottom: 0 }) : {}) }} />
          </div>
        </div>
      )}
      {/* The bar that cuts him off. */}
      <div style={{ position: "absolute", left: cutout ? 272 : panel.left, width: cutout ? 580 : panel.right - panel.left, top: barTop, height: 30, background: c2 }} />

      {/* Name up the side. */}
      <div style={{ position: "absolute", left: nameX, top: barTop - 6, transform: "rotate(-90deg)", transformOrigin: "0 0", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: nameSize, lineHeight: 0.84, color: nameInk, whiteSpace: "nowrap", paddingTop: nameSize * 0.06, letterSpacing: "0.005em" }}>{last}</div>
        {first && last !== first.toUpperCase() && (
          <div style={{ alignSelf: "flex-end", marginTop: 10, background: c1, color: onC1 === INK ? INK : luminance(c2) < 0.5 ? c2 : "#ffffff", padding: `2px ${tabSize * 0.5}px 6px`, fontFamily: SERIF, fontSize: tabSize, lineHeight: 1.05, whiteSpace: "nowrap" }}>
            {first}
          </div>
        )}
      </div>

      {/* Numbers bar, with its darker strip underneath and a small square of the second colour. */}
      <div style={{ position: "absolute", left: bar.left + 44, width: bar.width - 88, top: bar.top + bar.height, height: 50, background: deep, color: luminance(deep) > 0.45 ? INK : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 18px", fontFamily: GROTESK, fontWeight: 600, letterSpacing: "0.16em" }}>
        {strip}
      </div>
      <div style={{ position: "absolute", ...bar, background: c1, color: onC1, display: "flex", alignItems: "baseline", justifyContent: "center", gap: numSize * 0.5, paddingTop: bar.height / 2 - numSize * 0.36 }}>
        {facts.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: GROTESK, fontWeight: 500, fontSize: numSize, lineHeight: 0.75, letterSpacing: "-0.02em" }}>
              {f.value}
              <span style={{ fontFamily: GROTESK }}>.</span>
            </span>
            <span style={{ fontFamily: SERIF, fontSize: numSize * 0.4, lineHeight: 1, marginLeft: 2 }}>{f.label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: bar.left + bar.width - 12, top: bar.top - 16, width: 24, height: 24, background: c2 }} />

      {/* Designer's furniture: hex codes, colour chips, corner blocks. */}
      <div style={{ ...small, top: 26, right: 116, display: "flex", gap: 24, fontSize: 14 }}>
        {hexes.map((hx) => (
          <span key={hx} style={{ color: luminance(hx) > 0.7 ? "#9a9a9a" : hx === "#3f3f3f" ? "#3f3f3f" : hx }}>
            {hx}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, width: 66, height: 64, background: c1 }} />
      <div style={{ position: "absolute", right: 0, bottom: 0, width: 66, height: 70, background: c1 }} />
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 68, top: 880, display: "flex", flexDirection: "column", gap: 9 }}>
        {[c2, "#3f3f3f", c1].map((c, i) => (
          <div key={i} style={{ width: 15, height: 15, background: c }} />
        ))}
      </div>

      {/* Caption. */}
      <div style={{ ...small, left: 36, bottom: 32, lineHeight: 1.35, fontSize: Math.min(15, 560 / Math.max(1, Math.max(...captionLines.map((l) => l.length)) * 0.55)) }}>
        {captionLines.map((l, i) => (
          <div key={i} style={{ fontWeight: i ? 500 : 700 }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={26} onLight style={{ position: "absolute", right: 100, bottom: 30, opacity: 0.85 }} />

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, mixBlendMode: "multiply", opacity: 0.16, pointerEvents: "none" }} />
      <Film strength={0.3} />
    </div>
  );
}
