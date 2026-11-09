"use client";
/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { NAT_TEXT_SHADOW, logoSpot, lumIn, spanOf, useNatScan } from "./nathorizon";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/** Rough width of mixed-case Inter at 1px (for fitting the name). */
function textEm(t: string): number {
  let em = 0;
  for (const ch of t.normalize("NFD").replace(/\p{M}/gu, "")) em += /[A-Z]/.test(ch) ? (/[MW]/.test(ch) ? 0.86 : /I/.test(ch) ? 0.3 : 0.68) : /[mw]/.test(ch) ? 0.86 : /[ijl]/.test(ch) ? 0.3 : /[frt]/.test(ch) ? 0.4 : ch === " " ? 0.27 : 0.6;
  // Set in a bold weight: a little wider.
  return em * 1.06;
}

/**
 * Natural goal · focus: his real celebration photo full-bleed (light grade only) with four thin camera focus
 * brackets locked on his head — corner marks only, never over his face — and, beside them, a tiny caption
 * like a viewfinder readout: "GOAL" in spaced caps, his name, his club's exact name. The NEYOD logo alone at
 * the top. No score.
 */
export function Goalnatfocus({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const W = CANVAS_W;
  const M = story ? 70 : 62;

  const place = natPlace(data, W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 660 : 450,
    fs: story ? 230 : 160,
  });
  const scanned = useNatScan(place, W, H);

  /* ---- the brackets: locked on his head (hair to chin) ---- */
  const { fx, fy, fs } = place;
  const half = Math.max(place.faceW * 0.98, fs * 0.76);
  const box = { left: fx - half, right: fx + half, top: fy - fs * 1.05, bottom: fy + fs * 0.74 };
  const arm = Math.round(Math.min(box.right - box.left, box.bottom - box.top) * 0.2);
  const stroke = story ? 3.4 : 2.6;

  /* ---- the caption beside them, on the clearer side ---- */
  const label = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const club = ourClub(data).toUpperCase();
  const gap = 36 * k;
  const labelSize0 = 15 * k * ts;
  const nameSize0 = 34 * k * ts;
  const clubSize0 = 13 * k * ts;
  const need = (s: number) => Math.max(capsEm(label, 0.42) * labelSize0 * s, Math.max(textEm(first), textEm(last)) * nameSize0 * s, capsEm(club, 0.26) * clubSize0 * s);
  const capH = labelSize0 + 22 * k + nameSize0 * 2.1 + 18 * k + clubSize0;
  // The NEYOD logo alone along the top (a corner when his head is under the centre).
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoAt = logoSpot(scanned, place, W, logoTop, logoH, M);
  // Level with the brackets' top, else slid down beside them; on the side and at the height where his
  // figure (hair, a raised fist, a team-mate's arm) leaves the caption most room.
  const top0 = Math.max(logoTop + logoH + 56 * k, box.top + arm * 0.2);
  const tops = [top0, Math.max(top0, (box.top + box.bottom) / 2 - capH / 2), Math.max(top0, box.bottom - arm * 0.2 - capH)];
  type Spot = { side: "left" | "right"; top: number; edge: number; sc: number; score: number };
  let spot: Spot | null = null;
  for (const side of ["left", "right"] as const)
    tops.forEach((t, i) => {
      const fig = scanned && spanOf(scanned, t - 10, t + capH + 10);
      const edge = side === "left" ? Math.min(box.left, fig ? fig[0] : box.left) - gap : Math.max(box.right, fig ? fig[1] : box.right) + gap;
      const room = side === "left" ? edge - M : W - M - edge;
      const sc = Math.min(1, room / need(1));
      // Prefer: legible, level with the brackets, not under a corner logo.
      const score = sc - i * 0.04 - (logoAt === side ? 0.3 : 0);
      if (!spot || score > spot.score) spot = { side, top: t, edge, sc, score };
    });
  const { side, top, edge } = spot!;
  const sc = Math.max(0.6, spot!.sc);

  // Ink: white with a soft double shade; on a blown-out white sky (no shade can hold small type there) a
  // deep ink instead, brackets and readout alike.
  const capX0 = side === "left" ? M : edge;
  const capX1 = side === "left" ? edge : W - M;
  const bright = lumIn(scanned, capX0, top, capX1, top + capH * sc);
  const dark = bright !== null && bright > 0.78;
  const ink = dark ? "#14181f" : OFF_WHITE;
  const logoLum = lumIn(scanned, W / 2 - logoH * 1.7, logoTop, W / 2 + logoH * 1.7, logoTop + logoH);
  const logoLight = dark && logoAt === "center" && logoLum !== null && logoLum > 0.8;
  const shadow = dark ? "0 0 12px rgba(255,255,255,.55)" : NAT_TEXT_SHADOW;

  const corner = (x: number, y: number, dx: number, dy: number, key: string) => (
    <path key={key} d={`M ${x + dx * arm} ${y} L ${x} ${y} L ${x} ${y + dy * arm}`} fill="none" stroke={dark ? ink : "#ffffff"} strokeWidth={stroke} strokeLinecap="square" />
  );

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}

      {/* A breath of shade at the top for the logo. */}
      {!logoLight && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.2), rgba(0,0,0,0))" }} />}

      {/* The focus brackets. */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="gnf-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.6" floodColor={dark ? "#fff" : "#000"} floodOpacity={dark ? 0.3 : 0.45} />
            <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor={dark ? "#fff" : "#000"} floodOpacity={dark ? 0.2 : 0.25} />
          </filter>
        </defs>
        <g filter="url(#gnf-soft)">
          {corner(box.left, box.top, 1, 1, "tl")}
          {corner(box.right, box.top, -1, 1, "tr")}
          {corner(box.left, box.bottom, 1, -1, "bl")}
          {corner(box.right, box.bottom, -1, -1, "br")}
        </g>
      </svg>

      {/* The readout beside them. */}
      <div
        style={{
          position: "absolute",
          top,
          ...(side === "left" ? { right: W - edge, textAlign: "right" as const } : { left: edge, textAlign: "left" as const }),
          display: "flex",
          flexDirection: "column",
          alignItems: side === "left" ? "flex-end" : "flex-start",
          fontFamily: SANS,
          color: ink,
          whiteSpace: "nowrap",
          textShadow: shadow,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: labelSize0 * sc, lineHeight: 1, letterSpacing: "0.42em", marginRight: side === "left" ? "-0.42em" : 0 }}>{label}</div>
        <div style={{ width: 28 * k * sc, height: Math.max(1, Math.round(1.5 * k)), background: ink, margin: `${14 * k * sc}px 0 ${12 * k * sc}px`, boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,.4)" }} />
        {first && <div style={{ fontWeight: 500, fontSize: nameSize0 * sc, lineHeight: 1.05, letterSpacing: "-0.01em" }}>{first}</div>}
        {last && <div style={{ fontWeight: 700, fontSize: nameSize0 * sc, lineHeight: 1.05, letterSpacing: "-0.01em" }}>{last}</div>}
        {club && <div style={{ fontWeight: 600, fontSize: clubSize0 * sc, lineHeight: 1, letterSpacing: "0.26em", marginRight: side === "left" ? "-0.26em" : 0, marginTop: 16 * k * sc, opacity: 0.9 }}>{club}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        onLight={logoLight}
        style={{
          position: "absolute",
          top: logoTop,
          ...(logoAt === "center"
            ? { left: "50%", transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }
            : logoAt === "left"
              ? { left: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }
              : { right: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }),
        }}
      />
    </div>
  );
}
