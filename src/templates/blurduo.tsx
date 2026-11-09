/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { rng } from "./kit";
import { competitionOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** DM Serif Display capitals (per 100px), measured in the browser; small caps run at ~0.78 of that. */
const DM: Record<string, number> = { A: 65, B: 59.8, C: 60.3, D: 64.8, E: 55.5, F: 53.8, G: 65.6, H: 69.1, I: 30.1, J: 42.7, K: 65.4, L: 54, M: 79.1, N: 65.3, O: 67, P: 56.5, Q: 67, R: 62.8, S: 52.1, T: 62.7, U: 64.9, V: 63.2, W: 92.1, X: 61.4, Y: 59, Z: 56, " ": 21.8, "'": 22.3, "-": 33.2, ".": 30 };
const dmEm = (t: string) => {
  const s = [...t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
  return s.reduce((a, c, i) => a + (DM[c] ?? 60) * (i === 0 ? 1 : 0.8), 0) / 100;
};

/** Fine print grain for a white page (dark specks, multiplied). */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

const hex = (h: string) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};

/** Takes the shout out of a colour (mixes it towards its own grey): neon greens and reds turn to print inks. */
function calm(c: string, amount: number): string {
  const [r, g, b] = hex(c).map((v) => v * 255);
  const y = 0.3 * r + 0.59 * g + 0.11 * b;
  return "#" + [r, g, b].map((v) => Math.round(v + (y - v) * amount).toString(16).padStart(2, "0")).join("");
}

/** "Title Case" for names typed in lower case. */
const cap = (s: string) => s.replace(/(^|[\s-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

/**
 * One SVG filter doing the club duotone (shadows → dark club colour, highlights → a pale tint of the
 * second colour) and, optionally, a purely horizontal blur: the motion smear keeps its streaks.
 */
function DuoFilter({ id, stops, blur = 0 }: { id: string; stops: string[]; blur?: number }) {
  const cols = stops.map(hex);
  const table = (i: number) => cols.map((c) => c[i].toFixed(3)).join(" ");
  return (
    <filter id={id} x="-150%" y="-5%" width="400%" height="110%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={table(0)} />
        <feFuncG type="table" tableValues={table(1)} />
        <feFuncB type="table" tableValues={table(2)} />
      </feComponentTransfer>
      {blur > 0 && <feGaussianBlur stdDeviation={`${blur} ${Math.round(blur / 14)}`} />}
    </filter>
  );
}

/** The kicker and what it is about, as one tiny line: "PLAYER OF THE MONTH · SEPTEMBER 2026". */
function detail(data: RenderData): string {
  const c = data.content;
  const t = data.postType;
  const opp = c.home === false ? c.homeTeam : c.home === true ? c.awayTeam : c.awayTeam;
  const parts =
    t === "matchday"
      ? [c.kicker, opp ? `V ${opp}` : "", [c.date, c.time].filter(Boolean).join(" ")]
      : t === "potm"
        ? [c.kicker, c.subline]
        : t === "renewal"
          ? [c.kicker, c.until ? `UNTIL ${c.until}` : ""]
          : t === "transfer"
            ? [c.kicker, (data.toClub ?? data.club)?.name ?? ""]
            : t === "result"
              ? [c.kicker, scoreOf(data) ? `${c.homeTeam ?? ""} ${scoreOf(data)} ${c.awayTeam ?? ""}` : competitionOf(data)]
              : [c.kicker, c.subline];
  return parts.filter(Boolean).join("  ·  ").toUpperCase();
}

/**
 * Portrait in motion (Morgan Rogers): a white page, a big head-and-shoulders portrait in a two-colour duotone
 * of the club (dark club colour in the shadows, a pale tint of the second colour in the highlights), sharp on
 * the face side and smeared into long horizontal streaks from the back of the head to the edge. The name in
 * small elegant serif capitals sits in the middle of the smear; a tiny spaced credit at the foot.
 */
export function Blurduo({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 36);
  const flip = params.side === "left";
  const sgn = flip ? -1 : 1;
  const base = params.primary === "#10131c" ? params.accent : params.primary;
  const neutral = hueOf(base) == null;
  // Shadows: the club colour taken deep. Highlights: a pale tint of the second colour (or of the first).
  let dark = neutral ? "#1b1d23" : shade(base, -0.45);
  for (let i = 0; i < 3 && luminance(dark) > 0.06; i++) dark = shade(dark, -0.25);
  const second = params.accent && hueOf(params.accent) != null && params.accent.toLowerCase() !== base.toLowerCase() ? params.accent : neutral ? "#9fb4c8" : base;
  const pale = shade(second, 0.72);
  const mid = neutral ? "#6d7380" : calm(shade(base, luminance(base) > 0.3 ? -0.3 : -0.08), 0.3);
  const stops = [dark, mid, pale, "#fbfcfd"];

  // ---- the portrait, placed by the face and never enlarged past the photo's own detail ----
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const wantFace = 520 * (params.playerScale ?? 1);
  const faceH = data.facePx > 0 ? Math.min(wantFace, Math.max(120, data.facePx * 1.7)) : Math.min(wantFace, 420);
  const faceCx = flip ? CANVAS_W - (360 + r() * 40) : 360 + r() * 40;
  const faceMidY = faceH > 380 ? 560 : 400 + faceH * 0.3;
  const faceTop = faceMidY - faceH / 2;
  const h = Math.max(faceH / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  const fH = face[3] * h;
  const fW = face[2] * w;
  const box = {
    left: faceCx - (face[0] + face[2] / 2) * w + (params.playerX ?? 0),
    top: faceTop - face[1] * h + (params.playerY ?? 0),
    width: w,
    height: h,
  };
  const url = data.photoUrl;

  // The sharp face side dissolves into the smear behind the head.
  const back = faceCx + sgn * fW * 0.28;
  const gone = faceCx + sgn * Math.max(fW * 1.5, 300);
  const dir = flip ? "to left" : "to right";
  const pos = (x: number) => (flip ? CANVAS_W - x : x);
  const sharpMask = `linear-gradient(${dir}, #000 ${Math.round(pos(back))}px, transparent ${Math.round(pos(gone))}px)`;
  const smearMask = `linear-gradient(${dir}, transparent ${Math.round(pos(faceCx - sgn * fW * 0.1))}px, #000 ${Math.round(pos(faceCx + sgn * fW * 0.55))}px)`;
  // The smear thins out below the shoulders.
  const fadeFrom = faceTop + Math.max(fH * 1.35, 330);
  const smearFade = `linear-gradient(to bottom, #000 ${Math.round(fadeFrom)}px, transparent ${Math.round(fadeFrom + Math.max(fH * 0.9, 320))}px)`;
  const masked = (m: string, m2?: string): CSSProperties =>
    m2 ? ({ WebkitMaskImage: `${m}, ${m2}`, maskImage: `${m}, ${m2}`, WebkitMaskComposite: "source-in", maskComposite: "intersect" } as CSSProperties) : { WebkitMaskImage: m, maskImage: m };
  const img = (style: CSSProperties, filter: string, key?: number) =>
    url && <img key={key} src={url} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: `brightness(.9) contrast(1.12) url(#${filter})`, ...cutMask(data.cut, 1.6), ...style }} />;
  // Stretched copies anchored at the face: the further, the longer and softer.
  const origin = `${faceCx - box.left}px 50%`;

  // ---- the name, in the middle of the smear ----
  const first = cap(content.lastName ? content.firstName : "");
  const last = cap(content.lastName || content.firstName);
  const nameLeft = faceCx + sgn * (fW * 0.72 + 20);
  const room = flip ? nameLeft - 60 : CANVAS_W - 60 - nameLeft;
  const size = Math.min(64, room / Math.max(1, dmEm(first), dmEm(last))) * (params.textScale ?? 1);
  const nameTop = faceTop + fH * 0.42;
  const line = detail(data);
  const lineSize = Math.min(15, Math.max(11, room / Math.max(1, [...line].length * 0.62)));

  const tag = `#${(data.club?.name ?? content.lastName).normalize("NFD").replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f5f5f3", color: dark }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <DuoFilter id="bd-duo" stops={stops} />
        <DuoFilter id="bd-s1" stops={stops} blur={14} />
        <DuoFilter id="bd-s2" stops={stops} blur={34} />
        <DuoFilter id="bd-s3" stops={stops} blur={70} />
      </svg>
      {/* A breath of the pale tint across the page, strongest where the smear runs. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${dir}, transparent 30%, ${pale}55 75%, ${pale}33)` }} />

      {/* The smear: long stretched copies, then shorter shifted ones, all only behind the head. */}
      <div style={{ position: "absolute", inset: 0, ...masked(smearMask, smearFade) }}>
        {img({ transformOrigin: origin, transform: `scaleX(2.6)`, opacity: 0.55 }, "bd-s3")}
        {img({ transformOrigin: origin, transform: `scaleX(1.7)`, opacity: 0.7 }, "bd-s2")}
        {[1, 2, 3, 4].map((i) => img({ transform: `translateX(${sgn * i * fW * 0.32}px)`, opacity: 0.55 - i * 0.08 }, i < 3 ? "bd-s1" : "bd-s2", i))}
      </div>
      {/* The portrait itself, sharp on the face side. */}
      <div style={{ position: "absolute", inset: 0, ...masked(sharpMask) }}>{img({}, "bd-duo")}</div>

      {/* Print grain. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundPosition: "90px 40px", opacity: 0.1, mixBlendMode: "screen" }} />

      {/* Name: small serif capitals, in the smear. */}
      <div
        style={{
          position: "absolute",
          top: nameTop,
          [flip ? "right" : "left"]: flip ? CANVAS_W - nameLeft : nameLeft,
          textAlign: flip ? "right" : "left",
          fontFamily: DMSERIF,
          fontSize: size,
          lineHeight: 0.86,
          fontVariant: "small-caps",
          letterSpacing: "0.01em",
          color: "#ffffff",
          textShadow: `0 0 24px ${dark}88, 0 2px 6px ${dark}55`,
          whiteSpace: "nowrap",
        }}
      >
        {first && <div>{first}</div>}
        <div style={{ paddingLeft: flip ? 0 : first ? size * 0.35 : 0, paddingRight: flip && first ? size * 0.35 : 0 }}>{last}</div>
        {line && (
          <div style={{ marginTop: size * 0.32, fontFamily: CONDENSED, fontVariant: "normal", fontWeight: 600, fontSize: lineSize, letterSpacing: "0.32em", lineHeight: 1, textShadow: `0 1px 8px ${dark}aa` }}>{line}</div>
        )}
      </div>

      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", top: 56, [flip ? "right" : "left"]: 60, width: 54, height: 54, objectFit: "contain", filter: "grayscale(.2)" }} />}

      {/* Tiny spaced credit. */}
      {/* White with a soft dark halo: reads over the portrait and on the white page alike. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 13, letterSpacing: "0.9em", paddingLeft: "0.9em", color: "#ffffff", textShadow: `0 0 8px ${dark}cc, 0 0 2px ${dark}` }}>{tag}</div>
        <AgencyLogo data={data} height={18} style={{ color: "#ffffff", filter: `drop-shadow(0 0 5px ${dark}cc)` }} />
      </div>
    </div>
  );
}
