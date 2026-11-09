import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { Film } from "./fx";
import { EchoLine, echoTones, FootFade, footTexts, goalBox, Player, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#0d0f14";
const M = 60;

/**
 * Goal echo bug: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and, quietly in the lower corner on his free side,
 * a small broadcast bug (from `goalbug`): "GOAL" in a club-colour cell, his name on dark glass, and under it one
 * slim tag with the fixture (home first, names exactly as stored, no score) and the competition. The agency
 * mark sits in the opposite top corner, where a channel puts its logo.
 */
export function Goalechobug({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = (params.textScale ?? 1) * k;
  const { club, deep, lift, echo } = echoTones(data);
  // He stands on params.side; the bug sits in the lower corner on the other side, the logo above him.
  const right = params.side !== "left";

  /* ---- the player and his echo ---- */
  const cx = 540 + (right ? 1 : -1) * (story ? 40 : 70);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 430 : 290, cx, maxW: story ? 900 : 920, story, minHead: story ? STORY_TOP + 120 : 150 });
  const dx = (right ? -1 : 1) * 30 * k;
  const dy = -26 * k;

  /* ---- the bug ---- */
  let cell = club;
  if (luminance(cell) < 0.05) cell = shade(cell, 0.2);
  const cellText = luminance(cell) > 0.4 ? INK : WHITE;
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const t = footTexts(data, 1);
  const tag = [t.fixture.replace(/\s{3}v\s{3}/, "  v  "), t.comp].filter(Boolean).join("   ·   ");
  const rowH = 54 * ts;
  const kSize = 25 * ts;
  const K_TRACK = 0.06;
  const kW = (capsEm(kicker, K_TRACK) * 0.98 + 0.06) * kSize + 2 * 20 * ts;
  const pad = 20 * ts;
  const maxBug = CANVAS_W - 2 * M - (story ? 40 : 120);
  const nameEm = capsEm(first ? `${first} ${last}` : last, 0.03);
  const nameSize = Math.min(23 * ts, (maxBug - kW - 2 * pad) / Math.max(1, nameEm));
  const T_TRACK = 0.18;
  const tagSize = Math.min(11.5 * ts, (maxBug - 24 * ts) / Math.max(1, capsEm(tag, T_TRACK)));
  const tagH = 24 * ts;
  const gap = 6 * ts;
  const bugBottom = (story ? STORY_BOTTOM : CANVAS_H - 64) - (params.textY ?? 0);
  const bugTop = bugBottom - rowH - (tag ? gap + tagH : 0);
  const side: CSSProperties = right ? { left: M, alignItems: "flex-start" } : { right: M, alignItems: "flex-end" };

  const caps = (size: number, weight: number, track: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    ...extra,
  });
  const glass: CSSProperties = { background: "rgba(10,12,17,.62)", backdropFilter: "blur(16px) saturate(1.15)", WebkitBackdropFilter: "blur(16px) saturate(1.15)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 48% at ${right ? 58 : 42}% ${story ? 38 : 40}%, ${lift}, ${deep} 82%)` }} />

      <EchoLine id="goalechobug" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={story ? STORY_TOP + 60 : 60} color={echo} width={story ? 2.4 : 2} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* The bug, quietly in the lower corner: title cell + name on glass, then one slim fixture tag. */}
      <div style={{ position: "absolute", top: bugTop, display: "flex", flexDirection: "column", gap, ...side }}>
        <div style={{ display: "flex", flexDirection: right ? "row" : "row-reverse", height: rowH, boxShadow: "0 12px 32px rgba(0,0,0,.28)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: kW, height: rowH, background: cell, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 -${3 * ts}px 0 ${shade(cell, -0.35)}` }}>
            <span style={caps(kSize, 800, K_TRACK, { color: cellText, paddingLeft: `${K_TRACK}em`, fontStyle: "italic" })}>{kicker}</span>
          </div>
          <div style={{ height: rowH, padding: `0 ${pad + 4}px 0 ${pad}px`, display: "flex", alignItems: "center", ...glass }}>
            <span style={caps(nameSize, 700, 0.03, { color: WHITE })}>
              {first && <span style={{ fontWeight: 400 }}>{first} </span>}
              {last}
            </span>
          </div>
        </div>
        {tag && (
          <div style={{ height: tagH, padding: `0 ${12 * ts}px`, display: "flex", alignItems: "center", borderRadius: 2, ...glass, background: "rgba(10,12,17,.5)" }}>
            <span style={caps(tagSize, 600, T_TRACK, { color: "rgba(255,255,255,.84)", paddingLeft: `${T_TRACK}em`, textTransform: "none" })}>{tag}</span>
          </div>
        )}
      </div>

      {/* The agency mark in the opposite top corner, where a channel puts its logo. */}
      <AgencyLogo
        data={data}
        height={story ? 26 : 18}
        style={{
          position: "absolute",
          [right ? "right" : "left"]: M,
          top: (story ? STORY_TOP : 56) - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: right ? "right top" : "left top",
          opacity: 0.95,
        }}
      />
      <Film strength={0.16} />
    </div>
  );
}
