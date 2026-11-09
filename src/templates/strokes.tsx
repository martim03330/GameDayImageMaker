/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cityCode, type Box } from "./fx";
import { opponentOf, rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- helpers shared by strokes, tallname and breakout ---------- */

/** The club colour as it prints on white paper: vivid, but deepened when it is too light to hold. */
export function inkOf(data: RenderData): { club: string; ink: string } {
  const p = data.params;
  const club = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  const l = luminance(club);
  const ink = l > 0.35 ? shade(club, -0.45) : l > 0.2 ? shade(club, -0.25) : club;
  return { club, ink };
}

/**
 * Crumpled paper: a jittered mesh of flat facets, each tilted towards or away from the light (so the
 * creases read as sharp folds), over soft large-scale unevenness and fine fibres. Deterministic per seed.
 */
export function CrumpledPaper({ color = "#eeece8", seed = 4, strength = 1, id = "crumple" }: { color?: string; seed?: number; strength?: number; id?: string }) {
  const r = rng(seed * 7 + 1);
  const cols = 13;
  const rows = 16;
  const cw = (CANVAS_W + 200) / cols;
  const ch = (CANVAS_H + 200) / rows;
  const pts: [number, number][][] = [];
  for (let j = 0; j <= rows; j++) {
    pts.push([]);
    for (let i = 0; i <= cols; i++) pts[j].push([-100 + i * cw + (r() - 0.5) * cw * 0.9, -100 + j * ch + (r() - 0.5) * ch * 0.9]);
  }
  // Light from the upper left: a facet's shade is its (random) tilt against that direction.
  const facets: { d: string; fill: string; o: number }[] = [];
  const tri = (a: [number, number], b: [number, number], c: [number, number]) => {
    const t = r() * 2 - 1;
    facets.push({ d: `M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}L${c[0].toFixed(0)} ${c[1].toFixed(0)}Z`, fill: t > 0 ? "#ffffff" : "#000000", o: Math.abs(t) * (t > 0 ? 0.22 : 0.04) });
  };
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const [a, b, c, d] = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
      if (r() < 0.5) {
        tri(a, b, c);
        tri(a, c, d);
      } else {
        tri(a, b, d);
        tri(b, c, d);
      }
    }
  return (
    <div data-bleed style={{ position: "absolute", inset: 0, background: color }}>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`${id}-soft`}>
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
          <filter id={`${id}-n`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.012 0.016" numOctaves={4} seed={seed} result="n" />
            <feDiffuseLighting in="n" surfaceScale={1.6} diffuseConstant={1.1} lightingColor="#ffffff">
              <feDistantLight azimuth={225} elevation={62} />
            </feDiffuseLighting>
          </filter>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-n)`} style={{ mixBlendMode: "multiply" }} opacity={0.32 * strength} />
        <g filter={`url(#${id}-soft)`}>
          {facets.map((f, i) => (
            <path key={i} d={f.d} fill={f.fill} opacity={f.o * strength} />
          ))}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(0,0,0,.1) 100%)" }} />
    </div>
  );
}

const DAYS: Record<string, string> = { MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY" };
const MONTHS: Record<string, string> = { JAN: "JANUARY", FEB: "FEBRUARY", MAR: "MARCH", APR: "APRIL", MAY: "MAY", JUN: "JUNE", JUL: "JULY", AUG: "AUGUST", SEP: "SEPTEMBER", OCT: "OCTOBER", NOV: "NOVEMBER", DEC: "DECEMBER" };

export type MatchFacts = {
  /** The other team, caps ("" when unknown). */
  opp: string;
  oppCrest: string | null;
  ourCrest: string | null;
  /** "SAT 10 OCT" */
  date: string;
  dow: string;
  day: string;
  mon: string;
  /** "SATURDAY 10 OCTOBER" */
  longDate: string;
  time: string;
  /** Abroad: kick-off in local time and in Portugal (timePt empty at home). */
  timeLocal: string;
  timePt: string;
  /** Tag written after timePt: "PT", or the player's own second clock ("SWE"). */
  timeRef: string;
  venue: string;
  /** "MALTA PREMIER LEAGUE" */
  comp: string;
  /** "MATCHDAY 7" / "QUARTER-FINAL" ("" when none) */
  round: string;
  /** "7" when the round is a plain matchday number. */
  roundNo: string;
};

/** Everything a matchday poster prints, from the post's content (the next fixture filling gaps). */
export function matchFacts(data: RenderData): MatchFacts {
  const c = data.content;
  const f = data.fixtures?.[0];
  const ours = (data.club?.name ?? "").toLowerCase();
  const weHost = c.home ?? ((c.homeTeam ?? "").toLowerCase() === ours ? true : (c.awayTeam ?? "").toLowerCase() === ours ? false : undefined);
  let opp = opponentOf(data) || f?.opponent || "";
  if (opp.toLowerCase() === ours) opp = "";
  const oppCrest = (weHost === true ? c.awayCrest : weHost === false ? c.homeCrest : c.awayCrest) ?? f?.opponentCrest ?? null;
  const ourCrest = (weHost === true ? c.homeCrest : weHost === false ? c.awayCrest : null) ?? data.club?.crestUrl ?? null;
  const date = (c.date ?? "").toUpperCase().trim();
  const [day = "", mon = ""] = date.replace(/^[A-Z]{3}\s+(?=\d)/, "").split(/\s+/);
  const longDate = [day, MONTHS[mon] ?? mon].filter(Boolean).join(" ");
  const parts = c.subline.split("·").map((s) => s.trim().toUpperCase()).filter((s) => s && !/^VS\b/.test(s));
  const comp = parts.length > 1 ? parts[0] : parts[0] && !/MATCHDAY|ROUND|FINAL|LEG\b/.test(parts[0]) ? parts[0] : (f?.competition ?? "").toUpperCase();
  const round = parts.find((p) => /MATCHDAY|ROUND|FINAL|LEG\b/.test(p)) ?? "";
  const roundNo = /^MATCHDAY (\d+)$/.exec(round)?.[1] ?? "";
  return { opp: opp.toUpperCase(), oppCrest: oppCrest === ourCrest ? null : oppCrest, ourCrest, date, dow: "", day, mon, longDate, time: (c.time ?? "").trim(), timeLocal: c.timeLocal ?? (c.time ?? "").trim(), timePt: c.timePt ?? "", timeRef: c.timeRef || "PT", venue: (c.venue ?? "").toUpperCase().trim(), comp, round, roundNo };
}

export type Photo = { url: string; face: [number, number, number, number] | null; aspect: number | null; cutBottom: boolean };

/** A second whole-body cutout (the chosen second photo first), else another cutout, else the main one. */
export function secondPhoto(data: RenderData, seed: number): Photo | null {
  const whole = (c: RenderData["cutouts"][number]) => !(c.cut?.bottom ?? 0) && !(c.cut?.left ?? 0) && !(c.cut?.right ?? 0) && !(c.cut?.top ?? 0);
  const others = data.cutouts.filter((c) => c.url !== data.photoUrl);
  const meta = others.find((c) => c.url === data.photo2Url);
  if (data.photo2Url && (!meta || whole(meta))) return { url: data.photo2Url, face: meta?.face ?? null, aspect: meta?.aspect ?? null, cutBottom: false };
  const wholeOnes = others.filter(whole);
  const pick = wholeOnes[seed % Math.max(1, wholeOnes.length)];
  if (pick) return { url: pick.url, face: pick.face, aspect: pick.aspect, cutBottom: false };
  if (data.photo2Url) return { url: data.photo2Url, face: meta?.face ?? null, aspect: meta?.aspect ?? null, cutBottom: (meta?.cut?.bottom ?? 0) > 0 };
  if (!data.photoUrl) return null;
  return { url: data.photoUrl, face: data.face, aspect: data.photoAspect, cutBottom: (data.cut?.bottom ?? 0) > 0 };
}

/** Numbers worth printing: short values, no zeros ("1 Game", not "1 Games"). */
export function shortFacts(data: RenderData, max = 3): { value: string; label: string }[] {
  return data.content.stats
    .filter((s) => s.value && String(s.value).length <= 5 && Number(s.value) !== 0)
    .slice(0, max)
    .map((s) => (Number(s.value) === 1 ? { ...s, label: s.label.replace(/s$/i, "") } : s));
}

/**
 * Places the main cutout by its face (centre at faceX, top at faceTop, height faceH), the body reaching
 * at least `minBottom`. The face is never drawn past ~1.9× its real pixels (export is 2×).
 */
export function placeFace(data: RenderData, faceX: number, faceTop: number, faceH: number, minBottom = CANVAS_H + 30): Box & { faceH: number } {
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let fh = faceH * (p.playerScale ?? 1);
  if (data.facePx > 0) fh = Math.min(fh, Math.max(90, data.facePx * 1.9));
  const h = Math.max(fh / face[3], (minBottom - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return { left: faceX - w * (face[0] + face[2] / 2) + (p.playerX ?? 0), top: faceTop - h * face[1] + (p.playerY ?? 0), width: w, height: h, faceH: face[3] * h };
}

/** Mask that fades an image out between two canvas heights (the image box given in canvas px). */
export function fadeBelow(box: Box, from: number, to: number): CSSProperties {
  const a = Math.max(0, Math.min(100, ((from - box.top) / box.height) * 100));
  const b = Math.max(a + 0.1, Math.min(100, ((to - box.top) / box.height) * 100));
  const m = `linear-gradient(to bottom, #000 ${a.toFixed(1)}%, transparent ${b.toFixed(1)}%)`;
  return { WebkitMaskImage: m, maskImage: m };
}

/**
 * A marker scribble: one continuous zig-zag of thick rounded strokes, each leaning up to the right,
 * inside the box (x, y, w, h). `n` strokes, rough ends per seed.
 */
function scribblePath(r: () => number, x: number, y: number, w: number, h: number, n: number, lean: number, mirror = false): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    // Wider in the middle: a marker fills the shape, it doesn't draw a rectangle.
    const bulge = Math.sin(Math.PI * (0.15 + 0.7 * t));
    const cy = y + lean + t * (h - lean);
    const l = x + w * (0.5 - 0.5 * bulge) + (r() - 0.5) * w * 0.12;
    const rr = x + w * (0.5 + 0.5 * bulge) + (r() - 0.5) * w * 0.12;
    pts.push([l, cy + (r() - 0.5) * 12]);
    pts.push([rr, cy - lean + (r() - 0.5) * 12]);
  }
  return pts.map(([px, py], i) => `${i ? "L" : "M"}${(mirror ? 2 * x + w - px : px).toFixed(1)} ${py.toFixed(1)}`).join(" ");
}

function Scribbles({ groups, color, seed, mirror = false }: { groups: { x: number; y: number; w: number; h: number; n: number; lean: number; width: number }[]; color: string; seed: number; mirror?: boolean }) {
  const r = rng(seed);
  const id = `scrib-${seed}`;
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          {/* Slightly wobbly edges, and a faint dry streak inside, like a paint marker. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.6 0.05" numOctaves={2} seed={seed + 2} result="s" />
          <feColorMatrix in="s" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.4 1.18" result="m" />
          <feComposite in="d" in2="m" operator="in" />
        </filter>
      </defs>
      {groups.map((g, i) => (
        <path
          key={i}
          d={scribblePath(r, g.x, g.y, g.w, g.h, g.n, g.lean, mirror)}
          fill="none"
          stroke={color}
          strokeWidth={g.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id})`}
        />
      ))}
    </svg>
  );
}

/** Rough marker underline, thick on the left and tapering to the right with a small hook back. */
function Underline({ x, y, w, color }: { x: number; y: number; w: number; color: string }) {
  const d = `M${x} ${y + 4} C ${x + w * 0.3} ${y - 3}, ${x + w * 0.7} ${y - 2}, ${x + w} ${y - 7} C ${x + w * 0.8} ${y - 1}, ${x + w * 0.55} ${y + 5}, ${x + w * 0.42} ${y + 7}`;
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${x + 4} ${y + 4} L${x + w * 0.35} ${y + 1}`} fill="none" stroke={color} strokeWidth={13} strokeLinecap="round" />
    </svg>
  );
}

/** A full-body cutout with its feet on `floor`, centred on `cx`; `height` from hair to feet. */
function Standing({ photo, cx, floor, height, shadow, style }: { photo: Photo; cx: number; floor: number; height: number; shadow: number; style?: CSSProperties }) {
  const w = photo.aspect ? height * photo.aspect : undefined;
  const fade: CSSProperties = photo.cutBottom
    ? { WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 14%)", maskImage: "linear-gradient(to top, transparent 0%, #000 14%)" }
    : {};
  const img = (extra: CSSProperties) => (
    <img src={photo.url} alt="" style={{ display: "block", height, width: w ?? "auto", maxWidth: "none", ...fade, ...extra }} />
  );
  return (
    <div style={{ position: "absolute", left: cx, top: floor - height, transform: "translateX(-50%)", ...style }}>
      {/* The grey offset copy behind: the flat drop shadow of printed sports posters. */}
      <div style={{ position: "absolute", left: shadow, top: shadow * 0.45, opacity: 0.2, filter: "blur(1.5px)" }}>{img({ filter: "brightness(0)" })}</div>
      <div style={{ position: "relative", filter: "drop-shadow(0 10px 14px rgba(0,0,0,.18))" }}>{img({ filter: "contrast(1.04) saturate(1.05)" })}</div>
    </div>
  );
}

/* ---------- the look ---------- */

const INK = "#161616";
const GREY = "#4a4a4a";

/** Inter (sans) capitals: average advance relative to the font size (bold ≈ .68, light ≈ .62). */
const INTER_W = 0.68;

/**
 * Player poster on crumpled white paper (Griezmann by dwidesign): big red marker scribbles behind, a large
 * waist-up cutout on one side and the same player small and full-length on the other, with a flat grey
 * offset shadow. A light caps first name, the surname in bold italic with a marker underline, his number;
 * a short line of numbers or the move under it; tiny club codes on both edges, club name and credit at the foot.
 */
export function Strokes({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 26;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);
  const { club: raw, ink } = inkOf(data);
  // Neon club colours (lime, yellow) shout on white: take them down a notch for the marker.
  const club = luminance(raw) > 0.4 ? shade(raw, -0.12) : raw;
  const ts = params.textScale ?? 1;

  // ---- the main player: waist up, face in the upper third ----
  const faceX = X(430 + (r() - 0.5) * 40);
  const faceTop = 150 + r() * 30;
  const FACE: Record<string, number> = { chest: 200, waist: 170, knees: 145, full: 120 };
  let box = data.photoUrl ? placeFace(data, faceX, faceTop, FACE[params.framing ?? "waist"] ?? 170) : null;
  // Wide poses (a kick, arms out) would run into the text column: slide him towards the edge.
  if (box) {
    const reach = (b: Box) => (flip ? CANVAS_W - b.left : b.left + b.width);
    const over = reach(box) - 710;
    const shift = Math.min(90, Math.max(0, over));
    if (shift) box = { ...box, left: box.left + (flip ? shift : -shift) };
    // Still too wide: scale him down around his face (never below 86%).
    const fx = box.left + (data.face ? data.face[0] + data.face[2] / 2 : 0.5) * box.width;
    const right = reach(box) - (flip ? CANVAS_W - fx : fx);
    const room = 710 - (flip ? CANVAS_W - fx : fx);
    if (right > room && right > 0) {
      const k = Math.max(0.86, room / right);
      box = { left: fx - (fx - box.left) * k, top: faceTop - (faceTop - box.top) * k, width: box.width * k, height: box.height * k, faceH: box.faceH * k };
    }
  }
  // The body dissolves around mid-thigh, where the lower scribble crosses it.
  const fadeFrom = box ? Math.min(1080, Math.max(930, faceTop + box.faceH * 5.3)) : 1060;

  // ---- the text column ----
  const colX = flip ? 60 : 738;
  const colW = CANVAS_W - 738 - 60;
  const first = content.firstName.toUpperCase();
  const last = (content.lastName || content.firstName).toUpperCase();
  const firstShown = content.lastName ? first : "";
  const lastSize = Math.min(58, colW / Math.max(4, [...last].length * INTER_W)) * ts;
  const firstSize = Math.min(34, (colW * 1.05) / Math.max(4, [...firstShown].length * 0.66)) * ts;
  const kicker = content.kicker.toUpperCase();
  const kickSize = Math.min(17, (colW * 1.0) / Math.max(4, [...kicker].length * 0.95));
  const top = 176;
  const firstTop = top + 44;
  const lastTop = firstTop + (firstShown ? firstSize * 1.05 : 0);
  const lineY = lastTop + lastSize * 1.08 + 8;
  const num = data.player.number;
  const numTop = lineY + 26;
  const numSize = 128;

  // Under the number: a row of numbers (stats), the score, the move or the new deal.
  const score = scoreOf(data);
  let under: ReactNode = null;
  const small: CSSProperties = { fontFamily: ARCHIVO, fontWeight: 600, fontSize: 13, letterSpacing: "0.2em", color: GREY, textTransform: "uppercase", whiteSpace: "nowrap" };
  const bigVal: CSSProperties = { fontFamily: SANS, fontWeight: 800, fontStyle: "italic", lineHeight: 1, color: INK, whiteSpace: "nowrap" };
  const facts = shortFacts(data, 3);
  if (postType === "transfer") {
    const from = data.fromClub;
    const to = data.toClub ?? data.club;
    under = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18 }}>
        {from?.crestUrl && <img src={from.crestUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain" }} />}
        {from?.crestUrl && to?.crestUrl && (
          <svg width={46} height={20}>
            <path d="M2 10 H40 M30 2 L42 10 L30 18" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {to?.crestUrl && <img src={to.crestUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain" }} />}
        {!from?.crestUrl && !to?.crestUrl && to?.name && <div style={{ ...bigVal, fontSize: Math.min(30, colW / (to.name.length * 0.62)) }}>{to.name.toUpperCase()}</div>}
      </div>
    );
  } else if (postType === "renewal" && content.until) {
    under = (
      <div>
        <div style={small}>Contract until</div>
        <div style={{ ...bigVal, fontSize: 44, marginTop: 6 }}>{content.until}</div>
      </div>
    );
  } else if (postType === "goal" && score) {
    const opp = opponentOf(data);
    under = (
      <div>
        <div style={{ ...bigVal, fontSize: 44 }}>{score}</div>
        {opp && <div style={{ ...small, marginTop: 8, fontSize: Math.min(13, colW / (opp.length * 0.9 + 4)) }}>vs {opp}</div>}
      </div>
    );
  } else if (postType === "matchday") {
    const m = matchFacts(data);
    const when = [m.date, m.time].filter(Boolean).join("  ·  ");
    under = (
      <div>
        {(m.ourCrest || m.oppCrest) && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            {m.ourCrest && <img src={m.ourCrest} alt="" style={{ width: 58, height: 58, objectFit: "contain" }} />}
            {m.ourCrest && m.oppCrest && <div style={{ ...bigVal, fontSize: 30, color: ink }}>v</div>}
            {m.oppCrest && <img src={m.oppCrest} alt="" style={{ width: 58, height: 58, objectFit: "contain" }} />}
          </div>
        )}
        {m.opp && (
          <div style={{ ...bigVal, fontSize: Math.min(30, colW / Math.max(4, ([...m.opp].length + 2) * 0.66)) }}>
            <span style={{ color: ink }}>v </span>
            {m.opp}
          </div>
        )}
        {when && <div style={{ ...small, color: INK, fontWeight: 700, marginTop: 12, fontSize: Math.min(15, colW / Math.max(4, when.length * 0.86)) }}>{when}</div>}
        {m.venue && <div style={{ ...small, marginTop: 7, fontSize: Math.min(12, colW / Math.max(4, m.venue.length * 0.85)) }}>{m.venue}</div>}
      </div>
    );
  } else if (facts.length) {
    const each = colW / facts.length;
    under = (
      <div style={{ display: "flex" }}>
        {facts.map((f, i) => (
          <div key={i} style={{ width: each, paddingLeft: i ? 14 : 0, borderLeft: i ? `2px solid ${ink}` : undefined }}>
            <div style={{ ...bigVal, fontSize: Math.min(42, (each - 16) / Math.max(1, String(f.value).length * 0.66)) }}>{f.value}</div>
            <div style={{ ...small, fontSize: Math.min(12, (each - 16) / Math.max(1, f.label.length * 0.85)), marginTop: 6 }}>{f.label}</div>
          </div>
        ))}
      </div>
    );
  }
  const underTop = num ? numTop + numSize * 0.8 + 26 : numTop;

  // ---- the small full-length player, under the column ----
  const photo2 = secondPhoto(data, seed);
  const floor = 1222;
  const smallTop = Math.max(underTop + (under ? (postType === "matchday" ? 190 : 104) : 20), 560);
  const smallH = Math.min(720, floor - smallTop);
  const smallCx = X(790 + (r() - 0.5) * 30);

  // ---- scribbles: behind the head / shoulder towards the column, and a lower one across the waist ----
  const lean = 120 + r() * 40;
  const upper = { x: flip ? CANVAS_W - 700 : 150, y: 180 + r() * 30, w: 550, h: 470 + r() * 50, n: 5, lean, width: 54 };
  const upper2 = { x: flip ? CANVAS_W - 715 : 560, y: 480 + r() * 40, w: 155, h: 300, n: 3, lean: 60, width: 52 };
  const lowY = Math.min(1040, fadeFrom - 40);
  const lower = { x: flip ? CANVAS_W - 650 : 270, y: lowY, w: 380, h: 200, n: 3, lean: 90, width: 56 };

  const code = cityCode(data.club?.name).toUpperCase();
  const label: CSSProperties = { position: "absolute", top: 660, fontFamily: SANS, fontWeight: 500, fontSize: 17, letterSpacing: "0.04em", color: INK };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#eeece8", color: INK }}>
      <CrumpledPaper seed={seed % 50} />
      <Scribbles groups={[upper, upper2]} color={club} seed={seed} mirror={flip} />
      {data.club?.name && (
        <>
          {/* Each code only where no player stands on it. */}
          {!(box && (flip ? box.left + box.width > CANVAS_W - 130 : box.left < 130)) && <div style={{ ...label, [flip ? "right" : "left"]: 58 }}>{code}</div>}
          <div style={{ ...label, [flip ? "left" : "right"]: 58 }}>{code}</div>
        </>
      )}


      {box && data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.2))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05)", ...fadeBelow(box, fadeFrom, fadeFrom + 120) }}
          />
        </div>
      )}
      <Scribbles groups={[lower]} color={club} seed={seed + 11} mirror={flip} />
      {/* The small player stands in front of everything, on the paper. */}
      {photo2 && smallH > 300 && <Standing photo={photo2} cx={smallCx} floor={floor} height={smallH} shadow={flip ? -34 : 34} />}

      {/* Name block */}
      <div style={{ position: "absolute", left: colX, top, width: colW, fontFamily: ARCHIVO, fontWeight: 600, fontSize: kickSize, letterSpacing: "0.26em", color: ink, whiteSpace: "nowrap" }}>{kicker}</div>
      {firstShown && (
        <div style={{ position: "absolute", left: colX, top: firstTop, fontFamily: ARCHIVO, fontWeight: 300, fontSize: firstSize, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{firstShown}</div>
      )}
      <div style={{ position: "absolute", left: colX, top: lastTop, fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: lastSize, lineHeight: 1.05, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{last}</div>
      <Underline x={colX + 2} y={lineY} w={Math.min(colW * 0.95, [...last].length * lastSize * INTER_W * 0.9)} color={club} />
      {num && <div style={{ position: "absolute", left: colX - 4, top: numTop, fontFamily: ARCHIVO_BLACK, fontSize: numSize, lineHeight: 0.8, color: INK }}>{num}</div>}
      {under && <div style={{ position: "absolute", left: colX, top: underTop, width: colW }}>{under}</div>}

      {/* Foot */}
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 88, bottom: 92, fontFamily: SANS, fontWeight: 500, fontSize: 18, letterSpacing: "0.02em", color: GREY, whiteSpace: "nowrap" }}>
        {(data.club?.name ?? "").toUpperCase()}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={26} onLight style={{ opacity: 0.9, color: INK }} />
      </div>
    </div>
  );
}
