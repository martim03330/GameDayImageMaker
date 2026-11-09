/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, Film, GOTHIC } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Vertical strips alternating full-body shots and tight face crops, big blackletter title (Kings League / Panam). */
export function Gothic({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const photos = data.cutouts.length ? data.cutouts : [];
  const n = 4;
  const w = CANVAS_W / n;
  const title = content.kicker.charAt(0) + content.kicker.slice(1).toLowerCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(base, -0.55), color: "#fff" }}>
      {Array.from({ length: n }, (_, i) => {
        const p = photos[i % Math.max(1, photos.length)];
        const face = i % 2 === 1;
        const [fx, fy, fw, fh] = p?.face ?? [0.4, 0.06, 0.2, 0.12];
        // Face crops: the face fills ~1.1× the strip width.
        const imgW = face ? (w * 1.1) / fw : w * 1.25;
        return (
          <div key={i} style={{ position: "absolute", left: i * w, top: 0, width: w, height: CANVAS_H, overflow: "hidden", background: `linear-gradient(180deg, ${i % 2 ? shade(base, -0.35) : base}, ${shade(base, -0.6)})` }}>
            {p &&
              (face ? (
                <img
                  src={p.url}
                  alt=""
                  style={{
                    position: "absolute",
                    width: imgW,
                    maxWidth: "none",
                    left: w / 2 - (fx + fw / 2) * imgW,
                    top: 520 - (fy + fh / 2) * (imgW / (p.aspect ?? 0.5)),
                    filter: "contrast(1.08) saturate(1.05)",
                  }}
                />
              ) : (
                <img src={p.url} alt="" style={{ position: "absolute", height: 1000, maxWidth: "none", left: "50%", top: 120, transform: "translateX(-50%)", ...cutMask(p.cut) }} />
              ))}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: `linear-gradient(to top, ${shade(base, -0.7)} 25%, transparent)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: GOTHIC, fontSize: Math.min(250, 1900 / Math.max(6, title.length)) * (params.textScale ?? 1), lineHeight: 1, textShadow: "0 10px 30px rgba(0,0,0,.6)" }}>{title}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, letterSpacing: "0.04em" }}>
        {postType === "matchday" || postType === "result" ? `VS ${opponentOf(data).toUpperCase()}` : `${content.firstName} ${content.lastName}`.toUpperCase()}
      </div>
      <div style={{ position: "absolute", right: 30, top: 60, writingMode: "vertical-rl", fontFamily: CONDENSED, fontWeight: 800, fontSize: 30, letterSpacing: "0.1em" }}>{[content.date, content.time].filter(Boolean).join("  |  ") || content.subline}</div>
      <AgencyLogo data={data} height={30} style={{ position: "absolute", left: 40, top: 50 }} />
      <Film strength={1.4} />
    </div>
  );
}
