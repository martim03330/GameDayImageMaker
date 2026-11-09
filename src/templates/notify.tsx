/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter 600 / 400: advance widths per 100px (measured in the browser). */
const I600: Record<string, number> = { a: 57.4, b: 62.4, c: 58.3, d: 62.4, e: 59.1, f: 35.2, g: 62.6, h: 61.2, i: 26.2, j: 26.2, k: 57, l: 26.2, m: 90, n: 61.2, o: 60.9, p: 62.4, q: 62.4, r: 40.6, s: 54.9, t: 34.7, u: 61.2, v: 58.7, w: 83.9, x: 56.9, y: 58.9, z: 56.6, A: 74.1, B: 65.9, C: 73.7, D: 72.2, E: 60.5, F: 58.8, G: 74.9, H: 74.6, I: 27.7, J: 58, K: 70.3, L: 56.5, M: 92.2, N: 75.9, O: 76.9, P: 64.5, Q: 77.3, R: 65.2, S: 65, T: 66, U: 73.6, V: 74.1, W: 104.1, X: 72, Y: 71.4, Z: 65.2, " ": 25.2, ".": 31.9, ",": 31.9, "·": 31.9, "-": 46.5, "'": 32.6 };
const I400: Record<string, number> = { a: 56.2, b: 61.2, c: 57.1, d: 61.2, e: 58.3, f: 33.5, g: 61.3, h: 59.1, i: 24.2, j: 24.2, k: 54.9, l: 24.2, m: 87.6, n: 59.1, o: 60, p: 61.2, q: 61.2, r: 39.1, s: 52.8, t: 32.7, u: 59.1, v: 56.2, w: 81.8, x: 54.6, y: 56.2, z: 55.2, A: 70.3, B: 65.4, C: 73, D: 72.2, E: 60.1, F: 59, G: 74.6, H: 74.3, I: 26.9, J: 57.1, K: 67.2, L: 56.5, M: 90.3, N: 75.3, O: 76.5, P: 63.9, Q: 76.5, R: 64.4, S: 64.2, T: 64.6, U: 74.4, V: 70.3, W: 100.7, X: 68.2, Y: 67.9, Z: 62.9, " ": 28.1, ".": 28.8, ",": 28.8, "·": 28.8, "-": 46, "'": 30 };
const em = (t: string, table: Record<string, number>) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (table[c] ?? (/\d/.test(c) ? 62 : 60)) / 100, 0);
/** Width of a line of the banner at `size` (Inter 400 body, 600 title), with iOS's slight negative tracking. */
export const bodyW = (t: string, size: number) => em(t, I400) * size * 0.99;
export const titleW = (t: string, size: number) => em(t, I600) * size * 0.99;

/** "MATCHDAY" → "Matchday", "HAT-TRICK" → "Hat-trick". */
export const sentenceCase = (k: string) => {
  const s = k.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** The club colour, guarded against white / yellow / near-black. */
export function clubTone(data: RenderData): string {
  const p = data.params;
  let club = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  if (luminance(club) > 0.45) club = vivid(p.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.3);
  return club;
}

/** Home team first, names exactly as stored (only the case may change). */
export function teamsOf(data: RenderData): string[] {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? c.homeTeam : c.awayTeam) || ours).trim();
  const oppName = ((weHost ? c.awayTeam : c.homeTeam) || titleCase(f.opp) || "").trim();
  return (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean);
}

/** The geometry of one banner at scale `k` (1 = post). */
export function bannerMetrics(k: number) {
  return { padX: 28 * k, padY: 26 * k, icon: 88 * k, gap: 24 * k, radius: 44 * k, title: 30 * k, now: 23 * k, body: 28 * k };
}

/** Lines of the body fitted to `width`: each line shrinks on its own (never below 72% of the base). */
export function fitBody(lines: string[], base: number, width: number) {
  return lines.map((t) => ({ text: t, size: Math.max(base * 0.72, Math.min(base, width / Math.max(1, bodyW(t, 1)))) }));
}

/** Height of a banner whose body lines are `n` long. */
export function bannerHeight(k: number, n: number) {
  const m = bannerMetrics(k);
  const text = m.title * 1.22 + 4 * k + n * m.body * 1.3;
  return Math.round(2 * m.padY + Math.max(m.icon, text));
}

/**
 * One iOS lock-screen notification: a frosted rounded card, the club crest on a small white app icon,
 * a bold title with a quiet "now" opposite, and up to two body lines under it.
 */
export function Banner({
  x,
  y,
  w,
  k,
  icon,
  title,
  body,
  dark,
}: {
  x: number;
  y: number;
  w: number;
  k: number;
  icon: string | null;
  title: string;
  body: string[];
  dark?: boolean;
}) {
  const m = bannerMetrics(k);
  const h = bannerHeight(k, body.length);
  const textW = w - 2 * m.padX - m.icon - m.gap;
  const ink = dark ? "#ffffff" : "#0b0b0d";
  const dim = dark ? "rgba(235,235,245,.62)" : "rgba(60,60,67,.6)";
  const tSize = Math.min(m.title, (textW - m.now * 2.4) / Math.max(1, titleW(title, 1)));
  const lines = fitBody(body, m.body, textW);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: m.radius,
        background: dark ? "rgba(28,28,32,.52)" : "rgba(246,246,248,.66)",
        backdropFilter: "blur(38px) saturate(1.7)",
        WebkitBackdropFilter: "blur(38px) saturate(1.7)",
        boxShadow: dark ? "0 18px 50px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.08)" : "0 18px 50px rgba(0,0,0,.14), inset 0 0 0 1px rgba(255,255,255,.35)",
        fontFamily: SANS,
        color: ink,
      }}
    >
      {/* The app icon: the crest on a white rounded square. */}
      <div
        style={{
          position: "absolute",
          left: m.padX,
          top: (h - m.icon) / 2,
          width: m.icon,
          height: m.icon,
          borderRadius: m.icon * 0.225,
          background: "#ffffff",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon && <img src={icon} alt="" style={{ width: m.icon * 0.72, height: m.icon * 0.72, objectFit: "contain" }} />}
      </div>
      <div style={{ position: "absolute", left: m.padX + m.icon + m.gap, right: m.padX, top: (h - (m.title * 1.22 + 4 * k + body.length * m.body * 1.3)) / 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", height: m.title * 1.22, marginBottom: 4 * k }}>
          <span style={{ fontWeight: 600, fontSize: tSize, lineHeight: 1.22, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{title}</span>
          <span style={{ fontWeight: 400, fontSize: m.now, lineHeight: 1, color: dim, whiteSpace: "nowrap" }}>now</span>
        </div>
        {lines.map((l, i) => (
          <div key={i} style={{ height: m.body * 1.3, display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 400, fontSize: l.size, lineHeight: 1.3, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Notify: the match as a single iOS lock-screen notification. His own photo melted into a soft,
 * lightly club-graded ground; the player big and sharp in natural colour; low down, over his body, one
 * frosted banner — the club crest as the app icon, "Matchday", "SC Vianense SAD v Leixões · 15:00" and
 * the ground — with a quiet "now". The NEYOD mark under it. Nothing else.
 */
export function Notify({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.3 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the banner, low, ~64px above the logo ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const line1 = [fixture, f.time].filter(Boolean).join(" · ");
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const body = [line1 || titleCase(f.comp), venue].filter(Boolean);
  const M = story ? 48 : 52;
  const bw = CANVAS_W - 2 * M;
  const bh = bannerHeight(k, body.length);
  const by = H - logoBottom - logoH - (story ? 68 : 60) - bh + (params.textY ?? 0);

  /* ---- the player, big, head high ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const sizes = story ? { chest: 360, waist: 300, knees: 236, full: 176 } : { chest: 262, waist: 206, knees: 160, full: 124 };
  const box = placeByFace(data, faceX, story ? STORY_TOP + 200 : 210, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  // He melts into the ground just under the banner, so the logo sits on the clean ground.
  const fadeEnd = by + bh + 30 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 260)}px, transparent ${fadeEnd}px)`;

  const back = data.bgPhotoUrl;
  const base = shade(club, -0.35);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: base }}>
      {/* The ground: his own photo melted to soft fields, lifted and graded towards the club colour. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -180, top: -180, width: CANVAS_W + 360, height: H + 360, maxWidth: "none", objectFit: "cover", filter: "blur(70px) saturate(.7) brightness(1.02)", opacity: 0.8 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(club, 0.25)}, ${shade(club, -0.45)})`, mixBlendMode: "soft-light", opacity: 0.9 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 34% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.22), transparent 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 520, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.34))" }} />

      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.1, top: chin + box.faceH * 0.3, width: box.faceH * 4.2, height: box.faceH * 4.4, borderRadius: "50%", background: "rgba(0,0,0,.2)", filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <Banner x={M} y={by} w={bw} k={k} icon={f.ourCrest} title={sentenceCase(content.kicker || "Matchday")} body={body} />

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
