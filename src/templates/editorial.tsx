/* eslint-disable @next/next/no-img-element */
import { AgencyLogo, Crest, SANS, SERIF, sentence } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const MARGIN = 96;

function headline(data: RenderData): string {
  const c = data.content;
  switch (data.postType) {
    case "renewal":
      return `Until ${c.until || "20XX"}.`;
    case "transfer":
      return "A new chapter.";
    default:
      return `${sentence(c.kicker)}.`;
  }
}

/** Agency-style announcement: full-bleed black & white photo, elegant serif, lots of air. */
export function Editorial({ data }: { data: RenderData }) {
  const { params, content } = data;
  const photo = data.bgPhotoUrl ?? data.photoUrl;
  const accent = params.accent;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0c0c0d", color: "#f4f1ea" }}>
      {photo && (
        <img
          src={photo}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${50 - (params.playerX ?? 0) / 10}% ${20 - (params.playerY ?? 0) / 10}%`,
            transform: `scale(${params.playerScale ?? 1})`,
            filter: "grayscale(1) contrast(1.1) brightness(.92)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,.35) 0%, transparent 22%, transparent 48%, rgba(0,0,0,.7) 68%, rgba(0,0,0,.92) 100%)",
        }}
      />

      <Crest club={data.club} size={72} style={{ position: "absolute", top: MARGIN - 20, left: MARGIN }} />

      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN + 30 }}>
        <div style={{ width: 90, height: 2, background: accent, marginBottom: 34 }} />
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 120 * (params.textScale ?? 1), lineHeight: 0.95, letterSpacing: "-0.02em" }}>
          {headline(data)}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 34 }}>
          {content.firstName} {content.lastName}
          {data.club && <span style={{ opacity: 0.6 }}> · {data.club.name}</span>}
        </div>
        {content.subline && (
          <div style={{ fontFamily: SANS, fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 10, opacity: 0.6 }}>{content.subline}</div>
        )}
      </div>

      <AgencyLogo data={data} height={40} style={{ position: "absolute", right: MARGIN, bottom: MARGIN - 24, opacity: 0.85 }} />
    </div>
  );
}
