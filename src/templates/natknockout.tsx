/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#16191d";
const ANTON = FACES.anton;

/**
 * The shared frame of the natural knockout looks: his photo full-bleed (real grass, stands, light) and one
 * solid white band (92%) across the full width with the word knocked out of it — an SVG mask makes the
 * letters holes, so the photo shows through them. Heavy Anton caps fill the band's height; the info sits
 * small in dark ink on the band's lower edge. The band takes the clear area above his head (sky / stands);
 * when the photo has no headroom it moves to the foot, and the NEYOD logo takes the free end, alone.
 */
export function NatKnockoutFrame({ data, word, info }: { data: RenderData; word: string; info: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.28 : 1;
  const M = story ? 70 : 60;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the word: as tall as the band allows, never wider than the margins ---- */
  const up = word.toUpperCase();
  const size = Math.min((story ? 270 : 204) * ts, maxW / Math.max(1, wordEm(ANTON, up)));
  const cap = size * ANTON.cap;

  /* ---- the info: one line when it fits at a readable size, else one line per part ---- */
  const track = 0.16;
  const want = 23 * k * ts;
  const joined = info.filter(Boolean).join("  ·  ");
  const oneLine = maxW / Math.max(1, capsEm(joined, track)) >= 21 * k;
  const lines = (oneLine ? [joined] : info.filter(Boolean)).map((t) => ({ t, px: Math.min(want, maxW / Math.max(1, capsEm(t, track))) }));
  const lineGap = 10 * k;
  const linesH = lines.reduce((h, l, i) => h + l.px + (i ? lineGap : 0), 0);

  const padTop = 30 * k;
  const gapWord = 24 * k;
  const padBot = 26 * k;
  const coreH = Math.round(padTop + cap + gapWord + linesH + padBot);

  /* ---- his face below the band (hair ~0.8 face-heights above the face centre) ---- */
  const topBand = (story ? STORY_TOP - 20 : 74) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 720 : 520, topBand + coreH + 60 + fs * 0.8), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topBand + coreH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  // At the foot the band ends on the safe line, the logo goes to the top corner away from his head. In the
  // post the band runs to the frame's edge (no sliver of photo beyond it); in the story it floats inside
  // the safe area.
  const coreTop = upper ? topBand : footBottom - coreH;
  const bleed = story && !upper ? 0 : upper ? coreTop : H - (coreTop + coreH);
  const bandTop = upper ? coreTop - bleed : coreTop;
  const bandH = coreH + bleed;
  const inset = upper ? bleed : 0;
  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  const id = story ? "nko-mask-s" : "nko-mask";
  const baseline = inset + padTop + cap;
  let y = baseline + gapWord;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The band: 92% white with the word cut out of it (the photo shows through the letters). */}
      <div style={{ position: "absolute", left: 0, top: bandTop, width: CANVAS_W, height: bandH, boxShadow: "0 10px 40px rgba(0,0,0,.18)" }}>
        <svg width={CANVAS_W} height={bandH} style={{ position: "absolute", left: 0, top: 0 }} aria-hidden>
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={CANVAS_W} height={bandH}>
              <rect x="0" y="0" width={CANVAS_W} height={bandH} fill="#fff" />
              <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" style={{ fontFamily: ANTON.family, fontWeight: ANTON.weight, fontSize: size, letterSpacing: "0.005em", fill: "#000" }}>
                {up}
              </text>
            </mask>
          </defs>
          <rect x="0" y="0" width={CANVAS_W} height={bandH} fill="#ffffff" fillOpacity="0.92" mask={`url(#${id})`} />
          {/* Inside the letters the photo is only deepened a touch, so they read even over white kit. */}
          <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" style={{ fontFamily: ANTON.family, fontWeight: ANTON.weight, fontSize: size, letterSpacing: "0.005em", fill: "#0b0d10", fillOpacity: 0.4 }}>
            {up}
          </text>
        </svg>
        {lines.map((l) => {
          const top = y;
          y += l.px + lineGap;
          return (
            <div
              key={l.t}
              style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: l.px, lineHeight: 1, letterSpacing: `${track}em`, whiteSpace: "nowrap", color: INK }}
            >
              {l.t}
            </div>
          );
        })}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · knockout (matchday): his own match photo full-bleed and a solid white band across the clear area
 * above him with "MATCHDAY" knocked out of it in heavy Anton caps (the photo shows through the letters).
 * Small dark ink on the band's lower edge: HOME v AWAY (exact names, home first) · date · kick-off.
 */
export function Natknockout({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "Matchday").replace(/’/g, "'").trim();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return <NatKnockoutFrame data={data} word={word} info={[match, when]} />;
}
