import { vivid } from "@/lib/color";
import { DMSERIF, figureBox, Film, GradedFigure, HeadLayer } from "./fx";
import { Micro } from "./kit";
import { AgencyLogo, Crest, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

function word(data: RenderData): string[] {
  const c = data.content;
  if (data.postType === "renewal" && c.until) return [c.until.slice(0, 2), c.until.slice(2)];
  const w = c.kicker.toUpperCase().split(/\s+/);
  if (w.length === 1) return [w[0]];
  // "PLAYER OF THE MONTH" → "PLAYER": keep the longest word whole (cutting it in halves read as a typo).
  return [[...w].sort((a, b) => b.length - a.length)[0]];
}

/** Light, elegant serif system: huge cropped word behind the head, mirrored echo, club gradient (Real Madrid 26/27). */
export function Serif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const lines = word(data);
  const size = (lines.length > 1 ? 330 : Math.min(420, 940 / Math.max(2.4, lines[0].length * 0.74))) * (params.textScale ?? 1);
  const box = figureBox(data, 540, 0, 1160);
  // Only show a minute when we actually know it (live goals), otherwise the shirt number.
  const minute = /\d+'/.test(content.subline) ? content.subline.match(/\d+'/)?.[0] : data.player.number;

  const wordBlock = (flip = false) => (
    <div
      data-bleed={flip || undefined}
      style={{
        position: "absolute",
        left: -20,
        right: -20,
        top: flip ? undefined : 20,
        bottom: flip ? -size * 0.55 : undefined,
        textAlign: "center",
        fontFamily: DMSERIF,
        fontSize: size,
        lineHeight: 0.82,
        color: accent,
        whiteSpace: "nowrap",
        transform: flip ? "scaleY(-1)" : undefined,
        opacity: flip ? 0.9 : 1,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#fbf9fa", color: "#1a1418" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${accent} 0%, color-mix(in srgb, ${accent} 45%, transparent) 22%, transparent 55%)` }} />
      {wordBlock()}
      {wordBlock(true)}
      <GradedFigure data={data} box={box} grade="#ffffff" gradeStrength={0.12} />
      <HeadLayer data={data} box={box} />

      <Crest club={data.club} size={70} style={{ position: "absolute", right: 56, top: 40 + size * 0.82 * lines.length }} />
      {minute && <div style={{ position: "absolute", left: 60, top: 760, fontFamily: DMSERIF, fontSize: 64, color: "#1a1418" }}>{minute}</div>}
      <div style={{ position: "absolute", right: 60, top: 700, textAlign: "right", fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.04em" }}>
        {`${content.firstName} ${content.lastName}`.toUpperCase()}
      </div>
      <Micro color="#fff" style={{ position: "absolute", left: 60, bottom: 50 }}>
        {content.subline}
      </Micro>
      <AgencyLogo data={data} height={34} style={{ position: "absolute", right: 56, bottom: 44 }} />
      <Film strength={0.7} />
    </div>
  );
}
