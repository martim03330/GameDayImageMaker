import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "passe-partout" natural looks: his real photo full-bleed with one thin off-white line
 * framing it a little in from the edges, drawn BEHIND him (he breaks out of the frame); the line opens at the top
 * for the NEYOD logo and, on the side away from him, at the foot for the word, which sits in that gap; one
 * small line under it.
 */
function NatFramelineFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const I = 40;
  const T = 1.5;
  const wPx = Math.min(34 * k * ts, (CANVAS_W - 300) / Math.max(1, word.length * 0.8));
  const wW = word.length * 0.8 * wPx;
  const lPx = Math.min(15 * k * ts, (CANVAS_W * 0.62) / Math.max(1, line.length * 0.6));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const frameTop = logoTop + (story ? 44 : 26);
  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const frameBottom = bottom - lPx - 18 * k;
  const logoGap = (story ? 300 : 190) * (params.logoScale ?? 1);
  const wordGap = wW + 50 * k;
  const free = params.side !== "left";
  // Centre of the word's gap: in the free half, clear of the frame's corner.
  const gx = free ? Math.max(I + 60 + wordGap / 2, CANVAS_W * 0.3) : Math.min(CANVAS_W - I - 60 - wordGap / 2, CANVAS_W * 0.7);
  const line_ = { position: "absolute" as const, background: OFF_WHITE, opacity: 0.85 };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: frameBottom - 260 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 55%, rgba(0,0,0,.62))" }} />
      {/* Top line, open in the middle for the logo. */}
      <div style={{ ...line_, left: I, width: (CANVAS_W - logoGap) / 2 - I, top: frameTop, height: T }} />
      <div style={{ ...line_, right: I, width: (CANVAS_W - logoGap) / 2 - I, top: frameTop, height: T }} />
      {/* Sides. */}
      <div style={{ ...line_, left: I, top: frameTop, width: T, height: frameBottom - frameTop }} />
      <div style={{ ...line_, right: I, top: frameTop, width: T, height: frameBottom - frameTop }} />
      {/* Bottom line, open on the free side for the word. */}
      <div style={{ ...line_, left: I, width: gx - wordGap / 2 - I, top: frameBottom, height: T }} />
      <div style={{ ...line_, left: gx + wordGap / 2, right: I, top: frameBottom, height: T }} />
      {/* He stands in front of the frame. */}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: gx - wordGap / 2, width: wordGap, top: frameBottom - wPx * 0.5, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.16em", paddingLeft: "0.16em", boxSizing: "border-box", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [free ? "left" : "right"]: I, width: CANVAS_W * 0.62, top: bottom - lPx, textAlign: free ? "left" : "right", fontFamily: SANS, fontWeight: 500, fontSize: lPx, letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · passe-partout (matchday): a thin frame around his photo, MATCHDAY in the gap of its foot, the fixture below (exact names). */
export function Natframeline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFramelineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ").toUpperCase()} />;
}

/** Natural goal · passe-partout: GOAL in the frame's gap under his celebration; his name · his club's exact name. No score. */
export function Goalnatframeline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFramelineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ").toUpperCase()} />;
}
