import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "thirds" natural looks (a camera viewfinder grid): his real photo full-bleed with the
 * rule-of-thirds grid drawn over it in faint hairlines (two vertical, two horizontal), behind him; at the foot one
 * line of small caps with the word in bold first. The NEYOD logo alone at the top.
 */
function NatThirdsFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 520,
    fs: story ? 245 : 155,
  });
  const top = story ? STORY_TOP - 40 : 0;
  const bot = story ? STORY_BOTTOM + 40 : H;
  const gh = bot - top;
  const text = `${word}   ${line}`;
  const px = Math.min(17 * k * ts, (CANVAS_W - 120) / Math.max(1, capsEm(text, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const line1 = { position: "absolute", background: OFF_WHITE, opacity: 0.3 } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {[1, 2].map((i) => (
        <div key={`v${i}`} style={{ ...line1, left: (CANVAS_W * i) / 3, top, width: 1.5, height: gh }} />
      ))}
      {[1, 2].map((i) => (
        <div key={`h${i}`} style={{ ...line1, left: 0, top: top + (gh * i) / 3, width: CANVAS_W, height: 1.5 }} />
      ))}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + px + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - px, textAlign: "center", fontFamily: SANS, fontSize: px, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "pre" }}>
        <span style={{ fontWeight: 800 }}>{word}</span>
        <span style={{ fontWeight: 500, opacity: 0.88 }}>{`   ${line}`}</span>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · terços (matchday): a faint rule-of-thirds grid behind him; MATCHDAY  HOME v AWAY · date · time at the foot. */
export function Natthirds({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatThirdsFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · terços: the thirds grid behind his celebration; GOAL  his name · his club's exact name at the foot. No score. */
export function Goalnatthirds({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatThirdsFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
