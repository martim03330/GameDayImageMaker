import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { DMSERIF, Film } from "./fx";
import { EchoLine, echoTones, FootFade, goalBox, M, Player } from "./goalechotitle";
import { sentenceCase, teamsOf } from "./notify";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { titleCase } from "./wall";

/** DM Serif Display: advance widths per 1px of font size (lower case and caps, approximate; as in monoaccent). */
const serifEm = (t: string) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.24 : c === "." || c === "," ? 0.25 : /[il]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.78 : /[MW]/.test(c) ? 0.92 : /[A-Z]/.test(c) ? 0.68 : /\d/.test(c) ? 0.55 : 0.49), 0);

/** One neutral tone for every word. */
const TONE = "#ece9e3";

/**
 * Goal echo mono: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and monoaccent's idea: a calm block of serif text on
 * the free side, every word in one warm neutral tone except one, the kicker ("Goal"), in the club colour.
 * Lines: "Goal." / name / fixture / competition. Names as stored, home first, no score.
 */
export function Goalechomono({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo, club } = echoTones(data);
  // The one colour: the club's, lifted until it reads on the deep ground.
  let accent = club;
  for (let i = 0; i < 4 && luminance(accent) < 0.2; i++) accent = shade(accent, 0.3);
  // He stands on params.side; the text block sits on the other side.
  const right = params.side !== "left";
  const f = matchFacts(data);

  /* ---- the block: kicker (accent), name, fixture, competition — one size, one tone ---- */
  const kicker = sentenceCase(content.kicker || "Goal").replace(/[.!]+$/, "");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const teams = teamsOf(data);
  const comp = titleCase(f.comp || "") || titleCase(f.round || "");
  // Lines: "Goal." / name / fixture (one line, or broken before "v") / competition (one line, or two).
  const fixture = teams.length === 2 ? `${teams[0]} v ${teams[1]}` : teams.join("");
  const blockW = story ? 500 : 440;
  const base = (story ? 56 : 44) * ts;
  const fits = (t: string, sz: number) => serifEm(t) * sz <= blockW;
  const lines: { text: string; accent?: boolean }[] = [{ text: kicker, accent: true }];
  if (name) lines.push({ text: name });
  if (fixture) {
    if (fits(fixture, base * 0.86) || teams.length < 2) lines.push({ text: fixture });
    else lines.push({ text: teams[0] }, { text: `v ${teams[1]}` });
  }
  if (comp) {
    const w = comp.split(" ");
    if (fits(comp, base * 0.86) || w.length < 2) lines.push({ text: comp });
    else {
      let best = 1;
      for (let i = 1, bw = Infinity; i < w.length; i++) {
        const m = Math.max(serifEm(w.slice(0, i).join(" ")), serifEm(w.slice(i).join(" ")));
        if (m < bw) [best, bw] = [i, m];
      }
      lines.push({ text: w.slice(0, best).join(" ") }, { text: w.slice(best).join(" ") });
    }
  }
  const size = Math.max(28 * ts, Math.min(base, ...lines.map((l) => blockW / Math.max(1, serifEm(l.text + (l.accent ? "." : ""))))));
  const lead = 1.12;
  // The block's last line ends ~64px above the logo (story: logo ~88px ending at STORY_BOTTOM; post: top ~1250).
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 52 - 52 - 56) - (params.textY ?? 0);

  /* ---- the player, on his side, the block's corner kept clear ---- */
  const cx = 540 + (right ? 1 : -1) * (story ? 220 : 180);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 430 : 250, cx, maxW: story ? 820 : 760, story, minHead: (story ? STORY_TOP : 60) + 10 });
  const dx = (right ? -1 : 1) * 28 * k;
  const dy = -24 * k;

  const side: CSSProperties = right ? { left: M, textAlign: "left" } : { right: M, textAlign: "right" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: TONE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 46% at ${right ? 64 : 36}% ${story ? 36 : 38}%, ${lift}, ${deep} 82%)` }} />

      <EchoLine id="goalechomono" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={story ? STORY_TOP - 60 : 40} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* The calm block: one face, one size, one tone — the kicker alone in the club colour. */}
      <div style={{ position: "absolute", bottom: H - lastBottom - size * (lead - 1) * 0.5, ...side, fontFamily: DMSERIF, fontWeight: 400, fontSize: size, lineHeight: lead, letterSpacing: "-0.005em", color: TONE }}>
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            {l.accent ? (
              <>
                <span style={{ color: accent }}>{l.text}</span>.
              </>
            ) : (
              l.text
            )}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 18}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
