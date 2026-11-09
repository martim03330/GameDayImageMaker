/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { teamsOf } from "./notify";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { capsStyle, EchoFigure, EchoLogo, echoSetup } from "./echotitle";

const WHITE = "#ffffff";

/**
 * Echo inset: echoline's player and hairline echo, standing in a thin inset frame on the deep ground — his head
 * and shoulders rise out over its top edge, the echo crossing it too. As in inset, the frame's lines are broken
 * by their labels: the fixture on the foot (home first, names as stored), the date and the kick-off low on the
 * sides; crests small just inside the foot, the ground under it, the title small at the top.
 */
export function Echoinset({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 23);
  const f = matchFacts(data);
  const k = s.k;

  /* ---- type ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((s.story ? 22 : 19) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * s.ts;
  const titleTop = (s.story ? STORY_TOP : 84) + (params.textY ?? 0);

  /* ---- the player, centred as in echoline, his hair clear of the title ---- */
  const sizes = s.story ? { chest: 360, waist: 290, knees: 220, full: 166 } : { chest: 280, waist: 222, knees: 166, full: 126 };
  const probe = placeByFace(data, 540, 300, sizes);
  const faceTop = Math.max(s.story ? 360 : 236, titleTop + tSize + (s.story ? 56 : 40) + probe.faceH * 0.75);
  const box = placeByFace(data, 540, faceTop, sizes);

  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("  —  ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.32;
  const IN = s.story ? 92 : 96;
  const fixSize = Math.max(11, Math.min(15 * k, (CANVAS_W - IN * 2 - 200) / Math.max(1, capsEm(fixture, F_TRACK)))) * s.ts;
  const date = niceDate(content.date).toUpperCase();
  const ko = f.time ? `KICK-OFF ${f.time}` : (f.round || "").toUpperCase();
  const S_TRACK = 0.4;
  const sideSize = (t: string) => Math.max(10, Math.min(12.5 * k, 340 / Math.max(1, capsEm(t, S_TRACK)))) * s.ts;
  const venue = titleCase(f.venue || f.comp || "");
  const vSize = Math.max(13, Math.min(17 * k, 760 / Math.max(1, venue.length * 0.5))) * s.ts;

  /* ---- the frame: its foot sits above the ground line, which ends 64px over the logo ---- */
  const logoTop = s.story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const venueTop = logoTop - 64 - vSize * 1.15;
  const bottom = venue ? venueTop - 30 * k : logoTop - 70;
  const top = Math.max(s.story ? 500 : 340, Math.min(s.story ? 820 : 560, faceTop + (params.playerY ?? 0) + box.faceH * 1.5));
  const CR = 40 * k;
  const crestTop = bottom - 30 * k - CR;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const line = s.white ? "rgba(255,255,255,.5)" : s.echo;
  const gap = 20 * k;
  const hair = (st: CSSProperties, show: boolean) => <div style={{ background: show ? line : "transparent", flex: 1, ...st }} />;
  const tail = 70 * k;
  /** The frame, drawn in passes: lines only (behind him), lines over the faded foot, labels only. */
  const Frame = ({ lines, labels }: { lines: boolean; labels: boolean }) => {
    const lab = (st: CSSProperties): CSSProperties => ({ ...st, visibility: labels ? "visible" : "hidden" });
    return (
      <>
        <div style={{ position: "absolute", left: IN, right: IN, top, height: 1, display: "flex" }}>{hair({ height: 1 }, lines)}</div>
        <div style={{ position: "absolute", left: IN, right: IN, top: bottom, height: 1, display: "flex", alignItems: "center" }}>
          {hair({ height: 1 }, lines)}
          {fixture && <span style={lab({ ...capsStyle(fixSize, F_TRACK), padding: `0 ${gap}px 0 ${gap}px` })}>{fixture}</span>}
          {hair({ height: 1 }, lines)}
        </div>
        {/* Sides, labels low (under the fade, clear of his arms): left reads up, right reads down. */}
        <div style={{ position: "absolute", left: IN, top, height: bottom - top + 1, width: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {hair({ width: 1 }, lines)}
          {date && <span style={lab({ ...capsStyle(sideSize(date), S_TRACK), writingMode: "vertical-rl", transform: "rotate(180deg)", padding: `${gap}px 0 ${gap}px`, color: "rgba(255,255,255,.8)" })}>{date}</span>}
          <div style={{ background: lines ? line : "transparent", width: 1, height: date ? tail : 0 }} />
        </div>
        <div style={{ position: "absolute", right: IN, top, height: bottom - top + 1, width: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {hair({ width: 1 }, lines)}
          {ko && <span style={lab({ ...capsStyle(sideSize(ko), S_TRACK), writingMode: "vertical-rl", padding: `${gap}px 0 ${gap}px`, color: "rgba(255,255,255,.8)" })}>{ko}</span>}
          <div style={{ background: lines ? line : "transparent", width: 1, height: ko ? tail : 0 }} />
        </div>
      </>
    );
  };
  // The foot of the frame is under echoline's deep fade: redraw its lines over it, fading in below his body.
  const reveal = `linear-gradient(to bottom, transparent ${bottom - 300 * k}px, #000 ${bottom - 110 * k}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echoinset"
        clipTop={titleTop + tSize + 30}
        light={[50, 42]}
        behind={
          <>
            {/* The inset panel: a breath lighter than the ground, so the frame reads as a surface. */}
            <div style={{ position: "absolute", left: IN, right: IN, top, height: bottom - top, background: "rgba(255,255,255,.035)" }} />
            <Frame lines labels={false} />
          </>
        }
      />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: reveal, maskImage: reveal }}>
        <Frame lines labels={false} />
      </div>
      <Frame lines={false} labels />

      {/* Top: the title, small. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...capsStyle(tSize, T_TRACK, 500) }}>{title}</div>

      {/* Crests just inside the foot of the frame, the ground under it. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {venue && (
        <div style={{ position: "absolute", left: IN, right: IN, top: venueTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: vSize, letterSpacing: "0.04em", lineHeight: 1.15, whiteSpace: "nowrap", color: "rgba(255,255,255,.72)" }}>{venue}</div>
      )}

      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
