/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { EchoEdge, echoTones, headClear } from "./echoname";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * The crest as one flat tint of `color`: its inks by darkness (white areas nearly vanish, dark ones dense),
 * so the emblem keeps a hint of its drawing while staying a watermark.
 */
function TintDefs({ id, color }: { id: string; color: string }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.24 -0.46 -0.1 1 0" result="a" />
        <feFlood floodColor={color} />
        <feComposite in2="a" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * Echo crest: echoline (the player in natural colour on a deep club ground, one hairline echo of his edge
 * offset behind him) with his club crest set large and very faint on the free side — a watermark in a tint of
 * the ground, partly behind him. The echo slips toward the crest. The title small at the top; crests, the
 * fixture (home first, names exactly as stored) and date · kick-off · ground small at the foot.
 */
export function Echocrest({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  // `side` = the free side: where the crest sits and the echo slips; the player stands a little off to the other.
  const toLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const whiteEcho = r() < 0.4;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { club, deep, lift, echo } = echoTones(data, whiteEcho);
  const f = matchFacts(data);

  /* ---- the title ---- */
  const title = (postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34;

  /* ---- the player, off-centre, and his echo ---- */
  const off = (toLeft ? 1 : -1) * (story ? 80 : 90);
  const box = headClear(data, story ? placeByFace(data, 540 + off, 470, { chest: 340, waist: 272, knees: 204, full: 156 }) : placeByFace(data, 540 + off, 270, { chest: 270, waist: 214, knees: 160, full: 120 }), clipTop + 30 * k);
  const dx = (toLeft ? -42 : 42) * k;
  const dy = -34 * k;

  /* ---- the watermark: our crest, large and faint on the free side ---- */
  const mark = data.club?.crestUrl ?? f.ourCrest ?? null;
  const MS = story ? 820 : 660;
  const markCx = toLeft ? (story ? 300 : 290) : CANVAS_W - (story ? 300 : 290);
  const markCy = story ? 820 : 600;
  const tint = shade(club, 0.2);

  /* ---- the foot ---- */
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo (~88px) ends at STORY_BOTTOM, top 1592; the date line ends 64px above it.
  const whenTop = story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize;
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 42 * k;
  const crestTop = fixTop - CR - 28 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${toLeft ? 56 : 44}% 40%, ${lift}, ${deep} 80%)` }} />

      {/* The watermark. */}
      {mark && (
        <>
          <TintDefs id="echocrest-tint" color={tint} />
          <img data-bleed src={mark} alt="" style={{ position: "absolute", left: markCx - MS / 2, top: markCy - MS / 2, width: MS, height: MS, objectFit: "contain", filter: "url(#echocrest-tint)", opacity: 0.13 }} />
        </>
      )}

      {data.photoUrl && <EchoEdge id="echocrest" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={clipTop} />}

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 880 : 520, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 30%, ${deep} 52%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
