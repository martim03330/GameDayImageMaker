import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "big joiner" natural looks: his real photo full-bleed; on the side away from him at
 * the foot, two names in bold stacked with a large light italic serif joiner between them ("v" on matchday,
 * "for" on goals) in his club's colour; the word small above, tracked. The NEYOD logo alone at the top.
 */
function NatBigvFrame({ data, word, a, joiner, b }: { data: RenderData; word: string; a: string; joiner: string; b: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 480 * k;
  const nPx = Math.min(36 * k * ts, colW / Math.max(1, Math.max(a.length, b.length) * 0.6));
  // The joiner is the look: about three names tall, its lowercase body (x-height ~0.45em) sitting between them.
  const jPx = nPx * 2.8;
  const wPx = 15 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const bTop = bottom - nPx * 0.86;
  const jTop = bTop - 10 * k - jPx * 0.5;
  // Room above for a tall ascender (the f of "for").
  const aTop = jTop - 10 * k - jPx * 0.28 - nPx * 0.86;
  const wTop = aTop - 22 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right", lineHeight: 1, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ ...side, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.26em", opacity: 0.9 }}>{word}</div>
      <div style={{ ...side, top: aTop - nPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: nPx }}>{a}</div>
      <div style={{ ...side, top: jTop - jPx * 0.42, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: jPx, color: colour, overflow: "visible" }}>{joiner}</div>
      <div style={{ ...side, top: bTop - nPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: nPx }}>{b}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · "v" grande (matchday): date · time small, then Home / a big italic "v" / Away (exact names). */
export function Natbigv({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatBigvFrame data={data} word={[word, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} a={fx.homeName} joiner="v" b={fx.awayName} />;
}

/** Natural goal · "v" grande: GOAL small, then his name / a big italic "for" / his club's exact name. No score. */
export function Goalnatbigv({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBigvFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} a={name} joiner="for" b={ourClub(data)} />;
}
