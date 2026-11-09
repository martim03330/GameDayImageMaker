/* eslint-disable @next/next/no-img-element */
import { capsEm, NatFigure, NatGround, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** NEYOD logo file aspect (2466 × 807). */
const LOGO_ASPECT = 2466 / 807;

/**
 * The shared frame of the natural cinema looks: a cinematic letterbox — solid black bars top and bottom with
 * his photo between them untouched (light grade only). The top bar holds the word in wide-tracked medium caps,
 * centred; the bottom bar a small caps info line (or two) and the NEYOD logo small at its right end, alone.
 * The bars never cover his head: when his hair would come under the top bar the photo is framed lower, and
 * failing that the bar is thinned.
 */
export function CinemaFrame({ data, word, line, alt }: { data: RenderData; word: string; /** The info line in one run. */ line: string; /** The same info in two lines, used when one line would be too small. */ alt?: [string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;

  // Bars: post ~120px each; story thicker so the type sits inside Instagram's safe band (STORY_TOP..STORY_BOTTOM).
  let topBar = story ? 290 : 120;
  const botBar = story ? H - (STORY_BOTTOM - 112) : 120;
  const want = { fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540, fy: story ? 720 : 480, fs: story ? 262 : 180 };
  let place = natPlace(data, W, H, want);
  // Hair top ≈ fy − 0.75·fs: keep ≥ 36px of photo between the bar and his hair.
  const clear = (p: typeof place) => p.fy - 0.75 * p.fs - (topBar + 36);
  if (clear(place) < 0) {
    const again = natPlace(data, W, H, { ...want, fy: want.fy - clear(place) });
    if (clear(again) > clear(place)) place = again;
  }
  if (clear(place) < 0) topBar = Math.max(story ? 230 : 72, Math.round(place.fy - 0.75 * place.fs - 36));

  const wordSize = (story ? 56 : 40) * ts;
  const track = 0.42;
  const wordFit = Math.min(wordSize, (W - 160) / capsEm(word, track));
  // The word sits in the visible part of the top bar (stories: below STORY_TOP).
  const wordMid = story ? Math.max(STORY_TOP + wordFit * 0.7, topBar - 70) : topBar / 2;

  const logoAsk = 22;
  const logoH = story ? 88 : 52;
  const logoW = logoH * LOGO_ASPECT * (params.logoScale ?? 1);
  const side = story ? 70 : 56;
  const rowMid = story ? STORY_BOTTOM - logoH / 2 : H - botBar / 2;
  const textW = W - 2 * side - logoW - (story ? 64 : 56);
  const infoBase = (story ? 31 : 23) * ts;
  const infoTrack = 0.14;
  const one = textW / capsEm(line, infoTrack);
  const two = alt ? Math.min(...alt.map((l) => textW / capsEm(l, infoTrack))) : 0;
  const useAlt = !!alt && one < infoBase * 0.86 && two > one;
  const lines = useAlt ? alt! : [line];
  const infoSize = Math.min(infoBase * (useAlt ? 0.92 : 1), useAlt ? two : one);

  const caps = { fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap" as const };

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#000" }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: topBar, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: botBar, background: "#000" }} />

      <div
        style={{
          ...caps,
          position: "absolute",
          left: 0,
          right: 0,
          top: wordMid - (params.textY ?? 0),
          transform: "translateY(-50%)",
          textAlign: "center",
          fontWeight: 500,
          fontSize: wordFit,
          lineHeight: 1,
          letterSpacing: `${track}em`,
          // The tracking also trails the last letter: shift back by half of it to stay optically centred.
          paddingLeft: wordFit * track,
        }}
      >
        {word}
      </div>

      <div
        style={{
          ...caps,
          position: "absolute",
          left: side,
          width: textW,
          top: rowMid,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: infoSize * 0.38,
          fontWeight: 500,
          fontSize: infoSize,
          lineHeight: 1.1,
          letterSpacing: `${infoTrack}em`,
          color: "rgba(255,255,255,.92)",
        }}
      >
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={logoAsk}
        style={{ position: "absolute", right: side, top: rowMid - logoH / 2 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right center" }}
      />
    </div>
  );
}

/** The word as typed in the kicker (or the fallback), caps, no trailing punctuation. */
export function cinemaWord(kicker: string | undefined, fallback: string): string {
  return (kicker || fallback).replace(/[.!]+$/, "").trim().toUpperCase();
}

/**
 * Natural · cinema (matchday): a cinematic letterbox over his own match photo — "MATCHDAY" wide-tracked in the
 * top bar, "HOME v AWAY · 25 OCT · 15:00" (exact names, home first) small in the bottom bar with the NEYOD
 * logo at its right end.
 */
export function Natcinema({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const when = [fx.date, fx.kickoff].filter(Boolean).join(" · ");
  const line = [match, when].filter(Boolean).join(" · ");
  return <CinemaFrame data={data} word={cinemaWord(data.content.kicker, "Matchday")} line={line} alt={match && when ? [match, when] : undefined} />;
}
