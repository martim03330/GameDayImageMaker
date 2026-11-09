import { FaceCrop, Micro, SCRIPT } from "./kit";
import { AgencyLogo, Crest, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const GOLD = "#d8b46a";

function bigWord(data: RenderData): string {
  const c = data.content;
  if (data.postType === "renewal") return c.until || "20XX";
  if (data.postType === "potm") return c.subline.split(" ")[0] || c.kicker;
  if (data.postType === "transfer") return "WELCOME";
  return c.kicker;
}

/** Dark, side-lit face close-up with spaced gold figures and a signature (Koundé "2030" renewal). */
export function Portrait({ data }: { data: RenderData }) {
  const { params, content } = data;
  const word = bigWord(data).toUpperCase();
  const spaced = word.length <= 5;
  const size = (spaced ? 110 : Math.min(96, 460 / (word.length * 0.55))) * (params.textScale ?? 1);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#07080b", color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 60% at 20% 45%, color-mix(in srgb, ${params.primary} 55%, transparent), transparent 70%)` }} />
      <FaceCrop
        data={data}
        cx={250}
        cy={560}
        faceWidth={640}
        imgStyle={{ filter: "contrast(1.12) brightness(.95) saturate(.9)" }}
        style={{
          WebkitMaskImage: "linear-gradient(to right, #000 38%, transparent 70%), linear-gradient(to bottom, #000 70%, transparent)",
          WebkitMaskComposite: "source-in",
          maskImage: "linear-gradient(to right, #000 38%, transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85), transparent 35%)" }} />

      <div style={{ position: "absolute", left: 600, right: 70, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Micro color="#fff" style={{ opacity: 0.7, marginBottom: 40 }}>
          {content.lastName}
        </Micro>
        <Crest club={data.club} size={70} />
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, letterSpacing: spaced ? "0.35em" : "0.08em", paddingLeft: spaced ? "0.35em" : 0, color: GOLD, marginTop: 40, lineHeight: 1 }}>
          {word}
        </div>
        <div style={{ fontFamily: SCRIPT, fontSize: 92, lineHeight: 1, marginTop: 30, color: "#fff", opacity: 0.9, transform: "rotate(-6deg)" }}>
          {content.firstName} {content.lastName}
        </div>
        <Micro color="#fff" style={{ marginTop: 60, opacity: 0.7 }}>
          {content.kicker}
        </Micro>
      </div>

      <AgencyLogo data={data} height={36} style={{ position: "absolute", right: 70, bottom: 60, opacity: 0.9 }} />
    </div>
  );
}
