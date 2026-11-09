import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "vertical date" natural looks: his real photo full-bleed; along the edge away from him the
 * date set big in heavy caps rotated to read upward (the word instead when there is no date), and at the foot on the
 * same side the word small and one line. The NEYOD logo alone at the top.
 */
function NatVdateFrame({ data, big, word, line }: { data: RenderData; big: string; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const M = 56;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const top = (story ? STORY_TOP + 120 : 130) - (params.textY ?? 0);
  const wPx = 18 * k * ts;
  const lPx = 16 * k * ts;
  const footH = wPx + 10 * k + lPx;
  const len = bottom - footH - 40 * k - top;
  const bPx = Math.min(150 * k * ts, len / Math.max(1, big.length * 0.66));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = left ? { left: M, textAlign: "left" as const } : { right: M, textAlign: "right" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [left ? "left" : "right"]: 0, width: bPx + 2 * M + 80, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.5), rgba(0,0,0,0))` }} />
      <div
        style={{
          position: "absolute",
          [left ? "left" : "right"]: M,
          top: top + len,
          width: len,
          transformOrigin: left ? "left top" : "right top",
          transform: left ? "rotate(-90deg)" : "rotate(90deg) translateX(-100%)",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: bPx,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          whiteSpace: "nowrap",
          textAlign: "left",
        }}
      >
        {big}
      </div>
      <div style={{ position: "absolute", ...side, top: bottom - footH, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.26em", lineHeight: 1, opacity: 0.9 }}>{word}</div>
      <div style={{ position: "absolute", ...side, top: bottom - lPx, width: CANVAS_W * 0.6, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · data vertical (matchday): "25 OCT" big up the edge away from him; MATCHDAY and Home v Away · time at the foot (exact names). */
export function Natvdate({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatVdateFrame data={data} big={(fx.date || word).toUpperCase()} word={word} line={[`${fx.homeName} v ${fx.awayName}`, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · data vertical: the date (or GOAL) up the edge beside his celebration; GOAL and his name · his club's exact name. No score. */
export function Goalnatvdate({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "GOAL").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatVdateFrame data={data} big={(fx.date || word).toUpperCase()} word={word} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
