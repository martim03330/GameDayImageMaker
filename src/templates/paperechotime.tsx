import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";
import { CAP } from "./echotitle";
import { inkCaps, paperFoot, PaperFigure, PaperFinish, PaperLogo, paperSetup, thinEm } from "./paperechodate";

const M = 64;

/**
 * Paper echo time: echotime on paperecho's warm paper — the kick-off ("15:00") in huge Inter Thin ink figures
 * across the top from the free side, his head rising just in front of their foot, the colon in deep club
 * colour. The player in natural colour with his hairline echo (deep club colour or ink); the title small above;
 * crests, fixture and date · ground small in ink at the foot; dark NEYOD logo.
 */
export function Paperechotime({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = paperSetup(data);
  const f = matchFacts(data);
  const time = (f.timeLocal || f.time || "").replace(/[hH.]/, ":");

  const foot = paperFoot(data, s, [niceDate(content.date), f.timePt ? `${f.timePt} ${f.timeRef || "PT"}` : "", titleCase(f.venue)]);

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
  const fadeEnd = foot.top - 24 * s.k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperFigure
        data={data}
        s={s}
        box={box}
        id="paperechotime"
        clipTop={figBottom + 10}
        fadeEnd={fadeEnd}
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
                color: s.ink,
                opacity: 0.9,
                fontVariantNumeric: "proportional-nums",
              }}
            >
              {hh}
              {mm && (
                <>
                  <span style={{ color: s.accent }}>:</span>
                  {mm}
                </>
              )}
            </div>
          )
        }
      />

      <div style={{ position: "absolute", top: titleTop, ...(s.right ? { left: M } : { right: M }), ...inkCaps(s, tSize, T_TRACK, 500), textAlign: s.right ? "left" : "right", paddingLeft: 0, ...(s.right ? {} : { marginRight: `-${T_TRACK}em` }), opacity: 0.8 }}>
        {title}
      </div>

      {foot.el}
      <PaperLogo data={data} s={s} />
      <PaperFinish />
    </div>
  );
}
