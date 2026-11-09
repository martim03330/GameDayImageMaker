/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { coachRole } from "./coachhero";
import { FACES, wordEm } from "./goalhero";
import { heroName } from "./goalherosplit";
import { heroPlayer, matchWord, mix } from "./heroghost";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Coach · dark (matchday) — coachhero on a deep club-colour ground: the white NEYOD logo small at the top,
 * "HEAD COACH" small and wide-spaced (in the club's second colour when it reads on the ground), his name in
 * spaced off-white caps, "MATCHDAY" enormous in off-white at the exact canvas width, his studio bust under it
 * with a soft light behind his shoulders, fading into the ground over the quiet fixture foot: crests either
 * side of "HOME v AWAY" (exact names), then date · kick-off · ground.
 */
const FACE = FACES.anton;
const INK = "#f3f1ec";

/**
 * The ground: the club colour itself when it is already deep (a navy stays that navy — never brightened),
 * darkened until deep otherwise; a white / yellow club takes its other colour, and a neutral charcoal when
 * both are light; a near-black club a charcoal with a little lift.
 */
function groundOf(primary: string, accent: string): { ground: string; glow: string; mark: string } {
  const light = (c: string) => luminance(c) > 0.4;
  let base = primary === "#10131c" ? accent : primary;
  if (light(base)) base = accent;
  const other = base === primary ? accent : primary;
  let ground: string;
  if (light(base)) ground = "#16181d";
  else if (luminance(base) < 0.012) ground = "#15161a";
  else {
    ground = base;
    for (let i = 0; i < 12 && luminance(ground) > 0.05; i++) ground = shade(ground, -0.12);
  }
  const glow = mix("#ffffff", ground, luminance(ground) < 0.02 ? 0.16 : 0.22);
  // The second colour for the small label and the "v" when it stands out on the ground (Arzila's yellow).
  const sat = (() => {
    const p = [1, 3, 5].map((i) => parseInt(other.replace("#", "").padEnd(6, "0").slice(i - 1, i + 1), 16));
    return (Math.max(...p) - Math.min(...p)) / 255;
  })();
  const mark = sat > 0.35 && luminance(other) > 0.28 ? other : INK;
  return { ground, glow, mark };
}

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/** heroFoot for a dark ground: crests either side of HOME v AWAY, then date · kick-off · ground. */
function darkFoot(data: RenderData, ground: string, mark: string) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const f = matchFacts(data);
  const M = 80;
  const k = story ? 1.36 : 1;
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 54;
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = Math.min(15.5 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, line.length * 0.92));
  const lineTop = bottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(50 * k);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const fixAvail = CANVAS_W - 2 * 60 - 2 * (crest + 22 * k);
  const fixSize = Math.min(21 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = lineTop - (line ? 22 * k : 0) - crest;
  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, flexShrink: 0 }} />;

  const node = (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop - (story ? 220 : 160), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e6 ${story ? 160 : 120}px, ${ground})` }} />
      {fixture && (
        <div style={{ position: "absolute", left: 60, right: 60, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
          {crestImg(homeCrest)}
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: INK, whiteSpace: "nowrap" }}>
            {homeName}
            {homeName && awayName && <span style={{ color: mark, fontWeight: 500, margin: "0 0.45em", opacity: mark === INK ? 0.6 : 1 }}>v</span>}
            {awayName}
          </div>
          {crestImg(awayCrest)}
        </div>
      )}
      {line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: INK, opacity: 0.66, whiteSpace: "nowrap" }}>{line}</div>
      )}
    </>
  );
  return { top: fixture ? rowTop : lineTop, bottom, node };
}

export function Coachdark({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const { ground, glow, mark } = groundOf(params.primary, params.accent);
  const M = 80;

  /* ---- the top: logo, role, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const role = coachRole(data).toUpperCase();
  const roleSize = Math.min((story ? 25 : 18) * ts, 700 / Math.max(1, role.length * 1.3));
  const roleTop = logoTop + (story ? 88 + 58 : 52 + 44);
  const name = heroName(data);
  const nameSize = Math.min((story ? 40 : 30) * ts, 900 / Math.max(1, name.length * 0.95));
  const nameTop = roleTop + roleSize + (story ? 20 : 14);
  const word = matchWord(data);
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(FACE, word)), (story ? 440 : 360) / FACE.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 40 : 28) + (params.textY ?? 0);
  const baseline = capTop + size * FACE.cap;

  /* ---- his bust right under the word, a soft light behind him, the foot over his faded body ---- */
  const foot = darkFoot(data, ground, mark);
  const p = heroPlayer(data, baseline + (story ? 26 : 18), foot.top, foot.bottom);
  const fx = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const glowX = Math.round(((p.box.left + (fx[0] + fx[2] / 2) * p.box.width) / CANVAS_W) * 100);
  const glowY = Math.round(((p.faceTop + p.box.faceH * 1.3) / H) * 100);

  const line = (fs: number, sp: number, extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: SANS,
    fontSize: fs,
    lineHeight: 1,
    letterSpacing: `${sp}em`,
    paddingLeft: `${sp}em`,
    whiteSpace: "nowrap",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* A soft light behind his head and shoulders, a deeper edge all round. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${story ? "50% 28%" : "50% 36%"} at ${glowX}% ${glowY}%, ${glow}, ${glow}00 80%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 80% at 50% 45%, transparent 55%, ${shade(ground, -0.35)})` }} />

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - FACE.cap) * 0.9, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={size * (1 - FACE.cap) * 0.9 + size * FACE.cap} textAnchor="middle" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: INK }}>
          {word}
        </text>
      </svg>

      {p.img}
      {foot.node}

      <div style={line(roleSize, 0.7, { top: roleTop, fontWeight: 800, color: mark })}>{role}</div>
      {name && <div style={line(nameSize, 0.32, { top: nameTop, fontWeight: 600, color: INK })}>{name}</div>}
      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
