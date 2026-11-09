/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, vivid } from "@/lib/color";
import { ARCHIVO } from "./fx";
import { rng } from "./kit";
import { lift } from "./column";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { fitText, fixtureSides } from "./bighead";

const LIGHT = "#f3f3f2";
const DARK = "#0d0d0e";
const INK = "#141415";

/** Archivo caps: average advance relative to the size (black weight / light weight). */
const HEAVY = 0.74;
const THIN = 0.62;

/** A small grid of "+" marks (every other one a dot), like registration marks on a print. */
function Marks({ x, y, cols, rows, gap, color, seed }: { x: number; y: number; cols: number; rows: number; gap: number; color: string; seed: number }) {
  const r = rng(seed);
  const cells: { cx: number; cy: number; plus: boolean }[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      // Staggered rows, a few gaps: it should look placed, not tiled.
      if (r() < 0.22) continue;
      cells.push({ cx: x + i * gap + (j % 2 ? gap / 2 : 0), cy: y + j * gap * 0.62, plus: r() < 0.55 });
    }
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {cells.map((c, i) =>
        c.plus ? (
          <path key={i} d={`M${c.cx - 4} ${c.cy}H${c.cx + 4}M${c.cx} ${c.cy - 4}V${c.cy + 4}`} stroke={color} strokeWidth={1.4} />
        ) : (
          <circle key={i} cx={c.cx} cy={c.cy} r={1.6} fill={color} />
        ),
      )}
    </svg>
  );
}

/**
 * Santos youth matchday (São Caetano vs. Santos): the canvas split in two — a pale left side with a ghost of
 * his own photo, a near-black right side with faint ghosted words — and a big angular black-and-white mark
 * standing on the split behind the player, who crosses it with the ball, a long soft shadow at his feet.
 * Top left: competition, "HOME vs." light and our team huge, date and kick-off; "+" marks, a thin rule with
 * the club's short name, and his full name spaced right across the canvas at knee height.
 */
export function Splitbw({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 55;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);
  const ts = params.textScale ?? 1;

  // One accent at most: the club colour when the club is not itself black and white.
  const raw = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const accent = luminance(raw) > 0.08 && luminance(raw) < 0.85 && vivid(raw) !== "#ffffff" ? raw : null;

  const m = matchFacts(data);
  const sides = fixtureSides(data, m);
  const score = scoreOf(data);

  // ---- the split ----
  const S = X(690 + (r() - 0.5) * 30);
  const lightLeft = !flip;
  const darkX0 = lightLeft ? S : 0;
  const darkW = lightLeft ? CANVAS_W - S : S;

  // ---- the player, whole, crossing the split ----
  const headTop = 230 + r() * 30;
  const floor = 1210;
  let stood = standing(data, { cx: S + (flip ? 160 : -160), headTop, floor, maxFace: 110, framing: "full" });
  // A raised arm or a wide stride reaching far into the light side: slide him a little towards the split.
  const reach = flip ? CANVAS_W - (stood.left + stood.width) : stood.left;
  if (reach < 340) {
    const dx = Math.min(80, 340 - reach) * (flip ? -1 : 1);
    stood = { ...stood, left: stood.left + dx, faceCx: stood.faceCx + dx };
  }
  const { box, style: fade } = lift(data, stood, headTop + stood.faceH * 0.6);

  // ---- the angular mark behind him ----
  const mTop = Math.max(250, box.faceTop + box.faceH * 0.2);
  const mBot = Math.min(floor - 300, mTop + 640);
  const bw = 320; // width of the black block on the light side
  const d = flip ? -1 : 1;
  // The block: from S - bw to S + 30 (it merges into the dark side); a notch cut at the top outer corner.
  const block = [
    [S - d * bw, mTop + 120],
    [S - d * (bw - 120), mTop],
    [S + d * 30, mTop],
    [S + d * 30, mBot],
    [S - d * bw, mBot],
  ];
  // White slanted bars inside it: letter strokes knocked out of the black, fading as they go down.
  const bars = [
    [
      [S - d * 150, mTop + 250],
      [S - d * 24, mTop + 185],
      [S - d * 24, mTop + 420],
      [S - d * 150, mTop + 485],
    ],
    [
      [S + d * 84, mTop + 90],
      [S + d * 190, mTop + 30],
      [S + d * 190, mBot - 30],
      [S + d * 84, mBot - 30],
    ],
  ];
  const poly = (pts: number[][]) => pts.map(([x, y]) => `${x.toFixed(0)},${y.toFixed(0)}`).join(" ");

  // ---- the text block, top of the light side, right-aligned towards the player ----
  const faceLeft = flip ? box.faceCx + box.faceH * 1.5 : box.faceCx - box.faceH * 1.5;
  // Stop short of his face, and of whatever else of him reaches out on that side (the photo is trimmed to his outline).
  const reachIn = flip ? box.left + box.width + 14 : box.left - 14;
  const textEdge = flip ? Math.min(CANVAS_W - 290, Math.max(CANVAS_W - 420, faceLeft, reachIn)) : Math.max(290, Math.min(420, faceLeft, reachIn));
  const colW = flip ? CANVAS_W - 56 - textEdge : textEdge - 56;
  const isMatch = postType === "matchday" || postType === "result" || postType === "goal";
  const ours = sides.names[sides.ourIndex] || (data.club?.name ?? "").toUpperCase();
  const other = sides.names[1 - sides.ourIndex] || m.opp;
  // A man-of-the-match post leads with its title; the others with the competition.
  const top = postType === "result" ? content.kicker.toUpperCase() : m.comp || m.round || content.kicker.toUpperCase();
  const lightLine = other ? (sides.ourIndex === 0 ? `vs. ${other}` : `${other} vs.`) : "";
  const bigSize = fitText(ours, colW, 86, HEAVY) * ts;
  const lightSize = Math.min(bigSize * 0.56, fitText(lightLine, colW, 44, THIN)) * ts;
  const dd = /^([A-Z]{3})\s+(\d{1,2})\s+([A-Z]{3})/.exec(m.date);
  const MON: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };
  const shortDate = dd ? `${dd[2].padStart(2, "0")}.${MON[dd[3]] ?? dd[3]}` : m.date;
  const when = postType === "matchday" ? [shortDate, m.time].filter(Boolean) : score ? [postType === "result" ? "FULL TIME" : content.kicker.toUpperCase(), score].filter(Boolean) : [shortDate].filter(Boolean);
  const alignSide = flip ? "flex-start" : "flex-end";
  const textAlign = flip ? "left" : "right";

  // ---- the full name spaced across the canvas at knee height ----
  const full = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const hairTop = box.faceTop - box.faceH * 0.6;
  const nameY = stood.feet ? Math.min(1080, Math.max(900, hairTop + (floor - hairTop) * 0.74)) : 1010;
  // Spread right across for a full name; a short one ("KAKA") keeps an even, wide spacing around the middle.
  // A short one ("KAKA") would lose half its letters behind him: it spreads over the dark side instead.
  const long = [...full].length >= 10;
  const spread = long ? Math.min(920, [...full].length * 62) : Math.min(darkW - 110, [...full].length * 58);
  const spreadLeft = long ? 540 - spread / 2 : lightLeft ? S + (darkW - spread) / 2 : (S - spread) / 2;

  // Short club name for the rule: "santos" → "san / tos".
  const short = (data.club?.name ?? "").normalize("NFD").replace(/[^A-Za-z ]/g, "").trim().split(/\s+/).sort((a, b) => b.length - a.length)[0]?.toLowerCase() ?? "";
  const shortLines = short.length > 4 && short.length <= 9 ? [short.slice(0, Math.ceil(short.length / 2)), short.slice(Math.ceil(short.length / 2))] : [short.slice(0, 9)];

  const ghostWord = (data.club?.name ?? content.kicker).toUpperCase();
  const lightStyle: CSSProperties = lightLeft ? { left: 0, width: S } : { left: S, right: 0 };
  const darkStyle: CSSProperties = lightLeft ? { left: S, right: 0 } : { left: 0, width: S };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: LIGHT, color: INK }}>
      {/* Light side: a ghost of his own photo, blurred to a soft grey texture. */}
      <div style={{ position: "absolute", top: 0, bottom: 0, overflow: "hidden", background: LIGHT, ...lightStyle }}>
        {data.bgPhotoUrl && (
          <img
            src={data.bgPhotoUrl}
            alt=""
            style={{ position: "absolute", left: -80, top: -80, width: CANVAS_W + 160, height: CANVAS_H + 160, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) blur(40px) contrast(.9) brightness(1.25)", opacity: 0.35 }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,.35), rgba(255,255,255,0) 40%, rgba(255,255,255,.5) 100%)" }} />
      </div>
      {/* Dark side with faint ghosted words. */}
      <div style={{ position: "absolute", top: 0, bottom: 0, overflow: "hidden", background: DARK, ...darkStyle }}>
        <div data-bleed style={{ position: "absolute", left: 20, top: 520, width: 1400, fontFamily: ARCHIVO, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: "#ffffff", opacity: 0.03, filter: "blur(2px)", whiteSpace: "nowrap" }}>
          <div>{ghostWord}</div>
          <div style={{ marginLeft: -140 }}>{ghostWord}</div>
          <div style={{ marginLeft: -60 }}>{ghostWord}</div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 60% at 30% 40%, rgba(255,255,255,.05), transparent 70%)" }} />
      </div>

      {/* The angular mark on the split. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`sb-down-${seed}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`sb-blk-${seed}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#000000" />
            <stop offset="0.7" stopColor="#0d0d0e" />
            <stop offset="1" stopColor="#3a3a3c" />
          </linearGradient>
        </defs>
        <polygon points={poly(block)} fill={`url(#sb-blk-${seed})`} />
        {bars.map((b, i) => (
          <polygon key={i} points={poly(b)} fill={`url(#sb-down-${seed})`} opacity={i === 1 ? 0.92 : 1} />
        ))}
      </svg>

      {/* Registration marks: a patch on the light side, one on the dark. */}
      <Marks x={X(lightLeft ? 70 : 70)} y={560} cols={4} rows={4} gap={42} color="rgba(20,20,21,.55)" seed={seed} />
      <Marks x={darkX0 + darkW * 0.3} y={250} cols={4} rows={5} gap={44} color="rgba(255,255,255,.7)" seed={seed + 5} />

      {/* Long soft shadow on the floor, thrown away from the dark side. */}
      {stood.feet && (
        <div
          style={{
            position: "absolute",
            left: box.faceCx - (flip ? -40 : 460),
            width: 520,
            top: floor - 26,
            height: 52,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(0,0,0,.34), rgba(0,0,0,.12) 60%, transparent)",
            filter: "blur(6px)",
          }}
        />
      )}

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 26px rgba(0,0,0,.28))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05)", ...fade }}
          />
        </div>
      )}

      {/* His name spaced across the canvas over everything, inverting what it crosses: dark on the light side, light on the dark, negative on him. */}
      {full && (
        <div
          style={{
            position: "absolute",
            left: spreadLeft,
            width: spread,
            top: nameY - 12,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: ARCHIVO,
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1,
            color: "#ffffff",
            mixBlendMode: "difference",
          }}
        >
          {[...full].map((ch, i) => (
            <span key={i} style={{ minWidth: ch === " " ? 18 : undefined }}>
              {ch === " " ? "" : ch}
            </span>
          ))}
        </div>
      )}

      {/* The fixture, top of the light side. */}
      <div style={{ position: "absolute", [flip ? "left" : "right"]: flip ? textEdge : CANVAS_W - textEdge, top: 262, width: colW, display: "flex", flexDirection: "column", alignItems: alignSide, textAlign, color: INK }}>
        {top && (
          // A long cup name wraps onto two lines rather than shrinking to nothing.
          <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: Math.max(15, fitText(top, colW, 24, 0.72)), lineHeight: 1.2, letterSpacing: "0.02em", whiteSpace: fitText(top, colW, 24, 0.72) < 15 ? "normal" : "nowrap", maxWidth: colW }}>
            {top}
          </div>
        )}
        {isMatch && lightLine && sides.ourIndex === 1 && (
          <div style={{ fontFamily: ARCHIVO, fontWeight: 300, fontSize: lightSize, lineHeight: 1.1, marginTop: 6, whiteSpace: "nowrap" }}>{lightLine}</div>
        )}
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: bigSize, lineHeight: 1, letterSpacing: "-0.01em", marginTop: 2, whiteSpace: "nowrap" }}>{isMatch ? ours : (content.lastName || content.firstName).toUpperCase()}</div>
        {isMatch && lightLine && sides.ourIndex === 0 && (
          <div style={{ fontFamily: ARCHIVO, fontWeight: 300, fontSize: lightSize, lineHeight: 1.1, marginTop: 2, whiteSpace: "nowrap" }}>{lightLine}</div>
        )}
        {when.length > 0 && (
          <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 26, marginTop: 12, whiteSpace: "nowrap", display: "flex", gap: 12, alignItems: "center" }}>
            {when.map((w, i) => (
              <span key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {i > 0 && <span style={{ width: 3, height: 22, background: accent ?? INK, display: "inline-block" }} />}
                {w}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thin rule on the dark side, the club's short name at its top. */}
      <div style={{ position: "absolute", [flip ? "left" : "right"]: 46, top: 262, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 15, lineHeight: 1.05, color: "#ffffff", textAlign: "center", letterSpacing: "0.04em" }}>
          {shortLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div style={{ width: 2, height: Math.max(300, nameY - 380), background: accent ? `linear-gradient(to bottom, ${accent}, #ffffff 30%)` : "#ffffff", opacity: 0.9 }} />
      </div>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", [flip ? "left" : "right"]: 60, bottom: 52, opacity: 0.85 }} />
    </div>
  );
}
