import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "top pill" natural looks: his real photo full-bleed, the NEYOD logo at the top and,
 * just under it, one off-white pill holding the word (in his club's colour) and a short detail after a dot.
 * At the foot one quiet line. Nothing else — the most minimal header.
 */
function NatPilltopFrame({ data, word, detail, foot }: { data: RenderData; word: string; detail: string; foot: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 560,
    fs: story ? 245 : 155,
  });
  const ink = panelColour(params.primary, params.accent);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const pTop = logoTop + (story ? 88 : 52) + 26 * k;
  const pPx = 18 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const fPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(foot, 0.22)));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: pTop + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.32), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + fPx + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: pTop, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 * k, background: OFF_WHITE, borderRadius: 999, padding: `${11 * k}px ${22 * k}px`, boxShadow: "0 6px 18px rgba(0,0,0,.25)", fontFamily: SANS, fontSize: pPx, lineHeight: 1, whiteSpace: "nowrap" }}>
          <span style={{ fontWeight: 800, color: ink, letterSpacing: "0.12em" }}>{word}</span>
          {detail && <span style={{ width: 5 * k, height: 5 * k, borderRadius: "50%", background: "#161616", opacity: 0.5 }} />}
          {detail && <span style={{ fontWeight: 600, color: "#161616" }}>{detail}</span>}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - fPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: fPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{foot}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · pastilha no topo (matchday): a pill "MATCHDAY · 25 OCT 15:30" under the logo; HOME v AWAY at the foot (exact names). */
export function Natpilltop({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatPilltopFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} detail={[fx.date, fx.kickoff].filter(Boolean).join(" ")} foot={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} />;
}

/** Natural goal · pastilha no topo: a pill "GOAL · his name" under the logo; his club's exact name at the foot. No score. */
export function Goalnatpilltop({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatPilltopFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} detail={name} foot={ourClub(data).toUpperCase()} />;
}
