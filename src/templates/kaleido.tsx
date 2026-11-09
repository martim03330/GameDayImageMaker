/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { cutMask, Film, Furniture } from "./fx";
import { INK, matchInfo, Paper } from "./kit";
import { AgencyLogo, DISPLAY, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

const CX = 540;
const CY = 590;

/** The player cloned around a centre point like a flower (Georgia "Dawgs vs Tigers"). */
export function Kaleido({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // One photo repeated reads as a pattern; mixing photos looks messy.
  const photos = data.cutouts.slice(0, 1);
  const n = 6;
  const h = 450 * (params.playerScale ?? 1);
  const info = matchInfo(data);
  const matchday = postType === "matchday" || postType === "result";
  const left = matchday ? (content.homeTeam ?? "").toUpperCase() : content.firstName.toUpperCase();
  const right = matchday ? (content.awayTeam ?? "").toUpperCase() : content.lastName.toUpperCase();
  const size = fitSize(`${left} ${right}`, 820, 150, 0.46);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: INK }}>
      <Paper color="#e9e7e3" />
      <div style={{ position: "absolute", left: CX - 330, top: CY - 330, width: 660, height: 660, borderRadius: "50%", border: `2px solid ${INK}`, opacity: 0.12 }} />
      {photos.length > 0 &&
        Array.from({ length: n }, (_, i) => {
          const p = photos[i % photos.length];
          const w = h * (p.aspect ?? 0.5);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: CX - w / 2,
                top: CY - h - 70,
                width: w,
                height: h,
                transformOrigin: `50% ${h + 70}px`,
                transform: `rotate(${(360 / n) * i + 180}deg)`,
                filter: "drop-shadow(0 12px 14px rgba(0,0,0,.25))",
              }}
            >
              <img src={p.url} alt="" style={{ width: "100%", height: "100%", filter: "grayscale(1) contrast(1.15)", ...cutMask(p.cut) }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: accent,
                  mixBlendMode: "multiply",
                  opacity: 0.85,
                  WebkitMaskImage: `url(${maskUrl(p.url)})`,
                  maskImage: `url(${maskUrl(p.url)})`,
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                }}
              />
            </div>
          );
        })}

      <Furniture data={data} color={INK} accent={accent} />

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 26, fontFamily: DISPLAY, fontSize: size, lineHeight: 1 }}>
          {content.homeCrest && matchday && <img src={content.homeCrest} alt="" style={{ height: size * 0.6 }} />}
          <span>{left}</span>
          {matchday && <span style={{ fontFamily: SANS, fontSize: size * 0.3, fontWeight: 500 }}>vs</span>}
          <span>{right}</span>
          {content.awayCrest && matchday && <img src={content.awayCrest} alt="" style={{ height: size * 0.6 }} />}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 28, marginTop: 14, textTransform: "lowercase" }}>
          {matchday ? [content.date, content.time].filter(Boolean).join(" | ") : content.kicker}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 22, marginTop: 4, opacity: 0.7, textTransform: "lowercase" }}>{matchday ? info.where : content.subline}</div>
      </div>
      <AgencyLogo data={data} onLight height={30} style={{ position: "absolute", left: "50%", bottom: 36, transform: "translateX(-50%)" }} />
      <Film strength={1.2} />
    </div>
  );
}
