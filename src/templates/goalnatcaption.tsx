/* eslint-disable @next/next/no-img-element */
import { CaptionBlock, keep } from "./natcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** His club's name exactly as stored (the club record first, else his side of the fixture). */
export function ourClub(data: RenderData): string {
  const fx = natFixture(data);
  return (data.club?.name || (data.content.home === false ? fx.awayName : fx.homeName) || "").trim();
}

/**
 * Natural goal · caption: his real celebration photo almost untouched (cover, light grade only) and at the
 * foot, on the gentlest local shade, a magazine caption — a tiny "GOAL" label, a thin rule, then one small
 * serif sentence: "Moisés Conceição celebrates his goal for SC Vianense SAD." (exact club name). The NEYOD
 * logo small at the top centre. No score.
 */
export function Goalnatcaption({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 660 : 450,
    fs: story ? 262 : 180,
  });

  const name = keep([content.firstName, content.lastName].filter(Boolean).join(" "));
  const club = ourClub(data);
  const rest = club ? `celebrates his goal for ${keep(club)}.` : "celebrates his goal.";
  const label = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();

  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 62) - (params.textY ?? 0);
  const shadeH = story ? 560 : 420;
  const logoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.24), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H - shadeH, bottom: 0, background: "linear-gradient(to bottom, rgba(5,8,5,0), rgba(5,8,5,.38) 45%, rgba(5,8,5,.64))" }} />

      <CaptionBlock label={label} lead={name} rest={name ? rest : rest.charAt(0).toUpperCase() + rest.slice(1)} bottom={bottom} H={H} story={story} ts={ts} />

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
