/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#efece6";
const INK = "#15161a";

/** Inter ExtraLight (200) capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 70, B: 64, C: 71, D: 72, E: 58, F: 56, G: 74, H: 73, I: 26, J: 52, K: 66, L: 54, M: 88, N: 74, O: 77, P: 61, Q: 77, R: 63, S: 61, T: 62, U: 72, V: 68, W: 99, X: 67, Y: 65, Z: 63, " ": 26, "'": 26, "-": 44, ".": 26 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 64) / 100 + tracking, 0);

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/**
 * Namecorners: a name-led editorial page. His first name small and light in one top corner, his surname set
 * large in thin, widely tracked capitals in the opposite bottom corner, the player standing between them in
 * natural colour on a clean ground. The crests sit small in the other top corner; the title and the fixture
 * run small along the bottom edge, level with the agency logo.
 */
export function Namecorners({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const dark = r() < 0.5;
  // Default: first name top-left, surname bottom-right; side "left" mirrors it.
  const flip = params.side === "left";
  const M = story ? 72 : 64;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const ground = dark ? shade(club, -0.8) : PAPER;
  const ink = dark ? "#ffffff" : INK;
  const soft = dark ? "rgba(255,255,255,.68)" : "rgba(21,22,26,.62)";
  const mark = dark ? shade(club, 0.5) : luminance(club) > 0.3 ? shade(club, -0.35) : club;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score && postType !== "goal";

  /* ---- the names ---- */
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim() || first;
  const firstShown = last === first ? "" : first;
  const sTrack = 0.16;
  const sMaxW = CANVAS_W - 2 * M;
  const sSize = Math.min((story ? 190 : 150) * ts, sMaxW / Math.max(1, capsEm(last, sTrack) - sTrack));
  const fSize = Math.min(46 * k * ts, (CANVAS_W * 0.45) / Math.max(1, firstShown.length * 0.5));

  /* ---- the bottom edge: title + fixture, the logo opposite ---- */
  const title = postType === "result" && hasScore ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase());
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? ` ${score} ` : " v ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const infoW = story ? 640 : 620;
  const lineSize = (t: string, max: number) => Math.max(12 * k, Math.min(max * k * ts, infoW / Math.max(1, t.length * 0.53)));
  const fixSize = lineSize(`${title}   ${fixture}`, 19);
  const whenSize = Math.min(fixSize * 0.88, lineSize(when, 16));

  // Story: logo ends at STORY_BOTTOM, the info row level with it; the surname sits clear above.
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const infoBottom = (story ? H - STORY_BOTTOM : 56) - (params.textY ?? 0) * 0;
  const surnameBottom = (story ? H - STORY_BOTTOM + logoH + 78 : 56 + logoH + 44) - (params.textY ?? 0);
  const capH = sSize * 0.727;

  /* ---- the player, between the names ---- */
  const faceX = 540 + (flip ? -40 : 40);
  const box = story ? placeByFace(data, faceX, STORY_TOP + 230, { chest: 400, waist: 320, knees: 236, full: 170 }) : placeByFace(data, faceX, 190, { chest: 310, waist: 240, knees: 178, full: 128 });
  const fade = H - surnameBottom - capH - (story ? 260 : 170);

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const cS = Math.round(40 * k);

  const firstSide: CSSProperties = flip ? { right: M, textAlign: "right" } : { left: M, textAlign: "left" };
  const lastSide: CSSProperties = flip ? { left: M - sSize * 0.02, textAlign: "left" } : { right: M - sSize * sTrack, textAlign: "right" };
  const logoSide: CSSProperties = flip ? { right: M } : { left: M };
  const infoSide: CSSProperties = flip ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* A breath of light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: dark ? `radial-gradient(60% 50% at 50% 40%, ${shade(ground, 0.16)}, ${ground} 70%)` : `radial-gradient(60% 50% at 50% 40%, #f8f6f2, ${PAPER} 75%)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}
      {/* He dissolves into the ground low down, so the surname reads clean. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: fade, bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground} ${story ? 380 : 260}px)` }} />

      {/* First name: small, light, top corner. */}
      {firstShown && (
        <div style={{ position: "absolute", top: (story ? STORY_TOP : M - 8) + (params.textY ?? 0) * 0, ...firstSide, fontFamily: SANS, fontWeight: 300, fontSize: fSize, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
          {firstShown}
        </div>
      )}

      {/* Crests: small, the other top corner. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: story ? STORY_TOP - 2 : M - 10, ...(flip ? { left: M } : { right: M }), display: "flex", gap: 14 * k, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* Surname: large, thin, wide, the opposite bottom corner. */}
      <div
        style={{
          position: "absolute",
          bottom: surnameBottom - sSize * 0.2,
          ...lastSide,
          fontFamily: SANS,
          fontWeight: 200,
          fontSize: sSize,
          lineHeight: 1,
          letterSpacing: `${sTrack}em`,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {last}
      </div>

      {/* Bottom edge: title + fixture, then date · kick-off · ground. */}
      <div style={{ position: "absolute", bottom: infoBottom, ...infoSide, display: "flex", flexDirection: "column", gap: 8 * k, maxWidth: infoW, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        <div style={{ fontSize: fixSize, fontWeight: 400, color: ink }}>
          <span style={{ fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", fontSize: fixSize * 0.78, color: mark, marginRight: "0.9em" }}>{title}</span>
          {fixture}
        </div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 300, color: soft }}>{when}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight={!dark}
        style={{ position: "absolute", ...logoSide, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: flip ? "right bottom" : "left bottom" }}
      />
      <Film strength={dark ? 0.16 : 0.1} />
    </div>
  );
}
