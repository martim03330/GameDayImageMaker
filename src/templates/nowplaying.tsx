/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** English month names, also for the Portuguese abbreviations some fixtures carry. */
const MON: Record<string, string> = {
  JAN: "January", FEB: "February", FEV: "February", MAR: "March", APR: "April", ABR: "April", MAY: "May", MAI: "May", JUN: "June", JUL: "July",
  AUG: "August", AGO: "August", SEP: "September", SET: "September", OCT: "October", OUT: "October", NOV: "November", DEC: "December", DEZ: "December",
};

/** "17 OCT" (or "SAT 17 OCT") → { short: "17 Oct", long: "17 October" }; never the weekday. */
export function datesOf(d?: string): { short: string; long: string } {
  const m = (d ?? "").toUpperCase().trim().match(/^(?:[A-Z]{3}\s+)?(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return { short: (d ?? "").trim(), long: (d ?? "").trim() };
  const long = MON[m[2]] ?? m[2].charAt(0) + m[2].slice(1).toLowerCase();
  return { short: `${m[1]} ${long.slice(0, 3)}`, long: `${m[1]} ${long}` };
}

/** Plain media-control glyphs, drawn on a 24-unit grid. */
export function MediaIcon({ kind, size, color }: { kind: "prev" | "play" | "next" | "replay"; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0, overflow: "visible" }}>
      {kind === "play" && <path d="M6.5 3.6 L20 12 L6.5 20.4 Z" fill={color} stroke={color} strokeWidth="1.6" strokeLinejoin="round" />}
      {kind === "prev" && <path d="M11.6 6.2 L2.8 12 L11.6 17.8 Z M21.2 6.2 L12.4 12 L21.2 17.8 Z" fill={color} stroke={color} strokeWidth="1.3" strokeLinejoin="round" />}
      {kind === "next" && <path d="M12.4 6.2 L21.2 12 L12.4 17.8 Z M2.8 6.2 L11.6 12 L2.8 17.8 Z" fill={color} stroke={color} strokeWidth="1.3" strokeLinejoin="round" />}
      {kind === "replay" && (
        <g fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.6 13.2 A7.6 7.6 0 1 0 7.1 6.4" />
          <path d="M6.6 2.6 L7.3 6.6 L3.4 7.6" />
        </g>
      )}
    </svg>
  );
}

/** The geometry of the player card at scale `k` (1 = post). */
export function cardMetrics(k: number) {
  return {
    pad: 38 * k,
    radius: 46 * k,
    head: 15 * k,
    headGap: 26 * k,
    art: 132 * k,
    artGap: 30 * k,
    title: 46 * k,
    artist: 27 * k,
    sub: 23 * k,
    barGap: 40 * k,
    bar: 7 * k,
    labelGap: 14 * k,
    label: 19 * k,
    ctrlGap: 26 * k,
    ctrl: 56 * k,
  };
}

/** Lines of the artist / subtitle block fitted to `width` (a long fixture breaks before its " v "). */
export function cardLines(artist: string, sub: string, k: number, width: number) {
  const m = cardMetrics(k);
  const out: { t: string; s: number; sub: boolean }[] = [];
  const fit = (t: string, base: number, isSub: boolean) => {
    const s = width / Math.max(1, bodyW(t, 1));
    if (s >= base * 0.8 || !/ v /.test(t)) out.push({ t, s: Math.max(base * 0.7, Math.min(base, s)), sub: isSub });
    else {
      const i = t.indexOf(" v ");
      const a = t.slice(0, i);
      const b = t.slice(i + 1);
      const s2 = Math.max(base * 0.7, Math.min(base, width / Math.max(1, bodyW(a, 1), bodyW(b, 1))));
      out.push({ t: a, s: s2, sub: isSub }, { t: b, s: s2, sub: isSub });
    }
  };
  if (artist) fit(artist, m.artist, false);
  if (sub) fit(sub, m.sub, true);
  return out;
}

/** Height of a card whose text block holds `lines`. */
export function cardHeight(k: number, lines: { s: number; sub: boolean }[], labels = true) {
  const m = cardMetrics(k);
  const text = m.title * 1.16 + 6 * k + lines.reduce((a, l) => a + l.s * 1.34, 0);
  return Math.round(2 * m.pad + m.head * 1.2 + m.headGap + Math.max(m.art, text) + m.barGap + m.bar + (labels ? m.labelGap + m.label * 1.2 : 0) + m.ctrlGap + m.ctrl);
}

/**
 * One "now playing" card: a small header, the crest as square artwork on a club-tone tile, the track title
 * and its artist line(s), a thin progress bar with a label at each end, and prev / play / next under it.
 */
export function PlayerCard({
  x,
  y,
  w,
  k,
  art,
  tone,
  title,
  artist,
  sub = "",
  progress,
  start,
  end,
  center = "play",
  dark,
}: {
  x: number;
  y: number;
  w: number;
  k: number;
  art: string | null;
  tone: string;
  title: string;
  artist: string;
  sub?: string;
  progress: number;
  start: string;
  end: string;
  center?: "play" | "replay";
  dark?: boolean;
}) {
  const m = cardMetrics(k);
  const textW = w - 2 * m.pad - m.art - m.artGap;
  const lines = cardLines(artist, sub, k, textW);
  const labels = Boolean(start || end);
  const h = cardHeight(k, lines, labels);
  const ink = dark ? "#ffffff" : "#111114";
  const dim = dark ? "rgba(235,235,245,.62)" : "rgba(60,60,67,.62)";
  const faint = dark ? "rgba(235,235,245,.46)" : "rgba(60,60,67,.5)";
  const track = dark ? "rgba(255,255,255,.18)" : "rgba(60,60,67,.14)";
  const fill = dark ? shade(tone, 0.32) : tone;
  const tSize = Math.min(m.title, textW / Math.max(1, titleW(title, 1)));
  const textH = m.title * 1.16 + 6 * k + lines.reduce((a, l) => a + l.s * 1.34, 0);
  const rowH = Math.max(m.art, textH);
  const barW = w - 2 * m.pad;
  const knob = 15 * k;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: m.radius,
        background: dark ? "rgba(22,22,26,.5)" : "rgba(255,255,255,.9)",
        backdropFilter: "blur(40px) saturate(1.6)",
        WebkitBackdropFilter: "blur(40px) saturate(1.6)",
        boxShadow: dark
          ? `0 ${24 * k}px ${70 * k}px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.09)`
          : `0 ${26 * k}px ${72 * k}px rgba(20,24,34,.14), 0 ${2 * k}px ${8 * k}px rgba(20,24,34,.06)`,
        fontFamily: SANS,
        color: ink,
        boxSizing: "border-box",
        padding: m.pad,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: m.head, lineHeight: 1.2, letterSpacing: "0.16em", color: faint, whiteSpace: "nowrap" }}>NOW PLAYING</div>
      <div style={{ display: "flex", alignItems: "center", gap: m.artGap, height: rowH, marginTop: m.headGap }}>
        {/* The artwork: the crest on a club-tone tile. */}
        <div
          style={{
            width: m.art,
            height: m.art,
            flexShrink: 0,
            borderRadius: m.art * 0.16,
            background: `linear-gradient(145deg, ${shade(tone, 0.16)}, ${shade(tone, -0.32)})`,
            boxShadow: `0 ${10 * k}px ${26 * k}px ${shade(tone, -0.5)}40, inset 0 0 0 1px rgba(255,255,255,.12)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {art && <img src={art} alt="" style={{ width: m.art * 0.62, height: m.art * 0.62, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.25))" }} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: tSize, lineHeight: 1.16, letterSpacing: "-0.02em", whiteSpace: "nowrap", marginBottom: 6 * k }}>{title}</div>
          {lines.map((l, i) => (
            <div key={i} style={{ fontWeight: 400, fontSize: l.s, lineHeight: 1.34, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: l.sub ? faint : dim }}>
              {l.t}
            </div>
          ))}
        </div>
      </div>
      {/* The progress bar. */}
      <div style={{ position: "relative", width: barW, height: m.bar, marginTop: m.barGap, borderRadius: m.bar, background: track }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.max(m.bar, barW * progress), borderRadius: m.bar, background: fill }} />
        {progress < 1 && <div style={{ position: "absolute", left: barW * progress - knob / 2, top: (m.bar - knob) / 2, width: knob, height: knob, borderRadius: "50%", background: fill, boxShadow: `0 ${2 * k}px ${6 * k}px rgba(0,0,0,.18)` }} />}
      </div>
      {labels && <div style={{ display: "flex", justifyContent: "space-between", marginTop: m.labelGap, fontWeight: 500, fontSize: m.label, lineHeight: 1.2, color: dim, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        <span>{start}</span>
        <span>{end}</span>
      </div>}
      {/* prev · play · next */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 92 * k, height: m.ctrl, marginTop: m.ctrlGap }}>
        <MediaIcon kind="prev" size={40 * k} color={ink} />
        <MediaIcon kind={center} size={center === "play" ? 52 * k : 50 * k} color={ink} />
        <MediaIcon kind="next" size={40 * k} color={ink} />
      </div>
    </div>
  );
}

/**
 * Now playing: the match as the track on a music player. A clean, pale ground lit faintly in the club
 * colour; the player big and sharp in natural colour on his side. On the other side, low down, one white
 * player card — the crest as square artwork on a club-tone tile, "Matchday", "SC Vianense SAD v Leixões",
 * a thin progress bar running from the date to "15:00" (kick-off), and prev / play / next. The NEYOD mark
 * under it. In the story the card spans the width under him. Flips with params.side.
 */
export function Nowplaying({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";
  const M = story ? 60 : 60;

  /* ---- the card, ~60px above the logo ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const title = sentenceCase(content.kicker || "Matchday");
  const artist = teamsOf(data).join(" v ");
  const dates = datesOf(content.date);
  const cw = story ? CANVAS_W - 2 * M : 600;
  const cm = cardMetrics(k);
  const ch = cardHeight(k, cardLines(artist, "", k, cw - 2 * cm.pad - cm.art - cm.artGap));
  const cy = logoTop - (story ? 66 : 60) - ch + (params.textY ?? 0);
  const cx = story ? M : playerLeft ? CANVAS_W - M - cw : M;

  /* ---- the player: big, on his side (in the story above the card) ---- */
  const sideX = playerLeft ? -1 : 1;
  const faceX = 540 + sideX * (story ? 120 : 220);
  const sizes = story ? { chest: 380, waist: 306, knees: 240, full: 184 } : { chest: 272, waist: 214, knees: 166, full: 128 };
  const probe = placeByFace(data, faceX, 300, sizes);
  const box = placeByFace(data, faceX, (story ? STORY_TOP + 40 : 70) + probe.faceH * 0.7, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = (story ? cy + ch * 0.6 : H - 30) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 320)}px, transparent ${fadeEnd}px)`;

  const tint = shade(club, 0.84);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#f3f3f1" }}>
      {/* The ground: a breath of the club colour high up melting into warm off-white, a soft light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${tint} 0%, #f1f1ef 52%, #f5f5f3 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 34% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.95), rgba(255,255,255,0) 75%)` }} />
      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.2, top: chin + box.faceH * 0.4, width: box.faceH * 4.4, height: box.faceH * 4.2, borderRadius: "50%", background: `${shade(club, -0.5)}22`, filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <PlayerCard x={cx} y={cy} w={cw} k={k} art={f.ourCrest} tone={club} title={title} artist={artist} progress={0.42} start={dates.short} end={f.time} />

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", ...(story || !playerLeft ? { left: cx + cm.pad - 6 * k } : { right: M + cm.pad - 6 * k }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: story || !playerLeft ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
