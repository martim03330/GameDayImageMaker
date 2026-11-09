import { NatFigure, NatGround, natPlace } from "./natkit";
import { PHOTO_TEXT_SHADOW, clubOnLight, linesAt, pressArticles, pressDateLabel, sourceLabel } from "./presskit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Press · stack: his own match photo full-bleed (natural, light grade), and on the free side a vertical
 * stack of clean white headline cards — outlet in small caps in the club colour, the headline bold exactly
 * as published, the date — each overlapping the one above a little, with small shadows. "IN THE NEWS"
 * small at the top, the NEYOD logo opposite it.
 */
export function Pressstack({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side === "left"; // he stands on this side, the cards on the other
  const M = story ? 64 : 56;

  const place = natPlace(data, CANVAS_W, H, { fx: left ? (story ? 290 : 330) : story ? 790 : 750, fy: story ? 610 : 330, fs: story ? 200 : 136 });

  /* ---- the cards ---- */
  const arts = pressArticles(data, 6);
  const n = arts.length;
  const cardW = story ? 600 : 572;
  const pad = Math.round(22 * k);
  const textW = cardW - 2 * pad;
  // Headline size: smaller with more cards and longer headlines; the whole stack must stay under his face.
  const top = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 52;
  const faceBottom = place.fy + place.fs * 0.62;
  // The stack may rise past his face only when it stays clear of it sideways (it covers his body, never his face).
  const colL = left ? CANVAS_W - M - cardW - 18 : M;
  const colR = colL + cardW + 18;
  const faceL = place.fx - place.faceW * 0.9;
  const faceR = place.fx + place.faceW * 0.9;
  const clearSide = colR < faceL - 20 || colL > faceR + 20;
  const room = bottom - Math.max(clearSide ? faceBottom + 16 * k : faceBottom + 90 * k, top + 200 * k);
  const overlap = Math.round(12 * k);
  const srcSize = Math.round(13 * k);
  const stackH = (size: number) =>
    arts.reduce((h, a) => h + pad * 2 + srcSize + 10 * k + linesAt(a.title, size, textW, 0.52) * size * 1.14, 0) - (n - 1) * overlap;
  let size = (n <= 2 ? 38 : n === 3 ? 33 : n === 4 ? 28 : n === 5 ? 25 : 23) * k * ts;
  while (size > 15 * k && stackH(size) > room) size -= 1;
  const club = clubOnLight(params);
  const stagger = story ? 22 : 18;

  const kicker = (content.kicker || "IN THE NEWS").toUpperCase();
  const sub = (content.subline || "").toUpperCase();
  const kSize = Math.round(19 * k * ts);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: "#fff" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {/* Soft shade at the top for the kicker / logo only. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 230 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />

      {/* The kicker, small, on the cards' side. */}
      <div style={{ position: "absolute", top: top + 6 * k, [left ? "right" : "left"]: M, textAlign: left ? "right" : "left", textShadow: PHOTO_TEXT_SHADOW }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: kSize, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap", marginRight: left ? "-0.3em" : 0 }}>{kicker}</div>
        {sub && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: Math.round(13 * k * ts), letterSpacing: "0.24em", marginTop: 12 * k, opacity: 0.9, whiteSpace: "nowrap", marginRight: left ? "-0.24em" : 0 }}>{sub}</div>}
      </div>

      {/* The stack, bottom-anchored, first article on top. */}
      <div style={{ position: "absolute", bottom: H - bottom, [left ? "right" : "left"]: M, width: cardW + stagger, display: "flex", flexDirection: "column", alignItems: left ? "flex-end" : "flex-start" }}>
        {arts.map((a, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              zIndex: i + 1,
              width: cardW,
              marginTop: i ? -overlap : 0,
              [left ? "marginRight" : "marginLeft"]: i % 2 ? stagger : 0,
              background: "#ffffff",
              color: "#121417",
              borderRadius: 4,
              padding: `${pad}px ${pad}px ${pad + (i < n - 1 ? overlap * 0.4 : 0)}px`,
              boxShadow: "0 2px 4px rgba(0,0,0,.14), 0 10px 26px rgba(0,0,0,.22)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: SANS, fontSize: srcSize, lineHeight: 1, letterSpacing: "0.16em", whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 800, color: club }}>{sourceLabel(a)}</span>
              {a.date && <span style={{ fontWeight: 600, color: "#7b8088" }}>{pressDateLabel(a.date)}</span>}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.14, letterSpacing: "-0.012em", marginTop: 10 * k }}>{a.title}</div>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", top, [left ? "left" : "right"]: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "left top" : "right top" }}
      />
    </div>
  );
}
