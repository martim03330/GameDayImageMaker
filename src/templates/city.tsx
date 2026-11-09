/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { FaceCrop, Figure, INK, Micro, Paper, PAPER, SCRIPT, TornSheet } from "./kit";
import { AgencyLogo, CONDENSED, DISPLAY, factRows, fitSize, M } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** City photo revealed through torn paper strips, big face, script name + stats (Cleveland Cavaliers "Defend the Land"). */
export function City({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const base = params.primary === "#10131c" ? "#2a1418" : params.primary;
  const glow = vivid(params.accent.toLowerCase() === "#ffffff" ? base : params.accent);
  const cityImg = data.club?.cityImageUrl;
  const facts = factRows(data);
  const statLine = facts
    .slice(0, 3)
    .map((f) => `${f.value} ${f.label}`)
    .join("  ");
  const tint = (img: string | null | undefined) =>
    img ? (
      <>
        <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.2) brightness(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: glow, mixBlendMode: "multiply", opacity: 0.85 }} />
      </>
    ) : (
      <div style={{ position: "absolute", inset: 0, background: glow }} />
    );
  const score = postType === "result" || postType === "goal";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: "#fff" }}>
      <Paper color={shade(base, -0.45)} strength={1.3} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 70% 30%, color-mix(in srgb, ${base} 70%, transparent), transparent 75%)` }} />

      <TornSheet x={-60} y={150} w={760} h={330} color={PAPER} rotate={-7} seed={4}>
        <div style={{ position: "absolute", inset: 10 }}>{tint(cityImg)}</div>
      </TornSheet>
      <TornSheet x={520} y={600} w={640} h={250} color={PAPER} rotate={-7} seed={8}>
        <div style={{ position: "absolute", inset: 10 }}>{tint(cityImg ?? data.bgPhotoUrl)}</div>
      </TornSheet>

      <FaceCrop
        data={data}
        cx={760}
        cy={330}
        faceWidth={360}
        imgStyle={{ filter: "contrast(1.05)" }}
        style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 75%)", maskImage: "linear-gradient(to bottom, #000 50%, transparent 75%)", opacity: 0.95 }}
      />

      <Figure data={data} src={data.photo2Url ?? data.photoUrl} cx={params.side === "right" ? 700 : 380} bottom={250} height={900} style={{ filter: "drop-shadow(0 25px 30px rgba(0,0,0,.5))" }} />

      <div style={{ position: "absolute", left: params.side === "right" ? M : 640, top: 860, transform: "rotate(-4deg)" }}>
        <div style={{ fontFamily: SCRIPT, fontSize: 96, lineHeight: 1, color: glow, whiteSpace: "nowrap" }}>{content.lastName}</div>
        <Micro color="#fff" style={{ fontSize: 18, marginTop: 4 }}>
          {statLine}
        </Micro>
      </div>

      {data.club?.name && (
        <Micro color="#fff" style={{ position: "absolute", left: 60, top: 520, transform: "rotate(-7deg)", opacity: 0.9 }}>
          {data.club.name}
        </Micro>
      )}

      <TornSheet x={-30} y={1120} w={1140} h={300} color={PAPER} seed={15} edges={{ top: true, bottom: false }}>
        <div />
      </TornSheet>
      <AgencyLogo data={data} height={40} style={{ position: "absolute", top: M - 10, left: M }} />

      <div style={{ position: "absolute", left: M, right: M, bottom: 60, display: "flex", alignItems: "center", justifyContent: "space-between", color: INK }}>
        {score ? (
          <>
            {content.homeCrest ? <img src={content.homeCrest} alt="" style={{ height: 90 }} /> : <span />}
            <div style={{ fontFamily: DISPLAY, fontSize: 96, color: base, lineHeight: 1 }}>{content.homeGoals ?? 0}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 44, lineHeight: 1 }}>FINAL</div>
              <Micro color={INK}>{content.subline}</Micro>
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 96, color: base, lineHeight: 1 }}>{content.awayGoals ?? 0}</div>
            {content.awayCrest ? <img src={content.awayCrest} alt="" style={{ height: 90 }} /> : <span />}
          </>
        ) : (
          <>
            <div style={{ fontFamily: DISPLAY, fontSize: fitSize(content.kicker, 620, 90), lineHeight: 1, color: base }}>{content.kicker}</div>
            <div style={{ textAlign: "right", fontFamily: CONDENSED, fontWeight: 800, fontSize: 30 }}>
              {content.firstName} {content.lastName}
              <Micro color={INK} style={{ marginTop: 6 }}>
                {content.subline}
              </Micro>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
