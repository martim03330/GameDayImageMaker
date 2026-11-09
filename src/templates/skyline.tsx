/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure, HeadLayer, LightCone } from "./fx";
import { matchInfo, Micro, opponentOf } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** The city is the scene: full-bleed skyline, giant city name on the horizon, the player in front of it all. */
export function Skyline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const city = data.club?.cityImages?.[0] ?? data.club?.cityImageUrl ?? data.bgPhotoUrl;
  const name = (data.club?.name ?? "").toUpperCase();
  const size = fitSize(name, 1040, 330, 0.5) * (params.textScale ?? 1);
  const box = figureBox(data, params.side === "left" ? 400 : 640, 0, 1080);
  const info = matchInfo(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0a0c12", color: "#fff" }}>
      {city && <img src={city} alt="" style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: 900, objectFit: "cover", objectPosition: "50% 60%", filter: "saturate(1.1) contrast(1.05)" }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 900, background: `linear-gradient(to bottom, color-mix(in srgb, ${accent} 35%, transparent), transparent 40%)`, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, bottom: 0, background: "linear-gradient(to bottom, transparent, #0a0c12 42%)" }} />
      <LightCone x={box.left + box.width / 2} color="rgba(255,236,200,.8)" opacity={0.35} />

      {/* City name sits on the horizon, between the skyline and the player. */}
      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: DISPLAY, fontSize: size, lineHeight: 0.85, color: "#fff", opacity: 0.95, letterSpacing: "0.01em", whiteSpace: "nowrap", textShadow: "0 20px 60px rgba(0,0,0,.45)" }}>
        {name}
      </div>
      <GradedFigure data={data} box={box} grade="#ffd9a0" gradeStrength={0.22} rim="rgba(255,225,180,.75)" rimSide={params.side === "left" ? "right" : "left"} />
      <HeadLayer data={data} box={box} />
      {/* Outline copy over the player, so the part of the name behind the body still reads. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: DISPLAY, fontSize: size, lineHeight: 0.85, color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,.85)", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
        {name}
      </div>

      <AgencyLogo data={data} height={40} style={{ position: "absolute", left: 60, top: 56 }} />
      <Crest club={data.club} size={70} style={{ position: "absolute", right: 60, top: 44 }} />
      <Micro color="#fff" style={{ position: "absolute", left: 60, top: 116, opacity: 0.85 }}>
        {content.subline}
      </Micro>

      <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: 40, color: accent, letterSpacing: "0.04em" }}>{content.kicker}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 84, lineHeight: 0.95, textTransform: "uppercase" }}>{content.lastName}</div>
        </div>
        <div style={{ textAlign: "right", fontFamily: SANS, fontSize: 22, lineHeight: 1.45 }}>
          {postType === "matchday" ? (
            <>
              <b style={{ fontSize: 30 }}>vs {opponentOf(data)}</b>
              <br />
              {info.when}
              <br />
              <span style={{ opacity: 0.7 }}>{info.where}</span>
            </>
          ) : (
            <>
              <b>{content.subline}</b>
              <br />
              <span style={{ opacity: 0.8 }}>{content.stats.map((s) => `${s.value} ${s.label}`).join(" · ")}</span>
            </>
          )}
        </div>
      </div>
      <Film strength={1.2} />
    </div>
  );
}
