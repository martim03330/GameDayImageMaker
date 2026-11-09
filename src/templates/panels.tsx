/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { Film } from "./fx";
import { opponentOf, VersusCrests } from "./kit";
import { AgencyLogo, DISPLAY, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Several photos of the player in slanted panels, crests and a clean title block underneath (Man City × Leeds). */
export function Panels({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.6);
  const shots = data.cutouts.length ? data.cutouts : [];
  const pick = (i: number) => shots[i % Math.max(1, shots.length)];
  const focus = (i: number) => {
    const f = pick(i)?.face;
    return f ? `${(f[0] + f[2] / 2) * 100}% ${(f[1] + f[3] / 2) * 100}%` : "50% 20%";
  };
  const F = { x: 60, y: 60, w: 960, h: 900 };
  // Three panels separated by slanted gutters.
  const clips = [
    `polygon(0 0, 55% 0, 50% 58%, 0 64%)`,
    `polygon(57% 0, 100% 0, 100% 42%, 52% 50%)`,
    `polygon(51.5% 52%, 100% 44%, 100% 100%, 46% 100%)`,
  ];
  const title = postType === "matchday" || postType === "result" ? [data.club?.name ?? "", `v ${opponentOf(data)}`] : [`${content.firstName} ${content.lastName}`, content.kicker];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f3f3f5", color: deep }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, textAlign: "center", fontFamily: DISPLAY, fontSize: 300, color: "#000", opacity: 0.04, lineHeight: 1 }}>
        {(data.club?.name ?? "").split(" ")[0].toUpperCase()}
      </div>
      <div style={{ position: "absolute", left: F.x, top: F.y, width: F.w, height: F.h, background: "#1c1f26", boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
        {clips.map((c, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, clipPath: c, overflow: "hidden", background: `linear-gradient(160deg, #2a2e38, #12141a)` }}>
            {pick(i) && (
              <img
                src={pick(i)!.original}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus(i), transform: `scale(${[1.15, 1.35, 1.25][i]})`, transformOrigin: focus(i), filter: "contrast(1.05)" }}
              />
            )}
          </div>
        ))}
        <svg width={F.w} height={F.h} style={{ position: "absolute", inset: 0 }}>
          <g stroke="#f3f3f5" strokeWidth={14}>
            <line x1={F.w * 0.56} y1={0} x2={F.w * 0.48} y2={F.h} />
            <line x1={F.w * 0.5} y1={F.h * 0.62} x2={0} y2={F.h * 0.68} />
            <line x1={F.w} y1={F.h * 0.43} x2={F.w * 0.51} y2={F.h * 0.51} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 40, bottom: 40 }}>
          <VersusCrests data={data} size={120} color="#fff" gap={30} />
        </div>
        <div style={{ position: "absolute", left: 30, top: 26, fontFamily: SANS, fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "0.04em" }}>
          {content.subline.toUpperCase()} {data.club?.stadium ? `| ${data.club.stadium.toUpperCase()}` : ""}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: "0.08em", color: shade(accent, -0.2) }}>{[content.date, content.time].filter(Boolean).join(" | ").toUpperCase()}</div>
        <div style={{ fontFamily: "var(--font-archivo-black), sans-serif", fontSize: fitSize(title[0], 900, 80, 0.62), lineHeight: 1.05, color: accent }}>{title[0].toUpperCase()}</div>
        <div style={{ fontFamily: "var(--font-archivo-black), sans-serif", fontSize: fitSize(title[1], 900, 64, 0.62), lineHeight: 1.05, color: deep }}>{title[1]}</div>
      </div>
      <AgencyLogo data={data} onLight height={30} style={{ position: "absolute", left: "50%", bottom: 50, transform: "translateX(-50%)" }} />
      <Film strength={0.6} />
    </div>
  );
}
