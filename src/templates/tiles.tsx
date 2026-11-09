/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask } from "./fx";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts, placeFace, shortFacts } from "./strokes";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const T = 270;
const COLS = 4;
const ROWS = 5;

/** Archivo Black: advance widths per 100px of font size (measured in the browser). */
const ARCHIVO_W: Record<string, number> = {
  A: 77.8,
  B: 77.8,
  C: 77.8,
  D: 77.8,
  E: 72.2,
  F: 66.7,
  G: 83.3,
  H: 83.3,
  I: 38.9,
  J: 66.7,
  K: 83.3,
  L: 66.7,
  M: 94.4,
  N: 83.3,
  O: 83.3,
  P: 72.2,
  Q: 83.3,
  R: 77.8,
  S: 72.2,
  T: 72.2,
  U: 83.3,
  V: 77.8,
  W: 100,
  X: 77.8,
  Y: 77.8,
  Z: 72.2,
  " ": 33.3,
  "-": 33.3,
  "'": 27.8,
  ".": 33.3,
  ":": 33.3,
  "/": 27.8,
  "&": 88.9,
};
const archivoEm = (t: string) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (ARCHIVO_W[c] ?? (/\d/.test(c) ? 66.7 : 80)) / 100, 0);
const CAP = 0.688;

/** Archivo 300: advance widths per 100px (digits and the few signs a score or a time needs). */
const THIN_W: Record<string, number> = {
  "0": 57.2,
  "1": 49.6,
  "2": 56.3,
  "3": 57.2,
  "4": 54.5,
  "5": 57,
  "6": 57.2,
  "7": 53.3,
  "8": 57.3,
  "9": 57.2,
  ":": 27.7,
  "-": 33.3,
  " ": 21.4,
};
const thinEm = (t: string) => [...t].reduce((a, c) => a + (THIN_W[c] ?? 68) / 100, 0);

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

type Variant = "plain" | "mono" | "shift" | "zoom" | "monozoom";
type Rect = { x0: number; y0: number; x1: number; y1: number };
const hits = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** "MATCHDAY" → MATCH / DAY; otherwise up to two balanced lines. */
function stack(kicker: string): string[] {
  const k = kicker
    .toUpperCase()
    .replace(/’/g, "'")
    .trim()
    .replace(/^(MATCH|GAME)DAY$/, "$1 DAY")
    .replace(/^FULLTIME$/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [k];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(archivoEm(words.slice(0, i).join(" ")) - archivoEm(words.slice(i).join(" ")));
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Split-grid poster (Tyrese Maxey "54 PTS"): the canvas cut into square tiles with hairline gaps, one
 * dark scene of the player running under all of them — some tiles nudged out of line, zoomed in or
 * turned black and white, the tiles around his head always whole and in place. Huge outline title
 * letters and his shirt number peek through behind him; the kick-off (or score) in thin type by a
 * white bar, the crest as a mark, and small spaced captions in the tile corners.
 */
export function Tiles({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 54;
  const r = rng(seed);
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.5 || luminance(club) < 0.02) club = "#c8102e";
  const f = matchFacts(data);
  const score = scoreOf(data, "-");

  /* ---- the player: his face set in the middle of a column, a tile below the top ---- */
  const faceX = right ? T * 2.5 : T * 1.5;
  const faceTop = T + 78;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const wantFace = ({ chest: 205, waist: 190, knees: 175, full: 160 } as Record<string, number>)[params.framing ?? "waist"] ?? 190;
  // Down to the floor when the photo allows it, but never a face blown past ~1.25 tiles.
  const reach = Math.min(CANVAS_H + 40, faceTop + (230 / face[3]) * (1 - face[1]));
  const box = placeFace(data, faceX, faceTop, wantFace, reach);
  const fw = face[2] * box.width;
  const fh = face[3] * box.height;
  const fx = box.left + face[0] * box.width;
  const fy = box.top + face[1] * box.height;
  // Whole head with hair, ears and neck: nothing in here may move or be cut by a line.
  const head: Rect = { x0: fx - fw * 0.4, x1: fx + fw * 1.4, y0: fy - fh * 0.6, y1: fy + fh * 1.25 };
  const body: Rect = { x0: fx - fw * 1.8, x1: fx + fw * 2.8, y0: fy + fh, y1: box.top + box.height * 0.97 };

  /* ---- tiles and their treatments ---- */
  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS;
    const rr = Math.floor(i / COLS);
    const rect: Rect = { x0: c * T, y0: rr * T, x1: (c + 1) * T, y1: (rr + 1) * T };
    return { c, r: rr, rect, locked: hits(rect, head), onBody: hits(rect, body), v: "plain" as Variant, dx: 0, dy: 0 };
  });
  const free = tiles.filter((t) => !t.locked);
  // Treatments go where they show: on his body first, a couple on the empty dark too.
  const order = free.filter((t) => t.onBody).sort(() => r() - 0.5);
  const plan: Variant[] = ["shift", "mono", "zoom", "shift", "mono", "monozoom"];
  // A tile shows the scene from (its own rect − its shift): that source must never reach his head,
  // or a second, sliced face would appear beside the real one.
  const guard: Rect = { x0: head.x0 - 30, x1: head.x1 + 30, y0: head.y0 - 30, y1: head.y1 + 30 };
  const shiftFor = (t: (typeof tiles)[number]): [number, number] | null => {
    const amt = 70 + r() * 60;
    const options: [number, number][] = [
      [amt, 0],
      [-amt, 0],
      [0, amt],
      [0, -amt],
    ].sort(() => r() - 0.5) as [number, number][];
    return (
      options.find(([dx, dy]) => !hits({ x0: t.rect.x0 - dx, x1: t.rect.x1 - dx, y0: t.rect.y0 - dy, y1: t.rect.y1 - dy }, guard)) ?? null
    );
  };
  let k = 0;
  for (const t of order) {
    if (k >= plan.length) break;
    if (plan[k] === "shift") {
      const d = shiftFor(t);
      if (!d) continue;
      [t.dx, t.dy] = d;
    }
    t.v = plan[k++];
  }

  /* ---- words ---- */
  const lines = stack(content.kicker);
  const bigSize = Math.min(330, (CANVAS_W - 40) / Math.max(...lines.map(archivoEm)));
  const bigTop = T * 2 - 10;
  const number = data.player.number || "";
  const ours = (data.club?.name ?? "").toUpperCase();

  const fact = shortFacts(data, 3);
  let hero = f.time || f.day || "";
  let heroLabel = f.time ? "KO" : f.mon;
  if (postType === "result" && score) [hero, heroLabel] = [score, "FT"];
  else if (postType !== "matchday" && fact[0]) [hero, heroLabel] = [String(fact[0].value), fact[0].label.toUpperCase()];
  const heroSize = Math.min(118, 330 / Math.max(1, thinEm(hero)));

  const listing: [string, string][] = (
    postType === "matchday"
      ? ([
          [f.day, f.mon],
          [f.opp ? "VS" : "", f.opp],
        ] as [string, string][])
      : ([
          ...fact.slice(postType === "result" ? 0 : 1).map((s) => [String(s.value), s.label.toUpperCase()]),
          [f.opp ? "VS" : "", f.opp],
        ] as [string, string][])
  ).filter(([a, b]) => a || b);
  const crestFilter = `${params.crestColor ? "" : "url(#tiles-mono) "}drop-shadow(0 2px 8px rgba(0,0,0,.5))`;
  const name = `${content.firstName} ${content.lastName}`.trim().toUpperCase();
  const comp = [f.comp, f.round].filter(Boolean).join(" · ") || ours;
  const fitCaption = (t: string, room: number, max = 17) => Math.max(11, Math.min(max, room / Math.max(1, [...t].length * 0.78)));
  const caption = (fs: number): CSSProperties => ({
    fontFamily: ARCHIVO,
    fontWeight: 400,
    fontSize: fs,
    letterSpacing: "0.08em",
    lineHeight: 1.2,
    color: WHITE,
    whiteSpace: "nowrap",
    textShadow: "0 1px 8px rgba(0,0,0,.6)",
  });

  // Caption column away from his face.
  const freeCol = right ? 0 : COLS - 1;
  const capX = freeCol * T + 34;
  const side: CSSProperties = right ? { left: capX } : { right: CANVAS_W - (freeCol + 1) * T + 34 };

  /* ---- the scene under every tile ---- */
  const scene = (letters: boolean): ReactNode => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0b0b0d" }} />
      {data.bgPhotoUrl && (
        <img
          src={data.bgPhotoUrl}
          alt=""
          style={{
            position: "absolute",
            left: -80,
            top: -80,
            width: CANVAS_W + 160,
            height: CANVAS_H + 160,
            maxWidth: "none",
            objectFit: "cover",
            filter: "blur(30px) grayscale(1) brightness(.55)",
            opacity: 0.55,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(48% 38% at ${((fx + fw / 2) / CANVAS_W) * 100}% 46%, ${shade(club, -0.35)}aa, transparent 75%)`,
        }}
      />
      {/* Huge outline title behind him. */}
      {letters && (
        <div
          data-bleed
          style={{
            position: "absolute",
            left: right ? 22 : undefined,
            right: right ? undefined : 22,
            top: bigTop - bigSize * (1 - CAP) * 0.82,
            fontFamily: ARCHIVO_BLACK,
            fontSize: bigSize,
            lineHeight: `${bigSize * CAP * 1.12}px`,
            whiteSpace: "nowrap",
            color: "transparent",
            WebkitTextStroke: `2.5px ${club}`,
            textAlign: right ? "left" : "right",
            opacity: 0.8,
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
      {letters && number && (
        <div
          data-bleed
          style={{
            position: "absolute",
            [right ? "right" : "left"]: -30,
            top: CANVAS_H - 470,
            fontFamily: ARCHIVO_BLACK,
            fontSize: 560,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: `3px ${shade(club, 0.25)}`,
            opacity: 0.8,
          }}
        >
          {number}
        </div>
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.08) saturate(1.08) drop-shadow(0 24px 40px rgba(0,0,0,.55))",
            ...cutMask(data.cut),
          }}
        />
      )}
    </>
  );

  const filterOf = (v: Variant) => (v === "mono" || v === "monozoom" ? "grayscale(1) contrast(1.25) brightness(.95)" : undefined);
  const transformOf = (t: (typeof tiles)[number]) =>
    t.v === "shift"
      ? `translate(${t.dx}px, ${t.dy}px)`
      : t.v === "zoom" || t.v === "monozoom"
        ? `scale(${t.v === "zoom" ? 1.55 : 1.35})`
        : undefined;

  /* ---- hairlines between tiles, broken where they would cross his head ---- */
  const segs: Rect[] = [];
  for (let c = 1; c < COLS; c++)
    for (let rr = 0; rr < ROWS; rr++) segs.push({ x0: c * T - 0.75, x1: c * T + 0.75, y0: rr * T, y1: (rr + 1) * T });
  for (let rr = 1; rr < ROWS; rr++)
    for (let c = 0; c < COLS; c++) segs.push({ x0: c * T, x1: (c + 1) * T, y0: rr * T - 0.75, y1: rr * T + 0.75 });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0b0b0d", color: WHITE }}>
      <MonoDefs id="tiles-mono" ink={0.6} />
      {tiles.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: t.rect.x0, top: t.rect.y0, width: T, height: T, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: -t.rect.x0,
              top: -t.rect.y0,
              width: CANVAS_W,
              height: CANVAS_H,
              transform: transformOf(t),
              transformOrigin: `${t.rect.x0 + T / 2}px ${t.rect.y0 + T / 2}px`,
              filter: filterOf(t.v),
            }}
          >
            {scene(t.v !== "zoom" && t.v !== "monozoom")}
          </div>
        </div>
      ))}

      {segs
        .filter((s) => !hits(s, head))
        .map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x0,
              top: s.y0,
              width: s.x1 - s.x0,
              height: s.y1 - s.y0,
              background: "rgba(255,255,255,.42)",
            }}
          />
        ))}

      {/* Kick-off (or score) by a white bar, top corner. */}
      {hero && (
        <div
          style={{
            position: "absolute",
            top: 118,
            [right ? "left" : "right"]: 0,
            display: "flex",
            flexDirection: right ? "row" : "row-reverse",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div style={{ width: 118, height: 58, background: "#f2f0f2" }} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: right ? "row" : "row-reverse" }}>
            <span style={{ fontFamily: ARCHIVO, fontWeight: 300, fontSize: heroSize, lineHeight: 0.8, letterSpacing: "-0.02em" }}>
              {hero}
            </span>
            {heroLabel && (
              <span style={{ fontFamily: ARCHIVO, fontWeight: 400, fontSize: 19, letterSpacing: "0.06em", marginBottom: -2 }}>
                {heroLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Crest as a mark in the far top tile. */}
      {f.ourCrest && (
        <img
          src={f.ourCrest}
          alt=""
          style={{
            position: "absolute",
            top: 92,
            [right ? "right" : "left"]: (T - 84) / 2,
            width: 84,
            height: 84,
            objectFit: "contain",
            filter: crestFilter,
          }}
        />
      )}

      {/* Small captions in tile corners. */}
      <div
        style={{
          position: "absolute",
          top: T - 34,
          ...(right ? { left: T + 34 } : { right: T + 34 }),
          ...caption(fitCaption(content.kicker, T - 50)),
        }}
      >
        {content.kicker.toUpperCase()}
      </div>
      <div style={{ position: "absolute", top: T + 30, ...side, ...caption(fitCaption(comp, T - 60, 16)) }}>{comp}</div>
      {listing.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: T * 3 + 30,
            ...side,
            display: "grid",
            gridTemplateColumns: "auto auto",
            columnGap: 16,
            rowGap: 6,
          }}
        >
          {listing.map(([a, b], i) => (
            <div key={i} style={{ display: "contents" }}>
              <span style={{ ...caption(19), textAlign: "right" }}>{a}</span>
              <span style={{ ...caption(fitCaption(b, T - 110, 19)) }}>{b}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", top: T * 4 + 40, ...side, ...caption(fitCaption(name, T - 60, 18)) }}>{name}</div>

      <AgencyLogo
        data={data}
        height={22}
        style={{
          position: "absolute",
          [right ? "left" : "right"]: 34,
          bottom: 36 - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: right ? "left bottom" : "right bottom",
        }}
      />

      <div
        style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(0,0,0,.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
