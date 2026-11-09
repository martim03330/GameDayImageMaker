/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng, SCRIPT } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Faint topographic contour lines, the quiet texture these posters use instead of a flat background. */
function Contours({ color, seed }: { color: string; seed: number }) {
  const r = rng(seed);
  const lines = Array.from({ length: 9 }, (_, i) => {
    const y = 120 + i * 150 + r() * 40;
    const amp = 40 + r() * 70;
    const pts = Array.from({ length: 7 }, (_, k) => `${(k * CANVAS_W) / 6} ${y + Math.sin(k * 1.3 + i) * amp}`);
    return `M ${pts[0]} C ${pts.slice(1).join(" ")}`;
  });
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, opacity: 0.16 }}>
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={1.5} />
      ))}
    </svg>
  );
}

/**
 * Quiet, expensive matchday poster: the title in a big editorial serif with the second word
 * handwritten across it, the player looking up out of the dark, and one calm information bar with
 * both crests at the bottom (Brighton vs Manchester City "MATCHday" poster).
 */
export function MatchSerif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 21);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const ink = shade(accent, -0.82);
  const cream = "#efe9df";
  const scene = (data.club?.stadiumImages ?? [])[0] ?? data.bgPhotoUrl;
  const own = !(data.club?.stadiumImages ?? []).length;

  // "MATCHDAY" → "MATCH" + "day"; any other title keeps its last word for the handwriting.
  const words = content.kicker.trim().split(/\s+/);
  const [head, tail] = words.length > 1 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : content.kicker.length > 6 ? [content.kicker.slice(0, -3), content.kicker.slice(-3)] : [content.kicker, ""];
  const headSize = Math.min(250, 1000 / Math.max(3, head.length * 0.58));

  const teams = [content.homeTeam, content.awayTeam].filter(Boolean).join(" vs ").toUpperCase();
  const league = (content.subline.split("·")[0] ?? "").trim().toUpperCase();
  const aspect = data.photoAspect ?? 0.6;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // Scaled from the face: head in the middle of the poster, body fading into the dark.
  const h = (300 * (params.playerScale ?? 1)) / face[3];
  const w = h * aspect;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ink, color: cream }}>
      {scene && <img src={scene} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22, filter: `grayscale(.7) blur(${own ? 30 : 2}px)` }} />}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 42%, ${shade(accent, -0.6)}88, ${ink} 75%)` }} />
      <Contours color={cream} seed={params.seed ?? 21} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 64, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: "0.34em" }}>{league}</div>
      {teams && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 116, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: Math.min(34, 900 / (teams.length * 0.5)), letterSpacing: "0.06em", lineHeight: 1.25 }}>
          {teams}
        </div>
      )}

      {/* Player, cut off softly at the bottom so he rises out of the dark. */}
      {data.photoUrl && (
        <div
          style={{
            position: "absolute",
            left: 540 - w * (face[0] + face[2] / 2) + (params.playerX ?? 0),
            top: 470 - h * face[1] + (params.playerY ?? 0),
            width: w,
            height: h,
            WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 88%)",
            maskImage: "linear-gradient(to bottom, #000 55%, transparent 88%)",
          }}
        >
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", filter: "contrast(1.05) brightness(.92) saturate(.9)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The title, over the player's forehead: serif word, handwritten word across it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: DMSERIF, fontSize: headSize, lineHeight: 0.95, letterSpacing: "0.01em", color: cream, textShadow: `0 20px 60px ${ink}` }}>
        {head.toUpperCase()}
      </div>
      {tail && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 210 + headSize * 0.42,
            textAlign: "center",
            fontFamily: SCRIPT,
            fontSize: headSize * 1.15,
            lineHeight: 1,
            color: shade(accent, 0.35),
            transform: `rotate(${-2 - r() * 3}deg)`,
          }}
        >
          {tail.toLowerCase()}
        </div>
      )}

      {/* One calm bar: date, the two crests, kick-off. */}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", lineHeight: 1.3, textTransform: "uppercase", flex: 1 }}>
          {/* "20 SEP" → day on top, month underneath. */}
          {(content.date || "").split(" ")[0]}
          <br />
          {(content.date || "").split(" ").slice(1).join(" ")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {[content.homeCrest ?? data.club?.crestUrl, content.awayCrest].filter(Boolean).map((c, i) => (
            <div key={i} style={{ width: 92, height: 92, background: cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={c!} alt="" style={{ width: 66, height: 66, objectFit: "contain" }} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", lineHeight: 1.3, textAlign: "right", textTransform: "uppercase", flex: 1 }}>
          {content.time || ""}
          <br />
          <span style={{ fontWeight: 500, fontSize: 17, opacity: 0.8 }}>{(content.venue || data.club?.stadium || "").slice(0, 26)}</span>
        </div>
      </div>
      <AgencyLogo data={data} height={26} style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", opacity: 0.85 }} />
      <Film strength={0.7} />
    </div>
  );
}
