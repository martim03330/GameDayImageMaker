/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "headline" natural looks: his real photo full-bleed; across the top, in a big serif,
 * a two-line headline — the first line upright, the second in italic — under a small tracked label; at the
 * foot, the crest(s) and the NEYOD logo. He stands below the headline, untouched.
 */
function NatHeadFrame({ data, label, l1, l2, crests }: { data: RenderData; label: string; l1: string; l2: string; crests: (string | null)[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 64;
  const top = (story ? STORY_TOP : 56) - (params.textY ?? 0);
  const lPx = 14 * k * ts;
  const longest = Math.max(l1.length, l2.length, 1);
  const fit = Math.min(88 * k * ts, (CANVAS_W - 2 * M) / (longest * 0.5));
  const headTop = top + lPx + 20 * k;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: Math.max(story ? 760 : 560, headTop + fit * 2.1 + (story ? 240 : 160)),
    fs: story ? 245 : 155,
  });
  // The photo must cover the canvas, so his head may stay higher than asked: the headline then shrinks to
  // end above his hair (never under ~56px), instead of running over it.
  const hairTop = place.fy - place.fs * 0.8;
  const hPx = Math.max(56 * k * ts, Math.min(fit, (hairTop - 24 * k - headTop) / 2.1));
  const headBottom = headTop + hPx * 2.1;
  const bottom = story ? STORY_BOTTOM : H - 56;
  const logoH = story ? 88 : 52;
  const crestS = 46 * k;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: headBottom + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.3) 55%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.26em", lineHeight: 1, opacity: 0.9 }}>{label}</div>
      <div style={{ position: "absolute", left: M, right: M, top: top + lPx + 20 * k, fontFamily: SERIF, fontSize: hPx, lineHeight: 1.04, letterSpacing: "-0.01em", textShadow: "0 2px 14px rgba(0,0,0,.3)" }}>
        <div style={{ whiteSpace: "nowrap" }}>{l1}</div>
        <div style={{ whiteSpace: "nowrap", fontStyle: "italic" }}>{l2}</div>
      </div>
      <div style={{ position: "absolute", left: M, top: bottom - logoH - 18 * k - crestS, display: "flex", gap: 12 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: M, top: bottom - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/** Natural · título (matchday): label "MATCHDAY · date · time", the headline "Home" / "v Away" (exact names), both crests. */
export function Nathead({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const label = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff].filter(Boolean).join("  ·  ");
  return <NatHeadFrame data={data} label={label} l1={fx.homeName} l2={`v ${fx.awayName}`} crests={[fx.homeCrest, fx.awayCrest]} />;
}

/** Natural goal · título: label "GOAL · club", the headline: his first name / his surname in italic, his crest. No score. */
export function Goalnathead({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const label = [(data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ");
  return <NatHeadFrame data={data} label={label} l1={data.content.firstName ?? ""} l2={data.content.lastName ?? ""} crests={[data.content.home === false ? fx.awayCrest : fx.homeCrest]} />;
}
