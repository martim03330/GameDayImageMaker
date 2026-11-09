import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "superscript" natural looks: his real photo full-bleed; on the side away from him at
 * the foot, the word large and bold with a small fact raised at its top-right like an exponent (in his club's
 * colour), one quiet line under it. The NEYOD logo alone at the top.
 */
function NatSupFrame({ data, word, sup, line }: { data: RenderData; word: string; sup: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 660 : 420, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 500 * k;
  const sPx = 17 * k * ts;
  const supW = capsEm(sup, 0.1) * sPx + 10 * k;
  const wPx = Math.min(80 * k * ts, (colW - supW) / Math.max(1, word.length * 0.66));
  const lPx = Math.min(18 * k * ts, colW / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 16 * k - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, display: "flex", justifyContent: left ? "flex-start" : "flex-end" };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...edge, top: wTop - wPx * 0.1, alignItems: "flex-start", gap: 10 * k, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1 }}>{word}</span>
        {sup && <span style={{ marginTop: wPx * 0.16, fontFamily: SANS, fontWeight: 700, fontSize: sPx, letterSpacing: "0.1em", lineHeight: 1, color: colour, background: "rgba(255,255,255,.92)", padding: `${4 * k}px ${7 * k}px`, borderRadius: 3 * k }}>{sup}</span>}
      </div>
      <div style={{ ...edge, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, opacity: 0.9 }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: colW }}>{line}</span>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · expoente (matchday): MATCHDAY with the kick-off time raised like an exponent; Home v Away · date below (exact names). */
export function Natsup({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSupFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} sup={fx.time || fx.date} line={[`${fx.homeName} v ${fx.awayName}`, fx.time ? fx.date : "", fx.ptTime].filter(Boolean).join(" · ")} />;
}

/** Natural goal · expoente: GOAL with his surname raised like an exponent; his full name · his club's exact name below. No score. */
export function Goalnatsup({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSupFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} sup={(data.content.lastName || data.content.firstName || "").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
