/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { POST_TYPES } from "@/lib/types";
import { DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { em } from "./mist";
import { crestsOf, placeByFace } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { bestLines, clubColour, INTER, interEm, mix, MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** DM Serif Display advance widths per 100px, measured in the browser. */
const SERIF_W: Record<string, number> = { A: 65, B: 59.8, C: 60.3, D: 64.8, E: 55.5, F: 53.8, G: 65.6, H: 69.1, I: 30.1, J: 42.7, K: 65.4, L: 54, M: 79.1, N: 65.3, O: 67, P: 56.5, Q: 67, R: 62.8, S: 52.1, T: 62.7, U: 64.9, V: 63.2, W: 92.1, X: 61.4, Y: 59, Z: 56, " ": 21.8, "'": 22.3, "-": 33.2 };
const serifEm = (t: string) => em(t.normalize("NFD").replace(/\p{M}/gu, ""), SERIF_W, 52);

/** The two stacked words of the title: the matchday default becomes "MATCH / DAY". */
function titleLines(data: RenderData, roll: number): string[] {
  const k = data.content.kicker.trim().toUpperCase().replace(/’/g, "'");
  const t = POST_TYPES.find((p) => p.id === data.postType);
  const isDefault = !k || k === t?.kicker || (t?.alts ?? []).includes(k);
  if (data.postType === "matchday" && isDefault) {
    // The agency always says MATCHDAY (never GAME DAY / UP NEXT).
    void roll;
    return ["MATCH", "DAY"];
  }
  const joined = k.replace(/^IT'S\s+/, "");
  const m = /^(MATCH|GAME)\s?DAY$/.exec(joined);
  if (m) return [m[1], "DAY"];
  return bestLines(joined, 560, 460, { tracking: 0, pitch: 0.94, cap: 0.66, maxSize: 210, measure: serifEm }).lines;
}

/**
 * The tunnel ceiling: panels of cold daylight between dark beams, all running to a vanishing point low on
 * the right, then blurred as if far out of focus.
 */
function Ceiling({ vp, seed }: { vp: [number, number]; seed: number }) {
  const r = rng(seed);
  // Rays from the vanishing point to points along the left and top edges.
  const edge: [number, number][] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    edge.push(t < 0.4 ? [-60, 780 - (t / 0.4) * 840] : [-60 + ((t - 0.4) / 0.6) * 1300, -60]);
  }
  const depths = [1, 0.74, 0.55, 0.41, 0.31, 0.23, 0.17];
  const at = (p: [number, number], d: number): [number, number] => [vp[0] + (p[0] - vp[0]) * d, vp[1] + (p[1] - vp[1]) * d];
  const cells: { d: string; o: number }[] = [];
  for (let i = 0; i < n; i++) {
    // Every other strip is a beam; the strips in between are glazed.
    if (i % 2 === 1) continue;
    for (let j = 0; j < depths.length - 1; j++) {
      const inset = 0.035;
      const d0 = depths[j] - inset * depths[j];
      const d1 = depths[j + 1] + inset * depths[j + 1];
      const a = at(edge[i], d0);
      const b = at(edge[i + 1], d0);
      const c = at(edge[i + 1], d1);
      const e = at(edge[i], d1);
      const o = (0.2 + r() * 0.55) * Math.pow(depths[j], 0.9) * (i < 3 ? 1 : 0.85);
      cells.push({ d: `M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}L${c[0].toFixed(0)} ${c[1].toFixed(0)}L${e[0].toFixed(0)} ${e[1].toFixed(0)}Z`, o });
    }
  }
  return (
    <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <filter id="tunnel-far" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter="url(#tunnel-far)">
        {cells.map((c, i) => (
          <path key={i} d={c.d} fill="#dfe7ee" opacity={c.o} />
        ))}
      </g>
    </svg>
  );
}

/** A receding row of warm stadium lights, out of focus: big discs near the edge, small ones far away. */
function Bokeh({ from, to, seed }: { from: [number, number]; to: [number, number]; seed: number }) {
  const r = rng(seed);
  const n = 11;
  const discs = Array.from({ length: n }, (_, i) => {
    const t = Math.pow(i / (n - 1), 0.8);
    return { x: from[0] + (to[0] - from[0]) * t + (r() - 0.5) * 16, y: from[1] + (to[1] - from[1]) * t + (r() - 0.5) * 16, rad: 72 - 50 * t + r() * 8, o: 0.55 + r() * 0.35 };
  });
  return (
    <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }} aria-hidden>
      <defs>
        <radialGradient id="tunnel-disc">
          <stop offset="0" stopColor="#fff8ec" stopOpacity="1" />
          <stop offset="0.72" stopColor="#fff1dc" stopOpacity="0.92" />
          <stop offset="1" stopColor="#ffd9a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tunnel-halo">
          <stop offset="0" stopColor="#ffcf94" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffcf94" stopOpacity="0" />
        </radialGradient>
        <filter id="tunnel-soft">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      {discs.map((d, i) => (
        <circle key={`h${i}`} cx={d.x} cy={d.y} r={d.rad * 2.6} fill="url(#tunnel-halo)" opacity={0.55} />
      ))}
      <g filter="url(#tunnel-soft)">
        {discs.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.rad} fill="url(#tunnel-disc)" opacity={d.o} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Chelsea "UP NEXT": a dark, moody tunnel shot — a blurred concrete ceiling with cold skylights and a row of
 * warm bokeh lights receding to the right; the player seen from behind (or turned away), big in the lower
 * left, name and number on his back. Top right: two white crests, an elegant serif title on two lines
 * ("UP / NEXT") and the kick-off and ground in small sans caps, all right-aligned.
 */
export function Tunnel({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 39);
  const club = clubColour(data);
  const dark = mix(club, "#0a0d12", 0.86);
  const m = matchFacts(data);

  // ---- title block (top right) -----------------------------------------------------------------------
  const lines = titleLines(data, r());
  const longest = Math.max(...lines.map(serifEm));
  const tSize = Math.min(lines.length > 2 ? 150 : 210, (560 * (params.textScale ?? 1)) / longest);
  const crests = postType === "potm" ? ([data.club?.crestUrl].filter(Boolean) as string[]) : crestsOf(data);
  const crestSize = Math.min(78, tSize * 0.42);
  // Crests sit left of the first word when it is short, otherwise on their own row above it.
  const crestRow = crests.length * (crestSize + 16);
  const inline = serifEm(lines[0]) * tSize + crestRow + 20 <= 600;
  const top = 86;
  const titleTop = inline ? top : top + crestSize + 22;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  let info: string[] = [];
  if (postType === "matchday") {
    info = [[m.date, m.time].filter(Boolean).join(" | "), m.venue || (m.opp ? `V ${m.opp}` : ""), m.comp && [m.comp, m.round].filter(Boolean).join(" · ")].filter(Boolean) as string[];
  } else if (postType === "result") {
    const hg = content.homeGoals ?? "";
    const ag = content.awayGoals ?? "";
    info = [name, home && `${home} ${hg}`.trim(), away && `${away} ${ag}`.trim()].filter(Boolean);
  } else {
    const facts = content.stats.filter((s) => s.value && String(s.value).trim() !== "0").slice(0, 3);
    info = [name, content.subline.toUpperCase(), facts.map((s) => `${s.value} ${s.label.toUpperCase()}`).join(" | ")].filter(Boolean);
  }
  const infoSize = Math.min(29, ...info.map((t) => 540 / Math.max(1, interEm(t, 0.02) * 0.82)));
  const infoTop = titleTop + tSize * (0.72 + (lines.length - 1) * 0.94) + 44;
  const textBottom = infoTop + info.length * infoSize * 1.3;

  // ---- the player ------------------------------------------------------------------------------------
  // A photo without a usable face is taken from behind: shoulders fill the lower left, back to camera.
  const back = !data.face || (data.facePx > 0 && data.facePx < 40);
  let fig: { left: number; top: number; width: number; height: number };
  if (back) {
    const aspect = data.photoAspect ?? 0.7;
    const width = Math.min(1000, Math.max(820, 1000 * Math.min(1, aspect / 0.6))) * (params.playerScale ?? 1);
    const height = width / aspect;
    const figTop = Math.max(420, Math.min(660, textBottom + 30));
    fig = { left: 400 - width / 2 + (params.playerX ?? 0), top: figTop + (params.playerY ?? 0), width, height };
  } else {
    fig = placeByFace(data, 300 + r() * 40, Math.max(470, Math.min(700, textBottom + 50)), { waist: 200, chest: 200, full: 200, knees: 200 });
  }

  // ---- scene ---------------------------------------------------------------------------------------------
  const vp: [number, number] = [1180 + r() * 60, 900 + r() * 60];
  const bokehFrom: [number, number] = [1110, 520 + r() * 60];
  const bokehTo: [number, number] = [760 + r() * 40, 1070];
  const serif: CSSProperties = { fontFamily: DMSERIF, fontSize: tSize, lineHeight: 0.94, color: WHITE, whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(0,0,0,.4)" };
  const small: CSSProperties = { fontFamily: INTER, fontWeight: 500, fontSize: infoSize, lineHeight: 1.3, letterSpacing: "0.02em", color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,.6)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: dark, color: WHITE }}>
      <MonoDefs id="tunnel-mono" ink={0.55} />
      {/* Dark concrete: cool at the top, almost black low down. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${mix(dark, "#3a4450", 0.55)} 0%, ${dark} 55%, #050608 100%)` }} />
      <Ceiling vp={vp} seed={Math.floor(r() * 1000)} />
      {/* The far end of the tunnel glows faintly. */}
      <div style={{ position: "absolute", left: vp[0] - 420, top: vp[1] - 380, width: 840, height: 760, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,214,170,.18), transparent)" }} />
      <Bokeh from={bokehFrom} to={bokehTo} seed={Math.floor(r() * 1000)} />
      {/* Cool grade and a heavy vignette. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(club, -0.6)}33, rgba(8,14,24,.35))`, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 70% 40%, transparent 45%, rgba(0,0,0,.55) 100%)" }} />

      {/* The player, darkened into the scene, warm light catching his right side. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(10px -2px 22px rgba(255,220,180,.22))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "brightness(.8) contrast(1.14) saturate(.86)", WebkitMaskImage: "linear-gradient(to top, transparent 0, #000 90px)", maskImage: "linear-gradient(to top, transparent 0, #000 90px)" }}
          />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.45), transparent 26%), linear-gradient(to right, rgba(0,0,0,.35), transparent 30%)", pointerEvents: "none" }} />

      {/* Title block, right-aligned. */}
      {inline ? null : (
        <div style={{ position: "absolute", right: 72, top, display: "flex", gap: 16 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "url(#tunnel-mono)" }} />
          ))}
        </div>
      )}
      <div style={{ position: "absolute", right: 72, top: titleTop, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, height: tSize * 0.94 }}>
            {i === 0 && inline && (
              <div style={{ display: "flex", gap: 14, marginRight: 14, marginTop: -tSize * 0.1 }}>
                {crests.map((c, j) => (
                  <img key={j} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "url(#tunnel-mono)" }} />
                ))}
              </div>
            )}
            <div style={serif}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 72, top: infoTop, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {info.map((t, i) => (
          <div key={i} style={{ ...small, opacity: i === 2 && postType === "matchday" ? 0.7 : 1, fontSize: i === 2 && postType === "matchday" ? infoSize * 0.72 : infoSize, letterSpacing: i === 2 && postType === "matchday" ? "0.12em" : small.letterSpacing, marginTop: i === 2 && postType === "matchday" ? 8 : 0 }}>
            {t}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", right: 72, bottom: 54, opacity: 0.85 }} />
      <Film strength={1.8} />
    </div>
  );
}
