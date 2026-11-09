/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, CONDENSED, Crest, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** The little registration marks these club posters put in every corner. */
function Marks({ color }: { color: string }) {
  const s = { position: "absolute" as const, fontFamily: SANS, fontWeight: 700, fontSize: 26, color, opacity: 0.9 };
  return (
    <>
      <div style={{ ...s, left: 44, top: 40 }}>↘</div>
      <div style={{ ...s, left: "50%", top: 40, transform: "translateX(-50%)", fontSize: 22 }}>+</div>
      <div style={{ ...s, right: 44, bottom: 150, fontSize: 18, letterSpacing: "0.2em" }} />
    </>
  );
}

/**
 * Club broadcast poster: one enormous condensed headline the players stand in front of, corner marks,
 * and a technical bottom bar — crests in bracket frames, the score or kick-off, the scorers
 * (Manchester City "FULL-TIME" / "MATCHDAY" graphics).
 */
export function Broadcast({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 41);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.55);
  const scene = (data.club?.stadiumImages ?? [])[0] ?? data.bgPhotoUrl;
  const own = !(data.club?.stadiumImages ?? []).length;
  const light = r() < 0.4;
  const ink = light ? shade(accent, -0.75) : "#ffffff";

  const title = (postType === "result" ? "FULL-TIME" : content.kicker).toUpperCase();
  const size = Math.min(230, 1030 / (title.length * 0.42));
  const aspect = data.photoAspect ?? 0.6;
  const height = 1180 * (params.playerScale ?? 1);
  const width = height * aspect;
  const score = content.homeGoals != null && String(content.homeGoals) !== "" ? `${content.homeGoals} \u2013 ${content.awayGoals}` : "";
  const scorers = content.stats.slice(0, 3);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: light ? shade(accent, 0.75) : deep, color: ink }}>
      {scene && <img src={scene} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: light ? 0.25 : 0.55, filter: `saturate(.9) contrast(1.05)${own ? " blur(24px)" : ""}` }} />}
      <div style={{ position: "absolute", inset: 0, background: light ? `linear-gradient(to bottom, ${shade(accent, 0.8)}dd, ${shade(accent, 0.6)}aa)` : `linear-gradient(to bottom, ${deep}bb, ${shade(accent, -0.35)}66 45%, ${deep}ee)` }} />
      {/* Fine technical grid, like a broadcast overlay. */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: `linear-gradient(${ink} 1px, transparent 1px), linear-gradient(90deg, ${ink} 1px, transparent 1px)`, backgroundSize: "108px 108px" }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center", fontFamily: CONDENSED, fontWeight: 900, fontSize: size, lineHeight: 0.86, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: ink }}>
        {title}
      </div>

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: 540 - width / 2 + (params.playerX ?? 0),
            bottom: 150 - (params.playerY ?? 0),
            width,
            height,
            maxWidth: "none",
            filter: "contrast(1.06) drop-shadow(0 30px 40px rgba(0,0,0,.4))",
            ...cutMask(data.cut),
          }}
        />
      )}
      <Marks color={ink} />
      <Crest club={data.club} size={54} style={{ position: "absolute", right: 44, top: 36 }} />

      {/* Technical bar: scorers on the left, crests and the score (or kick-off) on the right. */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 58, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 30 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, letterSpacing: "0.16em", lineHeight: 1.8, textTransform: "uppercase", opacity: 0.95 }}>
          {scorers.length
            ? scorers.map((s, i) => (
                <div key={i}>
                  {s.label} {s.value}
                </div>
              ))
            : [content.date, content.time].filter(Boolean).map((t, i) => <div key={i}>{t}</div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {[content.homeCrest ?? data.club?.crestUrl, content.awayCrest].filter(Boolean).map((c, i) => (
            <div key={i} style={{ position: "relative", width: 76, height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* bracket frame */}
              <svg width={76} height={76} style={{ position: "absolute", inset: 0 }}>
                {[
                  "M2 20 L2 2 L20 2",
                  "M56 2 L74 2 L74 20",
                  "M74 56 L74 74 L56 74",
                  "M20 74 L2 74 L2 56",
                ].map((d, k) => (
                  <path key={k} d={d} fill="none" stroke={ink} strokeWidth={2} opacity={0.8} />
                ))}
              </svg>
              <img src={c!} alt="" style={{ width: 50, height: 50, objectFit: "contain" }} />
            </div>
          ))}
          {score && <div style={{ fontFamily: CONDENSED, fontWeight: 900, fontSize: 64, letterSpacing: "0.04em", lineHeight: 1 }}>{score}</div>}
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 26, fontFamily: SANS, fontWeight: 600, fontSize: 13, letterSpacing: "0.26em", opacity: 0.7, textTransform: "uppercase" }}>
        {[content.firstName, content.lastName].join(" ")} · {content.subline}
      </div>
      <AgencyLogo data={data} onLight={light} height={24} style={{ position: "absolute", right: 60, bottom: 24, opacity: 0.9 }} />
      <Film strength={0.6} />
    </div>
  );
}
