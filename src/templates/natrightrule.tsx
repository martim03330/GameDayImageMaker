import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "right rule" natural looks: his real photo full-bleed; at the foot, on the side away from
 * him, flush against a tall vertical hairline, the word in bold and two small lines aligned to it. The NEYOD logo at
 * the opposite top corner. A soft shade only in that corner.
 */
function NatRightruleFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  // The block sits flush against the side away from him (on his side it ran over his legs).
  const right = params.side !== "right";
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 440 : 640, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 60;
  const ruleX = right ? CANVAS_W - M : M;
  const gap = 22 * k;
  const wPx = Math.min(70 * k * ts, 560 / Math.max(1, word.length * 0.62));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const blockH = wPx + 14 * k + ls.length * lPx * 1.4;
  const top = bottom - blockH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", [right ? "right" : "left"]: 0, bottom: 0, width: CANVAS_W * 0.8, height: blockH + 320 * k, background: `radial-gradient(100% 90% at ${right ? "100%" : "0%"} 100%, rgba(0,0,0,.62), rgba(0,0,0,0) 72%)` }} />
      <div style={{ position: "absolute", left: ruleX, top: top - 30 * k, width: 2, height: blockH + 30 * k, background: OFF_WHITE, opacity: 0.85 }} />
      <div style={{ position: "absolute", [right ? "right" : "left"]: M + gap, top, textAlign: right ? "right" : "left", maxWidth: CANVAS_W - 2 * M - gap }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ marginTop: 14 * k, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, opacity: 0.92 }}>
          {ls.map((l) => (
            <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", [right ? "left" : "right"]: M, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left top" : "right top" }} />
    </div>
  );
}

/** Natural · alinhado à direita (matchday): "Matchday" flush right against a hairline; Home v Away and date · time (exact names). */
export function Natrightrule({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatRightruleFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · alinhado à direita: "Goal" flush right by the hairline; his name and his club's exact name. No score. */
export function Goalnatrightrule({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatRightruleFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}
