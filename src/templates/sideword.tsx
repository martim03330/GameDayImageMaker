/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const BAND = 400;
/** Anton cap height / advance width relative to the font size. */
const CAP = 0.735;
const ADV = 0.5;

function hue(hex: string): { h: number; s: number } {
  const f = hex.replace("#", "").padEnd(6, "0");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (!d) return { h: 0, s: 0 };
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s: d / (1 - Math.abs(max + min - 1)) };
}

/** The one short word the band shouts, per post type (a short custom kicker wins). */
function wordFor(data: RenderData): string {
  const { content, postType } = data;
  const k = content.kicker.trim().toUpperCase();
  if (postType === "goal") return k && !k.includes(" ") && k.length <= 7 ? (k.endsWith("!") ? k : `${k}!`) : "GOAL!";
  if (k && !k.includes(" ") && k.length <= 8) return k;
  switch (postType) {
    case "result": {
      const hg = Number(content.homeGoals ?? 0);
      const ag = Number(content.awayGoals ?? 0);
      const ours = (data.club?.name ?? "").toLowerCase();
      const home = content.home ?? (content.awayTeam ?? "").toLowerCase() !== ours;
      const diff = home ? hg - ag : ag - hg;
      return diff > 0 ? "WIN" : "FULL TIME";
    }
    case "potm":
      return "MVP";
    case "renewal":
      return "SIGNED";
    case "transfer":
      return "NEW SIGNING";
    case "stats":
      return "NUMBERS";
    case "matchday":
      return "MATCHDAY";
    default:
      return (k.split(" ")[0] || "NEYOD").slice(0, 8);
  }
}

/** Club-colour band with one giant vertical word, the player on a muted contrasting field overlapping it (Liverpool "GOAL!" / Sterling POTM). */
export function Sideword({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const band = shade(accent, -0.18);
  const bandDeep = shade(accent, -0.5);
  // Muted field in a contrasting temperature: steel blue behind warm clubs, warm stone behind cool ones.
  const { h } = hue(accent);
  const cool = h >= 150 && h <= 290;
  const field = cool ? "#9b968c" : "#4e6a86";
  const fieldDeep = cool ? "#4a4741" : "#233548";
  const word = wordFor(data);

  // Word geometry: fits the band length, then stretched across so it fills the band width.
  const top = 238;
  const bottom = 1300;
  const len = bottom - top;
  const size = Math.min(fitSize(word, len, 520, ADV), 520);
  const pad = 30;
  const stretch = Math.min(1.45, Math.max(1, (BAND - pad * 2) / (size * CAP)));
  const capW = size * CAP * stretch;
  const baseX = (BAND + capW) / 2; // after rotating -90°, the baseline sits on the right side of the letters

  // Player: face kept right of the band so the word never touches it.
  // Face never taller than ~2× its source pixels, nor bigger than a strong portrait crop.
  const faceCap = data.face ? Math.min(data.facePx > 0 ? 2.1 * data.facePx : 340, 340) / data.face[3] : 1200;
  const cutoutH = Math.max(880, Math.min(1220, faceCap));
  const box = figureBox(data, 730, 0, cutoutH);
  if (data.face) {
    const [fx, , fw] = data.face;
    const faceL = box.left + fx * box.width;
    const faceR = faceL + fw * box.width;
    if (faceL < BAND + 60) box.left += BAND + 60 - faceL;
    else if (faceR > CANVAS_W - 50) box.left -= faceR - (CANVAS_W - 50);
  }
  // Busts / side-cut photos are framed by the band edge; a natural silhouette may cross it.
  const bust = (data.cut?.left ?? 0) > 0 || (data.face?.[3] ?? 0) > 0.18;
  // A small (low-res) bust floats up, its cut chest dissolving into the info scrim.
  if (bust && (data.cut?.bottom ?? 0) > 0 && box.top > 260) box.top -= Math.min(box.top - 150, 250);
  const clip = bust ? { clipPath: `inset(-200px -200px -200px ${Math.max(0, BAND - box.left)}px)` } : undefined;
  const faceBottom = data.face ? box.top + (data.face[1] + data.face[3]) * box.height : 520;
  const infoTop = Math.max(faceBottom + 60, 1010);

  const textScale = params.textScale ?? 1;
  const last = content.lastName.toUpperCase();
  const lastSize = fitSize(last, 560, 96 * textScale);

  const rows = (() => {
    switch (postType) {
      case "goal":
      case "result":
      case "matchday":
        return null;
      case "renewal":
        return [{ value: content.until || "—", label: "Contract until" }];
      case "transfer":
        return null;
      default:
        return content.stats.slice(0, 3);
    }
  })();

  const crestImg = (src: string | null | undefined, size: number) =>
    src ? <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.35))" }} /> : null;

  const detail = (() => {
    if (postType === "goal" || postType === "result") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 22, justifyContent: "flex-end" }}>
          {crestImg(content.homeCrest, 62)}
          {/* Goal posts carry no score (blanked in compose): just "v" between the crests. */}
          {content.homeGoals || content.awayGoals ? (
            <div style={{ fontFamily: DISPLAY, fontSize: 70, lineHeight: 1, letterSpacing: "0.02em" }}>
              {content.homeGoals || 0}
              <span style={{ opacity: 0.55, margin: "0 12px" }}>–</span>
              {content.awayGoals || 0}
            </div>
          ) : (
            <div style={{ fontFamily: DISPLAY, fontSize: 44, lineHeight: 1, opacity: 0.7 }}>v</div>
          )}
          {crestImg(content.awayCrest, 62)}
        </div>
      );
    }
    if (postType === "matchday") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "flex-end" }}>
          <div style={{ textAlign: "right", fontFamily: CONDENSED, fontWeight: 700, fontSize: 30, lineHeight: 1.05, textTransform: "uppercase" }}>
            vs {opponentOf(data)}
            <div style={{ fontWeight: 500, fontSize: 24, opacity: 0.8, letterSpacing: "0.12em" }}>{[content.date, content.time].filter(Boolean).join(" · ")}</div>
          </div>
          {crestImg(content.home === false ? content.homeCrest : content.awayCrest, 62)}
        </div>
      );
    }
    if (postType === "renewal") {
      return (
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, justifyContent: "flex-end" }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.85 }}>Contract until</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 70, lineHeight: 1 }}>{content.until || "—"}</div>
        </div>
      );
    }
    if (postType === "transfer") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: "flex-end" }}>
          {data.fromClub && <Crest club={data.fromClub} size={62} />}
          {data.fromClub && <div style={{ fontFamily: SANS, fontSize: 30, opacity: 0.7 }}>→</div>}
          <Crest club={data.toClub ?? data.club} size={62} />
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 30, textTransform: "uppercase", maxWidth: 300, lineHeight: 1 }}>{(data.toClub ?? data.club)?.name}</div>
        </div>
      );
    }
    if (!rows?.length) {
      return <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 40, lineHeight: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}>{content.kicker}</div>;
    }
    return (
      <div style={{ display: "flex", gap: 34, justifyContent: "flex-end" }}>
        {(rows ?? []).map((r, i) => (
          <div key={i} style={{ textAlign: "right" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 64, lineHeight: 1 }}>{r.value}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: "0.24em", textTransform: "uppercase", opacity: 0.8, marginTop: 6 }}>{r.label}</div>
          </div>
        ))}
      </div>
    );
  })();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: field, color: "#fff" }}>
      {/* Muted field: soft studio light behind the head, falling off to the corners. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 68% 30%, ${shade(field, 0.18)} 0%, ${field} 45%, ${fieldDeep} 100%)` }} />

      {data.club?.crestUrl && (
        <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: BAND + 60, top: 170, width: 620, height: 620, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.06 }} />
      )}

      {/* The band. */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: BAND, background: `linear-gradient(to bottom, ${shade(band, 0.1)} 0%, ${band} 40%, ${bandDeep} 100%)` }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 40% at 20% 0%, rgba(255,255,255,.18), transparent 70%)" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,.12)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 36, display: "flex", justifyContent: "flex-start", paddingLeft: BAND / 2 - 64 }}>
        <Crest club={data.club} size={128} />
      </div>

      <svg data-bleed width={BAND} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0 }}>
        <text
          transform={`translate(${baseX} ${bottom}) rotate(-90) scale(1 ${stretch})`}
          fontFamily={DISPLAY}
          fontSize={size}
          fill="#fff"
          textLength={len}
          lengthAdjust="spacingAndGlyphs"
        >
          {word}
        </text>
      </svg>

      <GradedFigure data={data} box={box} grade={accent} gradeStrength={0.14} style={clip} />

      {/* Outline copy of the word over the player, so the letters read through the overlapping arm. */}
      <svg data-bleed width={BAND} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <text
          transform={`translate(${baseX} ${bottom}) rotate(-90) scale(1 ${stretch})`}
          fontFamily={DISPLAY}
          fontSize={size}
          fill="none"
          stroke="#fff"
          strokeWidth={2 / stretch}
          strokeOpacity={0.85}
          textLength={len}
          lengthAdjust="spacingAndGlyphs"
        >
          {word}
        </text>
      </svg>

      {/* Info block: bottom right, on a soft scrim, always below the face. */}
      <div style={{ position: "absolute", left: BAND, right: 0, top: infoTop - 160, bottom: 0, background: `linear-gradient(to bottom, transparent, ${fieldDeep}cc 55%, ${fieldDeep}f0)` }} />
      <div style={{ position: "absolute", right: 60, bottom: 58, width: 600, textAlign: "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: "0.34em", textTransform: "uppercase", opacity: 0.9 }}>{content.firstName}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: lastSize, lineHeight: 1, marginTop: 6, textTransform: "uppercase" }}>{last}</div>
        <div style={{ height: 2, background: "rgba(255,255,255,.85)", margin: "20px 0 18px" }} />
        {detail}
        <div style={{ height: 2, background: "rgba(255,255,255,.85)", margin: "18px 0 14px" }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: Math.min(15, 600 / (content.subline.length * 0.9)), letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.8, whiteSpace: "nowrap" }}>
          {content.subline}
        </div>
      </div>

      <AgencyLogo data={data} height={30} style={{ position: "absolute", right: 56, top: 52 }} />
      <Film strength={0.7} />
    </div>
  );
}
