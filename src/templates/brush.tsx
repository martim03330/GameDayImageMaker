/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { BrushStrokes, Crosshair, EdgeStrip, Figure, INK, matchInfo, Micro, Paper, SCRIPT, VersusCrests } from "./kit";
import { AgencyLogo, CONDENSED, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Club-colour brush strokes on paper, script word, founding year around the crest (Atlético "By&For"). */
export function Brush({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const main = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const second = params.accent.toLowerCase() === "#ffffff" ? shade(main, -0.55) : vivid(params.accent);
  const dark = params.bgStyle === "photo";
  const ink = dark ? "#fff" : INK;
  const club = (data.club?.name ?? content.lastName).toUpperCase();
  const script = postType === "matchday" || postType === "result" ? (content.awayTeam ?? content.homeTeam ?? "") : content.lastName;
  const year = data.club?.founded ?? "";
  const info = matchInfo(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: ink }}>
      <Paper color={dark ? "#15161b" : "#ecebe7"} strength={dark ? 0.6 : 1} />
      <BrushStrokes colors={[main, second, dark ? main : shade(main, -0.6)]} seed={params.side === "left" ? 5 : 9} count={10} opacity={dark ? 0.9 : 0.95} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520, background: `linear-gradient(to bottom, ${dark ? "#15161b" : "#ecebe7"} 18%, transparent)` }} />

      <EdgeStrip data={data} color={ink} y={28} />
      <AgencyLogo data={data} onLight={!dark} height={40} style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)" }} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: postType === "matchday" || postType === "result" ? 400 : 330,
          textAlign: "center",
          fontFamily: SCRIPT,
          fontSize: fitSize(script, 980, 240, 0.42),
          color: main,
          transform: "rotate(-7deg)",
          opacity: 0.9,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {script}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 22, fontFamily: CONDENSED, fontWeight: 700, fontSize: 30, letterSpacing: "0.2em" }}>
          <span>{year.slice(0, 2)}</span>
          {data.club?.crestUrl ? <img src={data.club.crestUrl} alt="" style={{ height: 58 }} /> : <span style={{ width: 40, height: 40, background: main }} />}
          <span>{year.slice(2)}</span>
        </div>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fitSize(club, 900, 92, 0.46), lineHeight: 1, marginTop: 10, letterSpacing: "0.02em" }}>{club}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.28em", textTransform: "uppercase", marginTop: 12 }}>{content.subline || content.kicker}</div>
        <div style={{ display: "inline-block", marginTop: 12, background: main, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 16, letterSpacing: "0.2em", padding: "4px 14px" }}>
          {content.kicker}
        </div>
        {(postType === "matchday" || postType === "result") && (
          <div style={{ marginTop: 22 }}>
            <VersusCrests data={data} size={84} color={ink} gap={18} />
          </div>
        )}
      </div>

      <Crosshair cx={540} cy={840} r={250} color={ink} />
      <Figure data={data} cx={540} bottom={140} height={postType === "matchday" || postType === "result" ? 760 : 840} style={{ filter: "drop-shadow(0 30px 30px rgba(0,0,0,.35))" }} />

      <div style={{ position: "absolute", left: 60, right: 60, bottom: 92, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: SANS, fontWeight: 700, letterSpacing: "0.25em", fontSize: 20, textTransform: "uppercase" }}>
        <span>{postType === "matchday" ? content.date : `${content.firstName}`}</span>
        <span style={{ fontSize: 24 }}>{postType === "matchday" ? info.where || info.teams : content.lastName}</span>
        <span>{postType === "matchday" ? content.time : data.player.number && `#${data.player.number}`}</span>
      </div>
      <Micro color={ink} style={{ position: "absolute", right: 40, top: 640, writingMode: "vertical-rl", opacity: 0.6 }}>
        {data.club?.name ?? ""}
      </Micro>
    </div>
  );
}
