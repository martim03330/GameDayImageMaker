/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { keepHead } from "./doubleline";
import { EchoEdge, echoTones } from "./echoname";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const TRACK = 0.3;

/** `t` on one line if it fits `room` at `size`, else on two lines split at the most balanced space. */
function lines(t: string, size: number, room: number): string[] {
  if (!t) return [];
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2 || capsEm(t, TRACK) * size <= room) return [t];
  let best = 1;
  let worst = Infinity;
  for (let i = 1; i < words.length; i++) {
    const w = Math.max(capsEm(words.slice(0, i).join(" "), TRACK), capsEm(words.slice(i).join(" "), TRACK));
    if (w < worst) [worst, best] = [w, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Goal echo corners: the celebrating player, sharp and in natural colour, centred on a clean deep club ground
 * with one hairline echo of his edge offset behind him (echoline's echo), and every word pushed out to the
 * four corners in tiny tracked caps — "GOAL" top left, the competition top right, his name bottom left, the
 * fixture bottom right (home first, names exactly as stored, no score). The NEYOD logo alone at the bottom
 * centre, between the two lower corners.
 */
export function Goalechocorner({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const toLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const whiteEcho = r() < 0.4;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const { deep, lift, echo } = echoTones(data, whiteEcho);
  const f = matchFacts(data);
  const M = story ? 60 : 56;

  /* ---- the four corners ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const comp = (f.comp || "").trim().toUpperCase();
  const first = (content.firstName ?? "").trim().toUpperCase();
  const last = (content.lastName ?? "").trim().toUpperCase();
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  // Each corner keeps clear of the logo between the lower two (logo ~3.2× as wide as tall).
  const logoH = story ? 88 : 52;
  const room = (CANVAS_W - 2 * M - logoH * 3.3 * (params.logoScale ?? 1) - 2 * 44 * k) / 2;
  const S0 = 14 * k * ts;
  const tl = [kicker];
  const topRoom = (CANVAS_W - 2 * M - 120 * k) / 2;
  const tr = lines(comp, S0, topRoom);
  const bl = first && last ? [first, last] : [first || last].filter(Boolean);
  const br = teams.length === 2 ? [teams[0], `v  ${teams[1]}`] : [];
  const widest = (ls: string[]) => Math.max(1, ...ls.map((l) => capsEm(l, TRACK)));
  const size = Math.max(10 * k, Math.min(S0, topRoom / widest([...tl, ...tr]), room / widest([...bl, ...br])));
  const LH = size * 1.65;

  const topY = (story ? STORY_TOP : M + 4) + (params.textY ?? 0);
  const bottomY = story ? STORY_BOTTOM : H - 52;

  /* ---- the player, centred; wide celebrations scaled down to keep the echo in frame ---- */
  const sizes = story ? { chest: 300, waist: 246, knees: 196, full: 156 } : { chest: 232, waist: 188, knees: 150, full: 120 };
  const faceTop = story ? 430 : 290;
  let box = placeByFace(data, 540, faceTop, sizes);
  const wide = Math.min(1, (story ? 880 : 840) / box.width);
  if (wide < 1) box = placeByFace(data, 540, faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  // His raised hands stay clear of the top corners.
  box = keepHead(data, { ...box, left: box.left + lean }, topY + LH * Math.max(tl.length, tr.length) + 36 * k, true);
  const dx = (toLeft ? -40 : 40) * k;
  const dy = -32 * k;

  const caps = (weight: number, alpha: number, align: "left" | "right"): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${TRACK}em`, lineHeight: `${LH}px`, whiteSpace: "nowrap", color: `rgba(255,255,255,${alpha})`, textAlign: align, ...(align === "right" ? { marginRight: `-${TRACK}em` } : {}) });
  const corner = (ls: string[], pos: CSSProperties, weight: number, alpha: number, align: "left" | "right") =>
    ls.length > 0 && (
      <div style={{ position: "absolute", ...pos, ...caps(weight, alpha, align) }}>
        {ls.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    );
  // Line boxes carry ~0.33em of leading above the caps: shift so the caps themselves sit on the margins.
  const lead = (LH - size * 0.72) / 2;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 48% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 82%)` }} />

      {data.photoUrl && <EchoEdge id="goalechocorner" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={0} />}

      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}d8 40%, ${deep} 64%)` : `linear-gradient(to bottom, transparent, ${deep}d8 56%, ${deep} 84%)` }} />

      {corner(tl, { left: M, top: topY - lead }, 600, 1, "left")}
      {corner(tr, { right: M, top: topY - lead }, 500, 0.72, "right")}
      {corner(bl, { left: M, bottom: H - bottomY - lead }, 600, 1, "left")}
      {corner(br, { right: M, bottom: H - bottomY - lead }, 500, 0.72, "right")}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
