/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const BODONI = "var(--font-bodoni), 'Didot', serif";

/**
 * The shared frame of the "fade" natural looks: his real photo full-bleed at the top, dissolving softly into
 * an off-white paper over the lower third (no hard edge). On the paper, in ink of his club's colour: the
 * word in Bodoni caps, centred, then a small line and the crest(s). The light NEYOD logo at the top over the
 * photo; he is framed high so the fade passes under his knees.
 */
function NatFadeFrame({ data, word, line, crests }: { data: RenderData; word: string; line: string; crests: (string | null)[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = panelColour(params.primary, params.accent);
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 560 : 400,
    fs: story ? 230 : 140,
  });
  const fadeTop = H * (story ? 0.56 : 0.58);
  const bottom = story ? STORY_BOTTOM : H - 56;
  const wPx = Math.min(130 * k * ts, (CANVAS_W - 120) / Math.max(1, word.length * 0.74));
  const lPx = 18 * k * ts;
  const crest = 50 * k;
  const crestTop = bottom - crest;
  const lineTop = crestTop - 22 * k - lPx;
  const wTop = lineTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: ink }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: fadeTop, bottom: 0, background: `linear-gradient(to bottom, rgba(244,241,234,0), ${OFF_WHITE} ${story ? 30 : 34}%, ${OFF_WHITE})` }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: BODONI, fontWeight: 700, fontSize: wPx, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.16em", whiteSpace: "nowrap" }}>{line}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: crestTop, height: crest, display: "flex", justifyContent: "center", gap: 14 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · esbatido (matchday): MATCHDAY in Bodoni on the paper; HOME v AWAY · date · time; both crests. */
export function Natfade({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFadeFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} crests={[fx.homeCrest, fx.awayCrest]} />;
}

/** Natural goal · esbatido: GOAL in Bodoni under his celebration; his name · his club's exact name; his crest. No score. */
export function Goalnatfade({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFadeFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} crests={[data.content.home === false ? fx.awayCrest : fx.homeCrest]} />;
}
