/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { twelveHour } from "./motion";
import { competitionOf, crestsOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, sentence } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

const WHITE = "#ffffff";
const TIGHT = "0 2px 12px rgba(0,0,0,.45)";

/** Studio portrait: close, waist / chest up. */
const FACE_H: Record<string, number> = { chest: 250, waist: 205, knees: 165, full: 140 };

/** DM Serif Display, mixed case: average advance relative to the size. */
const SERIF_MIX = 0.5;

const maskOf = (url: string): CSSProperties => ({
  WebkitMaskImage: `url(${maskUrl(url)})`,
  maskImage: `url(${maskUrl(url)})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
});

/** The kicker in one line, or two balanced ones when it is long ("Player of / the month"). */
function titleLines(kicker: string): string[] {
  const t = sentence(kicker.replace(/’/g, "'").trim()).replace(/\bmvp\b/i, "MVP");
  const words = t.split(/\s+/);
  if (t.length <= 13 || words.length < 2) return [t];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [best, diff] = [i, d];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Boston Celtics "Gameday" studio portrait. Two lightings chosen by the seed: a solid club-colour backdrop
 * with a soft spotlight, or a near-black set lit by one coloured light that streaks across the face. The
 * player waist / chest up with a translucent motion ghost (flash + slow shutter: a second copy offset to
 * the side, smeared horizontally); bottom-left a big sentence-case serif title (gold to white on the dark
 * set), then the crests as white marks, a thin divider and two lines of condensed caps; the agency mark small.
 */
export function Studio({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 17;
  const r = rng(seed);
  const club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const dark = params.primary === "#10131c" || r() < 0.5;
  const toRight = params.side !== "left"; // the ghost streams to this side, the text sits on the other
  const dir = toRight ? 1 : -1;
  const id = `st-${seed % 997}`;
  // Backdrop colour: the club's, but never neon or so light the white type dies on it.
  let back = shade(club, -0.12);
  if (luminance(back) > 0.3) back = shade(club, -0.45);
  // The coloured light: a black club lights with its second colour when it has one.
  const light = luminance(club) >= 0.08 ? club : hueOf(params.accent) != null ? vivid(params.accent) : shade(club, 0.55);

  // ---- the player ----
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceX = 540 + dir * (30 + r() * 40);
  const faceTop = 180 + r() * 60;
  // A portrait needs the face big: allow a little more than the stock cap (1.6× the photo's own face pixels
  // on the 1080 canvas), never less than the framing asks for when the photo is sharp enough.
  const want = (FACE_H[params.framing ?? "waist"] ?? FACE_H.waist) * (params.playerScale ?? 1);
  const faceH = data.facePx > 0 ? Math.min(want, Math.max(120, data.facePx * 1.6)) : want;
  const fig = (() => {
    const h = Math.max(faceH / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
    const w = h * (data.photoAspect ?? 0.6);
    return { left: faceX - w * (face[0] + face[2] / 2) + (params.playerX ?? 0), top: faceTop - h * face[1] + (params.playerY ?? 0), width: w, height: h, faceH: face[3] * h };
  })();
  const box = { position: "absolute" as const, left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none" };
  const faceCy = fig.top + (face[1] + face[3] * 0.45) * fig.height;
  const faceCx = fig.left + (face[0] + face[2] / 2) * fig.width;
  const ghostDx = dir * (fig.faceH * 0.75 + 30 + r() * 40);
  const url = data.photoUrl;

  // ---- texts ----
  const lines = titleLines(content.kicker);
  const ts = params.textScale ?? 1;
  const longest = Math.max(...lines.map((l) => l.length));
  const titleSize = Math.min(lines.length > 1 ? 150 : 200, 900 / Math.max(1, longest * SERIF_MIX)) * ts;
  const crests = (() => {
    if (postType === "transfer") return [data.fromClub?.crestUrl, data.toClub?.crestUrl ?? data.club?.crestUrl].filter(Boolean) as string[];
    if (postType === "potm" || postType === "renewal") return [data.club?.crestUrl].filter(Boolean) as string[];
    return crestsOf(data);
  })();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const roundPart = roundOf(data).split("·").map((s) => s.trim()).filter(Boolean).slice(1).join(" · ");
  const comp = competitionOf(data);
  const score = scoreOf(data);
  const stats = content.stats.filter((s) => s.value && Number(s.value) !== 0).slice(0, 3).map((s) => `${s.value} ${s.label}`).join(" · ");
  const [l1, l2] = ((): [string, string] => {
    switch (postType) {
      case "matchday":
        return [[roundPart, content.date].filter(Boolean).join(" · ") || comp, [twelveHour(content.time), roundPart || content.date ? comp : ""].filter(Boolean).join(" | ")];
      case "result":
        return [score ? `FULL TIME ${score}` : "FULL TIME", [comp, roundPart].filter(Boolean).join(" · ") || name];
      case "potm":
        return [content.subline || name, stats || name];
      case "transfer":
        return [name, data.fromClub?.name ? `FROM ${data.fromClub.name}` : content.subline];
      case "renewal":
        return [name, content.until ? `UNTIL ${content.until}` : content.subline];
      default:
        return [name, content.subline];
    }
  })();
  const infoSize = (t: string) => Math.min(34, 560 / Math.max(1, t.length * 0.5));
  const infoCap: CSSProperties = { fontFamily: CONDENSED, fontWeight: 700, color: WHITE, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1.08, letterSpacing: "0.01em", textShadow: TIGHT };
  const titleStyle: CSSProperties = dark
    ? { backgroundImage: "linear-gradient(100deg, #b8925a 0%, #dcc08e 30%, #f4ead6 62%, #ffffff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 18px rgba(0,0,0,.5))" }
    : { color: WHITE, textShadow: "0 6px 30px rgba(0,0,0,.25)" };
  const align = toRight ? "flex-start" : "flex-end";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: dark ? "#07090a" : back, color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={`${id}-smear`} x="-50%" y="-5%" width="200%" height="110%">
            <feGaussianBlur stdDeviation="22 2" />
          </filter>
          <filter id={`${id}-streak`} x="-40%" y="-200%" width="180%" height="500%">
            <feGaussianBlur stdDeviation="30 12" />
          </filter>
        </defs>
      </svg>

      {/* Backdrop lighting. */}
      {dark ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${toRight ? 72 : 28}% 30%, ${shade(light, -0.55)}, transparent 70%)`, opacity: 0.7 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 35%, transparent 40%, rgba(0,0,0,.6) 100%)" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 42% at ${toRight ? 38 : 62}% 30%, ${shade(back, 0.2)}, transparent 75%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(110% 85% at 50% 35%, transparent 35%, ${shade(back, -0.55)} 100%)` }} />
        </>
      )}

      {/* The ghost: the same frame smeared sideways by the open shutter. */}
      {url && (
        <div style={{ position: "absolute", inset: 0, filter: `url(#${id}-smear)`, opacity: dark ? 0.7 : 0.55, mixBlendMode: "screen" }}>
          <div style={{ ...box, left: fig.left + ghostDx, isolation: "isolate" }}>
            <img src={url} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: dark ? "grayscale(1) brightness(1.1)" : "brightness(1.15) saturate(.9)", ...cutMask(data.cut) }} />
            {dark && <div style={{ position: "absolute", inset: 0, background: light, mixBlendMode: "multiply", ...maskOf(url) }} />}
          </div>
        </div>
      )}

      {/* The player, lit. */}
      {url && (
        <div style={{ ...box, filter: "drop-shadow(0 30px 50px rgba(0,0,0,.35))" }}>
          <img src={url} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: dark ? "brightness(.9) contrast(1.12) saturate(.94)" : "contrast(1.06) saturate(1.02)", ...cutMask(data.cut) }} />
          {/* Key light falls off towards the ghost's side; on the dark set that side gets the coloured light. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: dark
                ? `linear-gradient(${toRight ? 270 : 90}deg, ${shade(light, -0.1)} 0%, transparent 45%)`
                : `linear-gradient(${toRight ? 90 : 270}deg, transparent 40%, rgba(0,0,0,.4) 100%)`,
              mixBlendMode: dark ? "screen" : "multiply",
              opacity: dark ? 0.55 : 1,
              ...maskOf(url),
            }}
          />
        </div>
      )}

      {/* Dark set: a streak of coloured light across the face (a light swung during the exposure). */}
      {dark && url && (
        <div
          style={{
            position: "absolute",
            // At forehead height and starting past the eyes: across the eyes it read as a laser.
            left: toRight ? faceCx + fig.faceH * 0.3 : faceCx - fig.faceH * 3.5,
            width: fig.faceH * 3.2,
            top: faceCy - fig.faceH * 0.52,
            height: fig.faceH * 0.26,
            borderRadius: "50%",
            background: `linear-gradient(${toRight ? 270 : 90}deg, transparent, ${light} 50%, ${shade(light, 0.4)} 78%, transparent)`,
            filter: `url(#${id}-streak)`,
            mixBlendMode: "screen",
            opacity: 0.35,
          }}
        />
      )}

      {/* Floor shade under the type. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,.28) 75%, rgba(0,0,0,.62))" }} />

      <div style={{ position: "absolute", left: 64, right: 64, bottom: 58, display: "flex", flexDirection: "column", alignItems: align, textAlign: toRight ? "left" : "right" }}>
        <div style={{ fontFamily: DMSERIF, fontSize: titleSize, lineHeight: 0.98, letterSpacing: "-0.012em", whiteSpace: "nowrap", paddingBottom: titleSize * 0.06, ...titleStyle }}>
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 22, flexDirection: toRight ? "row" : "row-reverse" }}>
          {crests.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {crests.map((c, i) => (
                <img key={i} src={c} alt="" style={{ width: 78, height: 78, objectFit: "contain", filter: "grayscale(1) contrast(1.3) brightness(2.3) drop-shadow(0 2px 8px rgba(0,0,0,.35))" }} />
              ))}
            </div>
          )}
          {crests.length > 0 && (l1 || l2) && <div style={{ width: 2.5, height: 70, background: WHITE, opacity: 0.9 }} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 2 }}>
            {l1 && <div style={{ ...infoCap, fontSize: infoSize(l1) }}>{l1}</div>}
            {l2 && <div style={{ ...infoCap, fontSize: infoSize(l2) }}>{l2}</div>}
          </div>
        </div>
        <AgencyLogo data={data} height={26} style={{ marginTop: 26, opacity: 0.92, color: WHITE }} />
      </div>
      <Film strength={dark ? 0.9 : 0.7} />
    </div>
  );
}
