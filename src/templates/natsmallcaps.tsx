import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "small caps" natural looks (a book's title page): his real photo full-bleed; at the
 * foot, centred, the word in a serif set in true small capitals, widely spaced, and under it one line in the
 * same serif's italic. Quiet and classical. The NEYOD logo alone at the top.
 */
function NatSmallcapsFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 70;
  const track = 0.2;
  // Small caps of a lowercase word are ~0.72 of a capital wide; the leading capital is a full one.
  const wPx = Math.min(62 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * (0.55 + track)));
  const lPx = Math.min(22 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, line.length * 0.42));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 20 * k - wPx * 0.8;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop - wPx * 0.16, textAlign: "center", fontFamily: SERIF, fontWeight: 500, fontSize: wPx, fontVariant: "small-caps", letterSpacing: `${track}em`, paddingLeft: `${track}em`, boxSizing: "border-box", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop - lPx * 0.12, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.92 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · versaletes (matchday): "Matchday" in serif small caps, "Valletta FC v Hamrun Spartans · 25 Oct · 15:30" in italic (exact names). */
export function Natsmallcaps({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "Matchday";
  return <NatSmallcapsFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · versaletes: "Goal" in serif small caps under his celebration; his name · his club's exact name in italic. No score. */
export function Goalnatsmallcaps({ data }: { data: RenderData }) {
  const w = data.content.kicker || "Goal";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSmallcapsFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
