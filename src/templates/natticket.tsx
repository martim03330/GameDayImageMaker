/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { BARCODE } from "./fx";
import { matchFacts } from "./strokes";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#fbf9f4";
const INK = "#17191e";

/** The club colour as a thin accent on the paper (dark-tone primary → accent; too light → ink). */
function accentOf(data: RenderData): string {
  const { primary, accent } = data.params;
  const pick = !primary || primary.toLowerCase() === "#10131c" ? accent : primary;
  const hex = (pick ?? "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return INK;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 170 ? INK : `#${hex}`;
}

/**
 * Natural · ticket (matchday): his own match photo full-bleed and otherwise untouched (light grade only), and
 * one idea: a small clean match ticket — white paper, perforated stub with round notches, soft shadow, a slight
 * tilt — placed in the clear lower corner away from him. On it: "MATCHDAY" header, HOME v AWAY (exact names,
 * home first), date, kick-off and venue, and a barcode stub. The NEYOD logo alone at the top centre.
 */
export function Natticket({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const k = (story ? 1.32 : 1) * ts;
  const M = story ? 64 : 56;

  /* ---- him: face in the upper part, set to one side so the ticket gets the other lower corner ---- */
  const fs = story ? 230 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 640;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 720 : 470, fs });
  const room = { left: place.box.left, right: CANVAS_W - (place.box.left + place.box.width) };
  const ticketLeft = params.side === "left" ? false : params.side === "right" ? true : place.fx >= CANVAS_W / 2 || room.left >= room.right;

  /* ---- the fixture ---- */
  const fx = natFixture(data);
  const f = matchFacts(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase();
  const no = f.roundNo ? `No. ${f.roundNo.padStart(2, "0")}` : "";
  const pt = f.timePt && f.timePt !== fx.time ? `${f.timePt} ${f.timeRef || "PT"}` : "";

  const cardW = Math.round(344 * k);
  const pad = Math.round(26 * k);
  const inner = cardW - 2 * pad;
  const stubH = Math.round(80 * k);
  const notch = Math.round(13 * k);
  const teamPx = (name: string) => Math.min(29 * k, inner / Math.max(1, capsEm(name.toUpperCase(), 0.01)));
  const homeName = fx.homeName.toUpperCase();
  const awayName = fx.awayName.toUpperCase();
  const tp = Math.min(teamPx(homeName), teamPx(awayName));

  const label = { fontFamily: SANS, fontWeight: 700, fontSize: 18 * k, letterSpacing: "0.2em", lineHeight: 1, color: INK, opacity: 0.5 } as const;
  const value = { fontFamily: SANS, fontWeight: 700, fontSize: 22 * k, letterSpacing: "0.04em", lineHeight: 1.15, color: INK, whiteSpace: "nowrap" } as const;
  const notchAt = `calc(100% - ${stubH}px)`;
  const mask = `radial-gradient(circle ${notch}px at 0 ${notchAt}, transparent ${notch - 0.5}px, #000 ${notch}px), radial-gradient(circle ${notch}px at 100% ${notchAt}, transparent ${notch - 0.5}px, #000 ${notch}px)`;

  const bottom = story ? H - STORY_BOTTOM + (params.textY ?? 0) : M + 6 + (params.textY ?? 0);
  const tilt = ticketLeft ? -1.6 : 1.6;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  // The logo in the top corner away from his head (never over it).
  const logoLeft = place.fx >= CANVAS_W / 2 ? M + 10 : CANVAS_W - M - 10 - logoW;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The gentlest shade behind the logo only. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + logoH + (story ? 180 : 130), background: "linear-gradient(to bottom, rgba(0,0,0,.26), rgba(0,0,0,0))" }} />

      {/* The ticket: the wrapper carries the shadow (drop-shadow follows the notches), the card the mask. */}
      <div
        style={{
          position: "absolute",
          bottom,
          ...(ticketLeft ? { left: M } : { right: M }),
          width: cardW,
          transform: `rotate(${tilt}deg)`,
          transformOrigin: ticketLeft ? "left bottom" : "right bottom",
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,.22)) drop-shadow(0 14px 26px rgba(0,0,0,.3))",
        }}
      >
        <div style={{ background: PAPER, borderRadius: 10 * k, WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect", color: INK } as CSSProperties}>
          {/* club-colour top edge */}
          <div style={{ height: 8 * k, background: accentOf(data), borderRadius: `${10 * k}px ${10 * k}px 0 0` }} />
          <div style={{ padding: `${22 * k}px ${pad}px ${22 * k}px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ ...label, opacity: 1, fontWeight: 800, letterSpacing: "0.28em" }}>{kicker}</span>
              {no && <span style={{ ...label, letterSpacing: "0.1em" }}>{no}</span>}
            </div>
            <div style={{ height: 1, background: INK, opacity: 0.18, margin: `${16 * k}px 0 ${18 * k}px` }} />
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: tp, lineHeight: 1.05, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{homeName}</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20 * k, lineHeight: 1, opacity: 0.5, margin: `${8 * k}px 0` }}>v</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: tp, lineHeight: 1.05, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{awayName}</div>
            <div style={{ display: "flex", gap: 30 * k, marginTop: 22 * k }}>
              {fx.date && (
                <div>
                  <div style={label}>DATE</div>
                  <div style={{ ...value, marginTop: 8 * k }}>{fx.date}</div>
                </div>
              )}
              {fx.time && (
                <div>
                  <div style={label}>KICK-OFF</div>
                  <div style={{ ...value, marginTop: 8 * k }}>{fx.time}</div>
                  {pt && <div style={{ ...value, fontSize: 18 * k, opacity: 0.55, marginTop: 4 * k }}>{pt}</div>}
                </div>
              )}
            </div>
            {fx.venue && (
              <div style={{ marginTop: 18 * k }}>
                <div style={label}>VENUE</div>
                <div style={{ ...value, fontSize: Math.min(22 * k, Math.max(18 * k, (inner * 2) / Math.max(1, capsEm(fx.venue, 0.04)))), marginTop: 8 * k, whiteSpace: "normal" }}>{fx.venue}</div>
              </div>
            )}
          </div>
          {/* perforation + stub */}
          <div style={{ height: stubH, borderTop: `${2 * k}px dashed rgba(23,25,30,.28)`, margin: `0 ${notch + 4}px`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${pad - notch - 4}px` }}>
            <span style={{ fontFamily: BARCODE, fontSize: 50 * k, lineHeight: 1, color: INK, opacity: 0.85 }}>{`${f.roundNo || "07"}${(fx.date || "").replace(/\s/g, "")}`}</span>
            <span style={{ ...label, opacity: 0.55, letterSpacing: "0.22em" }}>ADMIT ONE</span>
          </div>
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}
