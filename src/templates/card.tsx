/* eslint-disable @next/next/no-img-element */
import { AgencyLogo, Background, Canvas, CONDENSED, DISPLAY, factRows, fitSize, Kicker, M, positionAbbr, SANS } from "./shared";
import type { RenderData } from "./types";

const CARD_W = 640;
const CARD_H = 900;
const CARD_X = (1080 - CARD_W) / 2;
const CARD_Y = 230;
const SHIELD = "polygon(10% 0, 90% 0, 100% 6%, 100% 88%, 50% 100%, 0 88%, 0 6%)";

/** EA FC "Ultimate Team" card in club colours. */
export function Card({ data }: { data: RenderData }) {
  const { params, content, photoUrl } = data;
  const facts = factRows(data).filter((f) => f.value.length <= 5);
  const rating = content.stats.find((s) => /nota/i.test(s.label))?.value;
  const top = rating ?? (data.player.number ? data.player.number : "");
  const last = content.lastName.toUpperCase();

  return (
    <Canvas params={params}>
      <Background data={data} />
      {data.club?.crestUrl && (
        <img
          src={data.club.crestUrl}
          alt=""
          style={{ position: "absolute", left: 90, top: 200, width: 900, height: 900, objectFit: "contain", opacity: 0.06, filter: "grayscale(1)" }}
        />
      )}

      <div style={{ position: "absolute", top: M, left: 0, right: 0, textAlign: "center" }}>
        <Kicker text={content.kicker} params={params} fontSize={46} />
      </div>
      <AgencyLogo data={data} height={40} style={{ position: "absolute", top: M + 14, right: M }} />

      <div style={{ position: "absolute", left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H, filter: "drop-shadow(0 40px 60px rgba(0,0,0,.6))" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: SHIELD,
            background: `linear-gradient(140deg, #16181d 0%, ${params.primary} 38%, color-mix(in srgb, ${params.primary} 70%, #fff) 50%, ${params.primary} 62%, #0e1014 100%)`,
          }}
        >
          <div style={{ position: "absolute", inset: 10, clipPath: SHIELD, border: `3px solid color-mix(in srgb, ${params.accent} 80%, #fff)`, opacity: 0.8 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.22) 45%, transparent 60%)",
              mixBlendMode: "overlay",
            }}
          />
          {photoUrl && (
            <img
              src={photoUrl}
              alt=""
              style={{
                position: "absolute",
                left: 60 + (params.playerX ?? 0),
                top: 40 + (params.playerY ?? 0),
                width: CARD_W - 60,
                height: 560,
                objectFit: "cover",
                objectPosition: "center top",
                transform: `scale(${params.playerScale ?? 1})`,
                transformOrigin: "center top",
                WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent)",
                maskImage: "linear-gradient(to bottom, #000 78%, transparent)",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,.4))",
              }}
            />
          )}
        </div>

        <div style={{ position: "absolute", left: 64, top: 70, textAlign: "center", color: params.text }}>
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 110, lineHeight: 0.9 }}>{top}</div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 40, letterSpacing: 2 }}>{positionAbbr(data.player.position)}</div>
          {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 70, height: 70, objectFit: "contain", marginTop: 14 }} />}
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", color: params.text }}>
          <div style={{ fontFamily: DISPLAY, fontSize: fitSize(last, CARD_W - 120, 76) * (params.textScale ?? 1), lineHeight: 1, letterSpacing: 1 }}>{last}</div>
          <div style={{ margin: "14px auto 0", width: CARD_W - 160, height: 2, background: `color-mix(in srgb, ${params.text} 35%, transparent)` }} />
          <div style={{ display: "flex", justifyContent: "center", gap: 34, marginTop: 16 }}>
            {facts.slice(0, 4).map((f, i) => (
              <div key={i} style={{ minWidth: 70 }}>
                <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 50, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{f.value}</div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.85 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {content.subline && (
        <div
          style={{
            position: "absolute",
            left: M,
            right: M,
            bottom: M + 6,
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {content.subline}
        </div>
      )}
    </Canvas>
  );
}
