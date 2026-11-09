import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "typewriter" natural looks (a typed dispatch): his real photo full-bleed; at the
 * foot-left, all in mono: the word with a block cursor after it, and two short typed lines under it with a
 * "> " prompt. The NEYOD logo alone at the top. A soft shade only under the type.
 */
function NatTypewriterFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const wPx = Math.min(64 * k * ts, (CANVAS_W - 2 * M - 60) / Math.max(1, word.length * 0.62));
  const lPx = Math.min(19 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, Math.max(...lines.map((l) => l.length + 2)) * 0.6));
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.5;
  const wTop = linesTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: MONO, fontWeight: 700, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
        {word}
        <span style={{ display: "inline-block", width: wPx * 0.5, height: wPx * 0.86, background: OFF_WHITE, marginLeft: wPx * 0.12 }} />
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: linesTop, fontFamily: MONO, fontWeight: 500, fontSize: lPx, lineHeight: 1.5, opacity: 0.9 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap" }}>
            <span style={{ opacity: 0.6 }}>&gt; </span>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · máquina de escrever (matchday): "matchday█" in mono; "> Home v Away" and "> date, time" typed under it (exact names). */
export function Nattypewriter({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatTypewriterFrame data={data} word={(data.content.kicker || "matchday").toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(", ").toLowerCase()]} />;
}

/** Natural goal · máquina de escrever: "goal█" under his celebration; "> his name" and "> his club's exact name". No score. */
export function Goalnattypewriter({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTypewriterFrame data={data} word={(data.content.kicker || "goal").toLowerCase()} lines={[name, ourClub(data)]} />;
}
