import { AgencyLogo, Background, Canvas, ContentBlock, Crest, DISPLAY, fitSize, Kicker, PlayerFigure, Subline } from "./shared";
import type { RenderData } from "./types";

/** Stacked name + kicker on one side, big player cutout on the other (Moisés Conceição style). */
export function Spotlight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const playerRight = params.side === "right";
  const colW = 540;
  const colLeft = playerRight ? 70 : 1080 - 70 - colW;
  const align = playerRight ? "left" : "right";

  const first = content.firstName.toUpperCase();
  const last = content.lastName.toUpperCase();
  const ts = params.textScale ?? 1;
  const firstSize = fitSize(first, colW, 230) * ts;
  const lastSize = fitSize(last, colW, 210) * ts;

  return (
    <Canvas params={params}>
      <Background data={data} />

      <PlayerFigure data={data} box={{ left: -200, width: 1480, top: -160 }} ghost />
      <PlayerFigure data={data} box={{ left: playerRight ? 400 : -40, width: 720, top: 110 }} />

      <AgencyLogo
        data={data}
        height={64}
        style={{ position: "absolute", top: 70, [playerRight ? "right" : "left"]: 90 }}
      />

      <div style={{ position: "absolute", left: colLeft, width: colW, top: 60, textAlign: align }}>
        <Crest club={data.club} size={170} style={{ display: "inline-block" }} />

        <div style={{ marginTop: 26, fontFamily: DISPLAY, lineHeight: 0.88, textShadow: "0 12px 40px rgba(0,0,0,.45)" }}>
          <div style={{ fontSize: firstSize, color: params.text }}>{first}</div>
          <div style={{ fontSize: lastSize, color: params.accent }}>{last}</div>
        </div>

        <div style={{ marginTop: 30 }}>
          <Kicker text={content.kicker} params={params} fontSize={52} />
        </div>

        {content.subline && (
          <div style={{ marginTop: 22 }}>
            <Subline text={content.subline} width={colW} color={params.text} />
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: colLeft, bottom: 50, transform: `rotate(${params.insetTilt}deg)` }}>
        <ContentBlock data={data} width={colW} height={430} />
      </div>
    </Canvas>
  );
}
