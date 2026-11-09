/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { bodyW, clubTone, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** How many marks the post counts: the kicker's word, else a number in it, else the "Goals" stat. */
function countOf(data: RenderData): number {
  const kick = (data.content.kicker || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const words: Record<string, number> = { GOAL: 1, GOLO: 1, BRACE: 2, DOUBLE: 2, HATTRICK: 3, POKER: 4, HAUL: 4 };
  if (words[kick]) return words[kick];
  const n = parseInt(kick.replace(/\D/g, ""), 10);
  if (n > 0) return Math.min(5, n);
  const stat = (data.content.stats ?? []).find((s) => /goal/i.test(s.label));
  const g = parseInt(String(stat?.value ?? ""), 10);
  return g > 0 ? Math.min(5, g) : 1;
}

/**
 * One tally stroke as a filled outline: a slightly bowed line from (x0,y0) to (x1,y1), its width breathing
 * a little along the way (heavier where the pen lands, a soft taper where it lifts), round ends.
 */
function strokePath(x0: number, y0: number, x1: number, y1: number, w: number, rand: () => number): string {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const bow = (rand() < 0.5 ? -1 : 1) * (0.22 + rand() * 0.3) * w;
  const wob = rand() * Math.PI * 2;
  const hook = (rand() < 0.5 ? -1 : 1) * w * 0.14;
  const N = 40;
  const L: [number, number][] = [];
  const R: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // the bow of the hand, a little drift, and a small hook where the pen lands
    const off = Math.sin(t * Math.PI) * bow + Math.sin(t * Math.PI * 2 + wob) * w * 0.05 + (t < 0.07 ? hook * (1 - t / 0.07) ** 2 : 0);
    const cx = x0 + dx * t + nx * off;
    const cy = y0 + dy * t + ny * off;
    // pressed at the start, easing off toward the end, a faint unevenness throughout
    const land = t < 0.05 ? 1.06 - (0.05 - t) * 1.6 : 1.06 - 0.04 * (t - 0.05);
    const lift = t > 0.8 ? 1 - ((t - 0.8) / 0.2) ** 1.8 * 0.5 : 1;
    const half = (w / 2) * (land - 0.16 * t + 0.03 * Math.sin(t * 11 + wob) + 0.02 * Math.sin(t * 31 + wob * 2)) * lift;
    L.push([cx + nx * half, cy + ny * half]);
    R.push([cx - nx * half, cy - ny * half]);
  }
  const p = (q: [number, number]) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  const ux = dx / len;
  const uy = dy / len;
  const capS = w * 0.6;
  const capE = w * 0.34;
  const head = [L[0][0] - ux * capS, L[0][1] - uy * capS];
  const head2 = [R[0][0] - ux * capS, R[0][1] - uy * capS];
  const tail = [L[N][0] + ux * capE, L[N][1] + uy * capE];
  const tail2 = [R[N][0] + ux * capE, R[N][1] + uy * capE];
  return [
    `M ${p(L[0])}`,
    ...L.slice(1).map((q) => `L ${p(q)}`),
    `C ${tail[0].toFixed(1)} ${tail[1].toFixed(1)} ${tail2[0].toFixed(1)} ${tail2[1].toFixed(1)} ${p(R[N])}`,
    ...R.slice(0, N).reverse().map((q) => `L ${p(q)}`),
    `C ${head2[0].toFixed(1)} ${head2[1].toFixed(1)} ${head[0].toFixed(1)} ${head[1].toFixed(1)} ${p(L[0])}`,
    "Z",
  ].join(" ");
}

/**
 * Goal tally: one idea — the goal counted as tally marks. On a calm, deep club-tone ground, big hand-drawn
 * looking strokes (clean filled SVG, each a little bowed and uneven): one bold mark for a goal, two for a
 * brace, three for a hat-trick (five as the crossed gate), in white or the club colour. "GOAL" small and
 * tracked above them; under them his name and the fixture (home first, exact names, no score). The
 * celebrating player big and sharp on the other side. Flips with params.side.
 */
export function Goaltally({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const seed = params.seed ?? 0;
  const rand = rng(seed * 7919 + 11);
  const useClub = luminance(club) > 0.1 && rand() < 0.4;
  const ink = useClub ? shade(club, 0.25) : "#f6f4ef";
  const playerLeft = params.side === "left";
  const M = 64;

  /* ---- the foot: logo, then fixture and name stacked up from it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const colW = story ? CANVAS_W - 2 * M : 520;
  const colX = story ? M : playerLeft ? CANVAS_W - M - colW : M;
  const align = playerLeft ? "right" : "left";
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const nameS = Math.max(24 * k, Math.min(36 * k, colW / Math.max(1, titleW(name, 1))));
  const fixS = Math.max(16 * k, Math.min(23 * k, colW / Math.max(1, bodyW(fixture, 1))));
  const fixTop = logoTop - (story ? 64 : 56) - fixS * 1.2 + ty;
  const nameTop = (fixture ? fixTop - 8 * k : fixTop + fixS * 1.2) - nameS * 1.2;

  /* ---- the tally ---- */
  const count = countOf(data);
  const sw = (story ? 66 : 52) * (count >= 4 ? 0.78 : count === 3 ? 0.86 : 1);
  const label = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const labelS = 16 * k;
  const tallyBottom = nameTop - (story ? 90 : 70);
  const tallyTop = story ? STORY_TOP + labelS * 1.2 + 44 : Math.max(150, tallyBottom - sw * 13);
  const tallyH = tallyBottom - tallyTop;
  const pitch = sw * (count >= 3 ? 2.3 : 2.5);
  const verticals = Math.min(4, count);
  const tallyW = (verticals - 1) * pitch + sw;
  const tallyX = colX + (align === "right" ? colW - tallyW - sw * 0.7 : 10);
  const marks: string[] = [];
  for (let i = 0; i < verticals; i++) {
    const x = tallyX + sw / 2 + i * pitch + (rand() - 0.5) * sw * 0.3;
    const lean = (rand() - 0.5) * sw * 0.5 + sw * 0.45;
    const top = tallyTop + (rand() - 0.3) * sw * 0.8;
    const bot = tallyBottom - (rand() - 0.3) * sw * 0.8;
    marks.push(strokePath(x + lean, top, x - lean * 0.4, bot, sw, rand));
  }
  if (count >= 5) {
    marks.push(strokePath(tallyX - sw * 0.9, tallyTop + tallyH * 0.68, tallyX + tallyW + sw * 0.9, tallyTop + tallyH * 0.3, sw * 0.9, rand));
  }
  const labelTop = tallyTop - 40 - labelS * 1.2;

  /* ---- the player: big, on the other side ---- */
  const dir = playerLeft ? -1 : 1;
  const faceX = 540 + dir * (story ? 190 : 230);
  const sizes = story ? { chest: 330, waist: 262, knees: 206, full: 162 } : { chest: 250, waist: 196, knees: 152, full: 118 };
  const probe = placeByFace(data, faceX, 300, sizes);
  let box = placeByFace(data, faceX, (story ? STORY_TOP + 120 : 80) + probe.faceH * 0.5, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // Keep his face clear of the tally column, and inside the canvas.
  const faceL = box.left + face[0] * box.width;
  const faceR = faceL + face[2] * box.width;
  let shift = 0;
  if (!playerLeft) shift = Math.max(tallyX + tallyW + 70 - faceL, 0) - Math.max(faceR - (CANVAS_W - 70), 0);
  else shift = -Math.max(faceR - (tallyX - 70), 0) + Math.max(70 - faceL, 0);
  box = { ...box, left: box.left + shift };
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = (story ? nameTop - 30 : H - 10) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 300)}px, transparent ${fadeEnd}px)`;

  const ground = shade(club, -0.8);
  const ground2 = shade(club, -0.68);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#ffffff" }}>
      {/* A calm ground: deep club tone, a soft lift behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 46% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${ground2}, transparent 78%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,.28))` }} />
      <div style={{ position: "absolute", left: faceCx - box.faceH * 2.3, top: chin + box.faceH * 0.4, width: box.faceH * 4.6, height: box.faceH * 4.4, borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: `blur(${story ? 80 : 60}px)` }} />

      {/* The marks, behind him: a raised arm may pass in front of them. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {marks.map((d, i) => (
          <path key={i} d={d} fill={ink} fillOpacity={0.96} />
        ))}
      </svg>
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}


      <div style={{ position: "absolute", left: colX, width: colW, top: labelTop, textAlign: align, fontFamily: SANS, fontWeight: 500, fontSize: labelS, lineHeight: 1.2, letterSpacing: "0.32em", ...(align === "right" ? { marginLeft: 0, paddingRight: 0, transform: "translateX(0.32em)" } : {}), color: "rgba(255,255,255,.82)", whiteSpace: "nowrap" }}>{label}</div>

      {name && <div style={{ position: "absolute", left: colX, width: colW, top: nameTop, textAlign: align, fontFamily: SANS, fontWeight: 600, fontSize: nameS, lineHeight: 1.2, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: colX, width: colW, top: fixTop, textAlign: align, fontFamily: SANS, fontWeight: 400, fontSize: fixS, lineHeight: 1.2, letterSpacing: "-0.005em", color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", ...(align === "right" ? { right: M - 4 } : { left: M - 4 }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: align === "right" ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.14} />
    </div>
  );
}
