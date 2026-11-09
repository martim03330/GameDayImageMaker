/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, GradientMapDefs, SLAB } from "./fx";
import { opponentOf, Paper } from "./kit";
import { Crest, fitSize, MONO } from "./shared";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const W = { x: 150, y: 360, w: 780, h: 560 };
/** The player breaks out of the top of the window and dissolves into the scene instead of ending on a hard edge. */
const FADE = `linear-gradient(to bottom, #000 ${W.y + 90}px, transparent ${W.y + 280}px)`;

/** Vintage official matchday programme cover: masthead, arched duotone photo window, VERSUS, price roundel. */
export function Programme({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const ink = shade(accent, -0.7);
  // The window holds the scene, not the player: with his own photo in it he shows up twice, at two scales.
  const photo = data.club?.cityImageUrl ?? data.bgPhotoUrl;
  // Sits 60px lower than the arch window so the head breaks out of it without reaching "OFFICIAL PROGRAMME".
  const box = figureBox(data, 540, CANVAS_H - W.y - W.h - 60, 700);
  const clip = `path('M0 ${W.w / 2.6} Q0 0 ${W.w / 2} 0 Q${W.w} 0 ${W.w} ${W.w / 2.6} V${W.h} H0 Z')`;
  const opp = postType === "matchday" || postType === "result" ? opponentOf(data) : content.kicker;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: ink }}>
      <GradientMapDefs id="prog-duo" dark={ink} light="#efe6cf" />
      <Paper color="#efe6cf" strength={1.3} />
      <div style={{ position: "absolute", inset: 0, border: `30px solid ${accent}` }} />
      <div style={{ position: "absolute", inset: 48, border: `2px solid ${ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", fontFamily: SLAB, fontSize: Math.min(120, 1500 / Math.max(6, (data.club?.name ?? "").length)), lineHeight: 1, color: accent }}>
        {(data.club?.name ?? "").toUpperCase()}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: MONO, fontSize: 20, letterSpacing: "0.4em" }}>PROGRAMA OFICIAL</div>
      <div style={{ position: "absolute", left: W.x - 12, top: W.y - 12, width: W.w + 24, height: W.h + 24, border: `3px double ${ink}`, clipPath: `path('M0 ${W.w / 2.6 + 12} Q0 0 ${W.w / 2 + 12} 0 Q${W.w + 24} 0 ${W.w + 24} ${W.w / 2.6 + 12} V${W.h + 24} H0 Z')`, background: ink }} />
      <div style={{ position: "absolute", left: W.x, top: W.y, width: W.w, height: W.h, clipPath: clip, overflow: "hidden", background: ink }}>
        {photo && <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", filter: "url(#prog-duo) contrast(1.1)" }} />}
      </div>
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${CANVAS_W - W.x - W.w}px 0 ${W.x}px)`, WebkitMaskImage: FADE, maskImage: FADE }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "url(#prog-duo)" }} />
        </div>
      )}
      {/* Kept clear of the crest and the price roundel on either side. */}
      <div style={{ position: "absolute", left: 220, right: 220, top: 960, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.5em" }}>VERSUS</div>
        <div style={{ fontFamily: SLAB, fontSize: fitSize(opp, 620, 104, 0.7), lineHeight: 1.05, color: accent, whiteSpace: "nowrap" }}>{opp.toUpperCase()}</div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 950, width: 150, height: 150, borderRadius: "50%", background: accent, color: "#efe6cf", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-10deg)" }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "0.2em" }}>PREÇO</div>
        <div style={{ fontFamily: SLAB, fontSize: 50, lineHeight: 1 }}>2€</div>
      </div>
      <Crest club={data.club} size={80} style={{ position: "absolute", left: 80, top: 985 }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 70, textAlign: "center", fontFamily: MONO, fontSize: 17, letterSpacing: "0.2em" }}>
        {[content.subline, content.date, content.time].filter(Boolean).join(" · ").toUpperCase()}
      </div>
      <AgencyLogo data={data} onLight height={24} style={{ position: "absolute", left: "50%", bottom: 100, transform: "translateX(-50%)", opacity: 0.7 }} />
    </div>
  );
}
