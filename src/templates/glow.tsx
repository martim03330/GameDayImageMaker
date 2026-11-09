/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { competitionOf, crestsOf, OwnPhotoBlur, placeByFace, sceneOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const CONNECTORS = new Set(["OF", "THE", "OF THE", "IN", "BY", "A", "TO"]);

/**
 * The title in two voices, as in "MATCH / day": a big serif word and an italic accent word.
 * A trailing DAY / TIME becomes the accent ("MATCHDAY" → MATCH / day, "FULL TIME" → FULL / time);
 * otherwise the last word, with the little words before it ("MAN OF THE MATCH" → MAN / of the match);
 * a single word keeps the player's surname as its accent ("GOAL" → GOAL / Teles).
 */
export function splitTitle(kicker: string, surname: string): { big: string; accent: string } {
  const words = kicker.toUpperCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return { big: "", accent: surname };
  const last = words[words.length - 1];
  const m = /^(.+?)(DAY|TIME)$/.exec(last);
  if (m) return { big: [...words.slice(0, -1), m[1]].join(" "), accent: m[2].toLowerCase() };
  if (words.length >= 2) {
    const rest = words.slice(0, -1);
    const acc = [last];
    while (rest.length > 1 && CONNECTORS.has(rest[rest.length - 1])) acc.unshift(rest.pop()!);
    return { big: rest.join(" "), accent: acc.join(" ").toLowerCase() };
  }
  const s = surname.trim();
  return { big: last, accent: s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "" };
}

/** "SAT 20 SEP" → "SAT, 20 SEP" (anything else is kept as typed). */
const withComma = (d: string) => d.toUpperCase().replace(/^([A-Z]{3})\s+/, "$1, ");

/**
 * Real Madrid "LA LIGA / MATCH day": the whole picture in black and white (stadium bokeh, the player
 * sharp), two soft blobs of the club colour bleeding in from opposite corners like light leaks; small
 * serif caps for the competition, one huge high-contrast serif word fading to a tint, the accent word in
 * italic club colour tucked under it, and the two crests with the date / kick-off in small serif caps.
 */
export function Glow({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 67);
  const glow = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const titleLeft = params.side !== "right";
  const scene = sceneOf(data);

  // ---- title ----
  const { big, accent } = splitTitle(content.kicker, content.lastName || content.firstName);
  const measure = 900 * (params.textScale ?? 1);
  const bigS = Math.min(300, measure / Math.max(2, [...big].length * 0.64));
  const accS = Math.min(bigS * 0.6, 800 / Math.max(2, [...accent].length * 0.46));
  const top = 112;
  const compH = 46;
  const bigTop = top + compH;
  const bigH = bigS * 0.8;
  const nameS = 24;
  const titleBottom = bigTop + bigH - accS * 0.2 + accS * 0.95 + 22 + nameS;

  // ---- player: the face always below the title ----
  const faceTop = Math.max(titleBottom + 30, 470) + r() * 30;
  const fig = placeByFace(data, titleLeft ? 470 : 610, faceTop);

  // ---- corner block ----
  const crests = crestsOf(data);
  const score = scoreOf(data, " – ");
  const facts = content.stats.filter((s) => s.value && !/-/.test(s.value) && Number(s.value) !== 0).slice(0, 2);
  const smallCaps: CSSProperties = { fontFamily: DMSERIF, fontSize: 29, letterSpacing: "0.12em", lineHeight: 1.3, color: WHITE, textTransform: "uppercase", whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.6)" };
  const lines: string[] = [];
  let mid: ReactNode = null;
  let cornerCrests = crests;
  if (postType === "matchday") {
    if (content.date) lines.push(withComma(content.date));
    if (content.time) lines.push(`K.O ${content.time}`);
  } else if ((postType === "result" || postType === "goal") && score) {
    mid = <div style={{ fontFamily: DMSERIF, fontSize: 84, lineHeight: 1, color: WHITE, whiteSpace: "nowrap", textShadow: "0 6px 26px rgba(0,0,0,.5)" }}>{score}</div>;
    lines.push(postType === "result" ? "FULL TIME" : content.date ? withComma(content.date) : "");
  } else {
    cornerCrests = [data.club?.crestUrl].filter(Boolean) as string[];
    if (content.subline) lines.push(content.subline.toUpperCase());
    if (facts.length) lines.push(facts.map((f) => `${f.value} ${f.label}`).join(" · "));
  }
  const shownLines = lines.filter(Boolean);

  const blob = (x: number, y: number, size: number, opacity: number): CSSProperties => ({
    position: "absolute",
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(closest-side, ${shade(glow, 0.35)} 0%, ${glow} 32%, color-mix(in srgb, ${glow} 45%, transparent) 60%, transparent 100%)`,
    filter: "blur(30px)",
    mixBlendMode: "screen",
    opacity,
    pointerEvents: "none",
  });
  // Top corner away from the title, bottom corner under it.
  const blobA = { x: titleLeft ? 1080 : 0, y: 20 };
  const blobB = { x: titleLeft ? 30 : 1050, y: 1290 };

  const name = [data.player.number, [content.firstName, content.lastName].filter(Boolean).join(" ")].filter(Boolean).join("  ·  ").toUpperCase();
  // Player of the month: the month is in the corner already, so the club heads the title.
  const comp = (postType === "potm" ? "" : competitionOf(data)) || (data.club?.name ?? "").toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0b0b0c", color: WHITE }}>
      {scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -30, top: -30, width: CANVAS_W + 60, height: CANVAS_H + 60, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) contrast(1.2) brightness(.62) blur(5px)" }} />
      ) : (
        <OwnPhotoBlur data={data} blur={34} style={{ filter: "grayscale(1) blur(34px) brightness(.6) contrast(1.1)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 55%, transparent 35%, rgba(0,0,0,.55) 100%), linear-gradient(to bottom, rgba(0,0,0,.35), transparent 30%, transparent 70%, rgba(0,0,0,.5))" }} />

      {/* Light leaks behind the player. */}
      <div style={blob(blobA.x, blobA.y, 1000, 0.95)} />
      <div style={blob(blobB.x, blobB.y, 900, 0.9)} />

      {/* Competition + the two-voice title. */}
      <div style={{ position: "absolute", top, [titleLeft ? "left" : "right"]: 72, display: "inline-flex", flexDirection: "column", alignItems: titleLeft ? "flex-start" : "flex-end" }}>
        <div style={{ height: compH, fontFamily: DMSERIF, fontSize: 30, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>{comp}</div>
        <div style={{ display: "inline-flex", flexDirection: "column", filter: "drop-shadow(0 10px 30px rgba(0,0,0,.35))" }}>
          <div
            style={{
              fontFamily: DMSERIF,
              fontSize: bigS,
              lineHeight: 0.8,
              height: bigH,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              backgroundImage: `linear-gradient(100deg, #ffffff 0%, #ffffff 45%, ${shade(glow, 0.62)} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              paddingTop: bigS * 0.04,
            }}
          >
            {big}
          </div>
          {accent && (
            <div
              style={{
                alignSelf: "flex-end",
                marginTop: -accS * 0.2,
                marginRight: -accS * 0.1,
                fontFamily: DMSERIF,
                fontStyle: "italic",
                fontSize: accS,
                lineHeight: 0.95,
                color: shade(glow, 0.22),
                whiteSpace: "nowrap",
                // A dark halo keeps it apart from the glow of the same colour behind it.
                textShadow: `0 4px 22px rgba(0,0,0,.55), 0 0 40px color-mix(in srgb, ${glow} 45%, transparent)`,
              }}
            >
              {accent}
            </div>
          )}
        </div>
        {name && (
          <div style={{ marginTop: 22, fontFamily: DMSERIF, fontSize: nameS, letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,.5)", opacity: 0.92 }}>
            {name}
          </div>
        )}
      </div>

      {/* The player, black and white, sharp. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "grayscale(1) contrast(1.14) brightness(1.03) drop-shadow(0 30px 50px rgba(0,0,0,.5))", ...cutMask(data.cut) }}
        />
      )}
      {/* The same leaks spilling over him, fainter. */}
      <div style={blob(blobA.x, blobA.y, 1000, 0.32)} />
      <div style={blob(blobB.x, blobB.y, 900, 0.3)} />

      {/* Crests + date / kick-off, bottom corner. */}
      <div style={{ position: "absolute", bottom: 70, [titleLeft ? "right" : "left"]: 72, display: "flex", flexDirection: "column", alignItems: titleLeft ? "flex-end" : "flex-start", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {cornerCrests[0] && <img src={cornerCrests[0]} alt="" style={{ width: 100, height: 100, objectFit: "contain", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.5))" }} />}
          {mid}
          {cornerCrests[1] && <img src={cornerCrests[1]} alt="" style={{ width: 100, height: 100, objectFit: "contain", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.5))" }} />}
        </div>
        {shownLines.length > 0 && (
          <div style={{ textAlign: titleLeft ? "right" : "left" }}>
            {shownLines.map((l, i) => (
              <div key={i} style={{ ...smallCaps, fontSize: Math.min(29, 460 / Math.max(1, [...l].length * 0.72)) }}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", bottom: 30, transform: "translateX(-50%)", opacity: 0.8 }} />
      <Film strength={1.1} />
    </div>
  );
}
