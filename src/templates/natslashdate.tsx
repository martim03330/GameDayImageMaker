import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "slash" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, two facts in bold on one line split by a tall thin slash in his club's colour, the word small and
 * tracked above, one quiet line below. The NEYOD logo alone at the top.
 */
function NatSlashdateFrame({ data, word, a, b, line }: { data: RenderData; word: string; a: string; b: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = Math.min(520 * k, CANVAS_W * 0.5);
  const fPx = Math.min(48 * k * ts, colW / Math.max(1, (a.length + b.length) * 0.62 + 1.6));
  const wPx = 15 * k * ts;
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = line ? bottom - lPx : bottom;
  const fTop = lineTop - (line ? 18 * k : 0) - fPx * 0.86;
  const wTop = fTop - 22 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const side = { position: "absolute" as const, [edge]: M, width: colW, textAlign: edge as "left" | "right", lineHeight: 1, whiteSpace: "nowrap" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ ...side, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.26em", opacity: 0.9 }}>{word}</div>
      <div style={{ ...side, top: fTop - fPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: fPx, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: fPx * 0.3, justifyContent: left ? "flex-start" : "flex-end" }}>
        <span>{a}</span>
        {/* A thin light edge keeps the slash visible when his club's colour is the photo's too (blue on blue). */}
        <span style={{ width: Math.max(3, fPx * 0.08), height: fPx * 1.15, background: colour, boxShadow: "0 0 0 1px rgba(255,255,255,.75)", transform: "skewX(-18deg)", flexShrink: 0 }} />
        <span>{b}</span>
      </div>
      {line && <div style={{ ...side, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, opacity: 0.88 }}>{line}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · barra oblíqua (matchday): date / time in bold split by a club-colour slash; MATCHDAY above, Home v Away below (exact names). */
export function Natslashdate({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSlashdateFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} a={fx.date || fx.homeName} b={fx.time || fx.awayName} line={[`${fx.homeName} v ${fx.awayName}`, fx.ptTime].filter(Boolean).join("  ·  ")} />;
}

/** Natural goal · barra oblíqua: GOAL above; his surname / his club's exact name split by the slash; full name below. No score. */
export function Goalnatslashdate({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSlashdateFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} a={data.content.lastName || name} b={ourClub(data)} line={data.content.lastName ? name : ""} />;
}
