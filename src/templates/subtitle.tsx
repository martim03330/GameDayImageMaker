/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "");
/** Inter (500), mixed case, roughly: em width of a line. */
export const textEm = (t: string) =>
  [...plain(t)].reduce(
    (a, c) =>
      a +
      (c === " " ? 0.26 : /[A-Z]/.test(c) ? (c === "M" || c === "W" ? 0.86 : c === "I" ? 0.3 : 0.68) : /[il.,:'’]/.test(c) ? 0.27 : c === "—" ? 1 : /[mw]/.test(c) ? 0.84 : /\d/.test(c) ? 0.6 : 0.56),
    0,
  );
const named = (n: string) => (n === n.toUpperCase() ? titleCase(n) : n);

/** Home side first, club names exactly as stored (only the case of an all-caps name may change). */
export function teamsOf(data: RenderData): [string, string] | null {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").trim().toLowerCase();
  let home = c.homeTeam?.trim() ?? "";
  let away = c.awayTeam?.trim() ?? "";
  if (!home || !away) {
    const typed = [c.homeTeam, c.awayTeam].find((t) => t && lc(t) !== lc(ours));
    const opp = typed ?? f.opp ?? "";
    const weHost = c.home ?? true;
    [home, away] = weHost ? [ours, opp] : [opp, ours];
  }
  if (!home || !away) return null;
  return [named(home), named(away)];
}

/** "MATCHDAY" → "Matchday", "HAT-TRICK" → "Hat-trick". */
export const sentence = (t: string) => {
  const s = t.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export type Grade = {
  /** Filter on the softened ground photo. */
  ground: string;
  /** The tint laid over the ground only (blend "color"). */
  tint: string;
  tintOpacity: number;
  /** Filter on the sharp cutout. */
  figure: string;
  /** A soft-light wash over everything: shadows colour → highlights colour. */
  washFrom: string;
  washTo: string;
  washOpacity: number;
  /** Fallback ground when there is no photo. */
  base: string;
};

/**
 * The shared frame: a full-bleed film still (his own photo softened and graded behind the sharp cutout,
 * a soft vignette), two lines of film subtitles near the foot and the agency logo under them.
 */
export function SubtitleFrame({
  data,
  lines,
  grade,
  faceTop,
  sizes,
  faceXs,
  caption,
}: {
  data: RenderData;
  lines: [string, string];
  grade: Grade;
  faceTop: number;
  sizes: Record<string, number>;
  faceXs: number[];
  caption?: string;
}) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.36 : 1);
  const r = rng((params.seed ?? 3) * 31 + 5);
  const yellow = r() < 0.5;
  const ink = yellow ? "#f5e663" : "#ffffff";

  /* ---- the subtitles, stacked up from the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const maxW = 940;
  const size = Math.max(18, Math.min(34 * ts, maxW / Math.max(1, ...lines.map(textEm))));
  const LH = 1.3;
  const gap = story ? 66 : 60;
  const subTop = logoTop - gap - lines.length * size * LH + size * (LH - 1) * 0.5 + (params.textY ?? 0);

  /* ---- the player ---- */
  const faceX = params.side === "left" ? 430 : params.side === "right" ? 650 : faceXs[Math.floor(r() * faceXs.length)];
  const box = placeByFace(data, faceX, faceTop, sizes);

  const own = data.bgPhotoUrl ?? sceneOf(data);
  const outline = "0 0 2px rgba(0,0,0,.95), 0 0 1px rgba(0,0,0,.95), 0 1px 3px rgba(0,0,0,.7), 0 2px 10px rgba(0,0,0,.6)";
  const capSize = 13 * ts;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: grade.base, color: "#fff" }}>
      {/* Ground: his own photo, out of focus and graded. */}
      {own && (
        <img
          src={own}
          alt=""
          style={{ position: "absolute", left: -80, top: -80, width: CANVAS_W + 160, height: H + 160, maxWidth: "none", objectFit: "cover", filter: grade.ground }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: grade.tint, mixBlendMode: "color", opacity: grade.tintOpacity }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% 38%, rgba(255,255,255,.06), transparent 70%)" }} />

      {/* The player, sharp, lightly graded (no blur ever on him). */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: grade.figure, ...cutMask(data.cut) }}
        />
      )}

      {/* The grade over the whole frame, then the vignette and a dark foot for the subtitles. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${grade.washFrom}, ${grade.washTo})`, mixBlendMode: "soft-light", opacity: grade.washOpacity }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 75% at 50% 42%, transparent 52%, rgba(0,0,0,.6) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.34, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.5))" }} />

      {caption && (
        <div
          style={{
            position: "absolute",
            left: 64,
            top: (story ? STORY_TOP : 64) + (params.textY ?? 0),
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: capSize,
            letterSpacing: "0.3em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.78)",
            textShadow: "0 1px 6px rgba(0,0,0,.5)",
          }}
        >
          {caption}
        </div>
      )}

      {/* The subtitles. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: subTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, color: ink, textShadow: outline }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: size, lineHeight: LH, whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} height={20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.22} />
    </div>
  );
}

/**
 * Subtitle: a full-bleed film still, no letterbox. His own photo, softened and graded teal in the
 * shadows, behind the sharp cutout; a soft vignette. Near the foot, centred, two lines of classic film
 * subtitles in Inter (white or pale subtitle yellow by seed, thin dark outline), written as dialogue:
 * "— It's matchday." / "SC Vianense SAD v Leixões, 17 October, 15:00." The ground name tiny at the top
 * left like a location card; the NEYOD logo under the subtitles. Unlike Widescreen (letterbox bars).
 */
export function Subtitle({ data }: { data: RenderData }) {
  const { content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);
  const kick = (content.kicker || "MATCHDAY").replace(/’/g, "'");
  const line1 = postType === "matchday" || /^(match|game)\s?day$/i.test(kick) ? `— It's ${kick.toLowerCase().replace(/\s/g, "")}.` : `— ${sentence(kick)}.`;
  const teams = teamsOf(data);
  const score = postType === "result" ? scoreOf(data, "–") : "";
  const fixture = teams ? `${teams[0]} ${score || "v"} ${teams[1]}` : "";
  const parts = [fixture, niceDate(content.date), postType === "matchday" ? f.time : ""].filter(Boolean);
  const line2 = parts.length ? `${parts.join(", ")}.` : "";
  const venue = titleCase(content.venue ?? "");

  return (
    <SubtitleFrame
      data={data}
      lines={[line1, line2]}
      caption={venue || undefined}
      faceTop={story ? STORY_TOP + 170 : 210}
      sizes={story ? { chest: 230, waist: 196, knees: 160, full: 126 } : { chest: 176, waist: 150, knees: 122, full: 96 }}
      faceXs={[540, 440, 640]}
      grade={{
        ground: "blur(14px) saturate(.7) brightness(.6) contrast(1.1)",
        tint: "#1d5a63",
        tintOpacity: 0.42,
        figure: "contrast(1.06) saturate(.92) sepia(.08)",
        washFrom: "#0f4a55",
        washTo: "#d58a3a",
        washOpacity: 0.42,
        base: "#10262b",
      }}
    />
  );
}
