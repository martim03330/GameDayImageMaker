/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, BEBAS, CONDENSED, factRows } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const SOFT = "0 10px 40px rgba(0,0,0,.28)";
/** Small text over a white kit still has to read: a tighter, darker shadow than the big titles. */
const TIGHT = "0 2px 14px rgba(0,0,0,.55)";
/** Crests keep their own colours; a soft shadow lifts them off the photo. */
const LIFT = "drop-shadow(0 4px 14px rgba(0,0,0,.35))";

/** "2026/27": the season running on the day the edit is made (it turns over in July). */
function season(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
}

/** Club name left, crest in the middle, season right — the same thin line on every post of the series. */
function TopBar({ data }: { data: RenderData }) {
  const s = { position: "absolute" as const, top: 58, fontFamily: CONDENSED, fontWeight: 600, fontSize: 27, letterSpacing: "0.12em", color: WHITE, textShadow: TIGHT };
  return (
    <>
      <div style={{ ...s, left: 58 }}>{(data.club?.name ?? "").toUpperCase()}</div>
      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 540 - 38, top: 34, width: 76, height: 76, objectFit: "contain", filter: LIFT }} />}
      <div style={{ ...s, right: 58 }}>SEASON {season()}</div>
    </>
  );
}

/** The widely spaced hashtag at the foot of every post. */
function Hashtag({ data }: { data: RenderData }) {
  const tag = (data.club?.name ?? data.content.lastName).normalize("NFD").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center", fontFamily: CONDENSED, fontWeight: 800, fontSize: 21, letterSpacing: "0.62em", color: WHITE, textShadow: TIGHT }}>
      #{tag}
    </div>
  );
}

function Crests({ data, size, gap = 26 }: { data: RenderData; size: number; gap?: number }) {
  const crests = [data.content.homeCrest ?? data.club?.crestUrl, data.content.awayCrest].filter(Boolean) as string[];
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {crests.map((c, i) => (
        <img key={i} src={c} alt="" style={{ width: size, height: size, objectFit: "contain", filter: LIFT }} />
      ))}
    </div>
  );
}

/** Face height on the canvas for each framing: tighter framings bring the player closer. */
const FACE_H: Record<string, number> = { chest: 230, waist: 170, knees: 125, full: 95 };

/**
 * Club gameday series, deliberately plain (Os Marialvas "NEXT MATCH / MATCHDAY / XI INICIAL / FIM DO JOGO"):
 * the player's own photo, softly blurred, as the whole background; one huge condensed word his head
 * passes in front of; a thin top line (club · crest · season) and a spaced hashtag at the foot.
 * Three layouts: the headline, a serif list (stats / team of the week) and full time, with a
 * vertical serif title and the score.
 */
export function Simple({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 57);
  const roll = r();
  const rows = content.stats.length ? content.stats : factRows(data);
  const score = content.homeGoals != null && String(content.homeGoals) !== "" ? `${content.homeGoals}–${content.awayGoals}` : "";
  const kind =
    postType === "result"
      ? roll < 0.7 ? "fulltime" : "headline"
      : postType === "goal"
        ? roll < 0.35 ? "fulltime" : "headline"
        : postType === "stats"
          ? rows.length >= 3 && roll < 0.8 ? "list" : "headline"
          : (postType === "totw" || postType === "potm") && rows.length >= 3 && roll < 0.45
            ? "list"
            : "headline";

  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const base = shade(accent, -0.5);
  const league = (content.subline.split("·")[0] ?? "").trim().toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  // The player, placed by his face: head just under the title's baseline, body running off the bottom.
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const faceTop = kind === "list" ? 420 : kind === "fulltime" ? 400 : 470;
  const faceH = (FACE_H[params.framing ?? "waist"] ?? 170) * (params.playerScale ?? 1);
  // Never so small that the body stops above the bottom edge.
  const h = Math.max(faceH / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  const listRight = params.side === "left";
  // Full time leaves the right edge to the vertical title.
  const faceX = kind === "list" ? (listRight ? 330 : 750) : kind === "fulltime" ? 480 : 540 + (r() - 0.5) * 60;
  const figure = data.photoUrl && (
    <img
      src={data.photoUrl}
      alt=""
      style={{
        position: "absolute",
        left: faceX - w * (face[0] + face[2] / 2) + (params.playerX ?? 0),
        top: faceTop - h * face[1] + (params.playerY ?? 0),
        width: w,
        height: h,
        maxWidth: "none",
        filter: "contrast(1.04) drop-shadow(0 24px 50px rgba(0,0,0,.35))",
        ...cutMask(data.cut),
      }}
    />
  );

  // His own photo, blurred into bokeh: the same light and colours as the cutout in front of it. Never shown
  // sharp: club photos often are club graphics with their own text baked in, and the blur hides it.
  const backdrop = data.bgPhotoUrl ? (
    <img
      src={data.bgPhotoUrl}
      alt=""
      style={{ position: "absolute", left: -80, top: -80, width: CANVAS_W + 160, height: CANVAS_H + 160, maxWidth: "none", objectFit: "cover", filter: "blur(38px) saturate(1.15) brightness(.92)" }}
    />
  ) : null;
  const shades = (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.28), transparent 18%, transparent 58%, rgba(0,0,0,.68))" }} />
  );

  if (kind === "fulltime") {
    const title = content.kicker.toUpperCase();
    const titleSize = Math.min(150, 1080 / Math.max(6, title.length * 0.62));
    return (
      <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: base, color: WHITE }}>
        {backdrop}
        {shades}
        {figure}
        <TopBar data={data} />
        {/* The title runs up the right edge, read from the bottom. */}
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 360,
            bottom: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: DMSERIF,
            fontSize: titleSize,
            lineHeight: 1,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            textShadow: SOFT,
          }}
        >
          {title}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontFamily: DMSERIF, fontSize: score ? 190 : 70, lineHeight: 1, textShadow: SOFT }}>
          {score || name}
        </div>
        {score && name && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 112, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: 22, letterSpacing: "0.3em", textShadow: TIGHT }}>{name}</div>
        )}
        <Hashtag data={data} />
        <AgencyLogo data={data} height={22} style={{ position: "absolute", left: 58, bottom: 40, opacity: 0.85 }} />
        <Film strength={0.5} />
      </div>
    );
  }

  if (kind === "list") {
    const list = rows.slice(0, 11);
    const rowH = Math.min(84, 700 / list.length);
    const title = content.kicker.toUpperCase();
    const big = data.player.number || String(list.length);
    const gold = shade(vivid(params.accent), 0.25);
    const side = listRight ? { right: 64, alignItems: "flex-end" as const } : { left: 64, alignItems: "flex-start" as const };
    return (
      <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: base, color: WHITE }}>
        {backdrop}
        {shades}
        {figure}
        <TopBar data={data} />
        <div style={{ position: "absolute", top: 230, width: 560, display: "flex", flexDirection: "column", ...side }}>
          {/* Italic serif title with a big number crossing it (the "XI INICIAL" treatment). */}
          <div style={{ position: "relative", height: 190, display: "flex", alignItems: "center", gap: 24, flexDirection: listRight ? "row" : "row-reverse" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-52%)", fontFamily: DMSERIF, fontSize: 210, lineHeight: 1, color: gold, opacity: 0.85 }}>{big}</div>
              <div style={{ position: "relative", fontFamily: DMSERIF, fontStyle: "italic", fontSize: Math.min(110, 520 / Math.max(4, title.length * 0.55)), lineHeight: 1, whiteSpace: "nowrap", textShadow: SOFT }}>
                {title}
              </div>
            </div>
            <Crests data={data} size={62} gap={12} />
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", ...side }}>
            {list.map((s, i) => (
              <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", gap: 18, flexDirection: listRight ? "row" : "row-reverse", textShadow: SOFT }}>
                <span style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: rowH * 0.66, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.label}</span>
                <span style={{ fontFamily: BEBAS, fontSize: rowH * 0.9, lineHeight: 1, minWidth: rowH * 0.9, textAlign: listRight ? "left" : "right" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <Hashtag data={data} />
        <AgencyLogo data={data} height={22} style={{ position: "absolute", [listRight ? "left" : "right"]: 58, bottom: 40, opacity: 0.85 }} />
        <Film strength={0.5} />
      </div>
    );
  }

  // Headline: "NEXTMATCH" / "MATCHDAY" written as one word, so it reads as a single block.
  const raw = content.kicker.toUpperCase();
  const title = raw.replace(/\s+/g, "").length <= 12 ? raw.replace(/\s+/g, "") : raw;
  const titleSize = Math.min(340, 900 / (title.length * 0.4));
  // One word: its bottom sits behind the forehead, so the head covers the lower part of the letters.
  // Several words ("MAN OF THE MATCH"): the head would hide a whole word, so the title ends above the hair.
  const oneWord = !/\s/.test(title);
  const titleTop = Math.max(150, (oneWord ? faceTop + faceH * 0.1 : faceTop - faceH * 0.7) - titleSize * 0.95);
  // Crests either flank the head (competition left, crests right) or sit low on the chest.
  const flank = r() < 0.5;
  const info = postType === "matchday" || postType === "result" ? [content.date, content.time].filter(Boolean).join(" · ").toUpperCase() : name;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: base, color: WHITE }}>
      {backdrop}
      {shades}
      <TopBar data={data} />
      {!flank && league && (
        <div style={{ position: "absolute", left: 0, right: 0, top: titleTop - 20, textAlign: "center", fontFamily: CONDENSED, fontWeight: 700, fontSize: 24, letterSpacing: "0.18em", textShadow: TIGHT }}>{league}</div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", fontFamily: BEBAS, fontSize: titleSize, lineHeight: 0.95, whiteSpace: "nowrap", textShadow: SOFT }}>
        {title}
      </div>
      {figure}
      {flank ? (
        <>
          {league && (
            <div style={{ position: "absolute", left: 90, top: faceTop + 150, width: 240, textAlign: "center", fontFamily: CONDENSED, fontWeight: 800, fontSize: 26, lineHeight: 1.1, letterSpacing: "0.06em", textShadow: TIGHT }}>{league}</div>
          )}
          <div style={{ position: "absolute", right: 90, top: faceTop + 110 }}>
            <Crests data={data} size={110} gap={16} />
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center" }}>
          <Crests data={data} size={170} gap={40} />
        </div>
      )}
      {(score && postType === "result") || info ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 104, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: 26, letterSpacing: "0.26em", textShadow: TIGHT }}>
          {postType === "result" && score ? `${score} · ${name}` : info}
        </div>
      ) : null}
      <Hashtag data={data} />
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: 58, bottom: 40, opacity: 0.85 }} />
      <Film strength={0.5} />
    </div>
  );
}
