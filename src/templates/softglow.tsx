/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { crestsOf, scoreOf, sceneOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { INTER, mix, MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const SHADOW = "0 2px 14px rgba(0,0,0,.45)";

/** Face height for photos cut at the legs, by framing. */
const FACE_H: Record<string, number> = { full: 112, knees: 124, waist: 140, chest: 165 };

const MONTH_NO: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** "SAT 10 OCT" → "10.10". */
function dotDate(d: string): string {
  const m = d.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1].padStart(2, "0")}.${MONTH_NO[m[2]] ?? m[2]}` : d.toUpperCase();
}

/** A caption split into two balanced lines when long. */
function twoLines(t: string, max = 14): string[] {
  const words = t.split(/\s+/).filter(Boolean);
  if (t.length <= max || words.length < 2) return [t];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/**
 * Soft glow (Nacional v Cerro Largo): a dark, desaturated navy world — his own photo (or the ground)
 * blurred into a dreamy haze, heavy film grain, a strip of soft grass at the foot — and the player full
 * length in action, lifted off it by a soft halo of light. Top centre, a white mark and the competition;
 * the date | kick-off, then the teams, ours in bold and the other in a thin weight; the two crests stacked
 * as white marks low on the free side; the agency logo small at the foot.
 */
export function Softglow({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 72;
  const r = rng(seed);
  const id = `sg-${seed % 997}`;
  const left = params.side === "left";
  const ts = params.textScale ?? 1;

  // Club-dark tone: the club colour pushed deep and calmed towards navy.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.8) club = vivid(params.accent);
  const navy = mix(shade(club, -0.72), "#141b2b", 0.78);
  const haze = mix(shade(club, -0.35), "#5a6378", 0.8);

  // ---- the player ----
  const floor = 1238;
  const cx = 540 + (left ? -1 : 1) * (30 + r() * 40);
  const headTop = 392 + r() * 16;
  let box = standing(data, { cx, headTop, floor, maxFace: 116 });
  if (!box.feet) {
    // Cut at the legs: face high under the type, the body running off the bottom edge.
    const p = placeFace(data, cx, headTop + 34, FACE_H[params.framing ?? "waist"] ?? 140);
    box = { ...p, feet: false, faceCx: cx + (params.playerX ?? 0), faceTop: headTop + 34 + (params.playerY ?? 0), faceH: p.faceH };
  }
  const img: CSSProperties = { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none" };

  // ---- background: his own photo, or the ground, melted into haze ----
  const scene = sceneOf(data);
  const bg = data.bgPhotoUrl && (!scene || r() < 0.65) ? data.bgPhotoUrl : scene ?? data.bgPhotoUrl;

  // ---- texts ----
  const f = matchFacts(data);
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const ours = (data.club?.name ?? "").toLowerCase();
  const weHost = content.home ?? ((content.homeTeam ?? "").toLowerCase() === ours ? true : (content.awayTeam ?? "").toLowerCase() === ours ? false : true);
  const score = postType !== "matchday" ? scoreOf(data, "–") : "";
  const sep = score ? ` ${score} ` : " VS. ";
  const teamsLen = home.length + away.length + sep.length;
  const teamSize = Math.min(44, 900 / Math.max(1, teamsLen * 0.7)) * ts;
  const topLine =
    postType === "matchday"
      ? [f.date ? dotDate(f.date) : "", f.time].filter(Boolean).join(" | ")
      : content.kicker.toUpperCase();
  const topSize = Math.min(30, 700 / Math.max(1, topLine.length * 0.66)) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const foot = postType === "matchday" ? f.venue : name;
  const footSize = Math.min(17, 640 / Math.max(1, [...foot].length * 0.85));

  const compLines = twoLines(f.comp || (data.club?.name ?? "").toUpperCase());
  const markLines = [...compLines, f.round].filter(Boolean).slice(0, 3);
  const mark = data.club?.crestUrl;

  // Teams line is kept clear of the hair.
  const hairTop = box.faceTop - box.faceH * 0.6;
  const teamsTop = Math.min(282, hairTop - teamSize - 40);
  const dateTop = teamsTop - topSize - 18;
  const markTop = Math.max(40, Math.min(64, dateTop - 130));

  // Crests stacked low on the side he leaves free.
  const crests = crestsOf(data);
  // Beside him when the photo leaves room (the cutout is trimmed to his body), else flanking the date line.
  const roomL = box.left;
  const roomR = CANVAS_W - box.left - box.width;
  const sideCrests = crests.length > 0 && Math.max(roomL, roomR) >= 175;
  const crestCx = roomL > roomR ? Math.max(100, roomL - 100) : Math.min(CANVAS_W - 100, CANVAS_W - roomR + 100);
  const crestTop = 800;

  const bold = (t: string) => <span style={{ fontWeight: 800 }}>{t}</span>;
  const thin = (t: string) => <span style={{ fontWeight: 300, opacity: 0.92 }}>{t}</span>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: navy, color: WHITE }}>
      <MonoDefs id={`${id}-mono`} ink={0.6} />
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={`${id}-bloom`} x="-30%" y="-20%" width="160%" height="140%">
            <feGaussianBlur stdDeviation="26" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.25 0" />
          </filter>
          <filter id={`${id}-turf`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves={3} seed={seed % 30} />
            <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .62  0 0 0 0 .5  0 0 0 .9 -.25" />
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
      </svg>

      {bg && (
        <img
          src={bg}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: CANVAS_H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(34px) saturate(.45) brightness(.7) contrast(.95)" }}
        />
      )}
      {/* Everything cooled into the club-dark navy. */}
      <div style={{ position: "absolute", inset: 0, background: navy, mixBlendMode: "color", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${navy} 0%, ${navy}cc 18%, ${haze}55 48%, ${navy}66 72%, ${navy}aa 100%)` }} />
      {/* A pale, out-of-focus band of light across the middle, like a stand behind. */}
      <div style={{ position: "absolute", left: -200, right: -200, top: 560, height: 360, background: `radial-gradient(50% 50% at ${left ? 30 : 70}% 50%, rgba(200,210,230,.22), transparent)`, filter: "blur(20px)" }} />

      {/* Grass: soft, desaturated, out of focus away from his feet. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: floor - 250, bottom: 0, background: `linear-gradient(to bottom, transparent, ${mix("#3d4e40", navy, 0.3)}cc 34%, ${mix("#34443a", navy, 0.25)} 68%, ${mix("#263229", navy, 0.3)})` }} />
      <svg width={CANVAS_W} height={CANVAS_H - floor + 250} style={{ position: "absolute", left: 0, top: floor - 250, opacity: 0.5, mixBlendMode: "soft-light" }} aria-hidden>
        <defs>
          <linearGradient id={`${id}-tg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <mask id={`${id}-tm`}>
            <rect width="100%" height="100%" fill={`url(#${id}-tg)`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${id}-turf)`} mask={`url(#${id}-tm)`} />
      </svg>

      {/* The halo: a soft bloom of light around him. */}
      <div style={{ position: "absolute", left: box.faceCx - 520, top: box.faceTop - 160, width: 1040, height: floor - box.faceTop + 200, background: "radial-gradient(closest-side, rgba(190,205,235,.2), transparent)" }} />
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ ...img, filter: `url(#${id}-bloom)`, opacity: 0.42, ...cutMask(data.cut) }} />}
      {box.feet && data.photoUrl && (
        <div style={{ position: "absolute", left: box.faceCx - box.width * 0.42, top: floor - 26, width: box.width * 0.84, height: 52, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.55), transparent)", filter: "blur(6px)" }} />
      )}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ ...img, filter: "saturate(.72) contrast(1.06) brightness(.97)", ...cutMask(data.cut) }} />}
      {/* The same cool grade over him, and a dreamy glow on his edges. */}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ ...img, filter: "blur(10px) brightness(1.3) saturate(.5)", opacity: 0.22, mixBlendMode: "screen", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", inset: 0, background: navy, mixBlendMode: "soft-light", opacity: 0.55, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 85% at 50% 45%, transparent 58%, rgba(0,0,0,.42) 100%)", pointerEvents: "none" }} />
      {/* Darker top so the type reads. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420, background: `linear-gradient(to bottom, ${navy}cc, transparent)`, pointerEvents: "none" }} />

      {/* Top: white mark | competition. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: markTop, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        {mark && <img src={mark} alt="" style={{ width: 64, height: 64, objectFit: "contain", filter: `url(#${id}-mono)` }} />}
        {mark && markLines.length > 0 && <div style={{ width: 1.5, height: 58, background: WHITE, opacity: 0.8 }} />}
        {markLines.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {markLines.map((l, i) => (
              <div key={i} style={{ fontFamily: INTER, fontWeight: i === markLines.length - 1 && f.round && l === f.round ? 400 : 700, fontSize: Math.min(17, 300 / Math.max(1, l.length * 0.7)), lineHeight: 1.1, letterSpacing: "0.04em", whiteSpace: "nowrap", opacity: l === f.round ? 0.8 : 1 }}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      {topLine && (
        <div style={{ position: "absolute", left: 40, right: 40, top: dateTop, height: topSize, display: "flex", justifyContent: "center", alignItems: "center", gap: 28, fontFamily: INTER, fontWeight: 500, fontSize: topSize, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap", textShadow: SHADOW }}>
          {!sideCrests && crests[0] && <img src={crests[0]} alt="" style={{ width: topSize * 1.7, height: topSize * 1.7, objectFit: "contain", filter: `url(#${id}-mono)` }} />}
          <span>{topLine}</span>
          {!sideCrests && crests[1] && <img src={crests[1]} alt="" style={{ width: topSize * 1.7, height: topSize * 1.7, objectFit: "contain", filter: `url(#${id}-mono)` }} />}
        </div>
      )}
      {home && away && (
        <div style={{ position: "absolute", left: 30, right: 30, top: teamsTop, textAlign: "center", fontFamily: INTER, fontSize: teamSize, lineHeight: 1.1, letterSpacing: "0.01em", whiteSpace: "nowrap", textShadow: SHADOW }}>
          {weHost ? bold(home) : thin(home)}
          {score ? <span style={{ fontWeight: 800, margin: "0 0.35em" }}>{score}</span> : <span style={{ fontWeight: 300, opacity: 0.92, margin: "0 0.45em 0 0.3em" }}>VS.</span>}
          {weHost ? thin(away) : bold(away)}
        </div>
      )}
      {foot && (
        <div style={{ position: "absolute", left: 40, right: 40, top: teamsTop + teamSize * 1.1 + 14, textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: footSize, letterSpacing: "0.22em", paddingLeft: "0.22em", whiteSpace: "nowrap", opacity: 0.72, textShadow: SHADOW }}>
          {foot}
        </div>
      )}

      {/* The two crests, stacked as white marks. */}
      {sideCrests && (
        <div style={{ position: "absolute", left: crestCx - 60, width: 120, top: crestTop, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, opacity: 0.92 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 92, height: 92, objectFit: "contain", filter: `url(#${id}-mono) drop-shadow(0 4px 12px rgba(0,0,0,.35))` }} />
          ))}
        </div>
      )}

      {/* On the grass under his feet; in the top corner when his legs run off the bottom. */}
      <div style={box.feet ? { position: "absolute", left: 0, right: 0, bottom: 38, display: "flex", justifyContent: "center" } : { position: "absolute", right: 44, top: 46 }}>
        <AgencyLogo data={data} height={26} style={{ maxWidth: "none", color: WHITE, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />
      </div>
      {/* Heavy film grain. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "180px 180px", opacity: 0.06, mixBlendMode: "screen", pointerEvents: "none" }} />
    </div>
  );
}
