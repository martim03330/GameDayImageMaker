import { shade, vivid } from "@/lib/color";
import { Figure, INK, InsetPanel, matchInfo, Micro, Paper, PAPER, TornSheet, VersusCrests } from "./kit";
import { AgencyLogo, Crest, DISPLAY, factRows, M, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Torn paper layers: club colour, dark panel behind the player, paper band with the info (RB Leipzig / Stuttgart). */
export function Torn({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const info = matchInfo(data);
  const facts = factRows(data);
  const px = params.side === "left" ? 430 : 600;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#fff" }}>
      <Paper color={base} strength={1.4} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 40%, ${shade(base, -0.35)} 100%)` }} />

      <TornSheet x={params.side === "left" ? 150 : 230} y={150} w={700} h={760} color="#16171b" rotate={params.side === "left" ? -2 : 2} seed={11} edges={{ top: true, bottom: true, left: true, right: true }}>
        {data.club?.crestUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.club.crestUrl} alt="" style={{ position: "absolute", right: 30, top: 30, width: 160, opacity: 0.12, filter: "grayscale(1) brightness(3)" }} />
        )}
      </TornSheet>

      <Figure data={data} cx={px} bottom={330} height={840} style={{ filter: "drop-shadow(0 25px 30px rgba(0,0,0,.45))" }} />

      <TornSheet x={-30} y={900} w={1140} h={520} color={PAPER} seed={23} edges={{ top: true, bottom: false }} shadow>
        <div />
      </TornSheet>

      {data.photo2Url && postType !== "totw" && (
        <Figure data={{ ...data, params: { ...params, playerX: 0, playerY: 0, playerScale: 1 } }} src={data.photo2Url} cx={params.side === "left" ? 880 : 200} bottom={40} height={430} style={{ filter: "grayscale(1) contrast(1.1)" }} />
      )}

      <AgencyLogo data={data} height={46} style={{ position: "absolute", top: M - 6, left: M }} />
      <Micro color="#fff" style={{ position: "absolute", top: M + 6, right: M, opacity: 0.85 }}>
        {content.subline}
      </Micro>

      <div style={{ position: "absolute", left: M, bottom: M, color: INK, maxWidth: 560 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 62, lineHeight: 0.95, textTransform: "uppercase" }}>
          {postType === "matchday" ? content.homeTeam : content.firstName}
          <br />
          <span style={{ color: base }}>{postType === "matchday" ? content.awayTeam : content.lastName}</span>
        </div>
        {postType === "matchday" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24 }}>{content.date}</span>
            <span style={{ background: base, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 22, padding: "3px 10px" }}>{content.time || "--:--"}</span>
          </div>
        ) : (
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: "0.2em", marginTop: 14, color: base }}>{content.kicker}</div>
        )}
        <Micro color={INK} style={{ marginTop: 14, opacity: 0.7 }}>
          {postType === "matchday" ? info.where : facts.map((f) => `${f.value} ${f.label}`).join("  ·  ")}
        </Micro>
      </div>

      {postType === "totw" ? (
        <div style={{ position: "absolute", right: M, bottom: M - 10 }}>
          <InsetPanel data={data} width={300} height={330} accent={base} rotate={3} />
        </div>
      ) : postType === "matchday" ? (
        <div style={{ position: "absolute", right: M, bottom: M + 280 }}>
          <VersusCrests data={data} size={84} color="#fff" gap={12} />
        </div>
      ) : (
        <Crest club={data.club} size={96} style={{ position: "absolute", left: M, top: 930 }} />
      )}
    </div>
  );
}
