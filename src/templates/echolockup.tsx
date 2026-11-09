/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { teamsOf } from "./notify";
import { CANVAS_W, type RenderData } from "./types";
import { EchoFigure, EchoLogo, echoSetup } from "./echotitle";

const M = 64;

/** Inter 600 capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 30 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? (/\d/.test(c) ? 62 : 64)) / 100 + tracking, -tracking);

/**
 * Echo lockup: echoline's player and hairline echo on the deep club ground, with lockup's idea moved up to his
 * chest on the free side — one tight, centred unit: the two crests, a short hairline, the title in wide-tracked
 * caps, a short hairline, "HOME v AWAY" (stacked when long) and date · kick-off, the ground faint under it.
 * Nothing else but the logo at the foot.
 */
export function Echolockup({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 19);
  const f = matchFacts(data);
  // Story: the lockup a size up (not the full 1.4×: it must stay a tight unit clear of his arm).
  const k = s.story ? 1.25 : 1;
  const ts = s.ts;

  /* ---- the free column: the lockup is centred on it ---- */
  const W = (s.story ? 370 : 430) * Math.min(1.1, ts);
  const cx = s.right ? M + W / 2 : CANVAS_W - M - W / 2;

  /* ---- the player, towards his side; the echo leans away from the lockup ---- */
  const fx = s.story ? (s.right ? 820 : 260) : s.right ? 730 : 350;
  const faceTop = s.story ? 430 : 250;
  const box = s.story
    ? placeByFace(data, fx, faceTop, { chest: 330, waist: 266, knees: 200, full: 156 })
    : placeByFace(data, fx, faceTop, { chest: 270, waist: 214, knees: 160, full: 122 });

  /* ---- the lockup ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const tTrack = 0.5;
  const tSize = Math.min((s.story ? 27 : 30) * k * ts, (W * 0.92) / Math.max(1, capsEm(title, tTrack)));
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fTrack = 0.26;
  const fBase = 17 * k * ts;
  const oneLine = teams.join("  v  ");
  // One line when it holds a decent size, otherwise home / v / away stacked.
  const stacked = teams.length === 2 && capsEm(oneLine, fTrack) * fBase > W * 0.8;
  const fSize = stacked ? Math.min(19 * k * ts, W / Math.max(...teams.map((t) => capsEm(t, fTrack)))) : Math.min(fBase, W / Math.max(1, capsEm(oneLine, fTrack)));
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const wSize = Math.min(15 * k * ts, W / Math.max(1, capsEm(when, 0.2)));
  const venue = titleCase(f.venue);
  const vSize = Math.min(15 * k * ts, W / Math.max(1, venue.length * 0.55));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const CR = 46 * k;

  // Block height (approximate) so its middle sits at his chest.
  const blockH =
    (crests.length ? CR + 26 * k : 0) +
    1 + 22 * k + tSize + 22 * k + 1 +
    22 * k + (stacked ? fSize * 2 + 12 * k * 2 + fSize * 0.8 : fSize) +
    (when ? 16 * k + wSize : 0) +
    (venue ? 12 * k + vSize * 1.2 : 0);
  const chest = s.story ? 930 : 650;
  const top = chest - blockH / 2 + (params.textY ?? 0);

  const caps = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: "#fff",
    ...extra,
  });
  const rule: CSSProperties = { width: 56 * k, height: 1, background: s.white ? "rgba(255,255,255,.7)" : s.tint };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure data={data} s={s} box={box} id="echolockup" outward light={[s.right ? 34 : 66, 44]} />

      {/* The lockup. */}
      <div style={{ position: "absolute", left: cx - W / 2, width: W, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 24 * k, alignItems: "center", marginBottom: 26 * k }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
            ))}
          </div>
        )}
        <div style={rule} />
        <div style={{ ...caps(tSize, tTrack, 600), margin: `${22 * k}px 0` }}>{title}</div>
        <div style={rule} />
        {teams.length > 0 &&
          (stacked ? (
            <div style={{ marginTop: 22 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k }}>
              <div style={caps(fSize, fTrack, 500)}>{teams[0]}</div>
              <div style={{ ...caps(fSize * 0.8, 0, 300, { textTransform: "none", color: "rgba(255,255,255,.7)" }) }}>v</div>
              <div style={caps(fSize, fTrack, 500)}>{teams[1]}</div>
            </div>
          ) : (
            <div style={{ ...caps(fSize, fTrack, 500), marginTop: 22 * k }}>
              {teams[0]}
              {teams[1] && (
                <>
                  <span style={{ textTransform: "none", fontWeight: 300, color: "rgba(255,255,255,.7)" }}>{"\u2002v\u2002"}</span>
                  {teams[1]}
                </>
              )}
            </div>
          ))}
        {when && <div style={{ ...caps(wSize, 0.2, 400, { color: "rgba(255,255,255,.7)", fontVariantNumeric: "tabular-nums" }), marginTop: 16 * k }}>{when}</div>}
        {venue && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: vSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.5)", marginTop: 12 * k }}>{venue}</div>}
      </div>

      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
