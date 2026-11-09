/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { NatFigure, natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { Filled } from "./natref4";
import { BODONI, Shell, fit, frameOf } from "./natref1";
import { AgencyLogo, SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 72 · natural looks, each after ONE real reference (Pinterest, captured in round 71), photo treatment first.
 * Photos only through `Filled` / the Shell (the graded ground with him removed, so no second copy of him shows);
 * he and his face stay sharp and in colour.
 *
 *   natrefedgetitle   "MATCHDAG" (Malmö FF v Växjö DFF; Pinterest "matchday story football photo gradient fade",
 *                     row 1 col 4)
 *     treatment: natural daylight colour — rich real grass, a little more contrast, the left edge falling off into a
 *                deep green-black shadow under the word; he stays as photographed
 *     type:      one light high-contrast serif word in caps, rotated to run up the whole left edge (reading bottom to
 *                top), and beside its foot both clubs in title-case serif, one per line, the ground | kick-off tiny
 *                under them. On the right edge (mirrored) when he stands on the left.
 *
 *   goalnatrefstack   "GOAL GOAL GOAL…" (PSG v Bayern; Pinterest "goal graphic player name huge photo", row 4 col 1)
 *     treatment: a vivid, true-colour photo held in a rectangular card on off-white paper; his head and arms break
 *                out of the card's top and sides (the card's foot cuts him)
 *     type:      the word stacked down the whole page in a big grotesque, flush left, its colour running from the
 *                club colour at the top to near-black at the foot, the card covering the right part of the lower
 *                lines; both crests stacked top-right (no score: goal posts never show it); his name small in the
 *                card's top corner.
 */

const W = CANVAS_W;

/* ===== natrefedgetitle — the word up the left edge ===== */

export function Natrefedgetitle({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  // The word on the edge away from him (the reference: on the left, he to the right).
  const onRight = d.params.side === "left";
  const want = { fx: onRight ? 430 : 650, fy: story ? 720 : 500, fs: story ? 230 : 160 };
  const p0 = natPlace(d, W, H, want);
  const word = (d.content.kicker || "MATCHDAY").trim().toUpperCase();
  // Runs nearly the whole height (inside the story's safe band), as in the reference.
  const top = story ? logoTop - 40 : 40;
  const foot = story ? bottom + 60 : H - 40;
  const span = foot - top;
  const wPx = Math.min(fit(300 * k * ts, span, word.length, 0.74), 260 * k * ts);
  const capH = wPx * 0.72;
  const edge = 34 * k;
  // The rotated line box: width = the span, height = the line; rotated about its top-left corner.
  const lineH = wPx * 0.9;
  const wordStyle: CSSProperties = onRight
    ? { position: "absolute", left: 0, top: 0, width: span, height: lineH, transformOrigin: "0 0", transform: `translate(${W - edge}px, ${top}px) rotate(90deg)` }
    : { position: "absolute", left: 0, top: 0, width: span, height: lineH, transformOrigin: "0 0", transform: `translate(${edge}px, ${foot}px) rotate(-90deg)` };
  // The framed photo (ground and figure together, as the "move player" nudge does) slides away from the word's edge
  // until most of his body is clear of the strip, his face kept well inside the frame.
  const strip = edge + lineH + 24 * k;
  const b0 = p0.box;
  const nx0 = p0.nudge?.x ?? 0;
  const bodyNeed = onRight ? b0.left + b0.width * 0.9 - (W - strip) : strip - (b0.left + b0.width * 0.1);
  const room = onRight ? p0.fx + nx0 - p0.faceW - strip - 30 : W - 40 - (p0.fx + nx0 + p0.faceW);
  const slide = Math.max(0, Math.min(W * 0.3, bodyNeed, room));
  const dd = slide ? { ...d, params: { ...d.params, playerX: (d.params.playerX ?? 0) + (onRight ? -slide : slide) } } : d;
  const place0 = slide ? natPlace(dd, W, H, want) : p0;
  // The fixture beside the word's foot: clubs exact, one per line, wrapping (never cut).
  const colX = edge + lineH + 34 * k;
  const colW = W * 0.5;
  const nPx = Math.max(30 * k, fit(48 * k * ts, colW, Math.max(fx.homeName.length, fx.awayName.length), 0.5));
  const sPx = 19 * k * ts;
  const info = [d.content.venue || fx.venue, fx.kickoff].filter(Boolean).join(" | ");
  const lines = (s: string) => Math.max(1, Math.ceil((s.length * nPx * 0.5) / colW));
  const blockH = (lines(fx.homeName) + lines(fx.awayName)) * nPx * 1.12 + (info ? 14 * k + sPx * 1.4 * Math.ceil((info.length * sPx * 0.55) / colW) : 0);
  const ys = [0.7, 0.62, 0.78, 0.52, 0.42].map((f) => Math.min(H * f, bottom - blockH));
  const x0 = onRight ? W - colX - colW : colX;
  const spot = pickTextSpot(place0, ys.map((y) => ({ x0, y0: y, x1: x0 + colW, y1: y + blockH })));
  const bTop = ys[spot.index];
  const place = place0;
  const glow = `0 2px 16px rgba(0,0,0,${spot.crowded ? 0.75 : 0.5})`;
  const fall = onRight ? "to left" : "to right";
  return (
    <Shell
      data={dd}
      place={place}
      bg="#0f1a12"
      // The reference's photo treatment: natural daylight colour, the grass rich and a little deeper, the edge under
      // the word falling off into a green-black shadow. His sharp figure goes on top, ungraded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(1.08) contrast(1.07) brightness(.95)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${fall}, rgba(6,14,8,.78) 0%, rgba(6,14,8,.5) ${((edge + capH * 1.6) / W) * 100}%, rgba(6,14,8,0) 52%)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.55, bottom: 0, background: "linear-gradient(to bottom, rgba(6,14,8,0), rgba(6,14,8,.35))" }} />
        </>
      }
      front={
        <>
          {spot.crowded && <div style={{ position: "absolute", left: x0 - 80 * k, width: colW + 160 * k, top: bTop - 70 * k, height: blockH + 140 * k, background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(6,14,8,.6), rgba(6,14,8,0) 80%)" }} />}
          <div style={{ ...wordStyle, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: BODONI, fontWeight: 400, fontSize: wPx, lineHeight: 1, color: "#f6f3ec", whiteSpace: "nowrap", textShadow: "0 2px 18px rgba(0,0,0,.35)" }}>
            {[...word].map((ch, i) => (
              <span key={i}>{ch === " " ? " " : ch}</span>
            ))}
          </div>
          <div style={{ position: "absolute", left: x0, width: colW, top: bTop, color: "#f6f3ec", textAlign: onRight ? "right" : "left", textShadow: glow }}>
            <div style={{ fontFamily: BODONI, fontWeight: 500, fontSize: nPx, lineHeight: 1.12 }}>{fx.homeName}</div>
            <div style={{ fontFamily: BODONI, fontWeight: 500, fontSize: nPx, lineHeight: 1.12 }}>{fx.awayName}</div>
            {info && <div style={{ marginTop: 14 * k, fontFamily: SANS, fontWeight: 500, fontSize: sPx, lineHeight: 1.4, opacity: 0.82 }}>{info}</div>}
          </div>
        </>
      }
    />
  );
}

/* ===== goalnatrefstack — the word stacked down the page, his photo in a card ===== */

const PAPER = "#f1efec";

/** A crest, or — with no crest — the club's exact name, wrapped (never cut). */
function CrestOr({ src, name, size, px, color }: { src: string | null; name: string; size: number; px: number; color: string }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain" }} />;
  return <div style={{ maxWidth: size * 2.2, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: px, lineHeight: 1.15, letterSpacing: "0.04em", textTransform: "uppercase", color }}>{name}</div>;
}

export function Goalnatrefstack({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const word = (d.content.kicker || "GOAL").trim().toUpperCase();
  // The stack fills the page under the logo to the foot (the reference: five lines).
  const n = 5;
  const sTop = story ? logoTop + 150 : 130;
  const sFoot = story ? bottom + 30 : H - 40;
  const lh = (sFoot - sTop) / n;
  const left = 50 * k;
  const wPx = Math.min(lh / 0.86, fit(400 * k * ts, W * 0.8, word.length, 0.7));
  // The card: right of centre, from the second line's middle to near the foot (as in the reference).
  const cx0 = Math.round(W * 0.35);
  const cx1 = Math.round(W - 44 * k);
  const cy0 = Math.round(sTop + lh * 1.45);
  const cy1 = Math.round(sTop + lh * (n - 0.3));
  const cw = cx1 - cx0;
  const ch = cy1 - cy0;
  // He is framed in the card: face high in it, a half-body portrait (his head may break out of the top).
  const want = { fx: (cx0 + cx1) / 2, fy: cy0 + ch * 0.2, fs: story ? 230 : 170 };
  const p0 = natPlace(d, W, H, want);
  // Where his face REALLY lands (the route may zoom or slide the photo): his hair breaks out of the card's top only
  // a little, as in the reference — when it would rise further (over the word, the logo), the framed photo goes down.
  const hairTop = p0.fy + (p0.nudge?.y ?? 0) - p0.fs * 0.85;
  const drop = Math.max(0, Math.min(ch * 0.45, cy0 - ch * 0.03 - hairTop));
  const dd = drop ? { ...d, params: { ...d.params, playerY: (d.params.playerY ?? 0) + drop } } : d;
  const place = drop ? natPlace(dd, W, H, want) : p0;
  const clip = `inset(${cy0}px ${W - cx1}px ${H - cy1}px ${cx0}px)`;
  // His figure breaks out of the card's top and sides, never below its foot.
  const figClip = `inset(0px 0px ${H - cy1}px 0px)`;
  const first = (d.content.firstName || "").trim().toUpperCase();
  const last = (d.content.lastName || "").trim().toUpperCase();
  const pad = 30 * k;
  const nW = cw * 0.42;
  const lPx = Math.min(56 * k * ts, fit(56 * k * ts, nW, last.length, 0.66));
  const fPx = 15 * k * ts;
  const nameH = fPx * 1.4 + lPx;
  // The name in a top corner of the card, the one clear of him (bottom corners if both top ones sit on him).
  const corners = [
    { x0: cx1 - pad - nW, y0: cy0 + pad, right: true },
    { x0: cx0 + pad, y0: cy0 + pad, right: false },
    { x0: cx1 - pad - nW, y0: cy1 - pad - nameH, right: true },
  ];
  const ns = pickTextSpot(place, corners.map((c) => ({ x0: c.x0, y0: c.y0, x1: c.x0 + nW, y1: c.y0 + nameH })));
  const nc = corners[ns.index];
  const cs = 78 * k;
  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: PAPER }}>
      {/* The stacked word, the club colour running to near-black down the page. */}
      <div
        style={{
          position: "absolute",
          left,
          top: sTop,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: wPx,
          lineHeight: `${lh}px`,
          letterSpacing: "-0.045em",
          whiteSpace: "nowrap",
          backgroundImage: `linear-gradient(to bottom, ${ink} 0%, ${ink} 30%, #1a1012 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {Array.from({ length: n }, (_, i) => (
          <div key={i}>{word}</div>
        ))}
      </div>
      {/* Both crests stacked top-right, a hairline between (no score). */}
      <div style={{ position: "absolute", right: 44 * k, top: sTop + lh * 0.12, width: cs * 1.4, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
        <CrestOr src={fx.homeCrest} name={fx.homeName} size={cs} px={13 * k} color="#1a1012" />
        <div style={{ width: cs * 0.5, height: Math.max(2, 2 * k), background: "rgba(26,16,18,.35)" }} />
        <CrestOr src={fx.awayCrest} name={fx.awayName} size={cs} px={13 * k} color="#1a1012" />
      </div>
      {/* The card: his real photo in true, vivid colour, with him removed from it (his sharp figure goes on top). */}
      <div style={{ position: "absolute", inset: 0, clipPath: clip, boxShadow: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "#2b2b2b" }} />
        <div style={{ position: "absolute", inset: 0, filter: "saturate(1.1) contrast(1.05)" }}>
          <Filled place={place} H={H} />
        </div>
      </div>
      <NatFigure data={dd} place={place} W={W} H={H} style={{ clipPath: figClip }} />
      {(first || last) && (
        <div style={{ position: "absolute", left: nc.x0, width: nW, top: nc.y0, textAlign: nc.right ? "right" : "left", color: "#fff", textShadow: `0 2px 14px rgba(0,0,0,${ns.crowded ? 0.7 : 0.45})` }}>
          {first && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fPx, lineHeight: 1.4, letterSpacing: "0.12em" }}>{first}</div>}
          {last && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: lPx, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{last}</div>}
        </div>
      )}
      <AgencyLogo data={d} height={24} onLight style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${d.params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
