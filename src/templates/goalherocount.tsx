/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES } from "./goalhero";
import { seasonGoals } from "./goalherotally";
import { mix } from "./heroghost";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' ";
/** Anton advances per 100px: goalhero's letters plus heromatch's measured figures. */
const ANTON = FACES.anton.widths.split(" ").map(Number);
const ANTON_DIGITS = "49 33 49 49 49 49 49 49 49 49".split(" ").map(Number);
const adv = (c: string) => (/[0-9]/.test(c) ? ANTON_DIGITS[+c] : (ANTON[ORDER.indexOf(c)] ?? 48)) / 100;

/**
 * Goal hero · count — the goal hero (`goalhero.tsx`) whose hero is his season tally: on the off-white ground the
 * NEYOD logo small at the top, the kicker ("GOAL") small and his name wide-spaced above, then his goal number this
 * season as two Anton digits ("06") set huge in the club colour at their exact measured width, the leading zero in
 * a pale tint, "GOALS THIS SEASON" small and spaced under it, and the celebrating player big under that, fading
 * into the ground. No score. With no count, the kicker itself becomes the hero (as goalhero).
 */
export function Goalherocount({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ground = "#f3f3f1";
  const pale = mix(club, ground, 0.2);
  const M = 80;
  const cap = FACES.anton.cap;

  const n = seasonGoals(data);
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const counted = n > 0 && n < 1000;

  /* ---- the top: logo, kicker, name ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const kickSize = counted ? Math.min((story ? 24 : 19) * ts, 700 / Math.max(1, kicker.length * 1.4)) : 0;
  const kickTop = logoTop + (story ? 150 : 102);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = counted ? kickTop + kickSize + (story ? 18 : 14) : logoTop + (story ? 150 : 108);

  /* ---- the hero: the two digits (or the kicker), letter by letter at their measured advances ---- */
  const hero = counted ? String(n).padStart(2, "0") : kicker;
  const lead = counted && n < 10 ? 1 : 0; // the leading zero, drawn pale
  const letters = [...hero.normalize("NFD").replace(/\p{M}/gu, "")];
  const shown = [...hero.normalize("NFC")];
  const glyphs = letters.reduce((a, c) => a + adv(c), 0);
  const track = counted ? 0.02 : 0;
  const em = glyphs + (letters.length - 1) * track;
  const maxCap = (counted ? (story ? 480 : 360) : story ? 460 : 380) * ts;
  const size = Math.round(Math.min(((CANVAS_W - 2 * M) * ts) / Math.max(0.5, em), maxCap / cap) * 10) / 10;
  const heroW = size * em;
  const capTop = nameTop + nameSize + (story ? 40 : 30) + (params.textY ?? 0);
  const baseline = capTop + size * cap;
  let x = (CANVAS_W - heroW) / 2;
  const xs = letters.map((c) => {
    const at = x;
    x += (adv(c) + track) * size;
    return at;
  });

  const fact = counted ? (n === 1 ? "GOAL THIS SEASON" : "GOALS THIS SEASON") : "";
  const factSize = Math.min((story ? 24 : 19) * ts, 820 / Math.max(1, fact.length * 1.1));
  const factTop = baseline + (story ? 32 : 24);
  const under = fact ? factTop + factSize : baseline;

  /* ---- the player: his top just under the fact, big, fading into the ground ---- */
  const sizes = story ? { chest: 420, waist: 360, knees: 260, full: 196 } : { chest: 310, waist: 270, knees: 200, full: 150 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 30 : 22;
  let faceTop = under + 200;
  // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
  for (let i = 0; i < 2; i++) faceTop += under + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  const spaced = (fs: number, sp: number, extra: React.CSSProperties): React.CSSProperties => ({
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
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The number (or the word), at its measured width. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: capTop - size * 0.1, overflow: "visible" }}>
        {shown.map((c, i) => (
          <text key={i} x={xs[i]} y={size * 0.1 + size * cap} style={{ fontFamily: FACES.anton.family, fontWeight: 400, fontSize: size, fill: i < lead ? pale : club }}>
            {c}
          </text>
        ))}
      </svg>

      {/* The player, in front of the number's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {fact && <div style={spaced(factSize, 0.5, { top: factTop, fontWeight: 700, color: club })}>{fact}</div>}
      {counted && <div style={spaced(kickSize, 0.7, { top: kickTop, fontWeight: 800, color: club })}>{kicker}</div>}
      {name && <div style={spaced(nameSize, 0.55, { top: nameTop, fontWeight: counted ? 700 : 800, color: counted ? "#1b1d22" : club })}>{name}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: STORY_BOTTOM, bottom: 0, background: `linear-gradient(to bottom, transparent, ${ground})` }} />}
    </div>
  );
}
