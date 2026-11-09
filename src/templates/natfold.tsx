/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "fold" natural looks: his real photo full-bleed above a flat off-white sheet that
 * takes the lower quarter, like a printed page folded under the picture. On the sheet, the word in a big
 * serif in his club's colour (left) and two small lines (right). The photo is framed so he stands above the
 * fold; the NEYOD logo alone at the top, over a soft shade.
 */
function NatFoldFrame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = panelColour(params.primary, params.accent);
  const sheetH = story ? 400 : 300;
  const sheetTop = (story ? STORY_BOTTOM + 60 : H) - sheetH;
  const photoH = sheetTop;
  const place = natPlace(data, CANVAS_W, photoH, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: photoH * 0.32,
    fs: story ? 230 : 150,
  });
  // DM Serif advances ~0.52 em: the word fits the sheet's width left of the crest.
  const wPx = Math.min(128 * k * ts, (CANVAS_W - 128 - 90 * k) / Math.max(1, word.length * 0.52));
  const lPx = 17 * k * ts;
  const wTop = sheetTop + 34 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: photoH, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={photoH} />
        <NatFigure data={data} place={place} W={CANVAS_W} H={photoH} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      </div>
      {/* The fold: a hairline shadow where the sheet meets the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: sheetTop, height: 10, background: "linear-gradient(to bottom, rgba(0,0,0,.14), rgba(0,0,0,0))" }} />
      {/* The word on the sheet's first line, the details in one small line under it, the crest at the right. */}
      <div style={{ position: "absolute", left: 64, top: wTop, fontFamily: SERIF, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 66, right: 64 + 90 * k, top: wTop + wPx + 18 * k, fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.3, letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {lines.filter(Boolean).join("  ·  ")}
      </div>
      {crest && <img src={crest} alt="" style={{ position: "absolute", right: 64, top: wTop + (wPx - 66 * k) / 2, width: 66 * k, height: 66 * k, objectFit: "contain" }} />}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · dobra (matchday): "Matchday" in serif on the sheet; the fixture (exact names) and date · time · venue at its right, his club's crest. */
export function Natfold({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  const word = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  return <NatFoldFrame data={data} word={word} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · "), fx.venue]} crest={crest} />;
}

/** Natural goal · dobra: his celebration photo above the sheet; "Goal." in serif, his name and his club's exact name at the right. No score. */
export function Goalnatfold({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFoldFrame data={data} word={`${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}.`} lines={[name, ourClub(data)]} crest={crest} />;
}
