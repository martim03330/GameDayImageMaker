/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter at line-height 1: where the cap top and the baseline fall inside the line box (em). */
const CAP_TOP = 0.137;
const BASE = 0.864;
const CAP_H = BASE - CAP_TOP;
const TRACK = 0.14;
/** Heavy Inter caps run a little wider than capsEm's table. */
const WIDE = 1.06;
/** A crest beside a corner line: its height and the gap to the text (× the type size). */
const CREST = 1.55;
const CREST_GAP = 0.5;

export type QuadCorner = { text: string; crest?: string | null };

const SHADOW = "0 0 2px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.5), 0 2px 14px rgba(0,0,0,.45)";

/**
 * The shared frame of the natural four-corner looks: his photo full-bleed (real grass, stands, light, only
 * the light grade) framed like a viewfinder — each corner of the frame holds ONE short line in the same
 * small bold caps (crests beside the club names), the middle left to the photo. Each corner sits on its own
 * soft local shade, nothing else touches the photo. The NEYOD logo alone, centred on the top row (or the
 * bottom row when his head rises into it); when the row is too full for the logo to keep its clear space,
 * it stands just inside that row instead.
 */
export function NatQuadFrame({ data, tl, tr, bl, br }: { data: RenderData; tl: QuadCorner; tr: QuadCorner; bl: QuadCorner; br: QuadCorner }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const M = story ? 64 : 56;
  const ty = params.textY ?? 0;

  /* ---- one type size for all four corners: as asked, shrunk only if a row would not fit ---- */
  const crestOf = (c: QuadCorner) => (c.text && c.crest ? c.crest : null);
  const widthAt = (c: QuadCorner, px: number) => (c.text ? px * capsEm(c.text, TRACK) * WIDE + (crestOf(c) ? px * (CREST + CREST_GAP) : 0) : 0);
  const unit = (c: QuadCorner) => widthAt(c, 1);
  const room = CANVAS_W - 2 * M - 72;
  const px = Math.max(20, Math.min((story ? 37 : 28) * ts, room / Math.max(1, unit(tl) + unit(tr)), room / Math.max(1, unit(bl) + unit(br))));
  const capH = px * CAP_H;
  const crestH = Math.round(px * CREST);
  const w = { tl: widthAt(tl, px), tr: widthAt(tr, px), bl: widthAt(bl, px), br: widthAt(br, px) };

  /* ---- rows: the cap middle of the top and bottom lines ---- */
  const logoH = Math.round((story ? 88 : 52) * (params.logoScale ?? 1));
  const logoW = logoH * (2466 / 807);
  const topMid = (story ? STORY_TOP + 44 : 78) - ty;
  const botMid = (story ? STORY_BOTTOM - 44 : CANVAS_H - 78) - ty;
  const rowHalf = (c1: QuadCorner, c2: QuadCorner) => Math.max(capH / 2, crestOf(c1) || crestOf(c2) ? crestH / 2 : 0);

  /* ---- his face in the middle of the frame ---- */
  const fs = story ? 250 : 168;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: story ? 780 : 520, fs });
  const hairTop = place.fy - place.fs * 0.85;
  const chinBottom = place.fy + place.fs * 0.7;
  const headL = place.fx - place.faceW * 1.0;
  const headR = place.fx + place.faceW * 1.0;
  // A photo with no headroom (the cover framing slides him up): when his hair would run into one top
  // corner, that corner's line steps over to the other top corner as a second line (the frame keeps
  // three corners, his head stays clear). Both blocked (head huge and centred): left as asked.
  const topRowBottom = topMid + rowHalf(tl, tr) + 28;
  const hitL = Boolean(tl.text) && hairTop < topRowBottom && headL < M + w.tl + 32;
  const hitR = Boolean(tr.text) && hairTop < topRowBottom && headR > CANVAS_W - M - w.tr - 32;
  const moveR = hitR && !hitL && headL > M + Math.max(w.tl, w.tr) + 48;
  const moveL = hitL && !hitR && headR < CANVAS_W - M - Math.max(w.tl, w.tr) - 48;
  const mid2 = topMid + capH + px * 0.9;

  /* ---- the logo: centred on a row when it keeps ≥ 56px from both corners, else just inside that row ---- */
  const logoL = (CANVAS_W - logoW) / 2;
  const inline = (a: number, b: number) => M + a + 56 <= logoL && CANVAS_W - M - b - 56 >= logoL + logoW;
  const topW = moveR ? [Math.max(w.tl, w.tr), 0] : moveL ? [0, Math.max(w.tl, w.tr)] : [w.tl, w.tr];
  const topLogo = inline(topW[0], topW[1]) ? topMid - logoH / 2 : topMid + rowHalf(tl, tr) + 56;
  const botLogo = inline(w.bl, w.br) ? botMid - logoH / 2 : botMid - rowHalf(bl, br) - 56 - logoH;
  const overHead = (top: number) => top < chinBottom + 40 && top + logoH > hairTop - 48 && logoL < headR && logoL + logoW > headL;
  const atTop = !overHead(topLogo) || overHead(botLogo);
  const logoTop = (atTop ? topLogo : botLogo) - (params.logoY ?? 0);

  /* ---- a corner: crest beside the club name (outer side), cap-centred on its row ---- */
  const corner = (c: QuadCorner, right: boolean, mid: number) => {
    if (!c.text) return null;
    const crest = crestOf(c);
    const textTop = mid - px * CAP_TOP - capH / 2;
    const textStyle: CSSProperties = { fontFamily: SANS, fontWeight: 800, fontSize: px, lineHeight: 1, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", color: "#ffffff", textShadow: SHADOW };
    const crestEl = crest ? <img src={crest} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))", flexShrink: 0 }} /> : null;
    return (
      <div
        key={`${right}${mid}`}
        style={{ position: "absolute", top: mid - crestH / 2, height: crestH, ...(right ? { right: M - px * TRACK } : { left: M }), display: "flex", alignItems: "center", gap: px * CREST_GAP, flexDirection: right ? "row-reverse" : "row" }}
      >
        {crestEl}
        <div style={{ position: "relative", height: crestH, width: px * capsEm(c.text, TRACK) * WIDE }}>
          <div style={{ position: "absolute", top: textTop - (mid - crestH / 2), ...(right ? { right: 0 } : { left: 0 }), ...textStyle }}>{c.text}</div>
        </div>
      </div>
    );
  };

  /* ---- soft local shades: one per corner (and one behind the logo when it stands off a row) ---- */
  const shade = (right: boolean, bottom: boolean, width: number, mid: number) => {
    const sw = Math.min(CANVAS_W * 0.78, width + 2 * M + (story ? 300 : 230));
    const sh = (bottom ? H - mid : mid) * 2 + (story ? 220 : 170);
    const at = `${right ? "100%" : "0%"} ${bottom ? "100%" : "0%"}`;
    return (
      <div
        key={`s${right}${bottom}${mid}`}
        style={{
          position: "absolute",
          width: sw,
          height: sh,
          ...(right ? { right: 0 } : { left: 0 }),
          ...(bottom ? { bottom: 0 } : { top: 0 }),
          background: `radial-gradient(ellipse farthest-side at ${at}, rgba(0,0,0,.52), rgba(0,0,0,.3) 45%, rgba(0,0,0,0) 100%)`,
        }}
      />
    );
  };
  const logoInline = atTop ? inline(topW[0], topW[1]) : inline(w.bl, w.br);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {tl.text && (moveL ? shade(true, false, Math.max(w.tl, w.tr), mid2) : shade(false, false, w.tl, topMid))}
      {tr.text && (moveR ? shade(false, false, Math.max(w.tl, w.tr), mid2) : shade(true, false, w.tr, topMid))}
      {bl.text && shade(false, true, w.bl, botMid)}
      {br.text && shade(true, true, w.br, botMid)}
      {!logoInline && (
        <div
          style={{
            position: "absolute",
            left: logoL - 160,
            width: logoW + 320,
            top: logoTop - 90,
            height: logoH + 180,
            background: "radial-gradient(ellipse closest-side, rgba(0,0,0,.26), rgba(0,0,0,0))",
          }}
        />
      )}

      {moveL ? corner(tr, true, topMid) : corner(tl, false, topMid)}
      {moveL ? corner(tl, true, mid2) : moveR ? corner(tl, false, topMid) : corner(tr, true, topMid)}
      {moveR && corner(tr, false, mid2)}
      {corner(bl, false, botMid)}
      {corner(br, true, botMid)}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoL, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · four corners (matchday): his own match photo full-bleed — real grass, stands and light — framed
 * like a viewfinder: "MATCHDAY" top-left, "25 OCT · 15:00" top-right, the home club (exact name, crest)
 * bottom-left and the away club (exact name, crest) bottom-right, all in the same small bold caps; the
 * middle left to the photo. The NEYOD logo alone, top- or bottom-centre, whichever is clear of his head.
 */
export function Natquad({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").replace(/’/g, "'").trim().toUpperCase();
  const when = [fx.date, fx.kickoff].filter(Boolean).join(" · ");
  return (
    <NatQuadFrame
      data={data}
      tl={{ text: word }}
      tr={{ text: when || (fx.venue || "").toUpperCase() }}
      bl={{ text: fx.homeName.toUpperCase(), crest: fx.homeCrest }}
      br={{ text: fx.awayName.toUpperCase(), crest: fx.awayCrest }}
    />
  );
}
