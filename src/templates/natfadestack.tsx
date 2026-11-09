import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "fading stack" natural looks: his real photo full-bleed; at the foot-left the word in heavy
 * caps stacked three times with tight leading — the bottom one solid, the two above fading out — and one small line
 * under the stack. The NEYOD logo alone at the top.
 */
function NatFadestackFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 620,
    fy: story ? 660 : 470,
    fs: story ? 240 : 150,
  });
  const M = 56;
  // Kept to the left ~half, clear of him (wider, it ran over his legs).
  const wPx = Math.min(96 * k * ts, 470 / Math.max(1, word.length * 0.72));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const step = wPx * 0.82;
  const baseTop = lineTop - 18 * k - wPx * 0.9;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const row = (i: number) => ({ position: "absolute", left: M, top: baseTop - i * step - wPx * 0.08, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", opacity: [1, 0.45, 0.18][i] }) as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, top: baseTop - 2 * step - 160 * k, width: CANVAS_W * 0.85, bottom: 0, background: "radial-gradient(100% 90% at 0% 100%, rgba(0,0,0,.62), rgba(0,0,0,0) 72%)" }} />
      {[2, 1, 0].map((i) => (
        <div key={i} style={row(i)}>
          {word}
        </div>
      ))}
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · pilha esvanecida (matchday): MATCHDAY stacked three times fading up; HOME v AWAY · date · time under it. */
export function Natfadestack({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFadestackFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · pilha esvanecida: GOAL stacked three times fading up beside his celebration; his name · his club's exact name. No score. */
export function Goalnatfadestack({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFadestackFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
