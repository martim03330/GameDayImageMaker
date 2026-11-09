import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "spine" natural looks: his real photo full-bleed and almost untouched; on the side
 * away from him a thin off-white rule runs top to bottom, and the text runs up along it like a book's spine —
 * the word in bold caps, then the details in light caps, one line. A soft shade only under the spine. The
 * NEYOD logo at the foot on the same side.
 */
function NatSpineFrame({ data, word, rest }: { data: RenderData; word: string; rest: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  // He stands away from the spine: spine on the left unless he is on the left.
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 720 : 520, fs: story ? 250 : 160 });
  const top = (story ? STORY_TOP : 60) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 60;
  const x = left ? 92 : CANVAS_W - 92;
  const len = bottom - top - (story ? 150 : 100);
  const text = `${word}   ${rest}`;
  // ~0.66 em per Inter cap plus the 0.22em tracking.
  const px = Math.min(26 * k * ts, len / Math.max(1, text.length * 0.9));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [left ? "left" : "right"]: 0, width: 260, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.42), rgba(0,0,0,0))` }} />
      <div style={{ position: "absolute", left: x - 1, top, width: 2, height: bottom - top, background: OFF_WHITE, opacity: 0.85 }} />
      <div
        style={{
          position: "absolute",
          left: x + (left ? 22 : -22),
          top: top + len,
          transformOrigin: "left top",
          transform: left ? "rotate(-90deg)" : "rotate(-90deg) translateY(-100%)",
          width: len,
          fontFamily: SANS,
          fontSize: px,
          lineHeight: 1,
          letterSpacing: "0.22em",
          whiteSpace: "nowrap",
          textShadow: "0 1px 8px rgba(0,0,0,.45)",
        }}
      >
        <span style={{ fontWeight: 800 }}>{word}</span>
        <span style={{ fontWeight: 400, opacity: 0.85, marginLeft: "1.4em" }}>{rest}</span>
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", [left ? "left" : "right"]: 64, top: bottom - (story ? 88 : 52) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "left top" : "right top" }} />
    </div>
  );
}

/** Natural · lombada (matchday): "MATCHDAY" then HOME v AWAY · date · time running up the spine. */
export function Natspine({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const rest = [`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase();
  return <NatSpineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} rest={rest} />;
}

/** Natural goal · lombada: "GOAL" then his name · his club's exact name up the spine. No score. */
export function Goalnatspine({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSpineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} rest={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
