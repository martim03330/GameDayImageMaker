/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure, GradientMapDefs } from "./fx";
import { matchInfo, rng } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Everything in one club colour: the stadium toned to it, a huge white title the player's head
 * breaks through, spaced caption on top (Pitt State "Gameday").
 */
export function Mono({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 7);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const scenes = [...(data.club?.stadiumImages ?? []), ...(data.club?.cityImages ?? [])];
  const scene = scenes.length ? scenes[Math.floor(r() * scenes.length)] : data.bgPhotoUrl;
  const right = params.side !== "left";
  const hollow = r() < 0.3;

  const title = content.kicker.toUpperCase().replace(/\s+/g, "");
  const words = content.kicker.toUpperCase().split(/\s+/).filter(Boolean);
  // Short titles on one line ("GOAL", "MATCHDAY"); longer ones stacked in two.
  const lines = title.length <= 9 ? [words.join(" ")] : [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")];
  const longest = Math.max(...lines.map((l) => [...l].length));
  const size = Math.min(420, 980 / (longest * 0.47));
  const box = figureBox(data, right ? 600 : 480, 0, 1120);
  const info = matchInfo(data);
  const top = [data.club?.name, content.subline].filter(Boolean).join("   ·   ");

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: accent, color: "#fff" }}>
      <GradientMapDefs id="mono-bg" dark={shade(accent, -0.55)} light={shade(accent, 0.35)} />
      {scene && <img src={scene} alt="" style={{ position: "absolute", inset: 0, width: CANVAS_W, height: CANVAS_H, objectFit: "cover", filter: "url(#mono-bg) blur(2px)", opacity: 0.55 }} />}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 40%, transparent 0%, ${shade(accent, -0.35)}aa 100%)` }} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 64, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: Math.min(20, 960 / Math.max(1, top.length * 0.95)), letterSpacing: "0.45em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {top}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 130,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: 0.88,
          whiteSpace: "nowrap",
          color: hollow ? "transparent" : "#fff",
          WebkitTextStroke: hollow ? "5px #fff" : undefined,
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      <GradedFigure data={data} box={box} grade={accent} gradeStrength={0.22} />

      <div style={{ position: "absolute", [right ? "left" : "right"]: 60, bottom: 250, textAlign: right ? "left" : "right", maxWidth: 340 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase" }}>{content.firstName}</div>
        <div style={{ fontFamily: CONDENSED, fontWeight: 900, fontStyle: "italic", fontSize: Math.min(76, 340 / (content.lastName.length * 0.5)), lineHeight: 1, textTransform: "uppercase" }}>{content.lastName}</div>
        {info.when && <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 26, marginTop: 10, letterSpacing: "0.08em" }}>{info.when}</div>}
      </div>
      <Crest club={data.club} size={80} style={{ position: "absolute", bottom: 56, left: CANVAS_W / 2 - 40 }} />
      <AgencyLogo data={data} height={28} style={{ position: "absolute", bottom: 80, [right ? "left" : "right"]: 60 }} />
      <Film strength={0.8} />
    </div>
  );
}
