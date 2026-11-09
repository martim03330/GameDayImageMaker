/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf } from "@/lib/color";
import { lift } from "./column";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, INTER, interEm, mix, titleCase } from "./wall";

const INK = "#3d3f44";
const SOFT_INK = "#6d7076";

/**
 * One petal of the flower: a tapered loop (a band that swells in the middle and thins to points), drawn
 * around an ellipse that sits out along the petal's axis, open on the side facing the centre.
 */
function petalPath(R: number, tilt: number): string {
  const D = R * 0.55;
  const rx = R * 0.19;
  const ry = R * 0.43;
  const T = R * 0.15;
  // The loop opens on the side facing the centre (a = 90°), a little off-axis so the flower swirls.
  const a0 = (90 + 26) * (Math.PI / 180);
  const a1 = (90 + 318) * (Math.PI / 180);
  // Each loop leans a little, like a propeller blade.
  const lean = (16 * Math.PI) / 180;
  const n = 60;
  const at = (a: number, grow: number) => {
    // Ellipse point (petal axis = -y, outwards), pushed along its normal by `grow`, leant, then moved out.
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    const nx = ry * Math.cos(a);
    const ny = rx * Math.sin(a);
    const l = Math.hypot(nx, ny) || 1;
    const ex = x + (nx / l) * grow;
    const ey = y + (ny / l) * grow;
    const px = ex * Math.cos(lean) - ey * Math.sin(lean);
    const py = ex * Math.sin(lean) + ey * Math.cos(lean) - D;
    return [px * Math.cos(tilt) - py * Math.sin(tilt), px * Math.sin(tilt) + py * Math.cos(tilt)];
  };
  const outer: number[][] = [];
  const inner: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const a = a0 + (a1 - a0) * s;
    // A swoosh: a hair-thin start, swelling late around the tip, then a quick taper to a point.
    const t = T * Math.pow(Math.sin(Math.PI * Math.pow(s, 1.35)), 0.85) * (0.25 + 0.85 * s);
    outer.push(at(a, t * 0.5));
    inner.push(at(a, -t * 0.5));
  }
  const pts = [...outer, ...inner.reverse()];
  return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")}Z`;
}

/** Six swooshing petals around (cx, cy), soft grey with a faint club tint and a gentle shadow. */
function Flower({ cx, cy, R, grey, rot }: { cx: number; cy: number; R: number; grey: string; rot: number }) {
  const size = R * 2 + 200;
  return (
    <svg data-bleed width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, overflow: "visible" }}>
      <defs>
        <radialGradient id="petals-fill" cx="0" cy="0" r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mix(grey, "#ffffff", 0.1)} />
          <stop offset="1" stopColor={mix(grey, "#8c8f94", 0.18)} />
        </radialGradient>
        <filter id="petals-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={R * 0.035} />
          <feOffset dx="0" dy={R * 0.03} result="b" />
          <feComponentTransfer in="b" result="s">
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#petals-shadow)">
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={petalPath(R, ((rot + i * 60) * Math.PI) / 180)} fill="url(#petals-fill)" />
        ))}
      </g>
    </svg>
  );
}

const KEEP = new Set(["USC", "UD", "UDE", "FC", "SC", "CD", "CF", "AC", "AD", "GD", "SL", "SAD", "AFC", "CFC", "VFB", "VFL", "PSV", "AZ", "NK", "FK", "SK", "PFC", "CSKA", "AEK", "PAOK", "OFK", "UEFA", "FIFA", "MLS"]);

/** Title case that keeps club initials ("USC Paredes", "UD Leiria", "AEK Athens"). */
function tc(s: string): string {
  const t = s.trim();
  const out = titleCase(t === t.toLowerCase() ? t.toUpperCase() : t);
  return out
    .split(/(\s+)/)
    .map((w) => (KEEP.has(w.toUpperCase()) || (/^[A-Za-z]{2,4}$/.test(w) && !/[aeiouy]/i.test(w)) ? w.toUpperCase() : w))
    .join("");
}

/** "NEWCASTLE UNITED" → ["Newcastle", "United"]: the last word goes small under the rest. */
function splitName(s: string): [string, string] {
  const t = tc(s);
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [t, ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

/** Inter Light is narrower than the Black the width table measures. */
const LIGHT = 0.86;

/** A corner label: a light line and a small bolder word tucked under its end (Newcastle / United). */
function Label({ big, small, side, top, x, max }: { big: string; small: string; side: "left" | "right"; top: number; x: number; max: number }) {
  const size = Math.min(40, max / Math.max(1, interEm(big, -0.01) * LIGHT));
  const smallSize = Math.min(size * 0.62, max / Math.max(1, interEm(small, 0) * 0.95));
  const pos: CSSProperties = side === "left" ? { left: x } : { right: x };
  return (
    <div style={{ position: "absolute", top, ...pos, display: "flex", flexDirection: "column", alignItems: "flex-end", color: INK, fontFamily: INTER, whiteSpace: "nowrap" }}>
      <div style={{ fontSize: size, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{big}</div>
      {small && <div style={{ fontSize: smallSize, fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.05, marginTop: -2, color: SOFT_INK }}>{small}</div>}
    </div>
  );
}

/**
 * Airy studio poster (Alexander Isak, Newcastle): a very light grey gradient, a big abstract flower of six
 * soft grey swooshing petals centred on the player's chest, the player floating with a soft oval shadow on
 * the floor below, the club name top left and the competition (or the opponent) top right in light sans,
 * and bottom corner the first name small over the surname in big light type, a faint shirt number behind.
 */
export function Petals({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 67);
  const mirror = params.side === "left";
  const ts = params.textScale ?? 1;
  const md = matchFacts(data);
  const club = clubColour(data);
  // The petals: grey, with a whisper of the club colour when it has one.
  const grey = hueOf(club) === null ? "#b9babd" : mix("#b9babd", club, 0.04);

  // ---- the player, floating ----
  const cx = 540 + (mirror ? 30 : -30) + (r() - 0.5) * 30;
  const floor = 1030;
  const placed = standing(data, { cx, headTop: 250, floor, maxFace: 104, framing: "full" });
  const { box, style: figMask } = lift(data, placed, 250 + placed.faceH * 0.2);
  const shadowY = box.feet ? floor + 62 : 0;

  // ---- the flower, on the chest ----
  const R = 380 + r() * 30;
  const fcx = Math.max(R * 0.7, Math.min(CANVAS_W - R * 0.7, box.faceCx + (mirror ? 10 : -10)));
  // On the chest, but never climbing into the corner labels.
  const fcy = Math.min(660, Math.max(box.faceTop + box.faceH * 2.6, 190 + R * 0.9));
  const rot = r() * 60;

  // ---- corner labels ----
  const home = postType === "transfer" ? (data.toClub ?? data.club) : data.club;
  const [clubBig, clubSmall] = splitName(home?.name ?? "");
  let right: [string, string];
  if (postType === "matchday") {
    right = [md.opp ? `v ${tc(md.opp)}` : tc(md.comp), md.opp ? tc(md.comp) : tc(md.round)];
  } else if (postType === "goal") {
    const score = scoreOf(data, "-");
    const res = content.homeTeam && content.awayTeam && score ? `${tc(content.homeTeam)} ${score} ${tc(content.awayTeam)}` : md.opp ? `v ${tc(md.opp)}` : "";
    right = [tc(content.kicker || "Goal"), res];
  } else if (postType === "transfer" || postType === "renewal") {
    right = [tc(content.kicker), content.until ? `Until ${content.until}` : ""];
  } else {
    right = [tc(content.kicker), md.opp ? `v ${tc(md.opp)}` : tc(md.comp)];
  }

  // ---- name block ----
  const first = tc(content.firstName || "");
  const last = tc(content.lastName || content.firstName || "");
  const nameMax = 420;
  const lastSize = Math.min(104 * ts, nameMax / Math.max(1, interEm(last, -0.03) * LIGHT));
  const number = data.player.number;
  const detail = postType === "matchday" ? [md.date, md.time, md.venue].filter(Boolean).join(" · ") : "";
  const detailSize = detail ? Math.min(16, 460 / Math.max(1, interEm(detail, 0.14) * 0.9)) : 0;
  const side: CSSProperties = mirror ? { left: 96 } : { right: 96 };
  const align = mirror ? "flex-start" : "flex-end";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#e4e4e5" }}>
      {/* Studio: light in the middle, falling off to the corners, a paler floor. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 60% at 50% 42%, #f7f7f7 0%, #ededee 45%, #dcdcde 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, bottom: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,.35) 40%, rgba(220,220,222,.2))" }} />

      <Flower cx={fcx} cy={fcy} R={R} grey={grey} rot={rot} />

      {/* Oval shadow on the floor under the floating player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 300, width: 600, top: shadowY - 40, height: 80, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,40,45,.1), rgba(40,40,45,0))", filter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 250, width: 500, top: shadowY - 22, height: 44, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,40,45,.32), rgba(40,40,45,0))", filter: "blur(6px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, filter: "drop-shadow(0 16px 22px rgba(0,0,0,.14))" }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", display: "block", filter: "contrast(1.04)", ...figMask }} />
        </div>
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, top: 1040, bottom: 0, background: "linear-gradient(to bottom, rgba(228,228,229,0), #e4e4e5 60%)" }} />}

      <Label big={clubBig} small={clubSmall} side="left" top={96} x={120} max={320} />
      <Label big={right[0]} small={right[1]} side="right" top={96} x={120} max={320} />

      {/* Name: first name small, surname big and light, the shirt number faint behind. */}
      <div style={{ position: "absolute", bottom: detail ? 122 : 100, ...side, display: "flex", flexDirection: "column", alignItems: align, fontFamily: INTER, color: INK, whiteSpace: "nowrap" }}>
        {number && (
          <div
            style={{
              position: "absolute",
              [mirror ? "left" : "right"]: -40,
              bottom: -lastSize * 0.12,
              fontSize: lastSize * 1.7,
              fontWeight: 200,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "rgba(110,112,118,.2)",
            }}
          >
            {number}
          </div>
        )}
        {first && last !== first && <div style={{ position: "relative", fontSize: Math.min(22, lastSize * 0.3), fontWeight: 600, color: SOFT_INK, marginBottom: -lastSize * 0.06 }}>{first}</div>}
        <div style={{ position: "relative", fontSize: lastSize, fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.12 }}>{last}</div>
      </div>
      {detail && (
        <div style={{ position: "absolute", bottom: 88, ...side, fontFamily: INTER, fontWeight: 600, fontSize: detailSize, letterSpacing: "0.14em", color: SOFT_INK, whiteSpace: "nowrap", textTransform: "uppercase" }}>
          {detail}
        </div>
      )}

      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", bottom: 48, [mirror ? "right" : "left"]: 64, opacity: 0.55, color: INK }} />
      {/* Faint grain so the greys never band. */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.035, mixBlendMode: "multiply", pointerEvents: "none", backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>")}")` }} />
    </div>
  );
}
