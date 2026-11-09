/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, figureBox, Film, GradedFigure } from "./fx";
import { matchInfo, rng } from "./kit";
import { AgencyLogo, CONDENSED, Crest, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

/**
 * A giant silhouette of the player filled with the stadium (or the city), the real player small in
 * front of it at the bottom, fixture lines on the silhouette's head (Beşiktaş matchday series).
 */
export function Silhouette({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 3);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const right = params.side !== "left";
  const scenes = [...(data.club?.stadiumImages ?? []), ...(data.club?.cityImages ?? [])].filter(Boolean);
  const scene = scenes.length ? scenes[Math.floor(r() * scenes.length)] : data.bgPhotoUrl;
  const light = r() < 0.5;
  const bg = light ? shade(accent, 0.88) : shade(accent, -0.72);
  const fill = light ? shade(accent, -0.55) : shade(accent, -0.2);

  // The silhouette: always the whole figure, big, head near the top.
  const aspect = data.photoAspect ?? 0.5;
  const bigH = 1500;
  const bigW = bigH * aspect;
  const big = { left: 540 - bigW / 2 + (right ? -60 : 60), top: 120, width: bigW, height: bigH };
  // The real player, smaller, standing at the bottom in front.
  const small = figureBox({ ...data, params: { ...params, framing: undefined } }, right ? 620 : 460, 40, 760);
  const info = matchInfo(data);
  const top = (data.postType === "matchday" && info.teams) || content.kicker;
  const headCx = big.left + big.width * ((data.face?.[0] ?? 0.4) + (data.face?.[2] ?? 0.2) / 2);
  const headY = big.top + big.height * ((data.face?.[1] ?? 0.05) + (data.face?.[3] ?? 0.08) * 0.35);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg, color: light ? shade(accent, -0.6) : "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 60% at 50% 30%, ${light ? "#ffffff" : shade(accent, -0.45)} 0%, transparent 75%)` }} />
      {data.photoUrl && (
        <div
          style={{
            position: "absolute",
            ...big,
            WebkitMaskImage: `url(${maskUrl(data.photoUrl)})`,
            maskImage: `url(${maskUrl(data.photoUrl)})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        >
          {/* Separate layer: the edge fade is a mask too, and one element can only hold one. */}
          <div style={{ position: "absolute", inset: 0, ...cutMask(data.cut) }}>
            <div style={{ position: "absolute", inset: 0, background: fill }} />
            {scene && <img src={scene} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.6) contrast(1.1)", mixBlendMode: "luminosity", opacity: 0.55 }} />}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${fill}00 0%, ${fill}aa 70%, ${fill} 100%)` }} />
          </div>
        </div>
      )}

      {/* Fixture on the silhouette's head. */}
      <div style={{ position: "absolute", left: headCx - 220, width: 440, top: headY - 40, textAlign: "center", color: "#fff" }}>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fitSize(top.toUpperCase(), 400, 44, 0.5), lineHeight: 1, textTransform: "uppercase" }}>{top}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 17, letterSpacing: "0.2em", marginTop: 10, opacity: 0.85, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {info.when || content.subline.slice(0, 36)}
        </div>
      </div>

      {/* Mist where the small player stands. */}
      <div style={{ position: "absolute", left: -100, right: -100, bottom: -80, height: 320, background: `radial-gradient(50% 50% at 50% 60%, ${light ? "rgba(255,255,255,.75)" : "rgba(0,0,0,.6)"}, transparent 70%)` }} />
      <GradedFigure data={data} box={small} grade={accent} gradeStrength={0.12} />

      <Crest club={data.club} size={78} style={{ position: "absolute", bottom: 56, [right ? "left" : "right"]: 64 }} />
      <div style={{ position: "absolute", bottom: 150, [right ? "left" : "right"]: 64, textAlign: right ? "left" : "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase" }}>{content.firstName}</div>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fitSize(content.lastName.toUpperCase(), 330, 72, 0.5), lineHeight: 1, textTransform: "uppercase" }}>{content.lastName}</div>
      </div>
      <AgencyLogo data={data} onLight={light} height={30} style={{ position: "absolute", top: 56, [right ? "left" : "right"]: 64 }} />
      <Film strength={0.6} />
    </div>
  );
}
