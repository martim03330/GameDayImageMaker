/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { coachRole } from "./coachhero";
import { cutMask } from "./fx";
import { FACES } from "./goalhero";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' ";
/** Anton advances per 100px (goalhero's table) plus its figures (heromatch's). */
const ANTON = FACES.anton.widths.split(" ").map(Number);
const ANTON_DIGITS = "49 33 49 49 49 49 49 49 49 49".split(" ").map(Number);
const adv = (c: string) => (/[0-9]/.test(c) ? ANTON_DIGITS[+c] : (ANTON[ORDER.indexOf(c)] ?? 48)) / 100;

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Coach · frame (matchday) — heroframe carried to a head coach: on the off-white ground a thin club-colour
 * hairline frame, his studio bust standing in it with head and shoulders breaking out over its top edge (the line
 * runs behind him), "HEAD COACH" and his name spaced above him, "MATCHDAY" in Anton at the frame's exact inner
 * width resting on its bottom edge over his faded body, and the quiet fixture foot inside the frame's bottom.
 */
export function Coachframe({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);
  const k = story ? 1.36 : 1;

  // A deep club colour stays as it is (navy stays navy); a mid one is brightened, a light one darkened.
  const raw = params.primary === "#10131c" ? params.accent : params.primary;
  let club = luminance(raw) < 0.1 && luminance(raw) > 0.02 ? raw : vivid(raw);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ink = "#1b1d22";
  const ground = "#f3f3f1";

  /* ---- the frame ---- */
  const FX = 70;
  const frameBottom = story ? STORY_BOTTOM : H - FX;
  const pad = story ? 34 : 28;
  const innerL = FX + pad;
  const innerW = CANVAS_W - 2 * (FX + pad);

  /* ---- the top: logo, role, name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const role = coachRole(data).toUpperCase();
  const roleSize = Math.min((story ? 22 : 17) * ts, 700 / Math.max(1, role.length * 1.3));
  const roleTop = logoTop + (story ? 88 + 56 : 52 + 42);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 36 : 28) * ts, 820 / Math.max(1, name.length * 1.0));
  const nameTop = roleTop + roleSize + (story ? 20 : 15);

  /* ---- the foot: fixture row, then date · kick-off · ground, inside the frame's bottom ---- */
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = line ? Math.min(14.5 * k * ts, (innerW - 20) / Math.max(1, line.length * 0.92)) : 0;
  const footBottom = frameBottom - pad;
  const lineTop = footBottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const crest = fixture ? Math.round(44 * k) : 0;
  const fixAvail = innerW - 2 * (crest + 20 * k);
  const fixSize = Math.min(19 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = (line ? lineTop - 18 * k : footBottom) - crest;
  const footTop = crest ? rowTop : line ? lineTop : footBottom;

  /* ---- the word, on the frame's bottom (over the foot) ---- */
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const letters = [...word.normalize("NFD").replace(/\p{M}/gu, "")];
  const shown = [...word.normalize("NFC")];
  const n = letters.length;
  const glyphs = letters.reduce((a, c) => a + adv(c), 0);
  const cap = FACES.anton.cap;
  let size = Math.min((innerW * ts) / Math.max(0.5, glyphs), ((story ? 300 : 230) * ts) / cap);
  // A short word capped in height is opened up with tracking until it fills the frame again.
  const track = n > 1 ? Math.max(0, Math.min(0.2, ((innerW * ts) / size - glyphs) / (n - 1))) : 0;
  const wordW = size * (glyphs + (n - 1) * track);
  const baseline = (footTop === footBottom ? footBottom : footTop - (story ? 46 : 36)) + (params.textY ?? 0);
  const wordTop = baseline - size * cap;
  let x = innerL + (innerW - wordW) / 2;
  const xs = letters.map((c) => {
    const at = x;
    x += (adv(c) + track) * size;
    return at;
  });
  size = Math.round(size * 10) / 10;

  /* ---- the coach: his bust from just under the name down into the word, fading there ---- */
  const fbox = data.face ?? [0.38, 0.06, 0.26, 0.2];
  const aspect = data.photoAspect ?? 0.6;
  const topLine = nameTop + nameSize + (story ? 46 : 34);
  // The trimmed cutout's top (his hair) just under the name; its foot reaches under the word's middle.
  const reach = wordTop + (baseline - wordTop) * 0.55;
  let h = Math.max(200, reach - topLine);
  const maxFace = Math.min(story ? 320 : 270, data.facePx > 0 ? Math.max(96, data.facePx * 1.2) : Infinity);
  if (h * fbox[3] > maxFace) h = maxFace / fbox[3];
  h *= params.playerScale ?? 1;
  const w = h * aspect;
  const faceH = h * fbox[3];
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 40 : 0);
  let left = faceX - w * (fbox[0] + fbox[2] / 2);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * left + w)) / 2));
  left += lean + (params.playerX ?? 0);
  const imgTop = topLine + (params.playerY ?? 0);
  const faceY = imgTop + h * fbox[1];
  const imgBottom = imgTop + h;
  // A bust is cut at the bottom: it is gone before its edge (and before the foot).
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  const fadeEnd = Math.min(cutBottom ? imgBottom - 6 : Infinity, baseline + 10, footTop - 10);
  const fadeFrom = Math.max(faceY + faceH * 1.5, Math.min(wordTop - (story ? 200 : 150), fadeEnd - (story ? 300 : 230)));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.32) ${(fadeFrom + fadeEnd) / 2 + 30}px, transparent ${fadeEnd}px)`;
  // The top edge crosses him at the shoulders: head and shoulders break out over it.
  const frameTop = Math.round(Math.min(faceY + faceH * 1.42, wordTop - (story ? 280 : 220)));

  const spaced = (fs: number, sp: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
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
  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, flexShrink: 0 }} />;
  const hair = story ? 3 : 2;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 45%, #ffffff, transparent 75%)" }} />

      {/* The hairline frame, behind him. */}
      <div style={{ position: "absolute", left: FX, right: FX, top: frameTop, height: frameBottom - frameTop, border: `${hair}px solid ${club}`, boxSizing: "border-box" }} />

      {/* The coach, breaking out over the frame's top edge, fading under the word. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left, top: imgTop, width: w, height: h, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word, letter by letter, to the frame's inner width. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: wordTop - size * 0.1, overflow: "visible" }}>
        {shown.map((c, i) => (
          <text key={i} x={xs[i]} y={size * 0.1 + size * cap} style={{ fontFamily: FACES.anton.family, fontWeight: 400, fontSize: size, fill: club }}>
            {c}
          </text>
        ))}
      </svg>

      <div style={spaced(roleSize, 0.6, { top: roleTop, fontWeight: 800, color: club })}>{role}</div>
      {name && <div style={spaced(nameSize, 0.4, { top: nameTop, fontWeight: 700, color: ink })}>{name}</div>}

      {/* The fixture foot, inside the frame's bottom. */}
      {crest > 0 && (
        <div style={{ position: "absolute", left: innerL, width: innerW, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
          {crestImg(homeCrest)}
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: ink, whiteSpace: "nowrap" }}>
            {homeName}
            {homeName && awayName && <span style={{ color: club, fontWeight: 500, margin: "0 0.45em" }}>v</span>}
            {awayName}
          </div>
          {crestImg(awayCrest)}
        </div>
      )}
      {line && <div style={spaced(lineSize, 0.3, { top: lineTop, fontWeight: 600, color: "rgba(27,29,34,.62)" })}>{line}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
