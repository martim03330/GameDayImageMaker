/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const INK = "#0d0f14";
const MARGIN = 60;

/** Inter 700 / 800 capitals: advance widths per 100px (measured in the browser). */
const I7: Record<string, number> = { A: 76, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 76, W: 105.7, X: 73.8, Y: 73.1, Z: 66.4, "-": 46.8, " ": 23.7, "'": 26, ".": 28, "/": 40 };
const I8: Record<string, number> = { A: 78.3, B: 66.5, C: 74.3, D: 72.2, E: 61, F: 58.6, G: 75.2, H: 74.8, I: 28.6, J: 59, K: 73.8, L: 56.5, M: 94.3, N: 76.6, O: 77.3, P: 65.2, Q: 78.2, R: 66.2, S: 66, T: 67.7, U: 72.7, V: 78.3, W: 107.7, X: 76.1, Y: 75.2, Z: 67.9, "-": 47.1, " ": 21.9, "'": 27, ".": 29 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, table: Record<string, number>, tracking = 0) => plain(t).reduce((a, c) => a + (table[c] ?? 66) / 100 + tracking, 0);
/** Inter 500 mixed case, a safe average per character in ems. */
const textEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[A-Z0-9]/.test(c) ? 0.66 : /[il.:'·]/.test(c) ? 0.3 : 0.56), 0);

/** Home first, names exactly as stored. */
function fixtureOf(data: RenderData): { home: string; away: string } {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const opp = (weHost ? c.awayTeam : c.homeTeam) || titleCase(f.opp);
  const us = (weHost ? c.homeTeam : c.awayTeam) || ours;
  return weHost ? { home: us, away: opp } : { home: opp, away: us };
}

/**
 * Lower third: the matchday sibling of the goal bug. The player big over his own photo softly out of focus
 * (laid exactly under the cutout), the agency mark where a channel puts its bug, and one sleek broadcast
 * lower third: "MATCHDAY" in a club-colour block, the fixture (home first, full names) and a small line of
 * date, kick-off and ground on dark glass, a tiny competition tab on top of it.
 */
export function Lowerthird({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.32 : 1);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const clubText = luminance(club) > 0.4 ? INK : WHITE;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const showScore = postType === "result" && !!score;
  const { home, away } = fixtureOf(data);
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const tag = (f.comp || f.round || "").trim();

  /* ---- the player, big, towards his side ---- */
  const faceX = 540 + (params.side === "left" ? -80 : params.side === "right" ? 80 : 0);
  const sizes = story ? { chest: 390, waist: 310, knees: 250, full: 198 } : { chest: 290, waist: 228, knees: 184, full: 146 };
  const headY = story ? STORY_TOP + 230 : 200;
  let box = placeByFace(data, faceX, headY, sizes);
  const wide = Math.min(1, 1120 / box.width);
  if (wide < 1) box = placeByFace(data, faceX, headY, Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, v * wide])));
  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);

  /* ---- the lower third ---- */
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const kTrack = 0.06;
  const kSize = (story ? 34 : 40) * ts;
  const kPad = (story ? 26 : 30) * ts;
  const kW = capsEm(kicker, I8, kTrack) * kSize + 2 * kPad;
  const panelPad = 30 * ts;
  // Post: block and panel side by side. Story: the block as a tab on top, the panel the full width under it.
  const panelW = story ? CANVAS_W - 2 * MARGIN : CANVAS_W - 2 * MARGIN - kW;
  const mid = showScore ? score : "v";
  const fxTrack = 0.02;
  const fxEm = capsEm(home, I7, fxTrack) + capsEm(away, I7, fxTrack) + (home && away ? capsEm(` ${mid} `, I7, fxTrack) * 0.85 : 0);
  const fxSize = Math.min(34 * ts, (panelW - 2 * panelPad - 8) / Math.max(1, fxEm));
  const factSize = Math.min(16 * ts, (panelW - 2 * panelPad) / Math.max(1, textEm(facts) + facts.length * 0.06));
  const PH = (story ? 128 : 96) * (params.textScale ?? 1);
  const kH = story ? kSize * 1.9 : PH;
  const ltBottom = (story ? STORY_BOTTOM : 1350 - 64) + (params.textY ?? 0);
  const panelTop = ltBottom - PH;
  const blockTop = story ? panelTop - kH : panelTop;
  const tagSize = 11 * (story ? 1.3 : 1);
  const tagFit = Math.min(tagSize, (story ? 560 : 520) / Math.max(1, capsEm(tag, I7, 0.2)));
  const left = MARGIN;
  const tabH = 26 * (story ? 1.3 : 1);

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
  const glass: CSSProperties = { background: "rgba(12,14,19,.68)", backdropFilter: "blur(18px) saturate(1.2)", WebkitBackdropFilter: "blur(18px) saturate(1.2)" };

  const block = (
    <div style={{ width: kW, height: kH, background: club, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={caps(kSize, 800, kTrack, { color: clubText, paddingLeft: `${kTrack}em`, fontStyle: "italic" })}>{kicker}</span>
    </div>
  );
  const panel = (
    <div style={{ height: PH, width: story ? panelW : "auto", maxWidth: panelW, boxSizing: "border-box", padding: `0 ${panelPad + 6}px 0 ${panelPad}px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 * ts, ...glass }}>
      <div style={caps(fxSize, 700, fxTrack, { color: WHITE })}>
        {home}
        {home && away && <span style={{ fontWeight: showScore ? 800 : 300, opacity: showScore ? 1 : 0.8, textTransform: "none" }}>{`  ${mid}  `}</span>}
        {away}
      </div>
      {facts && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: factSize, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap", color: "rgba(255,255,255,.74)" }}>{facts}</div>}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: shade(club, -0.7), color: WHITE }}>
      {/* The ground: his own photo laid exactly under the cutout, softly out of focus; a wider, darker blur fills the frame. */}
      {back ? (
        <>
          <img
            src={back}
            alt=""
            style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CH + 180, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(.85) brightness(.6)" }}
          />
          {own && (
            <img
              src={own}
              alt=""
              style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "blur(20px) saturate(.9) brightness(.74) contrast(1.04)" }}
            />
          )}
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 38%, ${shade(club, -0.35)}, ${shade(club, -0.8)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 40%, transparent 50%, rgba(0,0,0,.38))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 520 : 260, background: "linear-gradient(to bottom, rgba(0,0,0,.3), transparent)" }} />

      {/* The player, big, natural colour. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 440, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.46))" }} />

      {/* Competition tab, sitting on the lower third. */}
      {tag && (
        <div style={{ position: "absolute", left: story ? left + kW : left, top: (story ? panelTop : blockTop) - tabH, height: tabH, padding: `0 ${tabH * 0.46}px`, display: "flex", alignItems: "center", ...glass }}>
          <span style={caps(tagFit, 600, 0.2, { color: "rgba(255,255,255,.88)", paddingLeft: "0.2em" })}>{tag}</span>
        </div>
      )}

      {/* The lower third. */}
      {story ? (
        <div style={{ position: "absolute", left, top: blockTop, display: "flex", flexDirection: "column", alignItems: "flex-start", boxShadow: "0 16px 40px rgba(0,0,0,.3)" }}>
          {block}
          {panel}
        </div>
      ) : (
        <div style={{ position: "absolute", left, top: panelTop, display: "flex", height: PH, boxShadow: "0 16px 40px rgba(0,0,0,.3)" }}>
          {block}
          {panel}
        </div>
      )}
      <div style={{ position: "absolute", left, top: ltBottom, width: story ? panelW : kW, height: 4, background: story ? `linear-gradient(to right, ${shade(club, -0.35)} ${(kW / panelW) * 100}%, rgba(255,255,255,.18) ${(kW / panelW) * 100}%)` : shade(club, -0.35) }} />

      {/* The agency mark where a channel puts its logo. */}
      <AgencyLogo
        data={data}
        height={story ? 28 : 20}
        style={{ position: "absolute", right: MARGIN, top: (story ? STORY_TOP : 60) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top", opacity: 0.95 }}
      />
      <Film strength={0.16} />
    </div>
  );
}
