/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { RUBIKMONO } from "./fx";
import { rng, SCRIPT } from "./kit";
import { lift, PRINT_GRAIN } from "./column";
import { dateParts, runner, yearOf } from "./hollow";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#e9e9e7";
const INK = "#3b3d41";
const SOFT = "#5d6065";

/** Rubik Mono One: every glyph has the same advance (per em). */
const RUBIK_W = 0.81;

/** "FC Porto" → "PORTO", "Sporting Clube de Braga" → "SPORTING BRAGA": short caps for a heavy title line. */
export function shortClub(name: string): string {
  // The club name exactly as stored ("SC Vianense SAD"), never shortened: the user's rule.
  return name.toUpperCase().trim();
}

/** Dots of a spray-paint halftone around a centre: dense in the middle, thinning out, bigger dots near the core. */
function spray(seed: number, cx: number, cy: number, rx: number, ry: number, count: number) {
  const r = rng(seed);
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.75);
    const x = cx + Math.cos(a) * d * rx;
    const y = cy + Math.sin(a) * d * ry;
    const edge = 1 - d;
    dots.push({ x, y, r: 0.7 + r() * 1.9 * (0.3 + edge), o: 0.15 + edge * 0.5 * r() + 0.1 });
  }
  return dots;
}

/**
 * Light grey "Seongnam vs Busan": a pale paper ground with the player's surname as a giant faint signature
 * running up the poster and the club crest as a huge pale silhouette; a spray of halftone dots around the
 * full-body player (with the ball, a soft shadow on the floor); top left the two crests and a stacked
 * techno date / ground / kick-off; beside his legs the competition and "OURS / VS THEM" in heavy square caps.
 */
export function Dotscript({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 58;
  const r = rng(seed);
  const mirror = params.side === "left";
  const ts = params.textScale ?? 1;
  const m = matchFacts(data);
  const score = scoreOf(data);

  // ---- the player ----
  const floor = 1150 + r() * 20;
  const headTop = 300 + r() * 20;
  const cx = mirror ? 630 : 450;
  const placed = runner(data, { cx, headTop, floor, maxFace: 116, minX: 50, maxX: 1030 });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.25);
  const wide = placed.width / placed.height > 0.62;
  const bodyCx = box.left + box.width / 2;

  // ---- the heavy title beside him ----
  const ours = shortClub(data.club?.name ?? "");
  const opp = m.opp ? shortClub(m.opp) : "";
  let titleLines: string[];
  let small = m.comp;
  if (postType === "result" && score) {
    const hg = String(content.homeGoals);
    const ag = String(content.awayGoals);
    const home = shortClub(content.homeTeam || (content.home === false ? m.opp : data.club?.name ?? ""));
    const away = shortClub(content.awayTeam || (content.home === false ? data.club?.name ?? "" : m.opp));
    const w = Math.max(home.length, away.length);
    titleLines = [`${home.padEnd(w)} ${hg}`, `${away.padEnd(w)} ${ag}`];
    small = [content.kicker.toUpperCase(), m.comp].filter(Boolean).join(" · ");
  } else if (postType === "goal") {
    titleLines = [content.kicker.toUpperCase() || "GOAL", opp ? `VS ${opp}` : ours];
    if (score) small = [m.comp, score].filter(Boolean).join(" · ");
  } else {
    titleLines = opp ? [ours, `VS ${opp}`] : [content.kicker.toUpperCase(), ours];
  }
  titleLines = titleLines.filter(Boolean);
  const smallSize = small ? Math.max(13, Math.min(17, 340 / Math.max(1, small.length * 0.72))) : 0;
  // Beside his legs, clear of the body (hips and knees stay within ~2 face heights of his centre line);
  // too little room there (a wide pose) moves it up to the top corner, above his arms.
  const reach = mirror ? box.faceCx - 2.2 * box.faceH : CANVAS_W - (box.faceCx + 2.2 * box.faceH);
  const high = wide || reach - 100 < 290;
  const titleW = high ? 400 : Math.min(400, reach - 100);
  const longest = Math.max(1, ...titleLines.map((l) => l.length));
  const titleSize = Math.min(60 * ts, titleW / (longest * RUBIK_W));
  const titleTop = high ? 200 : floor - 330 + r() * 30;
  const side = (x: number): CSSProperties => (mirror ? { left: x } : { right: x });
  const other = (x: number): CSSProperties => (mirror ? { right: x } : { left: x });

  // ---- stacked facts, top corner ----
  const dp = dateParts(content.date);
  const date = dp.dots.includes(".") ? `${dp.dots}.${yearOf(data)}` : dp.dots;
  const venueWords = m.venue.split(/\s+/).filter(Boolean);
  // The ground on up to two lines, split near the middle.
  let venueLines: string[] = [];
  if (venueWords.length) {
    const cut = Math.max(1, Math.round(venueWords.length / 2));
    venueLines = m.venue.length > 12 && venueWords.length > 1 ? [venueWords.slice(0, cut).join(" "), venueWords.slice(cut).join(" ")] : [m.venue];
  }
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const groups: string[][] =
    postType === "matchday" ? [[date], venueLines, [m.time]] : postType === "result" ? [[date], [m.round], venueLines] : [[name], [date], [m.round]];
  // Groups separated by a short dashed rule (null).
  const stack = (gs: string[][]) => {
    const rows: (string | null)[] = [];
    for (const g of gs.map((g) => g.filter(Boolean)).filter((g) => g.length)) {
      if (rows.length) rows.push(null);
      rows.push(...g);
    }
    return rows;
  };
  const heightOf = (rows: (string | null)[], withCrests: boolean) => (withCrests ? 96 : 0) + rows.reduce<number>((h, f) => h + (f === null ? 30 : 31), 0);
  const factW = 290;
  const factSize = (t: string) => Math.min(25, factW / Math.max(1, t.length * 0.72));
  const crests = postType === "matchday" ? ([m.ourCrest, m.oppCrest].filter(Boolean) as string[]) : crestsOf(data);
  // The stacked block rises above his shoulders when his body (a raised arm) reaches its column.
  // A raised arm can reach up to about a face height above his head.
  const nearEdge = mirror ? CANVAS_W - (box.left + box.width * 0.96) : box.left + box.width * 0.04;
  const clear = nearEdge < 410 ? box.faceTop - box.faceH * 0.9 - 16 : CANVAS_H;
  let factRows = stack(groups);
  // Too tall to stay above it: the same facts, packed (the ground on one line, date and kick-off together).
  if (90 + heightOf(factRows, crests.length > 0) > clear) {
    const packed = postType === "matchday" ? [[[date, m.time].filter(Boolean).join(" · ")], [m.venue]] : groups.map((g) => [g.filter(Boolean).join(" ")]);
    factRows = stack(packed);
  }
  const blockH = heightOf(factRows, crests.length > 0);
  const blockTop = nearEdge < 410 ? Math.max(90, Math.min(190, clear - blockH)) : 190;

  // ---- signature and dots ----
  const sig = (content.lastName || content.firstName || "").trim();
  const sigText = sig ? sig.charAt(0).toUpperCase() + sig.slice(1).toLowerCase() : "";
  const sigSize = Math.min(820, 1650 / Math.max(3, [...sigText].length * 0.42));
  const dots = spray(seed, bodyCx, box.top + box.height * 0.42, 500, 600, 3400);

  const mono: CSSProperties = { fontFamily: MONO, fontWeight: 700, color: SOFT, letterSpacing: "0.16em", whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER }}>
      {/* Paper: soft light, faint horizontal brush bands and grain. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 40%, #f4f4f2, transparent 75%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(180deg, rgba(0,0,0,.018) 0 3px, transparent 3px 11px, rgba(255,255,255,.3) 11px 13px, transparent 13px 29px)", opacity: 0.8 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.1, mixBlendMode: "multiply" }} />

      {/* Huge pale crest silhouette. */}
      {data.club?.crestUrl && (
        <img
          src={data.club.crestUrl}
          alt=""
          data-bleed
          style={{ position: "absolute", ...side(-150), top: 300, width: 900, height: 900, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.6, transform: `rotate(${mirror ? 8 : -8}deg)` }}
        />
      )}

      {/* The signature, running up the poster. */}
      {sigText && (
        <div
          data-bleed
          style={{
            position: "absolute",
            left: 540 - 1200,
            width: 2400,
            top: 700 - sigSize * 0.5,
            textAlign: "center",
            fontFamily: SCRIPT,
            fontSize: sigSize,
            lineHeight: 1,
            color: "#c3c7c8",
            opacity: 0.6,
            whiteSpace: "nowrap",
            transform: `rotate(${mirror ? 66 : -66}deg)`,
          }}
        >
          {sigText}
        </div>
      )}

      {/* Halftone spray. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0 }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} fill="#7f8387" opacity={d.o.toFixed(2)} />
        ))}
      </svg>

      {/* Floor shadow and the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: bodyCx - 330, width: 660, top: floor - 44, height: 88, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,42,46,.28), rgba(40,42,46,0))", filter: "blur(8px)" }} />
          <div style={{ position: "absolute", left: bodyCx - 200, width: 400, top: floor - 16, height: 30, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,20,24,.42), rgba(20,20,24,0))", filter: "blur(5px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 14px 22px rgba(30,30,35,.22))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05)", ...figMask }} />
        </div>
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: `linear-gradient(to bottom, ${PAPER}00, ${PAPER}f0 65%, ${PAPER})` }} />}

      {/* Crests and stacked facts. */}
      <div style={{ position: "absolute", top: blockTop, ...other(150), display: "flex", flexDirection: "column", alignItems: mirror ? "flex-end" : "flex-start" }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 70, height: 70, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.15))" }} />
            ))}
          </div>
        )}
        {factRows.map((f, i) =>
          f === null ? (
            <div key={i} style={{ ...mono, fontSize: 22, letterSpacing: "0.12em", lineHeight: 1, margin: "2px 0 6px" }}>
              ----
            </div>
          ) : (
            <div key={i} style={{ ...mono, fontSize: factSize(f) }}>
              {f}
            </div>
          ),
        )}
      </div>

      {/* Competition and the heavy title. */}
      <div style={{ position: "absolute", top: titleTop, ...side(80), width: titleW + 20, display: "flex", flexDirection: "column", alignItems: mirror ? "flex-start" : "flex-end", textAlign: mirror ? "left" : "right" }}>
        {small && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexDirection: mirror ? "row-reverse" : "row" }}>
            {smallSize * 0.72 * small.length <= 340 && <div style={{ width: 34, height: 3, background: INK }} />}
            <div style={{ ...mono, color: INK, fontSize: smallSize, letterSpacing: "0.12em", ...(smallSize * 0.72 * small.length > 340 ? { whiteSpace: "normal", width: 340, lineHeight: 1.35 } : {}) }}>{small}</div>
          </div>
        )}
        {titleLines.map((l, i) => (
          <div key={i} style={{ fontFamily: RUBIKMONO, fontSize: titleSize, lineHeight: 1.08, color: INK, whiteSpace: "pre", letterSpacing: "-0.01em" }}>
            {l}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={28} onLight style={{ opacity: 0.9 }} />
      </div>
    </div>
  );
}
