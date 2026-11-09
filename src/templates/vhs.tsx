/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { cutMask, HeadLayer, headHoleMask } from "./fx";
import { BODONI } from "./cover";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf, sceneOf } from "./outline";
import { VIBES } from "./panelscript";
import { AgencyLogo, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const AMBER = "#f4c534";
/** Datamosh colour casts: the acid green, red and cyan of a corrupted tape. */
const WASHES = ["#19e36b", "#ff2a3d", "#21c8ff", "#19e36b"];

/** Bodoni Moda 500: advance widths per 100px of font size (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.5, d: 61.7, e: 52.6, f: 40.2, g: 60.8, h: 60.5, i: 31, j: 31.3, k: 61.6, l: 34.2, m: 87, n: 60.5, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 60.7, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, ".": 21.6, " ": 25, "-": 36, "'": 21.6, A: 78, B: 67.1, C: 71.8, D: 73.8, E: 62.6, F: 60.4, G: 74.8, H: 77.4, I: 39.9, J: 47.7, K: 72.6, L: 61.1, M: 88.4, N: 77.6, O: 75.7, P: 65.2, Q: 75.7, R: 73.1, S: 58.4, T: 68.1, U: 73, V: 78.2, W: 103.7, X: 77.8, Y: 73.8, Z: 59.1 };
/** Great Vibes: advance widths per 100px. */
const VIBES_W: Record<string, number> = { a: 35.8, b: 32.7, c: 26.3, d: 37.2, e: 25.6, f: 19.4, g: 39.6, h: 33.6, i: 17.6, j: 17.8, k: 36, l: 21.3, m: 50.9, n: 33.8, o: 33.8, p: 33.6, q: 34.7, r: 25.9, s: 26.7, t: 20.1, u: 35.6, v: 30.9, w: 49.5, x: 33.4, y: 38.1, z: 34.3, " ": 17.1, "-": 40.4, A: 71.6, B: 104.7, C: 71.4, D: 105, E: 81.9, F: 105.3, G: 70.2, H: 139.5, I: 91.7, J: 97.2, K: 120.3, L: 71.6, M: 133.6, N: 104.4, O: 73, P: 92.5, Q: 75.6, R: 102.8, S: 92.6, T: 93.3, U: 94.7, V: 98, W: 135.1, X: 79.1, Y: 96.3, Z: 68.1 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const bodEm = (t: string, tracking = 0) => plain(t).reduce((a, c) => a + (BOD_W[c] ?? 60) / 100 + tracking, -tracking);
const vibesEm = (t: string) => plain(t).reduce((a, c) => a + (VIBES_W[c] ?? 34) / 100, 0);

/** "MATCHDAY" → "Match" + script "Day"; "MAN OF THE MATCH" → "Man of the" + "Match"; one word stays serif. */
function split(kicker: string): [string, string] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim().replace(/^(MATCH|GAME)DAY$/, "$1 DAY").replace(/^FULLTIME$/, "FULL TIME");
  const cap = (w: string) => (/^(OF|THE|AND)$/.test(w) ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase());
  const words = k.split(/\s+/).filter(Boolean).map((w, i) => (i === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : cap(w)));
  if (words.length < 2) return [words[0] ?? "", ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;
/** Tape tracking noise: thin streaky horizontal hiss. */
const HISS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='60'><filter id='h'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.2 -1.1'/></filter><rect width='100%' height='100%' filter='url(#h)'/></svg>`,
)}")`;

/** SVG filters: RGB split for the picture, and blocky pixelation at three cell sizes. */
function VhsDefs({ split: px }: { split: number }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id="vhs-rgb" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={-px} dy="0" result="r2" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx={px} dy="0" result="b2" />
        <feBlend in="r2" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b2" mode="screen" />
      </filter>
      <filter id="vhs-red" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1.2 0 0 0 0.1  0 0 0 0 0  0 0 0 0 0.05  0 0 0 1 0" />
      </filter>
      <filter id="vhs-cyan" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 1.1 0 0 0.05  0 0 1.2 0 0.1  0 0 0 1 0" />
      </filter>
      {[12, 18, 28].map((n) => (
        <filter key={n} id={`vhs-pix-${n}`} x="0" y="0" width="100%" height="100%">
          <feFlood x={n / 2} y={n / 2} width="1" height="1" />
          <feComposite width={n} height={n} />
          <feTile result="cells" />
          <feComposite in="SourceGraphic" in2="cells" operator="in" />
          <feMorphology operator="dilate" radius={n / 2} />
        </filter>
      ))}
    </svg>
  );
}

type Rect = { x: number; y: number; w: number; h: number; dx: number; dy: number; cell: number; tone: string; wash: string | null };

/**
 * Camcorder matchday (Man Utd v Ipswich "Match Day", VHS glitch): the ground in warm, faded tape colour
 * with the channels pulled apart, scan lines and tracking hiss, blocks of datamoshed pixels and a rainbow
 * light leak; the player standing in front, his head always clean; the title in a fine high-contrast serif
 * with its last word in script, and the facts as yellow and white on-screen display type.
 */
export function Vhs({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 53;
  const r = rng(seed);
  const right = params.side !== "left";
  const f = matchFacts(data);
  const score = scoreOf(data, "-");

  /* ---- the player, on his side ---- */
  const cx = right ? 735 + r() * 30 : 345 - r() * 30;
  const box = standing(data, { cx, headTop: 150, floor: 1290, maxFace: 210 });
  const fh = box.faceH;
  const head = { x0: box.faceCx - fh * 1.15, x1: box.faceCx + fh * 1.15, y0: box.faceTop - fh * 0.95, y1: box.faceTop + fh * 1.5 };

  /* ---- background: the ground (or his own photo, softened) ---- */
  const scene = sceneOf(data);
  const bg = scene ?? data.bgPhotoUrl;
  const bgBlur = scene ? 1.2 : 16;

  /* ---- title: on the free side, beside or under his head but never over it ---- */
  const [serif, script] = split(content.kicker);
  const L = 70;
  const baseS = Math.min(200, 600 / Math.max(1, bodEm(serif, -0.01))) * (params.textScale ?? 1);
  type Lay = { s: number; ss: number; top: number; serifLeft: number; serifW: number; scriptLeft: number; scriptTop: number; scriptW: number; bottom: number };
  const lay = (sz: number, top: number, hang: boolean): Lay => {
    const serifW = bodEm(serif, -0.01) * sz;
    const ss = sz * 1.05;
    const scriptW = script ? vibesEm(script) * ss + ss * 0.2 : 0;
    const serifLeft = right ? L : CANVAS_W - L - serifW;
    // Hanging: the script word runs on from the end of the serif one, dropping below it (as in the reference).
    const scriptLeft = hang ? serifLeft + serifW - sz * 0.3 : right ? Math.min(serifLeft + sz * 0.5, CANVAS_W - 36 - scriptW) : Math.max(36, CANVAS_W - L - scriptW - sz * 0.3);
    const scriptTop = top + sz * (hang ? 0.42 : 0.78);
    return { s: sz, ss, top, serifLeft, serifW, scriptLeft, scriptTop, scriptW, bottom: script ? scriptTop + ss * 0.95 : top + sz };
  };
  const clearOfHead = (l: Lay) => {
    const serifBox = { x: l.serifLeft, y: l.top, w: l.serifW, h: l.s * 0.8 };
    const scriptBox = { x: l.scriptLeft, y: l.scriptTop, w: l.scriptW, h: l.ss * 0.9 };
    const hit = (b: typeof serifBox) => b.x < head.x1 && b.x + b.w > head.x0 && b.y < head.y1 && b.y + b.h > head.y0;
    return !hit(serifBox) && !(script && hit(scriptBox)) && l.scriptLeft + l.scriptW <= CANVAS_W - 30;
  };
  const top0 = 470 + (params.textY ?? 0);
  const freeW = right ? head.x0 - L - 10 : CANVAS_W - L - head.x1 - 10;
  const under = lay(baseS, top0, false);
  const underW = Math.max(under.serifW, right ? under.scriptLeft + under.scriptW - under.serifLeft : under.serifLeft + under.serifW - under.scriptLeft);
  const options = [
    ...(right && script ? [lay(baseS, top0, true)] : []),
    under,
    lay(baseS * Math.max(0.55, Math.min(1, freeW / underW)), top0, false),
  ];
  const t = options.find(clearOfHead) ?? lay(baseS, Math.max(top0, head.y1 + 10), false);
  const { s, ss, serifLeft, scriptLeft, scriptTop } = t;
  const titleTop = t.top;
  const titleBottom = t.bottom;

  /* ---- OSD lines ---- */
  const ours = (data.club?.name ?? "").toUpperCase();
  const teams = (content.home === false ? [f.opp, ours] : [ours, f.opp]).filter(Boolean);
  const line1 = postType === "result" && score ? `FULL TIME ${score}` : f.round || f.comp || "MATCHDAY";
  const dateLine = (content.date ?? "").toUpperCase().replace(/^[A-Z]{3}\s+(?=\d)/, "");
  const kick = f.time ? `KICK-OFF ${f.time}` : "";
  const comp = f.round && f.comp ? f.comp : "";
  // The info stack must end above the teams at the foot (~1110); a low title drops the competition line.
  const compact = titleBottom + 34 + 214 > 1110;
  const osdTop = Math.min(titleBottom + 34, compact ? 960 : 890);
  const fitMono = (t: string, room: number, max: number) => Math.max(15, Math.min(max, room / Math.max(1, [...t].length * 0.6)));
  const glow = "-1.5px 0 rgba(255,40,90,.55), 1.5px 0 rgba(40,220,255,.55), 0 0 10px rgba(0,0,0,.6)";
  const mono = (fs: number, color = WHITE): CSSProperties => ({ fontFamily: MONO, fontWeight: 500, fontSize: fs, lineHeight: 1.15, letterSpacing: "0.04em", color, whiteSpace: "nowrap", textShadow: glow });
  const sideAlign: CSSProperties = right ? { left: L, textAlign: "left" } : { right: L, textAlign: "right" };

  /* ---- glitch blocks: never on his head ---- */
  const hitsHead = (b: { x: number; y: number; w: number; h: number }) => b.x < head.x1 && b.x + b.w > head.x0 && b.y < head.y1 && b.y + b.h > head.y0;
  const tones = ["contrast(1.5) saturate(3) hue-rotate(80deg)", "contrast(1.4) saturate(2.6) hue-rotate(-8deg)", "contrast(1.6) saturate(1.8)", "contrast(1.5) saturate(3) hue-rotate(150deg)", "contrast(1.3) saturate(2.8) hue-rotate(95deg) brightness(.9)"];
  const blocks: Rect[] = [];
  const zones = [
    // across his body and legs (twice)
    { x0: box.faceCx - 320, x1: box.faceCx + 240, y0: head.y1 + 120, y1: 900 },
    { x0: box.faceCx - 280, x1: box.faceCx + 280, y0: 820, y1: 1150 },
    // by the info lines
    { x0: right ? 300 : 340, x1: right ? 740 : 780, y0: 660, y1: 1000 },
    // behind his shoulder, in the stand
    { x0: right ? 760 : 40, x1: right ? 1040 : 320, y0: 200, y1: 700 },
    // low across his legs
    { x0: box.faceCx - 260, x1: box.faceCx + 300, y0: 1020, y1: 1260 },
  ];
  const free = (b: { x: number; y: number; w: number; h: number }) => !hitsHead(b) && b.x >= 0 && b.x + b.w <= CANVAS_W && !blocks.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
  // Each zone gets a stepped cluster of 2–3 rectangles stacked like a corrupted macroblock run.
  for (const z of zones) {
    for (let tries = 0; tries < 24; tries++) {
      const cell = [12, 18, 28][Math.floor(r() * 3)];
      const n = 2 + Math.floor(r() * 2);
      const x = z.x0 + r() * Math.max(10, z.x1 - z.x0 - 220);
      let y = z.y0 + r() * Math.max(10, z.y1 - z.y0 - 220);
      const tone = tones[Math.floor(r() * tones.length)];
      const dx = (r() - 0.5) * 140;
      const run: Rect[] = [];
      for (let k = 0; k < n; k++) {
        const w = cell * Math.round(4 + r() * 9);
        const h = cell * Math.round(2 + r() * 3);
        run.push({ x: x + (r() - 0.4) * 90, y, w, h, dx: dx + (r() - 0.5) * 30, dy: (r() - 0.5) * 160, cell, tone: k === 1 && r() < 0.5 ? tones[Math.floor(r() * tones.length)] : tone, wash: r() < 0.55 ? WASHES[Math.floor(r() * WASHES.length)] : null });
        y += h;
      }
      if (run.every(free)) {
        blocks.push(...run);
        break;
      }
    }
  }
  // Two torn scan bands: the picture slid sideways for a few lines.
  const tears = [0, 1].map(() => ({ y: 0, h: 10 + r() * 26, dx: (r() < 0.5 ? -1 : 1) * (22 + r() * 40) }));
  tears[0].y = head.y1 + 60 + r() * 120;
  tears[1].y = 820 + r() * 260;

  const bgImg = (extra?: CSSProperties) =>
    bg ? (
      <img src={bg} alt="" style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: CANVAS_H + 120, maxWidth: "none", objectFit: "cover", filter: `blur(${bgBlur}px) sepia(.35) saturate(1.35) contrast(1.12) brightness(.8)`, ...extra }} />
    ) : (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 40% 30%, #6b4a2a, #1d140e)" }} />
    );
  const player = (style?: CSSProperties) =>
    data.photoUrl ? <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut), ...style }} /> : null;
  /** The whole picture (ground + player), for copies that get glitched. */
  const picture = (dx: number, filter: string): ReactNode => (
    <div style={{ position: "absolute", left: dx, top: 0, width: CANVAS_W, height: CANVAS_H, filter }}>
      {bgImg({ filter: `blur(${bgBlur}px) sepia(.35) saturate(1.35) contrast(1.12) brightness(.8)` })}
      {player({ filter: "sepia(.15) saturate(1.2) contrast(1.08)" })}
    </div>
  );
  /**
   * One datamosh block: the picture slid sideways, pixelated into square cells and recoloured. The filter sits
   * on the block itself (Chrome only filters what is visible, so the cell grid must start inside it).
   */
  const block = (b: Rect, key: number) => (
    <div key={key} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, overflow: "hidden", filter: `url(#vhs-pix-${b.cell}) ${b.tone}`, opacity: 0.94 }}>
      <div style={{ position: "absolute", left: -b.x + b.dx, top: -b.y + b.dy, width: CANVAS_W, height: CANVAS_H }}>
        {bgImg({ filter: "sepia(.35) saturate(1.35) contrast(1.12) brightness(.8)" })}
        {player()}
      </div>
      {b.wash && <div style={{ position: "absolute", inset: 0, background: b.wash, mixBlendMode: "multiply", opacity: 0.88 }} />}
    </div>
  );
  const clip = (b: { x: number; y: number; w: number; h: number }, children: ReactNode, key: number | string, style?: CSSProperties) => (
    <div key={key} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", left: -b.x, top: -b.y, width: CANVAS_W, height: CANVAS_H }}>{children}</div>
    </div>
  );

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#120d0a", color: WHITE }}>
      <VhsDefs split={6} />

      {/* The ground on tape: warm, faded, the colour channels drifting apart. */}
      <div style={{ position: "absolute", inset: 0, filter: "url(#vhs-rgb)" }}>{bgImg()}</div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,150,60,.28), rgba(40,20,10,.05) 45%, rgba(10,30,40,.45))", mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,0) 30%, rgba(0,0,0,.15) 60%, rgba(0,0,0,.55))" }} />

      {/* Shade on the free side, under the title and the on-screen lines. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${right ? 90 : 270}deg, rgba(0,0,0,.5), rgba(0,0,0,.18) 45%, transparent 70%)` }} />

      {/* Rainbow light leak: an arc of spectrum burned into one corner, and a soft vertical one up the edge. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          left: right ? -900 : CANVAS_W - 900,
          top: 520 + r() * 120,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, transparent 54%, rgba(255,40,40,.0) 55%, rgba(255,40,40,.75) 56.2%, rgba(255,160,30,.75) 57.2%, rgba(255,240,60,.7) 58.2%, rgba(60,255,120,.6) 59.2%, rgba(40,160,255,.6) 60.2%, rgba(150,60,255,.55) 61.2%, transparent 62.4%)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
          opacity: 0.8,
          transform: `scaleX(${right ? 1 : -1})`,
        }}
      />
      <div
        data-bleed
        style={{
          position: "absolute",
          [right ? "left" : "right"]: 60 + r() * 120,
          top: -60,
          width: 90,
          height: 560,
          background: "linear-gradient(90deg, transparent, rgba(255,60,60,.5), rgba(255,200,40,.5), rgba(80,255,140,.45), rgba(60,150,255,.45), transparent)",
          filter: "blur(16px)",
          mixBlendMode: "screen",
          transform: `rotate(${right ? 8 : -8}deg)`,
          opacity: 0.7,
        }}
      />

      {/* The player, with red / cyan ghosts of him a few pixels apart (kept off his head). */}
      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", ...headHoleMask(data, box, 2.4) }}>
            {player({ transform: "translateX(-10px)", filter: "url(#vhs-red)", opacity: 0.8, mixBlendMode: "screen" })}
            {player({ transform: "translateX(10px)", filter: "url(#vhs-cyan)", opacity: 0.8, mixBlendMode: "screen" })}
          </div>
          {player({ filter: "sepia(.15) saturate(1.2) contrast(1.08) drop-shadow(0 20px 40px rgba(0,0,0,.4))" })}
        </>
      )}

      {/* Datamosh: blocks of the picture pixelated, slid and recoloured. */}
      {blocks.map(block)}
      {tears.map((t, i) => clip({ x: 0, y: t.y, w: CANVAS_W, h: t.h }, picture(t.dx, "saturate(1.3) brightness(1.1)"), `t${i}`, { mixBlendMode: "normal", opacity: 0.9, ...(hitsHead({ x: 0, y: t.y, w: CANVAS_W, h: t.h }) ? { display: "none" } : {}) }))}

      {/* His head, always clean, on top of every glitch. */}
      {data.photoUrl && <HeadLayer data={data} box={box} grow={1.9} style={{ filter: "sepia(.15) saturate(1.2) contrast(1.08)" }} />}

      {/* Crests, small, top corner; PLAY on the other. */}
      <div style={{ position: "absolute", top: 70, [right ? "left" : "right"]: L, display: "flex", gap: 18, alignItems: "center" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 62, height: 62, objectFit: "contain", filter: "sepia(.2) drop-shadow(0 2px 8px rgba(0,0,0,.6))" }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 82, [right ? "right" : "left"]: L, ...mono(30) }}>PLAY ▶</div>

      {/* Title: a fine serif word, the last one in script. */}
      <div
        data-bleed
        style={{ position: "absolute", left: serifLeft, top: titleTop - s * 0.2, fontFamily: BODONI, fontWeight: 500, fontSize: s, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: WHITE, textShadow: "-2px 0 rgba(255,40,90,.5), 2px 0 rgba(40,220,255,.5), 0 6px 30px rgba(0,0,0,.45)" }}
      >
        {serif}
      </div>
      {script && (
        <div
          data-bleed
          style={{ position: "absolute", left: scriptLeft, top: scriptTop - ss * 0.25, fontFamily: VIBES, fontSize: ss, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textShadow: "-2px 0 rgba(255,40,90,.5), 2px 0 rgba(40,220,255,.5), 0 0 3px rgba(0,0,0,.35), 0 4px 22px rgba(0,0,0,.6)" }}
        >
          {script}
        </div>
      )}

      {/* On-screen display: the round in yellow, then date and kick-off. */}
      <div style={{ position: "absolute", top: osdTop, ...sideAlign, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 14 }}>
        <div style={mono(fitMono(line1, 560, 32), AMBER)}>{line1}</div>
        {comp && !compact && <div style={mono(fitMono(comp, 560, 22), AMBER)}>{comp}</div>}
        {dateLine && <div style={{ ...mono(compact ? 34 : 46), marginTop: compact ? 4 : 18 }}>{dateLine}</div>}
        {kick && <div style={mono(compact ? 26 : 34)}>{kick}</div>}
      </div>

      {/* Foot of the frame, on the free side: the two teams (yellow), the ground (white), then the agency. */}
      <div style={{ position: "absolute", bottom: 132, ...sideAlign, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 2 }}>
        {teams.map((t, i) => (
          <div key={i} style={mono(fitMono(teams.reduce((a, x) => (x.length > a.length ? x : a), ""), 420, 22), AMBER)}>
            {t}
          </div>
        ))}
        {f.venue && <div style={{ ...mono(fitMono(f.venue, 420, 22)), marginTop: 10 }}>{f.venue}</div>}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", [right ? "left" : "right"]: L, bottom: 56 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }} />

      {/* Tape: scan lines, tracking hiss near the foot, grain, a soft rounded-screen vignette. */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(to bottom, rgba(0,0,0,.16) 0px, rgba(0,0,0,.16) 1px, transparent 1px, transparent 4px)", pointerEvents: "none" }} />
      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: 1196 + r() * 40, height: 34, backgroundImage: HISS, backgroundSize: "1080px 60px", opacity: 0.35, mixBlendMode: "screen", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 50%, transparent 62%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
