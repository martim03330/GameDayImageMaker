/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SERIF } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const NEWSPRINT = "#f4f2ec";
const INK = "#16161a";
const GREY = "#6f6d68";
const MARGIN = 60;
/** Where the photograph ends and the caption band begins (~78%). */
const PHOTO_H = 1052;

/** DM Serif Display: advance widths per 100px (approximate, upright). */
const DM_W: Record<string, number> = { a: 52, b: 55, c: 45, d: 56, e: 47, f: 32, g: 50, h: 57, i: 28, j: 27, k: 53, l: 28, m: 85, n: 57, o: 52, p: 55, q: 55, r: 41, s: 41, t: 33, u: 57, v: 50, w: 75, x: 51, y: 50, z: 45, " ": 22, "'": 22, "-": 33 };
const dmEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (DM_W[c] ?? (c === c.toUpperCase() ? 66 : 52)) / 100, 0);

/** "MATCHDAY" → "Matchday", "MAN OF THE MATCH" → "Man of the match". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase().replace(/^full ?time$/, "full time");
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/**
 * Press photo: the picture as a quality newspaper prints it. The top ~78% is the photograph (the player sharp
 * over his own photo softened so its baked-in graphics dissolve, natural colour, a touch of contrast); below it
 * a newsprint caption band: a short serif headline, one sentence of caption telling the fixture, a tiny italic
 * credit line, and the crests small at the band's right with the agency mark under them.
 */
export function Pressphoto({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");

  /* ---- the photograph ---- */
  const faceX = 540 + (params.side === "left" ? -150 : params.side === "right" ? 150 : 0);
  const box = placeByFace(data, faceX, 150, { chest: 250, waist: 205, knees: 160, full: 124 });
  const own = data.bgPhotoUrl;
  // The ground first: his own photo blurred behind him leaves a soft ghost of him beside the cutout.
  const scene = sceneOf(data);
  const back = scene ?? own;
  const ownBack = !scene && !!own;

  /* ---- the caption ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const date = niceDate(content.date);
  const venue = titleCase(f.venue);
  const who = name && ours ? `${name} and ${ours}` : name || ours;
  const where = [comp ? `in the ${comp}${round && !comp.includes(round) ? `, ${round}` : ""}` : round ? `in ${round}` : ""].filter(Boolean);
  const when = [date, f.time, venue].filter(Boolean).join(", ");
  let verb = "face";
  let scoreText = "";
  if (score && (postType === "result" || postType === "goal")) {
    const hg = Number(content.homeGoals);
    const ag = Number(content.awayGoals);
    const [us, them] = content.home === false ? [ag, hg] : [hg, ag];
    verb = us > them ? "beat" : us < them ? "lost to" : "drew with";
    scoreText = ` ${us}–${them}`;
  }
  let caption: string;
  if (postType === "goal" && name && opp) caption = `${name} scores for ${ours || "his side"} against ${opp}${scoreText ? ` (${score})` : ""} ${where.join(" ")}`.trim();
  else if (postType === "potm" && !opp) caption = `${name}${ours ? `, ${ours}` : ""}, named player of the month`;
  else if (opp) caption = `${who} ${verb} ${opp}${scoreText} ${where.join(" ")}`.trim();
  else caption = [who, where.join(" ")].filter(Boolean).join(" ");
  if (when) caption += `, ${when}`;
  caption = caption.replace(/\s+,/g, ",") + ".";

  const headline = sentence(content.kicker);
  const textW = 650;
  const headSize = Math.min(58 * ts, textW / Math.max(1, dmEm(headline)));
  const capSize = Math.max(17, Math.min(22.5, 3700 / Math.max(1, caption.length))) * ts;
  const credit = `Photo: ${ours || "club"}  ·  Edit: NEYOD`;

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const bandTop = PHOTO_H + (params.textY ?? 0) * 0.3;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: NEWSPRINT, color: INK }}>
      {/* The photograph. */}
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: PHOTO_H, overflow: "hidden", background: shade(club, -0.5) }}>
        {back ? (
          <img
            src={back}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: PHOTO_H + 120, maxWidth: "none", objectFit: "cover", filter: `blur(${ownBack ? 60 : 10}px) saturate(.95) contrast(1.04)` }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 70% at 50% 40%, ${shade(club, -0.1)}, ${shade(club, -0.6)})` }} />
        )}
        {/* His own photo again, laid exactly under the cutout (as in sidecol), so the blur never shows a second figure. */}
        {ownBack && (
          <img
            src={own!}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "blur(22px) saturate(.95) contrast(1.04)" }}
          />
        )}
        {/* Depth of field: the background falls a little darker towards the edges. */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 75% at 50% 42%, transparent 55%, rgba(0,0,0,.28))" }} />
        {data.photoUrl && (
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.02) drop-shadow(0 18px 40px rgba(0,0,0,.25))", ...cutMask(data.cut) }}
          />
        )}
        <Film strength={0.18} />
      </div>
      {/* The hairline where print meets photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: PHOTO_H, height: 1, background: "rgba(0,0,0,.25)" }} />

      {/* The caption band. */}
      <div style={{ position: "absolute", left: MARGIN, top: bandTop + 40, width: textW }}>
        <div style={{ fontFamily: DMSERIF, fontSize: headSize, lineHeight: 1, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap" }}>{headline}</div>
        <div style={{ marginTop: 16, fontFamily: SERIF, fontWeight: 500, fontSize: capSize, lineHeight: 1.36, color: "#2a2a2c", maxHeight: capSize * 1.36 * 3, overflow: "hidden" }}>{caption}</div>
        <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 14, color: GREY, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{credit}</div>
      </div>

      {/* Crests small at the right, the agency mark under them. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", right: MARGIN, top: bandTop + 44, display: "flex", alignItems: "center", gap: 16 }}>
          <img src={crests[0]} alt="" style={{ width: 54, height: 54, objectFit: "contain" }} />
          {crests[1] && (
            <>
              <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 22, color: GREY, lineHeight: 1 }}>v</span>
              <img src={crests[1]} alt="" style={{ width: 54, height: 54, objectFit: "contain" }} />
            </>
          )}
        </div>
      )}
      <div style={{ position: "absolute", left: MARGIN + textW + 24, top: bandTop + 40, bottom: 44, width: 1, background: "rgba(0,0,0,.14)" }} />
      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", right: MARGIN, bottom: 46 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
    </div>
  );
}
