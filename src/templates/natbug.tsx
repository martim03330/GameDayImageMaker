/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** The two-layer text shadow of the natural looks (tight + wide), so white reads on a light ground too. */
export const NAT_SHADOW = "0 2px 4px rgba(0,0,0,.38), 0 8px 30px rgba(0,0,0,.42)";
/** The broadcast plate: a dark, slightly see-through slate. */
export const BUG_PLATE = "rgba(12,16,14,.76)";
/** Width of the NEYOD logo for an asked height (the PNG is 2466×807; AgencyLogo's own sizing). */
export function logoWidth(asked: number, story: boolean): number {
  const post = Math.max(52, Math.round(asked * (asked >= 40 ? 1.5 : 2)));
  return (story ? Math.max(88, Math.round(post * 1.7)) : post) * (2466 / 807);
}

/**
 * Natural · TV bug (matchday): his own match photo full-bleed and almost untouched, and in the top-left
 * corner a small, quiet broadcast score-bug before kick-off — a white tab "MATCHDAY · 25 OCT", then a dark
 * slate with the two clubs on two rows (crest + exact name, home first) and the kick-off time where the
 * score would be; the venue in small type under it. No score. The NEYOD logo sits like a channel mark
 * (top-right in the post, at the foot of the story).
 */
export function Natbug({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 560,
    fy: story ? 700 : 520,
    fs: story ? 250 : 168,
  });

  const fx = natFixture(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const head = [kicker, fx.date].filter(Boolean).join("  ·  ");
  const time = fx.kickoff;
  const venue = (content.venue ?? "").trim();

  const M = story ? 64 : 52;
  const top = (story ? STORY_TOP : 52) + (params.textY ?? 0);
  const logoAsk = 24;
  const lw = logoWidth(logoAsk, story) * (params.logoScale ?? 1);
  // Post: the logo shares the top band (channel mark top-right) — the bug stops 56px+ short of it.
  const maxW = story ? CANVAS_W - 2 * M : CANVAS_W - 2 * M - lw - 70;

  const crest = Math.round(30 * k);
  const padX = Math.round(16 * k);
  const timeSize = 27 * k * ts;
  const timeCol = time ? Math.round(capsEm(time, 0.02) * timeSize + 2 * 20 * k) : 0;
  const names = [fx.homeName, fx.awayName].map((n) => n.toUpperCase());
  const longest = Math.max(1, ...names.map((n) => capsEm(n, 0.05)));
  const nameSize = Math.min(20 * k * ts, (maxW - timeCol - crest - 3 * padX - 6 * k) / longest);
  const rowH = Math.round(44 * k * Math.max(0.85, Math.min(1.15, ts)));
  const headSize = Math.min(13 * k * ts, (maxW - 2 * padX) / Math.max(1, capsEm(head, 0.3)));

  const row = (name: string, url: string | null, first: boolean) => (
    <div style={{ height: rowH, display: "flex", alignItems: "center", gap: padX * 0.75, padding: `0 ${padX}px`, borderTop: first ? "none" : "1px solid rgba(255,255,255,.13)" }}>
      <div style={{ width: crest, height: crest, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} /> : null}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{name}</div>
    </div>
  );

  /* ---- where things go: the bug top-left, else top-right, else at the foot — never on his head ---- */
  const nameW = longest * nameSize;
  const bugW = Math.max(crest + 3 * padX + 6 * k + nameW + timeCol, capsEm(head, 0.3) * headSize + 2 * padX);
  const venueSize = Math.min(11.5 * k * ts, (Math.max(bugW, 300) - 2 * padX) / Math.max(1, capsEm(venue.toUpperCase(), 0.2)));
  const bugH = headSize + 14 * k + 2 * rowH + (venue ? venueSize + 18 * k : 0);
  type R = { l: number; t: number; w: number; h: number };
  const head0: R = { l: place.fx - place.faceW * 1.3, t: place.fy - place.fs * 0.9, w: place.faceW * 2.6, h: place.fs * 1.65 };
  const meet = (a: R, b: R, gap: number) => a.l < b.l + b.w + gap && a.l + a.w > b.l - gap && a.t < b.t + b.h + gap && a.t + a.h > b.t - gap;
  const away = place.fx > CANVAS_W / 2 ? "left" : "right";
  const footY = story ? STORY_BOTTOM : CANVAS_H - 52;
  const bugSpots: { side: "left" | "right"; foot: boolean }[] = [
    { side: "left", foot: false },
    { side: "right", foot: false },
    { side: away, foot: true },
  ];
  const bugRect = (s: { side: string; foot: boolean }): R => ({ l: s.side === "left" ? M : CANVAS_W - M - bugW, t: s.foot ? footY - bugH : top, w: bugW, h: bugH });
  const bug = bugSpots.find((s) => !meet(bugRect(s), head0, 24)) ?? bugSpots[0];
  const bugR = bugRect(bug);

  // The logo, like a channel mark: the first free spot (clear of his head, 56px+ from the bug).
  const lh = story ? 88 : 52;
  const lTop = story ? STORY_TOP : 50;
  const lBot = (story ? STORY_BOTTOM : CANVAS_H - 50) - lh;
  const xs = { left: M, right: CANVAS_W - M - lw, center: (CANVAS_W - lw) / 2 } as const;
  type Spot = { x: keyof typeof xs; y: number };
  const other = bug.side === "left" ? "right" : "left";
  const spots: Spot[] = story
    ? bug.foot
      ? [{ x: "center", y: lTop }, { x: other, y: lTop }, { x: bug.side, y: lTop }]
      : [{ x: "center", y: lBot }, { x: away, y: lBot }, { x: other, y: lBot }]
    : bug.foot
      ? [{ x: other, y: lTop }, { x: bug.side, y: lTop }, { x: "center", y: lTop }]
      : [{ x: other, y: lTop }, { x: away, y: lBot }, { x: "center", y: lBot }];
  const logoRect = (s: Spot): R => ({ l: xs[s.x], t: s.y, w: lw, h: lh });
  const logo = spots.find((s) => !meet(logoRect(s), head0, 20) && !meet(logoRect(s), bugR, 56)) ?? spots[0];
  const logoTop = logo.y - (params.logoY ?? 0);
  const logoLow = logo.y > H / 2;
  const sc = params.logoScale ?? 1;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* The bug is its own plate; only the logo gets a soft lens-like vignette in its corner, with no edge. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${story ? 820 : 760}px ${story ? 640 : 520}px at ${logo.x === "center" ? "50%" : logo.x} ${logoLow ? "bottom" : "top"}, rgba(0,0,0,.3), rgba(0,0,0,.14) 45%, rgba(0,0,0,0) 100%)` }} />

      {/* The bug. */}
      <div style={{ position: "absolute", ...(bug.side === "right" ? { right: M } : { left: M }), ...(bug.foot ? { bottom: H - footY - (params.textY ?? 0) } : { top }), display: "flex", flexDirection: "column", alignItems: "stretch", boxShadow: "0 6px 26px rgba(0,0,0,.28)" }}>
          <div style={{ background: "rgba(250,250,247,.95)", color: "#111", padding: `${Math.round(7 * k)}px ${padX}px`, fontFamily: SANS, fontWeight: 700, fontSize: headSize, lineHeight: 1, letterSpacing: "0.3em", whiteSpace: "nowrap" }}>{head}</div>
          <div style={{ display: "flex", background: BUG_PLATE, color: "#fff" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {row(names[0], fx.homeCrest, true)}
              {row(names[1], fx.awayCrest, false)}
            </div>
            {time && (
              <div style={{ width: timeCol, borderLeft: "1px solid rgba(255,255,255,.16)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * k }}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 10 * k * ts, lineHeight: 1, letterSpacing: "0.28em", paddingLeft: "0.28em", opacity: 0.66 }}>KO</div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: timeSize, lineHeight: 1, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" }}>{time}</div>
              </div>
            )}
          </div>
        {venue && (
          <div style={{ background: "rgba(12,16,14,.56)", borderTop: "1px solid rgba(255,255,255,.1)", padding: `${Math.round(9 * k)}px ${padX}px`, fontFamily: SANS, fontWeight: 600, fontSize: venueSize, lineHeight: 1, letterSpacing: "0.2em", whiteSpace: "nowrap", color: "rgba(255,255,255,.88)" }}>
            {venue.toUpperCase()}
          </div>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={logoAsk}
        style={{
          position: "absolute",
          top: logoTop,
          ...(logo.x === "center" ? { left: "50%", transform: `translateX(-50%) scale(${sc})` } : logo.x === "left" ? { left: M, transform: `scale(${sc})` } : { right: M, transform: `scale(${sc})` }),
          transformOrigin: `${logo.x} ${logoLow ? "bottom" : "top"}`,
        }}
      />
    </div>
  );
}
