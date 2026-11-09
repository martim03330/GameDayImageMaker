/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, noLogoDrop, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce(
    (a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking,
    0,
  );

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/**
 * Echoline: the player in natural colour on a clean deep ground, and one thin echo of his silhouette — the
 * cutout's own edge drawn as a hairline — offset behind him in the club colour or white. The title small
 * at the top, crests, fixture and date small at the foot.
 */
export function Echoline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const toLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const whiteEcho = r() < 0.4;
  // Native Instagram story (1080×1920): title at STORY_TOP, logo ending at STORY_BOTTOM with the foot just above it, type ~1.4×.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const drop = noLogoDrop(data);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  // The echo: white, or the club colour lifted enough to read on its own deep tone.
  const echo = whiteEcho ? "rgba(255,255,255,.75)" : luminance(club) < 0.12 ? shade(club, 0.4) : shade(club, 0.12);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the title ---- */
  const title = (isResult && postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player and his echo ---- */
  const box = story
    ? placeByFace(data, 540, 330, { chest: 420, waist: 330, knees: 240, full: 180 })
    : placeByFace(data, 540, 250, { chest: 290, waist: 228, knees: 170, full: 128 });
  const dx = (toLeft ? -42 : 42) * k;
  const dy = -34 * k;

  /* ---- the foot ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? pair.join(isResult ? `   ${score}   ` : "   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), isResult ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const whenTop = story ? STORY_BOTTOM - 100 - 50 - whenSize * 1.2 : CANVAS_H - 150 - whenSize;
  const fixTop = whenTop - fixSize - 22 * k;
  const crestTop = fixTop - 70 * k;
  const CR = 42 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: WHITE,
    textAlign: "center",
  });
  const ex = box.left + dx;
  const ey = box.top + dy;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {/* Everything but the ground, centred in the story when there is no logo at the foot. */}
      <div style={{ position: "absolute", inset: 0, transform: drop ? `translateY(${drop}px)` : undefined }}>
        {/* The echo: his outline as a hairline, offset behind him. */}
        {data.photoUrl && (
          <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
            <defs>
              <filter
                id="echoline-edge"
                filterUnits="userSpaceOnUse"
                x={ex + 5}
                y={ey + 5}
                width={box.width - 10}
                height={box.height - 10}
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
                <feComponentTransfer in="s" result="a">
                  <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
                </feComponentTransfer>
                <feMorphology in="a" operator="dilate" radius={2} result="d" />
                <feComposite in="d" in2="a" operator="out" result="ring" />
                <feFlood floodColor={echo} />
                <feComposite in2="ring" operator="in" />
              </filter>
              <clipPath id="echoline-clip">
                <rect x={0} y={titleTop + tSize + 34} width={CANVAS_W} height={H} />
              </clipPath>
            </defs>
            <image
              clipPath="url(#echoline-clip)"
              href={data.photoUrl}
              x={ex}
              y={ey}
              width={box.width}
              height={box.height}
              preserveAspectRatio="none"
              filter="url(#echoline-edge)"
            />
          </svg>
        )}

        {/* The player, natural colour. */}
        {data.photoUrl && (
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              maxWidth: "none",
              filter: "contrast(1.04)",
              ...cutMask(data.cut),
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: story ? 880 : 520,
            background: story
              ? `linear-gradient(to bottom, transparent, ${deep}e0 30%, ${deep} 52%)`
              : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})`,
          }}
        />

        {/* Top: the title. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

        {/* Foot: crests, fixture, date · kick-off · ground. */}
        {crests.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: crestTop,
              height: CR + 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 28 * k,
            }}
          >
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
            ))}
          </div>
        )}
        {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
        {when && (
          <div
            style={{
              position: "absolute",
              left: M,
              right: M,
              top: whenTop,
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: 300,
              fontSize: whenSize,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              color: "rgba(255,255,255,.78)",
            }}
          >
            {when}
          </div>
        )}
      </div>
      <AgencyLogo
        data={data}
        height={story ? 26 : 18}
        style={{
          position: "absolute",
          left: "50%",
          bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0),
          transform: `translateX(-50%) scale(${params.logoScale ?? 1})`,
          transformOrigin: "center bottom",
        }}
      />
      <Film strength={0.18} />
    </div>
  );
}
