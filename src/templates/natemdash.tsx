import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "dash" natural looks (a one-line headline): his real photo full-bleed; on the side
 * away from him at the foot, the word in bold, a long em dash in his club's colour, then the main fact, all on
 * one line (wrapping the fact under the dash when it does not fit), one quiet line below. The NEYOD logo at top.
 */
function NatEmdashFrame({ data, word, fact, line }: { data: RenderData; word: string; fact: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = Math.min(520 * k, CANVAS_W * 0.54);
  const dashW = 40 * k;
  const wPx = Math.min(40 * k * ts, colW / Math.max(1, word.length * 0.66));
  const wW = word.length * 0.66 * wPx;
  // The fact on the same line when it fits beside the word and the dash, else on its own line under them.
  const oneLine = wW + dashW + 28 * k + fact.length * 0.52 * wPx * 0.7 <= colW;
  const fPx = oneLine ? wPx * 0.7 : Math.min(wPx * 0.7, colW / Math.max(1, fact.length * 0.52));
  const lPx = 16 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = line ? bottom - lPx : bottom;
  const factTop = oneLine ? 0 : (line ? lineTop - 14 * k : bottom) - fPx * 0.86;
  const wTop = (oneLine ? (line ? lineTop - 16 * k : bottom) : factTop - 10 * k) - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const row = { position: "absolute" as const, [edge]: M, width: colW, display: "flex", alignItems: "center", gap: 14 * k, justifyContent: left ? "flex-start" : "flex-end", whiteSpace: "nowrap" as const, fontFamily: SANS, lineHeight: 1 };
  const dash = <span style={{ width: dashW, height: 3 * k, background: colour, flexShrink: 0 }} />;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...row, top: wTop - wPx * 0.12, height: wPx }}>
        <span style={{ fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em" }}>{word}</span>
        {dash}
        {oneLine && <span style={{ fontWeight: 600, fontSize: fPx }}>{fact}</span>}
      </div>
      {!oneLine && <div style={{ ...row, top: factTop - fPx * 0.12, fontWeight: 600, fontSize: fPx }}>{fact}</div>}
      {line && <div style={{ ...row, top: lineTop, fontWeight: 500, fontSize: lPx, opacity: 0.88 }}>{line}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · travessão (matchday): MATCHDAY — Valletta FC v Hamrun Spartans; date · time below (exact names). */
export function Natemdash({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatEmdashFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} fact={`${fx.homeName} v ${fx.awayName}`} line={[fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · travessão: GOAL — His Name; his club's exact name below. No score. */
export function Goalnatemdash({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatEmdashFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} fact={name} line={ourClub(data)} />;
}
