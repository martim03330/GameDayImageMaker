/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";
const PAPER = "#f3efe6";
const INK = "#171512";

/**
 * Golo editorial (trend: the "minimalist sports editorial poster" — a photo printed on off-white paper with a
 * wide margin, one serif word and small caps, like a magazine page): his real celebration photo in a framed
 * window on paper, "Goal." in a big serif under it, his name and his club's exact name in small caps, and the
 * NEYOD logo (dark version) centred at the foot.
 */
export function Goalpaper({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 64;
  const word = `${data.content.kicker ? data.content.kicker.charAt(0).toUpperCase() + data.content.kicker.slice(1).toLowerCase() : "Goal"}.`;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const wPx = Math.min(104 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.5));
  const nPx = Math.min(20 * k * ts, (CANVAS_W - 2 * M) / 2 / Math.max(1, capsEm(name, 0.14)));
  const cPx = Math.min(14 * k * ts, (CANVAS_W - 2 * M) / 2 / Math.max(1, capsEm(club, 0.18)));

  const bottom = (story ? STORY_BOTTOM : H - 44) - (params.textY ?? 0);
  const logoTop = bottom - (story ? 88 : 52) - (params.logoY ?? 0);
  const rowTop = logoTop - 44 * k - nPx;
  const wordTop = rowTop - 22 * k - wPx * 1.02;
  const winTop = story ? STORY_TOP - 40 : M;
  const winW = CANVAS_W - 2 * M;
  const winH = wordTop - 30 * k - winTop;
  const place = natPlace(data, winW, winH, { fx: winW * (params.side === "left" ? 0.42 : 0.58), fy: winH * 0.34, fs: Math.min(story ? 230 : 160, winH * 0.16) });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", left: M, top: winTop, width: winW, height: winH, overflow: "hidden", background: "#2b3a2a" }}>
        <NatGround place={place} W={winW} H={winH} />
        <NatFigure data={data} place={place} W={winW} H={winH} />
      </div>
      <div style={{ position: "absolute", left: M, top: wordTop, fontFamily: SERIF, fontWeight: 500, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: rowTop, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20 }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.18em", whiteSpace: "nowrap", opacity: 0.7 }}>{club}</span>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: rowTop - 12 * k, height: 1, background: INK, opacity: 0.2 }} />
      <AgencyLogo data={data} height={24} onLight style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
