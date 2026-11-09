/* eslint-disable @next/next/no-img-element */
import { logoWidth, NAT_SHADOW } from "./natbug";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The camera's focus box around his head: centre, half width / height, and the four corner marks' arm.
 * Kept inside the canvas (it shrinks a little before it would cross an edge).
 */
export function focusBox(place: NatPlace, H: number, k: number) {
  const cx = place.fx;
  const cy = place.fy - place.fs * 0.14;
  let hw = Math.max(place.faceW * 1.2, place.fs * 0.66);
  let hh = place.fs * 0.9;
  const room = Math.min(cx - 24, CANVAS_W - 24 - cx);
  if (hw > room) hw = Math.max(place.faceW * 0.9, room);
  hh = Math.min(hh, cy - 24, H - 24 - cy);
  const arm = Math.round(Math.min(hw, hh) * 0.34);
  return { cx, cy, hw, hh, arm, sw: Math.max(2.5, 3 * k) };
}

/** Four thin corner marks (a camera's focus box), white with the natural looks' double shadow. */
export function FocusMarks({ id, cx, cy, hw, hh, arm, sw, W, H }: { id: string; cx: number; cy: number; hw: number; hh: number; arm: number; sw: number; W: number; H: number }) {
  const l = cx - hw, r = cx + hw, t = cy - hh, b = cy + hh;
  const d = [
    `M ${l} ${t + arm} L ${l} ${t} L ${l + arm} ${t}`,
    `M ${r - arm} ${t} L ${r} ${t} L ${r} ${t + arm}`,
    `M ${r} ${b - arm} L ${r} ${b} L ${r - arm} ${b}`,
    `M ${l + arm} ${b} L ${l} ${b} L ${l} ${b - arm}`,
  ].join(" ");
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} aria-hidden>
      <defs>
        <filter id={`${id}-sh`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke="#fff" strokeWidth={sw} strokeLinecap="square" filter={`url(#${id}-sh)`} />
    </svg>
  );
}

/**
 * Natural · focus (matchday): his own match photo full-bleed and almost untouched; four thin camera focus
 * marks frame his head (never crossing his face), with a tiny caption beside them — "MATCHDAY" and the day
 * and kick-off — like the readout in a viewfinder. At the foot, on a soft local shade, the fixture: crests
 * either side of HOME v AWAY (exact names), then date · kick-off · venue. The NEYOD logo alone at the top.
 */
export function Natfocus({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 420 : params.side === "right" ? 660 : 540,
    fy: story ? 680 : 500,
    fs: story ? 230 : 160,
  });
  const box = focusBox(place, H, k);

  /* ---- the viewfinder caption, beside the marks ---- */
  const fx_ = natFixture(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const sub = [fx_.date, fx_.kickoff].filter(Boolean).join("  ·  ");
  const capK = 16 * k * ts;
  const subK = 14 * k * ts;
  const capW = Math.max(capsEm(kicker, 0.34) * capK, capsEm(sub, 0.22) * subK) + 14 * k + 10;
  const gap = Math.round(26 * k);
  const M = story ? 64 : 52;
  const leftRoom = box.cx - box.hw - gap - M;
  const rightRoom = CANVAS_W - M - (box.cx + box.hw + gap);
  const prefer = box.cx > CANVAS_W / 2 ? "left" : "right";
  const capSide: "left" | "right" | "above" =
    (prefer === "left" ? leftRoom : rightRoom) >= capW ? prefer : (prefer === "left" ? rightRoom : leftRoom) >= capW ? (prefer === "left" ? "right" : "left") : "above";
  const capTop = Math.max(story ? STORY_TOP : 40, capSide === "above" ? box.cy - box.hh - gap - capK - 10 * k - subK : box.cy - box.hh) + (params.textY ?? 0);

  /* ---- the logo: top centre, or the top corner away from his head ---- */
  const lw = logoWidth(24, story) * (params.logoScale ?? 1);
  const lh = story ? 88 : 52;
  const lTop = story ? STORY_TOP : 46;
  const capL = capSide === "left" ? box.cx - box.hw - gap - capW : capSide === "right" ? box.cx + box.hw + gap : box.cx - box.hw;
  const clash = (l: number) =>
    (l < box.cx + box.hw + 30 && l + lw > box.cx - box.hw - 30 && lTop + lh + 30 > box.cy - box.hh) ||
    (l < capL + capW + 30 && l + lw > capL - 30 && lTop + lh + 30 > capTop);
  const lxs = { center: (CANVAS_W - lw) / 2, left: M, right: CANVAS_W - M - lw } as const;
  const free = (["center", box.cx > CANVAS_W / 2 ? "left" : "right", box.cx > CANVAS_W / 2 ? "right" : "left"] as const).find((x) => !clash(lxs[x]));
  // No room at the top (his head up there): the logo closes the foot, under the fixture.
  const lx = free ?? "center";
  const logoFoot = !free;
  const bottomY = story ? STORY_BOTTOM : CANVAS_H - 50;
  const logoTop = (logoFoot ? bottomY - lh : lTop) - (params.logoY ?? 0);
  const sc = params.logoScale ?? 1;

  /* ---- the foot, bottom-up ---- */
  const footBottom = (logoFoot ? bottomY - lh - Math.round(60 * k) : bottomY) - (params.textY ?? 0);
  const lineSize = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(fx_.line, 0.24)));
  const lineTop = footBottom - lineSize;
  const crest = Math.round(44 * k);
  const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
  const fixSize = Math.min(20 * k * ts, (CANVAS_W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
  const rowTop = lineTop - (fx_.line ? 20 * k : 0) - crest;
  const shadeTop = rowTop - (story ? 300 : 230);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* Soft, edgeless shades: a lens-like vignette at the logo, a local one at the foot for the fixture. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${story ? 820 : 760}px ${story ? 600 : 480}px at ${lx === "center" ? "50%" : lx} ${logoFoot ? "bottom" : "top"}, rgba(0,0,0,${logoFoot ? 0 : 0.28}), rgba(0,0,0,.12) 45%, rgba(0,0,0,0) 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.4) 40%, rgba(6,10,6,.64) 75%, rgba(6,10,6,.68))" }} />

      <FocusMarks id="nf" {...box} W={CANVAS_W} H={H} />

      {/* The viewfinder readout. */}
      <div
        style={{
          position: "absolute",
          top: capTop,
          left: capL,
          width: capW,
          display: "flex",
          flexDirection: "column",
          alignItems: capSide === "left" ? "flex-end" : "flex-start",
          gap: Math.round(10 * k),
          fontFamily: SANS,
          color: "#fff",
          textShadow: `0 1px 3px rgba(0,0,0,.62), 0 0 14px rgba(0,0,0,.3), ${NAT_SHADOW}`,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: Math.round(10 * k), fontWeight: 700, fontSize: capK, lineHeight: 1, letterSpacing: "0.34em", marginRight: capSide === "left" ? "-0.34em" : 0 }}>
          <span style={{ width: Math.round(8 * k), height: Math.round(8 * k), borderRadius: "50%", background: "#e5322d", boxShadow: "0 0 6px rgba(229,50,45,.55)", flexShrink: 0 }} />
          {kicker}
        </div>
        {sub && <div style={{ fontWeight: 700, fontSize: subK, lineHeight: 1, letterSpacing: "0.22em", marginRight: capSide === "left" ? "-0.22em" : 0 }}>{sub}</div>}
      </div>

      {/* The fixture foot. */}
      <div style={{ position: "absolute", left: 50, right: 50, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
        {crestImg(fx_.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,.45)" }}>
          {fx_.homeName.toUpperCase()}
          <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
          {fx_.awayName.toUpperCase()}
        </div>
        {crestImg(fx_.awayCrest)}
      </div>
      {fx_.line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", opacity: 0.9, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
          {fx_.line}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{
          position: "absolute",
          top: logoTop,
          ...(lx === "center" ? { left: "50%", transform: `translateX(-50%) scale(${sc})` } : lx === "left" ? { left: M, transform: `scale(${sc})` } : { right: M, transform: `scale(${sc})` }),
          transformOrigin: `${lx} ${logoFoot ? "bottom" : "top"}`,
        }}
      />
    </div>
  );
}
