/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1efea";
const INK = "#15161a";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

type Hill = { x: number; y: number; a: number; sx: number; sy: number };

/**
 * Topographic contour lines of a seeded terrain: a main summit around the player plus a few low hills,
 * domain-warped so the lines read organic. Marching squares on a coarse grid, one path per level; every
 * fifth line is an "index" contour (slightly stronger), as on a survey map.
 */
function contours(W: number, H: number, hills: Hill[], warp: number[], step: number, levels: number) {
  const nx = Math.ceil(W / step) + 1;
  const ny = Math.ceil(H / step) + 1;
  const v = new Float32Array(nx * ny);
  const [p1, p2, p3, p4, w] = warp;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x0 = i * step;
      const y0 = j * step;
      const x = x0 + w * Math.sin(y0 / 210 + p1) + w * 0.6 * Math.sin((x0 + y0) / 130 + p2);
      const y = y0 + w * Math.sin(x0 / 190 + p3) + w * 0.6 * Math.sin((x0 - y0) / 150 + p4);
      let f = 0;
      for (const h of hills) {
        const dx = (x - h.x) / h.sx;
        const dy = (y - h.y) / h.sy;
        f += h.a * Math.exp(-Math.sqrt(dx * dx + dy * dy));
      }
      v[j * nx + i] = f;
    }
  }
  let max = 0;
  for (let n = 0; n < v.length; n++) max = Math.max(max, v[n]);
  // Geometric levels: evenly spaced lines on an exponential slope.
  const lv = Array.from({ length: levels }, (_, n) => max * Math.exp(-(n + 0.5) * 0.105));
  const r = (n: number) => Math.round(n * 10) / 10;
  return lv.map((L) => {
    let d = "";
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = v[j * nx + i];
        const b = v[j * nx + i + 1];
        const c = v[(j + 1) * nx + i + 1];
        const e = v[(j + 1) * nx + i];
        const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (e > L ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * step;
        const y = j * step;
        const top = () => [x + ((L - a) / (b - a)) * step, y];
        const right = () => [x + step, y + ((L - b) / (c - b)) * step];
        const bottom = () => [x + ((L - e) / (c - e)) * step, y + step];
        const left = () => [x, y + ((L - a) / (e - a)) * step];
        const seg = (p: number[], q: number[]) => {
          d += `M${r(p[0])} ${r(p[1])}L${r(q[0])} ${r(q[1])}`;
        };
        switch (idx) {
          case 1: case 14: seg(left(), bottom()); break;
          case 2: case 13: seg(bottom(), right()); break;
          case 3: case 12: seg(left(), right()); break;
          case 4: case 11: seg(top(), right()); break;
          case 6: case 9: seg(top(), bottom()); break;
          case 7: case 8: seg(left(), top()); break;
          case 5: seg(left(), top()); seg(bottom(), right()); break;
          case 10: seg(top(), right()); seg(left(), bottom()); break;
        }
      }
    }
    return d;
  });
}

/**
 * Contour: fine topographic contour lines, generated from the seed, fill the ground at low opacity — a
 * summit loosely centred on the player, a few low hills around it. Deep club tone or off-white paper (by
 * seed). The player in natural colour; the title and info small and precise, like the legend of a map.
 */
export function Contour({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const M = story ? 72 : 64;
  const flip = params.side === "left";
  const rand = rng((params.seed ?? 7) ^ 0x5c0e);
  const paper = rand() < 0.4;

  /* ---- colours ---- */
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const deep = luminance(club) < 0.03 ? "#111317" : shade(club, -0.62);
  let line = club;
  if (luminance(line) > 0.4) line = shade(line, -0.45);
  const ground = paper ? PAPER : deep;
  const ink = paper ? INK : "#ffffff";
  const soft = paper ? "rgba(21,22,26,.66)" : "rgba(255,255,255,.7)";
  const faint = paper ? "rgba(21,22,26,.5)" : "rgba(255,255,255,.52)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = postType === "result" && !!score;

  /* ---- the player, a touch off centre ---- */
  const faceX = 540 + (flip ? -40 : 40);
  const sizes = story ? { chest: 350, waist: 280, knees: 220, full: 162 } : { chest: 250, waist: 196, knees: 150, full: 112 };
  const headRoom = story ? STORY_TOP + 170 : 168;
  let faceTop = story ? STORY_TOP + 300 : 250;
  let box = placeByFace(data, faceX, faceTop, sizes);
  for (let i = 0; i < 3 && faceTop - box.faceH * 0.75 < headRoom; i++) {
    faceTop = headRoom + box.faceH * 0.75;
    box = placeByFace(data, faceX, faceTop, sizes);
  }

  /* ---- the terrain: a summit near his chest, low hills by seed ---- */
  const hills: Hill[] = [{ x: faceX + (rand() - 0.5) * 120, y: faceTop + box.faceH * (1.6 + rand()), a: 1, sx: 300 + rand() * 80, sy: 380 + rand() * 120 }];
  const nHills = 2 + Math.floor(rand() * 2);
  for (let n = 0; n < nHills; n++) {
    const sideX = n % 2 === 0 ? (flip ? 900 : 180) : flip ? 160 : 920;
    hills.push({ x: sideX + (rand() - 0.5) * 200, y: H * (0.15 + rand() * 0.75), a: 0.35 + rand() * 0.3, sx: 160 + rand() * 120, sy: 160 + rand() * 140 });
  }
  const warp = [rand() * 6.28, rand() * 6.28, rand() * 6.28, rand() * 6.28, 34 + rand() * 22];
  const paths = contours(CANVAS_W, H, hills, warp, 9, story ? 48 : 42);
  const lineOp = paper ? 0.17 : 0.17;
  const stroke = paper ? line : "#ffffff";

  /* ---- type ---- */
  const title = hasScore ? "FULL TIME" : (content.kicker || "MATCHDAY").toUpperCase();
  const comp = titleCase(f.comp || f.round || "");
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time].filter(Boolean).join("  ·  ");
  const where = titleCase(f.venue);
  const infoW = story ? 560 : 500;
  const fit = (t: string, max: number, em = 0.52) => Math.max(12 * k, Math.min(max * k * ts, infoW / Math.max(1, t.length * em)));
  const fixSize = fit(fixture, 22);
  const whenSize = Math.min(fixSize * 0.8, fit(when, 17));
  const whereSize = Math.min(whenSize, fit(where, 17));
  const tSize = Math.min(20 * k * ts, 520 / Math.max(1, title.length * 0.95));
  const compSize = Math.max(11 * k, Math.min(13 * k * ts, 460 / Math.max(1, comp.length * 0.72)));

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const cS = Math.round(40 * k);

  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const infoBottom = (story ? H - STORY_BOTTOM : 52) - (params.textY ?? 0);
  const textSide: CSSProperties = flip ? { right: M, textAlign: "right", alignItems: "flex-end" } : { left: M, textAlign: "left", alignItems: "flex-start" };
  const otherSide: CSSProperties = flip ? { left: M } : { right: M };
  const fadeTop = H - (story ? 700 : 400);
  const caps: CSSProperties = { fontFamily: SANS, letterSpacing: "0.3em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {!paper && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${Math.round((faceX / CANVAS_W) * 100)}% 45%, ${shade(deep, 0.1)}, ${deep} 65%, ${shade(deep, -0.35)} 100%)` }} />}
      <svg data-bleed width={CANVAS_W} height={H} viewBox={`0 0 ${CANVAS_W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {paths.map((d, n) => (
          <path key={n} d={d} fill="none" stroke={stroke} strokeOpacity={n % 5 === 0 ? lineOp * 1.7 : lineOp} strokeWidth={(n % 5 === 0 ? 1.6 : 1) * (story ? 1.3 : 1.1)} strokeLinecap="round" />
        ))}
      </svg>

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {/* He settles into the ground low down, so the legend reads clean. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: fadeTop, bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e6 ${story ? 300 : 220}px, ${ground} ${story ? 420 : 300}px)` }} />

      {/* Title: small caps, top corner, the competition under a hairline. */}
      <div style={{ position: "absolute", top: (story ? STORY_TOP : M - 8) + (params.textY ?? 0), ...textSide, display: "flex", flexDirection: "column", gap: 14 * k }}>
        <div style={{ ...caps, fontWeight: 600, fontSize: tSize, color: ink }}>{title}</div>
        <div style={{ width: 36 * k, height: 1.5 * k, background: paper ? line : "rgba(255,255,255,.6)" }} />
        {comp && <div style={{ ...caps, fontWeight: 400, letterSpacing: "0.18em", fontSize: compSize, color: faint }}>{comp}</div>}
      </div>

      {/* Crests: small, the opposite top corner. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: story ? STORY_TOP - 6 : M - 14, ...otherSide, display: "flex", gap: 14 * k, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* Foot: the fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", bottom: infoBottom, ...textSide, display: "flex", flexDirection: "column", gap: 8 * k, maxWidth: infoW, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        <div style={{ fontSize: fixSize, fontWeight: 500, color: ink }}>{fixture}</div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 400, color: soft }}>{when}</div>}
        {where && <div style={{ fontSize: whereSize, fontWeight: 400, color: faint }}>{where}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight={paper}
        style={{ position: "absolute", ...otherSide, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: flip ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
