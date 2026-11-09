/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask, Film, type Box } from "./fx";
import { rng } from "./kit";
import { scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const BAR = "#070708";
const plain = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "");
/** Inter, mixed case, roughly: em width of a line. */
const textEm = (t: string) => [...plain(t)].reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? (c === "M" || c === "W" ? 0.85 : c === "I" ? 0.3 : 0.66) : /[il.,:'’]/.test(c) ? 0.26 : c === "—" ? 1 : /[mw]/.test(c) ? 0.82 : 0.54), 0);
/** Inter caps with tracking. */
const capsEm = (t: string, track: number) => [...plain(t)].reduce((a, c) => a + (c === " " ? 0.27 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + track, 0);
const named = (n: string) => (n === n.toUpperCase() ? titleCase(n) : n);

/** The fixture with the home side first, club names exactly as stored (only the case may change). */
function fixtureOf(data: RenderData, score: string): string {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").trim().toLowerCase();
  let home = c.homeTeam?.trim() ?? "";
  let away = c.awayTeam?.trim() ?? "";
  if (!home || !away) {
    const typed = [c.homeTeam, c.awayTeam].find((t) => t && lc(t) === lc(f.opp));
    const opp = typed ?? f.opp;
    const weHost = c.home ?? true;
    [home, away] = weHost ? [ours, opp] : [opp, ours];
  }
  if (!home || !away) return home || away ? named(home || away) : "";
  return `${named(home)} ${score || "v"} ${named(away)}`;
}

/**
 * Widescreen: a film still. A 2.39:1 frame band across the middle (taller in the story) holds the player over
 * his own photo, softly out of focus; solid near-black bars above and below, as on a cinema screen. His head
 * breaks over the top edge of the frame into the upper bar for depth. In the upper bar the title, tiny and
 * widely spaced; in the lower bar one centred subtitle line in Inter (fixture — date, kick-off), the ground
 * under it, dimmer, then the agency mark. Unlike Cinematic (full-bleed blurred stadium, big serif / outline
 * header), everything here lives in the letterbox: the image is the frame, the type is the subtitle.
 */
export function Widescreen({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.35 : 1);
  const r = rng(params.seed ?? 7);

  /* ---- the bars ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const TRACK = 0.7;
  const titleSize = Math.min(15 * ts, 700 / Math.max(1, capsEm(title, TRACK)));
  const f = matchFacts(data);
  const score = postType === "result" || postType === "goal" ? scoreOf(data, "–") : "";
  const fixture = fixtureOf(data, score);
  const when = [niceDate(content.date), postType === "matchday" ? f.time : ""].filter(Boolean).join(", ");
  const one = [fixture, when].filter(Boolean).join(" — ");
  const subMax = 30 * ts;
  const fitOne = Math.min(subMax, 940 / Math.max(1, textEm(one)));
  const twoLines = fitOne < 24 * (story ? 1.3 : 1);
  const subLines = twoLines ? [fixture, when].filter(Boolean) : [one];
  const subSize = twoLines ? Math.min(subMax, 940 / Math.max(1, ...subLines.map(textEm))) : fitOne;
  const venue = titleCase(content.venue ?? "");
  const venueSize = Math.min(19 * ts, 900 / Math.max(1, textEm(venue)));

  const titleTop = (story ? STORY_TOP + 40 : 180) + (params.textY ?? 0);
  const logoAsked = story ? 22 : 20;
  const logoBottom = (story ? H - STORY_BOTTOM : 46) - (params.logoY ?? 0);
  const VENUE_GAP = story ? 20 : 14;
  const lowerH = subLines.length * subSize * 1.32 + (venue ? VENUE_GAP + venueSize * 1.2 : 0);

  /* ---- the frame band ---- */
  // Post: a true 2.39:1 band. Story: a taller band; the subtitle block is stacked up from the mark
  // (88px tall, ending at STORY_BOTTOM) with a 64px gap, and the band ends 64px above the subtitle.
  const storySubTop = STORY_BOTTOM - 88 - 64 - lowerH;
  const bandH = story ? 860 : Math.round(CANVAS_W / 2.39);
  const bandBottom = story ? Math.round(storySubTop - 64) : Math.round((CANVAS_H - bandH) / 2) + 30 + bandH;
  const bandTop = bandBottom - bandH;
  const subTop = (story ? storySubTop : bandBottom + 52) + (params.textY ?? 0);

  /* ---- the player: his head over the top edge of the frame ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const fx = [540, 540, 400, 680][Math.floor(r() * 4)];
  let faceH = (story ? 190 : 138) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  const faceTop = bandTop - faceH * (story ? 0.5 : 0.45);
  // Tall enough that the body always runs past the bottom of the frame.
  const h = Math.max(faceH / face[3], (bandBottom + 20 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  const box: Box = { left: fx - w * (face[0] + face[2] / 2) + (params.playerX ?? 0), top: faceTop - h * face[1] + (params.playerY ?? 0), width: w, height: h };

  const own = data.bgPhotoUrl ?? sceneOf(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: BAR, color: "#fff" }}>
      {/* The frame: his photo out of focus, a gentle film grade and a soft vignette. */}
      <div style={{ position: "absolute", left: 0, top: bandTop, width: CANVAS_W, height: bandH, overflow: "hidden", background: "#1a1c20" }}>
        {own && (
          <img
            src={own}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: bandH + 120, maxWidth: "none", objectFit: "cover", filter: "blur(22px) saturate(.85) brightness(.62) contrast(1.05)" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(20,60,80,.28), transparent 45%, rgba(120,70,20,.18))", mixBlendMode: "soft-light" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 90% at 50% 45%, transparent 40%, rgba(0,0,0,.55) 100%)" }} />
      </div>

      {/* The player: clipped at the foot of the frame, free above it so his head breaks into the upper bar. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: bandBottom, overflow: "hidden" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(.95)", ...cutMask(data.cut) }}
          />
        </div>
      )}
      {/* A whisper of shadow along the bottom edge so the cut reads as the frame line, not the photo's. */}
      <div style={{ position: "absolute", left: 0, top: bandBottom - 70, width: CANVAS_W, height: 70, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.35))" }} />

      {/* Upper bar: the title, tiny and spaced. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: titleTop,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: titleSize,
          letterSpacing: `${TRACK}em`,
          paddingLeft: `${TRACK}em`,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: "rgba(255,255,255,.88)",
        }}
      >
        {title}
      </div>

      {/* Lower bar: the subtitle, the ground, the mark. */}
      <div style={{ position: "absolute", left: 60, right: 60, top: subTop, textAlign: "center", fontFamily: SANS, color: "#fff" }}>
        {subLines.map((l, i) => (
          <div key={i} style={{ fontWeight: 500, fontSize: subSize, lineHeight: 1.32, whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
        {venue && <div style={{ marginTop: VENUE_GAP, fontWeight: 400, fontSize: venueSize, lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.55)", letterSpacing: "0.02em" }}>{venue}</div>}
      </div>

      <AgencyLogo data={data} height={logoAsked} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.25} />
    </div>
  );
}
