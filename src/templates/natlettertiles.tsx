import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "letter tiles" natural looks (Scrabble / signage tiles): his real photo full-bleed; at the
 * foot, centred, each letter of the word on its own small off-white square tile in his club's colour ink, the tiles
 * spaced evenly; one small line under them. The NEYOD logo alone at the top.
 */
function NatLettertilesFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const ink = panelColour(params.primary, params.accent);
  const letters = [...word];
  const gap = 10 * k;
  const T = Math.min(88 * k * ts, (CANVAS_W - 120 - (letters.length - 1) * gap) / Math.max(1, letters.length));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const tTop = lineTop - 24 * k - T;
  const rowW = letters.length * T + (letters.length - 1) * gap;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: tTop - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.62))" }} />
      <div style={{ position: "absolute", left: (CANVAS_W - rowW) / 2, top: tTop, display: "flex", gap }}>
        {letters.map((c, i) => (
          <div key={i} style={{ width: T, height: T, background: OFF_WHITE, color: ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: T * 0.62, lineHeight: 1, borderRadius: 6 * k, boxShadow: "0 6px 14px rgba(0,0,0,.3)" }}>
            {c}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · letras em mosaico (matchday): M-A-T-C-H-D-A-Y on off-white tiles; HOME v AWAY · date · time under them. */
export function Natlettertiles({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatLettertilesFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · letras em mosaico: G-O-A-L tiles under his celebration; his name · his club's exact name. No score. */
export function Goalnatlettertiles({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLettertilesFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
