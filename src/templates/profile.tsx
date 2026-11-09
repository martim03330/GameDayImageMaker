/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { ANTON, em } from "./mist";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { photoOval, portraitBox } from "./versus";
import { clubColour } from "./wall";

const WHITE = "#f6f3ee";
const PAPER = "#ebe7df";
const INK = "#141414";

/** Worn print: small holes and scuffs knocked out of the big letters. */
const WORN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 0 0 0 12.2'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`,
)}")`;

/** Fine grit: pale and dark specks over everything (the gritty printed-poster finish). */
const GRIT = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

const GENERIC = /^(F\.?C\.?|S\.?C\.?|C\.?F\.?|A\.?F\.?C\.?|C\.?D\.?|U\.?D\.?|S\.?A\.?D\.?|CLUBE|CLUB|FUTEBOL|FOOTBALL|FUTBOL)$/;

/** "Birkirkara FC" → "BIRKIRKARA": the club as a supporter says it. */
function shortName(name: string): string {
  const words = name.toUpperCase().split(/\s+/).filter(Boolean);
  const kept = words.filter((w) => !GENERIC.test(w));
  return (kept.length ? kept : words).join(" ");
}


/** One team name as big as `width` allows (two lines when a long name would get too small). */
function fitName(name: string, width: number, max: number): { lines: string[]; size: number } {
  const one = Math.min(max, width / Math.max(0.5, em(name, ANTON, 0.46)));
  const words = name.split(" ");
  if (one >= max * 0.62 || words.length < 2) return { lines: [name], size: one };
  let best = { lines: [name], size: one };
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const size = Math.min(max * 0.8, ...lines.map((l) => width / Math.max(0.5, em(l, ANTON, 0.46))));
    if (size > best.size * 1.25) best = { lines, size };
  }
  return best;
}

/**
 * Crest as a white mark: everything with colour or ink turns solid white, white areas drop out (so a crest
 * printed on a white square still reads as a mark, not a white tile).
 */
export function CrestMarkDefs({ id, color = "#ffffff" }: { id: string; color?: string }) {
  const h = color.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  -0.84 -1.65 -0.31 0 2.75`} result="mark" />
        <feComposite in="mark" in2="SourceAlpha" operator="in" />
      </filter>
    </svg>
  );
}

/** Jagged torn edge through the given points, as SVG path commands (small random steps). */
function tornPath(pts: [number, number][], seed: number, amp: number): string {
  const r = rng(seed);
  let d = "";
  for (let s = 0; s < pts.length - 1; s++) {
    const [x0, y0] = pts[s];
    const [x1, y1] = pts[s + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / 9));
    const [nx, ny] = [-(y1 - y0) / len, (x1 - x0) / len];
    for (let i = s ? 1 : 0; i <= n; i++) {
      const t = i / n;
      const k = (r() - 0.5) * 2 * amp * (r() < 0.1 ? 2.2 : 1);
      d += `${d ? "L" : "M"}${(x0 + (x1 - x0) * t + nx * k).toFixed(1)} ${(y0 + (y1 - y0) * t + ny * k).toFixed(1)}`;
    }
  }
  return d;
}

/**
 * Gritty matchday poster (United v RB Leipzig): a red grunge club-colour wall with torn white paper at two
 * corners; left, stacked and left-aligned, our name huge in worn condensed white, a black bar with "VS"
 * (the score after the game), the opponent below and both crests as white marks; the date and kick-off in
 * spaced caps on the torn paper at the foot, the competition on the paper up in the corner. The player
 * is big, waist-up on the other side, his face in gritty black and white while the kit keeps its colour.
 */
export function Profile({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 12;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);
  const ts = params.textScale ?? 1;

  let red = clubColour(data);
  for (let i = 0; i < 6 && luminance(red) > 0.3; i++) red = shade(red, -0.12);
  // A black club: a charcoal wall, so the black bar and a dark kit still stand off it.
  if (luminance(red) < 0.03) red = shade(red, 0.2);
  const deep = shade(red, -0.45);

  // ---- words ----
  const md = matchFacts(data);
  const score = postType === "result" || postType === "potm" ? scoreOf(data, " - ") : "";
  const ours = shortName(data.club?.name ?? "");
  const c = data.content;
  const homeName = shortName(c.homeTeam || ours);
  const awayName = shortName(c.awayTeam || md.opp);
  const teams = c.homeTeam && c.awayTeam ? [homeName, awayName] : [ours || homeName, md.opp ? shortName(md.opp) : awayName].filter(Boolean);
  const player = [content.firstName, content.lastName].filter(Boolean).map((s) => s.toUpperCase());
  const potm = postType === "potm";
  const top = potm ? (player.length > 1 ? player[0] : "") : teams[0] ?? "";
  const bottom = potm ? player[player.length - 1] ?? "" : teams[1] ?? "";
  const bar = potm ? content.kicker.toUpperCase() || "PLAYER OF THE MATCH" : score || "VS";
  const kicker = potm ? "" : content.kicker.toUpperCase();

  // ---- text column ----
  const colX = 88;
  const colW = 452;
  const topFit = top ? fitName(top, colW, 230 * ts) : { lines: [], size: 0 };
  const botFit = bottom ? fitName(bottom, colW, (top ? 150 : 200) * ts) : { lines: [], size: 0 };
  const barH = potm ? Math.max(70, Math.min(92, colW / Math.max(1, bar.length * 0.46)) * 1.15) : 96;
  const barSize = potm ? Math.min(62, (colW - 50) / Math.max(1, em(bar, ANTON, 0.46))) : Math.min(78, (colW - 60) / Math.max(1, em(bar, ANTON, 0.46)));
  const pitch = 0.98;
  const topH = topFit.lines.length * topFit.size * pitch;
  const botH = botFit.lines.length * botFit.size * pitch;
  const gap = 22;
  const crests = potm ? [data.club?.crestUrl].filter(Boolean) as string[] : crestsOf(data);
  const crestS = 100;
  const blockH = (kicker ? 50 : 0) + topH + (topH ? gap : 0) + barH + gap + botH + (crests.length ? 44 + crestS : 0);
  const blockTop = Math.max(250, Math.min(360, 640 - blockH / 2)) + (r() - 0.5) * 20;

  let y = blockTop;
  const kickY = y;
  if (kicker) y += 50;
  const topY = y;
  y += topH + (topH ? gap : 0);
  const barY = y;
  y += barH + gap;
  const botY = y;
  y += botH + 44;
  const crestY = y;

  // ---- the player: big, waist-up, face to the page's edge ----
  const faceX = X(778 + (r() - 0.5) * 30);
  const placed = portraitBox(data, faceX, 250 + (r() - 0.5) * 30, { chest: 270, waist: 230, knees: 195, full: 165 }, 1.5);
  // A short bust drops a little, so less of the page is left under it.
  const ends = data.photoIsCutout ? placed.top + placed.height * ((data.cut?.bottom ?? 0) > 0 ? 0.87 : 1) : placed.faceTop + placed.faceH * 2.7;
  const drop = Math.max(0, Math.min(160, 1200 - ends));
  const fig = { ...placed, top: placed.top + drop, faceTop: placed.faceTop + drop };
  const neck0 = ((fig.faceTop + fig.faceH * 1.2 - fig.top) / fig.height) * 100;
  const neck1 = ((fig.faceTop + fig.faceH * 1.75 - fig.top) / fig.height) * 100;
  const headMask = `linear-gradient(to bottom, #000 ${neck0.toFixed(1)}%, transparent ${neck1.toFixed(1)}%)`;
  const shape = data.photoUrl ? ({ WebkitMaskImage: `url("${data.photoUrl}")`, maskImage: `url("${data.photoUrl}")`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" } as CSSProperties) : {};
  const figMask = data.photoIsCutout ? cutMask(data.cut) : photoOval(fig);

  // ---- torn paper corners ----
  const tr = tornPath(
    [
      [X(150 + r() * 60), -20],
      [X(470), 30 + r() * 30],
      [X(820), 130 + r() * 40],
      [X(1100), 215 + r() * 30],
    ],
    seed + 3,
    5,
  );
  const trPath = `${tr}L${X(1100)} -20Z`;
  // A short bust (cut at the chest) would end in mid-air: the lower sheet then tears right across the page
  // and tucks the cut under it, like a poster pasted over the photo.
  const cutB = data.photoIsCutout && (data.cut?.bottom ?? 0) > 0;
  const figEnd = data.photoIsCutout ? fig.top + fig.height * (cutB ? 0.87 : 1) : fig.faceTop + fig.faceH * 2.7;
  const tuck = !!data.photoUrl && figEnd < 1290;
  const edgeY = Math.min(1150, figEnd - 16);
  // ---- foot of the page: date / kick-off (or the numbers of his game) ----
  const facts = shortFacts(data, 3);
  const foot: string[] = potm
    ? [facts.map((f) => `${f.value} ${f.label}`.toUpperCase()).join(" · ") || md.longDate, [teams.length === 2 && score ? `${teams[0]} ${score} ${teams[1]}` : "", !facts.length ? "" : md.longDate].filter(Boolean).join(" · ")]
    : postType === "result"
      ? [md.longDate || "FULL TIME", md.venue]
      : [md.longDate, md.time ? `KICK-OFF ${md.time}` : "", md.venue];
  const footLines = foot.filter(Boolean).slice(0, 3);
  const footSize = (t: string, i: number) => Math.min(i === 0 ? 38 : 30, 470 / Math.max(1, [...t].length * 0.62));
  // The sheet always reaches above the date block (and past its longest line).
  const footTop = CANVAS_H - 58 - footLines.reduce((a, t, i) => a + footSize(t, i) * 1.3, 0);
  const footRight = colX + Math.max(0, ...footLines.map((t, i) => [...t].length * footSize(t, i) * 0.72));
  const room = (pts: [number, number][]): [number, number][] => pts.map(([x, y]) => [X(x), x <= footRight + 70 ? Math.min(y, footTop - 30) : y]);
  const bl = tornPath(
    room(
      tuck
        ? [
            [-20, Math.max(1010, edgeY + 110) + r() * 20],
            [430, Math.max(990, edgeY + 50)],
            [760, edgeY + 5],
            [1100, edgeY - 30 - r() * 30],
          ]
        : [
            [-20, 1000 + r() * 30],
            [260, 1085 + r() * 25],
            [560, 1210 + r() * 30],
            [820 + r() * 50, 1370],
          ],
    ),
    seed + 7,
    5,
  );
  const blPath = tuck ? `${bl}L${X(1100)} 1370L${X(-20)} 1370Z` : `${bl}L${X(-20)} 1370Z`;

  const comp = [md.comp, md.round].filter(Boolean);

  const side: CSSProperties = flip ? { right: colX, textAlign: "right" } : { left: colX, textAlign: "left" };
  const big: CSSProperties = { fontFamily: DISPLAY, color: WHITE, lineHeight: pitch, whiteSpace: "nowrap", textTransform: "uppercase", WebkitMaskImage: WORN, maskImage: WORN, WebkitMaskSize: "360px 360px", maskSize: "360px 360px" };

  // A wide pose (a kick, arms out) never reaches into the text column: it dissolves just before it.
  const edge = colX + colW + 14;
  const fadeTo = `linear-gradient(${flip ? "to left" : "to right"}, transparent ${edge}px, #000 ${edge + 120}px)`;
  const clear: CSSProperties = { WebkitMaskImage: fadeTo, maskImage: fadeTo };

  const sheet = (d: string, dir: number) => (
    <>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 ${dir * 3}px 6px rgba(0,0,0,.3))` }}>
        <g filter="url(#profile-rough)">
          <path d={d} fill="#ffffff" transform={`translate(${(flip ? 5 : -5) * dir} ${8 * dir})`} />
          <path d={d} fill={PAPER} />
        </g>
      </svg>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.1 }}>
        <clipPath id={`profile-sheet${dir}`}>
          <path d={d} />
        </clipPath>
        <rect width={CANVAS_W} height={CANVAS_H} fill="#7a6a58" filter="url(#profile-paper)" clipPath={`url(#profile-sheet${dir})`} />
      </svg>
    </>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: red }}>
      <CrestMarkDefs id="profile-mono" />
      {/* The grunge wall: soft blotches, dry-brush streaks and a darker rim. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="profile-blotch" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.006" numOctaves={4} seed={seed} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -1.15" />
          </filter>
          <filter id="profile-streak" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.007 0.022" numOctaves={4} seed={seed + 5} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.5 0 0 0 -2.6" />
          </filter>
          <filter id="profile-speck" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves={2} seed={seed + 11} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -5.6" />
          </filter>
          <filter id="profile-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={seed + 2} />
            <feDisplacementMap in="SourceGraphic" scale={9} />
          </filter>
          <filter id="profile-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={seed + 9} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1" />
          </filter>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} fill={deep} filter="url(#profile-blotch)" opacity={0.35} />
        <rect width={CANVAS_W} height={CANVAS_H} fill={deep} filter="url(#profile-streak)" opacity={0.3} />
        <rect width={CANVAS_W} height={CANVAS_H} fill={deep} filter="url(#profile-speck)" opacity={0.35} />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(110% 85% at ${flip ? 60 : 40}% 45%, transparent 50%, ${deep}99 100%)` }} />

      {/* Torn paper: the white fibre edge under the off-white sheet. */}
      {sheet(trPath, 1)}
      {!tuck && sheet(blPath, -1)}

      {/* Competition, up on the paper. */}
      {comp.length > 0 && (
        <div style={{ position: "absolute", top: 46, [flip ? "left" : "right"]: 60, width: 250, textAlign: "center", color: INK }}>
          {comp.map((t, i) => (
            <div key={i} style={{ fontFamily: CONDENSED, fontWeight: i ? 600 : 800, fontSize: Math.min(i ? 17 : 22, 250 / Math.max(1, [...t].length * 0.6)), letterSpacing: "0.12em", lineHeight: 1.25, whiteSpace: "nowrap", opacity: i ? 0.7 : 1 }}>
              {t}
            </div>
          ))}
        </div>
      )}

      {/* The player: colour kit, black-and-white face. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(${flip ? 18 : -18}px 20px 36px rgba(0,0,0,.35))`, ...clear }}>
          <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, ...figMask }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", filter: "contrast(1.18) saturate(1.12) brightness(.96)" }} />
            <img src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", filter: "grayscale(1) contrast(1.32) brightness(.98)", WebkitMaskImage: headMask, maskImage: headMask }} />
            <div style={{ position: "absolute", inset: 0, ...shape, backgroundImage: GRIT, mixBlendMode: "overlay", opacity: 0.55 }} />
          </div>
        </div>
      )}

      {tuck && sheet(blPath, -1)}

      {/* The stacked title. */}
      {kicker && (
        <div style={{ position: "absolute", top: kickY, ...side, fontFamily: CONDENSED, fontWeight: 700, fontSize: Math.min(26, colW / Math.max(1, kicker.length * 0.78)), letterSpacing: "0.3em", color: WHITE, whiteSpace: "nowrap" }}>{kicker}</div>
      )}
      {topFit.lines.length > 0 && (
        <div style={{ position: "absolute", top: topY, ...side, ...big, fontSize: topFit.size }}>
          {topFit.lines.map((l, i) => (
            <div key={i} style={{ height: topFit.size * pitch }}>{l}</div>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", top: barY, [flip ? "right" : "left"]: colX, width: colW, height: barH, background: INK, display: "flex", alignItems: "center", justifyContent: "center", WebkitMaskImage: WORN, maskImage: WORN, WebkitMaskSize: "520px 520px", maskSize: "520px 520px" }}>
        <span style={{ fontFamily: DISPLAY, fontSize: barSize, color: WHITE, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: potm ? "0.04em" : "0.02em" }}>{bar}</span>
      </div>
      {botFit.lines.length > 0 && (
        <div style={{ position: "absolute", top: botY, ...side, ...big, fontSize: botFit.size }}>
          {botFit.lines.map((l, i) => (
            <div key={i} style={{ height: botFit.size * pitch }}>{l}</div>
          ))}
        </div>
      )}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: crestY, [flip ? "right" : "left"]: colX, display: "flex", gap: 30 }}>
          {crests.map((s, i) => (
            <img key={i} src={s} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: "url(#profile-mono)", opacity: 0.95 }} />
          ))}
        </div>
      )}

      {/* Date and kick-off on the torn paper. */}
      <div style={{ position: "absolute", bottom: 58, ...side, color: INK }}>
        {footLines.map((t, i) => (
          <div key={i} style={{ fontFamily: CONDENSED, fontWeight: i === 0 ? 700 : 500, fontSize: footSize(t, i), letterSpacing: "0.16em", lineHeight: 1.3, whiteSpace: "nowrap" }}>
            {t}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", top: 52, [flip ? "right" : "left"]: colX, opacity: 0.85, color: WHITE }} />

      <div data-bleed style={{ position: "absolute", inset: 0, backgroundImage: GRIT, mixBlendMode: "overlay", opacity: 0.3, pointerEvents: "none" }} />
    </div>
  );
}
