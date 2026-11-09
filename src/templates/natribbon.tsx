/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SCRIPT = "var(--font-script), cursive";
const DMSERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.4)";

/**
 * The shared frame of the "ribbon" natural looks (reference: the film poster with a tall red ribbon down one
 * side holding a vertical handwritten line): his real photo, untouched; one slim full-height ribbon of his
 * club's colour down the side away from him (never across his face), translucent so the photo shows faintly
 * through it, a vertical handwritten line inside (Mr Dafoe). At the foot on the ribbon's side, small: a serif
 * line, one tiny tracked line, and the NEYOD logo.
 */
export function NatRibbonFrame({ data, script, title, line }: { data: RenderData; script: string; title: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 60;
  const colour = panelColour(params.primary, params.accent);
  const heLeft = params.side === "left";
  const fs = story ? 220 : 160;
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 400 : 680, fy: story ? 620 : 440, fs });
  // The ribbon: on the side away from him, its inner edge ≥ 1.4 face-widths from his face's centre.
  const ribW = 150 * k;
  const ribX = heLeft ? Math.max(place.fx + 1.4 * place.faceW, CANVAS_W - M - ribW - 60 * k) : Math.min(place.fx - 1.4 * place.faceW - ribW, M + 60 * k);
  const sPx = Math.min(92 * k * ts, (H * 0.8) / Math.max(1, script.length * 0.42));
  const footY = (story ? STORY_BOTTOM : H - 50) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  // The foot block sits on the ribbon's side of the canvas (the free side), over the ribbon's foot — never
  // on his side, where it would run over his legs.
  const blockLeft = !heLeft;
  const tPx = Math.min(46 * k * ts, 460 / Math.max(1, title.length * 0.5));
  const lPx = Math.min(15 * k * ts, 460 / Math.max(1, capsEm(line, 0.18)));
  const align = blockLeft ? "left" : "right";
  const side = blockLeft ? { left: M } : { right: M };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1a1a1a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: ribX, width: ribW, top: 0, height: H, background: colour, opacity: 0.88, boxShadow: "0 0 40px rgba(0,0,0,.25)" }} />
      <div
        style={{
          position: "absolute",
          left: ribX + ribW / 2,
          top: (story ? STORY_TOP : 70) + (H - (story ? STORY_TOP : 70) - (H - footY)) / 2,
          transform: "translate(-50%, -50%) rotate(90deg)",
          fontFamily: SCRIPT,
          fontSize: sPx,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: "#fff",
          textShadow: "0 2px 10px rgba(0,0,0,.25)",
        }}
      >
        {script}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 420 : 300, background: `linear-gradient(to ${blockLeft ? "top right" : "top left"}, rgba(0,0,0,.6), rgba(0,0,0,0) 60%)` }} />

      <div style={{ position: "absolute", ...side, top: footY - logoH - 30 * k - lPx - 14 * k - tPx, textAlign: align, fontFamily: DMSERIF, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      <div style={{ position: "absolute", ...side, top: footY - logoH - 30 * k - lPx, textAlign: align, fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.18em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, ...(blockLeft ? {} : { marginRight: "-0.18em" }) }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: blockLeft ? M : CANVAS_W - M - logoW, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: blockLeft ? "left top" : "right top" }} />
    </div>
  );
}

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Natural · fita (matchday): his real photo untouched; a slim full-height ribbon of his club's colour down
 * the side away from him with "Matchday" handwritten vertically inside; at the foot, small: "Home v Away"
 * in DM Serif (exact names, home first), date · kick-off · venue in tiny caps, the NEYOD logo.
 */
export function Natribbon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatRibbonFrame
      data={data}
      script={sentence(data.content.kicker || "Matchday")}
      title={fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}` : fx.homeName || fx.awayName}
      line={[fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ")}
    />
  );
}

/**
 * Natural goal · fita: his real celebration photo untouched; a slim ribbon of his club's colour with "Goal"
 * handwritten vertically; at the foot his full name in DM Serif and his club's exact name in tiny caps.
 */
export function Goalnatribbon({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatRibbonFrame data={data} script={sentence(data.content.kicker || "Goal")} title={name} line={ourClub(data).toUpperCase()} />;
}
