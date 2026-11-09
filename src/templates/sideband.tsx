/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { lift } from "./column";
import { rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { competitionOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, MonoDefs } from "./wall";

const WHITE = "#ffffff";
const PAPER = "#eeeeeb";

/** Fine grain (overlay on the colour, multiply on the paper). */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Barlow caps: average advance relative to the size (before tracking). */
const BARLOW = 0.56;
const fitCaps = (t: string, width: number, max: number, tracking: number) => Math.min(max, width / Math.max(1, [...t].length * (BARLOW + tracking)));

/** The kicker as one or two columns ("PLAYER OF" / "THE MONTH"), whichever lets the letters be biggest. */
function columns(kicker: string, length: number, room: number, gap: number): { lines: string[]; size: number } {
  const k = kicker.toUpperCase().replace(/’/g, "'").replace(/\s+/g, " ").trim();
  const words = k.split(" ");
  const cands: string[][] = [[k]];
  if (words.length > 1 && k.replace(/\s/g, "").length > 8) for (let i = 1; i < words.length; i++) cands.push([words.slice(0, i).join(" "), words.slice(i).join(" ")]);
  let best = { lines: [k], size: 0 };
  for (const lines of cands) {
    // Letters may be squeezed along the column down to 70% of their width.
    const byLength = Math.min(...lines.map((l) => length / (em(l, ANTON, 44) * 0.7)));
    const byRoom = (room - gap * (lines.length - 1)) / lines.length / 0.86;
    const size = Math.min(byLength, byRoom);
    // Two columns fill the panel better: they win unless they are clearly smaller.
    if (size * (lines.length === 2 ? 1.12 : 1) > best.size * (best.lines.length === 2 ? 1.12 : 1)) best = { lines, size };
  }
  return best;
}

/**
 * Side-band matchday (Gladbach v Freiburg): a deep club-colour ground with grain; a tall white paper panel
 * down the right edge that ends in a big white diagonal wedge across the foot; inside the panel one gigantic
 * vertical word in the club colour reading top to bottom, cropped by the edges; the full-body player in
 * front of both, his shadow on the wedge. Top left: two white crests, the teams in spaced caps, then the
 * ground, date and kick-off.
 */
export function Sideband({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 41);
  const mirror = params.side === "left";
  const X = (x: number) => (mirror ? CANVAS_W - x : x);
  // Native story (1080×1920): the panel and its giant word run the full height (no stretched post edges),
  // the wedge, the player and the info block sit 285px lower so the poster is centred in the story.
  const H = data.canvasH ?? CANVAS_H;
  const dy = H > CANVAS_H ? (H - CANVAS_H) / 2 : 0;
  const club = clubColour(data);
  const l = luminance(club);
  const deep = l > 0.35 ? shade(club, -0.6) : l > 0.12 ? shade(club, -0.45) : l < 0.03 ? shade(club, 0.12) : shade(club, -0.22);

  // ---- geometry: the panel and the wedge ------------------------------------------------------------
  const panelX = 640 + Math.round((r() - 0.5) * 30);
  const w0 = 1015 + dy + r() * 40; // wedge top edge at the far edge
  const slopeTop = 0.27 + r() * 0.04;
  const w1 = w0 + 62; // wedge bottom edge at the far edge
  const slopeBot = 0.365;
  const wedgeTop = (x: number) => w0 + slopeTop * x;
  const wedgeBot = (x: number) => w1 + slopeBot * x;
  const footX = (H - w1) / slopeBot;
  const shape = [
    [panelX, -10],
    [CANVAS_W + 10, -10],
    [CANVAS_W + 10, H + 10],
    [footX, H + 10],
    [-10, wedgeBot(-10)],
    [-10, wedgeTop(-10)],
    [panelX, wedgeTop(panelX)],
  ]
    .map(([x, y]) => `${X(x).toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  // ---- the giant vertical word -------------------------------------------------------------------
  const bleedX = 38;
  const bleedTop = 8;
  const bleedBottom = 34;
  const margin = 64;
  const colGap = 26;
  const length = H + bleedTop + bleedBottom;
  const room = CANVAS_W + bleedX - panelX - margin;
  const { lines, size } = columns(content.kicker || "MATCHDAY", length, room, colGap);
  const cap = size * 0.86;
  const word = shade(deep, 0.04);

  // ---- the info block (top corner) -----------------------------------------------------------------
  const md = matchFacts(data);
  const score = scoreOf(data);
  const ours = (data.club?.name ?? "").toUpperCase();
  const home = (content.homeTeam || (content.home === false ? md.opp : ours)).toUpperCase();
  const away = (content.awayTeam || (content.home === false ? ours : md.opp)).toUpperCase();
  const comp = competitionOf(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const crests: string[] = (() => {
    if (postType === "potm") return [data.club?.crestUrl].filter(Boolean) as string[];
    const h = content.homeCrest ?? (content.home === false ? md.oppCrest : md.ourCrest);
    const a = content.awayCrest ?? (content.home === false ? md.ourCrest : md.oppCrest);
    return [h, a].filter((c, i, all): c is string => !!c && all.indexOf(c) === i);
  })();

  let teams: { text: string; value?: string }[] = [];
  let bold = "";
  let small: string[] = [];
  if (postType === "potm") {
    teams = [content.firstName, content.lastName].filter(Boolean).map((t) => ({ text: t.toUpperCase() }));
    bold = content.subline.toUpperCase();
    small = content.stats
      .filter((s) => s.value && String(s.value).length <= 5 && Number(s.value) !== 0)
      .slice(0, 3)
      .map((s) => `${s.value} ${(Number(s.value) === 1 ? s.label.replace(/s$/i, "") : s.label).toUpperCase()}`);
    small = [small.join("  /  ")].filter(Boolean);
  } else {
    const withScore = (postType === "result" || postType === "goal") && !!score;
    teams = [home, away].filter(Boolean).map((t, i) => ({ text: t, value: withScore ? String(i === 0 ? content.homeGoals : content.awayGoals) : undefined }));
    if (postType === "matchday") {
      bold = md.venue;
      small = [md.longDate || md.date, [md.time && `${md.time} KO`, md.round].filter(Boolean).join("  /  "), md.comp].filter(Boolean);
    } else if (postType === "result") {
      bold = score ? "FULL TIME" : name;
      small = [score ? name : "", [comp, md.date].filter(Boolean).join("  /  ")].filter(Boolean);
    } else {
      bold = name;
      small = [[comp, md.date].filter(Boolean).join("  /  ")].filter(Boolean);
    }
  }

  const infoX = 70;
  const infoW = panelX - infoX - 44;
  const ts = params.textScale ?? 1;
  const teamSize = Math.min(...teams.map((t) => fitCaps(t.text + (t.value ? "   " + t.value : ""), infoW, 38 * ts, 0.16)), 38 * ts);
  const boldSize = bold ? fitCaps(bold, infoW, 27 * ts, 0.06) : 0;
  const smallSize = Math.min(21 * ts, ...small.map((t) => fitCaps(t, infoW, 21 * ts, 0.08)));
  const side = (x: number): CSSProperties => (mirror ? { right: x } : { left: x });

  // Each line of the block with its exact place, so the player can be kept clear of every one of them.
  type Row = { text: string; value?: string; top: number; size: number; weight: number; tracking: number; right: number; opacity?: number };
  const crestSize = 60;
  const topY = 72 + dy;
  const rows: Row[] = [];
  let y = topY + (crests.length ? crestSize + 34 : 0);
  const push = (text: string, size: number, weight: number, tracking: number, lineH: number, gap: number, value?: string, opacity?: number) => {
    y += gap;
    const chars = [...(text + (value ? "   " + value : ""))].length;
    rows.push({ text, value, top: y, size, weight, tracking, right: infoX + chars * (BARLOW + tracking) * size, opacity });
    y += size * lineH;
  };
  teams.forEach((t) => push(t.text, teamSize, 500, 0.16, 1.22, 0, t.value));
  if (bold) push(bold, boldSize, 800, 0.06, 1.2, 24);
  small.forEach((t, i) => push(t, smallSize, 600, 0.08, 1.2, i || bold ? 11 : 26, undefined, 0.92));
  const crestRight = infoX + crests.length * (crestSize + 22);

  // ---- the player: crossing both areas, feet on the wedge ------------------------------------------
  // His silhouette's top, roughly: the head, the shoulders, and — when the photo reaches well above the
  // head — raised arms over the whole width. Any info line it would touch moves him towards the panel
  // a little, then makes him smaller.
  let cx = 480 + (r() - 0.5) * 50;
  let headTop = 350 + dy;
  const floorAt = (x: number) => Math.round((wedgeTop(x) + wedgeBot(x)) / 2 + 8);
  const place = () => standing(data, { cx: X(cx), headTop, floor: floorAt(cx), maxFace: 104, framing: "full" });
  const near = (x: number) => (mirror ? CANVAS_W - x : x);
  /** How far down the player must go to clear the block (0 = clear). */
  const overlap = (p: ReturnType<typeof place>) => {
    const fcx = near(p.faceCx);
    const blocks: [number, number][] = [
      // the head, and a hand raised beside it (a fist, a salute)
      [fcx - p.faceH * 2.3, p.faceTop - p.faceH * 0.3],
      [fcx - p.faceH * 1.9, p.faceTop + p.faceH * 1.35],
    ];
    if (p.top < p.faceTop - p.faceH * 0.6) blocks.push([Math.min(near(p.left), near(p.left + p.width)), p.top]);
    let need = 0;
    const lines = [...rows.map((r) => ({ right: r.right, bottom: r.top + r.size * 1.1 })), ...(crests.length ? [{ right: crestRight, bottom: topY + crestSize }] : [])];
    for (const [x0, y0] of blocks) for (const l of lines) if (l.right + 18 > x0 && l.bottom + 22 > y0) need = Math.max(need, l.bottom + 22 - y0);
    return need;
  };
  let placed = place();
  if (overlap(placed) > 0) {
    cx += 90;
    placed = place();
  }
  for (let i = 0; i < 4 && overlap(placed) > 0; i++) {
    headTop += overlap(placed);
    placed = place();
  }
  const floor = floorAt(cx);
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.2);
  const fig = data.photoUrl;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <MonoDefs id="sideband-mono" ink={0.5} />
      {/* Colour ground: a touch lighter where the light falls, grain on top. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at ${mirror ? 72 : 28}% 38%, ${shade(deep, 0.1)}, ${deep} 60%, ${shade(deep, -0.2)} 100%)` }} />

      {/* The white paper panel and wedge, with the giant word printed on it. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="sideband-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={params.seed ?? 3} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" />
          </filter>
          <clipPath id="sideband-clip">
            <polygon points={shape} />
          </clipPath>
        </defs>
        <polygon points={shape} fill={PAPER} />
        <g clipPath="url(#sideband-clip)">
          <rect width={CANVAS_W} height={H} filter="url(#sideband-paper)" />
          {lines.map((t, i) => {
            // Line 0 hugs the far edge (its tops cut by it), the next one sits inside it.
            const base = CANVAS_W + bleedX - cap - i * (cap + colGap);
            const natural = em(t, ANTON, 44) * size;
            const len = Math.min(Math.max(natural * 0.7, Math.min(length, natural)), natural * 1.25, length);
            const y0 = len >= length - 1 ? (mirror ? -bleedBottom : -bleedTop) : (H - len) / 2;
            const tx = mirror ? CANVAS_W - base : base;
            return (
              <g key={i} transform={`translate(${tx.toFixed(1)},${(mirror ? y0 + len : y0).toFixed(1)}) rotate(${mirror ? -90 : 90})`}>
                <text x={0} y={0} textLength={len} lengthAdjust="spacingAndGlyphs" style={{ fontFamily: DISPLAY, fontSize: size }} fill={word}>
                  {t}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Shadow on the wedge: a long soft cast away from the light and a tight contact under the boots. */}
      {fig && box.feet && (
        <>
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
              filter: "brightness(0) blur(7px)",
              opacity: 0.2,
              transformOrigin: "50% 100%",
              transform: `translateY(${(floor - (box.top + box.height)).toFixed(0)}px) skewX(${mirror ? 58 : -58}deg) scaleY(0.2)`,
            }}
          />
          <div style={{ position: "absolute", left: box.faceCx - 230, width: 460, top: floor - 30, height: 58, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.4), rgba(0,0,0,0))", filter: "blur(6px)" }} />
        </>
      )}
      {fig && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 28px rgba(0,0,0,.28))" }}>
          <img src={fig} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.03)", ...figMask }} />
        </div>
      )}

      {/* Top corner: crests, teams, then ground / date / kick-off. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: topY, ...side(infoX), display: "flex", gap: 22, flexDirection: mirror ? "row-reverse" : "row" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "url(#sideband-mono)" }} />
          ))}
        </div>
      )}
      {rows.map((w, i) => (
        <div key={i} style={{ position: "absolute", top: w.top, ...side(infoX), fontFamily: CONDENSED, fontWeight: w.weight, fontSize: w.size, lineHeight: 1.2, letterSpacing: `${w.tracking}em`, whiteSpace: "nowrap", opacity: w.opacity }}>
          {w.text}
          {w.value != null && <span style={{ fontWeight: 800, marginLeft: w.size * 0.8 }}>{w.value}</span>}
        </div>
      ))}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", bottom: dy ? 240 : 46, ...side(infoX), color: WHITE, opacity: 0.9 }} />

      {/* Grain over everything, like the print. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 95% at 50% 45%, transparent 62%, rgba(0,0,0,.22) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
