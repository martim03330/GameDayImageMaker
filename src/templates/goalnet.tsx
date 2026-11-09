/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 60;
const WHITE = "#ffffff";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps (400–500), roughly, tracking included. */
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.9 : 0.69) + tracking, 0);
/** DM Serif Display capitals, roughly. */
const serifEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.24 : /[-–]/.test(c) ? 0.36 : /[IJ]/.test(c) ? 0.36 : c === "M" || c === "W" ? 0.95 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return titleCase((words.join(" ") || n).trim());
}

/**
 * The goal net: a diamond mesh drawn as two families of hairlines, billowing gently and bulging out around
 * (cx, cy) as if the ball had just hit it — cells near him larger, as the net swells towards us.
 */
function netPath(cx: number, cy: number, cell: number, bulge: number, sigma: number, phase: number, H = CANVAS_H): string {
  const W = CANVAS_W;
  const step = 16;
  const warp = (x: number, y: number): [number, number] => {
    const dx = x - cx;
    const dy = y - cy;
    const g = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
    const k = 1 + bulge * g;
    // A slow billow across the whole net.
    const bx = 16 * Math.sin(y / 260 + phase) + 8 * Math.sin((x + y) / 380 + phase * 1.7);
    const by = 12 * Math.sin(x / 300 + phase * 0.6) + 26 * Math.sin((Math.PI * x) / W) * (y / H);
    return [cx + dx * k + bx, cy + dy * k + by];
  };
  const out: string[] = [];
  const pad = 200;
  // Lines x + y = c and x − y = c, spaced so the diamonds are `cell` across.
  const d = cell;
  for (const dir of [1, -1]) {
    const lo = dir === 1 ? -pad * 2 : -H - pad;
    const hi = dir === 1 ? W + H + pad * 2 : W + pad;
    for (let c = lo; c <= hi; c += d) {
      const pts: string[] = [];
      for (let y = -pad; y <= H + pad; y += step) {
        const x = dir === 1 ? c - y : c + y;
        if (x < -pad || x > W + pad) continue;
        const [px, py] = warp(x, y);
        pts.push(`${px.toFixed(1)} ${py.toFixed(1)}`);
      }
      if (pts.length > 1) out.push(`M${pts.join("L")}`);
    }
  }
  return out.join("");
}

/**
 * Goalnet: a deep club-tone ground filled with a hairline goal net that billows gently and swells around the
 * celebrating player, as if the ball had just hit it. The kicker in a clean serif above him, the scorer small
 * under it; at the foot the score line between the two crests and the competition.
 */
export function Goalnet({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the title under the profile bar, the foot on the reply bar's safe
  // line, a size up, the player and the net filling the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const S = story ? 1.3 : 1;
  const r = rng(params.seed ?? 7);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const ground = shade(club, -0.74);
  const lift = shade(club, -0.46);
  const low = shade(club, -0.86);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");

  /* ---- top: the kicker, the scorer ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const K_TRACK = 0.06;
  const kSize = Math.min(124 * S * ts, (CANVAS_W - 2 * M - 40) / Math.max(1, serifEm(kicker, K_TRACK)));
  const kTop = (story ? STORY_TOP - kSize * 0.12 : 64) + (params.textY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const N_TRACK = 0.42;
  const nSize = Math.max(12, Math.min(15 * S * ts, 760 / Math.max(1, capsEm(name, N_TRACK))));
  const nameTop = kTop + kSize * 0.98 + 22 * S;

  /* ---- the foot ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const compBottom = logoBottom + (story ? 148 : 84);
  const lineBottom = compBottom + 32 * S;
  const weHost = content.home ?? ((content.homeTeam ?? "").toUpperCase() !== f.opp);
  const ours = shortName(data.club?.name ?? (weHost ? content.homeTeam : content.awayTeam) ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp);
  const pair = weHost ? [ours, them] : [them, ours];
  const scoreLine = pair[0] && pair[1] ? (score ? `${pair[0]}  ${score}  ${pair[1]}` : `${pair[0]}  v  ${pair[1]}`) : score;
  const L_TRACK = 0.24;
  const lineSize = Math.max(12, Math.min(19 * S * ts, 700 / Math.max(1, capsEm(scoreLine, L_TRACK))));
  const comp = titleCase(f.comp || f.round || "");
  const C_TRACK = 0.3;
  const compSize = Math.max(10, Math.min(12 * S * ts, 820 / Math.max(1, capsEm(comp, C_TRACK))));
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]) as (string | null)[];
  const crestFilter = params.crestColor ? "none" : "url(#goalnet-mono)";

  /* ---- the player ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const faceTop = Math.max(story ? STORY_TOP + 300 : 310, nameTop + nSize + 120 * S);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 330, waist: 254, knees: 202, full: 160 } : { chest: 230, waist: 178, knees: 142, full: 112 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;
  const fadeTo = CH - lineBottom - lineSize - 40 * S;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 230 - box.top}px, transparent ${fadeTo - box.top}px)`;

  /* ---- the net, swelling around his chest ---- */
  const bulgeY = fTop + fH * 2.2;
  const net = netPath(fCx, bulgeY, story ? 46 : 40, 0.75, story ? 420 : 330, r() * 6, CH);
  const netInk = luminance(club) > 0.3 ? `rgba(255,255,255,${story ? 0.26 : 0.22})` : `rgba(255,255,255,${story ? 0.23 : 0.18})`;

  const caps = (s: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: s,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: WHITE,
    textAlign: "center",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="goalnet-mono" ink={0.5} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 46% at ${(fCx / CANVAS_W) * 100}% ${(bulgeY / CH) * 100}%, ${lift}, ${ground} 70%, ${low} 100%)` }} />

      {/* The net: hairlines, brightest where it swells around him, gone at the foot. */}
      <svg width={CANVAS_W} height={CH} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id="goalnet-glow" gradientUnits="userSpaceOnUse" cx={fCx} cy={bulgeY} r={story ? 980 : 760}>
            <stop offset="0" stopColor="#fff" stopOpacity={1} />
            <stop offset="0.55" stopColor="#fff" stopOpacity={0.7} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
          </radialGradient>
          <linearGradient id="goalnet-foot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.7" stopColor="#fff" />
            <stop offset="0.9" stopColor="#000" />
          </linearGradient>
          <mask id="goalnet-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CH}>
            <rect width={CANVAS_W} height={CH} fill="url(#goalnet-foot)" />
          </mask>
          <mask id="goalnet-glowmask" maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CH}>
            <rect width={CANVAS_W} height={CH} fill="url(#goalnet-glow)" />
          </mask>
        </defs>
        <g mask="url(#goalnet-mask)">
          <path d={net} fill="none" stroke={netInk} strokeWidth={1.1} mask="url(#goalnet-glowmask)" />
        </g>
      </svg>

      {/* The player, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the kicker in a clean serif, the scorer under it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: kTop, textAlign: "center", fontFamily: DMSERIF, fontWeight: 400, fontSize: kSize, letterSpacing: `${K_TRACK}em`, paddingLeft: `${K_TRACK}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>
        {kicker}
      </div>
      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nSize, N_TRACK, 400, { color: "rgba(255,255,255,.78)" }) }}>{name}</div>}

      {/* Foot: crest · score line · crest, the competition, the agency. */}
      {scoreLine && (
        <div style={{ position: "absolute", left: M, right: M, bottom: lineBottom - 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * S }}>
          {crests[0] && <img src={crests[0]} alt="" style={{ width: 32 * S, height: 32 * S, objectFit: "contain", filter: crestFilter }} />}
          <div style={caps(lineSize, L_TRACK, 500)}>{scoreLine}</div>
          {crests[1] && <img src={crests[1]} alt="" style={{ width: 32 * S, height: 32 * S, objectFit: "contain", filter: crestFilter }} />}
        </div>
      )}
      {comp && <div style={{ position: "absolute", left: M, right: M, bottom: compBottom, ...caps(compSize, C_TRACK, 400, { color: "rgba(255,255,255,.6)" }) }}>{comp}</div>}
      <AgencyLogo
        data={data}
        height={story ? 26 : 18}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
