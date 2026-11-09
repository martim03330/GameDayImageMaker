/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { refTag, venueZone } from "@/lib/timezone";
import { ourClub } from "./goalnatcaption";
import { NAT_GRADE, NatFigure, natFixture, type NatPlace } from "./natkit";
import { LogoShade, frameOf } from "./natfree4";
import { lines3 } from "./natfree23";
import { fullName, whenRows } from "./natfree9";
import { SANS } from "./shared";
import { Logo, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { CREST_HALO, fitCaps, versusLines } from "./usgame1";

/*
 * Shared kit of the "pro" looks (round 32, modelled on the 13 references the user liked — scratchpad liked/):
 * the SAME player at two scales (a huge portrait behind, a smaller full-body figure in front), the round-flag
 * kick-off clock, and the type helpers.
 */

export const M = 44;

type Cut = RenderData["cutouts"][number];
export type Shot = { url: string; face: [number, number, number, number]; aspect: number };

/** A different cutout of him for the big portrait (photo 2 first, facing us, face known), else null. */
function secondOf(d: RenderData): Cut | null {
  const ok = (c: Cut) => !!c.url && c.url !== d.photoUrl && !!c.face && !(c.cut?.top ?? 0) && c.pose !== "back";
  const others = d.cutouts.filter(ok);
  return others.find((c) => c.url === d.photo2Url) ?? others.find((c) => c.pose === "bust") ?? others[0] ?? null;
}

/** His second photo as a shot (a different cutout), or null. */
export function secondShot(d: RenderData): Shot | null {
  const two = secondOf(d);
  return two?.face ? { url: two.url, face: two.face, aspect: two.aspect ?? 0.45 } : null;
}

/** A shot's box sized by its whole height `bodyH`, feet at `feetY`, centred at `cx`. */
export function shotFeet(s: Shot, cx: number, feetY: number, bodyH: number) {
  const fh = s.face[3] * bodyH;
  const cy = feetY - (1 - (s.face[1] + s.face[3] / 2)) * bodyH;
  return shotBox(s, cx, cy, fh);
}

/** The big backdrop portrait: his second photo when there is one, else the chosen photo itself, zoomed. */
export function portraitOf(d: RenderData): Shot | null {
  const two = secondOf(d);
  if (two?.face) return { url: two.url, face: two.face, aspect: two.aspect ?? 0.45 };
  if (!d.photoUrl) return null;
  return { url: d.photoUrl, face: d.face ?? [0.38, 0.08, 0.24, 0.12], aspect: d.photoAspect ?? 0.45 };
}

/** The box a shot takes when its face is centred at (cx, cy), `fh` px tall. */
export function shotBox(s: Shot, cx: number, cy: number, fh: number) {
  const h = fh / s.face[3];
  const w = h * s.aspect;
  return { left: cx - (s.face[0] + s.face[2] / 2) * w, top: cy - (s.face[1] + s.face[3] / 2) * h, width: w, height: h };
}

/**
 * The big portrait: B&W, duotone (grey laid under the club colour) or colour — never blurred. `fade` dissolves its
 * foot into the ground.
 */
export function Portrait({ s, cx, cy, fh, mode = "bw", tint = "#000", opacity = 1, fade = 0, style }: { s: Shot; cx: number; cy: number; fh: number; mode?: "bw" | "duo" | "color"; tint?: string; opacity?: number; fade?: number; style?: CSSProperties }) {
  const b = shotBox(s, cx, cy, fh);
  const mask = fade ? `linear-gradient(to bottom, #000 ${100 - fade}%, transparent)` : undefined;
  const filt = mode === "color" ? `${NAT_GRADE} saturate(.95)` : "grayscale(1) contrast(1.15) brightness(1.02)";
  const box: CSSProperties = { position: "absolute", left: b.left, top: b.top, width: b.width, height: b.height, maxWidth: "none" };
  return (
    <div style={{ position: "absolute", inset: 0, opacity, WebkitMaskImage: mask, maskImage: mask, ...style }}>
      <img src={s.url} alt="" style={{ ...box, filter: filt }} />
      {mode === "duo" && <div style={{ ...box, background: tint, mixBlendMode: "multiply", WebkitMaskImage: `url(${s.url})`, maskImage: `url(${s.url})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }} />}
    </div>
  );
}

export type FrontPlace = NatPlace & { shot?: Shot; img?: { left: number; top: number; width: number; height: number } };

/**
 * His cut-out placed exactly where a look wants it (face centre at (cx, cy), `fh` px tall) — on a designed ground the
 * photo's own framing (which must cover the canvas) is not needed. A photo cut at his knees / waist slides down so the
 * cut stays below the canvas. The "move text" nudge (dropped()) moves him with the type.
 */
export function frontAt(d: RenderData, cx: number, cy: number, fh: number): FrontPlace {
  const { H, story } = frameOf(d);
  const nudge = -(d.params.textY ?? 0);
  const s: Shot | null = d.photoUrl ? { url: d.photoUrl, face: d.face ?? [0.38, 0.08, 0.24, 0.12], aspect: d.photoAspect ?? 0.45 } : null;
  const f = story ? fh : fh * 0.74;
  let y = (story ? cy : cy - 250) + nudge;
  const b0 = s ? shotBox(s, cx, y, f) : { left: cx - f * 2, top: y - f, width: f * 4, height: f * 8 };
  if ((d.cut?.bottom ?? 0) > 0 && b0.top + b0.height < H + 4) y += H + 4 - (b0.top + b0.height);
  const img = s ? shotBox(s, cx, y, f) : b0;
  const faceW = s ? img.width * s.face[2] : f * 0.75;
  return { frame: { bg: null, fig: null, plain: null }, fx: cx, fy: y - nudge, fs: f, faceW, box: img, nudge: { x: 0, y: nudge }, shot: s ?? undefined, img };
}

/** The same, sized by his whole figure: `bodyH` px tall (the cut-out's height), feet at `feetY`. */
export function frontFeet(d: RenderData, cx: number, feetY: number, bodyH: number): FrontPlace {
  const { story } = frameOf(d);
  const f = d.face ?? [0.38, 0.08, 0.24, 0.12];
  const fh = f[3] * bodyH;
  const cy = feetY - (1 - (f[1] + f[3] / 2)) * bodyH;
  return frontAt(d, cx, story ? cy : cy + 250, story ? fh : fh / 0.74);
}

/** His full figure in front, sharp, in colour, with a soft drop shadow. */
export function Front({ d, p, light = false, glow }: { d: RenderData; p: FrontPlace; light?: boolean; glow?: string }) {
  const { H } = frameOf(d);
  const sh = glow ? `drop-shadow(0 0 2px rgba(255,255,255,.9)) drop-shadow(0 0 16px ${glow})` : light ? "drop-shadow(0 20px 24px rgba(0,0,0,.24))" : "drop-shadow(0 18px 30px rgba(0,0,0,.5))";
  if (p.shot && p.img) return <img src={p.shot.url} alt="" style={{ position: "absolute", left: p.img.left, top: p.img.top, width: p.img.width, height: p.img.height, maxWidth: "none", filter: `${NAT_GRADE} ${sh}` }} />;
  return <NatFigure data={d} place={p} W={CANVAS_W} H={H} clean style={{ filter: `${NAT_GRADE} ${sh}` }} />;
}

/** The canvas with the logo (light version on light grounds). */
export function Page({ d, bg, light = false, children }: { d: RenderData; bg: string; light?: boolean; children: ReactNode }) {
  const { H } = frameOf(d);
  const lt = logoTopOf(d, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: bg }}>
      {children}
      {!light && <LogoShade top={lt} />}
      <Logo data={d} top={lt} onLight={light} />
    </div>
  );
}

export const caps = (px: number, tracking: number, weight: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", color });

/* ---------------- Round flags clock ---------------- */

const ISO: Record<string, string> = {
  PT: "PT", SWE: "SE", UK: "GB", ESP: "ES", FRA: "FR", BRT: "BR", USA: "US", NOR: "NO", GER: "DE", ITA: "IT", NED: "NL", BEL: "BE", SUI: "CH", AUT: "AT", DEN: "DK", FIN: "FI", ISL: "IS", IRL: "IE", POL: "PL", CZE: "CZ", SVK: "SK", HUN: "HU", ROU: "RO", BUL: "BG", GRE: "GR", TUR: "TR", CYP: "CY", CRO: "HR", SRB: "RS", SVN: "SI", BIH: "BA", MNE: "ME", MKD: "MK", ALB: "AL", KOS: "XK", UKR: "UA", RUS: "RU", BLR: "BY", LTU: "LT", LVA: "LV", EST: "EE", MDA: "MD", LUX: "LU", MLT: "MT", AND: "AD", ISR: "IL", QAT: "QA", KSA: "SA", UAE: "AE", KUW: "KW", BHR: "BH", OMA: "OM", JOR: "JO", LBN: "LB", SYR: "SY", IRQ: "IQ", IRN: "IR", YEM: "YE", PLE: "PS", EGY: "EG", MAR: "MA", ALG: "DZ", TUN: "TN", LBY: "LY", SDN: "SD", SEN: "SN", GAM: "GM", GNB: "GW", GUI: "GN", SLE: "SL", LBR: "LR", CIV: "CI", GHA: "GH", TOG: "TG", BEN: "BJ", NGA: "NG", CMR: "CM", GAB: "GA", CGO: "CG", COD: "CD", ANG: "AO", ZAM: "ZM", ZIM: "ZW", MOZ: "MZ", RSA: "ZA", KEN: "KE", UGA: "UG", MAD: "MG", MRI: "MU", CPV: "CV", STP: "ST", MLI: "ML", BFA: "BF", ARG: "AR", URU: "UY", PAR: "PY", CHI: "CL", BOL: "BO", PER: "PE", ECU: "EC", COL: "CO", VEN: "VE", MEX: "MX", GUA: "GT", HON: "HN", SLV: "SV", CRC: "CR", PAN: "PA", JAM: "JM", HAI: "HT", DOM: "DO", TRI: "TT", BRB: "BB", BAH: "BS", BER: "BM", CAY: "KY", PUR: "PR", CUB: "CU", CAN: "CA", JPN: "JP", KOR: "KR", CHN: "CN", TPE: "TW", IND: "IN", PAK: "PK", SGP: "SG", AUS: "AU", NZL: "NZ",
};
const US_ZONES = new Set(["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "America/Boise", "America/Detroit", "America/Indiana/Indianapolis", "Pacific/Honolulu"]);

/** The country tag of a time zone ("America/Denver" → USA), or null when unknown. */
function tagOfZone(tz: string | undefined): string | null {
  if (!tz) return null;
  if (US_ZONES.has(tz)) return "USA";
  const t = refTag(tz);
  return t === "PT" && tz !== "Europe/Lisbon" ? null : t;
}

export const emojiOf = (tag: string | null) => {
  const iso = tag ? ISO[tag.split(" ")[0]] : undefined;
  return iso ? [...iso].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("") : null;
};

/** A round flag: the country's flag emoji cropped to a circle with a white ring. */
export function Flag({ tag, size }: { tag: string | null; size: number }) {
  const e = emojiOf(tag);
  if (!e) return null;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, boxShadow: `0 0 0 ${Math.max(2, size * 0.07)}px #fff, 0 3px 8px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <span style={{ fontSize: size * 1.42, lineHeight: 1, fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" }}>{e}</span>
    </div>
  );
}

/** The kick-off as clocks with flags: the local one, and the player's second clock (his country) when it differs. */
export function clocksOf(d: RenderData): { tag: string | null; time: string }[] {
  const c = d.content;
  const fx = natFixture(d);
  if (!fx.time) return [];
  const local = tagOfZone(venueZone(c.venue, d.club?.timezone ?? undefined) ?? d.club?.timezone ?? undefined);
  const out = [{ tag: local, time: fx.time }];
  if (c.timePt && c.timeRef && c.timePt !== fx.time) out.push({ tag: c.timeRef, time: `${c.timePt}${c.timeRef.includes(" ") ? ` ${c.timeRef.split(" ")[1]}` : ""}` });
  return out;
}

export function FlagClock({ d, px, color, gap, dir = "row" }: { d: RenderData; px: number; color: string; gap: number; dir?: "row" | "column" }) {
  const rows = clocksOf(d);
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: dir, gap, alignItems: dir === "row" ? "center" : "flex-start" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: px * 0.4 }}>
          <Flag tag={r.tag} size={px * 1.05} />
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: px, lineHeight: 1, color, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{r.time}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Text blocks ---------------- */

/** Date · ground (the kick-off goes in the flags clock). */
export function dateVenue(d: RenderData) {
  const fx = natFixture(d);
  return [fx.date, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
}

/** The fixture as stacked exact names: HOME / VS / AWAY (each wrapped, never cut). */
export function fixtureLines(d: RenderData, w: number, max: number, min: number) {
  const fx = natFixture(d);
  const h = lines3(fx.homeName.toUpperCase(), max, w, 0.02, min);
  const a = lines3(fx.awayName.toUpperCase(), max, w, 0.02, min);
  const px = Math.min(h.px, a.px);
  return { home: h.lines, away: a.lines, px };
}

/** His full name and his club's exact name, wrapped. */
export function nameLines(d: RenderData, w: number, max: number, min: number) {
  const { k, ts } = frameOf(d);
  const name = lines3(fullName(d), max * ts, w, 0.02, min);
  const club = lines3(ourClub(d).toUpperCase(), 22 * k * ts, w, 0.16, 15 * k);
  return { name, club };
}

/** HOME X AWAY, wrapped (one helper for the small lines). */
export const vsLines = (d: RenderData, max: number, w: number, min: number) => versusLines(d, max, w, 0.04, min);
export { CREST_HALO, fitCaps, whenRows };
