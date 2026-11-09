import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "disc" natural looks: his real photo full-bleed and, in the lower corner away from him,
 * one solid disc in his club's colour holding a big figure (the kick-off time on matchday, the word on goals) and a
 * tiny label; beside the disc, toward the middle, the word or names in bold and one line. The NEYOD logo at the top.
 */
function NatTimediscFrame({ data, figure, label, word, line }: { data: RenderData; figure: string; label: string; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const D = 210 * k;
  const M = 56;
  const fPx = Math.min(64 * k * ts, (D * 0.8) / Math.max(1, figure.length * 0.6));
  const tPx = 12 * k * ts;
  const wPx = Math.min(40 * k * ts, 420 / Math.max(1, word.length * 0.62));
  const lPx = 16 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const top = bottom - D;
  const textX = M + D + 26 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = left ? { left: M } : { right: M };
  const tside = left ? { left: textX } : { right: textX };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", ...side, top, width: D, height: D, borderRadius: "50%", background: colour, color: ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 * k, boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.85 }}>{label}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fPx, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{figure}</div>
      </div>
      <div style={{ position: "absolute", ...tside, top: top + D / 2 - (wPx + 10 * k + lPx) / 2, width: CANVAS_W - textX - M, textAlign: left ? "left" : "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ marginTop: 10 * k, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.92 }}>{line}</div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · círculo da hora (matchday): a disc in his club's colour with the kick-off time; MATCHDAY and Home v Away beside it (exact names). */
export function Nattimedisc({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatTimediscFrame data={data} figure={fx.time || fx.date || word} label={fx.time ? "KICK-OFF" : ""} word={word} line={[`${fx.homeName} v ${fx.awayName}`, fx.time ? fx.date : "", fx.ptTime].filter(Boolean).join(" · ")} />;
}

/** Natural goal · círculo da hora: a disc reading GOAL in his club's colour; his name and his club's exact name beside it. No score. */
export function Goalnattimedisc({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTimediscFrame data={data} figure={(data.content.kicker || "GOAL").toUpperCase()} label="" word={name.toUpperCase()} line={ourClub(data)} />;
}

