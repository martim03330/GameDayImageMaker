/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** The geometry of the search bar at scale `k` (1 = post). */
export function barMetrics(k: number) {
  return { h: 104 * k, padL: 38 * k, padR: 30 * k, icon: 34 * k, gap: 24 * k, text: 36 * k, caret: 3 * k };
}

/** A plain magnifier: a ring and a short handle. */
function Magnifier({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="10.2" cy="10.2" r="6.6" fill="none" stroke={color} strokeWidth="2.1" />
      <line x1="15.1" y1="15.1" x2="20.6" y2="20.6" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * One search bar: a white pill on a long soft shadow, a grey magnifier, the query in Inter 400 and a thin
 * caret in the club colour just after it. Optional small crests sit at the right end.
 */
export function SearchBar({
  x,
  y,
  w,
  k,
  query,
  caret,
  crests = [],
  dark,
}: {
  x: number;
  y: number;
  w: number;
  k: number;
  query: string;
  caret: string;
  crests?: string[];
  dark?: boolean;
}) {
  const m = barMetrics(k);
  const crestS = 40 * k;
  const crestRoom = crests.length ? crests.length * crestS + (crests.length - 1) * 10 * k + 20 * k : 0;
  const room = w - m.padL - m.icon - m.gap - m.padR - crestRoom - 12 * k;
  const size = Math.max(m.text * 0.66, Math.min(m.text, room / Math.max(1, bodyW(query, 1))));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: m.h,
        borderRadius: m.h / 2,
        background: "#ffffff",
        boxShadow: dark
          ? `0 ${20 * k}px ${60 * k}px rgba(0,0,0,.45), 0 ${2 * k}px ${6 * k}px rgba(0,0,0,.25)`
          : `0 ${22 * k}px ${64 * k}px rgba(20,24,34,.16), 0 ${2 * k}px ${8 * k}px rgba(20,24,34,.08)`,
        display: "flex",
        alignItems: "center",
        paddingLeft: m.padL,
        paddingRight: m.padR,
        boxSizing: "border-box",
        fontFamily: SANS,
      }}
    >
      <Magnifier size={m.icon} color="#8e8e93" />
      <div style={{ marginLeft: m.gap, display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 400, fontSize: size, lineHeight: 1, letterSpacing: "-0.01em", color: "#1c1c1e", whiteSpace: "nowrap" }}>{query}</span>
        <span style={{ display: "block", width: m.caret, height: size * 1.22, marginLeft: 3 * k, borderRadius: m.caret, background: caret, flexShrink: 0 }} />
      </div>
      {crests.length > 0 && (
        <div style={{ display: "flex", gap: 10 * k, alignItems: "center", flexShrink: 0 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", display: "block" }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Fit a line of Inter 400 into `width` (never below 70% of the base size). */
export const fitLine = (t: string, base: number, width: number) => Math.max(base * 0.7, Math.min(base, width / Math.max(1, bodyW(t, 1))));

/**
 * Search: the match typed into a search bar. A clean, cool light ground with a soft light behind the
 * player, who stands big and sharp in natural colour and melts away just under the bar. Over his body,
 * one white pill on a long soft shadow — a magnifier, "SC Vianense SAD v Leixões" and a thin caret in the
 * club colour, the two crests small at its end — and under it, on the clean ground, two or three quiet
 * "result" lines: "Matchday · 17 October · 15:00", the ground, the competition. The NEYOD mark below.
 */
export function Search({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const M = story ? 56 : 60;

  /* ---- the foot: logo, then the results ~60px above it, then the bar ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  const teams = teamsOf(data);
  const weHost = content.home ?? true;
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const query = teams.join(" v ") || sentenceCase(content.kicker || "Matchday");
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ");
  const line1 = [sentenceCase(content.kicker || "Matchday"), niceDate(content.date), f.time].filter(Boolean).join(" · ");

  const bw = CANVAS_W - 2 * M;
  const bm = barMetrics(k);
  const resX = M + bm.padL; // results align with the magnifier, like suggestions under a bar
  const resW = CANVAS_W - resX - M;
  const s1 = fitLine(line1, 30 * k, resW);
  const s2 = fitLine(venue, 27 * k, resW);
  const s3 = fitLine(comp, 23 * k, resW);
  const lines = [
    { t: line1, s: s1, w: 500, c: "#1c1c1e", lh: 1.42 },
    { t: venue, s: s2, w: 400, c: "#4a4a50", lh: 1.42 },
    { t: comp, s: s3, w: 400, c: "#8e8e93", lh: 1.42 },
  ].filter((l) => l.t);
  const resH = lines.reduce((a, l) => a + l.s * l.lh, 0);
  const resBottom = logoTop - (story ? 66 : 58) + (params.textY ?? 0);
  const resTop = resBottom - resH;
  const by = resTop - (story ? 40 : 30) - bm.h;

  /* ---- the player: big, head high, centred-ish ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const sizes = story ? { chest: 380, waist: 310, knees: 244, full: 184 } : { chest: 280, waist: 220, knees: 170, full: 130 };
  const probe = placeByFace(data, faceX, 300, sizes);
  const box = placeByFace(data, faceX, (story ? STORY_TOP + 60 : 70) + probe.faceH * 0.7, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  // He dissolves behind the bar: fully gone just under it, so the results sit on the clean ground.
  const fadeEnd = by + bm.h + (story ? 24 : 16) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 280)}px, transparent ${fadeEnd}px)`;

  const tint = shade(club, 0.82);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#eceef1" }}>
      {/* The ground: cool light grey, a breath of the club colour high up, a soft light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${tint} 0%, #eef0f3 46%, #f4f5f7 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(52% 34% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.95), rgba(255,255,255,0) 75%)` }} />
      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.2, top: chin + box.faceH * 0.4, width: box.faceH * 4.4, height: box.faceH * 4.2, borderRadius: "50%", background: `${shade(club, -0.5)}22`, filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <SearchBar x={M} y={by} w={bw} k={k} query={query} caret={club} crests={crests} />

      {/* The results: plain lines, aligned with the magnifier. */}
      <div style={{ position: "absolute", left: resX, top: resTop, fontFamily: SANS, letterSpacing: "-0.01em" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontWeight: l.w, fontSize: l.s, lineHeight: l.lh, color: l.c, whiteSpace: "nowrap" }}>
            {l.t}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} onLight height={22} style={{ position: "absolute", left: resX - 4 * k, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "left bottom" }} />
      <Film strength={0.1} />
    </div>
  );
}
