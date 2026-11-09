/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "column" natural looks: his real photo full-bleed; down the side away from him a
 * narrow column of short lines, one word per line — the word in bold, then the details — like a poster's
 * side text, with the crest at its head. The NEYOD logo at the foot of the column. A soft shade on that side.
 */
function NatColumnFrame({ data, word, rows, crest }: { data: RenderData; word: string; rows: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right"; // the column sits away from him
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 450 : 630, fy: story ? 720 : 520, fs: story ? 250 : 160 });
  const M = 64;
  const top = (story ? STORY_TOP + 20 : 80) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 60;
  const colW = 300 * k;
  const wPx = Math.min(44 * k * ts, colW / Math.max(1, word.length * 0.6));
  const rPx = 20 * k * ts;
  const crestS = 56 * k;
  const logoH = story ? 88 : 52;
  const side = right ? { right: M } : { left: M };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [right ? "right" : "left"]: 0, width: colW + 2 * M + 80, background: `linear-gradient(to ${right ? "left" : "right"}, rgba(0,0,0,.5), rgba(0,0,0,.25) 60%, rgba(0,0,0,0))` }} />
      <div style={{ position: "absolute", ...side, top, width: colW, textAlign: right ? "right" : "left" }}>
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", display: "block", marginLeft: right ? "auto" : 0 }} />}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.04em", lineHeight: 1, marginTop: 26 * k }}>{word}</div>
        <div style={{ width: 60 * k, height: 2, background: OFF_WHITE, margin: `${18 * k}px 0`, marginLeft: right ? "auto" : 0, opacity: 0.85 }} />
        {rows.filter(Boolean).map((r) => (
          <div key={r} style={{ fontFamily: SANS, fontWeight: 500, fontSize: rPx, lineHeight: 1.45, opacity: 0.92 }}>
            {r}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", ...side, top: bottom - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "right top" : "left top" }} />
    </div>
  );
}

/** Natural · coluna (matchday): crest, MATCHDAY, then Home / v / Away / date / time / venue, one per line (exact names). */
export function Natcolumn({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatColumnFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      rows={[fx.homeName, "v", fx.awayName, fx.date, fx.kickoff, fx.venue]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · coluna: crest, GOAL, then his first name, surname and his club's exact name, one per line. No score. */
export function Goalnatcolumn({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatColumnFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      rows={[data.content.firstName ?? "", data.content.lastName ?? "", ourClub(data)]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}
