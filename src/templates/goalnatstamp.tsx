/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, natPlace } from "./natkit";
import { Seal, sealSpot } from "./natstamp";
import { AgencyLogo, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · stamp: his own celebration photo full-bleed and almost untouched (light grade only), with
 * one round seal set on a calm part of the photo, away from his face: a thin double ring with
 * "SURNAME · CLUB" (exact club name) set around it and "GOAL" in serif caps in the middle. No score.
 * The NEYOD logo alone at the foot.
 */
export function Goalnatstamp({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 620 : 470,
    fs: story ? 236 : 168,
  });

  /* ---- the logo at the foot ---- */
  const logoAsk = story ? 26 : 24;
  const logoPost = Math.max(52, Math.round(logoAsk * 2)); // as AgencyLogo draws it
  const logoPx = story ? Math.max(88, Math.round(logoPost * 1.7)) : logoPost;
  const logoTop = (story ? STORY_BOTTOM : CANVAS_H - 46) - logoPx - (params.logoY ?? 0);

  /* ---- the seal ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const surname = (content.lastName || content.firstName || "").toUpperCase().trim();
  const club = (data.club?.name ?? "").toUpperCase().trim();
  const ring = [surname, club].filter(Boolean).join("  ·  ") || kicker;
  const seal = sealSpot(place, Math.round(150 * k * ts), story ? STORY_TOP : 70, H, params.textY ?? 0, story ? 70 : 60);
  const R = seal.R;
  // The word in the middle, as wide as the inner circle allows (Fraunces caps ≈ 0.7em each).
  const wordSize = Math.min(R * 0.4, (R * 1.12) / Math.max(1, [...kicker].length * 0.72));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* Soft local shade under the logo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - (story ? 220 : 160), bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.36))" }} />

      <Seal id="gns" cx={seal.cx} cy={seal.cy} R={R} ring={ring} rotate={-10}>
        <text x={0} y={wordSize * 0.36} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: wordSize, fill: "#fff", letterSpacing: "0.02em" }}>
          {kicker}
        </text>
      </Seal>

      <AgencyLogo
        data={data}
        height={logoAsk}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
