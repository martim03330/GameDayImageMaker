import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "asterisk" natural looks (a footnote): his real photo full-bleed; on the side away
 * from him, the word large in bold with an asterisk in his club's colour, and at the very foot the footnote —
 * the same asterisk and one small sentence with the facts. The NEYOD logo alone at the top.
 */
function NatAsteriskFrame({ data, word, note }: { data: RenderData; word: string; note: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 500 * k;
  const wPx = Math.min(78 * k * ts, colW / Math.max(1, (word.length + 0.6) * 0.66));
  const nPx = Math.min(16 * k * ts, colW / Math.max(1, (note.length + 2) * 0.55));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const noteTop = bottom - nPx;
  const wTop = noteTop - 30 * k - wPx * 0.78;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right", lineHeight: 1, whiteSpace: "nowrap" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...side, top: wTop - wPx * 0.13, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em" }}>
        {word}
        <span style={{ color: colour, fontSize: wPx * 0.6, verticalAlign: "top", marginLeft: wPx * 0.04 }}>*</span>
      </div>
      <div style={{ ...side, top: noteTop, fontFamily: SANS, fontWeight: 500, fontSize: nPx, opacity: 0.9 }}>
        <span style={{ color: colour, fontWeight: 800, marginRight: nPx * 0.4 }}>*</span>
        {note}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · asterisco (matchday): MATCHDAY* with the footnote "* Valletta FC v Hamrun Spartans, 25 Oct, 15:30" (exact names). */
export function Natasterisk({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatAsteriskFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} note={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(", ")} />;
}

/** Natural goal · asterisco: GOAL* with the footnote "* His Name, his club's exact name". No score. */
export function Goalnatasterisk({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatAsteriskFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} note={[name, ourClub(data)].filter(Boolean).join(", ")} />;
}
