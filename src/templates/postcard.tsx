import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { INK, Micro, Paper, SCRIPT } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Vintage "greetings from" postcard: huge block letters filled with city photos, the player bursting out in front. */
export function Postcard({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.55);
  const photos = data.club?.cityImages?.length ? data.club.cityImages : [data.club?.cityImageUrl ?? data.bgPhotoUrl ?? ""];
  const words = (data.club?.name ?? "").toUpperCase().split(/\s+/);
  const main = words.sort((a, b) => b.length - a.length)[0] ?? "";
  const small = (data.club?.name ?? "").toUpperCase().replace(main, "").trim();
  const letters = [...main];
  const size = Math.min(360, 980 / (letters.length * 0.5)) * (params.textScale ?? 1);
  const box = figureBox(data, 560, 0, 860);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: INK }}>
      <Paper color="#efe6d2" strength={1.3} />
      <div style={{ position: "absolute", inset: 28, border: `3px solid ${deep}`, borderRadius: 18 }} />
      <div style={{ position: "absolute", inset: 40, border: `1.5px dashed ${deep}`, borderRadius: 12, opacity: 0.6 }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: SCRIPT, fontSize: 110, lineHeight: 1, color: accent, transform: "rotate(-6deg)" }}>
        Saudações de
      </div>
      {small && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: CONDENSED, fontWeight: 800, fontSize: 40, letterSpacing: "0.3em", color: deep }}>
          {small}
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        {letters.map((l, i) => (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: size,
              lineHeight: 1,
              backgroundImage: `url(${photos[i % photos.length]})`,
              backgroundSize: `${size * 2.2}px auto`,
              backgroundPosition: `${(i * 37) % 100}% 55%`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: `4px ${deep}`,
              filter: `drop-shadow(8px 8px 0 ${deep})`,
            }}
          >
            {l}
          </span>
        ))}
      </div>

      <GradedFigure data={data} box={box} grade="#ffe2b8" gradeStrength={0.2} />

      <div style={{ position: "absolute", right: 70, top: 70, width: 130, height: 160, border: `3px dashed ${deep}`, display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f0e2", transform: "rotate(4deg)" }}>
        <Crest club={data.club} size={96} />
      </div>
      <AgencyLogo data={data} onLight height={32} style={{ position: "absolute", left: 70, top: 76 }} />

      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ background: deep, color: "#f7f0e2", padding: "10px 18px", transform: "rotate(-2deg)" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 52, lineHeight: 1, textTransform: "uppercase" }}>
            {content.firstName} {content.lastName}
          </div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 24, letterSpacing: "0.2em" }}>{content.kicker}</div>
        </div>
        <Micro color={INK} style={{ textAlign: "right", lineHeight: 1.6 }}>
          {content.subline}
          <br />
          {data.content.subline}
        </Micro>
      </div>
      <Film strength={1.1} />
    </div>
  );
}
