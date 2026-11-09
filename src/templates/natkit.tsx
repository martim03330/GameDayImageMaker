/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { matchFacts } from "./strokes";
import { natAlignParam, natGeom, roundNatAlign } from "./natgeom";
import type { RenderData } from "./types";

/**
 * Shared bits of the NATURAL looks (natword / natcorner / natgrass): his original photo framed on the
 * canvas by /api/natframe (real grass, stands and light; the enhanced cutout laid exactly over him), the
 * matching sharp figure layer for type set between the photo and him, and the fixture facts.
 */

/** Light grade only: a touch of contrast and warmth, same on the photo and on the figure layer. */
export const NAT_GRADE = "contrast(1.05) saturate(1.04) brightness(1.01)";
export const OFF_WHITE = "#f4f1ea";

export type NatFrame = { bg: string | null; fig: string | null; plain: string | null; /** The ground colour along the foot (8×1 PNG). */ band?: string | null };

export type NatPlace = {
  frame: NatFrame;
  /** Where his face really lands on the canvas (after /api/natframe's cover zoom / slide): centre x / y, height and width (px). */
  fx: number;
  fy: number;
  fs: number;
  faceW: number;
  /** The cutout's box on the canvas (his whole figure). */
  box: { left: number; top: number; width: number; height: number };
  /**
   * The other people in the shot (team-mates, opponents) on the canvas, px — from photos.meta.others mapped
   * through the same original → canvas transform the photo is drawn with. Undefined = not known (no
   * alignment or not measured yet): only he is avoided.
   */
  people?: Rect[];
  /** The manual player nudge (quick adjustments), px: fx / fy leave it out (the type does not follow him), his face does. */
  nudge?: { x: number; y: number };
};

/** A rectangle on the canvas, px. */
export type Rect = { x0: number; y0: number; x1: number; y1: number };

/** The band above his head for a block `h` tall, from `top` down, ending clear of his hair; null when it does not fit. */
export function aboveHead(place: NatPlace, top: number, h: number, x0: number, x1: number): Rect | null {
  const head = place.fy - place.fs * 0.95;
  return top + h <= head - 24 ? { x0, y0: top, x1, y1: top + h } : null;
}

/** How much a block `h` tall must shrink to fit above his head from `top` (1 = as is), or null below `min` — then it belongs elsewhere. */
export function fitAbove(place: NatPlace, top: number, h: number, min = 0.72): number | null {
  const room = place.fy - place.fs * 0.95 - 24 - top;
  return room >= h ? 1 : room >= h * min ? room / h : null;
}

const overlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/**
 * Which of the candidate spots for a text block covers the least of the people in the photo: his face (never),
 * his body, and the others standing around him (place.people). Each candidate gets a cost — the share of its
 * area over his face ×20, over his body ×3, over the others ×1 — and the cheapest wins (the first one on a tie,
 * so a look lists its preferred spot first). `crowded` says even the best one sits over someone: the look then
 * puts a stronger shade or a panel behind the text.
 */
/** His face on the canvas, with a margin (hair to chin, a little either side). */
const hisFace = (place: NatPlace, n = { x: 0, y: 0 }): Rect => ({ x0: place.fx + n.x - place.faceW * 0.75, y0: place.fy + n.y - place.fs * 0.85, x1: place.fx + n.x + place.faceW * 0.75, y1: place.fy + n.y + place.fs * 0.7 });

/**
 * Every face in the shot, canvas px: his (from the face detection) and the others' heads, estimated from
 * their person boxes — the top fifth, the middle 60% of the width. The logo keeps off these (LogoLift).
 */
export function facesInShot(place: NatPlace): Rect[] {
  const heads = (place.people ?? []).map((p) => {
    const w = p.x1 - p.x0;
    const h = Math.min((p.y1 - p.y0) * 0.2, w * 0.9);
    return { x0: p.x0 + w * 0.2, y0: p.y0, x1: p.x1 - w * 0.2, y1: p.y0 + h };
  });
  // His face box starts at the hairline: grown up by 0.6× the face height so the logo also clears the top of his
  // head (hair, a raised hand's shadow) — Arras's blond hair under the logo (2026-11-06).
  const f = hisFace(place, place.nudge);
  return [{ ...f, y0: f.y0 - place.fs * 0.6 }, ...heads];
}

export function pickTextSpot(place: NatPlace, candidates: Rect[]): { index: number; rect: Rect; crowded: boolean; cost: number } {
  const face = hisFace(place);
  const b = place.box;
  // The cutout's box is his figure with its empty corners; trimmed a little at the sides, it is his body.
  const body: Rect = { x0: b.left + b.width * 0.12, y0: b.top, x1: b.left + b.width * 0.88, y1: b.top + b.height };
  let best = { index: 0, rect: candidates[0], crowded: false, cost: Infinity };
  candidates.forEach((c, index) => {
    const area = Math.max(1, (c.x1 - c.x0) * (c.y1 - c.y0));
    const others = Math.min(area, (place.people ?? []).reduce((sum, p) => sum + overlap(c, p), 0));
    const cost = (20 * overlap(c, face) + 3 * overlap(c, body) + others) / area;
    if (cost < best.cost - 0.01) best = { index, rect: c, crowded: false, cost };
  });
  // Over a tenth of the block on someone (the others), or on him at all: it needs the stronger backing.
  best.crowded = best.cost > 0.1;
  return best;
}

/**
 * His original photo framed so the centre of his face lands at (fx, fy) with a face fs px tall (the manual
 * player nudges applied). `frame.bg` = the framed photo, `frame.fig` = the cutout alone at the same geometry.
 * Where the cutout touches a photo edge (data.cut), the photo ends there too: he is grown (≤ 1.6×) or slid
 * so that edge stays outside the canvas. The photo must then also cover the canvas, so /api/natframe may zoom
 * in or slide it: with the photo's stored alignment (photos.meta.nat_align) the result is computed with the
 * route's own formula (natGeom) and says where his face REALLY lands — lay type out from these numbers.
 * Without the alignment yet (a new photo: the route measures and saves it on first draw) it is the request.
 * Without an original for the chosen cutout (or no face found) only `frame.plain` is given.
 */
/** Bumped with every change to how /api/natframe draws: the images are cached as immutable by the browser. */
export const NATFRAME_VERSION = 11;

export function natPlace(data: RenderData, W: number, H: number, want: { fx: number; fy: number; fs: number }): NatPlace {
  const { params } = data;
  const cut = data.cutouts.find((c) => c.url === data.photoUrl);
  const orig = cut?.original ?? null;
  const face = data.face ?? cut?.face ?? null;
  const aspect = data.photoAspect ?? cut?.aspect ?? 0.45;
  // Moved by hand (quick adjustments): the framed photo shifts as a whole, same size (natGeom's nudge).
  const nx = Math.round(params.playerX ?? 0);
  const ny = Math.round(params.playerY ?? 0);
  let fx = want.fx;
  let fy = want.fy;
  let fs = want.fs * (params.playerScale ?? 1);
  const f = face ?? [0.38, 0.08, 0.24, 0.12];
  const rx = f[0] + f[2] / 2;
  const ry = f[1] + f[3] / 2;
  const edges = data.cut ?? {};
  // Photo cut at his feet / knees: keep that edge below the canvas.
  if ((edges.bottom ?? 0) > 0) {
    const need = ((H + 4 - fy) * f[3]) / (1 - ry);
    if (need > fs) {
      const grown = Math.min(need, fs * 1.6);
      fs = grown;
      const bottom = fy + ((1 - ry) * fs) / f[3];
      if (bottom < H + 4) fy += H + 4 - bottom;
    }
  }
  const ch = fs / f[3];
  const cw = ch * aspect;
  if ((edges.left ?? 0) > 0 && fx - rx * cw > -4) fx = rx * cw - 4;
  if ((edges.right ?? 0) > 0 && fx + (1 - rx) * cw < W + 4) fx = W + 4 - (1 - rx) * cw;
  fx = Math.round(fx);
  fy = Math.round(fy);
  fs = Math.round(fs);
  const box = { left: fx - rx * cw, top: fy - ry * ch, width: cw, height: ch };
  // No face found (a photo from behind): still frame it through /api/natframe with the head-box estimate — the
  // cutout is aligned to the original by image matching, not by the face — so the ground's own copy of him lies
  // exactly under the sharp figure. The old fallback (the whole original, blurred, with the figure laid on top at a
  // guessed place) showed him twice (user, 2026-11-06, Nunes from behind).
  if (!data.photoUrl || !orig) return { frame: { bg: null, fig: null, plain: data.bgPhotoUrl ?? orig }, fx, fy, fs, faceW: f[2] * cw, box: { ...box, left: box.left + nx, top: box.top + ny } };
  const fp = f.map((v) => v.toFixed(5)).join(",");
  // Same numbers the route parses, so both sides compute the identical frame.
  const align = cut?.align ? roundNatAlign(cut.align) : null;
  // "Tom profissional" (finish pro): the grade is baked into the photo layers by /api/natframe (&g=pro).
  const q = (m: string) =>
    `/api/natframe?o=${encodeURIComponent(orig)}&c=${encodeURIComponent(data.photoUrl!)}&f=${fp}&p=${data.facePx || 0}&w=${W}&h=${H}&fx=${fx}&fy=${fy}&fs=${fs}${align ? `&a=${natAlignParam(align)}` : ""}${nx || ny ? `&nx=${nx}&ny=${ny}` : ""}&m=${m}${params.finish === "pro" ? "&g=pro" : ""}&v=${NATFRAME_VERSION}`;
  const frame = { bg: q("bg"), fig: q("fig"), plain: null, band: q("band") };
  if (!align) return { frame, fx, fy, fs, faceW: f[2] * cw, box: { ...box, left: box.left + nx, top: box.top + ny } };
  const g = natGeom(align, fp.split(",").map(Number), W, H, fx, fy, fs, { x: nx, y: ny });
  // The others' boxes (0..1 of the original) land where the original's pixels land: left + x·w·S.
  const people = cut?.others?.map(([x0, y0, x1, y1]) => ({ x0: g.left + x0 * align.w * g.S, y0: g.top + y0 * align.h * g.S, x1: g.left + x1 * align.w * g.S, y1: g.top + y1 * align.h * g.S }));
  // fx / fy stay where his face is WITHOUT the manual nudge: the type is laid out from them and must not
  // follow him — only the photo (and his box) moves.
  return { frame, fx: g.fx - nx, fy: g.fy - ny, fs: g.fs, faceW: g.faceW, box: g.box, people, nudge: { x: nx, y: ny } };
}

/** The ground: the framed photo full-bleed (no original: the cutout's own photo blurred, cover). */
export function NatGround({ place, W, H, style, spot }: { place: NatPlace; W: number; H: number; style?: CSSProperties; /** [dark around him, lift on him], baked in by /api/natframe. */ spot?: [number, number] }) {
  const { frame } = place;
  const src = frame.bg ? (spot ? `${frame.bg}&spot=${spot[0]},${spot[1]}` : frame.bg) : frame.plain;
  if (!src) return null;
  const blur = frame.bg ? "" : " blur(10px) brightness(.9)";
  // The faces, for LogoLift: the logo is slid off any face it would cover (its size stays).
  const faces = frame.bg ? facesInShot(place).map((r) => [r.x0, r.y0, r.x1, r.y1].map(Math.round).join(",")).join(";") : "";
  const base: CSSProperties = { position: "absolute", left: 0, top: 0, width: W, height: H, maxWidth: "none", objectFit: "cover", objectPosition: "50% 30%", filter: NAT_GRADE + blur, ...style };
  return (
    <>
      <img src={src} alt="" style={base} />
      <GlowCopy src={src} style={base} />
      {faces && <i data-logo-avoid={faces} style={{ display: "none" }} />}
    </>
  );
}

/**
 * The "Brilho suave" finish (Orton / Pro-Mist diffusion): a heavily blurred copy of a PHOTO layer laid over it in
 * screen at low opacity — highlights bloom, noise and compression soften, the sharp layer underneath is untouched.
 * Hidden by default; the edit's finish wrapper (templates/index.tsx `Finished`, data-glow) shows it and sets the
 * strength through --glow-o / --glow-b. Only photo layers carry it, so type and the logo never glow.
 */
function GlowCopy({ src, style }: { src: string; style: CSSProperties }) {
  const f = typeof style.filter === "string" ? style.filter : "";
  return <img className="nat-glow" src={src} alt="" style={{ ...style, display: "none", filter: `${f} blur(var(--glow-b, 18px)) brightness(1.08)`, opacity: "var(--glow-o, .28)" as unknown as number, mixBlendMode: "screen", pointerEvents: "none" }} />;
}

/** The sharp figure layer: exactly over him in the framed photo (or the plain cutout over a blurred ground). */
export function NatFigure({ data, place, W, H, style, clean }: { data: RenderData; place: NatPlace; W: number; H: number; style?: CSSProperties; clean?: boolean }) {
  const { frame, box } = place;
  const fig = (src: string, st: CSSProperties) => (
    <>
      <img src={src} alt="" style={st} />
      <GlowCopy src={src} style={st} />
    </>
  );
  // `clean`: when he is drawn brighter than a darkened ground, the cutout's soft edge (old background
  // colours, light) read as a glowing outline: the route then gives him edge colours taken from his own
  // body (natframe &clean=1), alpha untouched — no light halo, no dark rim (form carousel, 22/10).
  if (frame.fig && clean) return fig(`${frame.fig}&clean=1`, { position: "absolute", left: 0, top: 0, width: W, height: H, maxWidth: "none", filter: NAT_GRADE, ...style });
  if (frame.fig) return fig(frame.fig, { position: "absolute", left: 0, top: 0, width: W, height: H, maxWidth: "none", filter: NAT_GRADE, ...style });
  if (!data.photoUrl || frame.bg) return null;
  return fig(data.photoUrl, { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: NAT_GRADE, ...style });
}

/**
 * Darkens the photo AROUND him (he stays exactly the photo's own pixels): a dark layer with a soft hole in
 * the shape of his silhouette. Unlike a brighter cutout laid over a darkened photo, it leaves no edge, halo
 * or rim — the light simply falls on him. `amount` 0..1 = how dark the surroundings get.
 */
export function NatSpot({ place, W, H, amount, color = "#000" }: { place: NatPlace; W: number; H: number; amount: number; color?: string }) {
  const { frame } = place;
  if (!frame.fig) return null;
  const hole = `url(${frame.fig}&soft=1)`;
  const mask = {
    WebkitMaskImage: `linear-gradient(#000, #000), ${hole}`,
    maskImage: `linear-gradient(#000, #000), ${hole}`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  } as CSSProperties;
  return <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, background: color, opacity: amount, ...mask }} />;
}

/**
 * Light on him: the SAME framed photo again, brighter, shown only through his feathered silhouette. Both
 * layers carry identical pixels, so there is no edge or halo — he simply looks lit. Pairs with NatSpot
 * (dark around him). `amount` = extra brightness (0.3 → 130%). `filter` = the ground's own grade.
 */
export function NatLight({ place, W, H, amount, filter = "" }: { place: NatPlace; W: number; H: number; amount: number; filter?: string }) {
  const { frame } = place;
  if (!frame.fig || !frame.bg) return null;
  const m = `url(${frame.fig}&soft=1)`;
  return (
    <img
      src={frame.bg}
      alt=""
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H,
        maxWidth: "none",
        filter: `${NAT_GRADE} ${filter} brightness(${1 + amount}) contrast(1.04)`,
        WebkitMaskImage: m,
        maskImage: m,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    />
  );
}

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };

export type NatFixture = {
  homeName: string;
  awayName: string;
  homeCrest: string | null;
  awayCrest: string | null;
  date: string;
  time: string;
  /** Portugal's kick-off when it differs from the local one ("15:00 PT"), else "". */
  ptTime: string;
  /** Kick-off for a line of text: the local time, with Portugal's next to it when they differ ("17:00 (15:00 PT)"). */
  kickoff: string;
  venue: string;
  /** date · kick-off · venue (whatever is known). */
  line: string;
};

/** Home first, exact club names (only the case may change), crests, date · kick-off · venue. */
export function natFixture(data: RenderData): NatFixture {
  const { content } = data;
  const f = matchFacts(data);
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").trim();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").trim();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest) ?? null;
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest) ?? null;
  const m = (content.date ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  const date = m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
  const time = (f.timeLocal || f.time || "").replace(/h/i, ":");
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const venue = f.venue;
  const kickoff = pt ? `${time} (${pt})` : time;
  return { homeName, awayName, homeCrest, awayCrest, date, time, ptTime: pt, kickoff, venue, line: [date, time, pt, venue].filter(Boolean).join("  ·  ") };
}

/** Rough width of a run of Inter caps at 1px with the given tracking (for fitting small lines). */
export function capsEm(text: string, tracking: number): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) em += /[0-9]/.test(ch) ? 0.62 : ch === " " ? 0.28 : /[·.,:]/.test(ch) ? 0.3 : /[MW]/.test(ch) ? 0.86 : /[I]/.test(ch) ? 0.3 : 0.68;
  return em + [...text].length * tracking;
}
