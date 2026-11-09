/* eslint-disable @next/next/no-img-element */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, type Box } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Anton advance widths (per 100px), measured in the browser: giant words are fitted, not guessed. */
export const ANTON: Record<string, number> = { A: 48.5, B: 47.9, C: 47.4, D: 49.3, E: 41.2, F: 39.9, G: 48.5, H: 49.9, I: 22.7, J: 46.6, K: 47.2, L: 39.7, M: 74.6, N: 49.8, O: 48.6, P: 47.2, Q: 49.4, R: 47.7, S: 46.1, T: 39.6, U: 47.4, V: 46.9, W: 71.2, X: 48.4, Y: 44.6, Z: 41, "!": 22.9, "'": 21.4, "-": 31.1, "–": 31.1, " ": 23.4, "1": 33.1, ":": 22 };
export const em = (text: string, table: Record<string, number>, digit: number) => [...text].reduce((a, c) => a + (table[c] ?? (/\d/.test(c) ? digit : 48)), 0) / 100;


/**
 * Where a standing player goes: hair at `headTop`, feet on `floor` for a full-body photo, or — for a tighter
 * framing / a photo cut at the legs — scaled up so the crop line lands on the bottom edge. The face is
 * never drawn bigger than the photo allows (`maxFace`, and ~2× the detected face pixels).
 */
export function standing(
  data: RenderData,
  o: { cx: number; headTop: number; floor: number; maxFace?: number; framing?: string },
): Box & { feet: boolean; faceCx: number; faceTop: number; faceH: number } {
  const p = data.params;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  const framing = o.framing ?? p.framing ?? "full";
  const depth: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  let h: number;
  let top: number;
  let feet = false;
  if (!cutBottom && framing === "full") {
    h = (o.floor - o.headTop) / (1 - hair);
    top = o.headTop - hair * h;
    feet = true;
  } else {
    const crop = Math.min(1, depth[framing] ? face[1] + face[3] * depth[framing] : 1);
    const bottom = crop >= 1 && cutBottom ? 1372 : 1350;
    h = (bottom - o.headTop) / Math.max(0.2, crop - hair);
    top = o.headTop - hair * h;
  }
  // Face size cap: the photo's own resolution (export is 2×) and the look's own limit.
  const cap = Math.min(o.maxFace ?? 400, data.facePx > 0 ? data.facePx * 2.1 : 400);
  const edge = (y: number) => (feet ? y + h : 1350);
  const resize = (nh: number) => {
    const b = edge(top);
    const frac = (b - top) / h;
    top = b - frac * nh;
    h = nh;
  };
  if (h * face[3] > cap) resize(cap / face[3]);
  if ((p.playerScale ?? 1) !== 1) resize(h * (p.playerScale ?? 1));
  const w = h * aspect;
  const fx = data.face ? face[0] + face[2] / 2 : 0.5;
  const left = o.cx - fx * w + (p.playerX ?? 0);
  top += p.playerY ?? 0;
  return { left, top, width: w, height: h, feet, faceCx: left + (face[0] + face[2] / 2) * w, faceTop: top + face[1] * h, faceH: face[3] * h };
}

/** Takes the shout out of a club colour (mixes it towards its own grey), so its tints read as sky, not neon. */
function calm(hex: string, amount = 0.3): string {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const y = 0.3 * r + 0.59 * g + 0.11 * b;
  return "#" + [r, g, b].map((v) => Math.round(v + (y - v) * amount).toString(16).padStart(2, "0")).join("");
}

const DAYS: Record<string, string> = { MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY" };

/** "SAT 10 OCT" → "SATURDAY, OCT. 10" (the college way of writing a game date). */
function longDate(d: string): string {
  const m = d.toUpperCase().match(/^(?:[A-Z]{3}\s+)?(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[2]}. ${m[1]}` : d.toUpperCase();
}

/** The kicker as one tall word ("GAMEDAY") or two balanced lines ("NEW" / "SIGNING"). */
function wordLines(kicker: string): string[] {
  const k = kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "");
  const joined = k.replace(/\s+/g, "");
  if (/DAY$/.test(joined) && joined.length <= 9) return [joined];
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words;
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/**
 * Airy college gameday (UNC "GAMEDAY", Josh Downs): a pale sky of the club colour fading to white, two crests
 * with an italic "vs" and a spaced date line on top, one gigantic tall word behind the player that dissolves
 * from solid to nothing, and the player standing small on a misty floor with his name in italic serif by
 * his head. Everything in tints of the club colour, so dark clubs stay light too.
 */
export function Mist({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 31);
  let c = calm(vivid(params.primary === "#10131c" ? params.accent : params.primary));
  if (luminance(c) > 0.8) c = calm(vivid(params.accent));
  const sky = shade(c, 0.8);
  const word = shade(c, 0.42);
  const navy = luminance(c) > 0.5 ? shade(c, -0.78) : shade(c, -0.62);
  const left = params.side === "left";

  // ---- Top: crests and the date line ------------------------------------------------------------
  const score = content.homeGoals != null && String(content.homeGoals) !== "" ? `${content.homeGoals} – ${content.awayGoals}` : "";
  const competition = (content.subline.split("·")[0] ?? "").trim().toUpperCase();
  const club = data.toClub ?? data.club;
  let crests: (string | null | undefined)[] = [];
  let between = "vs";
  let info: string[] = [];
  if (postType === "matchday" || postType === "result") {
    crests = [content.homeCrest ?? data.club?.crestUrl, content.awayCrest];
    between = postType === "result" && score ? score : "vs";
    info = postType === "result" ? ["FULL TIME", competition] : [content.date ? longDate(content.date) : "", content.time ?? "", competition];
  } else if (postType === "transfer") {
    crests = data.fromClub ? [data.fromClub.crestUrl, club?.crestUrl] : [club?.crestUrl];
    between = "to";
    info = [club?.name?.toUpperCase() ?? "", competition];
  } else if (postType === "renewal") {
    crests = [club?.crestUrl];
    info = [club?.name?.toUpperCase() ?? "", content.until ? `UNTIL ${content.until}` : ""];
  } else {
    crests = [club?.crestUrl];
    const month = content.subline.toUpperCase();
    info = [month, ...content.stats.filter((s) => /goal|assist/i.test(s.label) && s.value !== "0").map((s) => `${s.value} ${s.label.toUpperCase()}`)];
  }
  const shown = crests.filter(Boolean) as string[];
  const infoText = info.filter(Boolean).join("  ·  ");
  const infoSize = Math.min(27, 960 / Math.max(10, infoText.length * 0.62));

  // ---- The giant fading word --------------------------------------------------------------------
  const lines = wordLines(content.kicker);
  const X0 = 40;
  const W = CANVAS_W - 2 * X0;
  const wordTop = 262;
  const areaH = 800;
  const gap = 20;
  const capMax = lines.length === 1 ? areaH : (areaH - gap) / 2;
  const squeezeMin = lines.length === 1 ? 0.36 : 0.46;
  const cap = Math.min(capMax, ...lines.map((l) => (W / squeezeMin / em(l, ANTON, 49.4)) * 0.86));
  const fontSize = cap / 0.86;
  const blockH = lines.length * cap + (lines.length - 1) * gap;
  const lineW = lines.map((l) => Math.min(W, (em(l, ANTON, 49.4) / 0.86) * cap * 1.1));

  // ---- The player -------------------------------------------------------------------------------
  const cx = 540 + (left ? -1 : 1) * (30 + r() * 30);
  const floor = 1196;
  const box = standing(data, { cx, headTop: 450, floor, maxFace: 120, framing: "full" });
  const feet = box.feet;
  const fxFrac = (box.faceCx - box.left) / box.width;

  // Name in italic serif beside the head: clear of the whole photo (raised arms included) when there is room,
  // on the side where the photo leaves the most space.
  const clear = box.faceH * 1.75;
  const edgeL = Math.min(box.faceCx - clear, box.left - 24);
  const edgeR = Math.max(box.faceCx + clear, box.left + box.width + 24);
  const roomL = edgeL - 50;
  const roomR = CANVAS_W - edgeR - 50;
  const outL = roomL >= 280;
  const outR = roomR >= 280;
  const nameLeft = outL !== outR ? outL : outL ? roomL >= roomR : box.faceCx >= CANVAS_W / 2;
  const anchorL = outL ? edgeL : box.faceCx - clear;
  const anchorR = outR ? edgeR : box.faceCx + clear;
  const room = nameLeft ? anchorL - 56 : CANVAS_W - anchorR - 56;
  // Names typed all in lower case still get their capitals in the serif.
  const cap1 = (t: string) => (t === t.toLowerCase() ? t.replace(/(^|\s)(\p{L})/gu, (m) => m.toUpperCase()) : t);
  const first = cap1(content.firstName);
  const last = cap1(content.lastName || content.firstName);
  const nameSize = Math.max(40, Math.min(92, room / Math.max(3, last.length * 0.5)));
  const nameY = box.faceTop + box.faceH * 0.5;

  const bottomLogos = (
    <>
      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ height: 46, width: 46, objectFit: "contain" }} />}
      {data.club?.crestUrl && (data.agency.logoUrl || data.agency.name) && <div style={{ width: 1.5, height: 30, background: navy, opacity: 0.35 }} />}
      <AgencyLogo data={data} height={22} onLight style={{ color: navy }} />
    </>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${sky} 0%, ${shade(c, 0.87)} 38%, #ffffff 82%)` }} />
      {/* A soft bright bloom behind the player, like the sun through haze. */}
      <div style={{ position: "absolute", left: cx - 520, top: 380, width: 1040, height: 900, background: "radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,0))" }} />

      {/* The word, solid at the top and dissolving into the mist. data-bleed: it is fitted inside the canvas by
          textLength, but a text Range reports its natural width, so the layout checker would call it cut. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="mist-fade" x1="0" y1={wordTop} x2="0" y2={wordTop + blockH} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={word} stopOpacity={1} />
            <stop offset="0.45" stopColor={word} stopOpacity={0.75} />
            <stop offset="0.8" stopColor={word} stopOpacity={0.18} />
            <stop offset="1" stopColor={word} stopOpacity={0} />
          </linearGradient>
        </defs>
        {lines.map((l, i) => (
          <text
            key={i}
            x={X0 + (W - lineW[i]) / 2}
            y={wordTop + cap * (i + 1) + gap * i}
            textLength={lineW[i]}
            lengthAdjust="spacingAndGlyphs"
            fill="url(#mist-fade)"
            style={{ fontFamily: DISPLAY, fontSize }}
          >
            {l}
          </text>
        ))}
      </svg>

      {/* Crests with the italic "vs", and the spaced date line. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 62, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
        {shown.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 30 }}>
            {i > 0 && <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: between.length > 3 ? 58 : 50, color: navy, lineHeight: 1 }}>{between}</span>}
            <img src={s} alt="" style={{ width: 96, height: 96, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(20,40,80,.18))" }} />
          </div>
        ))}
      </div>
      {infoText && (
        <div style={{ position: "absolute", left: 40, right: 40, top: 190, textAlign: "center", fontFamily: CONDENSED, fontWeight: 700, fontSize: infoSize, letterSpacing: "0.2em", color: navy, whiteSpace: "nowrap" }}>
          {infoText}
        </div>
      )}

      {/* Misty floor: soft contact shadow, haze behind and in front of the feet. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: floor - 260, height: 520, background: "radial-gradient(60% 50% at 50% 50%, rgba(255,255,255,.95), rgba(255,255,255,0))" }} />
      {data.photoUrl && feet && (
        <div
          style={{
            position: "absolute",
            left: box.left + box.width * (fxFrac - 0.36),
            top: box.top + box.height - 22,
            width: box.width * 0.72,
            height: 40,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${navy}66, ${navy}22 60%, transparent)`,
            filter: "blur(8px)",
          }}
        />
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(.96) brightness(1.03)", ...cutMask(data.cut) }}
        />
      )}
      {/* Wisps of mist drifting in front of the legs. */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -200 + r() * 500 + i * 180,
            top: floor - 170 + i * 70 + r() * 30,
            width: 700 + r() * 300,
            height: 70 + r() * 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,.4)",
            filter: "blur(26px)",
          }}
        />
      ))}
      {/* Haze drifting over the boots, and the fog bank the whole scene settles into. */}
      <div style={{ position: "absolute", left: -100, right: -100, top: floor - 70, height: 150, background: "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,.75), rgba(255,255,255,0))", filter: "blur(6px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: feet ? 190 : 330, background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,.92) 70%, #fff)" }} />

      {/* His name, in italic serif, next to his head. */}
      <div
        style={{
          position: "absolute",
          [nameLeft ? "right" : "left"]: nameLeft ? CANVAS_W - anchorL : anchorR,
          top: nameY,
          transform: "translateY(-50%)",
          textAlign: nameLeft ? "right" : "left",
          color: navy,
          fontFamily: DMSERIF,
          fontStyle: "italic",
          lineHeight: 0.95,
          whiteSpace: "nowrap",
        }}
      >
        {first && last !== first && <div style={{ fontSize: nameSize * 0.55 }}>{first}</div>}
        <div style={{ fontSize: nameSize }}>{last}</div>
        {data.player.number && (
          <div style={{ marginTop: 12, fontFamily: CONDENSED, fontStyle: "normal", fontWeight: 700, fontSize: 20, letterSpacing: "0.3em", opacity: 0.8 }}>NO. {data.player.number}</div>
        )}
      </div>

      {feet ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>{bottomLogos}</div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 48, bottom: 44, display: "flex", alignItems: "center", gap: 16 }}>{bottomLogos}</div>
        </>
      )}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
