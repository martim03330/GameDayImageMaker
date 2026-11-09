/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film, GradientMapDefs, type Box } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 60;

/** Inter advance widths per 100px for the numerals. */
const NUM_W: Record<string, number> = { "0": 60.4, "1": 38, "2": 61.8, "3": 59.4, "4": 61.2, "5": 56.6, "6": 58.3, "7": 55.3, "8": 60.4, "9": 58.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/**
 * A back shot without a usable face: placed by its outline. The top of the cutout (head, or a raised
 * fist) at `top`, the body running off the foot; scaled and nudged like any other look.
 */
function placeBack(data: RenderData, top: number, floor = CANVAS_H + 40, maxW = 900): Box {
  const p = data.params;
  const aspect = data.photoAspect ?? 0.6;
  const scale = p.playerScale ?? 1;
  // Wide photos (arms out) are fitted by width, slim ones by height.
  let h = (floor - top) * scale;
  if (h * aspect > maxW * scale) h = (maxW * scale) / aspect;
  const w = h * aspect;
  return { left: 540 - w / 2 + (p.playerX ?? 0), top: top + (p.playerY ?? 0), width: w, height: h };
}

/**
 * Backline: made for a photo from behind, his name and number on the shirt. A quiet deep club-tone
 * ground (his own photo melted into one hue), the player centred, and his shirt number repeated huge
 * behind him as a hairline outline. The surname in wide-tracked caps above him, the title small under
 * it; at the foot the crests and two quiet lines of fixture, date, kick-off and ground.
 */
export function Backline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920) spreads the same design over the tall band (STORY_TOP..STORY_BOTTOM), type ~1.45× larger.
  const ts = (params.textScale ?? 1) * (story ? 1.45 : 1);
  // Width budgets: scaled with the type in the post, held to the canvas in the story.
  const wk = story ? (params.textScale ?? 1) * 1.08 : ts;
  const r = rng(params.seed ?? 1);
  const flat = r() < 0.4;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const deep = shade(club, -0.74);
  const mid = shade(club, -0.52);
  const light = shade(club, -0.22);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- top: surname, then the title ---- */
  const surname = (content.lastName || content.firstName || "").toUpperCase();
  const NAME_TRACK = 0.62;
  const nameSize = Math.min(30 * ts, (820 * wk) / Math.max(1, capsEm(surname, NAME_TRACK)));
  const title = (isResult && postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const TITLE_TRACK = 0.5;
  const titleSize = Math.max(11 * ts, Math.min(14 * ts, (640 * wk) / Math.max(1, capsEm(title, TITLE_TRACK))));
  const nameTop = (story ? STORY_TOP : 74) + (params.textY ?? 0);
  const ruleY = nameTop + nameSize + 26;
  const titleTop = ruleY + 24;

  /* ---- the foot ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const crestS = story ? 72 : 46;
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? (isResult ? `${pair[0]}   ${score}   ${pair[1]}` : `${pair[0]}   —   ${pair[1]}`) : (f.comp || "").toUpperCase();
  const FIX_TRACK = 0.32;
  const fixSize = Math.max(11 * ts, Math.min(14 * ts, (860 * wk) / Math.max(1, capsEm(fixture, FIX_TRACK))));
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14 * ts, Math.min(19 * ts, (900 * wk) / Math.max(1, when.length * 0.5)));
  const whenTop = story ? H - logoBottom - 108 - 44 - whenSize * 1.2 : CANVAS_H - 44 - 30 - 46;
  const fixtureTop = whenTop - (story ? fixSize + 34 : 34);
  const crestTop = fixtureTop - (story ? crestS + 44 : 78);
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  /* ---- the player: by his face when the photo has one, else by his outline ---- */
  const back = !data.face || data.face[3] < 0.035;
  const figTop = titleTop + titleSize + (story ? 90 : 70);
  const box: Box = back ? placeBack(data, figTop, story ? H - 110 : CANVAS_H + 40, story ? 1040 : 900) : placeByFace(data, 540, figTop + 30, story ? { chest: 280, waist: 214, knees: 164, full: 130 } : { chest: 210, waist: 156, knees: 120, full: 96 });
  const fadeEnd = crestTop - 26;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 300 - box.top}px, transparent ${fadeEnd - box.top}px)`;

  /* ---- the number behind him ---- */
  const num = (data.player.number || "").replace(/\D/g, "").slice(0, 2);
  const numEm = plain(num).reduce((a, c) => a + (NUM_W[c] ?? 60) / 100, 0);
  const numSize = Math.min(1060, 960 / Math.max(0.5, numEm));
  // The numeral's cap height starts a little above his head, so it frames his shoulders.
  const numBase = Math.min(figTop - 40 + numSize * 0.727, H - (story ? 420 : 150));

  const own = data.bgPhotoUrl ?? sceneOf(data);
  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: mid, color: WHITE }}>
      <GradientMapDefs id="backline-tone" dark={deep} mid={mid} light={light} />

      {/* Ground: one deep hue — his photo melted into it, or flat with a soft lift behind him. */}
      {!flat && own && (
        <img
          src={own}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(40px) url(#backline-tone) contrast(.75)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 44%, ${flat ? shade(club, -0.38) : "transparent"}, ${deep}${flat ? "" : "aa"} 100%)` }} />

      {/* The number, a hairline outline, huge behind him. */}
      {num && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text
            x={540}
            y={numBase}
            textAnchor="middle"
            fontFamily="var(--font-inter), system-ui, sans-serif"
            fontWeight={600}
            fontSize={numSize}
            letterSpacing={-numSize * 0.02}
            fill="none"
            stroke="rgba(255,255,255,.42)"
            strokeWidth={1.6}
          >
            {num}
          </text>
        </svg>
      )}

      {/* The player, natural colour, melting away above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) drop-shadow(0 24px 50px rgba(0,0,0,.35))", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: surname, hairline, title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, ...caps(nameSize, NAME_TRACK, 300) }}>{surname}</div>
      <div style={{ position: "absolute", left: 540 - 22, top: ruleY, width: 44, height: 1, background: "rgba(255,255,255,.6)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(titleSize, TITLE_TRACK), opacity: 0.75 }}>{title}</div>

      {/* Foot: crests, the fixture, then date · kick-off · ground. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crestS + 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.35))" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: fixtureTop, ...caps(fixSize, FIX_TRACK) }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.82)" }}>{when}</div>
      )}

      <AgencyLogo data={data} height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.22} />
    </div>
  );
}
