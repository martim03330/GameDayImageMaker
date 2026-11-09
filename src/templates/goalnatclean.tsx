/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · clean photo: his real celebration photo almost as it is (cover, light grade only) and
 * nothing over it but a quiet caption at the foot, on the gentlest shade — a tiny hairline-boxed "GOAL" tag
 * (or the kicker), his name in small wide-spaced caps, and the two crests either side of a small "v".
 * The NEYOD logo small at the top centre. No score.
 */
export function Goalnatclean({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 720 : 470,
    fs: story ? 270 : 190,
  });

  /* ---- the caption, bottom-up ---- */
  const fx = natFixture(data);
  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 58) - (params.textY ?? 0);
  const crest = Math.round(40 * k);
  const crestRowTop = bottom - crest;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min(24 * k * ts, (CANVAS_W - 160) / Math.max(1, capsEm(name, 0.42)));
  const nameTop = crestRowTop - 30 * k - nameSize;
  const tag = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const tagSize = Math.min(13 * k * ts, 520 / Math.max(1, capsEm(tag, 0.5)));
  const tagH = tagSize + 16 * k;
  const tagTop = nameTop - 22 * k - tagH;
  const shadeTop = tagTop - (story ? 300 : 220);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.35))" }} /> : null;

  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The gentlest shades: a breath at the top for the logo, a soft one at the foot for the caption. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.24), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.34) 42%, rgba(5,8,5,.58))" }} />

      {/* The tag. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: tagTop, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            height: tagH,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            padding: `0 ${14 * k}px 0 ${14 * k + tagSize * 0.5}px`,
            border: `${Math.max(1, Math.round(1.2 * k))}px solid rgba(244,241,234,.75)`,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: tagSize,
            lineHeight: 1,
            letterSpacing: "0.5em",
            whiteSpace: "nowrap",
            background: "rgba(10,12,10,.18)",
            textShadow: "0 1px 6px rgba(0,0,0,.5)",
          }}
        >
          {tag}
        </div>
      </div>

      {/* His name, small and wide. */}
      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.42em", paddingLeft: "0.42em", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.55)" }}>
          {name}
        </div>
      )}

      {/* The two crests. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: crestRowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        {crestImg(fx.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 16 * k * ts, lineHeight: 1, opacity: 0.8 }}>v</div>
        {crestImg(fx.awayCrest)}
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
