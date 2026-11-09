/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · stamp (matchday): his own match photo full-bleed and almost untouched (light grade only), with
 * one small round seal set on a calm part of the photo (stands / sky, on the side away from his face): a thin
 * double ring with "MATCHDAY · 12:00" set around it and the day of the match in the middle. At the foot, over
 * a soft local shade on the grass, the fixture — crests either side of HOME v AWAY (exact names), then
 * date · kick-off · venue. The NEYOD logo alone at the top.
 */
export function Natstamp({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 640 : 520,
    fs: story ? 236 : 160,
  });
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);

  /* ---- the seal ---- */
  const fx_ = natFixture(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const ring = [kicker, fx_.kickoff].filter(Boolean).join("  ·  ");
  const [day, mon] = fx_.date ? fx_.date.split(" ") : ["", ""];
  const seal = sealSpot(place, Math.round(122 * k * ts), story ? STORY_TOP + 88 + 70 : 46 + 52 + 64, H, params.textY ?? 0);

  /* ---- the foot, bottom-up ---- */
  const R = seal.R;
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 50;
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

      {/* Soft local shades: top for the logo, the foot for the fixture. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.4) 40%, rgba(6,10,6,.66) 75%, rgba(6,10,6,.7))" }} />

      <Seal id="ns" cx={seal.cx} cy={seal.cy} R={R} ring={ring} rotate={-12}>
        {day ? (
          <>
            <text x={0} y={R * 0.12} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: R * 0.56, fill: "#fff", letterSpacing: "-0.01em" }}>
              {day}
            </text>
            <text x={0} y={R * 0.36} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 600, fontSize: R * 0.13, fill: "#fff", letterSpacing: "0.32em" }}>
              {mon}
            </text>
          </>
        ) : (
          <circle r={R * 0.05} fill="#fff" />
        )}
      </Seal>

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
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

/**
 * Where the seal goes: in the upper part of the photo, on the side away from his face (the stands / sky),
 * level with his head and clear of it (the seal shrinks, down to 0.72×, to keep that clearance), never above
 * `minTop`. Returns the centre and the radius to use.
 */
export function sealSpot(place: NatPlace, R0: number, minTop: number, H: number, nudgeY: number, M = 64) {
  const faceLeft = place.fx < CANVAS_W / 2;
  // Room between the canvas edge and his head (hair and ears ≈ 1.25 face widths from the face centre).
  const room = faceLeft ? CANVAS_W - M - (place.fx + place.faceW * 1.25) : place.fx - place.faceW * 1.25 - M;
  const R = Math.round(Math.max(R0 * 0.72, Math.min(R0, room / 2)));
  const cx = faceLeft ? CANVAS_W - M - R : M + R;
  const hairTop = place.fy - place.fs * 0.85;
  let cy = Math.max(minTop + R, hairTop + R * 0.35);
  // Still reaching into his head's column: lift it above his hair.
  if (room < 2 * R) cy = Math.max(minTop + R, hairTop - R - 30);
  cy = Math.min(cy, H * 0.42) + nudgeY;
  return { cx, cy, R };
}

/** A thin double ring with a phrase set around it (repeated to close the circle), content in the middle. */
export function Seal({ id, cx, cy, R, ring, rotate = 0, children }: { id: string; cx: number; cy: number; R: number; ring: string; rotate?: number; children?: ReactNode }) {
  const unit = `${ring}  ·  `;
  const tracking = 0.22;
  // Repeat the phrase as often as it fits at a small size, then grow the caps (and the band) to close the loop.
  const unitEm = capsEm(unit, tracking);
  const circ0 = 2 * Math.PI * R * 0.84;
  const reps = Math.max(1, Math.floor(circ0 / (unitEm * R * 0.11)));
  const fs = Math.min(R * 0.15, circ0 / (unitEm * reps * 1.02));
  const band = Math.max(R * 0.22, fs / 0.5);
  const rt = R - band / 2 - R * 0.01; // text circle (cap centre ≈ middle of the band)
  const r0 = rt - fs * 0.36; // baseline radius so the caps sit centred in the band
  const shown = unit.repeat(reps).replace(/ /g, "\u00a0"); // spaces kept at the loop's seam
  const sw = Math.max(2, R * 0.016);
  return (
    <svg width={R * 2 + 40} height={R * 2 + 40} viewBox={`${-R - 20} ${-R - 20} ${R * 2 + 40} ${R * 2 + 40}`} style={{ position: "absolute", left: cx - R - 20, top: cy - R - 20, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={`${id}-sh`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
        </filter>
        <path id={`${id}-path`} d={`M ${-r0} 0 a ${r0} ${r0} 0 1 1 ${2 * r0} 0 a ${r0} ${r0} 0 1 1 ${-2 * r0} 0`} />
      </defs>
      {/* A faint tint inside the ring: the seal reads on a white sky too. */}
      <circle r={R} fill="rgba(8,12,8,.16)" />
      <g filter={`url(#${id}-sh)`} transform={`rotate(${rotate})`}>
        <circle r={R} fill="none" stroke="#fff" strokeWidth={sw} />
        <circle r={R - band} fill="none" stroke="#fff" strokeWidth={sw * 0.7} />
        <text style={{ fontFamily: SANS, fontWeight: 700, fontSize: fs, fill: "#fff", letterSpacing: `${tracking}em` }}>
          <textPath href={`#${id}-path`} textLength={2 * Math.PI * r0 * 0.995} lengthAdjust="spacing">
            {shown}
          </textPath>
        </text>
      </g>
      <g filter={`url(#${id}-sh)`}>{children}</g>
    </svg>
  );
}
