/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { keepHead } from "./doubleline";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { capsEm, type Box } from "./rippleecho";
import { capsStyle, echoFoot, EchoFigure, EchoLogo, echoSetup } from "./echotitle";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/**
 * Zoom burst, borrowed from `zoomburst` and made quiet: copies of his own silhouette scaled out from his chest,
 * each a little fainter, flat in one tone and softened, so they average into fine radial streaks leaving his
 * outline — a held breath of motion behind him, faded out long before the edges.
 */
export function SilhouetteBurst({ id, data, box, H, ox, oy, color, strength = 1, steps = 18, reach = 0.42, reachPx = 900 }: { id: string; data: RenderData; box: Box; H: number; ox: number; oy: number; color: string; strength?: number; steps?: number; reach?: number; reachPx?: number }) {
  const url = data.photoUrl;
  if (!url) return null;
  const fade = `radial-gradient(${reachPx}px ${reachPx * 1.05}px at ${ox}px ${oy}px, #000 18%, rgba(0,0,0,.55) 46%, transparent 78%)`;
  return (
    <div data-bleed style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: H, overflow: "hidden", WebkitMaskImage: fade, maskImage: fade }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <filter id={`${id}-tint`} colorInterpolationFilters="sRGB">
          <feFlood floodColor={color} />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      </svg>
      {Array.from({ length: steps }, (_, i) => {
        const n = i + 1;
        const sc = 1 + (reach * n) / steps;
        return (
          <div key={i} style={{ position: "absolute", inset: 0, transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${ox}px ${oy}px`, opacity: Math.min(1, (strength * 0.5) / Math.sqrt(n + 1)) }}>
            <img src={url} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: `url(#${id}-tint) blur(${(1.5 + n * 0.25).toFixed(1)}px)`, ...cutMask(data.cut) }} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Burst lines: fine hairline rays from (ox, oy) — random angles and lengths by seed, faded in away from his
 * body and out towards the edges — the zoom read as drawn lines rather than smeared photo.
 */
export function BurstRays({ id, H, ox, oy, color, seed, r0, r1, count = 120, alpha = 1 }: { id: string; H: number; ox: number; oy: number; color: string; seed: number; r0: number; r1: number; count?: number; alpha?: number }) {
  const r = rng(seed);
  const rays = Array.from({ length: count }, () => {
    const a = r() * Math.PI * 2;
    const start = r0 * (0.8 + r() * 0.5);
    const len = (r1 - r0) * (0.25 + r() * 0.75);
    const o = (0.25 + r() * 0.75) * alpha;
    const w = r() < 0.18 ? 1.6 : 1;
    return { x1: ox + Math.cos(a) * start, y1: oy + Math.sin(a) * start, x2: ox + Math.cos(a) * (start + len), y2: oy + Math.sin(a) * (start + len), o, w };
  });
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <radialGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" cx={ox} cy={oy} r={r1}>
          <stop offset={0} stopColor="#fff" stopOpacity={0} />
          <stop offset={(r0 / r1) * 0.95} stopColor="#fff" stopOpacity={0} />
          <stop offset={Math.min(0.9, (r0 / r1) * 1.6)} stopColor="#fff" stopOpacity={1} />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={H}>
          <rect x={0} y={0} width={CANVAS_W} height={H} fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`} stroke={color} strokeLinecap="round">
        {rays.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={l.w} strokeOpacity={l.o} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Echo zoom: echoline's player and hairline echo on the deep club ground, with zoomburst's idea set very low —
 * faint radial streaks of his own silhouette bursting out from his chest behind him — and the crisp echo on
 * top. Title small at the top; crests, fixture and date · kick-off · ground small at the foot.
 */
export function Echozoom({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 11);
  const f = matchFacts(data);
  const k = s.k;

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((s.story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * s.ts;
  const titleTop = (s.story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- player, centred (echoline's placement), his whole head clear of the title ---- */
  const box = keepHead(data, s.story ? placeByFace(data, 540, 330, { chest: 420, waist: 330, knees: 240, full: 180 }) : placeByFace(data, 540, 250, { chest: 290, waist: 228, knees: 170, full: 128 }), titleTop + tSize + 30 * k, true);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const ox = box.left + (face[0] + face[2] / 2) * box.width;
  const oy = box.top + face[1] * box.height + box.faceH * 2.2;
  // The streaks: a light step of the club colour (or white with a white echo), kept low.
  const streak = s.white ? "#ffffff" : shade(s.club, luminance(s.club) < 0.12 ? 0.55 : 0.4);

  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echozoom"
        clipTop={titleTop + tSize + 34}
        light={[50, 40]}
        behind={
          <>
            <SilhouetteBurst id="echozoom-burst" data={data} box={box} H={s.H} ox={ox} oy={oy} color={streak} strength={0.22} reachPx={s.story ? 1100 : 880} />
            <BurstRays id="echozoom-rays" H={s.H} ox={ox} oy={oy} color={streak} seed={params.seed ?? 7} r0={s.story ? 300 : 230} r1={s.story ? 1060 : 780} count={84} alpha={s.white ? 0.16 : 0.22} />
          </>
        }
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...capsStyle(tSize, T_TRACK, 500) }}>{title}</div>
      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.2} />
    </div>
  );
}
