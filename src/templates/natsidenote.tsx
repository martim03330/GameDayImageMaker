import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "side note" natural looks: his real photo full-bleed; one small line of facts set
 * vertically up the margin away from him (read bottom to top, like a book spine), and at the foot of that
 * margin the word in bold. The NEYOD logo alone at the top.
 */
function NatSidenoteFrame({ data, word, note }: { data: RenderData; word: string; note: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const wPx = Math.min(64 * k * ts, (520 * k) / Math.max(1, word.length * 0.66));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const wTop = bottom - wPx * 0.86;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  // The vertical line runs from above the word up toward the logo band.
  const runBottom = wTop - 30 * k;
  const runTop = logoTop + (story ? 160 : 110);
  const nPx = Math.min(15 * k * ts, (runBottom - runTop) / Math.max(1, capsEm(note, 0.24)));
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [edge]: 0, width: 260 * k, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.42), rgba(0,0,0,0))` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 55%, rgba(0,0,0,.62))" }} />
      {/* Rotated -90°: the line's start sits at the bottom, read upward. */}
      <div style={{ position: "absolute", [edge]: M, top: runBottom, width: runBottom - runTop, height: nPx, transform: "rotate(-90deg)", transformOrigin: "0 0", display: "flex", alignItems: "center", gap: 14 * k, ...(left ? {} : { left: CANVAS_W - M - nPx, right: "auto" }) }}>
        <span style={{ width: 22 * k, height: 2.5 * k, background: colour, flexShrink: 0 }} />
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: nPx, letterSpacing: "0.24em", lineHeight: 1, whiteSpace: "nowrap" }}>{note}</span>
      </div>
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · nota lateral (matchday): HOME V AWAY · date · time up the free margin; MATCHDAY at its foot (exact names). */
export function Natsidenote({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSidenoteFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} note={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · nota lateral: his name · his club's exact name up the free margin; GOAL at its foot. No score. */
export function Goalnatsidenote({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSidenoteFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} note={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
