/* eslint-disable @next/next/no-img-element */
import { luminance } from "@/lib/color";
import { NatGround, natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { SERIF, Shell, caps, fit, frameOf, small } from "./natref1";
import { Filled } from "./natref4";
import { FlagClock, Portrait, portraitOf } from "./prokit";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 57 · natural looks after ONE reference each, photo treatment first:
 *
 *   natrefpan   "Matchdag." (GNK Dinamo, Pinterest "matchday poster motion blur panning player")
 *     treatment: a horizontal PANNING blur of the surroundings only (x-only smear, him cut out of every copy), a
 *                deep green-tinted grade with darker edges; he stays sharp
 *     type:      a title-case serif word high at the left, a tiny fixture line above it
 *
 *   natrefghost "MOREIRENSE / SL BENFICA" (liked03)
 *     treatment: his photo graded into a black → club-colour gradient (dark top, the club colour rising from the
 *                foot), a big colour close-up of him behind fading into it, his full figure sharp in front
 *     type:      small clean caps at the lower right — both clubs, the ground, the flags clock
 */

const W = CANVAS_W;

function clubCol(d: RenderData) {
  const ok = (c?: string) => !!c && /^#[0-9a-f]{6}$/i.test(c) && c.toLowerCase() !== "#ffffff" && luminance(c) > 0.04 && luminance(c) < 0.8;
  return ok(d.params.primary) ? d.params.primary! : ok(d.params.accent) ? d.params.accent! : "#c8102e";
}

/* ===== natrefpan — horizontal panning blur ===== */

export function Natrefpan({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 420 : 640, fy: story ? 820 : 600, fs: story ? 220 : 145 });
  const kick = d.content.kicker ? d.content.kicker.charAt(0).toUpperCase() + d.content.kicker.slice(1).toLowerCase() : "Matchday";
  const word = `${kick}.`;
  const line = `${fx.homeName} v ${fx.awayName}${fx.kickoff ? `  |  ${fx.kickoff}` : ""}`;
  // The word high under the logo band when that is free; else lower, full width or in the free half — whichever box
  // touches him least (his face, then his body, legs and ball). Each box sizes its own word.
  const full = W - 140;
  const half = W / 2 - 90;
  const cands = [
    { x0: 70, w: full, y: logoTop + (story ? 170 : 110) },
    { x0: 70, w: full, y: logoTop + (story ? 260 : 180) },
    ...[0.62, 0.72, 0.8].flatMap((f) => [{ x0: 70, w: full, y: H * f }, { x0: 70, w: half, y: H * f }, { x0: W / 2 + 20, w: half, y: H * f }]),
  ].map((c) => {
    const wPx = fit(130 * k * ts, c.w, word.length, 0.5);
    const lPx = fit(15 * k * ts, c.w, line.length, 0.55);
    return { ...c, wPx, lPx, h: lPx * 2 + wPx };
  }).filter((c) => c.wPx >= 64 * k);
  const spot = pickTextSpot(place, cands.map((c) => ({ x0: c.x0, y0: c.y, x1: c.x0 + c.w, y1: c.y + c.h })));
  const { y, wPx, lPx, x0 } = cands[spot.index];
  const low = y > H * 0.5;
  const shifts = [-90, -60, -30, 30, 60, 90, -130, 130];
  return (
    <Shell
      data={d}
      place={place}
      bg="#0b1a10"
      ground={
        <>
          <Filled place={place} H={H} />
          {/* x-only: copies of the surroundings slid left and right, never scaled or moved vertically. */}
          {shifts.map((dx, i) => (
            <div key={dx} style={{ position: "absolute", inset: 0, transform: `translateX(${dx * k}px)`, opacity: 0.32 - (i > 5 ? 0.12 : 0) }}>
              <Filled place={place} H={H} />
            </div>
          ))}
          <div style={{ position: "absolute", inset: 0, background: "#2f7a45", mixBlendMode: "color", opacity: 0.55 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 100%)" }} />
        </>
      }
      front={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + 420 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
          {low && <div style={{ position: "absolute", left: 0, right: 0, top: y - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55) 50%)" }} />}
          <div style={{ position: "absolute", left: x0, top: y, textShadow: "0 2px 16px rgba(0,0,0,.45)" }}>
            <div style={small(lPx, { opacity: 0.9, marginBottom: 8 * k })}>{line}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.02em" }}>{word}</div>
          </div>
        </>
      }
    />
  );
}

/* ===== natrefghost — club-colour gradient grade + big close-up behind ===== */

export function Natrefghost({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const col = clubCol(d);
  const s = portraitOf(d);
  // He stands low and a little left (as in the reference); the close-up sits high and right behind him.
  // His front figure small at the lower left; a wide pose is scaled down until it keeps clear of the close-up's column.
  const want = { fx: 330, fy: story ? 1080 : 800, fs: story ? 140 : 95 };
  const p0 = natPlace(d, W, H, want);
  const maxW = W * 0.52;
  const place = p0.box.width > maxW ? natPlace(d, W, H, { ...want, fx: 300, fs: want.fs * (maxW / p0.box.width), fy: want.fy + 40 }) : p0;
  const iw = W * 0.46;
  const hn = fx.homeName.toUpperCase();
  const an = fx.awayName.toUpperCase();
  const nPx = Math.min(...[hn, an].map((n) => fit(26 * k * ts, iw, n.length, 0.62)));
  const venue = (d.content.venue || fx.venue || "").toUpperCase();
  const vPx = fit(15 * k * ts, iw, venue.length, 0.62);
  const infoTop = bottom - nPx * 2.6 - vPx * 1.6 - 60 * k;
  const crest = d.club?.crestUrl;
  return (
    <Shell
      data={d}
      place={place}
      bg="#0b0b0b"
      ground={
        <>
          {/* The reference is mostly flat colour: the real ground only shows faintly at the dark top; from the middle
              down it is a flat, bright club-colour gradient. */}
          <NatGround place={place} W={W} H={H} style={{ filter: "grayscale(1) contrast(1.15) brightness(.5)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(10,10,10,.72) 0%, rgba(10,10,10,.55) 20%, ${col}e6 52%, ${col} 75%, ${col} 100%)` }} />
          {s && <Portrait s={s} cx={W * 0.7} cy={logoTop + (story ? 360 : 250)} fh={story ? 240 : 170} mode="color" fade={45} opacity={0.95} />}
          <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.45, bottom: 0, background: `linear-gradient(to bottom, ${col}00, ${col}d9 45%, ${col})` }} />
        </>
      }
      front={
        <>
          {crest && <img src={crest} alt="" style={{ position: "absolute", right: 70, top: logoTop + (story ? 150 : 100), width: 84 * k, height: 84 * k, objectFit: "contain", filter: "grayscale(1) brightness(2.2) drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />}
          <div style={{ position: "absolute", right: 70, top: infoTop, width: iw, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 1px 10px rgba(0,0,0,.45)" }}>
            {roundTitle(d) && <div style={{ ...caps(13 * k * ts, { opacity: 0.85 }), marginBottom: 10 * k }}>{roundTitle(d)}</div>}
            <div style={caps(nPx, { fontWeight: 500, letterSpacing: "0.04em" })}>{hn}</div>
            <div style={caps(nPx, { fontWeight: 800, letterSpacing: "0.04em" })}>{an}</div>
            {venue && <div style={{ ...caps(vPx, { opacity: 0.9 }), marginTop: 14 * k }}>{venue}</div>}
            <div style={{ marginTop: 10 * k }}>
              <FlagClock d={d} px={18 * k * ts} color="#fff" gap={18 * k} />
            </div>
          </div>
        </>
      }
    />
  );
}
