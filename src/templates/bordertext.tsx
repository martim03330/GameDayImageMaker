/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { ringEm, mix } from "./circletext";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SEP = " · ";

/** The packed words of one edge: the items it carries, and the font size they share with the other edges. */
type Edge = { tokens: number[]; len: number };

/**
 * Packs a looping stream of items onto the four edges of a frame (top, right, bottom, left), each edge
 * carrying whole items only, and picks the one font size (near `base`) that makes every edge fill its
 * length most evenly — the rest is absorbed by `textLength`, a hair of letter-spacing either way.
 */
export function packTape(items: string[], lens: number[], base: number, tracking: number) {
  const em = items.map((t) => ringEm(t, tracking));
  const sepEm = ringEm(SEP, tracking);
  let best: { size: number; edges: Edge[]; score: number } | null = null;
  for (let k = 0.84; k <= 1.16; k += 0.01) {
    const size = base * k;
    let i = 0;
    let score = Math.abs(k - 1) * 0.15;
    const edges: Edge[] = [];
    for (const len of lens) {
      const tokens = [i % items.length];
      let w = em[i % items.length] * size;
      i++;
      // Take the next item while the edge stays at most a few per cent over its natural width.
      while (w + (sepEm + em[i % items.length]) * size <= len * 1.05) {
        w += (sepEm + em[i % items.length]) * size;
        tokens.push(i % items.length);
        i++;
      }
      score = Math.max(score, Math.abs(len / w - 1) + Math.abs(k - 1) * 0.15);
      edges.push({ tokens, len });
    }
    if (!best || score < best.score) best = { size, edges, score };
  }
  return best!;
}

/**
 * The edge tape: one line of small tracked caps running clockwise round the frame (x0,y0)–(x1,y1) — along
 * the top, down the right side, upside-down along the bottom, up the left side — with a small square at each
 * corner. Item `bold` is set a weight heavier wherever it comes round.
 */
export function Tape({
  id,
  x0,
  y0,
  x1,
  y1,
  items,
  base,
  tracking,
  ink,
  gap,
  dot,
  bold = 0,
}: {
  id: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  items: string[];
  base: number;
  tracking: number;
  ink: string;
  gap: number;
  dot: number;
  bold?: number;
}) {
  const w = x1 - x0;
  const h = y1 - y0;
  const lens = [w - 2 * gap, h - 2 * gap, w - 2 * gap, h - 2 * gap];
  const { size, edges } = packTape(items, lens, base, tracking);
  // Centre of each edge and its rotation (the baseline faces outwards, reading clockwise).
  const mids: [number, number, number][] = [
    [x0 + w / 2, y0, 0],
    [x1, y0 + h / 2, 90],
    [x0 + w / 2, y1, 180],
    [x0, y0 + h / 2, -90],
  ];
  const corners = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  return (
    <svg data-bleed width={CANVAS_W} height={Math.max(y1 + 60, 1)} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
      {edges.map((e, k) => {
        const [cx, cy, rot] = mids[k];
        return (
          <text
            key={`${id}-${k}`}
            x={cx + (size * tracking) / 2}
            y={cy}
            transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-inter), system-ui, sans-serif"
            fontWeight={500}
            fontSize={size}
            letterSpacing={size * tracking}
            fill={ink}
            textLength={e.len}
            lengthAdjust="spacing"
          >
            {e.tokens.map((t, j) => (
              <tspan key={j}>
                {j > 0 ? SEP : ""}
                <tspan fontWeight={t === bold ? 700 : 500}>{items[t]}</tspan>
              </tspan>
            ))}
          </text>
        );
      })}
      {corners.map(([x, y], k) => (
        <rect key={k} x={x - dot / 2} y={y - dot / 2} width={dot} height={dot} fill={ink} />
      ))}
    </svg>
  );
}

/**
 * Bordertext: a tape frame. One continuous line of tiny tracked caps — "MATCHDAY · HOME V AWAY · DATE ·
 * KICK-OFF · GROUND" looping — runs clockwise round the canvas just inside its edge (upside-down along the
 * bottom, rotated up and down the sides), a small square closing each corner. Inside, nothing but the player
 * big on a clean ground, melting away above the NEYOD logo. (Unlike `circletext`, the words draw the frame
 * of the picture, not a halo; unlike `echoline`, no silhouette line.)
 */
export function Bordertext({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 7);
  const dark = r() < 0.3;

  const club = clubTone(data);
  const ground = dark ? shade(club, -0.68) : mix("#f2efe9", club, 0.04);
  const ink = dark ? "rgba(255,255,255,.9)" : luminance(club) > 0.2 ? shade(club, -0.55) : shade(club, -0.3);

  /* ---- the words ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const score = scoreOf(data, "–");
  const isResult = postType === "result" && !!score;
  const fixture = teams.length === 2 ? `${teams[0]} ${isResult ? score : "v"} ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const kicker = (isResult ? "Full Time" : content.kicker || "Matchday").replace(/’/g, "'").trim();
  const items = [kicker, fixture, niceDate(content.date), isResult ? "" : f.time, titleCase(f.venue) || titleCase(f.comp || "")].filter(Boolean).map((s) => s.toUpperCase());

  /* ---- the frame ---- */
  const inset = story ? 46 : 38;
  const y0 = story ? STORY_TOP + 10 : inset;
  const y1 = story ? STORY_BOTTOM - 10 : CANVAS_H - inset;
  const x0 = inset;
  const x1 = CANVAS_W - inset;

  /* ---- the logo, inside the frame above the bottom line ---- */
  const logoH = story ? 88 : 52;
  const logoBottomY = y1 - (story ? 52 : 42);
  const logoTop = logoBottomY - logoH;

  /* ---- the player, big and centred, his head well inside the top line ---- */
  const sizes = story ? { chest: 340, waist: 290, knees: 240, full: 200 } : { chest: 250, waist: 205, knees: 165, full: 128 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const b0 = placeByFace(data, 540, 400, sizes);
  const hair = 400 - b0.top;
  let box = placeByFace(data, 540, y0 + Math.max(hair, 0.5 * b0.faceH) + (story ? 120 : 84), sizes);
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const faceTop = box.top + face[1] * box.height;
  const fadeEnd = Math.max(faceTop + box.faceH * 3.2, logoTop - (story ? 60 : 36));
  const fadeLen = story ? 420 : 300;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - fadeLen - box.top}px, transparent ${fadeEnd - box.top}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: flat, a breath of light behind him. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark
            ? `radial-gradient(60% 42% at 50% ${((faceTop + box.faceH * 2) / H) * 100}%, ${shade(club, -0.48)}, transparent 75%)`
            : `radial-gradient(60% 42% at 50% ${((faceTop + box.faceH * 2) / H) * 100}%, rgba(255,255,255,.75), transparent 75%), linear-gradient(to bottom, transparent 70%, ${mix(ground, "#000000", 0.04)})`,
        }}
      />

      {/* The player, natural colour, melting away above the logo. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The tape round the edge, in front of everything. */}
      <Tape id="bordertext" x0={x0} y0={y0} x1={x1} y1={y1} items={items} base={(story ? 17 : 13.5) * ts} tracking={0.3} ink={ink} gap={story ? 22 : 18} dot={story ? 7 : 6} />

      <AgencyLogo
        data={data}
        onLight={!dark}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: H - logoBottomY - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={dark ? 0.16 : 0.1} />
    </div>
  );
}
