import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const MIST = "245,243,238";

/**
 * The shared frame of the "light mist" natural looks: his real photo full-bleed; instead of the usual dark
 * shade, the foot fades softly into a pale off-white mist, and the type sits on it in dark ink — the word in
 * his club's colour, one line in near-black. The NEYOD logo at the top.
 */
function NatWhitefadeFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 660 : 470,
    fs: story ? 240 : 150,
  });
  const M = 60;
  const ink = panelColour(params.primary, params.accent);
  const wPx = Math.min(58 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(word, 0.04)));
  const lPx = Math.min(17 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.16)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 260 * k, bottom: 0, background: `linear-gradient(to bottom, rgba(${MIST},0), rgba(${MIST},.72) 55%, rgba(${MIST},.9))` }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.16em", paddingLeft: "0.16em", boxSizing: "border-box", lineHeight: 1, whiteSpace: "nowrap", color: "#1b1b1b" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · névoa clara (matchday): the foot fades to a pale mist; MATCHDAY in his club's colour, HOME V AWAY · date · time in ink (exact names). */
export function Natwhitefade({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatWhitefadeFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · névoa clara: GOAL in his club's colour on a pale mist under his celebration; his name · his club's exact name. No score. */
export function Goalnatwhitefade({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatWhitefadeFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
