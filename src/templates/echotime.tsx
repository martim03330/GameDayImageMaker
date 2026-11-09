import { capsEm } from "./rippleecho";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";
import { CAP, capsStyle, EchoFigure, echoFoot, EchoLogo, echoSetup } from "./echotitle";

const M = 64;
/** Inter Thin (100): advance widths per 1px of font size (proportional figures). */
const THIN_W: Record<string, number> = { "0": 0.66, "1": 0.38, "2": 0.6, "3": 0.62, "4": 0.64, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.63, "9": 0.62, ":": 0.24 };
const thinEm = (t: string, tracking: number) => [...t].reduce((a, c) => a + (THIN_W[c] ?? 0.6) + tracking, -tracking);

/**
 * Echo time: echoline's player and hairline echo, with the kick-off as the hero — "15:00" in huge Inter Thin
 * figures across the top from the free side, his head rising just in front of their foot, the colon in the
 * club colour. The title small above; crests, fixture and date · ground small at the foot.
 */
export function Echotime({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 17);
  const f = matchFacts(data);
  const time = (f.timeLocal || f.time || "").replace(/[hH.]/, ":");

  const foot = echoFoot(data, s, [niceDate(content.date), f.timePt ? `${f.timePt} ${f.timeRef || "PT"}` : "", titleCase(f.venue)]);

  /* ---- the title, small, and the time under it ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * s.k, Math.min((s.story ? 20 : 18) * s.k, 600 / Math.max(1, capsEm(title, T_TRACK)))) * s.ts;
  const titleTop = (s.story ? STORY_TOP : 84) + (params.textY ?? 0);
  const TR = -0.03;
  const size = Math.min(s.story ? 380 : 330, (s.story ? 880 : 790) / Math.max(1, thinEm(time, TR))) * s.ts;
  const figTop = titleTop + tSize + (s.story ? 70 : 52);
  const figBottom = figTop + size * CAP;
  const [hh, mm] = time.includes(":") ? time.split(":") : [time, ""];

  /* ---- the player, towards his side, head just in front of the figures' foot ---- */
  const fx = s.right ? 680 : 400;
  const sizes = s.story ? { chest: 380, waist: 300, knees: 222, full: 170 } : { chest: 266, waist: 210, knees: 156, full: 120 };
  // His hair rises ~0.4 face-heights above the face box: let it just touch the figures' foot.
  const faceH = placeByFace(data, fx, 0, sizes).faceH;
  const box = placeByFace(data, fx, figBottom + faceH * (s.story ? 0.5 : 0.42), sizes);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echotime"
        clipTop={figBottom + 10}
        light={[s.right ? 58 : 42, 42]}
        behind={
          time && (
            <div
              style={{
                position: "absolute",
                ...(s.right ? { left: M - size * 0.04 } : { right: M - size * 0.04 }),
                top: figTop - size * (0.864 - CAP),
                fontFamily: SANS,
                fontWeight: 100,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: `${TR}em`,
                whiteSpace: "nowrap",
                color: "#fff",
                opacity: 0.94,
                fontVariantNumeric: "proportional-nums",
              }}
            >
              {hh}
              {mm && (
                <>
                  <span style={{ color: s.tint, opacity: 1 }}>:</span>
                  {mm}
                </>
              )}
            </div>
          )
        }
      />

      <div style={{ position: "absolute", top: titleTop, ...(s.right ? { left: M } : { right: M }), ...capsStyle(tSize, T_TRACK, 500), textAlign: s.right ? "left" : "right", paddingLeft: 0, ...(s.right ? {} : { marginRight: `-${T_TRACK}em` }), color: "rgba(255,255,255,.8)" }}>
        {title}
      </div>

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
