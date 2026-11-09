import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { rng, VersusCrests } from "./kit";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Light-speed streaks in club colours bursting behind a dramatic bust (FC Barcelona "Next match"). */
export function Speed({ data }: { data: RenderData }) {
  const { params, content } = data;
  const a = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const b = params.accent.toLowerCase() === "#ffffff" ? shade(a, 0.35) : vivid(params.accent);
  const r = rng(11);
  const box = figureBox(data, 400, 0, 1180);
  const streaks = Array.from({ length: 22 }, (_, i) => ({ x: -200 + r() * 1400, w: 30 + r() * 140, c: i % 3 === 0 ? b : i % 3 === 1 ? a : "#ffffff", o: 0.25 + r() * 0.5 }));
  const title = data.postType === "matchday" ? "NEXT MATCH" : content.kicker;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(a, -0.8), color: "#fff" }}>
      <div style={{ position: "absolute", inset: -300, transform: "rotate(28deg)" }}>
        {streaks.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.x, top: 0, width: s.w, height: 2200, background: `linear-gradient(to bottom, transparent, ${s.c} 40%, ${s.c} 60%, transparent)`, opacity: s.o, filter: `blur(${10 + (i % 4) * 12}px)`, mixBlendMode: "screen" }} />
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,.5) 1px, transparent 1.5px)", backgroundSize: "90px 110px", opacity: 0.25 }} />
      <GradedFigure data={data} box={box} rim={b} rimSide="right" grade={a} gradeStrength={0.2} />
      <div style={{ position: "absolute", right: 60, top: 560, width: 440, textAlign: "center" }}>
        <VersusCrests data={data} size={78} color="#fff" gap={12} />
        <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 118 * (params.textScale ?? 1), lineHeight: 0.92, marginTop: 20, transform: "skewX(-8deg)" }}>
          {title.split(" ").map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 26, marginTop: 14 }}>{[content.date, content.venue || data.club?.stadium].filter(Boolean).join(", ").toUpperCase()}</div>
      </div>
      <AgencyLogo data={data} height={28} style={{ position: "absolute", left: "50%", bottom: 50, transform: "translateX(-50%)" }} />
      <Film strength={1.3} />
    </div>
  );
}
