/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SERIF } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { initialsOf } from "./triangles";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#e9e6e0";
const WHITE = "#fbfaf7";

/** Face height on the canvas per framing: a big waist-up player, as in the reference. */
const SIZES: Record<string, number> = { chest: 250, waist: 190, knees: 140, full: 105 };

/**
 * The crest as one hand-painted colour: its dark and coloured parts become ink, its light parts stay
 * paper; the shape is warped by noise (a wobbly painted edge) and broken up by streaky noise (dry brush).
 */
function PaintDefs({ id, ink, seed }: { id: string; ink: string; seed: number }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
        {/* Ink = opacity × darkness (white and pale parts of the crest drop out). */}
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.5 -0.95 -0.2 1.75 -0.12" result="a" />
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={3} seed={seed % 97} result="warp" />
        <feDisplacementMap in="a" in2="warp" scale={26} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.075" numOctaves={3} seed={(seed % 89) + 5} result="streak" />
        <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="sa" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={(seed % 83) + 9} result="speck" />
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.35 0 0 0 0" result="spa" />
        <feComposite in="d" in2="sa" operator="arithmetic" k1={0} k2={1} k3={0.95} k4={-0.5} result="sum" />
        <feComposite in="sum" in2="spa" operator="arithmetic" k1={0} k2={1} k3={1} k4={-0.17} result="sum2" />
        <feColorMatrix in="sum2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 18 -9" result="thr" />
        <feFlood floodColor={ink} result="paint" />
        <feComposite in="paint" in2="thr" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * Grunge on the paper: a soft grey wash creeping in from the edges, a few dark ink smudges and dry
 * scuffs where that wash is heaviest, and sparse specks. The corner with the words stays clean.
 */
function Smudges({ id, seed, flip }: { id: string; seed: number; flip: boolean }) {
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed aria-hidden>
      <defs>
        <filter id={`${id}-wash`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves={4} seed={seed % 91} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.095  0 0 0 0 0.09  -3 0 0 0 1.35" />
        </filter>
        <filter id={`${id}-sm`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.011" numOctaves={5} seed={(seed % 61) + 2} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.075  0 0 0 0 0.07  -9 0 0 0 3.2" result="c" />
          <feGaussianBlur in="c" stdDeviation="1.5" />
        </filter>
        <filter id={`${id}-sp`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={(seed % 71) + 3} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  -30 0 0 0 7.2" />
        </filter>
        <linearGradient id={`${id}-side`} x1={flip ? 1 : 0} y1="0" x2={flip ? 0 : 1} y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.45" stopColor="#fff" stopOpacity={0.25} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-clean`} cx={flip ? "0.78" : "0.22"} cy="0.12" r="0.3">
          <stop offset="0.5" stopColor="#000" stopOpacity={1} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width={CANVAS_W} height={CANVAS_H} fill={`url(#${id}-side)`} />
          <rect width={CANVAS_W} height={CANVAS_H} fill={`url(#${id}-clean)`} />
        </mask>
      </defs>
      <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-wash)`} opacity={0.3} />
      <g mask={`url(#${id}-m)`}>
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-sm)`} opacity={0.6} />
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-sp)`} opacity={0.55} />
      </g>
    </svg>
  );
}

/** Thin corner brackets around a crest (the viewfinder of the reference). */
function Bracketed({ size, color, children }: { size: number; color: string; children: ReactNode }) {
  const arm = size * 0.14;
  const t = 2;
  const corner = (s: CSSProperties) => <div style={{ position: "absolute", width: arm, height: arm, ...s }} />;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {corner({ left: 0, top: 0, borderLeft: `${t}px solid ${color}`, borderTop: `${t}px solid ${color}` })}
      {corner({ right: 0, top: 0, borderRight: `${t}px solid ${color}`, borderTop: `${t}px solid ${color}` })}
      {corner({ left: 0, bottom: 0, borderLeft: `${t}px solid ${color}`, borderBottom: `${t}px solid ${color}` })}
      {corner({ right: 0, bottom: 0, borderRight: `${t}px solid ${color}`, borderBottom: `${t}px solid ${color}` })}
      {children}
    </div>
  );
}

/** Spaced serif caps: size so the line fits `width`. */
const fitSpaced = (t: string, width: number, max: number, track = 0.24) => Math.min(max, width / Math.max(1, [...t].length * (0.7 + track)));

/**
 * Painted-crest matchday (Szoboszlai, Liverbird): grungy off-white paper with dark ink smudges; the
 * club crest repainted huge in one club colour with a rough dry-brush edge, bleeding off the side;
 * the player big, waist-up, slightly desaturated and warm in front of it. Top corner: the post's word
 * and spaced serif caps (NAME / POSITION / CLUB CODE) with the agency logo; the foot darkens to carry
 * the two crests in corner brackets with a round mark between, and one spaced serif line:
 * DATE - KICK-OFF - VENUE - COMPETITION.
 */
export function Emblemart({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 48;
  const r = rng(seed);
  const flip = params.side === "left";
  const ts = params.textScale ?? 1;
  const id = `emb-${seed}`;
  const m = matchFacts(data);

  // ---- colours: the club colour as paint on paper ----
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.6) club = vivid(params.accent);
  const l = luminance(club);
  const ink = l < 0.03 ? "#1c1b1a" : l > 0.4 ? shade(club, -0.35) : l > 0.25 ? shade(club, -0.15) : club;
  const text = l > 0.18 ? shade(club, -0.4) : ink;

  // ---- the painted crest ----
  const crest = data.club?.crestUrl ?? null;
  const cSize = 1080 + r() * 140;
  const cLeft = flip ? -cSize * 0.42 + r() * 60 : CANVAS_W - cSize * 0.62 - r() * 60;
  const cTop = -cSize * 0.18 + r() * 60;
  const tilt = (r() - 0.5) * 10;

  // ---- the player ----
  let faceX = 540 + (flip ? 40 : -40) + (r() - 0.5) * 30;
  let faceTop = 270 + r() * 40;
  let fig = placeByFace(data, faceX, faceTop, SIZES);
  // A big head must clear the words in the top corner (they end ~450px in and ~310px down):
  // slide it away from them first, then lower it if that is not enough.
  const gap = () => (flip ? CANVAS_W - 450 - (faceX + fig.faceH * 0.75) : faceX - fig.faceH * 0.75 - 450);
  if (gap() < 0 && faceTop - fig.faceH * 0.45 < 320) {
    faceX += (flip ? 1 : -1) * Math.max(-110, gap());
    if (gap() < 0) faceTop = 320 + fig.faceH * 0.45;
    fig = placeByFace(data, faceX, faceTop, SIZES);
  }

  // ---- top corner words ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const lines = [name, data.player.position.toUpperCase(), initialsOf(data.club?.name ?? "")].filter(Boolean);
  const capsSize = Math.min(24, ...lines.map((t) => fitSpaced(t, 360, 24, 0.2))) * ts;
  const kicker = content.kicker.trim();
  const kickSize = Math.min(58, 350 / Math.max(3, [...kicker].length * 0.64)) * ts;
  const corner: CSSProperties = flip ? { right: 70, textAlign: "right", alignItems: "flex-end" } : { left: 70, textAlign: "left", alignItems: "flex-start" };

  // ---- foot ----
  const score = scoreOf(data, "-");
  const crests = [m.ourCrest, m.oppCrest];
  // For home games our crest goes first.
  const home = content.home ?? ((content.homeTeam ?? "").toLowerCase() === (data.club?.name ?? "").toLowerCase() ? true : undefined);
  const pair = home === false ? [crests[1], crests[0]] : crests;
  const facts = shortFacts(data, 3);
  const showStats = postType === "potm" && facts.length > 0;

  let mid: ReactNode;
  if ((postType === "result" || postType === "goal") && score) {
    mid = <div style={{ fontFamily: DMSERIF, fontSize: 104, lineHeight: 1, color: WHITE, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{score}</div>;
  } else if (m.roundNo) {
    mid = (
      <div style={{ width: 104, height: 104, borderRadius: "50%", border: `2px solid ${WHITE}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: WHITE }}>
        <div style={{ fontFamily: DMSERIF, fontSize: 50, lineHeight: 0.9 }}>{m.roundNo.padStart(2, "0")}</div>
        <div style={{ fontFamily: SERIF, fontSize: 13, letterSpacing: "0.3em", paddingLeft: "0.3em", marginTop: 4 }}>MD</div>
      </div>
    );
  } else {
    mid = <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 64, color: WHITE, lineHeight: 1 }}>vs</div>;
  }

  const bottomLine =
    postType === "matchday"
      ? [m.date, m.time, m.venue, m.comp].filter(Boolean)
      : postType === "potm"
        ? [content.subline.toUpperCase(), (data.club?.name ?? "").toUpperCase()].filter(Boolean)
        : [postType === "result" ? "FULL TIME" : "", m.opp ? `V ${m.opp}` : "", m.comp, m.round].filter(Boolean);
  // One spaced line; a long one breaks in two balanced lines rather than shrinking to nothing.
  const one = bottomLine.join("  -  ");
  let bottomRows = [one];
  if (fitSpaced(one, 940, 22, 0.26) < 17 && bottomLine.length > 1) {
    let best = 1;
    for (let i = 1; i < bottomLine.length; i++) {
      const d = (k: number) => Math.abs(bottomLine.slice(0, k).join("  -  ").length - bottomLine.slice(k).join("  -  ").length);
      if (d(i) < d(best)) best = i;
    }
    bottomRows = [bottomLine.slice(0, best).join("  -  "), bottomLine.slice(best).join("  -  ")];
  }
  const bottomSize = Math.min(...bottomRows.map((t) => fitSpaced(t, 940, 21, 0.26)));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER }}>
      <PaintDefs id={`${id}-paint`} ink={ink} seed={seed} />
      {/* Paper: uneven light, then the smudges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at ${flip ? 65 : 35}% 30%, #f7f5f1, transparent 75%)` }} />
      <Smudges id={id} seed={seed} flip={flip} />

      {/* The crest, repainted huge. */}
      {crest && (
        <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed aria-hidden>
          <g transform={`rotate(${tilt.toFixed(1)} ${cLeft + cSize / 2} ${cTop + cSize / 2})`}>
            <image href={crest} x={cLeft} y={cTop} width={cSize} height={cSize} preserveAspectRatio="xMidYMid meet" filter={`url(#${id}-paint)`} opacity={0.94} />
          </g>
        </svg>
      )}

      {/* Top corner: the post's word, name, position, club code, agency. */}
      <div style={{ position: "absolute", top: 84, display: "flex", flexDirection: "column", gap: 6, ...corner }}>
        {kicker && <div style={{ fontFamily: DMSERIF, fontSize: kickSize, lineHeight: 1, color: text, marginBottom: 10, whiteSpace: "nowrap" }}>{kicker}</div>}
        {lines.map((t, i) => (
          <div key={i} style={{ fontFamily: SERIF, fontWeight: 500, fontSize: capsSize, letterSpacing: "0.2em", lineHeight: 1.25, color: text, whiteSpace: "nowrap" }}>
            {t}
          </div>
        ))}
        <AgencyLogo data={data} height={30} onLight style={{ marginTop: 22, opacity: 0.9 }} />
      </div>

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 24px 40px rgba(0,0,0,.35))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "saturate(.72) sepia(.14) contrast(1.08) brightness(1.02)", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Foot: grey-brown dusk for the white marks. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: "linear-gradient(to bottom, rgba(24,22,20,0), rgba(24,22,20,.55) 45%, rgba(18,17,16,.9))" }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, display: "flex", justifyContent: "center", alignItems: "center", gap: showStats ? 26 : 70 }}>
        {showStats
          ? facts.map((f, i) => (
              <Bracketed key={i} size={176} color={WHITE}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: WHITE }}>
                  <div style={{ fontFamily: DMSERIF, fontSize: Math.min(92, 150 / Math.max(1, String(f.value).length * 0.55)), lineHeight: 1 }}>{f.value}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, letterSpacing: "0.24em", paddingLeft: "0.24em", marginTop: 6, whiteSpace: "nowrap" }}>{f.label.toUpperCase()}</div>
                </div>
              </Bracketed>
            ))
          : (
            <>
              <Bracketed size={176} color={WHITE}>
                {pair[0] ? <img src={pair[0]} alt="" style={{ width: 124, height: 124, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.4))" }} /> : null}
              </Bracketed>
              {mid}
              <Bracketed size={176} color={WHITE}>
                {pair[1] ? (
                  <img src={pair[1]} alt="" style={{ width: 124, height: 124, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.4))" }} />
                ) : (
                  <div style={{ fontFamily: DMSERIF, fontSize: 40, color: WHITE, textAlign: "center", lineHeight: 1 }}>{(m.opp || "").split(" ").slice(-1)[0]?.slice(0, 3)}</div>
                )}
              </Bracketed>
            </>
          )}
      </div>

      <div style={{ position: "absolute", left: 40, right: 40, bottom: bottomRows.length > 1 ? 40 : 52, textAlign: "center", fontFamily: SERIF, fontWeight: 500, fontSize: bottomSize, letterSpacing: "0.26em", paddingLeft: "0.26em", color: WHITE, whiteSpace: "nowrap" }}>
        {bottomRows.map((t, i) => (
          <div key={i} style={{ lineHeight: 1.7 }}>
            {t}
          </div>
        ))}
      </div>

      <Film strength={0.55} />
    </div>
  );
}
