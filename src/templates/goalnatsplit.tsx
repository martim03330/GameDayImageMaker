/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · split word: his real celebration photo as it is (light grade only) with the kicker split in
 * two halves either side of his head at eye level — "GO" | "AL", "HAT-" | "TRICK" — pure white with natword's
 * tight + wide shadows, each half pinned to its margin and kept ≥ 40px clear of his head (its real span from
 * the face box), laid over the photo so they always read in full (only a shoulder or an arm may pass under them). His name
 * small at the foot over two small crests; the NEYOD logo at the top. No score.
 */

/** Where to cut the word: after a hyphen / space if there is one, else where the two halves weigh the same. */
function halves(face: (typeof FACES)["anton"], word: string): [string, string] {
  const cut = word.search(/[-\s]/);
  if (cut > 0 && cut < word.length - 1) return [word.slice(0, cut + 1).trim(), word.slice(cut + 1).trim()];
  if (word.length < 2) return [word, ""];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < word.length; i++) {
    const d = Math.abs(wordEm(face, word.slice(0, i)) - wordEm(face, word.slice(i)));
    if (d < diff - 0.01) {
      diff = d;
      best = i;
    }
  }
  return [word.slice(0, best), word.slice(best)];
}

export function Goalnatsplit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const M = story ? 60 : 50;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 500 : params.side === "right" ? 580 : 540,
    fy: story ? 760 : 560,
    fs: story ? 190 : 150,
  });

  // His head's real span on the canvas (natPlace gives where /api/natframe really puts it): the face box plus hair and ears either side.
  const head = place;
  const headL = head.fx - head.faceW / 2 - head.fs * 0.42;
  const headR = head.fx + head.faceW / 2 + head.fs * 0.42;

  /* ---- the two halves, as big as both rooms allow ---- */
  const face = FACES.anton;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const [a, b] = halves(face, word);
  const roomL = Math.max(60, headL - 40 - M);
  const roomR = Math.max(60, CANVAS_W - M - (headR + 40));
  const maxCap = story ? 300 : 240;
  const size = Math.min(roomL / Math.max(0.3, wordEm(face, a)), b ? roomR / Math.max(0.3, wordEm(face, b)) : Infinity, maxCap / face.cap) * ts;
  const cap = size * face.cap;
  const eye = head.fy - head.fs * 0.1 + (params.textY ?? 0);
  const baseline = eye + cap / 2;

  /* ---- logo, foot ---- */
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 50;
  const fx = natFixture(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min(22 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(name, 0.2)));
  const crest = Math.round(38 * k);
  const crestTop = footBottom - crest;
  const nameTop = crestTop - (story ? 24 : 18) - nameSize;
  const shadow = "0 2px 6px rgba(0,0,0,.38), 0 8px 40px rgba(0,0,0,.42)";

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.45))" }} /> : null;
  const txt = { fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "#ffffff" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: "#ffffff" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* The two halves, in front, either side of his head (never nearer than 40px): a shoulder or a raised arm may pass under them. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="gns-soft" x="-20%" y="-40%" width="140%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text x={M} y={baseline} textAnchor="start" filter="url(#gns-soft)" style={txt}>
          {a}
        </text>
        {b && (
          <text x={CANVAS_W - M} y={baseline} textAnchor="end" filter="url(#gns-soft)" style={txt}>
            {b}
          </text>
        )}
      </svg>


      {/* Breaths of shade for the logo and the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 260 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: nameTop - (story ? 130 : 100),
          height: footBottom - nameTop + (story ? 260 : 200),
          background: "radial-gradient(closest-side, rgba(5,8,5,.55), rgba(5,8,5,.3) 60%, rgba(5,8,5,0))",
        }}
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.2em", paddingLeft: "0.2em", whiteSpace: "nowrap", textShadow: shadow }}>
        {name}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 * k }}>
        {crestImg(fx.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 16 * k * ts, lineHeight: 1, opacity: 0.85, textShadow: shadow }}>v</div>
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
