/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { AgencyLogo } from "./shared";
import { clubDeep, lift, PRINT_GRAIN, statText, tableRows } from "./column";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, mix } from "./wall";
import { gameDate, sides } from "./gradient";

/** DM Serif Display: average advance of capitals relative to the font size. */
const SERIF_CAPS = 0.62;
const fitSerif = (t: string, width: number, max: number, ratio = SERIF_CAPS) => Math.min(max, width / Math.max(1, [...t].length * ratio));

/**
 * Depth-of-field goalkeeper poster (Alexander Meyer, Dortmund): a muted, greyed tint of the club colour with
 * grain, a big soft disc just lighter than the ground ringed by a dashed white circle, the player standing
 * small in the middle with a soft floor shadow, and huge out-of-focus copies of him cropped at both edges as
 * if shot through the foreground. Serif name by his head, the shirt number in the disc, three colour swatches
 * at the foot. Matchday adds the opponent, date and kick-off and the two crests under the name.
 */
export function Ring({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 33;
  const r = rng(seed);
  const mirror = params.side === "left";
  const X = (x: number) => (mirror ? CANVAS_W - x : x);
  const ts = params.textScale ?? 1;

  // ---- colours: the club colour greyed and lifted into a calm ground ----
  const club = clubColour(data);
  const grey = mix(club, "#9c9c98", 0.68);
  const bg = luminance(grey) < 0.3 ? shade(grey, 0.32) : luminance(grey) > 0.55 ? shade(grey, -0.12) : shade(grey, 0.12);
  const disc = shade(bg, 0.12);
  let ink = clubDeep(data);
  if (luminance(ink) > 0.1) ink = shade(ink, -0.35);
  ink = mix(ink, "#1a1a1a", 0.15);

  // ---- the player, full body in the middle ----
  const floor = 1045 + r() * 10;
  const cx = X(505 + (r() - 0.5) * 30);
  const placed = standing(data, { cx, headTop: 318, floor, maxFace: 100, framing: "full" });
  const { box, style: figMask } = lift(data, placed, 318 + placed.faceH * 0.2);
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceTop = box.top + face[1] * box.height;
  const faceH = face[3] * box.height;

  // ---- disc and dashed ring ----
  const dcx = X(640 + (r() - 0.5) * 30);
  const dcy = 470 + (r() - 0.5) * 20;
  const dr = 300;
  const rr = 385;
  const dashes = 14;
  const circ = 2 * Math.PI * rr;
  const rot = r() * 360;

  // ---- the out-of-focus foreground copies ----
  const alt = data.cutouts?.find((c) => c.url !== data.photoUrl && c.face);
  const fg = (src: string | null, left: boolean, aspect: number, f: [number, number, number, number] | null, show: number) => {
    if (!src || !f) return null;
    const h = 2300 + r() * 300;
    const w = h * aspect;
    // Head well above the canvas: only the body shows, never an enlarged face.
    const top = -40 - (f[1] + f[3] * 1.5) * h - r() * 160;
    const bodyCx = (f[0] + f[2] / 2) * w;
    const half = f[2] * w * 1.7;
    // Only the outer side of the body, `show` px of it, comes into the frame (flipped copies mirror the maths).
    const lx = left ? -(w - bodyCx) - half + show : CANVAS_W - show - (bodyCx - half);
    const cw = show + 90;
    const fade = `linear-gradient(to ${left ? "left" : "right"}, transparent 0, #000 70px)`;
    return (
      <div data-bleed style={{ position: "absolute", top: 0, bottom: 0, [left ? "left" : "right"]: 0, width: cw, overflow: "hidden", WebkitMaskImage: fade, maskImage: fade }}>
        <img
          src={src}
          alt=""
          style={{ position: "absolute", left: left ? lx : lx - (CANVAS_W - cw), top, width: w, height: h, maxWidth: "none", filter: "blur(18px) saturate(.85) brightness(.96)", opacity: 0.97, transform: left ? "scaleX(-1)" : undefined }}
        />
      </div>
    );
  };

  // ---- words ----
  // The copy on the text side comes in this far; the words stay clear of it.
  const showB = 150 + r() * 40;
  const edge = showB + 22;
  const first = content.firstName.trim().toUpperCase();
  const last = (content.lastName.trim() || first).toUpperCase();
  // The edge of the name nearest his head (its right edge when mirrored).
  const nameLeft = mirror ? faceCx - faceH * 0.95 - 16 : faceCx + faceH * 0.95 + 16;
  const nameRoom = Math.min(420, mirror ? nameLeft - edge : CANVAS_W - edge - nameLeft);
  const lastSize = fitSerif(last, nameRoom, 86 * ts);
  const firstSize = fitSerif(first === last ? "" : first, nameRoom, 28 * ts, 0.7);
  const nameTop = faceTop - faceH * 0.55;

  const md = postType === "matchday" ? sides(data) : null;
  // A short spaced line under the name: the round on matchday, his position otherwise.
  const tag = (md ? md.round || md.comp : data.player.position).toUpperCase();
  const tagSize = fitSerif(tag, nameRoom, 17 * ts, 0.78);
  const nameBottom = nameTop + (first && first !== last ? firstSize * 1.1 : 0) + lastSize * 0.95 + (tag ? tagSize * 1.6 + 10 : 0);

  // The fixture (or the headline) on the floor, between the blurred edges.
  const when = md ? [gameDate(data), md.time, md.venue].filter(Boolean).join(" · ") : "";
  const headline = md ? (md.opp ? md.opp : content.kicker.toUpperCase()) : content.kicker.toUpperCase();
  const sub = md
    ? when
    : postType === "transfer" || postType === "renewal"
      ? content.until
        ? `UNTIL ${content.until}`
        : ((postType === "transfer" ? data.toClub?.name : data.club?.name) ?? "").toUpperCase()
      : tableRows(data, 3).map(statText).join(" · ");
  const floorRoom = CANVAS_W - 2 * (showB + 60);
  const oppCrest = md?.opp ? md.oppCrest : null;
  const headSize = fitSerif(headline + (md?.opp ? " v " : "") + (oppCrest ? "WW" : ""), floorRoom, 38 * ts, 0.64);
  const subSize = fitSerif(sub, floorRoom, 17 * ts, 0.8);
  const nameSide: CSSProperties = mirror ? { right: CANVAS_W - nameLeft, textAlign: "right" } : { left: nameLeft, textAlign: "left" };

  // Shirt number inside the disc, low and to the far side of the player.
  const num = data.player.number;
  const numSize = 92 * ts;
  const boxFar = mirror ? box.left : box.left + box.width;
  const numX = mirror ? Math.min(boxFar - 30, dcx - dr * 0.35) : Math.max(boxFar + 30, dcx + dr * 0.35);
  const numTop = Math.max(nameBottom + 36, dcy + dr * 0.05);
  const showNum = !!num && (mirror ? numX - numSize * 0.55 * num.length > edge : numX + numSize * 0.55 * num.length < CANVAS_W - edge) && numTop + numSize < floor - 60;
  const crest = (postType === "transfer" ? data.toClub?.crestUrl : null) ?? data.club?.crestUrl;

  // The club's colours as swatches: never the same colour twice.
  const c1 = luminance(params.primary) < 0.02 && params.primary !== "#000000" ? "#111111" : params.primary;
  const rgb = (h: string) => [0, 2, 4].map((k) => parseInt(h.replace("#", "").padEnd(6, "0").slice(k, k + 2), 16));
  const near = (a: string, b: string) => rgb(a).reduce((acc, v, k) => acc + Math.abs(v - rgb(b)[k]), 0) < 90;
  const c2 = near(params.accent, c1) ? (luminance(c1) > 0.5 ? "#1a1a1a" : "#f1efe9") : params.accent;
  const swatches = [c1, c2, mix(bg, "#3b3a36", 0.35)];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg, color: ink }}>
      {/* Light falls from the top: a touch brighter behind the disc. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at ${mirror ? 45 : 55}% 38%, ${shade(bg, 0.14)}, ${bg} 70%, ${shade(bg, -0.06)} 100%)` }} />
      {/* The disc and its dashed ring. */}
      <div style={{ position: "absolute", left: dcx - dr, top: dcy - dr, width: dr * 2, height: dr * 2, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${shade(disc, 0.06)}, ${disc} 70%)`, boxShadow: `0 30px 80px ${shade(bg, -0.15)}55` }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={dcx}
          cy={dcy}
          r={rr}
          fill="none"
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${(circ / dashes) * 0.46} ${(circ / dashes) * 0.54}`}
          transform={`rotate(${rot} ${dcx} ${dcy})`}
          opacity={0.92}
        />
      </svg>

      {/* Floor shadow and the player. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: faceCx - 260, width: 520, top: floor - 40, height: 80, borderRadius: "50%", background: `radial-gradient(closest-side, ${shade(bg, -0.45)}88, transparent)`, filter: "blur(12px)" }} />
          <div style={{ position: "absolute", left: faceCx - 150, width: 300, top: floor - 14, height: 28, borderRadius: "50%", background: `radial-gradient(closest-side, ${shade(bg, -0.6)}aa, transparent)`, filter: "blur(6px)" }} />
        </>
      )}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "saturate(.9) contrast(1.03)", ...figMask }} />
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 280, background: `linear-gradient(to bottom, ${bg}00, ${bg}dd 60%, ${bg})` }} />}

      {/* Out-of-focus foreground at both edges. */}
      {fg(alt?.url ?? data.photoUrl, !mirror, (alt ? alt.aspect : data.photoAspect) ?? 0.5, alt ? alt.face : data.face, 230 + r() * 50)}
      {fg(data.photoUrl, mirror, data.photoAspect ?? 0.5, data.face, showB)}

      {/* Name by his head. */}
      <div style={{ position: "absolute", top: nameTop, ...nameSide, whiteSpace: "nowrap" }}>
        {first && first !== last && <div style={{ fontFamily: DMSERIF, fontSize: firstSize, lineHeight: 1.1, letterSpacing: "0.02em" }}>{first}</div>}
        <div style={{ fontFamily: DMSERIF, fontSize: lastSize, lineHeight: 0.95, letterSpacing: "-0.005em" }}>{last}</div>
      </div>

      {/* Name tag line. */}
      {tag && (
        <div style={{ position: "absolute", top: nameBottom - tagSize * 1.6, ...nameSide, fontFamily: DMSERIF, fontSize: tagSize, letterSpacing: "0.16em", whiteSpace: "nowrap", opacity: 0.75 }}>{tag}</div>
      )}

      {/* Fixture / headline on the floor. */}
      <div style={{ position: "absolute", top: floor + 44, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: headSize * 0.3, fontFamily: DMSERIF, fontSize: headSize, lineHeight: 1 }}>
          {md?.opp && <span style={{ fontStyle: "italic", opacity: 0.8 }}>v</span>}
          {oppCrest && <img src={oppCrest} alt="" style={{ width: headSize * 1.2, height: headSize * 1.2, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.18))" }} />}
          <span>{headline}</span>
        </div>
        {sub && <div style={{ fontFamily: DMSERIF, fontSize: subSize, letterSpacing: "0.16em", opacity: 0.75 }}>{sub}</div>}
      </div>

      {/* Our crest, small, over the ring. */}
      {crest && <img src={crest} alt="" style={{ position: "absolute", top: 28, left: 540 - 30, width: 60, height: 60, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.15))" }} />}

      {showNum && (
        <div style={{ position: "absolute", top: numTop, ...(mirror ? { right: CANVAS_W - numX } : { left: numX }), fontFamily: DMSERIF, fontSize: numSize, lineHeight: 1, letterSpacing: "-0.02em" }}>{num}</div>
      )}

      {/* Three colour swatches. */}
      <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {swatches.map((c, i) => (
          <div key={i} style={{ width: 50, height: 50, background: c, boxShadow: "0 2px 8px rgba(0,0,0,.12)" }} />
        ))}
      </div>
      <AgencyLogo data={data} height={20} onLight={luminance(bg) > 0.4} style={{ position: "absolute", bottom: 78, [mirror ? "right" : "left"]: 70, opacity: 0.55 }} />

      {/* Grain. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(0,0,0,.14) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
