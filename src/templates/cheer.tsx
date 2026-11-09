/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { POST_TYPES } from "@/lib/types";
import { Film } from "./fx";
import { rng, SCRIPT } from "./kit";
import { em, standing } from "./mist";
import { lift } from "./column";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, BEBAS } from "./shared";
import { clubColour, INTER, interEm } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Bebas Neue advance widths per 100px, measured in the browser. */
const BEBAS_W: Record<string, number> = { A: 40.1, B: 40.4, C: 38.3, D: 40.6, E: 36.3, F: 34.4, G: 39.1, H: 42, I: 19.2, J: 26.5, K: 41.4, L: 34.4, M: 53.8, N: 42.7, O: 40, P: 38.6, Q: 40, R: 40.3, S: 37.2, T: 36.4, U: 40.2, V: 38.2, W: 55.7, X: 40.6, Y: 39.4, Z: 36.2, " ": 16, "'": 18.8, "-": 27 };

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();

/** The shout on top, always English, picked by the kind of post (a title the user typed wins). */
function cheerWord(data: RenderData, roll: number): string {
  const { content, postType } = data;
  const t = POST_TYPES.find((p) => p.id === postType);
  const k = content.kicker.trim().toUpperCase();
  const typed = k && k !== t?.kicker && !(t?.alts ?? []).includes(k) && !["GOAL", "BRACE", "HAT-TRICK"].includes(k);
  if (typed && [...k].length <= 14) return k;
  const pick = (xs: string[]) => xs[Math.floor(roll * xs.length) % xs.length];
  switch (postType) {
    case "goal":
      return k === "BRACE" || k === "HAT-TRICK" ? pick(["COME ON", k]) : pick(["COME ON", "GET IN", "COME ON"]);
    case "matchday":
      return pick(["LET'S GO", "LET'S GO", "COME ON"]);
    case "result":
      return pick(["TAKE A BOW", "WHAT A GAME"]);
    case "potm":
      return pick(["TAKE A BOW", "HATS OFF"]);
    case "stats":
      return k && [...k].length <= 14 ? k : "ON FIRE";
    default:
      return k || "COME ON";
  }
}

/**
 * Charlotte "VAMOS ENZO": a club-colour gradient glowing from the top-left corner, a wide heavy shout on
 * top and his first name below it, gigantic in ultra-tall condensed caps filling the width; the full-body
 * player stands in front with his head over the name and a soft shadow at his feet, a white signature
 * scribble beside the letters. The foot: a widely spaced line (GOAL · MATCHDAY · SAT 10 OCT · 15:00) and
 * the two crests either side of "vs" (or the score), each with its club's name in tiny caps.
 */
export function Cheer({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 40);
  let club = clubColour(data);
  if (luminance(club) > 0.42) club = shade(club, -0.35);
  const glow = shade(club, 0.42);
  const deep = shade(club, -0.5);
  const scale = params.textScale ?? 1;

  // ---- the two words --------------------------------------------------------------------------------
  const cheer = cheerWord(data, r());
  const first = (content.firstName.trim().split(/\s+/)[0] ?? "").toUpperCase();
  const last = (content.lastName.trim().split(/\s+/).slice(-1)[0] ?? "").toUpperCase();
  // The first name, unless it is missing or much longer than the surname.
  const word = first && (!last || [...first].length <= 9 || [...last].length >= [...first].length) ? first : last || first || "GO";
  const W = Math.min(820, 760 * scale);
  const cheerSize = Math.min(150, W / Math.max(1, interEm(cheer, -0.01)));
  const cheerTop = 250 + r() * 20;
  const cheerCap = cheerSize * 0.727;
  // Accents above the caps (É, Ã, Ô…) need their own room under the shout.
  const accented = /[\u0300-\u0304\u0306-\u030c]/.test(word.normalize("NFD"));
  let nameTop = cheerTop + cheerCap + cheerSize * 0.2;
  // Tall Bebas: ideally a 480px cap height, squeezed to the width; never thinner than 55% of its natural width.
  const natural = em(fold(word), BEBAS_W, 40) + 0.03 * Math.max(0, [...word].length - 1);
  let H = 480;
  let size = H / 0.7;
  const squeeze = W / (natural * size);
  if (squeeze < 0.55) {
    size = W / (natural * 0.55);
    H = size * 0.7;
  }
  // Very short names do not stretch wider than 125%: the block narrows instead.
  if (accented) {
    // The accent takes the top of the block: the letters get a little shorter, the bottom stays put.
    const room = size * 0.14;
    nameTop += room;
    H -= room;
    size = H / 0.7;
  }
  const nameW = Math.min(W, natural * size * 1.25);
  const nameBottom = nameTop + H;

  // ---- the player ------------------------------------------------------------------------------------
  const cx = 540 + (r() - 0.5) * 70;
  const headTop = nameTop + Math.min(150, H * 0.28);
  const floor = Math.max(nameBottom + 170, 1085);
  const placed = lift(data, standing(data, { cx, headTop, floor, maxFace: 110, framing: "full" }), headTop + 40);
  const fig = placed.box;
  const feetY = fig.feet ? fig.top + fig.height * 0.985 : null;

  // ---- the foot ------------------------------------------------------------------------------------------
  const score = scoreOf(data, " – ");
  const k = content.kicker.trim().toUpperCase().replace(/^IT'?S\s+/, "");
  let label = "";
  if (postType === "matchday") label = [k || "MATCHDAY", content.date?.toUpperCase(), content.time].filter(Boolean).join(" · ");
  else if (postType === "goal") label = k || "GOAL";
  else if (postType === "result") label = k || "MAN OF THE MATCH";
  else if (postType === "potm") label = [k || "PLAYER OF THE MONTH", content.subline.toUpperCase()].filter(Boolean).join(" · ");
  else label = content.subline.toUpperCase() || k;
  const labelSize = Math.min(30, 900 / Math.max(1, interEm(label, 0.42)));
  const labelTop = Math.min(1150, Math.max(1128, (feetY ?? 1085) + 50));

  const teams = [content.homeTeam, content.awayTeam].map((t) => (t ?? "").toUpperCase());
  const crests = crestsOf(data);
  const facts = content.stats.filter((s) => s.value && String(s.value).trim() !== "0" && !/-/.test(String(s.value))).slice(0, 3);
  const showStats = postType === "stats" || postType === "potm" || !crests.length;
  const tiny: CSSProperties = { fontFamily: INTER, fontWeight: 800, fontSize: 12, lineHeight: 1.25, letterSpacing: "0.12em", color: WHITE, width: 150, textTransform: "uppercase" };
  const crestBox = (src: string) => <img src={src} alt="" style={{ width: 84, height: 84, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.25))" }} />;

  const sigText = content.lastName.trim().split(/\s+/).slice(-1)[0] || content.firstName.trim();
  const sigRight = cx < 540;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: club, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 80% at 4% 0%, ${glow} 0%, ${club} 48%, ${deep} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 55%, ${shade(deep, -0.2)}aa 100%)` }} />

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: 58, transform: "translateX(-50%)", opacity: 0.9 }} />

      {/* The shout, wide and heavy. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: cheerTop - cheerSize * 0.14, textAlign: "center", fontFamily: INTER, fontWeight: 900, fontSize: cheerSize, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {cheer}
      </div>

      {/* The name, ultra tall (fitted by textLength, so the checker's unscaled measure over-reports it). */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <text x={540 - nameW / 2} y={nameBottom} textLength={nameW} lengthAdjust="spacingAndGlyphs" fill={WHITE} style={{ fontFamily: BEBAS, fontSize: size, letterSpacing: "0.03em" }}>
          {word}
        </text>
      </svg>

      {/* Soft floor shadow, then the player. */}
      {feetY != null && (
        <div style={{ position: "absolute", left: fig.left + fig.width / 2 - 210, top: feetY - 26, width: 420, height: 52, borderRadius: "50%", background: `radial-gradient(closest-side, ${shade(deep, -0.5)}cc, ${shade(deep, -0.3)}44 60%, transparent)`, filter: "blur(5px)" }} />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 22px 34px rgba(0,0,0,.28))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...placed.style }} />
        </div>
      )}

      {/* Signature scribble beside the name, on the side the player leaves free. */}
      {sigText && (
        <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 0.92 }} aria-hidden>
          <g transform={`translate(${sigRight ? 540 + nameW / 2 - 40 : 540 - nameW / 2 + 40} ${nameTop + H * 0.5}) rotate(-9)`}>
            <text
              x={0}
              y={0}
              textAnchor={sigRight ? "end" : "start"}
              fill={WHITE}
              stroke={club}
              strokeWidth={5}
              strokeLinejoin="round"
              style={{ fontFamily: SCRIPT, fontSize: Math.min(64, 2400 / Math.max(6, [...sigText].length * 4)), paintOrder: "stroke" }}
            >
              {sigText}
            </text>
            <path
              d={sigRight ? "M -200 20 C -140 12, -70 26, 6 10 S 50 4, 34 16" : "M -6 20 C 60 12, 130 26, 200 10 S 244 4, 228 16"}
              fill="none"
              stroke={WHITE}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {/* Foot: spaced label, then crests (or the numbers). */}
      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, top: labelTop, textAlign: "center", fontFamily: INTER, fontWeight: 800, fontSize: labelSize, lineHeight: 1, letterSpacing: "0.42em", paddingLeft: "0.42em", whiteSpace: "nowrap" }}>{label}</div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: labelTop + labelSize + 30, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
        {showStats ? (
          <>
            {data.club?.crestUrl && crestBox(data.club.crestUrl)}
            {facts.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ width: 1, height: 54, background: "rgba(255,255,255,.5)" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 44, lineHeight: 1 }}>{f.value}</div>
                  <div style={{ ...tiny, width: "auto", fontSize: 12 }}>{f.label}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ ...tiny, textAlign: "right" }}>{crests.length > 1 ? teams[0] : ""}</div>
            {crests[0] && crestBox(crests[0])}
            {crests[1] && (
              <div style={{ fontFamily: INTER, fontWeight: score && postType !== "matchday" ? 900 : 700, fontSize: score && postType !== "matchday" ? 34 : 18, letterSpacing: score && postType !== "matchday" ? "0.02em" : "0.1em", minWidth: 40, textAlign: "center", whiteSpace: "nowrap" }}>
                {score && postType !== "matchday" ? score : "vs"}
              </div>
            )}
            {crests[1] && crestBox(crests[1])}
            <div style={{ ...tiny, textAlign: "left" }}>{crests.length > 1 ? teams[1] : ""}</div>
          </>
        )}
      </div>
      <Film strength={1.4} />
    </div>
  );
}
