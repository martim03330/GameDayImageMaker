/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { lift, tableRows } from "./column";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { MonoDefs } from "./wall";

const WHITE = "#ffffff";

/** Archivo heavy caps: average advance relative to the size (plus tracking). */
const fitCaps = (t: string, width: number, max: number, tracking = 0) => Math.min(max, width / Math.max(1, [...t].length * (0.72 + tracking)));

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "SAT 10 OCT" → "10.10.26" (the year from the next fixture when it is that day, else the coming one). */
function dotDate(data: RenderData, d: string): string {
  const m = d.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m || MONTHS.indexOf(m[2]) < 0) return d.toUpperCase();
  const mo = MONTHS.indexOf(m[2]);
  const f = data.fixtures?.[0]?.date ?? "";
  const fy = /^(\d{4})-(\d{2})-(\d{2})/.exec(f);
  const now = new Date();
  const y = fy && Number(fy[2]) === mo + 1 ? Number(fy[1]) : mo < now.getMonth() - 2 ? now.getFullYear() + 1 : now.getFullYear();
  return `${m[1].padStart(2, "0")}.${String(mo + 1).padStart(2, "0")}.${String(y % 100).padStart(2, "0")}`;
}

/** The club colour for a deep, rich ground (black-and-white clubs get a cool charcoal). */
function groundOf(data: RenderData): string {
  const p = data.params;
  const raw = p.primary === "#10131c" ? p.accent : p.primary;
  if (hueOf(raw) !== null) return vivid(raw);
  if (hueOf(p.accent) !== null) return vivid(p.accent);
  return "#4b515c";
}

/** A small white ball: the stand-in for the competition's mark. */
function BallMark({ size, ink }: { size: number; ink: string }) {
  const r = size / 2;
  const pent = (cx: number, cy: number, rr: number, rot: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = rot + (i * 2 * Math.PI) / 5;
      return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,.3))" }}>
      <circle cx={r} cy={r} r={r - 1.5} fill={WHITE} />
      <polygon points={pent(r, r, r * 0.3, -Math.PI / 2)} fill={ink} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        return <polygon key={i} points={pent(r + Math.cos(a) * r * 0.86, r + Math.sin(a) * r * 0.86, r * 0.22, a + Math.PI)} fill={ink} />;
      })}
    </svg>
  );
}

/** Up to three short lines from a long label ("STADION SCHÜTZENWIESE" stays one, "ESTÁDIO DR. JOSÉ DE MATOS" takes two). */
function wrap(t: string, max = 15): string[] {
  const out: string[] = [];
  if (t.length > max * 3) return wrap(t, Math.ceil(t.length / 3) + 2);
  for (const w of t.split(/\s+/).filter(Boolean)) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= max) out[out.length - 1] = last + " " + w;
    else out.push(w);
  }
  return out;
}

/**
 * Swiss Super League gameday (Winterthur v St. Gallen, Libera Sports): a deep club-colour gradient with film
 * grain; a tall panel with a big curved left edge holding a dark, blurred, club-tinted stadium; the full-body
 * player in front with the ball and a soft shadow. Top right: the competition mark and two stacked label bars
 * (a white one with the home team in club colour, a dark one with the away team in white). Left: both crests
 * as white marks over "19.03.23 / ---- / VENUE / ---- / 14:15" in bold white. The agency logo at the foot.
 */
export function Curvepanel({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 64);
  const mirror = params.side === "left";
  const club = groundOf(data);
  const deep = shade(club, -0.62);
  const barDark = shade(club, -0.55);
  // Text on the white bar: the club colour, darkened when it is too light to read on white.
  const barInk = luminance(club) > 0.45 ? shade(club, -0.5) : club;
  const md = matchFacts(data);
  const score = scoreOf(data, " - ");
  const ts = params.textScale ?? 1;
  const X = (x: number) => (mirror ? CANVAS_W - x : x);

  // ---- the panel: its left edge one big curved sweep ----
  const pTop = 120;
  const pBottom = 1262;
  const tl = 520 + (r() - 0.5) * 40;
  const bulge = 300 + (r() - 0.5) * 30;
  const bl = 430;
  const panelPath = `M 1120 ${pTop} L ${tl + 60} ${pTop} Q ${tl} ${pTop} ${tl - 14} ${pTop + 60} C ${bulge + 20} ${pTop + 460}, ${bulge - 60} ${pBottom - 330}, ${bl} ${pBottom} L 1120 ${pBottom} Z`;
  const scene = data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? null;
  const sceneSrc = scene ?? data.bgPhotoUrl;

  // ---- the player: full body, ball at his feet, just left of the bars ----
  const floor = 1175;
  const headTop = 330;
  const first = standing(data, { cx: X(540), headTop, floor, maxFace: 100, framing: "full" });
  // A wide pose (a kick, arms out) moves into the panel, clear of the fixture block on the left.
  const wide = first.width / first.height > 0.6;
  const cx = X(540 + (wide ? 80 : 0) + (r() - 0.5) * 30);
  const placed = standing(data, { cx, headTop, floor, maxFace: 100, framing: "full" });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.3);

  // ---- bars ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const home = (content.homeTeam || "").toUpperCase();
  const away = (content.awayTeam || "").toUpperCase();
  const bars: [string, string] =
    postType === "matchday" ? [home || (data.club?.name ?? "").toUpperCase(), away || md.opp] : [content.kicker.toUpperCase(), name];
  const barRoom = 400;
  const barSize = Math.min(62 * ts, fitCaps(bars[0], barRoom, 62), fitCaps(bars[1], barRoom, 62));
  const barRight = 48;

  // ---- the left block ----
  // Home crest first, then away: the same order as the fixture.
  const crests = crestsOf(data);
  let block: string[][];
  if (postType === "matchday") block = [[dotDate(data, md.date)], wrap(md.venue || md.round), [md.time]];
  else if (postType === "potm") block = tableRows(data, 3).map((s) => [`${s.value} ${String(s.label).toUpperCase()}`]);
  else block = [[score], [postType === "result" ? "FULL TIME" : content.kicker.toUpperCase()], wrap(md.round), [md.date ? dotDate(data, md.date) : ""], wrap(md.venue)];
  block = block.map((g) => g.filter(Boolean)).filter((g) => g.length);
  const flat = block.flat();
  const lineSize = Math.min(36, ...flat.map((l) => fitCaps(l, 300, 36)));
  const blockCx = X(215);
  // The block sits under his hand; a pose reaching into it (a kick) sends it up into the empty corner.
  const reach = mirror ? CANVAS_W - (box.left + box.width) : box.left;
  const blockTop = wide || reach < 250 ? 190 : 790;
  const comp = md.comp;
  const compLines = comp.length > 28 ? wrap(comp, Math.ceil(comp.length / 2) + 3) : [comp];
  const compSize = Math.min(17, ...compLines.map((l) => fitCaps(l, 380, 17, 0.12)));

  const side = (x: number): CSSProperties => (mirror ? { left: x } : { right: x });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: deep }}>
      <MonoDefs id="curvepanel-mono" ink={0.3} />
      {/* Deep gradient: lighter low on the open side, darkest at the top. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at ${mirror ? 90 : 10}% 88%, ${shade(club, -0.3)} 0%, ${shade(club, -0.42)} 40%, ${deep} 100%)` }} />

      {/* The curved panel: the stadium, blurred, darkened and drowned in club colour. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, transform: mirror ? "scaleX(-1)" : undefined }} aria-hidden>
        <defs>
          <clipPath id="curvepanel-clip">
            <path d={panelPath} />
          </clipPath>
          <linearGradient id="curvepanel-tint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(club, -0.35)} stopOpacity={0.72} />
            <stop offset="0.6" stopColor={shade(club, -0.2)} stopOpacity={0.62} />
            <stop offset="1" stopColor={shade(club, -0.45)} stopOpacity={0.85} />
          </linearGradient>
          <filter id="curvepanel-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={22} />
          </filter>
        </defs>
        {/* Its shadow on the ground. */}
        <path d={panelPath} fill="rgba(0,0,0,.45)" filter="url(#curvepanel-shadow)" transform="translate(-14 10)" />
        <g clipPath="url(#curvepanel-clip)">
          <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={shade(club, -0.4)} />
          {sceneSrc && (
            <image
              href={sceneSrc}
              x={200}
              y={pTop - 40}
              width={960}
              height={pBottom - pTop + 80}
              preserveAspectRatio="xMidYMid slice"
              style={{ filter: "blur(10px) grayscale(.6) brightness(.62) contrast(1.05)" }}
              transform={mirror ? `translate(${CANVAS_W} 0) scale(-1 1)` : undefined}
            />
          )}
          <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="url(#curvepanel-tint)" style={{ mixBlendMode: "multiply" }} />
          <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={club} opacity={0.28} style={{ mixBlendMode: "color" }} />
          {/* A soft light behind his head. */}
          <ellipse cx={mirror ? CANVAS_W - cx : cx} cy={520} rx={380} ry={460} fill={shade(club, 0.25)} opacity={0.22} filter="url(#curvepanel-shadow)" />
        </g>
      </svg>

      {/* Floor shadow, then the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 320, width: 640, top: floor - 44, height: 90, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.4), rgba(0,0,0,0))", filter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 170, width: 340, top: floor - 16, height: 30, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.55), rgba(0,0,0,0))", filter: "blur(5px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.35))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.05)", ...figMask }} />
        </div>
      )}

      {/* Top corner: the mark, the competition, the two label bars. */}
      <div style={{ position: "absolute", top: 150, ...side(barRight), display: "flex", flexDirection: "column", alignItems: mirror ? "flex-start" : "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "center", marginBottom: 18 }}>
          <BallMark size={58} ink={deep} />
          {comp && (
            <div style={{ marginTop: 8, fontFamily: ARCHIVO, fontWeight: 700, fontSize: compSize, lineHeight: 1.25, letterSpacing: "0.12em", color: WHITE, whiteSpace: "nowrap", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,.35)" }}>
              {compLines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: WHITE, color: barInk, fontFamily: ARCHIVO, fontWeight: 900, fontSize: barSize, lineHeight: 1, padding: `${barSize * 0.14}px ${barSize * 0.32}px ${barSize * 0.1}px`, whiteSpace: "nowrap", letterSpacing: "-0.005em", boxShadow: "0 8px 22px rgba(0,0,0,.25)" }}>
          {bars[0]}
        </div>
        {bars[1] && (
          <div style={{ background: barDark, color: WHITE, fontFamily: ARCHIVO, fontWeight: 900, fontSize: barSize, lineHeight: 1, padding: `${barSize * 0.14}px ${barSize * 0.32}px ${barSize * 0.1}px`, whiteSpace: "nowrap", [mirror ? "marginLeft" : "marginRight"]: barSize * 0.3, boxShadow: "0 8px 22px rgba(0,0,0,.25)" }}>
            {bars[1]}
          </div>
        )}
      </div>

      {/* Left: crests over the fixture, bold white, "----" between groups. */}
      <div style={{ position: "absolute", left: blockCx - 170, width: 340, top: blockTop, display: "flex", flexDirection: "column", alignItems: "center", color: WHITE, fontFamily: ARCHIVO, fontWeight: 800, textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,.3)" }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 84, height: 84, objectFit: "contain", filter: "url(#curvepanel-mono)" }} />
            ))}
          </div>
        )}
        {block.map((g, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {i > 0 && <div style={{ fontSize: lineSize * 0.8, lineHeight: 0.9, letterSpacing: "0.02em", opacity: 0.95 }}>----</div>}
            {g.map((l, j) => (
              <div key={j} style={{ fontSize: i === 0 && l === score && score ? Math.min(78, lineSize * 2) : lineSize, lineHeight: 1.05, whiteSpace: "nowrap" }}>
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={36} />
      </div>
      {/* Film grain. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} aria-hidden>
        <filter id="curvepanel-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#curvepanel-grain)" />
      </svg>
    </div>
  );
}
