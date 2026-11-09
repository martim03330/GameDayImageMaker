import { vivid } from "@/lib/color";
import { INK, matchInfo, Micro, Paper, TornSheet, VersusCrests } from "./kit";
import { AgencyLogo, DISPLAY, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Minimal crest-vs-crest matchday on paper with torn club-colour edges (Stuttgart vs Köln). Works without a photo. */
export function Crests({ data }: { data: RenderData }) {
  const { params, content } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const info = matchInfo(data);
  const title = content.kicker.toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: INK }}>
      <Paper />
      <TornSheet x={-40} y={-80} w={1160} h={240} color={base} rotate={-3} seed={2} edges={{ top: false, bottom: true }}>
        <div />
      </TornSheet>
      <TornSheet x={-40} y={1180} w={1160} h={260} color={base} rotate={-2} seed={6} edges={{ top: true, bottom: false }}>
        <div />
      </TornSheet>

      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: fitSize(title, 800, 120) * (params.textScale ?? 1), lineHeight: 1 }}>{title}</div>
        <div style={{ marginTop: 80 }}>
          <VersusCrests data={data} size={250} color={INK} gap={50} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 64, color: base, marginTop: 90, lineHeight: 1 }}>{info.when}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: base, marginTop: 12 }}>{info.where}</div>
        <Micro color={INK} style={{ marginTop: 24, opacity: 0.6 }}>
          {[content.subline, `${content.firstName} ${content.lastName}`].filter(Boolean).join("  ·  ")}
        </Micro>
      </div>

      <AgencyLogo data={data} height={40} style={{ position: "absolute", right: 60, bottom: 50 }} />
    </div>
  );
}
