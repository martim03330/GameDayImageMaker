import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "triangle" natural looks: his real photo full-bleed and one right-angled triangle of his
 * club's colour filling the lower corner away from him (behind him); on it, along its foot, the word in bold and two
 * small lines. The NEYOD logo alone at the top.
 */
function NatTriangleFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const foot = story ? STORY_BOTTOM + 60 : H;
  const T = (story ? 640 : 520) * k * 0.85;
  const M = 50;
  const wPx = Math.min(54 * k * ts, 380 / Math.max(1, word.length * 0.64));
  const lPx = 16 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 50) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.35;
  const wTop = linesTop - 12 * k - wPx;
  const shape = left ? "polygon(0 0, 0 100%, 100% 100%)" : "polygon(100% 0, 100% 100%, 0 100%)";
  const side = left ? { left: M, textAlign: "left" as const } : { right: M, textAlign: "right" as const };
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: ink }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", [left ? "left" : "right"]: 0, top: foot - T, width: T, height: T, background: colour, clipPath: shape, opacity: 0.95 }} />
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: foot, bottom: 0, background: "rgba(0,0,0,.3)" }} />}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", ...side, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", ...side, top: linesTop, width: T * 0.8, fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.35 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · triângulo (matchday): a triangle of his club's colour in the lower corner with MATCHDAY, Home v Away, date · time (exact names). */
export function Nattriangle({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatTriangleFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · triângulo: the corner triangle beside his celebration with GOAL, his name and his club's exact name. No score. */
export function Goalnattriangle({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTriangleFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
