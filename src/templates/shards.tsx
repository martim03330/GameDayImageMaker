/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, cutMask } from "./fx";
import { rng } from "./kit";
import { OwnPhotoBlur, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { photoOval, portraitBox } from "./versus";
import { clubColour, mix, MonoDefs } from "./wall";

const WHITE = "#ffffff";
const TIGHT = "0 2px 14px rgba(0,0,0,.6)";

/** Archivo caps: average advance relative to the size, plus the tracking used for each line. */
const ARCH = 0.7;
const fitCaps = (t: string, width: number, max: number, tracking: number) => Math.min(max, width / Math.max(1, [...t].length * (ARCH + tracking)));

/** Face heights: a big, close celebration (the frame is fixed; only the photo's resolution limits it). */
const FACE: Record<string, number> = { chest: 250, waist: 250, knees: 250, full: 250 };

/** The two club colours as a dark-ground pair: the first always deep enough, the second clearly different. */
function pair(data: RenderData): { c1: string; c2: string } {
  const p = data.params;
  // Black-and-white clubs: a steel grey and a clean white (never two muddy greys).
  if (hueOf(clubColour(data)) === null) return { c1: "#555a64", c2: hueOf(p.accent) !== null ? vivid(p.accent) : "#ecebe6" };
  const c1 = clubColour(data);
  let c2 = vivid(p.accent);
  const same = Math.abs(luminance(c2) - luminance(c1)) < 0.06 && c2.toLowerCase() === c1.toLowerCase();
  if (same || p.accent.toLowerCase() === (p.primary === "#10131c" ? p.accent : p.primary).toLowerCase()) c2 = shade(c1, 0.45);
  // A black second colour disappears on the dark ground: use a lighter tint of the first instead.
  if (luminance(c2) < 0.05) c2 = shade(c1, 0.45);
  return { c1, c2 };
}

/** Sparse dark print specks (the worn screen-print grit over the shards). */
const GRIT = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='g' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -8.6'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

type Shard = { d: string; fill: string; opacity: number; lines: boolean };

/**
 * Angular stripes torn outward from a point behind the head: thin at the centre, wide at the edge, some
 * filled with fine scanlines; plus a few large blocky fragments far out (the torn letterforms of the poster).
 */
function shardsAround(cx: number, cy: number, seed: number, c1: string, c2: string, deep: string): Shard[] {
  const r = rng(seed);
  const out: Shard[] = [];
  // Background blocks: big rotated slabs, dark club colour.
  for (let i = 0; i < 9; i++) {
    const x = r() * CANVAS_W;
    const y = r() * CANVAS_H;
    const w = 140 + r() * 320;
    const h = 60 + r() * 200;
    const a = (r() - 0.5) * 0.7;
    const pts = [
      [-w / 2, -h / 2],
      [w / 2, -h / 2 + (r() - 0.5) * 40],
      [w / 2, h / 2],
      [-w / 2 + (r() - 0.5) * 60, h / 2],
    ].map(([px, py]) => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)]);
    out.push({ d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + "Z", fill: i % 3 ? deep : shade(c1, -0.25), opacity: 0.55 + r() * 0.35, lines: i % 4 === 1 });
  }
  // The burst: tapered slabs thrown outward, not quite meeting at one point.
  const n = 30;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const px = -sa;
    const py = ca;
    const off = (r() - 0.5) * 160;
    const ox = cx + px * off;
    const oy = cy + py * off;
    const r0 = 160 + r() * 300;
    const r1 = r0 + 300 + r() * 900;
    const w0 = 4 + r() * 30;
    const w1 = w0 + 40 + r() * (r() < 0.3 ? 320 : 150);
    const cutA = (r() - 0.5) * w1 * 0.8;
    const pts = [
      [ox + ca * r0 - (px * w0) / 2, oy + sa * r0 - (py * w0) / 2],
      [ox + ca * r1 - (px * w1) / 2, oy + sa * r1 - (py * w1) / 2],
      [ox + ca * (r1 + cutA) + (px * w1) / 2, oy + sa * (r1 + cutA) + (py * w1) / 2],
      [ox + ca * r0 + (px * w0) / 2, oy + sa * r0 + (py * w0) / 2],
    ];
    const pick = r();
    const fill = pick < 0.45 ? c2 : pick < 0.82 ? shade(c1, -0.22) : shade(c1, 0.15);
    out.push({ d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + "Z", fill, opacity: 0.55 + r() * 0.45, lines: r() < 0.32 });
  }
  // Thin torn stripes crossing the burst.
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI;
    const d = 120 + r() * 420;
    const t = r() * Math.PI * 2;
    const mx = cx + Math.cos(t) * d;
    const my = cy + Math.sin(t) * d;
    const len = 260 + r() * 520;
    const w = 6 + r() * 22;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const pts = [
      [mx - ca * len / 2 - sa * w / 2, my - sa * len / 2 + ca * w / 2],
      [mx + ca * len / 2 - sa * w / 2, my + sa * len / 2 + ca * w / 2],
      [mx + ca * len / 2 + sa * w / 2, my + sa * len / 2 - ca * w / 2],
      [mx - ca * len / 2 + sa * w / 2, my - sa * len / 2 - ca * w / 2],
    ];
    out.push({ d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + "Z", fill: r() < 0.6 ? c2 : c1, opacity: 0.7 + r() * 0.3, lines: false });
  }
  return out;
}

/**
 * Explosive gameday poster (Barça v Eibar, By&For): a dark ground torn apart by angular shards in the two
 * club colours bursting out from behind the head, printed grit and falling white specks; the player big and
 * close, mid-celebration. Small spaced caps on top (crest mark, "HOME - AWAY"); at the foot a two-colour time
 * chip, the venue in wide spaced caps and the full date; "+" marks in the corners, the agency logo last.
 */
export function Shards({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 62;
  const r = rng(seed + 7);
  const mirror = params.side === "left";
  const { c1, c2 } = pair(data);
  const deep = mix(shade(c1, -0.62), "#05060b", 0.45);
  const ground = mix(shade(c1, -0.78), "#030409", 0.5);
  const md = matchFacts(data);
  const score = scoreOf(data, "-");
  const ts = params.textScale ?? 1;

  // ---- the player: face a little off centre, big; the body runs off the bottom ----
  const faceX = 540 + (mirror ? 50 : -50) + (r() - 0.5) * 50;
  const box = portraitBox(data, faceX, 420, FACE, 1.5);
  const cut = data.photoIsCutout;
  const burstX = box.faceCx + (mirror ? -40 : 40);
  const burstY = box.faceTop + box.faceH * 0.55;
  const shards = shardsAround(burstX, burstY, seed, c1, c2, deep);

  // ---- words ----
  const home = (content.homeTeam || (content.home !== false ? data.club?.name : md.opp) || "").toUpperCase();
  const away = (content.awayTeam || (content.home !== false ? md.opp : data.club?.name) || "").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kicker = content.kicker.toUpperCase();
  // The fixture on top (the score goes in the chip); player of the month: just the club.
  const fixture = postType !== "potm" && home && away;
  const top = fixture ? { a: home, mid: " - ", b: away } : { a: (data.club?.name ?? "").toUpperCase(), mid: "", b: "" };
  const topText = top.a + top.mid + top.b;
  const topSize = fitCaps(topText, 880, 30, 0.16) * Math.min(1, ts);

  // Chip / big line / small line per post type.
  let chip = "";
  let big = "";
  let small = "";
  if (postType === "matchday") {
    chip = md.time.replace(/^(\d{1,2})[hH.](\d{2})$/, "$1:$2");
    big = md.venue || md.round || kicker;
    small = md.longDate || md.date;
  } else if (postType === "result") {
    chip = score;
    big = kicker;
    small = name;
  } else if (postType === "goal") {
    chip = score || md.time;
    big = kicker;
    small = name;
  } else {
    // Player of the month: the kicker big, his name under it, the shirt number in the chip.
    chip = data.player.number ? `#${data.player.number}` : "";
    big = kicker;
    small = name;
  }
  if (!big) big = name;
  const bigSize = fitCaps(big, 880, 54, 0.3) * ts;
  const smallSize = fitCaps(small, 760, 21, 0.28);
  const chipSize = fitCaps(chip, 260, 34, 0.02);
  const compLine = fixture ? md.comp : postType === "potm" ? (content.subline.split("·").pop() ?? "").trim().toUpperCase() : "";
  const crest = data.club?.crestUrl;

  // Falling specks: many small sharp ones, a few big soft ones.
  const specks = Array.from({ length: 150 }, () => ({ x: r() * CANVAS_W, y: r() * CANVAS_H, s: 1 + r() * r() * 4.5, o: 0.35 + r() * 0.6 }));
  const flakes = Array.from({ length: 16 }, () => ({ x: r() * CANVAS_W, y: r() * CANVAS_H, s: 7 + r() * 16, o: 0.12 + r() * 0.22 }));

  const chipTwo = luminance(c2) > 0.62 ? shade(c1, -0.35) : c2;
  const plus = (s: CSSProperties) => (
    <div style={{ position: "absolute", width: 26, height: 26, ...s }}>
      <div style={{ position: "absolute", left: 12, top: 0, width: 2, height: 26, background: WHITE, opacity: 0.85 }} />
      <div style={{ position: "absolute", top: 12, left: 0, height: 2, width: 26, background: WHITE, opacity: 0.85 }} />
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="shards-mono" ink={0.35} />
      {/* A hint of his own photo's light, very dark and blurred, so the ground isn't a flat fill. */}
      <OwnPhotoBlur data={data} blur={50} style={{ opacity: 0.25, filter: "blur(50px) saturate(.6) brightness(.5)" }} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, filter: "saturate(.74) brightness(.86) contrast(1.05)" }} aria-hidden>
        <defs>
          {[c1, c2].map((c, i) => (
            <pattern key={i} id={`shards-lines-${i}`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
              <rect width={7} height={3} fill={c} />
            </pattern>
          ))}
          {/* Torn, printed edges: a slight displacement, then fine grit knocked out of the colour. */}
          <filter id="shards-rough" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed % 97} result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale={16} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="shards-core" cx={burstX / CANVAS_W} cy={burstY / CANVAS_H} r="0.62">
            <stop offset="0" stopColor={c1} stopOpacity={0.55} />
            <stop offset="1" stopColor={c1} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} fill="url(#shards-core)" />
        <g filter="url(#shards-rough)">
          {shards.map((s, i) => (
            <path key={i} d={s.d} fill={s.lines ? `url(#shards-lines-${s.fill === c2 ? 1 : 0})` : s.fill} opacity={s.opacity} />
          ))}
        </g>
      </svg>

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRIT, opacity: 0.55 }} />
      {/* Darker towards the foot so the info reads over the shirt; a touch at the top for the teams. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.45), transparent 22%, transparent 55%, rgba(0,0,0,.35) 72%, rgba(0,0,0,.78))" }} />

      {/* The player, crisp and punchy; shadow on a wrapper (mask + drop-shadow on one img draws a box). */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 50px rgba(0,0,0,.55))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              maxWidth: "none",
              filter: "contrast(1.16) saturate(1.1) brightness(.97)",
              ...(cut ? cutMask(data.cut) : photoOval(box)),
            }}
          />
        </div>
      )}
      {/* The foot again, over the shirt. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: `linear-gradient(to bottom, transparent, ${deep}99 45%, ${ground}ee)` }} />

      {/* Specks, over everything. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <filter id="shards-soft">
            <feGaussianBlur stdDeviation={4} />
          </filter>
        </defs>
        <g filter="url(#shards-soft)">
          {flakes.map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={WHITE} opacity={f.o} />
          ))}
        </g>
        {specks.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={WHITE} opacity={f.o} />
        ))}
      </svg>

      {plus({ left: 42, top: 42 })}
      {plus({ right: 42, top: 42 })}
      {plus({ left: 42, bottom: 42 })}
      {plus({ right: 42, bottom: 42 })}

      {/* Top: the mark, then the fixture in spaced caps. */}
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 540 - 38, top: 62, width: 76, height: 76, objectFit: "contain", filter: "url(#shards-mono) drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />}
      {compLine && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crest ? 150 : 90, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 600, fontSize: fitCaps(compLine, 600, 15, 0.34), letterSpacing: "0.34em", opacity: 0.8, whiteSpace: "nowrap", textShadow: TIGHT }}>
          {compLine}
        </div>
      )}
      {topText && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crest ? 196 : 140, textAlign: "center", fontFamily: ARCHIVO, fontSize: topSize, letterSpacing: "0.16em", whiteSpace: "pre", textShadow: TIGHT }}>
          <span style={{ fontWeight: 800 }}>{top.a}</span>
          <span style={{ fontWeight: 400 }}>{top.mid}</span>
          <span style={{ fontWeight: 400 }}>{top.b}</span>
        </div>
      )}

      {/* Foot: chip, big spaced line, small line. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 118, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {chip && (
          <div
            style={{
              marginBottom: 34,
              padding: `${chipSize * 0.16}px ${chipSize * 0.5}px`,
              background: `linear-gradient(90deg, ${c1} 50%, ${chipTwo} 50%)`,
              border: "2px solid rgba(255,255,255,.85)",
              fontFamily: ARCHIVO,
              fontWeight: 800,
              fontSize: chipSize,
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 20px rgba(0,0,0,.35)",
            }}
          >
            {chip}
          </div>
        )}
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: bigSize, lineHeight: 1, letterSpacing: "0.3em", marginRight: "-0.3em", whiteSpace: "nowrap", textShadow: TIGHT }}>{big}</div>
        {small && (
          <div style={{ marginTop: 12, fontFamily: ARCHIVO, fontWeight: 500, fontSize: smallSize, letterSpacing: "0.28em", marginRight: "-0.28em", whiteSpace: "nowrap", opacity: 0.9, textShadow: TIGHT }}>{small}</div>
        )}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={30} style={{ opacity: 0.9 }} />
      </div>
      {/* Grit over the whole print. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.45))", pointerEvents: "none" }} />
    </div>
  );
}
