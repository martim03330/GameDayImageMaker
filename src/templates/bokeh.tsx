/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

const WHITE = "#ffffff";
/** The night-stadium grade: deep teal, whatever the club colour (it only tints some of the lights). */
const TEAL = "#0d4750";
const TEAL_DEEP = "#041619";

/** Face height on the canvas: a close portrait, head and shoulders filling the lower two thirds. */
const FACE_H: Record<string, number> = { chest: 330, waist: 280, knees: 240, full: 210 };

/** Archivo Black caps: average width relative to the font size. */
const WIDE_W = 0.78;

type Disc = { x: number; y: number; r: number; color: string; a: number; blur: number; ring: boolean };

/** Out-of-focus floodlights: big soft discs with a brighter rim, as a long lens renders them. */
function lights(seed: number, tint: string): Disc[] {
  const r = rng(seed);
  const warm = "#fff4dc";
  const cool = "#bff3f4";
  const discs: Disc[] = [];
  // Two floodlight banks high on either side: a wide glow, then two rows of lamps.
  for (const side of [0, 1]) {
    const cx = side ? 800 + r() * 140 : 140 + r() * 140;
    const cy = 140 + r() * 110;
    discs.push({ x: cx, y: cy, r: 280, color: cool, a: 0.22, blur: 30, ring: false });
    for (let i = 0; i < 10; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      discs.push({ x: cx + (col - 2) * 50 + (r() - 0.5) * 14, y: cy + (row - 0.5) * 50 + (r() - 0.5) * 10, r: 26 + r() * 10, color: r() < 0.75 ? warm : cool, a: 0.55 + r() * 0.35, blur: 2.5, ring: true });
    }
  }
  // Large soft discs scattered across the frame (fewer at the bottom, where the player is).
  for (let i = 0; i < 18; i++) {
    const y = Math.pow(r(), 1.4) * 1050;
    discs.push({ x: r() * CANVAS_W, y, r: 70 + r() * 170, color: r() < 0.3 ? tint : r() < 0.65 ? cool : warm, a: 0.07 + r() * 0.16, blur: 6 + r() * 10, ring: r() < 0.5 });
  }
  // The lit stand: a row of small lights along a line across the middle.
  const standY = 520 + r() * 60;
  for (let i = 0; i < 26; i++) {
    discs.push({ x: (i / 25) * CANVAS_W + (r() - 0.5) * 40, y: standY + (r() - 0.5) * 40, r: 14 + r() * 18, color: r() < 0.5 ? warm : cool, a: 0.25 + r() * 0.3, blur: 2, ring: false });
  }
  return discs;
}

const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${n[0]},${n[1]},${n[2]},${a.toFixed(3)})`;
};

function placeByFace(data: RenderData, faceX: number, faceTop: number, faceH: number) {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const h = Math.max(faceH / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return {
    left: faceX - w * (face[0] + face[2] / 2) + (data.params.playerX ?? 0),
    top: faceTop - h * face[1] + (data.params.playerY ?? 0),
    width: w,
    height: h,
  };
}

/** Balanced line break for the title: one line when short, otherwise two lines of similar length. */
function titleLines(text: string): string[] {
  const t = text.toUpperCase().trim();
  const words = t.split(/\s+/).filter(Boolean);
  if (t.length <= 10 || words.length < 2) return [t];
  let best = [t];
  let bestLen = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const m = Math.max(a.length, b.length);
    if (m < bestLen) {
      bestLen = m;
      best = [a, b];
    }
  }
  return best;
}

/**
 * Cinematic welcome (Brentford "WELCOME THOMAS FRANK"): a teal night stadium thrown out of focus into
 * big floodlight discs, the person as a close portrait in the lower two thirds, graded to match; small
 * crest, a heavy italic wide title and the name in spaced caps, centred at the top.
 */
export function Bokeh({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 31;
  const r = rng(seed);
  const tint = shade(vivid(params.primary === "#10131c" ? params.accent : params.primary), 0.25);
  const ts = params.textScale ?? 1;
  const scene = params.scene ?? data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? data.bgPhotoUrl;

  // ---- title block ----
  const crest = data.club?.crestUrl;
  const lines = titleLines(content.kicker);
  const longest = Math.max(...lines.map((l) => l.length), 4);
  const titleSize = Math.min(150, 900 / (longest * WIDE_W)) * ts;
  const crestTop = 64;
  const titleTop = crest ? 170 : 110;
  const titleH = titleSize * 0.92 * lines.length;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min(34, 860 / Math.max(1, name.length * 0.95));
  const nameTop = titleTop + titleH + 26;
  const blockBottom = nameTop + nameSize;

  // ---- the portrait ----
  const want = (FACE_H[params.framing ?? "chest"] ?? 280) * (params.playerScale ?? 1);
  // A close portrait magnifies: stay within what the photo can hold (≈3.6× its own face pixels in the 2× export).
  const faceH = data.facePx > 0 ? Math.min(want, Math.max(200, data.facePx * 1.8)) : want;
  const faceX = 540 + (params.side === "left" ? -1 : 1) * (r() - 0.3) * 60;
  // Hair (≈0.6 face heights above the face box) clears the name with a margin.
  const faceTop = Math.max(blockBottom + 60 + faceH * 0.6, 560);
  const box = placeByFace(data, faceX, faceTop, faceH);

  // ---- bottom line ----
  const c = content;
  const crests = [c.homeCrest ?? (postType === "matchday" ? data.club?.crestUrl : null), c.awayCrest].filter(Boolean) as string[];
  const info =
    postType === "matchday"
      ? [c.date, c.time].filter(Boolean).join("  ·  ")
      : postType === "renewal"
        ? c.until ? `Until ${c.until}` : ""
        : postType === "transfer"
          ? data.fromClub ? `From ${data.fromClub.name}` : (data.toClub ?? data.club)?.name ?? ""
          : c.subline;

  const discs = lights(seed, tint);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: TEAL_DEEP, color: WHITE }}>
      {/* The ground, far out of focus and graded teal. */}
      {scene && (
        <img
          src={scene}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: CANVAS_H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(34px) brightness(.75) contrast(1.1)", opacity: 0.8 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: TEAL, mixBlendMode: "color", opacity: 0.9 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 60% at 50% 32%, ${rgba(TEAL, 0.25)}, ${rgba(TEAL_DEEP, 0.75)} 100%)` }} />
      {/* The lit stand: a soft bright band across the middle. */}
      <div style={{ position: "absolute", left: -100, right: -100, top: 500, height: 150, background: "linear-gradient(to bottom, transparent, rgba(160,230,230,.16) 45%, rgba(160,230,230,.08) 60%, transparent)", filter: "blur(18px)" }} />

      {/* Floodlight bokeh. */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        {discs.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x - d.r,
              top: d.y - d.r,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: "50%",
              background: d.ring
                ? `radial-gradient(circle, ${rgba(d.color, d.a * 0.75)} 0%, ${rgba(d.color, d.a * 0.8)} 58%, ${rgba(d.color, d.a)} 67%, ${rgba(d.color, 0)} 72%)`
                : `radial-gradient(circle, ${rgba(d.color, d.a)} 0%, ${rgba(d.color, d.a * 0.6)} 45%, ${rgba(d.color, 0)} 70%)`,
              filter: `blur(${d.blur}px)`,
            }}
          />
        ))}
      </div>
      {/* Dark vignette, deeper at the bottom. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 85% at 50% 40%, transparent 50%, rgba(2,10,12,.7) 100%)" }} />

      {/* The portrait, graded into the scene: cooler, a little softer in contrast, a cool rim. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 30px rgba(120,220,230,.18))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", ...box, maxWidth: "none", filter: "contrast(1.06) saturate(.8) brightness(.94)", ...cutMask(data.cut) }}
          />
          <div
            style={{
              position: "absolute",
              ...box,
              background: `linear-gradient(to bottom, rgba(120,210,220,.35), rgba(13,71,80,.55) 60%, rgba(4,22,25,.8))`,
              mixBlendMode: "soft-light",
              WebkitMaskImage: `url(${maskUrl(data.photoUrl)})`,
              maskImage: `url(${maskUrl(data.photoUrl)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
        </div>
      )}
      {/* The bottom sinks into the dark, so the info reads over the chest. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 480, background: `linear-gradient(to bottom, transparent, ${rgba(TEAL_DEEP, 0.6)} 50%, ${rgba(TEAL_DEEP, 0.96)} 88%)` }} />

      {/* Title block. */}
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 540 - 42, top: crestTop, width: 84, height: 84, objectFit: "contain", filter: "drop-shadow(0 6px 16px rgba(0,0,0,.45))" }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center" }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: ARCHIVO_BLACK,
              fontSize: titleSize,
              lineHeight: 0.92,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              transform: "skewX(-11deg)",
              textShadow: "0 8px 40px rgba(0,0,0,.35)",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.32em", paddingLeft: "0.32em", whiteSpace: "nowrap", textShadow: "0 4px 20px rgba(0,0,0,.5)" }}>
        {name}
      </div>

      {/* Bottom: crests and date for games, otherwise one quiet line. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {crests.map((u, i) => (
              <img key={i} src={u} alt="" style={{ width: 66, height: 66, objectFit: "contain", filter: "drop-shadow(0 4px 14px rgba(0,0,0,.5))" }} />
            ))}
          </div>
        )}
        {info && (
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: Math.min(28, 900 / (info.length * 0.62)), letterSpacing: "0.26em", paddingLeft: "0.26em", whiteSpace: "nowrap", opacity: 0.95, textShadow: "0 2px 14px rgba(0,0,0,.7)" }}>{info.toUpperCase()}</div>
        )}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: 0, right: 0, margin: "0 auto", bottom: 42, opacity: 0.8, color: WHITE, textAlign: "center", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }} />
      <Film strength={0.7} />
    </div>
  );
}
