import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "serif stack" natural looks: his real photo full-bleed; at the foot-left the word split in
 * two and stacked in a big display serif ("Match" / "day", "Go" / "al" — the second line in italic), tight leading,
 * then one small tracked line. The NEYOD logo alone at the top.
 */
function NatSerifstackFrame({ data, a, b, line }: { data: RenderData; a: string; b: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 640,
    fy: story ? 650 : 460,
    fs: story ? 240 : 150,
  });
  const M = 56;
  const longest = Math.max(a.length, b.length, 1);
  const sPx = Math.min(150 * k * ts, 520 / (longest * 0.52));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const top = lineTop - 20 * k - sPx * 1.75;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, top: top - 140 * k, width: CANVAS_W * 0.85, bottom: 0, background: "radial-gradient(100% 90% at 0% 100%, rgba(0,0,0,.62), rgba(0,0,0,0) 72%)" }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: SERIF, fontSize: sPx, lineHeight: 0.88, letterSpacing: "-0.02em" }}>
        <div style={{ whiteSpace: "nowrap" }}>{a}</div>
        <div style={{ whiteSpace: "nowrap", fontStyle: "italic", paddingLeft: sPx * 0.4 }}>{b}</div>
      </div>
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const split = (word: string): [string, string] => {
  const w = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  if (w === "Matchday") return ["Match", "day"];
  const m = Math.ceil(w.length / 2);
  return [w.slice(0, m), w.slice(m)];
};

/** Natural · serifa empilhada (matchday): "Match" / "day" stacked in serif; HOME v AWAY · date · time under it. */
export function Natserifstack({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const [a, b] = split(data.content.kicker || "MATCHDAY");
  return <NatSerifstackFrame data={data} a={a} b={b} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · serifa empilhada: "Go" / "al" stacked in serif beside his celebration; his name · his club's exact name. No score. */
export function Goalnatserifstack({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const [a, b] = split(data.content.kicker || "GOAL");
  return <NatSerifstackFrame data={data} a={a} b={b} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
