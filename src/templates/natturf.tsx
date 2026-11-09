/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

export type TurfLine = { text: string; size: number; weight: number; tracking: number; opacity?: number; crests?: [string | null, string | null] };

/** The turf paint's 3D: the word lies on the ground plane, stretched along it like a pitch-side turf logo. */
const TILT = 60;
const PERSP = 1700;
const STRETCH = 2.4;
const SIN = Math.sin((TILT * Math.PI) / 180);
const COS = Math.cos((TILT * Math.PI) / 180);
/** Projected height on the canvas of letters `cap` px tall laid on the grass. */
const turfH = (cap: number) => {
  const y = cap * STRETCH;
  return (y * COS * PERSP) / (PERSP + y * SIN);
};

/**
 * The shared frame of the natural turf looks: his own match photo full-bleed (real grass, stands, light —
 * light grade only) and one idea: the word painted ON THE GRASS in perspective like a pitch-side turf logo,
 * white paint (a translucent white layer + a soft-light layer, so the grass texture shows through), laid in
 * front of / around his feet and BEHIND the cutout layer, so he stands on it. Only when the photo shows the
 * grass below his knees (a full-body photo, not cut at the foot); otherwise the word sits flat over the
 * foot with a soft shade. The small info (flat type) and the NEYOD logo at the top, his face below them.
 */
export function NatTurfFrame({ data, word, lines }: { data: RenderData; word: string; lines: TurfLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 70 : 60;
  const maxW = CANVAS_W - 2 * M;

  /* ---- the top: logo, then the info lines ---- */
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const crest = Math.round(40 * k);
  const sized = lines
    .filter((l) => l.text)
    .map((l) => {
      const room = maxW - (l.crests ? 2 * (crest + 18 * k) : 0);
      const px = Math.min(l.size * k * ts, room / Math.max(1, capsEm(l.text, l.tracking)));
      return { ...l, px, h: l.crests ? Math.max(crest, px) : px };
    });
  const gap = 14 * k;
  let y = logoTop + logoH + 58 * k - (params.textY ?? 0);
  const placed = sized.map((l) => {
    const top = y;
    y += l.h + gap;
    return { ...l, top };
  });
  const infoBottom = y - gap;
  const hairMin = infoBottom + 44 * k;

  /* ---- his figure: whole, feet on the grass when the photo has them ---- */
  const cut = data.cutouts.find((c) => c.url === data.photoUrl);
  const f = data.face ?? cut?.face ?? [0.38, 0.08, 0.24, 0.12];
  const ry = f[1] + f[3] / 2;
  const feetCut = (data.cut?.bottom ?? 0) > 0;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const frontY = story ? STORY_BOTTOM - 10 : H - 44;
  let place: NatPlace;
  if (!feetCut) {
    // Feet about 1.1 word-depths above the front edge: the paint runs in front of and behind his shins.
    const feetT = frontY - (story ? 150 : 120);
    const q = f[3] / (1 - ry);
    const fs = Math.max(story ? 96 : 84, Math.min(story ? 240 : 170, ((feetT - hairMin) * q) / (1 + 0.75 * q)));
    place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: hairMin + 0.75 * fs, fs });
  } else {
    const fs = story ? 250 : 156;
    const fy = Math.max(story ? 720 : 540, hairMin + 0.78 * fs);
    place = natPlace(data, CANVAS_W, H, { fx: fx0, fy, fs });
    // A photo cut at the foot grows him (natPlace): keep his (curly) hair clear of the info lines.
    const short = hairMin - (place.fy - place.fs * 0.95);
    if (short > 0) place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: fy + short, fs });
  }
  const feet = place.box.top + place.box.height;
  const knee = place.box.top + place.box.height * 0.72;
  // The cutout box runs a little past his boots: feet within ~60px of the foot still stand on visible grass.
  const turf = !feetCut && !!place.frame.fig && feet <= H + 60;

  /* ---- the word ---- */
  const face = FACES.anton;
  const em = Math.max(0.5, wordEm(face, word) + 0.04 * (word.length - 1));
  let size: number;
  if (turf) {
    // As wide as the front edge allows, never deeper on the canvas than the grass below his knees.
    const maxDepth = Math.max(story ? 230 : 170, Math.min(frontY - knee + 120, story ? 370 : 270));
    size = Math.min((CANVAS_W - 70) / em, 600) * ts;
    while (size > 60 && turfH(size * face.cap) > maxDepth) size -= 4;
  } else {
    size = Math.min((CANVAS_W - 2 * M) / em, (story ? 250 : 190) / face.cap) * ts;
  }
  const cap = size * face.cap;
  const flatBottom = story ? STORY_BOTTOM : H - 60;

  const turfLayer = (blend: "normal" | "soft-light", color: string) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: CANVAS_W,
        top: frontY - cap,
        height: cap,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        transform: `perspective(${PERSP}px) rotateX(${TILT}deg) scaleY(${STRETCH})`,
        transformOrigin: "50% 100%",
        mixBlendMode: blend,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, lineHeight: `${cap}px`, height: cap, letterSpacing: "0.04em", paddingLeft: "0.04em", whiteSpace: "nowrap", color }}>
        {word}
      </div>
    </div>
  );

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE, isolation: "isolate" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* The paint on the grass, under his boots: translucent white + a soft-light lift (the turf shows through). */}
      {turf && turfLayer("normal", "rgba(255,255,255,.6)")}
      {turf && turfLayer("soft-light", "#ffffff")}

      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* Soft local shade under the logo + info at the top (and under the flat word at the foot). */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: infoBottom + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }} />
      {!turf && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - (flatBottom - cap) + (story ? 240 : 180), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.28) 50%, rgba(0,0,0,0))" }} />}

      {!turf && (
        <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: flatBottom - size, overflow: "visible" }} aria-hidden>
          <defs>
            <filter id={story ? "nt-soft-s" : "nt-soft"} x="-10%" y="-40%" width="120%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
              <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
            </filter>
          </defs>
          <text x={CANVAS_W / 2} y={size} textAnchor="middle" filter={`url(#${story ? "nt-soft-s" : "nt-soft"})`} style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, letterSpacing: "0.04em", fill: "#ffffff" }}>
            {word}
          </text>
        </svg>
      )}

      {placed.map((l) => (
        <div key={l.text} style={{ position: "absolute", left: M, right: M, top: l.top, height: l.h, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
          {l.crests && crestImg(l.crests[0])}
          <div style={{ fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, paddingLeft: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, textShadow: SMALL_SHADOW }}>
            {l.text}
          </div>
          {l.crests && crestImg(l.crests[1])}
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

/**
 * Natural · turf (matchday): his own match photo full-bleed and "MATCHDAY" painted on the grass in
 * perspective at his feet, like a pitch-side turf logo, behind him. At the top, small: HOME v AWAY (exact
 * names, home first, crests), then date · kick-off · venue; the NEYOD logo above them.
 */
export function Natturf({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  return (
    <NatTurfFrame
      data={data}
      word={word}
      lines={[
        { text: match, size: 23, weight: 700, tracking: 0.1, crests: [fx.homeCrest, fx.awayCrest] },
        { text: fx.line, size: 17, weight: 600, tracking: 0.2, opacity: 0.92 },
      ]}
    />
  );
}
