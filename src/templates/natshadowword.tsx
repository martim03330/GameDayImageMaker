import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "echo" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, the word in bold with one hollow copy of it (outline only, his club's colour) set a little up and
 * across behind it, like a shadow; two quiet lines under it. The NEYOD logo alone at the top.
 */
function NatShadowwordFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 480 * k;
  const ls = lines.filter(Boolean);
  const wPx = Math.min(72 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = 18 * k * ts;
  const off = wPx * 0.14;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 20 * k - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const big = { position: "absolute" as const, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...big, [edge]: M + off, top: wTop - wPx * 0.12 - off, color: "transparent", WebkitTextStroke: `${Math.max(1.5, wPx * 0.02)}px ${colour}` }}>{word}</div>
      <div style={{ ...big, [edge]: M, top: wTop - wPx * 0.12 }}>{word}</div>
      <div style={{ position: "absolute", [edge]: M, width: colW, top: linesTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
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

/** Natural · eco (matchday): MATCHDAY with a hollow club-colour echo behind it; Home v Away and date · time below (exact names). */
export function Natshadowword({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatShadowwordFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · eco: GOAL with its hollow echo under his celebration; his name and his club's exact name. No score. */
export function Goalnatshadowword({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatShadowwordFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
