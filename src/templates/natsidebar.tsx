/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "sidebar" natural looks: an off-white column down one side (a third of the width)
 * and his real photo full-bleed in the rest, untouched. In the column, top to bottom, in ink of his club's
 * colour: the crest, the word in serif, a hairline, the details one per line; the dark NEYOD logo at its foot.
 */
function NatSidebarFrame({ data, word, rows, crest }: { data: RenderData; word: string; rows: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = panelColour(params.primary, params.accent);
  const left = params.side === "right"; // the column sits away from him
  const colW = 340;
  const photoW = CANVAS_W - colW;
  const place = natPlace(data, photoW, H, { fx: photoW * 0.5, fy: story ? 720 : 520, fs: story ? 245 : 155 });
  const pad = 40;
  const top = (story ? STORY_TOP : 64) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 56;
  const wPx = Math.min(62 * k * ts, (colW - 2 * pad) / Math.max(1, word.length * 0.52));
  const rPx = 17 * k * ts;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: ink }}>
      <div style={{ position: "absolute", top: 0, left: left ? colW : 0, width: photoW, height: H, overflow: "hidden" }}>
        <NatGround place={place} W={photoW} H={H} />
        <NatFigure data={data} place={place} W={photoW} H={H} />
      </div>
      <div style={{ position: "absolute", top, [left ? "left" : "right"]: pad, width: colW - 2 * pad }}>
        {crest && <img src={crest} alt="" style={{ width: 64 * k, height: 64 * k, objectFit: "contain", display: "block" }} />}
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 30 * k }}>{word}</div>
        <div style={{ height: 1.5, background: ink, opacity: 0.5, margin: `${22 * k}px 0` }} />
        {rows.filter(Boolean).map((r) => (
          <div key={r} style={{ fontFamily: SANS, fontWeight: 500, fontSize: rPx, lineHeight: 1.5 }}>
            {r}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", [left ? "left" : "right"]: pad, top: bottom - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "left top" : "right top" }} />
    </div>
  );
}

/** Natural · margem lateral (matchday): the column reads crest, "Matchday", then Home / v Away / date · time / venue (exact names). */
export function Natsidebar({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return (
    <NatSidebarFrame
      data={data}
      word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}
      rows={[fx.homeName, `v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · "), fx.venue]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · margem lateral: crest, "Goal.", his name and his club's exact name in the column, beside his celebration. No score. */
export function Goalnatsidebar({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSidebarFrame data={data} word={`${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}.`} rows={[name, ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
