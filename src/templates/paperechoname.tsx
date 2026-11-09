import { headClear } from "./echoname";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { CONDENSED } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";
import { inkCaps, paperFoot, PaperFigure, PaperFinish, PaperLogo, paperSetup } from "./paperechodate";
import { rng } from "./kit";

/** Barlow Condensed 600 caps: advance widths per 100px (measured in the browser). */
const COND_W: Record<string, number> = { A: 45.6, B: 46.2, C: 45.7, D: 47.2, E: 43.5, F: 41.5, G: 46.2, H: 47.7, I: 22.4, J: 44.3, K: 47.7, L: 41.5, M: 53.8, N: 50.7, O: 46.7, P: 45.7, Q: 45.5, R: 46.1, S: 43.4, T: 45.2, U: 47.8, V: 47.1, W: 66.5, X: 46, Y: 45.6, Z: 40.6, " ": 20, "-": 32.5, "'": 15.2, ".": 21.1 };
const condEm = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/’/g, "'")].reduce((a, c) => a + (COND_W[c] ?? 46) / 100, 0);

/**
 * Paper echo name: echoname on paperecho's warm paper — his surname set very large behind him as a hairline
 * outline in the echo's own stroke and colour (deep club colour or ink), so word and echo read as one drawing,
 * partly hidden by his figure. The player in natural colour melting into the paper; the title small in ink at
 * the top; crests, the fixture (home first, names exactly as stored) and date · kick-off · ground at the foot.
 */
export function Paperechoname({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const base = paperSetup(data);
  // As echoname: side "left" sends the echo to the left (PaperFigure leans it left when `right`).
  const right = params.side === "left" ? true : params.side === "right" ? false : rng(params.seed ?? 11)() < 0.5;
  const s = { ...base, right };
  const { k, ts, story } = s;
  const f = matchFacts(data);

  /* ---- the title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 14 * k;

  /* ---- the foot ---- */
  const foot = paperFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);
  const fadeEnd = foot.top - 24 * k;

  /* ---- the player ---- */
  const box = headClear(data, story ? placeByFace(data, 540, 470, { chest: 350, waist: 280, knees: 210, full: 160 }) : placeByFace(data, 540, 300, { chest: 270, waist: 214, knees: 160, full: 120 }), clipTop + 30 * k + 32 * k);

  /* ---- the surname, an outline behind him ---- */
  const surname = (content.lastName || content.firstName || "").trim().toUpperCase();
  const wordW = CANVAS_W - 2 * (story ? 48 : 52);
  const wordSize = surname ? Math.min((story ? 400 : 330) * ts, wordW / Math.max(1, condEm(surname))) : 0;
  const natural = condEm(surname) * wordSize;
  // Cap height ~0.7em; its middle a little under his face's middle, so the letters flank his head and neck.
  const capH = wordSize * 0.7;
  const faceMid = box.top + (data.face?.[1] ?? 0.08) * box.height + box.faceH * 0.5;
  const capTop = Math.max(clipTop + 24 * k, faceMid + box.faceH * (story ? 0 : 0.35) - capH / 2);
  const baseline = capTop + capH;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperFigure
        data={data}
        s={s}
        box={box}
        id="paperechoname"
        clipTop={clipTop}
        fadeEnd={fadeEnd}
        light={[50, 40]}
        behind={
          surname && (
            <svg data-bleed width={CANVAS_W} height={s.H} style={{ position: "absolute", inset: 0 }} aria-hidden>
              <text
                x={540}
                y={baseline}
                textAnchor="middle"
                textLength={natural}
                lengthAdjust="spacingAndGlyphs"
                fill="none"
                stroke={s.echo}
                strokeWidth={story ? 2.4 : 2}
                strokeLinejoin="round"
                style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: wordSize, letterSpacing: 0 }}
              >
                {surname}
              </text>
            </svg>
          )
        }
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...inkCaps(s, tSize, T_TRACK, 500) }}>{title}</div>

      {foot.el}
      <PaperLogo data={data} s={s} />
      <PaperFinish />
    </div>
  );
}
