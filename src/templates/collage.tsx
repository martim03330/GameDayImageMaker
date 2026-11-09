/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { hueOf, shade, vivid } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask, DMSERIF, Film } from "./fx";
import { opponentOf, rng } from "./kit";
import { AgencyLogo, factRows, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const CREAM = "#f4ede4";

/** "MAN OF THE MATCH" → "Motm.", "GOAL" → "Goal.": the short, signed-off word in the corner. */
function shortWord(kicker: string): string {
  const k = kicker.toUpperCase().trim();
  const table: [RegExp, string][] = [
    [/MAN OF THE MATCH|PLAYER OF THE MATCH/, "Motm."],
    [/PLAYER OF THE MONTH/, "Potm."],
    [/TEAM OF THE WEEK|XI OF THE WEEK/, "Totw."],
    [/NEW SIGNING|IT'S OFFICIAL|OFFICIAL/, "Signed."],
    [/NEW DEAL|HERE TO STAY/, "Signed."],
    [/BY THE NUMBERS/, "Numbers."],
    [/GAME ?DAY|MATCHDAY/, "Matchday."],
  ];
  const hit = table.find(([re]) => re.test(k));
  if (hit) return hit[1];
  const words = k.split(/\s+/).filter(Boolean);
  if (k.replace(/\s/g, "").length <= 9) return k.charAt(0) + k.slice(1).toLowerCase() + ".";
  return words.map((w) => w[0]).join("").charAt(0) + words.map((w) => w[0]).join("").slice(1).toLowerCase() + ".";
}

/** "MAN OF THE MATCH" → "Man of the Match" (small words stay lower case). */
function titleCase(s: string): string {
  const small = new Set(["of", "the", "a", "an", "and", "in", "on", "by", "to"]);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Names squashed into one tiny word, like a photo credit: "ArsenalLeedsUtd". */
const squash = (...parts: (string | undefined | null)[]) =>
  parts
    .filter(Boolean)
    .map((p) =>
      p!
        .normalize("NFD")
        .replace(/[^A-Za-z0-9 ]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join(""),
    )
    .join("");

function season(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
}

/** The competition from the subline ("LIGA X · 5TH MATCHDAY · VS Y" → "LIGA X"). */
function competition(data: RenderData): string {
  const first = data.content.subline.split("·")[0]?.trim() ?? "";
  if (!first || /^VS\b/i.test(first) || /GAMES|\d{4}/.test(first)) return "";
  return first;
}

/**
 * Layered club collage (Arsenal "Nwaneri — Man of the Match / Motm."): near-black maroon field, a big
 * darkened enlargement of the player bleeding off the left, colour blocks in club tones peeking out,
 * a central portrait frame (cutout over his own photo blurred into bokeh), a name block top-right
 * ("Ethan" light + "Nwaneri" bold in one word), a big italic serif sign-off bottom-left, tiny squashed credits.
 */
export function Collage({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 31);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // Club tones, muted towards the dark field so the blocks read as print, not screen colour.
  const maroon = `color-mix(in srgb, ${shade(accent, -0.5)} 78%, #2a2320)`;
  const field = shade(accent, -0.86);
  const h1 = hueOf(accent);
  const h2 = hueOf(params.accent);
  const distinct = h1 != null && h2 != null && Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) > 40 && params.primary !== "#10131c";
  // The second block: the club's other colour when it darkens well (blues, greens, purples), else a deep navy.
  const deepens = h2 != null && h2 > 150 && h2 < 330;
  const navy = distinct && deepens ? shade(vivid(params.accent), -0.55) : h1 != null && h1 > 190 && h1 < 260 ? "#141a2a" : "#1a2236";
  const textScale = params.textScale ?? 1;

  // --- The portrait frame and the player inside it -------------------------------------------------------
  const flip = r() < 0.5; // frame a little left or right of centre, blocks on the other side
  const F = { left: flip ? 190 : 250, top: 300, width: 640, height: 770 };
  const face = data.face ?? [0.4, 0.08, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  // Head and shoulders: face ~230px tall, but never magnified past ~2.2× its source pixels.
  const cap = data.facePx > 0 ? 2.2 * data.facePx : 230;
  const faceH = Math.min(230, cap) * (params.playerScale ?? 1);
  const faceCx = F.left + F.width * (0.5 + (r() - 0.5) * 0.08);
  const faceCy = F.top + F.height * 0.36;
  let h = faceH / face[3];
  // Reach the bottom of the frame when that doesn't enlarge the face too much (cut chests fade out anyway).
  const reach = (F.top + F.height + 10 - (faceCy - face[3] * h * 0.5)) / Math.max(0.15, 1 - face[1] - face[3] * 0.5);
  if (reach > h) h = Math.min(reach, (Math.max(cap, 120) * 1.15) / face[3]);
  const w = h * aspect;
  const figLeft = faceCx - w * (face[0] + face[2] / 2) + (params.playerX ?? 0);
  const figTop = faceCy - h * (face[1] + face[3] / 2) + (params.playerY ?? 0);
  const cutout = data.photoIsCutout ? data.photoUrl : null;

  // --- Words ---------------------------------------------------------------------------------------------
  const first = content.firstName.trim();
  const last = content.lastName.trim();
  const nameLen = first.length + last.length;
  const number = data.player.number ? `#${data.player.number}` : "";
  // One line inside the block, beside the number.
  const NAME_W = 500;
  const nameSize = Math.min(78, (NAME_W - 68 - (number ? 72 : 0)) / Math.max(5, nameLen * 0.56)) * textScale;
  const position = data.player.position?.trim();
  const line = `${[position ? titleCase(position) : "", titleCase(content.kicker)].filter(Boolean).join(", ")}.`;
  const sign = shortWord(content.kicker);
  const signSize = Math.min(250, 640 / Math.max(3, sign.length * 0.5)) * textScale;
  const opp = postType === "matchday" || postType === "result" || postType === "goal" ? opponentOf(data) : "";
  const topCredit =
    postType === "transfer" ? squash(data.fromClub?.name, (data.toClub ?? data.club)?.name) : squash(data.club?.name, opp || (postType === "potm" ? content.subline : ""));
  const bottomCredit = squash(competition(data)) || `Season${season().replace("/", "")}`;

  // Facts on a navy block that overlaps the frame edge (score, stats, from → to).
  const facts = factRows(data)
    .filter((f) => f.value && f.value !== "—")
    .slice(0, postType === "transfer" ? 2 : 3);
  const B = { width: 250, top: 640 };
  const blockLeft = flip ? F.left + F.width - 90 : F.left - B.width + 90;

  const bleed = { "data-bleed": true } as Record<string, unknown>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: field, color: CREAM }}>
      {/* Soft warm light over the field. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${flip ? 70 : 30}% 40%, ${shade(accent, -0.62)}, transparent 75%)` }} />

      {/* The same player again, huge, dark and soft, half off the canvas. */}
      {cutout ? (
        <img
          {...bleed}
          src={cutout}
          alt=""
          style={{
            position: "absolute",
            height: (faceH * 2.6) / face[3],
            maxWidth: "none",
            left: flip ? undefined : -((faceH * 2.6) / face[3]) * aspect * (face[0] + face[2] / 2) + 40,
            right: flip ? -((faceH * 2.6) / face[3]) * aspect * (1 - face[0] - face[2] / 2) + 40 : undefined,
            top: 240 - ((faceH * 2.6) / face[3]) * face[1],
            opacity: 0.32,
            filter: "blur(7px) brightness(.55) saturate(.7)",
          }}
        />
      ) : (
        data.bgPhotoUrl && (
          <img {...bleed} src={data.bgPhotoUrl} alt="" style={{ position: "absolute", inset: -60, width: CANVAS_W + 120, height: CANVAS_H + 120, maxWidth: "none", objectFit: "cover", opacity: 0.22, filter: "blur(40px) brightness(.6)" }} />
        )
      )}

      {/* Colour blocks peeking from behind the frame. */}
      <div style={{ position: "absolute", left: flip ? F.left + F.width - 40 : F.left - 170, top: F.top - 120, width: 330, height: 520, background: maroon, opacity: 0.92 }} />
      <div {...bleed} style={{ position: "absolute", [flip ? "left" : "right"]: 0, top: 930, width: 170, height: 360, background: navy }} />
      <div style={{ position: "absolute", left: flip ? F.left - 60 : F.left + F.width - 140, top: F.top + F.height - 110, width: 200, height: 170, background: `color-mix(in srgb, ${maroon} 60%, #000)` }} />

      {/* The portrait frame: his own photo blurred to bokeh, the cutout sharp in front. */}
      <div style={{ position: "absolute", left: F.left, top: F.top, width: F.width, height: F.height, overflow: "hidden", background: shade(accent, -0.7), boxShadow: "0 30px 60px rgba(0,0,0,.45)" }}>
        {data.bgPhotoUrl && (
          <img
            src={data.bgPhotoUrl}
            alt=""
            style={{ position: "absolute", inset: -60, width: F.width + 120, height: F.height + 120, maxWidth: "none", objectFit: "cover", filter: "blur(26px) saturate(1.1) brightness(.78)" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 22%, transparent), transparent 55%, rgba(0,0,0,.35))`, mixBlendMode: "multiply" }} />
        {data.photoUrl && (
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              left: figLeft - F.left,
              top: figTop - F.top,
              width: w,
              height: h,
              maxWidth: "none",
              filter: "contrast(1.05) saturate(.95) drop-shadow(0 20px 40px rgba(0,0,0,.4))",
              ...cutMask(data.cut),
            }}
          />
        )}
        {/* Inner vignette. */}
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 120px rgba(0,0,0,.55)" }} />
      </div>

      {/* Facts block (overlaps the frame edge, below the face). */}
      {facts.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: blockLeft,
            top: B.top,
            width: B.width,
            padding: "30px 30px 26px",
            background: navy,
            boxShadow: "0 20px 40px rgba(0,0,0,.35)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {facts.map((f, i) => {
            const long = f.value.length > 6;
            return (
              <div key={i}>
                <div style={{ fontFamily: long ? ARCHIVO : ARCHIVO_BLACK, fontWeight: long ? 600 : 400, fontSize: long ? Math.min(34, 330 / Math.max(6, f.value.length)) : 62, lineHeight: 1, letterSpacing: "-0.01em" }}>{f.value}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 21, marginTop: 6, opacity: 0.75 }}>{titleCase(f.value === "1" ? f.label.replace(/s$/i, "") : f.label)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Name block, top corner. */}
      <div
        style={{
          position: "absolute",
          [flip ? "left" : "right"]: 60,
          top: 118,
          width: NAME_W,
          padding: "30px 34px 28px",
          background: `color-mix(in srgb, ${maroon} 80%, #000)`,
          boxShadow: "0 24px 50px rgba(0,0,0,.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ fontFamily: ARCHIVO, fontSize: nameSize, lineHeight: 0.95, letterSpacing: "-0.035em", whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 300 }}>{first}</span>
            <span style={{ fontWeight: 600 }}>{last}</span>
          </div>
          {number && <div style={{ fontFamily: ARCHIVO, fontWeight: 300, fontSize: 30, lineHeight: 1, opacity: 0.85, paddingTop: 6 }}>{number}</div>}
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 26, lineHeight: 1.2, marginTop: 16, opacity: 0.9 }}>{line}</div>
      </div>

      {/* Crest in a small light square at the frame corner. */}
      {data.club?.crestUrl && (
        <div
          style={{
            position: "absolute",
            left: flip ? F.left - 50 : F.left + F.width - 70,
            top: F.top + F.height - 70,
            width: 120,
            height: 120,
            background: CREAM,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 14px 30px rgba(0,0,0,.4)",
          }}
        >
          <img src={data.club.crestUrl} alt="" style={{ width: 84, height: 84, objectFit: "contain" }} />
        </div>
      )}

      {/* The sign-off word. */}
      <div
        style={{
          position: "absolute",
          [flip ? "right" : "left"]: 56,
          bottom: 104,
          fontFamily: DMSERIF,
          fontStyle: "italic",
          fontSize: signSize,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          color: CREAM,
          textShadow: "0 16px 40px rgba(0,0,0,.45)",
        }}
      >
        {sign}
      </div>

      {/* Tiny credits. */}
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 60, top: 58, fontFamily: ARCHIVO, fontWeight: 600, fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.8 }}>
        {topCredit}
      </div>
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 60, bottom: 50, fontFamily: ARCHIVO, fontWeight: 600, fontSize: 15, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7 }}>
        {bottomCredit}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", [flip ? "left" : "right"]: 60, bottom: 46, opacity: 0.85 }} />
      <Film strength={0.9} />
    </div>
  );
}
