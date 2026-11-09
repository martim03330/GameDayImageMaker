/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { opponentOf, rng } from "./kit";
import { standing } from "./mist";
import { crestsOf, roundOf, sceneOf, scoreOf } from "./outline";
import { AgencyLogo, BEBAS, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour } from "./wall";

type Pt = [number, number];

/** Plain text of a small React tree (for fitting). */
function textOf(n: ReactNode): string {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(textOf).join("");
  if (typeof n === "object" && "props" in n) return textOf((n.props as { children?: ReactNode }).children);
  return "";
}

const DAYS: Record<string, string> = { MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY" };
const MONTHS: Record<string, string> = { JAN: "JANUARY", FEB: "FEBRUARY", MAR: "MARCH", APR: "APRIL", MAY: "MAY", JUN: "JUNE", JUL: "JULY", AUG: "AUGUST", SEP: "SEPTEMBER", OCT: "OCTOBER", NOV: "NOVEMBER", DEC: "DECEMBER" };
const ordinal = (n: number) => (n % 100 >= 11 && n % 100 <= 13 ? "TH" : ["TH", "ST", "ND", "RD"][n % 10] ?? "TH");

/** Bebas Neue: average cap advance relative to the font size. */
const BEBAS_EM = 0.41;

/**
 * Split matchday (Sheffield Utd v Nottm Forest): a steep diagonal cuts the canvas. One side is dark,
 * the ground at night behind shattered club-colour glass; the other a bright misty white panel that
 * melts into the stadium at its foot. The full-body player crosses the split; on the white side, crests
 * in corner brackets, the teams in tall athletic caps (ours in the club colour) and the kick-off lines.
 */
export function Diagonal({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 21;
  const r = rng(seed);
  const right = params.side !== "left";
  let c = clubColour(data);
  if (luminance(c) > 0.5) c = shade(c, -0.25);
  if (luminance(c) < 0.03) c = luminance(vivid(params.accent)) > 0.03 && luminance(vivid(params.accent)) < 0.6 ? vivid(params.accent) : "#6a6e78";
  const ink = "#16181d";
  const X = (x: number) => (right ? x : CANVAS_W - x);
  const fid = `dg-${seed}`;

  // ---- Geometry of the split ----
  const topX = 790 + r() * 40;
  const botY = 1040 + r() * 50;
  const lineA: [Pt, Pt] = [[topX, 0], [0, botY]];
  const brY = 780 + r() * 60;
  const lineB: [Pt, Pt] = [[CANVAS_W, brY], [610 + r() * 40, CANVAS_H]];
  const panel: Pt[] = [lineA[0], [CANVAS_W, 0], lineB[0], lineB[1], [0, CANVAS_H], lineA[1]];
  const clip = `polygon(${panel.map(([x, y]) => `${X(x).toFixed(0)}px ${y.toFixed(0)}px`).join(",")})`;
  /** x of the split at height y. */
  const splitX = (y: number) => topX * (1 - y / botY);

  // ---- Shattered glass over the dark side ----
  const shards: { pts: Pt[]; fill: string; o: number; edge: boolean }[] = [];
  for (let i = 0; i < 34; i++) {
    // Mostly high up, near the split, some down the dark wedge.
    const y = Math.pow(r(), 1.5) * 1000 - 40;
    const xMax = splitX(Math.max(0, y)) + 60;
    const x = r() * xMax;
    const s = 40 + Math.pow(r(), 2) * 220;
    const a = r() * Math.PI * 2;
    const n = r() < 0.6 ? 3 : 4;
    const pts: Pt[] = Array.from({ length: n }, (_, k) => {
      const ang = a + (k * 2 * Math.PI) / n + (r() - 0.5) * 0.9;
      const rr = s * (k === 0 ? 1.6 + r() : 0.5 + r() * 0.6);
      return [x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.8];
    });
    const light = r();
    shards.push({ pts, fill: light > 0.75 ? shade(c, 0.35) : light > 0.35 ? c : shade(c, -0.35), o: 0.35 + r() * 0.55, edge: r() < 0.5 });
  }
  // A few shards in the lower dark wedge too.
  for (let i = 0; i < 8; i++) {
    const y = brY + 60 + r() * 500;
    const x = CANVAS_W - r() * 260;
    const s = 40 + r() * 120;
    const a = r() * Math.PI * 2;
    const pts: Pt[] = [0, 1, 2].map((k) => [x + Math.cos(a + k * 2.1) * s * (k === 0 ? 1.8 : 0.7), y + Math.sin(a + k * 2.1) * s * 0.8]);
    shards.push({ pts, fill: r() > 0.5 ? c : shade(c, -0.3), o: 0.3 + r() * 0.4, edge: r() < 0.4 });
  }
  const P = (pts: Pt[]) => pts.map(([x, y]) => `${X(x).toFixed(1)},${y.toFixed(1)}`).join(" ");

  // ---- The player crosses the split ----
  const cx = X(360 + r() * 50);
  const floor = 1262;
  const box = standing(data, { cx, headTop: 250, floor, maxFace: 190, framing: params.framing ?? "full" });

  // ---- Text on the white side ----
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const ours = (data.club?.name ?? "").toUpperCase();
  const score = scoreOf(data, "-");
  const opp = opponentOf(data).toUpperCase();
  const round = roundOf(data);
  let title: [string, string];
  let clubLine = 1;
  const lines: ReactNode[] = [];
  const key = (t: string) => <span style={{ color: c }}>{t}</span>;
  if (postType === "matchday" && home && away) {
    title = [`${home} VS`, away];
    clubLine = away === ours ? 1 : home === ours ? 0 : 1;
    const m = (content.date ?? "").toUpperCase().match(/^(?:[A-Z]{3}\s+)?(\d{1,2})\s+([A-Z]{3})/);
    if (m) {
      const n = Number(m[1]);
      lines.push(
        <>
          {key(`${n}${ordinal(n)}`)} {MONTHS[m[2]] ?? m[2]}
        </>,
      );
    } else if (content.date) lines.push(<>{content.date.toUpperCase()}</>);
    if (content.time) lines.push(<>KICK OFF {key(content.time.replace(":", "H"))}</>);
    if (content.venue) lines.push(<>{content.venue.toUpperCase()}</>);
  } else if (postType === "result" && home && away) {
    title = [`${home} VS`, away];
    clubLine = away === ours ? 1 : home === ours ? 0 : 1;
    lines.push(<>{content.kicker.toUpperCase()}</>);
    if (score) lines.push(<>FULL TIME {key(score)}</>);
    for (const part of round.split(" · ").filter(Boolean)) lines.push(<>{part}</>);
  } else {
    title = [content.kicker.toUpperCase(), (content.lastName || content.firstName).toUpperCase()];
    clubLine = 1;
    if (opp) lines.push(<>VS {key(opp)}</>);
    if (score) lines.push(<>SCORE {key(score)}</>);
    for (const part of round.split(" · ").filter(Boolean)) lines.push(<>{part}</>);
  }

  const M = 52;
  const titleTop = 452;
  // The title ends right of the player's head, never over it.
  const headClear = right ? Math.max(box.faceCx + box.faceH * 1.2, splitX(titleTop) + 40) : Math.min(box.faceCx - box.faceH * 1.2, CANVAS_W - splitX(titleTop) - 40);
  const room = right ? CANVAS_W - M - headClear : headClear - M;
  const tSize = Math.max(44, Math.min(92, Math.max(360, room) / Math.max(...title.map((t) => t.length * BEBAS_EM + 0.1))));
  const lineGap = tSize * 0.9;
  const infoTop = titleTop + lineGap * 2 + 26;
  const infoRoom = Math.min(620, right ? CANVAS_W - M - splitX(infoTop) - 30 : CANVAS_W - splitX(infoTop) - 30 - M);
  const infoSize = Math.max(18, Math.min(31, infoRoom / Math.max(1, ...lines.map((l) => textOf(l).length * 0.47))));

  const logoY = infoTop + lines.length * infoSize * 1.12 + 40;
  /** x of the lower dark wedge's edge at height y (mirrored side measured from the right edge). */
  const wedgeX = (y: number) => (y <= brY ? CANVAS_W : CANVAS_W - ((y - brY) / (CANVAS_H - brY)) * (CANVAS_W - lineB[1][0]));

  const crests = crestsOf(data);
  const cs = 118;
  const cGap = 18;
  const bracket = (x: number, y: number, s: number) => {
    const k = s * 0.16;
    return [`M${x} ${y + k}V${y}H${x + k}`, `M${x + s - k} ${y}H${x + s}V${y + k}`, `M${x + s} ${y + s - k}V${y + s}H${x + s - k}`, `M${x + k} ${y + s}H${x}V${y + s - k}`].join("");
  };
  const crestsW = crests.length * cs + Math.max(0, crests.length - 1) * cGap;
  const crestX0 = right ? CANVAS_W - M - crestsW : M;
  const crestY = 262;

  const scene = data.club?.stadiumImages?.[0] ?? sceneOf(data);
  const align = right ? "right" : "left";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(c, -0.85) }}>
      {/* Dark side: the ground at night, tinted to the club colour. */}
      {scene && (
        <img src={scene} alt="" style={{ position: "absolute", left: -40, top: -40, width: CANVAS_W + 80, height: CANVAS_H + 80, maxWidth: "none", objectFit: "cover", filter: "brightness(.5) contrast(1.15) saturate(.7) blur(1.5px)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: shade(c, -0.2), mixBlendMode: "multiply", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${right ? 160 : 200}deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.25) 45%, rgba(0,0,0,.55) 100%)` }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden data-bleed>
        <defs>
          <filter id={`${fid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={16} />
          </filter>
          <linearGradient id={`${fid}-shine`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.5} />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g style={{ mixBlendMode: "screen" }}>
          {shards.map((s, i) => (
            <polygon key={`g${i}`} points={P(s.pts)} fill={s.fill} opacity={s.o * 0.8} filter={`url(#${fid}-glow)`} />
          ))}
        </g>
        {shards.map((s, i) => (
          <g key={i} opacity={s.o}>
            <polygon points={P(s.pts)} fill={s.fill} />
            <polygon points={P(s.pts)} fill={`url(#${fid}-shine)`} />
            {s.edge && <polygon points={P(s.pts)} fill="none" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={1.2} />}
          </g>
        ))}
        {/* Flares where the light catches the glass. */}
        {[0, 1, 2].map((i) => {
          const y = 120 + r() * 700;
          const x = r() * splitX(y);
          return <circle key={`f${i}`} cx={X(x)} cy={y} r={20 + r() * 40} fill="#fff4e8" opacity={0.5} filter={`url(#${fid}-glow)`} />;
        })}
      </svg>

      {/* The white misty panel, melting into the ground at its foot. */}
      <div style={{ position: "absolute", inset: 0, clipPath: clip }}>
        <div style={{ position: "absolute", inset: 0, background: "#f4f4f5" }} />
        {scene && (
          <img src={scene} alt="" style={{ position: "absolute", left: -40, top: 200, width: CANVAS_W + 80, height: CANVAS_H, maxWidth: "none", objectFit: "cover", filter: "grayscale(.6) brightness(1.25) contrast(.8) blur(2px)", opacity: 0.9 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, #ffffff 0%, #ffffff 42%, rgba(255,255,255,.9) 62%, rgba(255,255,255,.55) 85%, rgba(255,255,255,.35) 100%)` }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 40% at ${right ? 40 : 60}% 92%, rgba(255,255,255,.85), rgba(255,255,255,0))` }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${c}33, transparent 30%)`, mixBlendMode: "multiply" }} />
      </div>
      {/* Thin glowing edges of the split. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden data-bleed>
        {[lineA, lineB].map(([a, b], i) => (
          <g key={i}>
            <line x1={X(a[0])} y1={a[1]} x2={X(b[0])} y2={b[1]} stroke={c} strokeWidth={10} opacity={0.35} filter={`url(#${fid}-glow)`} />
            <line x1={X(a[0])} y1={a[1]} x2={X(b[0])} y2={b[1]} stroke={shade(c, 0.2)} strokeWidth={2.5} opacity={0.9} />
          </g>
        ))}
      </svg>

      {/* The player, feet on the misty floor. */}
      {data.photoUrl && box.feet && (
        <div style={{ position: "absolute", left: box.faceCx - box.width * 0.45, top: box.top + box.height - 26, width: box.width * 0.9, height: 46, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,22,28,.55), rgba(20,22,28,0))", filter: "blur(6px)" }} />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 16px 26px rgba(0,0,0,.35))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.07) saturate(1.08)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* Mist over the boots. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,.4))", pointerEvents: "none" }} />

      {/* Crests in corner brackets. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {crests.map((_, i) => (
          <path key={i} d={bracket(crestX0 + i * (cs + cGap), crestY, cs)} fill="none" stroke={ink} strokeWidth={3} />
        ))}
      </svg>
      {crests.map((s, i) => (
        <img key={i} src={s} alt="" style={{ position: "absolute", left: crestX0 + i * (cs + cGap) + cs * 0.15, top: crestY + cs * 0.15, width: cs * 0.7, height: cs * 0.7, objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.18))" }} />
      ))}

      {/* Teams in tall athletic caps. */}
      <div style={{ position: "absolute", top: titleTop, [right ? "right" : "left"]: M, textAlign: align, fontFamily: BEBAS, fontSize: tSize, lineHeight: 0.9, letterSpacing: "0.035em", whiteSpace: "nowrap" }}>
        {title.map((t, i) => (
          <div key={i} style={{ color: i === clubLine ? c : ink, WebkitTextStroke: `${(tSize * 0.018).toFixed(1)}px currentColor` }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: infoTop, [right ? "right" : "left"]: M, textAlign: align, fontFamily: CONDENSED, fontWeight: 800, fontSize: infoSize, lineHeight: 1.12, letterSpacing: "0.02em", color: ink, whiteSpace: "nowrap" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <AgencyLogo data={data} height={30} onLight style={{ position: "absolute", top: logoY, [right ? "right" : "left"]: Math.max(M, CANVAS_W - wedgeX(logoY + 30) + 30), color: ink }} />
    </div>
  );
}
