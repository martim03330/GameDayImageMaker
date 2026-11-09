import { coachRole } from "./coachhero";
import { DMSERIF } from "./fx";
import { heroClub } from "./goalherosplit";
import { heroLogo, heroPlayer, matchWord } from "./heroghost";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** DM Serif Display advance widths per 100px, roman and italic (measured in the browser). */
const DMR_W: Record<string, number> = { A: 65, B: 59.8, C: 60.3, D: 64.8, E: 55.5, F: 53.8, G: 65.6, H: 69.1, I: 30.1, J: 42.7, K: 65.4, L: 54, M: 79.1, N: 65.3, O: 67, P: 56.5, Q: 67, R: 62.8, S: 52.1, T: 62.7, U: 64.9, V: 63.2, W: 92.1, X: 61.4, Y: 59, Z: 56, a: 51.8, b: 58.1, c: 49.4, d: 57.4, e: 50.7, f: 34.3, g: 53.1, h: 58, i: 28, j: 28.1, k: 58.2, l: 28.6, m: 87.1, n: 57.8, o: 54.5, p: 57.8, q: 56.5, r: 44.1, s: 43.6, t: 36.1, u: 56.7, v: 53, w: 78.1, x: 56.8, y: 53.6, z: 46.5, " ": 21.8, "-": 33.2, "'": 22.3, ".": 30 };
const DMI_W: Record<string, number> = { A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3, a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, ".": 30.8 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const em = (table: Record<string, number>, t: string) => plain(t).reduce((a, c) => a + (table[c] ?? 55) / 100, 0);
/** Ink extents per em (measured): roman side bearings, the italic's round-capital inset and right lean. */
const R_SIDE = 0.022;
const I_LEFT = (t: string) => (/^[GCOQ]/.test(plain(t)[0] ?? "") ? 0.048 : 0.003);
const I_RIGHT = 0.012;
const ASC = 0.7;
const descends = (t: string) => /[gjpqyQçÇ]/.test(t);

/** "BRUNO" / "bruno" → "Bruno"; names already in mixed case stay as typed. */
const titled = (t: string) => (t === t.toUpperCase() || t === t.toLowerCase() ? t.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase()) : t).trim();

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Coach · serif — an editorial magazine cover: a warm off-white ground, the NEYOD logo small at the top, "HEAD
 * COACH" in small spaced caps, then his name huge in DM Serif Display — the first name roman in ink, set from
 * the left margin, the surname italic in the club colour, set to the right margin — the longer line spanning
 * the text width exactly. His bust under the name fades into the ground, and one quiet line closes the cover:
 * MATCHDAY · HOME v AWAY · date · kick-off.
 */
export function Coachserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const club = heroClub(data);
  const ground = "#f4f2ed";
  const ink = "#17181c";
  const M = 70;
  const f = matchFacts(data);

  /* ---- the masthead: logo, role, the name ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const roleTop = logoTop + (story ? 88 + 60 : 52 + 42);
  const role = coachRole(data).toUpperCase();
  const roleSize = Math.min(17 * k * ts, 700 / Math.max(1, role.length * 1.4));

  const first = titled(content.firstName || "");
  const last = titled(content.lastName || "");
  const l1 = first || last;
  const l2 = first ? last : "";
  const ink1 = em(DMR_W, l1) - 2 * R_SIDE;
  const ink2 = l2 ? em(DMI_W, l2) - I_LEFT(l2) + I_RIGHT : 0;
  const avail = CANVAS_W - 2 * M;
  const s = Math.min(avail / Math.max(0.5, ink1, ink2), story ? 300 : 250) * ts;
  const inkTop = roleTop + roleSize + (story ? 44 : 30) + (params.textY ?? 0);
  const base1 = inkTop + ASC * s;
  const base2 = base1 + 0.84 * s;
  const nameBottom = (l2 ? base2 + (descends(l2) ? 0.24 : 0.03) * s : base1 + (descends(l1) ? 0.24 : 0.03) * s);
  // The longer line spans the margins exactly; the shorter one hangs from its own side.
  const x1 = M - R_SIDE * s;
  const x2 = CANVAS_W - M - I_RIGHT * s;

  /* ---- the cover line, bottom-up ---- */
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const when = [dayMonth(content.date), time, pt].filter(Boolean);
  const word = matchWord(data);
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 56;
  const sp = 0.28;
  // Post: one line. Story: the kicker on its own line over the fixture, so neither has to shrink.
  const oneLine = [word, fixture, ...when].filter(Boolean).join("  ·  ");
  const restLine = [fixture, ...when].filter(Boolean).join("  ·  ");
  const fit = (t: string, max: number) => Math.min(max * ts, (CANVAS_W - 2 * 60) / Math.max(1, t.length * (0.74 + sp)));
  const lineSize = story ? fit(restLine, 21) : fit(oneLine, 15.5);
  const lineTop = bottom - lineSize;
  const kickSize = story ? Math.min(22 * ts, lineSize * 1.15) : 0;
  const kickTop = story ? lineTop - 22 - kickSize : lineTop;
  const footTop = kickTop - (story ? 36 : 28);

  // A cover wants the figure a little bigger than the hero family's default (the foot guard still shrinks it).
  const big = { ...data, params: { ...params, playerScale: (params.playerScale ?? 1) * 1.14 } };
  const p = heroPlayer(big, nameBottom + (story ? 34 : 20), footTop, bottom, 540);

  const caps = (size: number, extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: SANS,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: `${sp}em`,
    paddingLeft: `${sp}em`,
    whiteSpace: "nowrap",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 45% at 50% 62%, #fbfaf7, transparent 75%)" }} />

      {/* The name: roman first name from the left margin, italic surname to the right margin. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={x1} y={base1} textAnchor="start" style={{ fontFamily: DMSERIF, fontWeight: 400, fontSize: s, fill: ink }}>
          {l1}
        </text>
        {l2 && (
          <text x={x2} y={base2} textAnchor="end" style={{ fontFamily: DMSERIF, fontWeight: 400, fontStyle: "italic", fontSize: s, fill: club }}>
            {l2}
          </text>
        )}
      </svg>

      {p.img}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 180 : 130), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e6 ${story ? 140 : 100}px, ${ground})` }} />

      <div style={caps(roleSize, { top: roleTop, fontWeight: 700, letterSpacing: "0.6em", paddingLeft: "0.6em", color: ink })}>{role}</div>

      {story ? (
        <>
          <div style={caps(kickSize, { top: kickTop, fontWeight: 800, letterSpacing: "0.5em", paddingLeft: "0.5em", color: club })}>{word}</div>
          <div style={caps(lineSize, { top: lineTop, fontWeight: 600, color: "rgba(23,24,28,.66)" })}>{restLine}</div>
        </>
      ) : (
        <div style={caps(lineSize, { top: lineTop, fontWeight: 600, color: "rgba(23,24,28,.66)" })}>
          {word && <span style={{ color: club, fontWeight: 800 }}>{word}</span>}
          {word && restLine ? "  ·  " : ""}
          {restLine}
        </div>
      )}

      {heroLogo(data, logoTop)}
    </div>
  );
}
