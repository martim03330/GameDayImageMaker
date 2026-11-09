/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { DMSERIF, figureBox, Film, Furniture, GradedFigure, GradientMapDefs } from "./fx";
import { matchInfo, opponentOf, VersusCrests } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Black & white editorial with one club-colour accent and page furniture (Georgia Basketball gameday). */
export function Archive({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const right = params.side !== "left";
  const box = figureBox(data, right ? 690 : 390, 0, 1140);
  const info = matchInfo(data);
  const matchday = postType === "matchday" || postType === "result";
  const title = matchday ? (data.club?.name ?? content.homeTeam ?? "") : content.firstName;
  const sub = matchday ? `vs ${opponentOf(data)}` : content.lastName;
  const colX = right ? 60 : 560;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#101012", color: "#f2f0ec" }}>
      <GradientMapDefs id="bw" dark="#0b0b0c" mid="#7a7a78" light="#f7f5f0" />
      {data.bgPhotoUrl && (
        <img
          src={data.bgPhotoUrl}
          alt=""
          style={{ position: "absolute", inset: -30, width: CANVAS_W + 60, height: CANVAS_H + 60, objectFit: "cover", filter: "grayscale(1) contrast(1.35) brightness(.42) blur(3px)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(16,16,18,.85), rgba(16,16,18,.35) 40%, rgba(16,16,18,.9) 100%)" }} />

      {/* Tall frames behind the player, like gallery windows. */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 250 + i * 18,
            bottom: 140,
            left: (right ? 470 : 150) + i * 150,
            width: 120,
            border: "2px solid rgba(242,240,236,.25)",
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 0, top: 0, width: 260, height: 10, background: accent }} />
      <div style={{ position: "absolute", right: 56, top: 250, bottom: 140, width: 6, background: accent }} />

      <GradedFigure data={data} box={box} gradientMap="bw" rim="rgba(255,255,255,.55)" rimSide={right ? "left" : "right"} />

      <Furniture data={data} color="#f2f0ec" accent={accent} />

      <div style={{ position: "absolute", left: colX, top: 250, width: 470 }}>
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: Math.min(150, 900 / Math.max(4, title.length)), lineHeight: 0.9, letterSpacing: "-0.02em" }}>{title}</div>
        <div style={{ fontFamily: DMSERIF, fontSize: 54, lineHeight: 1.05, marginTop: 8, color: matchday ? "#f2f0ec" : accent }}>{sub}</div>
        <div style={{ fontFamily: SANS, fontSize: 26, marginTop: 26, lineHeight: 1.4, textTransform: "lowercase", opacity: 0.9 }}>
          {matchday ? (
            <>
              {content.date} <span style={{ color: accent }}>|</span> {content.time || content.subline}
              <br />
              {info.where || content.subline}
            </>
          ) : (
            <>
              {content.kicker}
              <br />
              {content.stats.map((s) => `${s.value} ${s.label}`).join(" · ")}
            </>
          )}
        </div>
        <div style={{ marginTop: 30, display: "flex" }}>
          <VersusCrests data={data} size={64} color="#f2f0ec" gap={12} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 56, bottom: 60, writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "var(--font-mono), monospace", fontSize: 13, letterSpacing: "0.3em", opacity: 0.7 }}>
        {`${content.firstName} ${content.lastName} · ${content.subline} · ${data.club?.name ?? ""}`.toUpperCase()}
      </div>
      <AgencyLogo data={data} height={34} style={{ position: "absolute", right: 56, bottom: 56 }} />
      <Film strength={1.6} />
    </div>
  );
}
