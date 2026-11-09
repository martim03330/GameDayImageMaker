/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Echo, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, BEBAS, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { mix } from "./wall";

const WHITE = "#ffffff";
const TIGHT = "0 2px 14px rgba(0,0,0,.55)";
const LIFT = "drop-shadow(0 4px 14px rgba(0,0,0,.4))";
/** Bebas Neue: average advance of digits and the point, relative to the font size. */
const BEBAS_RATIO = 0.4;

const FACE_H: Record<string, number> = { chest: 210, waist: 160, knees: 120, full: 92 };

/** "36,1" / "36.1 km/h" → "36.1": the number only, with an English decimal point. */
function speedOf(raw: string | undefined): string {
  const n = (raw ?? "").replace(",", ".").match(/\d+(\.\d+)?/)?.[0];
  return n ?? "00.0";
}

/** Small spaced caps, the only other type on the post. */
function Caps({ children, size = 22, style }: { children: React.ReactNode; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: size, letterSpacing: "0.42em", paddingLeft: "0.42em", color: WHITE, textShadow: TIGHT, whiteSpace: "nowrap", ...style }}>
      {children}
    </div>
  );
}

/**
 * Top speed: one number and "KM/H", nearly nothing else. The backdrop is a photo the user picks
 * (a motion-blurred shot reads as speed by itself) or his own photo smeared sideways. Three layouts:
 * a giant number his head passes in front of, a slanted number leaving a trail, and a quiet serif
 * figure on a thin line. "Só a velocidade" drops the title, subtitle and name.
 */
export function Topspeed({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 36);
  const roll = r();
  const kind = roll < 0.45 ? "giant" : roll < 0.75 ? "trail" : "line";
  const only = !!content.speedOnly;
  const speed = speedOf(content.speed);
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;

  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const night = mix(shade(accent, -0.85), "#06080d", 0.7);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const title = (content.kicker || "TOP SPEED").toUpperCase();
  const right = params.side !== "left";

  // ---- the player ----
  const faceX = kind === "giant" ? 540 + (right ? 1 : -1) * (20 + r() * 40) : right ? 700 + r() * 40 : 380 - r() * 40;
  const faceTop = kind === "giant" ? 560 : 300 + r() * 40;
  const fig = placeByFace(data, faceX, faceTop, FACE_H);
  const figure = data.photoUrl && (
    <img
      src={data.photoUrl}
      alt=""
      style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) drop-shadow(0 26px 50px rgba(0,0,0,.5))", ...cutMask(data.cut) }}
    />
  );

  // ---- the backdrop: a picked photo as it is (lightly softened), else his own photo smeared sideways ----
  const picked = !!content.backdropPhotoId && !!data.bgPhotoUrl;
  const bid = `ts-${(params.seed ?? 36) % 997}`;
  const backdrop = data.bgPhotoUrl && (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <filter id={`${bid}-smear`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={picked ? "6 2" : "70 6"} />
        </filter>
      </defs>
      <image
        href={data.bgPhotoUrl}
        x={-120}
        y={-60}
        width={CANVAS_W + 240}
        height={CANVAS_H + 120}
        preserveAspectRatio="xMidYMid slice"
        filter={`url(#${bid}-smear)`}
        style={{ filter: `saturate(${picked ? 0.95 : 0.9}) brightness(${picked ? 0.5 : 0.55}) contrast(1.08)` }}
      />
    </svg>
  );
  const shadeOver = (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${night}ee 0%, ${night}99 32%, ${night}33 58%, ${night}ee 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    </>
  );

  const crest = data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain", filter: LIFT }} />;
  const logo = (bottom: number, side?: "left" | "right") => (
    <div style={{ position: "absolute", bottom, ...(side ? { [side]: 64 } : { left: 0, right: 0, display: "flex", justifyContent: "center" }) }}>
      <AgencyLogo data={data} height={30 * (params.logoScale ?? 1)} style={{ maxWidth: "none", filter: "drop-shadow(0 3px 12px rgba(0,0,0,.7))" }} />
    </div>
  );

  if (kind === "giant") {
    // The number fills the width above him: nothing may cover it (a head over the point reads "36 1").
    const size = Math.min(420, (CANVAS_W - 160) / Math.max(2.5, speed.length * BEBAS_RATIO)) * ts;
    const numTop = 120 + ty;
    return (
      <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: night }}>
        {backdrop}
        {shadeOver}
        <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: numTop, textAlign: "center", fontFamily: BEBAS, fontSize: size, lineHeight: 0.8, color: WHITE, letterSpacing: "-0.01em", textShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
          {speed}
        </div>
        {figure}
        <div style={{ position: "absolute", left: 0, right: 0, top: numTop + size * 0.8 + 6, display: "flex", justifyContent: "center" }}>
          <Caps size={30 * ts} style={{ fontWeight: 800 }}>KM/H</Caps>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 54 + ty, display: "flex", justifyContent: "center" }}>{!only && <Caps size={22 * ts}>{title}</Caps>}</div>
        {!only && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 124, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Caps size={28 * ts} style={{ fontWeight: 800 }}>{name}</Caps>
            {content.subline && <Caps size={18 * ts} style={{ fontWeight: 600, opacity: 0.8 }}>{content.subline.toUpperCase()}</Caps>}
          </div>
        )}
        {logo(52, right ? "left" : "right")}
        <Film strength={0.7} />
      </div>
    );
  }

  if (kind === "trail") {
    // A slanted number on the free side, with fading copies streaming back the way he came.
    const size = Math.min(330, 470 / Math.max(2.5, speed.length * BEBAS_RATIO)) * ts;
    const back = right ? -1 : 1;
    const nx = right ? 150 : CANVAS_W - 150;
    const ny = 700 + ty;
    const num = (o: number, dx: number, i: number) => (
      <div
        key={i}
        data-bleed={i ? true : undefined}
        style={{
          position: "absolute",
          ...(right ? { left: nx + dx } : { right: CANVAS_W - nx - dx }),
          top: ny,
          fontFamily: BEBAS,
          fontStyle: "italic",
          fontSize: size,
          lineHeight: 0.8,
          color: WHITE,
          opacity: o,
          transform: "skewX(-12deg)",
          filter: i ? `blur(${i * 1.5}px)` : undefined,
          textShadow: i ? undefined : "0 16px 50px rgba(0,0,0,.45)",
          whiteSpace: "nowrap",
        }}
      >
        {speed}
      </div>
    );
    return (
      <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: night }}>
        {backdrop}
        {shadeOver}
        {data.photoUrl && <Echo data={data} box={fig} color={mix(accent, WHITE, 0.55)} count={4} dx={right ? 60 : -60} />}
        {[4, 3, 2, 1].map((i) => num(0.1 + (4 - i) * 0.05, back * i * 46, i))}
        {figure}
        {/* In front of him: an arm across the number would hide a digit. */}
        {num(1, 0, 0)}
        <div style={{ position: "absolute", ...(right ? { left: nx + 8 } : { right: CANVAS_W - nx + 8 }), top: ny + size * 0.8 + 18, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 14 }}>
          <Caps size={30 * ts} style={{ fontWeight: 800, paddingLeft: 0 }}>KM/H</Caps>
          {!only && <Caps size={20 * ts} style={{ fontWeight: 600, opacity: 0.85, paddingLeft: 0 }}>{title}</Caps>}
        </div>
        <div style={{ position: "absolute", ...(right ? { left: 64 } : { right: 64 }), top: 60 + ty, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 16 }}>
          {crest}
          {!only && <Caps size={22 * ts} style={{ fontWeight: 800, paddingLeft: 0 }}>{name}</Caps>}
          {!only && content.subline && <Caps size={16 * ts} style={{ fontWeight: 600, opacity: 0.75, paddingLeft: 0 }}>{content.subline.toUpperCase()}</Caps>}
        </div>
        {/* On the free side: centred, it would sit on his boots. */}
        {logo(52, right ? "left" : "right")}
        <Film strength={0.7} />
      </div>
    );
  }

  // "line": a light serif figure on a hairline that runs the width, like a speedometer reading.
  const size = Math.min(250, 520 / Math.max(2.5, speed.length * 0.5)) * ts;
  const baseY = 1080 + ty;
  const x0 = right ? 70 : CANVAS_W - 70;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: night }}>
      {backdrop}
      {shadeOver}
      {figure}
      <div style={{ position: "absolute", left: 0, right: 0, top: baseY, height: 2, background: `linear-gradient(${right ? 90 : 270}deg, ${WHITE}, ${WHITE}aa 45%, transparent)` }} />
      <div style={{ position: "absolute", ...(right ? { left: x0 } : { right: CANVAS_W - x0 }), top: baseY - size * 0.78, display: "flex", alignItems: "baseline", gap: 18, flexDirection: right ? "row" : "row-reverse", textShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
        <span style={{ fontFamily: DMSERIF, fontSize: size, lineHeight: 0.78, color: WHITE, whiteSpace: "nowrap" }}>{speed}</span>
        <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: size * 0.26, color: WHITE, whiteSpace: "nowrap" }}>km/h</span>
      </div>
      {!only && (
        <div style={{ position: "absolute", ...(right ? { left: x0 } : { right: CANVAS_W - x0 }), top: baseY + 26, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 12 }}>
          <Caps size={22 * ts} style={{ fontWeight: 800, paddingLeft: 0 }}>{`${title}  ·  ${name}`}</Caps>
          {content.subline && <Caps size={16 * ts} style={{ fontWeight: 600, opacity: 0.75, paddingLeft: 0 }}>{content.subline.toUpperCase()}</Caps>}
        </div>
      )}
      <div style={{ position: "absolute", ...(right ? { left: x0 } : { right: CANVAS_W - x0 }), top: 60 }}>{crest}</div>
      {logo(48)}
      <Film strength={0.7} />
    </div>
  );
}
