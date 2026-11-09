/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { InkFilter } from "./band";
import { lift } from "./column";
import { ARCHIVO } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour } from "./wall";

const WHITE = "#ffffff";

/**
 * Cracked light-grey concrete: mottled cement, a few formwork seams and hairline cracks (a dark line with a
 * lit lip beside it), all drawn from the seed so each post gets its own wall.
 */
function Concrete({ seed, H = CANVAS_H }: { seed: number; H?: number }) {
  const r = rng(seed * 13 + 5);
  const cracks: string[] = [];
  for (let i = 0; i < 14; i++) {
    // Cracks live on the bare wall either side of the pillar.
    const left = i % 2 === 0;
    let x = left ? r() * 260 : CANVAS_W - r() * 260;
    let y = r() * H;
    let a = (r() < 0.5 ? Math.PI / 2 : -Math.PI / 2) + (r() - 0.5) * 1.6;
    const steps = 8 + Math.floor(r() * 22);
    let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
    for (let s = 0; s < steps; s++) {
      a += (r() - 0.5) * 0.55;
      const len = 14 + r() * 30;
      x += Math.cos(a) * len;
      y += Math.sin(a) * len;
      d += `L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    cracks.push(d);
  }
  const seams = [38 + r() * 40, CANVAS_W - 50 - r() * 50].map((x0) => {
    let d = `M${x0.toFixed(0)} -10`;
    for (let y = 60; y <= H + 60; y += 70) d += `L${(x0 + (r() - 0.5) * 5).toFixed(1)} ${y}`;
    return d;
  });
  const stains = Array.from({ length: 6 }, () => ({
    x: r() * CANVAS_W,
    y: r() * H,
    rx: 60 + r() * 160,
    ry: 30 + r() * 90,
    o: 0.04 + r() * 0.06,
  }));
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="pillar-cement" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves={5} seed={seed} result="big" />
          <feColorMatrix in="big" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 .78" result="mottle" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed + 1} result="fine" />
          <feColorMatrix in="fine" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.9 .55" result="grit" />
          <feMerge>
            <feMergeNode in="mottle" />
            <feMergeNode in="grit" />
          </feMerge>
        </filter>
        <filter id="pillar-blur">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>
      <rect width={CANVAS_W} height={H} fill="#dcdcd9" />
      <rect width={CANVAS_W} height={H} filter="url(#pillar-cement)" opacity={0.13} />
      <g filter="url(#pillar-blur)">
        {stains.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill="#5d5d5a" opacity={s.o} />
        ))}
      </g>
      {seams.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.55} transform="translate(1.5 0)" />
          <path d={d} fill="none" stroke="#6f6f6c" strokeWidth={1.4} opacity={0.5} />
        </g>
      ))}
      {cracks.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.7} transform="translate(1.2 1.4)" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#4d4d4a" strokeWidth={1.4} opacity={0.6} strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}

/** Space-y thin caps: Archivo 400 advance relative to the size (before tracking). */
const ARCH = 0.66;
const fitWide = (t: string, width: number, max: number, tracking: number) =>
  Math.min(max, width / Math.max(1, [...t].length * (ARCH + tracking)));
/** JetBrains Mono advance (fixed) relative to the size. */
const fitMono = (t: string, width: number, max: number) =>
  Math.min(max, width / Math.max(1, [...t].length * 0.6 + 0.06 * ([...t].length - 1)));
/** Barlow Condensed bold caps. */
const fitCond = (t: string, width: number, max: number) => Math.min(max, width / Math.max(1, [...t].length * 0.52));

/** A long competition name on up to two lines ("LIGA PORTUGAL" / "2 MEU SUPER"). */
function twoLines(t: string, maxChars: number): string[] {
  if (t.length <= maxChars) return [t];
  const words = t.split(/\s+/);
  let best: string[] = [t];
  let worst = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const m = Math.max(...l.map((x) => x.length));
    if (m < worst) [worst, best] = [m, l];
  }
  return best;
}

/**
 * Pillar (Bodø/Glimt v Celtic): cracked light-grey concrete; a tall pillar of the club colour down the
 * middle, full height; behind the player a big circle in a deeper tone with the crest printed in it,
 * wider than the pillar; the celebrating player centred, full body. Thin widely spaced caps across the top
 * (the fixture), the two crests stacked on the left of the circle, competition, date and kick-off in mono
 * on the right, and a small logo row at the foot.
 */
export function Pillar({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 43;
  const r = rng(seed);
  const mirror = params.side === "left";
  const ts = params.textScale ?? 1;

  let club = clubColour(data);
  const l = luminance(club);
  club = l > 0.35 ? shade(club, -0.5) : l > 0.15 ? shade(club, -0.36) : l < 0.03 ? shade(club, 0.14) : shade(club, -0.1);
  const disc = shade(club, -0.2);
  const inkTone = shade(club, -0.42);

  // ---- geometry ---------------------------------------------------------------------------------
  const pw = 480 + Math.round((r() - 0.5) * 30);
  const px = 540 - pw / 2;
  const R = 430 + r() * 16;
  const ccx = 540;
  const ccy = 720 + (r() - 0.5) * 30;
  const crest = data.club?.crestUrl ?? null;

  // ---- words ------------------------------------------------------------------------------------
  const md = matchFacts(data);
  const score = scoreOf(data, " – ");
  const ours = (data.club?.name ?? "").toUpperCase();
  const home = (content.homeTeam || (content.home === false ? md.opp : ours)).toUpperCase();
  const away = (content.awayTeam || (content.home === false ? ours : md.opp)).toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  let top = "";
  if (postType === "matchday") top = home && away ? `${home} VS ${away}` : content.kicker.toUpperCase();
  else if (postType === "result") top = home && away && score ? `${home} ${score.trim()} ${away}` : name;
  else top = name;
  // It stays on the pillar (white on grey would not read): long fixtures lose some tracking, then wrap.
  const topRoom = pw - 50;
  let topTrack = 0.3;
  let topLines = [top];
  let topSize = fitWide(top, topRoom, 28 * ts, topTrack);
  if (topSize < 20) {
    topTrack = 0.2;
    topSize = fitWide(top, topRoom, 28 * ts, topTrack);
  }
  if (topSize < 18 && /\sVS\s/.test(top)) {
    const [a, b] = top.split(/\sVS\s/);
    topLines = [`${a} VS`, b];
    topSize = Math.min(26 * ts, ...topLines.map((t) => fitWide(t, topRoom, 26 * ts, topTrack)));
  }

  const crests: string[] = (() => {
    if (postType === "potm") return [crest].filter(Boolean) as string[];
    const h = content.homeCrest ?? (content.home === false ? md.oppCrest : md.ourCrest);
    const a = content.awayCrest ?? (content.home === false ? md.ourCrest : md.oppCrest);
    return [h, a].filter((c, i, all): c is string => !!c && all.indexOf(c) === i);
  })();

  // Right block: a bold heading, then mono lines.
  const blockW = 176;
  let headLines: string[] = [];
  let mono: string[] = [];
  const dotted = (d: string) => {
    const m = d.match(/(\d{1,2})\s+([A-Z]{3})/);
    const MM: Record<string, string> = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };
    return m && MM[m[2]] ? `${m[1].padStart(2, "0")}.${MM[m[2]]}.${String(new Date().getFullYear()).slice(2)}` : d;
  };
  if (postType === "matchday") {
    headLines = twoLines(md.comp || content.kicker.toUpperCase(), 12);
    mono = [
      md.date ? `${md.dow} ${dotted(md.date)}`.trim() : "",
      md.time ? `KO ${md.time}` : "",
      md.round.replace(/^MATCHDAY\s+/, "MD "),
    ].filter(Boolean);
  } else if (postType === "result") {
    headLines = twoLines(content.kicker.toUpperCase(), 12);
    mono = [name, md.comp, md.date ? dotted(md.date) : ""].filter(Boolean);
  } else if (postType === "goal") {
    headLines = twoLines(content.kicker.toUpperCase(), 12);
    mono = [score ? score.replace(/\s/g, "") : "", md.opp ? `V ${md.opp}` : "", md.comp].filter(Boolean);
  } else {
    headLines = twoLines(content.kicker.toUpperCase(), 12);
    const facts = content.stats
      .filter((s) => s.value && String(s.value).length <= 5 && Number(s.value) !== 0)
      .slice(0, 3)
      .map((s) => `${s.value} ${(Number(s.value) === 1 ? s.label.replace(/s$/i, "") : s.label).toUpperCase()}`);
    mono = [content.subline.toUpperCase(), ...facts].filter(Boolean);
  }
  const headMax = (headLines.length === 1 && headLines[0].length <= 6 ? 52 : 34) * ts;
  const headSize = Math.min(headMax, ...headLines.map((t) => fitCond(t, blockW, headMax)));
  // A long line (a competition name) wraps rather than shrinking every line of the block.
  mono = mono.flatMap((t) => (fitMono(t, blockW, 21 * ts) < 16 ? twoLines(t, 0) : [t]));
  const monoSize = Math.min(21 * ts, ...mono.map((t) => fitMono(t, blockW, 21 * ts)));
  const blockH = headLines.length * headSize * 1.0 + 10 + mono.length * monoSize * 1.3;
  const blockX = ccx + R * 0.5 + 10; // left edge of the right block

  const crestSize = crests.length > 1 ? 96 : 118;
  const crestGap = 22;
  const crestsH = crests.length * crestSize + (crests.length - 1) * crestGap;
  const crestX = ccx - R * 0.5 - 24 - crestSize; // left edge of the crest stack
  const crestTop = ccy + 20 - crestsH / 2;

  // ---- the player: centred, feet on the pillar's floor ------------------------------------------------
  const topBottom = 150 + topLines.length * topSize * 1.35;
  let headTop = 300;
  const floor = 1172;
  const place = () => standing(data, { cx: mirror ? 540 + 8 : 540 - 8, headTop, floor, maxFace: 110, framing: "full" });
  let placed = place();
  // Raised hands stay clear of the title; a wide pose is kept between the crests and the right block.
  for (let i = 0; i < 3 && placed.top < topBottom + 36; i++) {
    headTop += topBottom + 36 - placed.top;
    placed = place();
  }
  const room = blockX - 16 - (crestX + crestSize + 16);
  if (placed.width / placed.height > 0.6 && placed.width > room) {
    const k = Math.max(0.78, room / placed.width);
    headTop = floor - (floor - headTop) * k;
    placed = place();
  }
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.2);
  // A wide pose (a kick, arms out) would cover the block inside the circle: it moves out to the bare wall
  // above the circle's edge, printed in the club's ink instead of white.
  const out = box.width / box.height > 0.6;
  const blockLeft = out ? px + pw + 34 : blockX;
  const circleTopAt = (x: number) => ccy - Math.sqrt(Math.max(0, R * R - (x - ccx) ** 2));
  const blockTop = out ? Math.max(84, circleTopAt(blockLeft - 8) - blockH - 26) : ccy + 20 - blockH / 2;
  const blockInk = out ? shade(club, luminance(club) < 0.05 ? 0 : -0.25) : WHITE;
  const fig = data.photoUrl;

  const L = (x: number, w = 0) => (mirror ? CANVAS_W - x - w : x);
  const logoRow = [crest].filter(Boolean) as string[];

  // Native story (1080×1920): the wall and the pillar run the full height (no stretched post edges — they
  // smeared a crack into a black streak at the top), and the whole composition sits 285px lower, centred.
  const H = data.canvasH ?? CANVAS_H;
  const dy = H > CANVAS_H ? (H - CANVAS_H) / 2 : 0;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#dcdcd9", color: WHITE }}>
      <Concrete seed={seed} H={H} />

      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <InkFilter id="pillar-ink" color={inkTone} opacity={0.9} />
          <linearGradient id="pillar-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity={0.12} />
            <stop offset="0.18" stopColor="#000" stopOpacity={0} />
            <stop offset="0.82" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.12} />
          </linearGradient>
          <radialGradient id="pillar-disc" cx="0.5" cy="0.42" r="0.6">
            <stop offset="0" stopColor={shade(disc, 0.05)} />
            <stop offset="1" stopColor={shade(disc, -0.08)} />
          </radialGradient>
        </defs>
        {/* A soft shadow the pillar casts on the wall, then the pillar. */}
        <rect x={px - 8} y={0} width={pw + 16} height={H} fill="#000" opacity={0.07} />
        <rect x={px} y={0} width={pw} height={H} fill={club} />
        <rect x={px} y={0} width={pw} height={H} fill="url(#pillar-shade)" />
        {/* The circle, wider than the pillar, with the crest printed in it. */}
        <g transform={`translate(0 ${dy})`}>
          <circle cx={ccx} cy={ccy} r={R + 6} fill="#000" opacity={0.06} />
          <circle cx={ccx} cy={ccy} r={R} fill="url(#pillar-disc)" />
          <circle cx={ccx} cy={ccy} r={R - 18} fill="none" stroke={inkTone} strokeWidth={3} opacity={0.5} />
          {crest ? (
            <image
              href={crest}
              x={ccx - R * 0.86}
              y={ccy - R * 0.86}
              width={R * 1.72}
              height={R * 1.72}
              preserveAspectRatio="xMidYMid meet"
              filter="url(#pillar-ink)"
              opacity={0.85}
            />
          ) : null}
        </g>
      </svg>

      <div style={{ position: "absolute", left: 0, top: dy, width: CANVAS_W, height: CANVAS_H }}>
        {/* The fixture, thin and widely spaced across the top. */}
        {topLines.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 150 + i * topSize * 1.35,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: ARCHIVO,
              fontWeight: 400,
              fontSize: topSize,
              lineHeight: 1.2,
              letterSpacing: `${topTrack}em`,
              textIndent: `${topTrack}em`,
              whiteSpace: "nowrap",
              color: WHITE,
            }}
          >
            {t}
          </div>
        ))}

        {/* Floor shadow and the player. */}
        {fig && box.feet && (
          <div
            style={{
              position: "absolute",
              left: box.faceCx - 230,
              width: 460,
              top: floor - 34,
              height: 64,
              borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,0))",
              filter: "blur(6px)",
            }}
          />
        )}
        {fig && (
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 14px 24px rgba(0,0,0,.3))" }}>
            <img
              src={fig}
              alt=""
              style={{
                position: "absolute",
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                maxWidth: "none",
                filter: "contrast(1.05) saturate(1.02)",
                ...figMask,
              }}
            />
          </div>
        )}

        {/* Crests stacked on the left of the circle. */}
        <div
          style={{
            position: "absolute",
            top: crestTop,
            left: L(crestX, crestSize),
            display: "flex",
            flexDirection: "column",
            gap: crestGap,
          }}
        >
          {crests.map((c, i) => (
            <img
              key={i}
              src={c}
              alt=""
              style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.3))" }}
            />
          ))}
        </div>

        {/* Competition, date and kick-off on the right. */}
        <div
          style={{
            position: "absolute",
            top: blockTop,
            left: L(blockLeft, blockW),
            width: blockW,
            textAlign: mirror ? "right" : "left",
            color: blockInk,
          }}
        >
          {headLines.map((t, i) => (
            <div
              key={i}
              style={{
                fontFamily: CONDENSED,
                fontWeight: 800,
                fontSize: headSize,
                lineHeight: 1,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </div>
          ))}
          <div style={{ height: 10 }} />
          {mono.map((t, i) => (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontWeight: 500,
                fontSize: monoSize,
                lineHeight: 1.3,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                opacity: 0.95,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Logo row at the foot. */}
        <div
          style={{
            position: "absolute",
            bottom: 46,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 26,
          }}
        >
          {logoRow.map((c, i) => (
            <img key={i} src={c} alt="" style={{ height: 40, width: 40, objectFit: "contain" }} />
          ))}
          <AgencyLogo data={data} height={26} style={{ color: WHITE }} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(130% 95% at 50% 45%, transparent 62%, rgba(0,0,0,.14) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
