import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "stacked" natural looks: his real photo full-bleed; on the side away from him, the
 * word broken into short stacked lines — MAT / CH / DAY, GO / AL — in heavy caps, flush to that edge, tight
 * leading, like a poster; one small line under the stack. The NEYOD logo alone at the top.
 */
function NatSyllableFrame({ data, parts, line }: { data: RenderData; parts: string[]; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 650 : 430, fy: story ? 700 : 500, fs: story ? 240 : 150 });
  const M = 56;
  const longest = Math.max(1, ...parts.map((p) => p.length));
  const size = Math.min(150 * k * ts, 400 / (longest * 0.66));
  const lPx = Math.min(15 * k * ts, 500 / Math.max(1, capsEm(line, 0.2)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const stackTop = lineTop - 20 * k - parts.length * size * 0.86;
  const side = left ? { left: M, textAlign: "left" as const } : { right: M, textAlign: "right" as const };
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: stackTop - 160 * k, bottom: 0, [left ? "left" : "right"]: 0, width: CANVAS_W * 0.7, background: `radial-gradient(90% 80% at ${left ? "0%" : "100%"} 80%, rgba(0,0,0,.6), rgba(0,0,0,0) 72%)` }} />
      <div style={{ position: "absolute", ...side, top: stackTop, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: "-0.04em", lineHeight: 0.86 }}>
        {parts.map((p, i) => (
          <div key={p + i}>{p}</div>
        ))}
      </div>
      <div style={{ position: "absolute", ...side, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Breaks a word into 2–3 short stacked lines. */
function chunks(word: string): string[] {
  const w = word.toUpperCase();
  if (w === "MATCHDAY") return ["MATCH", "DAY"];
  if (w.length <= 4) return [w.slice(0, 2), w.slice(2)];
  const n = Math.ceil(w.length / 3);
  return [w.slice(0, n), w.slice(n, 2 * n), w.slice(2 * n)].filter(Boolean);
}

/** Natural · empilhado (matchday): MATCH / DAY stacked on the side away from him; HOME v AWAY · date · time under it. */
export function Natsyllable({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSyllableFrame data={data} parts={chunks(data.content.kicker || "MATCHDAY")} line={[`${fx.homeName} v ${fx.awayName}`, fx.date].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · empilhado: GO / AL stacked beside his celebration; his name · his club's exact name under it. No score. */
export function Goalnatsyllable({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSyllableFrame data={data} parts={chunks(data.content.kicker || "GOAL")} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
