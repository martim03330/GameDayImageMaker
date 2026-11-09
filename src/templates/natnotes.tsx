/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 2px rgba(0,0,0,.55), 0 1px 12px rgba(0,0,0,.4)";

export type Note = { lines: string[] };

/**
 * The shared frame of the "notes" natural looks (reference: the Balotelli poster — a red-graded photo, small
 * caption notes scattered around the player, a word in italic serif across his waist): his real photo with a
 * soft vignette of his club's colour around him, four tiny caption notes placed around his figure (beside his
 * shoulders and his knees — never on his face), and one word in white DM Serif italic across his waist.
 * The NEYOD logo at the foot.
 */
export function NatNotesFrame({ data, word, notes }: { data: RenderData; word: string; notes: Note[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 60 : 50;
  const colour = panelColour(params.primary, params.accent);
  const fs = story ? 180 : 135;
  const fx0 = params.side === "left" ? 480 : params.side === "right" ? 600 : 540;
  const place = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 600 : 440, fs });
  const px = 14 * k * ts;
  const wPx = Math.min(104 * k * ts, (CANVAS_W * 0.8) / Math.max(1, word.length * 0.42));
  // Anchor points around him, in face units from his face: shoulders left/right, knees left/right.
  const u = place.fs;
  const anchors = [
    { x: place.fx - 2.6 * place.faceW, y: place.fy + 1.2 * u, side: "right" as const },
    { x: place.fx + 2.6 * place.faceW, y: place.fy + 0.4 * u, side: "left" as const },
    { x: place.fx - 2.4 * place.faceW, y: place.fy + 4.4 * u, side: "right" as const },
    { x: place.fx + 2.4 * place.faceW, y: place.fy + 3.6 * u, side: "left" as const },
  ];
  const wordTop = place.fy + 2.4 * u;
  const footY = (story ? STORY_BOTTOM : H - 46) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1a0b0b", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "brightness(.82) saturate(.9)" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 55% at ${place.fx}px ${place.fy + 2 * u}px, ${colour}00 30%, ${colour}88 75%, ${colour}cc 100%)`, mixBlendMode: "multiply" }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />

      {notes.slice(0, 4).map((n, i) => {
        const a = anchors[i];
        const left = a.side === "right";
        // Right-aligned notes end at the anchor; left-aligned ones start there. Kept inside the margins.
        const right = Math.max(M, CANVAS_W - a.x);
        const leftX = Math.min(CANVAS_W - M - 200 * k, Math.max(M, a.x));
        const style = left ? { right } : { left: leftX };
        // Long notes (competition names) wrap inside the room between him and the margin.
        const maxW = Math.max(180 * k, Math.min(300 * k, left ? CANVAS_W - right - M : CANVAS_W - M - leftX));
        return (
          <div key={i} style={{ position: "absolute", top: a.y, ...style, maxWidth: maxW, textAlign: left ? "right" : "left", fontFamily: SANS, fontWeight: 600, fontSize: px, lineHeight: 1.35, letterSpacing: "0.04em", textShadow: SHADOW }}>
            {n.lines.filter(Boolean).map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wordTop, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: wPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 2px 4px rgba(0,0,0,.4), 0 6px 30px rgba(0,0,0,.45)" }}>
        {word}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Natural · notas (matchday): his real photo with a soft vignette of his club's colour; four tiny caption
 * notes around him (HOME V AWAY, competition · matchday, date, kick-off · venue — exact names, home first) and
 * "Matchday" in white DM Serif italic across his waist. NEYOD logo at the foot.
 */
export function Natnotes({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  return (
    <NatNotesFrame
      data={data}
      word={sentence(data.content.kicker || "Matchday")}
      notes={[
        { lines: [fx.homeName.toUpperCase(), fx.awayName ? `V ${fx.awayName.toUpperCase()}` : ""] },
        { lines: [f.comp, f.round] },
        { lines: [fx.date] },
        { lines: [fx.kickoff, fx.venue] },
      ]}
    />
  );
}

/**
 * Natural goal · notas: his real celebration photo with a soft vignette of his club's colour; tiny notes
 * around him (his name, his club's exact name, the competition) and "Goal" in white DM Serif italic across
 * his waist. No score.
 */
export function Goalnatnotes({ data }: { data: RenderData }) {
  const { content } = data;
  const f = matchFacts(data);
  return (
    <NatNotesFrame
      data={data}
      word={sentence(content.kicker || "Goal")}
      notes={[{ lines: [(content.firstName || "").toUpperCase(), (content.lastName || "").toUpperCase()] }, { lines: [ourClub(data).toUpperCase()] }, { lines: [f.comp] }, { lines: [f.round] }]}
    />
  );
}
