import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "sides" natural looks: his real photo full-bleed inside a thin inset frame whose
 * left and right sides carry small tracked caps running along them (the word up the left side, a detail down
 * the right), set on gaps in the line; one line of exact names on the bottom side. The NEYOD logo at the top
 * side, on a gap.
 */
function NatSidesFrame({ data, word, rightText, foot }: { data: RenderData; word: string; rightText: string; foot: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 520,
    fs: story ? 245 : 155,
  });
  const I = 44;
  const top = (story ? STORY_TOP + 40 : 100) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM - 40 : H - 70;
  const h = bottom - top;
  const sPx = 20 * k * ts;
  const fPx = Math.min(14 * k * ts, (CANVAS_W - 2 * I - 120) / Math.max(1, capsEm(foot, 0.22)));
  const sideText = { position: "absolute", fontFamily: SANS, fontWeight: 700, fontSize: sPx, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap", padding: `0 ${14 * k}px`, background: "transparent", textShadow: "0 1px 8px rgba(0,0,0,.5)" } as const;
  const wLen = capsEm(word, 0.3) * sPx + 28 * k;
  const rLen = capsEm(rightText, 0.3) * sPx + 28 * k;
  const fLen = capsEm(foot, 0.22) * fPx + 40 * k;
  const logoH = story ? 88 : 52;
  const line = (style: React.CSSProperties) => <div style={{ position: "absolute", background: OFF_WHITE, opacity: 0.85, ...style }} />;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 140 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      {/* Top side, broken in the middle for the logo. */}
      {line({ left: I, top, width: CANVAS_W / 2 - I - 150 * k, height: 1.5 })}
      {line({ right: I, top, width: CANVAS_W / 2 - I - 150 * k, height: 1.5 })}
      {/* Left side, broken for the word (reading up), right side broken for the detail (reading down). */}
      {line({ left: I, top, width: 1.5, height: h / 2 - wLen / 2 })}
      {line({ left: I, top: top + h / 2 + wLen / 2, width: 1.5, height: h / 2 - wLen / 2 })}
      {line({ right: I, top, width: 1.5, height: h / 2 - rLen / 2 })}
      {line({ right: I, top: top + h / 2 + rLen / 2, width: 1.5, height: h / 2 - rLen / 2 })}
      {/* Bottom side, broken for the foot line. */}
      {line({ left: I, top: bottom, width: (CANVAS_W - 2 * I - fLen) / 2, height: 1.5 })}
      {line({ right: I, top: bottom, width: (CANVAS_W - 2 * I - fLen) / 2, height: 1.5 })}
      <div style={{ ...sideText, left: I - sPx / 2, top: top + h / 2, transformOrigin: "0 0", transform: `rotate(-90deg) translate(-50%, 0)` }}>{word}</div>
      <div style={{ ...sideText, right: I - sPx / 2, top: top + h / 2, transformOrigin: "100% 0", transform: `rotate(90deg) translate(50%, 0)` }}>{rightText}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - fPx / 2, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: fPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{foot}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", top: top - logoH / 2 - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · lados (matchday): MATCHDAY up the left side, date · time down the right, HOME V AWAY on the bottom side (exact names). */
export function Natsides({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatSidesFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} rightText={[fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} foot={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} />;
}

/** Natural goal · lados: GOAL up the left, his club's exact name down the right, his name on the bottom side. No score. */
export function Goalnatsides({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSidesFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} rightText={ourClub(data).toUpperCase()} foot={name.toUpperCase()} />;
}
