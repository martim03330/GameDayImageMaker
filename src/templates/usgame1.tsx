/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { SLAB } from "./fx";
import { SCRIPT } from "./kit";
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, facesInShot, natFixture, natPlace, type NatPlace } from "./natkit";
import { LogoShade, frameOf } from "./natfree4";
import { linesOf, versusLines } from "./natfree23";
import { dropped } from "./natfree26";
import { fullName, roundTitle, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, clubInk, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/*
 * US college / high-school "gameday" looks (research: scratchpad us-gameday-research.md). Loud, but on the
 * player's real photo: the big type sits BEHIND him (he is redrawn sharp on top — the "athlete spotlight" of the
 * college feeds), the facts in a solid bar at the foot, the NEYOD logo under it.
 */

const M = 40;
export const fitCaps = (t: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(t, tracking)));

export { linesOf, versusLines };

export const ourCrest = (data: RenderData) => {
  const fx = natFixture(data);
  return (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
};

export const CREST_HALO = "drop-shadow(0 0 1.5px rgba(255,255,255,.8)) drop-shadow(0 3px 8px rgba(0,0,0,.35))";

/** A neon tone of the club colour: bright enough to glow on a darkened photo. */
export function neonOf(data: RenderData): string {
  const ink = clubInk(data);
  const l = luminance(ink);
  return l < 0.12 ? shade(ink, 0.55) : l < 0.3 ? shade(ink, 0.35) : ink;
}

/** He stands in the middle, face lower in the frame so the big word has the sky above and behind him. */
export function heroPlace(d: RenderData): NatPlace {
  const { H, story } = frameOf(d);
  const nudge = (d.params.textY ?? 0) * -1;
  return natPlace(d, CANVAS_W, H, { fx: d.params.side === "left" ? 480 : 600, fy: (story ? 820 : 600) + nudge, fs: story ? 215 : 160 });
}

/**
 * The band the word behind him may use: from the top of the safe zone down to his chest, but never over another
 * player's face (it would sit on top of them — only he is redrawn over the type).
 */
export function behindBand(d: RenderData, place: NatPlace): { top: number; bottom: number } {
  const { top, k } = frameOf(d);
  let bottom = place.fy + place.fs * 1.1;
  for (const f of facesInShot(place).slice(1)) if (f.x1 > M && f.x0 < CANVAS_W - M && f.y0 > top + 160 * k) bottom = Math.min(bottom, f.y0 - 16);
  return { top, bottom: Math.max(bottom, top + 230 * k) };
}

/** The photo, the layers behind him, him (sharp, optionally glowing), the layers in front, the logo at the foot. */
export function HeroFrame({ data, place, behind, front, dark = 0, figStyle }: { data: RenderData; place: NatPlace; behind?: ReactNode; front?: ReactNode; dark?: number; figStyle?: CSSProperties }) {
  const { H } = frameOf(data);
  const logoTop = logoTopOf(data, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#11151b", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {dark > 0 && <NatSpot place={place} W={CANVAS_W} H={H} amount={dark} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520, background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      {behind}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} style={figStyle} />
      {front}
      <LogoShade top={logoTop} />
      <Logo data={data} top={logoTop} />
    </div>
  );
}

/** The solid bar at the foot: crests either side, HOME X AWAY (wrapped, never cut), date · kick-off · ground. */
export function MatchBar({ data, title, titleFont = DISPLAY, titleEm = 0.5, bg, border }: { data: RenderData; title?: string; titleFont?: string; titleEm?: number; bg?: string; border?: string }) {
  const { H, k, ts } = frameOf(data);
  const fx = natFixture(data);
  const cH = 86 * k;
  const pad = 24 * k;
  const iw = CANVAS_W - 2 * M - 2 * (cH + 28 * k) - 2 * pad;
  const tPx = title ? Math.min(46 * k * ts, iw / Math.max(1, title.length * titleEm)) : 0;
  const vs = versusLines(data, 28 * k * ts, iw, 0.06, 22 * k);
  const rows = whenRows(data, 19 * k * ts, iw, 0.1);
  const wPx = Math.min(19 * k * ts, ...rows.map((l) => fitCaps(l, 19 * k * ts, iw, 0.1)));
  const inner = (title ? tPx + 12 * k : 0) + vs.lines.length * (vs.px + 8 * k) + rows.length * (wPx + 8 * k);
  const h = Math.max(cH + 2 * pad, inner + 2 * pad);
  const bottom = logoTopOf(data, H) - 34 * k;
  const crest = (c: string | null) => (c ? <img src={c} alt="" style={{ width: cH, height: cH, objectFit: "contain", flexShrink: 0, filter: CREST_HALO }} /> : <div style={{ width: cH }} />);
  const line: CSSProperties = { fontFamily: SANS, fontWeight: 800, letterSpacing: "0.06em", whiteSpace: "nowrap", lineHeight: 1, color: "#fff" };
  return (
    <div style={{ position: "absolute", left: M, right: M, top: bottom - h, height: h, borderRadius: 22 * k, background: bg ?? clubInk(data), border, boxSizing: "border-box", boxShadow: "0 14px 40px rgba(0,0,0,.45)", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 28 * k }}>
      {crest(fx.homeCrest)}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {title && <div style={{ fontFamily: titleFont, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", color: "#fff", marginBottom: 12 * k }}>{title}</div>}
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...line, fontSize: vs.px, marginBottom: 8 * k }}>{l}</div>
        ))}
        {rows.map((l, i) => (
          <div key={i} style={{ ...line, fontWeight: 600, letterSpacing: "0.1em", fontSize: wPx, opacity: 0.88, marginBottom: 8 * k }}>{l}</div>
        ))}
      </div>
      {crest(fx.awayCrest)}
    </div>
  );
}

/** The goal bar: his club's crest, his full name (wrapped, never cut) and his club's exact name. */
export function GoalBar({ data, bg, border }: { data: RenderData; bg?: string; border?: string }) {
  const { H, k, ts } = frameOf(data);
  const cH = 96 * k;
  const pad = 26 * k;
  const iw = CANVAS_W - 2 * M - cH - 28 * k - 2 * pad;
  const name = linesOf(fullName(data), 44 * k * ts, iw, 0.04, 30 * k);
  const club = linesOf(ourClub(data).toUpperCase(), 24 * k * ts, iw, 0.14, 18 * k);
  const inner = name.lines.length * (name.px + 8 * k) + 6 * k + club.lines.length * (club.px + 6 * k);
  const h = Math.max(cH + 2 * pad, inner + 2 * pad);
  const bottom = logoTopOf(data, H) - 34 * k;
  const crest = ourCrest(data);
  const line: CSSProperties = { fontFamily: SANS, fontWeight: 900, whiteSpace: "nowrap", lineHeight: 1, color: "#fff" };
  return (
    <div style={{ position: "absolute", left: M, right: M, top: bottom - h, height: h, borderRadius: 22 * k, background: bg ?? clubInk(data), border, boxSizing: "border-box", boxShadow: "0 14px 40px rgba(0,0,0,.45)", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 28 * k }}>
      {crest && <img src={crest} alt="" style={{ width: cH, height: cH, objectFit: "contain", flexShrink: 0, filter: CREST_HALO }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {name.lines.map((l, i) => (
          <div key={i} style={{ ...line, fontSize: name.px, letterSpacing: "0.04em", marginBottom: 8 * k }}>{l}</div>
        ))}
        {club.lines.map((l, i) => (
          <div key={i} style={{ ...line, fontWeight: 700, fontSize: club.px, letterSpacing: "0.14em", opacity: 0.9, marginTop: i ? 0 : 6 * k, marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Block + script (Kentucky's two-font system) ---------------- */

/**
 * Gameday · script e bloco (matchday): GAMEDAY in Anton across the whole width behind him, and over it — clear of his
 * face — "Matchday 14" in a brush script in his club's colour, white-edged: the block + script pair of the college
 * feeds. The facts in a solid club-colour bar at the foot.
 */
export function Usscriptblock({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, ts } = frameOf(d);
  const place = heroPlace(d);
  const band = behindBand(d, place);
  const px = Math.min((CANVAS_W - 2 * M) / (7 * 0.5), (band.bottom - band.top) * 0.62 / 0.84);
  const y0 = band.bottom - px * 0.84;
  const round = matchFacts(d).roundNo;
  const kick = (d.content.kicker || "Matchday").toLowerCase();
  const script = kick.charAt(0).toUpperCase() + kick.slice(1) + (round ? ` ${round}` : "");
  const sPx = Math.min(150 * k * ts, (CANVAS_W - 160) / Math.max(1, script.length * 0.4));
  // The script sits on the word's top edge, lifted when that would reach his face (it is drawn in front of him).
  const faceTop = place.fy - place.fs * 0.95;
  const sBase = Math.max(band.top + sPx * 0.75, Math.min(y0 + sPx * 0.3, faceTop - 20 * k));
  const ink = clubInk(d);
  return (
    <HeroFrame
      data={d}
      place={place}
      behind={<div style={{ position: "absolute", left: 0, right: 0, top: y0, height: px * 0.84, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.84, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 40px rgba(0,0,0,.35)" }}>GAMEDAY</div>}
      front={
        <>
          <svg width={CANVAS_W} height={sPx * 1.4} style={{ position: "absolute", left: 0, top: sBase - sPx, overflow: "visible" }}>
            <text x={CANVAS_W / 2} y={sPx} textAnchor="middle" transform={`rotate(-6 ${CANVAS_W / 2} ${sPx * 0.7})`} style={{ fontFamily: SCRIPT, fontSize: sPx }} fill={ink} stroke="#fff" strokeWidth={sPx * 0.08} strokeLinejoin="round" paintOrder="stroke">
              {script}
            </text>
          </svg>
          <MatchBar data={d} />
        </>
      }
    />
  );
}

/* ---------------- Varsity jersey number ---------------- */

/**
 * Número varsity (matchday): his shirt number huge behind him in a collegiate slab, the varsity way — club-colour fill,
 * white inline, dark outer outline; MATCHDAY 14 in the same slab on the foot bar with the facts.
 */
export function Usvarsitynumber({ data }: { data: RenderData }) {
  const d = dropped(data);
  const place = heroPlace(d);
  const band = behindBand(d, place);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || (roundTitle(d).match(/\d+/)?.[0] ?? "");
  const ink = clubInk(d);
  const dark = shade(ink, -0.55);
  // Centred behind him (the college way); when his face is well off-centre, the number moves to the free side whole.
  // Centred, his head may sit between the digits (fine) or right on one of them (it would not read): then free side.
  const off = place.fx - CANVAS_W / 2;
  const cW = Math.min(CANVAS_W - 2 * M, ((band.bottom - band.top) / 0.74) * num.length * 0.66) * 0.92;
  const digitAt = (i: number) => CANVAS_W / 2 - cW / 2 + (cW / Math.max(1, num.length)) * (i + 0.5);
  const hidden = [...num].some((_, i) => Math.abs(digitAt(i) - place.fx) < place.faceW * 0.9);
  const freeW = hidden ? (off > 0 ? place.fx - place.faceW - M : CANVAS_W - M - (place.fx + place.faceW)) : 0;
  const bw = freeW > 300 ? freeW : CANVAS_W - 2 * M;
  const cx = freeW > 300 ? (off > 0 ? M + bw / 2 : CANVAS_W - M - bw / 2) : CANVAS_W / 2;
  const px = Math.min(bw / Math.max(1, num.length * 0.66), (band.bottom - band.top) / 0.74);
  const base = band.bottom;
  const txt = (stroke: string, sw: number, fill: string) => (
    <text x={cx} y={base} textAnchor="middle" style={{ fontFamily: SLAB, fontSize: px }} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke">
      {num}
    </text>
  );
  return (
    <HeroFrame
      data={d}
      place={place}
      behind={
        num ? (
          <svg width={CANVAS_W} height={base + 40} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 12px 30px rgba(0,0,0,.4))" }}>
            {txt(dark, px * 0.11, dark)}
            {txt("#fff", px * 0.065, ink)}
          </svg>
        ) : null
      }
      front={<MatchBar data={d} title={roundTitle(d)} titleFont={SLAB} titleEm={0.66} bg={dark} border={`${4 * frameOf(d).k}px solid #fff`} />}
    />
  );
}

/* ---------------- Neon & glow ---------------- */

/** A word in neon tube: a white core with a halo of the club's neon colour, drawn as an outline. */
function NeonWord({ text, px, top, color }: { text: string; px: number; top: number; color: string }) {
  const id = `neon-${text}`;
  return (
    <svg width={CANVAS_W} height={px * 1.1} style={{ position: "absolute", left: 0, top, overflow: "visible" }}>
      <defs>
        <filter id={id} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation={px * 0.035} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text x={CANVAS_W / 2} y={px * 0.86} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke={color} strokeWidth={px * 0.05} filter={`url(#${id})`}>
        {text}
      </text>
      <text x={CANVAS_W / 2} y={px * 0.86} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke="#fff" strokeWidth={px * 0.016}>
        {text}
      </text>
    </svg>
  );
}

const neonFig = (c: string): CSSProperties => ({ filter: `drop-shadow(0 0 3px #fff) drop-shadow(0 0 14px ${c}) drop-shadow(0 0 36px ${c})` });

/** Néon · gameday (matchday): the photo darkened around him, a neon glow in his club's colour around his outline, GAMEDAY in neon tube behind him, the facts on a dark bar with a neon edge. */
export function Usneongameday({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const place = heroPlace(d);
  const band = behindBand(d, place);
  const neon = neonOf(d);
  const px = Math.min((CANVAS_W - 2 * M) / (7 * 0.5), (band.bottom - band.top) * 0.9);
  return (
    <HeroFrame
      data={d}
      place={place}
      dark={0.55}
      figStyle={neonFig(neon)}
      behind={<NeonWord text="GAMEDAY" px={px} top={band.bottom - px * 0.95} color={neon} />}
      front={<MatchBar data={d} title={roundTitle(d)} bg="rgba(10,12,16,.82)" border={`${3 * k}px solid ${neon}`} />}
    />
  );
}

/** Golo · néon (goal): the neon glow around him, GOAL in neon tube behind, his name and club on a dark neon-edged bar. */
export function Goalusneon({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const place = heroPlace(d);
  const band = behindBand(d, place);
  const neon = neonOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = Math.min((CANVAS_W - 2 * M) / Math.max(1, word.length * 0.52), (band.bottom - band.top) * 0.9);
  return (
    <HeroFrame
      data={d}
      place={place}
      dark={0.55}
      figStyle={neonFig(neon)}
      behind={<NeonWord text={word} px={px} top={band.bottom - px * 0.95} color={neon} />}
      front={<GoalBar data={d} bg="rgba(10,12,16,.82)" border={`${3 * k}px solid ${neon}`} />}
    />
  );
}

/* ---------------- Horizontal motion ---------------- */

/**
 * Golo · rasto horizontal (goal): GOAL huge in italic Anton behind him, dragged by speed — three trailing copies and
 * bold speed lines, every one blurred along x only; his name and club on the foot bar.
 */
export function Goalusmotion({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const place = heroPlace(d);
  const band = behindBand(d, place);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const px = Math.min((CANVAS_W - 160) / Math.max(1, word.length * 0.52), (band.bottom - band.top) / 0.86);
  const base = band.bottom;
  const ink = clubInk(d);
  const lines = [0.12, 0.3, 0.52, 0.7].map((f, i) => ({ y: base - px * 0.86 * (1 - f), w: [520, 380, 600, 300][i] * k, x: [-40, 120, -80, 60][i] }));
  return (
    <HeroFrame
      data={d}
      place={place}
      behind={
        <svg width={CANVAS_W} height={base + 40} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <filter id="usmotion-x" x="-40%" y="0" width="180%" height="100%">
              <feGaussianBlur stdDeviation={`${26 * k} 0`} />
            </filter>
          </defs>
          {lines.map((l, i) => (
            <rect key={i} x={l.x} y={l.y} width={l.w} height={12 * k} rx={6 * k} fill={i % 2 ? "#fff" : ink} opacity={0.75} filter="url(#usmotion-x)" />
          ))}
          {/* Italic by a skew; the translate puts the skewed word back in the middle at its baseline. */}
          <g transform={`translate(${base * Math.tan((10 * Math.PI) / 180)} 0) skewX(-10)`}>
            {[0.15, 0.3, 0.5].map((o, i) => (
              <text key={i} x={CANVAS_W / 2 - (3 - i) * 70 * k} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff" opacity={o} filter="url(#usmotion-x)">
                {word}
              </text>
            ))}
            <text x={CANVAS_W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px, filter: "drop-shadow(0 10px 30px rgba(0,0,0,.35))" }} fill="#fff">
              {word}
            </text>
          </g>
        </svg>
      }
      front={<GoalBar data={d} />}
    />
  );
}
