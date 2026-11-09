/* eslint-disable @next/next/no-img-element */
import { luminance, shade, vivid } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { freeColumn } from "./natfree";
import { scoreOf } from "./outline";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHADOW = "0 1px 3px rgba(0,0,0,.5), 0 2px 18px rgba(0,0,0,.45)";

const fit = (text: string, max: number, w: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(text, tracking)));

/** The club's own colour, readable under white type (a near-white club falls back to its accent, then darkened). */
export function clubInk(data: RenderData): string {
  let c = vivid(data.params.primary === "#10131c" ? data.params.accent : data.params.primary);
  if (luminance(c) > 0.6) c = vivid(data.params.accent);
  return luminance(c) > 0.45 ? shade(c, -0.35) : c;
}

export function Logo({ data, top, onLight = false }: { data: RenderData; top: number; onLight?: boolean }) {
  return <AgencyLogo data={data} height={24} onLight={onLight} style={{ position: "absolute", left: "50%", top, transform: `translateX(-50%) scale(${data.params.logoScale ?? 1})`, transformOrigin: "center top" }} />;
}

/** Top of the logo at the foot (story: inside the safe zone). */
export function logoTopOf(data: RenderData, H: number) {
  const story = H > 1400;
  return (story ? STORY_BOTTOM : H - 48) - (data.params.textY ?? 0) - (story ? 88 : 52) - (data.params.logoY ?? 0);
}

/**
 * The slim broadcast scoreboard (2026 World Cup scoreboard concept: one dark bar, crests at the ends, the
 * middle cell in the club's colour): home crest and exact name, the middle cell, away name and crest.
 * The names shrink to fit the bar, never cut.
 */
function ScoreBar({ data, top, middle, k }: { data: RenderData; top: number; middle: string; k: number }) {
  const fx = natFixture(data);
  const M = 48;
  const h = 74 * k;
  const crest = 48 * k;
  const midW = Math.max(150 * k, capsEm(middle, 0.04) * 30 * k + 44 * k);
  const sideW = (CANVAS_W - 2 * M - midW) / 2 - crest - 34 * k;
  const nPx = Math.min(fit(fx.homeName.toUpperCase(), 21 * k, sideW, 0.06), fit(fx.awayName.toUpperCase(), 21 * k, sideW, 0.06));
  const name = (t: string, align: "left" | "right") => <div style={{ flex: 1, textAlign: align, fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.06em", whiteSpace: "nowrap", lineHeight: 1 }}>{t.toUpperCase()}</div>;
  const crestEl = (src: string | null) => (src ? <img src={src} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} /> : <div style={{ width: crest }} />);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, height: h, display: "flex", alignItems: "stretch", borderRadius: 10 * k, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,.35)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 * k, padding: `0 ${16 * k}px`, background: "rgba(13,16,20,.88)", color: OFF_WHITE }}>
        {crestEl(fx.homeCrest)}
        {name(fx.homeName, "left")}
      </div>
      <div style={{ width: midW, display: "flex", alignItems: "center", justifyContent: "center", background: clubInk(data), color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 30 * k, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{middle}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 * k, padding: `0 ${16 * k}px`, background: "rgba(13,16,20,.88)", color: OFF_WHITE }}>
        {name(fx.awayName, "right")}
        {crestEl(fx.awayCrest)}
      </div>
    </div>
  );
}

/**
 * Placard (matchday): his real photo whole, and at the top, above his head, the slim scoreboard of the 2026
 * broadcast concepts with the kick-off in the middle cell; under it one tiny line (round · ground · Portugal's
 * time abroad). The NEYOD logo centred at the foot.
 */
export function Scorebug({ data }: { data: RenderData }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.25 : 1;
  const ts = params.textScale ?? 1;
  const top = (story ? STORY_TOP + 10 : 48) - (params.textY ?? 0);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 450 : 630, fy: top + 260 * k + (story ? 220 : 150), fs: story ? 220 : 150 });
  const fx = natFixture(data);
  const f = matchFacts(data);
  const sub = [f.roundNo ? `${(data.content.kicker || "Matchday").toUpperCase()} ${f.roundNo}` : f.comp, fx.venue, fx.ptTime].filter(Boolean).join("  ·  ").toUpperCase();
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 300 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTopOf(data, H) - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <ScoreBar data={data} top={top} middle={fx.time || fx.date || "VS"} k={k * ts} />
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: top + 74 * k * ts + 22 * k, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: fit(sub, 15 * k * ts, CANVAS_W - 120, 0.18), letterSpacing: "0.18em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{sub}</div>}
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Golo · placard (goal): the same slim scoreboard at the top with the score in the club-coloured cell (GOAL when
 * no score is known), and under it "GOAL — HIS NAME". His celebration whole below it.
 */
export function Goalscorebug({ data }: { data: RenderData }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.25 : 1;
  const ts = params.textScale ?? 1;
  const top = (story ? STORY_TOP + 10 : 48) - (params.textY ?? 0);
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 450 : 630, fy: top + 340 * k + (story ? 230 : 150), fs: story ? 230 : 155 });
  const score = scoreOf(data, "–");
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const sub = [(data.content.kicker || "Goal").toUpperCase(), name].filter(Boolean).join("  —  ");
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 300 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTopOf(data, H) - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <ScoreBar data={data} top={top} middle={score || (data.content.kicker || "GOAL").toUpperCase()} k={k * ts} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 74 * k * ts + 24 * k, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: fit(sub, 19 * k * ts, CANVAS_W - 120, 0.16), letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{sub}</div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Campo de cor (matchday): his real photo fills the upper part; the lower part is a calm block in his club's
 * colour with one big soft arc of a lighter tint (the "abstract team colour graphic" of current matchday
 * posters) and the fixture in bold white sans: MATCHDAY 14, the two clubs, date · kick-off · ground, the logo.
 */
export function Colorfield({ data }: { data: RenderData }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const photoH = Math.round(H * 0.6);
  const place = natPlace(data, CANVAS_W, photoH, { fx: params.side === "left" ? 460 : 620, fy: photoH * 0.36, fs: story ? 210 : 140 });
  const fx = natFixture(data);
  const f = matchFacts(data);
  const ink = clubInk(data);
  const M = 70;
  const title = [(data.content.kicker || "Matchday").toUpperCase(), f.roundNo].filter(Boolean).join(" ");
  const teams = fx.homeName && fx.awayName ? `${fx.homeName}  v  ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const tPx = Math.min(96 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(title, 0) * 0.78));
  const blockTop = photoH + 70 * k;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ink, color: "#fff" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: photoH, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={photoH} />
        {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={photoH} />}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${ink}66)` }} />
      </div>
      {/* The abstract colour graphic: one big soft arc in a lighter tint, rising from the block's corner. */}
      <div style={{ position: "absolute", left: params.side === "left" ? -CANVAS_W * 0.35 : CANVAS_W * 0.35, top: photoH - 40, width: CANVAS_W * 1.1, height: CANVAS_W * 1.1, borderRadius: "50%", background: `radial-gradient(circle at 50% 50%, ${shade(ink, 0.18)}, ${shade(ink, 0.06)} 60%, ${ink} 72%)`, opacity: 0.9 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: photoH - 2, height: 4 * k, background: "rgba(255,255,255,.85)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: blockTop }}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{title}</div>
        {teams && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(teams, 26 * k * ts, CANVAS_W - 2 * M, 0.06), letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 30 * k }}>{teams}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(when, 17 * k * ts, CANVAS_W - 2 * M, 0.14), letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 18 * k, opacity: 0.9 }}>{when}</div>}
        <div style={{ display: "flex", gap: 20 * k, marginTop: 30 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((c) => (
            <img key={c} src={c!} alt="" style={{ width: 64 * k, height: 64 * k, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.3))" }} />
          ))}
        </div>
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Espaço negativo (matchday): he is framed low, so the stands above him become a wide calm sky; in it a big
 * light-weight "Matchday" and the round's number, then the fixture in one small line. Generous empty space,
 * the type standing on its own (the negative-space posters of current matchday design).
 */
export function Airspace({ data }: { data: RenderData }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const M = 70;
  const top = (story ? STORY_TOP + 40 : 60) - (params.textY ?? 0);
  const fx = natFixture(data);
  const f = matchFacts(data);
  const word = (data.content.kicker || "Matchday").charAt(0).toUpperCase() + (data.content.kicker || "Matchday").slice(1).toLowerCase();
  const wPx = Math.min(130 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.5));
  const num = f.roundNo;
  const nPx = Math.min(260 * k * ts, wPx * 2);
  const teams = fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}`.toUpperCase() : "";
  const when = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ").toUpperCase();
  const textBottom = top + wPx + (num ? nPx * 0.9 : 0) + 120 * k;
  const fs = story ? 190 : 130;
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 460 : 620, fy: textBottom + fs * 0.75 + 70 * k, fs });
  const align = params.side === "left" ? "right" : "left";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "brightness(.9)" }} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: textBottom + 140, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.3) 70%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTopOf(data, H) - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, textAlign: align }}>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{word}</div>
        {num && <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: nPx, lineHeight: 0.9, letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>{num}</div>}
        {teams && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fit(teams, 19 * k * ts, CANVAS_W - 2 * M, 0.12), letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 34 * k, textShadow: SHADOW }}>{teams}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fit(when, 15 * k * ts, CANVAS_W - 2 * M, 0.14), letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap", marginTop: 14 * k, opacity: 0.88, textShadow: SHADOW }}>{when}</div>}
      </div>
      <Logo data={data} top={logoTopOf(data, H)} />
    </div>
  );
}

/**
 * Nome lateral (goal): his surname huge in tall condensed caps, turned upright along the free edge beside his
 * celebration (the player posts on club accounts and Behance), GOAL tracked small above it and his club's
 * exact name under it — all in that column, never over him.
 */
export function Goalsidename({ data }: { data: RenderData }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 400 : 680, fy: story ? 640 : 440, fs: story ? 220 : 150 });
  const { colX, colW } = freeColumn(place, heLeft, 50);
  const surname = (data.content.lastName || data.content.firstName || "").toUpperCase();
  const word = (data.content.kicker || "Goal").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const top = (story ? STORY_TOP : 48) - (params.textY ?? 0);
  const logoTop = logoTopOf(data, H);
  const runTop = top + 60 * k;
  const runBottom = logoTop - 90 * k;
  const run = runBottom - runTop;
  // Turned 90°: the line's length runs down the column, its height across it.
  const sPx = Math.min(colW * 0.95 / 0.86, run / Math.max(1, surname.length * 0.47)) * ts;
  const turn = heLeft ? 90 : -90;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1c241c", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: colX - 80, width: colW + 160, top: 0, bottom: 0, background: "radial-gradient(closest-side, rgba(0,0,0,.35), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <div style={{ position: "absolute", left: colX, width: colW, top, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: fit(word, 16 * k * ts, colW, 0.4), letterSpacing: "0.4em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ position: "absolute", left: colX + colW / 2, top: runTop + run / 2, width: 0, height: 0 }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%, -50%) rotate(${turn}deg)`, fontFamily: DISPLAY, fontSize: sPx, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.01em", color: OFF_WHITE, opacity: 0.95, textShadow: "0 4px 30px rgba(0,0,0,.3)" }}>{surname}</div>
      </div>
      {club && <div style={{ position: "absolute", left: colX, width: colW, top: runBottom + 24 * k, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: fit(club, 14 * k * ts, colW, 0.2), letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88, textShadow: SHADOW }}>{club}</div>}
      <Logo data={data} top={logoTop} />
    </div>
  );
}
