/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { DMSERIF, Film } from "./fx";
import { CentreLogo, EchoLine, echoTones, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { sentenceCase, teamsOf } from "./notify";
import { VIBES } from "./panelscript";
import { capsEm } from "./rippleecho";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** DM Serif Display italic: advance widths per 100px (measured in the browser, as in goalserene). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
/** Great Vibes: advance widths per 100px. */
const VIBES_W: Record<string, number> = { a: 35.8, b: 32.7, c: 26.3, d: 37.2, e: 25.6, f: 19.4, g: 39.6, h: 33.6, i: 17.6, j: 17.8, k: 36, l: 21.3, m: 50.9, n: 33.8, o: 33.8, p: 33.6, q: 34.7, r: 25.9, s: 26.7, t: 20.1, u: 35.6, v: 30.9, w: 49.5, x: 33.4, y: 38.1, z: 34.3, " ": 17.1, "-": 40.4, A: 71.6, B: 104.7, C: 71.4, D: 105, E: 81.9, F: 105.3, G: 70.2, H: 139.5, I: 91.7, J: 97.2, K: 120.3, L: 71.6, M: 133.6, N: 104.4, O: 73, P: 92.5, Q: 75.6, R: 102.8, S: 92.6, T: 93.3, U: 94.7, V: 98, W: 135.1, X: 79.1, Y: 96.3, Z: 68.1 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
const vibesEm = (t: string) => plain(t).reduce((a, c) => a + (VIBES_W[c] ?? 34) / 100, 0);

/** How far the script word slides under the serif one, in script ems. */
const OVERLAP = 0.06;

/**
 * Goal echo serene: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — set with `goalserene`'s calm pair across his lower
 * body: the title in script ("Goal", "Brace") sliding into his surname in italic serif. At the foot the crests
 * either side of the fixture in small italic serif (home first, names exactly as stored, no score), the
 * competition in small spaced caps, and the agency logo.
 */
export function Goalechoserene({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo } = echoTones(data);
  const right = params.side !== "left";

  /* ---- the foot, measured up from the logo (logo top: 1254 post, STORY_BOTTOM − 88 story) ---- */
  const f = matchFacts(data);
  const tag = titleCase(f.comp || f.round || "").trim().toUpperCase();
  const T_TRACK = 0.34;
  const tagSize = Math.max(10, Math.min(13 * S, 760 / Math.max(1, capsEm(tag, T_TRACK)))) * ts;
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (params.textY ?? 0);
  const tagTop = lastBottom - tagSize;
  const teams = teamsOf(data);
  const fixture = teams.length === 2 ? `${teams[0]}  v  ${teams[1]}` : "";
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const CR = 46 * S;
  const crGap = 22 * S;
  const fixRoom = CANVAS_W - 2 * 64 - (crests.length ? 2 * (CR + crGap) : 0);
  const fixSize = Math.max(18, Math.min(30 * S, fixRoom / Math.max(1, dmiEm(fixture)))) * ts;
  const rowH = Math.max(CR, fixSize * 1.1);
  const rowTop = (tag ? tagTop - 26 * S : lastBottom) - rowH;

  /* ---- the player and his echo ---- */
  const cx = 540 + (right ? 46 : -46);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 360 : 240, cx, maxW: story ? 900 : 920, story, minHead: story ? STORY_TOP : 70 });
  const dx = (right ? -1 : 1) * 30 * S;
  const dy = -26 * S;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;
  const faceH = face[3] * box.height;

  /* ---- the pair: script title + italic serif surname, across his lower body ---- */
  const first = sentenceCase(content.kicker || "Goal");
  const surname = (content.lastName || content.firstName || "").trim();
  const second = surname ? surname.charAt(0).toUpperCase() + surname.slice(1) : "";
  let sv = 168 * S;
  let sd = 146 * S;
  const W = story ? 920 : 860;
  const total = (a: number, b: number) => vibesEm(first) * a * (1 - (second ? OVERLAP : 0)) + (second ? 0.3 * b + dmiEm(second) * b : 0);
  const kz = Math.min(1, W / total(sv, sd)) * ts;
  sv *= kz;
  sd *= kz;
  const titleW = total(sv, sd);
  const baseline = Math.min(rowTop - 76 * S, Math.max(chin + faceH * 2.6 + sd * 0.7, story ? 1250 : 860)) + (params.textY ?? 0);
  const titleLeft = (CANVAS_W - titleW) / 2;

  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.35)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 50% at ${right ? 56 : 44}% ${story ? 36 : 38}%, ${lift}, ${deep} 82%)` }} />

      <EchoLine id="goalechoserene" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={story ? STORY_TOP - 40 : 40} color={echo} width={story ? 2.4 : 2} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* The pair across his lower body. */}
      <div style={{ position: "absolute", left: titleLeft, top: baseline - sd * 0.95, display: "flex", alignItems: "baseline", whiteSpace: "nowrap", textShadow: "0 4px 26px rgba(0,0,0,.5), 0 1px 4px rgba(0,0,0,.22)" }}>
        <span style={{ fontFamily: VIBES, fontSize: sv, lineHeight: 1, marginRight: second ? -sv * OVERLAP : 0, position: "relative", top: sv * 0.04, color: WHITE }}>{first}</span>
        {second && <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: sd, lineHeight: 1, letterSpacing: "-0.01em", color: WHITE, marginLeft: sd * 0.3 }}>{second}</span>}
      </div>

      {/* Foot: crests either side of the fixture, then the competition. */}
      {(fixture || crests.length > 0) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: rowTop, height: rowH, display: "flex", justifyContent: "center", alignItems: "center", gap: crGap }}>
          {crests[0] && <img src={crests[0]} alt="" style={{ width: CR, height: CR, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.35))" }} />}
          {fixture && <span style={{ ...soft, fontFamily: DMSERIF, fontStyle: "italic", fontSize: fixSize, lineHeight: 1, whiteSpace: "pre" }}>{fixture}</span>}
          {crests[1] && <img src={crests[1]} alt="" style={{ width: CR, height: CR, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.35))" }} />}
        </div>
      )}
      {tag && (
        <div style={{ position: "absolute", left: 56, right: 56, top: tagTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: tagSize, letterSpacing: `${T_TRACK}em`, paddingLeft: `${T_TRACK}em`, lineHeight: 1, ...soft, opacity: 0.72 }}>{tag}</div>
      )}

      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.18} />
    </div>
  );
}
