import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "tab" natural looks (a folder tab): his real photo full-bleed; a solid off-white
 * strip along the bottom edge with a raised tab at its left holding the word in bold, in his club's colour;
 * the strip carries one small line of details. The NEYOD logo alone at the top.
 */
function NatTabFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = panelColour(params.primary, params.accent);
  const stripH = 86 * k;
  const stripTop = (story ? STORY_BOTTOM + 40 : H) - stripH - (params.textY ?? 0);
  const wPx = Math.min(46 * k * ts, 560 / Math.max(1, word.length * 0.62));
  const tabH = wPx + 34 * k;
  const tabW = word.length * wPx * 0.64 + 60 * k;
  const lPx = Math.min(18 * k * ts, (CANVAS_W - 128) / Math.max(1, line.length * 0.6));
  const place = natPlace(data, CANVAS_W, stripTop, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: stripTop * 0.36,
    fs: story ? 240 : 155,
  });
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: stripTop, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={stripTop} />
        <NatFigure data={data} place={place} W={CANVAS_W} H={stripTop} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      </div>
      <div style={{ position: "absolute", left: 48, top: stripTop - tabH + 1, width: tabW, height: tabH, background: OFF_WHITE, borderRadius: `${14 * k}px ${14 * k}px 0 0`, display: "flex", alignItems: "center", paddingLeft: 30 * k, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em", lineHeight: 1 }}>{word}</div>
      <div style={{ position: "absolute", left: 64, right: 64, top: stripTop + (stripH - lPx) / 2 - 2, fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1, letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · separador (matchday): a tab reading "Matchday" over the bottom strip; Home v Away · date · time · venue on it. */
export function Nattab({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatTabFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ")} />;
}

/** Natural goal · separador: a tab reading "Goal" over his celebration; his name · his club's exact name on the strip. No score. */
export function Goalnattab({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTabFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ")} />;
}
