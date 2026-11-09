import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "corner ribbon" natural looks: his real photo full-bleed and one band in his club's
 * colour crossing the top corner away from him at 45°, the word in small bold caps along it; at the foot one
 * quiet line of details. The NEYOD logo at the top, on the other side.
 */
function NatCornerribbonFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right";
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 470 : 610, fy: story ? 720 : 520, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const bandH = 64 * k;
  const len = 620 * k;
  const off = (story ? STORY_TOP - 40 : 0) + 120 * k; // distance of the band's centre from the corner
  const wPx = Math.min(22 * k * ts, (len * 0.6) / Math.max(1, capsEm(word, 0.3)));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const M = 60;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          [right ? "right" : "left"]: off - len / 2,
          top: off - bandH / 2,
          width: len,
          height: bandH,
          background: colour,
          color: ink,
          transform: `rotate(${right ? 45 : -45}deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: wPx,
          letterSpacing: "0.3em",
          paddingLeft: "0.3em",
          boxShadow: "0 6px 18px rgba(0,0,0,.3)",
          whiteSpace: "nowrap",
        }}
      >
        {word}
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", [right ? "left" : "right"]: M, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left top" : "right top" }} />
    </div>
  );
}

/** Natural · fita de canto (matchday): a 45° band in his club's colour reading MATCHDAY across the corner; HOME v AWAY · date · time at the foot. */
export function Natcornerribbon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCornerribbonFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · fita de canto: the corner band reads GOAL beside his celebration; his name · his club's exact name at the foot. No score. */
export function Goalnatcornerribbon({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCornerribbonFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
