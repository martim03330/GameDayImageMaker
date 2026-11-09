/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · surname behind: his real celebration photo full-bleed (light grade only) with his SURNAME
 * huge in off-white set between the photo's background and him — the photo, then the word, then the sharp
 * cutout laid exactly over his figure, so his head and arms overlap the letters' lower part (natword's structure).
 * Accents kept (headroom for Ã / Ç; widths measured without them). The kicker ("GOAL") small and wide-spaced
 * above the name, flush with its edge away from his head, two small crests with "v" at the foot, the NEYOD logo alone at the top. No score.
 */
export function Goalnatname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 830 : 540,
    fs: story ? 250 : 160,
  });

  /* ---- the surname, pinned to the width ---- */
  const face = FACES.anton;
  const word = (content.lastName || content.firstName || "").toUpperCase().replace(/’/g, "'").trim();
  const fit = word ? Math.min((CANVAS_W - 80) / Math.max(0.5, wordEm(face, word)), (story ? 330 : 270) / face.cap) * ts : 0;
  // Accents above the caps (Ã, É, Ô …) need room; the cedilla hangs under the baseline, harmlessly.
  const upper = /[\u0300-\u0304\u0306-\u030C]/.test(word.normalize("NFD"));
  const accentK = upper ? 0.2 : 0;

  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const kickSize = Math.min(24 * k * ts, 700 / Math.max(1, capsEm(kicker, 0.6)));
  // The word's foot at his brow line, so his head overlaps only its lower part; when the photo holds his
  // head high (little headroom), the word gives a little size (≥ 72%) to stay above it.
  const target = place.fy - place.fs * 0.28 + (params.textY ?? 0);
  const above = logoTop + logoH + (story ? 70 : 56) + kickSize + (story ? 30 : 22);
  const size = word ? Math.max(fit * 0.72, Math.min(fit, (target - above) / (face.cap + accentK))) : 0;
  const accent = size * accentK;
  const kickGap = (story ? 30 : 22) + accent;
  const minCapTop = above + accent;
  const baseline = Math.max(target, minCapTop + size * face.cap);
  const capTop = baseline - size * face.cap;
  const kickTop = capTop - kickGap - kickSize;
  // The word's side edge, and the side that keeps the kicker clear of him: his face sits off-centre in his
  // cutout when an arm / a team-mate fills the other side, so the kicker goes to the side his face leans to.
  const edge = Math.max(24, (CANVAS_W - size * wordEm(face, word)) / 2);
  const f = data.face;
  const kickLeft = f ? f[0] + f[2] / 2 < 0.5 : place.fx >= CANVAS_W / 2;

  /* ---- the foot: two crests ---- */
  const fx = natFixture(data);
  const crest = Math.round(40 * k);
  const crestTop = (story ? STORY_BOTTOM : CANVAS_H - 56) - crest;

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.4))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* Soft shade behind the top type, so the off-white reads on bright skies and stands. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: baseline + size * 0.25, background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,.16) 70%, rgba(0,0,0,0))" }} />

      {/* The surname, behind him. */}
      {word && (
        <svg width={CANVAS_W} height={size * 1.5} style={{ position: "absolute", left: 0, top: baseline - size * 1.2, overflow: "visible" }} aria-hidden>
          <defs>
            <filter id="gnn-soft" x="-10%" y="-30%" width="120%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="16" floodColor="#000" floodOpacity="0.22" />
            </filter>
          </defs>
          <text x={CANVAS_W / 2} y={size * 1.2} textAnchor="middle" filter="url(#gnn-soft)" style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: OFF_WHITE, opacity: 0.96 }}>
            {word}
          </text>
        </svg>
      )}

      {/* He steps in front of it. */}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* The kicker, small and wide, flush with the name's edge, on his free side. */}
      <div
        style={{
          position: "absolute",
          top: kickTop,
          ...(kickLeft ? { left: edge + size * 0.02 } : { right: edge + size * 0.02 - kickSize * 0.6 }),
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: kickSize,
          lineHeight: 1,
          letterSpacing: "0.6em",
          whiteSpace: "nowrap",
          textShadow: "0 1px 10px rgba(0,0,0,.45)",
        }}
      >
        {kicker}
      </div>

      {/* The foot: the two crests, on a breath of shade. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop - (story ? 240 : 180), bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.42))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        {crestImg(fx.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 17 * k * ts, lineHeight: 1, opacity: 0.85, textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>v</div>
        {crestImg(fx.awayCrest)}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
