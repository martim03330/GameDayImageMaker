/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Face height on the canvas for each framing: chest-up by default, the player big across the split. */
const FACE_H: Record<string, number> = { chest: 230, waist: 190, knees: 165, full: 150 };

/** DM Serif Display italic, squeezed horizontally into a tall condensed display serif. */
const SQUEEZE = 0.64;
/** Average cap width / cap height of DM Serif Display italic, relative to the font size. */
const SERIF_W = 0.66;
const SERIF_CAP = 0.7;

const STOP = new Set(["OF", "THE", "A", "AN", "AND", "IN", "ON", "TO", "FOR", "V", "VS"]);

/**
 * One or two short words for the giant title. Long kickers become their initials when they are a
 * well-known phrase ("MAN OF THE MATCH" → "MOTM"), otherwise their longest word.
 */
function bigWord(kicker: string): string {
  const k = kicker.toUpperCase().replace(/\s+/g, " ").trim();
  if (k.length <= 10 || (k.length <= 12 && k.split(" ").length <= 2)) return k;
  const words = k.split(" ");
  if (words.length >= 3 && words.some((w) => STOP.has(w))) return words.map((w) => w[0]).join("");
  const main = words.filter((w) => !STOP.has(w));
  return main.sort((a, b) => b.length - a.length)[0] ?? k;
}

function placeByFace(data: RenderData, faceX: number, faceTop: number, faceH: number) {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const h = Math.max(faceH / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return {
    box: {
      left: faceX - w * (face[0] + face[2] / 2) + (data.params.playerX ?? 0),
      top: faceTop - h * face[1] + (data.params.playerY ?? 0),
      width: w,
      height: h,
    },
    faceW: w * face[2],
    faceH: h * face[3],
  };
}

/**
 * Half-and-half debut card (Arsenal "DEBUT / 89 MARLI SALMON"): white top, the club colour as a deep
 * gradient below; a giant italic condensed serif word cropped by the top edge behind the player's head,
 * the player big across the split, number + first name and a big italic surname at head height.
 */
export function Debut({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 89);
  const flip = params.side === "left";
  const club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // On white the title needs a deep tone; the band below goes from the bright colour to near-black.
  const deep = luminance(club) > 0.25 ? shade(club, -0.45) : shade(club, -0.18);
  const ts = params.textScale ?? 1;
  // Very light club colours (lime, yellow) turn neon as a big field: take them down a little.
  const band = luminance(club) > 0.3 ? shade(club, -0.3) : club;


  // The giant title, cropped by the top edge.
  const word = bigWord(content.kicker);
  const abbreviated = word.replace(/\s/g, "") !== content.kicker.toUpperCase().replace(/\s/g, "");
  const wordSize = Math.min(460, 1000 / (Math.max(4, word.length) * SERIF_W * SQUEEZE)) * ts;
  const wordCap = wordSize * SERIF_CAP;
  // A third of a letter height above the canvas edge — enough to read as cropped, never enough to lose the word.
  const wordCapTop = -wordCap * 0.1;

  // The player: head in front of the title's lower half, shoulders across the split.
  const faceH0 = (FACE_H[params.framing ?? "chest"] ?? 200) * (params.playerScale ?? 1);
  const faceX = 540 + (flip ? 20 : -20) + (r() - 0.5) * 30;
  // Hair and forehead over the bottom of the letters, the face itself below them.
  const wordBottom = wordCapTop + wordCap;
  // Short words (small type) would put the head up against the top edge: the hair stays in their lower 70%.
  const faceTop = Math.max(wordBottom - faceH0 * (0.2 + r() * 0.12), wordCapTop + wordCap * 0.3 + faceH0 * 0.6);
  const { box, faceW, faceH } = placeByFace(data, faceX, faceTop, faceH0);
  // The split runs just under the shoulders (around 40% of the height), so the white frames the head.
  const split = Math.round(Math.min(CANVAS_H * 0.46, Math.max(CANVAS_H * 0.36, faceTop + faceH * 2.1)));

  // Name at head height, beside the face.
  const first = content.firstName.toUpperCase();
  const last = (content.lastName || content.firstName).toUpperCase();
  const nameTop = Math.max(faceTop + faceH * 0.1, wordBottom + 30);
  // Beside the head the name can come close, but it has to end above the shoulders (about one face
  // height under the top of the face): the surname shrinks to fit, and if even that fails it moves out.
  const room = faceTop + faceH * 0.95 - nameTop - 42;
  const clear = room < 80 ? 2 : 1.05;
  const nameLeft = flip ? 56 : faceX + faceW * clear;
  const nameRight = flip ? faceX - faceW * clear : CANVAS_W - 56;
  const nameW = Math.max(200, nameRight - nameLeft);
  const lastSize = Math.min(170, nameW / (Math.max(4, last.length) * SERIF_W * 0.78), room < 80 ? 170 : room / 0.9) * ts;
  const smallLine = [data.player.number, first].filter(Boolean).join(" ");

  // The fixture (or the club) along the split, in the band.
  const c = content;
  const teams =
    postType === "matchday" || postType === "goal"
      ? c.homeTeam && c.awayTeam
        ? [c.homeTeam, `v ${c.awayTeam}`]
        : [data.club?.name ?? ""]
      : postType === "transfer"
        ? [(data.toClub ?? data.club)?.name ?? ""]
        : [data.club?.name ?? ""];
  const detail =
    postType === "matchday"
      ? [c.date, c.time].filter(Boolean).join(" · ")
      : postType === "renewal"
        ? c.until ? `Until ${c.until}` : ""
        : postType === "transfer"
          ? data.fromClub ? `From ${data.fromClub.name}` : ""
          : postType === "goal" && c.homeGoals != null && String(c.homeGoals) !== ""
            ? `${c.homeGoals}–${c.awayGoals}`
            : c.subline;
  // Shoulders reach about two face widths either side of the face: the column stays outside them.
  const isScore = /^\d+–\d+$/.test(detail);
  const bandW = flip ? CANVAS_W - 56 - (faceX + faceW * 2) : faceX - faceW * 2 - 56;
  // A big close-up leaves no room beside the shoulders: the fixture then moves up, beside the head, on white.
  const onWhite = bandW < 230;
  const colW = onWhite ? Math.max(200, flip ? CANVAS_W - 56 - (faceX + faceW * 1.1) : faceX - faceW * 1.1 - 56) : bandW;
  const colTop = onWhite ? Math.max(wordBottom + 44, faceTop + faceH * 0.15) : split + 34;
  const teamSize = (t: string) => Math.max(18, Math.min(34, colW / Math.max(1, t.length * 0.72)));
  const crests = [c.homeCrest ?? (postType === "matchday" || postType === "goal" ? data.club?.crestUrl : null), c.awayCrest].filter(Boolean) as string[];
  const colSide = flip ? { right: 56, textAlign: "right" as const, alignItems: "flex-end" as const } : { left: 56, textAlign: "left" as const, alignItems: "flex-start" as const };
  const logoSide = flip ? { left: 56 } : { right: 56 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: WHITE }}>
      {/* Top half: white, the faintest cool shade towards the split. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: split, background: "linear-gradient(to bottom, #ffffff 40%, #eeeef0)" }} />
      {/* Bottom half: the club colour, bright at the top-left to deep at the bottom-right. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: split,
          bottom: 0,
          background: `radial-gradient(90% 70% at ${flip ? 85 : 15}% 0%, ${shade(band, 0.08)} 0%, transparent 70%), linear-gradient(${flip ? 225 : 135}deg, ${band} 0%, ${shade(band, -0.38)} 48%, ${shade(band, -0.72)} 100%)`,
        }}
      />

      {/* The giant italic word, behind the head. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          [flip ? "right" : "left"]: 40,
          top: wordCapTop - wordSize * 0.25,
          fontFamily: DMSERIF,
          fontStyle: "italic",
          fontSize: wordSize,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: deep,
          transform: `scaleX(${SQUEEZE})`,
          transformOrigin: flip ? "100% 0" : "0 0",
          letterSpacing: "-0.01em",
        }}
      >
        {word}
      </div>

      {/* The player, with a soft shadow falling on the white. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(${flip ? 14 : -14}px 18px 26px rgba(0,0,0,.28))` }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Number + first name, then the surname in the title's italic. */}
      <div style={{ position: "absolute", left: nameLeft, width: nameW, top: nameTop, textAlign: flip ? "right" : "left" }}>
        {smallLine && (
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 34, letterSpacing: "0.04em", lineHeight: 1, color: "#15161a", whiteSpace: "nowrap" }}>{smallLine}</div>
        )}
        <div
          style={{
            fontFamily: DMSERIF,
            fontStyle: "italic",
            fontSize: lastSize,
            lineHeight: 0.9,
            marginTop: 4,
            color: deep,
            whiteSpace: "nowrap",
            transform: "scaleX(0.78)",
            transformOrigin: flip ? "100% 0" : "0 0",
          }}
        >
          {last}
        </div>
      </div>

      {/* Fixture / club along the split. */}
      <div style={{ position: "absolute", top: colTop, width: colW, display: "flex", flexDirection: "column", gap: 6, color: onWhite ? "#15161a" : WHITE, ...colSide }}>
        {abbreviated && (
          <div style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: Math.min(20, colW / (content.kicker.length * 0.74)), letterSpacing: "0.22em", opacity: 0.8, whiteSpace: "nowrap", marginBottom: 6 }}>{content.kicker.toUpperCase()}</div>
        )}
        {teams.filter(Boolean).map((t, i) => (
          <div key={i} style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: teamSize(t.toUpperCase()), lineHeight: 1.1, letterSpacing: "0.2em", whiteSpace: "nowrap" }}>
            {t.startsWith("v ") ? (
              <>
                <span style={{ fontWeight: 500, textTransform: "lowercase" }}>v </span>
                {t.slice(2).toUpperCase()}
              </>
            ) : (
              t.toUpperCase()
            )}
          </div>
        ))}
        {detail && <div style={{ fontFamily: CONDENSED, color: isScore && onWhite ? deep : undefined, fontWeight: isScore ? 800 : 600, fontSize: isScore ? 64 : Math.min(24, colW / (detail.length * 0.7)), letterSpacing: isScore ? "0.04em" : "0.18em", opacity: isScore ? 1 : 0.85, lineHeight: 1, whiteSpace: "nowrap", marginTop: 4 }}>{detail.toUpperCase()}</div>}
      </div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", bottom: 56, display: "flex", gap: 16, ...(flip ? { right: 56 } : { left: 56 }) }}>
          {crests.map((u, i) => (
            <img key={i} src={u} alt="" style={{ width: 70, height: 70, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.35))" }} />
          ))}
        </div>
      )}
      {!crests.length && data.club?.crestUrl && (
        <img src={data.club.crestUrl} alt="" style={{ position: "absolute", bottom: 56, width: 76, height: 76, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.35))", ...(flip ? { right: 56 } : { left: 56 }) }} />
      )}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", bottom: 60, opacity: 0.9, color: WHITE, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.45))", ...logoSide }} />
    </div>
  );
}
