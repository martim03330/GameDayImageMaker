/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { teamsOf } from "./notify";
import { ContactShade, mix, PaperTooth, paperTones } from "./paperecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { SilhouetteFill, twinPair, WordFill } from "./typesilhouette";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

const rgba = (h: string, a: number) => {
  const m = h.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const [r, g, b] = m ? [1, 2, 3].map((i) => parseInt(m[i], 16)) : [0, 0, 0];
  return `rgba(${r},${g},${b},${a})`;
};

/**
 * The shared body of the paper type silhouette looks: typesilhouette on warm off-white paper. The player in
 * natural colour with a soft shade where he meets the paper, melting into it above the foot; beside him a twin
 * of his silhouette (same size, offset to the free side) made only of tiny tracked caps of the match facts in
 * the deep club colour, over a faint club wash. Matchday: the title small at the top, crests, fixture and
 * date · kick-off · ground small at the foot. Goal: "GOAL" at the top, his name and the fixture (home first,
 * never the score) at the foot. Ink type, dark NEYOD logo. Flips with params.side.
 */
export function PaperTypeSilhouette({ data, goal }: { data: RenderData; goal?: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? (goal ? 37 : 29));
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const { club, paper, light, edge, ink } = paperTones(data);
  // The words: the deep club colour (a dark club colour lifted a touch so it isn't just black).
  const deepClub = luminance(club) > 0.1 ? shade(club, -0.38) : luminance(club) < 0.03 ? shade(club, 0.2) : club;
  const word = rgba(deepClub, 0.68);
  const wash = mix(paper, club, 0.07);

  /* ---- title ---- */
  const title = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'");
  const T_TRACK = goal ? 0.6 : 0.55;
  const tSize = Math.max(13 * k, Math.min((goal ? 24 : story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + (story ? 44 : 30);

  /* ---- foot ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const fixture = teams.join("   v   ").toUpperCase() || (goal ? "" : (f.comp || "").toUpperCase());
  const F_TRACK = goal ? 0.28 : 0.3;
  const fixSize = Math.max(goal ? 11 : 12, Math.min((goal ? 15 : 17) * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const date = niceDate(content.date);
  const when = goal ? "" : [date, f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const name = goal ? [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ") : "";
  const N_TRACK = 0.22;
  const nameSize = Math.max(16, Math.min(28 * k, 860 / Math.max(1, capsEm(name.toUpperCase(), N_TRACK)))) * ts;
  const crests = goal ? [] : ((content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]);
  const CR = 40 * k;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  let fixTop: number, whenTop = 0, nameTop = 0, crestTop = 0;
  if (goal) {
    fixTop = logoTop - 64 - fixSize - (params.textY ?? 0);
    nameTop = fixTop - 22 * k - nameSize;
  } else {
    whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
    fixTop = whenTop - fixSize - 22 * k;
    crestTop = fixTop - CR - 26 * k;
  }
  const footTop = goal ? (name ? nameTop : fixTop) : crests.length ? crestTop : fixTop;

  /* ---- the pair ---- */
  const pairAt = () => {
    return twinPair(data, goal
      ? {
          onLeft,
          faceTop: story ? 400 : 290,
          sizes: story ? { chest: 300, waist: 236, knees: 180, full: 140 } : { chest: 236, waist: 188, knees: 144, full: 112 },
          minHead: titleTop + tSize + (story ? 64 : 44),
          twinMinHead: clipTop + 16,
          wholeTop: true,
          lift: story ? 36 : 26,
        }
      : {
          onLeft,
          faceTop: story ? 420 : 270,
          sizes: story ? { chest: 320, waist: 254, knees: 190, full: 138 } : { chest: 262, waist: 206, knees: 156, full: 120 },
          minHead: titleTop + tSize + (story ? 80 : 56),
          twinMinHead: titleTop + tSize + (story ? 60 : 42),
          lift: story ? 36 : 26,
        });
  };
  // A wide celebration: the twin's outer reach (a raised fist) stays on the paper — shrink the pair about his
  // face (never below 74%) unless the photo frame itself cut him on that side. (Scaling the sizes alone does
  // nothing for a low-resolution photo: placeByFace caps him by the photo's face pixels.)
  let { box, twin } = pairAt();
  const twinCut = ((onLeft ? data.cut?.right : data.cut?.left) ?? 0) > 0;
  if (!twinCut) {
    const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
    const fx = box.left + (face[0] + face[2] / 2) * box.width;
    const fy = box.top + face[1] * box.height;
    const outer = onLeft ? twin.left + twin.width * 0.985 : twin.left + twin.width * 0.015;
    const D = Math.abs(outer - fx);
    const room = onLeft ? CANVAS_W + 24 - fx : fx + 24;
    if (D > room) {
      const g = Math.max(0.74, room / D);
      const sc = (b: typeof box) => ({ left: fx + (b.left - fx) * g, top: fy + (b.top - fy) * g, width: b.width * g, height: b.height * g });
      box = sc(box);
      twin = sc(twin);
    }
  }

  /* ---- the words that make the twin (never the score) ---- */
  const phrase = (goal ? [title, name, teams.join(" v ")] : [title, teams.join(" v "), date, f.time, f.venue]).filter(Boolean).join(" · ").toUpperCase() + " ·";

  // He melts into the paper above the foot.
  const fadeEnd = footTop - (story ? 44 : 30);
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - (story ? 400 : 300) - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 56% at 50% 40%, ${light}, ${paper} 62%, ${edge})` }} />

      {data.photoUrl && (
        <SilhouetteFill url={data.photoUrl} twin={twin} cut={data.cut} clipTop={clipTop} fadeEnd={footTop - (story ? 160 : 120)} H={H} base={wash}>
          <WordFill phrase={phrase} size={(story ? 13.5 : 11) * ts} color={word} width={twin.width} height={twin.height} />
        </SilhouetteFill>
      )}

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={!onLeft} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: goal ? "contrast(1.03) saturate(1.03)" : "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, goal ? 400 : 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR + 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name.toUpperCase()}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 500, goal ? { opacity: 0.78 } : undefined) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: ink, opacity: 0.72 }}>{when}</div>}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <PaperTooth />
    </div>
  );
}

/**
 * Paper type silhouette: typesilhouette on warm off-white paper — the player in natural colour, and beside him
 * a twin of his silhouette made only of tiny tracked caps of the match facts in the deep club colour. The
 * title small in ink at the top; crests, fixture (home first, names exactly as stored) and date · kick-off ·
 * ground small at the foot. Flips with params.side.
 */
export function Papertype({ data }: { data: RenderData }) {
  return <PaperTypeSilhouette data={data} />;
}
