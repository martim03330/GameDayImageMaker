/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { hueOf, shade, vivid } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask } from "./fx";
import { opponentOf, Paper, rng } from "./kit";
import { AgencyLogo, factRows, GROTESK, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const INK = "#17171b";
const PAPER = "#efebe4";

/** "RIGHT WINGER" → "Right Winger": every word capitalised, like the card's small bio. */
const caps = (s: string) =>
  s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

function season(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
}

/** The competition from the subline ("LIGA X · 5TH MATCHDAY · VS Y" → "LIGA X"). */
function competition(data: RenderData): string {
  const first = data.content.subline.split("·")[0]?.trim() ?? "";
  if (!first || /^VS\b/i.test(first) || /GAMES|\d{4}/.test(first)) return "";
  return first;
}

/** A short English bio line from the data (the card's tiny three-line paragraph, every word capitalised). */
function bio(data: RenderData): string {
  const { content, postType, player } = data;
  const club = data.club?.name ?? "";
  const who = `${content.firstName} ${content.lastName}`.trim();
  const pos = player.position ? caps(player.position) : "Footballer";
  const comp = competition(data);
  const opp = opponentOf(data);
  const role = `${who} Is A Professional ${pos}${club ? ` For ${club}` : ""}${comp && postType !== "potm" ? `, Playing In The ${comp.length > 26 ? caps(comp.split(/\s+/).slice(0, 3).join(" ")) : caps(comp)}` : ""}.`;
  const kick = caps(content.kicker);
  switch (postType) {
    case "matchday":
      return `${role} Next Up${opp ? `: ${opp}` : ""}${content.date ? `, ${caps(content.date)}` : ""}${content.time ? ` At ${content.time}` : ""}.`;
    case "result":
    case "goal":
      return `${role} ${kick}${opp ? ` Against ${opp}` : ""}.`;
    case "potm":
      return `${role} ${kick}${content.subline ? `, ${caps(content.subline)}` : ""}.`;
    case "stats":
      return `${role} ${kick} ${content.subline ? `Over The ${caps(content.subline)}` : "This Season"}.`;
    default:
      return `${role} ${kick}.`;
  }
}

/** A hand-drawn oval around a word: two loose strokes that don't quite close (stretched to its box). */
function Oval({ color, seed, stroke = 2.4 }: { color: string; seed: number; stroke?: number }) {
  const r = rng(seed);
  const [cx, cy, rx, ry] = [50, 50, 47, 44];
  const loop = (k: number) => {
    const j = (v: number) => (v + (r() - 0.5) * k).toFixed(1);
    return `M ${j(cx - rx * 0.2)} ${j(cy - ry)} C ${j(cx + rx * 0.9)} ${j(cy - ry * 1.08)}, ${j(cx + rx * 1.06)} ${j(cy + ry * 0.9)}, ${j(cx + rx * 0.1)} ${j(cy + ry)} C ${j(cx - rx * 0.8)} ${j(cy + ry * 1.1)}, ${j(cx - rx * 1.12)} ${j(cy - ry * 0.6)}, ${j(cx - rx * 0.05)} ${j(cy - ry * 1.14)}`;
  };
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", overflow: "visible", transform: `rotate(${(r() - 0.5) * 4}deg)` }}>
      <path d={loop(5)} fill="none" stroke={color} strokeWidth={stroke} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <path d={loop(7)} fill="none" stroke={color} strokeWidth={stroke * 0.6} vectorEffect="non-scaling-stroke" strokeLinecap="round" opacity={0.7} />
    </svg>
  );
}

/**
 * Commanders-style player card ("JAYDEN DANIELS"): off-white paper, big out-of-focus club-colour shapes,
 * a horizontal strip of his other photos (blurred, colour-graded) across the middle, the cutout large in
 * front crossing it; thin detail rows at the top and bottom, a circled word, the first name in an oval
 * over the wide last name, a dashed rule, the club and a tiny bio.
 */
export function Strip({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 11);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // Club colours, toned down a little so the soft shapes read as print, not neon.
  const red = `color-mix(in srgb, ${shade(accent, -0.42)} 68%, #3b302a)`;
  const h1 = hueOf(accent);
  const h2 = hueOf(params.accent);
  const distinct = h1 != null && h2 != null && Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) > 35 && params.primary !== "#10131c";
  const gold = distinct ? `color-mix(in srgb, ${vivid(params.accent)} 72%, #8a7a60)` : "#e0b040";
  const textScale = params.textScale ?? 1;

  // --- Out-of-focus shapes --------------------------------------------------------------------------------
  const right = params.side !== "left"; // which side the player stands on
  // Small gold dots, kept out of the name block and the strip.
  const dots = Array.from({ length: 12 }, () => ({ x: 60 + r() * 960, y: 220 + r() * 960, s: 14 + r() * 22 }))
    .filter((d) => !(d.y > 880 && (right ? d.x < 640 : d.x > 440)) && !(d.y > 540 && d.y < 740))
    .slice(0, 6);

  // --- The photo strip -------------------------------------------------------------------------------------
  const STRIP = { top: 575 + Math.round((r() - 0.5) * 40), height: 138 };
  const shots = data.cutouts.length ? data.cutouts.map((c) => ({ url: c.original, face: c.face })) : data.bgPhotoUrl ? [{ url: data.bgPhotoUrl, face: data.face }] : [];
  const tiles: { x: number; w: number; i: number; zoom: number }[] = [];
  for (let x = -20, i = Math.floor(r() * 10); x < CANVAS_W + 20; i++) {
    const w = 170 + Math.round(r() * 150);
    tiles.push({ x, w, i, zoom: 1 + r() * 0.35 });
    x += w + 4;
  }

  // --- The player ------------------------------------------------------------------------------------------
  const face = data.face ?? [0.4, 0.06, 0.2, 0.1];
  const aspect = data.photoAspect ?? 0.6;
  let h = 1120 * (params.playerScale ?? 1);
  if (data.facePx > 0) h = Math.max(820, Math.min(h, (2.4 * data.facePx) / face[3]));
  const cutLegs = (data.cut?.bottom ?? 0) > 0;
  const floor = cutLegs ? 1238 : 1230;
  // From just under the header rule to the footer rule: head never climbs into the details row.
  const headFrac = Math.max(0, face[1] - face[3] * 0.7);
  h = Math.min(h, (floor - 235) / (1 - headFrac));
  // A head-and-shoulders photo stays portrait-sized instead of blowing the face up.
  h = Math.min(h, Math.max(260 / face[3], 700));
  // The silhouette keeps to its half: clear of the name block, and inside the canvas unless the photo
  // itself cut him on that side (then the cut edge rests on the canvas edge).
  const lo = right ? 440 : (data.cut?.left ?? 0) > 0 ? -60 : 24;
  const hi = right ? ((data.cut?.right ?? 0) > 0 ? 1140 : 1056) : 630;
  // Wide action poses (a kick, a slide) shrink to fit that room.
  h = Math.min(h, (hi - lo) / aspect);
  const w = h * aspect;
  let cx = (right ? 690 : 390) + (r() - 0.5) * 40;
  const faceOff = w * (face[0] + face[2] / 2);
  if (cx - faceOff < lo) cx = lo + faceOff;
  if (cx - faceOff + w > hi) cx = hi - w + faceOff;
  // Feet stand on the footer rule; a photo cut at the legs fades out just above it.
  const box = { left: cx - faceOff + (params.playerX ?? 0), top: floor - h + (params.playerY ?? 0), width: w, height: h };

  // --- Words -----------------------------------------------------------------------------------------------
  const first = content.firstName.trim();
  const last = content.lastName.toUpperCase().trim();
  const lastSize = Math.min(118, 540 / Math.max(4, last.length * 0.8)) * textScale;
  const club = (data.club?.name ?? "").toUpperCase();
  const details = [data.player.number ? `No. ${data.player.number}` : "", data.player.position ? caps(data.player.position) : "", caps(content.kicker)].filter(Boolean);
  const circled = details.length - 1;
  const rows = (content.stats.length && postType !== "result" && postType !== "matchday" ? content.stats : factRows(data)).filter((f) => f.value && f.value !== "—").slice(0, 4);
  const textSide = right ? { left: 64 } : { right: 64 };
  const align = right ? "flex-start" : "flex-end";

  const bleed = { "data-bleed": true } as Record<string, unknown>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      <Paper color={PAPER} strength={0.8} />

      {/* Big soft shapes in club colours, out of focus. */}
      <div style={{ position: "absolute", left: right ? 330 : 210, top: 250, width: 540, height: 600, borderRadius: 48, background: red, filter: "blur(30px)", opacity: 0.95 }} />
      <div {...bleed} style={{ position: "absolute", left: -90, top: right ? 330 : 780, width: 230, height: 360, borderRadius: 40, background: gold, filter: "blur(26px)", opacity: 0.9 }} />
      <div {...bleed} style={{ position: "absolute", right: -90, top: right ? 820 : 300, width: 240, height: 330, borderRadius: 40, background: gold, filter: "blur(26px)", opacity: 0.9 }} />
      {dots.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: "50%", background: gold, filter: "blur(4px)", opacity: 0.85 }} />
      ))}

      {/* The strip of his other photos. */}
      {shots.length > 0 && (
        <div {...bleed} style={{ position: "absolute", left: 0, right: 0, top: STRIP.top, height: STRIP.height, overflow: "hidden", background: shade(red, -0.5), boxShadow: "0 16px 40px rgba(0,0,0,.18)" }}>
          {tiles.map((t) => {
            const s = shots[t.i % shots.length];
            const f = s.face;
            const fx = f ? (f[0] + f[2] / 2) * 100 : 50;
            const fy = f ? (f[1] + f[3] * 1.4) * 100 : 35;
            return (
              <div key={t.x} style={{ position: "absolute", left: t.x, top: 0, width: t.w, height: STRIP.height, overflow: "hidden" }}>
                <img
                  src={s.url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${fx}% ${fy}%`,
                    transform: `scale(${t.zoom})`,
                    transformOrigin: `${fx}% ${fy}%`,
                    filter: "blur(2px) grayscale(.35) sepia(.3) contrast(1.1)",
                  }}
                />
                <div style={{ position: "absolute", inset: 0, background: t.i % 2 ? red : gold, mixBlendMode: "multiply", opacity: 0.42 }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,.08), transparent 40%, rgba(0,0,0,.18))" }} />
        </div>
      )}

      {/* The player, crossing the strip. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            ...box,
            maxWidth: "none",
            filter: "contrast(1.04) drop-shadow(0 26px 34px rgba(40,20,20,.28))",
            ...cutMask(data.cut, cutLegs ? 1.6 : 1),
          }}
        />
      )}

      {/* Header: logo, crest, the detail row with one word circled. */}
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", left: 64, top: 64 }} />
      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", right: 64, top: 48, width: 66, height: 66, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: 64, right: 64, top: 170, height: 1, background: INK, opacity: 0.55 }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 132, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: GROTESK, fontWeight: 500, fontSize: 21, letterSpacing: "0.02em" }}>
        {details.map((d, i) => (
          <div key={i} style={{ position: "relative", whiteSpace: "nowrap", padding: i === circled ? "10px 22px" : 0, margin: i === circled ? "0 -22px" : 0 }}>
            {i === circled && <Oval color={gold} seed={(params.seed ?? 11) + 5} />}
            <span style={{ position: "relative" }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Name block, lower corner. */}
      <div style={{ position: "absolute", ...textSide, bottom: CANVAS_H - 1214, width: 560, display: "flex", flexDirection: "column", alignItems: align }}>
        {first && (
          <div style={{ position: "relative", padding: "6px 26px", marginBottom: 6, [right ? "marginLeft" : "marginRight"]: -8 }}>
            <div style={{ position: "absolute", inset: 0, border: `2px solid ${INK}`, borderRadius: "50%" }} />
            <span style={{ position: "relative", fontFamily: GROTESK, fontWeight: 500, fontSize: 30, letterSpacing: "0.02em" }}>{first}</span>
          </div>
        )}
        <div
          style={{
            fontFamily: ARCHIVO_BLACK,
            fontSize: lastSize,
            lineHeight: 0.92,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            transform: "scaleX(1.12)",
            transformOrigin: right ? "left center" : "right center",
          }}
        >
          {last}
        </div>
        <div style={{ width: 420, marginTop: 20, borderTop: `2px dashed ${INK}`, opacity: 0.7 }} />
        <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 22, letterSpacing: "0.18em", marginTop: 14 }}>{club}</div>
        <div style={{ width: 380, marginTop: 10, fontFamily: SANS, fontSize: 16, lineHeight: 1.35, opacity: 0.75, textAlign: right ? "left" : "right" }}>{bio(data)}</div>
      </div>

      {/* Footer: season and the numbers. */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 1240, height: 1, background: INK, opacity: 0.55 }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 1256, display: "flex", alignItems: "baseline", justifyContent: "space-between", fontFamily: GROTESK, fontSize: 20 }}>
        <span style={{ fontWeight: 700, letterSpacing: "0.06em" }}>{season()}</span>
        {rows.map((f, i) => (
          <span key={i} style={{ whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 24 }}>{f.value}</span> <span style={{ opacity: 0.7 }}>{caps(f.value === "1" ? f.label.replace(/s$/i, "") : f.label)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
