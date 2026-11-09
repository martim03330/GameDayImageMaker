import { shade, vivid } from "@/lib/color";
import { Extruded, FaceCrop, Figure, INK, InsetPanel, matchInfo, Micro, Paper, VersusCrests } from "./kit";
import { AgencyLogo, CONDENSED, fitSize, M } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Giant face close-up + full-body cutout + extruded letters on paper with diagonal bands (SRFC / Noah FC). */
export function Closeup({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const last = content.lastName.toUpperCase();
  const letters = fitSize(last, 1000, 400, 0.5) * (params.textScale ?? 1);
  const info = matchInfo(data);
  // Hashtag of the club as stored ("#SCVIANENSESAD"), never a truncated code.
  const tag = `#${(data.club?.name ?? content.homeTeam ?? "").normalize("NFD").replace(/[^A-Za-z0-9]/g, "")}`.toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: INK, fontFamily: CONDENSED }}>
      <Paper />
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 8%, 46% 0, 100% 52%, 100% 74%, 0 26%)", background: accent, opacity: 0.92 }} />
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(38% 0, 100% 0, 100% 40%)", background: shade(INK, 0.25), opacity: 0.85 }} />

      <FaceCrop
        data={data}
        cx={params.side === "left" ? 640 : 420}
        cy={330}
        faceWidth={430}
        imgStyle={{ filter: "grayscale(.25) contrast(1.08)" }}
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent 72%)",
          maskImage: "linear-gradient(to bottom, #000 45%, transparent 72%)",
        }}
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center" }}>
        <Extruded text={last} size={letters} color={accent} depthColor={shade(accent, -0.5)} depth={14} style={{ display: "inline-block" }} />
      </div>

      <Figure data={data} src={data.photo2Url ?? data.photoUrl} cx={540} bottom={40} height={860} style={{ filter: "drop-shadow(0 25px 30px rgba(0,0,0,.35))" }} />
      <div style={{ position: "absolute", left: 300, right: 300, bottom: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(14px)" }} />

      {[56, 1024].map((x) => (
        <div key={x} style={{ position: "absolute", left: x, top: 240, width: 2, height: 620, background: accent, opacity: 0.8 }} />
      ))}

      <div style={{ position: "absolute", top: M - 20, right: M, background: INK, color: "#fff", fontFamily: CONDENSED, fontWeight: 800, fontSize: 30, padding: "6px 14px" }}>
        {postType === "matchday" || postType === "result" ? tag : <span style={{ color: accent }}>#{content.kicker.replace(/\s/g, "").toUpperCase()}</span>}
      </div>
      <AgencyLogo data={data} onLight height={42} style={{ position: "absolute", top: M - 14, left: M }} />

      {postType === "totw" ? (
        <div style={{ position: "absolute", left: M, bottom: M }}>
          <InsetPanel data={data} width={300} height={360} accent={accent} rotate={-3} />
        </div>
      ) : (
        <div style={{ position: "absolute", left: M, bottom: M }}>
          <Micro color={INK} style={{ marginBottom: 12, fontWeight: 700 }}>
            {postType === "matchday" ? info.teams : content.kicker}
          </Micro>
          <VersusCrests data={data} size={92} color={INK} gap={14} />
        </div>
      )}

      <div style={{ position: "absolute", right: M, bottom: M, textAlign: "right" }}>
        {postType === "matchday" ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 44, lineHeight: 1, color: accent }}>{info.when}</div>
            <Micro color={INK} style={{ marginTop: 8 }}>
              {info.where}
            </Micro>
          </>
        ) : (
          <Micro color={INK}>{content.subline}</Micro>
        )}
      </div>
    </div>
  );
}
