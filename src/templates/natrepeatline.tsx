import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "repeat line" natural looks (a ticker tape): his real photo full-bleed; just under
 * the NEYOD logo, one thin line of the word repeated across the whole width in small tracked caps, the middle
 * one solid and the others faint; at the foot one small line of details. Nothing crosses him.
 */
function NatRepeatlineFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 740 : 540,
    fs: story ? 245 : 155,
  });
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const rPx = 20 * k * ts;
  const rowTop = logoTop + (story ? 88 : 52) + 30 * k;
  const unit = capsEm(word, 0.3) * rPx + 40 * k;
  const n = Math.max(3, Math.floor(CANVAS_W / unit) | 1); // odd, so one sits in the middle
  const mid = Math.floor(n / 2);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: rowTop + rPx + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.38), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 180 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop, display: "flex", justifyContent: "center", gap: 40 * k, fontFamily: SANS, fontWeight: 800, fontSize: rPx, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap" }}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} style={{ opacity: i === mid ? 1 : 0.32 }}>
            {word}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha repetida (matchday): MATCHDAY repeated in one faint line under the logo; HOME v AWAY · date · time at the foot. */
export function Natrepeatline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatRepeatlineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · linha repetida: GOAL repeated under the logo over his celebration; his name · his club's exact name. No score. */
export function Goalnatrepeatline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatRepeatlineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
