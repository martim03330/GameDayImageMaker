/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { BUG_PLATE, logoWidth } from "./natbug";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · TV lower-third: his real celebration photo full-bleed and almost untouched, and at the foot
 * a quiet broadcast lower-third — a small white "GOAL" tab, then a dark slate with a thin accent bar: his
 * full name, and under it his club's exact name. No score. The NEYOD logo sits like a channel mark in a top
 * corner, clear of his head.
 */
export function Goalnatbug({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540,
    fy: story ? 660 : 440,
    fs: story ? 250 : 172,
  });

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const accent = params.accent || "#2c88dd";

  const M = story ? 64 : 52;
  const maxW = CANVAS_W - 2 * M;
  const padX = Math.round(22 * k);
  const bar = Math.round(6 * k);
  const nameSize = Math.min(42 * k * ts, (maxW - 2 * padX - bar) / Math.max(1, capsEm(name, 0.02)));
  const clubSize = Math.min(16 * k * ts, (maxW - 2 * padX - bar) / Math.max(1, capsEm(club, 0.22)));
  const tabSize = 15 * k * ts;
  const plateW = Math.max(capsEm(name, 0.02) * nameSize, capsEm(club, 0.22) * clubSize) + 2 * padX + bar;
  const plateH = nameSize + (club ? clubSize + 14 * k : 0) + 2 * 18 * k;
  const blockH = plateH + tabSize + 2 * 8 * k;
  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);

  /* ---- keep everything off his head ---- */
  type R = { l: number; t: number; w: number; h: number };
  const head0: R = { l: place.fx - place.faceW * 1.3, t: place.fy - place.fs * 0.9, w: place.faceW * 2.6, h: place.fs * 1.65 };
  const meet = (a: R, b: R, gap: number) => a.l < b.l + b.w + gap && a.l + a.w > b.l - gap && a.t < b.t + b.h + gap && a.t + a.h > b.t - gap;
  const third: R = { l: M, t: bottom - blockH, w: plateW, h: blockH };
  const thirdRight = meet(third, head0, 24) && !meet({ ...third, l: CANVAS_W - M - plateW }, head0, 24);

  const lw = logoWidth(24, story) * (params.logoScale ?? 1);
  const lh = story ? 88 : 52;
  const lTop = story ? STORY_TOP : 50;
  const xs = { right: CANVAS_W - M - lw, left: M, center: (CANVAS_W - lw) / 2 } as const;
  const order: (keyof typeof xs)[] = place.fx < CANVAS_W / 2 ? ["right", "center", "left"] : ["right", "left", "center"];
  const lx = order.find((x) => !meet({ l: xs[x], t: lTop, w: lw, h: lh }, head0, 20)) ?? "right";
  const logoTop = lTop - (params.logoY ?? 0);
  const sc = params.logoScale ?? 1;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A breath of shade under the logo and under the lower-third — nothing else touches the photo. */}
      {/* Like a lens vignette: the corner of the logo darkens a little, softly, with no edge. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${story ? 820 : 760}px ${story ? 640 : 520}px at ${lx === "center" ? "50%" : lx} top, rgba(0,0,0,.3), rgba(0,0,0,.14) 45%, rgba(0,0,0,0) 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + blockH + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />

      {/* The lower-third. */}
      <div style={{ position: "absolute", ...(thirdRight ? { right: M, alignItems: "flex-end" } : { left: M, alignItems: "flex-start" }), bottom: H - bottom, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "rgba(250,250,247,.96)", color: "#111", padding: `${Math.round(8 * k)}px ${Math.round(14 * k)}px`, fontFamily: SANS, fontWeight: 800, fontSize: tabSize, lineHeight: 1, letterSpacing: "0.34em", paddingRight: `calc(${Math.round(14 * k)}px - 0.34em)`, whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-block", width: Math.round(7 * k), height: Math.round(7 * k), borderRadius: "50%", background: accent, marginRight: Math.round(10 * k), verticalAlign: "middle", transform: `translateY(-${Math.round(1.5 * k)}px)` }} />
          {kicker}
        </div>
        <div style={{ display: "flex", background: BUG_PLATE, boxShadow: "0 8px 30px rgba(0,0,0,.3)" }}>
          <div style={{ width: bar, background: accent, flexShrink: 0 }} />
          <div style={{ padding: `${Math.round(18 * k)}px ${padX}px`, display: "flex", flexDirection: "column", gap: Math.round(14 * k), color: "#fff" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 0.9, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{name}</div>
            {club && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: clubSize, lineHeight: 1, letterSpacing: "0.22em", whiteSpace: "nowrap", opacity: 0.82 }}>{club}</div>}
          </div>
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{
          position: "absolute",
          top: logoTop,
          ...(lx === "center" ? { left: "50%", transform: `translateX(-50%) scale(${sc})` } : lx === "left" ? { left: M, transform: `scale(${sc})` } : { right: M, transform: `scale(${sc})` }),
          transformOrigin: `${lx} top`,
        }}
      />
    </div>
  );
}
