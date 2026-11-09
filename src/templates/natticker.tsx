import { logoWidth } from "./natbug";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** One run of the ticker: the items in order; `strong` items are set a little heavier. */
export type TickerItem = { text: string; strong?: boolean };

/** Relative luminance of a #rgb / #rrggbb colour (null when it isn't one). */
function lum(hex: string): number | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** The label block's colours: the accent when it stands off the dark band and carries its ink, else white with black. */
function labelInk(accent: string | undefined): { bg: string; fg: string } {
  const L = accent ? lum(accent) : null;
  if (L == null) return { bg: "#f7f6f2", fg: "#111" };
  const fg = L > 0.36 ? "#111" : "#fff";
  const contrast = fg === "#fff" ? 1.05 / (L + 0.05) : (L + 0.05) / 0.06;
  // Too dark to read as a block on the dark band, or its ink too weak (under 3:1, large bold caps) → white block, black ink.
  if (L < 0.06 || contrast < 3) return { bg: "#f7f6f2", fg: "#111" };
  return { bg: accent!, fg };
}

/**
 * Natural · news ticker: his own photo full-bleed and almost untouched, and across the foot (or the top when
 * his head is down there) a slim TV news-ticker band — dark and see-through, a small solid label block on its
 * left ("MATCHDAY" / "GOAL", in the accent colour when it reads), then the running line in caps, repeated and
 * cut by the frame edge. The NEYOD logo sits alone in a clear corner.
 */
export function TickerLook({ data, label, items, place: want }: { data: RenderData; label: string; items: TickerItem[]; place: { fx: number; fy: number; fs: number } }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;

  const place = natPlace(data, CANVAS_W, H, want);

  const bandH = Math.round((story ? 84 : 64) * Math.max(0.9, Math.min(1.25, ts)));
  const labelSize = Math.round(24 * k * ts);
  const M = story ? 64 : 52;
  const run = items.filter((i) => i.text);
  // The line runs on and is cut by the frame edge, but its core (every item but the last — the fixture, date
  // and kick-off / his name and club) must be fully seen: the type shrinks for it, never under 24px post / 30px story.
  const labelW = M + capsEm(label, 0.16) * labelSize + 22 * k;
  // Story: the 1.3× type can't share one 1080px line with the label, so the label block becomes a tab sitting
  // on the band's left end (like a news channel's section tab) and the line runs the full width under it.
  const tabH = story ? Math.round(labelSize * 1.9) : 0;
  const avail = story ? CANVAS_W - M - 8 : CANVAS_W - labelW - 22 * k - 8;
  const core = run.length > 1 ? run.slice(0, -1) : run;
  const coreEm = core.reduce((a, it) => a + capsEm(it.text, 0.05) * (it.strong ? 1.06 : 1) + 1.5, 0);
  const textSize = Math.round(Math.max((story ? 30 : 24) * ts, Math.min(26 * k * ts, avail / coreEm)));

  /* ---- where the band goes: across the foot, unless his head is down there ---- */
  type R = { l: number; t: number; w: number; h: number };
  const head0: R = { l: place.fx - place.faceW * 1.3, t: place.fy - place.fs * 0.9, w: place.faceW * 2.6, h: place.fs * 1.65 };
  const meet = (a: R, b: R, gap: number) => a.l < b.l + b.w + gap && a.l + a.w > b.l - gap && a.t < b.t + b.h + gap && a.t + a.h > b.t - gap;
  const footTop = (story ? STORY_BOTTOM : CANVAS_H - 64) - bandH;
  const topTop = (story ? STORY_TOP : 56) + tabH;
  const atFoot = !meet({ l: 0, t: footTop - tabH, w: CANVAS_W, h: bandH + tabH }, head0, 24);
  const bandTop = (atFoot ? footTop : topTop) - (params.textY ?? 0);
  const bandR: R = { l: 0, t: bandTop - tabH, w: CANVAS_W, h: bandH + tabH };

  /* ---- the logo: alone, in the corner away from the band, clear of his head ---- */
  const lw = logoWidth(24, story) * (params.logoScale ?? 1);
  const lh = story ? 88 : 52;
  const ly = atFoot ? (story ? STORY_TOP : 50) : (story ? STORY_BOTTOM : CANVAS_H - 50) - lh;
  const xs = { right: CANVAS_W - M - lw, left: M, center: (CANVAS_W - lw) / 2 } as const;
  const order: (keyof typeof xs)[] = place.fx < CANVAS_W / 2 ? ["right", "center", "left"] : ["left", "center", "right"];
  const lx = order.find((x) => !meet({ l: xs[x], t: ly, w: lw, h: lh }, head0, 20) && !meet({ l: xs[x], t: ly, w: lw, h: lh }, bandR, 56)) ?? order[0];
  const logoTop = ly - (params.logoY ?? 0);
  const logoLow = ly > H / 2;
  const sc = params.logoScale ?? 1;

  const ink = labelInk(params.accent);
  const labelBlock = (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: `0 ${Math.round(22 * k)}px 0 ${M}px`,
        background: ink.bg,
        color: ink.fg,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: labelSize,
        lineHeight: 1,
        letterSpacing: "0.16em",
        whiteSpace: "nowrap",
        ...(story ? { position: "absolute", left: 0, top: bandTop - tabH, height: tabH } : {}),
      }}
    >
      <span style={{ marginRight: "-0.16em" }}>{label}</span>
    </div>
  );
  const sep = <span style={{ display: "inline-block", margin: `0 ${Math.round(0.6 * textSize)}px`, opacity: 0.55 }}>•</span>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A soft lens-like shade in the logo's corner, no edge — nothing else touches the photo. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${story ? 820 : 760}px ${story ? 600 : 480}px at ${lx === "center" ? "50%" : lx} ${logoLow ? "bottom" : "top"}, rgba(0,0,0,.28), rgba(0,0,0,.12) 45%, rgba(0,0,0,0) 100%)` }} />

      {/* The ticker band. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandTop,
          height: bandH,
          display: "flex",
          alignItems: "stretch",
          background: "rgba(10,13,12,.72)",
          borderTop: "1px solid rgba(255,255,255,.12)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 6px 24px rgba(0,0,0,.22)",
          overflow: "hidden",
        }}
      >
        {!story && labelBlock}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            paddingLeft: story ? M : Math.round(22 * k),
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: textSize,
            lineHeight: 1,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
            color: "#fff",
            overflow: "hidden",
          }}
        >
          {[0, 1, 2, 3].map((rep) => (
            <span key={rep} style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
              {run.map((it, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                  <span style={{ fontWeight: it.strong ? 800 : 600 }}>{it.text}</span>
                  {sep}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {story && labelBlock}

      <AgencyLogo
        data={data}
        height={24}
        style={{
          position: "absolute",
          top: logoTop,
          ...(lx === "center" ? { left: "50%", transform: `translateX(-50%) scale(${sc})` } : lx === "left" ? { left: M, transform: `scale(${sc})` } : { right: M, transform: `scale(${sc})` }),
          transformOrigin: `${lx} ${logoLow ? "bottom" : "top"}`,
        }}
      />
    </div>
  );
}

/** Natural · news ticker (matchday): "SC VIANENSE SAD v S. JOÃO VER • 25 OCT • 15:00 • ESTÁDIO …", exact names, home first. */
export function Natticker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const fx = natFixture(data);
  const label = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const items: TickerItem[] = [
    { text: `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}`, strong: true },
    { text: fx.date },
    { text: fx.kickoff },
    { text: (fx.venue ?? "").toUpperCase() },
  ];
  const want = { fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540, fy: story ? 640 : 440, fs: story ? 250 : 172 };
  return <TickerLook data={data} label={label} items={items} place={want} />;
}
