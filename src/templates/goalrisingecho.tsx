/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { capsEm, withAlpha } from "./rippleecho";
import { placeRising, RisingEchoes, type Echo } from "./risingecho";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal rising echo: the celebrating player in natural colour, centred on a clean deep ground, and his own
 * silhouette edge repeated straight upward as crisp hairlines — the raised fist echoed higher and higher —
 * the nearest, brightest echo in the lifted club colour, the rest white and fading as they rise. "GOAL"
 * small at the top; his name and the fixture (home first, names exactly as stored, no score) small at the foot.
 */
export function Goalrisingecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;

  const club = clubTone(data);
  const deep = shade(club, -0.82);
  const lift = shade(club, -0.58);
  const bright = luminance(club) < 0.12 ? shade(club, 0.42) : shade(club, 0.26);

  /* ---- title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.6;
  const tSize = Math.max(14 * k, Math.min(24 * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34 * k;

  /* ---- the player and the echoes rising out of him ---- */
  const n = 3;
  const step = story ? 72 : 58;
  const box = story
    ? placeRising(data, 640, { chest: 280, waist: 228, knees: 176, full: 132 }, clipTop, n * step * 0.75 + 30, 200, 1000, 110)
    : placeRising(data, 430, { chest: 220, waist: 178, knees: 136, full: 100 }, clipTop, n * step * 0.75 + 10, 130, 1000, 90);
  const echoes: Echo[] = [
    { color: withAlpha(bright, 1), opacity: 1 },
    { color: "rgba(255,255,255,1)", opacity: 0.44 },
    { color: "rgba(255,255,255,1)", opacity: 0.2 },
    { color: "rgba(255,255,255,1)", opacity: 0.12 },
  ].slice(0, n);

  /* ---- foot: name, fixture ---- */
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const N_TRACK = 0.22;
  const nameSize = Math.max(16, Math.min(30 * k, 860 / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : "";
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(15 * k, 860 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  // Story: the logo is ~88px tall and ends at STORY_BOTTOM (top 1592); the fixture ends 64px above it.
  const fixTop = story ? STORY_BOTTOM - 88 - 64 - fixSize : CANVAS_H - 150 - fixSize;
  const nameTop = fixTop - nameSize - 22 * k;
  const ruleTop = nameTop - 30 * k;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 50% at 50% ${story ? 32 : 34}%, ${lift}, ${deep} 82%)` }} />

      <RisingEchoes id="goalrisingecho" data={data} box={box} H={H} clipTop={clipTop} step={step} echoes={echoes} width={story ? 1.6 : 1.25} fade={[-0.55, 0.4]} />

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 820 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 36%, ${deep} 58%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      <div style={{ position: "absolute", left: CANVAS_W / 2 - 18 * k, width: 36 * k, top: ruleTop, height: Math.max(2, 2 * k), background: bright }} />
      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 400), color: "rgba(255,255,255,.78)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
