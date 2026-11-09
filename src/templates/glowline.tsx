/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { lift, YEAR } from "./column";
import { DMSERIF } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, SERIF } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { MonoDefs } from "./wall";

const CREAM = "#f3eee3";

/** DM Serif Display: average capital advance per 1px of font size (measured: "MATCHDAY" = 5.0em). */
const DM_CAP = 0.63;
/** DM Serif Display cap height, relative to the font size. */
const DM_H = 0.66;
/** The most the serif is squeezed: past this it stops reading as the same face. */
const MIN_SQUEEZE = 0.6;

const MONTH_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

const widthOf = (t: string) => [...t].reduce((a, c) => a + (c === " " ? 0.26 : /[IJ1]/.test(c) ? 0.36 : /[MW]/.test(c) ? 0.86 : DM_CAP), 0);

/** The title in one line, or two when one would squeeze the serif too hard. */
function titleLines(kicker: string, measure: number, cap: number): { lines: string[]; size: number } {
  const k = kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").trim() || "MATCHDAY";
  const size = cap / DM_H;
  const joined = /DAY$/.test(k.replace(/\s+/g, "")) && k.replace(/\s+/g, "").length <= 9 ? k.replace(/\s+/g, "") : k;
  const words = joined.split(/\s+/);
  if (widthOf(joined) * size * MIN_SQUEEZE <= measure || words.length === 1) return { lines: [joined], size: Math.min(size, measure / (widthOf(joined) * MIN_SQUEEZE)) };
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(widthOf(words.slice(0, i).join(" ")) - widthOf(words.slice(i).join(" ")));
    if (d < diff) [diff, best] = [d, i];
  }
  const lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  const s2 = Math.min(size * 0.72, measure / (Math.max(...lines.map(widthOf)) * MIN_SQUEEZE));
  return { lines, size: s2 };
}

/** "SAT 10 OCT" → ["10", "10", "26"] (the fixture's own year when known). */
function stackedDate(data: RenderData): string[] {
  const m = (data.content.date ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m || !MONTH_NO[m[2]]) return [];
  const mm = MONTH_NO[m[2]];
  const dd = m[1].padStart(2, "0");
  const fx = data.fixtures?.find((f) => f.date.slice(5) === `${mm}-${dd}`);
  const yy = (fx ? fx.date.slice(2, 4) : String(YEAR).slice(2)) || "";
  return [dd, mm, yy];
}

/**
 * Düsseldorf v Bochum "MATCHDAY": a deep, very clean vignette in the club's darkest tone; small italic
 * spaced caps for the kick-off at the top, one elegant high-contrast serif word across, the two crests as
 * white monochrome marks under its left end and the fixture in serif caps under its right end; the player
 * standing whole and fairly small in the middle with a soft white glow hugging his outline and a faint
 * shadow at his feet; at the foot the competition, the ground in serif caps, the coordinates and the
 * date stacked "27 / 02 / 26".
 */
export function Glowline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 45);
  const flip = params.side === "left";

  // ---- colour: the club's deepest tone, teal-ish clubs stay teal, black clubs go graphite-blue ----
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.75 || hueOf(club) == null) club = hueOf(vivid(params.accent)) != null && luminance(vivid(params.accent)) < 0.75 ? vivid(params.accent) : "#1f4f63";
  const mid = shade(club, luminance(club) > 0.3 ? -0.72 : luminance(club) > 0.1 ? -0.6 : -0.4);
  const deep = shade(mid, -0.62);
  const glowTint = shade(club, 0.75);

  // ---- the title ----
  const measure = 800 * (params.textScale ?? 1);
  const { lines, size } = titleLines(content.kicker, measure, 158);
  const capH = size * DM_H;
  const kickY = 132;
  const firstBase = 228 + capH;
  const pitch = capH + size * 0.2;
  const lastBase = firstBase + (lines.length - 1) * pitch;
  const titleW = Math.max(...lines.map((l) => Math.min(measure, widthOf(l) * size)));
  const tLeft = 540 - titleW / 2;
  const tRight = 540 + titleW / 2;

  // ---- facts ----
  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const club0 = data.toClub ?? data.club;
  let top = "";
  let fixture = "";
  let crests: string[] = [];
  let footL: string[] = [];
  let footC = "";
  if (postType === "matchday") {
    top = f.time ? `KICK OFF ${f.time}` : f.date ? f.date : "";
    fixture = home && away ? `${home} vs ${away}` : f.opp ? `vs ${f.opp}` : "";
    crests = [content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest), content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest)].filter(Boolean) as string[];
    footL = [f.comp, f.round].filter(Boolean);
    footC = f.venue;
  } else if (postType === "result") {
    top = "FULL TIME";
    fixture = home && away ? (score ? `${home} ${score} ${away}` : `${home} vs ${away}`) : name;
    crests = [content.homeCrest, content.awayCrest].filter(Boolean) as string[];
    if (!crests.length && data.club?.crestUrl) crests = [data.club.crestUrl];
    footL = [f.comp, f.round].filter(Boolean);
    footC = f.venue;
  } else if (postType === "renewal") {
    top = content.until ? `UNTIL ${content.until}` : (club0?.name ?? "").toUpperCase();
    fixture = name;
    crests = [club0?.crestUrl].filter(Boolean) as string[];
    footL = [(club0?.name ?? "").toUpperCase(), data.player.position.toUpperCase()].filter(Boolean);
    footC = content.until ? `CONTRACT UNTIL ${content.until}` : "";
  } else {
    top = content.subline.toUpperCase();
    fixture = name;
    crests = [club0?.crestUrl].filter(Boolean) as string[];
    footL = [(club0?.name ?? "").toUpperCase(), data.player.position.toUpperCase()].filter(Boolean);
    footC = shortFacts(data, 3)
      .map((s) => `${s.value} ${s.label}`)
      .join("  ·  ")
      .toUpperCase();
  }
  const date = postType === "matchday" || postType === "result" ? stackedDate(data) : [];
  const right = date.length ? date : data.player.number ? [data.player.number] : [];
  const coords = postType === "matchday" && content.home !== false ? (data.club?.coords ?? "").match(/[\d.]+/g)?.slice(0, 2).join(" / ") ?? "" : "";

  // ---- the player: whole, fairly small, centred ----
  const rowTop = lastBase + 26;
  const headTop = Math.max(rowTop + 6, 392) + r() * 14;
  const floor = 1152 - r() * 10;
  const raw0 = standing(data, { cx: 540 + (flip ? -1 : 1) * r() * 16, headTop, floor, maxFace: 120, framing: "full" });
  // The fixture sits beside the head, never behind it: measure the head (face box + hair + glow) and, when the
  // fixture side is too narrow, slide the player towards the crests (their row ends ~200px in from the title).
  const headHalf = raw0.faceH * 0.62 + 14;
  const roomFor = (cx: number) => (flip ? cx - headHalf - 24 - tLeft : tRight - (cx + headHalf + 24));
  const crestsEnd = flip ? tRight - 200 : tLeft + 200;
  const maxShift = Math.max(0, flip ? crestsEnd - 20 - (raw0.faceCx + headHalf) : raw0.faceCx - headHalf - (crestsEnd + 20));
  const shift = Math.min(maxShift, Math.max(0, 250 - roomFor(raw0.faceCx)));
  const raw = shift ? { ...raw0, left: raw0.left + (flip ? shift : -shift), faceCx: raw0.faceCx + (flip ? shift : -shift) } : raw0;
  const { box, style: fade } = lift(data, raw, headTop + raw.faceH * 0.6);
  const figW = box.width;

  // The fixture only gets the room beside the head: long ones stack on two lines.
  const fixRoom = Math.max(120, roomFor(raw.faceCx));
  const fitFix = (ls: string[]) => Math.min(30, fixRoom / Math.max(1, ...ls.map((l) => widthOf(l) * 1.1 + 0.06 * [...l].length)));
  let fixLines = [fixture];
  if (fitFix(fixLines) < 22) {
    const hg = content.homeGoals ?? "";
    const ag = content.awayGoals ?? "";
    if (postType === "result" && home && away) fixLines = score ? [`${home}  ${hg}`, `${away}  ${ag}`] : [home, `vs ${away}`];
    else if (postType === "matchday" && home && away) fixLines = [home, `vs ${away}`];
    else if (fixture.includes(" ")) {
      const w = fixture.split(" ");
      const m = Math.ceil(w.length / 2);
      fixLines = [w.slice(0, m).join(" "), w.slice(m).join(" ")];
    }
  }
  const fixtureSize = Math.max(13, fitFix(fixLines));
  const small: CSSProperties = { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, color: CREAM, letterSpacing: "0.3em", whiteSpace: "nowrap" };
  const caps: CSSProperties = { fontFamily: DMSERIF, color: CREAM, letterSpacing: "0.06em", whiteSpace: "nowrap", lineHeight: 1.15 };
  // Serif caps with tracking: width ≈ the letters plus the letter-spacing on each.
  const fitCaps = (t: string, room: number, max: number, track = 0.06) => Math.min(max, room / Math.max(1, widthOf(t) * 1.12 + track * [...t].length));
  // The competition (Fraunces caps, wide tracking) breaks onto two lines rather than shrink below 12px.
  const footLines = footL.slice(0, 2).flatMap((t, i) => {
    const s0 = i ? 13 : 16;
    if ((fitCaps(t, 250, s0, 0.22) >= 12 && i === 0) || !t.includes(" ") || i > 0) return [[t, i] as const];
    const w = t.split(" ");
    let best = 1;
    for (let k = 1; k < w.length; k++) if (Math.abs(w.slice(0, k).join(" ").length - w.slice(k).join(" ").length) < Math.abs(w.slice(0, best).join(" ").length - w.slice(best).join(" ").length)) best = k;
    return [[w.slice(0, best).join(" "), i] as const, [w.slice(best).join(" "), i] as const];
  });

  const crestSize = crests.length > 1 ? 84 : 96;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: deep, color: CREAM }}>
      <MonoDefs id="glowline-mono" ink={0.35} />
      {/* The vignette: lit in the middle behind the player, falling to near black. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at 50% 52%, ${shade(mid, 0.1)} 0%, ${mid} 38%, ${shade(mid, -0.35)} 72%, ${deep} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(34% 26% at 50% 58%, ${shade(club, -0.3)}55, transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.09, mixBlendMode: "overlay" }} />

      {/* Kick-off line. */}
      {top && <div style={{ position: "absolute", left: 0, right: 0, top: kickY - 12, textAlign: "center", ...small, fontSize: Math.min(20, 620 / Math.max(1, top.length * 0.95)) }}>{top}</div>}
      <AgencyLogo data={data} height={48} style={{ position: "absolute", top: kickY - 38, [flip ? "left" : "right"]: 70, maxWidth: 150, opacity: 0.95 }} />

      {/* The serif word, squeezed to its measure by textLength (data-bleed: the layout checker measures the unsqueezed width). */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {lines.map((l, i) => (
          <text
            key={i}
            x={540}
            y={firstBase + i * pitch}
            textAnchor="middle"
            textLength={Math.min(measure, widthOf(l) * size)}
            lengthAdjust="spacingAndGlyphs"
            style={{ fontFamily: DMSERIF, fontSize: size }}
            fill={CREAM}
          >
            {l}
          </text>
        ))}
      </svg>

      {/* Crests under one end, the fixture under the other. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: rowTop, [flip ? "right" : "left"]: flip ? CANVAS_W - tRight : tLeft, display: "flex", gap: 16, flexDirection: flip ? "row-reverse" : "row" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "url(#glowline-mono)", opacity: 0.88 }} />
          ))}
        </div>
      )}
      {fixture && (
        <div style={{ position: "absolute", top: rowTop + (fixLines.length > 1 ? -2 : 4), [flip ? "left" : "right"]: flip ? tLeft : CANVAS_W - tRight, ...caps, fontSize: fixtureSize, textAlign: flip ? "left" : "right" }}>
          {fixLines.map((line, j) => (
            <div key={j}>
              {line.split(/(^vs | vs | – )/).map((p, i) => (
                <span key={i} style={/^ ?(vs|–) $/.test(p) ? { fontFamily: SERIF, fontStyle: "italic", letterSpacing: 0, fontSize: fixtureSize * 0.82, padding: "0 .15em" } : undefined}>
                  {p.trim()}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* The player with his halo. */}
      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", left: box.left + figW * 0.18, width: figW * 0.64, top: floor - 16, height: 34, borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(14px)", opacity: raw.feet ? 1 : 0 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              filter: `drop-shadow(0 0 1.5px rgba(255,255,255,.95)) drop-shadow(0 0 7px ${glowTint}cc) drop-shadow(0 0 22px ${glowTint}66)`,
            }}
          >
            <img
              src={data.photoUrl}
              alt=""
              style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(.92) brightness(.96)", ...fade }}
            />
          </div>
        </>
      )}

      {/* Foot line. */}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 88, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexDirection: flip ? "row-reverse" : "row" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: flip ? "flex-end" : "flex-start", gap: 6, width: 250 }}>
          {footLines.map(([t, i], k) => (
            <div key={k} style={{ ...caps, fontFamily: SERIF, fontWeight: 600, fontSize: Math.max(11, fitCaps(t, 250, i ? 13 : 16, 0.22)), letterSpacing: "0.14em", opacity: i ? 0.7 : 0.95, textAlign: flip ? "right" : "left", marginTop: k && footLines[k - 1][1] === i ? -6 : 0 }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ ...caps, fontSize: fitCaps(footC, 390, 26), textAlign: "center", paddingBottom: 2, flex: 1 }}>{footC}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 36, flexDirection: flip ? "row-reverse" : "row", width: 250, justifyContent: flip ? "flex-start" : "flex-end" }}>
          {coords && <div style={{ ...small, fontStyle: "normal", fontSize: 15, letterSpacing: "0.18em", opacity: 0.8, paddingBottom: 4 }}>{coords}</div>}
          {right.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...caps, fontSize: right.length > 1 ? 36 : 52, lineHeight: 0.92, letterSpacing: "0.02em" }}>
              {right.map((t, i) => (
                <div key={i}>{t}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
