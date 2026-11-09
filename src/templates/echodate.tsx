import type { CSSProperties } from "react";
import { capsEm } from "./rippleecho";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";
import { CAP, EchoFigure, echoFoot, EchoLogo, echoSetup } from "./echotitle";

const M = 64;
/** Inter Thin (100): advance widths of the figures per 1px of font size (proportional figures). */
const THIN_W: Record<string, number> = { "0": 0.66, "1": 0.38, "2": 0.6, "3": 0.62, "4": 0.64, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.63, "9": 0.62 };
const thinEm = (t: string, tracking: number) => [...t].reduce((a, c) => a + (THIN_W[c] ?? 0.6) + tracking, -tracking);

/** "SAT 17 OCT" / "17 OCT" → ["17", "OCT"]. */
function dayMonth(d?: string): [string, string] {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? [m[1].padStart(2, "0"), m[2]] : ["", ""];
}

/**
 * Echo date: echoline's player and hairline echo, with the match day as the hero — the day in big Inter Thin
 * figures on the free side, behind him, the month small and wide-tracked under it in the club tint, the title
 * small above. Crests, the fixture and kick-off · ground small at the foot.
 */
export function Echodate({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 13);
  const f = matchFacts(data);
  const [day, mon] = dayMonth(content.date);

  const foot = echoFoot(data, s, [f.time ? `Kick-off ${f.time}` : "", titleCase(f.venue)]);

  /* ---- the date: day enormous and thin, month small under it ---- */
  const TR = -0.03;
  const size = Math.min(s.story ? 520 : 460, (s.story ? 460 : 430) / Math.max(0.5, thinEm(day, TR))) * s.ts;
  const figTop = (s.story ? STORY_TOP + 90 : M + 106) + (params.textY ?? 0);
  const figBottom = figTop + size * CAP;
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const tSize = Math.max(12 * s.k, Math.min(15 * s.k, 300 / Math.max(1, capsEm(title, 0.42)))) * s.ts;
  const mSize = 30 * s.k * s.ts;
  const side: CSSProperties = s.right ? { left: M } : { right: M };
  const ink = s.white ? "rgba(255,255,255,.7)" : s.tint;

  /* ---- the player, towards his side ---- */
  const fx = s.story ? (s.right ? 740 : 340) : s.right ? 700 : 380;
  const box = s.story
    ? placeByFace(data, fx, 430, { chest: 340, waist: 272, knees: 204, full: 158 })
    : placeByFace(data, fx, 230, { chest: 270, waist: 214, knees: 160, full: 122 });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echodate"
        light={[s.right ? 60 : 40, 40]}
        behind={
          day && (
            <div
              style={{
                position: "absolute",
                ...(s.right ? { left: M - size * 0.05 } : { right: M - size * 0.05 }),
                top: figTop - size * (0.864 - CAP),
                fontFamily: SANS,
                fontWeight: 100,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: `${TR}em`,
                whiteSpace: "nowrap",
                color: "#fff",
                opacity: 0.92,
                fontVariantNumeric: "proportional-nums",
              }}
            >
              {day}
            </div>
          )
        }
      />

      {/* The title above, the month under the figures. */}
      <div style={{ position: "absolute", ...side, top: figTop - 54 * s.k - tSize, fontFamily: SANS, fontWeight: 500, fontSize: tSize, letterSpacing: "0.42em", lineHeight: 1, whiteSpace: "nowrap", color: "rgba(255,255,255,.72)", ...(s.right ? {} : { marginRight: "-0.42em" }) }}>
        {title}
      </div>
      {mon && (
        <div style={{ position: "absolute", ...side, top: figBottom + 34 * s.k, display: "flex", alignItems: "center", gap: 22 * s.k, flexDirection: s.right ? "row" : "row-reverse" }}>
          <div style={{ width: 40 * s.k, height: 1, background: ink }} />
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: mSize, letterSpacing: "0.5em", lineHeight: 1, whiteSpace: "nowrap", color: ink, ...(s.right ? {} : { marginRight: "-0.5em" }) }}>{mon}</div>
        </div>
      )}

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
