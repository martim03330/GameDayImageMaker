/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f3eee8";
const INK = "#121212";
const DMSERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "paper" natural looks (reference: the "Olahraga, Olahrasa" event poster — a pale
 * sheet, a tight serif headline, two small info columns, the photo filling the foot): the top ~55% is plain
 * warm paper with a three-line DM Serif headline, centred and tight, then two short columns of small
 * semibold text (left aligned left, right aligned right). The lower part is his real photo, untouched,
 * edge to edge, his face inside it. The NEYOD logo (dark) sits on the paper above the photo.
 */
export function NatPaperFrame({ data, head, left, right }: { data: RenderData; head: string[]; left: string[]; right: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 84 : 76;
  const maxW = CANVAS_W - 2 * M;
  const top = (story ? STORY_TOP : 64) - (params.textY ?? 0);
  // DM Serif mixed case ~0.48em a letter; one size for all three lines (the longest decides).
  const longest = Math.max(1, ...head.map((h) => h.length));
  const hPx = Math.min(100 * k * ts, (maxW * 0.92) / (longest * 0.48));
  const headH = head.length * hPx * 0.98;
  const infoTop = top + headH + 70 * k;
  const iPx = 22 * k * ts;
  const infoH = Math.max(left.length, right.length) * iPx * 1.2;
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = infoTop + infoH + 38 * k - (params.logoY ?? 0);
  const photoTop = Math.max(story ? 940 : 700, logoTop + logoH + 34 * k);
  const photoBottom = story ? STORY_BOTTOM + 60 : H;
  // The photo is framed for the strip itself (its own W × stripH canvas), so his face is always inside it:
  // framed for the whole poster, the cover zoom could leave his face behind the paper.
  const stripH = photoBottom - photoTop;
  const fs = Math.min(story ? 170 : 128, stripH * 0.24);
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place = natPlace(data, CANVAS_W, stripH, { fx: fx0, fy: fs * 1.25, fs });
  const col = (lines: string[], align: "left" | "right") => (
    <div style={{ position: "absolute", top: infoTop, [align]: M, textAlign: align, fontFamily: SANS, fontWeight: 600, fontSize: iPx, lineHeight: 1.2, letterSpacing: "-0.01em", color: INK, maxWidth: maxW / 2 - 10 }}>
      {lines.filter(Boolean).map((t) => (
        <div key={t} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip" }}>
          {t}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER }}>
      <div style={{ position: "absolute", left: 0, top: photoTop, width: CANVAS_W, height: stripH, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={stripH} />
        <NatFigure data={data} place={place} W={CANVAS_W} H={stripH} />
      </div>
      {head.map((h, i) => (
        <div key={h + i} style={{ position: "absolute", left: 0, width: CANVAS_W, top: top + i * hPx * 0.98, textAlign: "center", fontFamily: DMSERIF, fontSize: hPx, lineHeight: 1, letterSpacing: "-0.03em", color: INK, whiteSpace: "nowrap" }}>
          {h}
        </div>
      ))}
      {col(left, "left")}
      {col(right, "right")}
      <AgencyLogo data={data} height={24} onLight style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/** "SC Vianense SAD" stays as written; all-caps names from the data get title case for the serif headline. */
const SMALL = new Set(["de", "da", "do", "das", "dos", "e", "of", "the"]);
const title = (s: string) =>
  s === s.toUpperCase() && /[A-Z]{4}/.test(s)
    ? s
        .toLowerCase()
        .split(" ")
        .map((w, i) => (i && SMALL.has(w) ? w : w.replace(/^\p{L}/u, (m) => m.toUpperCase())))
        .join(" ")
    : s;
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Natural · papel (matchday): pale warm paper on top with a tight three-line DM Serif headline — "Matchday,"
 * / "Home v" / "Away." (exact names, home first) — two small info columns (date, venue | kick-off, round) and
 * the dark NEYOD logo; his real photo, untouched, fills the foot edge to edge.
 */
export function Natpaper({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const f = matchFacts(data);
  return (
    <NatPaperFrame
      data={data}
      head={[`${sentence(data.content.kicker || "Matchday")},`, `${title(fx.homeName)} v`, `${title(fx.awayName)}.`]}
      left={[fx.date, title(fx.venue)]}
      right={[fx.kickoff, title(f.round)]}
    />
  );
}

/**
 * Natural goal · papel: pale paper on top with "Goal," / "First" / "Last." in a tight DM Serif headline, his
 * club's exact name and the competition in two small columns, the dark NEYOD logo; his real celebration
 * photo fills the foot. No score.
 */
export function Goalnatpaper({ data }: { data: RenderData }) {
  const { content } = data;
  const f = matchFacts(data);
  return (
    <NatPaperFrame
      data={data}
      head={[`${sentence(content.kicker || "Goal")},`, content.firstName || "", `${content.lastName || ""}.`].filter((h) => h && h !== ".")}
      left={[ourClub(data)]}
      right={[title(f.comp)]}
    />
  );
}
