import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "ellipsis" natural looks: his real photo full-bleed; at the foot a single centred
 * line of three items in small bold caps separated by wide-spaced triple dots ("· · ·"), the middle item larger;
 * nothing else but the NEYOD logo at the top. The calmest single-line foot.
 */
function NatDotsepFrame({ data, items }: { data: RenderData; items: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 520,
    fs: story ? 245 : 155,
  });
  const [a, b, c] = items;
  const sPx = 15 * k * ts;
  const bPx = 30 * k * ts;
  const sep = "  ·  ·  ·  ";
  const em = capsEm(a, 0.24) * sPx + capsEm(c, 0.24) * sPx + capsEm(b, 0.08) * bPx + 2 * capsEm(sep, 0.24) * sPx;
  const f = Math.min(1, (CANVAS_W - 100) / Math.max(1, em));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + bPx + 200 * k, background: "linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - bPx * f, display: "flex", alignItems: "baseline", justifyContent: "center", fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1 }}>
        <span style={{ fontWeight: 700, fontSize: sPx * f, letterSpacing: "0.24em", opacity: 0.9 }}>{a}</span>
        <span style={{ fontWeight: 400, fontSize: sPx * f, letterSpacing: "0.24em", opacity: 0.6, whiteSpace: "pre" }}>{sep}</span>
        <span style={{ fontWeight: 800, fontSize: bPx * f, letterSpacing: "0.08em" }}>{b}</span>
        <span style={{ fontWeight: 400, fontSize: sPx * f, letterSpacing: "0.24em", opacity: 0.6, whiteSpace: "pre" }}>{sep}</span>
        <span style={{ fontWeight: 700, fontSize: sPx * f, letterSpacing: "0.24em", opacity: 0.9 }}>{c}</span>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · reticências (matchday): HOME · · · MATCHDAY · · · AWAY at the foot (exact names). */
export function Natdotsep({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatDotsepFrame data={data} items={[fx.homeName.toUpperCase(), (data.content.kicker || "MATCHDAY").toUpperCase(), fx.awayName.toUpperCase()]} />;
}

/** Natural goal · reticências: HIS NAME · · · GOAL · · · HIS CLUB (exact name) under his celebration. No score. */
export function Goalnatdotsep({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDotsepFrame data={data} items={[name.toUpperCase(), (data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()]} />;
}
