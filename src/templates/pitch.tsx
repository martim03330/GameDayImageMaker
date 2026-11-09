/* eslint-disable @next/next/no-img-element */
import { ARCHIVO_BLACK, CastShadow, figureBox, Film, Grass } from "./fx";
import { matchInfo, opponentOf } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Crests painted in white on the grass, the player small on the pitch with a long shadow (Arsenal / Cádiz). */
export function Pitch({ data }: { data: RenderData }) {
  const { params, content } = data;
  const home = content.homeCrest ?? data.club?.crestUrl;
  const away = content.awayCrest;
  const box = figureBox(data, 540, 190, 560);
  const info = matchInfo(data);
  const paint = (src: string | null | undefined, x: number) =>
    src ? (
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          left: x,
          top: 520,
          width: 360,
          height: 360,
          objectFit: "contain",
          // Keeps the crest's inner lines as lighter / darker paint instead of a flat blob.
          filter: "grayscale(1) brightness(1.5) contrast(1.35)",
          mixBlendMode: "screen",
          opacity: 0.6,
          transform: "perspective(900px) rotateX(38deg)",
        }}
      />
    ) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#fff" }}>
      <Grass />
      {paint(home, 90)}
      {paint(away, 630)}
      <div style={{ position: "absolute", left: -40, right: -40, top: 1180, height: 10, background: "rgba(255,255,255,.75)", transform: "rotate(-2deg)", filter: "blur(.5px)" }} />
      {data.photoUrl && <CastShadow box={box} url={data.photoUrl} skew={-60} length={0.32} />}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.35)) contrast(1.05)" }} />}

      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: ARCHIVO_BLACK, fontSize: 118 * (params.textScale ?? 1), letterSpacing: "0.04em", lineHeight: 1, textShadow: "0 6px 20px rgba(0,0,0,.35)" }}>
        {content.kicker}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 36, lineHeight: 1.15 }}>
        {content.date}
        <br />
        {content.time}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <AgencyLogo data={data} height={26} />
        <span>
          {data.club?.name} vs {opponentOf(data)}
        </span>
      </div>
      <div style={{ position: "absolute", right: 70, top: 70, fontFamily: SANS, fontSize: 18, fontWeight: 700, textAlign: "right", letterSpacing: "0.1em", textTransform: "uppercase" }}>{info.where || content.subline}</div>
      <Film strength={1.1} />
    </div>
  );
}
