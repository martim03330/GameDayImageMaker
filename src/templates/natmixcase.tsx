import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "two voices" natural looks (an editorial pairing): his real photo full-bleed; on the
 * side away from him at the foot, a short italic serif lead-in ("it's", "what a") on its own line, then the word
 * in heavy sans caps right under it, then one quiet line. The NEYOD logo alone at the top.
 */
function NatMixcaseFrame({ data, lead, word, line }: { data: RenderData; lead: string; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 520 * k;
  const wPx = Math.min(76 * k * ts, colW / Math.max(1, word.length * 0.66));
  const iPx = wPx * 0.5;
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx * 0.86;
  const iTop = wTop - 4 * k - iPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right", lineHeight: 1, whiteSpace: "nowrap" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: iTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...side, top: iTop - iPx * 0.1, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: iPx }}>{lead}</div>
      <div style={{ ...side, top: wTop - wPx * 0.12, fontFamily: SANS, fontWeight: 900, fontSize: wPx, letterSpacing: "-0.02em" }}>{word}</div>
      <div style={{ ...side, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · duas vozes (matchday): "it's" in italic serif over MATCHDAY in heavy caps; Home v Away · date · time below (exact names). */
export function Natmixcase({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatMixcaseFrame data={data} lead="it's" word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · duas vozes: "what a" in italic serif over GOAL; his name · his club's exact name below. No score. */
export function Goalnatmixcase({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const word = (data.content.kicker || "GOAL").toUpperCase();
  return <NatMixcaseFrame data={data} lead={word === "GOAL" ? "what a" : "the"} word={word} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
