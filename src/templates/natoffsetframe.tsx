import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "offset frame" natural looks: his real photo inset a little from the canvas edges on an
 * off-white ground, and a thin rule rectangle the same size set off by a few dozen pixels down and right (a
 * misregistered print). In the bottom margin, in ink: the word in bold at the left, one line at the right. The
 * dark NEYOD logo in the top margin.
 */
function NatOffsetframeFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = "#161616";
  const B = 56;
  const off = 22 * k;
  const topM = story ? STORY_TOP + 60 : 120;
  const botM = story ? H - STORY_BOTTOM + 140 : 190;
  const pw = CANVAS_W - 2 * B - off;
  const ph = H - topM - botM;
  const place = natPlace(data, pw, ph, { fx: pw * (params.side === "left" ? 0.4 : params.side === "right" ? 0.6 : 0.5), fy: ph * 0.3, fs: story ? 230 : 150 });
  const wPx = Math.min(54 * k * ts, 460 / Math.max(1, word.length * 0.62));
  const lPx = Math.min(15 * k * ts, 420 / Math.max(1, capsEm(line, 0.16)));
  const footY = topM + ph + off + 36 * k;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: ink }}>
      <div style={{ position: "absolute", left: B + off, top: topM + off, width: pw, height: ph, border: `2px solid ${ink}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: B, top: topM, width: pw, height: ph, overflow: "hidden" }}>
        <NatGround place={place} W={pw} H={ph} />
        <NatFigure data={data} place={place} W={pw} H={ph} />
      </div>
      <div style={{ position: "absolute", left: B, top: footY, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", right: B, top: footY + wPx - lPx, textAlign: "right", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", left: "50%", top: (topM - logoH) / 2 - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · moldura deslocada (matchday): his photo with an offset rule frame on off-white; "Matchday" and HOME v AWAY · date under it. */
export function Natoffsetframe({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatOffsetframeFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · moldura deslocada: his celebration with the offset frame; "Goal." and his name · his club's exact name. No score. */
export function Goalnatoffsetframe({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatOffsetframeFrame data={data} word={`${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}.`} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
