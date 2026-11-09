import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "bubble" natural looks (a chat bubble): his real photo full-bleed; on the side away from
 * him, low on the canvas, one rounded off-white bubble with a small tail pointing toward him, holding the word in
 * bold in his club's colour and two lines of ink. The NEYOD logo alone at the top.
 */
function NatBubbleFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const ink = panelColour(params.primary, params.accent);
  const pad = 24 * k;
  const ls = lines.filter(Boolean);
  // The bubble hugs its text (capped at 420) so it stays off his body.
  const max = 420 * k;
  const wPx = Math.min(42 * k * ts, (max - 2 * pad) / Math.max(1, word.length * 0.64));
  const lPx = 17 * k * ts;
  const W = Math.min(max, Math.max(word.length * 0.66 * wPx, ...ls.map((l) => l.length * 0.56 * lPx)) + 2 * pad + 8);
  const BH = wPx + 10 * k + ls.length * lPx * 1.35 + 2 * pad;
  const bottom = (story ? STORY_BOTTOM : H - 80) - (params.textY ?? 0);
  const top = bottom - BH;
  const x = left ? 56 : CANVAS_W - 56 - W;
  const tail = 22 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: x, top, width: W, height: BH, filter: "drop-shadow(0 10px 24px rgba(0,0,0,.3))" }}>
        <div style={{ position: "absolute", inset: 0, background: OFF_WHITE, borderRadius: 26 * k }} />
        <div style={{ position: "absolute", [left ? "right" : "left"]: -tail + 2, top: BH * 0.3, width: 0, height: 0, borderTop: `${tail / 1.4}px solid transparent`, borderBottom: `${tail / 1.4}px solid transparent`, [left ? "borderLeft" : "borderRight"]: `${tail}px solid ${OFF_WHITE}` }} />
        <div style={{ position: "absolute", left: pad, right: pad, top: pad, color: ink }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1 }}>{word}</div>
          <div style={{ marginTop: 10 * k, fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.35, color: "#1a1a1a" }}>
            {ls.map((l) => (
              <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · balão (matchday): a chat bubble pointing at him — MATCHDAY, Home v Away, date · time (exact names). */
export function Natbubble({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBubbleFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · balão: the bubble pointing at his celebration — GOAL, his name, his club's exact name. No score. */
export function Goalnatbubble({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBubbleFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
