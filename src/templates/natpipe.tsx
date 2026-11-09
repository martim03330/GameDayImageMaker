import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "pill row" natural looks: his real photo full-bleed; at the foot, on the side away
 * from him, the word in bold over one thin-outlined pill holding the facts in small caps, divided by short
 * vertical bars (the first fact in his club's colour). The NEYOD logo alone at the top.
 */
function NatPipeFrame({ data, word, facts }: { data: RenderData; word: string; facts: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const fs = facts.filter(Boolean).map((f) => f.toUpperCase());
  const gap = 16 * k;
  const pad = 22 * k;
  // The free part of the canvas only (in a story he is bigger and closer to the margin).
  const maxW = CANVAS_W * 0.56;
  const em = fs.reduce((a, f) => a + capsEm(f, 0.14), 0);
  const fPx = Math.min(15 * k * ts, (maxW - 2 * pad - (fs.length - 1) * (2 * gap + 2)) / Math.max(1, em));
  const pillW = em * fPx + 2 * pad + (fs.length - 1) * (2 * gap + 2);
  const pillH = fPx + 24 * k;
  const wPx = Math.min(60 * k * ts, (520 * k) / Math.max(1, word.length * 0.66));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const pillTop = bottom - pillH;
  const wTop = pillTop - 18 * k - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [edge]: M, top: pillTop, width: pillW, height: pillH, borderRadius: pillH / 2, border: `1.5px solid rgba(255,255,255,.8)`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap, fontFamily: SANS, fontWeight: 700, fontSize: fPx, letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap" }}>
        {fs.map((f, i) => (
          <span key={f} style={{ display: "contents" }}>
            {i > 0 && <span style={{ width: 2, height: fPx * 1.1, background: "rgba(255,255,255,.55)" }} />}
            <span style={{ color: i === 0 ? colour : OFF_WHITE }}>{f}</span>
          </span>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cápsula com divisões (matchday): MATCHDAY over a pill — DATE | TIME | HOME V AWAY (exact names). */
export function Natpipe({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatPipeFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} facts={[fx.date, fx.kickoff, `${fx.homeName} v ${fx.awayName}`]} />;
}

/** Natural goal · cápsula com divisões: GOAL over a pill — HIS NAME | HIS CLUB (exact name). No score. */
export function Goalnatpipe({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatPipeFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} facts={[name, ourClub(data)]} />;
}
