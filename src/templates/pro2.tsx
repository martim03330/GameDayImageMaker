/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { scoreOf } from "./outline";
import { VIBES } from "./panelscript";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { TypeLayer, notHead, rowBox, safeRow, wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, frontAt, frontFeet, Page, Portrait, caps, dateVenue, fixtureLines, nameLines, portraitOf, vsLines } from "./prokit";

const W = CANVAS_W;

/* ================= 6 · Portrait on a club panel (matchday + goal) — liked13 Ajax (Timber) ================= */

/** A word rotated up the right edge, outlined in the club colour. */
function VerticalOutline({ word, x, y0, y1, maxH, color }: { word: string; x: number; y0: number; y1: number; maxH: number; color: string }) {
  const px = Math.min(maxH / 0.8, (y1 - y0) / Math.max(0.1, wordW(word, 1)));
  const cy = (y0 + y1) / 2;
  return (
    <svg width={W} height={y1 + 40} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <text x={x} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(90 ${x} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke={color} strokeWidth={px * 0.028}>
        {word}
      </text>
    </svg>
  );
}

function PanelBase({ d, word, topRight }: { d: RenderData; word: string; topRight: ReactNode }) {
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const panelW = W * 0.6;
  const panelBot = lt - 300 * k;
  const p = frontFeet(d, 560, lt + 40 * k, 1050 * k / 1.3);
  return (
    <Page d={d} bg="#f3f3f2" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #fbfbfb, #ebebea)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: panelW, height: panelBot, background: `linear-gradient(160deg, ${shade(t.ink, 0.08)}, ${shade(t.ink, -0.25)})`, overflow: "hidden" }}>
        {s && <Portrait s={s} cx={panelW * 0.5} cy={top + 260 * k} fh={270 * k} mode="color" fade={24} />}
      </div>
      <VerticalOutline word={word} x={W - M - 70 * k} y0={top + 380 * k} y1={lt - 70 * k} maxH={140 * k} color={t.ink} />
      <Front d={d} p={p} light />
      {topRight}
    </Page>
  );
}

/**
 * Retrato no painel (matchday): a big colour portrait of him on a tall club-colour panel; the same player full-body
 * and smaller in front; both crests top-right with HOME VS AWAY (exact names) and date · ground and the flags clock under
 * them; MATCHDAY up the right edge, outlined in the club colour.
 */
export function Proportrait({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, top, ts } = frameOf(d);
  const fx = natFixture(d);
  const t = tones(d);
  const cw = W * 0.4 - M - 16;
  const vs = vsLines(d, 20 * k * ts, cw, 13 * k);
  const dv = lines3(dateVenue(d), 14 * k * ts, cw, 0.08, 11 * k);
  return (
    <PanelBase
      d={d}
      word="MATCHDAY"
      topRight={
        <div style={{ position: "absolute", right: M, top, width: cw, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
          <div style={{ display: "flex", gap: 14 * k }}>
            {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
              <img key={i} src={u!} alt="" style={{ height: 76 * k, width: 76 * k, objectFit: "contain", filter: CREST_HALO }} />
            ))}
          </div>
          <div style={{ height: 16 * k }} />
          {vs.lines.map((l, i) => (
            <div key={i} style={{ ...caps(vs.px, 0.04, 900, t.ink), marginBottom: 6 * k }}>{l}</div>
          ))}
          {dv.lines.map((l, i) => (
            <div key={"d" + i} style={{ ...caps(dv.px, 0.08, 600, "#3a3d44"), marginBottom: 6 * k }}>{l}</div>
          ))}
          <div style={{ height: 10 * k }} />
          <FlagClock d={d} px={24 * k * ts} color="#16181c" gap={10 * k} dir="column" />
        </div>
      }
    />
  );
}

/** Golo · retrato no painel (goal): the same portrait composition with GOAL up the right edge, his crest, name and club top-right. */
export function Goalproportrait({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, top } = frameOf(d);
  const t = tones(d);
  const cw = W * 0.4 - M - 16;
  const nl = nameLines(d, cw, 30 * k, 18 * k);
  const crest = d.club?.crestUrl;
  return (
    <PanelBase
      d={d}
      word={(d.content.kicker || "Goal").toUpperCase()}
      topRight={
        <div style={{ position: "absolute", right: M, top, width: cw, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
          {crest && <img src={crest} alt="" style={{ height: 90 * k, width: 90 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ height: 16 * k }} />
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, t.ink), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px * 0.8, 0.16, 700, "#3a3d44"), marginBottom: 6 * k }}>{l}</div>
          ))}
        </div>
      }
    />
  );
}

/* ================= 7 · Radial zoom (matchday) — liked11 Man United "Next Match" ================= */

/**
 * Próximo jogo · zoom (matchday): his real photo with a radial zoom blur on the ground (copies scaled out from his face,
 * fading) and him perfectly sharp on top; "Next" in a serif italic and "Match" in a script, a small club-colour tag with
 * the round; both crests with the clubs' exact names; date · ground and the flags clock.
 */
export function Proradial({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  // Framed here (not by the photo's cover rule): his cut-out smaller and low, feet just below the logo line.
  const p = frontFeet(d, 540, lt + 120 * k, 1000 * k / 1.3);
  const fx = natFixture(d);
  // The zoom ground: the club's stadium photo (or the edit's backdrop) — never his own photo, so no face is ever
  // smeared; without one, light rays in the club colour from the same centre.
  const ground = d.club?.stadiumImages?.[0] ?? null;
  const ox = p.fx;
  const oy = p.fy;
  const copies = [1.03, 1.06, 1.09, 1.12, 1.16];
  const cH = 96 * k;
  const colW = (W - 2 * M - 120 * k) / 2;
  const hn = lines3(fx.homeName, 22 * k * ts, colW - cH - 14 * k, 0, 15 * k);
  const an = lines3(fx.awayName, 22 * k * ts, colW - cH - 14 * k, 0, 15 * k);
  const nPx = Math.min(hn.px, an.px);
  const dv = dateVenue(d);
  const dvl = lines3(dv, 20 * k * ts, W - 2 * M, 0.06, 13 * k);
  const nextPx = 108 * k;
  const matchPx = 170 * k;
  const nextW = nextPx * 1.95;
  const matchW = matchPx * 2.65;
  const sx = (W - (nextW + matchW - 40 * k)) / 2 - M;
  const blockH = matchPx * 0.9 + 40 * k + Math.max(cH, 2 * (nPx + 6 * k)) + 26 * k + dvl.lines.length * (dvl.px + 8 * k) + 18 * k + 30 * k * ts;
  // The free band above his head holds the whole block (it shrinks to fit, never onto him).
  const f = d.face ?? [0.38, 0.08, 0.24, 0.12];
  const headTop = p.img ? p.img.top + p.img.height * Math.max(0, f[1] - f[3] * 0.25) : p.fy - p.fs;
  const y0 = frameOf(d).top - 10 * k;
  const sc = Math.min(1, Math.max(0.5, (headTop - 30 * k - y0) / blockH));
  const team = (c: string | null, n: { lines: string[]; px: number }, right: boolean) => (
    <div style={{ width: colW, display: "flex", alignItems: "center", justifyContent: right ? "flex-start" : "flex-end", gap: 14 * k, flexDirection: right ? "row" : "row-reverse" }}>
      {c && <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO }} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        {n.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, fontSize: nPx, color: "#fff", whiteSpace: "nowrap", lineHeight: 1.15 }}>{l}</div>
        ))}
      </div>
    </div>
  );
  const script: CSSProperties = { color: "#fff", whiteSpace: "nowrap", lineHeight: 1, textShadow: "0 6px 24px rgba(0,0,0,.45)" };
  return (
    <Page d={d} bg="#0c0f14">
      {ground ? (
        copies
          .slice()
          .reverse()
          .map((s2, i) => <img key={s2} src={ground} alt="" style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", transform: `scale(${s2})`, transformOrigin: `${ox}px ${oy}px`, opacity: 0.2 + i * 0.07, filter: "saturate(.9) brightness(.8)" }} />)
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at ${ox}px ${oy}px, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.7)} 70%)` }} />
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 36 }, (_, i) => {
              const a0 = (i / 36) * Math.PI * 2;
              return <line key={i} x1={ox + Math.cos(a0) * 200 * k} y1={oy + Math.sin(a0) * 200 * k} x2={ox + Math.cos(a0) * H} y2={oy + Math.sin(a0) * H} stroke="#fff" strokeOpacity={i % 3 ? 0.05 : 0.11} strokeWidth={(i % 2 ? 10 : 22) * k} />;
            })}
          </svg>
        </>
      )}
      {ground && <img src={ground} alt="" style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", opacity: 0.35 }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.88), rgba(0,0,0,.72) 28%, rgba(0,0,0,.2) 46%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45))" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: y0, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${sc})`, transformOrigin: "50% 0" }}>
        <div style={{ position: "relative", height: matchPx * 0.9, width: "100%" }}>
          <div style={{ ...script, position: "absolute", left: sx, top: matchPx * 0.32, fontFamily: DMSERIF, fontStyle: "italic", fontSize: nextPx }}>Next</div>
          <div style={{ ...script, position: "absolute", left: sx + nextW - 40 * k, top: 0, fontFamily: VIBES, fontSize: matchPx }}>Match</div>
          <div style={{ position: "absolute", left: sx + 20 * k, top: matchPx * 0.32 + nextPx * 1.02, background: t.ink, color: "#fff", ...caps(18 * k, 0.12, 700, "#fff"), padding: `${6 * k}px ${12 * k}px` }}>{roundTitle(d)}</div>
        </div>
        <div style={{ height: 40 * k }} />
        <div style={{ display: "flex", alignItems: "center", gap: 30 * k }}>
          {team(fx.homeCrest, hn, false)}
          {team(fx.awayCrest, an, true)}
        </div>
        <div style={{ height: 26 * k }} />
        {dvl.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, fontSize: dvl.px, color: "#fff", whiteSpace: "nowrap", marginBottom: 8 * k }}>{l}</div>
        ))}
        <div style={{ height: 18 * k }} />
        <FlagClock d={d} px={30 * k * ts} color="#fff" gap={26 * k} />
      </div>
    </Page>
  );
}

/* ================= 8 · Tight crop, MATCH behind (matchday) — liked06 Atlético ================= */

/**
 * Match · retrato apertado (matchday): a club-colour ground; him cropped tight from the chest up, sharp; MATCH huge
 * behind his head with his head in front of it (depth interleave, free-side fallback) and DAY small under it; the
 * competition tracked at the top; HOME vs / AWAY in condensed caps, the date and the kick-off in a white time box at
 * the bottom-left.
 */
export function Promatchword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const p = frontAt(d, 640, 720, 270);
  const px = Math.min(330 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCH", 1)));
  const r = safeRow(p, "MATCH", top + 60 * k, px, M, W - M, "middle", 0.6);
  const b = rowBox(r);
  const fl = fixtureLines(d, W * 0.5, 46 * k * ts, 24 * k);
  const fx = natFixture(d);
  const infoH = (fl.home.length + fl.away.length) * fl.px * 0.95 + 20 * k + 60 * k;
  const iy = lt - 50 * k - infoH;
  const comp = (matchFacts(d).comp || roundTitle(d)).toUpperCase();
  const cond: CSSProperties = { fontFamily: DISPLAY, fontSize: fl.px, lineHeight: 0.95, color: "#fff", whiteSpace: "nowrap" };
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 60% 35%, ${shade(t.ink, 0.12)}, ${shade(t.ink, -0.35)} 80%)` }} />
      <TypeLayer id="pmw-b" H={H} rows={[r]} paint={() => ({ fill: "#fff" })} />
      <Front d={d} p={p} />
      <TypeLayer id="pmw-f" H={H} rows={[r]} clipD={notHead(p, H)} paint={() => ({ fill: "#fff" })} />
      <div style={{ position: "absolute", left: b.x0 + 6 * k, top: b.y1 + 14 * k, fontFamily: DISPLAY, fontSize: px * 0.3, lineHeight: 1, color: "#fff" }}>DAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 20 * k, textAlign: "center", ...caps(16 * k, 0.5, 800, "#fff") }}>{comp}</div>
      <div style={{ position: "absolute", left: 0, top: iy - 120 * k, width: W * 0.7, height: infoH + 260 * k, background: "radial-gradient(ellipse at 20% 60%, rgba(0,0,0,.45), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: M, top: iy, display: "flex", flexDirection: "column" }}>
        {fl.home.map((l, i) => (
          <div key={"h" + i} style={cond}>{i === fl.home.length - 1 ? `${l} VS` : l}</div>
        ))}
        {fl.away.map((l, i) => (
          <div key={"a" + i} style={cond}>{l}</div>
        ))}
        <div style={{ height: 20 * k }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
          {fx.date && <div style={{ fontFamily: DISPLAY, fontSize: 40 * k * ts, color: "#fff", lineHeight: 1 }}>{fx.date}</div>}
          {fx.time && <div style={{ fontFamily: DISPLAY, fontSize: 40 * k * ts, color: t.ink, background: "#fff", padding: `${4 * k}px ${10 * k}px`, lineHeight: 1 }}>{fx.time}</div>}
          {fx.ptTime && <div style={caps(18 * k * ts, 0.06, 700, "rgba(255,255,255,.85)")}>{fx.ptTime}</div>}
        </div>
      </div>
    </Page>
  );
}

/* ================= 9 · Curved split (result) — liked10 Monaco ================= */

/**
 * Resultado · curva (result): the top in the club colour with a big ghosted black-and-white portrait of him, a white
 * curved foot; FULL TIME huge, both crests either side of the score, HOME V AWAY (exact names) and the competition at
 * the top; him full-body in the centre across the curve.
 */
export function Resultproarc({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const score = scoreOf(d, " – ") || "FT";
  const curveY = H * 0.6;
  const lt = logoTopOf(d, H);
  const tPx = Math.min(150 * k, (W - 2 * M) / Math.max(0.1, wordW("FULL TIME", 1)));
  const sPx = 110 * k * ts;
  const vs = lines3(`${fx.homeName} V ${fx.awayName}`.toUpperCase(), 24 * k * ts, W - 2 * M, 0.16, 15 * k);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const blockBottom = top + tPx * 0.82 + 20 * k + sPx + 20 * k + vs.lines.length * (vs.px + 8 * k) + 30 * k;
  const p = frontFeet(d, 540, lt + 60 * k, Math.min(1300 * k / 1.3, lt + 60 * k - blockBottom - 30 * k));
  return (
    <Page d={d} bg="#f7f6f4" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #ffffff, #efeeec)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: curveY, overflow: "hidden", clipPath: `ellipse(${W * 0.95}px ${curveY}px at 50% 0)`, background: `linear-gradient(170deg, ${shade(t.ink, 0.06)}, ${shade(t.ink, -0.3)})` }}>
        {s && <Portrait s={s} cx={W * 0.72} cy={top + 260 * k} fh={300 * k} mode="bw" opacity={0.22} style={{ mixBlendMode: "luminosity" }} />}
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap" }}>FULL TIME</div>
        <div style={{ height: 20 * k }} />
        <div style={{ display: "flex", alignItems: "center", gap: 30 * k, height: sPx }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: sPx * 0.8, width: sPx * 0.8, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: sPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{score}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: sPx * 0.8, width: sPx * 0.8, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ height: 20 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.16, 800, "#fff"), marginBottom: 8 * k }}>{l}</div>
        ))}
        {comp && <div style={{ ...caps(16 * k * ts, 0.2, 600, "rgba(255,255,255,.85)"), marginTop: 4 * k }}>{comp}</div>}
      </div>
    </Page>
  );
}

/* ================= 10 · Crest blocks (matchday) — liked07 Ajax (Antony) ================= */

/**
 * Blocos do emblema (matchday): a cream ground; two big blocks in the club colour with his club's crest drawn huge in
 * white line-light inside them; him full-body in front, sharp; a small white fixture card bottom-left with both
 * crests, HOME VS AWAY (exact names), date · ground and the flags clock; the competition top-right.
 */
export function Procrestblocks({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const fx = natFixture(d);
  const b1 = { x: M, y: top + 80 * k, w: W * 0.52, h: lt - 380 * k - (top + 80 * k) };
  const b2 = { x: W * 0.42, y: top + 260 * k, w: W - M - W * 0.42, h: H * 0.5 };
  const p = frontFeet(d, 600, lt + 70 * k, 1450 * k / 1.3);
  const cw = W * 0.52;
  const vs = vsLines(d, 20 * k * ts, cw - 40 * k, 13 * k);
  const dv = lines3(dateVenue(d), 14 * k * ts, cw - 40 * k, 0.08, 11 * k);
  const cardH = 54 * k + 12 * k + vs.lines.length * (vs.px + 6 * k) + dv.lines.length * (dv.px + 6 * k) + 14 * k + 24 * k * ts + 40 * k;
  const block = (r: typeof b1, key: string) => (
    <div key={key} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, background: t.ink, overflow: "hidden" }}>
      {crest && (
        <div style={{ position: "absolute", left: W * 0.5 - r.x - 520 * k, top: H * 0.38 - r.y - 520 * k, width: 1040 * k, height: 1040 * k }}>
          {/* The crest as white line-work: white and club-colour silhouettes nested, so only rings of white show. */}
          {[1, 0.955, 0.91, 0.865].map((sc, i) => (
            <div key={sc} style={{ position: "absolute", inset: 0, transform: `scale(${sc})`, background: i % 2 ? t.ink : "rgba(255,255,255,.85)", WebkitMaskImage: `url(${crest})`, maskImage: `url(${crest})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} />
          ))}
        </div>
      )}
    </div>
  );
  return (
    <Page d={d} bg="#f1ece2" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #f8f5ef, #ebe4d6)" }} />
      {block(b1, "a")}
      {block(b2, "b")}
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", right: M, top: top - 10 * k, ...caps(16 * k, 0.3, 800, t.ink) }}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
      <div style={{ position: "absolute", left: M, top: lt - 40 * k - cardH, width: cw, height: cardH, background: "#fff", boxShadow: "0 14px 34px rgba(0,0,0,.16)", padding: `${20 * k}px`, boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 12 * k, height: 54 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 54 * k, width: 54 * k, objectFit: "contain" }} />
          ))}
        </div>
        <div style={{ height: 12 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, t.ink), marginBottom: 6 * k }}>{l}</div>
        ))}
        {dv.lines.map((l, i) => (
          <div key={"d" + i} style={{ ...caps(dv.px, 0.08, 600, "#3a3d44"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#16181c" gap={20 * k} />
      </div>
    </Page>
  );
}
