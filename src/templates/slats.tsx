/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { sceneOf, scoreOf } from "./outline";
import { AgencyLogo, SANS, SERIF } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#f2eee6";
const INK = "#16130f";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .8 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;
/** Cloudy sky for the wash when there is no photo to blur. */
const CLOUDS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.007' numOctaves='5' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 1.4 -0.2  0 0 0 1.4 -0.2  0 0 0 1.4 -0.2  0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`,
)}")`;

const SMALL = new Set(["de", "da", "do", "dos", "das", "e", "of", "the", "and"]);
/** "TAÇA DE PORTUGAL" → "Taça de Portugal" (accents kept, short joining words lower case). */
const titleCase = (t: string) =>
  t
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

/** Inter 800 caps, tracked 0.16em: average advance per character. */
const WORD_EM = 0.78;

/**
 * Cut-strip poster (Saul Bass, "ON THE MARK!"): off-white paper with a big photo block in one club-colour
 * duotone — a cloudy wash with the player in front — cut into 6–8 horizontal slats, each a little rotated
 * and shifted like misaligned paper strips. The strip with his face stays straight and whole (no cut ever
 * crosses it). Small spaced caps of the fixture sit in the gaps; a short italic paragraph with the club
 * words in the colour, small credits up the margin, the crests and the agency at the foot.
 */
export function Slats({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 19;
  const r = rng(seed);
  const right = params.side !== "left";
  const X = (x: number) => (right ? x : CANVAS_W - x);

  // The duotone colour: the club colour at a middle depth (highlights stay coloured, shadows go dark).
  let tint = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(tint) > 0.45) tint = vivid(params.accent);
  for (let i = 0; i < 5 && luminance(tint) > 0.3; i++) tint = shade(tint, -0.12);
  if (luminance(tint) < 0.04) tint = shade(tint, 0.25);
  const word = shade(tint, -0.1);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const ts = params.textScale ?? 1;

  /* ---- the photo block ---- */
  const PX = 64;
  const PW = CANVAS_W - PX * 2;
  const PY = 70;
  const PB = 1100;

  /* ---- the player in it ---- */
  const want = ({ chest: 250, waist: 205, knees: 170, full: 140 } as Record<string, number>)[params.framing ?? "waist"] ?? 205;
  const faceTop = 330 + r() * 70;
  const box = placeFace(data, X(560 + r() * 50), faceTop, want, PB + 30);
  const [fx, fy, fw, fh] = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceY0 = box.top + box.height * fy;
  const faceY1 = faceY0 + box.height * fh;
  const faceH = faceY1 - faceY0;
  // The no-cut zone: hair to chin, with room.
  const zoneTop = faceY0 - faceH * 0.4;
  const zoneBottom = faceY1 + faceH * 0.22;

  /* ---- the cuts ---- */
  const n = 6 + Math.floor(r() * 3);
  let cuts = Array.from({ length: n - 1 }, (_, i) => PY + ((i + 1) * (PB - PY)) / n + (r() - 0.5) * 30);
  cuts = cuts.map((c) => (c > zoneTop && c < zoneBottom ? (c - zoneTop < zoneBottom - c ? zoneTop : zoneBottom) : c));
  cuts = cuts.filter((c, i, a) => c > PY + 70 && c < PB - 70 && (i === 0 || c - a[i - 1] > 70)).sort((a, b) => a - b);
  const edges = [PY, ...cuts, PB];

  // Words for the gaps: the title first, then the fixture.
  const kick = content.kicker.toUpperCase().replace(/^(MATCH|GAME)DAY$/, "$1 DAY").replace(/^FULLTIME$/, "FULL TIME");
  const titleWords = kick.split(/\s+/).filter(Boolean);
  const titleBits = titleWords.length > 3 ? [titleWords.slice(0, 2).join(" "), titleWords.slice(2).join(" ")] : titleWords;
  const facts =
    (postType === "result" || postType === "goal") && score
      ? [f.opp ? `V ${f.opp}` : "", `FULL TIME ${score}`, f.longDate]
      : [f.opp ? `V ${f.opp}` : "", f.longDate, f.time ? `KICK OFF ${f.time}` : ""];
  const words = [...titleBits, ...facts.filter(Boolean)].map((w, i, a) => (i === titleBits.length - 1 && i < a.length ? `${w}!` : w));
  const wordGaps = Math.min(words.length, cuts.length);

  const faceStrip = edges.findIndex((e, i) => i < edges.length - 1 && e <= faceY0 && edges[i + 1] >= faceY1);
  const strips = edges.slice(0, -1).map((top, i) => {
    const bottom = edges[i + 1];
    const straight = i === faceStrip;
    // Gaps: wider where a word sits.
    const gapAbove = i === 0 ? 0 : i - 1 < wordGaps ? 19 : 7;
    const gapBelow = i === edges.length - 2 ? 0 : i < wordGaps ? 19 : 7;
    const rot = straight ? 0 : (r() - 0.5) * 1.3;
    const dx = straight ? 0 : (r() - 0.5) * 36;
    const dw = straight ? 0 : (r() - 0.5) * 30;
    return { top: top + gapAbove, bottom: bottom - gapBelow, rot, dx, dw, straight };
  });

  /* ---- the composition every strip shows a slice of ---- */
  const wash = data.bgPhotoUrl ?? sceneOf(data);
  const scene: ReactNode = (
    <>
      <div style={{ position: "absolute", inset: "0 -80px", background: tint }} />
      <div style={{ position: "absolute", inset: "0 -80px", mixBlendMode: "multiply", isolation: "isolate" }}>
        <div style={{ position: "absolute", inset: 0, background: "#e2e2e2" }} />
        {wash ? (
          <img src={wash} alt="" style={{ position: "absolute", left: -120, top: -120, width: PW + 400, height: PB - PY + 240, objectFit: "cover", filter: "blur(26px) grayscale(1) contrast(1.15) brightness(1.55)", maxWidth: "none" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, backgroundImage: CLOUDS, backgroundSize: "900px 900px" }} />
        )}
        <div style={{ position: "absolute", inset: 0, backgroundImage: CLOUDS, backgroundSize: "1000px 1000px", mixBlendMode: "multiply", opacity: 0.4 }} />
        {data.photoUrl && (
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left - PX + 80, top: box.top - PY, width: box.width, height: box.height, maxWidth: "none", filter: "grayscale(1) contrast(1.2) brightness(1.15)", ...cutMask(data.cut) }}
          />
        )}
      </div>
      {/* A touch of light back into the highlights, so the face is not a flat silhouette. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left - PX, top: box.top - PY, width: box.width, height: box.height, maxWidth: "none", filter: "grayscale(1) contrast(1.5)", mixBlendMode: "soft-light", opacity: 0.6, ...cutMask(data.cut) }}
        />
      )}
    </>
  );

  /* ---- foot ---- */
  const ours = data.club?.name ?? "";
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const em = (t: string) => <span style={{ color: word, fontWeight: 600 }}>{t.toUpperCase()}</span>;
  const comp = titleCase([f.comp, f.round].filter(Boolean).join(", "));
  const sentence: ReactNode[] = [];
  if (postType === "result" && score) {
    sentence.push(<>Full time: {em(ours)} {score} {f.opp ? em(f.opp) : null}{comp ? ` in the ${comp}` : ""}. </>);
    if (name) sentence.push(<>{name} was on the pitch for every cut of it. </>);
  } else if (postType === "goal") {
    sentence.push(<>{name || "He"} finds the net for {em(ours)}{f.opp ? <> against {em(f.opp)}</> : null}{comp ? ` in the ${comp}` : ""}. </>);
  } else if (postType === "potm") {
    sentence.push(<>{name || "He"} is named {titleCase(content.kicker || "player of the match").toLowerCase()} for {em(ours)}{f.opp ? <> against {em(f.opp)}</> : null}. </>);
  } else {
    sentence.push(<>{name ? `${name} and ` : ""}{em(ours)} take on {f.opp ? em(f.opp) : "the opposition"}{comp ? ` in the ${comp}` : ""}. </>);
    const when = [f.longDate ? `on ${titleCase(f.longDate)}` : "", f.time ? `kick-off ${f.time}` : "", f.venue ? `at ${titleCase(f.venue)}` : ""].filter(Boolean);
    if (when.length) sentence.push(<>The whistle goes {when.join(", ")}. </>);
  }
  sentence.push(<>An edit by {em(data.agency.name || "NEYOD")}.</>);
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const wordStyle: CSSProperties = { position: "absolute", fontFamily: SANS, fontWeight: 800, fontSize: 19 * Math.min(1.2, ts), letterSpacing: "0.16em", lineHeight: 1, color: INK, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* Paper. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, #f6f3ec 0%, #ece6db 100%)" }} />

      {/* The slats. */}
      {strips.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: PX + s.dx,
            top: s.top,
            width: PW + s.dw,
            height: s.bottom - s.top,
            overflow: "hidden",
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "50% 50%",
            boxShadow: "0 1px 2px rgba(40,30,20,.18)",
            isolation: "isolate",
          }}
        >
          <div style={{ position: "absolute", left: -s.dx * 0.5, top: PY - s.top, width: PW, height: PB - PY }}>{scene}</div>
        </div>
      ))}

      {/* Words tucked into the gaps. */}
      {words.slice(0, wordGaps).map((w, i) => {
        const y = cuts[i];
        const fs = (i < titleBits.length ? 25 : 18) * Math.min(1.2, ts);
        const wpx = [...w].length * fs * WORD_EM;
        const slots = [0.6, 0.16, 0.66, 0.3, 0.55, 0.12, 0.7];
        const x = PX + 30 + (PW - 60 - wpx) * Math.max(0, Math.min(1, slots[(i + seed) % slots.length]));
        return (
          <div key={i} style={{ ...wordStyle, fontSize: fs, fontWeight: i < titleBits.length ? 900 : 800, top: y - fs * 0.5, [right ? "left" : "right"]: x }}>
            {w}
          </div>
        );
      })}

      {/* Credits up the margin, as on the original. */}
      <div style={{ position: "absolute", [right ? "left" : "right"]: 24, top: PY + 4, writingMode: "vertical-rl", transform: right ? "rotate(180deg)" : undefined, fontFamily: SANS, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.2em", color: INK, opacity: 0.75, whiteSpace: "nowrap" }}>
        {`DESIGNED FOR ${(name || ours).toUpperCase()}`}
      </div>

      {/* Foot: the paragraph, the crests, the agency. */}
      <div style={{ position: "absolute", left: PX, right: PX, top: PB + 30 + (params.textY ?? 0), fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 19.5, lineHeight: 1.45, color: INK, textAlign: "justify", textAlignLast: "left" }}>
        {sentence.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
      <div style={{ position: "absolute", [right ? "right" : "left"]: PX, bottom: 48, display: "flex", gap: 16, alignItems: "center", flexDirection: right ? "row" : "row-reverse" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 46, height: 46, objectFit: "contain" }} />
        ))}
      </div>
      <AgencyLogo data={data} onLight height={22} style={{ position: "absolute", [right ? "left" : "right"]: PX, bottom: 48 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }} />

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.14, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
